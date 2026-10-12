(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF, B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx;

  function M(c,mt,rg,op,tr){
    var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};
    if(op!==undefined){o.transparent=true;o.opacity=op;}
    if(tr)o.side=THREE.DoubleSide;
    var m2=new THREE.MeshStandardMaterial(o);
    m2.userData={baseOp:op!==undefined?op:1};
    return m2;
  }
  var MAT={
    cast:M(0x2b3036,0.5,0.72),
    block:M(0x4a5464,0.55,0.45,0.15,true),
    head:M(0x5c6470,0.75,0.35),
    cover:M(0x272c34,0.5,0.55),
    rib:M(0x1e2228,0.6,0.65),
    alu:M(0xa8b0ba,0.9,0.22),
    aluD:M(0x6a727c,0.85,0.35),
    chrome:M(0xe4eaf0,1.0,0.08),
    piston:M(0xdfe6ee,0.95,0.1),
    ring:M(0x2a2e33,0.5,0.7),
    rod:M(0x8a95a2,0.9,0.22),
    exh:M(0x6a4a30,0.6,0.65),
    int:M(0x546070,0.7,0.4),
    rub:M(0x1a1d22,0.05,0.92),
    bolt:M(0xc0c8d0,0.95,0.2),
    plug:M(0x2a2d33,0.6,0.5),
    yellow:M(0xd8b840,0.7,0.38)
  };
  function cyl(r1,r2,h,s,mat){return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s||20),mat);}
  function box(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);}
  function tor(rad,tube,s,ts,mat){return new THREE.Mesh(new THREE.TorusGeometry(rad,tube,s||8,ts||20),mat);}
  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  function makePiston(r,h){
    var g=new THREE.Group();
    g.add(cyl(r,r,h,22,MAT.piston));
    var cr=cyl(r*1.001,r*0.96,h*0.12,22,MAT.aluD);
    cr.position.y=h*0.44;g.add(cr);
    for(var k=0;k<3;k++){
      var rg=tor(r*0.94,0.035,6,22,MAT.ring);
      rg.rotation.x=Math.PI/2;rg.position.y=h*0.15-k*h*0.15;g.add(rg);
    }
    return g;
  }

  function makeRod(len){
    var g=new THREE.Group();
    g.add(box(0.16,len*0.85,0.22,MAT.rod));
    var sm=cyl(0.14,0.14,0.28,12,MAT.chrome);
    sm.rotation.z=Math.PI/2;sm.position.y=len/2;g.add(sm);
    var bg=tor(0.22,0.09,8,18,MAT.aluD);
    bg.rotation.y=Math.PI/2;bg.position.y=-len/2;g.add(bg);
    return g;
  }

  function makeCyl(cfg){
    var g=new THREE.Group();
    g.position.set(cfg.x,0,cfg.z);
    var piston=makePiston(cfg.r*0.88,cfg.pH);
    g.add(piston);
    var rod=makeRod(cfg.rodLen);
    g.add(rod);
    return {
      g:g,p:piston,rod:rod,
      off:cfg.off||0,
      crankR:cfg.crankR,
      rodLen:cfg.rodLen,
      crankY:cfg.crankY
    };
  }

  function makeCrank(root,length,crankY,n,crankR,fwR){
    var cg=new THREE.Group();cg.position.y=crankY;
    var ax=cyl(0.3,0.3,length+1.4,20,MAT.alu);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<=n;mi++){
      var mx=-length/2+0.5+mi*(length-1)/n;
      var mn=cyl(0.5,0.5,0.4,20,MAT.aluD);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<n;ci++){
      var cxx=-length/2+0.85+ci*(length-1.7)/Math.max(1,n-1);
      var o1=ci*Math.PI*2/n;
      var p1=new THREE.Group();
      var pin1=cyl(0.24,0.24,0.55,14,MAT.chrome);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*crankR,0);cg.add(p1);
      var cw=new THREE.Group();
      var cwb=cyl(0.62,0.62,0.36,16,MAT.cast);
      cwb.rotation.z=Math.PI/2;cwb.scale.y=0.65;cw.add(cwb);
      cw.position.set(cxx,-Math.sin(o1)*crankR,0);cg.add(cw);
    }
    root.add(cg);sCr(cg);

    var fw=new THREE.Group();
    var fwD=cyl(fwR,fwR,0.32,28,MAT.aluD);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    var fwI=cyl(fwR*0.5,fwR*0.5,0.35,20,MAT.cast);
    fwI.rotation.z=Math.PI/2;fw.add(fwI);
    for(var ft=0;ft<36;ft++){
      var th=box(0.32,0.14,0.13,MAT.aluD);
      var a=(ft/36)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.05),Math.sin(a)*(fwR+0.05));
      th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(length/2+fwR+0.2,crankY,0);
    root.add(fw);sF(fw);
  }

  function makeBlock(root,length,blockH,blockD,blockY){
    var pan=box(length+0.3,1.1,blockD+0.2,MAT.cast);
    pan.position.y=blockY-blockH/2-2.2;root.add(pan);
    var lip=box(length+0.4,0.14,blockD+0.3,MAT.rib);
    lip.position.y=blockY-blockH/2-1.55;root.add(lip);

    var bk=box(length,blockH,blockD,MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<5;rr++){
      var rb=box(length+0.03,0.03,blockD+0.03,MAT.rib);
      rb.position.y=blockY-blockH/2+0.7+rr*(blockH-1.4)/4;
      root.add(rb);pR(rb);
    }

    var gk=box(length+0.14,0.1,blockD+0.14,MAT.rib);
    gk.position.y=blockY+blockH/2+0.15;root.add(gk);

    var headH=1.3;
    var headY=blockY+blockH/2+0.15+headH/2;
    var head=box(length+0.1,headH,blockD+0.1,MAT.head);
    head.position.y=headY;root.add(head);pH(head);

    for(var b=0;b<4;b++){
      var bolt=cyl(0.07,0.07,0.16,8,MAT.bolt);
      bolt.position.set(
        (b<2?-1:1)*(length/2+0.01),
        headY+headH/2+0.08,
        (b%2===0?-1:1)*(blockD/2+0.01)
      );
      root.add(bolt);
    }

    var covH=0.75;
    var covY=headY+headH/2+covH/2;
    var cover=box(length-0.2,covH,blockD-0.5,MAT.cover);
    cover.position.y=covY;root.add(cover);pC(cover);

    var cap=cyl(0.22,0.22,0.22,14,MAT.plug);
    cap.position.set(length/2-0.9,covY+covH/2+0.1,0);root.add(cap);
    var cap2=cyl(0.14,0.14,0.06,10,MAT.yellow);
    cap2.position.set(length/2-0.9,covY+covH/2+0.22,0);root.add(cap2);

    return {blockY:blockY,blockH:blockH,blockD:blockD,headY:headY,headH:headH,covY:covY,covH:covH,length:length};
  }

  function makeIntake(root,B,n,spacing){
    var tw=n*spacing;
    var plenumY=B.blockY+B.blockH/2+B.headH+B.covH+0.6;
    var plenum=cyl(0.42,0.42,B.length*0.85,18,MAT.int);
    plenum.rotation.z=Math.PI/2;
    plenum.position.set(0,plenumY,B.blockD/2+0.75);root.add(plenum);
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var fl=box(0.55,0.15,0.32,MAT.aluD);
      fl.position.set(xx,B.blockY+B.blockH/2+0.1,B.blockD/2+0.28);root.add(fl);
      var rl=cyl(0.22,0.28,plenumY-(B.blockY+B.blockH/2+0.1),12,MAT.int);
      rl.position.set(xx,(plenumY+B.blockY+B.blockH/2)/2,B.blockD/2+0.55);
      root.add(rl);
    }
    var tb=cyl(0.55,0.55,0.4,18,MAT.aluD);
    tb.rotation.z=Math.PI/2;
    tb.position.set(-B.length*0.5,plenumY,B.blockD/2+0.75);root.add(tb);
  }

  function makeExhaust(root,B,n,spacing){
    var tw=n*spacing;
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var fl=box(0.55,0.15,0.32,MAT.exh);
      fl.position.set(xx,B.blockY+B.blockH/2+0.1,-B.blockD/2-0.28);root.add(fl);
      var rl=cyl(0.22,0.26,0.65,12,MAT.exh);
      rl.position.set(xx,B.blockY+B.blockH/2-0.35,-B.blockD/2-0.5);
      rl.rotation.x=Math.PI/7;root.add(rl);
    }
    var header=cyl(0.38,0.38,B.length*0.85,16,MAT.exh);
    header.rotation.z=Math.PI/2;
    header.position.set(0,B.blockY-B.blockH/2-0.6,-B.blockD/2-0.9);root.add(header);
  }

  function makeTurbo(root,B){
    var g=new THREE.Group();
    var comp=cyl(0.7,0.85,0.85,22,MAT.alu);comp.rotation.z=Math.PI/2;g.add(comp);
    var compS=tor(0.8,0.28,10,22,MAT.alu);
    compS.rotation.y=Math.PI/2;compS.position.x=-0.15;g.add(compS);
    var turb=cyl(0.55,0.7,0.75,20,MAT.cast);
    turb.rotation.z=Math.PI/2;turb.position.x=1.05;g.add(turb);
    var turbS=tor(0.65,0.24,10,20,MAT.cast);
    turbS.rotation.y=Math.PI/2;turbS.position.x=1.15;g.add(turbS);
    var ax=cyl(0.1,0.1,2.5,10,MAT.chrome);
    ax.rotation.z=Math.PI/2;ax.position.x=0.45;g.add(ax);
    g.position.set(B.length/2+0.7,B.blockY-B.blockH/2-0.4,-B.blockD/2-1.1);
    root.add(g);
    if(!window._dciPartsArr)window._dciPartsArr=[];
    window._dciPartsArr.push({turbo:g});
  }

  function inlineBase(root,opt){
    var n=opt.n||4, sp=opt.spacing||2.2;
    var tw=n*sp;
    var length=tw+1.6;
    var blockD=opt.d||4.8, blockH=opt.h||4.5;
    var blockY=opt.y||3.6;
    var diesel=!!opt.diesel;
    var pistonR=opt.pR||1.0;
    var pH2=opt.pH||0.9;
    var crankR=0.8;
    var rodLen=3.5;
    // ВАЖНО: crankY так, чтобы верх поршня касался верха блока
    var crankY=blockY+blockH/2-crankR-rodLen-pH2/2+0.05;

    makeCrank(root,length,crankY,n,crankR,opt.fwR||2.3);
    var B=makeBlock(root,length,blockH,blockD,blockY);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+sp/2+i*sp;
      var a=makeCyl({
        x:xx,z:0,r:pistonR,pH:pH2,
        off:i*Math.PI,crankR:crankR,rodLen:rodLen,crankY:crankY
      });
      root.add(a.g);arr.push(a);
    }
    sA(arr);
    makeIntake(root,B,n,sp);
    makeExhaust(root,B,n,sp);
    if(diesel)makeTurbo(root,B);
    return B;
  }

  function buildR4(root){inlineBase(root,{n:4});}
  function buildTDI(root){inlineBase(root,{n:4,diesel:true});}
  function buildDCi(root){inlineBase(root,{n:4,diesel:true});}
  function buildPassatB3(root){inlineBase(root,{n:4});}
  function buildBluebird(root){inlineBase(root,{n:4});}
  function buildScooter(root){inlineBase(root,{n:1,spacing:1.8,d:3.2,h:3.4,y:2.9,pR:1.0,pH:0.85,fwR:1.3});}
  function buildI6(root){inlineBase(root,{n:6,spacing:2.0,h:5.0,d:4.8,y:4.0,pH:0.95});}

  function buildVBase(root,totalN,half,bankDist){
    var perRow=Math.floor(totalN/2);
    var sp=2.1;
    var tw=perRow*sp;
    var length=tw+2.0;
    var blockY=3.6;
    var blockH=4.5;
    var pH2=0.85;
    var crankR=0.85;
    var rodLen=3.5;
    var crankY=blockY-pH2/2-rodLen+crankR*0.5;

    makeCrank(root,length,crankY,perRow,crankR,2.6);

    var pan=box(length+0.4,1.3,bankDist*2+3.0,MAT.cast);
    pan.position.y=crankY-0.9;root.add(pan);

    var arr=[];
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bankW=2.4;
      var bk=box(length,blockH,bankW,MAT.block);
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);
      for(var rr=0;rr<4;rr++){
        var rb=box(length+0.03,0.03,bankW+0.03,MAT.rib);
        rb.position.set(0,blockY-blockH/2+0.5+rr*(blockH-1.0)/3,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }
      var headH=1.2;
      var headY=blockY+blockH/2+0.15+headH/2;
      var hd=box(length+0.1,headH,bankW+0.1,MAT.head);
      hd.position.set(0,headY,sign*(bankDist+0.5));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);
      var covH=0.7;
      var covY=headY+headH/2+covH/2;
      var cv=box(length-0.2,covH,bankW-0.3,MAT.cover);
      cv.position.set(0,covY,sign*(bankDist+0.6));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);
      for(var j=0;j<perRow;j++){
        var xx=-tw/2+sp/2+j*sp;
        var off=(side===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makeCyl({
          x:xx,z:sign*bankDist,r:0.95,pH:pH2,
          off:off,crankR:crankR,rodLen:rodLen,crankY:crankY
        });
        a.g.rotation.x=sign*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
    var plenum=cyl(0.5,0.5,length*0.85,18,MAT.int);
    plenum.rotation.z=Math.PI/2;
    plenum.position.set(0,blockY+blockH/2+2.4,0);root.add(plenum);
    for(var s=0;s<2;s++){
      var sg=s===0?-1:1;
      var ex=cyl(0.35,0.35,length*0.85,16,MAT.exh);
      ex.rotation.z=Math.PI/2;
      ex.position.set(0,blockY-blockH/2-0.6,sg*(bankDist+1.5));
      root.add(ex);
    }
  }
  function buildV6(root){buildVBase(root,6,Math.PI/6,1.7);}
  function buildV8(root){buildVBase(root,8,Math.PI/6,1.8);}
  function buildV12(root){buildVBase(root,12,Math.PI/6,2.0);}
  function buildV16(root){buildVBase(root,16,Math.PI/6,2.1);}
  function buildV22(root){buildVBase(root,22,Math.PI/4,2.4);}

  function buildBoxer(root){
    var n=2,sp=2.6;
    var tw=n*sp;
    var length=tw+2.0;
    var blockY=3.4,blockH=3.6,blockD=4.2;
    var pH2=0.8;
    var crankR=0.8;
    var rodLen=2.6;
    var crankY=blockY-pH2/2-rodLen+crankR*0.5;

    makeCrank(root,length,crankY,n,crankR,2.5);
    var pan=box(length+0.5,1.2,blockD+0.3,MAT.cast);
    pan.position.y=crankY-0.9;root.add(pan);

    var bk=box(length,blockH,2.4,MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);
    for(var rr=0;rr<4;rr++){
      var rb=box(length+0.03,0.03,2.5,MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/3;root.add(rb);pR(rb);
    }
    var arr=[];
    for(var s=0;s<2;s++){
      var sign=s===0?-1:1;
      var headH=2.0;
      var hd=box(length+0.1,headH,1.2,MAT.head);
      hd.position.set(0,blockY,sign*(blockD/2+0.7));
      hd.rotation.x=sign*Math.PI/2;root.add(hd);pH(hd);
      var cv=box(length-0.2,headH*0.85,0.9,MAT.cover);
      cv.position.set(0,blockY,sign*(blockD/2+1.15));
      cv.rotation.x=sign*Math.PI/2;root.add(cv);pC(cv);
      for(var j=0;j<n;j++){
        var xx=-tw/2+sp/2+j*sp;
        var off=(s===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=makeCyl({
          x:xx,z:sign*(blockD/2+0.5),r:0.9,pH:pH2,
          off:off,crankR:crankR,rodLen:rodLen,crankY:crankY
        });
        a.g.rotation.x=sign*Math.PI/2;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  function buildRadial(root){
    var n=9;
    var step=Math.PI*2/n;
    var R_cyl=3.0;
    var cylLen=2.8;
    var blockY=3.0;
    var carter=cyl(3.4,3.4,1.0,36,MAT.cast);
    carter.rotation.x=Math.PI/2;carter.position.set(0,blockY,0);root.add(carter);
    var crank=cyl(0.45,0.45,3.5,20,MAT.chrome);
    crank.rotation.x=Math.PI/2;crank.position.set(0,blockY,0);root.add(crank);sCr(crank);
    var fw=new THREE.Group();
    var fwD=cyl(2.1,2.1,0.35,32,MAT.aluD);
    fwD.rotation.x=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<32;ft++){
      var th=box(0.28,0.2,0.14,MAT.aluD);
      var a=(ft/32)*Math.PI*2;
      th.position.set(Math.cos(a)*2.2,Math.sin(a)*2.2,0);
      th.rotation.z=a;fw.add(th);
    }
    fw.position.set(0,blockY,3.2);root.add(fw);sF(fw);
    var arr=[];
    for(var i=0;i<n;i++){
      var a2=i*step-Math.PI/2;
      var cx2=Math.cos(a2)*R_cyl;
      var cyy=blockY+Math.sin(a2)*R_cyl;
      var grp=new THREE.Group();
      grp.position.set(cx2,cyy,0);
      grp.rotation.z=a2-Math.PI/2;
      root.add(grp);
      var shell=new THREE.Mesh(
        new THREE.CylinderGeometry(0.9,0.9,cylLen,22,1,true),MAT.block);
      shell.position.y=cylLen/2;grp.add(shell);pB(shell);
      var hd=cyl(1.0,1.0,0.4,22,MAT.head);
      hd.position.y=cylLen+0.2;grp.add(hd);pH(hd);
      var plug=cyl(0.1,0.1,0.5,10,MAT.plug);
      plug.position.y=cylLen+0.55;grp.add(plug);
    }
  }

  function buildTractor(root){
    var n=4,sp=2.7;
    var tw=n*sp;
    var length=tw+2.2;
    var B=inlineBase(root,{n:4,spacing:2.7,d:5.5,h:5.5,y:4.2,pR:1.2,pH:1.05,fwR:3.0});
    var tank=box(length*0.55,2.0,2.0,MAT.yellow);
    tank.position.set(-length/2-2.0,B.blockY+1.5,0);root.add(tank);
    var pump=box(2.2,2.0,2.0,MAT.aluD);
    pump.position.set(length/2+1.0,B.covY+0.5,B.blockD/2-0.3);root.add(pump);
    var ex=cyl(0.36,0.36,7.5,14,MAT.exh);
    ex.position.set(length/2-1.5,B.covY+2.5,0);root.add(ex);
    var rad=box(3.4,3.0,0.5,MAT.aluD);
    rad.position.set(length/2+2.6,B.blockY,0);root.add(rad);
    for(var rf=0;rf<14;rf++){
      var fin=box(3.3,0.06,0.5,MAT.alu);
      fin.position.set(length/2+2.6,B.blockY-1.4+rf*0.2,0);root.add(fin);
    }
  }

  function makeEpiShape(Rr,e){
    var pts=[];
    for(var i=0;i<=120;i++){
      var t=(i/120)*Math.PI*2;
      pts.push(new THREE.Vector2(
        Rr*Math.cos(t)+e*Math.cos(3*t),
        Rr*Math.sin(t)+e*Math.sin(3*t)
      ));
    }
    return new THREE.Shape(pts);
  }
  function makeRotorShape(rotR){
    var sh=new THREE.Shape();
    var pts=[];
    for(var i=0;i<=90;i++){
      var t=(i/90)*Math.PI*2;
      var r=rotR*(0.72+0.28*Math.abs(Math.cos(1.5*t)));
      pts.push(new THREE.Vector2(r*Math.cos(t),r*Math.sin(t)));
    }
    sh.moveTo(pts[0].x,pts[0].y);
    for(var j=1;j<pts.length;j++)sh.lineTo(pts[j].x,pts[j].y);
    sh.closePath();
    return sh;
  }
  function buildWankel(root){
    window._dvsWankelRotors=window._dvsWankelRotors||[];
    window._dvsWankelPins=window._dvsWankelPins||[];
    window._dvsWankelFlashes=window._dvsWankelFlashes||[];
    var Rr=2.0,e=0.45;
    var hGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,e),{depth:2.2,bevelEnabled:false});
    hGeo.center();
    var housing=new THREE.Mesh(hGeo,MAT.block);
    housing.position.y=3;root.add(housing);pB(housing);
    var iGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr*0.92,e*0.92),{depth:2.0,bevelEnabled:false});
    iGeo.center();
    var inner=new THREE.Mesh(iGeo,MAT.head);
    inner.position.y=3;inner.scale.set(0.95,0.95,0.9);root.add(inner);
    var rGeo=new THREE.ExtrudeGeometry(makeRotorShape(1.5),{depth:1.4,bevelEnabled:false});
    rGeo.center();
    var rotorMesh=new THREE.Mesh(rGeo,MAT.alu);
    rotorMesh.position.y=3;root.add(rotorMesh);
    window._dvsWankelRotors.push({mesh:rotorMesh,ecc:e});
    var shaft=new THREE.Group();
    shaft.position.y=3;
    var sh=cyl(0.3,0.3,4.0,14,MAT.chrome);
    sh.rotation.x=Math.PI/2;shaft.add(sh);
    var ec=cyl(0.7,0.7,0.4,20,MAT.aluD);
    ec.rotation.x=Math.PI/2;ec.position.z=0.4;shaft.add(ec);
    root.add(shaft);sCr(shaft);
    window._dvsWankelPins.push({grp:shaft});
    var fw=new THREE.Group();fw.position.y=3;
    var fwD=cyl(1.9,1.9,0.35,28,MAT.aluD);
    fwD.rotation.x=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=box(0.28,0.18,0.13,MAT.aluD);
      var a=(ft/30)*Math.PI*2;
      th.position.set(Math.cos(a)*2.0,Math.sin(a)*2.0,0);
      th.rotation.z=a;fw.add(th);
    }
    fw.position.z=2.8;root.add(fw);sF(fw);
    for(var fp=0;fp<3;fp++){
      var fm=new THREE.Mesh(new THREE.SphereGeometry(0.45,14,10),
        new THREE.MeshBasicMaterial({color:0xffaa44,transparent:true,opacity:0}));
      var fa=fp*(Math.PI*2/3)-Math.PI/2;
      fm.position.set(Math.cos(fa)*Rr*0.7,3+Math.sin(fa)*Rr*0.7,0.5);
      root.add(fm);
      var lt=new THREE.PointLight(0xffaa44,0,8);
      lt.position.copy(fm.position);root.add(lt);
      window._dvsWankelFlashes.push({mesh:fm,light:lt,phase:fa});
    }
  }

  window.DVS_3D_BUILDERS={
    r4:buildR4,tdi:buildTDI,dci:buildDCi,
    scooter:buildScooter,passatb3:buildPassatB3,bluebird:buildBluebird,
    i6:buildI6,galant6:buildV6,v6:buildV6,v8:buildV8,v12:buildV12,v16:buildV16,v22:buildV22,
    boxer:buildBoxer,radial:buildRadial,tractor:buildTractor,wankel:buildWankel
  };
  if(window.DVS_3D&&window.DVS_3D.isActive&&window.DVS_3D.isActive()){
    try{window.DVS_3D_REBUILD();}catch(e){}
  }
  console.log('view3d-build.js: билдеров =',Object.keys(window.DVS_3D_BUILDERS).length);
}
waitRef();
})();