(function(){
"use strict";
var S=window.S;if(!S)return;

var KEY='dvs_save_v1';

/* ==== СОХРАНЕНИЕ НАСТРОЕК ==== */
function load(){
  try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}
}
function save(o){
  try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}
}

var data=load();
window.DVS_SAVE=data;
window.DVS_SAVE_PERSIST=function(){save(data);};

/* ==== ВОССТАНОВЛЕНИЕ ПРИ СТАРТЕ ==== */
function restore(){
  if(data.engine&&S.setEngine){
    try{S.setEngine(data.engine);}catch(e){}
  }
  if(data.weather&&S.setWeather){
    try{S.setWeather(data.weather);}catch(e){}
  }
  if(data.gear!==undefined)S.gear=data.gear;
}

/* ==== СЛЕЖЕНИЕ ЗА ИЗМЕНЕНИЯМИ ==== */
var lastEngine=null,lastWeather=null,lastGear=null;
function watch(){
  if(S.engineType&&S.engineType!==lastEngine){
    lastEngine=S.engineType;
    data.engine=S.engineType;
    save(data);
  }
  if(S.weather&&S.weather!==lastWeather){
    lastWeather=S.weather;
    data.weather=S.weather;
    save(data);
  }
  if(S.gear!==undefined&&S.gear!==lastGear){
    lastGear=S.gear;
    data.gear=S.gear;
    save(data);
  }
  setTimeout(watch,500);
}

/* ==== ЗАПУСК ==== */
function init(){
  restore();
  setTimeout(watch,1000);
  console.log('save.js: OK, сохраняю движок/погоду/передачу');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();