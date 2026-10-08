(function(){
"use strict";
var S = window.S;
if (!S) return;
var ecv, ectx, gcv, gctx;
var MAXR = 9000;

function init(){
  ecv = document.getElementById('engineCv');
  if (!ecv) return;
  ectx = ecv.getContext('2d');
  gcv = document.getElementById('gaugeCv');
  if (gcv) gctx = gcv.getContext('2d');
}

function rr(c,x,y,w,h,r){
  c.beginPath(); c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();
}

function drawValve(c, x, by, lift, color){
  c.fillStyle='#3a4756'; c.fillRect(x-3, by-38, 6, 28);
  var y = by + lift;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x-7, y-3); c.lineTo(x+7, y-3); c.lineTo(x+3, y+7); c.lineTo(x-3, y+7);
  c.closePath(); c.fill();
  c.fillStyle='#2a3543'; c.fillRect(x-7, by-42, 14, 5);
}

function drawOneCylinder(c, opts){
  // opts: cx, crankY, cylTopY, cylBotY, halfW, phase, CR, ROD, dir(-1 верх / +1 низ), isBroken, firing, throttle
  var cx=opts.cx, crankY=opts.crankY, topY=opts.cylTopY, botY=opts.cylBotY;
  var halfW=opts.halfW, phase=opts.phase, CR=opts.CR, ROD=opts.ROD;
  var dir=opts.dir, isBroken=opts.isBroken, firing=opts.firing, throttle=opts.throttle;
  var badgeOffset = opts.badgeOffset||0;

  var cycPos = ((phase % (Math.PI*4)) + Math.PI*4) % (Math.PI*4);
  var stroke = Math.floor(cycPos / Math.PI);
  var s = Math.sin(phase), co = Math.cos(phase);
  var dist = CR*co + Math.sqrt(Math.max(0, ROD*ROD - CR*CR*s*s));
  var pinY = crankY + dir * dist;
  var cpX = cx + CR * s;
  var cpY = crankY - CR * co;

  // гильза
  var bg = c.createLinearGradient(cx-halfW, 0, cx+halfW, 0);
  bg.addColorStop(0,'#070b10');
  bg.addColorStop(.5, isBroken ? '#1a0e0e' : '#0e141c');
  bg.addColorStop(1,'#070b10');
  c.fillStyle = bg;
  c.fillRect(cx-halfW, topY, halfW*2, botY-topY);
  c.strokeStyle = isBroken ? '#5a3030' : '#38495c'; c.lineWidth = 2;
  c.strokeRect(cx-halfW, topY, halfW*2, botY-topY);

  // вспышка
  var pTop = pinY + (dir<0 ? -28 : 28);
  if (firing){
    var d = cycPos - 2*Math.PI;
    var inten = Math.max(0, 1 - Math.abs(d)/1.25) * (0.35 + 0.65*throttle);
    if (inten > 0.01){
      var flashY = dir<0 ? topY+20 : botY-20;
      var grad = c.createRadialGradient(cx, flashY, 2, cx, flashY, halfW*1.6);
      grad.addColorStop(0,'rgba(255,255,220,'+(0.95*inten)+')');
      grad.addColorStop(0.3,'rgba(255,175,50,'+(0.85*inten)+')');
      grad.addColorStop(0.65,'rgba(255,80,20,'+(0.45*inten)+')');
      grad.addColorStop(1,'rgba(120,20,0,0)');
      c.save();
      c.beginPath();
      var clipY = dir<0 ? topY : pTop;
      var clipH = dir<0 ? Math.max(4, pTop-topY+6) : Math.max(4, botY-pTop-6);
      c.rect(cx-halfW, clipY, halfW*2, clipH);
      c.clip();
      c.fillStyle = grad;
      c.fillRect(cx-halfW, clipY, halfW*2, clipH);
      c.restore();
    }
  }

  // клапаны
  var inL=0, exL=0;
  if (isBroken){ inL=5; exL=6; }
  else if (S.running){
    if (stroke===0) inL = Math.sin(cycPos % Math.PI)*7;
    if (stroke===3) exL = Math.sin(cycPos - 3*Math.PI)*7;
  }
  var vBase = dir<0 ? topY : botY;
  if (dir<0){
    drawValve(c, cx-halfW*0.55, vBase, inL, isBroken?'#8a5a5a':'#6fd0ff');
    drawValve(c, cx+halfW*0.55, vBase, exL, isBroken?'#8a4a4a':'#ff8a6f');
  } else {
    // для нижних цилиндров клапаны снизу — зеркалим
    c.save(); c.translate(cx, vBase); c.rotate(Math.PI); c.translate(-cx, -vBase);
    drawValve(c, cx-halfW*0.55, vBase-14, inL, isBroken?'#8a5a5a':'#6fd0ff');
    drawValve(c, cx+halfW*0.55, vBase-14, exL, isBroken?'#8a4a4a':'#ff8a6f');
    c.restore();
  }

  // свеча
  var sparkY = dir<0 ? topY-14 : botY+14;
  c.fillStyle = isBroken ? '#7a5a5a' : '#c9d4e0';
  c.fillRect(cx-3, sparkY-8, 6, 16);
  c.fillStyle = firing ? '#fff6c0' : (isBroken?'#3a2020':'#5a6572');
  c.beginPath(); c.arc(cx, dir<0?topY+2:botY-2, 2.6, 0, 7); c.fill();

  // шатун
  c.strokeStyle='#1f2833'; c.lineWidth = 10; c.lineCap='round';
  c.beginPath(); c.moveTo(cx, pinY);
  if (isBroken) c.quadraticCurveTo((cx+cpX)/2+6,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();
  c.strokeStyle = isBroken?'#7a5a5a':'#96a4b4'; c.lineWidth = 7;
  c.beginPath(); c.moveTo(cx, pinY);
  if (isBroken) c.quadraticCurveTo((cx+cpX)/2+6,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();

  // поршень
  var pGrad = c.createLinearGradient(cx-halfW+2,0,cx+halfW-2,0);
  if (isBroken){
    pGrad.addColorStop(0,'#4a3838'); pGrad.addColorStop(.28,'#8a6a6a');
    pGrad.addColorStop(.55,'#6a4a4a'); pGrad.addColorStop(1,'#3a2828');
  } else {
    pGrad.addColorStop(0,'#5d6a79'); pGrad.addColorStop(.28,'#c3ceda');
    pGrad.addColorStop(.55,'#8b98a7'); pGrad.addColorStop(1,'#4c5866');
  }
  c.fillStyle = pGrad;
  var pistonTop = dir<0 ? pinY-26 : pinY;
  rr(c, cx-halfW+3, pistonTop, (halfW-3)*2, 26, 4); c.fill();
  c.strokeStyle = '#2e3a47'; c.lineWidth = 1.2; c.stroke();
  // кольца
  c.strokeStyle = isBroken?'#5a3030':'#39485a'; c.lineWidth = 2;
  for (var k=0;k<2;k++){
    c.beginPath();
    c.moveTo(cx-halfW+5, pistonTop + 6 + k*5);
    c.lineTo(cx+halfW-5, pistonTop + 6 + k*5);
    c.stroke();
  }
  // палец
  c.fillStyle='#2a3543';
  c.beginPath(); c.arc(cx, pinY, 5, 0, 7); c.fill();
  c.strokeStyle='#586a7d'; c.lineWidth = 1; c.stroke();

  // шейка коленвала
  var pg = c.createRadialGradient(cpX-3,cpY-3,1,cpX,cpY,10);
  if (isBroken){ pg.addColorStop(0,'#8a6a6a'); pg.addColorStop(1,'#2a1a1a'); }
  else { pg.addColorStop(0,'#d8e4f0'); pg.addColorStop(.5,'#96a4b4'); pg.addColorStop(1,'#4a5866'); }
  c.fillStyle = pg;
  c.beginPath(); c.arc(cpX, cpY, 9, 0, 7); c.fill();
  c.strokeStyle='#1a232e'; c.lineWidth = 1.5; c.stroke();

  // номер цилиндра
  var numY = dir<0 ? topY-22 : botY+28;
  c.fillStyle = isBroken ? '#a05050' : '#4a5c70';
  c.font = 'bold 9px Segoe UI, sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('ЦИЛ.'+(opts.num||''), cx, numY);

  // красный крестик при поломке
  if (isBroken){
    c.strokeStyle = 'rgba(255,50,50,0.8)'; c.lineWidth = 2.5;
    var ccy = (topY+botY)/2;
    c.beginPath();
    c.moveTo(cx-12, ccy-12); c.lineTo(cx+12, ccy+12);
    c.moveTo(cx+12, ccy-12); c.lineTo(cx-12, ccy+12);
    c.stroke();
  }
}

function drawBlock(c, x, y, w, h, isBroken, label){
  var g = c.createLinearGradient(x, y, x, y+h);
  if (isBroken){ g.addColorStop(0,'#3a2a2a'); g.addColorStop(.5,'#2a1e1e'); g.addColorStop(1,'#1a1212'); }
  else { g.addColorStop(0,'#2b3746'); g.addColorStop(.5,'#1d2733'); g.addColorStop(1,'#131b24'); }
  c.fillStyle = g;
  rr(c, x, y, w, h, 10); c.fill();
  c.strokeStyle = isBroken ? '#6a3a3a' : '#3a4a5c'; c.lineWidth = 2; c.stroke();

  if (label){
    c.fillStyle = isBroken ? '#8a5a5a' : '#5d7189';
    c.font = 'bold 10px Segoe UI, sans-serif';
    c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText(label, x + 10, y + 8);
  }
}

function drawR4(){
  var c = ectx, W = ecv.width, H = ecv.height;
  var isBroken = S.broken;
  var crankY = 290, CR = 33, ROD = 98;
  var centers = [110, 250, 390, 530];
  var halfW = 46, topY = 120, botY = 272;
  var offs = [2*Math.PI, 3*Math.PI, Math.PI, 0];

  drawBlock(c, 30, 60, 580, 330, isBroken, 'R4  •  4 ЦИЛИНДРА');
  // коленвал
  c.fillStyle='rgba(0,0,0,0.4)'; c.fillRect(50, crankY-14, 540, 28);
  var sg = c.createLinearGradient(0, crankY-11, 0, crankY+11);
  if (isBroken){ sg.addColorStop(0,'#3a2a2a'); sg.addColorStop(.5,'#7a5a5a'); sg.addColorStop(1,'#2a1a1a'); }
  else { sg.addColorStop(0,'#3d4a58'); sg.addColorStop(.5,'#9aa8b8'); sg.addColorStop(1,'#232e3b'); }
  c.fillStyle = sg; c.fillRect(50, crankY-10, 540, 20);
  c.strokeStyle='#0e151d'; c.lineWidth = 2; c.strokeRect(50, crankY-10, 540, 20);

  var mains = [62, 180, 320, 460, 578];
  for (var mi=0; mi<mains.length; mi++){
    var mx = mains[mi];
    var mg = c.createRadialGradient(mx-4, crankY-4, 2, mx, crankY, 14);
    if (isBroken){ mg.addColorStop(0,'#8a6a6a'); mg.addColorStop(.6,'#5a4040'); mg.addColorStop(1,'#2a1a1a'); }
    else { mg.addColorStop(0,'#b8c6d4'); mg.addColorStop(.6,'#6d7a89'); mg.addColorStop(1,'#3a4756'); }
    c.fillStyle = mg;
    c.beginPath(); c.arc(mx, crankY, 13, 0, 7); c.fill();
    c.strokeStyle='#1a232e'; c.lineWidth = 2; c.stroke();
  }

  for (var i=0; i<4; i++){
    drawOneCylinder(c, {
      cx: centers[i], crankY: crankY, cylTopY: topY, cylBotY: botY,
      halfW: halfW, phase: S.crankAngle + offs[i],
      CR: CR, ROD: ROD, dir: -1,
      isBroken: isBroken, firing: S.running && !S.stalled && !isBroken,
      throttle: S.throttle, num: i+1
    });
  }
}

function drawV(n){
  var c = ectx, W = ecv.width, H = ecv.height;
  var isBroken = S.broken;
  var crankY = 215;
  var CR = n===6 ? 22 : 16;
  var ROD = n===6 ? 65 : 50;
  var topHalfW = n===6 ? 34 : 24;
  var botHalfW = n===6 ? 34 : 24;
  var spacing = n===6 ? 150 : 85;
  var startX = 320 - (n-1)*spacing/2;
  var topTopY = 45, topBotY = 180;
  var botTopY = 250, botBotY = 385;
  var label = n===6 ? 'V6  •  6 ЦИЛИНДРОВ' : 'V12  •  12 ЦИЛИНДРОВ';

  // два блока
  drawBlock(c, 20, 30, 600, 175, isBroken, null);
  drawBlock(c, 20, 235, 600, 175, isBroken, label);

  // центральный коленвал
  c.fillStyle='rgba(0,0,0,0.4)'; c.fillRect(30, crankY-11, 580, 22);
  var sg = c.createLinearGradient(0, crankY-9, 0, crankY+9);
  if (isBroken){ sg.addColorStop(0,'#3a2a2a'); sg.addColorStop(.5,'#7a5a5a'); sg.addColorStop(1,'#2a1a1a'); }
  else { sg.addColorStop(0,'#3d4a58'); sg.addColorStop(.5,'#9aa8b8'); sg.addColorStop(1,'#232e3b'); }
  c.fillStyle = sg; c.fillRect(30, crankY-8, 580, 16);
  c.strokeStyle='#0e151d'; c.lineWidth = 1.5; c.strokeRect(30, crankY-8, 580, 16);

  // коренные шейки
  var mainStep = (600) / (n+1);
  for (var mi=0; mi<=n+1; mi++){
    var mx = 40 + mi*mainStep;
    var mg = c.createRadialGradient(mx-3, crankY-3, 1, mx, crankY, 10);
    if (isBroken){ mg.addColorStop(0,'#8a6a6a'); mg.addColorStop(1,'#2a1a1a'); }
    else { mg.addColorStop(0,'#b8c6d4'); mg.addColorStop(.6,'#6d7a89'); mg.addColorStop(1,'#3a4756'); }
    c.fillStyle = mg;
    c.beginPath(); c.arc(mx, crankY, 9, 0, 7); c.fill();
  }

  // фазы: верхний ряд — 4-тактный порядок, нижний — со сдвигом
  for (var i=0; i<n; i++){
    var cx = startX + i*spacing;
    // верхний цилиндр
    drawOneCylinder(c, {
      cx: cx, crankY: crankY, cylTopY: topTopY, cylBotY: topBotY,
      halfW: topHalfW, phase: S.crankAngle + i*Math.PI*4/n,
      CR: CR, ROD: ROD, dir: -1,
      isBroken: isBroken, firing: S.running && !S.stalled && !isBroken,
      throttle: S.throttle, num: i+1
    });
    // нижний цилиндр
    drawOneCylinder(c, {
      cx: cx, crankY: crankY, cylTopY: botTopY, cylBotY: botBotY,
      halfW: botHalfW, phase: S.crankAngle + (i+n)*Math.PI*4/n,
      CR: CR, ROD: ROD, dir: 1,
      isBroken: isBroken, firing: S.running && !S.stalled && !isBroken,
      throttle: S.throttle, num: i+1+n
    });
  }
}

function drawEngine(){
  var c = ectx, W = ecv.width, H = ecv.height;
  c.clearRect(0,0,W,H);
  var bg = c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0e151d'); bg.addColorStop(1,'#070a0e');
  c.fillStyle = bg; c.fillRect(0,0,W,H);

  var t = S.engineType;
  if (t === 'v6') drawV(6);
  else if (t === 'v12') drawV(12);
  else drawR4();

  c.textAlign='left';
  c.fillStyle = S.broken ? '#7a4040' : '#43566b';
  c.font = 'bold 10px Segoe UI, sans-serif';
  c.textBaseline = 'bottom';
  c.fillText('КОЛЕНЧАТЫЙ ВАЛ  •  ' + (S.engines[S.engineType].name), 40, H-6);
  c.textAlign='right';
  c.fillText('4-ТАКТНЫЙ  •  1-3-4-2', W-40, H-6);

  if (S.broken){
    c.fillStyle='rgba(200,20,20,0.06)';
    c.fillRect(0,0,W,H);
  }
}

function drawGauge(){
  if (!gctx) return;
  var c = gctx, W = gcv.width, H = gcv.height;
  c.clearRect(0,0,W,H);
  var cx = W/2, cy = H - 20, R = Math.min(W/2 - 14, H - 44);
  var a0 = Math.PI, a1 = Math.PI*2;
  var E = S.engines[S.engineType];
  var redline = E.redline;
  var rpm = S.rpm;

  c.lineWidth = 13; c.lineCap = 'butt';
  c.strokeStyle = '#151f2b';
  c.beginPath(); c.arc(cx, cy, R, a0, a1); c.stroke();

  var rA = a0 + (redline/MAXR)*(a1-a0);
  c.strokeStyle = 'rgba(255,70,70,.4)';
  c.beginPath(); c.arc(cx, cy, R, rA, a1); c.stroke();

  var rp = Math.min(rpm, MAXR);
  var curA = a0 + (rp/MAXR)*(a1-a0);
  var g = c.createLinearGradient(cx-R,0,cx+R,0);
  g.addColorStop(0,'#28d17c'); g.addColorStop(.55,'#ffc93c'); g.addColorStop(1,'#ff3b3b');
  c.strokeStyle = g; c.lineWidth = 13;
  c.beginPath(); c.arc(cx, cy, R, a0, curA); c.stroke();

  for (var i=0;i<=9;i++){
    var a = a0 + (i/9)*(a1-a0);
    var x1 = cx + Math.cos(a)*(R-9), y1 = cy + Math.sin(a)*(R-9);
    var x2 = cx + Math.cos(a)*(R-19), y2 = cy + Math.sin(a)*(R-19);
    c.strokeStyle = (i*MAXR/9 >= redline) ? '#ff6b6b' : '#4d6379';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
    var tx = cx + Math.cos(a)*(R-33), ty = cy + Math.sin(a)*(R-33);
    c.fillStyle = (i*MAXR/9 >= redline) ? '#ff8b8b' : '#6d8299';
    c.font = 'bold 10px Segoe UI, sans-serif';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(String(i), tx, ty);
  }

  var na = a0 + (rp/MAXR)*(a1-a0);
  c.save(); c.translate(cx,cy); c.rotate(na);
  var ng = c.createLinearGradient(0,0,R,0);
  ng.addColorStop(0,'#ff5b5b'); ng.addColorStop(1,'#ffb0b0');
  c.fillStyle = ng;
  c.beginPath();
  c.moveTo(-12,-4); c.lineTo(R-22,-2); c.lineTo(R-16,0); c.lineTo(R-22,2); c.lineTo(-12,4);
  c.closePath(); c.fill(); c.restore();

  c.fillStyle='#1b2531';
  c.beginPath(); c.arc(cx,cy,13,0,7); c.fill();
  c.strokeStyle='#3a4d61'; c.lineWidth = 2; c.stroke();

  var rc = rpm > redline ? '#ff5b5b' : (rpm > redline*0.85 ? '#ffc93c' : '#9fe8c0');
  c.fillStyle = rc;
  c.font = 'bold 24px Segoe UI, sans-serif';
  c.textAlign='center'; c.textBaseline='alphabetic';
  c.fillText(String(Math.round(rpm)), cx, cy-26);
  c.fillStyle='#4f6277';
  c.font = 'bold 9px Segoe UI, sans-serif';
  c.fillText('ОБ/МИН', cx, cy-14);
}

window.DVS_RENDER = {
  init: init,
  draw: function(){ if (!ecv) init(); if (ecv) { drawEngine(); drawGauge(); } }
};
init();
})();