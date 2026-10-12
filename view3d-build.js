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
  /* СТИЛЬ "СТЕКЛО + МЕТАЛЛ" как на референсе */
  var MAT={
    glass:  M(0x9ecfff,0.1,0.05,0.22,true),   // прозрачный блок/цилиндры
    glassD: M(0x6aaeff,0.2,0.1,0.35,true),    // стенки цилиндров
    dark:   M(0x1a1d22,0.4,0.75),             // тёмные поршни
    darkB:  M(0x25292f,0.5,0.6),              // чуть светлее
    ring:   M(0xc8d8e8,0.9,0.15),             // блестящие кольца поршня
    rod:    M(0x8a95a2,0.92,0.15),            // шатун
    crank:  M(0x6a7580,0.95,0.12),            // коленвал
    crankJ: M(0x9aa5b0,1.0,0.1),              // шейки
    cw:     M(0x4a535e,0.7,0.4),              // противовесы
    fly:    M(0x707a85,0.9,0.2),              // маховик
    metal:  M(0xb0b8c0,0.95,0.2),             // общая сталь
    bolt:   M(0xd0d8e0,1.0,0.15),
    rail:   M(0x3a424a,0.85,0.3),             // верхняя рельса (распредвал)
    oil:    M(0xb08050,0.5,0.55),             // поддон (золотистый)
    yellow: M(0xd8b840,0.6,0.4)
  };
  function cyl(r1,r2,h,s,mat){return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s||22),mat);}
  function box(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);}
  function tor(rad,tube,s,ts,mat){return new THREE.Mesh(new THREE.TorusGeometry(rad,tube,s||8,ts||24),mat);}
  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  /* ПОРШЕНЬ — как на референсе: чёрный толстый диск с 3 блестящими кольцами */
  function makePiston(r,h){
    var g=new THREE.Group();
    // Основное тело поршня
    g.add(cyl(r,r,h,26,MAT.dark));
    // Юбка (низ поршня)
    var skirt=cyl(r*0.98,r*0.9,h*0.35,26,MAT.darkB);
    skirt.position.y=-h*0.3;g.add(skirt);
    // 3 блестящих кольца
    for(var k=0;k<3;k++){
      var rg=tor(r*0.99,0.045,6,26,MAT.ring);
      rg.rotation.x=Math.PI/2;
      rg.position.y=h*0.32-k*h*0.13;
      g.add(rg);
    }
    // Плоский верх (тень)
    var top=cyl(r*0.99,r*0.99,0.04,26,MAT.darkB);
    top.position.y=h*0.5;g.add(top);
    return g;
  }

  /* ШАТУН — тонкий, как на референсе */
  function makeRod(len){
    var g=new THREE.Group();
    // Тело шатуна
    g.add(box(0.11,len*0.9,0.18,MAT.rod));
    // Верхняя головка
    var sm=cyl(0.14,0.14,0.26,14,MAT.metal);
    sm.rotation.z=Math.PI/2;sm.position.y=len/2;g.add(sm);
    // Нижняя головка
    var bg=tor(0.19,0.075,10,20,MAT.metal);
    bg.rotation.y=Math.PI/2;bg.position.y=-len/2;g.add(bg);
    return g;
  }

  /* ЦИЛИНДР — прозрачная гильза, поршень внутри, шатун уходит вниз */
  function makeCyl(cfg){
    var g=new THREE.Group();
    g.position.set(cfg.x,0,cfg.z);
    // Прозрачная гильза
    var sleeve=new THREE.Mesh(
      new THREE.CylinderGeometry(cfg.r,cfg.r,cfg.cylH,24,1,true),
      MAT.glassD);
    sleeve.position.y=cfg.cylY;
    g.add(sleeve);pB(sleeve);
    // Верхнее кольцо цилиндра
    var topRing=tor(cfg.r*1.02,0.06,8,24,MAT.metal);
    topRing.rotation.x=Math.PI/2;
    topRing.position.y=cfg.cylY+cfg.cylH/2;
    g.add(topRing);
    // Нижнее кольцо
    var botRing=tor(cfg.r*1.02,0.06,8,24,MAT.metal);
    botRing.rotation.x=Math.PI/2;
    botRing.position.y=cfg.cylY-cfg.cylH/2;
    g.add(botRing);
    // Поршень
    var piston=makePiston(cfg.r*0.92,cfg.pH);
    g.add(piston);
    // Шатун
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

  /* КОЛЕНВАЛ — с противовесами и шейками, как на референсе */
  function makeCrank(root,length,crankY,n,crankR,fwR){
    var cg=new THREE.Group();cg.position.y=crankY;
    // Главная ось
    var ax=cyl(0.22,0.22,length+1.4,24,MAT.crank);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    // Коренные шейки (широкие диски)
    for(var mi=0;mi<=n;mi++){
      var mx=-length/2+0.5+mi*(length-1)/n;
      var mn=cyl(0.42,0.42,0.32,22,MAT.crankJ);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    // Шатунные шейки + противовесы
    for(var ci=0;ci<n;ci++){
      var cxx=-length/2+0.85+ci*(length-1.7)/Math.max(1,n-1);
      var o1=ci*Math.PI*2/n;
      var pinG=new THREE.Group();
      var pin=cyl(0.2,0.2,0.42,18,MAT.crankJ);
      pin.rotation.z=Math.PI/2;pinG.add(pin);
      pinG.position.set(cxx,Math.sin(o1)*crankR,0);
      cg.add(pinG);
      // Противовес — плоский, широкий
      var cwG=new THREE.Group();
      var cwBody=cyl(0.52,0.52,0.28,18,MAT.cw);
      cwBody.rotation.z=Math.PI/2;
      cwBody.scale.set(1,1,0.7);
      cwG.add(cwBody);
      cwG.position.set(cxx,-Math.sin(o1)*crankR,0);
      cg.add(cwG);
    }
    root.add(cg);sCr(cg);

    // Маховик — зубчатый
    var fw=new THREE.Group();
    var fwD=cyl(fwR,fwR,0.28,32,MAT.fly);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    var fwI=cyl(fwR*0.45,fwR*0.45,0.32,22,MAT.crank);
    fwI.rotation.z=Math.PI/2;fw.add(fwI);
    for(var ft=0;ft<40;ft++){
      var th=box(0.3,0.11,0.11,MAT.crank);
      var a=(ft/40)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.04),Math.sin(a)*(fwR+0.04));
      th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(length/2+fwR+0.15,crankY,0);
    root.add(fw);sF(fw);
  }

  /* ПРОЗРАЧНЫЙ БЛОК (контур) */
  function makeGlassBox(root,length,blockH,blockD,blockY){
    var bk=box(length,blockH,blockD,MAT.glass);
    bk.position.y=blockY;root.add(bk);pB(bk);
    // Верхняя рельса (голова)
    var rail=box(length+0.2,0.5,blockD+0.15,MAT.rail);
    rail.position.y=blockY+blockH/2+0.35;root.add(rail);pH(rail);
    // 4 болта
    for(var b=0;b<4;b++){
      var bolt=cyl(0.07,0.07,0.5,10,MAT.bolt);
      bolt.position.set(
        (b<2?-1:1)*(length/2+0.02),
        blockY+blockH/2+0.4,
        (b%2===0?-1:1)*(blockD/2+0.02)
      );
      root.add(bolt);
    }
    // Поддон — золотистый (как на референсе)
    var pan=box(length+0.2,0.6,blockD+0.15,MAT.oil);
    pan.position.y=blockY-blockH/2-0.5;root.add(pan);
    return {blockY:blockY,blockH:blockH,blockD:blockD,length:length};
  }