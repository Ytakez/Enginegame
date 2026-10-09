(function(){
"use strict";
var S = window.S;
if(!S) return;

/* Координаты передач в % относительно .gears-box */
var POSITIONS = {
  '-1': {x: 12.5, y: 25},   /* R */
  '1':  {x: 37.5, y: 25},
  '3':  {x: 62.5, y: 25},
  '5':  {x: 87.5, y: 25},
  '0':  {x: 50,   y: 50},   /* N */
  '2':  {x: 37.5, y: 75},
  '4':  {x: 62.5, y: 75},
  '6':  {x: 87.5, y: 75}
};

var box = null;
var stick = null;
var dragging = false;
var rect = null;
var lastGear = 0;

/* ==================== ПОЗИЦИОНИРОВАНИЕ ==================== */
function moveTo(g, animate){
  if(!stick) return;
  var p = POSITIONS[String(g)];
  if(!p) p = POSITIONS['0'];

  if(animate === false){
    stick.style.transition = 'none';
    stick.style.left = p.x + '%';
    stick.style.top = p.y + '%';
    setTimeout(function(){
      if(stick) stick.style.transition = '';
    }, 30);
  } else {
    stick.style.left = p.x + '%';
    stick.style.top = p.y + '%';
  }
}

/* ==================== ОБРАБОТЧИКИ ==================== */
function onDown(e){
  if(!box || !stick) return;
  if(S.broken || S.seized) return;
  e.preventDefault();

  dragging = true;
  stick.classList.add('dragging');
  rect = box.getBoundingClientRect();

  /* Сразу перемещаем в точку нажатия */
  var t = e.touches ? e.touches[0] : e;
  moveToPoint(t.clientX, t.clientY);

  try{ if(navigator.vibrate) navigator.vibrate(8); }catch(err){}
}

function onMove(e){
  if(!dragging) return;
  e.preventDefault();
  var t = e.touches ? e.touches[0] : e;
  moveToPoint(t.clientX, t.clientY);
}

function moveToPoint(cx, cy){
  if(!rect) return;
  var xp = ((cx - rect.left) / rect.width) * 100;
  var yp = ((cy - rect.top) / rect.height) * 100;
  xp = Math.max(2, Math.min(98, xp));
  yp = Math.max(2, Math.min(98, yp));
  stick.style.left = xp + '%';
  stick.style.top = yp + '%';
}

function onUp(e){
  if(!dragging) return;
  dragging = false;
  stick.classList.remove('dragging');

  var cx = parseFloat(stick.style.left) || 50;
  var cy = parseFloat(stick.style.top) || 50;

  /* Ищем ближайшую передачу */
  var nearest = null;
  var minDist = 999;
  for(var k in POSITIONS){
    var p = POSITIONS[k];
    var dx = p.x - cx;
    var dy = p.y - cy;
    var d = Math.sqrt(dx*dx + dy*dy);
    if(d < minDist){ minDist = d; nearest = k; }
  }

  /* Если ближе 18% — переключаем */
  if(minDist < 18 && nearest !== null){
    var g = parseInt(nearest, 10);
    if(g === S.gear){
      moveTo(g, true);
    } else if(S.setGear){
      S.setGear(g);
      /* Даём 100мс — проверяем, переключилось ли */
      setTimeout(function(){
        if(S.gear === g){
          moveTo(g, true);
        } else {
          /* Хруст — рычаг отскакивает обратно */
          try{ if(navigator.vibrate) navigator.vibrate([30,20,30]); }catch(e){}
          moveTo(S.gear, true);
        }
      }, 100);
    }
  } else {
    /* Отпустили далеко от передачи — рычаг возвращается */
    moveTo(S.gear, true);
  }
}

/* ==================== СИНХРОНИЗАЦИЯ ==================== */
/* Если передача поменялась извне (клик по кнопке, setEngine) */
setInterval(function(){
  if(!stick || dragging) return;
  if(S.gear === lastGear) return;
  lastGear = S.gear;
  moveTo(S.gear, true);
}, 200);

/* Обновление при смене двигателя */
window.addEventListener('dvs:engineChanged', function(){
  if(stick) moveTo(S.gear, false);
});

/* ==================== ПУБЛИЧНЫЙ API ==================== */
window.DVS_GEARSTICK = {
  moveTo: moveTo,
  getBox: function(){ return box; }
};

/* ==================== ИНИЦИАЛИЗАЦИЯ ==================== */
function init(){
  box = document.getElementById('gearsManual');
  stick = document.getElementById('gearStick');
  if(!box || !stick){
    setTimeout(init, 300);
    return;
  }

  /* Начальная позиция */
  lastGear = S.gear || 0;
  moveTo(lastGear, false);

  /* Тач */
  stick.addEventListener('touchstart', onDown, {passive:false});
  stick.addEventListener('touchmove', onMove, {passive:false});
  stick.addEventListener('touchend', onUp);
  stick.addEventListener('touchcancel', onUp);

  /* Мышь */
  stick.addEventListener('mousedown', onDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  console.log('gearstick.js: рычаг готов');
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 300); });
} else {
  setTimeout(init, 300);
}

})();