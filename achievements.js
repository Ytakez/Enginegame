(function(){
"use strict";

/* ==================== СПИСОК ДОСТИЖЕНИЙ ==================== */
var LIST = [
  { id:'first_start',   icon:'🥇', name:'Первый запуск',      desc:'Заведи двигатель впервые' },
  { id:'first_move',    icon:'🚗', name:'С места',            desc:'Тронься с места' },
  { id:'first_km',      icon:'📏', name:'Первый километр',    desc:'Проехать 1 км' },
  { id:'first_repair',  icon:'🔧', name:'Механик',            desc:'Починить двигатель' },
  { id:'speed_100',     icon:'🏁', name:'Сотня',              desc:'Разогнаться до 100 км/ч' },
  { id:'speed_150',     icon:'🏎️', name:'Спорткар',           desc:'Разогнаться до 150 км/ч' },
  { id:'speed_200',     icon:'🚀', name:'Ракета',             desc:'Разогнаться до 200 км/ч' },
  { id:'speed_250',     icon:'⚡', name:'Молния',             desc:'Разогнаться до 250 км/ч' },
  { id:'sprint_5',      icon:'⏱️', name:'Спринтер',           desc:'0-100 быстрее 5 секунд' },
  { id:'sprint_3',      icon:'💨', name:'Быстрее ветра',      desc:'0-100 быстрее 3 секунд' },
  { id:'redline',       icon:'🔥', name:'Отжиг',              desc:'Докрути до отсечки' },
  { id:'overheat',      icon:'🌡️', name:'Горячий',            desc:'Нагрей до 120°C' },
  { id:'engine_break',  icon:'💥', name:'Перекрут',           desc:'Сломай двигатель' },
  { id:'engine_seize',  icon:'💀', name:'Клин',               desc:'Заклинь мотор' },
  { id:'kill_5',        icon:'☠️', name:'Убийца моторов',     desc:'Сломай 5 двигателей' },
  { id:'km_100',        icon:'🛣️', name:'Дальнобойщик',       desc:'Проехать 100 км' },
  { id:'km_1000',       icon:'🌍', name:'Путешественник',     desc:'Проехать 1000 км' },
  { id:'play_1h',       icon:'🕐', name:'Час за рулём',       desc:'1 час в игре' },
  { id:'play_10h',      icon:'👑', name:'Ветеран',            desc:'10 часов в игре' },
  { id:'cold_start',    icon:'❄️', name:'Мороз',              desc:'Заведи зимой с 1-го раза' },
  { id:'tractor_km',    icon:'🚜', name:'Тракторист',         desc:'Проедь 1 км на Д-240' },
  { id:'wankel_run',    icon:'🔺', name:'Роторный дух',       desc:'Поезди на 13B Renesis' },
  { id:'dci_km',        icon:'🇫🇷', name:'Француз',           desc:'Проедь 1 км на 2.0 dCi' },
  { id:'collect_5',     icon:'⚙️', name:'Коллекционер',       desc:'Попробуй 5 разных двигателей' },
  { id:'collect_all',   icon:'🏆', name:'Всеядный',           desc:'Попробуй ВСЕ двигатели' }
];

var ACH = {};
for(var i=0;i<LIST.length;i++)ACH[LIST[i].id]=LIST[i];

var unlocked = {};
var notifyQueue = [];
var notifying = false;
var lastTick = performance.now();
var lastSave = 0;
var sessionStart = Date.now();
var stats = null;
var _tickRunning = false;

function has(id){ return unlocked[id] === true; }

function unlock(id){
  if(!id || unlocked[id]) return;
  var a = ACH[id];
  if(!a) return;
  unlocked[id] = true;
  console.log('🏆 Достижение:', a.name);
  var P = window.DVS_PROFILE;
  if(P && P.update){
    try{ P.update({ achievements: [id] }); }catch(e){}
  }
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
  '#achPopup .ach-name{font-size:14px;font-weight:700;color:#f0f0f0}'+
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
    setTimeout(function(){ pop.remove(); showNext(); }, 500);
  }, 3200);
}

/* ==================== СТАТИСТИКА ==================== */
function initStats(){
  var P = window.DVS_PROFILE;
  if(!P) return false;
  var prof = P.getActive();
  if(!prof) return false;
  stats = prof.stats || {
    totalDistance:0, totalDrives:0, enginesBroken:0,
    enginesTried:[], best0to100:null, bestQuarter:null,
    maxSpeed:0, totalPlayTime:0
  };
  if(!Array.isArray(stats.enginesTried)) stats.enginesTried = [];
  var ach = prof.achievements || [];
  for(var i=0;i<ach.length;i++) unlocked[ach[i]] = true;
  console.log('achievements: stats инициализированы для', prof.name, 'уже получено:', ach.length);
  return true;
}

function saveProgress(){
  var P = window.DVS_PROFILE;
  if(!P || !stats) return;
  try{ P.update({ stats: stats }); }catch(e){}
}

/* ==================== ЦИКЛ ==================== */
function tick(){
  var now = performance.now();
  var dt = (now - lastTick) / 1000;
  lastTick = now;
  if(dt > 1) dt = 1;
  if(dt < 0) dt = 0;

  var S = window.S;
  var P = window.DVS_PROFILE;

  if(!S){ requestAnimationFrame(tick); return; }
  if(!P || !P.isLoggedIn || !P.isLoggedIn()){ requestAnimationFrame(tick); return; }
  if(!stats){ initStats(); requestAnimationFrame(tick); return; }

  var speed = Math.abs(S.speed || 0);

  /* Первое движение */
  if(speed > 3 && !has('first_move')) unlock('first_move');

  /* Дистанция */
  var distM = (speed / 3.6) * dt;
  if(distM > 0 && speed > 1){
    stats.totalDistance += distM;
    if(stats.totalDistance >= 1000 && !has('first_km')) unlock('first_km');
    if(stats.totalDistance >= 100000 && !has('km_100')) unlock('km_100');
    if(stats.totalDistance >= 1000000 && !has('km_1000')) unlock('km_1000');
  }

  /* Скорость */
  if(speed > stats.maxSpeed) stats.maxSpeed = speed;
  if(speed >= 100 && !has('speed_100')) unlock('speed_100');
  if(speed >= 150 && !has('speed_150')) unlock('speed_150');
  if(speed >= 200 && !has('speed_200')) unlock('speed_200');
  if(speed >= 250 && !has('speed_250')) unlock('speed_250');

  /* Запуск */
  if(S.running && !has('first_start')) unlock('first_start');

  /* Отсечка */
  var E = S.engines && S.engines[S.engineType];
  if(E && S.rpm >= E.redline && S.running && !has('redline')) unlock('redline');

  /* Перегрев */
  if((S.engineTemp || 0) >= 120 && !has('overheat')) unlock('overheat');

  /* Клин */
  if(S.seized && !has('engine_seize')) unlock('engine_seize');

  /* Поломка */
  if(S.broken && !has('engine_break')){
    unlock('engine_break');
    stats.enginesBroken = (stats.enginesBroken || 0) + 1;
    if(stats.enginesBroken >= 5) unlock('kill_5');
  }

  /* Ремонт */
  if(S.broken === false && has('engine_break') && !has('first_repair')){
    unlock('first_repair');
  }

  /* Зимой с 1 раза */
  if(S.running && S.weather === 'winter' && (S.startAttempts === 0) && !has('cold_start')){
    unlock('cold_start');
  }

  /* Трактор 1 км */
  if(S.engineType === 'mt82' && speed > 5){
    if(!stats._tractorDist) stats._tractorDist = 0;
    stats._tractorDist += distM;
    if(stats._tractorDist >= 1000 && !has('tractor_km')) unlock('tractor_km');
  }

  /* Ванкель */
  if(S.engineType === 'wankel' && speed > 5){
    if(!stats._wankelDist) stats._wankelDist = 0;
    stats._wankelDist += distM;
    if(stats._wankelDist >= 500 && !has('wankel_run')) unlock('wankel_run');
  }

  /* dCi 1 км */
  if(S.engineType === 'dci' && speed > 5){
    if(!stats._dciDist) stats._dciDist = 0;
    stats._dciDist += distM;
    if(stats._dciDist >= 1000 && !has('dci_km')) unlock('dci_km');
  }

  /* Коллекции */
  if(stats.enginesTried.length >= 5 && !has('collect_5')) unlock('collect_5');
  if(S.engines && stats.enginesTried.length >= Object.keys(S.engines).length && !has('collect_all')){
    unlock('collect_all');
  }

  /* Время в игре */
  var playSeconds = (Date.now() - sessionStart) / 1000;
  var totalPlay = (stats.totalPlayTime || 0) + playSeconds;
  if(totalPlay >= 3600 && !has('play_1h')) unlock('play_1h');
  if(totalPlay >= 36000 && !has('play_10h')) unlock('play_10h');

  /* Сохранение раз в 10 сек */
  if(now - lastSave > 10000){
    lastSave = now;
    saveProgress();
  }

  requestAnimationFrame(tick);
}

/* ==================== API ==================== */
window.DVS_ACH = {
  onSprint: function(seconds){
    if(seconds < 5 && !has('sprint_5')) unlock('sprint_5');
    if(seconds < 3 && !has('sprint_3')) unlock('sprint_3');
    if(stats){
      if(stats.best0to100 === null || seconds < stats.best0to100){
        stats.best0to100 = seconds;
        saveProgress();
      }
    }
  },
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

/* ==================== СТАРТ ==================== */
function startTick(){
  if(_tickRunning) return;
  _tickRunning = true;
  lastTick = performance.now();
  requestAnimationFrame(tick);
  console.log('achievements: tick запущен');
}

function boot(){
  console.log('achievements: boot');
  /* Если уже залогинен */
  var P = window.DVS_PROFILE;
  if(P && P.isLoggedIn && P.isLoggedIn()){
    if(initStats()){
      sessionStart = Date.now();
      var S = window.S;
      if(S && S.engineType) window.DVS_ACH.trackEngine(S.engineType);
      startTick();
    }
  }

  /* Слушаем логин */
  window.addEventListener('dvs:login', function(){
    console.log('achievements: получен dvs:login');
    if(initStats()){
      sessionStart = Date.now();
      var S = window.S;
      if(S && S.engineType) window.DVS_ACH.trackEngine(S.engineType);
      startTick();
    }
  });
}

/* Запускаем как можно скорее */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 100); });
} else {
  setTimeout(boot, 100);
}
setTimeout(boot, 1000);
setTimeout(boot, 2500);

/* Сохранение */
window.addEventListener('beforeunload', saveProgress);

console.log('achievements.js: загружено ' + LIST.length + ' достижений');
})();