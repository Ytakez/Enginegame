(function(){
"use strict";
var RE=window.RE={};

function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function gV(c,y0,y1,a,b,d){var g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);if(d){g.addColorStop(.5,b);g.addColorStop(1,d);}else g.addColorStop(1,b);return g;}
function gH(c,x0,x1,a,b,d){var g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,a);if(d){g.addColorStop(.5,b);g.addColorStop(1,d);}else g.addColorStop(1,b);return g;}

function drawHead(c,W,br){
  var y=15,h=60;
  c.fillStyle=br?'#3a2424':'#3a4654';
  c.fillRect(20,y,W-40,h*0.55);
  c.strokeStyle=br?'#5a3030':'#4a5a6c';c.lineWidth=2;
  c.strokeRect(20,y,W-40,h*0.55);
  c.fillStyle=br?'#7a5a5a':'#8a95a3';
  for(var i=0;i<7;i++){c.beginPath();c.arc(50+i*(W-100)/6,y+h*0.27,3,0,7);c.fill();}
  var g=gV(c,y+h*0.55,y+h,'#a8b4c0','#6a7580','#3a4654');
  c.fillStyle=br?'#4a3030':g;
  c.fillRect(20,y+h*0.55,W-40,h*0.45);
  c.strokeStyle=br?'#5a3030':'#2a3a4a';c.lineWidth=2;
  c.strokeRect(20,y+h*0.55,W-40,h*0.45);
}

function drawCamshaft(c,W,y,br){
  c.strokeStyle=br?'#5a3a3a':'#8894a2';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(30,y);c.lineTo(W-30,y);c.stroke();
  c.strokeStyle='#0a1018';c.lineWidth=2;
  c.beginPath();c.moveTo(30,y);c.lineTo(W-30,y);c.stroke();
}

function drawFlywheel(c,cx,cy,r,ang,br){
  c.fillStyle=br?'#4a3030':'#6a7580';
  for(var i=0;i<32;i++){
    var a=(i/32)*Math.PI*2;
    var x1=cx+Math.cos(a)*r,y1=cy+Math.sin(a)*r;
    var x2=cx+Math.cos(a)*(r+5),y2=cy+Math.sin(a)*(r+5);
    c.beginPath();
    c.moveTo(x1-2,y1-2);c.lineTo(x2-2,y2-2);c.lineTo(x2+2,y2+2);c.lineTo(x1+2,y1+2);
    c.closePath();c.fill();
  }
  var g=c.createRadialGradient(cx-r*.3,cy-r*.3,2,cx,cy,r);
  if(br){g.addColorStop(0,'#6a4a4a');g.addColorStop(1,'#2a1818');}
  else{g.addColorStop(0,'#b8c4d0');g.addColorStop(.6,'#6a7580');g.addColorStop(1,'#2a3340');}
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=2;c.stroke();
  c.fillStyle=br?'#2a1818':'#2a3340';
  for(var h=0;h<6;h++){
    var ha=(h/6)*Math.PI*2+ang*0.3;
    c.beginPath();c.arc(cx+Math.cos(ha)*r*0.62,cy+Math.sin(ha)*r*0.62,r*0.12,0,7);c.fill();
  }
  c.fillStyle='#1a232e';c.beginPath();c.arc(cx,cy,r*0.22,0,7);c.fill();
  c.strokeStyle=br?'#7a5a5a':'#a8b4c0';c.lineWidth=2;c.stroke();
}

function drawCrankshaft(c,x1,x2,y,crankR,pins,br){
  c.strokeStyle=br?'#5a3a3a':'#b8c4d0';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
  c.strokeStyle='#0a1018';c.lineWidth=1.5;
  c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
  for(var i=0;i<=pins.length;i++){
    var mx=x1+(i/(pins.length))*((x2-x1));
    var g=c.createRadialGradient(mx-3,y-3,1,mx,y,12);
    if(br){g.addColorStop(0,'#6a4a4a');g.addColorStop(1,'#2a1818');}
    else{g.addColorStop(0,'#e0eaf0');g.addColorStop(.5,'#8a95a3');g.addColorStop(1,'#2a3340');}
    c.fillStyle=g;c.beginPath();c.arc(mx,y,10,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();
  }
  for(var j=0;j<pins.length;j++){
    var p=pins[j];
    var px=p.x,py=y+Math.cos(p.phase)*crankR;
    var cwY=y-Math.cos(p.phase)*crankR;
    var cg=c.createRadialGradient(px-4,cwY-4,2,px,cwY,crankR*1.1);
    if(br){cg.addColorStop(0,'#8a6a6a');cg.addColorStop(1,'#2a1818');}
    else{cg.addColorStop(0,'#c8d4e0');cg.addColorStop(.5,'#7a8695');cg.addColorStop(1,'#3a4654');}
    c.fillStyle=cg;c.beginPath();c.arc(px,cwY,crankR*1.1,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=2;c.stroke();
    var pg=c.createRadialGradient(px-2,py-2,1,px,py,6);
    if(br){pg.addColorStop(0,'#8a6a6a');pg.addColorStop(1,'#2a1818');}
    else{pg.addColorStop(0,'#ffffff');pg.addColorStop(1,'#6a7580');}
    c.fillStyle=pg;c.beginPath();c.arc(px,py,6,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();
  }
}

function drawCyl(c,x,yTop,yBot,r,phase,crankCY,crankR,br,thr,S){
  var h=yBot-yTop;
  c.fillStyle=gH(c,x-r,x+r,'#0a0f15','#1a232e','#0a0f15');
  c.fillRect(x-r,yTop,r*2,h);
  c.fillStyle='rgba(180,220,255,0.05)';
  c.fillRect(x-r+2,yTop+2,r*0.5,h-4);
  c.strokeStyle=br?'#5a3030':'#3a4a5c';c.lineWidth=2;
  c.strokeRect(x-r,yTop,r*2,h);
  c.strokeStyle=br?'rgba(120,60,60,.4)':'rgba(80,100,120,.35)';c.lineWidth=1;
  for(var ri=1;ri<6;ri++){
    c.beginPath();c.moveTo(x-r+2,yTop+ri*h/6);c.lineTo(x+r-2,yTop+ri*h/6);c.stroke();
  }

  var pistonH=r*1.6;
  var travel=h-pistonH-8;
  var pistonY=yTop+4+((Math.cos(phase)+1)/2)*travel;

  var pg=gH(c,x-r,x+r,'#3a4654','#e8f0f8','#2a333f');
  c.fillStyle=br?'#5a4a4a':pg;
  rr(c,x-r+2,pistonY,(r-2)*2,pistonH,3);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=1.8;c.stroke();

  var crownG=gH(c,x-r+2,x+r-2,'#5a6570','#c8d4e0','#3a4654');
  c.fillStyle=br?'#6a5a5a':crownG;
  rr(c,x-r+2,pistonY,(r-2)*2,r*0.35,3);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();

  c.strokeStyle=br?'#8a6a6a':'#1a252f';c.lineWidth=2;
  for(var k=0;k<3;k++){
    c.beginPath();
    c.moveTo(x-r+3,pistonY+r*0.45+k*r*0.18);
    c.lineTo(x+r-3,pistonY+r*0.45+k*r*0.18);
    c.stroke();
  }

  var pinY0=pistonY+pistonH*0.7;
  c.fillStyle='#0a1018';c.beginPath();c.arc(x,pinY0,r*0.15,0,7);c.fill();
  c.fillStyle=br?'#5a3a3a':'#a8b4c0';c.beginPath();c.arc(x,pinY0,r*0.08,0,7);c.fill();

  var pinY=crankCY+Math.cos(phase)*crankR;
  var rodTopY=pinY0+r*0.1;
  c.strokeStyle='#0a1018';c.lineWidth=Math.max(6,r*0.28);c.lineCap='round';
  c.beginPath();c.moveTo(x,rodTopY);c.lineTo(x,pinY);c.stroke();
  var rg=gH(c,x-2,x+2,'#5a6570','#d8e0e8','#3a4654');
  c.strokeStyle=br?'#7a5a5a':rg;c.lineWidth=Math.max(3,r*0.15);
  c.beginPath();c.moveTo(x,rodTopY);c.lineTo(x,pinY);c.stroke();

  var bg=c.createRadialGradient(x-2,pinY-2,1,x,pinY,r*0.32);
  if(br){bg.addColorStop(0,'#8a6a6a');bg.addColorStop(1,'#2a1818');}
  else{bg.addColorStop(0,'#e0e8f0');bg.addColorStop(.5,'#8a95a3');bg.addColorStop(1,'#2a3340');}
  c.fillStyle=bg;c.beginPath();c.arc(x,pinY,r*0.32,0,7);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();

  c.fillStyle=br?'#5a3030':'#e8e4dc';
  c.fillRect(x-2,yTop-16,4,14);
  c.strokeStyle='#0a1018';c.lineWidth=1;
  c.strokeRect(x-2,yTop-16,4,14);
  c.fillStyle=br?'#5a4040':'#d8c8a0';
  c.fillRect(x-3,yTop-20,6,4);

  var vInX=x-r*0.5,vExX=x+r*0.5;
  var vTop=yTop-16,vH=14;
  c.fillStyle=br?'#8a5a5a':'#6fd0ff';
  c.fillRect(vInX-2,vTop,4,vH);
  c.strokeStyle='#0a1018';c.lineWidth=1;
  c.strokeRect(vInX-2,vTop,4,vH);
  c.beginPath();c.arc(vInX,vTop+vH+3,3.5,0,7);c.fill();c.stroke();
  c.strokeStyle='#c8d4e0';c.lineWidth=1;
  for(var s=0;s<3;s++){c.beginPath();c.moveTo(vInX-3,vTop+3+s*3);c.lineTo(vInX+3,vTop+3+s*3);c.stroke();}
  c.fillStyle=br?'#8a4a4a':'#ff8a6f';
  c.fillRect(vExX-2,vTop,4,vH);
  c.strokeStyle='#0a1018';c.lineWidth=1;
  c.strokeRect(vExX-2,vTop,4,vH);
  c.beginPath();c.arc(vExX,vTop+vH+3,3.5,0,7);c.fill();c.stroke();
  c.strokeStyle='#c8d4e0';c.lineWidth=1;
  for(var s2=0;s2<3;s2++){c.beginPath();c.moveTo(vExX-3,vTop+3+s2*3);c.lineTo(vExX+3,vTop+3+s2*3);c.stroke();}

  if(!br&&S.running&&!S.stalled){
    var cyc=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
    var d=cyc-2*Math.PI;
    var inten=Math.max(0,1-Math.abs(d)/1.3)*(0.5+0.5*thr);
    if(inten>0.05){
      var sg=c.createRadialGradient(x,yTop+30,2,x,yTop+30,r*2.5);
      sg.addColorStop(0,'rgba(255,255,240,'+inten+')');
      sg.addColorStop(.3,'rgba(255,220,120,'+(0.9*inten)+')');
      sg.addColorStop(.7,'rgba(255,100,20,'+(0.4*inten)+')');
      sg.addColorStop(1,'rgba(120,20,0,0)');
      c.fillStyle=sg;
      c.save();
      c.beginPath();c.rect(x-r+2,yTop+2,r*2-4,Math.min(80,h-4));c.clip();
      c.fillRect(x-r*2,yTop,r*4,80);
      c.restore();
    }
  }
}

function drawSprocket(c,cx,cy,r,ang,br){
  c.fillStyle=br?'#4a3030':'#6a7580';
  for(var i=0;i<16;i++){
    var a=(i/16)*Math.PI*2+ang;
    var x1=cx+Math.cos(a)*r,y1=cy+Math.sin(a)*r;
    var x2=cx+Math.cos(a)*(r+3),y2=cy+Math.sin(a)*(r+3);
    c.beginPath();
    c.moveTo(x1-1.5,y1-1.5);c.lineTo(x2-1.5,y2-1.5);c.lineTo(x2+1.5,y2+1.5);c.lineTo(x1+1.5,y1+1.5);
    c.closePath();c.fill();
  }
  var g=c.createRadialGradient(cx-r*.3,cy-r*.3,1,cx,cy,r);
  if(br){g.addColorStop(0,'#7a5a5a');g.addColorStop(1,'#2a1818');}
  else{g.addColorStop(0,'#c8d4e0');g.addColorStop(1,'#3a4654');}
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();
  c.fillStyle='#1a232e';c.beginPath();c.arc(cx,cy,r*0.3,0,7);c.fill();
}

function drawTiming(c,x,ang,br,H){
  drawSprocket(c,x,42,12,ang*0.5,br);
  drawSprocket(c,x,H-75,18,ang,br);
  c.strokeStyle=br?'#4a2a2a':'#1a1a1a';c.lineWidth=6;
  c.beginPath();
  c.moveTo(x-12,42);c.lineTo(x-18,H-75);
  c.moveTo(x+12,42);c.lineTo(x+18,H-75);
  c.stroke();
  c.strokeStyle=br?'#7a5a5a':'#3a4654';c.lineWidth=1;
  for(var i=0;i<14;i++){
    var t=i/14;
    var lx=x-12+(x-18-x+12)*t;
    var ly=42+(H-75-42)*t;
    c.beginPath();c.moveTo(lx-3,ly);c.lineTo(lx+3,ly);c.stroke();
    var rx=x+12+(x+18-x-12)*t;
    c.beginPath();c.moveTo(rx-3,ly);c.lineTo(rx+3,ly);c.stroke();
  }
}

function drawExhaust(c,x1,x2,y,cyls,br){
  var g=gV(c,y-6,y+6,'#5a3a20','#3a2410','#2a1808');
  c.fillStyle=br?'#4a2a1a':g;
  c.fillRect(x1-10,y-6,x2-x1+20,12);
  c.strokeStyle='#0a1018';c.lineWidth=1.5;
  c.strokeRect(x1-10,y-6,x2-x1+20,12);
  for(var i=0;i<cyls.length;i++){
    var cx=cyls[i];
    c.fillStyle=br?'#4a2a1a':g;
    c.fillRect(cx-4,y-40,8,36);
    c.strokeStyle='#0a1018';c.lineWidth=1.5;
    c.strokeRect(cx-4,y-40,8,36);
    c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=2;
    c.beginPath();c.moveTo(cx-4,y-14);c.lineTo(cx+4,y-14);c.stroke();
  }
}

function inlineDraw(c,S,n,r,spacing,label,col){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var crankCY=H-75;
  var crankR=r*0.85;
  var cylTop=95;
  var cylBot=crankCY-crankR-8;
  var panTop=cylBot+6;
  var totalW=(n-1)*spacing;
  var startX=W/2-totalW/2;
  var xs=[];
  for(var i=0;i<n;i++)xs.push(startX+i*spacing);
  var blockL=xs[0]-r-15,blockR=xs[n-1]+r+15;

  var panG=gV(c,panTop,H-10,'#2a3340','#1a232e','#0a0f15');
  c.fillStyle=br?'#2a1818':panG;
  c.beginPath();
  c.moveTo(blockL-5,panTop);c.lineTo(blockR+5,panTop);
  c.lineTo(blockR-15,H-10);c.lineTo(blockL+15,H-10);
  c.closePath();c.fill();
  c.strokeStyle=br?'#5a3030':'#3a4a5c';c.lineWidth=2;c.stroke();

  var blockG=gV(c,cylTop,cylBot,'#a8b4c0','#6a7580','#3a4654');
  c.fillStyle=br?'#4a3030':blockG;
  c.fillRect(blockL-10,cylTop-15,blockR-blockL+20,cylBot-cylTop+25);
  c.strokeStyle=br?'#5a3030':'#2a3a4a';c.lineWidth=2.5;
  c.strokeRect(blockL-10,cylTop-15,blockR-blockL+20,cylBot-cylTop+25);
  c.strokeStyle=br?'rgba(90,40,40,.5)':'rgba(30,40,52,.6)';c.lineWidth=1.5;
  for(var ri=0;ri<8;ri++){
    var ry=cylTop-10+ri*(cylBot-cylTop+15)/7;
    c.beginPath();c.moveTo(blockL-8,ry);c.lineTo(blockR+8,ry);c.stroke();
  }

  drawHead(c,W,br);
  drawCamshaft(c,W,50,br);

  for(var i=0;i<n;i++){
    var cx=xs[i];
    var camAng=S.crankAngle*0.5+i*Math.PI;
    c.save();c.translate(cx-r*0.5,42);c.rotate(camAng);
    var cg=gH(c,-6,6,'#5a6570','#c8d4e0','#3a4654');
    c.fillStyle=br?'#6a4a4a':cg;
    c.beginPath();c.arc(0,0,5,0,7);c.fill();
    c.beginPath();c.ellipse(0,-4,3,5,0,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1;c.stroke();
    c.restore();
    c.save();c.translate(cx+r*0.5,42);c.rotate(camAng+Math.PI);
    c.fillStyle=br?'#6a4a4a':cg;
    c.beginPath();c.arc(0,0,5,0,7);c.fill();
    c.beginPath();c.ellipse(0,-4,3,5,0,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1;c.stroke();
    c.restore();
  }

  var pins=[];
  for(var i=0;i<n;i++)pins.push({x:xs[i],phase:S.crankAngle+i*Math.PI});
  drawCrankshaft(c,blockL,blockR,crankCY,crankR,pins,br);

  for(var i=0;i<n;i++){
    drawCyl(c,xs[i],cylTop,cylBot,r,S.crankAngle+i*Math.PI,crankCY,crankR,br,S.throttle,S);
  }

  drawExhaust(c,xs[0]-10,xs[n-1]+10,panTop+18,xs,br);
  drawTiming(c,blockL-25,S.crankAngle,br,H);
  drawFlywheel(c,blockR+35,crankCY,r*0.95,S.crankAngle,br);

  c.fillStyle=br?'#8a5a5a':col;
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText(label,blockL-20,H-28);
}

RE.drawR4=function(c,S){inlineDraw(c,S,4,34,130,'R4 · 4 цилиндра','#8fb5d8');};
RE.drawInline6=function(c,S){inlineDraw(c,S,6,26,90,'I6 · Toyota 2JZ','#EB0A1E');};
RE.drawTDI=function(c,S){inlineDraw(c,S,4,34,130,'1.9 TDI · Volkswagen','#8fb5d8');};
RE.drawDCi=function(c,S){inlineDraw(c,S,4,34,130,'2.0 dCi · Renault','#f0d860');};
RE.drawPassatB3=function(c,S){inlineDraw(c,S,4,34,130,'1.8 · Passat B3','#8fb5d8');};
RE.drawBluebird=function(c,S){inlineDraw(c,S,4,34,130,'CA20 · Nissan','#e08080');};
RE.drawMTZ=function(c,S){inlineDraw(c,S,4,34,130,'Д-240 · МТЗ-82','#8fb5d8');};

RE.drawScooter=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cx=W/2,r=70;
  var crankCY=H-85,crankR=50,cylTop=90,cylBot=crankCY-crankR-10;

  var panG=gV(c,cylBot+6,H-10,'#2a3340','#1a232e','#0a0f15');
  c.fillStyle=panG;
  c.beginPath();
  c.moveTo(cx-r-30,cylBot+6);c.lineTo(cx+r+30,cylBot+6);
  c.lineTo(cx+r+10,H-10);c.lineTo(cx-r-10,H-10);
  c.closePath();c.fill();
  c.strokeStyle='#3a4a5c';c.lineWidth=2;c.stroke();

  var bg=gV(c,cylTop,cylBot,'#a8b4c0','#6a7580','#3a4654');
  c.fillStyle=br?'#4a3030':bg;
  c.fillRect(cx-r-20,cylTop-15,r*2+40,cylBot-cylTop+25);
  c.strokeStyle='#2a3a4a';c.lineWidth=2.5;
  c.strokeRect(cx-r-20,cylTop-15,r*2+40,cylBot-cylTop+25);
  c.strokeStyle='rgba(30,40,52,.6)';c.lineWidth=1.5;
  for(var ri=0;ri<6;ri++){
    var ry=cylTop-10+ri*(cylBot-cylTop+15)/5;
    c.beginPath();c.moveTo(cx-r-18,ry);c.lineTo(cx+r+18,ry);c.stroke();
  }

  drawHead(c,W,br);
  drawCamshaft(c,W,50,br);

  var cg=gH(c,cx-6,cx+6,'#5a6570','#c8d4e0','#3a4654');
  c.save();c.translate(cx-r*0.5,42);c.rotate(S.crankAngle*0.5);
  c.fillStyle=cg;c.beginPath();c.arc(0,0,5,0,7);c.fill();
  c.beginPath();c.ellipse(0,-4,3,5,0,0,7);c.fill();c.restore();
  c.save();c.translate(cx+r*0.5,42);c.rotate(S.crankAngle*0.5+Math.PI);
  c.fillStyle=cg;c.beginPath();c.arc(0,0,5,0,7);c.fill();
  c.beginPath();c.ellipse(0,-4,3,5,0,0,7);c.fill();c.restore();

  var pins=[{x:cx,phase:S.crankAngle}];
  drawCrankshaft(c,cx-110,cx+110,crankCY,crankR,pins,br);
  drawCyl(c,cx,cylTop,cylBot,r,S.crankAngle,crankCY,crankR,br,S.throttle,S);
  drawTiming(c,cx-r-50,S.crankAngle,br,H);
  drawFlywheel(c,cx+150,crankCY,44,S.crankAngle,br);

  c.fillStyle='#5d7189';c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('S1 · скутер 1 цилиндр',20,H-28);
};

RE.drawV=function(c,S,n){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cyMid=H/2;
  var perRow=Math.floor(n/2);
  var sp=Math.min(80,(W-120)/perRow);
  var r=Math.min(20,sp*0.26);
  var startX=W/2-(perRow-1)*sp/2;
  var crankR=r*0.9;

  var panG=gV(c,cyMid-15,cyMid+15,'#2a3340','#0a0f15');
  c.fillStyle=br?'#2a1818':panG;
  c.fillRect(startX-r*2,cyMid-15,perRow*sp+r*4,30);

  var topBg=gV(c,60,cyMid-40,'#a8b4c0','#6a7580');
  c.fillStyle=br?'#4a3030':topBg;
  c.fillRect(startX-r-15,cyMid-90,perRow*sp+30,80);
  c.strokeStyle='#2a3a4a';c.lineWidth=2.5;
  c.strokeRect(startX-r-15,cyMid-90,perRow*sp+30,80);

  var botBg=gV(c,cyMid+40,cyMid+120,'#a8b4c0','#6a7580');
  c.fillStyle=br?'#4a3030':botBg;
  c.fillRect(startX-r-15,cyMid+10,perRow*sp+30,80);
  c.strokeStyle='#2a3a4a';c.lineWidth=2.5;
  c.strokeRect(startX-r-15,cyMid+10,perRow*sp+30,80);

  c.fillStyle='#3a4654';c.fillRect(startX-r-15,cyMid-125,perRow*sp+30,35);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(startX-r-15,cyMid-125,perRow*sp+30,35);
  c.fillStyle='#3a4654';c.fillRect(startX-r-15,cyMid+90,perRow*sp+30,35);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(startX-r-15,cyMid+90,perRow*sp+30,35);

  drawCamshaft(c,W,cyMid-110,br);
  drawCamshaft(c,W,cyMid+108,br);

  for(var i=0;i<perRow;i++){
    var cx=startX+i*sp;
    drawCyl(c,cx,cyMid-88,cyMid-30,r,S.crankAngle+i*Math.PI*2/perRow,cyMid,crankR,br,S.throttle,S);
  }
  for(var j=0;j<perRow;j++){
    var cx2=startX+j*sp;
    drawCyl(c,cx2,cyMid+30,cyMid+88,r,S.crankAngle+(j+perRow)*Math.PI*2/perRow,cyMid,crankR,br,S.throttle,S);
  }

  var pins=[];
  for(var i=0;i<perRow;i++)pins.push({x:startX+i*sp,phase:S.crankAngle+i*Math.PI*2/perRow});
  drawCrankshaft(c,startX-r-10,startX+(perRow-1)*sp+r+10,cyMid,crankR*0.7,pins,br);
  drawFlywheel(c,W-50,cyMid,40,S.crankAngle,br);

  c.fillStyle='#5d7189';c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('V'+n+' · '+n+' цилиндров V-образно',20,H-28);
};

RE.drawBoxer=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cyMid=H/2;
  var xs=[W/2-90,W/2+90];
  var r=32,crankR=34;

  var topBg=gV(c,70,cyMid-30,'#a8b4c0','#6a7580');
  c.fillStyle=br?'#4a3030':topBg;
  c.fillRect(xs[0]-50,cyMid-90,180,80);
  c.strokeStyle='#2a3a4a';c.lineWidth=2.5;c.strokeRect(xs[0]-50,cyMid-90,180,80);
  c.fillStyle='#3a4654';c.fillRect(xs[0]-50,cyMid-125,180,35);
  c.strokeStyle='#4a5a6c';c.strokeRect(xs[0]-50,cyMid-125,180,35);

  var botBg=gV(c,cyMid+30,cyMid+110,'#a8b4c0','#6a7580');
  c.fillStyle=br?'#4a3030':botBg;
  c.fillRect(xs[0]-50,cyMid+10,180,80);
  c.strokeStyle='#2a3a4a';c.lineWidth=2.5;c.strokeRect(xs[0]-50,cyMid+10,180,80);
  c.fillStyle='#3a4654';c.fillRect(xs[0]-50,cyMid+90,180,35);
  c.strokeStyle='#4a5a6c';c.strokeRect(xs[0]-50,cyMid+90,180,35);

  drawCamshaft(c,W,cyMid-110,br);
  drawCamshaft(c,W,cyMid+108,br);

  for(var i=0;i<2;i++)drawCyl(c,xs[i],cyMid-88,cyMid-30,r,S.crankAngle+i*Math.PI,cyMid,crankR,br,S.throttle,S);
  for(var j=0;j<2;j++)drawCyl(c,xs[j],cyMid+30,cyMid+88,r,S.crankAngle+(j+2)*Math.PI,cyMid,crankR,br,S.throttle,S);

  drawCrankshaft(c,xs[0]-40,xs[1]+40,cyMid,crankR*0.7,[
    {x:xs[0],phase:S.crankAngle},
    {x:xs[1],phase:S.crankAngle+Math.PI}
  ],br);
  drawFlywheel(c,W-50,cyMid,40,S.crankAngle,br);

  c.fillStyle='#5d7189';c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('BOXER · Subaru EJ25',20,H-28);
};

RE.drawRadial=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cx=W/2,cy=H/2,R=Math.min(W,H)/2-65,n=9;
  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;
    var x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;
    c.save();c.translate(x,y);c.rotate(a+Math.PI/2);
    c.fillStyle=gH(c,-16,16,'#0a0f15','#2a3340','#0a0f15');
    c.fillRect(-16,-40,32,80);
    c.strokeStyle='#3a4a5c';c.lineWidth=2;c.strokeRect(-16,-40,32,80);
    c.strokeStyle='rgba(80,100,120,.4)';c.lineWidth=1;
    for(var rr2=0;rr2<4;rr2++){
      c.beginPath();c.moveTo(-14,-30+rr2*18);c.lineTo(14,-30+rr2*18);c.stroke();
    }
    c.fillStyle=br?'#4a3030':'#3a4654';c.fillRect(-18,-52,36,14);
    c.strokeStyle='#1a232e';c.lineWidth=1.5;c.strokeRect(-18,-52,36,14);
    c.fillStyle='#e8e4dc';c.fillRect(-2,-58,4,8);
    var ph=S.crankAngle+i*Math.PI*2/n;
    var pistonY=-25+Math.cos(ph)*12;
    var pg=gH(c,-11,11,'#4a5566','#e0e8f0','#2a3340');
    c.fillStyle=br?'#6a5a5a':pg;
    rr(c,-11,pistonY,22,20,3);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();
    c.strokeStyle='#1a252f';c.lineWidth=1.5;
    for(var k=0;k<3;k++){c.beginPath();c.moveTo(-9,pistonY+4+k*5);c.lineTo(9,pistonY+4+k*5);c.stroke();}
    var py=Math.sin(ph)*8;
    c.strokeStyle='#0a1018';c.lineWidth=5;
    c.beginPath();c.moveTo(0,pistonY+18);c.lineTo(py,30);c.stroke();
    c.strokeStyle=br?'#7a5a5a':'#8894a2';c.lineWidth=3;
    c.beginPath();c.moveTo(0,pistonY+18);c.lineTo(py,30);c.stroke();
    c.restore();
  }
  var cg=c.createRadialGradient(cx-10,cy-10,5,cx,cy,R*0.35);
  if(br){cg.addColorStop(0,'#6a4a4a');cg.addColorStop(1,'#2a1818');}
  else{cg.addColorStop(0,'#b8c4d0');cg.addColorStop(.5,'#7a8695');cg.addColorStop(1,'#3a4654');}
  c.fillStyle=cg;c.beginPat