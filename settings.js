(function(){
"use strict";

var LANG_KEY = 'dvs_lang';

var LANGS = {
  ru: {
    label: '🇷🇺 Русский',
    title: 'Двигатель внутреннего сгорания',
    clutch: 'СЦЕПЛЕНИЕ', brake: 'ТОРМОЗ', gas: 'ГАЗ', hold: 'держать',
    ignition: 'Зажигание', speed: 'Скорость', gear: 'Передача',
    settingsTitle: 'Настройки', language: 'Язык', sound: 'Звук',
    soundOn: 'Включён', soundOff: 'Выключен', soon: 'Скоро',
    repair: 'Ремонт', close: 'Закрыть'
  },
  uk: {
    label: '🇺🇦 Українська',
    title: 'Двигун внутрішнього згоряння',
    clutch: 'ЗЧЕПЛЕННЯ', brake: 'ГАЛЬМО', gas: 'ГАЗ', hold: 'тримати',
    ignition: 'Запалювання', speed: 'Швидкість', gear: 'Передача',
    settingsTitle: 'Налаштування', language: 'Мова', sound: 'Звук',
    soundOn: 'Увімкнено', soundOff: 'Вимкнено', soon: 'Скоро',
    repair: 'Ремонт', close: 'Закрити'
  },
  en: {
    label: '🇬🇧 English',
    title: 'Internal Combustion Engine',
    clutch: 'CLUTCH', brake: 'BRAKE', gas: 'THROTTLE', hold: 'hold',
    ignition: 'Ignition', speed: 'Speed', gear: 'Gear',
    settingsTitle: 'Settings', language: 'Language', sound: 'Sound',
    soundOn: 'On', soundOff: 'Off', soon: 'Soon',
    repair: 'Repair', close: 'Close'
  }
};

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

  var map = {
    'pClutch': 'clutch', 'pBrake': 'brake', 'pGas': 'gas',
    'ignBtn': 'ignition'
  };
  for (var id in map){
    var el = document.getElementById(id);
    if (!el) continue;
    // меняем только текстовые узлы — иконки и цифры не трогаем
    var spans = el.querySelectorAll('span');
    if (el.tagName === 'BUTTON'){
      el.textContent = t(map[id]);
    } else if (spans.length >= 1){
      // педали: ищем span-ы со словами
      for (var i=0; i<spans.length; i++){
        if (spans[i].classList.contains('icon')) continue;
        if (spans[i].classList.contains('sub')){ spans[i].textContent = t('hold'); continue; }
        spans[i].textContent = t(map[id]);
      }
    }
  }

  // надписи в readouts
  var roLabels = document.querySelectorAll('.ro .lbl');
  if (roLabels.length >= 2){
    roLabels[0].textContent = t('speed');
    roLabels[1].textContent = t('gear');
  }
}

/* ======== СТИЛИ МОДАЛЬНОГО ОКНА ======== */
function injectStyles(){
  if (document.getElementById('settingsStyle')) return;
  var st = document.createElement('style');
  st.id = 'settingsStyle';
  st.textContent =
    '.settings-btn{position:fixed;top:8px;right:60px;z-index:1000;width:44px;height:44px;' +
      'border-radius:50%;border:1px solid #263547;background:rgba(20,28,38,.85);' +
      'color:#8fd8ff;font-size:20px;cursor:pointer;touch-action:manipulation;' +
      'display:flex;align-items:center;justify-content:center;padding:0}' +
    '.settings-btn:hover{border-color:#3a5170}' +
    '.settings-overlay{position:fixed;top:0;left:0;right:0;bottom:0;' +
      'background:rgba(5,10,15,.94);z-index:99999;display:flex;align-items:center;' +
      'justify-content:center;padding:20px;font-family:inherit}' +
    '.settings-modal{width:100%;max-width:380px;max-height:90vh;overflow-y:auto;' +
      'background:linear-gradient(180deg,#151d27,#0d131a);border:1px solid #22303f;' +
      'border-radius:16px;padding:18px;color:#dbe4ee;box-shadow:0 20px 60px rgba(0,0,0,.7)}' +
    '.settings-modal h2{font-size:14px;letter-spacing:3px;color:#8fd8ff;' +
      'text-transform:uppercase;margin:0 0 16px;font-weight:800;text-align:center}' +
    '.settings-section{margin-bottom:16px}' +
    '.settings-section h3{font-size:10px;letter-spacing:2px;color:#5d7189;' +
      'text-transform:uppercase;margin:0 0 8px;font-weight:700}' +
    '.lang-btn{width:100%;min-height:48px;margin-bottom:6px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);' +
      'color:#8ea4bd;font:700 14px/1.2 inherit;letter-spacing:.5px;cursor:pointer;' +
      'padding:0 14px;text-align:left;touch-action:manipulation;' +
      'display:flex;align-items:center;justify-content:space-between}' +
    '.lang-btn .check{color:#43c98a;font-size:16px;opacity:0}' +
    '.lang-btn.on{border-color:#43c98a;color:#e6fff3;' +
      'background:linear-gradient(180deg,#1c3d2e,#0e231a)}' +
    '.lang-btn.on .check{opacity:1}' +
    '.settings-close{width:100%;height:46px;border-radius:10px;' +
      'border:1px solid #2c3e52;background:linear-gradient(180deg,#1a2430,#0e161e);' +
      'color:#8ea4bd;font:800 12px/1 inherit;letter-spacing:1.5px;cursor:pointer;' +
      'text-transform:uppercase;touch-action:manipulation;margin-top:8px}' +
    '.settings-soon{color:#3d4a58;font-size:11px;font-style:italic;' +
      'padding:8px 0;letter-spacing:1px}';
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
  btn.addEventListener('click', openSettings);
  document.body.appendChild(btn);
}

/* ======== МОДАЛЬНОЕ ОКНО НАСТРОЕК ======== */
function openSettings(){
  closeSettings();
  var ov = document.createElement('div');
  ov.id = 'settingsOverlay';
  ov.className = 'settings-overlay';

  var m = document.createElement('div');
  m.className = 'settings-modal';

  var h = document.createElement('h2');
  h.textContent = '⚙ ' + t('settingsTitle');
  m.appendChild(h);

  /* --- Язык --- */
  var secLang = document.createElement('div');
  secLang.className = 'settings-section';
  var hLang = document.createElement('h3');
  hLang.textContent = t('language');
  secLang.appendChild(hLang);

  Object.keys(LANGS).forEach(function(code){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-btn' + (code === curLang ? ' on' : '');
    b.innerHTML = '<span>' + LANGS[code].label + '</span><span class="check">✓</span>';
    b.addEventListener('click', function(){
      setLang(code);
      // обновляем активную кнопку в открытом окне
      var all = m.querySelectorAll('.lang-btn');
      for (var i=0; i<all.length; i++) all[i].classList.remove('on');
      b.classList.add('on');
      // обновляем заголовок окна
      h.textContent = '⚙ ' + t('settingsTitle');
      hLang.textContent = t('language');
      // закрываем и открываем — чтобы применить переводы везде
      applyLang();
    });
    secLang.appendChild(b);
  });
  m.appendChild(secLang);

  /* --- Заглушка для будущих настроек --- */
  var secSoon = document.createElement('div');
  secSoon.className = 'settings-section';
  var hSoon = document.createElement('h3');
  hSoon.textContent = t('soon');
  secSoon.appendChild(hSoon);
  var soonDiv = document.createElement('div');
  soonDiv.className = 'settings-soon';
  soonDiv.textContent = '— ' + t('sound') + ', ' + t('repair') + ' —';
  secSoon.appendChild(soonDiv);
  m.appendChild(secSoon);

  /* --- Закрыть --- */
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'settings-close';
  closeBtn.textContent = t('close');
  closeBtn.addEventListener('click', closeSettings);
  m.appendChild(closeBtn);

  ov.appendChild(m);
  ov.addEventListener('click', function(e){
    if (e.target === ov) closeSettings();
  });
  document.body.appendChild(ov);
}

function closeSettings(){
  var ex = document.getElementById('settingsOverlay');
  if (ex) ex.remove();
}

/* ======== СМЕНА ЯЗЫКА ======== */
function setLang(code){
  if (!LANGS[code]) return;
  curLang = code;
  try { localStorage.setItem(LANG_KEY, code); } catch(e){}
  try { if (navigator.vibrate) navigator.vibrate(10); } catch(e){}
  applyLang();
  // обновить заголовки кнопок
  var sb = document.getElementById('settingsBtn');
  if (sb) sb.title = t('settingsTitle');
}

/* ======== СТАРТ ======== */
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