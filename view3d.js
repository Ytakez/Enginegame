(function(){
"use strict";
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.5,rotY=0.6,dist=18,isDown=false,lastX=0,lastY=0,pinch=0;
var _ready=false;
var _blockM=[],_headM=[],_coverM=[],_ribM=[],_asm=[],_cranks=[],_flies=[];

function m(c,mt,rg,op,tr){
  var o={color:c,metalness:mt===undefined?0.85:mt,roughness:rg===undefined?0.35:rg};
  if(op!==undefined){o.transparent=true;o.opacity=op;}
  if(tr)o.side=THREE.DoubleSide;
  return new THREE.MeshStandardMaterial(o);
}
function cy(r,h,s,c,a,b){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),m(c,a,b));}
function bx(w,h,d,c,a,b){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m(c,a,b));}

window.DVS_3D_BUILD={m:m,cy:cy,bx:bx,bl:function(){return null;}};

window.DVS_3D_REF={
  getScene:function(){return scene;},
  getRoot:function(){return window._3dRoot||null;},
  setRoot:function(r){window._3dRoot=r;},
  setCrank:function(g){if(g)_cranks.push(g);},
  setFly:function(g){if(g)_flies.push(g);},
  setCam:function(){},
  setCams:function(){},
  setBeltT:function(){},setBeltB:function(){},
  setAsm:function(a){if(a)_asm=_asm.concat(a);},
  pushBlock:function(x){if(x)_blockM.push(x);},
  pushHead:function(x){if(x)_headM.push(x);},
  pushCover:function(x){if(x)_coverM.push(x);},
  pushRib:function(x){if(x)_ribM.push(x);},
  clearAll:function(){_blockM=[];_headM=[];_coverM=[];_ribM=[];_asm=[];_cranks=[];_flies=[];},
  getCfg:function(t){
    var CFG={
      scooter:{n:1,v:false},
      tdi:{n:4,v:false},
      dci:{n:4,v:false},
      mt82:{n:4,v:false},
      passatb3:{n:4,v:false},
      bluebird:{n:4,v:false},
      i6:{n:6,v:false},
      galant6:{n:6,v:true},
      wankel:{n:2,v:false},
      r4:{n:4,v:false},
      v8:{n:12,v:true},
      v16:{n:22,v:true}
    };
    return CFG[t]||CFG.r4;
  }
};

function rebuild(){
  if(window.DVS_3D_REBUILD)try{window.DVS_3D_REBUILD();}catch(e){console.warn(e);}
}

function setGhost(on){
  var L=_blockM.concat(_headM).concat(_coverM);
  for(var i=0;i<L.length;i++){
    if(!L[i])continue;
    L[i].material.transparent=on;
    L[i].material.opacity=on?0.12:1;
  }
  var b=document.getElementById('ghostBtn');
  if(b)b.textContent=on?'👁 Скелет':'👁 Скрыто';
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
  scene=new THREE.Scene();scene.background=new THREE.Color(0x151a20);
  var w=wrap.clientWidth||360,h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,300);updCam();
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(w,h);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff,0.8));
  scene.add(new THREE.HemisphereLight(0xcce0ff,0x3a2818,0.8));
  var L1=new THREE.DirectionalLight(0xffffff,1.5);L1.position.set(14,24,16);scene.add(L1);
  var L2=new THREE.DirectionalLight(0x88aaff,0.9);L2.position.set(-16,10,-16);scene.add(L2);
  var L3=new THREE.PointLight(0xff8030,1.5,60);L3.position.set(0,12,8);scene.add(L3);
  ctrls();
  _ready=true;return true;
}

function updCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy2=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy2+4,cz);
  camera.lookAt(0,3.5,0);
}

function ctrls(){
  var el=renderer.domElement;
  function d(e){
    if(e.touches&&e.touches.length===1){isDown=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;}
    else if(e.touches&&e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      pinch=Math.hypot(dx,dy);isDown=false;
    }else if(!e.touches){isDown=true;lastX=e.clientX;lastY=e.clientY;}
  }
  function mv(e){
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
  function u(){isDown=false;pinch=0;}
  el.addEventListener('touchstart',d,{passive:false});
  el.addEventListener('touchmove',mv,{passive:false});
  el.addEventListener('touchend',u);
  el.addEventListener('mousedown',d);
  el.addEventListener('mousemove',mv);
  el.addEventListener('mouseup',u);
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
    var cy0=A.crankY||1.0;
    var s=Math.sin(ph),c=Math.cos(ph);
    var sq=L*L-Rc*Rc*s*s;if(sq<0)sq=0;
    var pinY=cy0+Rc*c+Math.sqrt(sq);
    A.p.position.y=pinY;
    if(A.rod){
      var cpX=Rc*s,cpY=cy0+Rc*c;
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
    W.mesh.position.y=Math.sin(ang)*W.ecc;
  }
  if(window._dciParts&&window._dciParts.turbo)window._dciParts.turbo.rotation.x=ang*2.5;
  for(var ci=0;ci<_cranks.length;ci++)_cranks[ci].rotation.x=-ang;
  for(var fi=0;fi<_flies.length;fi++)_flies[fi].rotation.x=-ang;
  renderer.render(scene,camera);
}

function resize(){
  if(!renderer||!camera)return;
  var ecv=document.getElementById('engineCv');if(!ecv)return;
  var wrap=ecv.parentNode;
  var w=wrap.clientWidth,h=wrap.clientHeight;
  if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
}

var ghostOn=false;
function toggleGhost(){ghostOn=!ghostOn;setGhost(ghostOn);}

function show3D(){
  if(!setup())return;
  active=true;container.style.display='block';
  var gb=document.getElementById('ghostBtn');if(gb)gb.style.display='inline-block';
  var vb=document.getElementById('view3dBtn');if(vb)vb.textContent='📊 2D';
  resize();setTimeout(resize,150);setTimeout(resize,400);
  setTimeout(rebuild,50);
  if(!animId)animate();
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
  if(gb){gb.style.display='none';gb.addEventListener('click',function(e){e.preventDefault();toggleGhost();});}
  console.log('view3d.js: OK');
}

window.DVS_3D={
  show3D:show3D,hide3D:hide3D,
  toggle:function(){if(active)hide3D();else show3D();},
  toggleGhost:toggleGhost,resize:resize,
  isActive:function(){return active;},
  getScene:function(){return scene;}
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachBtn);
else attachBtn();
console.log('view3d.js: загружен');
})();