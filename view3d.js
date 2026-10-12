(function(){
"use strict";
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.5,rotY=0.6,dist=18,isDown=false,lastX=0,lastY=0,pinch=0;
var _ready=false;
var _groups=[];

function M(c,mt,rg,op,tr){
  var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};
  if(op!==undefined){o.transparent=true;o.opacity=op;}
  if(tr)o.side=THREE.DoubleSide;
  return new THREE.MeshStandardMaterial(o);
}
function cyl(r,h,s,c,mt,rg){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),M(c,mt,rg));}
function box(w,h,d,c,mt,rg){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,mt,rg));}

function buildR4(root){
  var L=8;
  var pod=box(L+0.4,1.4,5,0x2a3340,0.7,0.5);pod.position.y=-0.7;root.add(pod);
  var crankG=new THREE.Group();crankG.position.y=0.6;
  var ax=cyl(0.4,L+1,20,0xa8b4c0,0.95,0.2);ax.rotation.z=Math.PI/2;crankG.add(ax);
  for(var i=0;i<4;i++){
    var cxx=-L/2+0.85+i*(L-1.7)/3;
    var pin=cyl(0.3,0.5,12,0xd8e4f0,0.95,0.2);pin.rotation.z=Math.PI/2;
    pin.position.set(cxx,Math.sin(i*Math.PI)*0.55,0);crankG.add(pin);
  }
  root.add(crankG);_groups.push({g:crankG,type:'crank'});
  var bk=box(L,5,5,0x4a5566,0.8,0.45);bk.position.y=3.4;root.add(bk);
  for(var rr=0;rr<9;rr++){
    var rb=box(L+0.06,0.07,5.05,0x1a1a1a,0.6,0.6);rb.position.y=1.2+rr*0.55;root.add(rb);
  }
  var hd=box(L+0.2,1.4,5.3,0x3a4756,0.85,0.35);hd.position.y=6.4;root.add(hd);
  var cv=box(L,0.8,5,0x2a3340,0.75,0.4);cv.position.y=7.5;root.add(cv);
  var inM=cyl(0.34,L*0.9,14,0x3a4654,0.85,0.4);inM.rotation.z=Math.PI/2;
  inM.position.set(0,5.8,2.5);root.add(inM);
  var exM=cyl(0.36,L*0.9,14,0x4a3a2a,0.85,0.5);exM.rotation.z=Math.PI/2;
  exM.position.set(0,-0.3,-2.5);root.add(exM);
  for(var j=0;j<4;j++){
    var xx=-L/2+1+2.2/2+j*2.2;
    var shell=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,4.6,20,1,true),
      M(0x8894a2,0.9,0.15,0.32,true));
    shell.position.set(xx,3.4,0);root.add(shell);
    var p=cyl(1.05,1,18,0xd8e0e8,0.95,0.15);
    p.position.set(xx,3.4,0);root.add(p);
    _groups.push({g:p,type:'piston',phase:j*Math.PI,baseY:3.4});
  }
  var fw=cyl(2.2,0.4,32,0x8a95a3,0.9,0.3);fw.rotation.z=Math.PI/2;
  fw.position.set(L/2+2.9,0.6,0);root.add(fw);_groups.push({g:fw,type:'fly'});
}

function buildV6(root){
  var L=8,half=Math.PI/6,bd=1.8;
  var pod=box(L+0.4,1.2,7.5,0x2a2a2a,0.7,0.5);pod.position.y=-0.9;root.add(pod);
  var crankG=new THREE.Group();crankG.position.y=0.6;
  var ax=cyl(0.4,L+1,20,0xa8b4c0,0.95,0.2);ax.rotation.z=Math.PI/2;crankG.add(ax);
  root.add(crankG);_groups.push({g:crankG,type:'crank'});
  for(var side=0;side<2;side++){
    var sign=side===0?-1:1;
    var bk=box(L,5,2.8,0x3a3a3a,0.85,0.4);
    bk.position.set(0,3.4,sign*bd);bk.rotation.x=sign*half;root.add(bk);
    var hd=box(L+0.2,1.4,2.8,0x8894a2,0.9,0.25);
    hd.position.set(0,6.4,sign*(bd+1.2));hd.rotation.x=sign*half;root.add(hd);
    var cv=box(L,0.8,2.5,0x2a3340,0.75,0.4);
    cv.position.set(0,7.5,sign*(bd+1.5));cv.rotation.x=sign*half;root.add(cv);
    var inM=cyl(0.32,L*0.9,14,0x8b6a2b,0.9,0.35);inM.rotation.z=Math.PI/2;
    inM.position.set(0,7.0,sign*(bd+2.2));root.add(inM);
    for(var j=0;j<3;j++){
      var xx=-3+0.85+j*2.2;
      var grp=new THREE.Group();
      grp.position.set(xx,3.4,sign*bd);grp.rotation.x=sign*half;
      var shell=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,4.6,20,1,true),
        M(0x8894a2,0.9,0.15,0.32,true));
      shell.position.y=0;grp.add(shell);
      var p=cyl(0.95,1,18,0xd8e0e8,0.95,0.15);grp.add(p);
      root.add(grp);
    }
  }
}

function buildBoxer(root){
  var L=6,bd=1.6,half=Math.PI/2;
  var pod=box(L+0.3,1.2,6,0x2a3340,0.7,0.5);pod.position.y=-0.6;root.add(pod);
  var crankG=new THREE.Group();crankG.position.y=0.6;
  crankG.add((function(){var x=cyl(0.4,L+1,20,0xa8b4c0,0.95,0.2);x.rotation.z=Math.PI/2;return x;})());
  root.add(crankG);_groups.push({g:crankG,type:'crank'});
  for(var side=0;side<2;side++){
    var sign=side===0?-1:1;
    var bk=box(L,4.4,2.6,0x4a5566,0.85,0.4);
    bk.position.set(0,3.4,sign*bd);bk.rotation.x=sign*half;root.add(bk);
    for(var j=0;j<2;j++){
      var xx=-1.2+j*2.4;
      var grp=new THREE.Group();
      grp.position.set(xx,3.4,sign*bd);grp.rotation.x=sign*half;
      var shell=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,4,20,1,true),
        M(0x8894a2,0.9,0.15,0.32,true));
      grp.add(shell);
      var p=cyl(0.9,1,18,0xd8e0e8,0.95,0.15);grp.add(p);
      root.add(grp);
    }
  }
}

function buildRadial(root){
  var n=9,R=3.2,cylLen=3;
  var carter=cyl(3.4,0.8,32,0x3a3a3a,0.75,0.45);
  carter.rotation.x=Math.PI/2;carter.position.set(0,3,0);root.add(carter);
  var crank=new THREE.Group();crank.position.set(0,3,0);
  var crBar=cyl(0.45,5.5,20,0xa8b4c0,0.95,0.2);crBar.rotation.z=Math.PI/2;
  crank.add(crBar);root.add(crank);_groups.push({g:crank,type:'crank'});
  var fw=cyl(1.6,0.35,32,0x8a95a3,0.9,0.3);fw.rotation.z=Math.PI/2;
  fw.position.set(2.75,3,0);root.add(fw);_groups.push({g:fw,type:'fly'});
  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;
    var cx=Math.cos(a)*R,cyy=3+Math.sin(a)*R;
    var grp=new THREE.Group();
    grp.position.set(cx,cyy,0);grp.rotation.z=a-Math.PI/2;root.add(grp);
    var shell=new THREE.Mesh(new THREE.CylinderGeometry(1,1,cylLen,20,1,true),
      M(0x8894a2,0.9,0.15,0.32,true));
    shell.position.y=cylLen/2;grp.add(shell);
    var hd=cyl(1.05,0.4,20,0x8894a2,0.9,0.25);hd.position.y=cylLen+0.2;grp.add(hd);
    var p=cyl(0.9,0.7,18,0xd8e0e8,0.95,0.15);p.position.y=cylLen*0.5;grp.add(p);
  }
}

function buildWankel(root){
  var Rr=2,ecc=0.4,depth=1.6,rotR=1.2,space=5;
  var base=box(space+2.5,0.6,5.5,0x2a3340,0.7,0.5);base.position.y=-2.2;root.add(base);
  var axis=cyl(0.28,space+3,16,0xc8d4e0,0.95,0.2);axis.rotation.z=Math.PI/2;root.add(axis);
  _groups=[];
  function epi(){
    var pts=[];
    for(var i=0;i<=96;i++){
      var t=(i/96)*Math.PI*2;
      pts.push(new THREE.Vector2(Rr*Math.cos(t)+ecc*Math.cos(3*t),Rr*Math.sin(t)+ecc*Math.sin(3*t)));
    }
    return new THREE.Shape(pts);
  }
  function rot(){
    var sh=new THREE.Shape();
    for(var k=0;k<3;k++){
      var a=k*(Math.PI*2/3)-Math.PI/2;
      if(k===0)sh.moveTo(Math.cos(a)*rotR,Math.sin(a)*rotR);
      else sh.lineTo(Math.cos(a)*rotR,Math.sin(a)*rotR);
    }
    sh.closePath();return sh;
  }
  for(var ri=0;ri<2;ri++){
    var rx=(ri-0.5)*space;
    var unit=new THREE.Group();unit.position.set(rx,0,0);
    var eg=new THREE.ExtrudeGeometry(epi(),{depth:depth,bevelEnabled:false,curveSegments:48});
    eg.center();
    var cm=new THREE.Mesh(eg,M(0x8894a2,0.92,0.2,0.32,true));unit.add(cm);
    var rg=new THREE.ExtrudeGeometry(rot(),{depth:depth*0.72,bevelEnabled:false});
    rg.center();
    var rm=new THREE.Mesh(rg,M(0xdde5ee,0.95,0.15));unit.add(rm);
    _groups.push({g:rm,type:'rotor',ecc:ecc});
    root.add(unit);
  }
  var fw=cyl(1.6,0.4,32,0x8a95a3,0.92,0.28);fw.rotation.z=Math.PI/2;
  fw.position.set(space+2,0,0);root.add(fw);_groups.push({g:fw,type:'fly'});
}

function buildScooter(root){
  var L=4;
  var pod=box(L,1,3.4,0x2a3340,0.7,0.5);pod.position.y=-0.5;root.add(pod);
  var bk=box(L,3.6,3.4,0x4a5566,0.85,0.4);bk.position.y=2.4;root.add(bk);
  var hd=box(L+0.2,1.2,3.5,0x3a4756,0.85,0.35);hd.position.y=4.8;root.add(hd);
  var shell=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,3.4,20,1,true),
    M(0x8894a2,0.9,0.15,0.32,true));
  shell.position.y=2.4;root.add(shell);
  var p=cyl(1,1,18,0xd8e0e8,0.95,0.15);p.position.y=2.4;root.add(p);
}

function buildTractor(root){
  var L=10;
  var pod=box(L+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);pod.position.y=-1;root.add(pod);
  var bk=box(L,5.5,6,0x3a3a3a,0.75,0.55);bk.position.y=3.7;root.add(bk);
  var hd=box(L+0.3,1.6,6.3,0x4a4a4a,0.8,0.45);hd.position.y=7.1;root.add(hd);
  var cv=box(L,0.9,6,0x2a2a2a,0.7,0.45);cv.position.y=8.3;root.add(cv);
  for(var j=0;j<4;j++){
    var xx=-L/2+1.5+j*2.5;
    var shell=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,5,20,1,true),
      M(0x8894a2,0.9,0.15,0.32,true));
    shell.position.set(xx,3.7,0);root.add(shell);
    var p=cyl(1.15,1,18,0xd8e0e8,0.95,0.15);
    p.position.set(xx,3.7,0);root.add(p);
  }
}

function smartRebuild(){
  if(!scene)return;
  var old=window._3dRoot;
  if(old){
    while(old.children.length){var c=old.children.pop();if(c.geometry)try{c.geometry.dispose();}catch(e){}}
    scene.remove(old);
  }
  _groups=[];
  var root=new THREE.Group();scene.add(root);window._3dRoot=root;
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'').replace(/-/g,'');
  function has(){for(var i=0;i<arguments.length;i++)if(raw.indexOf(arguments[i])>=0)return true;return false;}
  if(has('wankel','renesis'))         buildWankel(root);
  else if(has('radial','wright'))     buildRadial(root);
  else if(has('boxer','subaru','ej25')) buildBoxer(root);
  else if(has('v6','galant'))         buildV6(root);
  else if(has('v8','v12','v16','v22'))buildV6(root);
  else if(has('scooter'))             buildScooter(root);
  else if(has('tractor','mtz','mt82'))buildTractor(root);
  else                                buildR4(root);
  console.log('3D built:',raw);
}

function setGhost(on){
  var btn=document.getElementById('ghostBtn');
  if(btn)btn.textContent=on?'👁 Скелет':'👁 Скрыто';
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
  var L4=new THREE.PointLight(0xff8030,2.0,60);L4.position.set(0,12,8);scene.add(L4);
  controls();
  _ready=true;return true;
}

function updCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy2=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy2+4,cz);
  camera.lookAt(0,3.5,0);
}

function controls(){
  var el=renderer.domElement;
  function down(e){
    if(e.touches&&e.touches.length===1){isDown=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;}
    else if(e.touches&&e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;
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
      var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;
      var nd=Math.hypot(dx,dy);dist*=pinch/nd;dist=Math.max(7,Math.min(45,dist));pinch=nd;updCam();
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
  for(var i=0;i<_groups.length;i++){
    var G=_groups[i];
    if(G.type==='crank'||G.type==='fly')G.g.rotation.x=-ang;
    if(G.type==='rotor'){
      G.g.rotation.z=-ang/3;
      G.g.position.x=Math.cos(ang)*G.ecc;
      G.g.position.y=Math.sin(ang)*G.ecc;
    }
  }
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
  smartRebuild();
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
  if(gb){gb.style.display='none';gb.addEventListener('click',function(e){e.preventDefault();setGhost(true);});}
  console.log('view3d.js: OK');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachBtn);
else attachBtn();
console.log('view3d.js: загружен');
})();