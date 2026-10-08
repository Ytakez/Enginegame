(function(){
var RB=window.RB;if(!RB)return;
var RE=window.RE=window.RE||{};

RE.drawMTZ=function(c,S){
  var W=c.canvas.width,H=c.canvas.height;
  var br=S.broken;
  var crankY=330,CR=38,ROD=110;
  var xs=[110,240,370,500];
  var halfW=48,topY=140,botY=320,camY=90;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];

  /* ПОДДОН */
  var pg=c.createLinearGradient(0,380,0,440);
  if(br){pg.addColorStop(0,'#3a2424');pg.addColorStop(1,'#1a0808');}
  else{pg.addColorStop(0,'#3a4450');pg.addColorStop(1,'#131b24');}
  c.fillStyle=pg;
  c.beginPath();c.moveTo(30,380);c.lineTo(610,380);c.lineTo(590,442);c.lineTo(50,442);
  c.closePath();c.fill();
  c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
  RB.bolt(c,320,428,6,br);

  /* БЛОК ЦИЛИНДРОВ — массивный */
  c.fillStyle=RB.metalGrad(c,20,120,260,br);
  RB.rr(c,20,120,600,260,8);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2.5;c.stroke();

  /* РЁБРА ОХЛАЖДЕНИЯ — крупные */
  c.strokeStyle=br?'rgba(90,40,40,0.6)':'rgba(20,30,42,0.7)';c.lineWidth=1.8;
  for(var rb=0;rb<16;rb++){
    var ry=135+rb*15;
    c.beginPath();c.moveTo(25,ry);c.lineTo(615,ry);c.stroke();
  }

  /* ПРОДОЛЬНЫЕ РЁБРА */
  c.strokeStyle=br?'rgba(90,40,40,0.4)':'rgba(20,30,42,0.45)';c.lineWidth=1.5;
  for(var v=0;v<3;v++){
    var vy=145+v*85;
    c.beginPath();c.moveTo(30,vy);c.lineTo(610,vy);c.stroke();
  }

  /* ГОЛОВКА БЛОКА — массивная */
  c.fillStyle=RB.metalGrad(c,20,40,85,br);
  RB.rr(c,20,40,600,85,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2.5;c.stroke();

  /* КРЫШКА РАСПРЕДВАЛА */
  c.fillStyle=br?'#3a2424':'#1d2530';
  RB.rr(c,35,25,570,22,4);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();

  /* БОЛТЫ НА КРЫШКЕ */
  for(var bi=0;bi<7;bi++){
    RB.bolt(c,55+bi*95,36,3.5,br);
  }

  /* РАСПРЕДВАЛ */
  c.fillStyle='#1a232e';c.fillRect(50,camY,540,5);

  /* КОЛЕНВАЛ — сплошной */
  RB.drawCrank(c,50,590,crankY,br);

  /* 5 КОРЕННЫХ ОПОР */
  var mains=[60,180,320,460,580];
  for(var mi=0;mi<mains.length;mi++){
    RB.drawMainBearing(c,mains[mi],crankY,14,br);
  }

  /* МАХОВИК — большой */
  RB.drawFlywheel(c,612,crankY,42,S.crankAngle,br);

  /* ГИЛЬЗЫ И ПОРШНИ */
  for(var i=0;i<4;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,
      S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  /* ФОРСУНКИ */
  for(var fi=0;fi<4;fi++){
    var fx=xs[fi];
    c.fillStyle=br?'#3a2424':'#2a333f';
    RB.rr(c,fx-9,60,18,35,3);c.fill();
    c.strokeStyle=br?'#5a3030':'#1a232e';c.lineWidth=2;c.stroke();
    c.fillStyle=br?'#5a4040':'#8a95a3';
    c.fillRect(fx-4,50,8,10);
    /* штуцер */
    c.fillStyle='#4a4a4a';
    c.beginPath();c.arc(fx,68,3,0,7);c.fill();
  }

  /* ТРУБКИ ВЫСОКОГО ДАВЛЕНИЯ */
  c.strokeStyle=br?'#5a3030':'#4a5566';c.lineWidth=2.8;
  for(var ti=0;ti<4;ti++){
    var tx=xs[ti];
    c.beginPath();
    c.moveTo(tx,58);
    c.quadraticCurveTo(tx+50,35,610,55);
    c.stroke();
  }

  /* ТНВД — большой, справа сверху */
  c.fillStyle=br?'#4a2a2a':'#3a4654';
  RB.rr(c,580,20,60,50,5);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#1a232e';c.lineWidth=2;c.stroke();
  RB.drawGear(c,610,45,13,br);

  /* ВЫПУСКНОЙ КОЛЛЕКТОР */
  var eg=c.createLinearGradient(0,130,0,155);
  if(br){eg.addColorStop(0,'#3a2424');eg.addColorStop(1,'#2a1a1a');}
  else{eg.addColorStop(0,'#2a1a0a');eg.addColorStop(1,'#1a0a00');}
  c.strokeStyle=eg;c.lineWidth=14;c.lineCap='round';
  for(var pi=0;pi<4;pi++){
    var px=100+pi*130;
    c.beginPath();c.moveTo(px,138);c.lineTo(px,175);c.stroke();
  }
  c.beginPath();c.moveTo(70,185);c.lineTo(520,185);c.stroke();

  /* ТРАКТОРНАЯ ТРУБА ВВЕРХ */
  c.strokeStyle=br?'#4a2a2a':'#2a2a2a';c.lineWidth=16;
  c.beginPath();
  c.moveTo(520,185);
  c.lineTo(590,140);
  c.lineTo(605,15);
  c.stroke();
  c.strokeStyle=br?'#6a3a3a':'#4a4a4a';c.lineWidth=5;
  c.beginPath();
  c.moveTo(520,185);
  c.lineTo(590,140);
  c.lineTo(605,15);
  c.stroke();
  /* насадка */
  c.fillStyle=br?'#2a1a1a':'#1a1a1a';
  c.beginPath();
  c.moveTo(595,15);c.lineTo(615,15);c.lineTo(618,5);c.lineTo(592,5);
  c.closePath();c.fill();

  /* ПОДПИСЬ */
  c.fillStyle=br?'#a05050':'#8fb5d8';
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('Д-240  •  МТЗ-82 «Беларус»',30,8);
  c.fillStyle=br?'#7a4a4a':'#5d7189';
  c.font='bold 10px Segoe UI, sans-serif';
  c.fillText('Рядная 4-ка  •  Атмосферный дизель  •  4,75 л  •  80 л.с.',30,H-18);
};
})();