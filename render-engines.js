(function(){
"use strict";
var RB=window.RB;if(!RB)return;
var RE=window.RE={};

RE.drawCyl=function(c,S,cx,crankY,topY,botY,halfW,phase,CR,ROD,dir,br,firing,thr,num){
  var s=Math.sin(phase),co=Math.cos(phase);
  var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
  var pinY=crankY+dir*(CR*co+Math.sqrt(sq));
  var cpX=cx+CR*s,cpY=crankY-CR*co;
  c.fillStyle=br?'#1a0e0e':'#0e141c';
  c.fillRect(cx-halfW,topY,halfW*2,botY-topY);
  c.strokeStyle=br?'#5a3030':'#2a3a4a';c.lineWidth=2;
  c.strokeRect(cx-halfW,topY,halfW*2,botY-topY);
  var pg=c.createLinearGradient(cx-halfW,0,cx+halfW,0);
  if(br){pg.addColorStop(0,'#4a3838');pg.addColorStop(.5,'#8a6a6a');pg.addColorStop(1,'#3a2828');}
  else{pg.addColorStop(0,'#4a5566');pg.addColorStop(.3,'#d8e0e8');pg.addColorStop(.7,'#8b98a7');pg.addColorStop(1,'#2a333f');}
  c.fillStyle=pg;
  var pTop=dir<0?pinY-22:pinY;
  c.fillRect(cx-halfW+3,pTop,halfW*2-6,22);
  c.fillStyle='#8a95a3';
  c.beginPath();c.arc(cx,crankY,Math.min(halfW*.5,12),0,7);c.fill();
  c.strokeStyle='#8894a2';c.lineWidth=7;c.lineCap='round';
  c.beginPath();c.moveTo(cx,pinY);c.lineTo(cpX,cpY);c.stroke();
  c.fillStyle='#0a0f15';c.beginPath();c.arc(cpX,cpY,7,0,7);c.fill();
};

RE.drawR4=function(c,S){
  var W=c.canvas.width,br=S.broken,crankY=305,CR=32,ROD=95;
  var xs=[115,250,385,520],halfW=44,topY=155,botY=290;
  var offs=[2*Math.PI,3*Math.PI,Math.PI,0];
  c.fillStyle='#1a232e';c.fillRect(40,355,560,60);
  c.fillStyle='#2a3a4c';c.fillRect(30,140,580,220);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(30,140,580,220);
  c.fillStyle='#3a4654';c.fillRect(30,60,580,85);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(30,60,580,85);
  if(RB.drawCrank)RB.drawCrank(c,60,580,crankY,br);
  if(RB.drawFlywheel)RB.drawFlywheel(c,605,crankY,32,S.crankAngle,br);
  for(var i=0;i<4;i++)
    RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,br,S.running&&!S.stalled&&!br,S.throttle,i+1);
  c.fillStyle='#5d7189';c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('R4  •  4 цилиндра в ряд',45,20);
};

RE.drawV=function(c,S,n){
  var W=c.canvas.width,br=S.broken,crankY=215;
  var CR,ROD,halfW,spacing;
  if(n>=12){CR=8;ROD=22;halfW=12;spacing=48;}
  else if(n>=8){CR=11;ROD=28;halfW=16;spacing=75;}
  else{CR=14;ROD=36;halfW=22;spacing=105;}
  var startX=W/2-(n-1)*spacing/2;
  c.fillStyle='#2a3a4c';c.fillRect(15,30,W-30,180);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(15,30,W-30,180);
  c.fillStyle='#2a3a4c';c.fillRect(15,220,W-30,180);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(15,220,W-30,180);
  if(RB.drawCrank)RB.drawCrank(c,30,W-30,crankY,br);
  for(var i=0;i<n;i++)
    RE.drawCyl(c,S,startX+i*spacing,crankY,70,195,halfW,S.crankAngle+(i*4*Math.PI/n),CR,ROD,-1,br,S.running&&!S.stalled&&!br,S.throttle,i+1);
  for(var j=0;j<n;j++)
    RE.drawCyl(c,S,startX+j*spacing,crankY,235,360,halfW,S.crankAngle+((j+n)*4*Math.PI/n),CR,ROD,1,br,S.running&&!S.stalled&&!br,S.throttle,j+n+1);
  c.fillStyle='#5d7189';c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('V'+n+'  •  '+n+' цилиндров',W/2,12);
};

RE.drawBoxer=function(c,S){
  var W=c.canvas.width,br=S.broken,crankY=215;
  var xs=[W/2-90,W/2+90],halfW=42,CR=28,ROD=75;
  c.fillStyle='#2a3a4c';c.fillRect(40,180,W-80,80);
  c.fillStyle='#3a4654';c.fillRect(40,90,W-80,90);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(40,90,W-80,90);
  c.fillStyle='#3a4654';c.fillRect(40,260,W-80,90);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(40,260,W-80,90);
  if(RB.drawCrank)RB.drawCrank(c,60,W-60,crankY,br);
  if(RB.drawFlywheel)RB.drawFlywheel(c,W-55,crankY,34,S.crankAngle,br);
  for(var i=0;i<2;i++)
    RE.drawCyl(c,S,xs[i],crankY,70,185,halfW,S.crankAngle+(i*Math.PI),CR,ROD,-1,br,S.running&&!S.stalled&&!br,S.throttle,i+1);
  for(var j=0;j<2;j++)
    RE.drawCyl(c,S,xs[j],crankY,245,360,halfW,S.crankAngle+((j+2)*Math.PI),CR,ROD,1,br,S.running&&!S.stalled&&!br,S.throttle,j+3);
  c.fillStyle='#5d7189';c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('BOXER  •  Subaru',W/2,12);
};

RE.drawRadial=function(c,S){
  var br=S.broken,cx=320,cy=240,R=140,n=9;
  c.save();c.translate(cx,cy);
  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;
    c.save();c.rotate(a);
    var bx=-15,by=R-35;
    c.fillStyle='#0e141c';c.fillRect(bx,by,30,70);
    c.strokeStyle='#2a3a4a';c.lineWidth=1.5;c.strokeRect(bx,by,30,70);
    var phase=S.crankAngle+i*Math.PI*2/n;
    var off=22*Math.cos(phase)+Math.sqrt(60*60-22*22*Math.sin(phase)*Math.sin(phase));
    var py=by+35-off*0.9+20;
    c.fillStyle='#d8e0e8';c.fillRect(bx+3,py,24,20);
    c.strokeStyle='#8894a2';c.lineWidth=5;c.lineCap='round';
    c.beginPath();c.moveTo(0,by+35-20);c.lineTo(22*Math.sin(phase),22*Math.cos(phase));c.stroke();
    c.restore();
  }
  c.fillStyle='#3a4654';c.beginPath();c.arc(0,0,50,0,7);c.fill();
  c.fillStyle='#6a7580';c.beginPath();c.arc(0,0,40,0,7);c.fill();
  c.fillStyle='#1a232e';c.beginPath();c.arc(0,0,15,0,7);c.fill();
  c.save();c.rotate(S.crankAngle);
  c.strokeStyle='#a8b4c0';c.lineWidth=6;
  c.beginPath();c.moveTo(-30,0);c.lineTo(30,0);c.stroke();
  c.restore();c.restore();
  c.fillStyle='#5d7189';c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('RADIAL  •  Wright R-1820',40,20);
};

RE.drawWankel=function(c,S){
  var W=c.canvas.width,cy=240,R=95;
  var cxL=W/2-95,cxR=W/2+95;
  c.fillStyle='#1a232e';c.fillRect(40,60,W-80,360);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(40,60,W-80,360);
  var ecc=R*0.28,rotR=R*0.65;
  function drawRotor(cx,phase){
    c.save();c.translate(cx,cy);
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
    c.save();c.translate(Math.cos(phase)*ecc,Math.sin(phase)*ecc);c.rotate(-phase/3);
    c.beginPath();
    for(var k=0;k<3;k++){
      var a=k*Math.PI*2/3-Math.PI/2;
      if(k===0)c.moveTo(Math.cos(a)*rotR,Math.sin(a)*rotR);
      else c.lineTo(Math.cos(a)*rotR,Math.sin(a)*rotR);
    }
    c.closePath();c.fillStyle='#8a95a3';c.fill();
    c.strokeStyle='#1a232e';c.lineWidth=2.5;c.stroke();
    c.restore();c.restore();
  }
  drawRotor(cxL,0);drawRotor(cxR,Math.PI);
  c.strokeStyle='#8a95a3';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(cxL-R-30,cy);c.lineTo(cxR+R+30,cy);c.stroke();
  c.fillStyle='#5d7189';c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('WANKEL  •  13B Renesis',40,20);
};

RE.drawScooter=function(c,S){
  var W=c.canvas.width,br=S.broken,cx=W/2;
  c.fillStyle='#2a3a4c';c.fillRect(90,50,W-180,370);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(90,50,W-180,370);
  if(RB.drawCrank)RB.drawCrank(c,130,W-130,340,br);
  if(RB.drawFlywheel)RB.drawFlywheel(c,W-110,340,26,S.crankAngle,br);
  RE.drawCyl(c,S,cx,340,140,320,75,S.crankAngle,42,110,-1,br,S.running&&!S.stalled&&!br,S.throttle,1);
  c.fillStyle='#5d7189';c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('S1  •  1 цилиндр',105,70);
};

RE.drawI6=function(c,S){RE.drawV(c,S,6);};
RE.drawTDI=RE.drawR4;
RE.drawDCi=RE.drawR4;
RE.drawPassatB3=RE.drawR4;
RE.drawBluebird=RE.drawR4;
RE.drawMTZ=RE.drawR4;
RE.drawGalant6=function(c,S){RE.drawV(c,S,6);};

RE.render=function(c,S){
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'').replace(/-/g,'');
  function has(){for(var i=0;i<arguments.length;i++)if(raw.indexOf(arguments[i])>=0)return true;return false;}
  if(has('wankel','renesis','rotary')) return RE.drawWankel(c,S);
  if(has('radial','wright','r1820'))   return RE.drawRadial(c,S);
  if(has('boxer','ej25','subaru'))     return RE.drawBoxer(c,S);
  if(has('v22'))                       return RE.drawV(c,S,22);
  if(has('v16'))                       return RE.drawV(c,S,16);
  if(has('v12'))                       return RE.drawV(c,S,12);
  if(has('v8'))                        return RE.drawV(c,S,8);
  if(has('v6','galant'))               return RE.drawV(c,S,6);
  if(has('scooter'))                   return RE.drawScooter(c,S);
  return RE.drawR4(c,S);
};

})();