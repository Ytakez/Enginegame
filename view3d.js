(function(){
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.4,rotY=0.7,dist=18,isDown=false,lastX=0,lastY=0,pinch=0;
var ghost=false;
var pistons=[],rods=[],cams=[],valves=[];
var crankGroup,flywheelGrp,camshaftGrp,beltTopGrp,beltBotGrp;
var blockMesh,headMesh,coverMesh,poddonMesh,cylShells=[],ribMeshes=[];

function mat(c,m,r){
  return new THREE.MeshStandardMaterial({color:c,metalness:(m!==undefined?m:0.85),roughness:(r!==undefined?r:0.35)});
}
function makeCyl(r,h,seg,c,m,r){
  return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||20),mat(c,m,r));
}
function makeBox(w,h,d,c,m,r){
  return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,m,r));
}
function updCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy+3,cz);
  camera.lookAt(0,3,0);
}

function setGhost(on){
  ghost=on;
  var opa=on?0.15:1.0;
  if(blockMesh){blockMesh.material.transparent=on;blockMesh.material.opacity=opa;}
  if(headMesh){headMesh.material.transparent=on;headMesh.material.opacity=opa;}
  if(coverMesh){coverMesh.material.transparent=on;coverMesh.material.opacity=opa;}
  if(poddonMesh){poddonMesh.material.transparent=on;poddonMesh.material.opacity=on?0.5:1;}
  for(var i=0;i<ribMeshes.length;i++){
    ribMeshes[i].material.transparent=on;
    ribMeshes[i].material.opacity=on?0.25:1;
  }
  for(var j=0;j<cylShells.length;j++){
    cylShells[j].material.opacity=on?0.08:0.35;
  }
  var btn=document.getElementById('ghostBtn');
  if(btn)btn.textContent=on?'👁 Скелет':'👁 Скрыто';
  try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
}

function buildValve(color){
  var g=new THREE.Group();
  var disc=makeCyl(0.32,0.15,16,color,0.7,0.4);
  g.add(disc);
  var stem=makeCyl(0.08,1.1,8,0xa8b4c0,0.9,0.3);
  stem.position.y=0.6;
  g.add(stem);
  return g;
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
  scene.fog=new THREE.Fog(0x0a0e13,30,60);

  var w=wrap.clientWidth||360;
  var h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,150);
  updCam();

  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(w,h);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff,0.5));
  var d1=new THREE.DirectionalLight(0xffffff,1.0);d1.position.set(8,15,10);scene.add(d1);
  var d2=new THREE.DirectionalLight(0x88aaff,0.55);d2.position.set(-8,-5,-10);scene.add(d2);
  var p1=new THREE.PointLight(0xff8030,1.3,20);p1.position.set(0,5,3);scene.add(p1);
  var p2=new THREE.PointLight(0x3080ff,0.7,20);p2.position.set(-6,2,-6);scene.add(p2);

  var root=new THREE.Group();
  scene.add(root);

  /* ПОДДОН */
  poddonMesh=makeBox(12,1.2,5.5,0x2a3340,0.7,0.5);
  poddonMesh.position.y=-0.3;
  root.add(poddonMesh);

  /* БЛОК */
  blockMesh=makeBox(12,5,5.2,0x4a5566,0.85,0.4);
  blockMesh.position.y=2.8;
  root.add(blockMesh);

  /* РЁБРА */
  for(var r=0;r<10;r++){
    var rib=makeBox(12.05,0.08,5.25,0x2a3340,0.6,0.6);
    rib.position.y=0.6+r*0.5;
    root.add(rib);
    ribMeshes.push(rib);
  }

  /* ГОЛОВКА */
  headMesh=makeBox(12.2,1.6,5.4,0x3a4756,0.85,0.35);
  headMesh.position.y=6.1;
  root.add(headMesh);

  /* КРЫШКА */
  coverMesh=makeBox(12,0.9,5,0x2a3340,0.75,0.4);
  coverMesh.position.y=7.3;
  root.add(coverMesh);

  /* БОЛТЫ */
  for(var b=0;b<6;b++){
    for(var sign=-1;sign<=1;sign+=2){
      var bolt=makeCyl(0.14,0.15,10,0xb8c6d4,0.95,0.2);
      bolt.position.set(-5+b*2,7.8,sign*2.2);
      root.add(bolt);
    }
  }

  /* ЦИЛИНДРЫ */
  var cylX=[-4.5,-1.5,1.5,4.5];
  for(var c=0;c<4;c++){
    var gh=new THREE.Mesh(
      new THREE.CylinderGeometry(1.3,1.3,4.8,32,1,true),
      new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.15,transparent:true,opacity:0.35,side:THREE.DoubleSide})
    );
    gh.position.set(cylX[c],3.2,0);
    root.add(gh);
    cylShells.push(gh);
  }

  /* КОЛЕНВАЛ */
  crankGroup=new THREE.Group();
  crankGroup.position.y=0.5;
  var axis=makeCyl(0.4,14,20,0xa8b4c0,0.95,0.2);
  axis.rotation.z=Math.PI/2;
  crankGroup.add(axis);
  var mains=[-6,-3,0,3,6];
  for(var m=0;m<mains.length;m++){
    var mn=makeCyl(0.6,0.5,20,0xb8c6d4,0.95,0.2);
    mn.rotation.z=Math.PI/2;
    mn.position.x=mains[m];
    crankGroup.add(mn);
  }
  for(var i=0;i<4;i++){
    var off=i*Math.PI;
    var cx=cylX[i];
    var cpx=Math.cos(off)*0.75;
    var cpy=Math.sin(off)*0.75;
    var pinGrp=new THREE.Group();
    var pin=makeCyl(0.35,0.6,16,0xd8e4f0,0.95,0.2);
    pin.rotation.z=Math.PI/2;
    pinGrp.add(pin);
    pinGrp.position.set(cx,cpy,0);
    crankGroup.add(pinGrp);
    var cw=new THREE.Group();
    var disc=makeCyl(0.9,0.5,20,0x2c3947,0.7,0.5);
    disc.rotation.z=Math.PI/2;
    cw.add(disc);
    var weight=makeBox(1.5,0.3,0.5,0x2c3947,0.7,0.5);
    weight.position.y=-0.5;
    cw.add(weight);
    cw.position.set(cx,0,0);
    cw.rotation.z=-off;
    crankGroup.add(cw);
  }
  root.add(crankGroup);

  /* МАХОВИК */
  flywheelGrp=new THREE.Group();
  var fwDisc=makeCyl(2.2,0.4,32,0x8a95a3,0.9,0.3);
  fwDisc.rotation.z=Math.PI/2;
  flywheelGrp.add(fwDisc);
  for(var ft=0;ft<36;ft++){
    var tooth=makeBox(0.4,0.35,0.15,0x6a7685,0.9,0.3);
    var a=(ft/36)*Math.PI*2;
    tooth.position.set(0,Math.cos(a)*2.3,Math.sin(a)*2.3);
    tooth.rotation.x=-a;
    flywheelGrp.add(tooth);
  }
  flywheelGrp.position.set(7,0.5,0);
  root.add(flywheelGrp);

  /* ШЕСТЕРНЯ ВЕРХ */
  beltTopGrp=new THREE.Group();
  var gt=makeCyl(0.9,0.4,20,0x8a95a3,0.9,0.3);
  gt.rotation.z=Math.PI/2;
  beltTopGrp.add(gt);
  for(var gtt=0;gtt<20;gtt++){
    var tg=makeBox(0.25,0.2,0.15,0x6a7685,0.9,0.3);
    var a2=(gtt/20)*Math.PI*2;
    tg.position.set(0,Math.cos(a2)*0.95,Math.sin(a2)*0.95);
    tg.rotation.x=-a2;
    beltTopGrp.add(tg);
  }
  beltTopGrp.position.set(-7,6,0);
  root.add(beltTopGrp);

  /* ШЕСТЕРНЯ НИЗ */
  beltBotGrp=new THREE.Group();
  var gb=makeCyl(1.3,0.4,20,0x8a95a3,0.9,0.3);
  gb.rotation.z=Math.PI/2;
  beltBotGrp.add(gb);
  for(var gbt=0;gbt<26;gbt++){
    var tg2=makeBox(0.25,0.2,0.15,0x6a7685,0.9,0.3);
    var a3=(gbt/26)*Math.PI*2;
    tg2.position.set(0,Math.cos(a3)*1.35,Math.sin(a3)*1.35);
    tg2.rotation.x=-a3;
    beltBotGrp.add(tg2);
  }
  beltBotGrp.position.set(-7,0.5,0);
  root.add(beltBotGrp);

  /* РЕМЕНЬ */
  var beltMat=new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.2,roughness:0.9});
  var b1=new THREE.Mesh(new THREE.BoxGeometry(0.15,5.5,0.7),beltMat);
  b1.position.set(-7.8,3.25,0);
  root.add(b1);
  var b2=new THREE.Mesh(new THREE.BoxGeometry(0.15,5.5,1.0),beltMat);
  b2.position.set(-6.2,3.25,0);
  root.add(b2);

  /* РАСПРЕДВАЛ */
  camshaftGrp=new THREE.Group();
  var camAxis=makeCyl(0.25,14,16,0xa8b4c0,0.95,0.2);
  camAxis.rotation.z=Math.PI/2;
  camshaftGrp.add(camAxis);
  for(var cc=0;cc<8;cc++){
    var camGrp=new THREE.Group();
    var camDisc=makeCyl(0.35,0.35,16,0x8a95a3,0.9,0.3);
    camDisc.rotation.z=Math.PI/2;
    camGrp.add(camDisc);
    var nub=makeCyl(0.15,0.35,10,0x6a7685,0.9,0.3);
    nub.rotation.z=Math.PI/2;
    nub.position.y=0.35;
    camGrp.add(nub);
    var cxx=-5.4+(cc>>1)*3.6;
    var czz=(cc%2===0)?-0.6:0.6;
    camGrp.position.set(cxx,0,czz);
    camshaftGrp.add(camGrp);
    cams.push({grp:camGrp,off:cc*Math.PI/4});
  }
  camshaftGrp.position.y=6.3;
  root.add(camshaftGrp);

  /* ЦИЛИНДРЫ */
  for(var k=0;k<4;k++){
    var cx2=cylX[k];
    var piston=new THREE.Group();
    var body=makeCyl(1.15,1.3,24,0xd8e0e8,0.95,0.15);
    piston.add(body);
    for(var kr=0;kr<3;kr++){
      var ring=makeCyl(1.18,0.08,24,0x2a333f,0.6,0.7);
      ring.position.y=0.4-kr*0.25;
      piston.add(ring);
    }
    var pin=makeCyl(0.2,1.4,12,0x2a3543,0.9,0.3);
    pin.rotation.z=Math.PI/2;
    piston.add(pin);
    piston.position.set(cx2,3,0);
    root.add(piston);
    pistons.push({grp:piston,x:cx2,off:k*Math.PI});

    var rod=makeBox(0.45,2.8,0.45,0x8894a2,0.9,0.25);
    root.add(rod);
    rods.push({mesh:rod,x:cx2,off:k*Math.PI});

    var vIn=buildValve(0x6fd0ff);
    root.add(vIn);
    valves.push({grp:vIn,x:cx2-0.5,z:0.5,off:k*Math.PI,side:-1});

    var vEx=buildValve(0xff8a6f);
    root.add(vEx);
    valves.push({grp:vEx,x:cx2+0.5,z:-0.5,off:k*Math.PI,side:1});

    var spark=new THREE.Group();
    var cer=makeCyl(0.16,0.6,10,0xe8e4dc,0.3,0.5);
    cer.position.y=0.3;
    spark.add(cer);
    var metal=makeCyl(0.2,0.3,10,0x8a95a3,0.9,0.3);
    metal.position.y=-0.1;
    spark.add(metal);
    spark.position.set(cx2,6.5,0);
    root.add(spark);
  }

  /* КОЛЛЕКТОР */
  for(var e=0;e<4;e++){
    var pipe=makeCyl(0.25,1.5,12,0x4a3a2a,0.8,0.5);
    pipe.position.set(cylX[e],8.2,-2.5);
    root.add(pipe);
  }
  var mainPipe=makeCyl(0.35,10,16,0x4a3a2a,0.8,0.5);
  mainPipe.rotation.z=Math.PI/2;
  mainPipe.position.set(0,8.9,-2.5);
  root.add(mainPipe);

  attachControls();
  setGhost(false);
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
        dist*=pinch/nd;dist=Math.max(8,Math.min(35,dist));
        pinch=nd;updCam();
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
  el.addEventListener('wheel',function(e){dist*=(1+e.deltaY*0.001);dist=Math.max(8,Math.min(35,dist));updCam();e.preventDefault();},{passive:false});
}

function animate(){
  if(!active||!scene){animId=null;return;}
  animId=requestAnimationFrame(animate);
  var ang=S.crankAngle||0;
  var ROD=2.9,CR=0.75;

  for(var i=0;i<4;i++){
    var ph=ang+pistons[i].off;
    var s=Math.sin(ph),co=Math.cos(ph);
    var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
    var d=CR*co+Math.sqrt(sq);
    var py=0.5+d;
    pistons[i].grp.position.y=py;
    var cpX=pistons[i].x+CR*s;
    var cpY=0.5-CR*co;
    var rod=rods[i].mesh;
    var dx=cpX-pistons[i].x;
    var dy=cpY-py;
    var len=Math.hypot(dx,dy);
    rod.position.set((pistons[i].x+cpX)/2,(py+cpY)/2,0);
    rod.scale.y=len/2.8;
    rod.rotation.z=Math.atan2(dx,-dy);
  }

  if(crankGroup)crankGroup.rotation.x=ang;
  if(flywheelGrp)flywheelGrp.rotation.x=ang;
  if(beltBotGrp)beltBotGrp.rotation.x=ang;
  if(beltTopGrp)beltTopGrp.rotation.x=ang*0.5;
  if(camshaftGrp)camshaftGrp.rotation.x=ang*0.5;
  for(var c=0;c<cams.length;c++){
    cams[c].grp.rotation.z=(ang*0.5)+cams[c].off;
  }

  for(var v=0;v<valves.length;v++){
    var val=valves[v];
    var cycle=((ang+val.off)%(Math.PI*4)+Math.PI*4)%(Math.PI*4);
    var idx=Math.floor(cycle/Math.PI);
    var lift=0;
    if(val.side<0&&idx===0)lift=Math.max(0,Math.sin(cycle%Math.PI))*0.3;
    if(val.side>0&&idx===3)lift=Math.max(0,Math.sin(cycle-3*Math.PI))*0.3;
    val.grp.position.set(val.x,5.3-lift,val.z);
  }

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

function toggleGhost(){
  setGhost(!ghost);
}

function attachBtn(){
  var btn=document.getElementById('view3dBtn');
  if(btn)btn.addEventListener('click',function(e){e.preventDefault();toggle();});
  var gb=document.getElementById('ghostBtn');
  if(gb){
    gb.style.display='none';
    gb.addEventListener('click',function(e){e.preventDefault();toggleGhost();});
  }
}
window.DVS_3D={toggle:toggle,toggleGhost:toggleGhost};
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',attachBtn);}else{attachBtn();}
})();