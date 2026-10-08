function drawEngine(){
  var c = ectx, W = ecv.width, H = ecv.height;
  c.clearRect(0,0,W,H);
  var bg = c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0e151d'); bg.addColorStop(1,'#070a0e');
  c.fillStyle = bg; c.fillRect(0,0,W,H);

  var isBroken = D.broken;

  /* ===== БЛОК ЦИЛИНДРОВ (с картером) ===== */
  var blockGrad = c.createLinearGradient(0,70,0,395);
  if (isBroken){
    blockGrad.addColorStop(0,'#3a2a2a');
    blockGrad.addColorStop(.45,'#2a1e1e');
    blockGrad.addColorStop(1,'#1a1212');
  } else {
    blockGrad.addColorStop(0,'#2b3746');
    blockGrad.addColorStop(.45,'#1d2733');
    blockGrad.addColorStop(1,'#131b24');
  }
  c.fillStyle = blockGrad;
  rr(c, 40, 72, 560, 320, 12); c.fill();
  c.strokeStyle = isBroken ? '#6a3a3a' : '#3a4a5c'; c.lineWidth = 2; c.stroke();

  /* ===== ГОЛОВКА БЛОКА ===== */
  var headGrad = c.createLinearGradient(0,60,0,120);
  headGrad.addColorStop(0, isBroken ? '#4a3030' : '#334252');
  headGrad.addColorStop(1, isBroken ? '#2a1c1c' : '#212b37');
  c.fillStyle = headGrad; rr(c, 40, 58, 560, 62, 10); c.fill();
  c.strokeStyle = isBroken ? '#7a3a3a' : '#42556b'; c.lineWidth = 2; c.stroke();

  /* ===== ПОДДОН ===== */
  c.fillStyle = isBroken ? '#1a1010' : '#121a22';
  rr(c, 55, 392, 530, 32, 8); c.fill();
  c.strokeStyle = isBroken ? '#3a2020' : '#2a3a4b'; c.lineWidth = 1.5; c.stroke();

  var rpm = D.rpm, throttle = D.throttle, crankAngle = D.crankAngle;
  var firing = D.running && !D.stalled && !isBroken;

  /* ===== КОЛЕНВАЛ ===== */
  c.fillStyle = 'rgba(0,0,0,0.4)';
  c.fillRect(60, crankY - 15, 520, 30);
  var shaftGrad = c.createLinearGradient(0, crankY - 12, 0, crankY + 12);
  if (isBroken){
    shaftGrad.addColorStop(0,'#3a2a2a');
    shaftGrad.addColorStop(.35,'#7a5a5a');
    shaftGrad.addColorStop(.55,'#5a4040');
    shaftGrad.addColorStop(1,'#2a1a1a');
  } else {
    shaftGrad.addColorStop(0,'#3d4a58');
    shaftGrad.addColorStop(.35,'#9aa8b8');
    shaftGrad.addColorStop(.55,'#7a8796');
    shaftGrad.addColorStop(1,'#232e3b');
  }
  c.fillStyle = shaftGrad;
  c.fillRect(60, crankY - 11, 520, 22);
  c.strokeStyle = '#0e151d'; c.lineWidth = 2;
  c.strokeRect(60, crankY - 11, 520, 22);

  /* ===== КОРЕННЫЕ ШЕЙКИ ===== */
  var mainCenters = [72, 180, 320, 460, 588];
  for (var mi = 0; mi < mainCenters.length; mi++){
    var mx = mainCenters[mi];
    var mg = c.createRadialGradient(mx-4, crankY-4, 2, mx, crankY, 16);
    if (isBroken){
      mg.addColorStop(0,'#8a6a6a'); mg.addColorStop(.6,'#5a4040'); mg.addColorStop(1,'#2a1a1a');
    } else {
      mg.addColorStop(0,'#b8c6d4'); mg.addColorStop(.6,'#6d7a89'); mg.addColorStop(1,'#3a4756');
    }
    c.fillStyle = mg;
    c.beginPath(); c.arc(mx, crankY, 15, 0, 7); c.fill();
    c.strokeStyle = '#1a232e'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#2a3543';
    c.beginPath(); c.arc(mx, crankY, 5, 0, 7); c.fill();
    c.strokeStyle = '#4d5b6b'; c.lineWidth = 1; c.stroke();
  }

  /* ===== ЦИЛИНДРЫ ===== */
  for (var i = 0; i < 4; i++){
    var cx = cylCenters[i];
    var cyc = crankAngle + offsets[i];
    var cycPos = ((cyc % (Math.PI*4)) + Math.PI*4) % (Math.PI*4);
    var stroke = Math.floor(cycPos / Math.PI);
    var s = Math.sin(cyc), co = Math.cos(cyc);
    var dist = CR * co + Math.sqrt(ROD*ROD - CR*CR*s*s);
    var pinY = crankY - dist;
    // сдвиг поршня при поломке
    var pinX = cx + (isBroken ? (i % 2 === 0 ? 7 : -7) : 0);
    var cpX = cx + CR * s;
    var cpY = crankY - CR * co;

    var boreGrad = c.createLinearGradient(cx-cylHalfW,0,cx+cylHalfW,0);
    boreGrad.addColorStop(0,'#070b10');
    boreGrad.addColorStop(.5, isBroken ? '#1a0e0e' : '#0e141c');
    boreGrad.addColorStop(1,'#070b10');
    c.fillStyle = boreGrad;
    c.fillRect(cx - cylHalfW, cylTopY, cylHalfW*2, cylBotY - cylTopY);
    c.strokeStyle = isBroken ? '#5a3030' : '#38495c'; c.lineWidth = 2;
    c.strokeRect(cx - cylHalfW, cylTopY, cylHalfW*2, cylBotY - cylTopY);

    var pistonTopY = pinY - 32;

    // вспышка только у живого
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

    // клапаны: если сломан — застряли открытыми
    var inLift = 0, exLift = 0;
    if (isBroken){
      inLift = 6; exLift = 8;
    } else if (D.running){
      if (stroke === 0) inLift = Math.sin(cycPos % Math.PI) * 9;
      if (stroke === 3) exLift = Math.sin(cycPos - 3*Math.PI) * 9;
    }
    drawValve(c, cx - 24, cylTopY, inLift, isBroken ? '#8a5a5a' : '#6fd0ff');
    drawValve(c, cx + 24, cylTopY, exLift, isBroken ? '#8a4a4a' : '#ff8a6f');

    // свеча
    c.fillStyle = isBroken ? '#7a5a5a' : '#c9d4e0';
    c.fillRect(cx - 4, cylTopY - 16, 8, 16);
    c.fillStyle = firing ? '#fff6c0' : (isBroken ? '#3a2020' : '#5a6572');
    c.beginPath(); c.arc(cx, cylTopY + 2, 3.2, 0, 7); c.fill();

    // противовес
    c.save();
    c.translate(cx, crankY);
    c.rotate(-cyc);
    c.fillStyle = isBroken ? '#3a2424' : '#2c3947';
    c.beginPath();
    c.arc(0, CR*0.5, 26, Math.PI*0.15, Math.PI*0.85);
    c.arc(0, 0, 28, Math.PI*0.85, Math.PI*0.15, true);
    c.closePath(); c.fill();
    c.strokeStyle = '#1a232e'; c.lineWidth = 1.5; c.stroke();
    c.restore();

    // ШАТУН — кривой если сломан
    c.strokeStyle = '#1f2833'; c.lineWidth = 16; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(pinX, pinY);
    if (isBroken){
      c.quadraticCurveTo((pinX + cpX)/2 + 10, (pinY + cpY)/2, cpX, cpY);
    } else {
      c.lineTo(cpX, cpY);
    }
    c.stroke();

    c.strokeStyle = isBroken ? '#7a5a5a' : '#96a4b4'; c.lineWidth = 11;
    c.beginPath();
    c.moveTo(pinX, pinY);
    if (isBroken){
      c.quadraticCurveTo((pinX + cpX)/2 + 10, (pinY + cpY)/2, cpX, cpY);
    } else {
      c.lineTo(cpX, cpY);
    }
    c.stroke();

    if (!isBroken){
      c.strokeStyle = 'rgba(220,230,240,0.7)'; c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(pinX + 2.5, pinY - 1);
      c.lineTo(cpX + 2.5, cpY - 1);
      c.stroke();
    }

    // ПОРШЕНЬ
    var pg = c.createLinearGradient(cx - cylHalfW + 2, 0, cx + cylHalfW - 2, 0);
    if (isBroken){
      pg.addColorStop(0,'#4a3838'); pg.addColorStop(.28,'#8a6a6a');
      pg.addColorStop(.55,'#6a4a4a'); pg.addColorStop(1,'#3a2828');
    } else {
      pg.addColorStop(0,'#5d6a79'); pg.addColorStop(.28,'#c3ceda');
      pg.addColorStop(.55,'#8b98a7'); pg.addColorStop(1,'#4c5866');
    }
    c.fillStyle = pg;
    // сломанный поршень слегка наклонён
    if (isBroken){
      c.save();
      c.translate(pinX, pinY - 8);
      c.rotate((i % 2 === 0 ? 1 : -1) * 0.08);
      c.translate(-pinX, -(pinY - 8));
      rr(c, cx - cylHalfW + 3, pinY - 32, (cylHalfW-3)*2, 48, 5); c.fill();
      c.strokeStyle = '#3a2020'; c.lineWidth = 1.5; c.stroke();
      c.restore();
    } else {
      rr(c, cx - cylHalfW + 3, pinY - 32, (cylHalfW-3)*2, 48, 5); c.fill();
      c.strokeStyle = '#2e3a47'; c.lineWidth = 1.5; c.stroke();
    }

    c.strokeStyle = isBroken ? '#5a3030' : '#39485a'; c.lineWidth = 2.5;
    for (var k = 0; k < 3; k++){
      c.beginPath();
      c.moveTo(cx - cylHalfW + 5, pinY - 24 + k*6);
      c.lineTo(cx + cylHalfW - 5, pinY - 24 + k*6);
      c.stroke();
    }
    c.fillStyle = '#2a3543';
    c.beginPath(); c.arc(pinX, pinY, 8, 0, 7); c.fill();
    c.strokeStyle = '#586a7d'; c.lineWidth = 1.5; c.stroke();

    // ШАТУННАЯ ШЕЙКА
    var pinG = c.createRadialGradient(cpX-5, cpY-5, 2, cpX, cpY, 14);
    if (isBroken){
      pinG.addColorStop(0,'#8a6a6a'); pinG.addColorStop(.5,'#6a4a4a'); pinG.addColorStop(1,'#2a1a1a');
    } else {
      pinG.addColorStop(0,'#d8e4f0'); pinG.addColorStop(.5,'#96a4b4'); pinG.addColorStop(1,'#4a5866');
    }
    c.fillStyle = pinG;
    c.beginPath(); c.arc(cpX, cpY, 13, 0, 7); c.fill();
    c.strokeStyle = '#1a232e'; c.lineWidth = 2.5; c.stroke();
    c.fillStyle = '#2a3543';
    c.beginPath(); c.arc(cpX - 4, cpY, 2.5, 0, 7); c.fill();
    c.beginPath(); c.arc(cpX + 4, cpY, 2.5, 0, 7); c.fill();

    /* --- Подписи --- */
    c.fillStyle = isBroken ? '#a05050' : '#4a5c70';
    c.font = 'bold 11px Segoe UI, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText('ЦИЛ. ' + (i+1), cx, 355);

    var names = ['ВПУСК','СЖАТИЕ','РАБОЧИЙ','ВЫПУСК'];
    var cols = ['#6fd0ff','#ffc93c','#ff6b3d','#9aa8b8'];
    if (isBroken){
      c.fillStyle = '#ff3b3b';
      c.font = 'bold 10px Segoe UI, sans-serif';
      c.fillText('ПОЛОМКА', cx, 372);
    } else {
      c.fillStyle = firing ? cols[stroke] : '#3d4a58';
      c.font = 'bold 10px Segoe UI, sans-serif';
      c.fillText(names[stroke], cx, 372);
    }

    // крестик поверх сломанного цилиндра
    if (isBroken){
      c.strokeStyle = 'rgba(255,50,50,0.85)';
      c.lineWidth = 3;
      var ccx = cx, ccy = (cylTopY + cylBotY) / 2;
      c.beginPath();
      c.moveTo(ccx - 20, ccy - 20); c.lineTo(ccx + 20, ccy + 20);
      c.moveTo(ccx + 20, ccy - 20); c.lineTo(ccx - 20, ccy + 20);
      c.stroke();
    }
  }

  /* ===== Нижние подписи ===== */
  c.textAlign = 'left';
  c.fillStyle = isBroken ? '#7a4040' : '#43566b';
  c.font = 'bold 10px Segoe UI, sans-serif';
  c.fillText('КОЛЕНЧАТЫЙ ВАЛ', 46, 415);
  c.textAlign = 'right';
  c.fillText('4 ЦИЛИНДРА  •  1-3-4-2', 594, 415);

  // Красный фильтр поверх всего при поломке
  if (isBroken){
    c.fillStyle = 'rgba(200,20,20,0.06)';
    c.fillRect(0,0,W,H);
  }
}