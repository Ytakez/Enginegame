(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF, B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx;

  /* ============ КАЧЕСТВЕННЫЕ МАТЕРИАЛЫ ============ */
  function M(c,mt,rg,op,tr){
    var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.35:rg};
    if(op!==undefined){o.transparent=true;o.opacity=op;}
    if(tr)o.side=THREE.DoubleSide;
    return new THREE.MeshStandardMaterial(o);
  }
  var MAT={
    cast:  M(0x252a31,0.55,0.65),
    block: M(0x39414c,0.75,0.42),
    blockT:M(0x39414c,0.75,0.42,0.22,true),
    head:  M(0x4a525e,0.82,0.32),
    headT: M(0x4a525e,0.82,0.32,0.22,true),
    cover: M(0x1d2229,0.6,0.5),
    coverT:M(0x1d2229,0.6,0.5,0.18,true),
    rib:   M(0x181c22,0.65,0.6),
    alu:   M(0xa8b0ba,0.9,0.22),
    aluDark:M(0x6c757f,0.85,0.35),
    chrome:M(0xe4eaf0,1.0,0.06),
    piston:M(0xe0e8f0,0.95,0.08),
    ring:  M(0x2a2e33,0.5,0.7),
    rod:   M(0x8a95a2,0.92,0.2),
    copper:M(0xb07040,0.85,0.32),
    exhaust:M(0x7a5a3a,0.7,0.55),
    rubber:M(0x14171a,0.05,0.92),
    glass: M(0x9ec8ff,0.15,0.05,0.16,true),
    glassRed:M(0xff5566,0.3,0.15,0.35,true),
    glassBlue:M(0x66ccff,0.3,0.15,0.35,true),
    blue:  M(0x2d5fa8,0.7,0.38),
    red:   M(0xb03030,0.7,0.38),
    yellow:M(0xd8b840,0.7,0.38),
    bolt:  M(0xb8c0c8,0.95,0.2),
    belt:  M(0x15171a,0.3,0.85)
  };

  function cyl(r1,r2,h,seg,mat){return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||20),mat);}
  function box(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);}
  function torus(rad,tube,seg,tseg,mat){return new THREE.Mesh(new THREE.TorusGeometry(rad,tube,seg||8,tseg||20),mat);}
  function sph(r,mat){return new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);}
  function con(r1,r2,h,mat){return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,16),mat);}

  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sCam(x){if(R.setCam)R.setCam(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  var PY_MEAN=2.9, ROD_LEN=4.5;

  /* ============ ПОРШЕНЬ С КОЛЬЦАМИ И ПАЛЬЦЕМ ============ */
  function makePiston(r,h){
    var g=new THREE.Group();
    var body=cyl(r,r,h,24,MAT.piston);g.add(body);
    var crown=cyl(r*1.002,r*0.98,h*0.12,24,MAT.aluDark);
    crown.position.y=h*0.44;g.add(crown);
    for(var k=0;k<3;k++){
      var rg=torus(r*0.94,0.045,6,24,MAT.ring);
      rg.rotation.x=Math.PI/2;
      rg.position.y=h*0.15-k*h*0.14;g.add(rg);
    }
    var pin=cyl(r*0.16,r*0.16,r*1.3,12,MAT.chrome);
    pin.rotation.z=Math.PI/2;pin.position.y=-h*0.1;g.add(pin);
    return g;
  }

  /* ============ ШАТУН H-BEAM ============ */
  function makeRod(len){
    var g=new THREE.Group();
    var beamTop=box(0.16,len*0.85,0.26,MAT.rod);
    beamTop.position.y=len*0.05;g.add(beamTop);
    var beamMid=box(0.06,len*0.7,0.30,MAT.rod);
    beamMid.position.y=len*0.05;g.add(beamMid);
    var smallEnd=cyl(0.16,0.16,0.32,14,MAT.chrome);
    smallEnd.rotation.z=Math.PI/2;
    smallEnd.position.y=len/2;g.add(smallEnd);
    var bigEnd=torus(0.26,0.10,8,20,MAT.aluDark);
    bigEnd.rotation.y=Math.PI/2;
    bigEnd.position.y=-len/2;g.add(bigEnd);
    var cap=box(0.10,0.10,0.52,MAT.aluDark);
    cap.position.y=-len/2-0.26;g.add(cap);
    return g;
  }

  /* ============ СБОРКА ЦИЛИНДРА ============ */
  function makeCylAss(o){
    var g=new THREE.Group();
    g.position.set(o.x, o.y-PY_MEAN, o.z);
    // Гильза (прозрачная)
    var sleeve=cyl(o.r,o.r,o.h,24,MAT.glass);
    sleeve.position.y=o.h*0.1;g.add(sleeve);
    // Головка
    var head=cyl(o.r*1.05,o.r*1.05,o.h*0.2,24,MAT.headT);
    head.position.y=o.h*0.5;g.add(head);
    // Поршень
    var p=makePiston(o.r*0.9,o.r*1.1);
    p.position.y=0;g.add(p);
    // Шатун
    var rod=makeRod(ROD_LEN);
    rod.position.y=-ROD_LEN/2-0.2;g.add(rod);
    // Свеча/форсунка
    var ign;
    if(o.diesel){
      ign=cyl(o.r*0.10,o.r*0.10,o.r*0.7,10,MAT.chrome);
      ign.position.y=o.h*0.62;
      var nut=cyl(o.r*0.16,o.r*0.16,o.r*0.15,12,MAT.aluDark);
      nut.position.y=o.h*0.75;g.add(nut);
    }else{
      ign=cyl(o.r*0.09,o.r*0.09,o.r*0.8,10,MAT.chrome);
      ign.position.y=o.h*0.65;
      var tip=cyl(o.r*0.05,o.r*0.05,o.r*0.2,8,MAT.copper);
      tip.position.y=o.h*0.85;g.add(tip);
    }
    g.add(ign);
    // Клапаны (2 шт)
    var vv=[];
    for(var s=0;s<2;s++){
      var vg=new THREE.Group();
      var stem=cyl(o.r*0.05,o.r*0.05,o.h*0.5,8,s===0?MAT.chrome:MAT.aluDark);
      stem.position.y=o.h*0.55;vg.add(stem);
      var head2=cyl(o.r*0.20,o.r*0.14,0.08,14,s===0?MAT.alu:MAT.aluDark);
      head2.position.y=o.h*0.32;vg.add(head2);
      vg.position.set((s===0?-1:1)*o.r*0.42,0,0);
      g.add(vg);vv.push(vg);
    }
    return {g:g,p:p,rod:rod,vv:vv,off:o.off||0,h:o.h,r:o.r};
  }

  /* ============ КОЛЕНВАЛ С ПРОТИВОВЕСАМИ ============ */
  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=cyl(0.34,0.34,blockLen+1.2,20,MAT.alu);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    // Коренные шейки
    for(var mi=0;mi<=perRow;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=cyl(0.52,0.52,0.42,20,MAT.aluDark);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    // Шатунные шейки + противовесы
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var p1=new THREE.Group();
      var pin1=cyl(0.28,0.28,0.55,14,MAT.chrome);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*0.62,0);cg.add(p1);
      // Противовес напротив
      var cw=new THREE.Group();
      var cwBody=cyl(0.72,0.72,0.36,16,MAT.cast);
      cwBody.rotation.z=Math.PI/2;cw.add(cwBody);
      cwBody.scale.y=0.65;
      cw.position.set(cxx,-Math.sin(o1)*0.62,0);cg.add(cw);
    }
    root.add(cg);sCr(cg);
    // Маховик с зубьями
    var fw=new THREE.Group();
    var fwD=cyl(fwR,fwR,0.36,32,MAT.aluDark);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    var fwInner=cyl(fwR*0.55,fwR*0.55,0.38,24,MAT.cast);
    fwInner.rotation.z=Math.PI/2;fw.add(fwInner);
    for(var ft=0;ft<36;ft++){
      var th=box(0.36,0.18,0.16,MAT.aluDark);
      var a=(ft/36)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.05),Math.sin(a)*(fwR+0.05));
      th.rotation.x=-a;fw.add(th);
    }
    for(var hb=0;hb<6;hb++){
      var ha=(hb/6)*Math.PI*2;
      var hole=cyl(0.1,0.1,0.4,10,MAT.cast);
      hole.rotation.z=Math.PI/2;
      hole.position.set(0,Math.cos(ha)*fwR*0.7,Math.sin(ha)*fwR*0.7);
      fw.add(hole);
    }
    fw.position.set(blockLen/2+0.75,y,0);
    root.add(fw);sF(fw);
  }

  /* ============ БЛОК ЦИЛИНДРОВ ============ */
  function makeBlock(root,blockLen,blockH,blockD,blockY,diesel){
    var matBlock=diesel?MAT.cast:MAT.blockT;
    // Поддон
    var pan=box(blockLen+0.3,1.1,blockD+0.2,MAT.cast);
    pan.position.y=-1.0;root.add(pan);
    var panLip=box(blockLen+0.4,0.15,blockD+0.3,MAT.rib);
    panLip.position.y=-0.42;root.add(panLip);
    // Основной блок (прозрачный)
    var bk=box(blockLen,blockH,blockD,matBlock);
    bk.position.y=blockY;root.add(bk);pB(bk);
    // Рёбра
    for(var rr=0;rr<12;rr++){
      var rb=box(blockLen+0.06,0.055,blockD+0.06,MAT.rib);
      rb.position.y=blockY-blockH/2+0.35+rr*(blockH-0.7)/11;root.add(rb);pR(rb);
    }
    // Болты по углам
    var boltPos=[[-blockLen/2+0.25,blockY+blockH/2-0.2,-blockD/2+0.25],
                 [-blockLen/2+0.25,blockY+blockH/2-0.2, blockD/2-0.25],
                 [ blockLen/2-0.25,blockY+blockH/2-0.2,-blockD/2+0.25],
                 [ blockLen/2-0.25,blockY+blockH/2-0.2, blockD/2-0.25]];
    for(var bi=0;bi<4;bi++){
      var bolt=cyl(0.13,0.13,0.5,10,MAT.bolt);
      bolt.position.set(boltPos[bi][0],boltPos[bi][1],boltPos[bi][2]);
      root.add(bolt);
    }
    // Головка
    var headY=blockY+blockH/2+0.65;
    var hd=box(blockLen+0.15,1.4,blockD+0.25,MAT.headT);
    hd.position.y=headY;root.add(hd);pH(hd);
    // Крышка ГБЦ
    var covY=headY+0.95;
    var cv=box(blockLen-0.2,0.85,blockD-0.6,MAT.coverT);
    cv.position.y=covY;root.add(cv);pC(cv);
    // Крышка маслозаливной
    var oilCap=cyl(0.28,0.28,0.25,14,MAT.yellow);
    oilCap.position.set(blockLen/2-0.6,covY+0.55,0);root.add(oilCap);
    return {blockLen:blockLen,blockH:blockH,blockD:blockD,blockY:blockY,headY:headY,covY:covY};
  }

  /* ============ ВПУСКНОЙ КОЛЛЕКТОР С РАННЕРАМИ ============ */
  function makeIntakeManifold(root,blockLen,blockD,headY,n,spacing,diesel){
    var grp=new THREE.Group();
    var plenumD=0.7;
    var plenum=cyl(0.42,0.42,blockLen*0.92,18,MAT.alu);
    plenum.rotation.z=Math.PI/2;
    plenum.position.set(0,headY+0.95,blockD/2+0.6);
    grp.add(plenum);
    // Заглушка
    var cap=cyl(0.45,0.45,0.15,18,MAT.aluDark);
    cap.rotation.z=Math.PI/2;
    cap.position.set(blockLen*0.46,headY+0.95,blockD/2+0.6);
    grp.add(cap);
    // Раннеры к каждому цилиндру
    var tw=n*spacing;
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var runner=con(0.28,0.22,0.85,MAT.alu);
      runner.position.set(xx,headY+0.55,blockD/2+0.55);
      runner.rotation.x=Math.PI/6;grp.add(runner);
      var flange=box(0.5,0.15,0.3,MAT.aluDark);
      flange.position.set(xx,headY+0.18,blockD/2+0.32);grp.add(flange);
    }
    // Дроссель
    var tb=cyl(0.55,0.55,0.4,18,MAT.aluDark);
    tb.rotation.z=Math.PI/2;
    tb.position.set(-blockLen*0.5,headY+0.95,blockD/2+0.6);grp.add(tb);
    root.add(grp);
  }

  /* ============ ВЫПУСКНОЙ КОЛЛЕКТОР С РАННЕРАМИ ============ */
  function makeExhaustManifold(root,blockLen,blockD,n,spacing,turboSide){
    var grp=new THREE.Group();
    var tw=n*spacing;
    // Раннеры
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var runner=con(0.22,0.28,0.7,MAT.exhaust);
      runner.position.set(xx,-0.3,-blockD/2-0.45);
      runner.rotation.x=-Math.PI/6;grp.add(runner);
      var flange=box(0.5,0.15,0.28,MAT.exhaust);
      flange.position.set(xx,0.05,-blockD/2-0.28);grp.add(flange);
    }
    // Коллектор
    var header=cyl(0.4,0.4,blockLen*0.9,16,MAT.exhaust);
    header.rotation.z=Math.PI/2;
    header.position.set(0,-0.55,-blockD/2-0.8);grp.add(header);
    root.add(grp);
    return {headerY:-0.55,headerZ:-blockD/2-0.8};
  }

  /* ============ ТУРБИНА ============ */
  function makeTurbo(root,blockLen,blockD,headY){
    var grp=new THREE.Group();
    // Компрессор (холодная часть) — алюминий
    var compHousing=new THREE.Mesh(
      new THREE.CylinderGeometry(0.85,1.0,0.9,24,1),
      MAT.alu);
    compHousing.rotation.z=Math.PI/2;grp.add(compHousing);
    var compSnail=new THREE.Mesh(
      new THREE.TorusGeometry(0.95,0.32,10,24),
      MAT.alu);
    compSnail.rotation.y=Math.PI/2;
    compSnail.position.x=-0.2;grp.add(compSnail);
    // Турбина (горячая часть) — тёмная
    var turbHousing=new THREE.Mesh(
      new THREE.CylinderGeometry(0.7,0.85,0.8,20,1),
      MAT.cast);
    turbHousing.rotation.z=Math.PI/2;
    turbHousing.position.x=1.2;grp.add(turbHousing);
    var turbSnail=new THREE.Mesh(
      new THREE.TorusGeometry(0.78,0.28,10,20),
      MAT.cast);
    turbSnail.rotation.y=Math.PI/2;
    turbSnail.position.x=1.3;grp.add(turbSnail);
    // Ось
    var axis=cyl(0.12,0.12,3.0,10,MAT.chrome);
    axis.rotation.z=Math.PI/2;axis.position.x=0.5;grp.add(axis);
    // Патрубки
    var intakePipe=cyl(0.35,0.35,0.6,14,MAT.alu);
    intakePipe.position.set(-1.1,0,0);intakePipe.rotation.z=Math.PI/2;
    grp.add(intakePipe);
    var oilLine=cyl(0.1,0.1,1.2,8,MAT.copper);
    oilLine.position.set(0.5,0.9,0);grp.add(oilLine);
    // Вестгейт
    var wg=cyl(0.35,0.35,0.5,14,MAT.aluDark);
    wg.position.set(1.2,0.85,0.3);grp.add(wg);
    grp.position.set(blockLen/2+0.6,-0.3,-blockD/2-1.0);
    grp.scale.setScalar(0.9);
    root.add(grp);
    // Запись в массив для анимации
    if(!window._dciPartsArr)window._dciPartsArr=[];
    window._dciPartsArr.push({turbo:grp});
    // Интеркулер
    var ic=box(2.2,1.0,0.4,MAT.alu);
    ic.position.set(0,headY+1.8,-blockD/2-1.8);
    for(var f=0;f<10;f++){
      var fin=box(0.04,0.9,0.42,MAT.aluDark);
      fin.position.set(-1.0+f*0.22,headY+1.8,-blockD/2-1.8);
      root.add(fin);
    }
    root.add(ic);
  }

  /* ============ БАЗА РЯДНОГО ============ */
  function inlineBase(root,opt){
    var n=opt.n||4;
    var spacing=opt.spacing||2.2;
    var tw=n*spacing;
    var blockLen=tw+1.5;
    var blockD=opt.d||4.8;
    var blockH=opt.h||5;
    var blockY=opt.y||3.4;
    var diesel=!!opt.diesel;

    makeCrankAndFly(root,blockLen,0.6,n,opt.fwR||2.3);
    var B=makeBlock(root,blockLen,blockH,blockD,blockY,diesel);

    // Цилиндры
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylAss({x:xx,y:blockY,z:0,r:1.1,h:blockH+0.4,off:i*Math.PI,diesel:diesel});
      root.add(a.g);arr.push(a);
    }
    sA(arr);

    // Впуск / выпуск
    makeIntakeManifold(root,blockLen,blockD,B.headY,n,spacing,diesel);
    var ex=makeExhaustManifold(root,blockLen,blockD,n,spacing);
    if(diesel) makeTurbo(root,blockLen,blockD,B.headY);

    return Object.assign(B,{n:n,spacing:spacing,tw:tw});
  }

  /* ============ R4 / TDI / dCi ============ */
  function buildR4(root){inlineBase(root,{n:4});}
  function buildTDI(root){inlineBase(root,{n:4,diesel:true});}
  function buildDCi(root){inlineBase(root,{n:4,diesel:true});}
  function buildPassatB3(root){inlineBase(root,{n:4});}
  function buildBluebird(root){inlineBase(root,{n:4});}

  /* ============ SCOOTER ============ */
  function buildScooter(root){
    var B=inlineBase(root,{n:1,spacing:1.8,d:3.2,h:3.4,y:2.4,fwR:1.3});
    // Карбюратор
    var carb=box(0.75,0.75,0.75,MAT.aluDark);
    carb.position.set(0,B.headY+0.55,B.blockD/2+0.4);root.add(carb);
    var filter=cyl(0.55,0.55,0.35,16,MAT.rubber);
    filter.rotation.z=Math.PI/2;
    filter.position.set(0,B.headY+0.55,B.blockD/2+1.0);root.add(filter);
    var filterCap=cyl(0.5,0.5,0.1,16,MAT.alu);
    filterCap.rotation.z=Math.PI/2;
    filterCap.position.set(0,B.headY+0.55,B.blockD/2+1.25);root.add(filterCap);
    // CVT
    var cvt=cyl(1.0,1.0,0.35,24,MAT.aluDark);
    cvt.rotation.z=Math.PI/2;
    cvt.position.set(B.blockLen/2+1.0,0,-0.8);root.add(cvt);
    var cvtInner=cyl(0.5,0.5,0.4,20,MAT.alu);
    cvtInner.rotation.z=Math.PI/2;
    cvtInner.position.set(B.blockLen/2+1.0,0,-0.8);root.add(cvtInner);
    var belt=box(0.12,2.0,0.35,MAT.belt);
    belt.position.set(B.blockLen/2+0.55,-0.3,-0.8);root.add(belt);
    // Выхлоп
    var pipe=cyl(0.16,0.16,2.0,10,MAT.chrome);
    pipe.rotation.z=Math.PI/2;
    pipe.position.set(-B.blockLen/2-1.0,-0.3,0);root.add(pipe);
    var muffler=cyl(0.32,0.28,1.5,16,MAT.chrome);
    muffler.rotation.z=Math.PI/2;
    muffler.position.set(-B.blockLen/2-2.0,-0.3,0);root.add(muffler);
  }

  /* ============ I6 (2JZ) ============ */
  function buildI6(root){
    var n=6,spacing=2.0;
    var tw=n*spacing;
    var blockLen=tw+1.6;
    var blockD=4.6,blockH=5.2,blockY=3.6;

    makeCrankAndFly(root,blockLen,0.6,n,2.4);
    var B=makeBlock(root,blockLen,blockH,blockD,blockY,false);

    // Дополнительные болты
    for(var b=0;b<=n;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/n;
      var b1=cyl(0.07,0.07,0.15,8,MAT.bolt);
      b1.position.set(bx2,B.covY+0.6,-(blockD/2-0.7));root.add(b1);
      var b2=cyl(0.07,0.07,0.15,8,MAT.bolt);
      b2.position.set(bx2,B.covY+0.6,(blockD/2-0.7));root.add(b2);
    }

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylAss({x:xx,y:blockY,z:0,r:1.05,h:blockH+0.4,off:i*Math.PI});
      root.add(a.g);arr.push(a);
    }
    sA(arr);
    makeIntakeManifold(root,blockLen,blockD,B.headY,n,spacing,false);
    makeExhaustManifold(root,blockLen,blockD,n,spacing);

    // Твин-турбо как у 2JZ
    makeTurbo(root,blockLen,blockD,B.headY);
  }

  /* ============ V-ОБРАЗНЫЕ ============ */
  function buildVBase(root,totalN,half,bankDist,scale){
    var perRow=Math.floor(totalN/2);
    var spacing=2.0*scale;
    var tw=perRow*spacing;
    var blockLen=tw+2.0;
    var blockY=3.4;
    var blockH=5*scale;
    var blockD=bankDist*2+2.8*scale;

    makeCrankAndFly(root,blockLen,0.6,perRow,2.5*scale);

    // Поддон
    var pan=box(blockLen+0.4,1.3,blockD*1.3,MAT.cast);
    pan.position.y=-1.0;root.add(pan);

    // Два ряда цилиндров
    var arr=[];
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      // Блок
      var bk=box(blockLen,blockH,2.6*scale,MAT.blockT);
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);
      // Рёбра
      for(var rr=0;rr<9;rr++){
        var rb=box(blockLen+0.05,0.05,2.65*scale,MAT.rib);
        rb.position.set(0,blockY-blockH/2+0.4+rr*(blockH-0.8)/8,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }
      // Головка
      var headY=blockY+blockH/2+0.65;
      var hd=box(blockLen+0.15,1.35,2.8*scale,MAT.headT);
      hd.position.set(0,headY,sign*(bankDist+0.9*scale));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);
      // Крышка
      var cv=box(blockLen-0.2,0.8,2.5*scale,MAT.coverT);
      cv.position.set(0,headY+0.95,sign*(bankDist+1.1*scale));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);

      // Цилиндры
      for(var j=0;j<perRow;j++){
        var xx=-tw/2+spacing/2+j*spacing;
        var off=(s2=>s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI)(side);
        var a=makeCylAss({x:xx,y:blockY,z:sign*bankDist,r:0.98*scale,h:blockH+0.4,off:off});
        a.g.rotation.x=sign*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);

    // Впуск в развале + выпуск наружу
    for(var s=0;s<2;s++){
      var sg=s===0?-1:1;
      var inMan=cyl(0.4,0.4,blockLen*0.9,18,MAT.alu);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,blockY+blockH/2+2.2,sg*bankDist*0.35);
      root.add(inMan);
      // Раннеры к каждому цилиндру
      for(var j2=0;j2<perRow;j2++){
        var xx2=-tw/2+spacing/2+j2*spacing;
        var runner=con(0.26,0.20,1.2,MAT.alu);
        runner.position.set(xx2,blockY+blockH/2+1.4,sg*bankDist*0.7);
        runner.rotation.x=-sg*Math.PI/4;
        root.add(runner);
      }
      // Выпуск
      var exMan=cyl(0.42,0.42,blockLen*0.9,18,MAT.exhaust);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.4,sg*(bankDist+2.0*scale));
      root.add(exMan);
    }
  }
  function buildV6(root){buildVBase(root,6,Math.PI/6,1.6,1.0);}
  function buildV8(root){buildVBase(root,8,Math.PI/6,1.7,1.0);}
  function buildV12(root){buildVBase(root,12,Math.PI/6,1.9,1.0);}
  function buildV16(root){buildVBase(root,16,Math.PI/6,2.0,1.0);}
  function buildV22(root){buildVBase(root,22,Math.PI/4,2.3,1.0);}

  /* ============ BOXER (Subaru) ============ */
  function buildBoxer(root){
    var n=2,spacing=2.6;
    var tw=n*spacing;
    var blockLen=tw+2.0;
    var blockH=4.5,blockD=4.5,blockY=2.8;

    makeCrankAndFly(root,blockLen,0.6,n,2.5);
    var pan=box(blockLen+0.5,1.2,blockD+0.3,MAT.cast);
    pan.position.y=0.3;root.add(pan);

    var bk=box(blockLen,blockH,2.5,MAT.blockT);
    bk.position.y=blockY;root.add(bk);pB(bk);
    for(var rr=0;rr<7;rr++){
      var rb=box(blockLen+0.04,0.05,2.55,MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/6;root.add(rb);pR(rb);
    }

    var headY=blockY;
    var arr=[];
    for(var s=0;s<2;s++){
      var sign=s===0?-1:1;
      var hd=box(blockLen+0.2,2.8,1.3,MAT.headT);
      hd.position.set(0,headY,sign*(blockD/2+0.5));
      hd.rotation.x=sign*Math.PI/2;root.add(hd);pH(hd);
      var cv=box(blockLen-0.2,2.6,1.0,MAT.coverT);
      cv.position.set(0,hea