(function(){
"use strict";
var D = window.DVS;
var errBox = document.getElementById('err');
if (!D){ errBox.style.display='block'; errBox.textContent='engine.js не загрузился'; return; }

try {

var ecv = document.getElementById('engineCv');
var ectx = ecv.getContext('2d');
var gcv = document.getElementById('gaugeCv');
var gctx = gcv.getContext('2d');
var spdEl = document.getElementById('spdVal');

var crankY = 290, CR = 33, ROD = 98;
var cylCenters = [110, 250, 390, 530];
var cylHalfW = 46, cylTopY = 120, cylBotY = 272;
var offsets = [2*Math.PI, 3*Math.PI, Math.PI, 0];
var MAXR = 8000;

function rr(c,x,y,w,h,r){
  c.beginPath(); c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();
}

function drawValve(c, x, baseY, lift, color){
  var w = 15;
  c.fillStyle = '#3a4756';
  c.fillRect(x - 3, baseY - 46, 6, 34);
  var y = baseY + lift;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x - w/2, y - 4); c.lineTo(x + w/2, y - 4);
  c.lineTo(x + w/2 - 4, y + 8); c.lineTo(x - w/2 + 4, y + 8);
  c.closePath(); c.fill();
  c.fillStyle = '#2a3543';
  c.fillRect(x - 8, baseY - 50, 16, 6);
}

function drawEngine(){
  var c = ectx, W = ecv.width, H = ecv.height;
  c.clearRect(0,0,W,H);
  var bg = c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0e151d'); bg.addColorStop(1,'#070a0e');
  c.fillStyle = bg; c.fillRect(0,0,W,H);

  /* ========== БЛОК ЦИЛИНДРОВ (с картером) ========== */
  var blockGrad = c.createLinearGradient(0,70,0,395);
  blockGrad.addColorStop(0,'#2b3746');
  blockGrad.addColorStop(.45,'#1d2733');
  blockGrad.addColorStop(1,'#131b24');
  c.fillStyle = blockGrad;
  rr(c, 40, 72, 560, 320, 12); c.fill();
  c.strokeStyle = '#3a4a5c'; c.lineWidth = 2; c.stroke();

  /* ========== ГОЛОВКА БЛОКА ========== */
  var headGrad = c.createLinearGradient(0,60,0,120);
  headGrad.addColorStop(0,'#334252'); headGrad.addColorStop(1,'#212b37');
  c.fillStyle = headGrad; rr(c, 40, 58, 560, 62, 10); c.fill();
  c.strokeStyle = '#42556b'; c.lineWidth = 2; c.stroke();

  /* ========== МАСЛЯНЫЙ ПОДДОН ========== */
  c.fillStyle = '#121a22';
  rr(c, 55, 392, 530, 32, 8); c.fill();
  c.strokeStyle = '#2a3a4b'; c.lineWidth = 1.5; c.stroke();

  var rpm = D.rpm, throttle = D.throttle, crankAngle = D.crankAngle;
  var firing = D.running && !D.stalled;

  /* ========== КОЛЕНВАЛ — ГЛАВНАЯ ОСЬ (задний слой) ========== */
  // тень под валом
  c.fillStyle = 'rgba(0,0,0,0.4)';
  c.fillRect(60, crankY - 15, 520, 30);
  // основная труба вала
  var shaftGrad = c.createLinearGradient(0, crankY - 12, 0, crankY + 12);
  shaftGrad.addColorStop(0,'#3d4a58');
  shaftGrad.addColorStop(.35,'#9aa8b8');
  shaftGrad.addColorStop(.55,'#7a8796');
  shaftGrad.addColorStop(1,'#232e3b');
  c.fillStyle = shaftGrad;
  c.fillRect(60, crankY - 11, 520, 22);
  c.strokeStyle = '#0e151d'; c.lineWidth = 2;
  c.strokeRect(60, crankY - 11, 520, 22);

  /* ========== КОРЕННЫЕ ШЕЙКИ (5 шт) ========== */
  var mainCenters = [72, 180, 320, 460, 588];
  for (var mi = 0; mi < mainCenters.length; mi++){
    var mx = mainCenters[mi];
    // внешняя обойма
    var mg = c.createRadialGradient(mx-4, crankY-4, 2, mx, crankY, 16);
    mg.addColorStop(0,'#b8c6d4');
    mg.addColorStop(.6,'#6d7a89');
    mg.addColorStop(1,'#3a4756');
    c.fillStyle = mg;
    c.beginPath(); c.arc(mx, crankY, 15, 0, 7); c.fill();
    c.strokeStyle = '#1a232e'; c.lineWidth = 2; c.stroke();
    // болт
    c.fillStyle = '#2a3543';
    c.beginPath(); c.arc(mx, crankY, 5, 0, 7); c.fill();
    c.strokeStyle = '#4d5b6b'; c.lineWidth = 1; c.stroke();
  }

  /* ========== 4 ЦИЛИНДРА ========== */
  for (var i = 0; i < 4; i++){
    var cx = cylCenters[i];
    var cyc = crankAngle + offsets[i];
    var cycPos = ((cyc % (Math.PI*4)) + Math.PI*4) % (Math.PI*4);
    var stroke = Math.floor(cycPos / Math.PI);
    var s = Math.sin(cyc), co = Math.cos(cyc);
    var dist = CR * co + Math.sqrt(ROD*ROD - CR*CR*s*s);
    var pinY = crankY - dist, pinX = cx;
    var cpX = cx + CR * s, cpY = crankY - CR * co;

    /* --- Гильза цилиндра --- */
    var boreGrad = c.createLinearGradient(cx-cylHalfW,0,cx+cylHalfW,0);
    boreGrad.addColorStop(0,'#070b10');
    boreGrad.addColorStop(.5,'#0e141c');
    boreGrad.addColorStop(1,'#070b10');
    c.fillStyle = boreGrad;
    c.fillRect(cx - cylHalfW, cylTopY, cylHalfW*2, cylBotY - cylTopY);
    c.strokeStyle = '#38495c'; c.lineWidth = 2;
    c.strokeRect(cx - cylHalfW, cylTopY, cylHalfW*2, cylBotY - cylTopY);

    /* --- Вспышка в камере сгорания --- */
    var pistonTopY = pinY - 32;
    if (firing){
      var d = cycPos - 2*Math.PI;
      var inten = Math.max(0, 1 - Math.abs(d) / 1.25) * (0.35 + 0.65*throttle);
      if (inten > 0.01){
        var g = c.createRadialGradient(cx, cylTopY + 26, 2, cx, cylTopY + 26, 74);
        g.addColorStop(0, 'rgba(255,255,220,' + (0.95*inten) + ')');
        g.addColorStop(0.3,'rgba(255,175,50,' + (0.85*inten) + ')');
        g.addColorStop(0.65,'rgba(255,80,20,' + (0.45*inten) + ')');
        g.addColorStop(1, 'rgba(120,20,0,0)');
        c.save();
        c.beginPath();
        c.rect(cx - cylHalfW, cylTopY, cylHalfW*2, Math.max(4, pistonTopY - cylTopY + 6));
        c.clip();
        c.fillStyle = g;
        c.fillRect(cx - cylHalfW, cylTopY, cylHalfW*2, Math.max(4, pistonTopY - cylTopY + 6));
        c.restore();
      }
    }

    /* --- Клапаны --- */
    var inLift = 0, exLift = 0;
    if (D.running){
      if (stroke === 0) inLift = Math.sin(cycPos % Math.PI) * 9;
      if (stroke === 3) exLift = Math.sin(cycPos - 3*Math.PI) * 9;
    }
    drawValve(c, cx - 24, cylTopY, inLift, '#6fd0ff');
    drawValve(c, cx + 24, cylTopY, exLift, '#ff8a6f');

    /* --- Свеча зажигания --- */
    c.fillStyle = '#c9d4e0';
    c.fillRect(cx - 4, cylTopY - 16, 8, 16);
    c.fillStyle = firing ? '#fff6c0' : '#5a6572';
    c.beginPath(); c.arc(cx, cylTopY + 2, 3.2, 0, 7); c.fill();

    /* --- ПРОТИВОВЕС (вращается с валом, за шатуном) --- */
    c.save();
    c.translate(cx, crankY);
    c.rotate(-cyc);
    c.fillStyle = '#2c3947';
    c.beginPath();
    c.arc(0, CR*0.5, 26, Math.PI*0.15, Math.PI*0.85);
    c.arc(0, 0, 28, Math.PI*0.85, Math.PI*0.15, true);
    c.closePath(); c.fill();
    c.strokeStyle = '#1a232e'; c.lineWidth = 1.5; c.stroke();
    // металлический блик на противовесе
    c.fillStyle = 'rgba(150,170,190,0.15)';
    c.beginPath();
    c.arc(0, CR*0.5, 20, Math.PI*0.25, Math.PI*0.75);
    c.closePath(); c.fill();
    c.restore();

    /* --- ШАТУН (от поршня к шейке) --- */
    // тёмная обводка
    c.strokeStyle = '#1f2833'; c.lineWidth = 16; c.lineCap = 'round';
    c.beginPath(); c.moveTo(pinX, pinY); c.lineTo(cpX, cpY); c.stroke();
    // металл
    c.strokeStyle = '#96a4b4'; c.lineWidth = 11;
    c.beginPath(); c.moveTo(pinX, pinY); c.lineTo(cpX, cpY); c.stroke();
    // блик
    c.strokeStyle = 'rgba(220,230,240,0.7)'; c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(pinX + 2.5, pinY - 1);
    c.lineTo(cpX + 2.5, cpY - 1);
    c.stroke();

    /* --- ПОРШЕНЬ (перекрывает верх шатуна) --- */
    var pg = c.createLinearGradient(cx - cylHalfW + 2, 0, cx + cylHalfW - 2, 0);
    pg.addColorStop(0,'#5d6a79');
    pg.addColorStop(.28,'#c3ceda');
    pg.addColorStop(.55,'#8b98a7');
    pg.addColorStop(1,'#4c5866');
    c.fillStyle = pg;
    rr(c, cx - cylHalfW + 3, pinY - 32, (cylHalfW-3)*2, 48, 5); c.fill();
    c.strokeStyle = '#2e3a47'; c.lineWidth = 1.5; c.stroke();

    // компрессионные кольца
    c.strokeStyle = '#39485a'; c.lineWidth = 2.5;
    for (var k = 0; k < 3; k++){
      c.beginPath();
      c.moveTo(cx - cylHalfW + 5, pinY - 24 + k*6);
      c.lineTo(cx + cylHalfW - 5, pinY - 24 + k*6);
      c.stroke();
    }
    // палец поршня
    c.fillStyle = '#2a3543';
    c.beginPath(); c.arc(cx, pinY, 8, 0, 7); c.fill();
    c.strokeStyle = '#586a7d'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#5a6a7c';
    c.beginPath(); c.arc(cx, pinY, 3, 0, 7); c.fill();

    /* --- ШАТУННАЯ ШЕЙКА (на ней «сидит» шатун) --- */
    var pinG = c.createRadialGradient(cpX-5, cpY-5, 2, cpX, cpY, 14);
    pinG.addColorStop(0,'#d8e4f0');
    pinG.addColorStop(.5,'#96a4b4');
    pinG.addColorStop(1,'#4a5866');
    c.fillStyle = pinG;
    c.beginPath(); c.arc(cpX, cpY, 13, 0, 7); c.fill();
    c.strokeStyle = '#1a232e'; c.lineWidth = 2.5; c.stroke();
    // два болта на шейке (визуальная «сборка»)
    c.fillStyle = '#2a3543';
    c.beginPath(); c.arc(cpX - 4, cpY, 2.5, 0, 7); c.fill();
    c.beginPath(); c.arc(cpX + 4, cpY, 2.5, 0, 7); c.fill();

    /* --- Подписи внизу, в картере --- */
    c.fillStyle = '#4a5c70';
    c.font = 'bold 11px Segoe UI, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText('ЦИЛ. ' + (i+1), cx, 355);

    var names = ['ВПУСК','СЖАТИЕ','РАБОЧИЙ','ВЫПУСК'];
    var cols = ['#6fd0ff','#ffc93c','#ff6b3d','#9aa8b8'];
    c.fillStyle = firing ? cols[stroke] : '#3d4a58';
    c.font = 'bold 10px Segoe UI, sans-serif';
    c.fillText(names[stroke], cx, 372);
  }

  /* ========== Нижние подписи ========== */
  c.textAlign = 'left';
  c.fillStyle = '#43566b';
  c.font = 'bold 10px Segoe UI, sans-serif';
  c.fillText('КОЛЕНЧАТЫЙ ВАЛ', 46, 415);
  c.textAlign = 'right';
  c.fillText('4 ЦИЛИНДРА  •  1-3-4-2', 594, 415);
}

  var blockGrad = c.createLinearGradient(0,70,0,390);
  blockGrad.addColorStop(0,'#2b3746'); blockGrad.addColorStop(.5,'#1d2733'); blockGrad.addColorStop(1,'#151d26');
  c.fillStyle = blockGrad; rr(c, 40, 72, 560, 310, 12); c.fill();
  c.strokeStyle = '#3a4a5c'; c.lineWidth = 2; c.stroke();

  var headGrad = c.createLinearGradient(0,60,0,120);
  headGrad.addColorStop(0,'#334252'); headGrad.addColorStop(1,'#212b37');
  c.fillStyle = headGrad; rr(c, 40, 58, 560, 62, 10); c.fill();
  c.strokeStyle = '#42556b'; c.lineWidth = 2; c.stroke();

  c.fillStyle = '#121a22'; rr(c, 55, 372, 530, 34, 8); c.fill();
  c.strokeStyle = '#2a3a4b'; c.lineWidth = 1.5; c.stroke();

  var rpm = D.rpm, throttle = D.throttle, crankAngle = D.crankAngle;
  var firing = D.running && !D.stalled;

  for (var i = 0; i < 4; i++){
    var cx = cylCenters[i];
    var cyc = crankAngle + offsets[i];
    var cycPos = ((cyc % (Math.PI*4)) + Math.PI*4) % (Math.PI*4);
    var stroke = Math.floor(cycPos / Math.PI);
    var s = Math.sin(cyc), co = Math.cos(cyc);
    var dist = CR * co + Math.sqrt(ROD*ROD - CR*CR*s*s);
    var pinY = crankY - dist, pinX = cx;
    var cpX = cx + CR * s, cpY = crankY - CR * co;

    var boreGrad = c.createLinearGradient(cx-cylHalfW,0,cx+cylHalfW,0);
    boreGrad.addColorStop(0,'#070b10'); boreGrad.addColorStop(.5,'#0e141c'); boreGrad.addColorStop(1,'#070b10');
    c.fillStyle = boreGrad;
    c.fillRect(cx - cylHalfW, cylTopY, cylHalfW*2, cylBotY - cylTopY);
    c.strokeStyle = '#38495c'; c.lineWidth = 2;
    c.strokeRect(cx - cylHalfW, cylTopY, cylHalfW*2, cylBotY - cylTopY);

    var pistonTopY = pinY - 32;
    if (firing){
      var d = cycPos - 2*Math.PI;
      var inten = Math.max(0, 1 - Math.abs(d) / 1.25) * (0.35 + 0.65*throttle);
      if (inten > 0.01){
        var g = c.createRadialGradient(cx, cylTopY + 26, 2, cx, cylTopY + 26, 74);
        g.addColorStop(0, 'rgba(255,255,220,' + (0.95*inten) + ')');
        g.addColorStop(0.3,'rgba(255,175,50,' + (0.85*inten) + ')');
        g.addColorStop(0.65,'rgba(255,80,20,' + (0.45*inten) + ')');
        g.addColorStop(1, 'rgba(120,20,0,0)');
        c.save();
        c.beginPath();
        c.rect(cx - cylHalfW, cylTopY, cylHalfW*2, Math.max(4, pistonTopY - cylTopY + 6));
        c.clip();
        c.fillStyle = g;
        c.fillRect(cx - cylHalfW, cylTopY, cylHalfW*2, Math.max(4, pistonTopY - cylTopY + 6));
        c.restore();
      }
    }

    var inLift = 0, exLift = 0;
    if (D.running){
      if (stroke === 0) inLift = Math.sin(cycPos % Math.PI) * 9;
      if (stroke === 3) exLift = Math.sin(cycPos - 3*Math.PI) * 9;
    }
    drawValve(c, cx - 24, cylTopY, inLift, '#6fd0ff');
    drawValve(c, cx + 24, cylTopY, exLift, '#ff8a6f');

    c.fillStyle = '#c9d4e0';
    c.fillRect(cx - 4, cylTopY - 16, 8, 16);
    c.fillStyle = firing ? '#fff6c0' : '#5a6572';
    c.beginPath(); c.arc(cx, cylTopY + 2, 3.2, 0, 7); c.fill();

    var pg = c.createLinearGradient(cx - cylHalfW + 2, 0, cx + cylHalfW - 2, 0);
    pg.addColorStop(0,'#5d6a79'); pg.addColorStop(.28,'#c3ceda');
    pg.addColorStop(.55,'#8b98a7'); pg.addColorStop(1,'#4c5866');
    c.fillStyle = pg;
    rr(c, cx - cylHalfW + 3, pinY - 32, (cylHalfW-3)*2, 48, 5); c.fill();
    c.strokeStyle = '#2e3a47'; c.lineWidth = 1.5; c.stroke();

    c.strokeStyle = '#39485a'; c.lineWidth = 2.5;
    for (var k = 0; k < 3; k++){
      c.beginPath();
      c.moveTo(cx - cylHalfW + 5, pinY - 24 + k*6);
      c.lineTo(cx + cylHalfW - 5, pinY - 24 + k*6);
      c.stroke();
    }
    c.fillStyle = '#2a3543';
    c.beginPath(); c.arc(cx, pinY, 7, 0, 7); c.fill();
    c.strokeStyle = '#586a7d'; c.lineWidth = 1.5; c.stroke();

    c.strokeStyle = '#96a4b4'; c.lineWidth = 12; c.lineCap = 'round';
    c.beginPath(); c.moveTo(pinX, pinY); c.lineTo(cpX, cpY); c.stroke();
    c.strokeStyle = '#5c6b7c'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(pinX, pinY); c.lineTo(cpX, cpY); c.stroke();

    c.fillStyle = '#1a232e';
    c.beginPath(); c.arc(cx, crankY, 30, 0, 7); c.fill();
    c.strokeStyle = '#3d4e60'; c.lineWidth = 2; c.stroke();

    c.fillStyle = '#2c3947';
    c.save(); c.translate(cx, crankY); c.rotate(-cyc);
    c.beginPath();
    c.arc(0, CR*0.55, 24, Math.PI*0.15, Math.PI*0.85);
    c.arc(0, 0, 26, Math.PI*0.85, Math.PI*0.15, true);
    c.closePath(); c.fill(); c.restore();

    var pinG = c.createRadialGradient(cpX-3, cpY-3, 1, cpX, cpY, 12);
    pinG.addColorStop(0,'#c8d6e4'); pinG.addColorStop(1,'#5f7a92');
    c.fillStyle = pinG;
    c.beginPath(); c.arc(cpX, cpY, 11, 0, 7); c.fill();
    c.strokeStyle = '#2b3746'; c.lineWidth = 2; c.stroke();

    c.fillStyle = '#4a5c70';
    c.font = 'bold 12px Segoe UI, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText('ЦИЛ. ' + (i+1), cx, cylBotY + 22);

    var names = ['ВПУСК','СЖАТИЕ','РАБОЧИЙ','ВЫПУСК'];
    var cols = ['#6fd0ff','#ffc93c','#ff6b3d','#9aa8b8'];
    c.fillStyle = firing ? cols[stroke] : '#3d4a58';
    c.font = 'bold 10px Segoe UI, sans-serif';
    c.fillText(names[stroke], cx, cylBotY + 38);
  }
  c.textAlign = 'left';
  c.fillStyle = '#43566b';
  c.font = 'bold 11px Segoe UI, sans-serif';
  c.fillText('КОЛЕНЧАТЫЙ ВАЛ', 46, 405);
  c.textAlign = 'right';
  c.fillText('4 ЦИЛИНДРА  •  1-3-4-2', 594, 405);
}

function drawGauge(){
  var c = gctx, W = gcv.width, H = gcv.height;
  c.clearRect(0,0,W,H);
  var cx = W/2, cy = H - 22, R = Math.min(W/2 - 16, H - 48);
  var a0 = Math.PI, a1 = Math.PI * 2;
  var rpm = D.rpm;
  c.lineWidth = 15; c.lineCap = 'butt';
  c.strokeStyle = '#151f2b';
  c.beginPath(); c.arc(cx, cy, R, a0, a1); c.stroke();
  var rA = a0 + (6800 / MAXR) * (a1 - a0);
  c.strokeStyle = 'rgba(255,70,70,.35)';
  c.beginPath(); c.arc(cx, cy, R, rA, a1); c.stroke();
  var rp = Math.min(rpm, MAXR);
  var curA = a0 + (rp / MAXR) * (a1 - a0);
  var g = c.createLinearGradient(cx - R, 0, cx + R, 0);
  g.addColorStop(0, '#28d17c'); g.addColorStop(.55,'#ffc93c'); g.addColorStop(1,'#ff3b3b');
  c.strokeStyle = g; c.lineWidth = 15;
  c.beginPath(); c.arc(cx, cy, R, a0, curA); c.stroke();
  for (var i = 0; i <= 8; i++){
    var a = a0 + (i/8) * (a1 - a0);
    var x1 = cx + Math.cos(a) * (R - 10), y1 = cy + Math.sin(a) * (R - 10);
    var x2 = cx + Math.cos(a) * (R - 22), y2 = cy + Math.sin(a) * (R - 22);
    c.strokeStyle = i >= 7 ? '#ff6b6b' : '#4d6379';
    c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
    var tx = cx + Math.cos(a) * (R - 38), ty = cy + Math.sin(a) * (R - 38);
    c.fillStyle = i >= 7 ? '#ff8b8b' : '#6d8299';
    c.font = 'bold 11px Segoe UI, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(i), tx, ty);
  }
  var na = a0 + (rp / MAXR) * (a1 - a0);
  c.save(); c.translate(cx, cy); c.rotate(na);
  var ng = c.createLinearGradient(0,0,R,0);
  ng.addColorStop(0,'#ff5b5b'); ng.addColorStop(1,'#ffb0b0');
  c.fillStyle = ng;
  c.beginPath();
  c.moveTo(-14, -5); c.lineTo(R - 24, -2.2); c.lineTo(R - 18, 0);
  c.lineTo(R - 24, 2.2); c.lineTo(-14, 5);
  c.closePath(); c.fill(); c.restore();
  c.fillStyle = '#1b2531';
  c.beginPath(); c.arc(cx, cy, 15, 0, 7); c.fill();
  c.strokeStyle = '#3a4d61'; c.lineWidth = 2; c.stroke();
  var rc = rpm > 6800 ? '#ff5b5b' : (rpm > 5500 ? '#ffc93c' : '#9fe8c0');
  c.fillStyle = rc;
  c.font = 'bold 27px Segoe UI, sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.fillText(String(Math.round(rpm)), cx, cy - 30);
  c.fillStyle = '#4f6277';
  c.font = 'bold 10px Segoe UI, sans-serif';
  c.fillText('ОБ/МИН', cx, cy - 16);
}

/* ================= ГЛАВНЫЙ ЦИКЛ ================= */
var acc = 0, last = performance.now(), FIXED = 1/240;
var throttle = 0, brakePedal = 0, clutchPedal = 0;

function smoothStep(cur, target, up, down, dt){
  var rate = target > cur ? up : down;
  var d = target - cur;
  var step = rate * dt;
  return Math.abs(d) <= step ? target : cur + Math.sign(d) * step;
}

function loop(now){
  var frame = (now - last) / 1000;
  last = now;
  if (frame > 0.25) frame = 0.25;
  if (frame < 0) frame = 0;
  throttle = smoothStep(throttle, D.pressed.gas ? 1 : 0, 4.5, 7.0, frame);
  brakePedal = smoothStep(brakePedal, D.pressed.brake ? 1 : 0, 5.0, 7.0, frame);
  clutchPedal = smoothStep(clutchPedal, D.pressed.clutch ? 1 : 0, 7.0, 1.6, frame);
  // передаём сглаженные значения обратно в engine.js через замыкание
  window.DVS.throttle = throttle;
  window.DVS.brakePedal = brakePedal;
  window.DVS.clutchPedal = clutchPedal;
  document.getElementById('pGas').querySelector('.bar').style.width = (throttle*100) + '%';
  document.getElementById('pBrake').querySelector('.bar').style.width = (brakePedal*100) + '%';
  document.getElementById('pClutch').querySelector('.bar').style.width = (clutchPedal*100) + '%';
  acc += frame;
  var steps = 0;
  while (acc >= FIXED && steps < 12){ D.physics(FIXED); acc -= FIXED; steps++; }
  if (steps >= 12) acc = 0;
  drawEngine();
  drawGauge();
  spdEl.textContent = String(Math.round(D.speed));
  requestAnimationFrame(loop);
}

D.setGear(0);
drawEngine();
drawGauge();
requestAnimationFrame(loop);

} catch(e){
  errBox.style.display='block';
  errBox.textContent = 'render.js: ' + (e && e.message ? e.message : e);
}
})();