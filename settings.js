(function(){
"use strict";
var LANG_KEY='dvs_lang';
var LANGS={
  ru:{label:'🇷🇺 Русский',title:'Двигатель внутреннего сгорания',clutch:'СЦЕПЛЕНИЕ',brake:'ТОРМОЗ',gas:'ГАЗ',hold:'держать',ignition:'Зажигание',speed:'Скорость',gear:'Передача',settingsTitle:'Настройки',language:'Язык',languageSelect:'Выбрать язык',engine:'Двигатель',engineSelect:'Выбрать двигатель',weather:'Погода',weatherSelect:'Выбрать погоду',sound:'Звук',soundOn:'Включён',soundOff:'Выключен',back:'Назад',close:'Закрыть',other:'Другое',timer:'Секундомер 0-100',timerStart:'Начать замер',timerBest:'Лучшее время',timerReset:'Сбросить лучшее',otherEmpty:'Скоро тут будет больше функций',
  profile:'Профиль',stats:'Статистика',achievements:'Достижения',logout:'Выйти из профиля',changePin:'Сменить PIN',deleteProfile:'Удалить профиль',distance:'Пробег',drives:'Поездок',broken:'Сожжено моторов',maxSpeed:'Макс. скорость',best100:'Лучшее 0-100',playTime:'Время в игре',noAch:'Пока нет достижений',of:'из',confirmLogout:'Выйти из профиля?',confirmDelete:'Удалить профиль со всеми данными?',profileNoActive:'Профиль не выбран'},
  uk:{label:'🇺🇦 Українська',title:'Двигун внутрішнього згоряння',clutch:'ЗЧЕПЛЕННЯ',brake:'ГАЛЬМО',gas:'ГАЗ',hold:'тримати',ignition:'Запалювання',speed:'Швидкість',gear:'Передача',settingsTitle:'Налаштування',language:'Мова',languageSelect:'Вибрати мову',engine:'Двигун',engineSelect:'Вибрати двигун',weather:'Погода',weatherSelect:'Вибрати погоду',sound:'Звук',soundOn:'Увімкнено',soundOff:'Вимкнено',back:'Назад',close:'Закрити',other:'Інше',timer:'Секундомір 0-100',timerStart:'Почати замір',timerBest:'Кращий час',timerReset:'Скинути кращий',otherEmpty:'Скоро тут буде більше функцій',
  profile:'Профіль',stats:'Статистика',achievements:'Досягнення',logout:'Вийти з профілю',changePin:'Змінити PIN',deleteProfile:'Видалити профіль',distance:'Пробіг',drives:'Поїздок',broken:'Спалено моторів',maxSpeed:'Макс. швидкість',best100:'Кращий 0-100',playTime:'Час у грі',noAch:'Поки немає досягнень',of:'з',confirmLogout:'Вийти з профілю?',confirmDelete:'Видалити профіль з усіма даними?',profileNoActive:'Профіль не вибраний'},
  en:{label:'🇬🇧 English',title:'Internal Combustion Engine',clutch:'CLUTCH',brake:'BRAKE',gas:'THROTTLE',hold:'hold',ignition:'Ignition',speed:'Speed',gear:'Gear',settingsTitle:'Settings',language:'Language',languageSelect:'Choose language',engine:'Engine',engineSelect:'Choose engine',weather:'Weather',weatherSelect:'Choose weather',sound:'Sound',soundOn:'On',soundOff:'Off',back:'Back',close:'Close',other:'Other',timer:'0-100 Timer',timerStart:'Start run',timerBest:'Best time',timerReset:'Reset best',otherEmpty:'More features coming soon',
  profile:'Profile',stats:'Stats',achievements:'Achievements',logout:'Log out',changePin:'Change PIN',deleteProfile:'Delete profile',distance:'Distance',drives:'Drives',broken:'Engines broken',maxSpeed:'Max speed',best100:'Best 0-100',playTime:'Play time',noAch:'No achievements yet',of:'of',confirmLogout:'Log out?',confirmDelete:'Delete profile with all data?',profileNoActive:'No profile selected'}
};
var ENGINES_INFO=[
  {id:'scooter',label:'🛵 Скутер (S1)',sub:'1 цилиндр · 4-тактный · АКПП'},
  {id:'tdi',label:'🚐 1.9 TDI',sub:'4 цилиндра · турбодизель · Passat B5'},
  {id:'dci',label:'🚐 2.0 dCi',sub:'4 цилиндра · турбодизель · Renault/Nissan · 6МКПП'},
  {id:'mt82',label:'🚜 МТЗ-82 (Д-240)',sub:'4 цилиндра · тракторный дизель'},
  {id:'passatb3',label:'🚙 1.8 B3',sub:'4 цилиндра · бензин · Passat B3'},
  {id:'bluebird',label:'🚗 2.0 CA20',sub:'4 цилиндра · бензин · Bluebird'},
  {id:'galant6',label:'🚘 2.0 V6',sub:'6 цилиндров · Galant 6'},
  {id:'wankel',label:'🏎️ Mazda RX-8',sub:'2-роторный Ванкель · 13B-MSP Renesis'},
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

function injectStyles(){
  if(document.getElementById('settingsStyle'))return;
  var st=document.createElement('style');
  st.id='settingsStyle';
  st.textContent=
  '.settings-btn{position:fixed;top:8px;left:8px;z-index:99998;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.08);background:rgba(20,20,20,.55);backdrop-filter:blur(40px) saturate(100%);-webkit-backdrop-filter:blur(40px) saturate(100%);color:#c0c0c0;font-size:20px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 8px 24px rgba(0,0,0,.5);transition:background .2s,border-color .2s,color .2s}'+
  '.settings-btn:hover{border-color:rgba(255,255,255,.16);color:#ffffff}'+
  '.settings-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit}'+
  '.settings-modal{width:100%;max-width:400px;max-height:92vh;overflow-y:auto;background:rgba(15,15,15,.6);backdrop-filter:blur(50px) saturate(100%);-webkit-backdrop-filter:blur(50px) saturate(100%);border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:18px;color:#e8e8e8;box-shadow:0 24px 70px rgba(0,0,0,.7)}'+
  '.settings-modal h2{font-size:12px;letter-spacing:5px;color:#f0f0f0;text-transform:uppercase;margin:0 0 16px;font-weight:600;text-align:center}'+
  '.settings-item{width:100%;min-height:54px;margin-bottom:8px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(25,25,25,.55);color:#c0c0c0;font:600 13px/1.3 inherit;cursor:pointer;padding:10px 14px;text-align:left;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:background .2s,border-color .2s,color .2s}'+
  '.settings-item:hover{border-color:rgba(255,255,255,.12)}'+
  '.settings-item .txt{flex:1 1 auto;min-width:0}'+
  '.settings-item .lbl{display:block;font-size:14px;color:inherit;font-weight:600}'+
  '.settings-item .sub{display:block;font-size:10px;color:#6a6a6a;font-weight:500;margin-top:3px;letter-spacing:.5px}'+
  '.settings-item .arrow{color:#6a6a6a;font-size:18px;flex:0 0 auto}'+
  '.settings-item .check{color:#f0f0f0;font-size:18px;opacity:0;flex:0 0 auto}'+
  '.settings-item.on{border-color:rgba(255,255,255,.22);color:#ffffff;background:rgba(255,255,255,.10)}'+
  '.settings-item.on .check{opacity:1}.settings-item.on .sub{color:#a0a0a0}'+
  '.settings-item.primary{background:rgba(232,232,90,.12);border-color:rgba(232,232,90,.35);color:#fff}'+
  '.settings-item.primary:hover{background:rgba(232,232,90,.2)}'+
  '.settings-item.danger{color:#e0a0a0}'+
  '.settings-item.danger:hover{border-color:rgba(220,80,80,.4);color:#ffb8b8}'+
  '.sound-toggle{flex:0 0 auto;width:64px;height:32px;border-radius:16px;position:relative;border:1px solid rgba(255,255,255,.08);background:rgba(40,40,40,.8);cursor:pointer;transition:background .2s,border-color .2s}'+
  '.sound-toggle.on{border-color:#f0f0f0;background:#f0f0f0}'+
  '.sound-toggle .knob{position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;background:#6a6a6a;transition:left .15s,background .15s}'+
  '.sound-toggle.on .knob{left:34px;background:#0a0a0a}'+
  '.settings-close{width:100%;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(25,25,25,.55);color:#c0c0c0;font:600 12px/1 inherit;letter-spacing:2.5px;cursor:pointer;text-transform:uppercase;touch-action:manipulation;margin-top:12px;transition:background .2s,border-color .2s,color .2s}'+
  '.settings-close:hover{border-color:rgba(255,255,255,.16);color:#ffffff}'+
  '.settings-back{width:100%;height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(20,20,20,.5);color:#c0c0c0;font:600 12px/1 inherit;letter-spacing:2px;cursor:pointer;text-transform:uppercase;touch-action:manipulation;margin-bottom:14px;transition:background .2s,border-color .2s,color .2s}'+
  '.settings-back:hover{border-color:rgba(255,255,255,.16);color:#ffffff}'+
  '.settings-modal::-webkit-scrollbar{width:0;display:none}'+
  '.settings-modal{scrollbar-width:none;-ms-overflow-style:none}'+
  /* Профиль — стили */
  '.prof-header{display:flex;align-items:center;gap:14px;padding:14px;'+
  'background:rgba(232,232,90,.08);border:1px solid rgba(232,232,90,.25);'+
  'border-radius:16px;margin-bottom:12px}'+
  '.prof-avatar{width:52px;height:52px;border-radius:50%;'+
  'background:rgba(232,232,90,.15);border:1px solid rgba(232,232,90,.4);'+
  'display:flex;align-items:center;justify-content:center;font-size:26px;flex:0 0 auto}'+
  '.prof-info{flex:1 1 auto;min-width:0}'+
  '.prof-name{font-size:16px;font-weight:700;color:#f0f0f0;'+
  'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '.prof-sub{font-size:10px;color:#8a8a8a;margin-top:3px;font-weight:500;letter-spacing:.5px}'+
  '.prof-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}'+
  '.prof-stat{padding:10px 12px;border-radius:12px;'+
  'background:rgba(25,25,25,.55);border:1px solid rgba(255,255,255,.06)}'+
  '.prof-stat .lbl{font-size:9px;color:#6a6a6a;letter-spacing:1.5px;'+
  'text-transform:uppercase;font-weight:600;margin-bottom:4px;display:block}'+
  '.prof-stat .val{font-size:16px;color:#f0f0f0;font-weight:700;'+
  'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}'+
  '.prof-stat .val.amber{color:#e8e85a}'+
  '.ach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));'+
  'gap:6px;margin-bottom:14px}'+
  '.ach-icon-cell{aspect-ratio:1;border-radius:12px;'+
  'background:rgba(25,25,25,.5);border:1px solid rgba(255,255,255,.06);'+
  'display:flex;align-items:center;justify-content:center;font-size:24px;'+
  'opacity:.22;filter:grayscale(1);transition:all .25s;position:relative}'+
  '.ach-icon-cell.got{opacity:1;filter:none;background:rgba(232,232,90,.12);'+
  'border-color:rgba(232,232,90,.4);box-shadow:0 0 14px rgba(232,232,90,.2)}'+
  '.ach-section-title{font-size:10px;color:#8a8a8a;letter-spacing:3px;'+
  'text-transform:uppercase;font-weight:600;margin:4px 0 8px;'+
  'display:flex;justify-content:space-between;align-items:center}'+
  '.ach-count{font-size:11px;color:#e8e85a;font-weight:700}'+
  '.prof-empty{text-align:center;padding:20px;font-size:12px;color:#6a6a6a}';
  document.head.appendChild(st);
}

function injectTimerStyles(){
  if(document.getElementById('timerStyle'))return;
  var st=document.createElement('style');
  st.id='timerStyle';
  st.textContent=
  '#timerOverlay{position:fixed;top:60px;right:10px;z-index:9998;display:none;min-width:130px;padding:10px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(15,15,15,.75);backdrop-filter:blur(40px) saturate(100%);-webkit-backdrop-filter:blur(40px) saturate(100%);color:#e8e8e8;font:600 12px/1.4 -apple-system,Inter,sans-serif;box-shadow:0 12px 36px rgba(0,0,0,.6);text-align:left}'+
  '#timerOverlay .tm-lbl{font-size:9px;letter-spacing:2px;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px}'+
  '#timerOverlay .tm-val{font-size:24px;font-weight:700;color:#f0f0f0;transition:color .3s}'+
  '#timerOverlay .tm-val.done{color:#43c98a}'+
  '#timerOverlay .tm-best{font-size:9px;color:#8a8a8a;margin-top:4px;transition:color .3s}'+
  '#timerOverlay .tm-best.record{color:#e8e85a;font-weight:700}'+
  '#timerOverlay .tm-hint{font-size:9px;color:#6a6a6a;margin-top:2px;font-weight:500}';
  document.head.appendChild(st);
}

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

function fmtTime(ms){
  if(ms === null || ms === undefined || !isFinite(ms)) return '--.--';
  return (ms/1000).toFixed(2) + ' с';
}

function fmtKm(m){
  if(!m || m < 0) return '0 км';
  if(m < 1000) return Math.round(m) + ' м';
  return (m/1000).toFixed(1) + ' км';
}

function fmtPlayTime(sec){
  if(!sec || sec < 60) return Math.round(sec||0) + ' с';
  if(sec < 3600) return Math.round(sec/60) + ' мин';
  var h = Math.floor(sec/3600);
  var m = Math.round((sec%3600)/60);
  return h + ' ч ' + m + ' мин';
}

/* ==================== ГЛАВНОЕ МЕНЮ ==================== */
function openMain(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='⚙ '+t('settingsTitle');m.appendChild(h);
  var S=window.S;
  var P=window.DVS_PROFILE;

  /* 👤 Профиль — если залогинен */
  if(P && P.isLoggedIn && P.isLoggedIn()){
    var prof = P.getActive();
    if(prof){
      var achCount = (prof.achievements || []).length;
      var pb = document.createElement('button');
      pb.type='button';pb.className='settings-item primary';
      pb.innerHTML='<div class="txt"><span class="lbl">👤 '+prof.name+'</span><span class="sub">🏆 '+achCount+' '+t('of')+' 25 · 👆 '+t('profile')+'</span></div><span class="arrow">›</span>';
      pb.addEventListener('click',function(){closeAll();openProfile();});
      m.appendChild(pb);
    }
  }

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

  /* Другое */
  var ob=document.createElement('button');
  ob.type='button';ob.className='settings-item';
  ob.innerHTML='<div class="txt"><span class="lbl">🔧 '+t('other')+'</span><span class="sub">'+t('timer')+'</span></div><span class="arrow">›</span>';
  ob.addEventListener('click',function(){closeAll();openOther();});
  m.appendChild(ob);

  var cb=document.createElement('button');
  cb.type='button';cb.className='settings-close';cb.textContent=t('close');
  cb.addEventListener('click',closeAll);m.appendChild(cb);

  document.body.appendChild(ov);
}

/* ==================== ЭКРАН ПРОФИЛЯ ==================== */
function openProfile(){
  closeAll();
  var P = window.DVS_PROFILE;
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='👤 '+t('profile');m.appendChild(h);

  var back=document.createElement('button');
  back.type='button';back.className='settings-back';back.textContent='‹ '+t('back');
  back.addEventListener('click',function(){closeAll();openMain();});m.appendChild(back);

  if(!P || !P.isLoggedIn || !P.isLoggedIn()){
    var e=document.createElement('div');
    e.className='prof-empty';
    e.textContent=t('profileNoActive');
    m.appendChild(e);
    var cb0=document.createElement('button');
    cb0.type='button';cb0.className='settings-close';cb0.textContent=t('close');
    cb0.addEventListener('click',closeAll);m.appendChild(cb0);
    document.body.appendChild(ov);return;
  }

  var prof = P.getActive();
  var stats = prof.stats || {};
  var ach = prof.achievements || [];

  /* Шапка */
  var hdr = document.createElement('div');
  hdr.className='prof-header';
  hdr.innerHTML='<div class="prof-avatar">👤</div>'+
    '<div class="prof-info">'+
    '<div class="prof-name">'+prof.name+'</div>'+
    '<div class="prof-sub">🏆 '+ach.length+' '+t('of')+' 25 '+t('achievements').toLowerCase()+'</div>'+
    '</div>';
  m.appendChild(hdr);

  /* Статистика */
  var stTitle = document.createElement('div');
  stTitle.className='ach-section-title';
  stTitle.textContent = t('stats');
  m.appendChild(stTitle);

  var grid = document.createElement('div');
  grid.className='prof-stats';
  var best100 = stats.best0to100;
  grid.innerHTML =
    '<div class="prof-stat"><span class="lbl">'+t('distance')+'</span><span class="val">'+fmtKm(stats.totalDistance||0)+'</span></div>'+
    '<div class="prof-stat"><span class="lbl">'+t('maxSpeed')+'</span><span class="val">'+Math.round(stats.maxSpeed||0)+' км/ч</span></div>'+
    '<div class="prof-stat"><span class="lbl">'+t('best100')+'</span><span class="val amber">'+fmtTime(best100)+'</span></div>'+
    '<div class="prof-stat"><span class="lbl">'+t('broken')+'</span><span class="val">'+(stats.enginesBroken||0)+'</span></div>'+
    '<div class="prof-stat"><span class="lbl">'+t('playTime')+'</span><span class="val">'+fmtPlayTime(stats.totalPlayTime||0)+'</span></div>'+
    '<div class="prof-stat"><span class="lbl">'+t('enginesTried') || 'Моторов попробовано' +'</span><span class="val">'+((stats.enginesTried||[]).length)+' / '+((window.S && window.S.engines) ? Object.keys(window.S.engines).length : 11)+'</span></div>';
  m.appendChild(grid);

  /* Достижения */
  var achTitle = document.createEl