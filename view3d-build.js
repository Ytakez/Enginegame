(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF;
  var B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx,m=B.m;

  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  function makeBrandTex(t,bg,fg){
    var cv=document.createElement('canvas');cv.width=1024;cv.height=256;
    var c=cv.getContext('2d');
    c.fillStyle=bg;c.fillRect(0,0,1024,256);
    c.strokeStyle=fg;c.lineWidth=8;c.strokeRect(12,12,1000,232);
    c.fillStyle=fg;c.font='bold 130px Arial';c.textAlign='center';c.textBaseline='middle';
    c.fillText(t,512,138);
    var tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;return tex;
  }
  function addPlate(root,x,y,z,w,h,t,bg,fg){
    var tex=makeBrandTex(t,bg,fg);
    var mat=new THREE.MeshStandardMaterial({map:tex,metalness:0.3,roughness:0.6,side:THREE.DoubleSide});
    var pl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
    pl.position.set(x,y,z);pl.rotation.x=-Math.PI/2;
    root.add(pl);pC(pl);
  }

  function makeCylAss(o){
    var g=new THREE.Group();
    g.position.set(o.x,o.y,o.z);
    var shell=new THREE.Mesh(
      new THREE.CylinderGeometry(o.r+0.15,o.r+0.15,o.h,20,1,true),
      new THREE.MeshStandardMaterial({
        color:0x8894a2,metalness:0.9,roughness:0.15,
        transparent:true,opacity:0.32,side:THREE.DoubleSide
      }));
    shell.position.y=o.h/2;g.add(shell);

    var p=new THREE.Group();
    p.position.y=o.h*0.55;
    p.add(cy(o.r,o.r*0.9,18,0xd8e0e8,0.95,0.15));
    for(var k=0;k<3;k++){
      var rg=cy(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);
      rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);
    }
    var pin=cy(o.r*0.15,o.r*1.1,10,0x2a3543,0.9,0.3);
    pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);

    var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);
    g.add(rod);

    var ign=new THREE.Group();
    if(o.diesel)ign.add(cy(o.r*0.15,o.r*0.5,10,0x3a3a3a,0.7,0.4));
    else ign.add(cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5));
    ign.position.y=o.h+0.4;g.add(ign);

    var vv=[];
    var cols=[0x6fd0ff,0xff8a6f,0xffffff,0xffaa44];
    for(var s=0;s<4;s++){
      var vg=new THREE.Group();
      vg.add(cy(o.r*0.22,0.1,12,cols[s],0.75,0.4));
      var vx=(s%2===0?-1:1)*o.r*0.4;
      var vz=(s<2?-1:1)*o.r*0.25;
      vg.position.set(vx,o.h+0.05,vz);
      g.add(vg);vv.push(vg);
    }
    return {g:g,p:p,rod:rod,vv:vv,x:o.x,y:o.y,z:o.z,h:o.h,r:o.r,off:o.off||0};
  }

  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=cy(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<=perRow;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var p1=new THREE.Group();
      var pin1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*0.55,0);cg.add(p1);
    }
    root.add(cg);sCr(cg);

    var fw=new THREE.Group();
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
      th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.7,y,0);
    root.add(fw);sF(fw);
  }

  /* === РЯДНЫЙ === */
  function buildInline(root,cfg,brand){
    var perRow=cfg.n||4;
    var spacing=cfg.spacing||2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var diesel=!!cfg.diesel;

    var pod=bx(blockLen+0.4,1.4,diesel?5.2:5,diesel?0x2a2a2a:0x2a3340,0.7,0.5);
    pod.position.y=-0.7;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,cfg.fwR||2.2);

    var bk=bx(blockLen,5,diesel?5:5,diesel?0x3a3a3a:0x4a5566,0.8,0.45);
    bk.position.y=3.4;root.add(bk);pB(bk);

    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.06,0.07,5.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }

    var hd=bx(blockLen+0.2,1.4,5.3,diesel?0x4a4a4a:0x3a4756,0.85,0.35);
    hd.position.y=6.4;root.add(hd);pH(hd);

    var cv=bx(blockLen,0.8,5,0x2a3340,0.75,0.4);
    cv.position.y=7.5;root.add(cv);pC(cv);

    var inMan=cy(0.34,blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,diesel?5.6:5.8,2.5);root.add(inMan);

    var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,-0.3,-2.5);root.add(exMan);

    if(diesel){
      var turbo=new THREE.Group();
      var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);
      tb.rotation.z=Math.PI/2;turbo.add(tb);
      var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,8,20),m(0x6a7685,0.9,0.3));
      snail.rotation.y=Math.PI/2;turbo.add(snail);
      turbo.position.set(blockLen/2+0.3,-0.3,-2.5);
      root.add(turbo);
      window._dciParts=window._dciParts||[];
      window._dciParts.push({turbo:turbo});
      var pump=bx(1.8,1.5,1.7,0x3a4654,0.85,0.4);
      pump.position.set(blockLen/2+0.5,7.5,-2.5);root.add(pump);
    }

    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.15,h:4.6,off:i*Math.PI,diesel:diesel});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    if(brand)addPlate(root,0,8.3,0,blockLen*0.5,0.55,brand.text,brand.bg,brand.fg);
  }

  /* === V-ОБРАЗНЫЙ === */
  function buildV(root,cfg,brand){
    var perRow=Math.floor(cfg.n/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var half=Math.PI/6;
    var bankDist=1.8;

    var pod=bx(blockLen+0.4,1.2,7.5,0x2a2a2a,0.7,0.5);
    pod.position.y=-0.9;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,2.4);

    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bk=bx(blockLen,5,2.8,0x3a3a3a,0.85,0.4);
      bk.position.set(0,3.4,sign*bankDist);
      bk.rotation.x=sign*half;
      root.add(bk);pB(bk);

      for(var rr=0;rr<7;rr++){
        var rb=bx(blockLen+0.05,0.06,2.85,0x1a1a1a,0.6,0.6);
        rb.position.set(0,1.2+rr*0.55,sign*bankDist);
        rb.rotation.x=sign*half;
        root.add(rb);pR(rb);
      }

      var hd=bx(blockLen+0.2,1.4,2.8,0x8894a2,0.9,0.25);
      hd.position.set(0,6.4,sign*(bankDist+1.2));
      hd.rotation.x=sign*half;
      root.add(hd);pH(hd);

      var cv=bx(blockLen,0.8,2.5,0x2a3340,0.75,0.4);
      cv.position.set(0,7.5,sign*(bankDist+1.5));
      cv.rotation.x=sign*half;
      root.add(cv);pC(cv);

      var inMan=cy(0.32,blockLen*0.9,14,0x8b6a2b,0.9,0.35);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,7.0,sign*(bankDist+2.2));
      root.add(inMan);

      var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.5,sign*0.5);
      root.add(exMan);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makeCylAss({x:xx,y:1.1,z:sg*bankDist,r:1.0,h:4.6,off:off});
        a.g.rotation.x=sg*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);

    if(brand)addPlate(root,0,7.42,0,2.2,0.4,brand.text,brand.bg,brand.fg);
  }

  /* === BOXER === */
  function buildBoxer(root,cfg,brand){
    var perRow=2,spacing=2.4;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var half=Math.PI/2;
    var bankDist=1.6;

    var pod=bx(blockLen+0.3,1.2,6.0,0x2a3340,0.7,0.5);
    pod.position.y=-0.6;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,2.4);

    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bk=bx(blockLen,4.4,2.6,0x4a5566,0.85,0.4);
      bk.position.set(0,3.4,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);

      for(var rr=0;rr<6;rr++){
        var rb=bx(blockLen+0.05,0.06,2.65,0x1a1a1a,0.6,0.6);
        rb.position.set(0,1.4+rr*0.5,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }

      var hd=bx(blockLen+0.2,1.2,2.7,0x8894a2,0.9,0.25);
      hd.position.set(0,6.0,sign*(bankDist+1.0));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);

      var cv=bx(blockLen,0.8,2.5,0x2a3340,0.75,0.4);
      cv.position.set(0,7.0,sign*(bankDist+1.3));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);

      var inMan=cy(0.32,blockLen*0.85,14,0x3a4654,0.85,0.4);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,6.6,sign*(bankDist+1.9));root.add(inMan);

      var exMan=cy(0.34,blockLen*0.85,14,0x4a3a2a,0.85,0.5);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.4,sign*0.4);root.add(exMan);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=makeCylAss({x:xx,y:1.1,z:sg*bankDist,r:0.95,h:4.0,off:off});
        a.g.rotation.x=sg*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);

    if(brand)addPlate(root,0,8.4,0,blockLen*0.5,0.5,brand.text,brand.bg,brand.fg);
  }

  /* === RADIAL (Wright) — вал и маховик ВДОЛЬ оси X === */
  function buildRadial(root,cfg,brand){
    var n=9;
    var angStep=Math.PI*2/n;
    var R_cyl=3.2;
    var cylLen=3.0;

    var carter=cy(3.4,0.8,32,0x3a3a3a,0.75,0.45);
    carter.rotation.x=Math.PI/2;
    carter.position.set(0,3,0);
    root.add(carter);pB(carter);

    // ВАЛ — цилиндр вдоль X (rotation.z = PI/2)
    var crank=new THREE.Group();
    crank.position.set(0,3,0);
    var crBar=cy(0.45,0.45,4.2,20,0xa8b4c0,0.95,0.2);
    crBar.rotation.z=Math.PI/2;
    crank.add(crBar);
    root.add(crank);sCr(crank);

    // МАХОВИК — диск в плоскости YZ, тоже вдоль X
    var fw=new THREE.Group();
    fw.position.set(0,3,0);
    var fwD=cy(2.0,2.0,0.4,32,0x8a95a3,0.9,0.3);
    fwD.rotation.z=Math.PI/2;
    fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.28,0.15,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*2.15,Math.sin(a)*2.15);
      th.rotation.x=-a;
      fw.add(th);
    }
    fw.position.set(2.2,3,0);
    root.add(fw);sF(fw);

    var arr=[];
    for(var i=0;i<n;i++){
      var a=i*angStep-Math.PI/2;
      var cx=Math.cos(a)*R_cyl;
      var cyy=3+Math.sin(a)*R_cyl;

      var grp=new THREE.Group();
      grp.position.set(cx,cyy,0);
      grp.rotation.z=a-Math.PI/2;
      root.add(grp);

      var shell=new THREE.Mesh(
        new THREE.CylinderGeometry(1.0,1.0,cylLen,20,1,true),
        new THREE.MeshStandardMaterial({
          color:0x8894a2,metalness:0.9,roughness:0.15,
          transparent:true,opacity:0.32,side:THREE.DoubleSide
        }));
      shell.position.y=cylLen/2;grp.add(shell);pB(shell);

      var hd=cy(1.05,0.4,20,0x8894a2,0.9,0.25);
      hd.position.y=cylLen+0.2;grp.add(hd);pH(hd);

      var p=cy(0.9,0.7,18,0xd8e0e8,0.95,0.15);
      p.position.y=cylLen*0.5;grp.add(p);

      var rod=bx(0.28,1.6,0.28,0x8894a2,0.9,0.25);
      rod.position.y=-0.5;grp.add(rod);

      arr.push({g:grp,p:p,rod:rod,off:i*angStep});
    }
    sA(arr);

    if(brand)addPlate(root,0,7.5,0,4.5,0.6,brand.text,brand.bg,brand.fg);
  }

  /* === SCOOTER === */
  function buildScooter(root,cfg,brand){
    var perRow=1,spacing=1.8;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+2.0;

    var pod=bx(blockLen,1.0,3.4,0x2a3340,0.7,0.5);
    pod.position.y=-0.5;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,1.4);

    var bk=bx(blockLen,3.6,3.4,0x4a5566,0.85,0.4);
    bk.position.y=2.4;root.add(bk);pB(bk);

    for(var rr=0;rr<6;rr++){
      var rb=bx(blockLen+0.05,0.06,3.45,0x1a1a1a,0.6,0.6);
      rb.position.y=0.8+rr*0.5;root.add(rb);pR(rb);
    }

    var hd=bx(blockLen+0.2,1.2,3.5,0x3a4756,0.85,0.35);
    hd.position.y=4.8;root.add(hd);pH(hd);

    var cv=bx(blockLen,0.7,3.3,0x2a3340,0.75,0.4);
    cv.position.y=5.8;root.add(cv);pC(cv);

    var carb=bx(0.8,0.8,0.8,0x3a3a3a,0.7,0.5);
    carb.position.set(0,6.6,1.8);root.add(carb);
    var filter=cy(0.55,0.4,14,0x1a1a1a,0.5,0.7);
    filter.position.set(0,6.6,2.5);root.add(filter);

    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:0.9,h:3.4,off:0});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    if(brand)addPlate(root,0,6.6,0,blockLen*0.6,0.5,brand.text,brand.bg,brand.fg);
  }

  /* === ТРАКТОР === */
  function buildTractor(root,cfg,brand){
    var perRow=4,spacing=2.5;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+2.0;

    var pod=bx(blockLen+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);
    pod.position.y=-1.0;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,3.0);

    var bk=bx(blockLen,5.5,6,0x3a3a3a,0.75,0.55);
    bk.position.y=3.7;root.add(bk);pB(bk);

    for(var rr=0;rr<10;rr++){
      var rb=bx(blockLen+0.06,0.10,6.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.3+rr*0.55;root.add(rb);pR(rb);
    }

    var hd=bx(blockLen+0.3,1.6,6.3,0x4a4a4a,0.8,0.45);
    hd.position.y=7.1;root.add(hd);pH(hd);

    var cv=bx(blockLen,0.9,6,0x2a2a2a,0.7,0.45);
    cv.position.y=8.3;root.add(cv);pC(cv);

    var tank=bx(blockLen*0.65,2.2,2.0,0x5a5a4a,0.6,0.6);
    tank.position.set(-blockLen/2-1.6,2.2,0);root.add(tank);

    var pump=bx(2.4,2.2,2.2,0x3a4654,0.8,0.5);
    pump.position.set(blockLen/2+0.8,7.8,2.6);root.add(pump);

    var af=cy(1.0,2.6,18,0x4a4a4a,0.6,0.6);
    af.rotation.z=Math.PI/2;
    af.position.set(-blockLen/2+1.5,10.8,0);root.add(af);

    var ex=cy(0.38,7.5,14,0x4a4a4a,0.7,0.5);
    ex.position.set(blockLen/2-1.4,11.8,0);root.add(ex);
    var exC=cy(0.55,0.4,14,0x3a3a3a,0.7,0.5);
    exC.position.set(blockLen/2-1.4,15.7,0);root.add(exC);

    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.35,h:5.0,off:i*Math.PI,diesel:true});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    if(brand)addPlate(root,0,9.2,0,blockLen*0.5,0.55,brand.text,brand.bg,brand.fg);
  }

  /* === ВАНКЕЛЬ === */
  function makeEpiShape(Rr,e){
    var pts=[];
    for(var i=0;i<=96;i++){
      var t=(i/96)*Math.PI*2;
      pts.push(new THREE.Vector2(
        Rr*Math.cos(t)+e*Math.cos(3*t),
        Rr*Math.sin(t)+e*Math.sin(3*t)
      ));
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
  function buildWankel(root,cfg,brand){
    var Rr=2.0,ecc=0.4,depth=1.6,rotR=1.2,space=5.0;
    window._dvsWankelRotors=[];

    var base=bx(space+2.5,0.6,5.5,0x2a3340,0.7,0.5);
    base.position.y=-2.2;root.add(base);

    var axisMesh=new THREE.Mesh(
      new THREE.CylinderGeometry(0.28,0.28,space+3,16),
      m(0xc8d4e0,0.95,0.2));
    axisMesh.rotation.z=Math.PI/2;root.add(axisMesh);

    for(var ri=0;ri<2;ri++){
      var rx=(ri-0.5)*space;
      var unit=new THREE.Group();
      unit.position.set(rx,0,0);

      var epiGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false,curveSegments:64});
      epiGeo.center();
      var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({
        color:0x8894a2,metalness:0.92,roughness:0.2,
        transparent:true,opacity:0.32,side:THREE.DoubleSide
      }));
      unit.add(caseMesh);pB(caseMesh);

      var backGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr*0.98,ecc*0.98),{depth:0.12,bevelEnabled:false,curveSegments:64});
      backGeo.center();
      var backMesh=new THREE.Mesh(backGeo,m(0x1a232e,0.8,0.5));
      backMesh.position.z=-depth/2-0.12;unit.add(backMesh);

      for(var rb=0;rb<16;rb++){
        var ang=(rb/16)*Math.PI*2;
        var rr=Rr+0.35;
        var ribF=bx(0.14,0.5,0.22,0x2a3340,0.7,0.5);
        ribF.position.set(Math.cos(ang)*rr,Math.sin(ang)*rr,depth/2+0.16);
        ribF.rotation.z=ang;unit.add(ribF);pR(ribF);
      }

      var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.72,bevelEnabled:false});
      rotGeo.center();
      var rotorMesh=new THREE.Mesh(rotGeo,m(0xdde5ee,0.95,0.15));
      unit.add(rotorMesh);

      for(var v=0;v<3;v++){
        var va=v*(Math.PI*2/3)-Math.PI/2;
        var seal=cy(0.13,0.85,10,0x1a232e,0.9,0.25);
        seal.rotation.x=Math.PI/2;
        seal.position.set(Math.cos(va)*rotR,Math.sin(va)*rotR,0);
        rotorMesh.add(seal);
      }

      var hub=cy(0.5,0.9,20,0x1a232e,0.9,0.3);
      hub.rotation.x=Math.PI/2;rotorMesh.add(hub);

      window._dvsWankelRotors.push({mesh:rotorMesh,ecc:ecc});
      root.add(unit);
    }

    var fw=new THREE.Group();
    var fwDisc=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.4,32),m(0x8a95a3,0.92,0.28));
    fwDisc.rotation.z=Math.PI/2;fw.add(fwDisc);
    for(var ft=0;ft<28;ft++){
      var ta=(ft/28)*Math.PI*2;
      var tooth=bx(0.3,0.25,0.2,0x6a7685,0.9,0.3);
      tooth.position.set(0,Math.cos(ta)*1.68,Math.sin(ta)*1.68);
      tooth.rotation.x=ta;fw.add(tooth);
    }
    fw.position.set(space+2.0,0,0);
    root.add(fw);sF(fw);

    if(brand)addPlate(root,0,3.2,-depth/2+0.1,3.5,0.5,brand.text,brand.bg,brand.fg);
  }

  /* === ЭКСПОРТ === */
  window.DVS_3D_BUILDERS={
    r4:function(root){buildInline(root,{n:4},{text:'ENGINE',bg:'#2A2A2A',fg:'#FFFFFF'});},
    tdi:function(root){buildInline(root,{n:4,diesel:true},{text:'VOLKSWAGEN',bg:'#001E50',fg:'#FFFFFF'});},
    dci:function(root){buildInline(root,{n:4,diesel:true},{text:'RENAULT',bg:'#EFDF00',fg:'#000000'});},
    passatb3:function(root){buildInline(root,{n:4},{text:'VOLKSWAGEN',bg:'#001E50',fg:'#FFFFFF'});},
    bluebird:function(root){buildInline(root,{n:4},{text:'NISSAN',bg:'#C3002F',fg:'#FFFFFF'});},
    i6:function(root){buildInline(root,{n:6,spacing:1.8,diesel:true},{text:'TOYOTA',bg:'#EB0A1E',fg:'#FFFFFF'});},
    scooter:function(root){buildScooter(root,{n:1},{text:'SCOOTER',bg:'#222222',fg:'#FFFFFF'});},
    galant6:function(root){buildV(root,{n:6},{text:'MITSUBISHI',bg:'#E60012',fg:'#FFFFFF'});},
    v6:function(root){buildV(root,{n:6},{text:'MITSUBISHI',bg:'#E60012',fg:'#FFFFFF'});},
    v8:function(root){buildV(root,{n:8},{text:'V8',bg:'#222222',fg:'#FFAA00'});},
    v12:function(root){buildV(root,{n:12},{text:'V12',bg:'#222222',fg:'#FFAA00'});},
    v16:function(root){buildV(root,{n:16},{text:'V16',bg:'#222222',fg:'#FFAA00'});},
    v22:function(root){buildV(root,{n:22},{text:'V22',bg:'#222222',fg:'#FFAA00'});},
    boxer:function(root){buildBoxer(root,{n:4},{text:'SUBARU',bg:'#003399',fg:'#FFFFFF'});},
    ej25:function(root){buildBoxer(root,{n:4},{text:'SUBARU',bg:'#003399',fg:'#FFFFFF'});},
    radial:function(root){buildRadial(root,{n:9},{text:'WRIGHT',bg:'#1A1A1A',fg:'#FFD700'});},
    wright:function(root){buildRadial(root,{n:9},{text:'WRIGHT',bg:'#1A1A1A',fg:'#FFD700'});},
    tractor:function(root){buildTractor(root,{n:4},{text:'TRACTOR',bg:'#222222',fg:'#FFDD00'});},
    mt82:function(root){buildTractor(root,{n:4},{text:'TRACTOR',bg:'#222222',fg:'#FFDD00'});},
    wankel:function(root){buildWankel(root,{n:2},{text:'MAZDA',bg:'#101010',fg:'#FFFFFF'});},
    renesis: