(function(){
"use strict";

var P = window.DVS_PROFILE;
var S = window.S;

/* ==================== СПИСОК ДОСТИЖЕНИЙ ==================== */
var LIST = [
  /* --- Простые --- */
  { id:'first_start',   icon:'🥇', name:'Первый запуск',      desc:'Заведи двигатель впервые' },
  { id:'first_move',    icon:'🚗', name:'С места',            desc:'Тронься с места' },
  { id:'first_km',      icon:'📏', name:'Первый километр',    desc:'Проехать 1 км' },
  { id:'first_repair',  icon:'🔧', name:'Механик',            desc:'Починить двигатель' },

  /* --- Скорость --- */
  { id:'speed_100',     icon:'🏁', name:'Сотня',              desc:'Разогнаться до 100 км/ч' },
  { id:'speed_150',     icon:'🏎️', name:'Спорткар',           desc:'Разогнаться до 150 км/ч' },
  { id:'speed_200',     icon:'🚀', name:'Ракета',             desc:'Разогнаться до 200 км/ч' },
  { id:'speed_250',     icon:'⚡', name:'Молния',             desc:'Разогнаться до 250 км/ч' },

  /* --- 0-100 --- */
  { id:'sprint_5',      icon:'⏱️', name:'Спринтер',           desc:'0-100 быстрее 5 секунд' },
  { id:'sprint_3',      icon:'💨', name:'Быстрее ветра',      desc:'0-100 быстрее 3 секунд' },

  /* --- Двигатель --- */
  { id:'redline',       icon:'🔥', name:'Отжиг',              desc:'Докрути до отсечки' },
  { id:'overheat',      icon:'🌡️', name:'Горячий',            desc:'Нагрей до 120°C' },
  { id:'engine_break',  icon:'💥', name:'Перекрут',           desc:'Сломай двигатель' },
  { id:'engine_seize',  icon:'💀', name:'Клин',               desc:'Заклинь мотор' },
  { id:'kill_5',        icon:'☠️', name:'Убийца моторов',     desc:'Сломай 5 двигателей' },

  /* --- Прогресс --- */
  { id:'km_100',        icon:'🛣️', name:'Дальнобойщик',       desc:'Проехать 100 км' },
  { id:'km_1000',       icon:'🌍', name:'Путешественник',     desc:'Проехать 1000 км' },
  { id:'play_1h',       icon:'🕐', name:'Час за рулём',       desc:'1 час в игре' },
  { id:'play_10h',      icon:'👑', name:'Ветеран',            desc:'10 часов в игре' },

  /* --- Испытания --- */
  { id:'cold_start',    icon:'❄️', name:'Мороз',              desc:'Заведи зимой с 1-го раза' },
  { id:'tractor_km',    icon:'🚜', name:'Тракторист',         desc:'Проедь 1 км на Д-240' },
  { id:'wankel_run',    icon:'🔺', name:'Роторный дух',       desc:'Поезди на 13B Renesis' },
  { id:'dci_km',        icon:'🇫🇷', name:'Француз',           desc:'Проедь 1 км на 2.0 dCi' },

  /* --- Коллекции --- */
  { id:'collect_5',     icon:'⚙️', name:'Коллекционер',       desc:'Попробуй 5 разных двигателей' },
  { id:'collect_all',   icon:'🏆', name:'Всеядный',           desc:'Попробуй ВСЕ двигатели' }
];

var ACH = {};
for(var i=0;i<LIST.length;i++)ACH[LIST[i].id]=LIST[i];

/* ==================== СЛУЖЕБНОЕ ==================== */
var unlocked = {};      /* какие уже получены в текущей сессии */
var notifyQueue = [];
var notifying = false;
var lastTick = performance.now();
var lastSave = 0;

function has(id){ return unlocked[id] === true; }

function unlock(id){
  if(!id || unlocked[id]) return;
  var a = ACH[id];
  if(!a) return;
  unlocked[id] = true;
  console.log('🏆 Достижение:', a.name);

  /* Сохраняем в профиль */
  if(P && P.update){
    try{ P.update({ achievements: [id] }); }catch(e){}
  }

  /* Ставим в очередь на показ */
  notifyQueue.push(a);
  if(!notifying) showNext();
}

/* ==================== УВЕДОМЛЕНИЕ ==================== */
function injectStyle(){
  if(document.getElementById('achStyle')) return;
  var st = document.createElement('style');
  st.id = 'achStyle';
  st.textContent =
  '#achPopup{position:fixed;top:70px;left:50%;transform:translateX(-50%) translateY(-120%);'+
  'z-index:99998;min-width:260px;max-width:90vw;padding:14px 18px;border-radius:16px;'+
  'background:rgba(15,15,15,.85);backdrop-filter:blur(50px) saturate(140%);'+
  '-webkit-backdrop-filter:blur(50px) saturate(140%);'+
  'border:1px solid rgba(232,232,90,.35);'+
  'box-shadow:0 20px 60px rgba(0,0,0,.7),0 0 40px rgba(232,232,90,.2);'+
  'display:flex;align-items:center;gap:12px;'+
  'font-family:-apple-system,Inter,sans-serif;color:#f0f0f0;'+
  'transition:transform .5s cubic-bezier(.34,1.56,.64,1),opacity .3s;opacity:0}'+
  '#achPopup.show{transform:translateX(-50%) translateY(0);opacity:1}'+
  '#achPopup .ach-icon{font-size:32px;line-height:1;flex:0 0 auto}'+
  '#achPopup .ach-txt{flex:1 1 auto;min-width:0}'+
  '#achPopup .ach-lbl{font-size:9px;letter-spacing:2.5px;color:#e8e85a;'+
  'text-transform:uppercase;font-weight:700;margin-bottom:3px}'+
  '#achPopup .ach-name{font-size:14px;font-weight:700;color:#f0f0f0;'+
  'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '#achPopup .ach-desc{font-size:10px;color:#8a8a8a;margin-top:2px;font-weight:500}';
  document.head.appendChild(st);
}

function showNext(){
  if(!notifyQueue.length){ notifying = false; return; }
  notifying = true;
  var a = notifyQueue.shift();

  injectStyle();
  var pop = document.createElement('div');
  pop.id = 'achPopup';
  pop.innerHTML =
    '<div class="ach-icon">'+a.icon+'</div>'+
    '<div class="ach-txt">'+
      '<div class="ach-lbl">Достижение получено</div>'+
      '<div class="ach-name">'+a.name+'</div>'+
      '<div class="ach-desc">'+a.desc+'</div>'+
    '</div>';
  document.body.appendChild(pop);

  setTimeout(function(){ pop.classList.add('show'); }, 50);

  try{ if(navigator.vibrate) navigator.vibrate([20,40,20,40,40]); }catch(e){}

  setTimeout(function(){
    pop.classList.remove('show');
    setTimeout(function(){
      pop.remove();
      showNext();
    }, 500);
  }, 3200);
}

/* ==================== ПРОВЕРКИ ==================== */
var stats = null;
var sessionStart = Date.now();

function initStats(){
  if(!P) return;
  var prof = P.getActive();
  if(!prof) return;
  stats = prof.stats || {
    totalDistance:0, totalDrives:0, enginesBroken:0,
    enginesTried:[], best0to100:null, bestQuarter:null,
    maxSpeed:0, totalPlayTime:0
  };
  if(!Array.isArray(stats.enginesTried)) stats.enginesTried = [];
  /* Восстанавливаем уже полученные достижения */
  var ach = prof.achievements || [];
  for(var i=0;i<ach.length;i++) unlocked[ach[i]] = true;
}

/* Периодическая проверка — 4 раза в секунду */
function tick(){
  var now = performance.now();
  var dt = (now - lastTick) / 1000;
  lastTick = now;
  if(dt > 1) dt = 1;
  if(dt < 0) dt = 0;

  if(!S || !stats){ requestAnimationFrame(tick); return; }
  if(!P || !P.isLoggedIn()){ requestAnimationFrame(tick); return; }

  var speed = Math.abs(S.speed || 0);

  /* 1. Дистанция */
  var distM = (speed / 3.6) * dt;
  if(distM > 0 && speed > 1){
    stats.totalDistance += distM;
    if(stats.totalDistance >= 1000 && !has('first_km')) unlock('first_km');
    if(stats.totalDistance >= 100000 && !has('km_100')) unlock('km_100');
    if(stats.totalDistance >= 1000000 && !has('km_1000')) unlock('km_1000');
  }

  /* 2. Первое движение */
  if(speed > 3 && !has('first_move')) unlock('first_move');

  /* 3. Скорость */
  if(speed > stats.maxSpeed) stats.maxSpeed = speed;
  if(speed >= 100 && !has('speed_100')) unlock('speed_100');
  if(speed >= 150 && !has('speed_150')) unlock('speed_150');
  if(speed >= 200 && !has('speed_200')) unlock('speed_200');
  if(speed >= 250 && !has('speed_250')) unlock('speed_250');

  /* 4. Первый запуск */
  if(S.running && !has('first_start')) unlock('first_start');

  /* 5. Отсечка */
  var E = S.engines && S.engines[S.engineType];
  if(E && S.rpm >= E.redline && S.running && !has('redline')) unlock('redline');

  /* 6. Перегрев */
  var t = S.engineTemp || 0;
  if(t >= 120 && !has('overheat')) unlock('overheat');

  /* 7. Клин */
  if(S.seized && !has('engine_seize')) unlock('engine_seize');

  /* 8. Поломка */
  if(S.broken && !has('engine_break')){
    unlock('engine_break');
    stats.enginesBroken = (stats.enginesBroken || 0) + 1;
    if(stats.enginesBroken >= 5) unlock('kill_5');
  }

  /* 9. Ремонт */
  if(S.broken === false && has('engine_break') && !has('first_repair')){
    unlock('first_repair');
  }

  /* 10. Холодный запуск — зимой с 1-го раза */
  if(S.running && S.weather === 'winter' && S.startAttempts === 0 && !has('cold_start')){
    unlock('cold_start');
  }

  /* 11. Трактор 1 км */
  if(S.engineType === 'mt82' && speed > 5){
    if(!stats._tractorDist) stats._tractorDist = 0;
    stats._tractorDist += distM;
    if(stats._tractorDist >= 1000 && !has('tractor_km')) unlock('tractor_km');
  }

  /* 12. Ванкель поездил */
  if(S.engineType === 'wankel' && speed > 5){
    if(!stats._wankelDist) stats._wankelDist = 0;
    stats._wankelDist += distM;
    if(stats._wankelDist >= 500 && !has('wankel_run')) unlock('wankel_run');
  }

  /* 13. dCi 1 км */
  if(S.engineType === 'dci' && speed > 5){
    if(!stats._dciDist) stats._dciDist = 0;
    stats._dciDist += distM;
    if(stats._dciDist >= 1000 && !has('dci_km')) unlock('dci_km');
  }

  /* 14. Коллекционер — 5 моторов */
  if(stats.enginesTried.length >= 5 && !has('collect_5')) unlock('collect_5');
  if(stats.enginesTried.length >= Object.keys(S.engines || {}).length && !has('collect_all')){
    unlock('collect_all');
  }

  /* 15. Время в игре */
  var playSeconds = (Date.now() - sessionStart) / 1000;
  var totalPlay = (stats.totalPlayTime || 0) + playSeconds;
  if(totalPlay >= 3600 && !has('play_1h')) unlock('play_1h');
  if(totalPlay >= 36000 && !has('play_10h')) unlock('play_10h');

  /* Сохранение раз в 10 секунд */
  if(now - lastSave > 10000){
    lastSave = now;
    saveProgress();
  }

  requestAnimationFrame(tick);
}

function saveProgress(){
  if(!P || !stats) return;
  try{
    P.update({ stats: stats });
  }catch(e){}
}

/* ==================== ТРИГГЕРЫ ИЗВНЕ ==================== */
/* timer.js может вызвать это после 0-100 */
window.DVS_ACH = {
  onSprint: function(seconds){
    if(seconds < 5 && !has('sprint_5')) unlock('sprint_5');
    if(seconds < 3 && !has('sprint_3')) unlock('sprint_3');
    if(P && stats){
      if(stats.best0to100 === null || seconds < stats.best0to100){
        stats.best0to100 = seconds;
        saveProgress();
      }
    }
  },
  /* Регистрируем использованный двигатель */
  trackEngine: function(type){
    if(!type || !stats) return;
    if(stats.enginesTried.indexOf(type) === -1){
      stats.enginesTried.push(type);
      saveProgress();
    }
  },
  list: LIST,
  has: has,
  unlocked: function(){ return Object.keys(unlocked); }
};

/* ==================== ОБЁРТКА setEngine ==================== */
function hookSetEngine(){
  if(!S || !S.setEngine){ setTimeout(hookSetEngine, 200); return; }
  if(S._achHooked) return;
  var orig = S.setEngine;
  S.setEngine = function(type){
    var r = orig.apply(this, arguments);
    if(window.DVS_ACH) window.DVS_ACH.trackEngine(type);
    return r;
  };
  S._achHooked = true;
}

/* ==================== СТАРТ ==================== */
function boot(){
  /* Ждём логина */
  window.addEventListener('dvs:login', function(){
    initStats();
    sessionStart = Date.now();
    if(S && S.engineType && window.DVS_ACH) window.DVS_ACH.trackEngine(S.engineType);
    requestAnimationFrame(tick);
  }, { once:false });

  /* Если уже вошли — стартуем сразу */
  if(P && P.isLoggedIn()){
    initStats();
    sessionStart = Date.now();
    if(S && S.engineType && window.DVS_ACH) window.DVS_ACH.trackEngine(S.engineType);
    requestAnimationFrame(tick);
  }

  hookSetEngine();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 500); });
} else {
  setTimeout(boot, 500);
}

/* ==================== ВЫХОД — сохраняем ==================== */
window.addEventListener('beforeunload', saveProgress);

console.log('achievements.js: загружено ' + LIST.length + ' достижений');
})();