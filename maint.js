(function(){
"use strict";
var PIN='swagaswinus1488Svat';

function isAdmin(){
  try{return localStorage.getItem('dvs_admin_skip')==='1';}catch(e){return false;}
}

function showMaint(cfg){
  if(document.getElementById('maintOverlay'))return;
  var ov=document.createElement('div');
  ov.id='maintOverlay';
  ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 30%,#1e2a38 0%,#0a0e13 70%);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;font-family:"Segoe UI",system-ui,sans-serif;color:#dbe4ee;overflow-y:auto';
  var html='<div id="maintIcon" style="font-size:80px;line-height:1;animation:mSpin 3s linear infinite;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent">🛠️</div>';
  html+='<h2 id="maintTitle" style="color:#ffc93c;letter-spacing:3px;margin:24px 0 16px;font-size:20px;font-weight:800;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent">'+(cfg.title||'ТЕХОБСЛУЖИВАНИЕ')+'</h2>';
  html+='<p style="color:#8ea4bd;max-width:440px;line-height:1.7;font-size:15px;margin:0 0 20px">'+(cfg.message||'Сайт временно закрыт.')+'</p>';
  if(cfg.news){
    html+='<div style="background:rgba(67,201,138,.08);border:1px solid rgba(67,201,138,.4);border-radius:12px;padding:14px 20px;max-width:440px;margin-bottom:24px">';
    html+='<div style="color:#43c98a;font-size:10px;letter-spacing:2px;font-weight:700;margin-bottom:6px">НОВОСТИ</div>';
    html+='<div style="color:#e8f5ee;font-size:14px;line-height:1.5">'+cfg.news+'</div></div>';
  }
  if(cfg.telegram){
    html+='<a href="'+cfg.telegram+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:10px;padding:14px 26px;border-radius:12px;background:linear-gradient(180deg,#2b7a56,#1c5a3d);border:1px solid #43c98a;color:#e6fff3;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:1px;box-shadow:0 0 24px rgba(67,201,138,.4)">'+(cfg.telegramText||'📢 Telegram')+'</a>';
  }
  html+='<div id="maintFooter" style="margin-top:32px;color:#3d4a58;font-size:11px;letter-spacing:2px;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;padding:10px">ДВС — СИМУЛЯТОР</div>';
  var st=document.createElement('style');
  st.textContent='@keyframes mSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
  ov.innerHTML=html;
  document.body.appendChild(ov);

  function attachTap(el){
    if(!el)return;
    var taps=0,tmr=null,lastTap=0;
    function onTap(e){
      e.preventDefault();
      e.stopPropagation();
      var now=Date.now();
      if(now-lastTap>1500)taps=0;
      lastTap=now;
      taps++;
      if(tmr)clearTimeout(tmr);
      tmr=setTimeout(function(){taps=0;},3000);
      try{if(navigator.vibrate)navigator.vibrate(20);}catch(err){}
      if(taps>=5){
        taps=0;
        clearTimeout(tmr);
        tryAdmin();
      }
    }
    el.addEventListener('click',onTap);
    el.addEventListener('touchstart',function(ev){onTap(ev);},{passive:false});
  }
  attachTap(document.getElementById('maintIcon'));
  attachTap(document.getElementById('maintTitle'));
  attachTap(document.getElementById('maintFooter'));
}

function tryAdmin(){
  var p=prompt('PIN админа:');
  if(p===null)return;
  var clean=String(p).trim();
  var cleanLower=clean.toLowerCase();
  var pinLower=String(PIN).toLowerCase();
  if(clean===PIN||cleanLower===pinLower){
    try{localStorage.setItem('dvs_admin_skip','1');}catch(e){}
    location.reload();
  } else {
    /* Показать оба пароля для сравнения */
    var msg='❌ Неверный PIN\n\n';
    msg+='Ты ввёл:\n"'+clean+'"\n\n';
    msg+='Ожидается:\n"'+PIN+'"\n\n';
    msg+='Длина введённого: '+clean.length+'\n';
    msg+='Длина ожидаемого: '+PIN.length;
    alert(msg);
  }
}

/* Проверка ТО */
fetch('config.json?'+Date.now())
  .then(function(r){return r.ok?r.json():null;})
  .catch(function(){return null;})
  .then(function(cfg){
    if(!cfg||!cfg.maintenance)return;
    if(isAdmin())return;
    showMaint(cfg);
  });
})();