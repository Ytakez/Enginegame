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

function drawValve(c, x, by, lift, color){
  c.fillStyle='#3a4756'; c.fillRect(x-2, by-28, 4, 22);
  var y = by + lift;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x-6, y-3); c.lineTo(x+6, y-3); c.lineTo(x+3, y+6); c.lineTo(x-3, y+6);
  c.closePath(); c.fill();
  c.fillStyle='#2a3543'; c.fillRect(x-6, by-32, 12, 4);
}

function drawCylinder(c, cx, crankY, topY, botY, halfW, phase, CR, ROD, dir, isBroken, firing, throttle, num){
  var cycPos = ((phase % (Math.PI*4)) + Math.PI*4) % (Math.PI*4);
  var stroke = Math.floor(cycPos / Math.PI);
  var s = Math.sin(phase), co = Math.cos(phase);
  var sq = ROD*ROD - CR*CR*s*s;
  if (sq < 0) sq = 0;
  var dist = CR*co + Math.sqrt(sq);
  var pinY = crankY + dir * dist;
  var cpX = cx + CR * s;
  var cpY = crankY - CR * co;

  /* диск на коленвале */
  var diskR = Math.min(halfW * 0.55, CR * 1.3);
  if (diskR < 6) diskR = 6;
  var cg = c.createRadialGradient(cx-diskR*0.3, crankY-diskR*0.3, 1, cx, crankY, diskR);
  if (isBroken){
    cg.addColorStop(0,'#8a6a6a'); cg.addColorStop(.7,'#5a4040'); cg.addColorStop(1,'#2a1a1a');
  } else {
    cg.addColorStop(0,'#8e9aa9'); cg.addColorStop(.6,'#5a6775'); cg.addColorStop(1,'#2c3947');
  }
  c.fillStyle = cg;
  c.beginPath(); c.arc(cx, crankY, diskR, 0, 7); c.fill();
  c.strokeStyle = '#1a232e'; c.lineWidth = 1.5; c.stroke();

  /* гильза */
  var bg = c.createLinearGradient(cx-halfW, 0, cx+halfW, 0);
  bg.addColorStop(0,'#070b10');
  bg.addColorStop(.5, isBroken ? '#1a0e0e' : '#0e141c');
  bg.addColorStop(1,'#070b10');
  c.fillStyle = bg;
  c.fillRect(cx-halfW, topY, halfW*2, botY-topY);
  c.strokeStyle = isBroken ? '#5a3030' : '#38495c';
  c.lineWidth = 1.5;
  c.strokeRect(cx-halfW, topY, halfW*2, botY-topY);

  /* поршень */
  var pGrad = c.createLinearGradient(cx-halfW+2,0,cx+halfW-2,0);
  if (isBroken){
    pGrad.addColorStop(0,'#4a3838'); pGrad.addColorStop(.5,'#8a6a6a'); pGrad.addColorStop(1,'#3a2828');
  } else {
    pGrad.addColorStop(0,'#5d6a79'); pGrad.addColorStop(.28,'#c3ceda');
    pGrad.addColorStop(.55,'#8b98a7'); pGrad.addColorStop(1,'#4c5866');
  }
  c.fillStyle = pGrad;
  var pTop = dir < 0 ? pinY - 22 : pinY;
  rr(c, cx-halfW+2, pTop, (halfW-2)*2, 22, 3); c.fill();
  c.strokeStyle = '#2e3a47'; c.lineWidth = 1; c.stroke();
  c.strokeStyle = isBroken ? '#5a3030' : '#39485a'; c.lineWidth = 1.5;
  for (var k=0;k<2;k++){
    c.beginPath();
    c.moveTo(cx-halfW+4, pTop + 5 + k*5);
    c.lineTo(cx+halfW-4, pTop + 5 + k*5);
    c.stroke();
  }

  /* шатун */
  c.strokeStyle='#1f2833'; c.lineWidth = 8; c.lineCap='round';
  c.beginPath(); c.moveTo(cx, pinY);
  if (isBroken) c.quadraticCurveTo((cx+cpX)/2+5,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();
  c.strokeStyle = isBroken?'#7a5a5a':'#96a4b4'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(cx, pinY);
  if (isBroken) c.quadraticCurveTo((cx+cpX)/2+5,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();

  c.fillStyle='#2a3543';
  c.beginPath(); c.arc(cx, pinY, 3.5, 0, 7); c.fill();

  /* шатунная шейка */
  var pg = c.createRadialGradient(cpX-2,cpY-2,1,cpX,cpY,7);
  if (isBroken){ pg.addColorStop(0,'#8a6a6a'); pg.addColorStop(1,'#2a1a1a'); }
  else { pg.addColorStop(0,'#d8e4f0'); pg.addColorStop(.5,'#96a4b4'); pg.addColorStop(1,'#4a5866'); }
  c.fillStyle = pg;
  c.beginPath(); c.arc(cpX, cpY, 7, 0, 7); c.fill();
  c.strokeStyle='#1a232e'; c.lineWidth = 1.2; c.stroke();

  /* вспышка */
  if (firing){
    var d = cycPos - 2*Math.PI;
    var inten = Math.max(0, 1 - Math.abs(d)/1.25) * (0.35 + 0.65*throttle);
    if (inten > 0.01){
      var flashY = dir < 0 ? topY + 16 : botY - 16;
      var grad = c.createRadialGradient(cx, flashY, 2, cx, flashY, halfW*1.8);
      grad.addColorStop(0,'rgba(255,255,220,'+(0.95*inten)+')');
      grad.addColorStop(0.3,'rgba(255,175,50,'+(0.85*inten)+')');
      grad.addColorStop(0.65,'rgba(255,80,20,'+(0.45*inten)+')');
      grad.addColorStop(1,'rgba(120,20,0,0)');
      c.save();
      c.beginPath();
      if (dir < 0){
        c.rect(cx-halfW, topY, halfW*2, Math.max(4, pTop-topY+4));
      } else {
        c.rect(cx-halfW, pTop+22, halfW*2, Math.max(4, botY-pTop-22));
      }
      c.clip();
      c.fillStyle = grad;
      c.fillRect(cx-halfW*2, topY, halfW*4, botY-topY);
      c.restore();
    }
  }

  /* клапаны и свеча */
  var inL=0, exL=0;
  if (isBroken){ inL=5; exL=6; }
  else if (S.running){
    if (stroke===0) inL = Math.sin(cycPos % Math.PI) * 5;
    if (stroke===3) exL = Math.sin(cycPos - 3*Math.PI) * 5;
  }

  if (dir < 0){
    drawValve(c, cx-halfW*0.5, topY, inL, isBroken?'#8a5a5a':'#6fd0ff');
    drawValve(c, cx+halfW*0.5, topY, exL, isBroken?'#8a4a4a':'#ff8a6f');
    c.fillStyle = isBroken ? '#7a5a5a' : '#c9d4e0';
    c.fillRect(cx-2, topY-12, 4, 12);
  } else {
    c.save();
    c.translate(cx, botY);
    c.rotate(Math.PI);
    c.translate(-cx, -botY);
    drawValve(c, cx-halfW*0.5, botY, inL, isBroken?'#8a5a5a':'#6fd0ff');
    drawValve(c, cx+halfW*0.5, botY, exL, isBroken?'#8a4a4a':'#ff8a6f');
    c.restore();
    c.fillStyle = isBroken ? '#7a5a5a' : '#c9d4e0';
    c.fillRect(cx-2, botY, 4, 12);
  }

  c.fillStyle = isBroken ? '#a05050' : '#4a5c70';
  c.font = 'bold 9px Segoe UI, sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  var numY = dir < 0 ? topY - 20 : botY + 20;
  c.fillText('Ц.'+num, cx, numY);

  if (isBroken){
    c.strokeStyle = 'rgba(255,50,50,0.85)'; c.lineWidth = 2;
    var ccy = (topY+botY)/2;
    c.beginPath();
    c.moveTo(cx-8, ccy-8); c.lineTo(cx+8, ccy+8);
    c.moveTo(cx+8, ccy-8); c.lineTo(cx-8, ccy+8);
    c.stroke();
  }
}

function drawCrankShaft(c, x1, x2, y, isBroken){
  c.fillStyle='rgba(0,0,0,0.4)';
  c.fillRect(x1, y-10, x2-x1, 20);
  var sg = c.createLinearGradient(0, y-8, 0, y+8);
  if (isBroken){ sg.addColorStop(0,'#3a2a2a'); sg.addColorStop(.5,'#7a5a5a'); sg.addColorStop(1,'#2a1a1a'); }
  else { sg.addColorStop(0,'#3d4a58'); sg.addColorStop(.5,'#9aa8b8'); sg.addColorStop(1,'#232e3b'); }
  c.fillStyle = sg; c.fillRect(x1, y-7, x2-x1, 14);
  c.strokeStyle='#0e151d'; c.lineWidth = 1.5;
  c.strokeRect(x1, y-7, x2-x1, 14);
}

function drawScooter(){
  var c = ectx, W = ecv.width, H = ecv.height;
  var isBroken = S.broken;
  var cx = W/2;
  var crankY = 355, CR = 42, ROD = 118;
  var halfW = 78, topY = 110, botY = 340;

  // корпус
  var bg = c.createLinearGradient(0, 50, 0, H-20);
  if (isBroken){ bg.addColorStop(0,'#3a2a2a'); bg.addColorStop(.5,'#2a1e1e'); bg.addColorStop(1,'#1a1212'); }
  else { bg.addColorStop(0,'#2b3746'); bg.addColorStop(.5,'#1d2733'); bg.addColorStop(1,'#131b24'); }
  c.fillStyle = bg; rr(c, 90, 50, W-180, H-100, 14); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  // головка блока (маленькая сверху)
  var headG = c.createLinearGradient(0, 40, 0, 80);
  if (isBroken){ headG.addColorStop(0,'#4a3030'); headG.addColorStop(1,'#2a1c1c'); }
  else { headG.addColorStop(0,'#334252'); headG.addColorStop(1,'#212b37'); }
  c.fillStyle = headG;
  rr(c, cx-70, 40, 140, 40, 8); c.fill();
  c.strokeStyle = isBroken?'#7a3a3a':'#42556b'; c.lineWidth = 2; c.stroke();

  // коленвал
  drawCrankShaft(c, 130, W-130, crankY, isBroken);

  // коренные шейки (края)
  var mains = [140, W-140];
  for (var mi=0; mi<mains.length; mi++){
    var mx = mains[mi];
    var mg = c.createRadialGradient(mx-4, crankY-4, 2, mx, crankY, 14);
    if (isBroken){ mg.addColorStop(0,'#8a6a6a'); mg.addColorStop(.6,'#5a4040'); mg.addColorStop(1,'#2a1a1a'); }
    else { mg.addColorStop(0,'#b8c6d4'); mg.addColorStop(.6,'#6d7a89'); mg.addColorStop(1,'#3a4756'); }
    c.fillStyle = mg;
    c.beginPath(); c.arc(mx, crankY, 14, 0, 7); c.fill();
    c.strokeStyle='#1a232e'; c.lineWidth = 1.5; c.stroke();
  }

  // один цилиндр (свеча + 2 клапана сверху)
  drawCylinder(c, cx, crankY, topY, botY, halfW,
    S.crankAngle, CR, ROD, -1,
    isBroken, S.running && !S.stalled && !isBroken, S.throttle, 1);

  // подпись
  c.fillStyle = isBroken ? '#8a5a5a' : '#5d7189';
  c.font = 'bold 11px Segoe UI, sans-serif';
  c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText('S1  •  1 цилиндр  •  4-тактный', 105, 60);

  c.textAlign = 'right';
  c.font = 'bold 10px Segoe UI, sans-serif';
  c.fillStyle = '#3d4a58';
  c.fillText('СКУТЕР 50cc', W-105, 62);
}

function drawR4(){
  var c = ectx, W = ecv.width;
  var isBroken = S.broken;
  var crankY = 290, CR = 33, ROD = 98;
  var xs = [110, 250, 390, 530];
  var halfW = 46, topY = 120, botY = 272;
  var offs = [2*Math.PI, 3*Math.PI, Math.PI, 0];

  var bg = c.createLinearGradient(0,60,0,395);
  if (isBroken){ bg.addColorStop(0,'#3a2a2a'); bg.addColorStop(.5,'#2a1e1e'); bg.addColorStop(1,'#1a1212'); }
  else { bg.addColorStop(0,'#2b3746'); bg.addColorStop(.5,'#1d2733'); bg.addColorStop(1,'#131b24'); }
  c.fillStyle = bg; rr(c, 30, 60, 580, 330, 10); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  drawCrankShaft(c, 50, 590, crankY, isBroken);

  var mains = [65, 180, 320, 460, 578];
  for (var mi=0; mi<mains.length; mi++){
    var mx = mains[mi];
    var mg = c.createRadialGradient(mx-3, crankY-3, 1, mx, crankY, 10);
    if (isBroken){ mg.addColorStop(0,'#8a6a6a'); mg.addColorStop(.6,'#5a4040'); mg.addColorStop(1,'#2a1a1a'); }
    else { mg.addColorStop(0,'#b8c6d4'); mg.addColorStop(.6,'#6d7a89'); mg.addColorStop(1,'#3a4756'); }
    c.fillStyle = mg;
    c.beginPath(); c.arc(mx, crankY, 10, 0, 7); c.fill();
    c.strokeStyle='#1a232e'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle='#2a3543';
    c.beginPath(); c.arc(mx, crankY, 3.5, 0, 7); c.fill();
  }

  for (var i=0;i<4;i++){
    drawCylinder(c, xs[i], crankY, topY, botY, halfW,
      S.crankAngle + offs[i], CR, ROD, -1,
      isBroken, S.running && !S.stalled && !isBroken, S.throttle, i+1);
  }

  c.fillStyle = isBroken ? '#8a5a5a' : '#5d7189';
  c.font = 'bold 11px Segoe UI, sans-serif';
  c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText('R4  •  4 цилиндра в ряд', 45, 70);
}

function drawV(n){
  var c = ectx;
  var W = ecv.width;
  var isBroken = S.broken;
  var crankY = 215;

  var CR, ROD, halfW, spacing;
  if (n === 8){
    CR = 13; ROD = 34; halfW = 20; spacing = 120;
  } else {
    CR = 8; ROD = 22; halfW = 13; spacing = 62;
  }
  var startX = W/2 - (n-1)*spacing/2;
  var topTopY = 55, topBotY = 195;
  var botTopY = 235, botBotY = 375;

  var bg1 = c.createLinearGradient(0, topTopY-15, 0, topBotY+5);
  if (isBroken){ bg1.addColorStop(0,'#3a2a2a'); bg1.addColorStop(1,'#1a1212'); }
  else { bg1.addColorStop(0,'#2b3746'); bg1.addColorStop(1,'#131b24'); }
  c.fillStyle = bg1;
  rr(c, 15, topTopY-15, W-30, topBotY-topTopY+20, 10); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  var bg2 = c.createLinearGradient(0, botTopY-15, 0, botBotY+15);
  if (isBroken){ bg2.addColorStop(0,'#3a2a2a'); bg2.addColorStop(1,'#1a1212'); }
  else { bg2.addColorStop(0,'#2b3746'); bg2.addColorStop(1,'#131b24'); }
  c.fillStyle = bg2;
  rr(c, 15, botTopY-15, W-30, botBotY-botTopY+20, 10); c.fill();
  c.strokeStyle = isBroken?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  drawCrankShaft(c, 30, W-30, crankY, isBroken);

  var cnt = n + 1;
  for (var mi=0; mi<=cnt; mi++){
    var mx = 40 + mi * ((W-80) / cnt);
    var mg = c.createRadialGradient(mx-3, crankY-3, 1, mx, crankY, 8);
    if (isBroken){ mg.addColorStop(0,'#8a6a6a'); mg.addColorStop(1,'#2a1a1a'); }
    else { mg.addColorStop(0,'#b8c6d4'); mg.addColorStop(.6,'#6d7a89'); mg.addColorStop(1,'#3a4756'); }
    c.fillStyle = mg;
    c.beginPath(); c.arc(mx, crankY, 7, 0, 7); c.fill();
  }

  for (var i=0;i<n;i++){
    var cx = startX + i*spacing;
    drawCylinder(c, cx, crankY, topTopY, topBotY, halfW,
      S.crankAngle + (i*4*Math.PI/n), CR, ROD, -1,
      isBroken, S.running && !S.stalled && !isBroken, S.throttle, i+1);
  }
  for (var j=0;j<n;j++){
    var cx2 = startX + j*spacing;
    drawCylinder(c, cx2, crankY, botTopY, botBotY, halfW,
      S.crankAngle + ((j+n)*4*Math.PI/n), CR, ROD, 1,
      isBroken, S.running && !S.stalled && !isBroken, S.throttle, j+n+1);
  }

  c.fillStyle = isBroken ? '#8a5a5a' : '#5d7189';
  c.font = 'bold 11px Segoe UI, sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'top';
  c.fillText(n===8 ? 'V8  •  8 цилиндров' : 'V16  •  16 цилиндров', W/2, 25);
}

function drawEngine(){
  var c = ectx, W = ecv.width, H = ecv.height;
  c.clearRect(0,0,W,H);
  var bg = c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0e151d'); bg.addColorStop(1,'#070a0e');
  c.fillStyle = bg; c.fillRect(0,0,W,H);

  var t = S.engineType;
  if (t === 'scooter') drawScooter();
  else if (t === 'v8') drawV(8);
  else if (t === 'v16') drawV(16);
  else drawR4();

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
  var E = S.engines[S.engineType] || S.engines.r4;
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

  for (var i=0;i<=10;i++){
    var a = a0 + (i/10)*(a1-a0);
    var x1 = cx + Math.cos(a)*(R-9), y1 = cy + Math.sin(a)*(R-9);
    var x2 = cx + Math.cos(a)*(R-19), y2 = cy + Math.sin(a)*(R-19);
    c.strokeStyle = (i*MAXR/10 >= redline) ? '#ff6b6b' : '#4d6379';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
    var tx = cx + Math.cos(a)*(R-33), ty = cy + Math.sin(a)*(R-33);
    c.fillStyle = (i*MAXR/10 >= redline) ? '#ff8b8b' : '#6d8299';
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

function paint(){
  if (!ecv) init();
  if (!ecv) return;
  drawEngine();
  drawGauge();
}

window.DVS_RENDER = { draw: paint, init: init };
init();

})();