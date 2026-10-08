(function(){
"use strict";
var LANG_KEY='dvs_lang';
var LANGS={
  ru:{label:'🇷🇺 Русский',title:'Двигатель внутреннего сгорания',clutch:'СЦЕПЛЕНИЕ',brake:'ТОРМОЗ',gas:'ГАЗ',hold:'держать',ignition:'Зажигание',speed:'Скорость',gear:'Передача',settingsTitle:'Настройки',language:'Язык',languageSelect:'Выбрать язык',engine:'Двигатель',engineSelect:'Выбрать двигатель',weather:'Погода',weatherSelect:'Выбрать погоду',sound:'Звук',soundOn:'Включён',soundOff:'Выключен',back:'Назад',close:'Закрыть'},
  uk:{label:'🇺🇦 Українська',title:'Двигун внутрішнього згоряння',clutch:'ЗЧЕПЛЕННЯ',brake:'ГАЛЬМО',gas:'ГАЗ',hold:'тримати',ignition:'Запалювання',speed:'Швидкість',gear:'Передача',settingsTitle:'Налаштування',language:'Мова',languageSelect:'Вибрати мову',engine:'Двигун',engineSelect:'Вибрати двигун',weather:'Погода',weatherSelect:'Вибрати погоду',sound:'Звук',soundOn:'Увімкнено',soundOff:'Вимкнено',back:'Назад',close:'Закрити'},
  en:{label:'🇬🇧 English',title:'Internal Combustion Engine',clutch:'CLUTCH',brake:'BRAKE',gas:'THROTTLE',hold:'hold',ignition:'Ignition',speed:'Speed',gear:'Gear',settingsTitle:'Settings',language:'Language',languageSelect:'Choose language',engine:'Engine',engineSelect:'Choose engine',weather:'Weather',weatherSelect:'Choose weather',sound:'Sound',soundOn:'On',soundOff:'Off',back:'Back',close:'Close'}
};
var ENGINES_INFO=[
  {id:'scooter',label:'🛵 Скутер (S1)',sub:'1 цилиндр · 4-тактный · АКПП'},
  {id:'tdi',label:'🚐 1.9 TDI',sub:'4 цилиндра · турбодизель · Passat B5'},
  {id:'mt82',label:'🚜 МТЗ-82 (Д-240)',sub:'4 цилиндра · тракторный дизель'},
  {id:'passatb3',label:'🚙 1.8 B3',sub:'4 цилиндра · бензин · Passat B3'},
  {id:'bluebird',label:'🚗 2.0 CA20',sub:'4 цилиндра · бензин · Bluebird'},
  {id:'galant6',label:'🚘 2.0 V6',sub:'6 цилиндров · Galant 6'},
  {id:'r4',label:'🚗 R4',sub:'4 цилиндра · в ряд'},
  {id:'v8',label:'🏎️ V12',sub:'12 цилиндров · V-образный'},
  {id:'v16',label:'🔥 V22',sub:'22 цилиндра · монстр'}
];
var WEATHERS=[
  {id:'summer',label:'☀️ Лето',sub:'+25°C · легко заводится'},
  {id:'autumn',label:'🍂 Осень',sub:'+8°C · чуть холоднее'},
  {id:'winter',label:'❄️ Зима',sub:'-15°C · тяжёлый пуск'}
];
var curLang='ru';
try{curLang=localStorage.getItem(LANG_KEY)||'ru';}catch(e){}
if(!LANGS[curLang])curLang='ru';

function t(k){var L=LANGS[curLang]||LANGS.ru;return L[k]||(LANGS.ru[k]||k);}

/* СТИЛИ */
function injectStyles(){
  if(document.getElementById('settingsStyle'))return;
  var st=document.createElement('style');
  st.id='settingsStyle';
  st.textContent='.settings-btn{position:fixed;top:8px;left:8px;z-index:99998;width:44px;height:44px;border-radius:50%;border:1px solid #263547;background:rgba(20,28,38,.9);color:#8fd8ff;font-size:20px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;padding:0}'+
  '.settings-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,10,15,.94);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit}'+
  '.settings-modal{width:100%;max-width:400px;max-height:92vh;overflow-y:auto;background:linear-gradient(180deg,#151d27,#0d131a);border:1px solid #22303f;border-radius:16px;padding:18px;color:#dbe4ee;box-shadow:0 20px 60px rgba(0,0,0,.7)}'+
  '.settings-modal h2{font-size:14px;letter-spacing:3px;color:#8fd8ff;text-transform:uppercase;margin:0 0 16px;font-weight:800;text-align:center}'+
  '.settings-item{width:100%;min-height:54px;margin-bottom:8px;border-radius:10px;border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);color:#8ea4bd;font:700 13px/1.3 inherit;cursor:pointer;padding:10px 14px;text-align:left;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between;gap:10px}'+
  '.settings-item .txt{flex:1 1 auto;min-width:0}'+
  '.settings-item .lbl{display:block;font-size:14px;color:inherit;font-weight:700}'+
  '.settings-item .sub{display:block;font-size:10px;color:#5d7189;font-weight:600;margin-top:3px;letter-spacing:.5px}'+
  '.settings-item .arrow{color:#8ea4bd;font-size:18px;flex:0 0 auto}'+
  '.settings-item .check{color:#43c98a;font-size:18px;opacity:0;flex:0 0 auto}'+
  '.settings-item.on{border-color:#43c98a;color:#e6fff3;background:linear-gradient(180deg,#1c3d2e,#0e231a)}'+
  '.settings-item.on .check{opacity:1}.settings-item.on .sub{color:#7bc9a3}'+
  '.sound-toggle{flex:0 0 auto;width:64px;height:32px;border-radius:16px;position:relative;border:1px solid #2c3e52;background:#0e161e;cursor:pointer}'+
  '.sound-toggle.on{border-color:#43c98a;background:#1c3d2e}'+
  '.sound-toggle .knob{position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;background:#5d7189;transition:left .15s,background .15s}'+
  '.sound-toggle.on .knob{left:34px;background:#43c98a}'+
  '.settings-close{width:100%;height:46px;border-radius:10px;border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);color:#8ea4bd;font:800 12px/1 inherit;letter-spacing:1.5px;cursor:pointer;text-transform:uppercase;touch-action:manipulation;margin-top:12px}'+
  '.settings-back{width:100%;height:42px;border-radius:10px;border:1px solid #2c3e52;background:rgba(15,22,30,.8);color:#8ea4bd;font:700 12px/1 inherit;letter-spacing:1.5px;cursor:pointer;text-transform:uppercase;touch-action:manipulation;margin-bottom:14px}';
  document.head.appendChild(st);
}

/* КНОПКА — создаём сразу, до всех проверок */
function addSettingsButton(){
  if(document.getElementById('settingsBtn'))return;
  var btn=document.createElement('button');
  btn.id='settingsBtn';
  btn.type='button';
  btn.className='settings-btn';
  btn.textContent='⚙️';
  btn.title=t('settingsTitle');
  btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openMain();});
  document.body.appendChild(btn);
}

function makeOverlay(){var ov=document.createElement('div');ov.className='settings-overlay';ov.addEventListener('click',function(e){if(e.target===ov)closeAll();});return ov;}
function makeModal(){var m=document.createElement('div');m.className='settings-modal';return m;}
function closeAll(){var ex=document.querySelector('.settings-overlay');if(ex)ex.remove();}

function applyLang(){
  var h=document.querySelector('header');if(h)h.textContent=t('title');
  var map={'pClutch':'clutch','pBrake':'brake','pGas':'gas'};
  for(var id in map){var el=document.getElementById(id);if(!el)continue;var spans=el.querySelectorAll('span');for(var i=0;i<spans.length;i++){if(spans[i].classList.contains('icon'))continue;if(spans[i].classList.contains('sub')){spans[i].textContent=t('hold');continue;}spans[i].textContent=t(map[id]);}}
  var ro=document.querySelectorAll('.ro .lbl');if(ro.length>=2){ro[0].textContent=t('speed');ro[1].textContent=t('gear');}
}

function openMain(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='⚙ '+t('settingsTitle');m.appendChild(h);
  var S=window.S;

  /* Двигатель */
  var curName=S?(S.engines[S.engineType]||{}).name||'R4':'R4';
  var eb=document.createElement('button');
  eb.type='button';eb.className='settings-item';
  eb.innerHTML='<div class="txt"><span class="lbl">'+t('engineSelect')+'</span><span class="sub">'+curName+'</span></div><span class="arrow">›</span>';
  eb.addEventListener('click',function(){closeAll();openPicker();});
  m.appendChild(eb);

  /* Погода */
  var curW=S?S.weather:'summer';
  var wObj=WEATHERS.filter(function(x){return x.id===curW;})[0]||WEATHERS[0];
  var wb=document.createElement('button');
  wb.type='button';wb.className='settings-item';
  wb.innerHTML='<div class="txt"><span class="lbl">'+t('weatherSelect')+'</span><span class="sub">'+wObj.label+'</span></div><span class="arrow">›</span>';
  wb.addEventListener('click',function(){closeAll();openWeatherPicker();});
  m.appendChild(wb);

  /* Язык */
  var ln=(LANGS[curLang]||LANGS.ru).label;
  var lb=document.createElement('button');
  lb.type='button';lb.className='settings-item';
  lb.innerHTML='<div class="txt"><span class="lbl">'+t('languageSelect')+'</span><span class="sub">'+ln+'</span></div><span class="arrow">›</span>';
  lb.addEventListener('click',function(){closeAll();openLangPicker();});
  m.appendChild(lb);

  /* Звук */
  var soundOn=false;
  if(window.DVS_SOUND&&window.DVS_SOUND.isMuted){soundOn=!window.DVS_SOUND.isMuted();}
  var sb=document.createElement('button');
  sb.type='button';sb.className='settings-item';
  sb.innerHTML='<div class="txt"><span class="lbl">'+t('sound')+'</span><span class="sub" id="soundSub">'+(soundOn?t('soundOn'):t('soundOff'))+'</span></div><div class="sound-toggle'+(soundOn?' on':'')+'" id="soundToggle"><div class="knob"></div></div>';
  sb.addEventListener('click',function(){
    if(!window.DVS_SOUND)return;
    var now=window.DVS_SOUND.toggleMute();
    var on=!now;
    var tg=document.getElementById('soundToggle');
    var sub=document.getElementById('soundSub');
    if(tg)tg.classList.toggle('on',on);
    if(sub)sub.textContent=on?t('soundOn'):t('soundOff');
    try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}
  });
  m.appendChild(sb);

  /* Закрыть */
  var cb=document.createElement('button');
  cb.type='button';cb.className='settings-close';cb.textContent=t('close');
  cb.addEventListener('click',closeAll);m.appendChild(cb);

  document.body.appendChild(ov);
}

function openPicker(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='🏁 '+t('engine');m.appendChild(h);
  var back=document.createElement('button');
  back.type='button';back.className='settings-back';back.textContent='‹ '+t('back');
  back.addEventListener('click',function(){closeAll();openMain();});m.appendChild(back);
  var S=window.S;var cur=S?S.engineType:'r4';
  ENGINES_INFO.forEach(function(E){
    var b=document.createElement('button');
    b.type='button';b.className='settings-item'+(E.id===cur?' on':'');
    b.innerHTML='<div class="txt"><span class="lbl">'+E.label+'</span><span class="sub">'+E.sub+'</span></div><span class="check">✓</span>';
    b.addEventListener('click',function(){
      if(S&&S.setEngine)S.setEngine(E.id);
      var all=m.querySelectorAll('.settings-item');
      for(var i=0;i<all.length;i++)all[i].classList.remove('on');
      b.classList.add('on');
      try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
    });
    m.appendChild(b);
  });
  var cb=document.createElement('button');
  cb.type='button';cb.className='settings-close';cb.textContent=t('close');
  cb.addEventListener('click',closeAll);m.appendChild(cb);
  document.body.appendChild(ov);
}

function openWeatherPicker(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='🌦 '+t('weather');m.appendChild(h);
  var back=document.createElement('button');
  back.type='button';back.className='settings-back';back.textContent='‹ '+t('back');
  back.addEventListener('click',function(){closeAll();openMain();});m.appendChild(back);
  var S=window.S;var cur=S?S.weather:'summer';
  WEATHERS.forEach(function(W){
    var b=document.createElement('button');
    b.type='button';b.className='settings-item'+(W.id===cur?' on':'');
    b.innerHTML='<div class="txt"><span class="lbl">'+W.label+'</span><span class="sub">'+W.sub+'</span></div><span class="check">✓</span>';
    b.addEventListener('click',function(){
      if(S&&S.setWeather)S.setWeather(W.id);
      var all=m.querySelectorAll('.settings-item');
      for(var i=0;i<all.length;i++)all[i].classList.remove('on');
      b.classList.add('on');
      try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
    });
    m.appendChild(b);
  });
  var cb=document.createElement('button');
  cb.type='button';cb.className='settings-close';cb.textContent=t('close');
  cb.addEventListener('click',closeAll);m.appendChild(cb);
  document.body.appendChild(ov);
}

function openLangPicker(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='🌐 '+t('language');m.appendChild(h);
  var back=document.createElement('button');
  back.type='button';back.className='settings-back';back.textContent='‹ '+t('back');
  back.addEventListener('click',function(){closeAll();openMain();});m.appendChild(back);
  Object.keys(LANGS).forEach(function(code){
    var b=document.createElement('button');
    b.type='button';b.className='settings-item'+(code===curLang?' on':'');
    b.innerHTML='<div class="txt"><span class="lbl">'+LANGS[code].label+'</span></div><span class="check">✓</span>';
    b.addEventListener('click',function(){
      curLang=code;
      try{localStorage.setItem(LANG_KEY,code);}catch(e){}
      applyLang();
      var all=m.querySelectorAll('.settings-item');
      for(var i=0;i<all.length;i++)all[i].classList.remove('on');
      b.classList.add('on');
      h.textContent='🌐 '+t('language');
      back.textContent='‹ '+t('back');
      try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
    });
    m.appendChild(b);
  });
  var cb=document.createElement('button');
  cb.type='button';cb.className='settings-close';cb.textContent=t('close');
  cb.addEventListener('click',closeAll);m.appendChild(cb);
  document.body.appendChild(ov);
}

/* ИНИЦИАЛИЗАЦИЯ — жёсткая */
function init(){
  injectStyles();
  addSettingsButton();
  try{applyLang();}catch(e){}
  var b=document.getElementById('engBadge');
  var S=window.S;
  if(b&&S&&S.engines&&S.engines[S.engineType])b.textContent=S.engines[S.engineType].name;
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
else{init();}
/* Страховка — на случай если DOM ещё не готов */
setTimeout(init,500);
setTimeout(init,1500);
})();