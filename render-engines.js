(function(){
"use strict";
var RB = window.RB;
if (!RB) return;
var RE = window.RE = {};

RE.drawCyl = function(c,S,cx,crankY,topY,botY,halfW,phase,CR,ROD,dir,br,firing,thr,num,camY){
  var cycPos=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
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
  if(RB.rr){RB.rr(c,cx-halfW+3,pTop,(halfW-3)*2,24,3);c.fill();
    c.strokeStyle='#1a232e';c.lineWidth=1.2;c.stroke();}

  var dR=Math.min(halfW*.55,CR*1.3);if(dR<6)dR=6;
  var dg=c.createRadialGradient(cx-dR*.4,crankY-dR*.4,1,cx,crankY,dR);
  if(br){dg.addColorStop(0,'#8a6a6a');dg.addColorStop(1,'#1a0a0a');}
  else{dg.addColorStop(0,'#a8b4c0');dg.addColorStop(.5,'#6a7685');dg.addColorStop(1,'#2a3340');}
  c.fillStyle=dg;c.beginPath();c.arc(cx,crankY,dR,0,7);c.fill();

  c.strokeStyle='#0a1018';c.lineWidth=11;c.lineCap='round';
  c.beginPath();c.moveTo(cx,pinY);c.lineTo(cpX,cpY);c.stroke();
  c.strokeStyle=br?'#7a5a5a':'#8894a2';c.lineWidth=8;
  c.beginPath();c.moveTo(cx,pinY);c.lineTo(cpX,cpY);c.stroke();

  c.fillStyle='#0a0f15';c.beginPath();c.arc(cpX,cpY,8,0,7);c.fill();
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

  c.fillStyle=br?'#a05050':'#4a5c70';
  c.font='bold 9px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText('Ц.'+num,cx,dir<0?topY-30:botY+30);
};

RE.drawR4 = function(c,S){
  var W=c.canvas.width,br=S.broken;
  var crankY=305,CR=32,ROD=95;
  var xs=[115,250,385,520];
  var halfW=44,topY=155,botY=290,camY=100;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];

  var pg=c.createLinearGradient(0,355,0,415);
  pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');
  c.fillStyle=pg;c.fillRect(40,355,560,60);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(40,355,560,60);

  c.fillStyle='#2a3a4c';c.fillRect(30,140,580,220);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(30,140,580,220);

  c.fillStyle='#3a4654';c.fillRect(30,60,580,85);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(30,60,580,85);

  c.fillStyle='#1a232e';c.fillRect(60,camY,520,6);

  if(RB.drawCrank)RB.drawCrank(c,60,580,crankY,br);
  if(RB.drawFlywheel)RB.drawFlywheel(c,605,crankY,32,S.crankAngle,br);

  for(var i=0;i<4;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('R4  •  4 цилиндра в ряд',45,20);
};

RE.drawV = function(c,S,n){
  var W=c.canvas.width,br=S.broken;
  var crankY=215;
  var CR,ROD,halfW,spacing;
  if(n>=20){CR=6;ROD=16;halfW=10;spacing=40;}
  else if(n>=12){CR=8;ROD=22;halfW=13;spacing=52;}
  else if(n>=8){CR=11;ROD=28;halfW=17;spacing=78;}
  else{CR=15;ROD=38;halfW=24;spacing=112;}
  var startX=W/2-(n-1)*spacing/2;
  var tTop=70,tBot=195,bTop=235,bBot=360;
  var camT=55,camB=375;

  c.fillStyle='#2a3a4c';
  c.fillRect(15,30,W-30,180);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(15,30,W-30,180);
  c.fillStyle='#2a3a4c';
  c.fillRect(15,220,W-30,180);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(15,220,W-30,180);

  if(RB.drawCrank)RB.drawCrank(c,30,W-30,crankY,br);
  var cnt=n+1;
  for(var mi=0;mi<=cnt;mi++){
    var mx=40+mi*((W-80)/cnt);
    if(RB.drawMainBearing)RB.drawMainBearing(c,mx,crankY,9,br);
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
  c.fillText('V'+n+'  •  '+n+' цилиндров',W/2,12);
};

RE.drawI6 = function(c,S){
  var W=c.canvas.width,br=S.broken;
  var crankY=305,CR=28,ROD=85;
  var xs=[75,175,275,375,475,575];
  var halfW=34,topY=155,botY=290,camY=100;
  var offs=[0,Math.PI,2*Math.PI,3*Math.PI,4*Math.PI,5*Math.PI];

  c.fillStyle='#2a3a4c';c.fillRect(20,140,600,220);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(20,140,600,220);
  c.fillStyle='#3a4654';c.fillRect(20,60,600,85);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(20,60,600,85);
  c.fillStyle='#1a232e';c.fillRect(50,camY,540,6);

  if(RB.drawCrank)RB.drawCrank(c,40,600,crankY,br);
  for(var mi=0;mi<7;mi++){
    if(RB.drawMainBearing)RB.drawMainBearing(c,45+mi*90,crankY,11,br);
  }
  if(RB.drawFlywheel)RB.drawFlywheel(c,615,crankY,30,S.crankAngle,br);

  for(var i=0;i<6;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('I6  •  Toyota 2JZ',25,20);
};

RE.drawBoxer = function(c,S){
  var W=c.canvas.width,br=S.broken;
  var crankY=215;
  var xs=[W/2-90,W/2+90];
  var halfW=42,CR=28,ROD=75;
  var tTop=70,tBot=185,bTop=245,bBot=360;

  c.fillStyle='#2a3a4c';c.fillRect(40,180,W-80,80);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(40,180,W-80,80);
  c.fillStyle='#3a4654';c.fillRect(40,90,W-80,90);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(40,90,W-80,90);
  c.fillStyle='#3a4654';c.fillRect(40,260,W-80,90);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(40,260,W-80,90);

  if(RB.drawCrank)RB.drawCrank(c,60,W-60,crankY,br);
  for(var mi=0;mi<4;mi++){
    if(RB.drawMainBearing)RB.drawMainBearing(c,90+mi*140,crankY,12,br);
  }
  if(RB.drawFlywheel)RB.drawFlywheel(c,W-55,crankY,34,S.crankAngle,br);

  for(var i=0;i<2;i++){
    RE.drawCyl(c,S,xs[i],crankY,tTop,tBot,halfW,
      S.crankAngle+(i*Math.PI),CR,ROD,-1,br,
      S.running&&!S.stalled&&!br,S.throttle,i+1,60);
  }
  for(var j=0;j<2;j++){
    RE.drawCyl(c,S,xs[j],crankY,bTop,bBot,halfW,
      S.crankAngle+((j+2)*Math.PI),CR,ROD,1,br,
      S.running&&!S.stalled&&!br,S.throttle,j+3,375);
  }

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('BOXER  •  Subaru EJ25',W/2,12);
};

RE.drawRadial = function(c,S){
  var br=S.broken;
  var cx=320,cy=240,R=145,n=9;
  var CR=22,ROD=60,cylLen=70,cylW=30;

  c.save();
  c.translate(cx,cy);

  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;
    c.save();c.rotate(a);

    var bx=-cylW/2,by=R-cylLen/2;
    var bg=c.createLinearGradient(bx,0,bx+cylW,0);
    bg.addColorStop(0,'#05080c');bg.addColorStop(.5,'#0e141c');bg.addColorStop(1,'#05080c');
    c.fillStyle=bg;c.fillRect(bx,by,cylW,cylLen);
    c.strokeStyle='#2a3a4a';c.lineWidth=1.5;c.strokeRect(bx,by,cylW,cylLen);

    var pg=c.createLinearGradient(bx+2,0,bx+cylW-2,0);
    pg.addColorStop(0,'#4a5566');pg.addColorStop(.25,'#d8e0e8');
    pg.addColorStop(.55,'#8b98a7');pg.addColorStop(1,'#2a333f');

    var phase=S.crankAngle+i*Math.PI*2/n;
    var off=CR*Math.cos(phase)+Math.sqrt(ROD*ROD-CR*CR*Math.sin(phase)*Math.sin(phase));
    var py=by+cylLen/2-off*0.9+20;
    c.fillStyle=pg;
    if(RB.rr){RB.rr(c,bx+3,py,cylW-6,20,3);c.fill();
      c.strokeStyle='#1a232e';c.lineWidth=1;c.stroke();}

    c.fillStyle='#8a95a3';
    c.fillRect(bx-3,by-8,cylW+6,8);
    c.strokeStyle='#1a232e';c.lineWidth=1.5;c.strokeRect(bx-3,by-8,cylW+6,8);

    c.strokeStyle='#8894a2';c.lineWidth=6;c.lineCap='round';
    c.beginPath();
    c.moveTo(0,by+cylLen/2-20);
    c.lineTo(CR*Math.sin(phase),CR*Math.cos(phase));
    c.stroke();

    c.restore();
  }

  c.fillStyle='#3a4654';c.beginPath();c.arc(0,0,50,0,7);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=2;c.stroke();

  c.fillStyle='#6a7580';c.beginPath();c.arc(0,0,40,0,7);c.fill();
  c.fillStyle='#1a232e';c.beginPath();c.arc(0,0,15,0,7);c.fill();

  c.save();c.rotate(S.crankAngle);
  c.strokeStyle='#a8b4c0';c.lineWidth=6;
  c.beginPath();c.moveTo(-30,0);c.lineTo(30,0);c.stroke();
  c.restore();

  c.restore();

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('RADIAL  •  Wright R-1820  •  9 цилиндров',40,20);
};

RE.drawWankel = function(c,S){
  var W=c.canvas.width,br=S.broken;
  var cy=240,R=95;
  var cxL=W/2-95,cxR=W/2+95;

  c.fillStyle='#1a232e';
  c.fillRect(40,60,W-80,360);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(40,60,W-80,360);

  var ecc=R*0.28,rotR=R*0.65;

  function drawRotor(cx,phase){
    c.save();c.translate(cx,cy);
    var ox=Math.cos(phase)*ecc,oy=Math.sin(phase)*ecc;

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

    c.save();c.translate(ox,oy);c.rotate(-phase/3);
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
    c.fillStyle='#1a232e';c.beginPath();c.arc(0,0,8,0,7);c.fill();
    c.restore();c.restore();
  }

  drawRotor(cxL,0);
  drawRotor(cxR,Math.PI);

  c.strokeStyle='#8a95a3';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(cxL-R-30,cy);c.lineTo(cxR+R+30,cy);c.stroke();

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('WANKEL  •  13B Renesis  •  2 ротора',40,20);
};

RE.drawScooter = function(c,S){
  var W=c.canvas.width,br=S.broken,cx=W/2;
  var crankY=340,CR=42,ROD=110;
  var halfW=75,topY=140,botY=320,camY=105;

  c.fillStyle='#2a3a4c';c.fillRect(90,50,W-180,370);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(90,50,W-180,370);
  c.fillStyle='#1a232e';c.fillRect(cx-85,60,170,40);

  if(RB.drawCrank)RB.drawCrank(c,130,W-130,crankY,br);
  if(RB.drawFlywheel)RB.drawFlywheel(c,W-110,crankY,26,S.crankAngle,br);

  RE.drawCyl(c,S,cx,crankY,topY,botY,halfW,S.crankAngle,CR,ROD,-1,
    br,S.running&&!S.stalled&&!br,S.throttle,1,camY+3);

  c.fillStyle='#5d7189';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('S1  •  1 цилиндр  •  4-тактный',105,70);
};

function drawInline4(c,S,label1,label2,brandColor){
  var W=c.canvas.width,br=S.broken;
  var crankY=310,CR=30,ROD=90;
  var xs=[125,255,385,515];
  var halfW=42,topY=150,botY=295,camY=95;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];

  c.fillStyle='#2a3a4c';c.fillRect(30,135,580,225);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(30,135,580,225);
  c.fillStyle='#3a4654';c.fillRect(30,55,580,90);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(30,55,580,90);
  c.fillStyle='#1a232e';c.fillRect(60,camY,520,5);

  if(RB.drawCrank)RB.drawCrank(c,60,580,crankY,br);
  for(var mi=0;mi<5;mi++){
    if(RB.drawMainBearing)RB.drawMainBearing(c,70+mi*122,crankY,11,br);
  }
  if(RB.drawFlywheel)RB.drawFlywheel(c,608,crankY,34,S.crankAngle,br);

  for(var i=0;i<4;i++){
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,
      br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);
  }

  c.fillStyle=br?'#8a5a5a':(brandColor||'#8fb5d8');
  c.font='bold 12px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText(label1,45,10);
  c.fillStyle=br?'#6a4a4a':'#5d7189';
  c.font='bold 9px Segoe UI, sans-serif';
  c.fillText(label2,45,27);
}

RE.drawTDI = function(c,S){drawInline4(c,S,'1.9 TDI  •  Volkswagen','Рядная 4-ка  •  Турбодизель','#8fb5d8');};
RE.drawDCi = function(c,S){drawInline4(c,S,'2.0 dCi  •  Renault','Рядная 4-ка  •  Турбодизель','#f0d860');};
RE.drawPassatB3 = function(c,S){drawInline4(c,S,'1.8  •  Volkswagen Passat B3','Рядная 4-ка  •  Бензин','#8fb5d8');};
RE.drawBluebird = function(c,S){drawInline4(c,S,'CA20  •  Nissan Bluebird','Рядная 4-ка  •  Бензин','#e08080');};
RE.drawMTZ = function(c,S){drawInline4(c,S,'Д-240  •  МТЗ-82 «Беларус»','Рядная 4-ка  •  Дизель','#8fb5d8');};
RE.drawGalant6 = function(c,S){RE.drawV(c,S,6);};

RE.render = function(c,S){
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'').replace(/-/g,'');
  function has(){for(var i=0;i<arguments.length;i++)if(raw.indexOf(arguments[i])>=0)return true;return false;}
  if(has('wankel','renesis','rotary'))       return RE.drawWankel(c,S);
  if(has('radial','wright','r1820'))         return RE.drawRadial(c,S);
  if(has('boxer','ej25','subaru'))           return RE.drawBoxer(c,S);
  if(has('v22'))                             return RE.drawV(c,S,22);
  if(has('v16'))                             return RE.drawV(c,S,16);
  if(has('v12'))                             return RE.drawV(c,S,12);
  if(has('v8'))                              return RE.drawV(c,S,8);
  if(has('v6','galant6','galant'))           return RE.drawV(c,S,6);
  if(has('i6','2jz','inline6','straight6'))  return RE.drawI6(c,S);
  if(has('scooter','50cc'))                  return RE.drawScooter(c,S);
  if(has('tdi'))                             return RE.drawTDI(c,S);
  if(has('dci'))                             return RE.drawDCi(c,S);
  if(has('passat'))                          return RE.drawPassatB3(c,S);
  if(has('bluebird','ca20'))                 return RE.drawBluebird(c,S);
  if(has('tractor','mtz','mt82','belarus','д-240')) return RE.drawMTZ(c,S);
  return RE.drawR4(c,S);
};

})();