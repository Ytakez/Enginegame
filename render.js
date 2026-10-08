(function(){
"use strict";
var S = window.S;
if (!S) return;

var ecv, ectx, gcv, gctx;
var MAXR = 10500;

function init(){
  ecv = document.getElementById('engineCv');
  if (ecv) ectx = ecv.getContext('2d');
  gcv = document.getElementById('gaugeCv');
  if (gcv) gctx = gcv.getContext('2d');
}

function rr(c,x,y,w,h,r){
  c.beginPath(); c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();
}

/* ===== ВИНТЫ / БОЛТЫ ===== */
function bolt(c, x, y, r, broken){
  var g = c.createRadialGradient(x-r*0.4, y-r*0.4, 1, x, y, r);
  if (broken){ g.addColorStop(0,'#a08080'); g.addColorStop(1,'#3a2020'); }
  else { g.addColorStop(0,'#c8d4e0'); g.addColorStop(.6,'#8a95a3'); g.addColorStop(1,'#3a4654'); }
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = '#1a232e'; c.lineWidth = 0.8; c.stroke();
  c.strokeStyle = broken ? '#5a3030' : '#2a3542'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x-r*0.6, y); c.lineTo(x+r*0.6, y); c.stroke();
}

/* ===== МЕТАЛЛИЧЕСКИЙ ГРАДИЕНТ ===== */
function metalGrad(c, x, y, w, h, broken){
  var g = c.createLinearGradient(x, y, x, y+h);
  if (broken){
    g.addColorStop(0,'#4a2a2a'); g.addColorStop(.35,'#8a5a5a');
    g.addColorStop(.5,'#a06a6a'); g.addColorStop(.7,'#6a4a4a'); g.addColorStop(1,'#2a1a1a');
  } else {
    g.addColorStop(0,'#2b3746'); g.addColorStop(.18,'#5a6878');
    g.addColorStop(.42,'#7a8797'); g.addColorStop(.55,'#5a6674');
    g.addColorStop(.78,'#3a4654'); g.addColorStop(1,'#1d2530');
  }
  return g;
}

/* ===== КЛАПАН С ПРУЖИНОЙ ===== */
function drawValveReal(c, x, springTopY, valveTopY, lift, color, broken){
  // Стержень
  c.strokeStyle = broken ? '#7a5a5a' : '#a8b4c0';
  c.lineWidth = 3;
  c.beginPath(); c.moveTo(x, springTopY); c.lineTo(x, valveTopY + lift); c.stroke();
  // Пружина (спираль)
  c.strokeStyle = broken ? '#5a4040' : '#5a6878';
  c.lineWidth = 1.2;
  var springs = 5, sh = (valveTopY - springTopY) / springs;
  for (var i=0; i<springs; i++){
    var y = springTopY + i*sh;
    c.beginPath();
    c.arc(x, y + sh/2, 4, 0, Math.PI, i%2===0);
    c.stroke();
  }
  // Тарелка клапана
  var ty = valveTopY + lift;
  c.fillStyle = broken ? '#8a4a4a' : color;
  c.beginPath();
  c.moveTo(x-8, ty); c.lineTo(x+8, ty);
  c.lineTo(x+4, ty+5); c.lineTo(x-4, ty+5);
  c.closePath(); c.fill();
  c.strokeStyle = '#1a232e'; c.lineWidth = 0.8; c.stroke();
}

/* ===== ОДИН ЦИЛИНДР ===== */
function drawCylinderReal(c, cx, crankY, topY, botY, halfW, phase, CR, ROD, dir, isBroken, firing, throttle, num, camY){
  var cycPos = ((phase % (Math.PI*4)) + Math.PI*4) % (Math.PI*4);
  var stroke = Math.floor(cycPos / Math.PI);
  var s = Math.sin(phase), co = Math.cos(phase);
  var sq = ROD*ROD - CR*CR*s*s;
  if (sq < 0) sq = 0;
  var dist = CR*co + Math.sqrt(sq);
  var pinY = crankY + dir * dist;
  var cpX = cx + CR * s;
  var cpY = crankY - CR * co;

  /* ===== ГИЛЬЗА ===== */
  var bg = c.createLinearGradient(cx-halfW, 0, cx+halfW, 0);
  bg.addColorStop(0,'#05080c');
  bg.addColorStop(.15,'#0a0f15');
  bg.addColorStop(.5, isBroken ? '#1a0e0e' : '#0e141c');
  bg.addColorStop(.85,'#0a0f15');
  bg.addColorStop(1,'#05080c');
  c.fillStyle = bg;
  c.fillRect(cx-halfW, topY, halfW*2, botY-topY);
  c.strokeStyle = isBroken ? '#5a3030' : '#2a3a4a';
  c.lineWidth = 2;
  c.strokeRect(cx-halfW, topY, halfW*2, botY-topY);

  /* ===== ПОРШЕНЬ ===== */
  var pGrad = c.createLinearGradient(cx-halfW+2,0,cx+halfW-2,0);
  if (isBroken){
    pGrad.addColorStop(0,'#4a3838'); pGrad.addColorStop(.5,'#8a6a6a'); pGrad.addColorStop(1,'#3a2828');
  } else {
    pGrad.addColorStop(0,'#4a5566'); pGrad.addColorStop(.22,'#c3ceda');
    pGrad.addColorStop(.42,'#e8eff6'); pGrad.addColorStop(.6,'#8b98a7');
    pGrad.addColorStop(.85,'#4c5866'); pGrad.addColorStop(1,'#2a333f');
  }
  c.fillStyle = pGrad;
  var pTop = dir < 0 ? pinY - 24 : pinY;
  rr(c, cx-halfW+3, pTop, (halfW-3)*2, 24, 3); c.fill();
  c.strokeStyle = '#1a232e'; c.lineWidth = 1.2; c.stroke();
  // Кольца (2 компрессионных + маслосъёмное)
  c.strokeStyle = isBroken ? '#5a3030' : '#1a252f'; c.lineWidth = 1.8;
  for (var k=0;k<3;k++){
    c.beginPath();
    c.moveTo(cx-halfW+5, pTop + 5 + k*5);
    c.lineTo(cx+halfW-5, pTop + 5 + k*5);
    c.stroke();
  }

  /* ===== ДИСК / ПРОТИВОВЕС ===== */
  var diskR = Math.min(halfW * 0.55, CR * 1.3);
  if (diskR < 6) diskR = 6;
  var cg = c.createRadialGradient(cx-diskR*0.4, crankY-diskR*0.4, 1, cx, crankY, diskR);
  if (isBroken){ cg.addColorStop(0,'#8a6a6a'); cg.addColorStop(.7,'#5a4040'); cg.addColorStop(1,'#1a0a0a'); }
  else { cg.addColorStop(0,'#a8b4c0'); cg.addColorStop(.5,'#6a7685'); cg.addColorStop(1,'#2a3340'); }
  c.fillStyle = cg;
  c.beginPath(); c.arc(cx, crankY, diskR, 0, 7); c.fill();
  c.strokeStyle='#0a0f15'; c.lineWidth = 1.5; c.stroke();

  /* ===== ШАТУН ===== */
  // Нижняя крышка шатуна (большая)
  c.strokeStyle = '#0a1018'; c.lineWidth = 11; c.lineCap='round';
  c.beginPath(); c.moveTo(cx, pinY);
  if (isBroken) c.quadraticCurveTo((cx+cpX)/2+6,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();
  // Основная сталь
  c.strokeStyle = isBroken?'#7a5a5a':'#8894a2'; c.lineWidth = 8;
  c.beginPath(); c.moveTo(cx, pinY);
  if (isBroken) c.quadraticCurveTo((cx+cpX)/2+6,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();
  // Блик сверху
  if (!isBroken){
    c.strokeStyle = 'rgba(220,230,240,0.5)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx-2, pinY-2); c.lineTo(cpX-2, cpY-2); c.stroke();
  }

  /* ===== ПОРШНЕВОЙ ПАЛЕЦ ===== */
  c.fillStyle='#0a0f15';
  c.beginPath(); c.arc(cx, pinY, 4.5, 0, 7); c.fill();
  c.fillStyle = isBroken ? '#7a5a5a' : '#4a5566';
  c.beginPath(); c.arc(cx, pinY, 3, 0, 7); c.fill();

  /* ===== ШАТУННАЯ ШЕЙКА (подшипник) ===== */
  var pg = c.createRadialGradient(cpX-2,cpY-2,1,cpX,cpY,8);
  if (isBroken){ pg.addColorStop(0,'#8a6a6a'); pg.addColorStop(1,'#1a0a0a'); }
  else { pg.addColorStop(0,'#e8eff6'); pg.addColorStop(.5,'#8a95a3'); pg.addColorStop(1,'#3a4654'); }
  c.fillStyle = pg;
  c.beginPath(); c.arc(cpX, cpY, 8, 0, 7); c.fill();
  c.strokeStyle='#0a0f15'; c.lineWidth = 1.5; c.stroke();

  /* ===== ВСПЫШКА ===== */
  if (firing){
    var d = cycPos - 2*Math.PI;
    var inten = Math.max(0, 1 - Math.abs(d)/1.25) * (0.35 + 0.65*throttle);
    if (inten > 0.01){
      var flashY = dir < 0 ? topY + 14 : botY - 14;
      var grad = c.createRadialGradient(cx, flashY, 2, cx, flashY, halfW*2);
      grad.addColorStop(0,'rgba(255,255,240,'+(1.0*inten)+')');
      grad.addColorStop(0.25,'rgba(255,210,80,'+(0.9*inten)+')');
      grad.addColorStop(0.6,'rgba(255,90,20,'+(0.5*inten)+')');
      grad.addColorStop(1,'rgba(120,20,0,0)');
      c.save();
      c.beginPath();
      if (dir < 0){
        c.rect(cx-halfW, topY, halfW*2, Math.max(4, pTop-topY+4));
      } else {
        c.rect(cx-halfW, pTop+24, halfW*2, Math.max(4, botY-pTop-24));
      }
      c.clip();
      c.fillStyle = grad;
      c.fillRect(cx-halfW*2, topY, halfW*4, botY-topY);
      c.restore();
    }
  }

  /* ===== КЛАПАНЫ (с пружинами и кулачками) ===== */
  var inL=0, exL=0;
  if (isBroken){ inL=5; exL=6; }
  else if (S.running){
    if (stroke===0) inL = Math.sin(cycPos % Math.PI) * 5;
    if (stroke===3) exL = Math.sin(cycPos - 3*Math.PI) * 5;
  }

  if (dir < 0){
    // Кулачки распредвала (вращаются)
    var camAngle = phase * 0.5;
    drawCam(c, cx - halfW*0.5, camY, camAngle, inL);
    drawCam(c, cx + halfW*0.5, camY, camAngle + Math.PI, exL);
    // Клапаны
    drawValveReal(c, cx - halfW*0.5, camY + 12, topY, inL, '#6fd0ff', isBroken);
    drawValveReal(c, cx + halfW*0.5, camY + 12, topY, exL, '#ff8a6f', isBroken);
  } else {
    c.save();
    c.translate(cx, botY); c.rotate(Math.PI); c.translate(-cx, -botY);
    var camAngle2 = phase * 0.5;
    drawCam(c, cx - halfW*0.5, camY, camAngle2, inL);
    drawCam(c, cx + halfW*0.5, camY, camAngle2 + Math.PI, exL);
    drawValveReal(c, cx - halfW*0.5, camY + 12, topY, inL, '#6fd0ff', isBroken);
    drawValveReal(c, cx + halfW*0.5, camY + 12, topY, exL, '#ff8a6f', isBroken);
    c.restore();
  }

  /* ===== СВЕЧА / ФОРСУНКА ===== */
  var sparkY = dir < 0 ? topY - 8 : botY + 8;
  // Керамический корпус
  c.fillStyle = isBroken ? '#6a4a4a' : '#e8e4dc';
  c.fillRect(cx-3, sparkY-10, 6, 14);
  // Металлическая часть
  c.fillStyle = isBroken ? '#5a3838' : '#8a95a3';
  c.fillRect(cx-4, sparkY+2, 8, 6);
  // Электрод
  c.fillStyle = '#2a333f';
  c.fillRect(cx-1, dir<0? topY-2 : botY-4, 2, 4);
  // Искра / вспышка
  if (firing && inten2(phase) > 0.5){
    c.fillStyle = '#fff8c0';
    c.beginPath(); c.arc(cx, dir<0?topY+2:botY-2, 2, 0, 7); c.fill();
  }

  /* ===== НОМЕР ЦИЛИНДРА ===== */
  c.fillStyle = isBroken ? '#a05050' : '#4a5c70';
  c.font = 'bold 9px Segoe UI, sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  var numY = dir < 0 ? topY - 30 : botY + 30;
  c.fillText('Ц.'+num, cx, numY);

  /* ===== КРЕСТИК ПРИ ПОЛОМКЕ ===== */
  if (isBroken){
    c.strokeStyle = 'rgba(255,50,50,0.85)'; c.lineWidth = 2.5;
    var ccy = (topY+botY)/2;
    c.beginPath();
    c.moveTo(cx-10, ccy-10); c.lineTo(cx+10, ccy+10);
    c.moveTo(cx+10, ccy-10); c.lineTo(cx-10, ccy+10);
    c.stroke();
  }
}

function inten2(phase){
  var cycPos = ((phase % (Math.PI*4)) + Math.PI*4) % (Math.PI*4);
  var d = cycPos - 2*Math.PI;
  return Math.max(0, 1 - Math.abs(d)/0.6);
}

/* ===== КУЛАЧОК РАСПРЕДВАЛА ===== */
function drawCam(c, x, y, angle, lift){
  c.save();
  c.translate(x, y);
  c.rotate(-angle);
  // Тело кулачка — круг с выступом
  var g = c.createRadialGradient(-3, -3, 1, 0, 0, 9);
  g.addColorStop(0,'#c8d4e0'); g.addColorStop(.6,'#6a7685'); g.addColorStop(1,'#2a3340');
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill();
  // Выступ кулачка (указывает вниз при нажатии)
  c.fillStyle = '#5a6878';
  c.beginPath();
  c.moveTo(-6, 2);
  c.quadraticCurveTo(0, 16, 6, 2);
  c.quadraticCurveTo(0, 6, -6, 2);
  c.closePath(); c.fill();
  c.strokeStyle='#1a232e'; c.lineWidth = 1; c.stroke();
  c.restore();
  // Ось распредвала
  c.fillStyle = '#1a232e';
  c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill();
}

/* ===== РЕМЕНЬ ГРМ ===== */
function drawTimingBelt(c, x, topY, botY, isBroken){
  // Шестерня распредвала
  drawGear(c, x, topY, 14, isBroken);
  // Шестерня коленвала
  drawGear(c, x, botY, 18, isBroken);
  // Ремень
  c.strokeStyle = isBroken ? '#5a3030' : '#1a1a1a';
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(x - 14, topY);
  c.lineTo(x - 18, botY);
  c.stroke();
  c.beginPath();
  c.moveTo(x + 14, topY);
  c.lineTo(x + 18, botY);
  c.stroke();
  // Зубцы ремня
  c.strokeStyle = isBroken ? '#3a2020' : '#3a3a3a';
  c.lineWidth = 1;
  var steps = 20;
  for (var i=0; i<=steps; i++){
    var t = i/steps;
    var y1 = topY + (botY-topY)*t;
    var w1 = 14 + (18-14)*t;
    c.beginPath();
    c.moveTo(x - w1, y1); c.lineTo(x - w1 - 3, y1);
    c.moveTo(x + w1, y1); c.lineTo(x + w1 + 3, y1);
    c.stroke();
  }
}

function drawGear(c, x, y, r, isBroken){
  var g = c.createRadialGradient(x-3, y-3, 1, x, y, r);
  if (isBroken){ g.addColorStop(0,'#8a6a6a'); g.addColorStop(1,'#2a1a1a'); }
  else { g.addColorStop(0,'#a8b4c0'); g.addColorStop(.5,'#6a7685'); g.addColorStop(1,'#2a3340'); }
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  // Зубцы
  c.strokeStyle = isBroken ? '#5a3030' : '#3a4654';
  c.lineWidth = 2;
  for (var i=0; i<16; i++){
    var a = (i/16) * Math.PI * 2;
    c.beginPath();
    c.moveTo(x + Math.cos(a)*r, y + Math.sin(a)*r);
    c.lineTo(x + Math.cos(a)*(r+3), y + Math.sin(a)*(r+3));
    c.stroke();
  }
  // Ось
  c.fillStyle = '#1a232e';
  c.beginPath(); c.arc(x, y, r*0.3, 0, 7); c.fill();
  c.strokeStyle = '#4a5566'; c.lineWidth = 1; c.stroke();
}

/* ===== МАХОВИК ===== */
function drawFlywheel(c, x, y, r, angle, isBroken){
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  var g = c.createRadialGradient(-r*0.3,-r*0.3, 1, 0, 0, r);
  if (isBroken){ g.addColorStop(0,'#8a6a6a'); g.addColorStop(.6,'#5a4040'); g.addColorStop(1,'#1a0a0a'); }
  else { g.addColorStop(0,'#8a95a3'); g.addColorStop(.5,'#5a6878'); g.addColorStop(1,'#2a3340'); }
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = '#0a0f15'; c.lineWidth = 2; c.stroke();
  // Зубцы венца маховика
  c.strokeStyle = isBroken ? '#5a3030' : '#3a4654';
  c.lineWidth = 2;
  for (var i=0; i<40; i++){
    var a = (i/40) * Math.PI * 2;
    c.beginPath();
    c.moveTo(Math.cos(a)*r, Math.sin(a)*r);
    c.lineTo(Math.cos(a)*(r+4), Math.sin(a)*(r+4));
    c.stroke();
  }
  // Отверстия
  c.fillStyle = '#0a0f15';
  for (var j=0; j<6; j++){
    var a2 = (j/6) * Math.PI * 2;
    c.beginPath();
    c.arc(Math.cos(a2)*r*0.55, Math.sin(a2)*r*0.55, r*0.1, 0, 7);
    c.fill();
  }
  // Центральный болт
  c.fillStyle = '#1a232e';
  c.beginPath(); c.arc(0, 0, r*0.28, 0, 7); c.fill();
  c.strokeStyle = '#4a5566'; c.lineWidth = 1.5; c.stroke();
  c.restore();
}

/* ===== КОЛЕНВАЛ ===== */
function drawCrankShaftReal(c, x1, x2, y, isBroken){
  // Тень
  c.fillStyle='rgba(0,0,0,0.5)';
  c.fillRect(x1, y-13, x2-x1, 26);
  // Основная штанга
  var sg = c.createLinearGradient(0, y-11, 0, y+11);
  if (isBroken){
    sg.addColorStop(0,'#2a1a1a'); sg.addColorStop(.4,'#7a5a5a');
    sg.addColorStop(.6,'#8a6a6a'); sg.addColorStop(1,'#1a0a0a');
  } else {
    sg.addColorStop(0,'#2a3340'); sg.addColorStop(.25,'#7a8797');
    sg.addColorStop(.5,'#a8b4c0'); sg.addColorStop(.75,'#6a7685');
    sg.addColorStop(1,'#1d2530');
  }
  c.fillStyle = sg;
  c.fillRect(x1, y-10, x2-x1, 20);
  c.strokeStyle='#0a0f15'; c.lineWidth = 1.5;
  c.strokeRect(x1, y-10, x2-x1, 20);
  // Блик
  if (!isBroken){
    c.fillStyle = 'rgba(255,255,255,0.15)';
    c.fillRect(x1, y-7, x2-x1, 3);
  }
}

/* ===== КОРЕННАЯ ОПОРА ===== */
function drawMainBearing(c, x, y, r, isBroken){
  var g = c.createRadialGradient(x-3, y-3, 1, x, y, r);
  if (isBroken){ g.addColorStop(0,'#8a6a6a'); g.addColorStop(.6,'#5a4040'); g.addColorStop(1,'#1a0a0a'); }
  else { g.addColorStop(0,'#c8d4e0'); g.addColorStop(.5,'#7a8797'); g.addColorStop(1,'#3a4654'); }
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle='#0a0f15'; c.lineWidth = 1.5; c.stroke();
  // Болты
  bolt(c, x - r*0.55, y - r*0.55, 2, isBroken);
  bolt(c, x + r*0.55, y - r*0.55, 2, isBroken);
  bolt(c, x - r*0.55, y + r*0.55, 2, isBroken);
  bolt(c, x + r*0.55, y + r*0.55, 2, isBroken);
}

/* ===== R4 ===== */
function drawR4(){
  var c = ectx, W = ecv.width, H = ecv.height;
  var isBroken = S.broken;
  var crankY = 305, CR = 32, ROD = 95;
  var xs = [115, 250, 385, 520];
  var halfW = 44, topY = 155, botY = 290;
  var camY = 100;
  var offs = [2*Math.PI, 3*Math.PI, Math.PI, 0];

  /* ===== ОСНОВАНИЕ / ПОДДОН ===== */
  var poddonGrad = c.createLinearGradient(0, 355, 0, 415);
  if (isBroken){ poddonGrad.addColorStop(0,'#2a1a1a'); poddonGrad.addColorStop(1,'#1a0a0a'); }
  else { poddonGrad.addColorStop(0,'#2a3340'); poddonGrad.addColorStop(1,'#131b24'); }
  c.fillStyle = poddonGrad;
  c.beginPath();
  c.moveTo(40, 355); c.lineTo(600, 355);
  c.lineTo(580, 415); c.lineTo(60, 415);
  c.closePath(); c.fill();
  c.strokeStyle = isBroken ? '#6a3a3a' : '#3a4a5c'; c.lineWidth = 2; c.stroke();
  // Пробка слива масла
  bolt(c, 320, 408, 5, isBroken);

  /* ===== БЛОК ЦИЛИНДРОВ ===== */
  var blockGrad = metalGrad(c, 30, 140, 580, 220, isBroken);
  c.fillStyle = blockGrad;
  rr(c, 30, 140, 580, 220, 8); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();
  // Рёбра охлаждения на блоке (вертикальные полоски)
  c.strokeStyle = isBroken ? 'rgba(90,40,40,0.5)' : 'rgba(30,40,52,0.55)';
  c.lineWidth = 1.5;
  for (var rb = 0; rb < 12; rb++){
    var ry = 155 + rb*17;
    c.beginPath(); c.moveTo(35, ry); c.lineTo(605, ry); c.stroke();
  }

  /* ===== ГОЛОВКА БЛОКА ===== */
  var headGrad = metalGrad(c, 30, 60, 580, 85, isBroken);
  c.fillStyle = headGrad;
  rr(c, 30, 60, 580, 85, 8); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#4a5a6c'; c.lineWidth = 2; c.stroke();
  // Крышка распредвала сверху
  c.fillStyle = isBroken ? '#3a2424' : '#1d2530';
  rr(c, 40, 42, 560, 22, 6); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 1.5; c.stroke();
  // Болты на крышке
  for (var bi = 0; bi < 5; bi++){
    bolt(c, 60 + bi*130, 53, 3, isBroken);
  }

  /* ===== РАСПРЕДВАЛ (единая ось через все цилиндры) ===== */
  c.fillStyle = '#1a232e';
  c.fillRect(60, camY, 520, 6);
  c.strokeStyle = '#3a4654'; c.lineWidth = 1;
  c.strokeRect(60, camY, 520, 6);

  /* ===== КОЛЕНВАЛ ===== */
  drawCrankShaftReal(c, 60, 580, crankY, isBroken);

  /* ===== КОРЕННЫЕ ОПОРЫ ===== */
  var mains = [70, 180, 320, 460, 570];
  for (var mi=0; mi<mains.length; mi++){
    drawMainBearing(c, mains[mi], crankY, 12, isBroken);
  }

  /* ===== МАХОВИК (справа, за блоком) ===== */
  drawFlywheel(c, 605, crankY, 32, S.crankAngle, isBroken);

  /* ===== РЕМЕНЬ ГРМ (слева) ===== */
  drawTimingBelt(c, 25, camY + 3, crankY, isBroken);

  /* ===== ЦИЛИНДРЫ ===== */
  for (var i=0;i<4;i++){
    drawCylinderReal(c, xs[i], crankY, topY, botY, halfW,
      S.crankAngle + offs[i], CR, ROD, -1,
      isBroken, S.running && !S.stalled && !isBroken, S.throttle, i+1, camY + 3);
  }

  /* ===== ВЫПУСКНОЙ КОЛЛЕКТОР (сзади-сверху) ===== */
  drawExhaustManifold(c, 100, 130, 4, 110, isBroken);

  /* ===== ПОДПИСЬ ===== */
  c.fillStyle = isBroken ? '#8a5a5a' : '#5d7189';
  c.font = 'bold 11px Segoe UI, sans-serif';
  c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText('R4  •  4 цилиндра в ряд  •  ГРМ + распредвал', 45, 20);
}

/* ===== ВЫПУСКНОЙ КОЛЛЕКТОР ===== */
function drawExhaustManifold(c, startX, y, pipes, spacing, isBroken){
  var grad = c.createLinearGradient(0, y-8, 0, y+8);
  if (isBroken){ grad.addColorStop(0,'#3a2424'); grad.addColorStop(.5,'#6a4a4a'); grad.addColorStop(1,'#2a1a1a'); }
  else { grad.addColorStop(0,'#3a2a1a'); grad.addColorStop(.5,'#6a4a3a'); grad.addColorStop(1,'#2a1a0a'); }
  // Трубы вниз
  for (var i=0; i<pipes; i++){
    var px = startX + i*spacing;
    c.strokeStyle = grad;
    c.lineWidth = 10; c.lineCap='round';
    c.beginPath(); c.moveTo(px, y+22); c.lineTo(px, y+52); c.stroke();
    c.strokeStyle = isBroken?'#8a4a4a':'#8a6a4a';
    c.lineWidth = 3;
    c.beginPath(); c.moveTo(px-3, y+26); c.lineTo(px-3, y+48); c.stroke();
  }
  // Главная труба
  c.strokeStyle = grad;
  c.lineWidth = 14; c.lineCap='round';
  c.beginPath();
  c.moveTo(startX - 20, y+60);
  c.lineTo(startX + (pipes-1)*spacing + 20, y+60);
  c.stroke();
}

/* ===== V-образный ===== */
function drawV(n){
  var c = ectx;
  var W = ecv.width;
  var isBroken = S.broken;
  var crankY = 215;

  var CR, ROD, halfW, spacing;
  if (n === 8){
    CR = 13; ROD = 32; halfW = 22; spacing = 118;
  } else {
    CR = 8; ROD = 22; halfW = 14; spacing = 62;
  }
  var startX = W/2 - (n-1)*spacing/2;
  var topTopY = 70, topBotY = 195;
  var botTopY = 235, botBotY = 360;
  var camTopY = 55, camBotY = 375;

  /* ===== БЛОКИ ===== */
  var bg1 = metalGrad(c, 15, 30, W-30, 180, isBroken);
  c.fillStyle = bg1;
  rr(c, 15, 30, W-30, 180, 10); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  var bg2 = metalGrad(c, 15, 220, W-30, 180, isBroken);
  c.fillStyle = bg2;
  rr(c, 15, 220, W-30, 180, 10); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  /* ===== КОЛЕНВАЛ ===== */
  drawCrankShaftReal(c, 30, W-30, crankY, isBroken);

  /* ===== КОРЕННЫЕ ОПОРЫ ===== */
  var cnt = n + 1;
  for (var mi=0; mi<=cnt; mi++){
    var mx = 40 + mi * ((W-80) / cnt);
    drawMainBearing(c, mx, crankY, 9, isBroken);
  }

  /* ===== ЦИЛИНДРЫ ===== */
  for (var i=0;i<n;i++){
    var cx = startX + i*spacing;
    drawCylinderReal(c, cx, crankY, topTopY, topBotY, halfW,
      S.crankAngle + (i*4*Math.PI/n), CR, ROD, -1,
      isBroken, S.running && !S.stalled && !is