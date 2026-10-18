function openOther(){
  closeAll();
  var ov=makeOverlay();var m=makeModal();ov.appendChild(m);
  var h=document.createElement('h2');h.textContent='🔧 '+t('other');m.appendChild(h);
  var back=document.createElement('button');
  back.type='button';back.className='settings-back';back.textContent='‹ '+t('back');
  back.addEventListener('click',function(){closeAll();openMain();});m.appendChild(back);

  // ==== СКЕЛЕТ МАШИНЫ ====
  var isCar = localStorage.getItem('dvs_car_skeleton') === 'true';
  var cs = document.createElement('button');
  cs.type='button';cs.className='settings-item';
  cs.innerHTML='<div class="txt"><span class="lbl">🚗 Скелет машины</span><span class="sub" id="csSub">'+(isCar?'Включён':'Выключен')+'</span></div><div class="sound-toggle'+(isCar?' on':'')+'" id="csToggle"><div class="knob"></div></div>';
  cs.addEventListener('click', function(){
    var now = localStorage.getItem('dvs_car_skeleton') === 'true';
    localStorage.setItem('dvs_car_skeleton', String(!now));
    var tg=document.getElementById('csToggle');
    var sub=document.getElementById('csSub');
    if(tg)tg.classList.toggle('on',!now);
    if(sub)sub.textContent=!now?'Включён':'Выключен';
  });
  m.appendChild(cs);
  // =======================

  var best = (window.DVS_TIMER && window.DVS_TIMER.getBest) ? window.DVS_TIMER.getBest() : null;
  var tb=document.createElement('button');
  tb.type='button';tb.className='settings-item primary';
  tb.innerHTML='<div class="txt"><span class="lbl">⏱ '+t('timer')+'</span><span class="sub">'+t('timerBest')+': '+fmtTime(best)+'</span></div><span class="arrow">›</span>';
  tb.addEventListener('click',function(){closeAll();if(window.DVS_TIMER) window.DVS_TIMER.start();});
  m.appendChild(tb);

  if(best !== null){
    var rb=document.createElement('button');
    rb.type='button';rb.className='settings-item danger';
    rb.innerHTML='<div class="txt"><span class="lbl">🗑 '+t('timerReset')+'</span></div>';
    rb.addEventListener('click',function(){if(window.DVS_TIMER) window.DVS_TIMER.resetBest();closeAll();openOther();});
    m.appendChild(rb);
  }

  var cb=document.createElement('button');
  cb.type='button';cb.className='settings-close';cb.textContent=t('close');
  cb.addEventListener('click',closeAll);m.appendChild(cb);
  document.body.appendChild(ov);
}