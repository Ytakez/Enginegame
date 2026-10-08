(function(){
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.4,rotY=0.7,dist=22,isDown=false,lastX=0,lastY=0,pinch=0;
var ghost=false,currentType=null;
var assemblies=[],cams=[],valves=[];
var crankGrp,flywheelGrp,camshaftGrp,beltTopGrp,beltBotGrp;
var blockMeshes=[],headMeshes=[],coverMeshes=[],shells=[],ribMeshes=[];
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

function mat(c,m,r){return new THREE.MeshStandardMaterial({color:c,metalness:(m!==undefined?m:0.85),roughness:(r!==undefined?r:0.35)});}
function cyl(r,h,seg,c,m,r2){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||20),mat(c,m,r2));}
function box(w,h,d,c,m,r){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,m,r));}
function bolt(r){return cyl(0.12,r||0.2,10,0xc8d4e0,0.95,0.2);}

function updateCam(){
  var cx=dist*Math.sin(rotY)*Math.cos(rotX);
  var cy=dist*Math.sin(rotX);
  var cz=dist*Math.cos(rotY)*Math.cos(rotX);
  camera.position.set(cx,cy+3,cz);
  camera.lookAt(0,3,0);
}

function setGhost(on){
  ghost=on;
  var opa=on?0.12:1.0;
  var list=[].concat(blockMeshes,headMeshes,coverMeshes);
  for(var i=0;i<list.length;i++){
    if(!list[i])continue;
    list[i].material.transparent=on;
    list[i].material.opacity=opa;
  }
  for(var r=0;r<ribMeshes.length;r++){
    ribMeshes[r].material.transparent=on;
    ribMeshes[r].material.opacity=on?0.2:1;
  }
  for(var s=0;s<shells.length;s++){
    shells[s].material.opacity=on?0.06:0.32;
  }
  var btn=document.getElementById('ghostBtn');
  if(btn)btn.textContent=on?'👁 Скелет':'👁 Скрыто';
  try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
}

/* одна сборка цилиндра */
function makeCylAssembly(opts){
  var grp=new THREE.Group();
  grp.position.set(opts.x,opts.y,opts.z);
  grp.rotation.y=opts.rotY||0;

  /* гильза */
  var shell=new THREE.Mesh(
    new THREE.CylinderGeometry(opts.r+0.15,opts.r+0.15,opts.h,24,1,true),
    new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.15,transparent:true,opacity:0.32,side:THREE.DoubleSide})
  );
  shell.position.y=opts.h/2;
  grp.add(shell);
  shells.push(shell);

  /* поршень */
  var piston=new THREE.Group();
  piston.position.y=opts.h*0.55;
  var body=cyl(opts.r,opts.r*0.9,20,0xd8e0e8,0.95,0.15);
  piston.add(body);
  for(var k=0;k<3;k++){
    var ring=cyl(opts.r+0.03,0.06,20,0x2a333f,0.6,0.7);
    ring.position.y=opts.r*0.3-k*opts.r*0.2;
    piston.add(ring);
  }
  var pin=cyl(opts.r*0.15,opts.r*1.1,12,0x2a3543,0.9,0.3);
  pin.rotation.z=Math.PI/2;
  piston.add(pin);
  grp.add(piston);

  /* шатун */
  var rod=box(opts.r*0.3,opts.h*0.5,opts.r*0.3,0x8894a2,0.9,0.25);
  grp.add(rod);

  /* форсунка или свеча */
  var ign;
  if(opts.diesel){
    ign=new THREE.Group();
    var fx=cyl(opts.r*0.15,opts.r*0.5,10,0x3a3a3a,0.7,0.4);
    fx.position.y=0.15; ign.add(fx);
    var fy=cyl(opts.r*0.2,opts.r*0.25,10,0x8a95a3,0.9,0.3);
    fy.position.y=-0.05; ign.add(fy);
    var pipe=cyl(0.06,opts.h*0.9,8,0x4a4a4a,0.6,0.6);
    pipe.position.set(opts.r*0.8,0.5,0); pipe.rotation.z=-0.5;
    ign.add(pipe);
  } else {
    ign=new THREE.Group();
    var cer=cyl(opts.r*0.13,opts.r*0.5,10,0xe8e4dc,0.3,0.5);
    cer.position.y=0.15; ign.add(cer);
    var met=cyl(opts.r*0.17,opts.r*0.25,10,0x8a95a3,0.9,0.3);
    met.position.y=-0.05; ign.add(met);
  }
  ign.position.y=opts.h+0.4;
  grp.add(ign);

  /* 2 клапана */
  var vl=[];
  for(var s=0;s<2;s++){
    var vG=new THREE.Group();
    var vd=cyl(opts.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4);
    vG.add(vd);
    var vs=cyl(0.05,opts.r*0.6,6,0xa8b4c0,0.9,0.3);
    vs.position.y=opts.r*0.3;
    vG.add(vs);
    var vx=(s===0?-1:1)*opts.r*0.4;
    vG.position.set(vx,opts.h+0.05,0);
    vG.userData={side:s,baseY:opts.h+0.05};
    grp.add(vG);
    vl.push(vG);
  }

  return {grp:grp,piston:piston,rod:rod,valves:vl,ign:ign,
          x:opts.x,y:opts.y,z:opts.z,rotY:opts.rotY||0,
          h:opts.h,r:opts.r,off:opts.off||0};
}

/* построить двигатель под текущий тип */
function buildEngine(){
  if(!scene)return;
  var cfg=CFG[S.engineType]||CFG.r4;
  var isV=cfg.v;
  var totalN=cfg.n;
  var perRow=isV?(totalN/2):totalN;

  /* очистка старых групп */
  if(root)scene.remove(root);
  root=new THREE.Group();
  scene.add(root);
  assemblies=[];cams=[];valves=[];
  blockMeshes=[];headMeshes=[];coverMeshes=[];shells=[];ribMeshes=[];

  var spacing=2.2;
  var totalWidth=perRow*spacing;
  var blockLen=Math.max(totalWidth+1.5,4);

  /* КАРТЕР внизу */
  var poddon=box(blockLen,1.2,isV?7.5:5,0x2a3340,0.7,0.5);
  poddon.position.y=-0.6;
  root.add(poddon);

  /* КОЛЕНВАЛ + общие подшипники */
  crankGrp=new THREE.Group();
  crankGrp.position.y=0.6;
  var axis=cyl(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);
  axis.rotation.z=Math.PI/2;
  crankGrp.add(axis);
  var nMain=perRow+1;
  for(var m=0;m<nMain;m++){
    var mxx=-blockLen/2+0.5+m*(blockLen-1)/(nMain-1);
    var mn=cyl(0.55,0.4,20,0xb8c6d4,0.95,0.2);
    mn.rotation.z=Math.PI/2;
    mn.position.x=mxx;
    crankGrp.add(mn);
  }

  /* шейки коленвала (смещённые) */
  for(var ci=0;ci<perRow;ci++){
    var cxx=-totalWidth/2+spacing/2+ci*spacing;
    var off1=ci*Math.PI*2/perRow;
    var p1=new THREE.Group();
    var pin1=cyl(0.3,0.5,12,0xd8e4f0,0.95,0.2);
    pin1.rotation.z=Math.PI/2;
    p1.add(pin1);
    p1.position.set(cxx,Math.sin(off1)*0.55,0);
    crankGrp.add(p1);
    p1.userData={ang:off1};

    if(isV){
      var off2=off1+Math.PI;
      var p2=new THREE.Group();
      var pin2=cyl(0.3,0.5,12,0xd8e4f0,0.95,0.2);
      pin2.rotation.z=Math.PI/2;
      p2.add(pin2);
      p2.position.set(cxx,Math.sin(off2)*0.55,0);
      crankGrp.add(p2);
      p2.userData={ang:off2};
    }
  }
  root.add(crankGrp);

  /* МАХОВИК */
  flywheelGrp=new THREE.Group();
  var fwR=isV?2.4:2.2;
  var fwD=cyl(fwR,0.4,32,0x8a95a3,0.9,0.3);
  fwD.rotation.z=Math.PI/2;
  flywheelGrp.add(fwD);
  for(var ft=0;ft<36;ft++){
    var tooth=box(0.4,0.32,0.14,0x6a7685,0.9,0.3);
    var a=(ft/36)*Math.PI*2;
    tooth.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
    tooth.rotation.x=-a;
    flywheelGrp.add(tooth);
  }
  flywheelGrp.position.set(blockLen/2+0.7,0.6,0);
  root.add(flywheelGrp);

  /* ШЕСТЕРНИ ГРМ */
  beltTopGrp=new THREE.Group();
  var gt=cyl(0.9,0.4,20,0x8a95a3,0.9,0.3);gt.rotation.z=Math.PI/2;beltTopGrp.add(gt);
  for(var gtt=0;gtt<20;gtt++){
    var tg=box(0.24,0.2,0.14,0x6a7685,0.9,0.3);
    var a2=(gtt/20)*Math.PI*2;
    tg.position.set(0,Math.cos(a2)*0.95,Math.sin(a2)*0.95);
    tg.rotation.x=-a2;beltTopGrp.add(tg);
  }
  beltTopGrp.position.set(-blockLen/2-0.7,6.2,0);
  root.add(beltTopGrp);

  beltBotGrp=new THREE.Group();
  var gb=cyl(1.3,0.4,20,0x8a95a3,0.9,0.3);gb.rotation.z=Math.PI/2;beltBotGrp.add(gb);
  for(var gbt=0;gbt<26;gbt++){
    var tg2=box(0.24,0.2,0.14,0x6a7685,0.9,0.3);
    var a3=(gbt/26)*Math.PI*2;
    tg2.position.set(0,Math.cos(a3)*1.35,Math.sin(a3)*1.35);
    tg2.rotation.x=-a3;beltBotGrp.add(tg2);
  }
  beltBotGrp.position.set(-blockLen/2-0.7,0.6,0);
  root.add(beltBotGrp);

  var beltMat=new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.2,roughness:0.9});
  var bLen=5.6;
  var b1=new THREE.Mesh(new THREE.BoxGeometry(0.15,bLen,0.7),beltMat);
  b1.position.set(-blockLen/2-1.5,3.4,0);
  root.add(b1);
  var b2=new THREE.Mesh(new THREE.BoxGeometry(0.15,bLen,1.0),beltMat);
  b2.position.set(-blockLen/2+0.1,3.4,0);
  root.add(b2);

  /* РАСПРЕДВАЛ */
  camshaftGrp=new THREE.Group();
  var camAxis=cyl(0.25,blockLen+1,16,0xa8b4c0,0.95,0.2);
  camAxis.rotation.z=Math.PI/2;
  camshaftGrp.add(camAxis);
  for(var cc=0;cc<perRow*2;cc++){
    var camGrp=new THREE.Group();
    var cd=cyl(0.32,0.3,16,0x8a95a3,0.9,0.3);cd.rotation.z=Math.PI/2;camGrp.add(cd);
    var nb=cyl(0.13,0.3,10,0x6a7685,0.9,0.3);nb.rotation.z=Math.PI/2;nb.position.y=0.32;camGrp.add(nb);
    var cxx=-totalWidth/2+0.5+cc*(totalWidth-1)/(perRow*2-1);
    camGrp.position.set(cxx,0,0);
    camshaftGrp.add(camGrp);
    cams.push({grp:camGrp,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
  }
  camshaftGrp.position.y=6.4;
  root.add(camshaftGrp);

  /* БЛОКИ И ГОЛОВКИ */
  if(isV){
    /* V-образный: 2 блока под углом */
    var angle=Math.PI/6;
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var blockW=totalWidth+1;
      var blockH=5;
      var block=box(blockW,blockH,2.6,0x4a5566,0.85,0.4);
      block.position.set(0,3.4,sign*1.6);
      block.rotation.x=sign*angle;
      root.add(block);
      blockMeshes.push(block);

      /* рёбра */
      for(var r=0;r<8;r++){
        var rib=box(blockW+0.05,0.06,2.65,0x2a3340,0.6,0.6);
        rib.position.set(0,1.2+r*0.55,sign*1.6);
        rib.rotation.x=sign*angle;
        root.add(rib);
        ribMeshes.push(rib);
      }

      /* головка */
      var head=box(blockW+0.2,1.4,2.8,0x3a4756,0.85,0.35);
      head.position.set(0,6.4,sign*2.6);
      head.rotation.x=sign*angle;
      root.add(head);
      headMeshes.push(head);

      /* крышка распредвала */
      var cover=box(blockW,0.8,2.5,0x2a3340,0.75,0.4);
      cover.position.set(0,7.5,sign*3.1);
      cover.rotation.x=sign*angle;
      root.add(cover);
      coverMeshes.push(cover);
    }
  } else {
    /* рядный */
    var block=box(blockLen,5,5,0x4a5566,0.85,0.4);
    block.position.y=3.4;
    root.add(block);
    blockMeshes.push(block);

    for(var rr=0;rr<10;rr++){
      var rib2=box(blockLen+0.05,0.06,5.05,0x2a3340,0.6,0.6);
      rib2.position.y=1.2+rr*0.55;
      root.add(rib2);
      ribMeshes.push(rib2);
    }

    var head2=box(blockLen+0.2,1.4,5.3,0x3a4756,0.85,0.35);
    head2.position.y=6.4;
    root.add(head2);
    headMeshes.push(head2);

    var cover2=box(blockLen,0.8,5,0x2a3340,0.75,0.4);
    cover2.position.y=7.5;
    root.add(cover2);
    coverMeshes.push(cover2);
  }

  /* БОЛТЫ */
  for(var b=0;b<perRow+1;b++){
    var bx=-totalWidth/2+b*(totalWidth/(perRow));
    if(!isV){
      for(var sign2=-1;sign2<=1;sign2+=2){
        var bolt1=bolt(0.16);
        bolt1.position.set(bx,7.95,sign2*2.4);
        root.add(bolt1);
      }
    } else {
      for(var side2=0;side2<2;side2++){
        var sign3=side2===0?-1:1;
        var bolt2=bolt(0.16);
        bolt2.position.set(bx,7.9,sign3*3.3);
        root.add(bolt2);
      }
    }
  }

  /* ЦИЛИНДРЫ + ПОРШНИ */
  var pistonR=1.15;
  var cylH=4.6;

  if(!isV){
    /* рядный — все в линию */
    for(var i=0;i<perRow;i++){
      var x=-totalWidth/2+spacing/2+i*spacing;
      var a=makeCylAssembly({
        x:x,y:1.1,z:0,
        r:pistonR,h:cylH,
        diesel:cfg.diesel,off:i*Math.PI
      });
      root.add(a.grp);
      assemblies.push(a);
    }
  } else {
    /* V-образный — два ряда */
    var angleV=Math.PI/6;
    for(var s=0;s<2;s++){
      var sign4=s===0?-1:1;
      for(var j=0;j<perRow;j++){
        var x2=-totalWidth/2+spacing/2+j*spacing;
        var yOff=1.1;
        var zOff=sign4*2.1;
        var a2=makeCylAssembly({
          x:x2,y:yOff,z:zOff,
          r:pistonR,h:cylH,
          diesel:cfg.diesel,
          off:(s===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI)
        });
        /* наклон группы */
        a2.grp.rotation.x=sign4*angleV;
        root.add(a2.grp);
        assemblies.push(a2);
      }
    }
  }

  /* ВЫПУСКНОЙ КОЛЛЕКТОР */
  var colColor=cfg.tractor?0x3a2a1a:0x4a3a2a;
  for(var e=0;e<perRow;e++){
    var ex=-totalWidth/2+spacing/2+e*spacing;
    var pipe=cyl(0.24,1.4,10,colColor,0.8,0.5);
    if(isV){pipe.position.set(ex,8.2,-3.5);}
    else{pipe.position.set(ex,8.2,-2.6);}
    root.add(pipe);
  }
  var mainPipe=cyl(0.34,blockLen,16,colColor,0.8,0.5);
  mainPipe.rotation.z=Math.PI/2;
  mainPipe.position.set(0,8.9,isV?-3.5:-2.6);
  root.add(mainPipe);

  /* ДИЗЕЛЬНАЯ ОБВЯЗКА */
  if(cfg.diesel){
    /* ТНВД — коробка сбоку */
    var pump=box(1.8,1.4,1.6,0x3a4654,0.85,0.4);
    pump.position.set(-blockLen/2-0.4,8.5,isV?2.8:1.8);
    root.add(pump);
    /* шестерня ТНВД */
    var pumpGear=cyl(0.6,0.3,16,0x8a95a3,0.9,0.3);
    pumpGear.rotation.z=Math.PI/2;
    pumpGear.position.set(-blockLen/2-0.4,8.5,isV?3.9:2.9);
    root.add(pumpGear);
    /* трубки высокого давления к форсункам */
    for(var fi=0;fi<perRow;fi++){
      var fx=-totalWidth/2+spacing/2+fi*spacing;
      var lineMat=new THREE.MeshBasicMaterial({color:0x666666});
      var curve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(-blockLen/2-0.4,8.5,isV?2.8:1.8),
        new THREE.Vector3(fx*0.5,9.5,isV?0:1),
        new THREE.Vector3(fx,8.0,isV?2:0)
      ]);
      var tube=new THREE.Mesh(new THREE.TubeGeometry(curve,12,0.05,6,false),lineMat);
      root.add(tube);
    }

    /* ТУРБИНА (только для TDI) */
    if(cfg.turbo){
      var turboGrp=new THREE.Group();
      var turboBody=cyl(0.9,0.7,20,0x4a5566,0.85,0.4);
      turboBody.rotation.z=Math.PI/2;
      turboGrp.add(turboBody);
      var spiral=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,20),mat(0x6a7685,0.9,0.3));
      spiral.rotation.y=Math.PI/2;
      turboGrp.add(spiral);
      var turboPipe=cyl(0.2,1.6,10,0x4a3a2a,0.8,0.5);
      turboPipe.rotation.z=Math.PI/2;
      turboPipe.position.y=1.5;
      turboGrp.add(turboPipe);
      turboGrp.position.set(blockLen/2-0.8,8.2,isV?3.5:2.6);
      root.add(turboGrp);
    }

    /* ТРАКТОРНЫЙ — длинная труба вверх */
    if(cfg.tractor){
      var stack=cyl(0.35,3.2,12,0x2a2a2a,0.5,0.7);
      stack.position.set(blockLen/2-0.8,10.5,isV?3:2.6);
      root.add(stack);
      var cap=cyl(0.45,0.3,12,0x1a1a1a,0.5,0.7);
      cap.position.set(blockLen/2-0.8,12.2,isV?3:2.6);
      root.add(cap);
    }
  }
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
        lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;updateCam();
      } else if(e.touches.length===2&&pinch){
        var dx=e.touches[0].clientX-e.touches[1].clientX;
        var dy=e.touches[0].clientY-e.touches[1].clientY;
        var nd=Math.hypot(dx,dy);
        dist*=pinch/nd;dist=Math.max(10,Math.min(45,dist));
        pinch=nd;updateCam();
      }
    } else if(isDown){
      rotY+=(e.clientX-lastX)*0.012;
      rotX+=(e.clientY-lastY)*0.012;
      rotX=Math.max(-1.3,Math.min(1.3,rotX));
      lastX=e.clientX;lastY=e.clientY;updateCam();
    }
  }
  function up(){isDown=false;pinch=0;}
  el.addEventListener('touchstart',down,{passive:false});
  el.addEventListener('touchmove',function(e){e.preventDefault();move(e);},{passive:false});
  el.addEventListener('touchend',up);
  el.addEventListener('mousedown',down);
  el.addEventListener('mousemove',move);
  el.addEventListener('mouseup',up);
  el.addEventListener('wheel',function(e){dist*=(1+e.deltaY*0.001);dist=Math.max(10,Math.min(45,dist));updateCam();e.preventDefault();},{passive:false});
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

  var w=wrap.clientWidth||360;
  var h=wrap.clientHeight||430;
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,200);
  updateCam();

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

  buildEngine();
  currentType=S.engineType;
  attachControls();
  setGhost(false);
}

function animate(){
  if(!active||!scene){animId=null;return;}
  animId=requestAnimationFrame(animate);
  var ang=S.crankAngle||0;

  /* если сменился двигатель — перестроить */
  if(S.engineType!==currentType){
    buildEngine();
    currentType=S.engineType;
    setGhost(ghost);
  }

  /* поршни + шатуны */
  for(var i=0;i<assemblies.length;i++){
    var A=assemblies[i];
    var ph=ang+A.off;
    var ROD=2.9,CR=0.75;
    var s=Math.sin(ph),co=Math.cos(ph);
    var sq=ROD*ROD-CR*CR*s*s;if(sq<0)sq=0;
    var d=CR*co+Math.sqrt(sq);
    var py=A.y+d;
    A.piston.position.y=py-A.y+ (A.h*0.55 - A.h*0.55);/* сброс: piston локально */
    A.piston.position.y=(py-A.y);

    /* шатун */
    var cpX=CR*s;
    var cpY=d+0.6-A.y;
    var dx=cpX;
    var dy=cpY-(py-A.y);
    var len=Math.hypot(dx,dy);
    if(len>0.01){
      A.rod.position.set(dx/2,(py-A.y+cpY)/2,0);
      A.rod.scale.y=len/2.9;
      A.rod.rotation.z=Math.atan2(dx,-dy);
    }

    /* клапаны */
    var cycle=((ang+A.off)%(Math.PI*4)+Math.PI*4)%(Math.PI*4);
    var idx=Math.floor(cycle/Math.PI);
    var vIn=0,vEx=0;
    if(idx===0)vIn=Math.max(0,Math.sin(cycle%Math.PI))*0.28;
    if(idx===3)vEx=Math.max(0,Math.sin(cycle-3*Math.PI))*0.28;
    if(A.valves[0])A.valves[0].position.y=A.h+0.05-vIn;
    if(A.valves[1])A.valves[1].position.y=A.h+0.05-vEx;
  }

  if(crankGrp)crankGrp.rotation.x=ang;
  if(flywheelGrp)flywheelGrp.rotation.x=ang;
  if(beltBotGrp)beltBotGrp.rotation.x=ang;
  if(beltTopGrp)beltTopGrp.rotation.x=ang*0.5;
  if(camshaftGrp)camshaftGrp.rotation.x=ang*0.5;
  for(var c=0;c<cams.length;c++){
    cams[c].grp.rotation.z=(ang*0.5)+cams[c].off;
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
    if(S.engineType!==currentType){buildEngine();currentType=S.engineType;setGhost(ghost);}
    if(!animId)animate();
  } else {
    if(animId){cancelAnimationFrame(animId);animId=null;}
  }
  try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
}

function toggleGhost(){setGhost(!ghost);}

function attachBtn(){
  var btn=document.getElementById('view3dBtn');
  if(btn)btn.addEventListener('click',function(