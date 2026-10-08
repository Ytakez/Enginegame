(function(){
"use strict";
var S = window.S; if(!S) return;

var active = false, scene, camera, renderer, container, animId = null;
var rotX = 0.4, rotY = 0.7, dist = 22;
var isDown = false, lastX = 0, lastY = 0, pinch = 0;
var ghost = false, currentType = null;
var asm = [], cams = [];
var crankGrp, flywheelGrp, camshaftGrp, beltTopGrp, beltBotGrp;
var blockM = [], headM = [], coverM = [], shells = [], ribM = [];
var root = null;
var raycaster = null, pointer = null, labelBox = null;
var touchStartX = 0, touchStartY = 0, touchMoved = false;

var CFG = {
  scooter:{n:1,v:false}, tdi:{n:4,v:false},
  mt82:{n:4,v:false}, passatb3:{n:4,v:false},
  bluebird:{n:4,v:false}, galant6:{n:6,v:true},
  r4:{n:4,v:false}, v8:{n:12,v:true}, v16:{n:22,v:true}
};

function mat(c,a,b){return new THREE.MeshStandardMaterial({color:c,metalness:a===undefined?0.85:a,roughness:b===undefined?0.35:b});}
function mkCyl(r,h,s,c,a,b){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),mat(c,a,b));}
function mkBox(w,h,d,c,a,b){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,a,b));}
function mkBolt(r){return mkCyl(0.12,r||0.2,10,0xc8d4e0,0.95,0.2);}

function updCam(){
  var cx = dist*Math.sin(rotY)*Math.cos(rotX);
  var cyy = dist*Math.sin(rotX);
  var cz = dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx, cyy+3, cz);
  camera.lookAt(0,3,0);
}

function setGhost(on){
  ghost = on;
  var opa = on ? 0.12 : 1.0;
  var L = blockM.concat(headM).concat(coverM);
  for(var i=0;i<L.length;i++){ if(!L[i]) continue; L[i].material.transparent=on; L[i].material.opacity=opa; }
  for(var r=0;r<ribM.length;r++){ ribM[r].material.transparent=on; ribM[r].material.opacity=on?0.2:1; }
  for(var s=0;s<shells.length;s++){ shells[s].material.opacity = on?0.06:0.32; }
  var btn = document.getElementById('ghostBtn');
  if(btn) btn.textContent = on ? '👁 Скелет' : '👁 Скрыто';
  try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
}

function tag(obj, name){
  if(!obj) return;
  obj.userData = obj.userData || {};
  obj.userData.partName = name;
}

function tagAllParts(){
  if(!root) return;
  if(crankGrp) crankGrp.traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Коленвал'); });
  if(flywheelGrp) flywheelGrp.traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Маховик'); });
  if(camshaftGrp) camshaftGrp.traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Распредвал'); });
  if(beltTopGrp) beltTopGrp.traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Шестерня распредвала'); });
  if(beltBotGrp) beltBotGrp.traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Шестерня коленвала'); });
  for(var i=0;i<blockM.length;i++) tag(blockM[i],'Блок цилиндров');
  for(var h=0;h<headM.length;h++) tag(headM[h],'Головка блока');
  for(var c=0;c<coverM.length;c++) tag(coverM[c],'Крышка распредвала');
  for(var r=0;r<ribM.length;r++) tag(ribM[r],'Ребро охлаждения');
  for(var s=0;s<shells.length;s++) tag(shells[s],'Гильза цилиндра');
  for(var a=0;a<asm.length;a++){
    var A = asm[a];
    if(A.p) A.p.traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Поршень'); });
    if(A.rod) tag(A.rod,'Шатун');
    if(A.vv && A.vv[0]) A.vv[0].traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Впускной клапан'); });
    if(A.vv && A.vv[1]) A.vv[1].traverse(function(o){ if(o.isMesh && !(o.userData&&o.userData.partName)) tag(o,'Выпускной клапан'); });
  }
  // дизельная обвязка — теги по позиции
  if(!root) return;
  root.traverse(function(o){
    if(!o.isMesh || (o.userData && o.userData.partName)) return;
    var p = o.getWorldPosition ? o.getWorldPosition(new THREE.Vector3()) : null;
    if(!p) return;
    if(p.y > 9 && Math.abs(p.x) > 3) tag(o,'Топливный насос ТНВД');
    else if(p.y > 9) tag(o,'Выпускной коллектор');
    else if(p.y < -0.1) tag(o,'Масляный поддон');
  });
}

function showLabel(name){
  if(!labelBox) return;
  labelBox.innerHTML = '<div style="font-size:10px;color:#8fd8ff;letter-spacing:2px;margin-bottom:6px">ДЕТАЛЬ</div><div style="font-size:16px;font-weight:900">'+name+'</div>';
  labelBox.style.display = 'block';
  clearTimeout(labelBox._t);
  labelBox._t = setTimeout(function(){ labelBox.style.display='none'; }, 2400);
  try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
}

function onTap(cx, cyy){
  if(!scene || !camera || !renderer) return;
  var rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((cyy - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  var hits = raycaster.intersectObjects(scene.children, true);
  for(var i=0;i<hits.length;i++){
    var obj = hits[i].object;
    var nm = obj.userData && obj.userData.partName;
    if(!nm){
      var p = obj.parent, t = 0;
      while(p && t < 8){
        if(p.userData && p.userData.partName){ nm = p.userData.partName; break; }
        p = p.parent; t++;
      }
    }
    if(nm){ showLabel(nm); return; }
  }
  showLabel('Корпус двигателя');
}

function initRay(){
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  labelBox = document.createElement('div');
  labelBox.id = 'partLabel';
  labelBox.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(10,15,20,.96);border:2px solid #43c98a;border-radius:14px;padding:16px 28px;color:#e6fff3;font:800 15px "Segoe UI",sans-serif;letter-spacing:1.2px;z-index:30;pointer-events:none;box-shadow:0 0 40px rgba(67,201,138,.6),inset 0 0 20px rgba(67,201,138,.1);display:none;text-align:center;max-width:85%;backdrop-filter:blur(6px)';
  container.appendChild(labelBox);
}

function attachControls(){
  var el = renderer.domElement;
  function down(e){
    touchMoved = false;
    if(e.touches && e.touches.length === 1){
      isDown = true;
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
      touchStartX = lastX; touchStartY = lastY;
    } else if(e.touches && e.touches.length === 2){
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      pinch = Math.hypot(dx,dy);
      isDown = false; touchMoved = true;
    } else if(!e.touches){
      isDown = true;
      lastX = e.clientX; lastY = e.clientY;
      touchStartX = lastX; touchStartY = lastY;
    }
  }
  function move(e){
    if(e.touches){
      if(e.touches.length === 1 && isDown){
        var cx = e.touches[0].clientX, cyy = e.touches[0].clientY;
        if(Math.abs(cx - touchStartX) > 6 || Math.abs(cyy - touchStartY) > 6) touchMoved = true;
        rotY += (cx - lastX) * 0.012;
        rotX += (cyy - lastY) * 0.012;
        rotX = Math.max(-1.3, Math.min(1.3, rotX));
        lastX = cx; lastY = cyy;
        updCam();
      } else if(e.touches.length === 2 && pinch){
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var nd = Math.hypot(dx,dy);
        dist *= pinch / nd;
        dist = Math.max(10, Math.min(45, dist));
        pinch = nd;
        updCam();
      }
    } else if(isDown){
      if(Math.abs(e.clientX - touchStartX) > 6 || Math.abs(e.clientY - touchStartY) > 6) touchMoved = true;
      rotY += (e.clientX - lastX) * 0.012;
      rotX += (e.clientY - lastY) * 0.012;
      rotX = Math.max(-1.3, Math.min(1.3, rotX));
      lastX = e.clientX; lastY = e.clientY;
      updCam();
    }
  }
  function up(e){
    var wasDown = isDown;
    isDown = false;
    pinch = 0;
    if(!touchMoved && wasDown){
      var cx, cyy;
      if(e.changedTouches && e.changedTouches.length){
        cx = e.changedTouches[0].clientX;
        cyy = e.changedTouches[0].clientY;
      } else {
        cx = e.clientX; cyy = e.clientY;
      }
      if(cx !== undefined) onTap(cx, cyy);
    }
  }
  el.addEventListener('touchstart', down, {passive:false});
  el.addEventListener('touchmove', function(e){ e.preventDefault(); move(e); }, {passive:false});
  el.addEventListener('touchend', up);
  el.addEventListener('touchcancel', up);
  el.addEventListener('mousedown', down);
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseup', up);
  el.addEventListener('wheel', function(e){ dist *= (1 + e.deltaY*0.001); dist = Math.max(10,Math.min(45,dist)); updCam(); e.preventDefault(); }, {passive:false});
}

function setup(){
  var ecv = document.getElementById('engineCv');
  if(!ecv) return;
  var wrap = ecv.parentNode;
  if(!wrap) return;
  wrap.style.position = 'relative';
  if(document.getElementById('view3dBox')) return;
  container = document.createElement('div');
  container.id = 'view3dBox';
  container.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:none;z-index:5';
  wrap.appendChild(container);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e13);
  scene.fog = new THREE.Fog(0x0a0e13, 45, 95);
  var w = wrap.clientWidth || 360, h = wrap.clientHeight || 430;
  camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 250);
  updCam();
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  container.appendChild(renderer.domElement);
  // ОСВЕЩЕНИЕ
  scene.add(new THREE.AmbientLight(0xffffff, 0.28));
  var hemi = new THREE.HemisphereLight(0xaaccff, 0x3a2010, 0.65);
  scene.add(hemi);
  var keyL = new THREE.DirectionalLight(0xffffff, 1.7);
  keyL.position.set(12, 22, 14);
  scene.add(keyL);
  var fillL = new THREE.DirectionalLight(0x88aaff, 0.85);
  fillL.position.set(-14, 8, -14);
  scene.add(fillL);
  var backL = new THREE.DirectionalLight(0xffaa66, 0.55);
  backL.position.set(0, 10, -18);
  scene.add(backL);
  var topL = new THREE.DirectionalLight(0xffffff, 0.6);
  topL.position.set(0, 25, 0);
  scene.add(topL);
  var warm = new THREE.PointLight(0xff8030, 2.4, 40);
  warm.position.set(0, 10, 6);
  scene.add(warm);
  var cool = new THREE.PointLight(0x3070ff, 1.5, 40);
  cool.position.set(-12, 5, -10);
  scene.add(cool);
  var rim = new THREE.PointLight(0xffffff, 1.2, 45);
  rim.position.set(14, 14, -10);
  scene.add(rim);
  var bottom = new THREE.PointLight(0x2040a0, 0.7, 30);
  bottom.position.set(0, -8, 5);
  scene.add(bottom);
  if(window.DVS_3D_REBUILD) window.DVS_3D_REBUILD();
  currentType = S.engineType;
  tagAllParts();
  initRay();
  attachControls();
  setGhost(false);
}

function animate(){
  if(!active || !scene){ animId = null; return; }
  animId = requestAnimationFrame(animate);
  var ang = S.crankAngle || 0;
  if(S.engineType !== currentType){
    if(window.DVS_3D_REBUILD) window.DVS_3D_REBUILD();
    currentType = S.engineType;
    setGhost(ghost);
    tagAllParts();
  }
  for(var i=0;i<asm.length;i++){
    var A = asm[i];
    var ph = ang + A.off;
    var ROD = 2.9, CR = 0.75;
    var s = Math.sin(ph), co = Math.cos(ph);
    var sq = ROD*ROD - CR*CR*s*s; if(sq<0) sq=0;
    var d = CR*co + Math.sqrt(sq);
    var py = d;
    A.p.position.y = py;
    var cpX = CR*s;
    var cpY = d;
    A.rod.position.set(cpX/2, (py+cpY)/2, 0);
    A.rod.rotation.z = Math.atan2(cpX, -(cpY-py+0.01));
    var cycle = ((ang + A.off) % (Math.PI*4) + Math.PI*4) % (Math.PI*4);
    var idx = Math.floor(cycle / Math.PI);
    var vIn = 0, vEx = 0;
    if(idx === 0) vIn = Math.max(0, Math.sin(cycle % Math.PI)) * 0.28;
    if(idx === 3) vEx = Math.max(0, Math.sin(cycle - 3*Math.PI)) * 0.28;
    if(A.vv[0]) A.vv[0].position.y = A.h + 0.05 - vIn;
    if(A.vv[1]) A.vv[1].position.y = A.h + 0.05 - vEx;
  }
  if(crankGrp) crankGrp.rotation.x = ang;
  if(flywheelGrp) flywheelGrp.rotation.x = ang;
  if(beltBotGrp) beltBotGrp.rotation.x = ang;
  if(beltTopGrp) beltTopGrp.rotation.x = ang * 0.5;
  if(camshaftGrp) camshaftGrp.rotation.x = ang * 0.5;
  for(var c=0;c<cams.length;c++) cams[c].grp.rotation.z = (ang * 0.5) + cams[c].off;
  renderer.render(scene, camera);
}

function toggle(){
  if(!window.THREE){ alert('3D не загрузилось'); return; }
  if(!container) setup();
  active = !active;
  container.style.display = active ? 'block' : 'none';
  var btn = document.getElementById('view3dBtn');
  if(btn) btn.textContent = active ? '📊 2D' : '🎥 3D';
  var gb = document.getElementById('ghostBtn');
  if(gb) gb.style.display = active ? 'inline-block' : 'none';
  if(active){
    var wrap = document.getElementById('engineCv').parentNode;
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if(w && h && renderer){
      renderer.setSize(w, h);
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
    }
    if(S.engineType !== currentType && window.DVS_3D_REBUILD){
      window.DVS_3D_REBUILD();
      currentType = S.engineType;
      setGhost(ghost);
      tagAllParts();
    }
    if(!animId) animate();
  } else if(animId){
    cancelAnimationFrame(animId);
    animId = null;
  }
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
}

function toggleGhost(){ setGhost(!ghost); }

function attachBtn(){
  var btn = document.getElementById('view3dBtn');
  if(btn) btn.addEventListener('click', function(e){ e.preventDefault(); toggle(); });
  var gb = document.getElementById('ghostBtn');
  if(gb){
    gb.style.display = 'none';
    gb.addEventListener('click', function(e){ e.preventDefault(); toggleGhost(); });
  }
}

window.DVS_3D = { toggle:toggle, toggleGhost:toggleGhost };
window.DVS_3D_BUILD = { m:mat, cy:mkCyl, bx:mkBox, bl:mkBolt };
window.DVS_3D_REF = {
  getScene: function(){ return scene; },
  setScene: function(s){ scene = s; },
  getRoot: function(){ return root; },
  setRoot: function(r){ root = r; },
  setCrank: function(g){ crankGrp = g; },
  setFly: function(g){ flywheelGrp = g; },
  setCam: function(g){ camshaftGrp = g; },
  setBeltT: function(g){ beltTopGrp = g; },
  setBeltB: function(g){ beltBotGrp = g; },
  getAsm: function(){ return asm; },
  setAsm: function(a){ asm = a; },
  getCams: function(){ return cams; },
  setCams: function(c){ cams = c; },
  pushBlock: function(x){ blockM.push(x); },
  pushHead: function(x){ headM.push(x); },
  pushCover: function(x){ coverM.push(x); },
  pushRib: function(x){ ribM.push(x); },
  clearAll: function(){ blockM=[]; headM=[]; coverM=[]; ribM=[]; shells=[]; asm=[]; cams=[]; },
  getCfg: function(t){ return CFG[t] || CFG.r4; },
  tagAllParts: tagAllParts
};

if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', attachBtn); }
else { attachBtn(); }
})();