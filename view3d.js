(function(){
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.4,rotY=0.7,dist=22,isDown=false,lastX=0,lastY=0,pinch=0;
var ghost=false;

function m(c,a,b){return new THREE.MeshStandardMaterial({color:c,metalness:a===undefined?0.85:a,roughness:b===undefined?0.35:b});}
function cy(r,h,s,c,a,b){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),m(c,a,b));}
function bx(w,h,d,c,a,b){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m(c,a,b));}
function bl(r){return cy(0.12,r||0.2,10,0xc8d4e0,0.95,0.2);}

function updCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cyy=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cyy+3,cz);
  camera.lookAt(0,3,0);
}

function setGhost(on){
  ghost=on;
  var arr=[].concat(window._3dBlock||[],window._3dHead||[],window._3dCover||[]);
  for(var i=0;i<arr.length;i++){
    if(!arr[i])continue;
    arr[i].material.transparent=on;
    arr[i].material.opacity=on?0.12:1.0;
  }
  var ribs=window._3dRib||[];
  for(var r=0;r<ribs.length;r++){
    ribs[r].material.transparent=on;
    ribs[r].material.opacity=on?0.2:1;
  }
  var btn=document.getElementById('ghostBtn');
  if(btn)btn.textContent=on?'👁 Скелет':'👁 Скрыто';
  try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
}

function setup(){
  if(!window.THREE){alert('Three.js не загрузился');return false;}
  var ecv=document.getElementById('engineCv');
  if(!ecv)return false;
  var wrap=ecv.parentNode;
  if(!wrap)return false;
  wrap.style.position='relative';
  if(document.getElementById('view3dBox'))return true;
  container=document.createElement('div');
  container.id='view3dBox';
  container.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;display:none;z-index:5;background:#0a0e13';
  wrap.appendChild(container);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0a0e13);
  var w=wrap.clientWidth||360,h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,300);
  updCam();
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(w,h);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff,0.35));
  scene.add(new THREE.HemisphereLight(0xaaccff,0x3a2010,0.6));
  var L1=new THREE.DirectionalLight(0xffffff,1.6);L1.position.set(12,22,14);scene.add(L1);
  var L2=new THREE.DirectionalLight(0x88aaff,0.9);L2.position.set(-14,8,-14);scene.add(L2);
  var L3=new THREE.DirectionalLight(0xffaa66,0.6);L3.position.set(0,10,-18);scene.add(L3);
  var L4=new THREE.PointLight(0xff8030,2.2,50);L4.position.set(0,10,6);scene.add(L4);
  var L5=new THREE.PointLight(0x3070ff,1.4,50);L5.position.set(-12,5,-10);scene.add(L5);
  var L6=new THREE.PointLight(0xffffff,1.0,45);L6.position.set(14,14,-10);scene.add(L6);

  if(window.DVS_3D_REBUILD)window.DVS_3D_REBUILD();
  attachControls();
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
    } else if(!e.touches){isDown=true;lastX=e.clientX;lastY=e.clientY;}
  }
  function move(e){
    if(e.touches){
      if(e.touches.length===1&&isDown){
        rotY+=(e.touches[0].clientX-lastX)*0.012;
        rotX+=(e.touches[0].clientY-lastY)*0.012;
        rotX=Math.max(-1.3,Math.min(1.3,rotX));
        lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;updCam();
      } else if(e.touches.length===2&&pinch){
        var dx=e.touches[0].clientX-e.touches[1].clientX;
        var dy=e.touches[0].clientY-e.touches[1].clientY;
        var nd=Math.hypot(dx,dy);
        dist*=pinch/nd;dist=Math.max(8,Math.min(50,dist));pinch=nd;updCam();
      }
    } else if(isDown){
      rotY+=(e.clientX-lastX)*0.012;
      rotX+=(e.clientY-lastY)*0.012;
      rotX=Math.max(-1.3,Math.min(1.3,rotX));
      lastX=e.clientX;lastY=e.clientY;updCam();
    }
  }
  function up(){isDown=false;pinch=0;}
  el.addEventListener('touchstart',down,{passive:false});
  el.addEventListener('touchmove',function(e){e.preventDefault();move(e);},{passive:false});
  el.addEventListener('touchend',up);
  el.addEventListener('mousedown',down);
  el.addEventListener('mousemove',move);
  el.addEventListener('mouseup',up);
}

function animate(){
  if(!active||!scene){animId=null;return;}
  animId=requestAnimationFrame(animate);
  var ang=S.crankAngle||0;
  var asm=window._3dAsm||[];
  for(var i=0;i<asm.length;i++){
    var A=asm[i];
    var ph=ang+A.off;
    var ROD=2.9,CR=0.75;
    var s=Math.sin(ph),co=Math.cos(ph);
    var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
    var d=CR*co+Math.sqrt(sq);
    var py=d;
    if(A.p)A.p.position.y=py;
    var cpX=CR*s,cpY=d;
    if(A.rod){
      A.rod.position.set(cpX/2,(py+cpY)/2,0);
      A.rod.rotation.z=Math.atan2(cpX,-(cpY-py+0.01));
    }
    var cycle=((ang+A.off)%(Math.PI*4)+Math.PI*4)%(Math.PI*4);
    var idx=Math.floor(cycle/Math.PI);
    var vIn=0,vEx=0;
    if(idx===0)vIn=Math.max(0,Math.sin(cycle%Math.PI))*0.28;
    if(idx===3)vEx=Math.max(0,Math.sin(cycle-3*Math.PI))*0.28;
    if(A.vv&&A.vv[0])A.vv[0].position.y=A.h+0.05-vIn;
    if(A.vv&&A.vv[1])A.vv[1].position.y=A.h+0.05-vEx;
  }
  if(window._3dCrank)window._3dCrank.rotation.x=ang;
  if(window._3dFly)window._3dFly.rotation.x=ang;
  if(window._3dBeltB)window._3dBeltB.rotation.x=ang;
  if(window._3dBeltT)window._3dBeltT.rotation.x=ang*0.5;
  if(window._3dCam)window._3dCam.rotation.x=ang*0.5;
  var cams=window._3dCams||[];
  for(var c=0;c<cams.length;c++)cams[c].grp.rotation.z=(ang*0.5)+cams[c].off;
  renderer.render(scene,camera);
}

function toggle(){
  if(!window.THREE){alert('3D: Three.js не загрузился');return;}
  if(!container){if(!setup())return;}
  active=!active;
  container.style.display=active?'block':'none';
  var btn=document.getElementById('view3dBtn');
  if(btn)btn.textContent=active?'📊 2D':'🎥 3D';
  var gb=document.getElementById('ghostBtn');
  if(gb)gb.style.display=active?'inline-block':'none';
  if(active){
    var wrap=document.getElementById('engineCv').parentNode;
    var w=wrap.clientWidth,h=wrap.clientHeight;
    if(w&&h&&renderer){
      renderer.setSize(w,h);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    }
    if(window.DVS_3D_REBUILD)window.DVS_3D_REBUILD();
    if(!animId)animate();
  } else {
    if(animId){cancelAnimationFrame(animId);animId=null;}
  }
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
}

function toggleGhost(){setGhost(!ghost);}

function attachBtn(){
  var btn=document.getElementById('view3dBtn');
  if(btn)btn.addEventListener('click',function(e){e.preventDefault();toggle();});
  var gb=document.getElementById('ghostBtn');
  if(gb){gb.style.display='none';gb.addEventListener('click',function(e){e.preventDefault();toggleGhost();});}
}

window.DVS_3D={toggle:toggle,toggleGhost:toggleGhost};
window.DVS_3D_BUILD={m:m,cy:cy,bx:bx,bl:bl};
window.DVS_3D_REF={
  getScene:function(){return scene;},
  getRoot:function(){return window._3dRoot||null;},
  setRoot:function(r){window._3dRoot=r;},
  setCrank:function(g){window._3dCrank=g;},
  setFly:function(g){window._3dFly=g;},
  setCam:function(g){window._3dCam=g;},
  setBeltT:function(g){window._3dBeltT=g;},
  setBeltB:function(g){window._3dBeltB=g;},
  setAsm:function(a){window._3dAsm=a||[];},
  setCams:function(c){window._3dCams=c||[];},
  pushBlock:function(x){if(!window._3dBlock)window._3dBlock=[];window._3dBlock.push(x);},
  pushHead:function(x){if(!window._3dHead)window._3dHead=[];window._3dHead.push(x);},
  pushCover:function(x){if(!window._3dCover)window._3dCover=[];window._3dCover.push(x);},
  pushRib:function(x){if(!window._3dRib)window._3dRib=[];window._3dRib.push(x);},
  clearAll:function(){window._3dBlock=[];window._3dHead=[];window._3dCover=[];window._3dRib=[];window._3dAsm=[];window._3dCams=[];},
  getCfg:function(t){
    var CFG={
      scooter:{n:1,v:false},tdi:{n:4,v:false,diesel:true,turbo:true},
      mt82:{n:4,v:false,diesel:true,tractor:true},
      passatb3:{n:4,v:false},bluebird:{n:4,v:false},
      galant6:{n:6,v:true},r4:{n:4,v:false},
      v8:{n:12,v:true},v16:{n:22,v:true}
    };
    return CFG[t]||CFG.r4;
  }
};

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',attachBtn);}
else{attachBtn();}
})();