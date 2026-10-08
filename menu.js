(function(){
"use strict";

function initMenu(){
  var S = window.S;
  if (!S) { setTimeout(initMenu, 100); return; }

  var btns = document.querySelectorAll('.engbtn');
  if (!btns.length) return;

  var list = Array.prototype.slice.call(btns);

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
      S.engineType = type;
      try{ localStorage.setItem('dvs_engine', type); }catch(err){}
      paint(type);
      try{ if(navigator.vibrate) navigator.vibrate(10); }catch(err){}
    });
  });

  paint(S.engineType || 'r4');
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
})();