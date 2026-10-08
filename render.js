(function(){
"use strict";
var S=window.S;var RB=window.RB;var RE=window.RE;
if(!S||!RB||!RE)return;
var ecv,ectx,gcv,gctx;
var _temp=20,_lastT=0;
var MAXR=10000,MAXS=240;
function init(){
  ecv=document.getElementById('engineCv');
  if(ecv)ectx=ecv.getContext('2d');
  gcv=document.getElementById('gaugeCv');
  if(gcv)gctx=gcv.getContext('2d');
}
function safe(n){return (typeof n==='number'&&isFinite(n))?n:0;}
function drawEngine(){var c=ectx,W=ecv.width,H=ecv.height;c.clearRect(0,0,W,H);
var bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0e151d');bg.addColorStop(1,'#070a0e');c.fillStyle=bg;c.fillRect(0,0,W,H);
var t=S.engineType;var drawn=false;
try{
if(t==='scooter'&&typeof RE.drawScooter==='function'){RE.drawScooter(c,S);drawn=true;}
else if(t==='tdi'&&typeof RE.drawTDI==='function'){RE.drawTDI(c,S);drawn=true;}
else if(t==='mt82'&&typeof RE.drawMTZ==='function'){RE.drawMTZ(c,S);drawn=true;}
else if(t==='passatb3'&&typeof RE.drawPassatB3==='function'){RE.drawPassatB3(c,S);drawn=true;}
else if(t==='bluebird'&&typeof RE.drawBluebird==='function'){RE.drawBluebird(c,S);drawn=true;}
else if(t==='galant6'&&typeof RE.drawGalant6==='function'){RE.drawGalant6(c,S);drawn=true;}
else if(t==='v8'&&typeof RE.drawV==='function'){RE.drawV(c,S,10);drawn=true;}
else if(t==='v16'&&typeof RE.drawV==='function'){RE.drawV(c,S,20);drawn=true;}
}catch(err){console.log(err);}
if(!drawn){if(typeof RE.drawR4==='function'){try{RE.drawR4(c,S);}catch(e){}}else{c.fillStyle='#5d7189';c.font='bold 14px Segoe UI';c.textAlign='center';c.fillText('Двигатель не загружен',W/2,H/2);}}
if(S.broken){c.fillStyle='rgba(200,20,20,0.06)';c.fillRect(0,0,W,H);}}

function updateTemp(now){
  if(!_lastT){_lastT=now;return;}
  var dt=(now-_lastT)/1000;_lastT=now;
  if(dt<=0||dt>1)dt=0.05;
  var E=S.engines[S.engineType]||S.engines.r4;
  var run=S.running&&!S.stalled&&!S.broken;
  var rpm=safe(S.rpm);
  if(!run){_temp-=dt*10;}
  else if(rpm>E.redline*0.9){_temp+=dt*10;}
  else if(rpm>E.idle*2.5){_temp+=dt*1.2;}
  else{_temp-=dt*4;}
  if(_temp<20)_temp=20;
  if(_temp>110)_temp=110;
}

function drawGauge(c,cx,cy,R,value,maxV,redline,label,unit,bigNum){
  var a0=Math.PI*0.75,a1=Math.PI*2.25;
  c.lineCap='butt';
  c.lineWidth=11;
  c.strokeStyle='#151f2b';
  c.beginPath();c.arc(cx,cy,R,a0,a1);c.stroke();
  var rA=a0+(redline/maxV)*(a1-a0);
  c.strokeStyle='rgba(255,70,70,.4)';
  c.beginPath();c.arc(cx,cy,R,rA,a1);c.stroke();
  var rp=Math.max(0,Math.min(maxV,value));
  var curA=a0+(rp/maxV)*(a1-a0);
  var g=c.createLinearGradient(cx-R,0,cx+R,0);
  g.addColorStop(0,'#28d17c');g.addColorStop(.55,'#ffc93c');g.addColorStop(1,'#ff3b3b');
  c.strokeStyle=g;c.lineWidth=11;
  c.beginPath();c.arc(cx,cy,R,a0,curA);c.stroke();
  for(var i=0;i<=8;i++){
    var a=a0+(i/8)*(a1-a0);
    var x1=cx+Math.cos(a)*(R-8),y1=cy+Math.sin(a)*(R-8);
    var x2=cx+Math.cos(a)*(R-17),y2=cy+Math.sin(a)*(R-17);
    c.strokeStyle=(i*maxV/8>=redline)?'#ff6b6b':'#4d6379';c.lineWidth=2;
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    var tx=cx+Math.cos(a)*(R-28),ty=cy+Math.sin(a)*(R-28);
    c.fillStyle=(i*maxV/8>=redline)?'#ff8b8b':'#6d8299';
    c.font='bold 9px Segoe UI, sans-serif';
    c.textAlign='center';c.textBaseline='middle';
    var lbl=Math.round(i*maxV/8);
    if(maxV>=1000)lbl=(lbl/1000).toFixed(0);
    c.fillText(String(lbl),tx,ty);
  }
  var na=a0+(rp/maxV)*(a1-a0);
  c.save();c.translate(cx,cy);c.rotate(na);
  var ng=c.createLinearGradient(0,0,R,0);
  ng.addColorStop(0,'#ff5b5b');ng.addColorStop(1,'#ffb0b0');
  c.fillStyle=ng;
  c.beginPath();
  c.moveTo(-10,-3.5);c.lineTo(R-18,-2);c.lineTo(R-13,0);c.lineTo(R-18,2);c.lineTo(-10,3.5);
  c.closePath();c.fill();c.restore();
  c.fillStyle='#1b2531';
  c.beginPath();c.arc(cx,cy,11,0,7);c.fill();
  c.strokeStyle='#3a4d61';c.lineWidth=2;c.stroke();
  var col='#9fe8c0';
  if(value>redline)col='#ff5b5b';
  else if(value>redline*0.85)col='#ffc93c';
  c.fillStyle=col;
  c.font='bold 19px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='alphabetic';
  c.fillText(bigNum,cx,cy-16);
  c.fillStyle='#4f6277';
  c.font='bold 8px Segoe UI, sans-serif';
  c.fillText(unit,cx,cy-6);
  c.fillStyle='#6d8299';
  c.font='bold 8px Segoe UI, sans-serif';
  c.fillText(label,cx,cy+R+14);
}

function drawIndicator(c,x,y,color,label){
  var r=15;
  var g=c.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);
  if(color==='red'){g.addColorStop(0,'#ff7a7a');g.addColorStop(1,'#8a0a0a');}
  else if(color==='yellow'){g.addColorStop(0,'#ffe28a');g.addColorStop(1,'#8a6a0a');}
  else if(color==='green'){g.addColorStop(0,'#7bffb0');g.addColorStop(1,'#0a6a3a');}
  else{g.addColorStop(0,'#2a3340');g.addColorStop(1,'#131b24');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle=(color==='dim')?'#2a3a4a':'#1a232e';
  c.lineWidth=1.5;c.stroke();
  if(color!=='dim'){
    c.strokeStyle=color==='red'?'#ff9090':(color==='yellow'?'#ffe28a':'#7bffb0');
    c.lineWidth=1;c.stroke();
  }
  c.fillStyle=color==='dim'?'#4a5c70':'#fff';
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText(label,x,y+1);
}

function drawDash(now){
  if(!gctx)return;
  updateTemp(now||performance.now());
  var c=gctx,W=gcv.width,H=gcv.height;
  c.clearRect(0,0,W,H);
  var bg=c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0d1319');bg.addColorStop(1,'#0a0e13');
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  c.strokeStyle='#1d2836';c.lineWidth=1;c.strokeRect(0.5,0.5,W-1,H-1);

  var E=S.engines[S.engineType]||S.engines.r4;
  var rpm=safe(S.rpm);
  var spd=Math.abs(safe(S.speed));

  drawGauge(c,95,100,70,rpm,MAXR,E.redline,'ОБ/МИН','об/мин',String(Math.round(rpm)));
  drawGauge(c,285,100,70,spd,MAXS,220,'КМ/Ч','км/ч',String(Math.round(spd)));

  var gv=S.gear;
  var gearTxt=gv===0?'N':(gv===-1?'R':(E.auto?'D':String(gv)));
  var gearCol='#8fd8ff';
  if(gv===-1)gearCol='#ff5b5b';
  else if(gv===0)gearCol='#c9c943';
  c.fillStyle=gearCol;
  c.font='bold 26px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText(gearTxt,190,80);
  c.fillStyle='#4f6277';
  c.font='bold 7px Segoe UI, sans-serif';
  c.fillText('ПЕРЕДАЧА',190,100);
  c.fillStyle='#43c98a';
  c.font='bold 7px Segoe UI, sans-serif';
  c.fillText('СТАРТ',190,120);
  c.fillStyle=S.running?'#43c98a':'#3d4a58';
  c.beginPath();c.arc(190,132,4,0,7);c.fill();

  var pumpColor='dim';
  if(S.ignitionState==='priming')pumpColor='red';
  else if(S.ignitionState==='ready'||S.ignitionState==='running')pumpColor='green';

  var oilColor=S.broken?'red':'dim';
  var engColor=S.broken?'yellow':'dim';
  var tempColor=_temp>85?'red':(_temp>70?'yellow':'dim');

  drawIndicator(c,120,180,oilColor,'🛢');
  drawIndicator(c,165,180,engColor,'⚙');
  drawIndicator(c,215,180,pumpColor,'⛽');
  drawIndicator(c,260,180,tempColor,'🌡');

  c.fillStyle='#3d4a58';
  c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('МАСЛО',120,198);
  c.fillText('CHECK',165,198);
  c.fillText('НАСОС',215,198);
  c.fillText('ТЕМП',260,198);

  c.fillStyle='#3d4a58';
  c.font='bold 7px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('ДВС • ПРИБОРНАЯ ПАНЕЛЬ',8,8);
}

function paint(now){
  if(!ecv)init();
  if(!ecv)return;
  try{drawEngine();drawDash(now);}catch(e){console.log(e);}
}
window.DVS_RENDER={draw:paint,init:init};
init();
})();