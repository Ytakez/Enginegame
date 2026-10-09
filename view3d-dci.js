(function(){
"use strict";
var W=window.DVS_3D_DCI=window.DVS_3D_DCI||{};

function safeCall(name,arg){
  var ref=window.DVS_3D_REF;
  if(ref&&typeof ref[name]==='function')ref[name](arg);
}

W.build=function(root,cfg){
  var cy=window.DVS_3D_BUILD.cy;
  var bx=window.DVS_3D_BUILD.bx;
  var m=window.DVS_3D_BUILD.m;

  /* ============ РЯДНАЯ ЧЕТВЁРКА — БЛОК ============ */
  var blockLen=4.2, blockW=1.6, blockH=1.5;

  var block=bx(blockLen,blockH,blockW,0x2a2d33,0.75,0.55);
  root.add(block);
  safeCall('pushBlock',block);

  /* Рёбра жёсткости */
  for(var i=0;i<5;i++){
    var rib=bx(0.06,blockH*0.95,blockW+0.04,0x1e2126,0.85,0.55);
    rib.position.set(-blockLen/2+0.4+i*(blockLen-0.8)/4,0,0);
    root.add(rib);
    safeCall('pushRib',rib);
  }

  /* ============ ГОЛОВКА БЛОКА ============ */
  var head=bx(blockLen,0.6,blockW*0.95,0x3a3d44,0.7,0.5);
  head.position.y=blockH/2+0.3;
  root.add(head);
  safeCall('pushHead',head);

  /* Клапанная крышка */
  var cover=bx(blockLen*0.95,0.35,blockW*0.85,0x1a1d22,0.6,0.6);
  cover.position.y=blockH/2+0.75;
  root.add(cover);
  safeCall('pushCover',cover);

  /* ============ 4 ФОРСУНКИ COMMON RAIL ============ */
  for(var c=0;c<4;c++){
    var cx=-blockLen/2+0.55+c*(blockLen-1.1)/3;
    var inj=cy(0.11,0.5,10,0x8a8f96,0.9,0.3);
    inj.position.set(cx,blockH/2+0.55,0);
    root.add(inj);
    var conn=bx(0.18,0.12,0.14,0x3a3a3a,0.5,0.7);
    conn.position.set(cx,blockH/2+0.85,0);
    root.add(conn);
  }

  /* ============ COMMON RAIL — ТОПЛИВНАЯ РАМПА ============ */
  var rail=cy(0.14,blockLen*0.85,12,0xb8bdc4,0.95,0.15);
  rail.rotation.z=Math.PI/2;
  rail.position.set(0,blockH/2+0.15,blockW/2+0.35);
  root.add(rail);

  /* Трубки от рампы к форсункам */
  for(var r=0;r<4;r++){
    var rx=-blockLen/2+0.55+r*(blockLen-1.1)/3;
    var line=cy(0.035,0.5,6,0xb8bdc4,0.9,0.2);
    line.position.set(rx,blockH/2+0.4,blockW/2+0.2);
    line.rotation.x=Math.PI/3;
    root.add(line);
  }

  /* ТНВД спереди */
  var pump=cy(0.22,0.55,12,0x4a4d54,0.85,0.4);
  pump.rotation.z=Math.PI/2;
  pump.position.set(-blockLen/2-0.25,0.2,blockW/2+0.35);
  root.add(pump);

  /* ============ ВПУСКНОЙ КОЛЛЕКТОР ============ */
  var intake=bx(blockLen*0.9,0.35,0.35,0x3a4654,0.8,0.4);
  intake.position.set(0,blockH/2+0.2,-blockW/2-0.3);
  root.add(intake);

  /* ============ ВЫПУСКНОЙ КОЛЛЕКТОР ============ */
  var exhaust=bx(blockLen*0.9,0.3,0.3,0x5a4a3a,0.85,0.5);
  exhaust.position.set(0,-blockH/2+0.35,-blockW/2-0.35);
  root.add(exhaust);

  /* ============ ТУРБИНА ============ */
  var turbo=new THREE.Group();
  var cold=cy(0.4,0.5,14,0x8a8f96,0.9,0.3);
  cold.rotation.x=Math.PI/2;
  cold.position.set(0,0,-0.3);
  turbo.add(cold);
  var hot=cy(0.35,0.4,14,0x4a3a2a,0.85,0.5);
  hot.rotation.x=Math.PI/2;
  hot.position.set(0,0,0.3);
  turbo.add(hot);
  var snail=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.12,8,16),m(0x8a8f96,0.9,0.3));
  snail.rotation.y=Math.PI/2;
  turbo.add(snail);
  turbo.position.set(-blockLen/2-0.9,-blockH/2+0.3,-blockW/2+0.2);
  turbo.rotation.y=Math.PI/4;
  root.add(turbo);
  window._dciParts=window._dciParts||{};
  window._dciParts.turbo=turbo;

  /* ============ ИНТЕРКУЛЕР — патрубок ============ */
  var pipe=cy(0.18,blockLen*0.7,10,0x3a3a3a,0.6,0.5);
  pipe.rotation.z=Math.PI/2;
  pipe.position.set(0,blockH/2+0.5,-blockW/2-0.75);
  root.add(pipe);

  /* ============ РЕМЕНЬ ГРМ ============ */
  var cover2=bx(0.25,blockH+0.9,blockW+0.2,0x1a1d22,0.7,0.5);
  cover2.position.set(-blockLen/2-0.35,0.15,0);
  root.add(cover2);
  safeCall('pushCover',cover2);

  var gear1=cy(0.55,0.15,20,0x6a6f78,0.9,0.3);
  gear1.rotation.z=Math.PI/2;
  gear1.position.set(-blockLen/2-0.5,0.3,0);
  root.add(gear1);

  /* ============ МАСЛЯНЫЙ ПОДДОН ============ */
  var pan=bx(blockLen*0.95,0.6,blockW*0.85,0x3a3d44,0.7,0.5);
  pan.position.y=-blockH/2-0.45;
  root.add(pan);

  var drain=cy(0.08,0.15,8,0x1a1d22,0.9,0.3);
  drain.position.set(blockLen/2-0.4,-blockH/2-0.75,0);
  root.add(drain);

  /* ============ МАХОВИК ============ */
  var fw=new THREE.Group();
  var fwDisc=cy(1.5,0.3,28,0x6a6f78,0.9,0.3);
  fwDisc.rotation.z=Math.PI/2;
  fw.add(fwDisc);
  for(var t=0;t<32;t++){
    var tooth=bx(0.2,0.14,0.22,0x4a4d54,0.85,0.4);
    var ta=(t/32)*Math.PI*2;
    tooth.position.set(0,Math.cos(ta)*1.58,Math.sin(ta)*1.58);
    tooth.rotation.x=ta;
    fw.add(tooth);
  }
  fw.position.set(blockLen/2+0.35,0,0);
  root.add(fw);
  safeCall('setFly',fw);
  window._dciParts=window._dciParts||{};
  window._dciParts.fw=fw;

  /* ============ ОПОРА ДВИГАТЕЛЯ ============ */
  var mount=bx(0.3,0.5,0.5,0x1a1d22,0.5,0.7);
  mount.position.set(-blockLen/2-0.3,-blockH/2-0.3,blockW/2+0.2);
  root.add(mount);

  /* ============ ПОДДОН ДЛЯ ВСЕГО МОТОРА ============ */
  var base=bx(blockLen+3,0.4,blockW+3,0x2a3340,0.7,0.5);
  base.position.y=-blockH/2-1.0;
  root.add(base);

  /* Коленвал для анимации */
  var crank=cy(0.25,blockLen,16,0x8a8f96,0.95,0.2);
  crank.rotation.z=Math.PI/2;
  root.add(crank);
  window._dciParts.crank=crank;
  safeCall('setCrank',crank);

  /* Крепление коленвала на поддон */
  var crankGrp=new THREE.Group();
  crankGrp.add(crank);
  root.add(crankGrp);
};

W.update=function(){};
})();