(function(){
"use strict";

var P = window.DVS_PROFILE;
if(!P){ console.warn('login.js: profile.js не загружен'); return; }

/* ==================== СТИЛИ ==================== */
function injectStyles(){
  if(document.getElementById('loginStyle')) return;
  var st = document.createElement('style');
  st.id = 'loginStyle';
  st.textContent =
  '#loginOverlay{position:fixed;inset:0;z-index:99999;'+
  'background:radial-gradient(ellipse at 50% 0%, #1a2430 0%, #000 70%);'+
  'display:flex;align-items:center;justify-content:center;padding:20px;'+
  'font-family:-apple-system,Inter,sans-serif;color:#e8e8e8;'+
  'animation:loginFadeIn .4s ease-out}'+
  '@keyframes loginFadeIn{from{opacity:0}to{opacity:1}}'+
  '#loginOverlay.hide{display:none !important}'+

  '.login-card{width:100%;max-width:400px;padding:26px 22px;border-radius:24px;'+
  'background:rgba(15,15,15,.6);backdrop-filter:blur(50px) saturate(140%);'+
  '-webkit-backdrop-filter:blur(50px) saturate(140%);'+
  'border:1px solid rgba(255,255,255,.08);'+
  'box-shadow:0 24px 80px rgba(0,0,0,.8)}'+

  '.login-title{font:700 14px/1 inherit;letter-spacing:6px;'+
  'text-transform:uppercase;text-align:center;margin-bottom:6px;color:#f0f0f0}'+
  '.login-sub{font:500 10px/1.4 inherit;text-align:center;color:#6a6a6a;'+
  'letter-spacing:1px;margin-bottom:22px}'+

  '.slot{width:100%;min-height:64px;margin-bottom:10px;padding:12px 16px;'+
  'border-radius:16px;border:1px solid rgba(255,255,255,.08);'+
  'background:rgba(25,25,25,.55);color:#c0c0c0;'+
  'font:600 14px/1.3 inherit;text-align:left;cursor:pointer;'+
  'display:flex;align-items:center;gap:12px;'+
  'transition:background .2s,border-color .2s,transform .15s}'+
  '.slot:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.16)}'+
  '.slot:active{transform:scale(.98)}'+
  '.slot.empty{border-style:dashed;color:#6a6a6a;background:rgba(20,20,20,.35)}'+
  '.slot.empty:hover{border-color:rgba(255,255,255,.22);color:#a0a0a0}'+
  '.slot.locked{border-color:rgba(232,232,90,.3)}'+
  '.slot-icon{font-size:26px;flex:0 0 auto;width:36px;text-align:center}'+
  '.slot-txt{flex:1 1 auto;min-width:0}'+
  '.slot-name{display:block;font-size:15px;font-weight:700;color:#f0f0f0;'+
  'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '.slot-sub{display:block;font-size:10px;color:#7a7a7a;margin-top:3px;'+
  'letter-spacing:.5px;font-weight:500}'+
  '.slot-lock{font-size:18px;color:#e8e85a;flex:0 0 auto}'+
  '.slot-arrow{font-size:20px;color:#5a5a5a;flex:0 0 auto}'+

  '.login-input{width:100%;height:52px;margin-bottom:10px;padding:0 16px;'+
  'border-radius:14px;border:1px solid rgba(255,255,255,.08);'+
  'background:rgba(20,20,20,.5);color:#e8e8e8;'+
  'font:600 15px/1 inherit;letter-spacing:1px;'+
  'outline:none;box-sizing:border-box;-webkit-appearance:none}'+
  '.login-input:focus{border-color:rgba(232,232,90,.5);'+
  'background:rgba(25,25,25,.7)}'+
  '.login-input::placeholder{color:#5a5a5a;font-weight:500}'+

  '.pin-row{display:flex;gap:8px;justify-content:center;margin:14px 0 18px}'+
  '.pin-dot{width:50px;height:58px;border-radius:14px;'+
  'border:1px solid rgba(255,255,255,.1);background:rgba(20,20,20,.5);'+
  'color:#f0f0f0;font:700 24px/1 inherit;text-align:center;'+
  'display:flex;align-items:center;justify-content:center;'+
  'outline:none;-webkit-appearance:none;box-sizing:border-box;'+
  'padding:0;transition:border-color .2s,background .2s}'+
  '.pin-dot:focus{border-color:rgba(232,232,90,.6);background:rgba(30,30,30,.8)}'+
  '.pin-dot.filled{border-color:rgba(255,255,255,.25);background:rgba(40,40,40,.7)}'+
  '.pin-dot.error{border-color:rgba(255,80,80,.7);background:rgba(60,20,20,.6);'+
  'animation:pinShake .3s}'+
  '@keyframes pinShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'+

  '.login-btn{width:100%;height:52px;margin-top:6px;border-radius:14px;'+
  'border:1px solid rgba(232,232,90,.4);background:rgba(232,232,90,.15);'+
  'color:#f0f0d0;font:700 13px/1 inherit;letter-spacing:2.5px;'+
  'text-transform:uppercase;cursor:pointer;'+
  'transition:background .2s,border-color .2s,color .2s}'+
  '.login-btn:hover{background:rgba(232,232,90,.25);border-color:rgba(232,232,90,.7)}'+
  '.login-btn:active{transform:scale(.98)}'+
  '.login-btn:disabled{opacity:.4;cursor:not-allowed}'+
  '.login-btn.secondary{border-color:rgba(255,255,255,.08);'+
  'background:rgba(25,25,25,.5);color:#a0a0a0;letter-spacing:2px}'+
  '.login-btn.secondary:hover{background:rgba(255,255,255,.06);color:#e0e0e0}'+
  '.login-btn.danger{border-color:rgba(220,80,80,.35);'+
  'background:rgba(140,30,30,.25);color:#ffb8b8}'+
  '.login-btn.danger:hover{background:rgba(200,50,50,.35);border-color:rgba(255,100,100,.6)}'+

  '.login-err{min-height:16px;text-align:center;font:600 11px/1.3 inherit;'+
  'color:#ff7070;margin-bottom:6px;letter-spacing:.5px}'+

  '.login-back{display:inline-block;font-size:13px;color:#6a6a6a;'+
  'cursor:pointer;margin-bottom:14px;font-weight:600;'+
  'letter-spacing:1px;user-select:none}'+
  '.login-back:hover{color:#c0c0c0}'+

  '.login-hint{text-align:center;font-size:10px;color:#5a5a5a;'+
  'margin-top:12px;line-height:1.5;letter-spacing:.5px}';

  document.head.appendChild(st);
}

/* ==================== СОСТОЯНИЕ ==================== */
var overlay = null;
var currentScreen = null;

/* ==================== ОСНОВНЫЕ ЭКРАНЫ ==================== */
function show(){
  injectStyles();
  if(overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = 'loginOverlay';
  document.body.appendChild(overlay);
  screenMain();
}

function hide(){
  if(overlay){
    overlay.classList.add('hide');
    setTimeout(function(){ if(overlay) overlay.remove(); overlay = null; }, 300);
  }
}

function clearScreen(){
  while(overlay.firstChild) overlay.removeChild(overlay.firstChild);
  currentScreen = null;
}

/* ==================== ЭКРАН 1: СПИСОК ПРОФИЛЕЙ ==================== */
function screenMain(){
  clearScreen();
  currentScreen = 'main';
  var card = document.createElement('div');
  card.className = 'login-card';
  overlay.appendChild(card);

  var t = document.createElement('div');
  t.className = 'login-title';
  t.textContent = 'ДВС Симулятор';
  card.appendChild(t);

  var s = document.createElement('div');
  s.className = 'login-sub';
  s.textContent = 'Выбери профиль';
  card.appendChild(s);

  var profiles = P.getAll();
  for(var i = 0; i < profiles.length; i++){
    (function(slotId, prof){
      var btn = document.createElement('button');
      btn.type = 'button';

      if(prof){
        btn.className = 'slot' + (prof.pinHash ? ' locked' : '');
        var icon = document.createElement('div');
        icon.className = 'slot-icon';
        icon.textContent = '👤';
        btn.appendChild(icon);

        var txt = document.createElement('div');
        txt.className = 'slot-txt';
        var nm = document.createElement('span');
        nm.className = 'slot-name';
        nm.textContent = prof.name;
        txt.appendChild(nm);
        var sub = document.createElement('span');
        sub.className = 'slot-sub';
        var ach = (prof.achievements || []).length;
        var km = ((prof.stats.totalDistance || 0) / 1000).toFixed(1);
        sub.textContent = '🏆 ' + ach + '  ·  🛣 ' + km + ' км';
        txt.appendChild(sub);
        btn.appendChild(txt);

        if(prof.pinHash){
          var lk = document.createElement('div');
          lk.className = 'slot-lock';
          lk.textContent = '🔒';
          btn.appendChild(lk);
        } else {
          var ar = document.createElement('div');
          ar.className = 'slot-arrow';
          ar.textContent = '›';
          btn.appendChild(ar);
        }

        btn.addEventListener('click', function(){
          if(prof.pinHash) screenPin(slotId, prof);
          else doLogin(slotId, null);
        });
      } else {
        btn.className = 'slot empty';
        var ic2 = document.createElement('div');
        ic2.className = 'slot-icon';
        ic2.textContent = '➕';
        btn.appendChild(ic2);
        var tx2 = document.createElement('div');
        tx2.className = 'slot-txt';
        var n2 = document.createElement('span');
        n2.className = 'slot-name';
        n2.textContent = 'Создать профиль';
        tx2.appendChild(n2);
        var s2 = document.createElement('span');
        s2.className = 'slot-sub';
        s2.textContent = 'Слот ' + slotId;
        tx2.appendChild(s2);
        btn.appendChild(tx2);
        btn.addEventListener('click', function(){ screenCreate(slotId); });
      }

      card.appendChild(btn);
    })(i + 1, profiles[i]);
  }

  var hint = document.createElement('div');
  hint.className = 'login-hint';
  hint.textContent = 'Данные хранятся только на этом устройстве';
  card.appendChild(hint);
}

/* ==================== ЭКРАН 2: СОЗДАНИЕ ==================== */
function screenCreate(slotId){
  clearScreen();
  currentScreen = 'create';
  var card = document.createElement('div');
  card.className = 'login-card';
  overlay.appendChild(card);

  var back = document.createElement('div');
  back.className = 'login-back';
  back.textContent = '‹ Назад';
  back.addEventListener('click', screenMain);
  card.appendChild(back);

  var t = document.createElement('div');
  t.className = 'login-title';
  t.textContent = 'Новый профиль';
  card.appendChild(t);

  var s = document.createElement('div');
  s.className = 'login-sub';
  s.textContent = 'Слот ' + slotId;
  card.appendChild(s);

  var err = document.createElement('div');
  err.className = 'login-err';
  card.appendChild(err);

  var nameInput = document.createElement('input');
  nameInput.className = 'login-input';
  nameInput.type = 'text';
  nameInput.placeholder = 'Имя (до 14 символов)';
  nameInput.maxLength = 14;
  nameInput.autocomplete = 'off';
  card.appendChild(nameInput);

  var pinLabel = document.createElement('div');
  pinLabel.style.cssText = 'font-size:10px;color:#6a6a6a;letter-spacing:1px;'+
    'text-transform:uppercase;margin:14px 0 8px;font-weight:600';
  pinLabel.textContent = 'PIN-код (необязательно)';
  card.appendChild(pinLabel);

  var pinWrap = document.createElement('div');
  pinWrap.className = 'pin-row';
  card.appendChild(pinWrap);

  var pinInputs = [];
  for(var i = 0; i < 4; i++){
    (function(idx){
      var inp = document.createElement('input');
      inp.className = 'pin-dot';
      inp.type = 'tel';
      inp.inputMode = 'numeric';
      inp.maxLength = 1;
      inp.autocomplete = 'off';
      inp.addEventListener('input', function(){
        inp.value = inp.value.replace(/\D/g,'');
        if(inp.value) inp.classList.add('filled');
        else inp.classList.remove('filled');
        if(inp.value && idx < 3) pinInputs[idx + 1].focus();
      });
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Backspace' && !inp.value && idx > 0){
          pinInputs[idx - 1].focus();
          pinInputs[idx - 1].value = '';
          pinInputs[idx - 1].classList.remove('filled');
        }
      });
      pinInputs.push(inp);
      pinWrap.appendChild(inp);
    })(i);
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'login-btn';
  btn.textContent = 'Создать';
  btn.addEventListener('click', function(){
    err.textContent = '';
    var name = nameInput.value.trim();
    if(!name){ err.textContent = 'Введи имя'; nameInput.focus(); return; }

    var pin = '';
    for(var j = 0; j < 4; j++){
      var v = pinInputs[j].value.replace(/\D/g,'');
      if(v) pin += v;
    }
    if(pin && pin.length < 4){
      err.textContent = 'PIN — 4 цифры или оставь пустым';
      return;
    }

    var res = P.create(slotId, name, pin || null);
    if(!res.ok){ err.textContent = res.err || 'Ошибка'; return; }
    doLogin(slotId, pin || null);
  });
  card.appendChild(btn);

  var hint = document.createElement('div');
  hint.className = 'login-hint';
  hint.textContent = 'PIN защитит достижения от случайного удаления';
  card.appendChild(hint);

  setTimeout(function(){ nameInput.focus(); }, 100);
}

/* ==================== ЭКРАН 3: ВВОД PIN ==================== */
function screenPin(slotId, prof){
  clearScreen();
  currentScreen = 'pin';
  var card = document.createElement('div');
  card.className = 'login-card';
  overlay.appendChild(card);

  var back = document.createElement('div');
  back.className = 'login-back';
  back.textContent = '‹ Назад';
  back.addEventListener('click', screenMain);
  card.appendChild(back);

  var t = document.createElement('div');
  t.className = 'login-title';
  t.textContent = prof.name;
  card.appendChild(t);

  var s = document.createElement('div');
  s.className = 'login-sub';
  s.textContent = 'Введи PIN-код';
  card.appendChild(s);

  var err = document.createElement('div');
  err.className = 'login-err';
  card.appendChild(err);

  var pinWrap = document.createElement('div');
  pinWrap.className = 'pin-row';
  card.appendChild(pinWrap);

  var pinInputs = [];
  var autoCheck = null;

  for(var i = 0; i < 4; i++){
    (function(idx){
      var inp = document.createElement('input');
      inp.className = 'pin-dot';
      inp.type = 'tel';
      inp.inputMode = 'numeric';
      inp.maxLength = 1;
      inp.autocomplete = 'off';
      inp.addEventListener('input', function(){
        inp.value = inp.value.replace(/\D/g,'');
        if(inp.value) inp.classList.add('filled');
        else inp.classList.remove('filled');
        if(inp.value && idx < 3) pinInputs[idx + 1].focus();
        if(idx === 3 && inp.value){
          clearTimeout(autoCheck);
          autoCheck = setTimeout(tryLogin, 180);
        }
      });
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Backspace' && !inp.value && idx > 0){
          pinInputs[idx - 1].focus();
          pinInputs[idx - 1].value = '';
          pinInputs[idx - 1].classList.remove('filled');
        }
        if(e.key === 'Enter') tryLogin();
      });
      pinInputs.push(inp);
      pinWrap.appendChild(inp);
    })(i);
  }

  function tryLogin(){
    var pin = '';
    for(var j = 0; j < 4; j++) pin += pinInputs[j].value.replace(/\D/g,'');
    if(pin.length < 4) return;
    var r = P.checkPin(slotId, pin);
    if(r.ok){
      doLogin(slotId, pin);
    } else {
      err.textContent = 'Неверный PIN';
      for(var k = 0; k < 4; k++){
        pinInputs[k].classList.add('error');
        pinInputs[k].value = '';
        pinInputs[k].classList.remove('filled');
      }
      try{ if(navigator.vibrate) navigator.vibrate([60,40,60]); }catch(e){}
      setTimeout(function(){
        for(var m = 0; m < 4; m++) pinInputs[m].classList.remove('error');
        pinInputs[0].focus();
      }, 400);
    }
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'login-btn';
  btn.textContent = 'Войти';
  btn.addEventListener('click', tryLogin);
  card.appendChild(btn);

  var del = document.createElement('button');
  del.type = 'button';
  del.className = 'login-btn danger';
  del.style.marginTop = '10px';
  del.style.height = '42px';
  del.textContent = 'Забыл PIN — удалить профиль';
  del.addEventListener('click', function(){
    if(confirm('Удалить профиль "' + prof.name + '"? Достижения будут потеряны.')){
      P.remove(slotId);
      screenMain();
    }
  });
  card.appendChild(del);

  setTimeout(function(){ pinInputs[0].focus(); }, 100);
}

/* ==================== ВХОД ==================== */
function doLogin(slotId, pin){
  var r = P.login(slotId, pin);
  if(!r.ok){
    console.warn('login error:', r.err);
    return;
  }
  var prof = r.profile;
  console.log('Профиль вошёл:', prof.name);

  /* Применяем настройки профиля к игре */
  applyProfileSettings(prof);

  hide();

  /* Событие для других модулей */
  try{
    window.dispatchEvent(new CustomEvent('dvs:login', { detail: { profile: prof } }));
  }catch(e){}
}

function applyProfileSettings(prof){
  var S = window.S;
  if(!S) return;
  var st = prof.settings || {};

  /* Двигатель */
  if(st.engineType && S.engines && S.engines[st.engineType] && S.setEngine){
    try{ S.setEngine(st.engineType); }catch(e){}
  }
  /* Погода */
  if(st.weather && S.setWeather){
    try{ S.setWeather(st.weather); }catch(e){}
  }
}

/* ==================== ПУБЛИЧНЫЙ API ==================== */
window.DVS_LOGIN = {
  show: show,
  hide: hide,
  isOpen: function(){ return !!overlay && !overlay.classList.contains('hide'); }
};

/* ==================== АВТОЗАПУСК ==================== */
function boot(){
  if(!window.DVS_PROFILE) return;
  /* Если уже кто-то вошёл — не показываем */
  if(P.isLoggedIn()){
    var prof = P.getActive();
    if(prof){
      applyProfileSettings(prof);
      console.log('Автовход:', prof.name);
      return;
    }
  }
  /* Показываем экран входа */
  setTimeout(show, 150);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 400); });
} else {
  setTimeout(boot, 400);
}

})();