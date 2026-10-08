(function(){var RB=window.RB;if(!RB)return;var RE=window.RE=window.RE||{};
RE.drawPassatB3=function(c,S){var W=c.canvas.width;var br=S.broken;var crankY=305,CR=31,ROD=93;
var xs=[120,250,380,510];var halfW=42,topY=155,botY=290,camY=100;var offs=[2*Math.PI,3*Math.PI,Math.PI,0];
var pg=c.createLinearGradient(0,355,0,415);if(br){pg.addColorStop(0,'#2a1a1a');pg.addColorStop(1,'#1a0a0a');}else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');}
c.fillStyle=pg;c.beginPath();c.moveTo(40,355);c.lineTo(600,355);c.lineTo(580,415);c.lineTo(60,415);c.closePath();c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();RB.bolt(c,320,408,5,br);
c.fillStyle=RB.metalGrad(c,30,140,220,br);RB.rr(c,30,140,580,220,8);c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
c.strokeStyle=br?'rgba(90,40,40,0.5)':'rgba(30,40,52,0.55)';c.lineWidth=1.5;for(var rb=0;rb<12;rb++){var ry=155+rb*17;c.beginPath();c.moveTo(35,ry);c.lineTo(605,ry);c.stroke();}
c.fillStyle=RB.metalGrad(c,30,60,85,br);RB.rr(c,30,60,580,85,8);c.fill();c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
c.fillStyle=br?'#3a2424':'#1d2530';RB.rr(c,40,42,560,22,6);c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=1.5;c.stroke();for(var bi=0;bi<5;bi++)RB.bolt(c,60+bi*130,53,3,br);
c.fillStyle='#1a232e';c.fillRect(60,camY,520,6);c.strokeStyle='#3a4654';c.lineWidth=1;c.strokeRect(60,camY,520,6);
RB.drawCrank(c,60,580,crankY,br);var mains=[70,180,320,460,570];for(var mi=0;mi<mains.length;mi++)RB.drawMainBearing(c,mains[mi],crankY,12,br);RB.drawFlywheel(c,605,crankY,32,S.crankAngle,br);RB.drawBelt(c,25,camY+3,crankY,br);
for(var i=0;i<4;i++){RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);}
var eg=c.createLinearGradient(0,120,0,140);if(br){eg.addColorStop(0,'#3a2424');eg.addColorStop(1,'#2a1a1a');}else{eg.addColorStop(0,'#3a2a1a');eg.addColorStop(1,'#2a1a0a');}
c.strokeStyle=eg;c.lineWidth=10;c.lineCap='round';for(var pi=0;pi<4;pi++){var px=105+pi*120;c.beginPath();c.moveTo(px,152);c.lineTo(px,182);c.stroke();}c.beginPath();c.moveTo(85,188);c.lineTo(480,188);c.stroke();
c.fillStyle=br?'#8a5a5a':'#8fb5d8';c.font='bold 12px Segoe UI, sans-serif';c.textAlign='left';c.textBaseline='top';c.fillText('1.8 B3  •  Volkswagen Passat B3',45,10);};
RE.drawBluebird=function(c,S){var W=c.canvas.width;var br=S.broken;var crankY=305,CR=33,ROD=96;
var xs=[118,248,378,508];var halfW=43,topY=152,botY=290,camY=98;var offs=[2*Math.PI,3*Math.PI,Math.PI,0];
var pg=c.createLinearGradient(0,355,0,415);if(br){pg.addColorStop(0,'#2a1a1a');pg.addColorStop(1,'#1a0a0a');}else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#131b24');}
c.fillStyle=pg;c.beginPath();c.moveTo(40,355);c.lineTo(600,355);c.lineTo(580,415);c.lineTo(60,415);c.closePath();c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();RB.bolt(c,320,408,5,br);
c.fillStyle=RB.metalGrad(c,30,140,220,br);RB.rr(c,30,140,580,220,8);c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
c.strokeStyle=br?'rgba(90,40,40,0.5)':'rgba(30,40,52,0.55)';c.lineWidth=1.5;for(var rb=0;rb<13;rb++){var ry=155+rb*16;c.beginPath();c.moveTo(35,ry);c.lineTo(605,ry);c.stroke();}
c.fillStyle=RB.metalGrad(c,30,60,85,br);RB.rr(c,30,60,580,85,8);c.fill();c.strokeStyle=br?'#6a3a3a':'#4a5a6c';c.lineWidth=2;c.stroke();
c.fillStyle=br?'#3a2424':'#1d2530';RB.rr(c,40,42,560,22,6);c.fill();for(var bi=0;bi<6;bi++)RB.bolt(c,55+bi*105,53,3,br);
c.fillStyle='#1a232e';c.fillRect(60,camY,520,6);
RB.drawCrank(c,60,580,crankY,br);var mains=[70,180,320,460,570];for(var mi=0;mi<mains.length;mi++)RB.drawMainBearing(c,mains[mi],crankY,12,br);RB.drawFlywheel(c,605,crankY,33,S.crankAngle,br);RB.drawBelt(c,25,camY+3,crankY,br);
for(var i=0;i<4;i++){RE.drawCyl(c,S,xs[i],crankY,topY,botY,halfW,S.crankAngle+offs[i],CR,ROD,-1,br,S.running&&!S.stalled&&!br,S.throttle,i+1,camY+3);}
var eg=c.createLinearGradient(0,120,0,140);if(br){eg.addColorStop(0,'#3a2424');eg.addColorStop(1,'#2a1a1a');}else{eg.addColorStop(0,'#3a2a1a');eg.addColorStop(1,'#2a1a0a');}
c.strokeStyle=eg;c.lineWidth=9;c.lineCap='round';for(var pi=0;pi<4;pi++){var px=105+pi*120;c.beginPath();c.moveTo(px,150);c.lineTo(px,180);c.stroke();}c.beginPath();c.moveTo(85,186);c.lineTo(490,186);c.stroke();
c.fillStyle=br?'#8a5a5a':'#8fd8b5';c.font='bold 12px Segoe UI, sans-serif';c.textAlign='left';c.textBaseline='top';c.fillText('2.0 CA20  •  Nissan Bluebird 1990',45,10);};
})();