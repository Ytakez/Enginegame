(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF;
  var B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx,m=B.m;
  var CRANK_R=B.CRANK_R||0.8;   /* единый радиус кривошипа, задаётся в view3d.js */
  var CRANK_Y=0.6;              /* высота оси коленвала */

  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  /* ============ ЦИЛИНДР ============
     cc  — где ось коленвала относительно основания цилиндра (вдоль его оси);
     rot — поворот ряда вокруг оси коленвала (для V и оппозитных).
     Длина шатуна считается так, чтобы поршень в ВМТ упирался в головку. */
  function makeCylAss(o){
    var cc=(o.cc===undefined)?-0.5:o.cc;
    var g=new THREE.Group();
    g.position.set(o.x,o.y,o.z);

    var shell=new THREE.Mesh(
      new THREE.CylinderGeometry(o.r+0.15,o.r+0.15,o.h,20,1,true),
      new THREE.MeshStandardMaterial({
        color:0x8894a2,metalness:0.9,roughness:0.15,
        transparent:true,opacity:0.32,side:THREE.DoubleSide
      }));
    shell.position.y=o.h/2;
    g.add(shell);

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

    var rodH=o.h*0.5;
    var rod=bx(o.r*0.3,rodH,o.r*0.3,0x8894a2,0.9,0.25);
    g.add(rod);

    var ign=new THREE.Group();
    if(o.diesel){
      ign.add(cy(o.r*0.15,o.r*0.5,10,0x3a3a3a,0.7,0.4));
    } else {
      ign.add(cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5));
    }
    ign.position.y=o.h+0.4;
    g.add(ign);

    var vv=[];
    for(var s=0;s<2;s++){
      var vg=new THREE.Group();
      vg.add(cy(o.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4));
      vg.position.set((s===0?-1:1)*o.r*0.4,o.h+0.05,0);
      g.add(vg);vv.push(vg);
    }

    var L=o.h-o.r*0.45-cc-CRANK_R-0.05;   /* длина шатуна */
    return {g:g,p:p,rod:rod,vv:vv,x:o.x,y:o.y,z:o.z,h:o.h,r:o.r,
            off:o.off||0,cc:cc,rot:o.rot||0,L:L,rodH:rodH};
  }

  /* ============ КОЛЕНВАЛ + МАХОВИК ============
     pins: [{x, off}] — шейка стоит под своим цилиндром, фаза как у поршня. */
  function makeCrankAndFly(root,blockLen,y,pins,spacing,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=cy(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);
    ax.rotation.z=Math.PI/2;cg.add(ax);

    var mains=[pins[0].x-spacing/2];
    for(var mi=0;mi<pins.length-1;mi++)mains.push((pins[mi].x+pins[mi+1].x)/2);
    mains.push(pins[pins.length-1].x+spacing/2);
    for(var mj=0;mj<mains.length;mj++){
      var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);
      mn.rotation.z=Math.PI/2;mn.position.x=mains[mj];cg.add(mn);
    }

    /* Шейка: y=R·cos(off), z=-R·sin(off). Так же считает анимация в view3d.js */
    for(var ci=0;ci<pins.length;ci++){
      var o=pins[ci].off;
      var py=CRANK_R*Math.cos(o),pz=-CRANK_R*Math.sin(o);
      var pin1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);
      pin1.rotation.z=Math.PI/2;
      pin1.position.set(pins[ci].x,py,pz);cg.add(pin1);
      for(var side=-1;side<=1;side+=2){
        var ck=cy(0.5,0.12,14,0x8a95a3,0.9,0.3);
        ck.rotation.z=Math.PI/2;
        ck.position.set(pins[ci].x+side*0.3,py*0.5,pz*0.5);cg.add(ck);
      }
    }
    root.add(cg);sCr(cg);

    /* Маховик. Зубья: радиально (rotation.x=+a) и тоньше диска, чтобы
       грани не лежали в одной плоскости и не мерцали. */
    var fw=new THREE.Group();
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.34,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
      th.rotation.x=a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.7,y,0);
    root.add(fw);sF(fw);
  }

  function xsFor(n,spacing){
    var xs=[],tw=n*spacing;
    for(var i=0;i<n;i++)xs.push(-tw/2+spacing/2+i*spacing);
    return xs;
  }

  /* Ряд, повёрнутый вокруг оси коленвала (начало координат — на оси) */
  function bank(root,rot){
    var g=new THREE.Group();
    g.position.y=CRANK_Y;
    g.rotation.x=rot;
    root.add(g);
    return g;
  }

  /* ============ РЯДНЫЙ (R4, R6, скутер R1) ============ */
  function buildInline(root,cfg){
    var perRow=cfg.n||4;
    var spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var xs=xsFor(perRow,spacing);

    var pod=bx(blockLen,1.2,5,0x2a3340,0.7,0.5);
    pod.position.y=-0.6;root.add(pod);

    var pins=[];
    for(var pi=0;pi<perRow;pi++)pins.push({x:xs[pi],off:pi*Math.PI});
    makeCrankAndFly(root,blockLen,CRANK_Y,pins,spacing,2.2);

    var bk=bx(blockLen,5,5,0x4a5566,0.85,0.4);
    bk.position.y=3.4;root.add(bk);pB(bk);

    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.05,0.06,5.05,0x2a3340,0.6,0.6);
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }

    var hd=bx(blockLen+0.2,1.4,5.3,0x3a4756,0.85,0.35);
    hd.position.y=6.4;root.add(hd);pH(hd);

    var cv=bx(blockLen,0.8,5,0x2a3340,0.75,0.4);
    cv.position.y=7.5;root.add(cv);pC(cv);

    var inMan=cy(0.34,blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,5.8,2.5);root.add(inMan);

    var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,-0.3,-2.5);root.add(exMan);

    var arr=[];
    for(var i=0;i<perRow;i++){
      var a4=makeCylAss({x:xs[i],y:1.1,z:0,r:1.15,h:4.6,off:pins[i].off,cc:-0.5});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
  }

  /* ============ V-ОБРАЗНЫЕ (V6, V8, V12, V16, V22) ============
     Каждый ряд — группа, повёрнутая вокруг оси коленвала, поэтому оси
     цилиндров всегда проходят через коленвал. */
  function buildV(root,cfg){
    var perRow=Math.floor(cfg.n/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var half=Math.PI/6;
    var xs=xsFor(perRow,spacing);

    var pod=bx(blockLen+0.4,1.2,7.5,0x2a2a2a,0.7,0.5);
    pod.position.y=-0.9;root.add(pod);

    var pins=[];
    for(var pi=0;pi<perRow;pi++)pins.push({x:xs[pi],off:pi*Math.PI*2/perRow});
    makeCrankAndFly(root,blockLen,CRANK_Y,pins,spacing,2.4);

    /* Впускной коллектор — бронзовый, в развале между рядами */
    var inMan=cy(0.45,blockLen*0.9,14,0x8b6a2b,0.9,0.35);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,5.2,0);root.add(inMan);

    var arr=[];
    for(var side=0;side<2;side++){
      var sg=side===0?-1:1;
      var rot=sg*half;
      var bk0=bank(root,rot);

      var bk=bx(blockLen,5,2.8,0x3a3a3a,0.85,0.4);
      bk.position.y=2.8;bk0.add(bk);pB(bk);

      for(var rr=0;rr<7;rr++){
        var rb=bx(blockLen+0.05,0.06,2.85,0x1a1a1a,0.6,0.6);
        rb.position.y=0.6+rr*0.55;bk0.add(rb);pR(rb);
      }

      var hd=bx(blockLen+0.2,1.4,2.8,0x8894a2,0.9,0.25);
      hd.position.y=5.8;bk0.add(hd);pH(hd);

      var cv=bx(blockLen,0.8,2.5,0x2a3340,0.75,0.4);
      cv.position.y=6.9;bk0.add(cv);pC(cv);

      var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,3.0,sg*1.9);bk0.add(exMan);

      for(var j=0;j<perRow;j++){
        var a=makeCylAss({x:xs[j],y:0.5,z:0,r:1.0,h:4.6,off:pins[j].off,cc:-0.5,rot:rot});
        bk0.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  /* ============ ОППОЗИТНЫЙ (boxer) ============ */
  function buildBoxer(root){
    var perRow=2,spacing=2.4;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var base=1.0,h=4;
    var xs=xsFor(perRow,spacing);

    var pod=bx(blockLen+0.3,1.2,3.4,0x2a3340,0.7,0.5);
    pod.position.y=-0.6;root.add(pod);

    var pins=[{x:xs[0],off:0},{x:xs[1],off:Math.PI}];
    makeCrankAndFly(root,blockLen,CRANK_Y,pins,spacing,2.2);

    var arr=[];
    for(var s=0;s<2;s++){
      var sg=s===0?-1:1;
      var rot=sg*Math.PI/2;
      var bk0=bank(root,rot);

      var bk=bx(blockLen,h,2.6,0x4a5566,0.85,0.4);
      bk.position.y=base+h/2;bk0.add(bk);pB(bk);

      var hd=bx(blockLen+0.2,1.4,3.0,0x3a4756,0.85,0.35);
      hd.position.y=base+h+0.7;bk0.add(hd);pH(hd);

      var cv=bx(blockLen,0.8,2.7,0x2a3340,0.75,0.4);
      cv.position.y=base+h+1.7;bk0.add(cv);pC(cv);

      for(var j=0;j<perRow;j++){
        var a=makeCylAss({x:xs[j],y:base,z:0,r:0.95,h:h,off:pins[j].off,cc:-base,rot:rot});
        bk0.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  /* ============ ЗВЕЗДА (radial, 9 цилиндров) ============
     Цилиндры расходятся в плоскости YZ вокруг оси вала (X). */
  function buildRadial(root){
    var n=9,CY=3.4,R0=2.6,h=3.2;

    var ct=cy(3.0,1.0,32,0x3a3a3a,0.75,0.45);
    ct.rotation.z=Math.PI/2;
    ct.position.set(0,CY,0);root.add(ct);pB(ct);

    makeCrankAndFly(root,3.5,CY,[{x:0,off:0}],1.4,1.6);

    var arr=[];
    for(var i=0;i<n;i++){
      var a=i*(Math.PI*2/n);
      var c=makeCylAss({
        x:0,y:CY+R0*Math.cos(a),z:R0*Math.sin(a),
        r:0.9,h:h,off:0,cc:-R0,rot:a
      });
      c.g.rotation.x=a;
      var head=cy(1.15,0.5,20,0x8894a2,0.9,0.25);
      head.position.y=h+0.25;c.g.add(head);pH(head);
      root.add(c.g);arr.push(c);
    }
    sA(arr);
  }

  /* ============ ДИЗЕЛЬ R4 (TDI, DCI) ============ */
  function buildDiesel(root,cfg){
    var perRow=4,spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var xs=xsFor(perRow,spacing);

    var pod=bx(blockLen+0.4,1.4,5.2,0x2a2a2a,0.7,0.5);
    pod.position.y=-0.7;root.add(pod);

    var pins=[];
    for(var pi=0;pi<perRow;pi++)pins.push({x:xs[pi],off:pi*Math.PI});
    makeCrankAndFly(root,blockLen,CRANK_Y,pins,spacing,2.2);

    var bk=bx(blockLen,5,5,0x3a3a3a,0.8,0.5);
    bk.position.y=3.4;root.add(bk);pB(bk);

    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.06,0.08,5.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }

    var hd=bx(blockLen+0.2,1.4,5.3,0x4a4a4a,0.85,0.4);
    hd.position.y=6.4;root.add(hd);pH(hd);

    var cv=bx(blockLen,0.8,5,0x2a2a2a,0.75,0.4);
    cv.position.y=7.5;root.add(cv);pC(cv);

    var inMan=cy(0.32,blockLen*0.9,16,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,5.6,2.5);root.add(inMan);

    var exMan=cy(0.42,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,-0.2,-2.5);root.add(exMan);

    var turbo=new THREE.Group();
    var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);
    tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,8,20),m(0x6a7685,0.9,0.3));
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.3,-0.3,-2.5);
    root.add(turbo);
    window._dciParts={turbo:turbo};

    var pump=bx(1.8,1.5,1.7,0x3a4654,0.85,0.4);
    pump.position.set(blockLen/2+0.5,7.5,-2.5);root.add(pump);

    var arr=[];
    for(var i=0;i<perRow;i++){
      var a4=makeCylAss({x:xs[i],y:1.1,z:0,r:1.15,h:4.6,off:pins[i].off,cc:-0.5,diesel:true});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
  }

  /* ============ ТРАКТОР (MT82) ============ */
  function buildTractor(root,cfg){
    var perRow=4,spacing=2.5;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+2.0;
    var xs=xsFor(perRow,spacing);

    var pod=bx(blockLen+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);
    pod.position.y=-1.0;root.add(pod);

    var pins=[];
    for(var pi=0;pi<perRow;pi++)pins.push({x:xs[pi],off:pi*Math.PI});
    makeCrankAndFly(root,blockLen,CRANK_Y,pins,spacing,3.0);

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
      var a4=makeCylAss({x:xs[i],y:1.1,z:0,r:1.35,h:5.0,off:pins[i].off,cc:-0.5,diesel:true});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
  }

  /* ============ ВАНКЕЛЬ ============ */
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
    sh.closePath();
    return sh;
  }

  function buildWankel(root){
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
      tooth.position.set(0,Math.cos(ta)*(1.68),Math.sin(ta)*(1.68));
      tooth.rotation.x=ta;fw.add(tooth);
    }
    fw.position.set(space+2.0,0,0);
    root.add(fw);sF(fw);
  }

  /* ============ REBUILD ============ */
  window.DVS_3D_REBUILD=function(){
    var scene=R.getScene();
    if(!scene)return;
    var cfg=R.getCfg(S.engineType)||{n:4,v:false};

    var old=R.getRoot();
    if(old){
      scene.remove(old);
      try{
        old.traverse(function(ch){
          if(ch.geometry)try{ch.geometry.dispose();}catch(e){}
          if(ch.material){
            if(Array.isArray(ch.material))ch.material.forEach(function(mm){try{mm.dispose();}catch(e){}});
            else try{ch.material.dispose();}catch(e){}
          }
        });
      }catch(e){}
    }
    if(R.clearAll)R.clearAll();
    window._dvsWankelRotors=[];
    window._dciParts=null;

    var root=new THREE.Group();scene.add(root);R.setRoot(root);

    var t=S.engineType;
    var nm=String(t||'').toLowerCase().replace(/[\s-]/g,'');
    try{
      if(t==='wankel'||/wankel|renesis/.test(nm)) buildWankel(root);
      else if(t==='tdi')                          buildDiesel(root,cfg);
      else if(t==='dci')                          buildDiesel(root,cfg);
      else if(t==='mt82')                         buildTractor(root,cfg);
      else if(/radial|wright/.test(nm))           buildRadial(root);
      else if(/boxer|ej25|subaru/.test(nm))       buildBoxer(root);
      else if(/scooter/.test(nm))                 buildInline(root,{n:1});
      else if(cfg.v)                              buildV(root,cfg);
      else                                        buildInline(root,cfg);
    }catch(e){console.warn('build crash:',e);}
  };

  console.log('view3d-build: все движки (inline, V, boxer, radial, diesel, tractor, wankel)');
}
waitRef();
})();
