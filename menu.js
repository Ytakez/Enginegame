(function(){
"use strict";

function initMenu(){
  var S = window.S;
  if (!S) { setTimeout(initMenu, 100); return; }

  var list = Array.prototype.slice.call(document.querySelectorAll('.engbtn'));
  if (!list.length) return;

  function paint(type){
    list.forEach(function(b){
      b.classList.toggle('on', b.dataset.eng === type);
    });
  }

  list.forEach(function(b){
    b.addEventListener('click', function(e){
      e.preventDefault();
      var type = b.dataset.eng;
      if (!type) return;
      if (S.setEngine) S.setEngine(type);
      paint(type);
      try{ if(navigator.vibrate) navigator.vibrate(10); }catch(err){}
    });
  });

  // очистить старое значение из localStorage (v6/v12) и записать текущее
  try {
    var old = localStorage.getItem('dvs_engine');
    if (old && old !== 'r4' && old !== 'v8' && old !== 'v16'){
      localStorage.removeItem('dvs_engine');
    }
  } catch(err){}

  paint(S.engineType || 'r4');
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
})();