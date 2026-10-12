(function(){
"use strict";
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.45,rotY=0.6,dist=16,isDown=false,lastX=0,lastY=0,pinch=0;
var ghost=false,_ready=false;
var _blockM=[],_headM=[],_coverM=[],_ribM=[],_asm=[],_cranks=[],_flies=[],_cams=[];

function m(c,mt,rg,op,tr){
  var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};
  if(op!==undefined){o.transparent=true;o.opacity=op;}
  if(tr)o.side=THREE.DoubleSide;
  return new THREE.MeshStandardMaterial(o);
}
window.DVS_3D_BUILD={
  m:m,
  cy:function(r,h,s,c,mt,rg){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),m(c,mt,rg));},
  bx:function(w,h,d,c,mt,rg){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m(c,mt,rg));},
  bl:function(){return null;}
};
window.DVS_3D_REF={
  getScene:function(){return scene;},
  getRoot:function(){return window._3dRoot||null;},
  setRoot:function(r){window._3dRoot=r;},
  setCrank:function(g){if(g)_cranks.push(g);},
  setFly:function(g){if(g)_flies.push(g);},
  setCam:function(g){if(g)_cams.push(g);},
  setBeltT:function(){},setBeltB:function(){},
  setAsm:function(a){if(a)_asm=_asm.concat(a);},
  setCams:function(){},
  pushBlock:function(x){if(x)_blockM.push(x);},
  pushHead:function(x){if(x)_headM.push(x);},
  pushCover:function(x){if(x)_coverM.push(x);},
  pushRib:function(x){if(x)_ribM.push(x);},
  clearAll:function(){
    _blockM=[];_headM=[];_coverM=[];_ribM=[];_asm=[];_cranks=[];_flies=[];_cams=[];
  }
};

function smartRebuild(attempt){
  attempt=attempt||0;
  var R=window.DVS_3D_REF;
  var sc=R.getScene(); if(!sc)return;
  if(!window.DVS_3D_BUILDERS){
    if(attempt<25){setTimeout(function(){smartRebuild(attempt+1);},200);return;}
    return;
  }
  var old=R.getRoot();
  if(old){
    while(old.children.length){
      var c=old.children.pop();
      try{if(c.geometry)c.geometry.dispose();}catch(e){}
      try{if(c.material)c.material.dispose();}catch(e){}
    }
    sc.remove(old);
  }
  R.clearAll();
  window._dvsWankelRotors=[];window._dvsWankelPins=[];window._dvsWankelFlashes=[];
  window._dciParts=[];
  var root=new THREE.Group();sc.add(root);R.setRoot(root);
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'');
  var B=window.DVS_3D_BUILDERS, fn=B.r4;
  for(var k in B){if(k.toLowerCase()===raw){fn=B[k];break;}}
  if(fn){try{fn(root);}catch(e){console.warn('Ошибка:',e);}}
}
window.DVS_3D_REBUILD=smartRebuild;

window.DVS_3D={
  show3D:function(){try{show3D();}catch(e){console.warn(e);}},
  hide3D:function(){try{hide3D();}catch(e){}},
  toggle:function(){if(active)hide3D();else show3D();},
  toggleGhost:function(){setGhost(!ghost);},
  resize:function(){try{resize();}catch(e){}},
  isActive:function(){return active;}
};

function updCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy2=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy2+4,cz);
  camera.lookAt(0,3.5,0);
}

function setGhost(on){
  ghost=on;
  var L=_blockM.concat(_headM).concat(_coverM);
  for(var i=0;i<L.length;i++){
    if(!L[i])continue;
    var base=L[i].userData&&L[i].userData.baseOp!==undefined?L[i].userData.baseOp:1;
    L[i].material.transparent=on;
    L[i].material.opacity=on?0.12:base;
  }
  for(var r=0;r<_ribM.length;r++){
    _ribM[r].material.transparent=on;
    _ribM[r].material.opacity=on?0.15:1;
  }
  var btn=document.getElementById('ghostBtn');
  if(btn)btn.textContent=on?'👁 Скелет':'👁 Скрыто';
  try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
}

function setup(){
  if(_ready)return true;
  if(!window.THREE)return false;
  var ecv=document.getElementById('engineCv');
  if(!ecv)return false;
  var wrap=ecv.parentNode;
  if(!wrap)return false;
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
  scene.add(new THREE.AmbientLight(0xffffff,0.75));
  scene.add(new THREE.HemisphereLight(0xcce0ff,0x3a2818,0.8));
  var L1=new THREE.DirectionalLight(0xffffff,1.7);L1.position.set(14,24,16);scene.add(L1);
  var L2=new THREE.DirectionalLight(0x88aaff,0.9);L2.position.set(-16,10,-16);scene.add(L2);
  var L3=new THREE.DirectionalLight(0xffaa66,0.5);L3.position.set(0,12,-20);scene.add(L3);
  var L4=new THREE.PointLight(0xff8030,2.0,60);L4.position.set(0,12,8);scene.add(L4);
  attachControls();
  _ready=true;
  return true;
}

function attachControls(){
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
    if(e.touches){
      if(e.touches.length===1&&isDown){
        e.preventDefault();
        rotY+=(e.touches[0].clientX-lastX)*0.012;
        rotX+=(e.touches[0].clientY-lastY)*0.012;
        rotX=Math.max(-1.3,Math.min(1.3,rotX));
        lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;
        updCam();
      }else if(e.touches.length===2&&pinch){
        e.preventDefault();
        var dx=e.touches[0].clientX-e.touches[1].clientX;
        var dy=e.touches[0].clientY-e.touches[1].clientY;
        var nd=Math.hypot(dx,dy);
        dist*=pinch/nd;dist=Math.max(7,Math.min(45,dist));
        pinch=nd;updCam();
      }
    }else if(isDown){
      rotY+=(e.clientX-lastX)*0.012;
      rotX+=(e.clientY-lastY)*0.012;
      rotX=Math.max(-1.3,Math.min(1.3,rotX));
      lastX=e.clientX;lastY=e.clientY;updCam();
    }
  }
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
    var A=_asm[i];
    if(!A||!A.p||!A.g)continue;
    var ph=ang+(A.off||0);
    var Rc=A.crankR||0.8;
    var L=A.rodLen||3.5;
    var cyA=A.crankY||1.0;
    var sinT=Math.sin(ph),cosT=Math.cos(ph);
    var sq=L*L-Rc*Rc*sinT*sinT;if(sq<0)sq=0;
    var pinY=cyA+Rc*cosT+Math.sqrt(sq);
    A.p.position.y=pinY;
    if(A.rod){
      var cpX=Rc*sinT;
      var cpY=cyA+Rc*cosT;
      A.rod.position.x=cpX/2;
      A.rod.position.y=(pinY+cpY)/2;
      A.rod.rotation.z=-Math.atan2(cpX,pinY-cpY);
    }
  }
  var wR=window._dvsWankelRotors||[];
  for(var wr=0;wr<wR.length;wr++){
    var W=wR[wr];
    W.mesh.rotation.z=-ang/3;
    W.mesh.position.x=Math.cos(ang)*W.ecc;
    W.mesh.position.y=3+Math.sin(ang)*W.ecc;
  }
  var wp=window._dvsWankelPins||[];
  for(var j=0;j<wp.length;j++)wp[j].grp.rotation.z=ang;
  var fl=window._dvsWankelFlashes||[];
  for(var f=0;f<fl.length;f++){
    var F=fl[f];
    var cyc=((ang*1.5+F.phase)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    var inten=Math.max(0,1-Math.abs(cyc-Math.PI)*1.8);
    F.mesh.material.opacity=inten*0.85;
    F.light.intensity=inten*4;
    var sc=0.4+inten*0.9;
    F.mesh.scale.set(sc,sc,sc);
  }
  var _dpa=window._dciParts||[];
  for(var di=0;di<_dpa.length;di++){
    var P=_dpa[di];
    if(P.turbo)P.turbo.rotation.x=ang*2.5;
  }
  for(var ci=0;ci<_cranks.length;ci++)_cranks[ci].rotation.x=-ang;
  for(var fi=0;fi<_flies.length;fi++)_flies[fi].rotation.x=-ang;
  for(var ci2=0;ci2<_cams.length;ci2++)_cams[ci2].rotation.x=ang*0.5;
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
  active=true;
  container.style.display='block';
  var gb=document.getElementById('ghostBtn');if(gb)gb.style.display='inline-block';
  var vb=document.getElementById('view3dBtn');if(vb)vb.textContent='📊 2D';
  resize();setTimeout(resize,150);setTimeout(resize,400);
  if(window.DVS_3D_REBUILD){try{window.DVS_3D_REBUILD();}catch(e){}}
  if(!animId)animate();
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
}

function hide3D(){
  active=false;
  if(container)container.style.display='none';
  if(animId){cancelAnimationFrame(animId);animId=null;}
  var gb=document.getElementById('ghostBtn');if(gb)gb.style.display='none';
  var vb=document.getElementById('view3dBtn');if(vb)vb.textContent='🎥 3D';
}

function attachBtn(){
  var vb=document.getElementById('view3dBtn');
  if(vb)vb.addEventListener('click',function(e){e.preventDefault();if(active)hide3D();else show3D();});
  var gb=document.getElementById('ghostBtn');
  if(gb){
    gb.style.display='none';
    gb.addEventListener('click',function(e){e.preventDefault();setGhost(!ghost);});
  }
  console.log('view3d.js: кнопки привязаны');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachBtn);
else attachBtn();
console.log('view3d.js: загружен');
})();