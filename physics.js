(function(){
"use strict";
var STORAGE_KEY='dvs_engine_v3';
var WKEY='dvs_weather';
var ENGINES={
  scooter:{name:'S1',cyls:1,maxTorque:60,idle:700,redline:3200,breakRpm:3800,stallRpm:250,fireDiv:30,lpBase:1400,lpRpm:0.35,subGain:0.5,sawGain:0.9,sqGain:0.4,noiseBase:0.08,cvt:true,auto:true,mass:200},
  tdi:{name:'1.9 TDI',cyls:4,maxTorque:310,idle:850,redline:4800,breakRpm:5500,stallRpm:300,fireDiv:30,lpBase:380,lpRpm:0.10,subGain:1.8,sawGain:0.35,sqGain:0.08,noiseBase:0.10,mass:1350,diesel:true},
  mt82:{name:'Д-240',cyls:4,maxTorque:298,idle:600,redline:2200,breakRpm:2400,stallRpm:250,fireDiv:15,lpBase:220,lpRpm:0.06,subGain:3.5,sawGain:0.5,sqGain:0.04,noiseBase:0.18,mass:3200,diesel:true,tractor:true},
  passatb3:{name:'1.8 B3',cyls:4,maxTorque:160,idle:900,redline:6200,breakRpm:7000,stallRpm:350,fireDiv:30,lpBase:750,lpRpm:0.14,subGain:0.85,sawGain:0.45,sqGain:0.12,noiseBase:0.012,mass:1300},
  bluebird:{name:'2.0 CA20',cyls:4,maxTorque:178,idle:850,redline:7000,breakRpm:7800,stallRpm:350,fireDiv:30,lpBase:780,lpRpm:0.16,subGain:0.8,sawGain:0.55,sqGain:0.14,noiseBase:0.018,mass:1280},
  galant6:{name:'2.0 V6',cyls:6,maxTorque:179,idle:850,redline:7000,breakRpm:7800,stallRpm:350,fireDiv:20,lpBase:520,lpRpm:0.13,subGain:1.3,sawGain:0.58,sqGain:0.10,noiseBase:0.025,mass:1350},
  r4:{name:'R4',cyls:4,maxTorque:250,idle:900,redline:6800,breakRpm:8000,stallRpm:350,fireDiv:30,lpBase:700,lpRpm:0.15,subGain:0.9,sawGain:0.5,sqGain:0.15,noiseBase:0.015,mass:1250},
  v8:{name:'V12',cyls:12,maxTorque:560,idle:900,redline:7600,breakRpm:9000,stallRpm:350,fireDiv:10,lpBase:400,lpRpm:0.11,subGain:1.8,sawGain:0.65,sqGain:0.07,noiseBase:0.038,mass:1500},
  v16:{name:'V22',cyls:22,maxTorque:900,idle:900,redline:8200,breakRpm:9600,stallRpm:350,fireDiv:5.5,lpBase:230,lpRpm:0.07,subGain:2.6,sawGain:0.75,sqGain:0.04,noiseBase:0.065,mass:1800}
};
var AMB={summer:25,autumn:8,winter:-15};

var savedEng='r4';
try{savedEng=localStorage.getItem(STORAGE_KEY)||'r4';}catch(e){}
if(!ENGINES[savedEng])savedEng='r4';

var savedWeather='summer';
try{savedWeather=localStorage.getItem(WKEY)||'summer';}catch(e){}
if(!AMB[savedWeather])savedWeather='summer';

var S=window.S={
  rpm:0,speed:0,gear:0,crankAngle:0,
  running:false,stalled:false,broken:false,
  throttle:0,brakePedal:0,clutchPedal:0,
  pressed:{gas:false,brake:false,clutch:false},
  engines:ENGINES,
  engineType:savedEng,
  ignitionState:'off',
  weather:savedWeather,
  ambientTemp:AMB[savedWeather]||25,
  engineTemp:AMB[savedWeather]||25,
  startAttempts:0,
  primingStart:0,
  primingDuration:1500
};
if(S.engines[savedEng].auto)S.gear=1;

var gearRatios=[0,3.40,2.00,1.35,1.00,0.78,0.62];
var reverseRatio=-3.17;
var finalDrive=3.90;
var wheelRadius=0.31;
var clutchK=40;
var clutchMax=350;

function curE(){return ENGINES[S.engineType]||ENGINES.r4;}
function safeNum(n,fb){return (typeof n==='number'&&isFinite(n))?n:fb;}

function torqueCurve(r,E){
  var lo=E.idle*0.8;
  var hi=E.redline-(E.redline-E.idle)*0.15;
  if(hi<=lo)hi=lo+1;
  var x=Math.max(lo,Math.min(hi,r));
  if(E.diesel)return 0.9+0.1*Math.sin(Math.PI*(x-lo)/(hi-lo));
  return 0.55+0.45*Math.sin(Math.PI*(x-lo)/(hi-lo));
}

S.setWeather=function(w){
  if(!AMB[w])return;
  S.weather=w;
  S.ambientTemp=AMB[w];
  try{localStorage.setItem(WKEY,w);}catch(e){}
  if(!S.running)S.engineTemp=S.ambientTemp;
  S.startAttempts=0;
};

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
  S.broken=false;S.stalled=false;S.running=false;S.rpm=0;S.speed=0;
  S.gear=curE().auto?1:0;
  S.ignitionState='off';
  S.engineTemp=S.ambientTemp;
  S.startAttempts=0;
  document.body.classList.remove('broken');
  var gb=document.querySelectorAll('.gbtn');
  for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===S.gear);
  var ab=document.querySelectorAll('.agbtn');
  for(var j=0;j<ab.length;j++)ab[j].classList.toggle('on',Number(ab[j].dataset.ag)===S.gear);
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':(curE().auto?'D':String(S.gear))));
  var ig=document.getElementById('ignBtn');
  if(ig){ig.textContent='ЗАЖИГАНИЕ';ig.className='ignbtn';}
  S.pressed.gas=false;S.pressed.brake=false;S.pressed.clutch=false;
};

S.setEngine=function(type){
  if(!ENGINES[type])return;
  S.engineType=type;
  try{localStorage.setItem(STORAGE_KEY,type);}catch(e){}
  S.broken=false;S.stalled=false;S.running=false;
  S.rpm=0;S.speed=0;S.crankAngle=0;
  S.ignitionState='off';
  S.engineTemp=S.ambientTemp;
  S.startAttempts=0;
  S.gear=ENGINES[type].auto?1:0;
  document.body.classList.remove('broken');
  var gb=document.querySelectorAll('.gbtn');
  for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===S.gear);
  var ab=document.querySelectorAll('.agbtn');
  for(var j=0;j<ab.length;j++)ab[j].classList.toggle('on',Number(ab[j].dataset.ag)===S.gear);
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':(ENGINES[type].auto?'D':String(S.gear))));
  var ig=document.getElementById('ignBtn');
  if(ig){ig.textContent='ЗАЖИГАНИЕ';ig.className='ignbtn';}
  var badge=document.getElementById('engBadge');
  if(badge)badge.textContent=ENGINES[type].name;
  if(window.DVS_RENDER&&window.DVS_RENDER.draw)window.DVS_RENDER.draw();
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
};

S.physics=function(dt){
  var E=curE();
  var mass=safeNum(E.mass,1250);
  var Iwheel=mass*wheelRadius*wheelRadius;

  if(S.broken){
    S.rpm=0;
    S.speed*=Math.max(0,1-2.5*dt);
    if(Math.abs(S.speed)<0.1)S.speed=0;
    return;
  }

  S.rpm=safeNum(S.rpm,0);
  S.speed=safeNum(S.speed,0);

  /* ТЕМПЕРАТУРА — МЕДЛЕННЫЙ ПРОГРЕВ */
  if(S.running&&!S.stalled){
    if(S.engineTemp<85)S.engineTemp+=dt*0.8;
    else if(S.engineTemp<95)S.engineTemp+=dt*0.3;
    if(S.rpm>E.redline*0.9&&S.throttle>0.7)S.engineTemp+=dt*0.5;
  } else {
    if(S