(function(){
"use strict";

var S = window.DVS = {
  rpm: 0, speed: 0, gear: 0, crankAngle: 0,
  running: false, stalled: false, broken: false,
  throttle: 0, brakePedal: 0, clutchPedal: 0,
  pressed: { gas:false, brake:false, clutch:false }
};

var errBox = document.getElementById('err');
function showErr(msg){
  if (!errBox) return;
  errBox.style.display = 'block';
  errBox.textContent = 'Ошибка: ' + msg;
}
window.addEventListener('error', function(ev){
  showErr(ev.message + ' | ' + (ev.filename||'') + ':' + (ev.lineno||0));
});

var breakBanner = document.getElementById('breakBanner');

var gearRatios=[0,3.40,2.00,1.35,1.00,0.78];
var finalDrive=3.90, wheelRadius=0.31, mass=1250;
var Iwheel=mass*wheelRadius*wheelRadius;
var Iengine=0.55, maxTorque=250, clutchK=40, clutchMax=350;
var idleRpm=900, stallRpm=350, redlineRpm=6800, breakRpm=8000;

function torqueCurve(r){
  var x=Math.max(800,Math.min(6500,r));
  return 0.55+0.45*Math.sin(Math.PI*(x-800)/(6500-800));
}

function breakEngine(reason){
  if (S.broken) return;
  S.broken = true;
  S.running = false;
  S.stalled = true;
  S.rpm = 0;
  document.body.classList.add('broken');
  if (breakBanner) breakBanner.textContent = '⚠ ДВИГАТЕЛЬ СЛОМАН: ' + (reason||'поломка');
  var ignBtn = document.getElementById('ignBtn');
  if (ignBtn) ignBtn.classList.remove('on');
  try{ if(navigator.vibrate) navigator.vibrate([100,60,100,60,200]); }catch(e){}
}

function repair(){
  S.broken = false;
  S.stalled = false;
  S.running = false;
  S.rpm = 0;
  S.speed = 0;
  S.gear = 0;
  document.body.classList.remove('broken');
  var gb = document.querySelectorAll('.gearbtn');
  for (var i=0;i<gb.length;i++) gb[i].classList.toggle('on', Number(gb[i].dataset.g) === 0);
  var gv = document.getElementById('gearVal');
  if (gv) gv.textContent = 'N';
  var ignBtn = document.getElementById('ignBtn');
  if (ignBtn) ignBtn.classList.remove('on');
  try{ if(navigator.vibrate) navigator.vibrate(15); }catch(e){}
}

function physics(dt){
  var rpm=S.rpm, speed=S.speed, gear=S.gear;
  var throttle=S.throttle, brakePedal=S.brakePedal, clutchPedal=S.clutchPedal;
  var running=S.running, stalled=S.stalled;

  if (S.broken){
    S.rpm = 0;
    S.speed *= Math.max(0, 1 - 2.5*dt);
    if (Math.abs(S.speed) < 0.1) S.speed = 0;
    return;
  }

  var ratio=gearRatios[gear]*finalDrive;
  var eng=(gear===0||stalled||!running)?0:(1-clutchPedal);
  var omegaWheel=speed/3.6/wheelRadius;
  var omegaDirect=omegaWheel*ratio;
  var omegaEngine=rpm*Math.PI/30;
  var Te=0;
  if(running&&!stalled){
    var thr=throttle; if(rpm>redlineRpm)thr=0;
    Te=thr*maxTorque*torqueCurve(rpm);
    Te-=10+rpm*0.006;
    if(rpm<idleRpm)Te+=(idleRpm-rpm)*0.35;
  }
  var slip=omegaEngine-omegaDirect;
  var Tc=eng*clutchK*slip;
  Tc=Math.max(-clutchMax,Math.min(clutchMax,Tc));
  if(eng<0.001)Tc=0;
  var dE=(Te-Tc)/Iengine;
  var v=Math.abs(speed)/3.6;
  var dragF=0.42*v*v+150;
  var dragT=dragF*wheelRadius*(omegaWheel>=0?1:-1);
  var brakeT=brakePedal*2600*(omegaWheel>=0?1:-1);
  var wheelTorque=Tc*ratio-brakeT-dragT;
  var dW=wheelTorque/Iwheel;
  var nE=omegaEngine+dE*dt;
  var nW=omegaWheel+dW*dt;
  if(nE<0)nE=0; if(nW<0)nW=0;
  S.rpm=nE*30/Math.PI;
  S.speed=nW*wheelRadius*3.6;

  if (S.rpm > breakRpm){
    breakEngine('перекрут ' + Math.round(S.rpm) + ' об/мин');
    return;
  }

  if(S.speed<0.12&&(brakePedal>0.05||gear===0)){ if(nW<0.6)S.speed=0; }
  if(!stalled&&running&&S.rpm<stallRpm&&(eng>0.25||S.rpm<120)){
    S.stalled=true;S.running=false;S.rpm=0;
  }
  if(S.stalled)S.rpm=Math.max(0,S.rpm-2600*dt);
  S.crankAngle+=(S.rpm*Math.PI/30)*dt*0.55;
  var TAU=Math.PI*4;
  S.crankAngle=((S.crankAngle%TAU)+TAU)%TAU;
}

var pedalEls={
  clutch:document.getElementById('pClutch'),
  brake:document.getElementById('pBrake'),
  gas:document.getElementById('pGas')
};
var pedalPointers=new Map();
var pedalCount={gas:0,brake:0,clutch:0};

function pedalActivate(name){
  pedalCount[name]++;
  S.pressed[name]=true;
  pedalEls[name].classList.add('active');
  try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}
}
function pedalDeactivate(name){
  pedalCount[name]=Math.max(0,pedalCount[name]-1);
  if(pedalCount[name]===0){
    S.pressed[name]=false;
    pedalEls[name].classList.remove('active');
  }
}
Object.keys(pedalEls).forEach(function(name){
  var el=pedalEls[name];
  el.addEventListener('pointerdown',function(e){
    e.preventDefault();
    try{el.setPointerCapture(e.pointerId);}catch(err){}
    pedalPointers.set(e.pointerId,name);
    pedalActivate(name);
  });
  el.addEventListener('contextmenu',function(e){e.preventDefault();});
  el.addEventListener('dragstart',function(e){e.preventDefault();});
});
function releasePointer(e){
  var name=pedalPointers.get(e.pointerId);
  if(name){pedalPointers.delete(e.pointerId);pedalDeactivate(name);}
}
window.addEventListener('pointerup',releasePointer);
window.addEventListener('pointercancel',releasePointer);

var gearBtns=Array.prototype.slice.call(document.querySelectorAll('.gearbtn'));
function setGear(g){
  if (S.broken) return;
  if (g === S.gear) return;

  var clutchOK = S.pressed.clutch || S.clutchPedal > 0.4;
  var isMoving = Math.abs(S.speed) > 5;
  var isRunning = S.running && !S.stalled;

  if (!clutchOK && (isMoving || isRunning)){
    breakEngine('переключение без сцепления');
    return;
  }

  S.gear=g;
  gearBtns.forEach(function(b){b.classList.toggle('on',Number(b.dataset.g)===g);});
  document.getElementById('gearVal').textContent=(g===0?'N':String(g));
  try{if(navigator.vibrate)navigator.vibrate(6);}catch(e){}
}
gearBtns.forEach(function(b){
  b.addEventListener('click',function(ev){ev.preventDefault();setGear(Number(b.dataset.g));});
});

var ignBtn=document.getElementById('ignBtn');
function toggleIgnition(){
  if (S.broken){
    try{ if(navigator.vibrate) navigator.vibrate([50,50,50]); }catch(e){}
    return;
  }
  if(S.running&&!S.stalled){S.running=false;S.stalled=true;ignBtn.classList.remove('on');}
  else{S.stalled=false;S.running=true;S.rpm=idleRpm;ignBtn.classList.add('on');}
  try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
}
ignBtn.addEventListener('click',function(ev){ev.preventDefault();toggleIgnition();});

var repairBtn = document.getElementById('repairBtn');
if (repairBtn) repairBtn.addEventListener('click', function(ev){ ev.preventDefault(); repair(); });

window.DVS.physics=physics;
window.DVS.setGear=setGear;
window.DVS.repair=repair;
window.DVS.breakEngine=breakEngine;

})();