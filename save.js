(function(){
"use strict";
var S=window.S;if(!S)return;

var KEY='dvs_save_v1';
var save={coins:0,totalKm:0,starts:0,bestSpeed:0};

try{
  var raw=localStorage.getItem(KEY);
  if(raw)save=JSON.parse(raw);
}catch(e){}

function persist(){
  try{localStorage.setItem(KEY,JSON.stringify(save));}catch(e){}
}
window.DVS_SAVE=save;
window.DVS_SAVE_PERSIST=persist;

/* ==== АВТОЗАРАБОТОК (без бейджа) ==== */
function rateFor(speed){
  var s=Math.abs(speed||0);
  if(s>=150)return 8;
  if(s>=100)return 5;
  if(s>=50)return 2;
  if(s>=5)return 1;
  return 0;
}

var acc=0,last=performance.now();

function tick(now){
  var dt=(now-last)/1000;last=now;
  if(dt>0.5)dt=0.5;

  if(S.running&&!S.stalled&&!S.broken){
    var rate=rateFor(S.speed);
    if(rate>0){
      acc+=rate*dt;
      var gain=Math.floor(acc);
      if(gain>0){
        acc-=gain;
        save.coins+=gain;
        persist();
        /* обновить значение в магазине, если открыт */
        var sv=document.getElementById('shopCoinsVal');
        if(sv)sv.textContent=save.coins;
      }
    } else { acc=0; }
  } else { acc=0; }

  var sp=Math.abs(S.speed||0);
  if(sp>save.bestSpeed)save.bestSpeed=sp;

  requestAnimationFrame(tick);
}

/* ==== СЧЁТЧИК ЗАПУСКОВ ==== */
var wasRunning=false;
function watchStart(){
  if(S.running&&!wasRunning){
    save.starts=(save.starts||0)+1;
    persist();
  }
  wasRunning=S.running;
  setTimeout(watchStart,500);
}

/* ==== СТАРТ ==== */
function init(){
  requestAnimationFrame(tick);
  watchStart();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();

console.log('save.js: OK (без бейджа), coins='+save.coins);
})();