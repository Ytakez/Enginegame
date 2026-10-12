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

function makeHead(root,length,blockH,blockD,blockY){
var headH=0.9;
var headY=blockY+blockH/2+0.15+headH/2;
var hd=box(length+0.1,headH,blockD+0.1,MAT.head);
hd.position.y=headY;root.add(hd);pH(hd);
for(var b=0;b<4;b++){
  var bolt=cyl(0.06,0.06,0.14,10,MAT.bolt);
  bolt.position.set((b<2?-1:1)*(length/2+0.01),headY+headH/2+0.07,(b%2===0?-1:1)*(blockD/2+0.01));
  root.add(bolt);
}
var covH=0.5;
var covY=headY+headH/2+covH/2;
var cv=box(length-0.15,covH,blockD-0.5,MAT.cover);
cv.position.y=covY;root.add(cv);pC(cv);
var cap=cyl(0.18,0.18,0.18,12,MAT.darkB);
cap.position.set(length/2-0.7,covY+covH/2+0.09,0);root.add(cap);
// Свечи + цветные колпачки
var nSp=Math.round((length-1)/2.2)+1;
var cols=[MAT.blue,MAT.red,MAT.white,MAT.orange];
for(var sp=0;sp<nSp;sp++){
  var sx=-length/2+1+sp*(length-2)/Math.max(1,nSp-1);
  var plug=cyl(0.1,0.1,0.45,10,MAT.darkB);
  plug.position.set(sx,covY+covH/2+0.23,0);root.add(plug);
  var cap2=sph(0.14,cols[sp%4]);
  cap2.position.set(sx,covY+covH/2+0.5,0);root.add(cap2);
}
return {headY:headY,headH:headH,covY:covY,covH:covH};
}

function makeGlassBox(root,length,blockH,blockD,blockY){
var bk=box(length,blockH,blockD,MAT.glass);
bk.position.y=blockY;root.add(bk);pB(bk);
var pan=box(length+0.2,0.7,blockD+0.15,MAT.oil);
pan.position.y=blockY-blockH/2-0.55;root.add(pan);
var lip=box(length+0.25,0.1,blockD+0.2,MAT.aluD);
lip.position.y=blockY-blockH/2-0.2;root.add(lip);
var oilF=cyl(0.28,0.28,0.5,18,MAT.aluD);
oilF.rotation.z=Math.PI/2;
oilF.position.set(length/2-0.4,blockY-blockH/2+0.2,blockD/2+0.35);root.add(oilF);
for(var ms=-1;ms<=1;ms+=2){
  var mount=box(0.3,0.5,0.3,MAT.darkB);
  mount.position.set(ms*(length/2+0.2),blockY-blockH/2-0.2,0);root.add(mount);
}
return {blockY:blockY,blockH:blockH,blockD:blockD,length:length};
}

function makeIntake(root,B,n,sp){
var tw=n*sp;
var pY=B.head.headY+B.head.headH/2+B.head.covH+0.5;
var pl=cyl(0.32,0.32,B.length*0.85,18,MAT.int);
pl.rotation.z=Math.PI/2;pl.position.set(0,pY,B.blockD/2+0.55);root.add(pl);
for(var i=0;i<n;i++){
  var xx=-tw/2+sp/2+i*sp;
  var rl=cyl(0.16,0.2,pY-(B.head.headY+0.05),12,MAT.int);
  rl.position.set(xx,(pY+B.head.headY)/2,B.blockD/2+0.4);root.add(rl);
}
var tb=cyl(0.4,0.4,0.3,16,MAT.aluD);
tb.rotation.z=Math.PI/2;
tb.position.set(-B.length*0.5,pY,B.blockD/2+0.55);root.add(tb);
}

function makeExhaust(root,B,n,sp){
var tw=n*sp;
for(var i=0;i<n;i++){
  var xx=-tw/2+sp/2+i*sp;
  var rl=cyl(0.16,0.2,0.5,12,MAT.exh);
  rl.position.set(xx,B.blockY+B.blockH/2-0.3,-B.blockD/2-0.4);
  rl.rotation.x=Math.PI/7;root.add(rl);
}
var hd=cyl(0.3,0.3,B.length*0.85,16,MAT.exh);
hd.rotation.z=Math.PI/2;
hd.position.set(0,B.blockY-B.blockH/2-0.5,-B.blockD/2-0.75);root.add(hd);
}

function makeTurbo(root,B){
var g=new THREE.Group();
var comp=cyl(0.55,0.7,0.7,22,MAT.turbo);comp.rotation.z=Math.PI/2;g.add(comp);
var cs=tor(0.65,0.24,10,22,MAT.turbo);cs.rotation.y=Math.PI/2;cs.position.x=-0.15;g.add(cs);
var tb=cyl(0.45,0.55,0.6,20,MAT.turboH);tb.rotation.z=Math.PI/2;tb.position.x=0.85;g.add(tb);
var ts=tor(0.52,0.2,10,20,MAT.turboH);ts.rotation.y=Math.PI/2;ts.position.x=0.95;g.add(ts);
g.position.set(B.length/2+0.55,B.blockY-B.blockH/2-0.3,-B.blockD/2-0.9);
root.add(g);
if(!window._dciPartsArr)window._dciPartsArr=[];
window._dciPartsArr.push({turbo:g});
var ic=box(1.4,0.65,0.28,MAT.alu);
ic.position.set(0,B.head.headY+1.3,-B.blockD/2-1.4);root.add(ic);
}

function inlineBase(root,opt){
var n=opt.n||4,sp=opt.spacing||2.2;
var tw=n*sp,length=tw+1.6;
var blockH=opt.h||4.5,blockD=opt.d||3.2,blockY=opt.y||3.6;
var pR=opt.pR||0.85,pH2=opt.pH||0.75;
var crankR=opt.crankR||0.75,rodLen=opt.rodLen||3.0;
var cylH=opt.cylH||(blockH-0.5),cylY=blockY+0.1;
var crankY=blockY+blockH/2-crankR-rodLen-pH2/2+0.05;
var fwR=opt.fwR||2.0;
makeCrank(root,length,crankY,n,crankR,fwR);
var B=makeGlassBox(root,length,blockH,blockD,blockY);
B.head=makeHead(root,length,blockH,blockD,blockY);
var arr=[];
for(var i=0;i<n;i++){
  var xx=-tw/2+sp/2+i*sp;
  var a=makeCyl({x:xx,z:0,r:pR,pH:pH2,cylH:cylH,cylY:cylY,off:i*Math.PI,crankR:crankR,rodLen:rodLen,crankY:crankY});
  root.add(a.g);arr.push(a);
}
sA(arr);
makeIntake(root,B,n,sp);
makeExhaust(root,B,n,sp);
if(opt.diesel)makeTurbo(root,B);
return B;
}

function plateTop(root,B,text,bg,fg,wMul){
addPlate(root,0,B.head.covY+B.head.covH/2+1.2,0,B.length*(wMul||0.5),0.55,text,bg,fg);
}

function buildR4(root){var B=inlineBase(root,{n:4});plateTop(root,B,'ENGINE','#2A2A2A','#FFFFFF');}
function buildTDI(root){var B=inlineBase(root,{n:4,diesel:true});plateTop(root,B,'VOLKSWAGEN','#001E50','#FFFFFF',0.55);}
function buildDCi(root){var B=inlineBase(root,{n:4,diesel:true,pH:0.8,pR:0.88});plateTop(root,B,'RENAULT','#EFDF00','#000000');}
function buildPassatB3(root){var B=inlineBase(root,{n:4});plateTop(root,B,'VOLKSWAGEN','#001E50','#FFFFFF');}
function buildBluebird(root){var B=inlineBase(root,{n:4});plateTop(root,B,'NISSAN','#C3002F','#FFFFFF');}
function buildScooter(root){
var B=inlineBase(root,{n:1,spacing:1.5,d:2.4,h:3.2,y:2.9,pR:0.75,pH:0.65,rodLen:2.4,crankR:0.6,fwR:1.2});
plateTop(root,B,'SCOOTER','#222222','#FFFFFF',0.6);
}
function buildI6(root){var B=inlineBase(root,{n:6,spacing:1.9,d:3.4,h:4.8,y:3.8,pR:0.9,pH:0.8,rodLen:3.3,crankR:0.8,fwR:2.2,diesel:true});plateTop(root,B,'TOYOTA','#EB0A1E','#FFFFFF');}

function buildVBase(root,totalN,half,bankDist){
var perRow=Math.floor(totalN/2),sp=2.0;
var tw=perRow*sp,length=tw+1.8;
var blockH=4.2,blockD=3.0,blockY=3.6;
var pR=0.82,pH2=0.72,crankR=0.78,rodLen=3.0;
var crankY=blockY+blockH/2-crankR-rodLen-pH2/2+0.05;
makeCrank(root,length,crankY,perRow,crankR,2.2);
var pan=box(length+0.3,0.6,bankDist*2+3.0,MAT.oil);
pan.position.y=crankY-1.0;root.add(pan);
var arr=[];
var headY=0;
var cols=[MAT.blue,MAT.red,MAT.white,MAT.orange];
for(var side=0;side<2;side++){
  var sign=side===0?-1:1;
  var bk=box(length,blockH,blockD,MAT.glass);
  bk.position.set(0,blockY,sign*bankDist);bk.rotation.x=sign*half;root.add(bk);pB(bk);
  var headH=0.9;
  headY=blockY+blockH/2+0.15+headH/2;
  var hd=box(length+0.1,headH,blockD+0.1,MAT.head);
  hd.position.set(0,headY,sign*(bankDist+0.4));hd.rotation.x=sign*half;root.add(hd);pH(hd);
  var covH=0.45;
  var covY=headY+headH/2+covH/2;
  var cv=box(length-0.15,covH,blockD-0.4,MAT.cover);
  cv.position.set(0,covY,sign*(bankDist+0.5));cv.rotation.x=sign*half;root.add(cv);pC(cv);
  for(var sp2=0;sp2<perRow;sp2++){
    var sx=-tw/2+sp/2+sp2*sp;
    var cap=sph(0.13,cols[(side*2+sp2)%4]);
    cap.position.set(sx,covY+covH/2+0.35,sign*(bankDist+0.5));
    root.add(cap);
  }
  for(var j=0;j<perRow;j++){
    var xx=-tw/2+sp/2+j*sp;
    var off=side===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI;
    var a=makeCyl({x:xx,z:sign*bankDist,r:pR,pH:pH2,cylH:blockH-0.5,cylY:blockY,off:off,crankR:crankR,rodLen:rodLen,crankY:crankY});
    a.g.rotation.x=sign*half;
    root.add(a.g);arr.push(a);
  }
}
sA(arr);
var pY=blockY+blockH/2+2.6;
var plenum=cyl(0.4,0.4,length*0.85,18,MAT.int);
plenum.rotation.z=Math.PI/2;plenum.position.set(0,pY,0);root.add(plenum);
for(var s=0;s<2;s++){
  var sg=s===0?-1:1;
  var ex=cyl(0.3,0.3,length*0.85,16,MAT.exh);
  ex.rotation.z=Math.PI/2;
  ex.position.set(0,blockY-blockH/2-0.6,sg*(bankDist+1.4));root.add(ex);
}
return {blockY:blockY,blockH:blockH,blockD:blockD,length:length,plenumY:pY,headY:headY};
}
function buildV6(root){var B=buildVBase(root,6,Math.PI/6,1.4);addPlate(root,0,B.plenumY+0.5,0,B.length*0.7,0.6,'MITSUBISHI','#E60012','#FFFFFF');}
function buildV8(root){var B=buildVBase(root,8,Math.PI/6,1.5);addPlate(root,0,B.plenumY+0.5,0,B.length*0.7,0.6,'V8','#222222','#FFAA00');}
function buildV12(root){var B=buildVBase(root,12,Math.PI/6,1.6);addPlate(root,0,B.plenumY+0.5,0,B.length*0.7,0.6,'V12','#222222','#FFAA00');}
function buildV16(root){var B=buildVBase(root,16,Math.PI/6,1.7);addPlate(root,0,B.plenumY+0.5,0,B.length*0.7,0.6,'V16','#222222','#FFAA00');}
function buildV22(root){var B=buildVBase(root,22,Math.PI/4,2.0);addPlate(root,0,B.plenumY+0.5,0,B.length*0.7,0.6,'V22','#222222','#FFAA00');}

function buildBoxer(root){
var n=2,sp=2.2;
var tw=n*sp,length=tw+1.6;
var blockH=3.4,blockD=3.4,blockY=3.2;
var pH2=0.7,pR=0.8,crankR=0.75,rodLen=2.5;
var crankY=blockY-pH2/2-rodLen+crankR*0.5;
makeCrank(root,length,crankY,n,crankR,2.0);
var pan=box(length+0.4,0.6,blockD+0.3,MAT.oil);
pan.position.y=crankY-0.9;root.add(pan);
var bk=box(length,blockH,2.2,MAT.glass);
bk.position.y=blockY;root.add(bk);pB(bk);
var arr=[];
for(var s=0;s<2;s++){
  var sign=s===0?-1:1;
  var headH=1.7;
  var hd=box(length+0.1,headH,1.2,MAT.head);
  hd.position.set(0,blockY,sign*(blockD/2+0.6));
  hd.rotation.x=sign*Math.PI/2;root.add(hd);pH(hd);
  var cv=box(length-0.15,headH*0.75,0.85,MAT.cover);
  cv.position.set(0,blockY,sign*(blockD/2+1.05));
  cv.rotation.x=sign*Math.PI/2;root.add(cv);pC(cv);
  for(var j=0;j<n;j++){
    var xx=-tw/2+sp/2+j*sp;
    var off=s===0?j*Math.PI:j*Math.PI+Math.PI;
    var a=makeCyl({x:xx,z:sign*(blockD/2+0.2),r:pR,pH:pH2,cylH:blockH-0.4,cylY:blockY,off:off,crankR:crankR,rodLen:rodLen,crankY:crankY});
    a.g.rotation.x=sign*Math.PI/2;
    root.add(a.g);arr.push(a);
  }
}
sA(arr);
addPlate(root,0,blockY+2.4,0,length*0.6,0.55,'SUBARU','#003399','#FFFFFF');
}

function buildRadial(root){
var n=9,step=Math.PI*2/n,R_cyl=3.0,cylLen=2.6;
var blockY=3.0;
var pH2=0.7,pR=0.75,crankR=0.7,rodLen=1.6;
var carter=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.4,12,28),MAT.glass);
carter.rotation.x=Math.PI/2;carter.position.set(0,blockY,0);root.add(carter);pB(carter);
var crank=cyl(0.28,0.28,3.6,22,MAT.crank);
crank.rotation.x=Math.PI/2;crank.position.set(0,blockY,0);root.add(crank);sCr(crank);
var fw=new THREE.Group();
var fwD=cyl(1.9,1.9,0.28,28,MAT.fly);fwD.rotation.x=Math.PI/2;fw.add(fwD);
for(var ft=0;ft<36;ft++){
  var th=box(0.24,0.12,0.1,MAT.crank);
  var a=(ft/36)*Math.PI*2;
  th.position.set(Math.cos(a)*2.0,Math.sin(a)*2.0,0);
  th.rotation.z=a;fw.add(th);
}
fw.position.set(0,blockY,3.0);root.add(fw);sF(fw);
var arr=[];
for(var i=0;i<n;i++){
  var a2=i*step-Math.PI/2;
  var cx2=Math.cos(a2)*R_cyl,cyy=blockY+Math.sin(a2)*R_cyl;
  var grp=new THREE.Group();
  grp.position.set(cx2,cyy,0);grp.rotation.z=a2-Math.PI/2;root.add(grp);
  var shell=new THREE.Mesh(new THREE.CylinderGeometry(pR+0.05,pR+0.05,cylLen,24,1,true),MAT.glass);
  shell.position.y=cylLen/2;grp.add(shell);pB(shell);
  var r1=tor(pR+0.07,0.04,8,24,MAT.ring);r1.rotation.x=Math.PI/2;r1.position.y=cylLen;grp.add(r1);
  var r2=tor(pR+0.07,0.04,8,24,MAT.ring);r2.rotation.x=Math.PI/2;r2.position.y=0;grp.add(r2);
  var hd=cyl(0.85,0.85,0.35,22,MAT.head);hd.position.y=cylLen+0.18;grp.add(hd);pH(hd);
  var p=makePiston(pR,pH2);grp.add(p);
  var r=makeRod(rodLen);grp.add(r);
  arr.push({g:grp,p:p,rod:r,off:0,crankR:crankR,rodLen:rodLen,crankY:cylLen*0.5-crankR-rodLen-pH2/2});
}
sA(arr);
addPlate(root,0,blockY+R_cyl+2.5,0,4.2,0.6,'WRIGHT','#1A1A1A','#FFD700');
}

function buildTractor(root){
var n=4,sp=2.6;
var tw=n*sp,length=tw+2.0;
var B=inlineBase(root,{n:4,spacing:2.6,d:4.5,h:5.2,y:4.0,pR:1.0,pH:0.9,rodLen:3.6,crankR:0.85,fwR:2.8,diesel:true});
var tank=box(length*0.55,1.6,1.8,MAT.yellow);
tank.position.set(-length/2-1.8,B.blockY+1.6,0);root.add(tank);
var rad=box(3.0,2.6,0.5,MAT.metal);
rad.position.set(length/2+2.4,B.blockY,0);root.add(rad);
for(var rf=0;rf<12;rf++){
  var fin=box(2.9,0.05,0.5,MAT.rail);
  fin.position.set(length/2+2.4,B.blockY-1.2+rf*0.2,0);root.add(fin);
}
var ex=cyl(0.28,0.28,6.5,12,MAT.exh);
ex.position.set(length/2-1.5,B.head.covY+2.0,0);root.add(ex);
plateTop(root,B,'TRACTOR','#222222','#FFDD00',0.55);
}

function makeEpiShape(Rr,e){
var pts=[];
for(var i=0;i<=120;i++){
  var t=(i/120)*Math.PI*2;
  pts.push(new THREE.Vector2(
    Rr*Math.cos(t)+e*Math.cos(3*t),
    Rr*Math.sin(t)+e*Math.sin(3*t)
  ));
}
return new THREE.Shape(pts);
}
function makeRotorShape(rotR){
var sh=new THREE.Shape();
var pts=[];
for(var i=0;i<=90;i++){
  var t=(i/90)*Math.PI*2;
  var r=rotR*(0.72+0.28*Math.abs(Math.cos(1.5*t)));
  pts.push(new THREE.Vector2(r*Math.cos(t),r*Math.sin(t)));
}
sh.moveTo(pts[0].x,pts[0].y);
for(var j=1;j<pts.length;j++)sh.lineTo(pts[j].x,pts[j].y);
sh.closePath();return sh;
}

function buildWankel(root){
window._dvsWankelRotors=window._dvsWankelRotors||[];
window._dvsWankelPins=window._dvsWankelPins||[];
window._dvsWankelFlashes=window._dvsWankelFlashes||[];
var Rr=1.7,ecc=0.5,depth=1.5,gap=0.35,zOff=-1.0,baseY=3.0;
var shaft=new THREE.Group();
shaft.position.y=baseY;
var sb=cyl(0.26,0.26,5.0,20,MAT.crank);
sb.rotation.x=Math.PI/2;shaft.add(sb);
var e1=new THREE.Group();
var e1b=cyl(0.5,0.5,0.42,22,MAT.crankJ);
e1b.rotation.x=Math.PI/2;e1.add(e1b);
e1.position.set(0,0,zOff);shaft.add(e1);
var e2=new THREE.Group();
var e2b=cyl(0.5,0.5,0.42,22,MAT.crankJ);
e2b.rotation.x=Math.PI/2;e2.add(e2b);
e2.position.set(0,0,zOff+depth+gap);shaft.add(e2);
root.add(shaft);sCr(shaft);
window._dvsWankelPins.push({grp:shaft});
var fw=new THREE.Group();
fw.position.y=baseY;
var fwD=cyl(1.7,1.7,0.28,28,MAT.fly);
fwD.rotation.x=Math.PI/2;fw.add(fwD);
for(var ft=0;ft<32;ft++){
  var th=box(0.22,0.14,0.1,MAT.crank);
  var a=(ft/32)*Math.PI*2;
  th.position.set(Math.cos(a)*1.8,Math.sin(a)*1.8,0);
  th.rotation.z=a;fw.add(th);
}
fw.position.z=zOff+depth*2+gap+0.7;
root.add(fw);sF(fw);
for(var rIdx=0;rIdx<2;rIdx++){
  var zC=zOff+rIdx*(depth+gap);
  var phase=rIdx*Math.PI;
  var hGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false});
  hGeo.center();
  var housing=new THREE.Mesh(hGeo,MAT.glass);
  housing.position.set(0,baseY,zC);root.add(housing);pB(housing);
  var iGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr*0.95,ecc*0.95),{depth:depth-0.05,bevelEnabled:false});
  iGeo.center();
  var inner=new THREE.Mesh(iGeo,MAT.glassD);
  inner.position.set(0,baseY,zC);inner.scale.set(0.97,0.97,0.97);root.add(inner);
  var rGeo=new THREE.ExtrudeGeometry(makeRotorShape(Rr*0.72),{depth:depth-0.25,bevelEnabled:false});
  rGeo.center();
  var rm=new THREE.Mesh(rGeo,MAT.dark);
  rm.position.set(0,baseY,zC);root.add(rm);
  window._dvsWankelRotors.push({mesh:rm,ecc:ecc,phase:phase,baseX:0,baseY:baseY});
  for(var fp=0;fp<3;fp++){
    var fm=new THREE.Mesh(new THREE.SphereGeometry(0.26,12,10),
      new THREE.MeshBasicMaterial({color:0xffaa44,transparent:true,opacity:0}));
    var fa=fp*(Math.PI*2/3)+phase;
    fm.position.set(Math.cos(fa)*Rr*0.7,baseY+Math.sin(fa)*Rr*0.7,zC);
    root.add(fm);
    var lt=new THREE.PointLight(0xffaa44,0,6);
    lt.position.copy(fm.position);root.add(lt);
    window._dvsWankelFlashes.push({mesh:fm,light:lt,phase:fa});
  }
}
addPlate(root,0,baseY+Rr+1.1,zOff+depth/2,3.2,0.5,'MAZDA','#101010','#FFFFFF');
}

window.DVS_3D_BUILDERS={
r4:buildR4,tdi:buildTDI,dci:buildDCi,
scooter:buildScooter,passatb3:buildPassatB3,bluebird:buildBluebird,
i6:buildI6,galant6:buildV6,v6:buildV6,v8:buildV8,v12:buildV12,v16:buildV16,v22:buildV22,
boxer:buildBoxer,radial:buildRadial,tractor:buildTractor,wankel:buildWankel
};
if(window.DVS_3D&&window.DVS_3D.isActive&&window.DVS_3D.isActive()){
  try{window.DVS_3D_REBUILD();}catch(e){}
}
console.log('build.js: билдеров =',Object.keys(window.DVS_3D_BUILDERS).length);
}
waitRef();
})();