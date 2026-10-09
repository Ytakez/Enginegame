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
  function sC(x){if(R.setCams)R.setCams(x);}
  function sCam(x){if(R.setCam)R.setCam(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  /* Хранилище анимируемых объектов */
  window._dvsAnimated={belts:[],glows:[],flashes:[]};
  var A=window._dvsAnimated;

  /* ==================== ТЕКСТУРА РЕМНЯ ==================== */
  function makeBeltTexture(){
    if(window._dvsBeltTex)return window._dvsBeltTex;
    var c=document.createElement('canvas');
    c.width=32;c.height=32;
    var ctx=c.getContext('2d');
    ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,32,32);
    ctx.fillStyle='#3a3a3a';
    for(var i=0;i<8;i++)ctx.fillRect(0,i*4,32,2);
    var t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;
    window._dvsBeltTex=t;
    return t;
  }

  function makeBelt(len,width,depth){
    var tex=makeBeltTexture().clone();
    tex.needsUpdate=true;
    tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
    tex.repeat.set(len*0.8,1);
    var mat=new THREE.MeshStandardMaterial({map:tex,color:0x1a1a1a,metalness:0.3,roughness:0.85});
    var belt=new THREE.Mesh(new THREE.BoxGeometry(len,depth,width),mat);
    A.belts.push({tex:tex});
    return belt;
  }

  function bolt(x,y,z,r){
    var b=cy(r||0.05,r*2,6,0x8a95a3,0.95,0.3);
    b.rotation.z=Math.PI/2;
    b.position.set(x,y,z);
    return b;
  }

  /* ==================== КАМЕРА ЦИЛИНДРА ==================== */
  function makeCylAss(o){
    var g=new THREE.Group();
    g.position.set(o.x,o.y,o.z);
    if(o.rotX)g.rotation.x=o.rotX;

    /* Гильза */
    var shell=new THREE.Mesh(
      new THREE.CylinderGeometry(o.r+0.15,o.r+0.15,o.h,20,1,true),
      new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.15,transparent:true,opacity:0.28,side:THREE.DoubleSide}));
    shell.position.y=o.h/2;g.add(shell);

    /* Поршень */
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

    var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);g.add(rod);

    /* Свеча */
    var ign=new THREE.Group();
    if(o.diesel){
      ign.add(cy(o.r*0.16,o.r*0.5,10,0x2a2a2a,0.7,0.5));
      var cap=cy(o.r*0.1,o.r*0.2,8,0x8a6a3a,0.7,0.4);cap.position.y=o.r*0.35;ign.add(cap);
    } else {
      ign.add(cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5));
      var mt=cy(o.r*0.17,o.r*0.25,10,0x8a95a3,0.9,0.3);mt.position.y=-0.1;ign.add(mt);
    }
    ign.position.y=o.h+0.4;g.add(ign);

    /* Свечение свечи */
    var glowMesh=new THREE.Mesh(
      new THREE.SphereGeometry(o.r*0.25,10,10),
      new THREE.MeshBasicMaterial({color:o.diesel?0xff5500:0x66ccff,transparent:true,opacity:0,blending:THREE.AdditiveBlending})
    );
    glowMesh.position.y=o.h+0.05;g.add(glowMesh);
    var glowLight=new THREE.PointLight(o.diesel?0xff5500:0x66ccff,0,2.5);
    glowLight.position.y=o.h+0.05;g.add(glowLight);
    A.glows.push({light:glowLight,mesh:glowMesh});

    /* Вспышка */
    var flash=new THREE.Mesh(
      new THREE.SphereGeometry(o.r*0.9,12,12),
      new THREE.MeshBasicMaterial({color:0xffaa30,transparent:true,opacity:0,blending:THREE.AdditiveBlending})
    );
    flash.position.y=o.h*0.85;g.add(flash);
    var flashLight=new THREE.PointLight(0xffaa30,0,4);
    flashLight.position.y=o.h*0.85;g.add(flashLight);
    A.flashes.push({mesh:flash,light:flashLight,off:o.off||0});

    /* Клапаны */
    var vv=[];
    for(var s=0;s<2;s++){
      var vg=new THREE.Group();
      vg.add(cy(o.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4));
      var vs=cy(0.05,o.r*0.6,6,0xa8b4c0,0.9,0.3);vs.position.y=o.r*0.3;vg.add(vs);
      vg.position.set((s===0?-1:1)*o.r*0.4,o.h+0.05,0);
      g.add(vg);vv.push(vg);
    }

    return {g:g,p:p,rod:rod,vv:vv,x:o.x,y:o.y,z:o.z,h:o.h,r:o.r,off:o.off||0};
  }

  /* ==================== КОЛЕНВАЛ + МАХОВИК ==================== */
  function makeCrankAndFly(root,blockLen,y,perRow,fwR,bankCount){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=cy(0.42,blockLen+1,20,0xa8b4c0,0.95,0.2);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    var nMain=perRow+1;
    for(var mi=0;mi<nMain;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/(nMain-1);
      var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      /* Шатунная шейка */
      var p1=new THREE.Group();
      var pin1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*0.55,0);cg.add(p1);
      /* Красная метка */
      var mark=bx(0.08,0.15,0.15,0xff4040,0.4,0.6);
      mark.position.set(cxx,Math.sin(o1)*0.55+0.28,0);cg.add(mark);
    }
    root.add(cg);sCr(cg);

    /* Маховик */
    var fw=new THREE.Group();
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
      th.rotation.x=-a;fw.add(th);
    }
    var fwMark=bx(0.4,0.5,0.3,0xff4040,0.4,0.6);
    fwMark.position.set(0.25,fwR*0.6,0);fw.add(fwMark);
    fw.position.set(blockLen/2+0.7,y,0);root.add(fw);sF(fw);
  }

  /* ==================== ШКИВЫ + РЕМЕНЬ ГРМ ==================== */
  function makeBeltsAndCams(root,blockLen,totalWidth,perRow){
    var bt=new THREE.Group();
    var gt=cy(1.0,0.35,24,0x8a95a3,0.9,0.3);gt.rotation.z=Math.PI/2;bt.add(gt);
    for(var gtt=0;gtt<24;gtt++){
      var tg=bx(0.22,0.18,0.14,0x6a7685,0.9,0.3);
      var a2=(gtt/24)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*1.05,Math.sin(a2)*1.05);
      tg.rotation.x=-a2;bt.add(tg);
    }
    var mark1=bx(0.15,0.3,0.15,0xff4040,0.4,0.6);
    mark1.position.set(0.2,0.7,0);bt.add(mark1);
    bt.position.set(-blockLen/2-0.7,6.2,0);root.add(bt);sCam(bt);

    var bb=new THREE.Group();
    var gb=cy(1.4,0.35,28,0x8a95a3,0.9,0.3);gb.rotation.z=Math.PI/2;bb.add(gb);
    for(var gbt=0;gbt<28;gbt++){
      var tg2=bx(0.22,0.18,0.14,0x6a7685,0.9,0.3);
      var a3=(gbt/28)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.45,Math.sin(a3)*1.45);
      tg2.rotation.x=-a3;bb.add(tg2);
    }
    var mark2=bx(0.15,0.3,0.15,0xff4040,0.4,0.6);
    mark2.position.set(0.2,1.0,0);bb.add(mark2);
    bb.position.set(-blockLen/2-0.7,0.6,0);root.add(bb);

    var belt=makeBelt(5.6,0.55,0.15);
    belt.position.set(-blockLen/2-0.7,3.4,0);
    belt.rotation.z=Math.PI/2;
    root.add(belt);

    var cs=new THREE.Group();
    var ca=cy(0.25,blockLen+1,16,0xa8b4c0,0.95,0.2);
    ca.rotation.z=Math.PI/2;cs.add(ca);
    cs.position.y=6.4;root.add(cs);
    var camArr=[];
    for(var cc=0;cc<perRow*2;cc++){
      var cg2=new THREE.Group();
      var cd=cy(0.32,0.3,16,0x8a95a3,0.9,0.3);cd.rotation.z=Math.PI/2;cg2.add(cd);
      var nb=cy(0.13,0.3,10,0x6a7685,0.9,0.3);nb.rotation.z=Math.PI/2;nb.position.y=0.32;cg2.add(nb);
      var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/Math.max(1,perRow*2-1);
      cg2.position.set(cx2,0,0);cs.add(cg2);
      camArr.push({grp:cg2,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
    }
    sC(camArr);
  }

  /* ==================== РЯДНАЯ ЧЕТВЁРКА (дизель) ==================== */
  function buildDieselR4(root,cfg){
    var perRow=4,spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var pod=bx(blockLen+0.4,1.4,5.2,0x2a3340,0.7,0.5);pod.position.y=-0.7;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.2,1);
    var bk=bx(blockLen,5,5,0x3a3a3a,0.8,0.5);bk.position.y=3.4;root.add(bk);pB(bk);
    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.06,0.08,5.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }
    var hd=bx(blockLen+0.2,1.4,5.3,0x4a4a4a,0.85,0.4);hd.position.y=6.4;root.add(hd);pH(hd);
    var cv=bx(blockLen,0.8,5,0x2a2a2a,0.75,0.4);cv.position.y=7.5;root.add(cv);pC(cv);
    for(var b=0;b<5;b++){
      var bxx=-blockLen/2+0.5+b*(blockLen-1)/4;
      root.add(bolt(bxx,7.95,-2.4,0.06));
      root.add(bolt(bxx,7.95,2.4,0.06));
    }
    /* Впуск */
    var inMan=cy(0.32,blockLen*0.9,16,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,5.6,2.5);root.add(inMan);
    for(var ip=0;ip<4;ip++){
      var ipx=-totalWidth/2+spacing/2+ip*spacing;
      var pipe=cy(0.18,0.6,10,0x3a4654,0.85,0.4);
      pipe.rotation.x=Math.PI/2;pipe.position.set(ipx,5.6,2.85);root.add(pipe);
    }
    /* Выпуск */
    var exMan=cy(0.42,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.2,-2.5);root.add(exMan);
    /* Турбина */
    var turbo=new THREE.Group();
    var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,8,20),m(0x6a7685,0.9,0.3));
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.3,-0.3,-2.5);turbo.rotation.y=0.4;root.add(turbo);
    window._dciParts={turbo:turbo};
    /* ТНВД */
    var pump=bx(1.8,1.5,1.7,0x3a4654,0.85,0.4);
    pump.position.set(blockLen/2+0.5,7.5,-2.5);root.add(pump);
    var pg=cy(0.6,0.35,16,0x8a95a3,0.9,0.3);pg.rotation.z=Math.PI/2;
    pg.position.set(blockLen/2+0.5,7.5,-3.7);root.add(pg);
    /* Rail */
    var rail=cy(0.16,blockLen*0.85,14,0xc8d4e0,0.98,0.1);
    rail.rotation.z=Math.PI/2;rail.position.set(0,6.9,-1.5);root.add(rail);
    for(var t=0;t<perRow;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var tr=cy(0.045,0.9,6,0xc8d4e0,0.95,0.15);
      tr.position.set(tx,6.4,-0.5);tr.rotation.x=Math.PI/2.6;root.add(tr);
      var inj=cy(0.16,0.55,10,0x4a4d54,0.85,0.3);
      inj.position.set(tx,7.4,-0.5);root.add(inj);
    }
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.15,h:4.6,diesel:true,off:i*Math.PI});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
    makeBeltsAndCams(root,blockLen,totalWidth,perRow);
  }

  /* ==================== Д-240 ТРАКТОР ==================== */
  function buildDieselTractor(root,cfg){
    var perRow=4,spacing=2.5;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+2.0;
    var pod=bx(blockLen+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);pod.position.y=-1.0;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,3.0,1);
    var bk=bx(blockLen,5.5,6,0x3a3a3a,0.75,0.55);bk.position.y=3.7;root.add(bk);pB(bk);
    for(var rr=0;rr<10;rr++){
      var rb=bx(blockLen+0.06,0.10,6.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.3+rr*0.55;root.add(rb);pR(rb);
    }
    var hd=bx(blockLen+0.3,1.6,6.3,0x4a4a4a,0.8,0.45);hd.position.y=7.1;root.add(hd);pH(hd);
    var cv=bx(blockLen,0.9,6,0x2a2a2a,0.7,0.45);cv.position.y=8.3;root.add(cv);pC(cv);
    for(var b=0;b<6;b++){
      var bxx=-blockLen/2+0.5+b*(blockLen-1)/5;
      root.add(bolt(bxx,8.7,-2.9,0.08));
      root.add(bolt(bxx,8.7,2.9,0.08));
    }
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.35,h:5.0,diesel:true,off:i*Math.PI});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
    /* Бак */
    var tank=bx(blockLen*0.65,2.2,2.0,0x5a5a4a,0.6,0.6);
    tank.position.set(-blockLen/2-1.6,2.2,0);root.add(tank);
    /* ТНВД */
    var pump=bx(2.4,2.2,2.2,0x3a4654,0.8,0.5);
    pump.position.set(blockLen/2+0.8,7.8,2.6);root.add(pump);
    var pg=cy(0.75,0.45,16,0x8a95a3,0.85,0.4);
    pg.rotation.z=Math.PI/2;pg.position.set(blockLen/2+0.8,7.8,4.1);root.add(pg);
    for(var t=0;t<perRow;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var tr=cy(0.06,1.6,6,0xc8d4e0,0.9,0.2);
      tr.position.set(tx,8.4,1.7);tr.rotation.x=Math.PI/3;root.add(tr);
      var inj=cy(0.16,0.55,10,0x4a4d54,0.85,0.3);
      inj.position.set(tx,8.4,0.5);root.add(inj);
    }
    /* Воздушный фильтр */
    var af=cy(1.0,2.6,18,0x4a4a4a,0.6,0.6);
    af.rotation.z=Math.PI/2;af.position.set(-blockLen/2+1.5,10.8,0);root.add(af);
    var afC=cy(1.05,0.2,18,0x3a3a3a,0.7,0.5);
    afC.rotation.z=Math.PI/2;afC.position.set(-blockLen/2+1.5,12.2,0);root.add(afC);
    /* Выхлоп вверх */
    var ex=cy(0.38,7.5,14,0x4a4a4a,0.7,0.5);
    ex.position.set(blockLen/2-1.4,11.8,0);root.add(ex);
    var exC=cy(0.55,0.4,14,0x3a3a3a,0.7,0.5);
    exC.position.set(blockLen/2-1.4,15.7,0);root.add(exC);
    makeBeltsAndCams(root,blockLen,totalWidth,perRow);
  }

  /* ==================== ВАНКЕЛЬ ==================== */
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
    var Rr=2.0,ecc=0.4,depth=1.6,rotR=1.2,space=5.0;
    window._dvsWankelRotors=[];window._dvsWankelPins=[];window._dvsWankelFlashes=[];
    var axis=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,space+3,16),m(0xc8d4e0,0.95,0.2));
    axis.rotation.z=Math.PI/2;root.add(axis);
    for(var ri=0;ri<2;ri++){
      var rx=(ri-0.5)*space;
      var unit=new THREE.Group();unit.position.set(rx,0,0);
      var epiGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false,curveSegments:64});
      epiGeo.center();
      var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.92,roughness:0.2,transparent:true,opacity:0.32,side:THREE.DoubleSide}));
      unit.add(caseMesh);pB(caseMesh);
      var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.72,bevelEnabled:false});
      rotGeo.center();
      var rotorMesh=new THREE.Mesh(rotGeo,m(0xdde5ee,0.95,0.15));
      unit.add(rotorMesh);
      window._dvsWankelRotors.push({mesh:rotorMesh,ecc:ecc});
      root.add(unit);
    }
    var fw=new THREE.Group();
    var fwDisc=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.4,32),m(0x8a95a3,0.92,0.28));
    fwDisc.rotation.z=Math.PI/2;fw.add(fwDisc);
    fw.position.set(space+2.0,0,0);root.add(fw);sF(fw);
  }

  function buildDCI(root,cfg){ buildDieselR4(root,cfg); }

  /* ==================== V-ОБРАЗНЫЙ ДЕТАЛИЗИРОВАННЫЙ ==================== */
  function buildV(root,cfg){
    var totalN=cfg.n;
    var perRow=Math.floor(totalN/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+2.0;
    var V_ANGLE=(perRow>=6?Math.PI/3:Math.PI/3); /* 60° */
    var half=V_ANGLE/2;
    var bankDist=1.4;
    var cylH=4.4;
    var cylR=1.05;

    /* Поддон */
    var pod=bx(blockLen+0.4,1.4,7.0,0x2a2a2a,0.7,0.5);
    pod.position.y=-0.8;root.add(pod);

    /* Коленвал */
    makeCrankAndFly(root,blockLen,0.6,perRow,2.6,2);

    /* ДВА РЯДА БЛОКОВ */
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;

      /* Блок ряда */
      var bk=bx(blockLen,5.0,2.8,0x4a5566,0.85,0.4);
      bk.position.set(0,3.4,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);

      /* Рёбра */
      for(var rr=0;rr<8;rr++){
        var rb=bx(blockLen+0.05,0.07,2.85,0x1a1a1a,0.6,0.6);
        rb.position.set(0,1.3+rr*0.55,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }

      /* Головка */
      var hd=bx(blockLen+0.2,1.3,3.0,0x3a4756,0.85,0.35);
      hd.position.set(0,6.4,sign*(bankDist+1.0));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);

      /* Клапанная крышка */
      var cv=bx(blockLen,0.8,2.8,0x2a3340,0.75,0.4);
      cv.position.set(0,7.5,sign*(bankDist+1.3));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);

      /* Болты на крышке */
      for(var b=0;b<perRow+1;b++){
        var bxx=-blockLen/2+0.5+b*(blockLen-1)/perRow;
        var boltY=7.9;
        var boltZ=sign*(bankDist+1.9);
        /* Преобразуем позицию по наклону */
        var by2=boltY+(bankDist+1.9)*Math.sin(sign*half)*0.5;
        var bz2=boltZ*Math.cos(half)*0.9;
        root.add(bolt(bxx,7.95+sign*half*0.5, sign*(bankDist+1.9)-sign*0.6, 0.06));
      }

      /* Впускной коллектор (внешняя сторона) */
      var inMan=cy(0.32,blockLen*0.9,14,0x3a4654,0.85,0.4);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,5.9,sign*(bankDist+2.2));
      inMan.rotation.x=sign*half*0.5;
      root.add(inMan);

      /* Дроссельная заслонка (в начале коллектора) */
      var tb=cy(0.36,0.25,14,0x8a95a3,0.9,0.3);
      tb.rotation.z=Math.PI/2;
      tb.position.set(-blockLen/2-0.4,5.9,sign*(bankDist+2.2));
      root.add(tb);

      /* Патрубки к каждому цилиндру */
      for(var ip=0;ip<perRow;ip++){
        var ipx=-totalWidth/2+spacing/2+ip*spacing;
        var pipe=cy(0.16,0.5,10,0x3a4654,0.85,0.4);
        pipe.rotation.x=Math.PI/2;
        pipe.position.set(ipx,5.9,sign*(bankDist+2.6));
        pipe.rotation.x=sign*half;
        root.add(pipe);
      }

      /* Выпускной коллектор (внутренняя сторона, между рядами) */
      var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,-0.3,sign*0.4);
      root.add(exMan);

      /* Трубы выпуска от каждого цилиндра */
      for(var ep=0;ep<perRow;ep++){
        var epx=-totalWidth/2+spacing/2+ep*spacing;
        var exPipe=cy(0.20,1.0,10,0x4a3a2a,0.85,0.5);
        exPipe.position.set(epx,-0.3,sign*0.8);
        exPipe.rotation.x=sign*half;
        root.add(exPipe);
      }
    }

    /* Распредвалы на каждый ряд */
    var camArr=[];
    for(var cs=0;cs<2;cs++){
      var sign2=cs===0?-1:1;
      var csGrp=new THREE.Group();
      var ca=cy(0.25,blockLen+1,16,0xa8b4c0,0.95,0.2);
      ca.rotation.z=Math.PI/2;csGrp.add(ca);
      /* Кулачки */
      for(var cc=0;cc<perRow*2;cc++){
        var cg2=new THREE.Group();
        var cd=cy(0.32,0.3,16,0x8a95a3,0.9,0.3);cd.rotation.z=Math.PI/2;cg2.add(cd);
        var nb=cy(0.13,0.3,10,0x6a7685,0.9,0.3);nb.rotation.z=Math.PI/2;nb.position.y=0.32;cg2.add(nb);
        var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/Math.max(1,perRow*2-1);
        cg2.position.set(cx2,0,0);csGrp.add(cg2);
        camArr.push({grp:cg2,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
      }
      csGrp.position.set(0,6.8,sign2*(bankDist+0.8));
      csGrp.rotation.x=sign2*half;
      root.add(csGrp);sCam(csGrp);
    }
    sC(camArr);

    /* Поршни обоих рядов */
    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg3=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx2=-totalWidth/2+spacing/2+j*spacing;
        var off2=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a5=makeCylAss({
          x:xx2,y:1.1,z:sg3*bankDist,
          r:cylR,h:cylH,diesel:false,off:off2,rotX:sg3*half
        });
        root.add(a5.g);arr.push(a5);
      }
    }
    sA(arr);

    /* Ремень ГРМ + шкив */
    var beltGrp=new THREE.Group();
    var gt=cy(1.1,0.4,24,0x8a95a3,0.9,0.3);gt.rotation.z=Math.PI/2;beltGrp.add(gt);
    for(var gtt=0;gtt<24;gtt++){
      var tg=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a2=(gtt/24)*