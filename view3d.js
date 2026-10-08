(function(){
var S=window.S;if(!S)return;
var active=false;
var scene,camera,renderer,container;
var pistons=[],rods=[],crank;
var animId=null;
var rotX=0.35,rotY=0.6,dist=14;
var isDown=false,lastX=0,lastY=0,pinchDist=0;

function updateCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy+2.5,cz);
  camera.lookAt(0,2.5,0);
}

function setup(){
  var ecv=document.getElementById('engineCv');
  if(!ecv)return;
  var wrap=ecv.parentNode;
  if(!wrap)return;
  wrap.style.position='relative';
  container=document.createElement('div');
  container.id='view3dBox';
  container.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;display:none;z-index:5';
  wrap.appendChild(container);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0a0e13);
  var w=wrap.clientWidth||360;
  var h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,100);
  updateCam();
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(w,h);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff,0.55));
  var l1=new THREE.DirectionalLight(0xffffff,1);l1.position.set(5,10,7);scene.add(l1);
  var l2=new THREE.DirectionalLight(0x88aaff,0.5);l2.position.set(-5,-3,-7);scene.add(l2);
  var l3=new THREE.PointLight(0xff6a00,1.2,15);l3.position.set(0,3,0);scene.add(l3);
  var block=new THREE.Mesh(
    new THREE.BoxGeometry(9,4.5,4),
    new THREE.MeshStandardMaterial({color:0x4a5566,metalness:0.85,roughness:0.35})
  );
  block.position.y=2.5;
  scene.add(block);
  for(var i=0;i<4;i++){
    var x=-3.6+i*2.4;
    var cyl=new THREE.Mesh(
      new THREE.CylinderGeometry(1.05,1.05,3.6,24,1,true),
      new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.7,roughness:0.5,transparent:true,opacity:0.35,side:THREE.DoubleSide})
    );
    cyl.position.set(x,2.5,0);
    scene.add(cyl);
  }
  var cg=new THREE.CylinderGeometry(0.35,0.35,10,16);
  cg.rotateZ(Math.PI/2);
  crank=new THREE.Mesh(cg,new THREE.MeshStandardMaterial({color:0xa8b4c0,metalness:0.95,roughness:0.25}));
  crank.position.y=0.6;
  scene.add(crank);
  for(var j=0;j<4;j++){
    var xj=-3.6+j*2.4;
    var p=new THREE.Mesh(
      new THREE.CylinderGeometry(0.9,0.9,1.4,20),
      new THREE.MeshStandardMaterial({color:0xd8e0e8,metalness:0.9,roughness:0.25})
    );
    p.position.set(xj,2.5,0);
    scene.add(p);
    pistons.push({m:p,bx:xj,off:j*Math.PI});
    var r=new THREE.Mesh(
      new THREE.BoxGeometry(0.35,2.5,0.35),
      new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.3})
    );
    r.position.set(xj,1.5,0);
    scene.add(r);
    rods.push({m:r,bx:xj,off:j*Math.PI});
  }
  attachControls();
}

function attachControls(){
  var el=renderer.domElement;
  function onDown(e){
    if(e.touches&&e.touches.length===1){isDown=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;}
    else if(e.touches&&e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchDist=Math.hypot(dx,dy);
      isDown=false;
    } else if(!e.touches){isDown=true;lastX=e.clientX;lastY=e.clientY;}
  }
  function onMove(e){
    if(e.touches){
      if(e.touches.length===1&&isDown){
        rotY+=(e.touches[0].clientX-lastX)*0.012;
        rotX+=(e.touches[0].clientY-lastY)*0.012;
        rotX=Math.max(-1.2,Math.min(1.2,rotX));
        lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;
        updateCam();
      } else if(e.touches.length===2&&pinchDist){
        var dx=e.touches[0].clientX-e.touches[1].clientX;
        var dy=e.touches[0].clientY-e.touches[1].clientY;
        var nd=Math.hypot(dx,dy);
        dist*=pinchDist/nd;
        dist=Math.max(7,Math.min(25,dist));
        pinchDist=nd;
        updateCam();
      }
    } else if(isDown){
      rotY+=(e.clientX-lastX)*0.012;
      rotX+=(e.clientY-lastY)*0.012;
      rotX=Math.max(-1.2,Math.min(1.2,rotX));
      lastX=e.clientX;lastY=e.clientY;
      updateCam();
    }
  }
  function onUp(){isDown=false;pinchDist=0;}
  el.addEventListener('touchstart',onDown,{passive:false});
  el.addEventListener('touchmove',function(e){e.preventDefault();onMove(e);},{passive:false});
  el.addEventListener('touchend',onUp);
  el.addEventListener('mousedown',onDown);
  el.addEventListener('mousemove',onMove);
  el.addEventListener('mouseup',onUp);
  el.addEventListener('wheel',function(e){
    dist*=(1+e.deltaY*0.001);
    dist=Math.max(7,Math.min(25,dist));
    updateCam();
    e.preventDefault();
  },{passive:false});
}

function animate(){
  if(!active||!scene){animId=null;return;}
  animId=requestAnimationFrame(animate);
  var ang=S.crankAngle||0;
  var ROD=2.8,CR=0.55;
  for(var i=0;i<pistons.length;i++){
    var p=pistons[i];
    var ph=ang+p.off;
    var s=Math.sin(ph),co=Math.cos(ph);
    var d=CR*co+Math.sqrt(ROD*ROD-CR*CR*s*s);
    var py=0.6+d;
    p.m.position.y=py;
    var cpX=p.bx+CR*s;
    var cpY=0.6-CR*co;
    var r=rods[i];
    r.m.position.set((p.bx+cpX)/2,(py+cpY)/2,0);
    r.m.scale.y=Math.hypot(cpX-p.bx,cpY-py)/2.5;
    r.m.rotation.z=Math.atan2(cpX-p.bx,py-cpY);
  }
  crank.rotation.x=ang;
  renderer.render(scene,camera);
}

function toggle(){
  if(!window.THREE){alert('3D не загрузилось — обнови страницу');return;}
  if(!container)setup();
  active=!active;
  container.style.display=active?'block':'none';
  var btn=document.getElementById('view3dBtn');
  if(btn)btn.textContent=active?'📊 2D':'🎥 3D';
  if(active){
    var wrap=document.getElementById('engineCv').parentNode;
    var w=wrap.clientWidth,h=wrap.clientHeight;
    if(w&&h&&renderer){
      renderer.setSize(w,h);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    }
    if(!animId)animate();
  } else {
    if(animId){cancelAnimationFrame(animId);animId=null;}
  }
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
}

function attachBtn(){
  var btn=document.getElementById('view3dBtn');
  if(!btn)return;
  btn.addEventListener('click',function(e){e.preventDefault();toggle();});
}
window.DVS_3D={toggle:toggle};
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',attachBtn);}else{attachBtn();}
})();