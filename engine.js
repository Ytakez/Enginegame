(function(){
"use strict";
var errBox = document.getElementById('err');
function showErr(msg){ errBox.style.display='block'; errBox.textContent = 'Ошибка: ' + msg; }
window.addEventListener('error', function(ev){ showErr(ev.message + ' | ' + ev.filename + ':' + ev.lineno); });

try {

var rpm=0, speed=0, gear=0, crankAngle=0;
var running=false, stalled=false;
var throttle=0, brakePedal=0, clutchPedal=0;
var pressed={gas:false,brake:false,clutch:false};

var gearRatios=[0,3.40,2.00,1.35,1.00,0.78];
var finalDrive=3.90, wheelRadius=0.31, mass=1250;
var Iwheel=mass*wheelRadius*wheelRadius;
var Iengine=0.55, maxTorque=250, clutchK=40, clutchMax=350;
var idleRpm=900, stallRpm=350, redlineRpm=6800;

function torqueCurve(r){
  var x=Math.max(800,Math.min(6500,r));
  return 0.55+0.45*Math.sin(Math.PI*(x-800)/(6500-800));
}

function physics(dt){
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
  rpm=nE*30/Math.PI;
  speed=nW*wheelRadius*3.6;
  if(speed<0.12&&(brakePedal>0.05||gear===0)){ if(nW<0.6){nW=0;speed=0;} }
  if(!stalled&&running&&rpm<stallRpm&&(eng>0.25||rpm<120)){
    stalled=true;running=false;rpm=0;
  }
  if(stalled)rpm=Math.max(0,rpm-2600*dt);
  crankAngle+=(rpm*Math.PI/30)*dt*0.55;
  var TAU=Math.PI*4;
  crankAngle=((crankAngle%TAU)+TAU)%TAU;
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
  pressed[name]=true;
  pedalEls[name].classList.add('active');
  try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}
}
function pedalDeactivate(name){
  pedalCount[name]=Math.max(0,pedalCount[name]-1);
  if(pedalCount[name]===0){
    pressed[name]=false;
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

var keyMap={'ArrowUp':'gas','KeyW':'gas','ArrowDown':'brake','KeyS':'brake','Space':'clutch','KeyC':'clutch'};
window.addEventListener('keydown',function(e){
  var k=keyMap[e.code];
  if(k){e.preventDefault();if(!pressed[k])pedalActivate(k);}
  if(e.code==='Digit0'||e.code==='KeyN')setGear(0);
  if(/^Digit[1-5]$/.test(e.code))setGear(Number(e.code.slice(5)));
  if(e.code==='Enter')toggleIgnition();
});
window.addEventListener('keyup',function(e){
  var k=keyMap[e.code];
  if(k){e.preventDefault();pedalDeactivate(k);}
});

var gearBtns=Array.prototype.slice.call(document.querySelectorAll('.gearbtn'));
function setGear(g){
  gear=g;
  gearBtns.forEach(function(b){b.classList.toggle('on',Number(b.dataset.g)===g);});
  document.getElementById('gearVal').textContent=(g===0?'N':String(g));
  try{if(navigator.vibrate)navigator.vibrate(6);}catch(e){}
}
gearBtns.forEach(function(b){
  b.addEventListener('click',function(ev){ev.preventDefault();setGear(Number(b.dataset.g));});
});

var ignBtn=document.getElementById('ignBtn');
function toggleIgnition(){
  if(running&&!stalled){running=false;stalled=true;ignBtn.classList.remove('on');}
  else{stalled=false;running=true;rpm=idleRpm;ignBtn.classList.add('on');}
  try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
}
ignBtn.addEventListener('click',function(ev){ev.preventDefault();toggleIgnition();});

window.DVS={};
Object.defineProperties(window.DVS,{
  rpm:{get:function(){return rpm;}},
  speed:{get:function(){return speed;}},
  gear:{get:function(){return gear;}},
  crankAngle:{get:function(){return crankAngle;}},
  running:{get:function(){return running;}},
  stalled:{get:function(){return stalled;}},
  throttle:{get:function(){return throttle;},set:function(v){throttle=v;}},
  brakePedal:{get:function(){return brakePedal;},set:function(v){brakePedal=v;}},
  clutchPedal:{get:function(){return clutchPedal;},set:function(v){clutchPedal=v;}}
});
window.DVS.pressed=pressed;
window.DVS.physics=physics;
window.DVS.setGear=setGear;

}catch(e){ showErr('Инициализация: '+(e&&e.message?e.message:e)); }
})();