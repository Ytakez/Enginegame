(function(){
"use strict";
var S=window.S;var RB=window.RB;var RE=window.RE;
if(!S||!RB||!RE)return;
var ecv,ectx,gcv,gctx;var MAXR=10500;
function init(){ecv=document.getElementById('engineCv');if(ecv)ectx=ecv.getContext('2d');gcv=document.getElementById('gaugeCv');if(gcv)gctx=gcv.getContext('2d');}
function call(fn,c){try{if(typeof fn==='function')return fn.apply(null,Array.prototype.slice.call(arguments,1));}catch(e){console.log('draw error:',e);}return false;}
function drawEngine(){var c=ectx,W=ecv.width,H=ecv.height;c.clearRect(0,0,W,H);
var bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0e151d');bg.addColorStop(1,'#070a0e');c.fillStyle=bg;c.fillRect(0,0,W,H);
var t=S.engineType;var drawn=false;
if(t==='scooter'&&typeof RE.drawScooter==='function')drawn=call(RE.drawScooter,c,S);
else if(t==='tdi'&&typeof RE.drawTDI==='function')drawn=call(RE.drawTDI,c,S);
else if(t==='mt82'&&typeof RE.drawMTZ==='function')drawn=call(RE.drawMTZ,c,S);
else if(t==='passatb3'&&typeof RE.drawPassatB3==='function')drawn=call(RE.drawPassatB3,c,S);
else if(t==='bluebird'&&typeof RE.drawBluebird==='function')drawn=call(RE.drawBluebird,c,S);
else if(t==='galant6'&&typeof RE.drawGalant6==='function')drawn=call(RE.drawGalant6,c,S);
else if(t==='v8'&&typeof RE.drawV==='function')drawn=call(RE.drawV,c,S,8);
else if(t==='v16'&&typeof RE.drawV==='function')drawn=call(RE.drawV,c,S,16);
if(!drawn){if(typeof RE.drawR4==='function'){call(RE.drawR4,c,S);}else{c.fillStyle='#5d7189';c.font='bold 14px Segoe UI';c.textAlign='center';c.fillText('Двигатель не загружен',W/2,H/2);}}
if(S.broken){c.fillStyle='rgba(200,20,20,0.06)';c.fillRect(0,0,W,H);}}
function drawGauge(){if(!gctx)return;var c=gctx,W=gcv.width,H=gcv.height;c.clearRect(0,0,W,H);
var cx=W/2,cy=H-20,R=Math.min(W/2-14,H-44);var a0=Math.PI,a1=Math.PI*2;
var E=S.engines[S.engineType]||S.engines.r4;var redline=E.redline;var rpm=S.rpm;
c.lineWidth=13;c.lineCap='butt';c.strokeStyle='#151f2b';c.beginPath();c.arc(cx,cy,R,a0,a1);c.stroke();
var rA=a0+(redline/MAXR)*(a1-a0);c.strokeStyle='rgba(255,70,70,.4)';c.beginPath();c.arc(cx,cy,R,rA,a1);c.stroke();
var rp=Math.min(rpm,MAXR);var curA=a0+(rp/MAXR)*(a1-a0);
var g=c.createLinearGradient(cx-R,0,cx+R,0);g.addColorStop(0,'#28d17c');g.addColorStop(.55,'#ffc93c');g.addColorStop(1,'#ff3b3b');
c.strokeStyle=g;c.lineWidth=13;c.beginPath();c.arc(cx,cy,R,a0,curA);c.stroke();
for(var i=0;i<=10;i++){var a=a0+(i/10)*(a1-a0);var x1=cx+Math.cos(a)*(R-9),y1=cy+Math.sin(a)*(R-9);var x2=cx+Math.cos(a)*(R-19),y2=cy+Math.sin(a)*(R-19);
c.strokeStyle=(i*MAXR/10>=redline)?'#ff6b6b':'#4d6379';c.lineWidth=2;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
var tx=cx+Math.cos(a)*(R-33),ty=cy+Math.sin(a)*(R-33);c.fillStyle=(i*MAXR/10>=redline)?'#ff8b8b':'#6d8299';c.font='bold 10px Segoe UI, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(i),tx,ty);}
var na=a0+(rp/MAXR)*(a1-a0);c.save();c.translate(cx,cy);c.rotate(na);
var ng=c.createLinearGradient(0,0,R,0);ng.addColorStop(0,'#ff5b5b');ng.addColorStop(1,'#ffb0b0');c.fillStyle=ng;
c.beginPath();c.moveTo(-12,-4);c.lineTo(R-22,-2);c.lineTo(R-16,0);c.lineTo(R-22,2);c.lineTo(-12,4);c.closePath();c.fill();c.restore();
c.fillStyle='#1b2531';c.beginPath();c.arc(cx,cy,13,0,7);c.fill();c.strokeStyle='#3a4d61';c.lineWidth=2;c.stroke();
var rc=rpm>redline?'#ff5b5b':(rpm>redline*0.85?'#ffc93c':'#9fe8c0');c.fillStyle=rc;c.font='bold 24px Segoe UI, sans-serif';c.textAlign='center';c.textBaseline='alphabetic';c.fillText(String(Math.round(rpm)),cx,cy-26);
c.fillStyle='#4f6277';c.font='bold 9px Segoe UI, sans-serif';c.fillText('ОБ/МИН',cx,cy-14);}
function paint(){if(!ecv)init();if(!ecv)return;try{drawEngine();drawGauge();}catch(e){console.log('paint error:',e);}}
window.DVS_RENDER={draw:paint,init:init};init();
})();