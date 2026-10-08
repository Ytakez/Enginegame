(function(){
"use strict";
window.addEventListener('error', function(ev){
  var e = document.getElementById('err');
  if (e){ e.style.display='block'; e.textContent='ОШИБКА: ' + ev.message + ' | ' + (ev.filename||'') + ':' + (ev.lineno||0); }
});
try {
  var ecv = document.getElementById('engineCv');
  var ectx = ecv.getContext('2d');
  ectx.fillStyle = '#00ff00';
  ectx.fillRect(20, 20, 200, 100);
  ectx.fillStyle = '#ffffff';
  ectx.font = 'bold 24px sans-serif';
  ectx.fillText('CANVAS OK', 40, 80);
} catch(e){
  var box = document.getElementById('err');
  if (box){ box.style.display='block'; box.textContent='TEST: ' + e.message; }
}
})();