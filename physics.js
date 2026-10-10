(function(){
"use strict";
var STORAGE_KEY='dvs_engine_v3';
var WKEY='dvs_weather';
var ENGINES={
scooter:{name:'S1',cyls:1,maxTorque:60,idle:700,redline:3200,breakRpm:3800,stallRpm:250,fireDiv:30,lpBase:1400,lpRpm:0.35,subGain:0.5,sawGain:0.9,sqGain:0.4,noiseBase:0.08,cvt:true,auto:true,mass:200,gears:5},
tdi:{name:'1.9 TDI',cyls:4,maxTorque:310,idle:850,redline:4800,breakRpm:5500,stallRpm:300,fireDiv:30,lpBase:380,lpRpm:0.10,subGain:1.8,sawGain:0.35,sqGain:0.08,noiseBase:0.10,mass:1350,diesel:true,gears:5},
dci:{name:'2.0 dCi',cyls:4,maxTorque:360,idle:800,redline:5000,breakRpm:5500,stallRpm:300,fireDiv:28,lpBase:280,lpRpm:0.06,subGain:3.2,sawGain:0.65,sqGain:0.05,noiseBase:0.16,mass:1400,diesel:true,gears:6},
mt82:{name:'Д-240',cyls:4,maxTorque:298,idle:600,redline:2200,breakRpm:2400,stallRpm:250,fireDiv:15,lpBase:220,lpRpm:0.06,subGain:3.5,sawGain:0.5,sqGain:0.04,noiseBase:0.18,mass:3200,diesel:true,tractor:true,gears:5},
passatb3:{name:'1.8 B3',cyls:4,maxTorque:160,idle:900,redline:6200,breakRpm:7000,stallRpm:350,fireDiv:30,lpBase:750,lpRpm:0.14,subGain:0.85,sawGain:0.45,sqGain:0.12,noiseBase:0.012,mass:1300,gears:5},
bluebird:{name:'2.0 CA20',cyls:4,maxTorque:178,idle:850,redline:7000,breakRpm:7800,stallRpm:350,fireDiv:30,lpBase:780,lpRpm:0.16,subGain:0.8,sawGain:0.55,sqGain:0.14,noiseBase:0.018,mass:1280,gears:5},
galant6:{name:'2.0 V6',cyls:6,maxTorque:179,idle:850,redline:7000,breakRpm:7800,stallRpm:350,fireDiv:20,lpBase:520,lpRpm:0.13,subGain:1.3,sawGain:0.58,sqGain:0.10,noiseBase:0.025,mass:1350,gears:5},
wankel:{name:'13B Renesis',cyls:2,maxTorque:211,idle:900,redline:9000,breakRpm:10000,stallRpm:400,fireDiv:20,lpBase:800,lpRpm:0.10,subGain:0.4,sawGain:1.2,sqGain:0.15,noiseBase:0.008,mass:1400,gears:6},
r4:{name:'R4',cyls:4,maxTorque:250,idle:900,redline:6800,breakRpm:8000,stallRpm:350,fireDiv:30,lpBase:700,lpRpm:0.15,subGain:0.9,sawGain:0.5,sqGain:0.15,noiseBase:0.015,mass:1250,gears:6},
v8:{name:'V12',cyls:12,maxTorque:560,idle:900,redline:7600,breakRpm:9000,stallRpm:350,fireDiv:10,lpBase:400,lpRpm:0.11,subGain:1.8,sawGain:0.65,sqGain:0.07,noiseBase:0.038,mass:1500,gears:6},
v16:{name:'V22',cyls:22,maxTorque:900,idle:900,redline:8200,breakRpm:9600,stallRpm:350,fireDiv:5.5,lpBase:230,lpRpm:0.07,subGain:2.6,sawGain:0.75,sqGain:0.04,noiseBase:0.065,mass:1800,gears:6}
};
var AMB={summer:25,autumn:8,winter:-15};
var OVERHEAT_LIMIT=145;

var RATIOS_5=[0, 3.40, 2.00, 1.40, 1.00, 0.80];
var RATIOS_6=[0, 3.40, 2.10, 1.55, 1.20, 0.95, 0.78];
function ratiosFor(E){return (E&&E.gears===6)?RATIOS_6:RATIOS_5;}

var savedEng='r4';
try{savedEng=localStorage.getItem(STORAGE_KEY)||'r4';}catch(e){}
if(!ENGINES[savedEng])savedEng='r4';

var savedWeather='summer';
try{savedWeather=localStorage.getItem(WKEY)||'summer';}catch(e){}
if(!AMB[savedWeather])savedWeather='summer';

var S=window.S={
rpm:0,speed:0,gear:0,crankAngle:0,
running:false,stalled:false,broken:false,seized:false,
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
primingDuration:1500,
_prevGear:0,
_shiftTimer:0,
_lastGearTime:0,
_lastGearValue:0
};
if(S.engines[savedEng].auto)S.gear=1;

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
  S.weather=w;S.ambientTemp=AMB[w];
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
  S.seized=false;
  S.broken=false;S.stalled=false;S.running=false;S.rpm=0;S.speed=0;
  S.gear=curE().auto?1:0;
  S.ignitionState='off';
  S.engineTemp=S.ambientTemp;
  S.startAttempts=0;
  S._shiftTimer=0;
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
  if(window.DVS_GEARSTICK)try{window.DVS_GEARSTICK.moveTo(S.gear,true);}catch(e){}
};

function updateGearUI(){
  var E=curE();
  var maxG=(E.auto?6:(E.gears||6));
  var btns=document.querySelectorAll('.gbtn[data-g]');
  for(var i=0;i<btns.length;i++){
    var g=Number(btns[i].dataset.g);
    if(g>0 && g>maxG) btns[i].style.display='none';
    else btns[i].style.display='';
  }
}

S.setEngine=function(type){
  if(!ENGINES[type])return;
  S.engineType=type;
  try{localStorage.setItem(STORAGE_KEY,type);}catch(e){}
  S.seized=false;
  S.broken=false;S.stalled=false;S.running=false;
  S.rpm=0;S.speed=0;S.crankAngle=0;
  S.ignitionState='off';
  S.engineTemp=S.ambientTemp;
  S.startAttempts=0;
  S.gear=ENGINES[type].auto?1:0;
  S._prevGear=S.gear;
  S._shiftTimer=0;
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
  updateGearUI();
  if(window.DVS_RENDER&&window.DVS_RENDER.draw)window.DVS_RENDER.draw();
  if(window.DVS_3D_REBUILD){
    setTimeout(function(){
      try{ window.DVS_3D_REBUILD(); }catch(err){ console.warn('3D rebuild:',err); }
    }, 80);
  }
  if(window.DVS_GEARSTICK)try{window.DVS_GEARSTICK.moveTo(S.gear,true);}catch(e){}
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
};

S.setGear=function(g){
  var E=curE();
  if(E.auto)return;
  if(S.broken||S.seized)return;
  if(g>0 && g>(E.gears||6))return;
  if(g===S.gear)return;

  var now=Date.now();
  var delta=now - S._lastGearTime;
  S._lastGearTime=now;

  var clutchIn=(S.clutchPedal||0)>0.35;
  var rpm=S.rpm||0;
  var running=S.running&&!S.stalled;

  var isFast=delta<250;
  var willGrind=false;

  if(running && rpm>700){
    if(!clutchIn && isFast && g>0 && rpm>800){willGrind=true;}
    if(!clutchIn && Math.abs(g - S._lastGearValue) >= 2 && rpm>800){willGrind=true;}
    if(!clutchIn && delta<150){willGrind=true;}
  }

  S._lastGearValue=g;

  if(willGrind){
    if(window.DVS_SOUND && window.DVS_SOUND.gearCrunch){
      try{ window.DVS_SOUND.gearCrunch(); }catch(e){}
    }
    try{ if(navigator.vibrate) navigator.vibrate([40,30,40,30,80]); }catch(e){}
    var targetBtn=document.querySelector('.gbtn[data-g="'+g+'"]');
    if(targetBtn){targetBtn.classList.add('grind');setTimeout(function(){targetBtn.classList.remove('grind');}, 450);}
    var activeBtn=document.querySelector('.gbtn.on');
    if(activeBtn){activeBtn.classList.add('grind');setTimeout(function(){activeBtn.classList.remove('grind');}, 450);}
    if(rpm>3000 && running){S.stalled=true;S.running=false;}
    if(window.DVS_GEARSTICK)try{window.DVS_GEARSTICK.moveTo(S.gear,true);}catch(e){}
    return;
  }

  S.gear=g;

  if(clutchIn && window.DVS_SOUND && window.DVS_SOUND.gearClick){
    try{ window.DVS_SOUND.gearClick(); }catch(e){}
  }

  var gearBtns=document.querySelectorAll('.gbtn');
  for(var i=0;i<gearBtns.length;i++){
    gearBtns[i].classList.toggle('on',Number(gearBtns[i].dataset.g)===g);
  }
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent=(g===0?'N':(g===-1?'R':String(g)));

  if(window.DVS_GEARSTICK)try{window.DVS_GEARSTICK.moveTo(g,true);}catch(e){}
  try{if(navigator.vibrate)navigator.vibrate(6);}catch(e){}
};

S.physics=function(dt){
  var E=curE();
  var mass=safeNum(E.mass,1250);
  var Iwheel=mass*wheelRadius*wheelRadius;

  if(S.seized){
    S.rpm=0;S.throttle=0;
    S.speed*=Math.max(0,1-2.5*dt);
    if(Math.abs(S.speed)<0.1)S.speed=0;
    return;
  }
  if(S.broken){
    S.rpm=0;
    S.speed*=Math.max(0,1-2.5*dt);
    if(Math.abs(S.speed)<0.1)S.speed=0;
    return;
  }

  S.rpm=safeNum(S.rpm,0);
  S.speed=safeNum(S.speed,0);

  if(S._prevGear!==S.gear){
    S._shiftTimer=0.35;
    S._prevGear=S.gear;
  }
  if(S._shiftTimer>0){
    S._shiftTimer-=dt;
    if(S._shiftTimer<0)S._shiftTimer=0;
  }
  var shiftSlip=1;
  if(S._shiftTimer>0)shiftSlip=0.15;

  if(S.running&&!S.stalled){
    if(S.engineTemp<85)S.engineTemp+=dt*0.8;
    else if(S.engineTemp<95)S.engineTemp+=dt*0.3;
    if(S.rpm>E.redline*0.9&&S.throttle>0.7)S.engineTemp+=dt*0.5;
  } else {
    if(S.engineTemp>S.ambientTemp){
      var coolRate=(S.engineTemp-S.ambientTemp)*0.15;
      if(coolRate<0.5)coolRate=0.5;
      S.engineTemp-=dt*coolRate;
      if(S.engineTemp<S.ambientTemp)S.engineTemp=S.ambientTemp;
    }
  }

  if(S.engineTemp >= OVERHEAT_LIMIT && S.running){
    S.seized=true;
    S.throttle=0;
    S.breakEngine('ПЕРЕГРЕВ! Клин при '+OVERHEAT_LIMIT+'°C');
    try{if(navigator.vibrate)navigator.vibrate([80,100,80,100,200]);}catch(e){}
    return;
  }

  var ratio=0;
  if(E.cvt){
    var vv=Math.abs(S.speed);
    var r=10/(1+vv*0.06);
    if(S.gear===0)ratio=0;
    else if(S.gear===-1)ratio=-r;
    else ratio=r;
  } else {
    var RATIOS=ratiosFor(E);
    if(S.gear===0)ratio=0;
    else if(S.gear===-1)ratio=reverseRatio*finalDrive;
    else {
      var gi=S.gear;
      if(gi<0||gi>=RATIOS.length||typeof RATIOS[gi]!=='number')gi=0;
      ratio=RATIOS[gi]*finalDrive;
    }
  }
  ratio=safeNum(ratio,0);

  var eng;
  if(E.auto){
    if(S.gear===0||S.stalled||!S.running){eng=0;}
    else if(E.cvt){
      var range=E.idle*0.5;
      eng=Math.max(0,Math.min(1,(S.rpm-E.idle*1.05)/range));
    } else {eng=1;}
  } else {
    eng=(S.gear===0||S.stalled||!S.running)?0:(1-S.clutchPedal);
  }
  eng *= shiftSlip;

  var omegaWheel=S.speed/3.6/wheelRadius;
  var omegaDirect=omegaWheel*ratio;
  var omegaEngine=S.rpm*Math.PI/30;

  var Te=0;
  if(S.running&&!S.stalled){
    var thr=safeNum(S.throttle,0);
    if(S.rpm>E.redline)thr=0;
    Te=thr*E.maxTorque*torqueCurve(S.rpm,E);

    if(S.engineTemp<40){
      var cold=(40-S.engineTemp)/55;
      if(cold>0.9)cold=0.9;
      Te*=(1-cold*0.5);
      Te+=(Math.random()-0.5)*40*cold;
      if(Math.random()<cold*0.02){
        S.rpm-=150;
        if(S.rpm<0)S.rpm=0;
      }
    }

    if(S.engineTemp>130){
      var overheat=(S.engineTemp-130)/(OVERHEAT_LIMIT-130);
      if(overheat>1)overheat=1;
      Te*=(1-overheat*0.7);
    }

    var friction=5+S.rpm*0.003;
    Te-=friction;

    if(thr<0.05){
      var err=E.idle-S.rpm;
      if(err>0)Te+=Math.min(err*0.8,40);
      else Te+=Math.max(err*0.05,-15);
      Te+=friction*0.3;
    } else {
      if(S.rpm<E.idle*0.7)Te+=(E.idle*0.7-S.rpm)*0.5;
    }

    if(eng>0.3 && S.rpm<E.idle*0.85){
      var guard=(E.idle*0.85-S.rpm)*0.5;
      if(guard>150)guard=150;
      if(guard>0)Te+=guard;
    }
  }

  var slip=omegaEngine-omegaDirect;
  var Tc;
  if(E.cvt){
    var target=Te*eng;
    var damp=slip*0.15;
    Tc=target+damp;
    var maxT=Math.max(3,Math.abs(Te)+8);
    if(Tc>maxT)Tc=maxT;
    if(Tc<-maxT)Tc=-maxT;
    if(eng<0.01)Tc=0;
  } else {
    Tc=eng*clutchK*slip;
    Tc=Math.max(-clutchMax,Math.min(clutchMax,Tc));
    if(eng<0.001)Tc=0;
  }
  Tc=safeNum(Tc,0);

  var Iengine=E.cvt?1.4:0.55;
  var dE=(Te-Tc)/Iengine;
  var v=Math.abs(S.speed)/3.6;
  var dragF=0.42*v*v+(E.cvt?60:150);
  var dragT=dragF*wheelRadius*(omegaWheel>=0?1:-1);
  var brakeT=safeNum(S.brakePedal,0)*2600*(omegaWheel>=0?1:-1);
  var wheelTorque=Tc*ratio-brakeT-dragT;
  var dW=wheelTorque/Iwheel;
  var nE=omegaEngine+dE*dt;
  var nW=omegaWheel+dW*dt;
  if(!isFinite(nE))nE=omegaEngine;
  if(!isFinite(nW))nW=0;
  if(nE<0)nE=0;

  S.rpm=nE*30/Math.PI;
  S.speed=nW*wheelRadius*3.6;
  if(!isFinite(S.rpm))S.rpm=0;
  if(!isFinite(S.speed))S.speed=0;

  if(S.running&&!S.stalled&&S.engineTemp<20&&S.rpm<E.idle*0.5&&S.throttle<0.1){
    if(Math.random()<0.02){S.stalled=true;S.running=false;}
  }

  if(S.rpm>E.breakRpm){
    S.breakEngine('перекрут '+Math.round(S.rpm)+' об/мин');
    return;
  }
  if(Math.abs(S.speed)<0.12&&(S.brakePedal>0.05||(!E.cvt&&S.gear===0))){
    if(Math.abs(nW)<0.6)S.speed=0;
  }

  if(!S.stalled && S.running && S.rpm<E.stallRpm){
    if(eng>0.25 && S._shiftTimer<=0){
      S.stalled=true;S.running=false;
    } else if(S.rpm<E.stallRpm*0.4){
      S.stalled=true;S.running=false;
    }
  }

  if(S.stalled){
    var decayRate=E.idle*2.5;
    if(S.rpm>3000)decayRate=E.idle*4.5;
    else if(S.rpm>1500)decayRate=E.idle*3.5;
    S.rpm=Math.max(0,S.rpm-decayRate*dt);
  }

  S.crankAngle+=(S.rpm*Math.PI/30)*dt*0.55;
  var TAU=Math.PI*4;
  S.crankAngle=((S.crankAngle%TAU)+TAU)%TAU;
};
})();