(function(){
"use strict";
var S=window.S;if(!S)return;

var MODE_KEY='dvs_control_mode';
var mode='auto';
try{mode=localStorage.getItem(MODE_KEY)||'auto';}catch(e){}
window.DVS_CONTROL_MODE=mode;

function isPcActive(){
  var m=window.DVS_CONTROL_MODE;
  if(m==='pc')return true;
  if(m==='phone'||m==='tablet')return false;
  return !('ontouchstart' in window) || navigator.maxTouchPoints===0;
}

window.DVS_SET_CONTROL_MODE=function(m){
  mode=m;
  try{localStorage.setItem(MODE_KEY,m);}catch(e){}
  window.DVS_CONTROL_MODE=m;
  applyMode();
};

/* ==== ПОДСКАЗКИ КЛАВИШ ==== */
function ensureHints(){
  if(document.getElementById('pcHints'))return;
  var h=document.createElement('div');
  h.id='pcHints';
  h.innerHTML=
    '<div class="ph-row"><b>W</b>/<b>↑</b> газ <b>S</b>/<b>↓</b> тормоз <b>A</b>/<b>D</b> сцепление</div>'+
    '<div class="ph-row"><b>Space</b> зажигание <b>Q</b>/<b>E</b> передача вниз/вверх</div>'+
    '<div class="ph-row"><b>1</b>–<b>6</b> передачи <b>R</b> задняя <b>N</b> нейтраль <b>Shift</b> ручник <b>H</b> гудок</div>';
  document.body.appendChild(h);
}

function ensureHintsStyle(){
  if(document.getElementById('pcHintsStyle'))return;
  var st=document.createElement('style');
  st.id='pcHintsStyle';
  st.textContent=
  '#pcHints{position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:9997;display:none;flex-direction:column;gap:3px;padding:8px 14px;border-radius:12px;background:rgba(15,15,15,.8);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);color:#b8c0c8;font:600 10px/1.4 "Segoe UI",sans-serif;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.5);pointer-events:none;max-width:90vw}'+
  '#pcHints .ph-row{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '#pcHints b{color:#f0f0f0;font-weight:700;padding:0 2px}'+
  'body.pc-mode #pcHints{display:flex}'+
  'body.pc-mode .pedals{display:none !important}'+
  'body.pc-mode .gears-box,body.pc-mode .gears-auto{opacity:0.35}'+
  'body.pc-mode .pedal{pointer-events:none}';
  document.head.appendChild(st);
}

function applyMode(){
  ensureHints();
  ensureHintsStyle();
  if(isPcActive())document.body.classList.add('pc-mode');
  else document.body.classList.remove('pc-mode');
}

/* ==== КЛАВИАТУРА ==== */
var keyMap={
  'KeyW':'gas','ArrowUp':'gas',
  'KeyS':'brake','ArrowDown':'brake',
  'KeyA':'clutch','ArrowLeft':'clutch',
  'KeyD':'clutch','ArrowRight':'clutch'
};

function down(e){
  if(!isPcActive())return;
  var t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;

  var k=e.code;
  if(keyMap[k]){
    e.preventDefault();
    S.pressed[keyMap[k]]=true;
    var idMap={gas:'pGas',brake:'pBrake',clutch:'pClutch'};
    var el=document.getElementById(idMap[keyMap[k]]);
    if(el)el.classList.add('active');
    return;
  }
  if(k==='Space'){
    e.preventDefault();
    var ib=document.getElementById('ignBtn');
    if(ib&&!e.repeat){
      var ev=new PointerEvent('pointerdown',{bubbles:true});
      ib.dispatchEvent(ev);
    }
    return;
  }
  if(k==='KeyQ'){
    e.preventDefault();
    if(S.setGear)S.setGear(Math.max(-1,(S.gear||0)-1));
    return;
  }
  if(k==='KeyE'){
    e.preventDefault();
    var E=S.engines&&S.engines[S.engineType];
    var maxG=E?(E.gears||6):6;
    if(S.setGear)S.setGear(Math.min(maxG,(S.gear||0)+1));
    return;
  }
  if(k==='KeyR'){e.preventDefault();if(S.setGear)S.setGear(-1);return;}
  if(k==='KeyN'){e.preventDefault();if(S.setGear)S.setGear(0);return;}
  if(k>='Digit1'&&k<='Digit6'){
    e.preventDefault();
    var g=parseInt(k.replace('Digit',''),10);
    if(S.setGear)S.setGear(g);
    return;
  }
  if(k==='ShiftLeft'||k==='ShiftRight'){
    e.preventDefault();S.handbrake=true;return;
  }
  if(k==='KeyH'){
    e.preventDefault();
    var hb=document.getElementById('hornBtn');
    if(hb)hb.click();
    return;
  }
}
function up(e){
  if(!isPcActive())return;
  var k=e.code;
  if(keyMap[k]){
    S.pressed[keyMap[k]]=false;
    var idMap={gas:'pGas',brake:'pBrake',clutch:'pClutch'};
    var el=document.getElementById(idMap[keyMap[k]]);
    if(el)el.classList.remove('active');
  }
  if(k==='Space'){
    var ib=document.getElementById('ignBtn');
    if(ib){
      var ev=new PointerEvent('pointerup',{bubbles:true});
      ib.dispatchEvent(ev);
    }
  }
  if(k==='ShiftLeft'||k==='ShiftRight')S.handbrake=false;
}

window.addEventListener('keydown',down);
window.addEventListener('keyup',up);
window.addEventListener('blur',function(){
  S.pressed.gas=false;S.pressed.brake=false;S.pressed.clutch=false;
  S.handbrake=false;
});

/* Авто-определение при загрузке и ресайзе */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyMode);
else applyMode();
window.addEventListener('resize',applyMode);

console.log('controls-pc.js: OK, mode='+mode);
})();