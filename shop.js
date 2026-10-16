(function(){
"use strict";
var S=window.S;if(!S)return;

var KEY='dvs_save_v1';
function load(){
  try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}
}
function save(o){
  try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}
}
function refresh(){
  var s=load();
  window.DVS_SAVE=s;
  if(typeof window.DVS_SAVE_PERSIST==='function')window.DVS_SAVE_PERSIST();
}

/* ================== КАТАЛОГ ================== */
var ENGINES=[
  {id:'r4',       name:'R4',            price:0,    sub:'4 цилиндра · в ряд'},
  {id:'scooter',  name:'Скутер S1',     price:0,    sub:'1 цилиндр'},
  {id:'passatb3', name:'1.8 Passat B3', price:800,  sub:'4 цилиндра · бензин'},
  {id:'tdi',      name:'1.9 TDI',       price:1000, sub:'4 цилиндра · турбодизель'},
  {id:'bluebird', name:'2.0 CA20',      price:1200, sub:'4 цилиндра · Nissan'},
  {id:'dci',      name:'2.0 dCi',       price:1500, sub:'4 цилиндра · Renault'},
  {id:'mt82',     name:'МТЗ-82 Д-240',  price:2000, sub:'4 цилиндра · трактор'},
  {id:'galant6',  name:'2.0 V6',        price:3000, sub:'6 цилиндров · Mitsubishi'},
  {id:'i6',       name:'2JZ I6',        price:5000, sub:'6 цилиндров · Supra'},
  {id:'wankel',   name:'13B Renesis',   price:8000, sub:'Ванкель · 2 ротора'},
  {id:'v8',       name:'V12',           price:10000,sub:'12 цилиндров'},
  {id:'v16',      name:'V22',           price:20000,sub:'22 цилиндра'}
];

var TUNING=[
  {id:'turbo',    name:'Турбина',  max:3, costs:[500,2000,5000], sub:'+мощность'},
  {id:'exhaust',  name:'Выхлоп',   max:3, costs:[300,1000,3000], sub:'+звук и отклик'},
  {id:'tires',    name:'Шины',     max:3, costs:[400,1500,4000], sub:'+сцепление с дорогой'},
  {id:'injectors',name:'Форсунки', max:3, costs:[600,2500,6000], sub:'+экономия и мощность'}
];

/* ================== СТИЛИ ================== */
function ensureStyles(){
  if(document.getElementById('shopStyle'))return;
  var st=document.createElement('style');
  st.id='shopStyle';
  st.textContent=
  '#shopBtn{position:fixed;top:8px;right:66px;z-index:99997;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(12,12,12,.6);backdrop-filter:blur(30px);color:#f0d060;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.5)}'+
  '#shopBtn:hover{border-color:rgba(255,200,60,.4)}'+
  '#shopOv{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.65);backdrop-filter:blur(20px);display:none;align-items:center;justify-content:center;padding:16px}'+
  '#shopOv.on{display:flex}'+
  '#shopModal{width:100%;max-width:520px;max-height:92vh;overflow-y:auto;background:rgba(12,12,12,.9);border:1px solid rgba(255,255,255,.13);border-radius:20px;padding:16px;color:#e8e8e8;font:500 13px/1.4 "Segoe UI",sans-serif;box-shadow:0 24px 70px rgba(0,0,0,.7)}'+
  '#shopModal::-webkit-scrollbar{width:0}'+
  '#shopModal h2{margin:0 0 4px;font-size:16px;letter-spacing:3px;text-transform:uppercase;text-align:center;color:#f0d060}'+
  '#shopCoins{text-align:center;color:#ffd24a;font-weight:700;margin-bottom:12px;font-size:14px}'+
  '#shopTabs{display:flex;gap:8px;margin-bottom:12px}'+
  '.shopTab{flex:1;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(30,30,30,.5);color:#a0a8b0;font:600 12px/1 "Segoe UI",sans-serif;cursor:pointer}'+
  '.shopTab.on{background:rgba(255,200,60,.15);border-color:rgba(255,200,60,.5);color:#ffd24a}'+
  '.shopItem{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(25,25,25,.5);margin-bottom:8px}'+
  '.shopItem .t{flex:1;min-width:0}'+
  '.shopItem .l{display:block;font-weight:700;color:#e8e8e8;font-size:13px}'+
  '.shopItem .s{display:block;font-size:10px;color:#7a828a;margin-top:2px}'+
  '.shopItem .buy{flex:0 0 auto;padding:8px 12px;border-radius:10px;border:1px solid rgba(255,200,60,.5);background:rgba(255,200,60,.15);color:#ffd24a;font:700 11px/1 "Segoe UI",sans-serif;cursor:pointer}'+
  '.shopItem .buy.dis{opacity:.35;pointer-events:none}'+
  '.shopItem .buy.own{background:rgba(60,200,120,.15);border-color:rgba(60,200,120,.5);color:#5adf8f;pointer-events:none}'+
  '.shopClose{width:100%;height:44px;margin-top:10px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(30,30,30,.6);color:#c0c8d0;font:600 12px/1 "Segoe UI",sans-serif;letter-spacing:2px;cursor:pointer;text-transform:uppercase}'+
  '@media (max-width:600px){#shopBtn{top:auto;bottom:60px;right:12px}}';
  document.head.appendChild(st);
}

/* ================== ЛОГИКА ================== */
function getUnlocked(){var s=load();return s.unlocked||['r4','scooter'];}
function getTuning(){var s=load();return s.tuning||{};}
function getCoins(){var s=load();return s.coins||0;}

function buyEngine(id,price){
  var s=load();
  if((s.coins||0)<price)return false;
  s.coins=(s.coins||0)-price;
  s.unlocked=s.unlocked||['r4','scooter'];
  if(s.unlocked.indexOf(id)<0)s.unlocked.push(id);
  save(s);window.DVS_SAVE=s;
  if(window.DVS_SAVE_PERSIST)window.DVS_SAVE_PERSIST();
  return true;
}
function buyTuning(id,cost,lvl){
  var s=load();
  if((s.coins||0)<cost)return false;
  s.coins=(s.coins||0)-cost;
  s.tuning=s.tuning||{};
  s.tuning[id]=lvl;
  save(s);window.DVS_SAVE=s;
  if(window.DVS_SAVE_PERSIST)window.DVS_SAVE_PERSIST();
  return true;
}

function updateCoinsLabel(){
  var el=document.getElementById('shopCoinsVal');
  if(el)el.textContent=getCoins();
  var cv=document.getElementById('coinVal');
  if(cv)cv.textContent=getCoins();
  var sv=document.getElementById('shopVal');
  if(sv)sv.textContent=getCoins();
}

/* ================== ОКНО ================== */
function openShop(){
  var ov=document.getElementById('shopOv');
  if(!ov){
    ov=document.createElement('div');ov.id='shopOv';
    ov.innerHTML='<div id="shopModal"></div>';
    ov.addEventListener('click',function(e){if(e.target===ov)ov.classList.remove('on');});
    document.body.appendChild(ov);
  }
  ov.classList.add('on');
  renderShop();
}
function closeShop(){
  var ov=document.getElementById('shopOv');
  if(ov)ov.classList.remove('on');
}

var curTab='engines';
function renderShop(){
  var m=document.getElementById('shopModal');
  if(!m)return;
  updateCoinsLabel();
  var html='<h2>🛒 Магазин</h2>'+
           '<div id="shopCoins">💰 <span id="shopCoinsVal">'+getCoins()+'</span></div>'+
           '<div id="shopTabs">'+
             '<button class="shopTab'+(curTab==='engines'?' on':'')+'" data-tab="engines">🏁 Двигатели</button>'+
             '<button class="shopTab'+(curTab==='tuning'?' on':'')+'" data-tab="tuning">🔧 Тюнинг</button>'+
           '</div><div id="shopList"></div>'+
           '<button class="shopClose" id="shopCloseBtn">Закрыть</button>';
  m.innerHTML=html;

  var list=document.getElementById('shopList');
  if(curTab==='engines'){
    var un=getUnlocked();
    ENGINES.forEach(function(E){
      var own=un.indexOf(E.id)>=0;
      var dis=!own&&getCoins()<E.price;
      var el=document.createElement('div');
      el.className='shopItem';
      el.innerHTML='<div class="t"><span class="l">'+E.name+'</span><span class="s">'+E.sub+'</span></div>'+
        (own?'<button class="buy own">✓ ЕСТЬ</button>':'<button class="buy'+(dis?' dis':'')+'">💰 '+E.price+'</button>');
      var b=el.querySelector('.buy');
      if(!own)b.addEventListener('click',function(){
        if(buyEngine(E.id,E.price)){renderShop();}
      });
      list.appendChild(el);
    });
  } else {
    var tu=getTuning();
    TUNING.forEach(function(T){
      var lvl=tu[T.id]||0;
      var next=lvl<T.max?T.costs[lvl]:null;
      var dis=next!==null&&getCoins()<next;
      var el=document.createElement('div');
      el.className='shopItem';
      var lvlStr='Ур. '+lvl+' / '+T.max;
      var buyHtml;
      if(next===null)buyHtml='<button class="buy own">MAX</button>';
      else buyHtml='<button class="buy'+(dis?' dis':'')+'">💰 '+next+'</button>';
      el.innerHTML='<div class="t"><span class="l">'+T.name+' — '+lvlStr+'</span><span class="s">'+T.sub+'</span></div>'+buyHtml;
      var b2=el.querySelector('.buy');
      if(next!==null)b2.addEventListener('click',function(){
        if(buyTuning(T.id,next,lvl+1)){renderShop();}
      });
      list.appendChild(el);
    });
  }

  m.querySelectorAll('.shopTab').forEach(function(tb){
    tb.addEventListener('click',function(){
      curTab=tb.dataset.tab;renderShop();
    });
  });
  var cb=document.getElementById('shopCloseBtn');
  if(cb)cb.addEventListener('click',closeShop);
}

/* ================== КНОПКА ================== */
function ensureBtn(){
  if(document.getElementById('shopBtn'))return;
  var b=document.createElement('button');
  b.id='shopBtn';b.type='button';b.textContent='🛒';
  b.addEventListener('click',function(e){e.preventDefault();openShop();});
  document.body.appendChild(b);
}

function init(){ensureStyles();ensureBtn();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();

window.DVS_SHOP={open:openShop,close:closeShop};

console.log('shop.js: OK');
})();