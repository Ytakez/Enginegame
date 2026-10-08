(function(){var RB=window.RB;if(!RB)return;var RE=window.RE=window.RE||{};
RE.drawV=function(c,S,n){var W=c.canvas.width;var br=S.broken;var crankY=215;
var CR,ROD,halfW,spacing;
if(n===10){CR=12;ROD=30;halfW=19;spacing=95;}
else if(n===20){CR=7;ROD=20;halfW=12;spacing=52;}
else if(n===8){CR=13;ROD=32;halfW=22;spacing=118;}
else{CR=8;ROD=22;halfW=14;spacing=62;}
var startX=W/2-(n-1)*spacing/2;
var tTop=70,tBot=195,bTop=235,bBot=360;var camT=55,camB=375;
c.fillStyle=RB.metalGrad(c,15,30,180,br);RB.rr(c,15,30,W-30,180,10);c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
c.fillStyle=RB.metalGrad(c,15,220,180,br);RB.rr(c,15,220,W-30,180,10);c.fill();c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();
RB.drawCrank(c,30,W-30,crankY,br);
var cnt=n+1;
for(var mi=0;mi<=cnt;mi++){var mx=40+mi*((W-80)/cnt);RB.drawMainBearing(c,mx,crankY,n>=20?6:9,br);}
for(var i=0;i<n;i++){
  var cx=startX+i*spacing;
  RE.drawCyl(c,S,cx,crankY,tTop,tBot,halfW,S.crankAngle+(i*4*Math.PI/n),CR,ROD,-1,br,S.running&&!S.stalled&&!br,S.throttle,i+1,camT);
}
for(var j=0;j<n;j++){
  var cx2=startX+j*spacing;
  RE.drawCyl(c,S,cx2,crankY,bTop,bBot,halfW,S.crankAngle+((j+n)*4*Math.PI/n),CR,ROD,1,br,S.running&&!S.stalled&&!br,S.throttle,j+n+1,camB);
}
c.fillStyle=br?'#8a5a5a':'#5d7189';
c.font='bold 11px Segoe UI, sans-serif';
c.textAlign='center';c.textBaseline='top';
c.fillText(n===10?'V10  •  10 цилиндров':(n===20?'V20  •  20 цилиндров':(n===8?'V8  •  8 цилиндров':'V16  •  16 цилиндров')),W/2,12);};
})();