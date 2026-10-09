(function(){
"use strict";
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.4,rotY=0.7,dist=14,isDown=false,lastX=0,lastY=0,pinch=0;
var ghost=false;
var _blockM=[],_headM=[],_coverM=[],_ribM=[],_asm=[],_cams=[];
var _crank,_fly,_cam,_beltT,_beltB;
var _ready=false;

function m(c,a,b){return new THREE.MeshStandardMaterial({color:c,metalness:a===undefined?0.85:a,roughness:b===undefined?0.35:b});}
function cy(r,h,s,c,a,b){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),m(c,a,b));}
function bx(w,h,d,c,a,b){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m(c,a,b));}
function bl(r){return cy(0.12,r||0.2,10,0xc8d4e0,0.95,0.2);}

window.DVS_3D_BUILD={m:m,cy:cy,bx:bx,bl:bl};

window.DVS_3D_REF={
  getScene:function(){return scene;},
  getRoot:function(){return window._3dRoot||null;},
  setRoot:function(r){window._3dRoot=r;},
  setCrank:function(g){_crank=g;},
  setFly:function(g){_fly=g;},
  setCam:function(g){_cam=g;},
  setBeltT:function(g){_beltT=g;},
  setBeltB:function(g){_beltB=g;},
  setAsm:function(a){_asm=a||[];},
  setCams:function(c){_cams=c||[];},
  pushBlock:function(x){_blockM.push(x);},
  pushHead:function(x){_headM.push(x);},
  pushCover:function(x){_coverM.push(x);},
  pushRib:function(x){_ribM.push(x);},
  clearAll:function(){_blockM=[];_headM=[];_coverM=[];_ribM=[];_asm=[];_cams=[];},
  getCfg:function(t){
    var CFG={
      scooter:{n:1,v:false},
      tdi:{n:4,v:false},
      dci:{n:4,v:false,model:'dci'},
      mt82:{n:4,v:false},
      passatb3:{n:4,v:false},
      bluebird:{n:4,v:false},
      galant6:{n:6,v:true},
      wankel:{n:2,v:false,model:'wankel'},
      r4:{n:4,v:false},
      v8:{n:12,v:true},
      v16:{n:22,v:true}
    };
    return CFG[t]||CFG.r4;
  }
};

/* ===== ЗАПАСНОЙ REBUILD ===== */
function fallbackRebuild(){
  var R=window.DVS_3D_REF;
  var sc=R.getScene(); if(!sc)return;
  var old=R.getRoot();
  if(old){while(old.children.length){var c=old.children.pop();if(c.geometry)try{c.geometry.dispose();}catch(e){}if(c.material)try{c.material.dispose();}catch(e){};}
    sc.remove(old);}
  R.clearAll();
  window._dvsWankelRotors=[];window._dvsWankelPins=[];window._dvsWankelFlashes=[];window._dciParts=null;
  var root=new THREE.Group();sc.add(root);R.setRoot(root);
  var block=bx(4.2,1.5,1.6,0x2a2d33,0.75,0.55);root.add(block);R.pushBlock(block);
  for(var i=0;i<5;i++){var rib=bx(0.06,1.4,1.66,0x1e2126,0.85,0.55);rib.position.x=-1.7+i*0.85;root.add(rib);R.pushRib(rib);}
  var head=bx(4.2,0.6,1.5,0x3a3d44,0.7,0.5);head.position.y=1.05;root.add(head);R.pushHead(head);
  var cover=bx(4.0,0.35,1.35,0x1a1d22,0.6,0.6);cover.position.y=1.5;root.add(cover);R.pushCover(cover);
  var pan=bx(4.0,0.5,1.4,0x3a3d44,0.7,0.5);pan.position.y=-1.0;root.add(pan);
  var asm=[];
  for(var c2=0;c2<4;c2++){
    var cx=-1.55+c2*1.03;
    var plug=cy(0.11,0.4,10,0x8a8f96,0.9,0.3);plug.position.set(cx,1.6,0);root.add(plug);
    var cyl=cy(0.42,1.1,16,0x4a4d54,0.85,0.4);cyl.position.set(cx,0.2,0);root.add(cyl);
    var piston=cy(0.38,0.5,16,0xdde5ee,0.95,0.15);piston.position.set(cx,0.2,0);root.add(piston);
    var rod=bx(0.14,1.1,0.14,0xc8d4e0,0.95,0.2);rod.position.set(cx,-0.6,0);root.add(rod);
    asm.push({p:piston,rod:rod,off:c2*Math.PI,h:0.7,vv:[]});
  }
  R.setAsm(asm);
  var crank=cy(0.28,4.4,16,0x8a95a3,0.95,0.25);crank.rotation.z=Math.PI/2;crank.position.y=-1.0;root.add(crank);R.setCrank(crank);
  var fly=cy(1.5,0.3,28,0x6a6f78,0.9,0.3);fly.rotation.z=Math.PI/2;fly.position.set(2.5,-1.0,0);root.add(fly);R.setFly(fly);
}

window.DVS_3D_REBUILD=fallbackRebuild;
window._dvsFallbackRebuild=true;

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
  var cyy=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cyy+3,cz);
  camera.lookAt(0,3,0);
}

function setGhost(on){
  ghost=on;
  var opa=on?0.12:1.0;
  var L=_blockM.concat(_headM).concat(_coverM);
  for(var i=0;i<L.length;i++){if(!L[i])continue;L[i].material.transparent=on;L[i].material.opacity=opa;}
  for(var r=0;r<_ribM.length;r++){_ribM[r].material.transparent=on;_ribM[r].material.opacity=on?0.2:1;}
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
  container.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;display:none;z-index:5;background:#12161c';
  wrap.appendChild(container);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x12161c);
  scene.fog=new THREE.Fog(0x12161c,30,90);
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
  var L3=new THREE.DirectionalLight(0xffaa66,0.6);L3.position.set(0,10,-18);scene.add(L3);
  var L4=new THREE.PointLight(0xff8030,2.2,50);L4.position.set(0,10,6);scene.add(L4);
  var L5=new THREE.PointLight(0x3070ff,1.4,50);L5.position.set(-12,5,-10);scene.add(L5);
  var L6=new THREE.PointLight(0xffffff,1.5,60);L6.position.set(0,18,0);scene.add(L6);
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
        dist*=pinch/nd;dist=Math.max(6,Math.min(40,dist));
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
    var ph=ang+A.off;
    var ROD=2.9,CR=0.75;
    var s=Math.sin(ph),co=Math.cos(ph);
    var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
    var d=CR*co+Math.sqrt(sq);
    var py=d;
    if(A.p)A.p.position.y=py;
    var cpX=CR*s,cpY=d;
    if(A.rod){A.rod.position.set(cpX/2,(py+cpY)/2,0);A.rod.rotation.z=Math.atan2(cpX,-(cpY-py+0.01));}
    var cycle=((ang+A.off)%(Math.PI*4)+Math.PI*4)%(Math.PI*4);
    var idx=Math.floor(cycle/Math.PI);
    var vIn=0,vEx=0;
    if(idx===0)vIn=Math.max(0,Math.sin(cycle%Math.PI))*0.28;
    if(idx===3)vEx=Math.max(0,Math.sin(cycle-3*Math.PI))*0.28;
    if(A.vv&&A.vv[0])A.vv[0].position.y=A.h+0.05-vIn;
    if(A.vv&&A.vv[1])A.vv[1].position.y=A.h+0.05-vEx;
  }
  var wR=window._dvsWankelRotors||[];
  for(var wr=0;wr<wR.length;wr++){
    var W=wR[wr];
    W.mesh.rotation.z=-ang/3;
    W.mesh.position.x=Math.cos(ang)*W.ecc;
    W.mesh.position.y=Math.sin(ang)*W.ecc;
  }
  var wp=window._dvsWankelPins||[];
  for(var j=0;j<wp.length;j++)wp[j].grp.rotation.z=ang;
  var fl=window._dvsWankelFlashes||[];
  for(var f=0;f<fl.length;f++){
    var F=fl[f];
    var cyc=((ang*1.5+F.phase)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    var inten=Math.max(0,1-Math.abs(cyc-Math.PI)*1.8);if(inten<0)inten=0;
    F.mesh.material.opacity=inten*0.85;
    F.light.intensity=inten*4;
    var sc=0.4+inten*0.9;
    F.mesh.scale.set(sc,sc,sc);
  }
  if(window._dciParts){
    var P=window._dciParts;
    if(P.turbo)P.turbo.rotation.x=ang*2.5;
    if(P.cam)P.cam.rotation.x=ang*0.5;
    if(P.fw)P.fw.rotation.x=ang;
    if(P.crank)P.crank.rotation.x=ang;
  }
  if(_crank)_crank.rotation.x=ang;
  if(_fly)_fly.rotation.x=ang;
  if(_beltB)_beltB.rotation.x=ang;
  if(_beltT)_beltT.rotation.x=ang*0.5;
  if(_cam)_cam.rotation.x=ang*0.5;
  for(var c=0;c<_cams.length;c++)_cams[c].grp.rotation.z=(ang*0.5)+_cams[c].off;
  renderer.render(scene,camera);
}

function resize(){
  if(!renderer||!camera)return;
  var ecv=document.getElementById('engineCv');
  if(!ecv)return;
  var wrap=ecv.parentNode;
  var w=wrap.clientWidth,h=wrap.clientHeight;
  if(w&&h){
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
}

function show3D(){
  if(!setup())return;
  active=true;
  container.style.display='block';
  var gb=document.getElementById('ghostBtn');
  if(gb)gb.style.display='inline-block';
  var lb=document.getElementById('lockBtn');
  if(lb)lb.style.display='flex';
  var vb=document.getElementById('view3dBtn');
  if(vb)vb.textContent='📊 2D';
  resize();
  setTimeout(resize,150);
  setTimeout(resize,400);
  if(window.DVS_3D_REBUILD){try{window.DVS_3D_REBUILD();}catch(e){}}
  if(!animId)animate();
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
}

function hide3D(){
  active=false;
  if(container)container.style.display='none';
  if(animId){cancelAnimationFrame(animId);animId=null;}
  var gb=document.getElementById('ghostBtn');
  if(gb)gb.style.display='none';
  var lb=document.getElementById('lockBtn');
  if(lb)lb.style.display='none';
  var vb=document.getElementById('view3dBtn');
  if(vb)vb.textContent='🎥 3D';
}

function toggleLock(){
  var wrap=document.getElementById('engineWrap');
  var lb=document.getElementById('lockBtn');
  if(!wrap||!lb)return;
  var locked=wrap.classList.toggle('locked');
  lb.textContent=locked?'🔒':'🔓';
  lb.classList.toggle('on',locked);
  isDown=false;pinch=0;
}

function attachBtn(){
  var vb=document.getElementById('view3dBtn');
  if(vb)vb.addEventListener('click',function(e){e.preventDefault();if(active)hide3D();else show3D();});
  var gb=document.getElementById('ghostBtn');
  if(gb){
    gb.style.display='none';
    gb.addEventListener('click',function(e){e.preventDefault();setGhost(!ghost);});
  }
  var lb=document.getElementById('lockBtn');
  if(lb){
    lb.style.display='none';
    lb.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();toggleLock();});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachBtn);
else attachBtn();

console.log('view3d.js: загружен');
})();