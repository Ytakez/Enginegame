(function(){var RB=window.RB;if(!RB)return;var RE=window.RE=window.RE||{};
RE.drawGalant6=function(c,S){var W=c.canvas.width;var br=S.broken;var crankY=215;
var CR=14,ROD=34,halfW=22,spacing=115;var startX=W/2-(3-1)*spacing/2;
var tTop=75,tBot=195,bTop=235,bBot=355;var camT=60,camB=370;
c.fillStyle=RB.metalGrad(c,15,35,175,br);RB.rr(c,15,35,W-30,175,10);c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
c.fillStyle=RB.metalGrad(c,15,220,175,br);RB.rr(c,15,220,W-30,175,10);c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
RB.drawCrank(c,30,W-30,crankY,br);var cnt=4;for(var mi=0;mi<=cnt;mi++){var mx=40+mi*((W-80)/cnt);RB.drawMainBearing(c,mx,crankY,9,br);}
for(var i=0;i<3;i++){var cx=startX+i*spacing;RE.drawCyl(c,S,cx,crankY,tTop,tBot,halfW,S.crankAngle+(i*4*Math.PI/3),CR,ROD,-1,br,S.running&&!S.stalled&&!br,S.throttle,i+1,camT);}
for(var j=0;j<3;j++){var cx2=startX+j*spacing;RE.drawCyl(c,S,cx2,crankY,bTop,bBot,halfW,S.crankAngle+((j+3)*4*Math.PI/3),CR,ROD,1,br,S.running&&!S.stalled&&!br,S.throttle,j+4,camB);}
var eg=c.createLinearGradient(0,130,0,150);if(br){eg.addColorStop(0,'#3a2424');eg.addColorStop(1,'#2a1a1a');}else{eg.addColorStop(0,'#3a2a1a');eg.addColorStop(1,'#2a1a0a');}
c.strokeStyle=eg;c.lineWidth=9;c.lineCap='round';for(var pi=0;pi<3;pi++){var px=startX+pi*spacing;c.beginPath();c.moveTo(px,152);c.lineTo(px,178);c.stroke();}c.beginPath();c.moveTo(startX-30,184);c.lineTo(startX+2*spacing+30,184);c.stroke();
c.fillStyle=br?'#8a5a5a':'#d8a8ff';c.font='bold 12px Segoe UI, sans-serif';c.textAlign='left';c.textBaseline='top';c.fillText('2.0 V6  •  Mitsubishi Galant 6',45,12);};
})();