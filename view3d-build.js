(function(){
"use strict";
var S=window.S;if(!S)return;
function waitRef(){
if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
var R=window.DVS_3D_REF,B=window.DVS_3D_BUILD;
var cy=B.cy,bx=B.bx;
function M(c,mt,rg,op,tr){var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};if(op!==undefined){o.transparent=true;o.opacity=op;}if(tr)o.side=THREE.DoubleSide;var mm=new THREE.MeshStandardMaterial(o);mm.userData={baseOp:op!==undefined?op:1};return mm;}

var MAT={
glass: M(0xaaddff,0.10,0.02,0.10,true),
glassD:M(0x88ccff,0.15,0.05,0.18,true),
dark:  M(0x14171c,0.35,0.8),
darkB: M(0x22262c,0.45,0.65),
ring:  M(0xd8e0e8,1.0,0.05),
rod:   M(0x9aa5b0,0.95,0.1),
crank: M(0x6a7580,0.95,0.1),
crankJ:M(0xb0b8c0,1.0,0.05),
cw:    M(0x404850,0.8,0.35),
fly:   M(0x606a75,0.95,0.1),
metal: M(0xc0c8d0,1.0,0.1),
bolt:  M(0xe0e8f0,1.0,0.05),
rail:  M(0x2a3038,0.8,0.4),
head:  M(0x4a525c,0.85,0.28),
cover: M(0x1e2228,0.6,0.5),
oil:   M(0xc8a060,0.3,0.5),
int:   M(0x5a6570,0.75,0.35),
exh:   M(0x6a4a30,0.65,0.6),
alu:   M(0xb0b8c0,0.95,0.15),
aluD:  M(0x707a85,0.9,0.25),
turbo: M(0x909aa5,0.95,0.15),
turboH:M(0x484848,0.7,0.6),
yellow:M(0xd8b840,0.6,0.4),
red:   M(0xd03030,0.4,0.5),
blue:  M(0x3060d0,0.4,0.5),
white: M(0xf0f4f8,0.3,0.5),
orange:M(0xe08030,0.4,0.5),
pink:  M(0xd060a0,0.4,0.5)
};

function cyl(r1,r2,h,s,mat){return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s||22),mat);}
function box(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);}
function tor(rad,tube,s,ts,mat){return new THREE.Mesh(new THREE.TorusGeometry(rad,tube,s||8,ts||24),mat);}
function sph(r,mat){return new THREE.Mesh(new THREE.SphereGeometry(r,14,10),mat);}
function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
function pH(x){if(x&&R.pushHead)R.pushHead(x);}
function pC(x){if(x&&R.pushCover)R.pushCover(x);}
function sA(x){if(R.setAsm)R.setAsm(x);}
function sCr(x){if(R.setCrank)R.setCrank(x);}
function sF(x){if(R.setFly)R.setFly(x);}

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

/* ===== ПОРШЕНЬ — тёмный с 4 кольцами и стержнем ===== */
function makePiston(r,h){
var g=new THREE.Group();
g.add(cyl(r,r,h,28,MAT.dark));
for(var k=0;k<4;k++){
  var rg=tor(r*1.01,0.045,8,28,MAT.ring);
  rg.rotation.x=Math.PI/2;
  rg.position.y=h*0.35-k*h*0.15;
  g.add(rg);
}
var top=cyl(r*1.005,r*1.005,0.05,28,MAT.darkB);
top.position.y=h*0.5;g.add(top);
var stem=cyl(r*0.18,r*0.18,h*0.7,10,MAT.darkB);
stem.position.y=h*0.85;g.add(stem);
return g;
}

/* ===== ШАТУН — тонкий плоский ===== */
function makeRod(len){
var g=new THREE.Group();
g.add(box(0.1,len*0.92,0.16,MAT.rod));
var sm=cyl(0.13,0.13,0.24,14,MAT.metal);
sm.rotation.z=Math.PI/2;sm.position.y=len/2;g.add(sm);
var bg=tor(0.18,0.07,10,20,MAT.metal);
bg.rotation.y=Math.PI/2;bg.position.y=-len/2;g.add(bg);
return g;
}

/* ===== ЦИЛИНДР — почти невидимое стекло + обручи ===== */
function makeCyl(cfg){
var g=new THREE.Group();
g.position.set(cfg.x,0,cfg.z);
var sl=new THREE.Mesh(new THREE.CylinderGeometry(cfg.r,cfg.r,cfg.cylH,28,1,true),MAT.glass);
sl.position.y=cfg.cylY;g.add(sl);pB(sl);
var t1=tor(cfg.r*1.01,0.04,8,28,MAT.ring);
t1.rotation.x=Math.PI/2;t1.position.y=cfg.cylY+cfg.cylH/2;g.add(t1);
var t2=tor(cfg.r*1.01,0.04,8,28,MAT.ring);
t2.rotation.x=Math.PI/2;t2.position.y=cfg.cylY-cfg.cylH/2;g.add(t2);
var p=makePiston(cfg.r*0.92,cfg.pH);g.add(p);
var r=makeRod(cfg.rodLen);g.add(r);
return {g:g,p:p,rod:r,off:cfg.off||0,crankR:cfg.crankR,rodLen:cfg.rodLen,crankY:cfg.crankY};
}

/* ===== КОЛЕНВАЛ — тонкий с ПЛОСКИМИ противовесами ===== */
function makeCrank(root,length,crankY,n,crankR,fwR){
var cg=new THREE.Group();cg.position.y=crankY;
var ax=cyl(0.18,0.18,length+1.4,24,MAT.crank);
ax.rotation.z=Math.PI/2;cg.add(ax);
for(var mi=0;mi<=n;mi++){
  var mx=-length/2+0.5+mi*(length-1)/n;
  var mn=cyl(0.35,0.35,0.3,22,MAT.crankJ);
  mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
}
for(var ci=0;ci<n;ci++){
  var cxx=-length/2+0.85+ci*(length-1.7)/Math.max(1,n-1);
  var o1=ci*Math.PI*2/n;
  var pg=new THREE.Group();
  var pin=cyl(0.16,0.16,0.38,18,MAT.crankJ);
  pin.rotation.z=Math.PI/2;pg.add(pin);
  pg.position.set(cxx,Math.sin(o1)*crankR,0);cg.add(pg);
  // Плоский противовес (не круглый!)
  var cwg=new THREE.Group();
  var cwB=box(0.28,0.7,0.9,MAT.cw);
  cwg.add(cwB);
  cwg.position.set(cxx,-Math.sin(o1)*crankR,0);
  cg.add(cwg);
}
root.add(cg);sCr(cg);

var fw=new THREE.Group();
var fwD=cyl(fwR,fwR,0.24,32,MAT.fly);
fwD.rotation.z=Math.PI/2;fw.add(fwD);
var fwI=cyl(fwR*0.5,fwR*0.5,0.28,22,MAT.crank);
fwI.rotation.z=Math.PI/2;fw.add(fwI);
for(var ft=0;ft<36;ft++){
  var th=box(0.28,0.1,0.1,MAT.crank);
  var a=(ft/36)*Math.PI*2;
  th.position.set(0,Math.cos(a)*(fwR+0.04),Math.sin(a)*(fwR+0.04));
  th.rotation.x=-a;fw.add(th);
}
fw.position.set(length/2+fwR+0.15,crankY,0);
root.add(fw);sF(fw);

// Шкив ГРМ
var pulley=new THREE.Group();
var pD=cyl(0.8,0.8,0.3,24,MAT.crankJ);
pD.rotation.z=Math.PI/2;pulley.add(pD);
for(var pt=0;pt<18;pt++){
  var tooth=box(0.3,0.1,0.1,MAT.crank);
  var ta=(pt/18)*Math.PI*2;
  tooth.position.set(0,Math.cos(ta)*0.85,Math.sin(ta)*0.85);
  tooth.rotation.x=-ta;pulley.add(tooth);
}
pulley.position.set(-length/2-fwR-0.15,crankY,0);
root.add(pulley);
}