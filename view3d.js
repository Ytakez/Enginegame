(function(){
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.4,rotY=0.7,dist=22,isDown=false,lastX=0,lastY=0,pinch=0;
var ghost=false,currentType=null;
var asm=[],cams=[];
var crankGrp,flywheelGrp,camshaftGrp,beltTopGrp,beltBotGrp;
var blockM=[],headM=[],coverM=[],shells=[],ribM=[];
var root;

var CFG={
  scooter:{n:1,v:false,diesel:false,turbo:false,tractor:false},
  tdi:{n:4,v:false,diesel:true,turbo:true,tractor:false},
  mt82:{n:4,v:false,diesel:true,turbo:false,tractor:true},
  passatb3:{n:4,v:false,diesel:false,turbo:false,tractor:false},
  bluebird:{n:4,v:false,diesel:false,turbo:false,tractor:false},
  galant6:{n:6,v:true,diesel:false,turbo:false,tractor:false},
  r4:{n:4,v:false,diesel:false,turbo:false,tractor:false},
  v8:{n:12,v:true,diesel:false,turbo:false,tractor:false},
  v16:{n:22,v:true,diesel:false,turbo:false,tractor:false}
};

function m(c,a,b){return new THREE.MeshStandardMaterial({color:c,metalness:a===undefined?0.85:a,roughness:b===undefined?0.35:b});}
function cy(r,h,s,c,a,b){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),m(c,a,b));}
function bx(w,h,d,c,a,b){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m(c,a,b));}
function bl(r){return cy(0.12,r||0.2,10,0xc8d4e0,0.95,0.2);}

function updCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy+3,cz);
  camera.lookAt(0,3,0);
}

function setGhost(on){
  ghost=on;
  var opa=on?0.12:1.0;
  var L=blockM.concat(headM).concat(coverM);
  for(var i=0;i<L.length;i++){if(!L[i])continue;L[i].material.transparent=on;L[i].material.opacity=opa;}
  for(var r=0;r<ribM.length;r++){ribM[r].material.transparent=on;ribM[r].material.opacity=on?0.2:1;}
  for(var s=0;s<shells.length;s++){shells[s].material.opacity=on?0.06:0.32;}
  var btn=document.getElementById('ghostBtn');
  if(btn)btn.textContent=on?'👁 Скелет':'👁 Скрыто';
  try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
}

function makeCylAss(opts){
  var g=new THREE.Group();
  g.position.set(opts.x,opts.y,opts.z);
  g.rotation.y=opts.ry||0;
  var shell=new THREE.Mesh(
    new THREE.CylinderGeometry(opts.r+0.15,opts.r+0.15,opts.h,20,1,true),
    new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.15,transparent:true,opacity:0.32,side:THREE.DoubleSide}));
  shell.position.y=opts.h/2;g.add(shell);shells.push(shell);
  var p=new THREE.Group();
  p.position.y=opts.h*0.55;
  p.add(cy(opts.r,opts.r*0.9,18,0xd8e0e8,0.95,0.15));
  for(var k=0;k<3;k++){
    var rg=cy(opts.r+0.03,0.06,18,0x2a333f,0.6,0.7);
    rg.position.y=opts.r*0.3-k*opts.r*0.2;p.add(rg);
  }
  var pin=cy(opts.r*0.15,opts.r*1.1,10,0x2a3543,0.9,0.3);
  pin.rotation.z=Math.PI/2;p.add(pin);
  g.add(p);
  var rod=bx(opts.r*0.3,opts.h*0.5,opts.r*0.3,0x8894a2,0.9,0.25);
  g.add(rod);
  var ign=new THREE.Group();
  if(opts.diesel){
    ign.add(cy(opts.r*0.15,opts.r*0.5,10,0x3a3a3a,0.7,0.4));
    var fy=cy(opts.r*0.2,opts.r*0.25,10,0x8a95a3,0.9,0.3);fy.position.y=-0.1;ign.add(fy);
  } else {
    ign.add(cy(opts.r*0.13,opts.r*0.5,10,0xe8e4dc,0.3,0.5));
    var mt=cy(opts.r*0.17,opts.r*0.25,10,0x8a95a3,0.9,0.3);mt.position.y=-0.1;ign.add(mt);
  }
  ign.position.y=opts.h+0.4;g.add(ign);
  var vv=[];
  for(var s=0;s<2;s++){
    var vg=new THREE.Group();
    vg.add(cy(opts.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4));
    var vs=cy(0.05,opts.r*0.6,6,0xa8b4c0,0.9,0.3);vs.position.y=opts.r*0.3;vg.add(vs);
    vg.position.set((s===0?-1:1)*opts.r*0.4,opts.h+0.05,0);
    g.add(vg);vv.push(vg);
  }
  return {g:g,p:p,rod:rod,vv:vv,x:opts.x,y:opts.y,z:opts.z,h:opts.h,r:opts.r,off:opts.off||0};
}

window.DVS_3D_BUILD={
  setGhost:setGhost,
  makeCylAss:makeCylAss,
  m:m,cy:cy,bx:bx,bl:bl
};

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
        dist*=pinch/nd;dist=Math.max(10,Math.min(45,dist));pinch=nd;updCam();
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

function setup(){
  var ecv=document.getElementById('engineCv');
  if(!ecv)return;
  var wrap=ecv.parentNode;
  if(!wrap)return;
  wrap.style.position='relative';
  if(document.getElementById('view3dBox'))return;
  container=document.createElement('div');
  container.id='view3dBox';
  container.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;display:none;z-index:5';
  wrap.appendChild(container);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0a0e13);
  scene.fog=new THREE.Fog(0x0a0e13,35,80);
  var w=wrap.clientWidth||360,h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,200);
  updCam();
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(w,h);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff,0.55));
  var d1=new THREE.DirectionalLight(0xffffff,1.0);d1.position.set(8,15,10);scene.add(d1);
  var d2=new THREE.DirectionalLight(0x88aaff,0.55);d2.position.set(-8,-5,-10);scene.add(d2);
  var p1=new THREE.PointLight(0xff8030,1.3,25);p1.position.set(0,6,4);scene.add(p1);
  var p2=new THREE.PointLight(0x3080ff,0.7,25);p2.position.set(-6,2,-6);scene.add(p2);
  if(window.DVS_3D_REBUILD)window.DVS_3D_REBUILD();
  currentType=S.engineType;
  attachControls();
  setGhost(false);
}

function animate(){
  if(!active||!scene){animId=null;return;}
  animId=requestAnimationFrame(animate);
  var ang=S.crankAngle||0;
  if(S.engineType!==currentType){
    if(window.DVS_3D_REBUILD)window.DVS_3D_REBUILD();
    currentType=S.engineType;setGhost(ghost);
  }
  for(var i=0;i<asm.length;i++){
    var A=asm[i];
    var ph=ang+A.off;
    var ROD=2.9,CR=0.75;
    var s=Math.sin(ph),co=Math.cos(ph);
    var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
    var d=CR*co+Math.sqrt(sq);
    var py=d;
    A.p.position.y=py;
    var cpX=CR*s;
    var cpY=d;
    var dx=cpX,dy=cpY-py;
    A.rod.position.set(cpX/2,(py+cpY)/2,0);
    A.rod.scale.y=2.9/2.9;
    A.rod.rotation.z=Math.atan2(cpX,-(cpY-py+0.01));
    var cycle=((ang+A.off)%(Math.PI*4)+Math.PI*4)%(Math.PI*4);
    var idx=Math.floor(cycle/Math.PI);
    var vIn=0,vEx=0;
    if(idx===0)vIn=Math.max(0,Math.sin(cycle%Math.PI))*0.28;
    if(idx===3)vEx=Math.max(0,Math.sin(cycle-3*Math.PI))*0.28;
    if(A.vv[0])A.vv[0].position.y=A.h+0.05-vIn;
    if(A.vv[1])A.vv[1].position.y=A.h+0.05-vEx;
  }
  if(crankGrp)crankGrp.rotation.x=ang;
  if(flywheelGrp)flywheelGrp.rotation.x=ang;
  if(beltBotGrp)beltBotGrp.rotation.x=ang;
  if(beltTopGrp)beltTopGrp.rotation.x=ang*0.5;
  if(camshaftGrp)camshaftGrp.rotation.x=ang*0.5;
  for(var c=0;c<cams.length;c++)cams[c].grp.rotation.z=(ang*0.5)+cams[c].off;
  renderer.render(scene,camera);
}

function toggle(){
  if(!window.THREE){alert('3D не загрузилось');return;}
  if(!container)setup();
  active=!active;
  container.style.display=active?'block':'none';
  var btn=document.getElementById('view3dBtn');
  if(btn)btn.textContent=active?'📊 2D':'🎥 3D';
  var gb=document.getElementById('ghostBtn');
  if(gb)gb.style.display=active?'inline-block':'none';
  if(active){
    var wrap=document.getElementById('engineCv').parentNode;
    var w=wrap.clientWidth,h=wrap.clientHeight;
    if(w&&h&&renderer){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
    if(S.engineType!==currentType&&window.DVS_3D_REBUILD){window.DVS_3D_REBUILD();currentType=S.engineType;setGhost(ghost);}
    if(!animId)animate();
  } else if(animId){cancelAnimationFrame(animId);animId=null;}
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
window.DVS_3D_REF={getScene:function(){return scene;},setScene:function(s){scene=s;},setRoot:function(r){root=r;},getRoot:function(){return root;},setCrank:function(g){crankGrp=g;},setFly:function(g){flywheelGrp=g;},setCam:function(g){camshaftGrp=g;},setBeltT:function(g){beltTopGrp=g;},setBeltB:function(g){beltBotGrp=g;},getAsm:function(){return asm;},setAsm:function(a){asm=a;},getCams:function(){return cams;},setCams:function(c){cams=c;},pushBlock:function(x){blockM.push(x);},pushHead:function(x){headM.push(x);},pushCover:function(x){coverM.push(x);},pushRib:function(x){ribM.push(x);},clearAll:function(){blockM=[];headM=[];coverM=[];ribM=[];shells=[];asm=[];cams=[];},getCfg:function(t){return CFG[t]||CFG.r4;}};
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',attachBtn);}else{attachBtn();}
})();