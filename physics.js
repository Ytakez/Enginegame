(function(){
"use strict";

var STORAGE_KEY = 'dvs_engine_v3';   // новый ключ, чтобы старый не мешал

var ENGINES = {
  r4: {
    name:'R4', cyls:4,
    maxTorque:250, redline:6800, breakRpm:8000,
    fireDiv:30, lpBase:700, lpRpm:0.15,
    subGain:0.9, sawGain:0.5, sqGain:0.15, noiseBase:0.015
  },
  v8: {
    name:'V8', cyls:8,
    maxTorque:420, redline:7200, breakRpm:8700,
    fireDiv:20, lpBase:450, lpRpm:0.12,
    subGain:1.5, sawGain:0.6, sqGain:0.10, noiseBase:0.028
  },
  v16: {
    name:'V16', cyls:16,
    maxTorque:680, redline:7800, breakRpm:9200,
    fireDiv:10, lpBase:290, lpRpm:0.09,
    subGain:2.2, sawGain:0.68, sqGain:0.05, noiseBase:0.05
  }
};

var savedEng = 'r4';
try { savedEng = localStorage.getItem(STORAGE_KEY) || 'r4'; } catch(e){}
if (!ENGINES[savedEng]) savedEng = 'r4';

var S = window.S = {
  rpm:0, speed:0, gear:0, crankAngle:0,
  running:false, stalled:false, broken:false,
  throttle:0, brakePedal:0, clutchPedal:0,
  pressed:{gas:false,brake:false,clutch:false},
  engines: ENGINES,
  engineType: savedEng
};

var gearRatios=[0,3.40,2.00,1.35,1.00,0.78];
var reverseRatio=-3.17;
var finalDrive=3.90,wheelRadius=0.31,mass=1250;
var Iwheel=mass*wheelRadius*wheelRadius;
var Iengine=0.55,clutchK=40,clutchMax=350;
var idleRpm=900,stallRpm=350;

function curE(){ return ENGINES[S.engineType] || ENGINES.r4; }

function torqueCurve(r, redline){
  var x=Math.max(800,Math.min(redline-300,r));
  return 0.55+0.45*Math.sin(Math.PI*(x-800)/(redline-1100));
}

S.breakEngine=function(reason){
  if(S.broken)return;
  S.broken=true;S.running=false;S.stalled=true;S.rpm=0;
  document.body.classList.add('broken');
  var b=document.getElementById('breakBanner');
  if(b)b.textContent='ДВИГАТЕЛЬ СЛОМАН: '+(reason||'поломка');
  var ig=document.getElementById('ignBtn');
  if(ig)ig.classList.remove('on');
  try{if(navigator.vibrate)navigator.vibrate([100,60,100,60,200]);}catch(e){}
};

S.repair=function(){
  S.broken=false;S.stalled=false;S.running=false;S.rpm=0;S.speed=0;S.gear=0;
  document.body.classList.remove('broken');
  var gb=document.querySelectorAll('.gbtn');
  for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===0);
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent='N';
  var ig=document.getElementById('ignBtn');
  if(ig)ig.classList.remove('on');
  S.pressed.gas=false;S.pressed.brake=false;S.pressed.clutch=false;
};

S.setEngine=function(type){
  if(!ENGINES[type])return;
  S.engineType=type;
  try{ localStorage.setItem(STORAGE_KEY, type); }catch(e){}
  S.broken=false;S.stalled=false;S.running=false;
  S.rpm=0;S.speed=0;S.gear=0;S.crankAngle=0;
  document.body.classList.remove('broken');
  var gb=document.querySelectorAll('.gbtn');
  for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===0);
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent='N';
  var ig=document.getElementById('ignBtn');
  if(ig)ig.classList.remove('on');
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
};

S.physics=function(dt){
  var E = curE();
  if(S.broken){
    S.rpm=0;S.speed*=Math.max(0,1-2.5*dt);
    if(Math.abs(S.speed)<0.1)S.speed=0;
    return;
  }
  var ratio;
  if(S.gear===0)ratio=0;
  else if(S.gear===-1)ratio=reverseRatio*finalDrive;
  else ratio=gearRatios[S.gear]*finalDrive;

  var eng=(S.gear===0||S.stalled||!S.running)?0:(1-S.clutchPedal);
  var omegaWheel=S.speed/3.6/wheelRadius;
  var omegaDirect=omegaWheel*ratio;
  var omegaEngine=S.rpm*Math.PI/30;
  var Te=0;
  if(S.running&&!S.stalled){
    var thr=S.throttle;
    if(S.rpm>E.redline)thr=0;
    Te=thr*E.maxTorque*torqueCurve(S.rpm, E.redline);
    Te-=10+S.rpm*0.006;
    if(S.rpm<idleRpm)Te+=(idleRpm-S.rpm)*0.35;
  }
  var slip=omegaEngine-omegaDirect;
  var Tc=eng*clutchK*slip;
  Tc=Math.max(-clutchMax,Math.min(clutchMax,Tc));
  if(eng<0.001)Tc=0;
  var dE=(Te-Tc)/Iengine;
  var v=Math.abs(S.speed)/3.6;
  var dragF=0.42*v*v+150;
  var dragT=dragF*wheelRadius*(omegaWheel>=0?1:-1);
  var brakeT=S.brakePedal*2600*(omegaWheel>=0?1:-1);
  var wheelTorque=Tc*ratio-brakeT-dragT;
  var dW=wheelTorque/Iwheel;
  var nE=omegaEngine+dE*dt;
  var nW=omegaWheel+dW*dt;
  if(nE<0)nE=0;
  S.rpm=nE*30/Math.PI;
  S.speed=nW*wheelRadius*3.6;

  if(S.rpm>E.breakRpm){S.breakEngine('перекрут '+Math.round(S.rpm)+' об/мин');return;}
  if(Math.abs(S.speed)<0.12&&(S.brakePedal>0.05||S.gear===0)){if(Math.abs(nW)<0.6)S.speed=0;}
  if(!S.stalled&&S.running&&S.rpm<stallRpm&&(eng>0.25||S.rpm<120)){
    S.stalled=true;S.running=false;S.rpm=0;
  }
  if(S.stalled)S.rpm=Math.max(0,S.rpm-2600*dt);
  S.crankAngle+=(S.rpm*Math.PI/30)*dt*0.55;
  var TAU=Math.PI*4;
  S.crankAngle=((S.crankAngle%TAU)+TAU)%TAU;
};
})();