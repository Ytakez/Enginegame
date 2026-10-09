(function(){
"use strict";
var S=window.S;var RB=window.RB;var RE=window.RE;
if(!S||!RB||!RE)return;
var ecv,ectx,gcv,gctx;
var MAXR=10500,MAXS=240;
function init(){
  ecv=document.getElementById('engineCv');
  if(ecv)ectx=ecv.getContext('2d');
  gcv=document.getElementById('gaugeCv');
  if(gcv)gctx=gcv.getContext('2d');
}
function safe(n){return (typeof n==='number'&&isFinite(n))?n:0;}

function drawEngine(){
  var c=ectx,W=ecv.width,H=ecv.height;
  c.clearRect(0,0,W,H);
  var bg=c.createLinearGradient(0,0,0,H);
  if(S.weather==='winter'){bg.addColorStop(0,'#0a1520');bg.addColorStop(1,'#050810');}
  else if(S.weather==='autumn'){bg.addColorStop(0,'#1a1210');bg.addColorStop(1,'#080404');}
  else{bg.addColorStop(0,'#0e151d');bg.addColorStop(1,'#070a0e');}
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  var t=S.engineType;var drawn=false;
  try{
    if(t==='scooter'&&typeof RE.drawScooter==='function'){RE.drawScooter(c,S);drawn=true;}
    else if(t==='tdi'&&typeof RE.drawTDI==='function'){RE.drawTDI(c,S);drawn=true;}
    else if(t==='mt82'&&typeof RE.drawMTZ==='function'){RE.drawMTZ(c,S);drawn=true;}
    else if(t==='passatb3'&&typeof RE.drawPassatB3==='function'){RE.drawPassatB3(c,S);drawn=true;}
    else if(t==='bluebird'&&typeof RE.drawBluebird==='function'){RE.drawBluebird(c,S);drawn=true;}
    else if(t==='galant6'&&typeof RE.drawGalant6==='function'){RE.drawGalant6(c,S);drawn=true;}
    else if(t==='wankel'&&typeof RE.drawWankel==='function'){RE.drawWankel(c,S);drawn=true;}
    else if(t==='v8'&&typeof RE.drawV==='function'){RE.drawV(c,S,12);drawn=true;}
    else if(t==='v16'&&typeof RE.drawV==='function'){RE.drawV(c,S,22);drawn=true;}
  }catch(err){console.log('draw error:',err);}
  if(!drawn){
    if(typeof RE.drawR4==='function'){try{RE.drawR4(c,S);}catch(e){}}
    else{c.fillStyle='#5d7189';c.font='bold 14px Segoe UI';c.textAlign='center';c.fillText('Двигатель не загружен',W/2,H/2);}
  }
  if(S.broken){c.fillStyle='rgba(200,20,20,0.06)';c.fillRect(0,0,W,H);}

  /* Значок погоды */
  var wx=W-40,wy=H-30;
  c.save();
  if(S.weather==='winter'){
    c.strokeStyle='#8fd8ff';c.lineWidth=2;
    for(var i=0;i<3;i++){
      var a=i*Math.PI/3;
      c.beginPath();
      c.moveTo(wx-Math.cos(a)*10,wy-Math.sin(a)*10);
      c.lineTo(wx+Math.cos(a)*10,wy+Math.sin(a)*10);
      c.stroke();
    }
  } else if(S.weather==='autumn'){
    c.fillStyle='#ff8030';
    c.beginPath();c.arc(wx,wy,10,0,7);c.fill();
    c.fillStyle='#ffc93c';
    c.beginPath();c.arc(wx,wy,6,0,7);c.fill();
  } else {
    c.fillStyle='#ffc93c';
    c.beginPath();c.arc(wx,wy,8,0,7);c.fill();
    c.strokeStyle='#ffc93c';c.lineWidth=2;
    for(var j=0;j<8;j++){
      var a2=j*Math.PI/4;
      c.beginPath();
      c.moveTo(wx+Math.cos(a2)*11,wy+Math.sin(a2)*11);
      c.lineTo(wx+Math.cos(a2)*15,wy+Math.sin(a2)*15);
      c.stroke();
    }
  }
  c.restore();
}

function drawOilIcon(c,x,y,color){
  var fill=color==='red'?'#ff5b5b':(color==='yellow'?'#ffc93c':(color==='green'?'#43c98a':'#4a4a4a'));
  c.save();c.translate(x,y);
  c.fillStyle=fill;
  c.beginPath();
  c.moveTo(-7,-1);c.lineTo(-7,-7);c.lineTo(-3,-9);c.lineTo(-3,-10);
  c.lineTo(3,-10);c.lineTo(3,-7);c.lineTo(6,-7);c.lineTo(8,-4);
  c.lineTo(8,6);c.lineTo(-7,6);c.closePath();c.fill();
  c.beginPath();c.moveTo(3,-10);c.lineTo(7,-10);c.lineTo(7,-12);c.lineTo(3,-12);c.closePath();c.fill();
  c.fillStyle=color==='dim'?'#2a2a2a':'#0a0a0a';
  c.beginPath();c.moveTo(0,-2);c.quadraticCurveTo(-3,2,0,4);c.quadraticCurveTo(3,2,0,-2);c.fill();
  c.restore();
}
function drawCheckIcon(c,x,y,color){
  var fill=color==='yellow'?'#ffc93c':(color==='red'?'#ff5b5b':(color==='green'?'#43c98a':'#4a4a4a'));
  c.save();c.translate(x,y);
  c.fillStyle=fill;
  c.beginPath();
  c.moveTo(-9,-5);c.lineTo(-5,-5);c.lineTo(-3,-8);c.lineTo(3,-8);
  c.lineTo(5,-5);c.lineTo(9,-5);c.lineTo(9,6);c.lineTo(-9,6);c.closePath();c.fill();
  c.fillStyle=color==='dim'?'#1a1a1a':'#0a0a0a';
  c.beginPath();c.moveTo(0,-5);c.lineTo(-3,0);c.lineTo(0,0);c.lineTo(-1,5);c.lineTo(3,0);c.lineTo(0,0);c.closePath();c.fill();
  c.restore();
}
function drawFuelIcon(c,x,y,color){
  var fill=color==='red'?'#ff5b5b':(color==='green'?'#43c98a':(color==='yellow'?'#ffc93c':'#4a4a4a'));
  c.save();c.translate(x,y);
  c.fillStyle=fill;
  c.beginPath();c.moveTo(-8,-10);c.lineTo(3,-10);c.lineTo(3,8);c.lineTo(-8,8);c.closePath();c.fill();
  c.fillStyle=color==='dim'?'#1a1a1a':'#0a0a0a';
  c.beginPath();c.rect(-6,-7,6,4);c.fill();
  c.strokeStyle=fill;c.lineWidth=2;
  c.beginPath();c.moveTo(3,-6);c.quadraticCurveTo(9,-6,9,2);c.stroke();
  c.fillStyle=fill;
  c.beginPath();c.moveTo(6,3);c.lineTo(10,3);c.lineTo(10,7);c.lineTo(6,7);c.closePath();c.fill();
  c.restore();
}
function drawTempIcon(c,x,y,color){
  var fill=color==='red'?'#ff5b5b':(color==='yellow'?'#ffc93c':(color==='green'?'#43c98a':'#4a4a4a'));
  c.save();c.translate(x,y);
  c.fillStyle=fill;
  c.beginPath();c.arc(0,5,4.5,0,7);c.fill();
  c.beginPath();c.rect(-2,-10,4,14);c.fill();
  if(color!=='dim'){
    c.fillStyle='#0a0a0a';
    c.beginPath();c.rect(-0.7,-8,3,1.2);c.fill();
    c.beginPath();c.rect(-0.7,-5,3,1.2);c.fill();
    c.beginPath();c.rect(-0.7,-2,3,1.2);c.fill();
    c.beginPath();c.rect(-0.7,1,3,1.2);c.fill();
    c.fillStyle=fill;
    c.beginPath();c.rect(-0.7,3,2.2,3);c.fill();
  }
  c.restore();
}

function drawGauge(c,cx,cy,R,value,maxV,redline,label,bigNum){
  var a0=Math.PI*0.75,a1=Math.PI*2.25;
  c.lineCap='butt';c.lineWidth=9;
  c.strokeStyle='#1a1a1a';
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
    c.strokeStyle=(i*maxV/8>=redline)?'#ff6b6b':'#555555';c.lineWidth=1.5;
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    var tx=cx+Math.cos(a)*(R-19),ty=cy+Math.sin(a)*(R-19);
    c.fillStyle=(i*maxV/8>=redline)?'#ff8b8b':'#707070';
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
  c.fillStyle='#141414';
  c.beginPath();c.arc(cx,cy,8,0,7);c.fill();
  c.strokeStyle='#333333';c.lineWidth=1.5;c.stroke();
  var col='#9fe8c0';
  if(value>redline)col='#ff5b5b';
  else if(value>redline*0.85)col='#ffc93c';
  c.fillStyle=col;
  c.font='bold 14px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='alphabetic';
  c.fillText(bigNum,cx,cy-11);
  c.fillStyle='#666666';
  c.font='bold 6px Segoe UI, sans-serif';
  c.fillText(label,cx,cy-2);
}

function drawIndicatorRing(c,x,y,r,color,blinkOn){
  var g=c.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);
  if(color==='red'){g.addColorStop(0,'#3a1515');g.addColorStop(1,'#1a0808');}
  else if(color==='yellow'){g.addColorStop(0,'#3a2f10');g.addColorStop(1,'#1a1408');}
  else if(color==='green'){g.addColorStop(0,'#0f2a1c');g.addColorStop(1,'#08160e');}
  else{g.addColorStop(0,'#1a1a1a');g.addColorStop(1,'#0a0a0a');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  var ringCol='#333333';
  if(color==='red')ringCol=blinkOn===false?'#4a1010':'#ff5b5b';
  else if(color==='yellow')ringCol=blinkOn===false?'#4a3a10':'#ffc93c';
  else if(color==='green')ringCol='#43c98a';
  c.strokeStyle=ringCol;
  c.lineWidth=color==='dim'?1.5:2;
  if(color!=='dim'&&blinkOn===false)c.lineWidth=1;
  c.beginPath();c.arc(x,y,r,0,7);c.stroke();
  if(color!=='dim'&&blinkOn!==false){
    c.strokeStyle=ringCol;c.lineWidth=1;c.globalAlpha=0.4;
    c.beginPath();c.arc(x,y,r+2,0,7);c.stroke();
    c.globalAlpha=1;
  }
}

function drawDash(){
  if(!gctx)return;
  var c=gctx,W=gcv.width,H=gcv.height;
  var now=performance.now();
  var blinkOn=Math.floor(now/350)%2===0;
  c.clearRect(0,0,W,H);

  /* === ЧЁРНЫЙ ФОН ПРИБОРКИ === */
  var bg=c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#000000');
  bg.addColorStop(1,'#050505');
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  c.strokeStyle='#1a1a1a';c.lineWidth=1;c.strokeRect(0.5,0.5,W-1,H-1);

  var E=S.engines[S.engineType]||S.engines.r4;
  var rpm=safe(S.rpm);
  var spd=Math.abs(safe(S.speed));

  c.fillStyle='#4a4a4a';
  c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('ДВС • ПРИБОРНАЯ ПАНЕЛЬ',6,6);

  var wIcon=S.weather==='winter'?'❄':(S.weather==='autumn'?'🍂':'☀');
  var wTxt=S.weather==='winter'?'ЗИМА':(S.weather==='autumn'?'ОСЕНЬ':'ЛЕТО');
  c.fillStyle='#707070';
  c.font='bold 7px Segoe UI, sans-serif';
  c.textAlign='right';c.textBaseline='top';
  c.fillText(wIcon+' '+wTxt,W-6,6);

  var gaugeMax=10500;
  if(S.engineType==='wankel')gaugeMax=11000;
  drawGauge(c,78,90,56,rpm,gaugeMax,E.redline,'об/мин ×1000',(rpm/1000).toFixed(1));
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
  c.fillStyle='#666666';
  c.font='bold 6px Segoe UI, sans-serif';
  c.fillText('ПЕРЕДАЧА',170,84);
  c.fillStyle=S.running?'#43c98a':'#4a4a4a';
  c.font='bold 6px Segoe UI, sans-serif';
  c.fillText('СТАРТ',170,98);
  c.beginPath();c.arc(170,110,3.5,0,7);c.fill();

  var pumpColor='dim';
  if(S.ignitionState==='priming')pumpColor='red';
  else if(S.ignitionState==='ready'||S.ignitionState==='running')pumpColor='green';

  var oilColor=S.broken?'red':'dim';
  var engColor=S.broken?'yellow':'dim';

  var engTemp=safe(S.engineTemp);
  var ambTemp=safe(S.ambientTemp);

  var tempColor='dim';
  var tempBlink=true;
  if(engTemp>105){tempColor='red';tempBlink=blinkOn;}
  else if(engTemp>95){tempColor='yellow';tempBlink=blinkOn;}
  else if(engTemp>75){tempColor='green';tempBlink=true;}
  else if(engTemp<ambTemp+5&&S.weather==='winter'){tempColor='yellow';tempBlink=blinkOn;}

  var iy=152,ir=12;
  drawIndicatorRing(c,52,iy,ir,oilColor,true);
  drawOilIcon(c,52,iy,oilColor);
  drawIndicatorRing(c,130,iy,ir,engColor,true);
  drawCheckIcon(c,130,iy,engColor);
  drawIndicatorRing(c,208,iy,ir,pumpColor,true);
  drawFuelIcon(c,208,iy,pumpColor);
  drawIndicatorRing(c,286,iy,ir,tempColor,tempBlink);
  drawTempIcon(c,286,iy,tempColor);

  c.fillStyle='#4a4a4a';
  c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('МАСЛО',52,iy+16);
  c.fillText('CHECK',130,iy+16);
  c.fillText('НАСОС',208,iy+16);
  c.fillText('ТЕМП',286,iy+16);

  var tempTxtColor='#4a4a4a';
  if(engTemp>105)tempTxtColor=blinkOn?'#ff5b5b':'#4a1010';
  else if(engTemp>95)tempTxtColor=blinkOn?'#ffc93c':'#4a3a10';
  else if(engTemp>75)tempTxtColor='#43c98a';
  else if(engTemp<ambTemp+5&&S.weather==='winter')tempTxtColor=blinkOn?'#8fd8ff':'#4a6a80';

  c.fillStyle=tempTxtColor;
  c.font='bold 8px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('ДВИГ: '+Math.round(engTemp)+'°C   ВОЗДУХ: '+Math.round(ambTemp)+'°C',170,H-12);

  if(S.weather==='winter'&&engTemp<5&&S.running&&blinkOn){
    c.fillStyle='#8fd8ff';
    c.font='bold 9px Segoe UI, sans-serif';
    c.textAlign='center';c.textBaseline='middle';
    c.fillText('❄ ДВИГАТЕЛЬ ХОЛОДНЫЙ — ГРЕЙ!',170,128);
  } else if(engTemp>=105&&S.running&&!S.broken&&blinkOn){
    c.fillStyle='#ff3030';
    c.font='bold 9px Segoe UI, sans-serif';
    c.textAlign='center';c.textBaseline='middle';
    c.fillText('⚠ ПЕРЕГРЕВ — ОТПУСТИ ГАЗ!',170,128);
  }
}

function paint(){
  if(!ecv)init();
  if(!ecv)return;
  try{drawEngine();drawDash();}catch(e){console.log(e);}
}
window.DVS_RENDER={draw:paint,init:init};
init();
})();