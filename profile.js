(function(){
"use strict";

var MAX_PROFILES = 3;
var KEY = function(id){ return 'dvs_profile_' + id; };
var ACTIVE_KEY = 'dvs_active_profile';

/* ==================== УТИЛИТЫ ==================== */
function simpleHash(str){
  if(!str) return null;
  var h = 5381;
  for(var i = 0; i < str.length; i++){
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h | 0;
  }
  return 'h' + (h >>> 0).toString(36) + '_' + str.length;
}

function loadRaw(id){
  try{
    var raw = localStorage.getItem(KEY(id));
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}

function saveRaw(id, data){
  try{
    localStorage.setItem(KEY(id), JSON.stringify(data));
    return true;
  }catch(e){
    console.warn('profile save error:', e);
    return false;
  }
}

function emptyProfile(id){
  return {
    id: id,
    name: '',
    pinHash: null,
    createdAt: 0,
    lastLogin: 0,
    stats: {
      totalDistance: 0,
      totalDrives: 0,
      enginesBroken: 0,
      enginesTried: [],
      best0to100: null,
      bestQuarter: null,
      maxSpeed: 0,
      totalPlayTime: 0
    },
    achievements: [],
    settings: {
      engineType: 'r4',
      weather: 'summer',
      lang: 'ru',
      sound: true
    }
  };
}

/* Защита от битых данных */
function normalize(p){
  if(!p) return null;
  var base = emptyProfile(p.id || 1);
  p.name = (typeof p.name === 'string' && p.name.trim()) ? p.name.trim().substring(0,14) : 'Игрок ' + (p.id||1);
  p.pinHash = p.pinHash || null;
  p.createdAt = p.createdAt || Date.now();
  p.lastLogin = p.lastLogin || 0;
  p.stats = p.stats || {};
  for(var k in base.stats){
    if(p.stats[k] === undefined) p.stats[k] = base.stats[k];
  }
  if(!Array.isArray(p.stats.enginesTried)) p.stats.enginesTried = [];
  if(!Array.isArray(p.achievements)) p.achievements = [];
  p.settings = p.settings || {};
  for(var k2 in base.settings){
    if(p.settings[k2] === undefined) p.settings[k2] = base.settings[k2];
  }
  return p;
}

/* ==================== API ==================== */
var P = window.DVS_PROFILE = {};

P.MAX = MAX_PROFILES;

/* Получить все профили (3 штуки, может быть null) */
P.getAll = function(){
  var list = [];
  for(var i = 1; i <= MAX_PROFILES; i++){
    var p = loadRaw(i);
    list.push(p ? normalize(p) : null);
  }
  return list;
};

/* Получить конкретный профиль */
P.get = function(id){
  var p = loadRaw(id);
  return p ? normalize(p) : null;
};

/* Создать профиль */
P.create = function(id, name, pin){
  if(id < 1 || id > MAX_PROFILES) return {ok:false, err:'Неверный слот'};
  if(loadRaw(id)) return {ok:false, err:'Слот занят'};
  name = (name || '').trim().substring(0,14);
  if(!name) return {ok:false, err:'Введи имя'};

  var p = emptyProfile(id);
  p.name = name;
  p.pinHash = pin ? simpleHash(pin) : null;
  p.createdAt = Date.now();
  p.lastLogin = Date.now();
  saveRaw(id, p);
  return {ok:true, profile:p};
};

/* Проверить PIN */
P.checkPin = function(id, pin){
  var p = loadRaw(id);
  if(!p) return {ok:false, err:'Профиль не найден'};
  if(!p.pinHash) return {ok:true}; /* без PIN */
  if(simpleHash(pin) !== p.pinHash) return {ok:false, err:'Неверный PIN'};
  return {ok:true};
};

/* Войти в профиль */
P.login = function(id, pin){
  var r = P.checkPin(id, pin);
  if(!r.ok) return r;
  try{ localStorage.setItem(ACTIVE_KEY, String(id)); }catch(e){}
  var p = loadRaw(id);
  if(p){
    p.lastLogin = Date.now();
    saveRaw(id, p);
  }
  return {ok:true, profile:normalize(p)};
};

/* Выйти из профиля */
P.logout = function(){
  try{ localStorage.removeItem(ACTIVE_KEY); }catch(e){}
};

/* Активный профиль */
P.getActiveId = function(){
  try{
    var v = localStorage.getItem(ACTIVE_KEY);
    if(!v) return null;
    var id = parseInt(v, 10);
    if(id < 1 || id > MAX_PROFILES) return null;
    return id;
  }catch(e){ return null; }
};

P.getActive = function(){
  var id = P.getActiveId();
  if(!id) return null;
  return P.get(id);
};

/* Есть ли активный профиль */
P.isLoggedIn = function(){
  return !!P.getActiveId();
};

/* Сохранить активный профиль */
P.saveActive = function(){
  var id = P.getActiveId();
  if(!id) return false;
  var p = P._cache;
  if(!p) return false;
  p.lastLogin = p.lastLogin || Date.now();
  return saveRaw(id, p);
};

/* Обновить данные активного профиля */
P.update = function(patch){
  var id = P.getActiveId();
  if(!id) return false;
  var p = loadRaw(id);
  if(!p) return false;
  p = normalize(p);

  /* Смердживаем */
  if(patch.stats){
    for(var k in patch.stats){
      if(k === 'enginesTried' && Array.isArray(patch.stats[k])){
        for(var j=0; j<patch.stats[k].length; j++){
          var e = patch.stats[k][j];
          if(p.stats.enginesTried.indexOf(e) === -1) p.stats.enginesTried.push(e);
        }
      } else {
        p.stats[k] = patch.stats[k];
      }
    }
  }
  if(patch.achievements && Array.isArray(patch.achievements)){
    for(var a=0; a<patch.achievements.length; a++){
      var ach = patch.achievements[a];
      if(p.achievements.indexOf(ach) === -1) p.achievements.push(ach);
    }
  }
  if(patch.settings){
    for(var s in patch.settings){
      p.settings[s] = patch.settings[s];
    }
  }
  return saveRaw(id, p);
};

/* Удалить профиль */
P.remove = function(id){
  if(id < 1 || id > MAX_PROFILES) return false;
  try{
    localStorage.removeItem(KEY(id));
    if(P.getActiveId() === id) P.logout();
    return true;
  }catch(e){ return false; }
};

/* Сменить PIN */
P.changePin = function(id, oldPin, newPin){
  var r = P.checkPin(id, oldPin);
  if(!r.ok) return r;
  var p = loadRaw(id);
  if(!p) return {ok:false, err:'Профиль не найден'};
  p.pinHash = newPin ? simpleHash(newPin) : null;
  saveRaw(id, p);
  return {ok:true};
};

/* Полная очистка (для отладки) */
P.clearAll = function(){
  for(var i = 1; i <= MAX_PROFILES; i++) P.remove(i);
  P.logout();
};

console.log('profile.js: загружен, максимум ' + MAX_PROFILES + ' профилей');
})();