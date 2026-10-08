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

var savedEng='r4';try{savedEng=localStorage.getItem(STORAGE_KEY)||'r4';}catch(e){}
if(!ENGINES[savedEng])savedEng='r4';
var savedWeather='summer';try{savedWeather=localStorage.getItem(WKEY)||'summer';}catch(e){}
if(!AMB[savedWeather])savedWeather='summer';

var S=window.S={
  rpm:0,speed:0,gear:0,crankAngle:0,
  running:false,stalled:false,broken:false,
  throttle:0,brakePedal:0,clutchPedal:0,
  pressed:{gas:false,brake:false,clutch:false},
  engines:ENGINES,engineType:savedEng,ignitionState:'off',
  weather:savedWeather,ambientTemp:AMB[savedWeather]||25,
  engineTemp:AMB[savedWeather]||25,
  startAttempts:0
};
if(S.engines[savedEng].auto)S.gear=1;

var gearRatios=[0,3.40,2.00,1.35,1.00,0.78,0.62];
var reverseRatio=-3.17;var finalDrive=3.90,wheelRadius=0.31;
var clutchK=40,clutchMax=350;
function curE(){return ENGINES[S.engineType]||ENGINES.r4;}
function safeNum(n,fb){return (typeof n==='number'&&isFinite(n))?n:fb;}
function torqueCurve(r,E){var lo=E.idle*0.8;var hi=E.redline-(E.redline-E.idle)*0.15;if(hi<=lo)hi=lo+1;var x=Math.max(lo,Math.min(hi,r));if(E.diesel)return 0.9+0.1*Math.sin(Math.PI*(x-lo)/(hi-lo));return 0.55+0.45*Math.sin(Math.PI*(x-lo)/(hi-lo));}

S.setWeather=function(w){
  if(!AMB[w])return;
  S.weather=w;
  S.ambientTemp=AMB[w];
  try{localStorage.setItem(WKEY,w);}catch(e){}
  if(!S.running)S.engineTemp=S.ambientTemp;
  S.startAttempts=0;
};

S.breakEngine=function(reason){if(S.broken)return;S.broken=true;S.running=false;S.stalled=true;S.rpm=0;document.body.classList.add('broken');var b=document.getElementById('breakBanner');if(b)b.textContent='ДВИГАТЕЛЬ СЛОМАН: '+(reason||'поломка');var ig=document.getElementById('ignBtn');if(ig)ig.classList.remove('on');try{if(navigator.vibrate)navigator.vibrate([100,60,100,60,200]);}catch(e){}};

S.repair=function(){S.broken=false;S.stalled=false;S.running=false;S.rpm=0;S.speed=0;S.gear=curE().auto?1:0;S.ignitionState='off';S.engineTemp=S.ambientTemp;S.startAttempts=0;document.body.classList.remove('broken');var gb=document.querySelectorAll('.gbtn');for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===S.gear);var ab=document.querySelectorAll('.agbtn');for(var j=0;j<ab.length;j++)ab[j].classList.toggle('on',Number(ab[j].dataset.ag)===S.gear);var gv=document.getElementById('gearVal');if(gv)gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':(curE().auto?'D':String(S.gear))));var ig=document.getElementById('ignBtn');if(ig){ig.textContent='ЗАЖИГАНИЕ';ig.className='ignbtn';}S.pressed.gas=false;S.pressed.brake=false;S.pressed.clutch=false;};

S.setEngine=function(type){
  if(!ENGINES[type])return;
  S.engineType=type;
  try{localStorage.setItem(STORAGE_KEY,type);}catch(e){}
  S.broken=false;S.stalled=false;S.running=false;
  S.rpm=0;S.speed=0;S.crankAngle=0;S.ignitionState='off';
  S.engineTemp=S.ambientTemp;S.startAttempts=0;
  S.gear=ENGINES[type].auto?1:0;
  document.body.classList.remove('broken');
  var gb=document.querySelectorAll('.gbtn');for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===S.gear);
  var ab=document.querySelectorAll('.agbtn');for(var j=0;j<ab.length;j++)ab[j].classList.toggle('on',Number(ab[j].dataset.ag)===S.gear);
  var gv=document.getElementById('gearVal');if(gv)gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':(ENGINES[type].auto?'D':String(S.gear))));
  var ig=document.getElementById('ignBtn');if(ig){ig.textContent='ЗАЖИГАНИЕ';ig.className='ignbtn';}
  var badge=document.getElementById('engBadge');if(badge)badge.textContent=ENGINES[type].name;
  if(window.DVS_RENDER&&window.DVS_RENDER.draw)window.DVS_RENDER.draw();
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
};

S.physics=function(dt){
  var E=curE();var mass=safeNum(E.mass,1250);var Iwheel=mass*wheelRadius*wheelRadius;
  if(S.broken){S.rpm=0;S.speed*=Math.max(0,1-2.5*dt);if(Math.abs(S.speed)<0.1)S.speed=0;return;}
  S.rpm=safeNum(S.rpm,0);S.speed=safeNum(S.speed,0);

  /* ТЕМПЕРАТУРА ДВИГАТЕЛЯ */
  if(S.running&&!S.stalled){
    if(S.engineTemp<85)S.engineTemp+=dt*4;
    else if(S.engineTemp<95)S.engineTemp+=dt*1;
    if(S.rpm>E.redline*0.9&&S.throttle>0.7)S.engineTemp+=dt*2;
  } else {
    if(S.engineTemp>S.ambientTemp){
      var coolRate=(S.engineTemp-S.ambientTemp)*0.15;
      if(coolRate<0.5)coolRate=0.5;
      S.engineTemp-=dt*coolRate;
      if(S.engineTemp<S.ambientTemp)S.engineTemp=S.ambientTemp;
    }
  }

  var ratio=0;
  if(E.cvt){var vv=Math.abs(S.speed);var r=10/(1+vv*0.06);if(S.gear===0)ratio=0;else if(S.gear===-1)ratio=-r;else ratio=r;}
  else{
    if(S.gear===0)ratio=0;
    else if(S.gear===-1)ratio=reverseRatio*finalDrive;
    else{var gi=S.gear;if(gi<0||gi>=gearRatios.length||typeof gearRatios[gi]!=='number')gi=0;ratio=gearRatios[gi]*finalDrive;}
  }
  ratio=safeNum(ratio,0);

  var eng;
  if(E.auto){if(S.gear===0||S.stalled||!S.running){eng=0;}else if(E.cvt){var range=E.idle*0.5;eng=Math.max(0,Math.min(1,(S.rpm-E.idle*1.05)/range));}else{eng=1;}}
  else{eng=(S.gear===0||S.stalled||!S.running)?0:(1-S.clutchPedal);}

  var omegaWheel=S.speed/3.6/wheelRadius;var omegaDirect=omegaWheel*ratio;var omegaEngine=S.rpm*Math.PI/30;
  var Te=0;
  if(S.running&&!S.stalled){
    var thr=safeNum(S.throttle,0);
    if(S.rpm>E.redline)thr=0;
    Te=thr*E.maxTorque*torqueCurve(S.rpm,E);

    /* ХОЛОДНЫЙ ДВИГАТЕЛЬ — меньше мощности + тряска */
    if(S.engineTemp<40){
      var cold=(40-S.engineTemp)/55;
      if(cold>0.9)cold=0.9;
      Te*=(1-cold*0.5);
      Te+=(Math.random()-0.5)*40*cold;
      if(Math.random()<cold*0.02){
        /* случайный пропуск воспламенения */
        S.rpm-=150;
        if(S.rpm<0)S.rpm=0;
      }
    }

    var friction=5+S.rpm*0.003;
    Te-=friction;
    if(thr<0.05){var err=E.idle-S.rpm;if(err>0)Te+=Math.min(err*0.8,40);else Te+=Math.max(err*0.05,-15);Te+=friction*0.3;}
    else{if(S.rpm<E.idle*0.7)Te+=(E.idle*0.7-S.rpm)*0.5;}
  }
  var slip=omegaEngine-omegaDirect;var Tc;
  if(E.cvt){var target=Te*eng;var damp=slip*0.15;Tc=target+damp;var maxT=Math.max(3,Math.abs(Te)+8);if(Tc>maxT)Tc=maxT;if(Tc<-maxT)Tc=-maxT;if(eng<0.01)Tc=0;}
  else{Tc=eng*clutchK*slip;Tc=Math.max(-clutchMax,Math.min(clutchMax,Tc));if(eng<0.001)Tc=0;}
  Tc=safeNum(Tc,0);
  var Iengine=E.cvt?1.4:0.55;
  var dE=(Te-Tc)/Iengine;
  var v=Math.abs(S.speed)/3.6;var dragF=0.42*v*v+(E.cvt?60:150);var dragT=dragF*wheelRadius*(omegaWheel>=0?1:-1);var brakeT=safeNum(S.brakePedal,0)*2600*(omegaWheel>=0?1:-1);
  var wheelTorque=Tc*ratio-brakeT-dragT;var dW=wheelTorque/Iwheel;var nE=omegaEngine+dE*dt;var nW=omegaWheel+dW*dt;
  if(!isFinite(nE))nE=omegaEngine;if(!isFinite(nW))nW=0;
  if(nE<0)nE=0;
  S.rpm=nE*30/Math.PI;S.speed=nW*wheelRadius*3.6;
  if(!isFinite(S.rpm))S.rpm=0;if(!isFinite(S.speed))S.speed=0;

  /* ЗАГЛОХ от тряски если обороты ниже нормы */
  if(S.running&&!S.stalled&&S.engineTemp<20&&S.rpm<E.idle*0.5&&S.throttle<0.1){
    if(Math.random()<0.02){S.stalled=true;S.running=false;S.rpm=0;}
  }

  if(S.rpm>E.breakRpm){S.breakEngine('перекрут '+Math.round(S.rpm)+' об/мин');return;}
  if(Math.abs(S.speed)<0.12&&(S.brakePedal>0.05||(!E.cvt&&S.gear===0))){if(Math.abs(nW)<0.6)S.speed=0;}
  if(!S.stalled&&S.running&&S.rpm<E.stallRpm&&(eng>0.25||S.rpm<E.stallRpm*0.4)){S.stalled=true;S.running=false;S.rpm=0;}
  if(S.stalled)S.rpm=Math.max(0,S.rpm-E.idle*3*dt);
  S.crankAngle+=(S.rpm*Math.PI/30)*dt*0.55;var TAU=Math.PI*4;S.crankAngle=((S.crankAngle%TAU)+TAU)%TAU;
};
})();