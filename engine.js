(function(){
"use strict";
var S = window.S;
var errBox = document.getElementById('err');
function showErr(m){ if(errBox){errBox.style.display='block';errBox.textContent='Ошибка: '+m;} }
window.addEventListener('error',function(ev){
  if(!ev.filename||ev.filename.indexOf('github.io')===-1)return;
  showErr(ev.message+' | '+ev.filename+':'+ev.lineno);
});
if(!S){showErr('physics.js не загрузился');return;}

/* ПЕДАЛИ */
var pedalEls={clutch:document.getElementById('pClutch'),brake:document.getElementById('pBrake'),gas:document.getElementById('pGas')};
var activeTouches={};
function pedalPress(n){ if(S.pressed[n])return; S.pressed[n]=true; if(pedalEls[n])pedalEls[n].classList.add('active'); }
function pedalRelease(n){ if(!S.pressed[n])return; S.pressed[n]=false; if(pedalEls[n])pedalEls[n].classList.remove('active'); }
function pedalReleaseAll(){ pedalRelease('gas'); pedalRelease('brake'); pedalRelease('clutch'); activeTouches={}; }

function onTouchStart(e){
  for(var i=0;i<e.changedTouches.length;i++){
    var t=e.changedTouches[i];
    var el=document.elementFromPoint(t.clientX,t.clientY);
    if(!el)continue;
    var pedal=el.closest?el.closest('.pedal'):null;
    if(pedal){ e.preventDefault(); var n=pedal.dataset.pedal; activeTouches[t.identifier]=n; pedalPress(n); }
  }
}
function onTouchEnd(e){
  for(var i=0;i<e.changedTouches.length;i++){
    var t=e.changedTouches[i]; var n=activeTouches[t.identifier];
    if(n){ delete activeTouches[t.identifier]; var still=false; for(var k in activeTouches){if(activeTouches[k]===n)still=true;} if(!still)pedalRelease(n); }
  }
}
document.addEventListener('touchstart',onTouchStart,{passive:false});
document.addEventListener('touchend',onTouchEnd,{passive:false});
document.addEventListener('touchcancel',onTouchEnd,{passive:false});
Object.keys(pedalEls).forEach(function(n){
  var el=pedalEls[n]; if(!el)return;
  el.addEventListener('mousedown',function(e){e.preventDefault();pedalPress(n);});
  el.addEventListener('mouseup',function(){pedalRelease(n);});
  el.addEventListener('mouseleave',function(){pedalRelease(n);});
  el.addEventListener('contextmenu',function(e){e.preventDefault();});
});
window.addEventListener('blur',pedalReleaseAll);
document.addEventListener('visibilitychange',function(){if(document.hidden)pedalReleaseAll();});

/* ПЕРЕДАЧИ */
var gearBtns=Array.prototype.slice.call(document.querySelectorAll('.gbtn'));
S.setGear=function(g){
  if(S.broken)return;
  if(g===S.gear)return;
  S.gear=g;
  gearBtns.forEach(function(b){b.classList.toggle('on',Number(b.dataset.g)===g);});
  var gv=document.getElementById('gearVal');
  if(gv)gv.textContent=(g===0?'N':(g===-1?'R':String(g)));
};
gearBtns.forEach(function(b){
  b.addEventListener('click',function(e){e.preventDefault();S.setGear(Number(b.dataset.g));});
});

/* ЗАЖИГАНИЕ */
var ignBtn=document.getElementById('ignBtn');
var ignLock=false;
function toggleIgnition(){
  if(S.broken){ try{if(navigator.vibrate)navigator.vibrate([50,50,50]);}catch(e){} return; }
  if(S.running&&!S.stalled){ S.running=false; S.stalled=true; ignBtn.classList.remove('on'); }
  else { S.stalled=false; S.running=true; S.rpm=900; ignBtn.classList.add('on'); }
  try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
}
if(ignBtn) ignBtn.addEventListener('click',function(e){
  e.preventDefault();
  if(ignLock)return;
  ignLock=true; toggleIgnition();
  setTimeout(function(){ignLock=false;},350);
});

/* РЕМОНТ */
var repairBtn=document.getElementById('repairBtn');
if(repairBtn) repairBtn.addEventListener('click',function(e){e.preventDefault();S.repair();});

/* ГЛАВНЫЙ ЦИКЛ */
var acc=0, last=performance.now(), FIXED=1/240;
var tSm=0,bSm=0,cSm=0;
var spdEl=document.getElementById('spdVal');

function smoothStep(cur,target,up,down,dt){
  var rate=target>cur?up:down;
  var d=target-cur;
  var step=rate*dt;
  return Math.abs(d)<=step?target:cur+Math.sign(d)*step;
}

function loop(now){
  var frame=(now-last)/1000; last=now;
  if(frame>0.25)frame=0.25;
  if(frame<0)frame=0;

  tSm=smoothStep(tSm,S.pressed.gas?1:0,4.5,7.0,frame);
  bSm=smoothStep(bSm,S.pressed.brake?1:0,5.0,7.0,frame);
  cSm=smoothStep(cSm,S.pressed.clutch?1:0,7.0,1.6,frame);
  S.throttle=tSm; S.brakePedal=bSm; S.clutchPedal=cSm;

  var pg=document.getElementById('pGas');
  var pb=document.getElementById('pBrake');
  var pc=document.getElementById('pClutch');
  if(pg)pg.querySelector('.bar').style.width=(tSm*100)+'%';
  if(pb)pb.querySelector('.bar').style.width=(bSm*100)+'%';
  if(pc)pc.querySelector('.bar').style.width=(cSm*100)+'%';

  acc+=frame;
  var steps=0;
  while(acc>=FIXED&&steps<12){ S.physics(FIXED); acc-=FIXED; steps++; }
  if(steps>=12)acc=0;

  if(window.DVS_RENDER) window.DVS_RENDER.draw();
  if(spdEl)spdEl.textContent=String(Math.round(S.speed));
  requestAnimationFrame(loop);
}

S.setGear(0);
requestAnimationFrame(loop);
})();