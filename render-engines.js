
(function(){
"use strict";
var RB = window.RB;
if (!RB) return;
var RE = window.RE = {};

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

/* ====== R4 ====== */
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

/* ====== I6 ====== */
RE.drawI6 = function(c,S){
  var W=c.canvas.width;
  var br=S.broken;
  var crankY=305,CR=28,ROD=85;
  var xs=[75,175,275,375,475,575];
  var halfW=34,topY=155,botY=290,camY=100;
  var offs=[0,Math.PI,2*Math.PI,3*Math.PI,4*Math.PI,5*Math.PI];

  var pg=c.createLinearGradient(0,355,0,415);
  pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');
  c.fillStyle=pg;
  c.beginPath();c.moveTo(30,355);c.lineTo(620,355);c.lineTo(600,415);c.lineTo(50,415);
  c.closePath();c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();

  c.fillStyle=RB.metalGrad(c,20,140,220,br);
  RB.rr(c,20,140,600,220,8);c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();
  for(var rb=0;rb<12;rb++){
    var ry=155+rb*17;
    c.strokeStyle='rgba(30,40,52,0.55)';c.lineWidth=1.5;
    c.beginPath();c.moveTo(25,ry);c.lineTo(615,ry);c.stroke();
  }

  c.fillStyle=RB.metalGrad(c,20,60,85,br);
  RB.rr(c,20,60,600,85,8);c.fill();
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.stroke();
  c.fillStyle='#1d2530';
  RB.rr(c,30,42,580,22,6);c.fill();
  for(var bi=0;bi<7;bi++)RB.bolt(c,45+bi*90,53,3,br);

  c.fillStyle='#1a232e';c.fillRect(50,camY,540,6);

  RB.drawCrank(c,40,600,crankY,br);
  for(var mi=0;mi<7;mi++)RB.drawMainBearing(c,45+mi*90,crankY,11,br);
  RB.drawFlywheel(c,615,crankY,30,S.crankAngle,br);
  RB.drawBelt(c,18,camY+3,crankY,br);

  for(var i=0;i<6;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  c.strokeStyle='#2a1a0a';c.lineWidth=11;c.lineCap='round';
  for(var pi=0;pi<6;pi++){
    var px=70+pi*100;
    c.beginPath();c.moveTo(px,152);c.lineTo(px,182);c.stroke();
  }
  c.beginPath();c.moveTo(55,188);c.lineTo(580,188);c.stroke();

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('I6  •  6 цилиндров в ряд  •  Toyota 2JZ',25,20);
};

/* ====== V-образные (V6, V8, V12, V16, V22) ====== */
RE.drawV = function(c,S,n){
  var W=c.canvas.width;
  var br=S.broken;
  var crankY=215;
  var CR,ROD,halfW,spacing;
  if(n>=20){CR=6;ROD=16;halfW=10;spacing=40;}
  else if(n>=12){CR=8;ROD=22;halfW=13;spacing=52;}
  else if(n>=8){CR=11;ROD=28;halfW=17;spacing=78;}
  else {CR=15;ROD=38;halfW=24;spacing=112;}
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
  var label='V'+n+'  •  '+n+' цилиндров';
  if(n===6)label+='  •  Mitsubishi';
  if(n===8)label+='  •  V-образный';
  if(n===12)label+='  •  V-образный';
  c.fillStyle=br?'#8a5a5a':'#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText(label,W/2,12);
};

/* ====== BOXER (Subaru) ====== */
RE.drawBoxer = function(c,S){
  var W=c.canvas.width;
  var br=S.broken;
  var crankY=215;
  var xs=[W/2-90,W/2+90];
  var halfW=42,CR=28,ROD=75;
  var tTop=70,tBot=185,bTop=245,bBot=360;

  c.fillStyle=RB.metalGrad(c,40,180,80,br);
  RB.rr(c,40,180,W-80,80,8);c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();

  c.fillStyle=RB.metalGrad(c,40,90,90,br);
  RB.rr(c,40,90,W-80,90,8);c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();

  c.fillStyle=RB.metalGrad(c,40,260,90,br);
  RB.rr(c,40,260,W-80,90,8);c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();

  RB.drawCrank(c,60,W-60,crankY,br);
  for(var mi=0;mi<4;mi++)RB.drawMainBearing(c,90+mi*140,crankY,12,br);
  RB.drawFlywheel(c,W-55,crankY,34,S.crankAngle,br);

  for(var i=0;i<2;i++){
    RE.drawCyl(c,S,xs[i],crankY,tTop,tBot,halfW,
      S.crankAngle+(i*Math.PI*2/2),CR,ROD,-1,br,
      S.running&&!S.stalled&&!br,S.throttle,i+1,60);
  }
  for(var j=0;j<2;j++){
    RE.drawCyl(c,S,xs[j],crankY,bTop,bBot,halfW,
      S.crankAngle+((j+2)*Math.PI*2/2),CR,ROD,1,br,
      S.running&&!S.stalled&&!br,S.throttle,j+3,375);
  }

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('BOXER  •  Subaru EJ25  •  оппозитный',W/2,12);
};

/* ====== RADIAL (Wright R-1820) ====== */
RE.drawRadial = function(c,S){
  var br=S.broken;
  var cx=320,cy=240;
  var R=145;
  var n=9;
  var CR=22,ROD=60;
  var cylLen=70,cylW=30;

  c.save();
  c.translate(cx,cy);

  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;

    c.save();
    c.rotate(a);

    var bx=-cylW/2,by=R-cylLen/2;
    var bg=c.createLinearGradient(bx,0,bx+cylW,0);
    bg.addColorStop(0,'#05080c');bg.addColorStop(.5,'#0e141c');bg.addColorStop(1,'#05080c');
    c.fillStyle=bg;
    c.fillRect(bx,by,cylW,cylLen);
    c.strokeStyle='#2a3a4a';c.lineWidth=1.5;
    c.strokeRect(bx,by,cylW,cylLen);

    var pg=c.createLinearGradient(bx+2,0,bx+cylW-2,0);
    pg.addColorStop(0,'#4a5566');pg.addColorStop(.25,'#d8e0e8');
    pg.addColorStop(.55,'#8b98a7');pg.addColorStop(1,'#2a333f');
    c.fillStyle=pg;
    var phase=S.crankAngle+i*Math.PI*2/n;
    var off=CR*Math.cos(phase)+Math.sqrt(ROD*ROD-CR*CR*Math.sin(phase)*Math.sin(phase));
    var pTop=cy+by+ (cylLen/2) - off*0.9 + 20;
    c.fillStyle=pg;
    var px=bx+3,py=pTop;
    RB.rr(c,px,py,cylW-6,20,3);c.fill();
    c.strokeStyle='#1a232e';c.lineWidth=1;c.stroke();

    c.fillStyle='#8a95a3';
    c.fillRect(bx-3,by-8,cylW+6,8);
    c.strokeStyle='#1a232e';c.lineWidth=1.5;c.strokeRect(bx-3,by-8,cylW+6,8);

    c.strokeStyle='#8894a2';c.lineWidth=6;c.lineCap='round';
    c.beginPath();
    c.moveTo(0,cy+by+cylLen/2-20);
    var cpX=CR*Math.sin(phase),cpY=CR*Math.cos(phase);
    c.lineTo(cpX,cy+cpY);
    c.stroke();

    c.restore();
  }

  c.fillStyle='#3a4654';
  c.beginPath();c.arc(0,0,50,0,7);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=2;c.stroke();

  c.fillStyle=RB.metalGrad?RB.metalGrad(c,-40,-40,80,br):'#6a7580';
  c.beginPath();c.arc(0,0,40,0,7);c.fill();

  c.fillStyle='#1a232e';
  c.beginPath();c.arc(0,0,15,0,7);c.fill();

  c.save();
  c.rotate(S.crankAngle);
  c.strokeStyle='#a8b4c0';c.lineWidth=6;
  c.beginPath();c.moveTo(-30,0);c.lineTo(30,0);c.stroke();
  c.restore();

  c.restore();

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('RADIAL  •  Wright R-1820  •  9 цилиндров',40,20);
};

/* ====== WANKEL (13B) ====== */
RE.drawWankel = function(c,S){
  var W=c.canvas.width;
  var br=S.broken;
  var cy=240;
  var R=95;
  var cxL=W/2-95,cxR=W/2+95;

  c.fillStyle='#1a232e';
  RB.rr(c,40,60,W-80,360,12);c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();

  var ecc=R*0.28;
  var rotR=R*0.65;

  function drawRotor(cx,phase){
    c.save();
    c.translate(cx,cy);
    var ea=phase;
    var ox=Math.cos(ea)*ecc,oy=Math.sin(ea)*ecc;

    c.fillStyle='rgba(80,140,200,0.15)';
    c.beginPath();
    for(var i=0;i<=72;i++){
      var t=i/72*Math.PI*2;
      var r=R*(1+0.25*Math.cos(3*t));
      var px=Math.cos(t)*r,py=Math.sin(t)*r;
      if(i===0)c.moveTo(px,py);else c.lineTo(px,py);
    }
    c.closePath();c.fill();
    c.strokeStyle='#5a8fc0';c.lineWidth=2;c.stroke();

    c.save();
    c.translate(ox,oy);
    c.rotate(-ea/3);
    c.beginPath();
    for(var k=0;k<3;k++){
      var a=k*Math.PI*2/3-Math.PI/2;
      var px=Math.cos(a)*rotR,py=Math.sin(a)*rotR;
      if(k===0)c.moveTo(px,py);else c.lineTo(px,py);
    }
    c.closePath();
    var rg=c.createLinearGradient(-rotR,-rotR,rotR,rotR);
    rg.addColorStop(0,'#d8e0e8');rg.addColorStop(.5,'#8a95a3');rg.addColorStop(1,'#4a5566');
    c.fillStyle=rg;c.fill();
    c.strokeStyle='#1a232e';c.lineWidth=2.5;c.stroke();

    c.fillStyle='#1a232e';
    for(var v=0;v<3;v++){
      var va=v*Math.PI*2/3-Math.PI/2;
      c.beginPath();c.arc(Math.cos(va)*rotR,Math.sin(va)*rotR,4,0,7);c.fill();
    }
    c.beginPath();c.arc(0,0,8,0,7);c.fill();
    c.restore();
    c.restore();
  }

  drawRotor(cxL,0);
  drawRotor(cxR,Math.PI);

  c.save();
  c.strokeStyle='#8a95a3';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(cxL-R-30,cy);c.lineTo(cxR+R+30,cy);c.stroke();
  c.restore();

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('WANKEL  •  13B Renesis  •  2 ротора',40,20);
};

/* ====== SCOOTER ====== */
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

/* ====== TDI / dCi / Passat / Bluebird (рядные дизели/бензин) ====== */
function drawTDICommon(c,S,label1,label2,brandColor){
  var W=c.canvas.width;
  var br=S.broken;
  var crankY=310,CR=30,ROD=90;
  var xs=[125,255,385,515];
  var halfW=42,topY=150,botY=295,camY=95;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];

  var pg=c.createLinearGradient(0,360,0,420);
  if(br){pg.addColorStop(0,'#2a1a1a');pg.addColorStop(1,'#1a0a0a');}
  else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');}
  c.fillStyle=pg;
  c.beginPath();c.moveTo(40,360);c.lineTo(600,360);c.lineTo(580,418);c.lineTo(60,418);
  c.closePath();c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  RB.bolt(c,320,412,5,br);

  c.fillStyle=RB.metalGrad(c,30,135,225,br);
  RB.rr(c,30,135,580,225,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
  for(var rb=0;rb<14;rb++){
    c.strokeStyle=br?'rgba(90,40,40,0.5)':'rgba(30,40,52,0.6)';c.lineWidth=1.5;
    var ry=150+rb*16;
    c.beginPath();c.moveTo(35,ry);c.lineTo(605,ry);c.stroke();
  }

  c.fillStyle=RB.metalGrad(c,30,55,90,br);
  RB.rr(c,30,55,580,90,6);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
  c.fillStyle=br?'#3a2424':'#1d2530';
  RB.rr(c,45,38,550,20,4);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();
  for(var bi=0;bi<6;bi++)RB.bolt(c,70+bi*105,48,2.5,br);

  c.fillStyle='#1a232e';c.fillRect(60,camY,520,5);

  RB.drawCrank(c,60,580,crankY,br);
  var mains=[70,185,320,455,570];
  for(var mi=0;mi<mains.length;mi++)RB.drawMainBearing(c,mains[mi],crankY,11,br);
  RB.drawFlywheel(c,608,crankY,34,S.crankAngle,br);
  RB.drawBelt(c,25,camY+3,crankY,br);

  for(var i=0;i<4;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  for(var fi=0;fi<4;fi++){
    var fx=xs[fi];
    c.fillStyle=br?'#3a2424':'#2a333f';
    RB.rr(c,fx-8,72,16,32,3);c.fill();
    c.strokeStyle=br?'#5a3030':'#1a232e';c.lineWidth=1.5;c.stroke();
    c.fillStyle=br?'#5a4040':'#8a95a3';
    c.fillRect(fx-3,62,6,10);
    c.strokeStyle=br?'#5a3030':'#4a5566';c.lineWidth=2.5;
    c.beginPath();
    c.moveTo(fx,62);
    c.quadraticCurveTo(fx-40,40,100,40);
    c.stroke();
  }

