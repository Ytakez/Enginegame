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

function bolt(c,x,y,r,br){
  var g=c.createRadialGradient(x-r*0.3,y-r*0.3,1,x,y,r);
  if(br){g.addColorStop(0,'#a08080');g.addColorStop(1,'#3a2020');}
  else{g.addColorStop(0,'#c8d4e0');g.addColorStop(.6,'#8a95a3');g.addColorStop(1,'#3a4654');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=.8;c.stroke();
  c.beginPath();c.moveTo(x-r*.6,y);c.lineTo(x+r*.6,y);c.stroke();
}

function metal(x,y,h,br){
  var g=document.getElementById('engineCv').getContext('2d').createLinearGradient(x,y,x,y+h);
  if(br){g.addColorStop(0,'#4a2a2a');g.addColorStop(.5,'#8a5a5a');g.addColorStop(1,'#2a1a1a');}
  else{g.addColorStop(0,'#2b3746');g.addColorStop(.2,'#5a6878');g.addColorStop(.45,'#7a8797');
       g.addColorStop(.7,'#4a5664');g.addColorStop(1,'#1d2530');}
  return g;
}

/* Кулачок распредвала */
function drawCam(c,x,y,ang){
  c.save();c.translate(x,y);c.rotate(-ang);
  var g=c.createRadialGradient(-3,-3,1,0,0,9);
  g.addColorStop(0,'#c8d4e0');g.addColorStop(.6,'#6a7685');g.addColorStop(1,'#2a3340');
  c.fillStyle=g;c.beginPath();c.arc(0,0,7,0,7);c.fill();
  c.fillStyle='#5a6878';
  c.beginPath();c.moveTo(-6,2);c.quadraticCurveTo(0,16,6,2);c.quadraticCurveTo(0,6,-6,2);
  c.closePath();c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=1;c.stroke();
  c.restore();
  c.fillStyle='#1a232e';c.beginPath();c.arc(x,y,3,0,7);c.fill();
}

/* Клапан с пружиной */
function drawValve(c,x,springTop,valveTop,lift,color,br){
  c.strokeStyle=br?'#7a5a5a':'#a8b4c0';c.lineWidth=3;
  c.beginPath();c.moveTo(x,springTop);c.lineTo(x,valveTop+lift);c.stroke();
  c.strokeStyle=br?'#5a4040':'#5a6878';c.lineWidth=1.2;
  var sh=(valveTop-springTop)/5;
  for(var i=0;i<5;i++){c.beginPath();c.arc(x,springTop+i*sh+sh/2,4,0,Math.PI,i%2===0);c.stroke();}
  var ty=valveTop+lift;
  c.fillStyle=br?'#8a4a4a':color;
  c.beginPath();c.moveTo(x-8,ty);c.lineTo(x+8,ty);c.lineTo(x+4,ty+5);c.lineTo(x-4,ty+5);
  c.closePath();c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=.8;c.stroke();
}

/* Шестерня */
function drawGear(c,x,y,r,br){
  var g=c.createRadialGradient(x-3,y-3,1,x,y,r);
  if(br){g.addColorStop(0,'#8a6a6a');g.addColorStop(1,'#2a1a1a');}
  else{g.addColorStop(0,'#a8b4c0');g.addColorStop(.5,'#6a7685');g.addColorStop(1,'#2a3340');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle=br?'#5a3030':'#3a4654';c.lineWidth=2;
  for(var i=0;i<16;i++){var a=i/16*Math.PI*2;
    c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);
    c.lineTo(x+Math.cos(a)*(r+3),y+Math.sin(a)*(r+3));c.stroke();}
  c.fillStyle='#1a232e';c.beginPath();c.arc(x,y,r*.3,0,7);c.fill();
}

/* Ремень ГРМ */
function drawBelt(c,x,topY,botY,br){
  drawGear(c,x,topY,14,br);
  drawGear(c,x,botY,18,br);
  c.strokeStyle=br?'#5a3030':'#1a1a1a';c.lineWidth=6;
  c.beginPath();c.moveTo(x-14,topY);c.lineTo(x-18,botY);c.stroke();
  c.beginPath();c.moveTo(x+14,topY);c.lineTo(x+18,botY);c.stroke();
  c.strokeStyle=br?'#3a2020':'#3a3a3a';c.lineWidth=1;
  for(var i=0;i<=20;i++){
    var t=i/20,y1=topY+(botY-topY)*t,w1=14+(18-14)*t;
    c.beginPath();c.moveTo(x-w1,y1);c.lineTo(x-w1-3,y1);
    c.moveTo(x+w1,y1);c.lineTo(x+w1+3,y1);c.stroke();
  }
}

/* Маховик */
function drawFlywheel(c,x,y,r,ang,br){
  c.save();c.translate(x,y);c.rotate(ang);
  var g=c.createRadialGradient(-r*.3,-r*.3,1,0,0,r);
  if(br){g.addColorStop(0,'#8a6a6a');g.addColorStop(1,'#1a0a0a');}
  else{g.addColorStop(0,'#8a95a3');g.addColorStop(.5,'#5a6878');g.addColorStop(1,'#2a3340');}
  c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,7);c.fill();
  c.strokeStyle=br?'#5a3030':'#3a4654';c.lineWidth=2;
  for(var i=0;i<32;i++){var a=i/32*Math.PI*2;
    c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r);
    c.lineTo(Math.cos(a)*(r+4),Math.sin(a)*(r+4));c.stroke();}
  c.fillStyle='#0a0f15';
  for(var j=0;j<6;j++){var a2=j/6*Math.PI*2;
    c.beginPath();c.arc(Math.cos(a2)*r*.55,Math.sin(a2)*r*.55,r*.1,0,7);c.fill();}
  c.fillStyle='#1a232e';c.beginPath();c.arc(0,0,r*.28,0,7);c.fill();
  c.strokeStyle='#4a5566';c.lineWidth=1.5;c.stroke();
  c.restore();
}

/* Коленвал */
function drawCrank(c,x1,x2,y,br){
  c.fillStyle='rgba(0,0,0,0.5)';c.fillRect(x1,y-13,x2-x1,26);
  var sg=c.createLinearGradient(0,y-10,0,y+10);
  if(br){sg.addColorStop(0,'#2a1a1a');sg.addColorStop(.5,'#8a6a6a');sg.addColorStop(1,'#1a0a0a');}
  else{sg.addColorStop(0,'#2a3340');sg.addColorStop(.25,'#7a8797');
       sg.addColorStop(.5,'#a8b4c0');sg.addColorStop(.75,'#6a7685');sg.addColorStop(1,'#1d2530');}
  c.fillStyle=sg;c.fillRect(x1,y-10,x2-x1,20);
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.strokeRect(x1,y-10,x2-x1,20);
  if(!br){c.fillStyle='rgba(255,255,255,0.15)';c.fillRect(x1,y-7,x2-x1,3);}
}

/* Коренная опора */
function drawMainBearing(c,x,y,r,br){
  var g=c.createRadialGradient(x-3,y-3,1,x,y,r);
  if(br){g.addColorStop(0,'#8a6a6a');g.addColorStop(1,'#1a0a0a');}
  else{g.addColorStop(0,'#c8d4e0');g.addColorStop(.5,'#7a8797');g.addColorStop(1,'#3a4654');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.stroke();
  bolt(c,x-r*.55,y-r*.55,2,br);
  bolt(c,x+r*.55,y-r*.55,2,br);
  bolt(c,x-r*.55,y+r*.55,2,br);
  bolt(c,x+r*.55,y+r*.55,2,br);
}

/* Свеча */
function drawSpark(c,cx,topY,dir,phase,firing){
  var cycPos=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
  var d=cycPos-2*Math.PI;
  var inten=Math.max(0,1-Math.abs(d)/0.6);
  var y=dir<0?topY-8:topY-6;
  c.fillStyle='#e8e4dc';c.fillRect(cx-3,y-8,6,12);
  c.fillStyle='#8a95a3';c.fillRect(cx-4,y+4,8,5);
  c.fillStyle='#2a333f';c.fillRect(cx-1,y+9,2,4);
  if(firing&&inten>0.5){c.fillStyle='#fff8c0';c.beginPath();c.arc(cx,y+13,2,0,7);c.fill();}
}

/* ===== ОДИН ЦИЛИНДР ===== */
function drawCyl(c,cx,crankY,topY,botY,halfW,phase,CR,ROD,dir,br,firing,thr,num,camY){
  var cycPos=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
  var stroke=Math.floor(cycPos/Math.PI);
  var s=Math.sin(phase),co=Math.cos(phase);
  var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
  var dist=CR*co+Math.sqrt(sq);
  var pinY=crankY+dir*dist;
  var cpX=cx+CR*s,cpY=crankY-CR*co;

  // Гильза
  var bg=c.createLinearGradient(cx-halfW,0,cx+halfW,0);
  bg.addColorStop(0,'#05080c');bg.addColorStop(.5,br?'#1a0e0e':'#0e141c');bg.addColorStop(1,'#05080c');
  c.fillStyle=bg;c.fillRect(cx-halfW,topY,halfW*2,botY-topY);
  c.strokeStyle=br?'#5a3030':'#2a3a4a';c.lineWidth=2;
  c.strokeRect(cx-halfW,topY,halfW*2,botY-topY);

  // Поршень
  var pg=c.createLinearGradient(cx-halfW+2,0,cx+halfW-2,0);
  if(br){pg.addColorStop(0,'#4a3838');pg.addColorStop(.5,'#8a6a6a');pg.addColorStop(1,'#3a2828');}
  else{pg.addColorStop(0,'#4a5566');pg.addColorStop(.25,'#d8e0e8');
       pg.addColorStop(.55,'#8b98a7');pg.addColorStop(1,'#2a333f');}
  c.fillStyle=pg;
  var pTop=dir<0?pinY-24:pinY;
  rr(c,cx-halfW+3,pTop,(halfW-3)*2,24,3);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=1.2;c.stroke();
  c.strokeStyle=br?'#5a3030':'#1a252f';c.lineWidth=1.8;
  for(var k=0;k<3;k++){c.beginPath();
    c.moveTo(cx-halfW+5,pTop+5+k*5);c.lineTo(cx+halfW-5,pTop+5+k*5);c.stroke();}

  // Диск/противовес
  var dR=Math.min(halfW*.55,CR*1.3);if(dR<6)dR=6;
  var dg=c.createRadialGradient(cx-dR*.4,crankY-dR*.4,1,cx,crankY,dR);
  if(br){dg.addColorStop(0,'#8a6a6a');dg.addColorStop(1,'#1a0a0a');}
  else{dg.addColorStop(0,'#a8b4c0');dg.addColorStop(.5,'#6a7685');dg.addColorStop(1,'#2a3340');}
  c.fillStyle=dg;c.beginPath();c.arc(cx,crankY,dR,0,7);c.fill();
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.stroke();

  // Шатун
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

  // Палец
  c.fillStyle='#0a0f15';c.beginPath();c.arc(cx,pinY,4.5,0,7);c.fill();
  c.fillStyle=br?'#7a5a5a':'#4a5566';c.beginPath();c.arc(cx,pinY,3,0,7);c.fill();

  // Шатунная шейка
  var shg=c.createRadialGradient(cpX-2,cpY-2,1,cpX,cpY,8);
  if(br){shg.addColorStop(0,'#8a6a6a');shg.addColorStop(1,'#1a0a0a');}
  else{shg.addColorStop(0,'#e8eff6');shg.addColorStop(.5,'#8a95a3');shg.addColorStop(1,'#3a4654');}
  c.fillStyle=shg;c.beginPath();c.arc(cpX,cpY,8,0,7);c.fill();
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.stroke();

  // Вспышка
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

  // Клапаны с кулачками
  var inL=0,exL=0;
  if(br){inL=5;exL=6;}
  else if(S.running){
    if(stroke===0)inL=Math.sin(cycPos%Math.PI)*5;
    if(stroke===3)exL=Math.sin(cycPos-3*Math.PI)*5;
  }
  if(dir<0){
    drawCam(c,cx-halfW*.5,camY,phase*.5);
    drawCam(c,cx+halfW*.5,camY,phase*.5+Math.PI);
    drawValve(c,cx-halfW*.5,camY+12,topY,inL,br?'#8a5a5a':'#6fd0ff',br);
    drawValve(c,cx+halfW*.5,camY+12,topY,exL,br?'#8a4a4a':'#ff8a6f',br);
  }else{
    c.save();c.translate(cx,botY);c.rotate(Math.PI);c.translate(-cx,-botY);
    drawCam(c,cx-halfW*.5,camY,phase*.5);
    drawCam(c,cx+halfW*.5,camY,phase*.5+Math.PI);
    drawValve(c,cx-halfW*.5,camY+12,topY,inL,br?'#8a5a5a':'#6fd0ff',br);
    drawValve(c,cx+halfW*.5,camY+12,topY,exL,br?'#8a4a4a':'#ff8a6f',br);
    c.restore();
  }

  // Свеча
  drawSpark(c,cx,dir<0?topY:botY,dir,phase,firing);

  // Номер
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
}

/* ===== R4 ===== */
function drawR4(){
  var c=ectx,W=ecv.width;
  var br=S.broken;
  var crankY=305,CR=32,ROD=95;
  var xs=[115,250,385,520];
  var halfW=44,topY=155,botY=290;
  var camY=100;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];

  // Поддон
  var pg=c.createLinearGradient(0,355,0,415);
  if(br){pg.addColorStop(0,'#2a1a1a');pg.addColorStop(1,'#1a0a0a');}
  else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');}
  c.fillStyle=pg;
  c.beginPath();c.moveTo(40,355);c.lineTo(600,355);c.lineTo(580,415);c.lineTo(60,415);
  c.closePath();c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  bolt(c,320,408,5,br);

  // Блок
  c.fillStyle=metal(30,140,220,br);
  rr(c,30,140,580,220,8);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  c.strokeStyle=br?'rgba(90,40,40,0.5)':'rgba(30,40,52,0.55)';c.lineWidth=1.5;
  for(var rb=0;rb<12;rb++){var ry=155+rb*17;
    c.beginPath();c.moveTo(35,ry);c.lineTo(605,ry);c.stroke();}

  // Головка
  c.fillStyle=metal(30,60,85,br);
  rr(c,30,60,580,85,8);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
  c.fillStyle=br?'#3a2424':'#1d2530';
  rr(c,40,42,560,22,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();
  for(var bi=0;bi<5;bi++)bolt(c,60+bi*130,53,3,br);

  // Распредвал
  c.fillStyle='#1a232e';c.fillRect(60,camY,520,6);
  c.strokeStyle='#3a4654';c.lineWidth=1;c.strokeRect(60,camY,520,6);

  // Коленвал
  drawCrank(c,60,580,crankY,br);

  // Коренные опоры
  var mains=[70,180,320,460,570];
  for(var mi=0;mi<mains.length;mi++)drawMainBearing(c,mains[mi],crankY,12,br);

  // Маховик
  drawFlywheel(c,605,crankY,32,S.crankAngle,br);

  // Ремень ГРМ
  drawBelt(c,25,camY+3,crankY,br);

  // Цилиндры
  for(var i=0;i<4;i++){
    drawCyl(c,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  // Выпускной коллектор
  var eg=c.createLinearGradient(0,120,0,140);
  if(br){eg.addColorStop(0,'#3a2424');eg.addColorStop(1,'#2a1a1a');}
  else{eg.addColorStop(0,'#3a2a1a');eg.addColorStop(1,'#2a1a0a');}
  c.strokeStyle=eg;c.lineWidth=10;c.lineCap='round';
  for(var pi=0;pi<4;pi++){
    var px=100+pi*110;
    c.beginPath();c.moveTo(px,152);c.lineTo(px,182);c.stroke();
  }
  c.beginPath();c.moveTo(80,188);c.lineTo(470,188);c.stroke();

  // Подпись
  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('R4  •  4 цилиндра в ряд  •  ГРМ + распредвал',45,20);
}

/* ===== V ===== */
function drawV(n){
  var c=ectx,W=ecv.width;
  var br=S.broken;
  var crankY=215;
  var CR,ROD,halfW,spacing;
  if(n===8){CR=13;ROD=32;halfW=22;spacing=118;}
  else{CR=8;ROD=22;halfW=14;spacing=62;}
  var startX=W/2-(n-1)*spacing/2;
  var tTop=70,tBot=195,bTop=235,bBot=360;
  var camT=55,camB=375;

  c.fillStyle=metal(15,30,180,br);
  rr(c,15,30,W-30,180,10);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  c.fillStyle=metal(15,220,180,br);
  rr(c,15,220,W-30,180,10);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  drawCrank(c,30,W-30,crankY,br);

  var cnt=n+1;
  for(var mi=0;mi<=cnt;mi++){
    var mx=40+mi*((W-80)/cnt);
    drawMainBearing(c,mx,crankY,9,br);
  }

  for(var i=0;i<n;i++){
    var cx=startX+i*spacing;
    drawCyl(c,cx,crankY,tTop,tBot,halfW,S.crankAngle+(i*4*Math.PI/n),CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camT);
  }
  for(var j=0;j<n;j++){
    var cx2=startX+j*spacing;
    drawCyl(c,cx2,crankY,bTop,bBot,halfW,S.crankAngle+((j+n)*4*Math.PI/n),CR,ROD,1,
      br,S.running&&!S.stalled&&!br,S.throttle,j+n+1,camB);
  }

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText(n===8?'V8  •  8 цилиндров  •  V-образный':'V16  •  16 цилиндров  •  V-образный',W/2,12);
}

/* ===== СКУТЕР ===== */
function drawScooter(){
  var c=ectx,W=ecv.width;
  var br=S.broken;
  var cx=W/2;
  var crankY=340,CR=42,ROD=110;
  var halfW=75,topY=140,botY=320;
  var camY=105;

  var bg=c.createLinearGradient(0,50,0,400);
  if(br){bg.addColorStop(0,'#3a2a2a');bg.addColorStop(.5,'#2a1e1e');bg.addColorStop(1,'#1a1212');}
  else{bg.addColorStop(0,'#2b3746');bg.addColorStop(.5,'#1d2733');bg.addColorStop(1,'#131b24');}
  c.fillStyle=bg;rr(c,90,50,W-180,370,12);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  c.fillStyle=br?'#3a2424':'#1d2530';
  rr(c,cx-85,60,170,40,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();
  for(var bi=0;bi<4;bi++)bolt(c,cx-60+bi*40,80,3,br);

  drawCrank(c,130,W-130,crankY,br);
  drawFlywheel(c,W-110,crankY,26,S.crankAngle,br);
  drawBelt(c,105,camY+3,crankY,br);

  drawCyl(c,cx,crankY,topY,botY,halfW,S.crankAngle,CR,ROD,-1,
    br,S.running&&!S.stalled&&!br,S.throttle,1,camY+3);

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('S1  •  1 цилиндр  •  4-тактный',105,70);
  c.textAlign='right';c.font='bold 10px Segoe UI, sans-serif';
  c.fillStyle='#3d4a58';
  c.fillText('СКУТЕР 50cc',W-105,72);
}

function drawEngine(){
  var c=ectx,W=ecv.width,H=ecv.height;
  c.clearRect(0,0,W,H);
  var bg=c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0e151d');bg.addColorStop(1,'#070a0e');
  c.fillStyle=bg;c.fillRect(0,0,W,H);

  var t=S.engineType;
  if(t==='scooter')drawScooter();
  else if(t==='v8')drawV(8);
  else if(t==='v16')drawV(16);
  else drawR4();

  if(S.broken){c.fillStyle='rgba(200,20,20,0.06)';c.fillRect(0,0,W,H);}
}

function drawGauge(){
  if(!gctx)return;
  var c=gctx,W=gcv.width,H=gcv.height;
  c.clearRect(0,0,W,H);
  var cx=W/2,cy=H-20,R=Math.min(W/2-14,H-44);
  var a0=Math.PI,a1=Math.PI*2;
  var E=S.engines[S.engineType]||S.engines.r4;
  var redline=E.redline;
  var rpm=S.rpm;

  c.lineWidth=13;c.lineCap='butt';
  c.strokeStyle='#151f2b';c.beginPath();c.arc(cx,cy,R,a0,a1);c.stroke();
  var rA=a0+(redline/MAXR)*(a1-a0);
  c.strokeStyle='rgba(255,70,70,.4)';c.beginPath();c.arc(cx,cy,R,rA,a1);c.stroke();
  var rp=Math.min(rpm,MAXR);
  var curA=a0+(rp/MAXR)*(a1-a0);
  var g=c.createLinearGradient(cx-R,0,cx+R,0);
  g.addColorStop(0,'#28d17c');g.addColorStop(.55,'#ffc93c');g.addColorStop(1,'#ff3b3b');
  c.strokeStyle=g;c.lineWidth=13;
  c.beginPath();c.arc(cx,cy,R,a0,curA);c.stroke();
  for(var i=0;i<=10;i++){
    var a=a0+(i/10)*(a1-a0);
    var x1=cx+Math.cos(a)*(R-9),y1=cy+Math.sin(a)*(R-9);
    var x2=cx+Math.cos(a)*(R-19),y2=cy+Math.sin(a)*(R-19);
    c.strokeStyle=(i*MAXR/10>=redline)?'#ff6b6b':'#4d6379';c.lineWidth=2;
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    var tx=cx+Math.cos(a)*(R-33),ty=cy+Math.sin(a)*(R-33);
    c.fillStyle=(i*MAXR/10>=redline)?'#ff8b8b':'#6d8299';
    c.font='bold 10px Segoe UI, sans-serif';
    c.textAlign='center';c.textBaseline='middle';
    c.fillText(String(i),tx,ty);
  }
  var na=a0+(rp/MAXR)*(a1-a0);
  c.save();c.translate(cx,cy);c.rotate(na);
  var ng=c.createLinearGradient(0,0,R,0);
  ng.addColorStop(0,'#ff5b5b');ng.addColorStop(1,'#ffb0b0');
  c.fillStyle=ng;
  c.beginPath();
  c.moveTo(-12,-4);c.lineTo(R-22,-2);c.lineTo(R-16,0);c.lineTo(R-22,2);c.lineTo(-12,4);
  c.closePath();c.fill();c.restore();
  c.fillStyle='#1b2531';c.beginPath();c.arc(cx,cy,13,0,7);c.fill();
  c.strokeStyle='#3a4d61';c.lineWidth=2;c.stroke();
  var rc=rpm>redline?'#ff5b5b':(rpm>redline*0.85?'#ffc93c':'#9fe8c0');
  c.fillStyle=rc;c.font='bold 24px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='alphabetic';
  c.fillText(String(Math.round(rpm)),cx,cy-26);
  c.fillStyle='#4f6277';c.font='bold 9px Segoe UI, sans-serif';
  c.fillText('ОБ/МИН',cx,cy-14);
}

function paint(){
  if(!ecv)init();
  if(!ecv)return;
  drawEngine();
  drawGauge();
}

window.DVS_RENDER={draw:paint,init:init};
init();

})();