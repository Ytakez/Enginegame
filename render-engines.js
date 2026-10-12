(function(){
"use strict";
var RE=window.RE={};

RE.cil=function(c,cx,cy,r,col){
  c.fillStyle=col;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=1.5;c.stroke();
};

RE.block=function(c,x,y,w,h){
  c.fillStyle='#2a3a4c';c.fillRect(x,y,w,h);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(x,y,w,h);
};

RE.head=function(c,x,y,w,h){
  c.fillStyle='#3a4654';c.fillRect(x,y,w,h);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(x,y,w,h);
};

RE.cyl=function(c,cx,cy,r,ph,br){
  var py=cy+Math.cos(ph)*r*0.6;
  c.fillStyle=br?'#1a0e0e':'#0e141c';
  c.fillRect(cx-r,cy-r*1.2,r*2,r*2.4);
  c.strokeStyle='#2a3a4a';c.lineWidth=1.5;
  c.strokeRect(cx-r,cy-r*1.2,r*2,r*2.4);
  c.fillStyle=br?'#8a6a6a':'#d8e0e8';
  c.fillRect(cx-r+3,py-r*0.4,r*2-6,r*0.8);
  c.strokeStyle='#1a232e';c.lineWidth=1;c.strokeRect(cx-r+3,py-r*0.4,r*2-6,r*0.8);
};

RE.crank=function(c,y,x1,x2,br){
  c.strokeStyle=br?'#7a5a5a':'#a8b4c0';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
  c.strokeStyle='#1a232e';c.lineWidth=2;
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
};

RE.fly=function(c,cx,cy,r,ang,br){
  RE.cil(c,cx,cy,r,br?'#5a3a3a':'#6a7580');
  c.save();c.translate(cx,cy);c.rotate(ang);
  c.strokeStyle='#c0c8d0';c.lineWidth=3;
  c.beginPath();c.moveTo(-r*0.8,0);c.lineTo(r*0.8,0);c.stroke();
  c.beginPath();c.moveTo(0,-r*0.8);c.lineTo(0,r*0.8);c.stroke();
  c.restore();
};

RE.drawR4=function(c,S){
  var W=c.canvas.width,br=S.broken;
  c.clearRect(0,0,W,c.canvas.height);
  RE.block(c,30,140,580,220);
  RE.head(c,30,60,580,85);
  RE.crank(c,305,60,580,br);
  RE.fly(c,605,305,32,S.crankAngle,br);
  for(var i=0;i<4;i++){
    RE.cyl(c,115+i*135,305,38,S.crankAngle+i*Math.PI,br);
  }
  c.fillStyle='#5d7189';c.font='bold 12px Arial';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('R4  •  4 цилиндра в ряд',45,20);
};

RE.drawV=function(c,S,n){
  var W=c.canvas.width,br=S.broken;
  c.clearRect(0,0,W,c.canvas.height);
  RE.block(c,20,40,W-40,160);
  RE.block(c,20,240,W-40,160);
  RE.crank(c,220,40,W-40,br);
  var sp=Math.min(60,(W-80)/n);
  var startX=W/2-(n-1)*sp/2;
  for(var i=0;i<n;i++){
    RE.cyl(c,startX+i*sp,120,22,S.crankAngle+i*Math.PI,br);
    RE.cyl(c,startX+i*sp,320,22,S.crankAngle+(i+n)*Math.PI,br);
  }
  c.fillStyle='#5d7189';c.font='bold 12px Arial';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('V'+n+'  •  '+n+' цилиндров V-образно',30,10);
};

RE.drawBoxer=function(c,S){
  var W=c.canvas.width,br=S.broken;
  c.clearRect(0,0,W,c.canvas.height);
  RE.block(c,40,180,W-80,80);
  RE.block(c,40,80,W-80,80);
  RE.block(c,40,260,W-80,80);
  RE.crank(c,220,60,W-60,br);
  RE.fly(c,W-55,220,34,S.crankAngle,br);
  RE.cyl(c,W/2-90,140,30,S.crankAngle,br);
  RE.cyl(c,W/2+90,140,30,S.crankAngle+Math.PI,br);
  RE.cyl(c,W/2-90,300,30,S.crankAngle+Math.PI,br);
  RE.cyl(c,W/2+90,300,30,S.crankAngle,br);
  c.fillStyle='#5d7189';c.font='bold 12px Arial';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('BOXER  •  Subaru EJ25',W/2,10);
};

RE.drawRadial=function(c,S){
  var W=c.canvas.width,br=S.broken;
  c.clearRect(0,0,W,c.canvas.height);
  var cx=W/2,cy=220,R=130,n=9;
  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;
    var x=cx+Math.cos(a)*R;
    var y=cy+Math.sin(a)*R;
    c.save();c.translate(x,y);c.rotate(a);
    c.fillStyle=br?'#1a0e0e':'#0e141c';
    c.fillRect(-15,-30,30,60);
    c.strokeStyle='#2a3a4a';c.lineWidth=1.5;
    c.strokeRect(-15,-30,30,60);
    var ph=S.crankAngle+i*Math.PI*2/n;
    c.fillStyle='#d8e0e8';
    c.fillRect(-12,-20+Math.cos(ph)*10,24,18);
    c.restore();
  }
  RE.cil(c,cx,cy,40,'#3a4654');
  RE.cil(c,cx,cy,20,'#1a232e');
  c.save();c.translate(cx,cy);c.rotate(S.crankAngle);
  c.strokeStyle='#a8b4c0';c.lineWidth=5;
  c.beginPath();c.moveTo(-35,0);c.lineTo(35,0);c.stroke();
  c.restore();
  c.fillStyle='#5d7189';c.font='bold 12px Arial';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('RADIAL  •  Wright R-1820',40,15);
};

RE.drawWankel=function(c,S){
  var W=c.canvas.width;
  c.clearRect(0,0,W,c.canvas.height);
  var cy=220,R=90;
  var cxL=W/2-95,cxR=W/2+95;
  c.fillStyle='#1a232e';c.fillRect(40,60,W-80,340);
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(40,60,W-80,340);
  var ecc=R*0.28,rotR=R*0.65;
  function rotor(cx,ph){
    c.save();c.translate(cx,cy);
    c.fillStyle='rgba(80,140,200,0.15)';
    c.beginPath();
    for(var i=0;i<=72;i++){
      var t=i/72*Math.PI*2;
      var r=R*(1+0.25*Math.cos(3*t));
      if(i===0)c.moveTo(Math.cos(t)*r,Math.sin(t)*r);
      else c.lineTo(Math.cos(t)*r,Math.sin(t)*r);
    }
    c.closePath();c.fill();
    c.strokeStyle='#5a8fc0';c.lineWidth=2;c.stroke();
    c.save();c.translate(Math.cos(ph)*ecc,Math.sin(ph)*ecc);c.rotate(-ph/3);
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
  rotor(cxL,0);rotor(cxR,Math.PI);
  c.strokeStyle='#8a95a3';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(cxL-R-30,cy);c.lineTo(cxR+R+30,cy);c.stroke();
  c.fillStyle='#5d7189';c.font='bold 12px Arial';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('WANKEL  •  13B Renesis  •  2 ротора',40,15);
};

RE.drawScooter=function(c,S){
  var W=c.canvas.width,br=S.broken;
  c.clearRect(0,0,W,c.canvas.height);
  RE.block(c,100,80,W-200,300);
  RE.crank(c,280,130,W-130,br);
  RE.fly(c,W-110,280,26,S.crankAngle,br);
  RE.cyl(c,W/2,220,60,S.crankAngle,br);
  c.fillStyle='#5d7189';c.font='bold 12px Arial';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('SCOOTER  •  1 цилиндр',110,90);
};

RE.drawTDI=function(c,S){
  RE.drawR4(c,S);
  c.fillStyle='#8fb5d8';c.font='bold 12px Arial';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('1.9 TDI  •  Volkswagen',45,20);
};

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
  if(has('tdi'))                       return RE.drawTDI(c,S);
  return RE.drawR4(c,S);
};

})();