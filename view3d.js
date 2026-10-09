function toggle(){
  if(active) hide3D();
  else show3D();
}

function show3D(){
  if(!window.THREE){console.warn('3D: no THREE');return;}
  if(!container){
    if(!setup()){console.warn('3D: setup failed');return;}
  }
  active=true;
  container.style.display='block';
  var gb=document.getElementById('ghostBtn');
  if(gb)gb.style.display='inline-block';
  var lb=document.getElementById('lockBtn');
  if(lb)lb.style.display='flex';

  var wrap=document.getElementById('engine3dCv').parentNode;
  var w=wrap.clientWidth,h=wrap.clientHeight;
  if(w&&h&&renderer){
    renderer.setSize(w,h);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
  if(window.DVS_3D_REBUILD){
    try{window.DVS_3D_REBUILD();}catch(e){console.warn('3D rebuild:',e);}
  }
  if(!animId)animate();
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
}

function hide3D(){
  active=false;
  if(container)container.style.display='none';
  if(animId){cancelAnimationFrame(animId);animId=null;}
}

function resize(){
  if(!active||!renderer)return;
  var ecv=document.getElementById('engine3dCv');
  if(!ecv)return;
  var wrap=ecv.parentNode;
  var w=wrap.clientWidth,h=wrap.clientHeight;
  if(w&&h){
    renderer.setSize(w,h);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
}

function toggleGhost(){setGhost(!ghost);}

function toggleLock(){
  var wrap=document.getElementById('engineWrap');
  var lb=document.getElementById('lockBtn');
  if(!wrap||!lb)return;
  var locked=wrap.classList.toggle('locked');
  lb.textContent=locked?'🔒':'🔓';
  lb.classList.toggle('on',locked);
  isDown=false;pinch=0;
  try{if(navigator.vibrate)navigator.vibrate(locked?[20,30]:10);}catch(e){}
}

function attachBtn(){
  var gb=document.getElementById('ghostBtn');
  if(gb){
    gb.style.display='none';
    gb.addEventListener('click',function(e){e.preventDefault();toggleGhost();});
  }
  var lb=document.getElementById('lockBtn');
  if(lb){
    lb.style.display='none';
    lb.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();toggleLock();});
  }
}

window.DVS_3D={
  toggle:toggle,
  show3D:show3D,
  hide3D:hide3D,
  toggleGhost:toggleGhost,
  toggleLock:toggleLock,
  resize:resize,
  isActive:function(){return active;}
};