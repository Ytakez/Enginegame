(function(){
var RE = window.RE = window.RE || {};
var RB = window.RB;
if (!RB) return;

RE.drawGalant6 = function(c, S){
  var W = c.canvas.width;
  var br = S.broken;
  var crankY = 215;

  // 3 цилиндра сверху + 3 снизу = 6 всего
  var CR = 16, ROD = 38, halfW = 26, spacing = 140;
  var startX = W/2 - spacing;

  // Верхний блок
  var pg1 = c.createLinearGradient(0, 40, 0, 200);
  if (br){ pg1.addColorStop(0,'#3a2424'); pg1.addColorStop(1,'#1a0a0a'); }
  else { pg1.addColorStop(0,'#2b3746'); pg1.addColorStop(1,'#131b24'); }
  c.fillStyle = pg1;
  RB.rr(c, 15, 35, W-30, 175, 10); c.fill();
  c.strokeStyle = br?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  // Нижний блок
  var pg2 = c.createLinearGradient(0, 220, 0, 400);
  if (br){ pg2.addColorStop(0,'#3a2424'); pg2.addColorStop(1,'#1a0a0a'); }
  else { pg2.addColorStop(0,'#2b3746'); pg2.addColorStop(1,'#131b24'); }
  c.fillStyle = pg2;
  RB.rr(c, 15, 220, W-30, 175, 10); c.fill();
  c.strokeStyle = br?'#6a3a3a':'#3a4a5c'; c.lineWidth = 2; c.stroke();

  // Коленвал в центре
  RB.drawCrank(c, 30, W-30, crankY, br);

  // 5 коренных опор
  for (var m = 0; m <= 4; m++){
    var mx = 40 + m * ((W-80) / 4);
    RB.drawMainBearing(c, mx, crankY, 10, br);
  }

  // ВЕРХНИЙ РЯД — 3 цилиндра (номера 1, 2, 3)
  for (var i = 0; i < 3; i++){
    var cx = startX + i * spacing;
    RE.drawCyl(c, S, cx, crankY, 75, 195, halfW,
      S.crankAngle + (i * 4 * Math.PI / 3),
      CR, ROD, -1,
      br, S.running && !S.stalled && !br, S.throttle,
      i + 1, 60);
  }

  // НИЖНИЙ РЯД — 3 цилиндра (номера 4, 5, 6)
  for (var j = 0; j < 3; j++){
    var cx2 = startX + j * spacing;
    RE.drawCyl(c, S, cx2, crankY, 235, 355, halfW,
      S.crankAngle + ((j + 3) * 4 * Math.PI / 3),
      CR, ROD, 1,
      br, S.running && !S.stalled && !br, S.throttle,
      j + 4, 370);
  }

  // Выпускной коллектор
  var eg = c.createLinearGradient(0, 130, 0, 150);
  if (br){ eg.addColorStop(0,'#3a2424'); eg.addColorStop(1,'#2a1a1a'); }
  else { eg.addColorStop(0,'#3a2a1a'); eg.addColorStop(1,'#2a1a0a'); }
  c.strokeStyle = eg; c.lineWidth = 9; c.lineCap = 'round';
  for (var pi = 0; pi < 3; pi++){
    var px = startX + pi * spacing;
    c.beginPath(); c.moveTo(px, 152); c.lineTo(px, 178); c.stroke();
  }
  c.beginPath(); c.moveTo(startX - 30, 184); c.lineTo(startX + 2*spacing + 30, 184); c.stroke();

  // Подписи
  c.fillStyle = br ? '#8a5a5a' : '#d8a8ff';
  c.font = 'bold 12px Segoe UI, sans-serif';
  c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText('2.0 V6  •  Mitsubishi Galant 6', 45, 12);

  c.fillStyle = br ? '#7a5a5a' : '#8fb5d8';
  c.font = 'bold 9px Segoe UI, sans-serif';
  c.fillText('V6  •  6 цилиндров  •  3 сверху + 3 снизу', 45, 30);
};
})();