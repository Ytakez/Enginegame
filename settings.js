(function(){
"use strict";

var LANG_KEY = 'dvs_lang';
var ENG_KEY = 'dvs_engine_v3';

var LANGS = {
  ru: {
    label: '🇷🇺 Русский',
    title: 'Двигатель внутреннего сгорания',
    clutch: 'СЦЕПЛЕНИЕ', brake: 'ТОРМОЗ', gas: 'ГАЗ', hold: 'держать',
    ignition: 'Зажигание', speed: 'Скорость', gear: 'Передача',
    settingsTitle: 'Настройки', language: 'Язык',
    engine: 'Двигатель', engineSelect: 'Выбрать двигатель',
    sound: 'Звук', soundOn: 'Включён', soundOff: 'Выключен',
    soon: 'Скоро', repair: 'Ремонт', close: 'Закрыть'
  },
  uk: {
    label: '🇺🇦 Українська',
    title: 'Двигун внутрішнього згоряння',
    clutch: 'ЗЧЕПЛЕННЯ', brake: 'ГАЛЬМО', gas: 'ГАЗ', hold: 'тримати',
    ignition: 'Запалювання', speed: 'Швидкість', gear: 'Передача',
    settingsTitle: 'Налаштування', language: 'Мова',
    engine: 'Двигун', engineSelect: 'Вибрати двигун',
    sound: 'Звук', soundOn: 'Увімкнено', soundOff: 'Вимкнено',
    soon: 'Скоро', repair: 'Ремонт', close: 'Закрити'
  },
  en: {
    label: '🇬🇧 English',
    title: 'Internal Combustion Engine',
    clutch: 'CLUTCH', brake: 'BRAKE', gas: 'THROTTLE', hold: 'hold',
    ignition: 'Ignition', speed: 'Speed', gear: 'Gear',
    settingsTitle: 'Settings', language: 'Language',
    engine: 'Engine', engineSelect: 'Choose engine',
    sound: 'Sound', soundOn: 'On', soundOff: 'Off',
    soon: 'Soon', repair: 'Repair', close: 'Close'
  }
};

var ENGINES_INFO = [
  { id:'scooter', label:'🛵 Скутер (S1)',    sub:'1 цилиндр · 4-тактный · 50 cc' },
  { id:'r4',      label:'🚗 R4 (рядная)',    sub:'4 цилиндра · в ряд' },
  { id:'v8',      label:'🏎️ V8',            sub:'8 цилиндров · V-образный' },
  { id:'v16',     label:'🔥 V16',           sub:'16 цилиндров · мощный' }
];

var curLang = 'ru';
try { curLang = localStorage.getItem(LANG_KEY) || 'ru'; } catch(e){}
if (!LANGS[curLang]) curLang = 'ru';

function t(key){
  var L = LANGS[curLang] || LANGS.ru;
  return L[key] || (LANGS.ru[key] || key);
}

/* ======== ПЕРЕВОД ИНТЕРФЕЙСА ======== */
function applyLang(){
  var header = document.querySelector('header');
  if (header) header.textContent = t('title');

  var map = { 'pClutch':'clutch', 'pBrake':'brake', 'pGas':'gas', 'ignBtn':'ignition' };
  for (var id in map){
    var el = document.getElementById(id);
    if (!el) continue;
    if (el.tagName === 'BUTTON'){
      el.textContent = t(map[id]);
    } else {
      var spans = el.querySelectorAll('span');
      for (var i=0; i<spans.length; i++){
        if (spans[i].classList.contains('icon')) continue;
        if (spans[i].classList.contains('sub')){ spans[i].textContent = t('hold'); continue; }
        spans[i].textContent = t(map[id]);
      }
    }
  }

  var roLabels = document.querySelectorAll('.ro .lbl');
  if (roLabels.length >= 2){
    roLabels[0].textContent = t('speed');
    roLabels[1].textContent = t('gear');
  }
}

/* ======== БЕЙДЖ ТЕКУЩЕГО ДВИГАТЕЛЯ ======== */
function updateBadge(){
  var b = document.getElementById('engBadge');
  var S = window.S;
  if (!b || !S) return;
  var E = S.engines[S.engineType];
  if (E) b.textContent = E.name;
}

/* ======== СТИЛИ ======== */
function injectStyles(){
  if (document.getElementById('settingsStyle')) return;
  var st = document.createElement('style');
  st.id = 'settingsStyle';
  st.textContent =
    '.eng-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
      'background:rgba(20,30,40,.9);border:1px solid #3a5170;border-radius:20px;' +
      'padding:4px 14px;font-size:11px;font-weight:800;letter-spacing:2px;' +
      'color:#8fd8ff;pointer-events:none;z-index:10}' +
    '.settings-btn{position:fixed;top:8px;left:60px;z-index:1000;width:44px;height:44px;' +
      'border-radius:50%;border:1px solid #263547;background:rgba(20,28,38,.85);' +
      'color:#8fd8ff;font-size:20px;cursor:pointer;touch-action:manipulation;' +
      'display:flex;align-items:center;justify-content:center;padding:0}' +
    '.settings-btn:hover{border-color:#3a5170}' +
    '.settings-overlay{position:fixed;top:0;left:0;right:0;bottom:0;' +
      'background:rgba(5,10,15,.94);z-index:99999;display:flex;align-items:center;' +
      'justify-content:center;padding:20px;font-family:inherit}' +
    '.settings-modal{width:100%;max-width:400px;max-height:92vh;overflow-y:auto;' +
      'background:linear-gradient(180deg,#151d27,#0d131a);border:1px solid #22303f;' +
      'border-radius:16px;padding:18px;color:#dbe4ee;box-shadow:0 20px 60px rgba(0,0,0,.7)}' +
    '.settings-modal h2{font-size:14px;letter-spacing:3px;color:#8fd8ff;' +
      'text-transform:uppercase;margin:0 0 16px;font-weight:800;text-align:center}' +
    '.settings-section{margin-bottom:16px}' +
    '.settings-section h3{font-size:10px;letter-spacing:2px;color:#5d7189;' +
      'text-transform:uppercase;margin:0 0 8px;font-weight:700}' +
    '.settings-item{width:100%;min-height:54px;margin-bottom:6px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);' +
      'color:#8ea4bd;font:700 13px/1.3 inherit;cursor:pointer;padding:8px 14px;' +
      'text-align:left;touch-action:manipulation;display:flex;align-items:center;' +
      'justify-content:space-between;gap:10px}' +
    '.settings-item .txt{flex:1 1 auto;min-width:0}' +
    '.settings-item .lbl{display:block;font-size:13px;color:inherit}' +
    '.settings-item .sub{display:block;font-size:10px;color:#5d7189;' +
      'font-weight:600;margin-top:2px;letter-spacing:.5px}' +
    '.settings-item .check{color:#43c98a;font-size:18px;opacity:0;flex:0 0 auto}' +
    '.settings-item.on{border-color:#43c98a;color:#e6fff3;' +
      'background:linear-gradient(180deg,#1c3d2e,#0e231a)}' +
    '.settings-item.on .check{opacity:1}' +
    '.settings-item.on .sub{color:#7bc9a3}' +
    '.settings-close{width:100%;height:46px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);' +
      'color:#8ea4bd;font:800 12px/1 inherit;letter-spacing:1.5px;cursor:pointer;' +
      'text-transform:uppercase;touch-action:manipulation;margin-top:8px}' +
    '.settings-back{width:100%;height:42px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:rgba(15,22,30,.8);' +
      'color:#8ea4bd;font:700 11px/1 inherit;letter-spacing:1.5px;cursor:pointer;' +
      'text-transform:uppercase;touch-action:manipulation;margin-bottom:12px}';
  document.head.appendChild(st);
}

/* ======== КНОПКА НАСТРОЕК ======== */
function addSettingsButton(){
  if (document.getElementById('settingsBtn')) return;
  var btn = document.createElement('button');
  btn.id = 'settingsBtn';
  btn.type = 'button';
  btn.className = 'settings-btn';
  btn.textContent = '⚙️';
  btn.title = t('settingsTitle');
  btn.addEventListener('click', function(){ openMain(); });
  document.body.appendChild(btn);
}

/* ======== ГЛАВНОЕ ОКНО ======== */
function openMain(){
  var ov = makeOverlay();
  var m = makeModal();
  ov.appendChild(m);

  var h = document.createElement('h2');
  h.textContent = '⚙ ' + t('settingsTitle');
  m.appendChild(h);

  /* --- Двигатель --- */
  var sec1 = document.createElement('div');
  sec1.className = 'settings-section';
  var h1 = document.createElement('h3');
  h1.textContent = t('engine');
  sec1.appendChild(h1);

  var engBtn = document.createElement('button');
  engBtn.type = 'button';
  engBtn.className = 'settings-item';
  var S = window.S;
  var curName = S ? (S.engines[S.engineType] || {}).name || 'R4' : 'R4';
  engBtn.innerHTML = '<div class="txt"><span class="lbl">' + t('engineSelect') +
    '</span><span class="sub">' + curName + '</span></div><span class="check" style="opacity:1">›</span>';
  engBtn.addEventListener('click', function(){
    closeSettings();
    openEnginePicker();
  });
  sec1.appendChild(engBtn);
  m.appendChild(sec1);

  /* --- Язык --- */
  var sec2 = document.createElement('div');
  sec2.className = 'settings-section';
  var h2 = document.createElement('h3');
  h2.textContent = t('language');
  sec2.appendChild(h2);

  Object.keys(LANGS).forEach(function(code){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'settings-item' + (code === curLang ? ' on' : '');
    b.innerHTML = '<div class="txt"><span class="lbl">' + LANGS[code].label +
      '</span></div><span class="check">✓</span>';
    b.addEventListener('click', function(){
      setLang(code);
      var all = sec2.querySelectorAll('.settings-item');
      for (var i=0; i<all.length; i++) all[i].classList.remove('on');
      b.classList.add('on');
      h.textContent = '⚙ ' + t('settingsTitle');
      h1.textContent = t('engine');
      h2.textContent = t('language');
      engBtn.querySelector('.lbl').textContent = t('engineSelect');
      applyLang();
    });
    sec2.appendChild(b);
  });
  m.appendChild(sec2);

  /* --- Закрыть --- */
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'settings-close';
  closeBtn.textContent = t('close');
  closeBtn.addEventListener('click', closeSettings);
  m.appendChild(closeBtn);

  document.body.appendChild(ov);
}

/* ======== ОКНО ВЫБОРА ДВИГАТЕЛЯ ======== */
function openEnginePicker(){
  var ov = makeOverlay();
  var m = makeModal();
  ov.appendChild(m);

  var h = document.createElement('h2');
  h.textContent = '🏁 ' + t('engine');
  m.appendChild(h);

  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'settings-back';
  back.textContent = '‹ ' + t('settingsTitle');
  back.addEventListener('click', function(){
    closeSettings();
    openMain();
  });
  m.appendChild(back);

  var S = window.S;
  var cur = S ? S.engineType : 'r4';

  ENGINES_INFO.forEach(function(E){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'settings-item' + (E.id === cur ? ' on' : '');
    b.innerHTML = '<div class="txt"><span class="lbl">' + E.label +
      '</span><span class="sub">' + E.sub + '</span></div><span class="check">✓</span>';
    b.addEventListener('click', function(){
      if (S && S.setEngine) S.setEngine(E.id);
      var all = m.querySelectorAll('.settings-item');
      for (var i=0; i<all.length; i++) all[i].classList.remove('on');
      b.classList.add('on');
      updateBadge();
      try{ if(navigator.vibrate) navigator.vibrate(15); }catch(e){}
    });
    m.appendChild(b);
  });

  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'settings-close';
  closeBtn.textContent = t('close');
  closeBtn.addEventListener('click', closeSettings);
  m.appendChild(closeBtn);

  document.body.appendChild(ov);
}

/* ======== ВСПОМОГАТЕЛЬНЫЕ ======== */
function makeOverlay(){
  var ov = document.createElement('div');
  ov.className = 'settings-overlay';
  ov.addEventListener('click', function(e){
    if (e.target === ov) closeSettings();
  });
  return ov;
}
function makeModal(){
  var m = document.createElement('div');
  m.className = 'settings-modal';
  return m;
}
function closeSettings(){
  var ex = document.querySelector('.settings-overlay');
  if (ex) ex.remove();
}

/* ======== СМЕНА ЯЗЫКА ======== */
function setLang(code){
  if (!LANGS[code]) return;
  curLang = code;
  try { localStorage.setItem(LANG_KEY, code); } catch(e){}
  try { if (navigator.vibrate) navigator.vibrate(10); } catch(e){}
  applyLang();
  var sb = document.getElementById('settingsBtn');
  if (sb) sb.title = t('settingsTitle');
}

/* ======== СТАРТ ======== */
function init(){
  injectStyles();
  addSettingsButton();
  applyLang();
  updateBadge();
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();