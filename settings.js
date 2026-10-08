(function(){
"use strict";

var LANG_KEY = 'dvs_lang';

var LANGS = {
  ru: {
    label: '🇷🇺 Русский',
    title: 'Двигатель внутреннего сгорания',
    clutch: 'СЦЕПЛЕНИЕ', brake: 'ТОРМОЗ', gas: 'ГАЗ', hold: 'держать',
    ignition: 'Зажигание', speed: 'Скорость', gear: 'Передача',
    settingsTitle: 'Настройки', language: 'Языки', languageSelect: 'Выбрать язык',
    engine: 'Двигатель', engineSelect: 'Выбрать двигатель',
    sound: 'Звук', soundOn: 'Включён', soundOff: 'Выключен',
    back: 'Назад', close: 'Закрыть'
  },
  uk: {
    label: '🇺🇦 Українська',
    title: 'Двигун внутрішнього згоряння',
    clutch: 'ЗЧЕПЛЕННЯ', brake: 'ГАЛЬМО', gas: 'ГАЗ', hold: 'тримати',
    ignition: 'Запалювання', speed: 'Швидкість', gear: 'Передача',
    settingsTitle: 'Налаштування', language: 'Мови', languageSelect: 'Вибрати мову',
    engine: 'Двигун', engineSelect: 'Вибрати двигун',
    sound: 'Звук', soundOn: 'Увімкнено', soundOff: 'Вимкнено',
    back: 'Назад', close: 'Закрити'
  },
  en: {
    label: '🇬🇧 English',
    title: 'Internal Combustion Engine',
    clutch: 'CLUTCH', brake: 'BRAKE', gas: 'THROTTLE', hold: 'hold',
    ignition: 'Ignition', speed: 'Speed', gear: 'Gear',
    settingsTitle: 'Settings', language: 'Languages', languageSelect: 'Choose language',
    engine: 'Engine', engineSelect: 'Choose engine',
    sound: 'Sound', soundOn: 'On', soundOff: 'Off',
    back: 'Back', close: 'Close'
  }
};

var ENGINES_INFO = [
  { id:'scooter', label:'🛵 Скутер (S1)',       sub:'1 цилиндр · 4-тактный · АКПП · 50 cc' },
  { id:'tdi',     label:'🚐 1.9 TDI',           sub:'4 цилиндра · турбодизель · Passat B5' },
  { id:'mt82',    label:'🚜 МТЗ-82 (Д-240)',   sub:'4 цилиндра · тракторный дизель · 4,75 л' },
  { id:'r4',      label:'🚗 R4 (рядная)',       sub:'4 цилиндра · в ряд · механика' },
  { id:'v8',      label:'🏎️ V8',               sub:'8 цилиндров · V-образный' },
  { id:'v16',     label:'🔥 V16',              sub:'16 цилиндров · мощный' }
];

var curLang = 'ru';
try { curLang = localStorage.getItem(LANG_KEY) || 'ru'; } catch(e){}
if (!LANGS[curLang]) curLang = 'ru';

function t(key){
  var L = LANGS[curLang] || LANGS.ru;
  return L[key] || (LANGS.ru[key] || key);
}

function applyLang(){
  var header = document.querySelector('header');
  if (header) header.textContent = t('title');
  var map = { 'pClutch':'clutch', 'pBrake':'brake', 'pGas':'gas', 'ignBtn':'ignition' };
  for (var id in map){
    var el = document.getElementById(id);
    if (!el) continue;
    if (el.tagName === 'BUTTON'){ el.textContent = t(map[id]); }
    else {
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

function injectStyles(){
  if (document.getElementById('settingsStyle')) return;
  var st = document.createElement('style');
  st.id = 'settingsStyle';
  st.textContent =
    '.eng-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);' +
      'background:rgba(20,30,40,.9);border:1px solid #3a5170;border-radius:20px;' +
      'padding:4px 14px;font-size:11px;font-weight:800;letter-spacing:2px;' +
      'color:#8fd8ff;pointer-events:none;z-index:10;font-family:inherit}' +
    '.settings-btn{position:fixed;top:8px;left:8px;z-index:1000;width:44px;height:44px;' +
      'border-radius:50%;border:1px solid #263547;background:rgba(20,28,38,.85);' +
      'color:#8fd8ff;font-size:20px;cursor:pointer;touch-action:manipulation;' +
      'display:flex;align-items:center;justify-content:center;padding:0}' +
    '#repairBtn{top:60px !important}' +
    '.settings-overlay{position:fixed;top:0;left:0;right:0;bottom:0;' +
      'background:rgba(5,10,15,.94);z-index:99999;display:flex;align-items:center;' +
      'justify-content:center;padding:20px;font-family:inherit}' +
    '.settings-modal{width:100%;max-width:400px;max-height:92vh;overflow-y:auto;' +
      'background:linear-gradient(180deg,#151d27,#0d131a);border:1px solid #22303f;' +
      'border-radius:16px;padding:18px;color:#dbe4ee;box-shadow:0 20px 60px rgba(0,0,0,.7)}' +
    '.settings-modal h2{font-size:14px;letter-spacing:3px;color:#8fd8ff;' +
      'text-transform:uppercase;margin:0 0 16px;font-weight:800;text-align:center}' +
    '.settings-item{width:100%;min-height:54px;margin-bottom:8px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);' +
      'color:#8ea4bd;font:700 13px/1.3 inherit;cursor:pointer;padding:10px 14px;' +
      'text-align:left;touch-action:manipulation;display:flex;align-items:center;' +
      'justify-content:space-between;gap:10px}' +
    '.settings-item .txt{flex:1 1 auto;min-width:0}' +
    '.settings-item .lbl{display:block;font-size:14px;color:inherit;font-weight:700}' +
    '.settings-item .sub{display:block;font-size:10px;color:#5d7189;' +
      'font-weight:600;margin-top:3px;letter-spacing:.5px}' +
    '.settings-item .arrow{color:#8ea4bd;font-size:18px;flex:0 0 auto}' +
    '.settings-item .check{color:#43c98a;font-size:18px;opacity:0;flex:0 0 auto}' +
    '.settings-item.on{border-color:#43c98a;color:#e6fff3;' +
      'background:linear-gradient(180deg,#1c3d2e,#0e231a)}' +
    '.settings-item.on .check{opacity:1}' +
    '.settings-item.on .sub{color:#7bc9a3}' +
    '.sound-toggle{flex:0 0 auto;width:64px;height:32px;border-radius:16px;' +
      'position:relative;border:1px solid #2c3e52;background:#0e161e;' +
      'transition:background .15s,border-color .15s;cursor:pointer}' +
    '.sound-toggle.on{border-color:#43c98a;background:#1c3d2e}' +
    '.sound-toggle .knob{position:absolute;top:2px;left:2px;width:24px;height:24px;' +
      'border-radius:50%;background:#5d7189;transition:left .15s,background .15s}' +
    '.sound-toggle.on .knob{left:34px;background:#43c98a}' +
    '.settings-close{width:100%;height:46px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);' +
      'color:#8ea4bd;font:800 12px/1 inherit;letter-spacing:1.5px;cursor:pointer;' +
      'text-transform:uppercase;touch-action:manipulation;margin-top:12px}' +
    '.settings-back{width:100%;height:42px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:rgba(15,22,30,.8);' +
      'color:#8ea4bd;font:700 12px/1 inherit;letter-spacing:1.5px;cursor:pointer;' +
      'text-transform:uppercase;touch-action:manipulation;margin-bottom:14px}';
  document.head.appendChild(st);
}

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

function openMain(){
  closeSettings();
  var ov = makeOverlay();
  var m = makeModal();
  ov.appendChild(m);

  var h = document.createElement('h2');
  h.textContent = '⚙ ' + t('settingsTitle');
  m.appendChild(h);

  var S = window.S;
  var curName = S ? (S.engines[S.engineType] || {}).name || 'R4' : 'R4';
  var engBtn = document.createElement('button');
  engBtn.type = 'button';
  engBtn.className = 'settings-item';
  engBtn.innerHTML = '<div class="txt"><span class="lbl">' + t('engineSelect') +
    '</span><span class="sub">' + curName + '</span></div><span class="arrow">›</span>';
  engBtn.addEventListener('click', function(){ closeSettings(); openEnginePicker(); });
  m.appendChild(engBtn);

  var langName = (LANGS[curLang] || LANGS.ru).label;
  var langBtn = document.createElement('button');
  langBtn.type = 'button';
  langBtn.className = 'settings-item';
  langBtn.innerHTML = '<div class="txt"><span class="lbl">' + t('languageSelect') +
    '</span><span class="sub">' + langName + '</span></div><span class="arrow">›</span>';
  langBtn.addEventListener('click', function(){ closeSettings(); openLangPicker(); });
  m.appendChild(langBtn);

  var soundOn = false;
  if (window.DVS_SOUND && window.DVS_SOUND.isMuted){
    soundOn = !window.DVS_SOUND.isMuted();
  }
  var soundBtn = document.createElement('button');
  soundBtn.type = 'button';
  soundBtn.className = 'settings-item';
  soundBtn.innerHTML =
    '<div class="txt"><span class="lbl">' + t('sound') +
    '</span><span class="sub" id="soundSub">' + (soundOn ? t('soundOn') : t('soundOff')) +
    '</span></div><div class="sound-toggle' + (soundOn ? ' on' : '') +
    '" id="soundToggle"><div class="knob"></div></div>';
  soundBtn.addEventListener('click', function(){
    if (!window.DVS_SOUND) return;
    var now = window.DVS_SOUND.toggleMute();
    var on = !now;
    var tg = document.getElementById('soundToggle');
    var sub = document.getElementById('soundSub');
    if (tg) tg.classList.toggle('on', on);
    if (sub) sub.textContent = on ? t('soundOn') : t('soundOff');
    try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){}
  });
  m.appendChild(soundBtn);

  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'settings-close';
  closeBtn.textContent = t('close');
  closeBtn.addEventListener('click', closeSettings);
  m.appendChild(closeBtn);

  document.body.appendChild(ov);
}

function openEnginePicker(){
  closeSettings();
  var ov = makeOverlay();
  var m = makeModal();
  ov.appendChild(m);

  var h = document.createElement('h2');
  h.textContent = '🏁 ' + t('engine');
  m.appendChild(h);

  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'settings-back';
  back.textContent = '‹ ' + t('back');
  back.addEventListener('click', function(){ closeSettings(); openMain(); });
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

function openLangPicker(){
  closeSettings();
  var ov = makeOverlay();
  var m = makeModal();
  ov.appendChild(m);

  var h = document.createElement('h2');
  h.textContent = '🌐 ' + t('language');
  m.appendChild(h);

  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'settings-back';
  back.textContent = '‹ ' + t('back');
  back.addEventListener('click', function(){ closeSettings(); openMain(); });
  m.appendChild(back);

  Object.keys(LANGS).forEach(function(code){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'settings-item' + (code === curLang ? ' on' : '');
    b.innerHTML = '<div class="txt"><span class="lbl">' + LANGS[code].label +
      '</span></div><span class="check">✓</span>';
    b.addEventListener('click', function(){
      setLang(code);
      var all = m.querySelectorAll('.settings-item');
      for (var i=0; i<all.length; i++) all[i].classList.remove('on');
      b.classList.add('on');
      h.textContent = '🌐 ' + t('language');
      back.textContent = '‹ ' + t('back');
      try{ if(navigator.vibrate) navigator.vibrate(10); }catch(e){}
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

function makeOverlay(){
  var ov = document.createElement('div');
  ov.className = 'settings-overlay';
  ov.addEventListener('click', function(e){ if (e.target === ov) closeSettings(); });
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

function setLang(code){
  if (!LANGS[code]) return;
  curLang = code;
  try { localStorage.setItem(LANG_KEY, code); } catch(e){}
  applyLang();
  var sb = document.getElementById('settingsBtn');
  if (sb) sb.title = t('settingsTitle');
}

function init(){
  injectStyles();
  addSettingsButton();
  applyLang();
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();