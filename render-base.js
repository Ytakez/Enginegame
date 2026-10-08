(function(){
"use strict";

window.RB = {};

RB.rr = function(c,x,y,w,h,r){
  c.beginPath();c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
};

RB.bolt = function(c,x,y,r,br){
  var g=c.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);
  if(br){g.addColorStop(0,'#a08080');g.addColorStop(1,'#3a2020');}
  else{g.addColorStop(0,'#c8d4e0');g.addColorStop(.6,'#8a95a3');g.addColorStop(1,'#3a4654');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle='#1a232e';c.lineWidth=.8;c.stroke();
  c.beginPath();c.moveTo(x-r*.6,y);c.lineTo(x+r*.6,y);c.stroke();
};

RB.metalGrad = function(c,x,y,h,br){
  var g=c.createLinearGradient(x,y,x,y+h);
  if(br){g.addColorStop(0,'#4a2a2a');g.addColorStop(.5,'#8a5a5a');g.addColorStop(1,'#2a1a1a');}
  else{g.addColorStop(0,'#2b3746');g.addColorStop(.2,'#5a6878');g.addColorStop(.45,'#7a8797');
       g.addColorStop(.7,'#4a5664');g.addColorStop(1,'#1d2530');}
  return g;
};

RB.drawCam = function(c,x,y,ang){
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
};

RB.drawValve = function(c,x,springTop,valveTop,lift,color,br){
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
};

RB.drawGear = function(c,x,y,r,br){
  var g=c.createRadialGradient(x-3,y-3,1,x,y,r);
  if(br){g.addColorStop(0,'#8a6a6a');g.addColorStop(1,'#2a1a1a');}
  else{g.addColorStop(0,'#a8b4c0');g.addColorStop(.5,'#6a7685');g.addColorStop(1,'#2a3340');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle=br?'#5a3030':'#3a4654';c.lineWidth=2;
  for(var i=0;i<16;i++){var a=i/16*Math.PI*2;
    c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);
    c.lineTo(x+Math.cos(a)*(r+3),y+Math.sin(a)*(r+3));c.stroke();}
  c.fillStyle='#1a232e';c.beginPath();c.arc(x,y,r*.3,0,7);c.fill();
};

RB.drawBelt = function(c,x,topY,botY,br){
  RB.drawGear(c,x,topY,14,br);
  RB.drawGear(c,x,botY,18,br);
  c.strokeStyle=br?'#5a3030':'#1a1a1a';c.lineWidth=6;
  c.beginPath();c.moveTo(x-14,topY);c.lineTo(x-18,botY);c.stroke();
  c.beginPath();c.moveTo(x+14,topY);c.lineTo(x+18,botY);c.stroke();
  c.strokeStyle=br?'#3a2020':'#3a3a3a';c.lineWidth=1;
  for(var i=0;i<=20;i++){var t=i/20,y1=topY+(botY-topY)*t,w1=14+(18-14)*t;
    c.beginPath();c.moveTo(x-w1,y1);c.lineTo(x-w1-3,y1);
    c.moveTo(x+w1,y1);c.lineTo(x+w1+3,y1);c.stroke();}
};

RB.drawFlywheel = function(c,x,y,r,ang,br){
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
  c.restore();
};

RB.drawCrank = function(c,x1,x2,y,br){
  c.fillStyle='rgba(0,0,0,0.5)';c.fillRect(x1,y-13,x2-x1,26);
  var sg=c.createLinearGradient(0,y-10,0,y+10);
  if(br){sg.addColorStop(0,'#2a1a1a');sg.addColorStop(.5,'#8a6a6a');sg.addColorStop(1,'#1a0a0a');}
  else{sg.addColorStop(0,'#2a3340');sg.addColorStop(.25,'#7a8797');
       sg.addColorStop(.5,'#a8b4c0');sg.addColorStop(.75,'#6a7685');sg.addColorStop(1,'#1d2530');}
  c.fillStyle=sg;c.fillRect(x1,y-10,x2-x1,20);
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.strokeRect(x1,y-10,x2-x1,20);
  if(!br){c.fillStyle='rgba(255,255,255,0.15)';c.fillRect(x1,y-7,x2-x1,3);}
};

RB.drawMainBearing = function(c,x,y,r,br){
  var g=c.createRadialGradient(x-3,y-3,1,x,y,r);
  if(br){g.addColorStop(0,'#8a6a6a');g.addColorStop(1,'#1a0a0a');}
  else{g.addColorStop(0,'#c8d4e0');g.addColorStop(.5,'#7a8797');g.addColorStop(1,'#3a4654');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle='#0a0f15';c.lineWidth=1.5;c.stroke();
  RB.bolt(c,x-r*.55,y-r*.55,2,br);
  RB.bolt(c,x+r*.55,y-r*.55,2,br);
  RB.bolt(c,x-r*.55,y+r*.55,2,br);
  RB.bolt(c,x+r*.55,y+r*.55,2,br);
};

RB.drawSpark = function(c,cx,topY,dir,phase,firing){
  var cycPos=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
  var d=cycPos-2*Math.PI;
  var inten=Math.max(0,1-Math.abs(d)/0.6);
  var y=dir<0?topY-8:topY-6;
  c.fillStyle='#e8e4dc';c.fillRect(cx-3,y-8,6,12);
  c.fillStyle='#8a95a3';c.fillRect(cx-4,y+4,8,5);
  c.fillStyle='#2a333f';c.fillRect(cx-1,y+9,2,4);
  if(firing&&inten>0.5){c.fillStyle='#fff8c0';c.beginPath();c.arc(cx,y+13,2,0,7);c.fill();}
};

})();