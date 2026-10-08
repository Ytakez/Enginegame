(function(){var RB=window.RB;if(!RB)return;var RE=window.RE=window.RE||{};
RE.drawV=function(c,S,n){
var W=c.canvas.width;
var br=S.broken;
var crankY=215;
var CR,ROD,halfW,spacing;
if(n===6){CR=15;ROD=36;halfW=24;spacing=130;}
else if(n===8){CR=13;ROD=32;halfW=22;spacing=118;}
else if(n===10){CR=12;ROD=30;halfW=19;spacing=95;}
else if(n===12){CR=11;ROD=27;halfW=17;spacing=80;}
else if(n===16){CR=9;ROD=23;halfW=13;spacing=60;}
else if(n===20){CR=8;ROD=20;halfW=11;spacing=48;}
else if(n===22){CR=7;ROD=18;halfW=10;spacing=44;}
else{CR=8;ROD=22;halfW=14;spacing=62;}
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
  var brR=n>=20?4:(n>=12?6:9);
  RB.drawMainBearing(c,mx,crankY,brR,br);
}
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
var label='V'+n+'  •  '+n+' цилиндров';
if(n===6)label='V6  •  6 цилиндров';
else if(n===8)label='V8  •  8 цилиндров';
else if(n===10)label='V10  •  10 цилиндров';
else if(n===12)label='V12  •  12 цилиндров';
else if(n===16)label='V16  •  16 цилиндров';
else if(n===20)label='V20  •  20 цилиндров';
else if(n===22)label='V22  •  22 цилиндра';
c.fillText(label,W/2,12);
};
})();