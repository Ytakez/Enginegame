(function(){
"use strict";
var S=window.S;
var errBox=document.getElementById('err');
function showErr(m){if(errBox){errBox.style.display='block';errBox.textContent='Ошибка: '+m;}}
window.addEventListener('error',function(ev){if(!ev.filename||ev.filename.indexOf('github.io')===-1)return;showErr(ev.message+' | '+ev.filename+':'+ev.lineno);});
if(!S){showErr('physics.js не загрузился');return;}

if(S.ignitionState===undefined)S.ignitionState='off';
if(S.startAttempts===undefined)S.startAttempts=0;

var pedalEls={clutch:document.getElementById('pClutch'),brake:document.getElementById('pBrake'),gas:document.getElementById('pGas')};
var activeTouches={};
function pedalPress(n){if(S.pressed[n])return;S.pressed[n]=true;if(pedalEls[n])pedalEls[n].classList.add('active');}
function pedalRelease(n){if(!S.pressed[n])return;S.pressed[n]=false;if(pedalEls[n])pedalEls[n].classList.remove('active');}
function pedalReleaseAll(){pedalRelease('gas');pedalRelease('brake');pedalRelease('clutch');activeTouches={};}
function onTouchStart(e){for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];var el=document.elementFromPoint(t.clientX,t.clientY);if(!el)continue;var pedal=el.closest?el.closest('.pedal'):null;if(pedal){e.preventDefault();var n=pedal.dataset.pedal;activeTouches[t.identifier]=n;pedalPress(n);}}}
function onTouchEnd(e){for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];var n=activeTouches[t.identifier];if(n){delete activeTouches[t.identifier];var still=false;for(var k in activeTouches){if(activeTouches[k]===n)still=true;}if(!still)pedalRelease(n);}}}
document.addEventListener('touchstart',onTouchStart,{passive:false});
document.addEventListener('touchend',onTouchEnd,{passive:false});
document.addEventListener('touchcancel',onTouchEnd,{passive:false});
Object.keys(pedalEls).forEach(function(n){var el=pedalEls[n];if(!el)return;el.addEventListener('mousedown',function(e){e.preventDefault();pedalPress(n);});el.addEventListener('mouseup',function(){pedalRelease(n);});el.addEventListener('mouseleave',function(){pedalRelease(n);});el.addEventListener('contextmenu',function(e){e.preventDefault();});});
window.addEventListener('blur',pedalReleaseAll);
document.addEventListener('visibilitychange',function(){if(document.hidden)pedalReleaseAll();});

var gearBtns=Array.prototype.slice.call(document.querySelectorAll('.gbtn'));
S.setGear=function(g){var E=S.engines[S.engineType];if(E&&E.auto)return;if(S.broken)return;if(g===S.gear)return;S.gear=g;gearBtns.forEach(function(b){b.classList.toggle('on',Number(b.dataset.g)===g);});var gv=document.getElementById('gearVal');if(gv)gv.textContent=(g===0?'N':(g===-1?'R':String(g)));try{if(navigator.vibrate)navigator.vibrate(6);}catch(e){}};
gearBtns.forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();S.setGear(Number(b.dataset.g));});});

var autoBtns=Array.prototype.slice.call(document.querySelectorAll('.agbtn'));
S.setAutoGear=function(g){var E=S.engines[S.engineType];if(!E||!E.auto)return;if(S.broken)return;if(g===S.gear)return;S.gear=g;autoBtns.forEach(function(b){b.classList.toggle('on',Number(b.dataset.ag)===g);});var gv=document.getElementById('gearVal');if(gv)gv.textContent=(g===0?'N':(g===-1?'R':'D'));try{if(navigator.vibrate)navigator.vibrate(6);}catch(e){}};
autoBtns.forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();S.setAutoGear(Number(b.dataset.ag));});});

var ignBtn=document.getElementById('ignBtn');
var ignLock=false;

function setIgnBtn(txt,cls,active){if(!ignBtn)return;ignBtn.textContent=txt;ignBtn.className='ignbtn'+(cls?' '+cls:'')+(active?' on':'');}

function resetToOff(){S.ignitionState='off';S.running=false;S.stalled=true;S.rpm=0;S.startAttempts=0;setIgnBtn('ЗАЖИГАНИЕ','',false);}
function keyOn(){S.ignitionState='priming';S.primingStart=Date.now();S.running=false;S.stalled=true;S.rpm=0;S.startAttempts=0;setIgnBtn('КАЧАЕТ...','',true);try{if(navigator.vibrate)navigator.vibrate(20);}catch(e){}if(window.DVS_SOUND&&window.DVS_SOUND.fuelPump)window.DVS_SOUND.fuelPump();}
function readyToStart(){S.ignitionState='ready';setIgnBtn('▶ ПУСК','start',false);try{if(navigator.vibrate)navigator.vibrate([30,30]);}catch(e){}}

function showAttempt(msg){
  if(!ignBtn)return;
  ignBtn.textContent=msg;
  ignBtn.className='ignbtn';
  clearTimeout(ignBtn._t);
  ignBtn._t=setTimeout(function(){
    if(S.ignitionState==='ready')setIgnBtn('▶ ПУСК','start',false);
  },900);
}

function startEngine(){
  var E=S.engines[S.engineType];
  var coldStart=(S.engineTemp<5);

  if(coldStart){
    S.startAttempts++;
    var failChance=0.7;
    if(S.weather==='winter')failChance=0.65;
    if(S.startAttempts>=4)failChance=0;
    if(Math.random()<failChance){
      /* Неудачная попытка */
      showAttempt('❄️ ПОПЫТКА '+S.startAttempts);
      try{if(navigator.vibrate)navigator.vibrate([50,80,50]);}catch(e){}
      /* Воспламенение, но заглох */
      S.stalled=false;S.running=true;S.rpm=E.idle*0.7;
      setTimeout(function(){
        if(S.rpm<E.idle&&S.running){
          S.stalled=true;S.running=false;S.rpm=0;
          if(ignBtn){ignBtn.textContent='ЗАГЛОХ...';}
          setTimeout(function(){if(S.ignitionState==='ready')setIgnBtn('▶ ПУСК','start',false);},800);
        }
      },400);
      return;
    }
  }

  /* Успех */
  S.startAttempts=0;
  S.ignitionState='running';
  S.stalled=false;S.running=true;
  var idleBoost=coldStart?-200:0;
  S.rpm=E.idle+idleBoost;
  if(S.rpm<400)S.rpm=400;
  setIgnBtn('СТОП','',true);
  try{if(navigator.vibrate)navigator.vibrate([30,40,30]);}catch(e){}
  if(window.DVS_SOUND&&window.DVS_SOUND.starter)window.DVS_SOUND.starter();
}
function stopEngine(){S.running=false;S.stalled=true;S.rpm=0;S.ignitionState='off';S.startAttempts=0;setIgnBtn('ЗАЖИГАНИЕ','',false);try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}}

function toggleIgnition(){
  if(S.broken){try{if(navigator.vibrate)navigator.vibrate([50,50,50]);}catch(e){}return;}
  var st=S.ignitionState;
  if(st==='running'){stopEngine();return;}
  if(st==='off'){keyOn();return;}
  if(st==='priming'){return;}
  if(st==='ready'){startEngine();return;}
}
if(ignBtn)ignBtn.addEventListener('click',function(e){e.preventDefault();if(ignLock)return;ignLock=true;toggleIgnition();setTimeout(function(){ignLock=false;},400);});

var repairBtn=document.getElementById('repairBtn');
if(repairBtn)repairBtn.addEventListener('click',function(e){e.preventDefault();S.repair();});

var acc=0,last=performance.now(),FIXED=1/240;
var tSm=0,bSm=0,cSm=0;
var spdEl=document.getElementById('spdVal');
function smoothStep(cur,target,up,down,dt){var rate=target>cur?up:down;var d=target-cur;var step=rate*dt;return Math.abs(d)<=step?target:cur+Math.sign(d)*step;}

var lastEngine=null;
function updateEngineUI(){
  var E=S.engines[S.engineType];if(!E)return;
  var badge=document.getElementById('engBadge');
  if(badge&&E.name&&badge.textContent!==E.name)badge.textContent=E.name;
  if(lastEngine===S.engineType)return;
  lastEngine=S.engineType;
  var clutch=document.getElementById('pClutch');
  var pedals=document.querySelector('.pedals');
  if(E.auto){document.body.classList.add('auto-mode');if(clutch)clutch.style.display='none';if(pedals)pedals.style.gridTemplateColumns='1fr 1fr';}
  else{document.body.classList.remove('auto-mode');if(clutch)clutch.style.display='';if(pedals)pedals.style.gridTemplateColumns='';}
  if(E.auto){autoBtns.forEach(function(b){b.classList.toggle('on',Number(b.dataset.ag)===S.gear);});}
  else{gearBtns.forEach(function(b){b.classList.toggle('on',Number(b.dataset.g)===S.gear);});}
  var gv=document.getElementById('gearVal');
  if(gv){if(E.auto)gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':'D'));else gv.textContent=(S.gear===0?'N':(S.gear===-1?'R':String(S.gear)));}
}

function loop(now){
  var frame=(now-last)/1000;last=now;
  if(frame>0.25)frame=0.25;
  if(frame<0)frame=0;
  updateEngineUI();
  if(S.ignitionState==='priming'&&Date.now()-S.primingStart>=S.primingDuration)readyToStart();
  tSm=smoothStep(tSm,S.pressed.gas?1:0,4.5,7.0,frame);
  bSm=smoothStep(bSm,S.pressed.brake?1:0,5.0,7.0,frame);
  cSm=smoothStep(cSm,S.pressed.clutch?1:0,7.0,1.6,frame);
  S.throttle=tSm;S.brakePedal=bSm;S.clutchPedal=cSm;
  var pg=document.getElementById('pGas');var pb=document.getElementById('pBrake');var pc=document.getElementById('pClutch');
  if(pg)pg.querySelector('.bar').style.width=(tSm*100)+'%';
  if(pb)pb.querySelector('.bar').style.width=(bSm*100)+'%';
  if(pc)pc.querySelector('.bar').style.width=(cSm*100)+'%';
  acc+=frame;
  var steps=0;
  while(acc>=FIXED&&steps<12){S.physics(FIXED);acc-=FIXED;steps++;}
  if(steps>=12)acc=0;
  if(window.DVS_RENDER)window.DVS_RENDER.draw();
  if(spdEl)spdEl.textContent=String(Math.round(S.speed));
  requestAnimationFrame(loop);
}
if(S.engines[S.engineType].auto)S.gear=1;
requestAnimationFrame(loop);
})();