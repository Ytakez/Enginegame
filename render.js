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

function updateTemp(){
  var now=performance.now();
  if(!_lastT){_lastT=now;return;}
  var dt=(now-_lastT)/1000;_lastT=now;
  if(dt<=0||dt>1)dt=0.05;
  var E=S.engines[S.engineType]||S.engines.r4;
  var run=S.running&&!S.stalled&&!S.broken;
  var rpm=safe(S.rpm);
  if(!run){_temp-=dt*12;}
  else if(rpm>E.redline*0.9){_temp+=dt*11;}
  else if(rpm>E.idle*2.5){_temp+=dt*1.3;}
  else{_temp-=dt*3;}
  if(_temp<20)_temp=20;
  if(_temp>110)_temp=110;
}

function drawGauge(c,cx,cy,R,value,maxV,redline,label,bigNum){
  var a0=Math.PI*0.75,a1=Math.PI*2.25;
  c.lineCap='butt';
  c.lineWidth=9;
  c.strokeStyle='#151f2b';
  c.beginPath();c.arc(cx,cy,R,a0,a1);c.stroke();
  var rA=a0+(redline/maxV)*(a1-a0);
  if(rA<a1){c.strokeStyle='rgba(255,70,70,.4)';c.beginPath();c.arc(cx,cy,R,rA,a1);c.stroke();}
  var rp=Math.max(0,Math.min(maxV,value));
  var curA=a0+(rp/maxV)*(a1-a0);
  var g=c.createLinearGradient(cx-R,0,cx+R,0);
  g.addColorStop(0,'#28d17c');g.addColorStop(.55,'#ffc93c');g.addColorStop(1,'#ff3b3b');
  c.strokeStyle=g;c.lineWidth=9;
  c.beginPath();c.arc(cx,cy,R,a0,curA);c.stroke();
  for(var i=0;i<=8;i++){
    var a=a0+(i/8)*(a1-a0);
    var x1=cx+Math.cos(a)*(R-5),y1=cy+Math.sin(a)*(R-5);
    var x2=cx+Math.cos(a)*(R-11),y2=cy+Math.sin(a)*(R-11);
    c.strokeStyle=(i*maxV/8>=redline)?'#ff6b6b':'#4d6379';c.lineWidth=1.5;
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    var tx=cx+Math.cos(a)*(R-19),ty=cy+Math.sin(a)*(R-19);
    c.fillStyle=(i*maxV/8>=redline)?'#ff8b8b':'#6d8299';
    c.font='bold 7px Segoe UI, sans-serif';
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
  c.moveTo(-7,-3);c.lineTo(R-12,-1.5);c.lineTo(R-8,0);c.lineTo(R-12,1.5);c.lineTo(-7,3);
  c.closePath();c.fill();c.restore();
  c.fillStyle='#1b2531';
  c.beginPath();c.arc(cx,cy,8,0,7);c.fill();
  c.strokeStyle='#3a4d61';c.lineWidth=1.5;c.stroke();
  var col='#9fe8c0';
  if(value>redline)col='#ff5b5b';
  else if(value>redline*0.85)col='#ffc93c';
  c.fillStyle=col;
  c.font='bold 14px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='alphabetic';
  c.fillText(bigNum,cx,cy-11);
  c.fillStyle='#4f6277';
  c.font='bold 6px Segoe UI, sans-serif';
  c.fillText(label,cx,cy-2);
}

function drawIndicator(c,x,y,color,label){
  var r=11;
  var g=c.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);
  if(color==='red'){g.addColorStop(0,'#ff7a7a');g.addColorStop(1,'#8a0a0a');}
  else if(color==='yellow'){g.addColorStop(0,'#ffe28a');g.addColorStop(1,'#8a6a0a');}
  else if(color==='green'){g.addColorStop(0,'#7bffb0');g.addColorStop(1,'#0a6a3a');}
  else{g.addColorStop(0,'#232c38');g.addColorStop(1,'#0d1319');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  c.strokeStyle=(color==='dim')?'#2a3a4a':'#1a232e';
  c.lineWidth=1.5;c.stroke();
  if(color!=='dim'){
    c.strokeStyle=color==='red'?'#ff9090':(color==='yellow'?'#ffe28a':'#7bffb0');
    c.lineWidth=1;c.stroke();
  }
  c.fillStyle=color==='dim'?'#4a5c70':'#fff';
  c.font='bold 11px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText(label,x,y+1);
}

function drawDash(){
  if(!gctx)return;
  updateTemp();
  var c=gctx,W=gcv.width,H=gcv.height;
  c.clearRect(0,0,W,H);
  var bg=c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0d1319');bg.addColorStop(1,'#0a0e13');
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  c.strokeStyle='#1d2836';c.lineWidth=1;c.strokeRect(0.5,0.5,W-1,H-1);

  var E=S.engines[S.engineType]||S.engines.r4;
  var rpm=safe(S.rpm);
  var spd=Math.abs(safe(S.speed));

  c.fillStyle='#3d4a58';
  c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('ДВС • ПРИБОРНАЯ ПАНЕЛЬ',6,6);

  drawGauge(c,78,90,56,rpm,MAXR,E.redline,'об/мин ×1000',(rpm/1000).toFixed(1));
  drawGauge(c,262,90,56,spd,MAXS,220,'км/ч',String(Math.round(spd)));

  var gv=S.gear;
  var gearTxt=gv===0?'N':(gv===-1?'R':(E.auto?'D':String(gv)));
  var gearCol='#8fd8ff';
  if(gv===-1)gearCol='#ff5b5b';
  else if(gv===0)gearCol='#c9c943';
  c.fillStyle=gearCol;
  c.font='bold 20px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText(gearTxt,170,68);
  c.fillStyle='#4f6277';
  c.font='bold 6px Segoe UI, sans-serif';
  c.fillText('ПЕРЕДАЧА',170,84);
  c.fillStyle='#43c98a';
  c.font='bold 6px Segoe UI, sans-serif';
  c.fillText('СТАРТ',170,98);
  c.fillStyle=S.running?'#43c98a':'#3d4a58';
  c.beginPath();c.arc(170,110,3.5,0,7);c.fill();

  var pumpColor='dim';
  if(S.ignitionState==='priming')pumpColor='red';
  else if(S.ignitionState==='ready'||S.ignitionState==='running')pumpColor='green';
  var oilColor=S.broken?'red':'dim';
  var engColor=S.broken?'yellow':'dim';
  var tempColor=_temp>85?'red':(_temp>70?'yellow':'dim');

  var iy=152;
  drawIndicator(c,55,iy,oilColor,'🛢');
  drawIndicator(c,132,iy,engColor,'⚙');
  drawIndicator(c,208,iy,pumpColor,'⛽');
  drawIndicator(c,285,iy,tempColor,'🌡');

  c.fillStyle='#3d4a58';
  c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('МАСЛО',55,iy+14);
  c.fillText('CHECK',132,iy+14);
  c.fillText('НАСОС',208,iy+14);
  c.fillText('ТЕМП',285,iy+14);

  c.fillStyle='#3d4a58';
  c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('t°C ' + Math.round(_temp),170,H-10);
}

function paint(){
  if(!ecv)init();
  if(!ecv)return;
  try{drawEngine();drawDash();}catch(e){console.log(e);}
}
window.DVS_RENDER={draw:paint,init:init};
init();
})();