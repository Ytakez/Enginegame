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

  window._dvsAnimated={belts:[],glows:[],flashes:[]};
  var A=window._dvsAnimated;

  /* ==================== МАТЕРИАЛЫ ==================== */
  var MAT={
    block: new THREE.MeshStandardMaterial({color:0x4a5566,metalness:0.85,roughness:0.4}),
    blockDiesel: new THREE.MeshStandardMaterial({color:0x3a3a3a,metalness:0.8,roughness:0.5}),
    head: new THREE.MeshStandardMaterial({color:0x5a6a7a,metalness:0.85,roughness:0.35}),
    headDiesel: new THREE.MeshStandardMaterial({color:0x4a4a4a,metalness:0.8,roughness:0.45}),
    cover: new THREE.MeshStandardMaterial({color:0x2a3340,metalness:0.7,roughness:0.5}),
    pan: new THREE.MeshStandardMaterial({color:0x2a2a2a,metalness:0.7,roughness:0.5}),
    rib: new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.6,roughness:0.6}),
    piston: new THREE.MeshStandardMaterial({color:0xd8e0e8,metalness:0.95,roughness:0.15}),
    rod: new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.3}),
    crank: new THREE.MeshStandardMaterial({color:0xa8b4c0,metalness:0.95,roughness:0.2}),
    chrome: new THREE.MeshStandardMaterial({color:0xc8d4e0,metalness:0.98,roughness:0.1}),
    intake: new THREE.MeshStandardMaterial({color:0x3a4654,metalness:0.85,roughness:0.4}),
    exhaust: new THREE.MeshStandardMaterial({color:0x4a3a2a,metalness:0.85,roughness:0.5}),
    red: new THREE.MeshStandardMaterial({color:0xff4040,metalness:0.5,roughness:0.6}),
    glowD: new THREE.MeshStandardMaterial({color:0x2a2a2a,metalness:0.7,roughness:0.5}),
    glowCap: new THREE.MeshStandardMaterial({color:0x8a6a3a,metalness:0.6,roughness:0.5}),
    ceramic: new THREE.MeshStandardMaterial({color:0xe8e4dc,metalness:0.2,roughness:0.5}),
    turbo: new THREE.MeshStandardMaterial({color:0x4a5566,metalness:0.85,roughness:0.4})
  };

  function bolt(x,y,z,r){
    var b=new THREE.Mesh(new THREE.CylinderGeometry(r||0.06,r*2,6),MAT.chrome);
    b.rotation.z=Math.PI/2;
    b.position.set(x,y,z);
    return b;
  }

  /* ==================== ОДИН ПОРШЕНЬ (торчит сверху блока) ==================== */
  function makePiston(x,y,z,r,h,off,diesel){
    var g=new THREE.Group();
    g.position.set(x,y,z);

    /* Сам поршень — таблетка */
    var p=new THREE.Group();
    p.position.y=h*0.5;
    var disk=new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*0.9,20),MAT.piston);
    p.add(disk);
    for(var k=0;k<3;k++){
      var ring=new THREE.Mesh(new THREE.CylinderGeometry(r+0.02,r+0.02,0.06,20),MAT.rib);
      ring.position.y=r*0.3-k*r*0.2;p.add(ring);
    }
    var pin=new THREE.Mesh(new THREE.CylinderGeometry(r*0.15,r*0.15,r*1.1,10),MAT.rib);
    pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);

    /* Шатун — уходит вниз в блок */
    var rod=new THREE.Mesh(new THREE.BoxGeometry(r*0.28,h*0.6,r*0.28),MAT.rod);
    rod.position.y=-h*0.1;
    g.add(rod);

    /* Свеча сверху */
    var plug=new THREE.Group();
    if(diesel){
      plug.add(new THREE.Mesh(new THREE.CylinderGeometry(r*0.16,r*0.16,r*0.5,10),MAT.glowD));
      var cap=new THREE.Mesh(new THREE.CylinderGeometry(r*0.1,r*0.1,r*0.2,8),MAT.glowCap);
      cap.position.y=r*0.35;plug.add(cap);
    } else {
      plug.add(new THREE.Mesh(new THREE.CylinderGeometry(r*0.13,r*0.13,r*0.5,10),MAT.ceramic));
    }
    plug.position.y=h*0.95;
    g.add(plug);

    /* Свечение свечи */
    var glow=new THREE.Mesh(
      new THREE.SphereGeometry(r*0.22,10,10),
      new THREE.MeshBasicMaterial({color:diesel?0xff5500:0x66ccff,transparent:true,opacity:0,blending:THREE.AdditiveBlending}));
    glow.position.y=h*0.75;g.add(glow);
    var glowLight=new THREE.PointLight(diesel?0xff5500:0x66ccff,0,2.5);
    glowLight.position.y=h*0.75;g.add(glowLight);
    A.glows.push({light:glowLight,mesh:glow});

    /* Вспышка над поршнем */
    var flash=new THREE.Mesh(
      new THREE.SphereGeometry(r*0.8,12,12),
      new THREE.MeshBasicMaterial({color:0xffaa30,transparent:true,opacity:0,blending:THREE.AdditiveBlending}));
    flash.position.y=h*0.6;g.add(flash);
    var flashLight=new THREE.PointLight(0xffaa30,0,3.5);
    flashLight.position.y=h*0.6;g.add(flashLight);
    A.flashes.push({mesh:flash,light:flashLight,off:off||0});

    return {g:g,p:p,rod:rod,x:x,y:y,z:z,h:h,r:r,off:off||0};
  }

  /* ==================== КОЛЕНВАЛ + МАХОВИК ==================== */
  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,blockLen+1,20),MAT.crank);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<perRow+1;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=new THREE.Mesh(new THREE.CylinderGeometry(0.48,0.48,0.35,16),MAT.crank);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var pin=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.45,12),MAT.chrome);
      pin.rotation.z=Math.PI/2;
      pin.position.set(cxx,Math.sin(o1)*0.5,0);
      cg.add(pin);
      var mark=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.14,0.14),MAT.red);
      mark.position.set(cxx,Math.sin(o1)*0.5+0.25,0);cg.add(mark);
    }
    root.add(cg);sCr(cg);

    var fw=new THREE.Group();
    var fwD=new THREE.Mesh(new THREE.CylinderGeometry(fwR,fwR,0.35,32),MAT.crank);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.25,0.12),MAT.rib);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
      th.rotation.x=-a;fw.add(th);
    }
    var fwMark=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.45,0.25),MAT.red);
    fwMark.position.set(0.2,fwR*0.55,0);fw.add(fwMark);
    fw.position.set(blockLen/2+0.7,y,0);root.add(fw);sF(fw);
  }

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
    tex.needsUpdate=true;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
    tex.repeat.set(len*0.8,1);
    var mat=new THREE.MeshStandardMaterial({map:tex,color:0x1a1a1a,metalness:0.3,roughness:0.85});
    var belt=new THREE.Mesh(new THREE.BoxGeometry(len,depth,width),mat);
    A.belts.push({tex:tex});
    return belt;
  }

  /* ==================== ШКИВЫ + РЕМЕНЬ ГРМ ==================== */
  function makeTimingBelt(root,blockLen,yTop,yBot){
    /* Верхний шкив */
    var bt=new THREE.Group();
    bt.add(new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.85,0.3,24),MAT.crank));
    for(var gtt=0;gtt<24;gtt++){
      var tg=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.15,0.12),MAT.rib);
      var a2=(gtt/24)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.9,Math.sin(a2)*0.9);
      tg.rotation.x=-a2;bt.add(tg);
    }
    var m1=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.25,0.14),MAT.red);
    m1.position.set(0.15,0.6,0);bt.add(m1);
    bt.rotation.z=Math.PI/2;
    bt.position.set(-blockLen/2-0.6,yTop,0);
    root.add(bt);sCam(bt);

    /* Нижний шкив */
    var bb=new THREE.Group();
    bb.add(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,0.3,28),MAT.crank));
    for(var gbt=0;gbt<28;gbt++){
      var tg2=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.15,0.12),MAT.rib);
      var a3=(gbt/28)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.25,Math.sin(a3)*1.25);
      tg2.rotation.x=-a3;bb.add(tg2);
    }
    var m2=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.25,0.14),MAT.red);
    m2.position.set(0.15,0.85,0);bb.add(m2);
    bb.rotation.z=Math.PI/2;
    bb.position.set(-blockLen/2-0.6,yBot,0);
    root.add(bb);

    /* Ремень между ними — вертикальный */
    var beltLen=Math.abs(yTop-yBot)+1.2;
    var belt=makeBelt(beltLen,0.5,0.14);
    belt.position.set(-blockLen/2-0.6,(yTop+yBot)/2,0);
    root.add(belt);
  }

  /* ==================== РЯДНЫЙ ДВИГАТЕЛЬ (R4 / Ди́зель / Трактор) ==================== */
  function buildInline(root,cfg,style){
    /* style: 'petrol' | 'diesel' | 'tractor' */
    var perRow=cfg.n||4;
    var spacing=style==='tractor'?2.5:2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=style==='tractor'?5.5:5.0;
    var blockD=style==='tractor'?6.0:5.0;
    var pistonR=style==='tractor'?1.3:1.1;
    var pistonH=blockH+0.6;

    var isDiesel=style==='diesel'||style==='tractor';
    var blockMat=isDiesel?MAT.blockDiesel:MAT.block;
    var headMat=isDiesel?MAT.headDiesel:MAT.head;

    /* Поддон */
    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.3,1.2,blockD+0.2),MAT.pan);
    pod.position.y=-0.7;root.add(pod);

    /* Коленвал + маховик */
    makeCrankAndFly(root,blockLen,0.6,perRow,style==='tractor'?3.0:2.2);

    /* Блок — сплошной */
    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),blockMat);
    bk.position.y=blockH/2-0.4;
    root.add(bk);pB(bk);

    /* Рёбра */
    var ribCount=style==='tractor'?10:8;
    for(var rr=0;rr<ribCount;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
      rb.position.y=0.3+rr*(blockH-0.6)/ribCount;
      root.add(rb);pR(rb);
    }

    /* Головка — сверху блока */
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.2,blockD+0.2),headMat);
    hd.position.y=blockH-0.4+0.6;
    root.add(hd);pH(hd);

    /* Клапанная крышка */
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.7,blockD-0.2),MAT.cover);
    cv.position.y=blockH-0.4+1.6;
    root.add(cv);pC(cv);

    /* Болты на крышке */
    for(var b=0;b<perRow+1;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/perRow;
      root.add(bolt(bx2,blockH+1.15,-(blockD/2-0.3),0.06));
      root.add(bolt(bx2,blockH+1.15,(blockD/2-0.3),0.06));
    }

    /* Впускной и выпускной коллекторы */
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,blockLen*0.9,14),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,blockH+0.2,blockD/2+0.3);
    root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,-0.2,-blockD/2-0.3);
    root.add(exMan);

    /* Патрубки впуска */
    for(var ip=0;ip<perRow;ip++){
      var ipx=-totalWidth/2+spacing/2+ip*spacing;
      var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.5,10),MAT.intake);
      pipe.position.set(ipx,blockH+0.2,blockD/2+0.6);
      pipe.rotation.x=Math.PI/2;
      root.add(pipe);
    }

    /* Поршни — торчат сверху из блока */
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var yBase=blockH-0.4; /* верхняя грань блока */
      var a=makePiston(xx, yBase-1.0, 0, pistonR, pistonH, i*Math.PI, isDiesel);
      root.add(a.g);arr.push(a);
    }
    sA(arr);

    /* Ремень ГРМ */
    makeTimingBelt(root,blockLen,blockH-0.4+1.0,0.6);

    /* Доп. оборудование для дизеля */
    if(style==='diesel'||style==='tractor'){
      /* ТНВД */
      var pump=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.4,1.6),MAT.intake);
      pump.position.set(blockLen/2+0.5,blockH+0.5,-blockD/2-0.5);
      root.add(pump);
      var pg=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.3,16),MAT.crank);
      pg.rotation.z=Math.PI/2;
      pg.position.set(blockLen/2+1.3,blockH+0.5,-blockD/2-0.5);
      root.add(pg);

      /* Rail — топливная рампа сверху */
      var rail=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,blockLen*0.85,14),MAT.chrome);
      rail.rotation.z=Math.PI/2;
      rail.position.set(0,blockH+1.0,blockD/2-0.2);
      root.add(rail);

      /* Форсунки сверху */
      for(var t=0;t<perRow;t++){
        var tx=-totalWidth/2+spacing/2+t*spacing;
        var inj=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.5,10),MAT.glowD);
        inj.position.set(tx,blockH+1.4,blockD/2-0.3);
        root.add(inj);
      }
    }

    /* Турбина для дизеля (не для трактора) */
    if(style==='diesel'){
      var turbo=new THREE.Group();
      var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.6,20),MAT.turbo);
      tb.rotation.z=Math.PI/2;turbo.add(tb);
      var snail=new THREE.Mesh(new THREE.TorusGeometry(0.65,0.14,8,20),MAT.turbo);
      snail.rotation.y=Math.PI/2;turbo.add(snail);
      turbo.position.set(blockLen/2+0.5,-0.4,-blockD/2-0.4);
      root.add(turbo);
      window._dciParts={turbo:turbo};
    }

    /* Тракторные детали */
    if(style==='tractor'){
      /* Топливный бак */
      var tank=new THREE.Mesh(new THREE.BoxGeometry(blockLen*0.6,1.8,1.8),new THREE.MeshStandardMaterial({color:0x5a5a4a,metalness:0.6,roughness:0.6}));
      tank.position.set(-blockLen/2-1.5,blockH-1.5,0);
      root.add(tank);

      /* Воздушный фильтр сверху */
      var af=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,2.4,18),MAT.turbo);
      af.rotation.z=Math.PI/2;
      af.position.set(-blockLen/2+1.5,blockH+2.4,0);
      root.add(af);

      /* Выхлопная труба вверх */
      var ex=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,6.5,14),MAT.turbo);
      ex.position.set(blockLen/2-1.2,blockH+4.0,0);
      root.add(ex);
      var exC=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.35,14),MAT.rib);
      exC.position.set(blockLen/2-1.2,blockH+7.3,0);
      root.add(exC);
    }
  }

  /* ==================== V-ДВИГАТЕЛЬ (V6 / V12 / V22) ==================== */
  function buildV(root,cfg){
    var totalN=cfg.n;
    var perRow=Math.floor(totalN/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.6;
    var blockH=4.5;
    var blockD=3.2;
    var half=Math.PI/6; /* 30° — V-угол 60° */
    var bankDist=1.6;

    /* Поддон */
    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.2,7.0),MAT.pan);
    pod.position.y=-0.9;root.add(pod);

    /* Коленвал */
    makeCrankAndFly(root,blockLen,0.5,perRow,2.6);

    /* Два ряда блоков — зеркально */
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;

      /* Блок ряда */
      var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.block);
      bk.position.set(0,blockH/2-0.2,sign*bankDist);
      bk.rotation.x=sign*half;
      root.add(bk);pB(bk);

      /* Рёбра */
      for(var rr=0;rr<7;rr++){
        var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
        rb.position.set(0,0.4+rr*0.6,sign*bankDist);
        rb.rotation.x=sign*half;
        root.add(rb);pR(rb);
      }

      /* Головка */
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.1,blockD+0.2),MAT.head);
      var headY=blockH-0.2+0.55;
      var headZ=sign*(bankDist+1.6);
      hd.position.set(0,headY,headZ);
      hd.rotation.x=sign*half;
      root.add(hd);pH(hd);

      /* Клапанная крышка */
      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.65,blockD-0.3),MAT.cover);
      var coverY=headY+1.0;
      var coverZ=sign*(bankDist+1.9);
      cv.position.set(0,coverY,coverZ);
      cv.rotation.x=sign*half;
      root.add(cv);pC(cv);

      /* Болты */
      for(var b=0;b<perRow+1;b++){
        var bx2=-blockLen/2+0.5+b*(blockLen-1)/perRow;
        root.add(bolt(bx2,coverY+0.55,coverZ-0.5,0.055));
        root.add(bolt(bx2,coverY+0.55,coverZ+0.5,0.055));
      }

      /* Впускной коллектор — снаружи */
      var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,blockLen*0.9,14),MAT.intake);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,blockH+0.3,sign*(bankDist+2.4));
      root.add(inMan);

      /* Выпускной — внутри, между рядами */
      var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen*0.9,14),MAT.exhaust);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.2,sign*0.5);
      root.add(exMan);

      /* Патрубки впуска */
      for(var ip=0;ip<perRow;ip++){
        var ipx=-totalWidth/2+spacing/2+ip*spacing;
        var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.55,10),MAT.intake);
        pipe.position.set(ipx,blockH+0.3,sign*(bankDist+2.7));
        pipe.rotation.x=Math.PI/2;
        root.add(pipe);
      }
    }

    /* Поршни обоих рядов */
    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx2=-totalWidth/2+spacing/2+j*spacing;
        var off2=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makePiston(xx2,blockH*0.3,sg*bankDist,1.0,blockH+0.4,off2,false);
        a.g.rotation.x=sg*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);

    /* Ремень ГРМ */
    makeTimingBelt(root,blockLen,blockH+0.8,0.6);
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

    var axis=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,space+3,16),MAT.crank);
    axis.rotation.z=Math.PI/2;root.add(axis);

    for(var ri=0;ri<2;ri++){
      var rx=(ri-0.5)*space;
      var unit=new THREE.Group();unit.position.set(rx,0,0);
      var epiGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false,curveSegments:64});
      epiGeo.center();
      var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({
        color:0x8894a2,metalness:0.9,roughness:0.2,transparent:true,opacity:0.28,side:THREE.DoubleSide}));
      unit.add(caseMesh);pB(caseMesh);
      var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.72,bevelEnabled:false});
      rotGeo.center();
      var rotorMesh=new THREE.Mesh(rotGeo,MAT.piston);
      unit.add(rotorMesh);
      window._dvsWankelRotors.push({mesh:rotorMesh,ecc:ecc});
      root.add(unit);
    }

    var fw=new THREE.Group();
    fw.add(new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.35,32),MAT.crank));
    fw.position.set(space+2.0,0,0);root.add(fw);sF(fw);
  }

  /* ==================== ГЛАВНЫЙ REBUILD ==================== */
  window.DVS_3D_REBUILD=function(){
    var scene=R.getScene();
    if(!scene){console.warn('no scene');return;}
    var cfg=R.getCfg(S.engineType)||{n:4,v:false};
    window._dvsWankelTickActive=false;
    A.belts=[];A.glows=[];A.flashes=[];
    var old=R.getRoot();
    if(old){
      scene.remove(old);
      try{
        old.traverse(function(ch){
          if(ch.geometry)tr