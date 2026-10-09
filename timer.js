(function(){
"use strict";
var S = window.S;
var active = false;
var finished = false;
var startTime = 0;
var elapsed = 0;
var bestTime = null;
var overlay = null;

try{ var bt = localStorage.getItem('dvs_best_0_100'); if(bt) bestTime = parseFloat(bt); }catch(e){}
if(bestTime !== null && !isFinite(bestTime)) bestTime = null;

function fmt(ms){
  if(ms === null || ms === undefined) return '--.--';
  return (ms/1000).toFixed(2);
}

function makeOverlay(){
  if(overlay) return overlay;
  var o = document.createElement('div');
  o.id = 'timerOverlay';
  o.innerHTML =
    '<div class="tm-lbl">0-100 КМ/Ч</div>'+
    '<div id="timerValue" class="tm-val">0.00</div>'+
    '<div id="timerBest" class="tm-best">лучшее: '+fmt(bestTime)+'</div>'+
    '<div id="timerHint" class="tm-hint">разгоняйся до 100</div>';
  document.body.appendChild(o);
  overlay = o;
  return o;
}

function show(){
  var o = makeOverlay();
  o.style.display = 'block';
}
function hide(){
  if(overlay) overlay.style.display = 'none';
}

function reset(){
  active = false;
  finished = false;
  elapsed = 0;
  var val = document.getElementById('timerValue');
  if(val){ val.textContent = '0.00'; val.classList.remove('done'); }
  var hint = document.getElementById('timerHint');
  if(hint) hint.style.display = 'block';
}

function start(){
  if(!S) return;
  reset();
  active = true;
  finished = false;
  startTime = performance.now();
  show();
  try{ if(navigator.vibrate) navigator.vibrate(25); }catch(e){}
}

function stop(){
  if(finished) return;
  active = false;
  finished = true;
  var val = document.getElementById('timerValue');
  if(val) val.classList.add('done');
  var hint = document.getElementById('timerHint');
  if(hint) hint.style.display = 'none';

  var isRecord = (bestTime === null || elapsed < bestTime);
  if(isRecord){
    bestTime = elapsed;
    try{ localStorage.setItem('dvs_best_0_100', String(bestTime)); }catch(e){}
    var b = document.getElementById('timerBest');
    if(b){
      b.textContent = 'лучшее: ' + fmt(bestTime) + ' 🏆';
      b.classList.add('record');
      setTimeout(function(){ b.classList.remove('record'); }, 2500);
    }
  }
  try{ if(navigator.vibrate) navigator.vibrate([40,60,40]); }catch(e){}
}

function loop(){
  if(active && !finished){
    elapsed = performance.now() - startTime;
    var val = document.getElementById('timerValue');
    if(val) val.textContent = fmt(elapsed);
    var speed = (S && typeof S.speed === 'number') ? Math.abs(S.speed) : 0;
    if(speed >= 100){
      stop();
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function getBest(){ return bestTime; }
function resetBest(){
  bestTime = null;
  try{ localStorage.removeItem('dvs_best_0_100'); }catch(e){}
  var b = document.getElementById('timerBest');
  if(b) b.textContent = 'лучшее: --.--';
}

window.DVS_TIMER = {
  start: start,
  stop: stop,
  reset: reset,
  show: show,
  hide: hide,
  getBest: getBest,
  resetBest: resetBest,
  isActive: function(){ return active; }
};

})();