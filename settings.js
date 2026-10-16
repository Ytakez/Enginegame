(function(){
"use strict";
var LANG_KEY='dvs_lang';
var LANGS={
  ru:{label:'🇷🇺 Русский',title:'Двигатель внутреннего сгорания',settingsTitle:'Настройки',engine:'Двигатель',engineSelect:'Выбрать двигатель',weather:'Погода',weatherSelect:'Выбрать погоду',language:'Язык',languageSelect:'Выбрать язык',sound:'Звук',soundOn:'Включён',soundOff:'Выключен',controls:'Управление',controlsSelect:'Режим управления',pc:'ПК (клавиатура)',phone:'Телефон (сенсор)',tablet:'Планшет (сенсор)',auto:'Авто',back:'Назад',close:'Закрыть',other:'Другое',timer:'Секундомер 0-100',timerBest:'Лучшее время',timerReset:'Сбросить лучшее'},
  uk:{label:'🇺🇦 Українська',title:'Двигун внутрішнього згоряння',settingsTitle:'Налаштування',engine:'Двигун',engineSelect:'Вибрати двигун',weather:'Погода',weatherSelect:'Вибрати погоду',language:'Мова',languageSelect:'Вибрати мову',sound:'Звук',soundOn:'Увімкнено',soundOff:'Вимкнено',controls:'Керування',controlsSelect:'Режим керування',pc:'ПК (клавіатура)',phone:'Телефон (сенсор)',tablet:'Планшет (сенсор)',auto:'Авто',back:'Назад',close:'Закрити',other:'Інше',timer:'Секундомір 0-100',timerBest:'Кращий час',timerReset:'Скинути кращий'},
  en:{label:'🇬🇧 English',title:'Internal Combustion Engine',settingsTitle:'Settings',engine:'Engine',engineSelect:'Choose engine',weather:'Weather',weatherSelect:'Choose weather',language:'Language',languageSelect:'Choose language',sound:'Sound',soundOn:'On',soundOff:'Off',controls:'Controls',controlsSelect:'Control mode',pc:'PC (keyboard)',phone:'Phone (touch)',tablet:'Tablet (touch)',auto:'Auto',back:'Back',close:'Close',other:'Other',timer:'0-100 Timer',timerBest:'Best time',timerReset:'Reset best'}
};
var ENGINES_INFO=[
  {id:'scooter',label:'🛵 Скутер (S1)',sub:'1 цилиндр'},
  {id:'tdi',label:'🚐 1.9 TDI',sub:'4 цилиндра · турбодизель'},
  {id:'dci',label:'🚐 2.0 dCi',sub:'4 цилиндра · турбодизель'},
  {id:'mt82',label:'🚜 МТЗ-82',sub:'4 цилиндра · тракторный'},
  {id:'passatb3',label:'🚙 1.8 B3',sub:'4 цилиндра · бензин'},
  {id:'bluebird',label:'🚗 2.0 CA20',sub:'4 цилиндра · бензин'},
  {id:'i6',label:'🚗 2JZ I6',sub:'6 цилиндров · Toyota Supra'},
  {id:'galant6',label:'🚘 2.0 V6',sub:'6 цилиндров · Galant'},
  {id:'wankel',label:'🏎️ Mazda RX-8',sub:'2-роторный Ванкель'},
  {id:'r4',label:'🚗 R4',sub:'4 цилиндра в ряд'},
  {id:'v8',label:'🏎️ V12',sub:'12 цилиндров V-образный'},
  {id:'v16',label:'🔥 V22',sub:'22 цилиндра'}
];
var WEATHERS=[
  {id:'summer',label:'☀️ Лето',sub:'+25°C'},
  {id:'autumn',label:'🍂 Осень',sub:'+8°C'},
  {id:'winter',label:'❄️ Зима',sub:'-15°C'}
];
var CONTROLS=[
  {id:'auto',sub:'по устройству'},
  {id:'pc',sub:'W/S/A/D, Space, Q/E, 1-6'},
  {id:'phone',sub:'кнопки на экране'},
  {id:'tablet',sub:'кнопки на экране'}
];

var curLang='ru';
try{curLang=localStorage.getItem(LANG_KEY)||'ru';}catch(e){}
if(!LANGS[curLang])curLang='ru';
function t(k){var L=LANGS[curLang]||LANGS.ru;return L[k]||(LANGS.ru[k]||k);}

function injectStyles(){
  if(document.getElementById('settingsStyle'))return;
  var st=document.createElement('style');
  st.id='settingsStyle';
  st.textContent=
  '.settings-btn{position:fixed;top:8px;left:8px;z-index:99998;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(12,12,12,.5);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);color:#c0c0c0;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 8px 24px rgba(0,0,0,.5)}'+
  '.settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px}'+
  '.settings-modal{width:100%;max-width:400px;max-height:92vh;overflow-y:auto;background:rgba(10,10,10,.85);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,.13);border-radius:22px;padding:18px;color:#e8e8e8;box-shadow:0 24px 70px rgba(0,0,0,.7)}'+
  '.settings-modal h2{font-size:12px;letter-spacing:5px;color:#f0f0f0;text-transform:uppercase;margin:0 0 16px;font-weight:600;text-align:center}'+
  '.settings-item{width:100%;min-height:54px;margin-bottom:8px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(25,25,25,.6);color:#c0c0c0;font:600 13px/1.3 inherit;cursor:pointer;padding:10px 14px;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:10px}'+
  '.settings-item .txt{flex:1 1 auto;min-width:0}'+
  '.settings-item .lbl{display:block;font-size:14px;color:inherit;font-weight:600}'+
  '.settings-item .sub{display:block;font-size:10px;color:#6a6a6a;font-weight:500;margin-top:3px}'+
  '.settings-item .arrow{color:#6a6a6a;font-size:18px;flex:0 0 auto}'+
  '.settings-item .check{color:#f0f0f0;font-size:18px;opacity:0;flex:0 0 auto}'+
  '.settings-item.on{border-color:rgba(255,255,255,.25);color:#fff;background:rgba(255,255,255,.10)}'+
  '.settings-item.on .check{opacity:1}.settings-item.on .sub{color:#a0a0a0}'+
  '.settings-item.danger{color:#e0a0a0}'+
  '.sound-toggle{flex:0 0 auto;width:64px;height:32px;border-radius:16px;position:relative;border:1px solid rgba(255,255,255,.1);background:rgba(40,40,40,.8);transition:background .2s}'+
  '.sound-toggle.on{border-color:#f0f0f0;background:#f0f0f0}'+
  '.sound-toggle .knob{position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;background:#6a6a6a;transition:left .15s,background .15s}'+
  '.sound-toggle.on .knob{left:34px;background:#0a0a0a}'+
  '.settings-close{width:100%;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(25,25,25,.6);color:#c0c0c0;font:600 12px/1 inherit;letter-spacing:2.5px;cursor:pointer;text-transform:uppercase;margin-top:12px}'+
  '.settings-back{width:100%;height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(20,20,20,.6);color:#c0c0c0;font:600 12px/1 inherit;letter-spacing:2px;cursor:pointer;text-transform:uppercase;margin-bottom:14px}'+
  '.settings-modal::-webkit-scrollbar{width:0;display:none}';
  document.head.appendChild(st);
}

function addBtn(){
  if(document.getElementById('settingsBtn'))return;
  var b=document.createElement('button');
  b.id='settingsBtn';b.type='button';b.className='settings-btn';b.textContent='⚙️';
  b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openMain();});
  document.body.appendChild(b);
}
function makeOverlay(){var o=document.createElement('div');o.className='settings-overlay';o.addEventListener('click',function(e){if(e.target===o)closeAll();});return o;}
function makeModal(){var m=document.createElement('div');m.className='settings-modal';return m;}
function closeAll(){var ex=document.querySelector('.settings-overlay');if(ex)ex.remove();}

function applyLang(){
  var h=document.querySelector('header');if(h)h.textContent=t('title');
}

function openMain(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='⚙ '+t('settingsTitle');m.appendChild(h);
  var S=window.S;

  var curName=(S&&S.engines&&S.engines[S.engineType])?S.engines[S.engineType].name:'R4';
  var eb=document.createElement('button');
  eb.type='button';eb.className='settings-item';
  eb.innerHTML='<div class="txt"><span class="lbl">'+t('engineSelect')+'</span><span class="sub">'+curName+'</span></div><span class="arrow">›</span>';
  eb.addEventListener('click',function(){closeAll();openPicker();});
  m.appendChild(eb);

  var curW=S?S.weather:'summer';
  var wObj=WEATHERS.filter(function(x){return x.id===curW;})[0]||WEATHERS[0];
  var wb=document.createElement('button');
  wb.type='button';wb.className='settings-item';
  wb.innerHTML='<div class="txt"><span class="lbl">'+t('weatherSelect')+'</span><span class="sub">'+wObj.label+'</span></div><span class="arrow">›</span>';
  wb.addEventListener('click',function(){closeAll();openWeather();});
  m.appendChild(wb);

  /* УПРАВЛЕНИЕ */
  var cm=window.DVS_CONTROL_MODE||'auto';
  var cObj=CONTROLS.filter(function(x){return x.id===cm;})[0]||CONTROLS[0];
  var cb=document.createElement('button');
  cb.type='button';cb.className='settings-item';
  cb.innerHTML='<div class="txt"><span class="lbl">🎮 '+t('controlsSelect')+'</span><span class="sub">'+t(cObj.id)+'</span></div><span class="arrow">›</span>';
  cb.addEventListener('click',function(){closeAll();openControls();});
  m.appendChild(cb);

  var ln=(LANGS[curLang]||LANGS.ru).label;
  var lb=document.createElement('button');
  lb.type='button';lb.className='settings-item';
  lb.innerHTML='<div class="txt"><span class="lbl">'+t('languageSelect')+'</span><span class="sub">'+ln+'</span></div><span class="arrow">›</span>';
  lb.addEventListener('click',function(){closeAll();openLang();});
  m.appendChild(lb);

  var soundOn=false;
  if(window.DVS_SOUND&&window.DVS_SOUND.isMuted)soundOn=!window.DVS_SOUND.isMuted();
  var sb=document.createElement('button');
  sb.type='button';sb.className='settings-item';
  sb.innerHTML='<div class="txt"><span class="lbl">'+t('sound')+'</span><span class="sub">'+(soundOn?t('soundOn'):t('soundOff'))+'</span></div><div class="sound-toggle'+(soundOn?' on':'')+'"><div class="knob"></div></div>';
  sb.addEventListener('click',function(){
    if(!window.DVS_SOUND)return;
    var now=window.DVS_SOUND.toggleMute();
    var on=!now;
    sb.querySelector('.sound-toggle').classList.toggle('on',on);
    sb.querySelector('.sub').textContent=on?t('soundOn'):t('soundOff');
  });
  m.appendChild(sb);

  var cls=document.createElement('button');
  cls.type='button';cls.className='settings-close';cls.textContent=t('close');
  cls.addEventListener('click',closeAll);m.appendChild(cls);
  document.body.appendChild(ov);
}

function openControls(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='🎮 '+t('controls');m.appendChild(h);
  var back=document.createElement('button');
  back.type='button';back.className='settings-back';back.textContent='‹ '+t('back');
  back.addEventListener('click',function(){closeAll();openMain();});m.appendChild(back);
  var cur=window.DVS_CONTROL_MODE||'auto';
  CONTROLS.forEach(function(C){
    var b=document.createElement('button');
    b.type='button';b.className='settings-item'+(C.id===cur?' on':'');
    b.innerHTML='<div class="txt"><span class="lbl">'+t(C.id)+'</span><span class="sub">'+C.sub+'</span></div><span class="check">✓</span>';
    b.addEventListener('click',function(){
      if(window.DVS_SET_CONTROL_MODE)window.DVS_SET_CONTROL_MODE(C.id);
      var all=m.querySelectorAll('.settings-item');
      for(var i=0;i<all.length;i++)all[i].classList.remove('on');
      b.classList.add('on');
    });
    m.appendChild(b);
  });
  var cls=document.createElement('button');
  cls.type='button';cls.className='settings-close';cls.textContent=t('close');
  cls.addEventListener('click',closeAll);m.appendChild(cls);
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
    });
    m.appendChild(b);
  });
  var cls=document.createElement('button');
  cls.type='button';cls.className='settings-close';cls.textContent=t('close');
  cls.addEventListener('click',closeAll);m.appendChild(cls);
  document.body.appendChild(ov);
}

function openWeather(){
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
    });
    m.appendChild(b);
  });
  var cls=document.createElement('button');
  cls.type='button';cls.className='settings-close';cls.textContent=t('close');
  cls.addEventListener('click',closeAll);m.appendChild(cls);
  document.body.appendChild(ov);
}

function openLang(){
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
    });
    m.appendChild(b);
  });
  var cls=document.createElement('button');
  cls.type='button';cls.className='settings-close';cls.textContent=t('close');
  cls.addEventListener('click',closeAll);m.appendChild(cls);
  document.body.appendChild(ov);
}

function init(){injectStyles();addBtn();try{applyLang();}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
setTimeout(init,500);

console.log('settings.js: OK');
})();