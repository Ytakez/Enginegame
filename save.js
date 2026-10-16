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

/* ==== БЕЙДЖ МОНЕТ ==== */
function ensureBadge(){
  if(document.getElementById('coinBadge'))return;
  var b=document.createElement('div');
  b.id='coinBadge';
  b.innerHTML='<span class="cb-ico">💰</span><span class="cb-val" id="coinVal">0</span>';
  document.body.appendChild(b);
}
function ensureBadgeStyle(){
  if(document.getElementById('coinBadgeStyle'))return;
  var st=document.createElement('style');
  st.id='coinBadgeStyle';
  st.textContent=
  '#coinBadge{position:fixed;top:8px;right:120px;z-index:99997;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:22px;background:rgba(255,200,60,.15);border:1px solid rgba(255,200,60,.5);color:#ffd24a;font:700 14px/1 "Segoe UI",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.4);pointer-events:none;transition:transform .15s}'+
  '#coinBadge .cb-ico{font-size:18px}'+
  '#coinBadge .cb-val{min-width:24px;text-align:center}'+
  '#coinBadge.pulse{transform:scale(1.15)}'+
  '#coinFloat{position:fixed;z-index:99998;font:700 20px/1 "Segoe UI",sans-serif;color:#ffd24a;pointer-events:none;text-shadow:0 2px 8px rgba(0,0,0,.7);opacity:0;transition:opacity .2s,transform 1s}'+
  '#coinFloat.go{opacity:1;transform:translateY(-40px)}'+
  '@media (max-width:600px){#coinBadge{top:auto;bottom:12px;right:12px;font-size:12px;padding:6px 10px}#coinBadge .cb-ico{font-size:15px}}';
  document.head.appendChild(st);
}

function updateBadge(){
  var v=document.getElementById('coinVal');
  if(v)v.textContent=String(save.coins);
}

function pulse(){
  var b=document.getElementById('coinBadge');
  if(!b)return;
  b.classList.add('pulse');
  setTimeout(function(){b.classList.remove('pulse');},150);
}

function floatText(txt){
  var b=document.getElementById('coinBadge');
  if(!b)return;
  var r=b.getBoundingClientRect();
  var f=document.createElement('div');
  f.id='coinFloat';
  f.textContent=txt;
  f.style.left=(r.left+r.width/2-20)+'px';
  f.style.top=(r.top)+'px';
  document.body.appendChild(f);
  requestAnimationFrame(function(){f.classList.add('go');});
  setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f);},1200);
}

/* ==== АВТОЗАРАБОТОК ==== */
function rateFor(speed){
  var s=Math.abs(speed||0);
  if(s>=150)return 8;
  if(s>=100)return 5;
  if(s>=50)return 2;
  if(s>=5)return 1;
  return 0;
}

var acc=0,last=performance.now(),pendingFloats=0;

function tick(now){
  var dt=(now-last)/1000;last=now;
  if(dt>0.5)dt=0.5;

  if(S.running&&!S.stalled&&!S.broken){
    var rate=rateFor(S.speed);
    if(rate>0){
      acc+=rate*dt;
      /* целые монеты */
      var gain=Math.floor(acc);
      if(gain>0){
        acc-=gain;
        save.coins+=gain;
        persist();
        updateBadge();
        pulse();
        pendingFloats+=gain;
        if(pendingFloats>=1){
          floatText('+'+pendingFloats);
          pendingFloats=0;
        }
      }
    } else { acc=0; }
  } else { acc=0; }

  /* рекорд скорости */
  var sp=Math.abs(S.speed||0);
  if(sp>save.bestSpeed){save.bestSpeed=sp;}

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

/* ==== ИНТЕРФЕЙС ==== */
function init(){
  ensureBadge();ensureBadgeStyle();updateBadge();
  requestAnimationFrame(tick);
  watchStart();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();

console.log('save.js: OK, coins='+save.coins);
})();