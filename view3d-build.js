(function(){
"use strict";
var S=window.S;if(!S)return;

function M(c,mt,rg,op,tr){
  var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};
  if(op!==undefined){o.transparent=true;o.opacity=op;}
  if(tr)o.side=THREE.DoubleSide;
  return new THREE.MeshStandardMaterial(o);
}
function cy(r,h,s,c,a,b){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),M(c,a,b));}
function bx(w,h,d,c,a,b){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,a,b));}

var animParts=[];
var ghostParts=[];
var ghostOn=false;

function makeCylAss(o){
  var g=new THREE.Group();
  g.position.set(o.x,o.y,o.z);
  var shell=new THREE.Mesh(
    new THREE.CylinderGeometry(o.r+0.15,o.r+0.15,o.h,20,1,true),
    M(0x8894a2,0.9,0.15,0.32,true)
  );
  shell.position.y=o.h/2;g.add(shell);ghostParts.push(shell);

  var p=new THREE.Group();
  p.position.y=o.h*0.55;
  p.add(cy(o.r,o.h*0.6,18,0xd8e0e8,0.95,0.15));
  for(var k=0;k<3;k++){
    var rg=cy(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);
    rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);
  }
  g.add(p);

  var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);
  g.add(rod);

  var ign=cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5);
  ign.position.y=o.h+0.4;g.add(ign);

  var cols=[0x6fd0ff,0xff8a6f,0xffffff,0xffaa44];
  for(var s=0;s<4;s++){
    var v=cy(o.r*0.22,0.1,12,cols[s],0.75,0.4);
    v.position.set((s%2===0?-1:1)*o.r*0.4,o.h+0.05,(s<2?-1:1)*o.r*0.25);
    g.add(v);
  }
  return {g:g,p:p,off:o.off||0};
}

function makeCrankFly(root,L,y,perRow,fwR){
  var cg=new THREE.Group();cg.position.y=y;
  var ax=cy(0.4,L+1,20,0xa8b4c0,0.95,0.2);ax.rotation.z=Math.PI/2;cg.add(ax);
  for(var mi=0;mi<=perRow;mi++){
    var mx=-L/2+0.5+mi*(L-1)/perRow;
    var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);
    mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
  }
  for(var ci=0;ci<perRow;ci++){
    var cxx=-L/2+0.85+ci*(L-1.7)/Math.max(1,perRow-1);
    var o1=ci*Math.PI*2/perRow;
    var p1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);
    p1.rotation.z=Math.PI/2;
    p1.position.set(cxx,Math.sin(o1)*0.55,0);cg.add(p1);
  }
  root.add(cg);animParts.push({g:cg,type:'crank'});

  var fw=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);
  fw.rotation.z=Math.PI/2;
  fw.position.set(L/2+0.7,y,0);root.add(fw);
  animParts.push({g:fw,type:'crank'});
}

function buildSupra(root){
  var n=6,sp=2.0,tw=n*sp,L=tw+1.5;
  var pod=bx(L+0.4,1.4,5.2,0x2a2a2a,0.7,0.5);
  pod.position.y=-0.7;root.add(pod);
  makeCrankFly(root,L,0.6,n,2.4);
  var bk=bx(L,5,5,0x4a5566,0.85,0.45);
  bk.position.y=3.4;root.add(bk);ghostParts.push(bk);
  for(var rr=0;rr<9;rr++){
    var rb=bx(L+0.05,0.06,5.05,0x2a3340,0.6,0.6);
    rb.position.y=1.2+rr*0.55;root.add(rb);
  }
  var hd=bx(L+0.2,1.4,5.3,0x3a4756,0.85,0.35);
  hd.position.y=6.4;root.add(hd);ghostParts.push(hd);
  var cv=bx(L,0.8,5,0x2a3340,0.75,0.4);
  cv.position.y=7.5;root.add(cv);ghostParts.push(cv);
  var inM=cy(0.34,L*0.9,14,0x3a4654,0.85,0.4);
  inM.rotation.z=Math.PI/2;inM.position.set(0,5.8,2.5);root.add(inM);
  var exM=cy(0.36,L*0.9,14,0x4a3a2a,0.85,0.5);
  exM.rotation.z=Math.PI/2;exM.position.set(0,-0.3,-2.5);root.add(exM);
  var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);
  tb.rotation.z=Math.PI/2;tb.position.set(L/2+0.4,-0.3,-2.5);
  root.add(tb);animParts.push({g:tb,type:'turbo'});
  for(var i=0;i<n;i++){
    var xx=-tw/2+sp/2+i*sp;
    var a=makeCylAss({x:xx,y:1.1,z:0,r:1.05,h:4.6,off:i*Math.PI});
    root.add(a.g);
    animParts.push({g:a.p,type:'piston',off:a.off});
  }
}

function rebuild(){
  var D=window.DVS_3D;if(!D)return;
  var scene=D.getScene();if(!scene)return;
  var old=window._3dRoot;
  if(old){
    while(old.children.length){
      var c=old.children.pop();
      if(c.geometry)try{c.geometry.dispose();}catch(e){}
    }
    scene.remove(old);
  }
  animParts=[];ghostParts=[];
  var root=new THREE.Group();scene.add(root);window._3dRoot=root;
  try{buildSupra(root);}catch(e){console.warn('3D crash:',e);}
  console.log('3D built: Supra 2JZ');
}

function animRun(ang){
  for(var i=0;i<animParts.length;i++){
    var A=animParts[i];
    if(A.type==='crank')A.g.rotation.x=-ang;
    else if(A.type==='turbo')A.g.rotation.x=ang*2.5;
    else if(A.type==='piston'){
      var ph=ang+(A.off||0);
      var Rc=0.8,L=3.5,cy0=1.0;
      var s=Math.sin(ph),c=Math.cos(ph);
      var sq=L*L-Rc*Rc*s*s;if(sq<0)sq=0;
      A.g.position.y=cy0+Rc*c+Math.sqrt(sq);
    }
  }
}

function toggleGhost(){
  ghostOn=!ghostOn;
  for(var i=0;i<ghostParts.length;i++){
    ghostParts[i].material.transparent=ghostOn;
    ghostParts[i].material.opacity=ghostOn?0.12:1;
  }
  var b=document.getElementById('ghostBtn');
  if(b)b.textContent=ghostOn?'👁 Скелет':'👁 Скрыто';
}

window.DVS_3D_REBUILD=rebuild;
window.DVS_3D_ANIM=animRun;
window.DVS_3D_TOGGLE_GHOST=toggleGhost;

console.log('view3d-build.js: только Supra 2JZ готов');
})();