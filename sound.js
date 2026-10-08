/* Кнопка динамика в правом верхнем углу */
var muteBtn = document.createElement('button');
muteBtn.type = 'button';
muteBtn.id = 'muteBtn';
muteBtn.textContent = muted ? '🔇' : '🔊';
muteBtn.setAttribute('style',
  'position:fixed;top:8px;right:8px;z-index:1000;width:44px;height:44px;' +
  'border-radius:50%;border:1px solid #263547;background:rgba(20,28,38,.85);' +
  'color:#8fd8ff;font-size:18px;cursor:pointer;touch-action:manipulation');
muteBtn.addEventListener('click', function(){
  toggleMute();
  muteBtn.textContent = muted ? '🔇' : '🔊';
});
document.body.appendChild(muteBtn);

/* Синхронизация иконки кнопки при изменении из настроек */
setInterval(function(){
  var b = document.getElementById('muteBtn');
  if (b && b.textContent !== (muted ? '🔇' : '🔊')){
    b.textContent = muted ? '🔇' : '🔊';
  }
}, 300);