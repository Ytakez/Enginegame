(function(){
"use strict";
var S=window.S;if(!S)return;

var MODE_KEY='dvs_control_mode';
var mode='auto';
try{mode=localStorage.getItem(MODE_KEY)||'auto';}catch(e){}
window.DVS_CONTROL_MODE=mode;

window.DVS_SET_CONTROL_MODE=function(m){
  mode=m;
  try{localStorage.setItem(MODE_KEY,m);}catch(e){}
  window.DVS_CONTROL_MODE=m;
};

function isPcActive(){
  var m=window.DVS_CONTROL_MODE;
  if(m==='pc')return true;
  if(m==='phone'||m==='tablet')return false;
  /* auto — определяем по устройству */
  return !('ontouchstart' in window) || navigator.maxTouchPoints===0;
}

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
    var el=document.getElementById('p'+keyMap[k].charAt(0).toUpperCase()+keyMap[k].slice(1));
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
    e.preventDefault();
    S.handbrake=true;
    return;
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
    var el=document.getElementById('p'+keyMap[k].charAt(0).toUpperCase()+keyMap[k].slice(1));
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

console.log('controls-pc.js: OK, mode='+mode);
})();