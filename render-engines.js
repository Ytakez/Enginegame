(function(){
"use strict";
var RB = window.RB;
if (!RB) return;
var RE = window.RE = {};

/* ===== ОДИН ЦИЛИНДР ===== */
RE.drawCyl = function(c,S,cx,crankY,topY,botY,halfW,phase,CR,ROD,dir,br,firing,thr,num,camY){
  var cycPos=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
  var stroke=Math.floor(cycPos/Math.PI);
  var s=Math.sin(phase),co=Math.cos(phase);
  var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
  var dist=CR*co+Math.sqrt(sq);
  var pinY=crankY+dir*dist;
  var cpX=cx+CR*s,cpY=crankY-CR*co;

  var bg=c.createLinearGradient(cx-halfW,0,cx+halfW,0);
  bg.addColorStop(0,'#05080c');bg.addColorStop(.5,br?'#1a0e0e':'#0e141c');bg.addColorStop(1,'#05080c');
  c.fillStyle=bg;c.fillRect(cx-halfW,topY,halfW*2,botY-topY);
  c.strokeStyle=br?'#5a3030':'#2a3a4a';c.lineWidth=2;
  c.strokeRect(cx-halfW,topY,halfW*2,botY-topY);

  var pg=c.createLinearGradient(cx-halfW+2,0,cx+halfW-2,0);
  if(br){pg.addColorStop(0,'#4a3838');pg.addColorStop(.5,'#8a6a6a');pg.addColorStop(1,'#3a2828');}
  else{pg.addColorStop(0,'#4a5566');pg.addColorStop(.25,'#d8e0e8');
       pg.addColorStop(.55,'#8b98a7');pg.addColorStop(1,'#2a333f');}
  c.fillStyle=pg;
  var pTop=dir<0?pinY-24:pinY;
  RB.rr(c,cx-halfW+3,pTop,(halfW-3)*2,24,3);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=1.2;c.stroke();
  c.strokeStyle=br?'#5a3030':'#1a252f';c.lineWidth=1.8;
  for(var k=0;k<3;k++){c.beginPath();
    c.moveTo(cx-halfW+5,pTop+5+k*5);c.lineTo(cx+halfW-5,pTop+5+k*5);c.stroke();}

  var dR=Math.min(halfW*.55,CR*1.3);if(dR<6)dR=6;
  var dg=c.createRadialGradient(cx-dR*.4,crankY-dR*.4,1,cx,crankY,dR);
  if(br){dg.addColorStop(0,'#8a6a6a');dg.addColorStop(1,'#1a0a0a');}
  else{dg.addColorStop(0,'#a8b4c0');dg.addColorStop(.5,'#6a7685');dg.addColorStop(1,'#2a3340');}
  c.fillStyle=dg;c.beginPath();c.arc(cx,crankY,dR,0,7);c.fill();
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.stroke();

  c.strokeStyle='#0a1018';c.lineWidth=11;c.lineCap='round';
  c.beginPath();c.moveTo(cx,pinY);
  if(br)c.quadraticCurveTo((cx+cpX)/2+6,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();
  c.strokeStyle=br?'#7a5a5a':'#8894a2';c.lineWidth=8;
  c.beginPath();c.moveTo(cx,pinY);
  if(br)c.quadraticCurveTo((cx+cpX)/2+6,(pinY+cpY)/2,cpX,cpY);
  else c.lineTo(cpX,cpY);
  c.stroke();
  if(!br){c.strokeStyle='rgba(220,230,240,0.5)';c.lineWidth=2;
    c.beginPath();c.moveTo(cx-2,pinY-2);c.lineTo(cpX-2,cpY-2);c.stroke();}

  c.fillStyle='#0a0f15';c.beginPath();c.arc(cx,pinY,4.5,0,7);c.fill();
  c.fillStyle=br?'#7a5a5a':'#4a5566';c.beginPath();c.arc(cx,pinY,3,0,7);c.fill();

  var shg=c.createRadialGradient(cpX-2,cpY-2,1,cpX,cpY,8);
  if(br){shg.addColorStop(0,'#8a6a6a');shg.addColorStop(1,'#1a0a0a');}
  else{shg.addColorStop(0,'#e8eff6');shg.addColorStop(.5,'#8a95a3');shg.addColorStop(1,'#3a4654');}
  c.fillStyle=shg;c.beginPath();c.arc(cpX,cpY,8,0,7);c.fill();
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.stroke();

  if(firing){
    var d2=cycPos-2*Math.PI;
    var inten=Math.max(0,1-Math.abs(d2)/1.25)*(0.35+0.65*thr);
    if(inten>0.01){
      var fy=dir<0?topY+14:botY-14;
      var gg=c.createRadialGradient(cx,fy,2,cx,fy,halfW*2);
      gg.addColorStop(0,'rgba(255,255,240,'+inten+')');
      gg.addColorStop(.3,'rgba(255,200,80,'+(0.9*inten)+')');
      gg.addColorStop(.7,'rgba(255,80,20,'+(0.4*inten)+')');
      gg.addColorStop(1,'rgba(120,20,0,0)');
      c.save();c.beginPath();
      if(dir<0)c.rect(cx-halfW,topY,halfW*2,Math.max(4,pTop-topY+4));
      else c.rect(cx-halfW,pTop+24,halfW*2,Math.max(4,botY-pTop-24));
      c.clip();c.fillStyle=gg;c.fillRect(cx-halfW*2,topY,halfW*4,botY-topY);c.restore();
    }
  }

  var inL=0,exL=0;
  if(br){inL=5;exL=6;}
  else if(S.running){
    if(stroke===0)inL=Math.sin(cycPos%Math.PI)*5;
    if(stroke===3)exL=Math.sin(cycPos-3*Math.PI)*5;
  }
  if(dir<0){
    RB.drawCam(c,cx-halfW*.5,camY,phase*.5);
    RB.drawCam(c,cx+halfW*.5,camY,phase*.5+Math.PI);
    RB.drawValve(c,cx-halfW*.5,camY+12,topY,inL,br?'#8a5a5a':'#6fd0ff',br);
    RB.drawValve(c,cx+halfW*.5,camY+12,topY,exL,br?'#8a4a4a':'#ff8a6f',br);
  }else{
    c.save();c.translate(cx,botY);c.rotate(Math.PI);c.translate(-cx,-botY);
    RB.drawCam(c,cx-halfW*.5,camY,phase*.5);
    RB.drawCam(c,cx+halfW*.5,camY,phase*.5+Math.PI);
    RB.drawValve(c,cx-halfW*.5,camY+12,topY,inL,br?'#8a5a5a':'#6fd0ff',br);
    RB.drawValve(c,cx+halfW*.5,camY+12,topY,exL,br?'#8a4a4a':'#ff8a6f',br);
    c.restore();
  }

  RB.drawSpark(c,cx,dir<0?topY:botY,dir,phase,firing);

  c.fillStyle=br?'#a05050':'#4a5c70';
  c.font='bold 9px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  var numY=dir<0?topY-30:botY+30;
  c.fillText('Ц.'+num,cx,numY);

  if(br){
    c.strokeStyle='rgba(255,50,50,0.85)';c.lineWidth=2.5;
    var ccy=(topY+botY)/2;
    c.beginPath();
    c.moveTo(cx-10,ccy-10);c.lineTo(cx+10,ccy+10);
    c.moveTo(cx+10,ccy-10);c.lineTo(cx-10,ccy+10);
    c.stroke();
  }
};

/* ===== R4 ===== */
RE.drawR4 = function(c,S){
  var W=c.canvas.width;
  var br=S.broken;
  var crankY=305,CR=32,ROD=95;
  var xs=[115,250,385,520];
  var halfW=44,topY=155,botY=290,camY=100;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];

  var pg=c.createLinearGradient(0,355,0,415);
  if(br){pg.addColorStop(0,'#2a1a1a');pg.addColorStop(1,'#1a0a0a');}
  else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');}
  c.fillStyle=pg;
  c.beginPath();c.moveTo(40,355);c.lineTo(600,355);c.lineTo(580,415);c.lineTo(60,415);
  c.closePath();c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  RB.bolt(c,320,408,5,br);

  c.fillStyle=RB.metalGrad(c,30,140,220,br);
  RB.rr(c,30,140,580,220,8);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  c.strokeStyle=br?'rgba(90,40,40,0.5)':'rgba(30,40,52,0.55)';c.lineWidth=1.5;
  for(var rb=0;rb<12;rb++){var ry=155+rb*17;
    c.beginPath();c.moveTo(35,ry);c.lineTo(605,ry);c.stroke();}

  c.fillStyle=RB.metalGrad(c,30,60,85,br);
  RB.rr(c,30,60,580,85,8);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
  c.fillStyle=br?'#3a2424':'#1d2530';
  RB.rr(c,40,42,560,22,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();
  for(var bi=0;bi<5;bi++)RB.bolt(c,60+bi*130,53,3,br);

  c.fillStyle='#1a232e';c.fillRect(60,camY,520,6);
  c.strokeStyle='#3a4654';c.lineWidth=1;c.strokeRect(60,camY,520,6);

  RB.drawCrank(c,60,580,crankY,br);
  var mains=[70,180,320,460,570];
  for(var mi=0;mi<mains.length;mi++)RB.drawMainBearing(c,mains[mi],crankY,12,br);
  RB.drawFlywheel(c,605,crankY,32,S.crankAngle,br);
  RB.drawBelt(c,25,camY+3,crankY,br);

  for(var i=0;i<4;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  var eg=c.createLinearGradient(0,120,0,140);
  if(br){eg.addColorStop(0,'#3a2424');eg.addColorStop(1,'#2a1a1a');}
  else{eg.addColorStop(0,'#3a2a1a');eg.addColorStop(1,'#2a1a0a');}
  c.strokeStyle=eg;c.lineWidth=10;c.lineCap='round';
  for(var pi=0;pi<4;pi++){
    var px=100+pi*110;
    c.beginPath();c.moveTo(px,152);c.lineTo(px,182);c.stroke();
  }
  c.beginPath();c.moveTo(80,188);c.lineTo(470,188);c.stroke();

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('R4  •  4 цилиндра в ряд  •  ГРМ + распредвал',45,20);
};

/* ===== V8 / V16 ===== */
RE.drawV = function(c,S,n){
  var W=c.canvas.width;
  var br=S.broken;
  var crankY=215;
  var CR,ROD,halfW,spacing;
  if(n===8){CR=13;ROD=32;halfW=22;spacing=118;}
  else{CR=8;ROD=22;halfW=14;spacing=62;}
  var startX=W/2-(n-1)*spacing/2;
  var tTop=70,tBot=195,bTop=235,bBot=360;
  var camT=55,camB=375;

  c.fillStyle=RB.metalGrad(c,15,30,180,br);
  RB.rr(c,15,30,W-30,180,10);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  c.fillStyle=RB.metalGrad(c,15,220,180,br);
  RB.rr(c,15,220,W-30,180,10);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  RB.drawCrank(c,30,W-30,crankY,br);
  var cnt=n+1;
  for(var mi=0;mi<=cnt;mi++){
    var mx=40+mi*((W-80)/cnt);
    RB.drawMainBearing(c,mx,crankY,9,br);
  }
  for(var i=0;i<n;i++){
    var cx=startX+i*spacing;
    RE.drawCyl(c,S,cx,crankY,tTop,tBot,halfW,S.crankAngle+(i*4*Math.PI/n),CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camT);
  }
  for(var j=0;j<n;j++){
    var cx2=startX+j*spacing;
    RE.drawCyl(c,S,cx2,crankY,bTop,bBot,halfW,S.crankAngle+((j+n)*4*Math.PI/n),CR,ROD,1,
      br,S.running&&!S.stalled&&!br,S.throttle,j+n+1,camB);
  }
  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText(n===8?'V8  •  8 цилиндров  •  V-образный':'V16  •  16 цилиндров  •  V-образный',W/2,12);
};

/* ===== СКУТЕР ===== */
RE.drawScooter = function(c,S){
  var W=c.canvas.width;
  var br=S.broken;
  var cx=W/2;
  var crankY=340,CR=42,ROD=110;
  var halfW=75,topY=140,botY=320,camY=105;

  var bg=c.createLinearGradient(0,50,0,400);
  if(br){bg.addColorStop(0,'#3a2a2a');bg.addColorStop(.5,'#2a1e1e');bg.addColorStop(1,'#1a1212');}
  else{bg.addColorStop(0,'#2b3746');bg.addColorStop(.5,'#1d2733');bg.addColorStop(1,'#131b24');}
  c.fillStyle=bg;RB.rr(c,90,50,W-180,370,12);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  c.fillStyle=br?'#3a2424':'#1d2530';
  RB.rr(c,cx-85,60,170,40,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();
  for(var bi=0;bi<4;bi++)RB.bolt(c,cx-60+bi*40,80,3,br);

  RB.drawCrank(c,130,W-130,crankY,br);
  RB.drawFlywheel(c,W-110,crankY,26,S.crankAngle,br);
  RB.drawBelt(c,105,camY+3,crankY,br);

  RE.drawCyl(c,S,cx,crankY,topY,botY,halfW,S.crankAngle,CR,ROD,-1,
    br,S.running&&!S.stalled&&!br,S.throttle,1,camY+3);

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('S1  •  1 цилиндр  •  4-тактный',105,70);
  c.textAlign='right';c.font='bold 10px Segoe UI, sans-serif';
  c.fillStyle='#3d4a58';
  c.fillText('СКУТЕР 50cc',W-105,72);
};

/* ===== 1.9 TDI (Passat B5) ===== */
RE.drawTDI = function(c,S){
  var W=c.canvas.width;
  var br=S.broken;
  var crankY=310,CR=30,ROD=90;
  var xs=[125,255,385,515];
  var halfW=42,topY=150,botY=295,camY=95;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];

  /* ==== Поддон ==== */
  var pg=c.createLinearGradient(0,360,0,420);
  if(br){pg.addColorStop(0,'#2a1a1a');pg.addColorStop(1,'#1a0a0a');}
  else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');}
  c.fillStyle=pg;
  c.beginPath();c.moveTo(40,360);c.lineTo(600,360);c.lineTo(580,418);c.lineTo(60,418);
  c.closePath();c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  RB.bolt(c,320,412,5,br);

  /* ==== Блок цилиндров (дизельный, крепче выглядит) ==== */
  c.fillStyle=RB.metalGrad(c,30,135,225,br);
  RB.rr(c,30,135,580,225,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  // Рёбра
  c.strokeStyle=br?'rgba(90,40,40,0.5)':'rgba(30,40,52,0.6)';c.lineWidth=1.5;
  for(var rb=0;rb<14;rb++){var ry=150+rb*16;
    c.beginPath();c.moveTo(35,ry);c.lineTo(605,ry);c.stroke();}

  /* ==== Головка блока (дизельная, с форсунками) ==== */
  c.fillStyle=RB.metalGrad(c,30,55,90,br);
  RB.rr(c,30,55,580,90,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
  // Крышка распредвала
  c.fillStyle=br?'#3a2424':'#1d2530';
  RB.rr(c,45,38,550,20,4);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();
  for(var bi=0;bi<6;bi++)RB.bolt(c,70+bi*105,48,2.5,br);

  /* ==== РАСПРЕДВАЛ ==== */
  c.fillStyle='#1a232e';c.fillRect(60,camY,520,5);
  c.strokeStyle='#3a4654';c.lineWidth=1;c.strokeRect(60,camY,520,5);

  /* ==== КОЛЕНВАЛ ==== */
  RB.drawCrank(c,60,580,crankY,br);
  var mains=[70,185,320,455,570];
  for(var mi=0;mi<mains.length;mi++)RB.drawMainBearing(c,mains[mi],crankY,11,br);

  /* ==== МАХОВИК (двухмассовый — шире) ==== */
  RB.drawFlywheel(c,608,crankY,34,S.crankAngle,br);

  /* ==== РЕМЕНЬ ГРМ ==== */
  RB.drawBelt(c,25,camY+3,crankY,br);

  /* ==== ЦИЛИНДРЫ ==== */
  for(var i=0;i<4;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  /* ==== ФОРСУНКИ (дизельные, с трубами высокого давления) ==== */
  for(var fi=0;fi<4;fi++){
    var fx=xs[fi];
    // Корпус форсунки над головкой
    c.fillStyle=br?'#3a2424':'#2a333f';
    RB.rr(c,fx-8,72,16,32,3);c.fill();
    c.strokeStyle=br?'#5a3030':'#1a232e';c.lineWidth=1.5;c.stroke();
    // Штуцер
    c.fillStyle=br?'#5a4040':'#8a95a3';
    c.fillRect(fx-3,62,6,10);
    // Трубка высокого давления (изогнутая)
    c.strokeStyle=br?'#5a3030':'#4a5566';c.lineWidth=2.5;
    c.beginPath();
    c.moveTo(fx,62);
    c.quadraticCurveTo(fx-40,40,100,40);
    c.stroke();
  }

  /* ==== ТНВД (топливный насос высокого давления) — слева ==== */
  c.fillStyle=br?'#4a2a2a':'#3a4654';
  RB.rr(c,45,25,80,35,4);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#1a232e';c.lineWidth=2;c.stroke();
  // Шестерня ТНВД
  RB.drawGear(c,85,42,12,br);
  // Надпись
  c.fillStyle=br?'#a05050':'#6d8299';
  c.font='bold 8px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText('ТНВД',85,68);

  /* ==== ВЫПУСКНОЙ КОЛЛЕКТОР ==== */
  var eg=c.createLinearGradient(0,125,0,145);
  if(br){eg.addColorStop(0,'#3a2424');eg.addColorStop(1,'#2a1a1a');}
  else{eg.addColorStop(0,'#2a1a0a');eg.addColorStop(1,'#1a0a00');}
  c.strokeStyle=eg;c.lineWidth=11;c.lineCap='round';
  for(var pi=0;pi<4;pi++){
    var px=115+pi*125;
    c.beginPath();c.moveTo(px,148);c.lineTo(px,175);c.stroke();
  }
  c.beginPath();c.moveTo(95,182);c.lineTo(500,182);c.stroke();

  /* ==== ТУРБИНА (справа, улитка) ==== */
  // Основной корпус улитки
  c.fillStyle=br?'#5a3a3a':'#4a5566';
  c.beginPath();c.arc(555,200,26,0,7);c.fill();
  c.strokeStyle=br?'#7a4a4a':'#1a232e';c.lineWidth=2;c.stroke();
  // Спираль улитки
  c.strokeStyle=br?'#7a5a5a':'#6a7685';c.lineWidth=3;
  c.beginPath();
  c.arc(555,200,20,0,Math.PI*1.4);c.stroke();
  c.beginPath();
  c.arc(555,200,15,Math.PI,Math.PI*2.2);c.stroke();
  // Центр турбины
  c.fillStyle=br?'#3a2020':'#1a232e';
  c.beginPath();c.arc(555,200,8,0,7);c.fill();
  c.strokeStyle=br?'#5a3030':'#3a4654';c.lineWidth=1.5;c.stroke();
  // Лопатки
  c.strokeStyle=br?'#8a5a5a':'#8a95a3';c.lineWidth=1.5;
  for(var ti=0;ti<6;ti++){
    var ta=(ti/6)*Math.PI*2+S.crankAngle*0.3;
    c.beginPath();
    c.moveTo(555+Math.cos(ta)*4,200+Math.sin(ta)*4);
    c.lineTo(555+Math.cos(ta)*7,200+Math.sin(ta)*7);
    c.stroke();
  }
  // Подпись
  c.fillStyle=br?'#a05050':'#6d8299';
  c.font='bold 8px Segoe UI, sans-serif';
  c.fillText('TURBO',555,235);

  /* ==== ИНТЕРКУЛЕР ТРУБА (от турбины наверх) ==== */
  c.strokeStyle=br?'#5a3030':'#3a4654';c.lineWidth=8;c.lineCap='round';
  c.beginPath();
  c.moveTo(555,175);
  c.quadraticCurveTo(520,120,470,110);
  c.stroke();
  c.strokeStyle=br?'#7a4a4a':'#6a7685';c.lineWidth=2;
  c.beginPath();
  c.moveTo(555,175);
  c.quadraticCurveTo(520,120,470,110);
  c.stroke();

  /* ==== EGR КЛАПАН ==== */
  c.fillStyle=br?'#4a2a2a':'#3a4654';
  RB.rr(c,430,145,30,20,3);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#1a232e';c.lineWidth=1.5;c.stroke();
  c.fillStyle=br?'#a05050':'#6d8299';
  c.font='bold 7px Segoe UI, sans-serif';
  c.fillText('EGR',445,178);

  /* ==== ПОДПИСЬ ==== */
  c.fillStyle=br?'#8a5a5a':'#8fb5d8';
  c.font='bold 12px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('1.9 TDI  •  Volkswagen Passat B5',45,10);
  c.fillStyle=br?'#6a4a4a':'#5d7189';
  c.font='bold 9px Segoe UI, sans-serif';
  c.fillText('Рядная 4-ка  •  Турбодизель  •  110 л.с.',45,27);
};

})();