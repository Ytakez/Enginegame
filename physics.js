(function(){
"use strict";

var STORAGE_KEY = 'dvs_engine_v3';

var ENGINES = {
  scooter: {
    name:'S1', cyls:1,
    maxTorque:60, idle:700, redline:3200, breakRpm:3800, stallRpm:250,
    fireDiv:30, lpBase:1400, lpRpm:0.35,
    subGain:0.5, sawGain:0.9, sqGain:0.4, noiseBase:0.08,
    cvt:true, auto:true, mass:200
  },
  r4: {
    name:'R4', cyls:4,
    maxTorque:250, idle:900, redline:6800, breakRpm:8000, stallRpm:350,
    fireDiv:30, lpBase:700, lpRpm:0.15,
    subGain:0.9, sawGain:0.5, sqGain:0.15, noiseBase:0.015, mass:1250
  },
  v8: {
    name:'V8', cyls:8,
    maxTorque:420, idle:900, redline:7200, breakRpm:8700, stallRpm:350,
    fireDiv:20, lpBase:450, lpRpm:0.12,
    subGain:1.5, sawGain:0.6, sqGain:0.10, noiseBase:0.028, mass:1400
  },
  v16: {
    name:'V16', cyls:16,
    maxTorque:680, idle:900, redline:7800, breakRpm:9200, stallRpm:350,
    fireDiv:10, lpBase:290, lpRpm:0.09,
    subGain:2.2, sawGain:0.68, sqGain:0.05, noiseBase:0.05, mass:1600
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
if (S.engines[savedEng].auto) S.gear = 1;

var gearRatios=[0,3.40,2.00,1.35,1.00,0.78];
var reverseRatio=-3.17;
var finalDrive=3.90, wheelRadius=0.31;
var clutchK=40, clutchMax=350;

function curE(){ return ENGINES[S.engineType] || ENGINES.r4; }

function torqueCurve(r, E){
  var lo = E.idle * 0.8;
  var hi = E.redline - (E.redline - E.idle) * 0.15;
  if (hi <= lo) hi = lo + 1;
  var x = Math.max(lo, Math.min(hi, r));
  return 0.55 + 0.45 * Math.sin(Math.PI * (x - lo) / (hi - lo));
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
  S.broken=false;S.stalled=false;S.running=false;S.rpm=0;S.speed=0;
  S.gear = curE().auto ? 1 : 0;
  document.body.classList.remove('broken');
  var gb=document.querySelectorAll('.gbtn');
  for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===S.gear);
  var ab=document.querySelectorAll('.agbtn');
  for(var j=0;j<ab.length;j++)ab[j].classList.toggle('on',Number(ab[j].dataset.ag)===S.gear);
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':(curE().auto?'D':String(S.gear))));
  var ig=document.getElementById('ignBtn');
  if(ig)ig.classList.remove('on');
  S.pressed.gas=false;S.pressed.brake=false;S.pressed.clutch=false;
};

S.setEngine=function(type){
  if(!ENGINES[type])return;
  S.engineType=type;
  try{ localStorage.setItem(STORAGE_KEY, type); }catch(e){}
  S.broken=false;S.stalled=false;S.running=false;
  S.rpm=0;S.speed=0;S.crankAngle=0;
  S.gear = ENGINES[type].auto ? 1 : 0;
  document.body.classList.remove('broken');
  var gb=document.querySelectorAll('.gbtn');
  for(var i=0;i<gb.length;i++)gb[i].classList.toggle('on',Number(gb[i].dataset.g)===S.gear);
  var ab=document.querySelectorAll('.agbtn');
  for(var j=0;j<ab.length;j++)ab[j].classList.toggle('on',Number(ab[j].dataset.ag)===S.gear);
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':(ENGINES[type].auto?'D':String(S.gear))));
  var ig=document.getElementById('ignBtn');
  if(ig)ig.classList.remove('on');
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
};

S.physics=function(dt){
  var E = curE();
  var mass = E.mass || 1250;
  var Iwheel = mass * wheelRadius * wheelRadius;

  if(S.broken){
    S.rpm=0;S.speed*=Math.max(0,1-2.5*dt);
    if(Math.abs(S.speed)<0.1)S.speed=0;
    return;
  }

  /* ===== ПЕРЕДАТОЧНОЕ ЧИСЛО ===== */
  var ratio;
  if (E.cvt){
    var vv = Math.abs(S.speed);
    var r = 10 / (1 + vv * 0.06);
    if (S.gear === 0) ratio = 0;
    else if (S.gear === -1) ratio = -r;
    else ratio = r;
  } else {
    if(S.gear===0)ratio=0;
    else if(S.gear===-1)ratio=reverseRatio*finalDrive;
    else ratio=gearRatios[S.gear]*finalDrive;
  }

  /* ===== СЦЕПЛЕНИЕ / CVT ===== */
  var eng;
  if (E.auto){
    if (S.gear === 0 || S.stalled || !S.running){
      eng = 0;
    } else if (E.cvt){
      // Плавное схватывание: 0 при idle, 1 при idle + 40% диапазона
      var range = E.idle * 0.5;
      eng = Math.max(0, Math.min(1, (S.rpm - E.idle * 1.05) / range));
    } else {
      eng = 1;
    }
  } else {
    eng = (S.gear===0||S.stalled||!S.running)?0:(1-S.clutchPedal);
  }

  var omegaWheel=S.speed/3.6/wheelRadius;
  var omegaDirect=omegaWheel*ratio;
  var omegaEngine=S.rpm*Math.PI/30;

  /* ===== МОМЕНТ ДВИГАТЕЛЯ ===== */
  var Te=0;
  if(S.running&&!S.stalled){
    var thr=S.throttle;
    if(S.rpm>E.redline)thr=0;
    Te=thr*E.maxTorque*torqueCurve(S.rpm, E);
    var friction = 5 + S.rpm * 0.003;
    Te -= friction;
    if (thr < 0.05){
      var err = E.idle - S.rpm;
      if (err > 0) Te += err * 0.8;
      else Te += err * 0.4;
      Te += friction;
    } else {
      if (S.rpm < E.idle * 0.7) Te += (E.idle * 0.7 - S.rpm) * 0.5;
    }
  }

  /* ===== МОМЕНТ СЦЕПЛЕНИЯ ===== */
  var slip = omegaEngine - omegaDirect;
  var Tc;
  if (E.cvt){
    // Момент передаётся пропорционально схватыванию, ограничен моментом двигателя
    var target = Te * eng;
    var damp = slip * 0.15;   // очень мягкое демпфирование
    Tc = target + damp;
    // Ограничение: не больше момента двигателя + запас
    var maxT = Math.max(3, Math.abs(Te) + 8);
    if (Tc >  maxT) Tc =  maxT;
    if (Tc < -maxT) Tc = -maxT;
    if (eng < 0.01) Tc = 0;
  } else {
    Tc = eng * clutchK * slip;
    Tc = Math.max(-clutchMax, Math.min(clutchMax, Tc));
    if (eng < 0.001) Tc = 0;
  }

  var Iengine = E.cvt ? 0.4 : 0.55;
  var dE=(Te-Tc)/Iengine;

  /* ===== СОПРОТИВЛЕНИЕ ===== */
  var v=Math.abs(S.speed)/3.6;
  var dragF=0.42*v*v + (E.cvt ? 60 : 150);
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
  if(Math.abs(S.speed)<0.12&&(S.brakePedal>0.05||(!E.cvt&&S.gear===0))){if(Math.abs(nW)<0.6)S.speed=0;}
  if(!S.stalled&&S.running&&S.rpm<E.stallRpm&&(eng>0.25||S.rpm<E.stallRpm*0.4)){
    S.stalled=true;S.running=false;S.rpm=0;
  }
  if(S.stalled)S.rpm=Math.max(0,S.rpm-E.idle*3*dt);
  S.crankAngle+=(S.rpm*Math.PI/30)*dt*0.55;
  var TAU=Math.PI*4;
  S.crankAngle=((S.crankAngle%TAU)+TAU)%TAU;
};
})();