(function(){
"use strict";
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.4,rotY=0.7,dist=14,isDown=false,lastX=0,lastY=0,pinch=0;
var _ready=false;
var _asm=[],_cranks=[],_flies=[];
var _blockM=[],_headM=[],_coverM=[],_ribM=[],_camSingles=[],_cams=[],_beltT,_beltB;

window.DVS_3D_BUILD={
  m:function(c,a,b){return new THREE.MeshStandardMaterial({color:c,metalness:a===undefined?0.85:a,roughness:b===undefined?0.35:b});},
  cy:function(r,h,s,c,a,b){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),window.DVS_3D_BUILD.m(c,a,b));},
  bx:function(w,h,d,c,a,b){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),window.DVS_3D_BUILD.m(c,a,b));},
  bl:function(){return null;}
};
window.DVS_3D_REF={
  getScene:function(){return scene;},
  getRoot:function(){return window._3dRoot||null;},
  setRoot:function(r){window._3dRoot=r;},
  setCrank:function(g){if(g)_cranks.push(g);},
  setFly:function(g){if(g)_flies.push(g);},
  setCam:function(g){if(g)_camSingles.push(g);},
  setBeltT:function(g){_beltT=g;},
  setBeltB:function(g){_beltB=g;},
  setAsm:function(a){if(a)_asm=_asm.concat(a);},
  setCams:function(c){_cams=c||[];},
  pushBlock:function(x){if(x)_blockM.push(x);},
  pushHead:function(x){if(x)_headM.push(x);},
  pushCover:function(x){if(x)_coverM.push(x);},
  pushRib:function(x){if(x)_ribM.push(x);},
  clearAll:function(){_blockM=[];_headM=[];_coverM=[];_ribM=[];_asm=[];_cams=[];_cranks=[];_flies=[];_camSingles=[];}
};

function smartRebuild(attempt){
  attempt=attempt||0;
  var R=window.DVS_3D_REF;
  var sc=R.getScene(); if(!sc)return;
  if(!window.DVS_3D_BUILDERS){
    if(attempt<20){setTimeout(function(){smartRebuild(attempt+1);},200);return;}
    console.warn('Нет DVS_3D_BUILDERS');
    return;
  }
  var old=R.getRoot();
  if(old){while(old.children.length){var c=old.children.pop();if(c.geometry)try{c.geometry.dispose();}catch(e){}if(c.material)try{c.material.dispose();}catch(e){};}sc.remove(old);}
  R.clearAll();
  window._dvsWankelRotors=[];window._dvsWankelPins=[];window._dvsWankelFlashes=[];window._dciPartsArr=[];
  var root=new THREE.Group();sc.add(root);R.setRoot(root);
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'');
  var B=window.DVS_3D_BUILDERS, fn=B.r4;
  for(var k in B){ if(k.toLowerCase()===raw){fn=B[k];break;} }
  if(fn){try{fn(root);console.log('Двигатель:',raw);}catch(e){console.warn(e);}}
}
window.DVS_3D_REBUILD=smartRebuild;

window.DVS_3D={
  show3D:function(){try{show3D();}catch(e){}},
  hide3D:function(){try{hide3D();}catch(e){}},
  toggle:function(){if(active)hide3D();else show3D();},
  toggleGhost:function(){},
  resize:function(){try{resize();}catch(e){}},
  isActive:function(){return active;}
};

function updCam(){var cx=dist*Math.sin(rotY)*Math.cos(rotX);var cyy=dist*Math.sin(rotX);var cz=dist*Math.cos(rotY)*Math.cos(rotX);camera.position.set(cx,cyy+3,cz);camera.lookAt(0,3,0);}

function setup(){
  if(_ready)return true;
  if(!window.THREE)return false;
  var ecv=document.getElementById('engineCv');if(!ecv)return false;
  var wrap=ecv.parentNode;if(!wrap)return false;
  wrap.style.position='relative';
  if(document.getElementById('view3dBox')){container=document.getElementById('view3dBox');_ready=true;return true;}
  container=document.createElement('div');
  container.id='view3dBox';
  container.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;display:none;z-index:5;background:#12161c';
  wrap.appendChild(container);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x12161c);
  var w=wrap.clientWidth||360,h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,250);
  updCam();
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(w,h);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff,0.7));
  scene.add(new THREE.HemisphereLight(0xcce0ff,0x4a3820,0.9));
  var L1=new THREE.DirectionalLight(0xffffff,1.6);L1.position.set(12,22,14);scene.add(L1);
  var L2=new THREE.DirectionalLight(0x88aaff,0.9);L2.position.set(-14,8,-14);scene.add(L2);
  var L4=new THREE.PointLight(0xff8030,2.2,50);L4.position.set(0,10,6);scene.add(L4);
  attachControls();
  _ready=true;return true;
}

function attachControls(){
  var el=renderer.domElement;
  function down(e){if(e.touches&&e.touches.length===1){isDown=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;}else if(e.touches&&e.touches.length===2){var dx=e.touches[0].clientX-e.touches[1].clientX;var dy=e.touches[0].clientY-e.touches[1].clientY;pinch=Math.hypot(dx,dy);isDown=false;}else if(!e.touches){isDown=true;lastX=e.clientX;lastY=e.clientY;}}
  function move(e){if(e.touches){if(e.touches.length===1&&isDown){e.preventDefault();rotY+=(e.touches[0].clientX-lastX)*0.012;rotX+=(e.touches[0].clientY-lastY)*0.012;rotX=Math.max(-1.3,Math.min(1.3,rotX));lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;updCam();}else if(e.touches.length===2&&pinch){e.preventDefault();var dx=e.touches[0].clientX-e.touches[1].clientX;var dy=e.touches[0].clientY-e.touches[1].clientY;var nd=Math.hypot(dx,dy);dist*=pinch/nd;dist=Math.max(6,Math.min(40,dist));pinch=nd;updCam();}}else if(isDown){rotY+=(e.clientX-lastX)*0.012;rotX+=(e.clientY-lastY)*0.012;rotX=Math.max(-1.3,Math.min(1.3,rotX));lastX=e.clientX;lastY=e.clientY;updCam();}}
  function up(){isDown=false;pinch=0;}
  el.addEventListener('touchstart',down,{passive:false});
  el.addEventListener('touchmove',move,{passive:false});
  el.addEventListener('touchend',up);
  el.addEventListener('touchcancel',up);
  el.addEventListener('mousedown',down);
  el.addEventListener('mousemove',move);
  el.addEventListener('mouseup',up);
  el.addEventListener('mouseleave',up);
}

function animate(){
  if(!active||!scene){animId=null;return;}
  animId=requestAnimationFrame(animate);
  var ang=S.crankAngle||0;
  for(var i=0;i<_asm.length;i++){
    var A=_asm[i];var ph=ang+A.off;var ROD=2.9,CR=0.75;
    var s=Math.sin(ph),co=Math.cos(ph);var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
    var d=CR*co+Math.sqrt(sq);var py=d;
    if(A.p)A.p.position.y=py;
  }
  for(var ci=0;ci<_cranks.length;ci++)_cranks[ci].rotation.x=ang;
  for(var fi=0;fi<_flies.length;fi++)_flies[fi].rotation.x=ang;
  var _dpa=window._dciPartsArr||[];
  for(var di=0;di<_dpa.length;di++){var P=_dpa[di];if(P.turbo)P.turbo.rotation.x=ang*2.5;}
  renderer.render(scene,camera);
}

function resize(){if(!renderer||!camera)return;var ecv=document.getElementById('engineCv');if(!ecv)return;var wrap=ecv.parentNode;var w=wrap.clientWidth,h=wrap.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}

function show3D(){
  if(!setup())return;
  active=true;
  container.style.display='block';
  var vb=document.getElementById('view3dBtn');if(vb)vb.textContent='📊 2D';
  resize();setTimeout(resize,150);setTimeout(resize,400);
  if(window.DVS_3D_REBUILD){try{window.DVS_3D_REBUILD();}catch(e){}}
  if(!animId)animate();
}

function hide3D(){
  active=false;
  if(container)container.style.display='none';
  if(animId){cancelAnimationFrame(animId);animId=null;}
  var vb=document.getElementById('view3dBtn');if(vb)vb.textContent='🎥 3D';
}

function attachBtn(){
  var vb=document.getElementById('view3dBtn');
  if(vb)vb.addEventListener('click',function(e){e.preventDefault();if(active)hide3D();else show3D();});
  console.log('view3d.js: кнопки привязаны');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachBtn);
else attachBtn();
console.log('view3d.js: загружен');
})();