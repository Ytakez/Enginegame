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
  if (!ev.filename || ev.filename.indexOf('ytakez.github.io') === -1) return;
  showErr(ev.message + ' | ' + ev.filename + ':' + ev.lineno);
});

var breakBanner = document.getElementById('breakBanner');

var gearRatios=[0,3.40,2.00,1.35,1.00,0.78];
var reverseRatio = -3.17;
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
  S.pressed.gas = false;
  S.pressed.brake = false;
  S.pressed.clutch = false;
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

  var ratio;
  if (gear === 0) ratio = 0;
  else if (gear === -1) ratio = reverseRatio * finalDrive;
  else ratio = gearRatios[gear] * finalDrive;

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
  if(nE<0)nE=0;
  // колесо может крутиться в обе стороны (для заднего хода)
  S.rpm=nE*30/Math.PI;
  S.speed=nW*wheelRadius*3.6;

  if (S.rpm > breakRpm){
    breakEngine('перекрут ' + Math.round(S.rpm) + ' об/мин');
    return;
  }

  if(Math.abs(S.speed)<0.12&&(brakePedal>0.05||gear===0)){ if(Math.abs(nW)<0.6)S.speed=0; }
  if(!stalled&&running&&S.rpm<stallRpm&&(eng>0.25||S.rpm<120)){
    S.stalled=true;S.running=false;S.rpm=0;
  }
  if(S.stalled)S.rpm=Math.max(0,S.rpm-2600*dt);
  S.crankAngle+=(S.rpm*Math.PI/30)*dt*0.55;
  var TAU=Math.PI*4;
  S.crankAngle=((S.crankAngle%TAU)+TAU)%TAU;
}

/* ============================================
   ПЕДАЛИ — чистые touch/mouse события
   ============================================ */
var pedalEls = {
  clutch: document.getElementById('pClutch'),
  brake:  document.getElementById('pBrake'),
  gas:    document.getElementById('pGas')
};

// активно нажатые пальцы: touchId -> имя педали
var activeTouches = {};

function pedalPress(name){
  if (S.pressed[name]) return;
  S.pressed[name] = true;
  var el = pedalEls[name];
  if (el) el.classList.add('active');
  try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){}
}
function pedalRelease(name){
  if (!S.pressed[name]) return;
  S.pressed[name] = false;
  var el = pedalEls[name];
  if (el) el.classList.remove('active');
}
function pedalReleaseAll(){
  pedalRelease('gas');
  pedalRelease('brake');
  pedalRelease('clutch');
  activeTouches = {};
}

// тач-события
function onTouchStart(e){
  for (var i=0;i<e.changedTouches.length;i++){
    var t = e.changedTouches[i];
    var el = document.elementFromPoint(t.clientX, t.clientY);
    if (!el) continue;
    var pedal = el.closest ? el.closest('.pedal') : null;
    if (pedal){
      e.preventDefault();
      var name = pedal.dataset.pedal;
      activeTouches[t.identifier] = name;
      pedalPress(name);
    }
  }
}
function onTouchEnd(e){
  for (var i=0;i<e.changedTouches.length;i++){
    var t = e.changedTouches[i];
    var name = activeTouches[t.identifier];
    if (name){
      delete activeTouches[t.identifier];
      var stillHeld = false;
      for (var k in activeTouches){ if (activeTouches[k] === name) stillHeld = true; }
      if (!stillHeld) pedalRelease(name);
    }
  }
}
document.addEventListener('touchstart', onTouchStart, {passive:false});
document.addEventListener('touchend', onTouchEnd, {passive:false});
document.addEventListener('touchcancel', onTouchEnd, {passive:false});

// мышь для десктопа
Object.keys(pedalEls).forEach(function(name){
  var el = pedalEls[name];
  if (!el) return;
  el.addEventListener('mousedown', function(e){ e.preventDefault(); pedalPress(name); });
  el.addEventListener('mouseup',   function(){ pedalRelease(name); });
  el.addEventListener('mouseleave',function(){ pedalRelease(name); });
  el.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  el.addEventListener('dragstart', function(e){ e.preventDefault(); });
});

// клавиатура
var keyMap = { 'ArrowUp':'gas','KeyW':'gas','ArrowDown':'brake','KeyS':'brake','Space':'clutch','KeyC':'clutch' };
window.addEventListener('keydown', function(e){
  var k = keyMap[e.code];
  if (k){ e.preventDefault(); pedalPress(k); }
  if (e.code === 'Digit0' || e.code === 'KeyN') setGear(0);
  if (/^Digit[1-5]$/.test(e.code)) setGear(Number(e.code.slice(5)));
  if (e.code === 'KeyR') setGear(-1);
  if (e.code === 'Enter') toggleIgnition();
});
window.addEventListener('keyup', function(e){
  var k = keyMap[e.code];
  if (k){ e.preventDefault(); pedalRelease(k); }
});

// сброс при потере фокуса
window.addEventListener('blur', pedalReleaseAll);
document.addEventListener('visibilitychange', function(){
  if (document.hidden) pedalReleaseAll();
});

/* ============================================
   ПЕРЕДАЧИ — БЕЗ ПРОВЕРКИ СЦЕПЛЕНИЯ
   ============================================ */
var gearBtns = Array.prototype.slice.call(document.querySelectorAll('.gearbtn'));

function setGear(g){
  if (S.broken) return;
  if (g === S.gear) return;

  S.gear = g;
  gearBtns.forEach(function(b){ b.classList.toggle('on', Number(b.dataset.g) === g); });
  var gv = document.getElementById('gearVal');
  if (gv) gv.textContent = (g === 0 ? 'N' : (g === -1 ? 'R' : String(g)));
  try{ if(navigator.vibrate) navigator.vibrate(6); }catch(e){}
}

gearBtns.forEach(function(b){
  b.addEventListener('click', function(ev){
    ev.preventDefault();
    setGear(Number(b.dataset.g));
  });
  b.addEventListener('touchstart', function(ev){
    ev.preventDefault();
    setGear(Number(b.dataset.g));
  }, {passive:false});
});

/* ============================================
   ЗАЖИГАНИЕ
   ============================================ */
var ignBtn = document.getElementById('ignBtn');
var ignLock = false;
function toggleIgnition(){
  if (S.broken){
    try{ if(navigator.vibrate) navigator.vibrate([50,50,50]); }catch(e){}
    return;
  }
  if(S.running && !S.stalled){
    S.running = false; S.stalled = true;
    ignBtn.classList.remove('on');
  } else {
    S.stalled = false; S.running = true; S.rpm = idleRpm;
    ignBtn.classList.add('on');
  }
  try{ if(navigator.vibrate) navigator.vibrate(12); }catch(e){}
}
if (ignBtn){
  ignBtn.addEventListener('click', function(ev){
    ev.preventDefault();
    if (ignLock) return;
    ignLock = true;
    toggleIgnition();
    setTimeout(function(){ ignLock = false; }, 350);
  });
}

/* ============================================
   РЕМОНТ
   ============================================ */
var repairBtn = document.getElementById('repairBtn');
if (repairBtn){
  repairBtn.addEventListener('click', function(ev){ ev.preventDefault(); repair(); });
}

window.DVS.physics = physics;
window.DVS.setGear = setGear;
window.DVS.repair = repair;
window.DVS.breakEngine = breakEngine;

})();