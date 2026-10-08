(function(){
"use strict";

/* Этот файл теперь только обновляет бейдж текущего двигателя */
function update(){
  var S = window.S;
  if (!S) { setTimeout(update, 200); return; }
  var b = document.getElementById('engBadge');
  if (!b) return;
  var E = S.engines[S.engineType];
  if (E) b.textContent = E.name;
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(update, 100); });
} else {
  setTimeout(update, 100);
}

/* Обновлять бейдж при переключении (перехватываем setEngine) */
setInterval(function(){
  var S = window.S;
  if (!S) return;
  var b = document.getElementById('engBadge');
  if (!b) return;
  var E = S.engines[S.engineType];
  if (E && b.textContent !== E.name) b.textContent = E.name;
}, 500);

})();