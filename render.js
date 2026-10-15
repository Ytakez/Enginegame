(function(){
"use strict";
var S=window.S;
if(!S)return;
/* RE берём так же, как в оригинале: тот, что есть на момент загрузки render.js.
   render-engines.js грузится позже и подменяет window.RE упрощённой версией,
   её брать нельзя. Если RE на тот момент ещё нет, ищем позже. */
var RE0=window.RE;
var ecv,ectx,gcv,gctx;
var MAXS=240;
var GW=340,GH=190;   /* логические размеры приборной панели */
var _errShown={};

function init(){
  ecv=document.getElementById('engineCv');
  if(ecv)ectx=ecv.getContext('2d');
  gcv=document.getElementById('gaugeCv');
  if(gcv){gctx=gcv.getContext('2d');fitGauge();}
}
function safe(n){return (typeof n==='number'&&isFinite(n))?n:0;}
function logOnce(key,e){if(_errShown[key])return;_errShown[key]=1;console.log(key+':',e);}

/* Чёткая панель: холст увеличивается в целое число раз (пропорции 340:190
   сохраняются), а рисуем по-прежнему в координатах 340×190. */
function fitGauge(){
  if(!gcv)return;
  var rect=gcv.getBoundingClientRect();
  var dpr=window.devicePixelRatio||1;
  var need=(rect.width||GW)*dpr/GW;
  var k=Math.max(1,Math.min(4,Math.ceil(need)));
  if(gcv.width!==GW*k){gcv.width=GW*k;gcv.height=GH*k;}
  gctx.setTransform(gcv.width/GW,0,0,gcv.height/GH,0,0);
}

/* ====================== ДВИГАТЕЛЬ ====================== */
function drawEngine(){
  var c=ectx,W=ecv.width,H=ecv.height;
  c.clearRect(0,0,W,H);
  var bg=c.createLinearGradient(0,0,0,H);
  if(S.weather==='winter'){bg.addColorStop(0,'#0a1520');bg.addColorStop(1,'#050810');}
  else if(S.weather==='autumn'){bg.addColorStop(0,'#1a1210');bg.addColorStop(1,'#080404');}
  else{bg.addColorStop(0,'#0e151d');bg.addColorStop(1,'#070a0e');}
  c.fillStyle=bg;c.fillRect(0,0,W,H);

  var RE=RE0||window.RE;
  try{
    if(RE&&typeof RE.render==='function') RE.render(c,S);
    else if(RE&&typeof RE.drawR4==='function') RE.drawR4(c,S);
  }catch(e){logOnce('draw error',e);}

  if(S.broken){c.fillStyle='rgba(200,20,20,0.06)';c.fillRect(0,0,W,H);}

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
  }else if(S.weather==='autumn'){
    c.fillStyle='#ff8030';c.beginPath();c.arc(wx,wy,10,0,7);c.fill();
    c.fillStyle='#ffc93c';c.beginPath();c.arc(wx,wy,6,0,7);c.fill();
  }else{
    c.fillStyle='#ffc93c';c.beginPath();c.arc(wx,wy,8,0,7);c.fill();
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

/* ====================== ИКОНКИ ====================== */
function drawOilIcon(c,x,y,color){
  var fill=color==='red'?'#ff5b5b':(color==='yellow'?'#ffc93c':(color==='green'?'#43c98a':'#4a4a4a'));
  c.save();c.translate(x,y);c.fillStyle=fill;
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
  c.save();c.translate(x,y);c.fillStyle=fill;
  c.beginPath();
  c.moveTo(-9,-5);c.lineTo(-5,-5);c.lineTo(-3,-8);c.lineTo(3,-8);
  c.lineTo(5,-5);c.lineTo(9,-5);c.lineTo(9,6);c.lineTo(-9,6);c.closePath();c.fill();
  c.fillStyle=color==='dim'?'#1a1a1a':'#0a0a0a';
  c.beginPath();c.moveTo(0,-5);c.lineTo(-3,0);c.lineTo(0,0);c.lineTo(-1,5);c.lineTo(3,0);c.lineTo(0,0);c.closePath();c.fill();
  c.restore();
}
function drawFuelIcon(c,x,y,color){
  var fill=color==='red'?'#ff5b5b':(color==='green'?'#43c98a':(color==='yellow'?'#ffc93c':'#4a4a4a'));
  c.save();c.translate(x,y);c.fillStyle=fill;
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
  c.save();c.translate(x,y);c.fillStyle=fill;
  c.beginPath();c.arc(0,5,4.5,0,7);c.fill();
  c.beginPath();c.rect(-2,-10,4,14);c.fill();
  c.restore();
}

/* ====================== СПИДОМЕТР ======================
   step — цена деления шкалы, div — на что делить подпись (1000 для оборотов) */
function drawGauge(c,cx,cy,R,value,maxV,redline,label,bigNum,step,div){
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

  var n=Math.round(maxV/step);
  for(var i=0;i<=n;i++){
    var v=i*step;
    var a=a0+(v/maxV)*(a1-a0);
    var hot=v>=redline;
    c.strokeStyle=hot?'#ff6b6b':'#555';
    c.lineWidth=1.5;
    c.beginPath();
    c.moveTo(cx+Math.cos(a)*(R-5),cy+Math.sin(a)*(R-5));
    c.lineTo(cx+Math.cos(a)*(R-11),cy+Math.sin(a)*(R-11));
    c.stroke();
    c.fillStyle=hot?'#ff8b8b':'#707070';
    c.font='bold 7px Segoe UI, sans-serif';
    c.textAlign='center';c.textBaseline='middle';
    c.fillText(String(div?Math.round(v/div):v),cx+Math.cos(a)*(R-19),cy+Math.sin(a)*(R-19));
  }

  var na=a0+(rp/maxV)*(a1-a0);
  c.save();c.translate(cx,cy);c.rotate(na);
  c.fillStyle='#ff5b5b';
  c.beginPath();
  c.moveTo(-7,-3);c.lineTo(R-12,-1.5);c.lineTo(R-8,0);c.lineTo(R-12,1.5);c.lineTo(-7,3);
  c.closePath();c.fill();c.restore();
  c.fillStyle='#141414';c.beginPath();c.arc(cx,cy,8,0,7);c.fill();
  c.strokeStyle='#333';c.lineWidth=1.5;c.stroke();
  var col='#9fe8c0';
  if(value>redline)col='#ff5b5b';
  else if(value>redline*0.85)col='#ffc93c';
  c.fillStyle=col;c.font='bold 14px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='alphabetic';
  c.fillText(bigNum,cx,cy-11);
  c.fillStyle='#666';c.font='bold 6px Segoe UI, sans-serif';
  c.fillText(label,cx,cy-2);
}

function drawRing(c,x,y,r,color,blinkOn){
  var g=c.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);
  if(color==='red'){g.addColorStop(0,'#3a1515');g.addColorStop(1,'#1a0808');}
  else if(color==='yellow'){g.addColorStop(0,'#3a2f10');g.addColorStop(1,'#1a1408');}
  else if(color==='green'){g.addColorStop(0,'#0f2a1c');g.addColorStop(1,'#08160e');}
  else{g.addColorStop(0,'#1a1a1a');g.addColorStop(1,'#0a0a0a');}
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  var ringCol='#333';
  if(color==='red')ringCol=blinkOn===false?'#4a1010':'#ff5b5b';
  else if(color==='yellow')ringCol=blinkOn===false?'#4a3a10':'#ffc93c';
  else if(color==='green')ringCol='#43c98a';
  c.strokeStyle=ringCol;c.lineWidth=color==='dim'?1.5:2;
  c.beginPath();c.arc(x,y,r,0,7);c.stroke();
}

/* ====================== ПРИБОРКА ====================== */
function drawDash(){
  if(!gctx)return;
  var c=gctx,W=GW,H=GH;
  var blinkOn=Math.floor(performance.now()/350)%2===0;
  c.clearRect(0,0,W,H);
  var bg=c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#000');bg.addColorStop(1,'#050505');
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  c.strokeStyle='#1a1a1a';c.lineWidth=1;c.strokeRect(0.5,0.5,W-1,H-1);

  var E=(S.engines&&(S.engines[S.engineType]||S.engines.r4))||{};
  var rpm=safe(S.rpm),spd=Math.abs(safe(S.speed));

  c.fillStyle='#4a4a4a';c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('ДВС • ПРИБОРНАЯ ПАНЕЛЬ',6,6);

  var wI=S.weather==='winter'?'❄':(S.weather==='autumn'?'🍂':'☀');
  var wT=S.weather==='winter'?'ЗИМА':(S.weather==='autumn'?'ОСЕНЬ':'ЛЕТО');
  c.fillStyle='#707070';c.font='bold 7px Segoe UI, sans-serif';
  c.textAlign='right';c.textBaseline='top';
  c.fillText(wI+' '+wT,W-6,6);

  /* Красная зона: берём из двигателя, иначе 90% шкалы.
     Шкала оборотов: на 1000 выше красной зоны, подписи через 1000. */
  var redRpm=safe(E.redline)||8000;
  var gMax=Math.max(8000,Math.min(12000,Math.ceil(redRpm/1000+1)*1000));
  drawGauge(c,78,90,56,rpm,gMax,redRpm,'об/мин ×1000',(rpm/1000).toFixed(1),1000,1000);
  drawGauge(c,262,90,56,spd,MAXS,220,'км/ч',String(Math.round(spd)),30,0);

  var gv=S.gear;
  var gt=gv===0?'N':(gv===-1?'R':(E.auto?'D':String(gv)));
  var gc='#8fd8ff';
  if(gv===-1)gc='#ff5b5b';else if(gv===0)gc='#c9c943';
  c.fillStyle=gc;c.font='bold 20px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText(gt,170,68);
  c.fillStyle='#666';c.font='bold 6px Segoe UI, sans-serif';
  c.fillText('ПЕРЕДАЧА',170,84);
  c.fillStyle=S.running?'#43c98a':'#4a4a4a';
  c.font='bold 6px Segoe UI, sans-serif';
  c.fillText('СТАРТ',170,98);
  c.beginPath();c.arc(170,110,3.5,0,7);c.fill();

  var pc='dim';
  if(S.ignitionState==='priming')pc='red';
  else if(S.ignitionState==='ready'||S.ignitionState==='running')pc='green';
  var oc=S.broken?'red':'dim',ec=S.broken?'yellow':'dim';
  var et=safe(S.engineTemp),at=safe(S.ambientTemp);
  var tc='dim',tb=true;
  if(et>105){tc='red';tb=blinkOn;}
  else if(et>95){tc='yellow';tb=blinkOn;}
  else if(et>75){tc='green';}
  else if(et<at+5&&S.weather==='winter'){tc='yellow';tb=blinkOn;}

  var iy=152,ir=12;
  drawRing(c,52,iy,ir,oc,true);drawOilIcon(c,52,iy,oc);
  drawRing(c,130,iy,ir,ec,true);drawCheckIcon(c,130,iy,ec);
  drawRing(c,208,iy,ir,pc,true);drawFuelIcon(c,208,iy,pc);
  drawRing(c,286,iy,ir,tc,tb);drawTempIcon(c,286,iy,tc);

  c.fillStyle='#4a4a4a';c.font='bold 6px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('МАСЛО',52,iy+16);c.fillText('CHECK',130,iy+16);
  c.fillText('НАСОС',208,iy+16);c.fillText('ТЕМП',286,iy+16);

  var ttc='#4a4a4a';
  if(et>105)ttc=blinkOn?'#ff5b5b':'#4a1010';
  else if(et>95)ttc=blinkOn?'#ffc93c':'#4a3a10';
  else if(et>75)ttc='#43c98a';
  c.fillStyle=ttc;c.font='bold 8px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('ДВИГ: '+Math.round(et)+'°C   ВОЗДУХ: '+Math.round(at)+'°C',170,H-12);

  if(S.weather==='winter'&&et<5&&S.running&&blinkOn){
    c.fillStyle='#8fd8ff';c.font='bold 9px Segoe UI, sans-serif';
    c.textAlign='center';c.textBaseline='middle';
    c.fillText('❄ ДВИГАТЕЛЬ ХОЛОДНЫЙ — ГРЕЙ!',170,128);
  }else if(et>=105&&S.running&&!S.broken&&blinkOn){
    c.fillStyle='#ff3030';c.font='bold 9px Segoe UI, sans-serif';
    c.textAlign='center';c.textBaseline='middle';
    c.fillText('⚠ ПЕРЕГРЕВ — ОТПУСТИ ГАЗ!',170,128);
  }
}

/* ====================== ЦИКЛ ====================== */
function paint(){
  if(!ecv||!gcv)init();
  if(ecv){try{drawEngine();}catch(e){logOnce('engine',e);}}
  try{drawDash();}catch(e){logOnce('dash',e);}
}
window.addEventListener('resize',function(){fitGauge();});
window.DVS_RENDER={draw:paint,init:init};
init();
})();
