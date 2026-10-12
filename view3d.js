(function(){
"use strict";
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.5,rotY=0.6,dist=18,isDown=false,lastX=0,lastY=0,pinch=0;
var _ready=false;

function updCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy2=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy2+4,cz);
  camera.lookAt(0,3.5,0);
}

function setup(){
  if(_ready)return true;
  if(!window.THREE)return false;
  var ecv=document.getElementById('engineCv');if(!ecv)return false;
  var wrap=ecv.parentNode;if(!wrap)return false;
  wrap.style.position='relative';
  if(document.getElementById('view3dBox')){container=document.getElementById('view3dBox');_ready=true;return true;}
  container=document.createElement('div');
  container.id='view3dBox';
  container.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;display:none;z-index:5;background:#151a20';
  wrap.appendChild(container);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x151a20);
  var w=wrap.clientWidth||360,h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,300);
  updCam();
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(w,h);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff,0.8));
  scene.add(new THREE.HemisphereLight(0xcce0ff,0x3a2818,0.8));
  var L1=new THREE.DirectionalLight(0xffffff,1.5);L1.position.set(14,24,16);scene.add(L1);
  var L2=new THREE.DirectionalLight(0x88aaff,0.9);L2.position.set(-16,10,-16);scene.add(L2);
  controls();
  _ready=true;
  return true;
}

function controls(){
  var el=renderer.domElement;
  function down(e){
    if(e.touches&&e.touches.length===1){isDown=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;}
    else if(e.touches&&e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      pinch=Math.hypot(dx,dy);isDown=false;
    }else if(!e.touches){isDown=true;lastX=e.clientX;lastY=e.clientY;}
  }
  function move(e){
    if(e.touches&&e.touches.length===1&&isDown){
      e.preventDefault();
      rotY+=(e.touches[0].clientX-lastX)*0.012;
      rotX+=(e.touches[0].clientY-lastY)*0.012;
      rotX=Math.max(-1.3,Math.min(1.3,rotX));
      lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;updCam();
    }else if(e.touches&&e.touches.length===2&&pinch){
      e.preventDefault();
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      var nd=Math.hypot(dx,dy);
      dist*=pinch/nd;dist=Math.max(7,Math.min(45,dist));
      pinch=nd;updCam();
    }else if(!e.touches&&isDown){
      rotY+=(e.clientX-lastX)*0.012;rotX+=(e.clientY-lastY)*0.012;
      rotX=Math.max(-1.3,Math.min(1.3,rotX));
      lastX=e.clientX;lastY=e.clientY;updCam();
    }
  }
  function up(){isDown=false;pinch=0;}
  el.addEventListener('touchstart',down,{passive:false});
  el.addEventListener('touchmove',move,{passive:false});
  el.addEventListener('touchend',up);
  el.addEventListener('mousedown',down);
  el.addEventListener('mousemove',move);
  el.addEventListener('mouseup',up);
}

function animate(){
  if(!active||!scene){animId=null;return;}
  animId=requestAnimationFrame(animate);
  var ang=S.crankAngle||0;
  if(window.DVS_3D_ANIM)window.DVS_3D_ANIM(ang);
  renderer.render(scene,camera);
}

function resize(){
  if(!renderer||!camera)return;
  var ecv=document.getElementById('engineCv');if(!ecv)return;
  var wrap=ecv.parentNode;
  var w=wrap.clientWidth,h=wrap.clientHeight;
  if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
}

function show3D(){
  if(!setup())return;
  active=true;container.style.display='block';
  var gb=document.getElementById('ghostBtn');if(gb)gb.style.display='inline-block';
  var vb=document.getElementById('view3dBtn');if(vb)vb.textContent='📊 2D';
  resize();setTimeout(resize,150);setTimeout(resize,400);
  if(window.DVS_3D_REBUILD)try{window.DVS_3D_REBUILD();}catch(e){console.warn(e);}
  if(!animId)animate();
}

function hide3D(){
  active=false;
  if(container)container.style.display='none';
  if(animId){cancelAnimationFrame(animId);animId=null;}
  var gb=document.getElementById('ghostBtn');if(gb)gb.style.display='none';
  var vb=document.getElementById('view3dBtn');if(vb)vb.textContent='🎥 3D';
}

function toggleGhost(){
  if(window.DVS_3D_TOGGLE_GHOST)window.DVS_3D_TOGGLE_GHOST();
}

function attachBtn(){
  var vb=document.getElementById('view3dBtn');
  if(vb)vb.addEventListener('click',function(e){e.preventDefault();if(active)hide3D();else show3D();});
  var gb=document.getElementById('ghostBtn');
  if(gb){
    gb.style.display='none';
    gb.addEventListener('click',function(e){e.preventDefault();toggleGhost();});
  }
  console.log('view3d.js: OK');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachBtn);
else attachBtn();

window.DVS_3D={
  show3D:show3D,
  hide3D:hide3D,
  toggle:function(){if(active)hide3D();else show3D();},
  toggleGhost:toggleGhost,
  resize:resize,
  isActive:function(){return active;},
  getScene:function(){return scene;}
};
console.log('view3d.js: загружен');
})();