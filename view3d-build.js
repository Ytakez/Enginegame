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

  /* ==================== МАТЕРИАЛЫ ==================== */
  var MAT = {
    blockGlass: new THREE.MeshStandardMaterial({
      color:0x6a7a8a, metalness:0.6, roughness:0.2,
      transparent:true, opacity:0.35, side:THREE.DoubleSide,
      depthWrite:false
    }),
    head:  new THREE.MeshStandardMaterial({color:0x8894a2, metalness:0.9, roughness:0.25}),
    cover: new THREE.MeshStandardMaterial({color:0x2a3038, metalness:0.7, roughness:0.5}),
    pan:   new THREE.MeshStandardMaterial({color:0x1e242c, metalness:0.7, roughness:0.5}),
    rib:   new THREE.MeshStandardMaterial({color:0x1a1f26, metalness:0.6, roughness:0.6}),
    piston:new THREE.MeshStandardMaterial({color:0xe8eef4, metalness:0.95, roughness:0.15, emissive:0x445566, emissiveIntensity:0.3}),
    rod:   new THREE.MeshStandardMaterial({color:0xa8b4c0, metalness:0.9, roughness:0.3}),
    crank: new THREE.MeshStandardMaterial({color:0xb8c4d0, metalness:0.95, roughness:0.2}),
    chrome:new THREE.MeshStandardMaterial({color:0xd8e0e8, metalness:0.98, roughness:0.1}),
    intake:new THREE.MeshStandardMaterial({color:0x3a4654, metalness:0.85, roughness:0.4}),
    exhaust:new THREE.MeshStandardMaterial({color:0x4a3a2a, metalness:0.85, roughness:0.5}),
    turbo: new THREE.MeshStandardMaterial({color:0x4a5566, metalness:0.85, roughness:0.4}),
    belt:  new THREE.MeshStandardMaterial({color:0x0a0a0a, metalness:0.3, roughness:0.85}),
    dieselBlock: new THREE.MeshStandardMaterial({
      color:0x5a6270, metalness:0.6, roughness:0.3,
      transparent:true, opacity:0.35, side:THREE.DoubleSide,
      depthWrite:false
    }),
    dieselHead: new THREE.MeshStandardMaterial({color:0x4a4a4a, metalness:0.85, roughness:0.35})
  };

  function bolt(x,y,z,r){
    var b=new THREE.Mesh(new THREE.CylinderGeometry(r||0.06,r*2,6),MAT.chrome);
    b.rotation.z=Math.PI/2;
    b.position.set(x,y,z);
    return b;
  }

  /* ==================== ПОРШЕНЬ (без оболочки) ==================== */
  function makePiston(x,y,z,r,h,off){
    var g=new THREE.Group();
    g.position.set(x,y,z);

    /* Сам поршень */
    var p=new THREE.Group();
    p.position.y=h*0.45;
    var disk=new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*0.9,24),MAT.piston);
    p.add(disk);
    /* Кольца */
    for(var k=0;k<3;k++){
      var ring=new THREE.Mesh(new THREE.CylinderGeometry(r+0.03,r+0.03,0.06,24),MAT.rib);
      ring.position.y=r*0.3-k*r*0.22;
      p.add(ring);
    }
    /* Палец */
    var pin=new THREE.Mesh(new THREE.CylinderGeometry(r*0.14,r*0.14,r*1.1,12),MAT.rib);
    pin.rotation.z=Math.PI/2;
    p.add(pin);
    g.add(p);

    /* Шатун (уходит вниз к коленвалу) */
    var rod=new THREE.Mesh(new THREE.BoxGeometry(r*0.28,h*0.75,r*0.28),MAT.rod);
    rod.position.y=-h*0.15;
    g.add(rod);

    return {g:g,p:p,rod:rod,x:x,y:y,z:z,h:h,r:r,off:off||0};
  }

  /* ==================== КОЛЕНВАЛ + МАХОВИК ==================== */
  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;

    /* Главная ось */
    var ax=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,blockLen+1,24),MAT.crank);
    ax.rotation.z=Math.PI/2;cg.add(ax);

    /* Коренные шейки */
    for(var mi=0;mi<perRow+1;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.4,20),MAT.crank);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }

    /* Шатунные шейки со смещением (для анимации) */
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var pin=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.5,16),MAT.chrome);
      pin.rotation.z=Math.PI/2;
      pin.position.set(cxx,Math.sin(o1)*0.55,0);
      cg.add(pin);
    }

    root.add(cg);sCr(cg);

    /* Маховик */
    var fw=new THREE.Group();
    var fwD=new THREE.Mesh(new THREE.CylinderGeometry(fwR,fwR,0.4,36),MAT.crank);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<32;ft++){
      var th=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.28,0.16),MAT.rib);
      var a=(ft/32)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.12),Math.sin(a)*(fwR+0.12));
      th.rotation.x=-a;
      fw.add(th);
    }
    var fwHub=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.5,16),MAT.rib);
    fwHub.rotation.z=Math.PI/2;fw.add(fwHub);
    fw.position.set(blockLen/2+0.7,y,0);
    root.add(fw);sF(fw);
  }

  /* ==================== ГРМ + ШКИВЫ ==================== */
  function makeBeltsAndCams(root,blockLen,totalWidth,perRow,yTop,yBot){
    /* Верхний шкив (распредвал) */
    var bt=new THREE.Group();
    bt.add(new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.4,24),MAT.crank));
    for(var gtt=0;gtt<20;gtt++){
      var tg=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.18,0.14),MAT.rib);
      var a2=(gtt/20)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.95,Math.sin(a2)*0.95);
      tg.rotation.x=-a2;bt.add(tg);
    }
    bt.rotation.z=Math.PI/2;
    bt.position.set(-blockLen/2-0.7,yTop,0);
    root.add(bt);sCam(bt);

    /* Нижний шкив (коленвал) */
    var bb=new THREE.Group();
    bb.add(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,0.4,28),MAT.crank));
    for(var gbt=0;gbt<24;gbt++){
      var tg2=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.18,0.14),MAT.rib);
      var a3=(gbt/24)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.25,Math.sin(a3)*1.25);
      tg2.rotation.x=-a3;bb.add(tg2);
    }
    bb.rotation.z=Math.PI/2;
    bb.position.set(-blockLen/2-0.7,yBot,0);
    root.add(bb);

    /* Ремень — вертикальная полоса */
    var belt=new THREE.Mesh(
      new THREE.BoxGeometry(0.18,Math.abs(yTop-yBot)+1.0,0.65),
      MAT.belt
    );
    belt.position.set(-blockLen/2-0.7,(yTop+yBot)/2,0);
    root.add(belt);

    /* Распредвал внутри головки */
    var cam=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,blockLen+0.5,18),MAT.crank);
    cam.rotation.z=Math.PI/2;
    cam.position.set(0,yTop-0.3,0);
    root.add(cam);
    sCam(cam);

    /* Кулачки распредвала */
    var camArr=[];
    for(var cc=0;cc<perRow*2;cc++){
      var cg2=new THREE.Group();
      var cd=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,0.3,18),MAT.head);
      cd.rotation.z=Math.PI/2;cg2.add(cd);
      var nb=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.32,10),MAT.rib);
      nb.rotation.z=Math.PI/2;nb.position.y=0.34;cg2.add(nb);
      var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/Math.max(1,perRow*2-1);
      cg2.position.set(cx2,0,0);
      cam.add(cg2);
      camArr.push({grp:cg2,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
    }
    sC(camArr);
  }

  /* ==================== R4 БЕНЗИН ==================== */
  function buildInline(root,cfg){
    var perRow=cfg.n||4;
    var spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=5.0;
    var blockD=5.0;
    var blockBaseY=0.8;

    /* Поддон */
    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.3,1.3,blockD+0.2),MAT.pan);
    pod.position.y=-0.1;root.add(pod);

    /* Коленвал */
    makeCrankAndFly(root,blockLen,0.6,perRow,2.0);

    /* Блок — полупрозрачный */
    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockGlass);
    bk.position.y=blockBaseY+blockH/2;
    root.add(bk);pB(bk);

    /* Рёбра */
    for(var rr=0;rr<8;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
      rb.position.y=blockBaseY+0.4+rr*(blockH-0.8)/7;
      root.add(rb);pR(rb);
    }

    /* Головка (сплошная) */
    var headY=blockBaseY+blockH+0.7;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.3,blockD+0.15),MAT.head);
    hd.position.y=headY;root.add(hd);pH(hd);

    /* Крышка */
    var covY=headY+1.0;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.7,blockD-0.4),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    /* Болты на крышке */
    for(var b=0;b<perRow+1;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/perRow;
      root.add(bolt(bx2,covY+0.45,-(blockD/2-0.6),0.06));
      root.add(bolt(bx2,covY+0.45,(blockD/2-0.6),0.06));
    }

    /* Впускной/выпускной коллекторы */
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,blockLen*0.9,16),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.3,blockD/2+0.4);
    root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,blockLen*0.9,16),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockBaseY-0.2,-blockD/2-0.4);
    root.add(exMan);

    /* Патрубки впуска */
    for(var ip=0;ip<perRow;ip++){
      var ipx=-totalWidth/2+spacing/2+ip*spacing;
      var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.5,10),MAT.intake);
      pipe.position.set(ipx,headY+0.3,blockD/2+0.7);
      pipe.rotation.x=Math.PI/2;
      root.add(pipe);
    }

    /* Поршни */
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var pistonCenterY=blockBaseY+blockH*0.4;
      var a4=makePiston(xx,pistonCenterY,0,1.05,blockH*0.6,i*Math.PI);
      root.add(a4.g);
      arr.push(a4);
    }
    sA(arr);

    /* Свечи сверху головки */
    for(var sp=0;sp<perRow;sp++){
      var spx=-totalWidth/2+spacing/2+sp*spacing;
      var plug=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.5,10),MAT.chrome);
      plug.position.set(spx,headY+0.4,-0.6);
      root.add(plug);
    }

    /* ГРМ */
    makeBeltsAndCams(root,blockLen,totalWidth,perRow,headY-0.5,0.6);
  }

  /* ==================== V-ДВИГАТЕЛЬ ==================== */
  function buildV(root,cfg){
    var totalN=cfg.n;
    var perRow=Math.floor(totalN/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var half=Math.PI/6;
    var bankDist=1.8;
    var blockH=4.8;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.3,7.0),MAT.pan);
    pod.position.y=-0.2;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,2.4);

    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;

      /* Блок ряда */
      var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,2.8),MAT.blockGlass);
      bk.position.set(0,blockH/2+0.4,sign*bankDist);
      bk.rotation.x=sign*half;
      root.add(bk);pB(bk);

      /* Рёбра */
      for(var rr=0;rr<7;rr++){
        var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,2.85),MAT.rib);
        rb.position.set(0,0.5+rr*0.6,sign*bankDist);
        rb.rotation.x=sign*half;
        root.add(rb);pR(rb);
      }

      /* Головка */
      var headY=blockH+0.7;
      var headZ=sign*(bankDist+1.5);
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.2,3.0),MAT.head);
      hd.position.set(0,headY,headZ);
      hd.rotation.x=sign*half;
      root.add(hd);pH(hd);

      /* Крышка */
      var coverY=headY+1.0;
      var coverZ=sign*(bankDist+1.7);
      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.65,2.8),MAT.cover);
      cv.position.set(0,coverY,coverZ);
      cv.rotation.x=sign*half;
      root.add(cv);pC(cv);

      /* Впускной коллектор */
      var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,blockLen*0.9,14),MAT.intake);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,headY+0.4,sign*(bankDist+2.6));
      root.add(inMan);

      /* Выпускной коллектор */
      var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,blockLen*0.9,14),MAT.exhaust);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.5,sign*0.5);
      root.add(exMan);
    }

    /* Поршни */
    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makePiston(xx,blockH*0.5,sg*bankDist,0.95,blockH*0.6,off);
        a.g.rotation.x=sg*half;
        root.add(a.g);
        arr.push(a);
      }
    }
    sA(arr);

    makeBeltsAndCams(root,blockLen,totalWidth,perRow,blockH+0.5,0.6);
  }

  /* ==================== ДИЗЕЛЬ R4 (TDI / dCi) ==================== */
  function buildDieselR4(root,cfg){
    var perRow=4;
    var spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=5.0;
    var blockD=5.0;
    var blockBaseY=0.8;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.4,blockD+0.2),MAT.pan);
    pod.position.y=-0.1;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,2.0);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.dieselBlock);
    bk.position.y=blockBaseY+blockH/2;
    root.add(bk);pB(bk);

    for(var rr=0;rr<8;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
      rb.position.y=blockBaseY+0.4+rr*(blockH-0.8)/7;
      root.add(rb);pR(rb);
    }

    var headY=blockBaseY+blockH+0.7;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.3,blockD+0.15),MAT.dieselHead);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+1.0;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.7,blockD-0.4),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    /* Впуск/выпуск */
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,blockLen*0.9,16),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.3,blockD/2+0.4);
    root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,blockLen*0.9,16),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockBaseY-0.2,-blockD/2-0.4);
    root.add(exMan);

    /* Турбина */
    var turbo=new THREE.Group();
    var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.85,0.7,24),MAT.turbo);
    tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,10,24),MAT.turbo);
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.4,blockBaseY-0.3,-blockD/2-0.4);
    root.add(turbo);
    window._dciParts={turbo:turbo};

    /* ТНВД */
    var pump=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.5,1.7),MAT.turbo);
    pump.position.set(blockLen/2+0.5,covY+0.3,-blockD/2-0.4);root.add(pump);

    /* Rail */
    var rail=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,blockLen*0.85,16),MAT.chrome);
    rail.rotation.z=Math.PI/2;
    rail.position.set(0,headY+0.6,-blockD/2+0.2);
    root.add(rail);

    /* Форсунки */
    for(var t=0;t<perRow;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var inj=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.6,10),MAT.rib);
      inj.position.set(tx,headY+0.5,-0.6);
      root.add(inj);
    }

    /* Поршни */
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockBaseY+blockH*0.4,0,1.1,blockH*0.6,i*Math.PI);
      root.add(a4.g);
      arr.push(a4);
    }
    sA(arr);

    makeBeltsAndCams(root,blockLen,totalWidth,perRow,headY-0.5,0.6);
  }

  /* ==================== ТРАКТОР Д-240 ==================== */
  function buildDieselTractor(root,cfg){
    var perRow=4;
    var spacing=2.5;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+2.0;
    var blockH=5.5;
    var blockD=6.0;
    var blockBaseY=0.9;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.5,1.8,blockD+0.3),MAT.pan);
    pod.position.y=-0.3;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,2.8);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.dieselBlock);
    bk.position.y=blockBaseY+blockH/2;
    root.add(bk);pB(bk);

    for(var rr=0;rr<9;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.06,0.08,blockD+0.06),MAT.rib);
      rb.position.y=blockBaseY+0.5+rr*(blockH-0.9)/8;
      root.add(rb);pR(rb);
    }

    var headY=blockBaseY+blockH+0.8;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.3,1.6,blockD+0.3),MAT.dieselHead);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+1.2;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.9,blockD-0.4),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    /* Топливный бак */
    var tank=new THREE.Mesh(new THREE.BoxGeometry(blockLen*0.65,2.2,2.0),MAT.turbo);
    tank.position.set(-blockLen/2-1.7,2.5,0);root.add(tank);

    /* ТНВД */
    var pump=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.2,2.2),MAT.turbo);
    pump.position.set(blockLen/2+0.9,covY+0.5,blockD/2-0.3);root.add(pump);

    /* Воздушный фильтр */
    var af=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,2.6,20),MAT.turbo);
    af.rotation.z=Math.PI/2;
    af.position.set(-blockLen/2+1.5,covY+2.5,0);root.add(af);

    /* Выхлопная труба вверх */
    var ex=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,7.5,16),MAT.turbo);
    ex.position.set(blockLen/2-1.4,covY+3.5,0);root.add(ex);
    var exC=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.4,16),MAT.rib);
    exC.position.set(blockLen/2-1.4,covY+7.3,0);root.add(exC);

    /* Поршни */
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockBaseY+blockH*0.4,0,1.3,blockH*0.6,i*Math.PI);
      root.add(a4.g);
      arr.push(a4);
    }
    sA(arr);

    makeBeltsAndCams(root,blockLen,totalWidth,perRow,headY-0.6,0.6);
  }

  /* ==================== SHAHED MD-550 (ОППОЗИТНЫЙ FLAT-4) ==================== */
  function buildShahed(root,cfg){
    var perRow=2;         /* 2 цилиндра в каждом ряду */
    var spacing=2.4;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.6;
    var blockH=3.2;       /* низкий оппозитный блок */
    var blockD=7.5;       /* широкий — оппозитный */
    var blockBaseY=0.6;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.0,blockD+0.3),MAT.pan);
    pod.position.y=-0.3;root.add(pod);

    makeCrankAndFly(root,blockLen,0.5,perRow,1.6);

    /* Блок — плоский, широкий */
    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockGlass);
    bk.position.y=blockBaseY+blockH/2;
    root.add(bk);pB(bk);

    for(var rr=0;rr<4;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
      rb.position.y=blockBaseY+0.3+rr*(blockH-0.6)/3;
      root.add(rb);pR(rb);
    }

    /* Две головки по бокам (слева и справа) */
    var headY=blockBaseY+blockH/2;
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.1,1.1,1.6),MAT.head);
      hd.position.set(0,headY,sign*(blockD/2+0.8));
      root.add(hd);pH(hd);

      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.6,1.4),MAT.cover);
      cv.position.set(0,headY+0.8,sign*(blockD/2+0.9));
      root.add(cv);pC(cv);
    }

    /* Цилиндры — по 2 поршня с каждой стороны */
    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var zz=sg*(blockD/2-1.2);
        var off=(s2===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=makePiston(xx,headY,zz,0.9,blockH*0.7,off);
        a.g.rotation.x=sg*Math.PI/2;
        root.add(a.g);
        arr.push(a);
      }
    