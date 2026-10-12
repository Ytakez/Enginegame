(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF, B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx;

  function M(c,mt,rg,op,tr){
    var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.35:rg};
    if(op!==undefined){o.transparent=true;o.opacity=op;}
    if(tr)o.side=THREE.DoubleSide;
    return new THREE.MeshStandardMaterial(o);
  }
  var MAT={
    cast:M(0x2a2f36,0.55,0.7), block:M(0x3e4650,0.72,0.42,0.38,true),
    head:M(0x565f6c,0.78,0.35), cover:M(0x262c34,0.5,0.55),
    rib:M(0x1a1e24,0.6,0.65), alu:M(0xa4acb6,0.9,0.22),
    aluD:M(0x6a727c,0.85,0.35), chrome:M(0xe2e8ee,1.0,0.08),
    piston:M(0xdde5ee,0.95,0.1), rod:M(0x8a95a2,0.9,0.22),
    exhaust:M(0x6a4a30,0.6,0.65), intake:M(0x546070,0.7,0.4),
    belt:M(0x14171a,0.2,0.9), rubber:M(0x1a1d22,0.05,0.92),
    bolt:M(0xb8c0c8,0.95,0.2), plug:M(0x2a2d33,0.6,0.5)
  };

  function cyl(r1,r2,h,seg,mat){return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||20),mat);}
  function box(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);}
  function tor(rad,tube,seg,tseg,mat){return new THREE.Mesh(new THREE.TorusGeometry(rad,tube,seg||8,tseg||20),mat);}

  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  var PY_MEAN=2.9, ROD_LEN=4.3;

  function makePiston(r,h){
    var g=new THREE.Group();
    g.add(cyl(r,r,h,20,MAT.piston));
    var crown=cyl(r*1.001,r*0.97,h*0.12,20,MAT.aluD);
    crown.position.y=h*0.44;g.add(crown);
    for(var k=0;k<3;k++){
      var rg=tor(r*0.95,0.035,6,20,MAT.plug);
      rg.rotation.x=Math.PI/2;
      rg.position.y=h*0.15-k*h*0.15;g.add(rg);
    }
    return g;
  }

  function makeRod(len){
    var g=new THREE.Group();
    g.add(box(0.14,len*0.8,0.22,MAT.rod));
    var small=cyl(0.14,0.14,0.28,12,MAT.chrome);
    small.rotation.z=Math.PI/2;small.position.y=len/2;g.add(small);
    var big=tor(0.22,0.09,8,16,MAT.aluD);
    big.rotation.y=Math.PI/2;big.position.y=-len/2;g.add(big);
    return g;
  }

  function makeCylAss(o){
    var g=new THREE.Group();
    g.position.set(o.x, o.y-PY_MEAN, o.z);
    g.add(makePiston(o.r*0.9, o.r*1.05));
    var rod=makeRod(ROD_LEN);
    rod.position.y=-ROD_LEN/2-0.15;g.add(rod);
    var p=g.children[0];
    return {g:g,p:p,rod:rod,vv:[],off:o.off||0,h:o.h,r:o.r};
  }

  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=cyl(0.32,0.32,blockLen+1.2,20,MAT.alu);ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<=perRow;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=cyl(0.5,0.5,0.4,18,MAT.aluD);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var p1=new THREE.Group();
      var pin1=cyl(0.26,0.26,0.5,14,MAT.chrome);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*0.58,0);cg.add(p1);
      var cw=new THREE.Group();
      var cwb=cyl(0.68,0.68,0.34,16,MAT.cast);
      cwb.rotation.z=Math.PI/2;cwb.scale.y=0.6;cw.add(cwb);
      cw.position.set(cxx,-Math.sin(o1)*0.58,0);cg.add(cw);
    }
    root.add(cg);sCr(cg);

    var fw=new THREE.Group();
    var fwD=cyl(fwR,fwR,0.32,28,MAT.aluD);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<32;ft++){
      var th=box(0.34,0.16,0.14,MAT.cast);
      var a=(ft/32)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.05),Math.sin(a)*(fwR+0.05));
      th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.75,y,0);
    root.add(fw);sF(fw);
  }

  function makeBlock(root,blockLen,blockH,blockD,blockY,diesel){
    var pan=box(blockLen+0.3,1.1,blockD+0.2,MAT.cast);pan.position.y=-1.0;root.add(pan);
    var lip=box(blockLen+0.4,0.14,blockD+0.3,MAT.rib);lip.position.y=-0.45;root.add(lip);

    var bk=box(blockLen,blockH,blockD,MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<10;rr++){
      var rb=box(blockLen+0.05,0.05,blockD+0.05,MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/9;root.add(rb);pR(rb);
    }

    var gk=box(blockLen+0.16,0.09,blockD+0.18,MAT.rib);
    gk.position.y=blockY+blockH/2+0.08;root.add(gk);

    var headY=blockY+blockH/2+0.75;
    var hd=box(blockLen+0.15,1.35,blockD+0.18,MAT.head);
    hd.position.y=headY;root.add(hd);pH(hd);

    for(var b=0;b<4;b++){
      var bolt=cyl(0.08,0.08,0.16,8,MAT.bolt);
      bolt.position.set((b<2?-1:1)*(blockLen/2+0.02),headY+0.7,(b%2===0?-1:1)*(blockD/2+0.02));
      root.add(bolt);
    }

    var covY=headY+0.95;
    var cv=box(blockLen-0.1,0.85,blockD-0.5,MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    var cap=cyl(0.22,0.22,0.22,12,MAT.plug);
    cap.position.set(blockLen/2-0.8,covY+0.5,0);root.add(cap);
    var cap2=cyl(0.14,0.14,0.05,10,MAT.alu);
    cap2.position.set(blockLen/2-0.8,covY+0.63,0);root.add(cap2);
    var dip=cyl(0.05,0.05,0.5,6,MAT.aluD);
    dip.position.set(-blockLen/2+0.5,covY+0.5,blockD/3);root.add(dip);

    return {blockLen:blockLen,blockH:blockH,blockD:blockD,blockY:blockY,headY:headY,covY:covY};
  }

  function makeIntake(root,B,n,spacing){
    var tw=n*spacing;
    var plenum=cyl(0.38,0.38,B.blockLen*0.88,16,MAT.intake);
    plenum.rotation.z=Math.PI/2;
    plenum.position.set(0,B.headY+0.85,B.blockD/2+0.55);root.add(plenum);
    for(var e=0;e<2;e++){
      var cap=cyl(0.4,0.4,0.12,16,MAT.aluD);
      cap.rotation.z=Math.PI/2;
      cap.position.set((e===0?-1:1)*B.blockLen*0.44,B.headY+0.85,B.blockD/2+0.55);root.add(cap);
    }
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var r=cyl(0.22,0.28,0.7,12,MAT.intake);
      r.position.set(xx,B.headY+0.4,B.blockD/2+0.4);
      r.rotation.x=-Math.PI/7;root.add(r);
      var fl=box(0.5,0.14,0.28,MAT.aluD);
      fl.position.set(xx,B.headY+0.1,B.blockD/2+0.22);root.add(fl);
    }
    var tb=cyl(0.5,0.5,0.35,16,MAT.aluD);
    tb.rotation.z=Math.PI/2;
    tb.position.set(-B.blockLen*0.5,B.headY+0.85,B.blockD/2+0.55);root.add(tb);
  }

  function makeExhaust(root,B,n,spacing){
    var tw=n*spacing;
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var r=cyl(0.22,0.26,0.6,12,MAT.exhaust);
      r.position.set(xx,-0.15,-B.blockD/2-0.35);
      r.rotation.x=Math.PI/7;root.add(r);
    }
    var header=cyl(0.36,0.36,B.blockLen*0.85,14,MAT.exhaust);
    header.rotation.z=Math.PI/2;
    header.position.set(0,-0.5,-B.blockD/2-0.65);root.add(header);
  }

  function makeTurbo(root,B){
    var g=new THREE.Group();
    var comp=cyl(0.75,0.9,0.8,20,MAT.alu);comp.rotation.z=Math.PI/2;g.add(comp);
    var compS=tor(0.85,0.28,10,20,MAT.alu);
    compS.rotation.y=Math.PI/2;compS.position.x=-0.15;g.add(compS);
    var turb=cyl(0.6,0.75,0.7,18,MAT.cast);
    turb.rotation.z=Math.PI/2;turb.position.x=1.05;g.add(turb);
    var turbS=tor(0.7,0.24,10,18,MAT.cast);
    turbS.rotation.y=Math.PI/2;turbS.position.x=1.15;g.add(turbS);
    var axis=cyl(0.1,0.1,2.6,10,MAT.chrome);
    axis.rotation.z=Math.PI/2;axis.position.x=0.45;g.add(axis);
    var wg=cyl(0.3,0.3,0.45,12,MAT.aluD);
    wg.position.set(1.05,0.8,0.2);g.add(wg);
    g.position.set(B.blockLen/2+0.5,-0.35,-B.blockD/2-0.9);
    root.add(g);
    if(!window._dciPartsArr)window._dciPartsArr=[];
    window._dciPartsArr.push({turbo:g});

    var ic=box(2.0,0.9,0.35,MAT.alu);
    ic.position.set(0,B.headY+1.6,-B.blockD/2-1.7);root.add(ic);
    for(var f=0;f<10;f++){
      var fin=box(0.04,0.85,0.38,MAT.aluD);
      fin.position.set(-0.9+f*0.2,B.headY+1.6,-B.blockD/2-1.7);root.add(fin);
    }
  }

  function inlineBase(root,opt){
    var n=opt.n||4, spacing=opt.spacing||2.2;
    var tw=n*spacing;
    var blockLen=tw+1.5;
    var blockD=opt.d||4.8, blockH=opt.h||5, blockY=opt.y||3.4;
    var diesel=!!opt.diesel;

    makeCrankAndFly(root,blockLen,0.6,n,opt.fwR||2.3);
    var B=makeBlock(root,blockLen,blockH,blockD,blockY,diesel);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylAss({x:xx,y:blockY,z:0,r:1.1,h:blockH+0.4,off:i*Math.PI});
      root.add(a.g);arr.push(a);
    }
    sA(arr);
    makeIntake(root,B,n,spacing);
    makeExhaust(root,B,n,spacing);
    if(diesel) makeTurbo(root,B);
    return B;
  }

  function buildR4(root){inlineBase(root,{n:4});}
  function buildTDI(root){inlineBase(root,{n:4,diesel:true});}
  function buildDCi(root){inlineBase(root,{n:4,diesel:true});}
  function buildPassatB3(root){inlineBase(root,{n:4});}
  function buildBluebird(root){inlineBase(root,{n:4});}

  function buildScooter(root){
    var B=inlineBase(root,{n:1,spacing:1.8,d:3.2,h:3.4,y:2.4,fwR:1.3});
    var carb=box(0.7,0.7,0.7,MAT.aluD);
    carb.position.set(0,B.headY+0.5,B.blockD/2+0.35);root.add(carb);
    var filter=cyl(0.5,0.5,0.35,14,MAT.rubber);
    filter.rotation.z=Math.PI/2;
    filter.position.set(0,B.headY+0.5,B.blockD/2+0.9);root.add(filter);
    var cvt=cyl(1.0,1.0,0.35,20,MAT.aluD);
    cvt.rotation.z=Math.PI/2;
    cvt.position.set(B.blockLen/2+1.0,0,-0.8);root.add(cvt);
    var belt=box(0.1,2.0,0.3,MAT.belt);
    belt.position.set(B.blockLen/2+0.5,-0.3,-0.8);root.add(belt);
    var muf=cyl(0.3,0.25,1.5,16,MAT.chrome);
    muf.rotation.z=Math.PI/2;
    muf.position.set(-B.blockLen/2-2.2,-0.3,0);root.add(muf);
  }

  function buildI6(root){
    var n=6,spacing=2.0;
    var tw=n*spacing;
    var blockLen=tw+1.6;
    var blockD=4.6,blockH=5.2,blockY=3.6;
    makeCrankAndFly(root,blockLen,0.6,n,2.4);
    var B=makeBlock(root,blockLen,blockH,blockD,blockY,false);
    for(var b=0;b<=n;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/n;
      for(var sd=0;sd<2;sd++){
        var bolt=cyl(0.07,0.07,0.16,8,MAT.bolt);
        bolt.position.set(bx2,B.covY+0.5,(sd===0?-(blockD/2-0.6):(blockD/2-0.6)));
        root.add(bolt);
      }
    }
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylAss({x:xx,y:blockY,z:0,r:1.05,h:blockH+0.4,off:i*Math.PI});
      root.add(a.g);arr.push(a);
    }
    sA(arr);
    makeIntake(root,B,n,spacing);
    makeExhaust(root,B,n,spacing);
    makeTurbo(root,B);
  }

  function buildVBase(root,totalN,half,bankDist,scale){
    var perRow=Math.floor(totalN/2);
    var spacing=2.0*scale;
    var tw=perRow*spacing;
    var blockLen=tw+2.0;
    var blockY=3.4;
    var blockH=5*scale;
    var blockD=bankDist*2+2.8*scale;

    makeCrankAndFly(root,blockLen,0.6,perRow,2.5*scale);
    var pan=box(blockLen+0.4,1.3,blockD*1.3,MAT.cast);
    pan.position.y=-1.0;root.add(pan);

    var arr=[];
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bk=box(blockLen,blockH,2.6*scale,MAT.block);
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);
      for(var rr=0;rr<8;rr++){
        var rb=box(blockLen+0.05,0.05,2.65*scale,MAT.rib);
        rb.position.set(0,blockY-blockH/2+0.4+rr*(blockH-0.8)/7,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }
      var headY=blockY+blockH/2+0.75;
      var hd=box(blockLen+0.15,1.3,2.8*scale,MAT.head);
      hd.position.set(0,headY,sign*(bankDist+0.9*scale));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);
      var cv=box(blockLen-0.1,0.85,2.5*scale,MAT.cover);
      cv.position.set(0,headY+0.95,sign*(bankDist+1.05*scale));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);
      for(var j=0;j<perRow;j++){
        var xx=-tw/2+spacing/2+j*spacing;
        var off=(side===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makeCylAss({x:xx,y:blockY,z:sign*bankDist,r:0.98*scale,h:blockH+0.4,off:off});
        a.g.rotation.x=sign*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);

    var plenum=cyl(0.5,0.5,blockLen*0.88,18,MAT.intake);
    plenum.rotation.z=Math.PI/2;
    plenum.position.set(0,blockY+blockH/2+1.9,0);root.add(plenum);
    for(var s=0;s<2;s++){
      var sg=s===0?-1:1;
      for(var j2=0;j2<perRow;j2++){
        var xx2=-tw/2+spacing/2+j2*spacing;
        var r=cyl(0.18,0.24,1.1,10,MAT.intake);
        r.position.set(xx2,blockY+blockH/2+1.2,sg*bankDist*0.6);
        r.rotation.x=-sg*Math.PI/4;root.add(r);
      }
      var ex=cyl(0.32,0.32,blockLen*0.85,14,MAT.exhaust);
      ex.rotation.z=Math.PI/2;
      ex.position.set(0,0.3,sg*(bankDist+2.0*scale));root.add(ex);
    }
  }
  function buildV6(root){buildVBase(root,6,Math.PI/6,1.6,1.0);}
  function buildV8(root){buildVBase(root,8,Math.PI/6,1.7,1.0);}
  function buildV12(root){buildVBase(root,12,Math.PI/6,1.9,1.0);}
  function buildV16(root){buildVBase(root,16,Math.PI/6,2.0,1.0);}
  function buildV22(root){buildVBase(root,22,Math.PI/4,2.3,1.0);}

  function buildBoxer(root){
    var n=2,spacing=2.6;
    var tw=n*spacing;
    var blockLen=tw+2.0;
    var blockH=4.5,blockD=4.5,blockY=2.8;
    makeCrankAndFly(root,blockLen,0.6,n,2.5);
    var pan=box(blockLen+0.5,1.2,blockD+0.3,MAT.cast);
    pan.position.y=0.3;root.add(pan);
    var bk=box(blockLen,blockH,2.5,MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);
    for(var rr=0;rr<6;rr++){
      var rb=box(blockLen+0.04,0.05,2.55,MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/5;root.add(rb);pR(rb);
    }
    var headY=blockY;
    var arr=[];
    for(var s=0;s<2;s++){
      var sign=s===0?-1:1;
      var hd=box(blockLen+0.2,2.6,1.3,MAT.head);
      hd.position.set(0,headY,sign*(blockD/2+0.5));
      hd.rotation.x=sign*Math.PI/2;root.add(hd);pH(hd);
      var cv=box(blockLen-0.1,2.4,1.0,MAT.cover);
      cv.position.set(0,headY,sign*(blockD/2+1.0));
      cv.rotation.x=sign*Math.PI/2;root.add(cv);pC(cv);
      var inMan=cyl(0.3,0.3,blockLen*0.85,16,MAT.intake);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,headY+1.9,sign*(blockD/2+0.5));root.add(inMan);
      var exMan=cyl(0.34,0.34,blockLen*0.85,16,MAT.exhaust);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,headY-1.9,sign*(blockD/2+0.5));root.add(exMan);
      for(var j=0;j<n;j++){
        var xx=-tw/2+spacing/2+j*spacing;
        var zz=sign*(blockD/2+0.4);
        var off=(s===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=makeCylAss({x:xx,y:headY,z:zz,r:0.95,h:3.6,off:off});
        a.g.rotation.x=sign*Math.PI/2;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  function buildRadial(root){
    var n=9, step=Math.PI*2/n, R_cyl=3.0, cylLen=3.2;
    var carter=cyl(3.4,3.4,0.9,32,MAT.cast);
    carter.rotation.x=Math.PI/2;carter.position.z=-1.4;root.add(carter);
    var crank=cyl(0.45,0.45,1.2,20,MAT.chrome);
    crank.rotation.x=Math.PI/2;root.add(crank);sCr(crank);
    var axis=cyl(0.28,0.28,3.6,16,MAT.alu);
    axis.rotation.x=Math.PI/2;axis.position.z=1.5;root.add(axis);
    var fw=new THREE.Group();
    var fwD=cyl(2.1,2.1,0.32,28,MAT.aluD);
    fwD.rotation.x=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=box(0.28,0.2,0.14,MAT.aluD);
      var a=(ft/30)*Math.PI*2;
      th.position.set(Math.cos(a)*2.2,Math.sin(a)*2.2,0);
      th.rotation.z=a;fw.add(th);
    }
    fw.position.z=3.5;root.add(fw);sF(fw);
    var arr=[];
    for(var i=0;i<n;i++){
      var a=i*step-Math.PI/2;
      var cx=Math.cos(a)*R_cyl, cyy=Math.sin(a)*R_cyl;
      var grp=new THREE.Group();
      grp.position.set(cx,cyy,0);
      grp.rotation.z=a-Math.PI/2;
      root.add(grp);
      var shell=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,cylLen,18,1,true),MAT.block);
      shell.position.y=cylLen/2;grp.add(shell);
      var hd=cyl(1.0,1.0,0.4,18,MAT.head);
      hd.position.y=cylLen+0.2;grp.add(hd);
      var p=makePiston(0.82,0.8);p.position.y=cylLen*0.5;grp.add(p);
      var rod=makeRod(1.6);rod.position.y=-0.5;grp.add(rod);
      arr.push({g:grp,p:p,rod:rod,off:i*step});
    }
    sA(arr);
  }

  function buildTractor(root){
    var n=4,spacing=2.6;
    var tw=n*spacing;
    var blockLen=tw+2.2;
    var blockH=5.5,blockD=5.5,blockY=3.7;
    makeCrankAndFly(root,blockLen,0.6,n,3.0);
    var B=makeBlock(root,blockLen,blockH,blockD,blockY,true);
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylAss({x:xx,y:blockY,z:0,r:1.25,h:blockH+0.4,off:i*Math.PI});
      root.add(a.g);arr.push(a);
    }
    sA(arr);
    var tank=box(blockLen*0.6,2.0,2.0,MAT.alu);
    tank.position.set(-blockLen/2-1.8,2.2,0);root.add(tank);
    var pump=box(2.2,2.0,2.0,MAT.aluD);
    pump.position.set(blockLen/2+0.9,B.covY+0.5,blockD/2-0.3);root.add(pump);
    var af=cyl(0.9,0.9,2.4,18,MAT.aluD);
    af.rotation.z=Math.PI/2;
    af.position.set(-blockLen/2+1.6,B.covY+2.2,0);root.add(af);
    var ex=cyl(0.35,0.35,7.0,12,MAT.exhaust);
    ex.position.set(blockLen/2-1.4,B.covY+3.2,0);root.add(ex);
    var rad=box(3.2,2.8,0.4,MAT.aluD);
    rad.position.set(blockLen/2+2.4,3.0,0);root.add(rad);
    for(var rf=0;rf<13;rf++){
      var fin=box(3.1,0.06,0.42,MAT.alu);
      fin.position.set(blockLen/2+2.4,1.7+rf*0.2,0);root.add(fin);
    }
  }

  function makeEpiShape(Rr,e){
    var pts=[];
    for(var i=0;i<=96;i++){
      var t=(i/96)*Math.PI*2;
      pts.push(new THREE.Vector2(Rr*Math.cos(t)+e*Math.cos(3*t),Rr*Math.sin(t)+e*Math.sin(3*t)));
    }
    return new THREE.Shape(pts);
  }
  function makeRotorShape(rotR){
    var sh=new THREE.Shape();
    for(var k=0;k<3;k++){
      var a=k*(Math.PI*2/3)-Math.PI/2;
      var x=Math.cos(a)*rotR,y=Math.sin(a)*rotR;
      if(k===0)sh.moveTo(x,y);else sh.lineTo(x,y);
    }
    sh.closePath();return sh;
  }
  function buildWankel(root){
    window._dvsWankelRotors=window._dvsWankelRotors||[];
    window._dvsWankelPins=window._dvsWankelPins||[];
    window._dvsWankelFlashes=window._dvsWankelFlashes||[];
    var Rr=2.0,e=0.42;
    var hGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,e),{depth:2.4,bevelEnabled:false});
    hGeo.center();
    var housing=new THREE.Mesh(hGeo,MAT.block);
    housing.rotation.x=Math.PI/2;root.add(housing);pB(housing);
    var iGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr*0.94,e*0.94),{depth:2.2,bevelEnabled:false});
    iGeo.center();
    var inner=new THREE.Mesh(iGeo,MAT.head);
    inner.rotation.x=Math.PI/2;inner.scale.set(0.93,0.93,0.93);root.add(inner);
    var rGeo=new THREE.ExtrudeGeometry(makeRotorShape(1.6),{depth:1.6,bevelEnabled:false});
    rGeo.center();
    var rotorMesh=new THREE.Mesh(rGeo,MAT.alu);
    rotorMesh.rotation.x=Math.PI/2;root.add(rotorMesh);
    window._dvsWankelRotors.push({mesh:rotorMesh,ecc:e});
    var shaft=new THREE.Group();
    var sh=cyl(0.28,0.28,3.0,14,MAT.chrome);sh.rotation.x=Math.PI/2;shaft.add(sh);
    var ecc=cyl(0.7,0.7,0.35,20,MAT.aluD);
    ecc.rotation.x=Math.PI/2;ecc.position.z=0.4;shaft.add(ecc);
    root.add(shaft);sCr(shaft);
    window._dvsWankelPins.push({grp:shaft});
    var fw=new THREE.Group();
    var fwD=cyl(1.8,1.8,0.3,28,MAT.aluD);
    fwD.rotation.x=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<28;ft++){
      var th=box(0.26,0.18,0.12,MAT.aluD);
      var a=(ft/28)*Math.PI*2;
      th.position.set(Math.cos(a)*1.9,Math.sin(a)*1.9,0);
      th.rotation.z=a;fw.add(th);
    }
    fw.position.z=2.5;root.add(fw);sF(fw);
    for(var fp=0;fp<3;fp++){
      var fm=new THREE.Mesh(new THREE.SphereGeometry(0.5,12,10),
        new THREE.MeshBasicMaterial({color:0xffaa44,transparent:true,opacity:0}));
      var fa=fp*(Math.PI*2/3)-Math.PI/2;
      fm.position.set(Math.cos(fa)*Rr*0.7,Math.sin(fa)*Rr*0.7,0.6);
      root.add(fm);
      var lt=new THREE.PointLight(0xffaa44,0,6);
      lt.position.copy(fm.position);root.add(lt);
      window._dvsWankelFlashes.push({mesh:fm,light:lt,phase:fa});
    }
  }

  window.DVS_3D_BUILDERS={
    r4:bui