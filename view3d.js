(function(){
"use strict";
var S=window.S;if(!S)return;
var active=false,scene,camera,renderer,container,animId=null;
var rotX=0.45,rotY=0.6,dist=16,isDown=false,lastX=0,lastY=0,pinch=0;
var ghost=false,_ready=false;
var _blockM=[],_headM=[],_coverM=[],_ribM=[],_asm=[],_cranks=[],_flies=[],_cams=[];
var _wankelRotors=[],_dciTurbo=null;

function m(c,mt,rg,op,tr){
  var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};
  if(op!==undefined){o.transparent=true;o.opacity=op;}
  if(tr)o.side=THREE.DoubleSide;
  return new THREE.MeshStandardMaterial(o);
}
function cy(r,h,s,c,mt,rg){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),m(c,mt,rg));}
function bx(w,h,d,c,mt,rg){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m(c,mt,rg));}
function tor(rad,tube,s,ts,c,mt,rg){return new THREE.Mesh(new THREE.TorusGeometry(rad,tube,s||8,ts||24),m(c,mt,rg));}

function pB(x){if(x)_blockM.push(x);}
function pH(x){if(x)_headM.push(x);}
function pC(x){if(x)_coverM.push(x);}
function pR(x){if(x)_ribM.push(x);}
function sA(x){if(x)_asm=_asm.concat(x);}
function sCr(x){if(x)_cranks.push(x);}
function sF(x){if(x)_flies.push(x);}

function makeBrandTex(t,bg,fg){
  var cv=document.createElement('canvas');cv.width=1024;cv.height=256;
  var c=cv.getContext('2d');
  c.fillStyle=bg;c.fillRect(0,0,1024,256);
  c.strokeStyle=fg;c.lineWidth=8;c.strokeRect(12,12,1000,232);
  c.fillStyle=fg;c.font='bold 130px Arial';c.textAlign='center';c.textBaseline='middle';
  c.fillText(t,512,138);
  var tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;return tex;
}
function addPlate(root,x,y,z,w,h,t,bg,fg){
  var tex=makeBrandTex(t,bg,fg);
  var mat=new THREE.MeshStandardMaterial({map:tex,metalness:0.3,roughness:0.6,side:THREE.DoubleSide});
  var pl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
  pl.position.set(x,y,z);pl.rotation.x=-Math.PI/2;
  root.add(pl);pC(pl);
}

function makeCylAss(o){
  var g=new THREE.Group();
  g.position.set(o.x,o.y,o.z);
  var shell=new THREE.Mesh(
    new THREE.CylinderGeometry(o.r+0.15,o.r+0.15,o.h,20,1,true),
    new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.15,transparent:true,opacity:0.32,side:THREE.DoubleSide}));
  shell.position.y=o.h/2;g.add(shell);
  var p=new THREE.Group();
  p.position.y=o.h*0.55;
  p.add(cy(o.r,o.r*0.9,18,0xd8e0e8,0.95,0.15));
  for(var k=0;k<3;k++){
    var rg=cy(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);
    rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);
  }
  g.add(p);
  var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);
  g.add(rod);
  var ign;
  if(o.diesel)ign=cy(o.r*0.15,o.r*0.5,10,0x3a3a3a,0.7,0.4);
  else ign=cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5);
  ign.position.y=o.h+0.4;g.add(ign);
  var cols=[0x6fd0ff,0xff8a6f,0xffffff,0xffaa44];
  for(var s=0;s<4;s++){
    var vg=cy(o.r*0.22,0.1,12,cols[s],0.75,0.4);
    vg.position.set((s%2===0?-1:1)*o.r*0.4,o.h+0.05,(s<2?-1:1)*o.r*0.25);
    g.add(vg);
  }
  return {g:g,p:p,rod:rod,off:o.off||0};
}

function makeCrankAndFly(root,blockLen,y,perRow,fwR){
  var cg=new THREE.Group();cg.position.y=y;
  var ax=cy(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);
  ax.rotation.z=Math.PI/2;cg.add(ax);
  for(var mi=0;mi<=perRow;mi++){
    var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
    var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);
    mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
  }
  for(var ci=0;ci<perRow;ci++){
    var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
    var o1=ci*Math.PI*2/perRow;
    var p1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);
    p1.rotation.z=Math.PI/2;p1.position.set(cxx,Math.sin(o1)*0.55,0);
    cg.add(p1);
  }
  root.add(cg);sCr(cg);
  var fw=new THREE.Group();
  var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);
  fwD.rotation.z=Math.PI/2;fw.add(fwD);
  for(var ft=0;ft<30;ft++){
    var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
    var a=(ft/30)*Math.PI*2;
    th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
    th.rotation.x=-a;fw.add(th);
  }
  fw.position.set(blockLen/2+0.7,y,0);
  root.add(fw);sF(fw);
}

/* ===== БИЛДЕРЫ ===== */
function buildInline(root,cfg,brand){
  var n=cfg.n||4, sp=cfg.spacing||2.2;
  var tw=n*sp, blockLen=tw+1.5;
  var diesel=!!cfg.diesel;
  var pod=bx(blockLen+0.4,1.4,diesel?5.2:5,diesel?0x2a2a2a:0x2a3340,0.7,0.5);
  pod.position.y=-0.7;root.add(pod);
  makeCrankAndFly(root,blockLen,0.6,n,cfg.fwR||2.2);
  var bk=bx(blockLen,5,5,diesel?0x3a3a3a:0x4a5566,0.8,0.45);
  bk.position.y=3.4;root.add(bk);pB(bk);
  for(var rr=0;rr<9;rr++){
    var rb=bx(blockLen+0.06,0.07,5.05,0x1a1a1a,0.6,0.6);
    rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
  }
  var hd=bx(blockLen+0.2,1.4,5.3,diesel?0x4a4a4a:0x3a4756,0.85,0.35);
  hd.position.y=6.4;root.add(hd);pH(hd);
  var cv=bx(blockLen,0.8,5,0x2a3340,0.75,0.4);
  cv.position.y=7.5;root.add(cv);pC(cv);
  var inMan=cy(0.34,blockLen*0.9,14,0x3a4654,0.85,0.4);
  inMan.rotation.z=Math.PI/2;inMan.position.set(0,diesel?5.6:5.8,2.5);root.add(inMan);
  var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
  exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.3,-2.5);root.add(exMan);
  if(diesel){
    var turbo=new THREE.Group();
    var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=tor(0.75,0.16,8,20,0x6a7685,0.9,0.3);snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.3,-0.3,-2.5);root.add(turbo);
    _dciTurbo=turbo;
  }
  var arr=[];
  for(var i=0;i<n;i++){
    var xx=-tw/2+sp/2+i*sp;
    var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.15,h:4.6,off:i*Math.PI,diesel:diesel});
    root.add(a4.g);arr.push(a4);
  }
  sA(arr);
  if(brand)addPlate(root,0,8.3,0,blockLen*0.5,0.55,brand.text,brand.bg,brand.fg);
}

function buildV(root,cfg,brand){
  var perRow=Math.floor(cfg.n/2), sp=2.0;
  var tw=perRow*sp, blockLen=tw+1.8;
  var half=Math.PI/6, bankDist=1.8;
  var pod=bx(blockLen+0.4,1.2,7.5,0x2a2a2a,0.7,0.5);
  pod.position.y=-0.9;root.add(pod);
  makeCrankAndFly(root,blockLen,0.6,perRow,2.4);
  for(var side=0;side<2;side++){
    var sign=side===0?-1:1;
    var bk=bx(blockLen,5,2.8,0x3a3a3a,0.85,0.4);
    bk.position.set(0,3.4,sign*bankDist);bk.rotation.x=sign*half;
    root.add(bk);pB(bk);
    for(var rr=0;rr<7;rr++){
      var rb=bx(blockLen+0.05,0.06,2.85,0x1a1a1a,0.6,0.6);
      rb.position.set(0,1.2+rr*0.55,sign*bankDist);rb.rotation.x=sign*half;
      root.add(rb);pR(rb);
    }
    var hd=bx(blockLen+0.2,1.4,2.8,0x8894a2,0.9,0.25);
    hd.position.set(0,6.4,sign*(bankDist+1.2));hd.rotation.x=sign*half;
    root.add(hd);pH(hd);
    var cv=bx(blockLen,0.8,2.5,0x2a3340,0.75,0.4);
    cv.position.set(0,7.5,sign*(bankDist+1.5));cv.rotation.x=sign*half;
    root.add(cv);pC(cv);
    var inMan=cy(0.32,blockLen*0.9,14,0x8b6a2b,0.9,0.35);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,7.0,sign*(bankDist+2.2));root.add(inMan);
    var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,0.5,sign*0.5);root.add(exMan);
  }
  var arr=[];
  for(var s2=0;s2<2;s2++){
    var sg=s2===0?-1:1;
    for(var j=0;j<perRow;j++){
      var xx=-tw/2+sp/2+j*sp;
      var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
      var a=makeCylAss({x:xx,y:1.1,z:sg*bankDist,r:1.0,h:4.6,off:off});
      a.g.rotation.x=sg*half;
      root.add(a.g);arr.push(a);
    }
  }
  sA(arr);
  if(brand)addPlate(root,0,7.42,0,2.2,0.4,brand.text,brand.bg,brand.fg);
}

function buildBoxer(root,cfg,brand){
  var n=2, sp=2.4, tw=n*sp, blockLen=tw+1.8;
  var half=Math.PI/2, bankDist=1.6;
  var pod=bx(blockLen+0.3,1.2,6.0,0x2a3340,0.7,0.5);
  pod.position.y=-0.6;root.add(pod);
  makeCrankAndFly(root,blockLen,0.6,n,2.4);
  for(var side=0;side<2;side++){
    var sign=side===0?-1:1;
    var bk=bx(blockLen,4.4,2.6,0x4a5566,0.85,0.4);
    bk.position.set(0,3.4,sign*bankDist);bk.rotation.x=sign*half;
    root.add(bk);pB(bk);
    for(var rr=0;rr<6;rr++){
      var rb=bx(blockLen+0.05,0.06,2.65,0x1a1a1a,0.6,0.6);
      rb.position.set(0,1.4+rr*0.5,sign*bankDist);rb.rotation.x=sign*half;
      root.add(rb);pR(rb);
    }
    var hd=bx(blockLen+0.2,1.2,2.7,0x8894a2,0.9,0.25);
    hd.position.set(0,6.0,sign*(bankDist+1.0));hd.rotation.x=sign*half;
    root.add(hd);pH(hd);
    var cv=bx(blockLen,0.8,2.5,0x2a3340,0.75,0.4);
    cv.position.set(0,7.0,sign*(bankDist+1.3));cv.rotation.x=sign*half;
    root.add(cv);pC(cv);
  }
  var arr=[];
  for(var s2=0;s2<2;s2++){
    var sg=s2===0?-1:1;
    for(var j=0;j<n;j++){
      var xx=-tw/2+sp/2+j*sp;
      var off=(s2===0?j*Math.PI:j*Math.PI+Math.PI);
      var a=makeCylAss({x:xx,y:1.1,z:sg*bankDist,r:0.95,h:4.0,off:off});
      a.g.rotation.x=sg*half;
      root.add(a.g);arr.push(a);
    }
  }
  sA(arr);
  if(brand)addPlate(root,0,8.4,0,blockLen*0.5,0.5,brand.text,brand.bg,brand.fg);
}

function buildRadial(root,cfg,brand){
  var n=9, angStep=Math.PI*2/n, R_cyl=3.2, cylLen=3.0;
  var carter=cy(3.4,0.8,32,0x3a3a3a,0.75,0.45);
  carter.rotation.x=Math.PI/2;carter.position.set(0,3,0);
  root.add(carter);pB(carter);
  var crank=new THREE.Group();
  crank.position.set(0,3,0);
  var crBar=cy(0.45,0.45,5.5,20,0xa8b4c0,0.95,0.2);
  crBar.rotation.z=Math.PI/2;crank.add(crBar);
  root.add(crank);sCr(crank);
  var fw=new THREE.Group();
  var fwD=cy(1.6,1.6,0.35,32,0x8a95a3,0.9,0.3);
  fwD.rotation.z=Math.PI/2;fw.add(fwD);
  for(var ft=0;ft<28;ft++){
    var th=bx(0.35,0.24,0.13,0x6a7685,0.9,0.3);
    var a=(ft/28)*Math.PI*2;
    th.position.set(0,Math.cos(a)*1.75,Math.sin(a)*1.75);
    th.rotation.x=-a;fw.add(th);
  }
  fw.position.set(2.75,3,0);root.add(fw);sF(fw);
  var arr=[];
  for(var i=0;i<n;i++){
    var a2=i*angStep-Math.PI/2;
    var cx=Math.cos(a2)*R_cyl, cyy=3+Math.sin(a2)*R_cyl;
    var grp=new THREE.Group();
    grp.position.set(cx,cyy,0);grp.rotation.z=a2-Math.PI/2;root.add(grp);
    var shell=new THREE.Mesh(
      new THREE.CylinderGeometry(1.0,1.0,cylLen,20,1,true),
      new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.15,transparent:true,opacity:0.32,side:THREE.DoubleSide}));
    shell.position.y=cylLen/2;grp.add(shell);pB(shell);
    var hd=cy(1.05,0.4,20,0x8894a2,0.9,0.25);
    hd.position.y=cylLen+0.2;grp.add(hd);pH(hd);
    var p=cy(0.9,0.7,18,0xd8e0e8,0.95,0.15);
    p.position.y=cylLen*0.5;grp.add(p);
    var rod=bx(0.28,1.6,0.28,0x8894a2,0.9,0.25);
    rod.position.y=-0.5;grp.add(rod);
    arr.push({g:grp,p:p,rod:rod,off:i*angStep});
  }
  sA(arr);
  if(brand)addPlate(root,0,7.5,0,4.5,0.6,brand.text,brand.bg,brand.fg);
}

function buildScooter(root,cfg,brand){
  var blockLen=3.8;
  var pod=bx(blockLen,1.0,3.4,0x2a3340,0.7,0.5);pod.position.y=-0.5;root.add(pod);
  makeCrankAndFly(root,blockLen,0.6,1,1.4);
  var bk=bx(blockLen,3.6,3.4,0x4a5566,0.85,0.4);bk.position.y=2.4;root.add(bk);pB(bk);
  for(var rr=0;rr<6;rr++){
    var rb=bx(blockLen+0.05,0.06,3.45,0x1a1a1a,0.6,0.6);
    rb.position.y=0.8+rr*0.5;root.add(rb);pR(rb);
  }
  var hd=bx(blockLen+0.2,1.2,3.5,0x3a4756,0.85,0.35);hd.position.y=4.8;root.add(hd);pH(hd);
  var cv=bx(blockLen,0.7,3.3,0x2a3340,0.75,0.4);cv.position.y=5.8;root.add(cv);pC(cv);
  var carb=bx(0.8,0.8,0.8,0x3a3a3a,0.7,0.5);carb.position.set(0,6.6,1.8);root.add(carb);
  var a4=makeCylAss({x:0,y:1.1,z:0,r:0.9,h:3.4,off:0});
  root.add(a4.g);sA([a4]);
  if(brand)addPlate(root,0,6.6,0,blockLen*0.6,0.5,brand.text,brand.bg,brand.fg);
}

function buildTractor(root,cfg,brand){
  var n=4, sp=2.5, tw=n*sp, blockLen=tw+2.0;
  var pod=bx(blockLen+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);pod.position.y=-1.0;root.add(pod);
  makeCrankAndFly(root,blockLen,0.6,n,3.0);
  var bk=bx(blockLen,5.5,6,0x3a3a3a,0.75,0.55);bk.position.y=3.7;root.add(bk);pB(bk);
  for(var rr=0;rr<10;rr++){
    var rb=bx(blockLen+0.06,0.10,6.05,0x1a1a1a,0.6,0.6);
    rb.position.y=1.3+rr*0.55;root.add(rb);pR(rb);
  }
  var hd=bx(blockLen+0.3,1.6,6.3,0x4a4a4a,0.8,0.45);hd.position.y=7.1;root.add(hd);pH(hd);
  var cv=bx(blockLen,0.9,6,0x2a2a2a,0.7,0.45);cv.position.y=8.3;root.add(cv);pC(cv);
  var tank=bx(blockLen*0.65,2.2,2.0,0x5a5a4a,0.6,0.6);
  tank.position.set(-blockLen/2-1.6,2.2,0);root.add(tank);
  var pump=bx(2.4,2.2,2.2,0x3a4654,0.8,0.5);
  pump.position.set(blockLen/2+0.8,7.8,2.6);root.add(pump);
  var ex=cy(0.38,7.5,14,0x4a4a4a,0.7,0.5);
  ex.position.set(blockLen/2-1.4,11.8,0);root.add(ex);
  var arr=[];
  for(var i=0;i<n;i++){
    var xx=-tw/2+sp/2+i*sp;
    var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.35,h:5.0,off:i*Math.PI,diesel:true});
    root.add(a4.g);arr.push(a4);
  }
  sA(arr);
  if(brand)addPlate(root,0,9.2,0,blockLen*0.5,0.55,brand.text,brand.bg,brand.fg);
}

function makeEpiShape(Rr,e){
  var pts=[];
  for(var i=0;i<=96;i++){
    var t=(i/96)*Math.PI*2;
    pts.push(new THREE.Vector2(Rr*Math.cos(t)+e*Math.cos(3*t),Rr*Math.sin(t)+e*Math.sin(3*t)));
  }
  return new THREE.Shape(pts);
}
function makeRotorShape(rotR){
  var sh=new THREE.Shape();
  for(var k=0;k<3;k++){
    var a=k*(Math.PI*2/3)-Math.PI/2;
    var x=Math.cos(a)*rotR,y=Math.sin(a)*rotR;
    if(k===0)sh.moveTo(x,y);else sh.lineTo(x,y);
  }
  sh.closePath();return sh;
}
function buildWankel(root,cfg,brand){
  var Rr=2.0,ecc=0.4,depth=1.6,rotR=1.2,space=5.0;
  _wankelRotors=[];
  var base=bx(space+2.5,0.6,5.5,0x2a3340,0.7,0.5);base.position.y=-2.2;root.add(base);
  var axisMesh=cy(0.28,space+3,16,0xc8d4e0,0.95,0.2);
  axisMesh.rotation.z=Math.PI/2;root.add(axisMesh);
  for(var ri=0;ri<2;ri++){
    var rx=(ri-0.5)*space;
    var unit=new THREE.Group();unit.position.set(rx,0,0);
    var epiGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false,curveSegments:64});
    epiGeo.center();
    var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.92,roughness:0.2,transparent:true,opacity:0.32,side:THREE.DoubleSide}));
    unit.add(caseMesh);pB(caseMesh);
    var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.72,bevelEnabled:false});
    rotGeo.center();
    var rotorMesh=new THREE.Mesh(rotGeo,m(0xdde5ee,0.95,0.15));
    unit.add(rotorMesh);
    var hub=cy(0.5,0.9,20,0x1a232e,0.9,0.3);
    hub.rotation.x=Math.PI/2;rotorMesh.add(hub);
    _wankelRotors.push({mesh:rotorMesh,ecc:ecc});
    root.add(unit);
  }
  var fw=new THREE.Group();
  var fwDisc=cy(1.6,0.4,32,0x8a95a3,0.92,0.28);
  fwDisc.rotation.z=Math.PI/2;fw.add(fwDisc);
  fw.position.set(space+2.0,0,0);root.add(fw);sF(fw);
  if(brand)addPlate(root,0,3.2,-depth/2+0.1,3.5,0.5,brand.text,brand.bg,brand.fg);
}

/* ===== ДИСПЕТЧЕР ===== */
function buildByType(root,raw){
  function has(){for(var i=0;i<arguments.length;i++)if(raw.indexOf(arguments[i])>=0)return true;return false;}
  if(has('wankel','renesis','rotary'))  return buildWankel(root,{n:2},{text:'MAZDA',bg:'#101010',fg:'#FFFFFF'});
  if(has('radial','wright','r1820'))    return buildRadial(root,{n:9},{text:'WRIGHT',bg:'#1A1A1A',fg:'#FFD700'});
  if(has('boxer','ej25','subaru'))      return buildBoxer(root,{n:4},{text:'SUBARU',bg:'#003399',fg:'#FFFFFF'});
  if(has('v22'))                        return buildV(root,{n:22},{text:'V22',bg:'#222222',fg:'#FFAA00'});
  if(has('v16'))                        return buildV(root,{n:16},{text:'V16',bg:'#222222',fg:'#FFAA00'});
  if(has('v12'))                        return buildV(root,{n:12},{text:'V12',bg:'#222222',fg:'#FFAA00'});
  if(has('v8'))                         return buildV(root,{n:8},{text:'V8',bg:'#222222',fg:'#FFAA00'});
  if(has('v6','galant6','galant'))      return buildV(root,{n:6},{text:'MITSUBISHI',bg:'#E60012',fg:'#FFFFFF'});
  if(has('i6','2jz','inline6'))         return buildInline(root,{n:6,spacing:1.8,diesel:true},{text:'TOYOTA',bg:'#EB0A1E',fg:'#FFFFFF'});
  if(has('scooter'))                    return buildScooter(root,{n:1},{text:'SCOOTER',bg:'#222222',fg:'#FFFFFF'});
  if(has('tdi'))                        return buildInline(root,{n:4,diesel:true},{text:'VOLKSWAGEN',bg:'#001E50',fg:'#FFFFFF'});
  if(has('dci'))                        return buildInline(root,{n:4,diesel:true},{text:'RENAULT',bg:'#EFDF00',fg:'#000000'});
  if(has('passat'))                     return buildInline(root,{n:4},{text:'VOLKSWAGEN',bg:'#001E50',fg:'#FFFFFF'});
  if(has('bluebird','ca20'))            return buildInline(root,{n:4},{text:'NISSAN',bg:'#C3002F',fg:'#FFFFFF'});
  if(has('tractor','mtz','mt82','belarus','д240','д-240')) return buildTractor(root,{n:4},{text:'TRACTOR',bg:'#222222',fg:'#FFDD00'});
  return buildInline(root,{n:4},{text:'ENGINE',bg:'#2A2A2A',fg:'#FFFFFF'});
}

function resetAll(){
  _blockM=[];_headM=[];_coverM=[];_ribM=[];_asm=[];_cranks=[];_flies=[];_cams=[];
  _wankelRotors=[];_dciTurbo=null;
}

function smartRebuild(){
  var sc=scene;if(!sc)return;
  var old=window._3dRoot;
  if(old){
    while(old.children.length){
      var c=old.children.pop();
      try{if(c.geometry)c.geometry.dispose();}catch(e){}
      try{if(c.material)c.material.dispose();}catch(e){}
    }
    sc.remove(old);
  }
  resetAll();
  var root=new THREE.Group();sc.add(root);window._3dRoot=root;
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'').replace(/-/g,'');
  console.log('3D:',raw);
  try{buildByType(root,raw);}catch(e){console.warn('build crash:',e);}
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
    L[i].material.transparent=on;
    L[i].material.opacity=on?0.12:1;
  }
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
  camera=new THREE.PerspectiveCamera(45,w/h,0.1,300);updCam();
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
  attachControls();
  _ready=true;return true;
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
    if(!A||!A.p)continue;
    var ph=ang+(A.off||0);
    var Rc=0.8,L=3.5,cyA=1.0;
    var sinT=Math.sin(ph),cosT=Math.cos(ph);
    var sq=L*L-Rc*Rc*sinT*sinT;if(sq<0)sq=0;
    var pinY=cyA+Rc*cosT+Math.sqrt(sq);
    A.p.position.y=pinY;
    if(A.rod){
      var cpX=Rc*sinT,cpY=cyA+Rc*cosT;
      A.rod.position.x=cpX/2;
      A.rod.position.y=(pinY+cpY)/2;
      A.rod.rotation.z=-Math.atan2(cpX,pinY-cpY);
    }
  }
  for(var wr=0;wr<_wankelRotors.length;wr++){
    var W=_wankelRotors[wr];
    W.mesh.rotation.z=-ang/3;
    W.mesh.position.x=Math.cos(ang)*W.ecc;
    W.mesh.position.y=Math.sin(ang)*W.ecc;
  }
  if(_dciTurbo)_dciTurbo.rotation.x=ang*2.5;
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
function show3D(){
  if(!setup())return;
  active=true;
  container.style.display='block';
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
  if(gb){
    gb.style.display='none';
    gb.addEventListener('click',function(e){e.preventDefault();setGhost(!ghost);});
  }
  console.log('view3d.js: ОК');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachBtn);
else attachBtn();
console.log('view3d.js: загружен');
})();