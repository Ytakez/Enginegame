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