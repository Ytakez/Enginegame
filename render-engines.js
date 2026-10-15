(function(){
"use strict";
var RE=window.RE={};

function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

RE.cil=function(c,cx,cy,r,col){c.fillStyle=col;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.stroke();};

RE.block=function(c,x,y,w,h,br){
  var g=c.createLinearGradient(0,y,0,y+h);
  if(br){g.addColorStop(0,'#3a2424');g.addColorStop(1,'#1a0e0e');}
  else{g.addColorStop(0,'#2a3a4c');g.addColorStop(1,'#151e28');}
  c.fillStyle=g;rr(c,x,y,w,h,8);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
};

RE.head=function(c,x,y,w,h,br){
  var g=c.createLinearGradient(0,y,0,y+h);
  if(br){g.addColorStop(0,'#4a3030');g.addColorStop(1,'#2a1818');}
  else{g.addColorStop(0,'#3a4654');g.addColorStop(1,'#232c38');}
  c.fillStyle=g;rr(c,x,y,w,h,8);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
  /* болты крепления */
  var n=Math.floor(w/90);
  c.fillStyle=br?'#5a3030':'#1a232e';
  for(var i=0;i<=n;i++){
    var bx=x+20+i*(w-40)/n;
    c.beginPath();c.arc(bx,y+h/2,3.5,0,7);c.fill();
  }
};

RE.cyl=function(c,cx,cy,r,ph,br,diesel){
  /* гильза с градиентом */
  var g=c.createLinearGradient(cx-r,0,cx+r,0);
  if(br){g.addColorStop(0,'#2a1a1a');g.addColorStop(.5,'#4a2a2a');g.addColorStop(1,'#1a0e0e');}
  else{g.addColorStop(0,'#05080c');g.addColorStop(.5,'#0e141c');g.addColorStop(1,'#05080c');}
  c.fillStyle=g;c.fillRect(cx-r,cy-r*1.3,r*2,r*2.6);
  c.strokeStyle=br?'#5a3030':'#2a3a4a';c.lineWidth=2;
  c.strokeRect(cx-r,cy-r*1.3,r*2,r*2.6);

  /* рёбра охлаждения */
  c.strokeStyle=br?'rgba(120,60,60,.5)':'rgba(60,80,100,.45)';c.lineWidth=1;
  for(var rr2=0;rr2<4;rr2++){
    c.beginPath();
    c.moveTo(cx-r+2,cy-r*1.2+rr2*r*0.55);
    c.lineTo(cx+r-2,cy-r*1.2+rr2*r*0.55);
    c.stroke();
  }

  /* поршень */
  var py=cy-r*1.3+3+Math.cos(ph)*(r*1.0)+r*0.6;
  var pg=c.createLinearGradient(cx-r,py-15,cx+r,py+15);
  if(br){pg.addColorStop(0,'#4a3838');pg.addColorStop(.4,'#8a6a6a');pg.addColorStop(1,'#3a2828');}
  else{pg.addColorStop(0,'#4a5566');pg.addColorStop(.25,'#d8e0e8');pg.addColorStop(.55,'#8b98a7');pg.addColorStop(1,'#2a333f');}
  c.fillStyle=pg;
  rr(c,cx-r+3,py-15,(r-3)*2,26,4);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=1.2;c.stroke();
  /* кольца поршня */
  c.strokeStyle=br?'#7a5a5a':'#1a252f';c.lineWidth=1.8;
  for(var k=0;k<3;k++){
    c.beginPath();
    c.moveTo(cx-r+5,py-10+k*6);
    c.lineTo(cx+r-5,py-10+k*6);
    c.stroke();
  }
  /* палец */
  c.fillStyle='#1a232e';
  c.beginPath();c.arc(cx,py,3,0,7);c.fill();
};

RE.crank=function(c,y,x1,x2,ph,br,n){
  /* ось */
  c.strokeStyle=br?'#5a3a3a':'#a8b4c0';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
  c.strokeStyle='#0a1018';c.lineWidth=2;
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();

  /* шейки с противовесами */
  var n0=n||4;
  for(var i=0;i<n0;i++){
    var px=x1+40+i*((x2-x1-80)/Math.max(1,n0-1));
    var a=ph+i*Math.PI;
    var ox=Math.cos(a)*8,oy=Math.sin(a)*8;
    /* противовес */
    c.fillStyle=br?'#5a3a3a':'#4a535e';
    c.beginPath();c.arc(px+ox*1.6,y+oy*1.6,10,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();
    /* шейка */
    c.fillStyle=br?'#7a5a5a':'#d8e4f0';
    c.beginPath();c.arc(px+ox,y+oy,5,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1.2;c.stroke();
  }
};

RE.fly=function(c,cx,cy,r,ang,br){
  var g=c.createRadialGradient(cx-r*.3,cy-r*.3,2,cx,cy,r);
  if(br){g.addColorStop(0,'#6a4a4a');g.addColorStop(1,'#2a1818');}
  else{g.addColorStop(0,'#a8b4c0');g.addColorStop(.5,'#6a7580');g.addColorStop(1,'#2a3340');}
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();
  c.strokeStyle='#0a0f15';c.lineWidth=2;c.stroke();
  /* зубья по кругу */
  c.fillStyle=br?'#4a3030':'#6a7685';
  for(var i=0;i<24;i++){
    var a=(i/24)*Math.PI*2;
    var x1=cx+Math.cos(a)*(r-2);
    var y1=cy+Math.sin(a)*(r-2);
    var x2=cx+Math.cos(a)*(r+2);
    var y2=cy+Math.sin(a)*(r+2);
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineWidth=3;c.strokeStyle=br?'#4a3030':'#6a7685';c.stroke();
  }
  /* спицы */
  c.save();c.translate(cx,cy);c.rotate(ang);
  c.strokeStyle='#0a1018';c.lineWidth=4;
  for(var s=0;s<4;s++){
    c.save();c.rotate(s*Math.PI/2);
    c.beginPath();c.moveTo(0,0);c.lineTo(0,r*0.75);c.stroke();
    c.restore();
  }
  c.fillStyle='#1a232e';c.beginPath();c.arc(0,0,r*0.2,0,7);c.fill();
  c.restore();
};

RE.cam=function(c,y,x1,x2,ph){
  c.strokeStyle='#3a4654';c.lineWidth=6;c.lineCap='round';
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
  c.strokeStyle='#1a232e';c.lineWidth=1;
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
};

RE.valve=function(c,x,ytop,ybot,open,col){
  var oy=ytop+open*3;
  c.strokeStyle='#0a1018';c.lineWidth=5;
  c.beginPath();c.moveTo(x,oy);c.lineTo(x,ybot);c.stroke();
  c.strokeStyle=col;c.lineWidth=3.5;
  c.beginPath();c.moveTo(x,oy);c.lineTo(x,ybot);c.stroke();
  c.fillStyle=col;
  c.beginPath();c.arc(x,ybot,4,0,7);c.fill();
};

RE.spark=function(c,x,y,br,phase){
  if(br)return;
  var cyc=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
  var d=cyc-2*Math.PI;
  var inten=Math.max(0,1-Math.abs(d)/1.2);
  if(inten<=0.02)return;
  var g=c.createRadialGradient(x,y,1,x,y,25);
  g.addColorStop(0,'rgba(255,255,255,'+inten+')');
  g.addColorStop(.4,'rgba(255,220,120,'+(0.9*inten)+')');
  g.addColorStop(1,'rgba(255,100,20,0)');
  c.fillStyle=g;c.beginPath();c.arc(x,y,25,0,7);c.fill();
};

/* ================= РЯДНЫЙ ================= */
function inlineDraw(c,S,n,r,spacing,label,brandColor){
  var W=c.canvas.width,br=S.broken;
  c.clearRect(0,0,W,c.canvas.height);
  var xs=[];
  var totalW=(n-1)*spacing;
  var startX=W/2-totalW/2;
  for(var i=0;i<n;i++)xs.push(startX+i*spacing);

  var crankY=c.canvas.height*0.72;
  var topY=90,botY=crankY-r*1.3-8;

  /* поддон */
  var pg=c.createLinearGradient(0,crankY+r*2,0,crankY+r*2.6);
  if(br){pg.addColorStop(0,'#2a1a1a');pg.addColorStop(1,'#1a0a0a');}
  else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');}
  c.fillStyle=pg;
  c.beginPath();
  c.moveTo(20,crankY+r*2);
  c.lineTo(W-20,crankY+r*2);
  c.lineTo(W-40,crankY+r*2.6);
  c.lineTo(40,crankY+r*2.6);
  c.closePath();c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  /* блок */
  var blockTop=topY-20;
  var blockBot=crankY-r*1.4-5;
  RE.block(c,15,blockTop,W-30,blockBot-blockTop,br);
  /* рёбра блока */
  c.strokeStyle=br?'rgba(90,40,40,.5)':'rgba(30,40,52,.55)';c.lineWidth=1.5;
  for(var rb=0;rb<12;rb++){
    var ry=blockTop+15+rb*((blockBot-blockTop-30)/11);
    c.beginPath();c.moveTo(20,ry);c.lineTo(W-20,ry);c.stroke();
  }

  /* головка */
  var headH=55;
  RE.head(c,15,blockTop-headH-5,W-30,headH,br);

  /* распредвал */
  RE.cam(c,blockTop-headH+15,60,W-60,S.crankAngle);

  /* клапаны на каждый цилиндр */
  for(var i=0;i<n;i++){
    var cx=xs[i];
    var ph=S.crankAngle+i*Math.PI;
    var inOpen=0,exOpen=0;
    if(S.running&&!S.stalled){
      var cp=((ph%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
      if(cp<Math.PI)inOpen=Math.sin(cp);
      if(cp>3*Math.PI)exOpen=Math.sin(cp-3*Math.PI);
    }
    RE.valve(c,cx-r*0.35,blockTop-headH+20,blockTop-5,inOpen,br?'#8a5a5a':'#6fd0ff');
    RE.valve(c,cx+r*0.35,blockTop-headH+20,blockTop-5,exOpen,br?'#8a4a4a':'#ff8a6f');
  }

  /* коленвал */
  RE.crank(c,crankY,40,W-40,S.crankAngle,br,n);

  /* маховик справа */
  RE.fly(c,W-45,crankY,32,S.crankAngle,br);

  /* ремень ГРМ слева */
  c.strokeStyle=br?'#4a2a2a':'#2a2a2a';c.lineWidth=8;
  c.beginPath();c.arc(30,crankY,r*0.9,0,7);c.stroke();
  c.strokeStyle=br?'#6a3a3a':'#1a1a1a';c.lineWidth=2;
  c.beginPath();c.arc(30,crankY,r*0.9,0,7);c.stroke();

  /* цилиндры */
  for(var j=0;j<n;j++){
    var ph2=S.crankAngle+j*Math.PI;
    RE.cyl(c,xs[j],crankY,r,ph2,br);
    RE.spark(c,xs[j],topY-15,br,ph2);
  }

  /* подписи */
  c.fillStyle=br?'#8a5a5a':(brandColor||'#8fb5d8');
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText(label,20,15);
}

RE.drawR4=function(c,S){inlineDraw(c,S,4,38,135,'R4  •  4 цилиндра в ряд','#8fb5d8');};
RE.drawInline6=function(c,S){inlineDraw(c,S,6,28,95,'I6  •  Toyota 2JZ  •  6 цилиндров','#EB0A1E');};
RE.drawTDI=function(c,S){inlineDraw(c,S,4,38,135,'1.9 TDI  •  Volkswagen','#8fb5d8');};
RE.drawDCi=function(c,S){inlineDraw(c,S,4,38,135,'2.0 dCi  •  Renault','#f0d860');};
RE.drawPassatB3=function(c,S){inlineDraw(c,S,4,38,135,'1.8  •  Passat B3','#8fb5d8');};
RE.drawBluebird=function(c,S){inlineDraw(c,S,4,38,135,'CA20  •  Nissan','#e08080');};
RE.drawMTZ=function(c,S){inlineDraw(c,S,4,38,135,'Д-240  •  МТЗ-82','#8fb5d8');};

RE.drawScooter=function(c,S){
  var W=c.canvas.width,br=S.broken;
  c.clearRect(0,0,W,c.canvas.height);
  var crankY=c.canvas.height*0.72,topY=90;
  var pg=c.createLinearGradient(0,crankY+60,0,crankY+90);
  pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');
  c.fillStyle=pg;c.beginPath();c.moveTo(80,crankY+60);c.lineTo(W-80,crankY+60);c.lineTo(W-110,crankY+90);c.lineTo(110,crankY+90);c.closePath();c.fill();
  RE.block(c,70,topY-20,W-140,crankY-120,br);
  RE.head(c,70,topY-75,W-140,55,br);
  RE.cam(c,topY-60,120,W-120,S.crankAngle);
  RE.crank(c,crankY,120,W-120,S.crankAngle,br,1);
  RE.fly(c,W-95,crankY,26,S.crankAngle,br);
  RE.cyl(c,W/2,crankY,60,S.crankAngle,br);
  RE.spark(c,W/2,topY-15,br,S.crankAngle);
  c.fillStyle='#5d7189';c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('S1  •  1 цилиндр  •  скутер',90,20);
};

/* ================= V-ОБРАЗНЫЙ ================= */
RE.drawV=function(c,S,n){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cyMid=H/2;
  var perRow=Math.floor(n/2);
  var sp=Math.min(85,(W-120)/perRow);
  var r=Math.min(22,sp*0.28);
  var startX=W/2-(perRow-1)*sp/2;

  /* верхний ряд */
  RE.block(c,20,30,W-40,cyMid-60,br);
  RE.head(c,20,0,W-40,30,br);
  for(var i=0;i<perRow;i++){
    var cx=startX+i*sp;
    var ph=S.crankAngle+(i*4*Math.PI/perRow);
    RE.cyl(c,cx,cyMid-60,r,ph,br);
    RE.spark(c,cx,25,br,ph);
    RE.valve(c,cx-r*0.4,15,32,0,br?'#8a5a5a':'#6fd0ff');
    RE.valve(c,cx+r*0.4,15,32,0,br?'#8a4a4a':'#ff8a6f');
  }

  /* нижний ряд */
  RE.block(c,20,cyMid+30,W-40,cyMid-60,br);
  RE.head(c,20,H-30,W-40,30,br);
  for(var j=0;j<perRow;j++){
    var cx2=startX+j*sp;
    var ph2=S.crankAngle+((j+perRow)*4*Math.PI/perRow);
    RE.cyl(c,cx2,cyMid+60,r,ph2,br);
    RE.spark(c,cx2,H-25,br,ph2);
  }

  /* коленвал по центру */
  RE.crank(c,cyMid,60,W-60,S.crankAngle,br,perRow);

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('V'+n+'  •  '+n+' цилиндров  •  V-образный',20,10);
};

/* ================= BOXER ================= */
RE.drawBoxer=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cyMid=H/2;
  var xs=[W/2-90,W/2+90];

  /* верхние блоки */
  RE.block(c,40,80,W-80,80,br);
  RE.head(c,40,40,W-80,40,br);
  /* нижние блоки */
  RE.block(c,40,cyMid+40,W-80,80,br);
  RE.head(c,40,cyMid+120,W-80,40,br);

  /* коленвал */
  RE.crank(c,cyMid,80,W-80,S.crankAngle,br,2);
  RE.fly(c,W-55,cyMid,32,S.crankAngle,br);

  /* цилиндры */
  for(var i=0;i<2;i++){
    var ph=S.crankAngle+(i*Math.PI);
    RE.cyl(c,xs[i],120,30,ph,br);
    RE.spark(c,xs[i],60,br,ph);
    RE.valve(c,xs[i]-12,52,82,0,br?'#8a5a5a':'#6fd0ff');
    RE.valve(c,xs[i]+12,52,82,0,br?'#8a4a4a':'#ff8a6f');
  }
  for(var j=0;j<2;j++){
    var ph2=S.crankAngle+((j+2)*Math.PI);
    RE.cyl(c,xs[j],cyMid+120,30,ph2,br);
    RE.spark(c,xs[j],cyMid+80,br,ph2);
  }

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('BOXER  •  Subaru EJ25  •  4 цилиндра',20,10);
};

/* ================= RADIAL ================= */
RE.drawRadial=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cx=W/2,cy=H/2,R=Math.min(W,H)/2-60,n=9;

  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;
    var x=cx+Math.cos(a)*R;
    var y=cy+Math.sin(a)*R;
    c.save();c.translate(x,y);c.rotate(a+Math.PI/2);
    /* цилиндр радиально */
    var g=c.createLinearGradient(-15,0,15,0);
    g.addColorStop(0,'#05080c');g.addColorStop(.5,'#0e141c');g.addColorStop(1,'#05080c');
    c.fillStyle=g;c.fillRect(-15,-35,30,70);
    c.strokeStyle='#2a3a4a';c.lineWidth=2;c.strokeRect(-15,-35,30,70);
    /* головка */
    c.fillStyle=br?'#4a2a2a':'#2a3340';
    c.fillRect(-17,-42,34,10);
    c.strokeStyle='#1a232e';c.lineWidth=1;c.strokeRect(-17,-42,34,10);
    /* поршень */
    var ph=S.crankAngle+i*Math.PI*2/n;
    var py=-25+Math.cos(ph)*10;
    c.fillStyle=br?'#7a5a5a':'#d8e0e8';
    c.fillRect(-11,py,22,20);
    c.strokeStyle='#1a232e';c.lineWidth=1;c.strokeRect(-11,py,22,20);
    /* шатун */
    c.strokeStyle=br?'#7a5a5a':'#8894a2';c.lineWidth=3;
    c.beginPath();c.moveTo(0,py+10);c.lineTo(Math.sin(ph)*8,30);c.stroke();
    c.restore();
  }

  /* картер по центру */
  RE.cil(c,cx,cy,R*0.35,'#2a3340');
  RE.cil(c,cx,cy,R*0.18,'#1a232e');
  c.save();c.translate(cx,cy);c.rotate(S.crankAngle);
  c.strokeStyle='#a8b4c0';c.lineWidth=6;c.lineCap='round';
  c.beginPath();c.moveTo(-R*0.3,0);c.lineTo(R*0.3,0);c.stroke();
  c.restore();

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('RADIAL  •  Wright R-1820  •  9 цилиндров',30,20);
};

/* ================= WANKEL (с анимацией!) ================= */
RE.drawWankel=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cy=H/2,R=Math.min(W/3,H/2)-30;
  var cxL=W/2-R-20,cxR=W/2+R+20;
  var ecc=R*0.28,rotR=R*0.65;
  var ang=S.crankAngle||0;

  /* корпуса */
  c.fillStyle=br?'#2a1818':'#1a232e';
  rr(c,40,60,W-80,H-120,12);c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();

  function rotor(cx,phase){
    c.save();c.translate(cx,cy);
    /* эпитрохоида */
    c.fillStyle=br?'rgba(120,60,60,.15)':'rgba(80,140,200,.15)';
    c.beginPath();
    for(var i=0;i<=72;i++){
      var t=i/72*Math.PI*2;
      var rr2=R*(1+0.25*Math.cos(3*t));
      var px=Math.cos(t)*rr2,py=Math.sin(t)*rr2;
      if(i===0)c.moveTo(px,py);else c.lineTo(px,py);
    }
    c.closePath();c.fill();
    c.strokeStyle=br?'#8a5a5a':'#5a8fc0';c.lineWidth=2.5;c.stroke();

    /* ротор (треугольник) — вращается вокруг центра */
    c.save();
    var oX=Math.cos(phase)*ecc,oY=Math.sin(phase)*ecc;
    c.translate(oX,oY);
    c.rotate(-phase/3);
    c.beginPath();
    for(var k=0;k<3;k++){
      var a=k*Math.PI*2/3-Math.PI/2;
      var rx=Math.cos(a)*rotR,ry=Math.sin(a)*rotR;
      if(k===0)c.moveTo(rx,ry);else c.lineTo(rx,ry);
    }
    c.closePath();
    var rg=c.createRadialGradient(-rotR/3,-rotR/3,2,0,0,rotR);
    if(br){rg.addColorStop(0,'#8a6a6a');rg.addColorStop(1,'#2a1818');}
    else{rg.addColorStop(0,'#e0e8f0');rg.addColorStop(.5,'#8a95a3');rg.addColorStop(1,'#3a4654');}
    c.fillStyle=rg;c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=3;c.stroke();
    /* вершины-уплотнения */
    c.fillStyle='#1a232e';
    for(var v=0;v<3;v++){
      var va=v*Math.PI*2/3-Math.PI/2;
      c.beginPath();c.arc(Math.cos(va)*rotR,Math.sin(va)*rotR,5,0,7);c.fill();
    }
    c.fillStyle='#1a232e';c.beginPath();c.arc(0,0,8,0,7);c.fill();
    c.restore();
    c.restore();
  }

  /* 2 ротора с рабочей фазой */
  rotor(cxL,ang);
  rotor(cxR,ang+Math.PI);

  /* ось */
  c.strokeStyle=br?'#7a5a5a':'#a8b4c0';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(60,cy);c.lineTo(W-60,cy);c.stroke();

  /* маховик справа */
  RE.fly(c,W-55,cy,32,ang,br);

  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('WANKEL  •  13B Renesis  •  2 ротора',30,20);
};

/* ================= ДИСПЕТЧЕР ================= */
RE.render=function(c,S){
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'').replace(/-/g,'');
  function has(){for(var i=0;i<arguments.length;i++)if(raw.indexOf(arguments[i])>=0)return true;return false;}
  if(has('wankel','renesis','rotary'))       return RE.drawWankel(c,S);
  if(has('radial','wright','r1820'))         return RE.drawRadial(c,S);
  if(has('boxer','ej25','subaru'))           return RE.drawBoxer(c,S);
  if(has('v22'))                             return RE.drawV(c,S,22);
  if(has('v16'))                             return RE.drawV(c,S,16);
  if(has('v12'))                             return RE.drawV(c,S,12);
  if(has('v8'))                              return RE.drawV(c,S,8);
  if(has('v6','galant'))                     return RE.drawV(c,S,6);
  if(has('i6','2jz','inline6'))              return RE.drawInline6(c,S);
  if(has('scooter'))                         return RE.drawScooter(c,S);
  if(has('tdi'))                             return RE.drawTDI(c,S);
  if(has('dci'))                             return RE.drawDCi(c,S);
  if(has('passat'))                          return RE.drawPassatB3(c,S);
  if(has('bluebird','ca20'))                 return RE.drawBluebird(c,S);
  if(has('tractor','mtz','mt82','belarus'))  return RE.drawMTZ(c,S);
  return RE.drawR4(c,S);
};

console.log('render-engines.js: детализированная версия OK');
})();