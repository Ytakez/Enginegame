(function(){
"use strict";
var S=window.S;if(!S)return;

function M(c,mt,rg,op,tr){
  var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};
  if(op!==undefined){o.transparent=true;o.opacity=op;}
  if(tr)o.side=THREE.DoubleSide;
  return new THREE.MeshStandardMaterial(o);
}
function cyl(r,h,s,c,mt,rg){return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s||20),M(c,mt,rg));}
function bx(w,h,d,c,mt,rg){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,mt,rg));}

var animParts=[];
var ghostParts=[];

function makeCylAss(o){
  var g=new THREE.Group();
  g.position.set(o.x,o.y,o.z);
  var shell=new THREE.Mesh(
    new THREE.CylinderGeometry(o.r+0.15,o.r+0.15,o.h,20,1,true),
    M(0x8894a2,0.9,0.15,0.32,true)
  );
  shell.position.y=o.h/2;g.add(shell);
  var p=new THREE.Group();
  p.position.y=o.h*0.55;
  p.add(cyl(o.r,o.h*0.6,18,0xd8e0e8,0.95,0.15));
  for(var k=0;k<3;k++){
    var rg=cyl(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);
    rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);
  }
  g.add(p);
  var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);
  g.add(rod);
  var ign=cyl(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5);
  ign.position.y=o.h+0.4;g.add(ign);
  var cols=[0x6fd0ff,0xff8a6f,0xffffff,0xffaa44];
  for(var s=0;s<4;s++){
    var vg=cyl(o.r*0.22,0.1,12,cols[s],0.75,0.4);
    vg.position.set((s%2===0?-1:1)*o.r*0.4,o.h+0.05,(s<2?-1:1)*o.r*0.25);
    g.add(vg);
  }
  return {g:g,p:p,rod:rod,off:o.off||0};
}

function makeCrankFly(root,blockLen,y,perRow,fwR){
  var cg=new THREE.Group();cg.position.y=y;
  var ax=cyl(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);
  ax.rotation.z=Math.PI/2;cg.add(ax);
  for(var mi=0;mi<=perRow;mi++){
    var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
    var mn=cyl(0.55,0.4,16,0xb8c6d4,0.95,0.2);
    mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
  }
  for(var ci=0;ci<perRow;ci++){
    var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
    var o1=ci*Math.PI*2/perRow;
    var p1=cyl(0.3,0.5,12,0xd8e4f0,0.95,0.2);
    p1.rotation.z=Math.PI/2;p1.position.set(cxx,Math.sin(o1)*0.55,0);
    cg.add(p1);
  }
  root.add(cg);
  animParts.push({g:cg,type:'crank'});
  var fw=cyl(fwR,0.4,32,0x8a95a3,0.9,0.3);
  fw.rotation.z=Math.PI/2;
  fw.position.set(blockLen/2+0.7,y,0);
  root.add(fw);
  animParts.push({g:fw,type:'crank'});
}

function buildInline(root,n,sp,diesel){
  var tw=n*sp, blockLen=tw+1.5;
  var pod=bx(blockLen+0.4,1.4,diesel?5.2:5,diesel?0x2a2a2a:0x2a3340,0.7,0.5);
  pod.position.y=-0.7;root.add(pod);
  makeCrankFly(root,blockLen,0.6,n,2.2);
  var bk=bx(blockLen,5,5,diesel?0x3a3a3a:0x4a5566,0.8,0.45);
  bk.position.y=3.4;root.add(bk);ghostParts.push(bk);
  for(var rr=0;rr<9;rr++){
    var rb=bx(blockLen+0.06,0.07,5.05,0x1a1a1a,0.6,0.6);
    rb.position.y=1.2+rr*0.55;root.add(rb);
  }
  var hd=bx(blockLen+0.2,1.4,5.3,diesel?0x4a4a4a:0x3a4756,0.85,0.35);
  hd.position.y=6.4;root.add(hd);ghostParts.push(hd);
  var cv=bx(blockLen,0.8,5,0x2a3340,0.75,0.4);
  cv.position.y=7.5;root.add(cv);ghostParts.push(cv);
  var inM=cyl(0.34,blockLen*0.9,14,0x3a4654,0.85,0.4);
  inM.rotation.z=Math.PI/2;inM.position.set(0,5.8,2.5);root.add(inM);
  var exM=cyl(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
  exM.rotation.z=Math.PI/2;exM.position.set(0,-0.3,-2.5);root.add(exM);
  if(diesel){
    var tb=cyl(0.9,0.7,20,0x4a5566,0.85,0.4);
    tb.rotation.z=Math.PI/2;tb.position.set(blockLen/2+0.3,-0.3,-2.5);
    root.add(tb);
    animParts.push({g:tb,type:'turbo'});
  }
  for(var i=0;i<n;i++){
    var xx=-tw/2+sp/2+i*sp;
    var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.15,h:4.6,off:i*Math.PI});
    root.add(a4.g);
    animParts.push({g:a4.p,type:'piston',off:a4.off});
  }
}

function buildV(root,n){
  var perRow=Math.floor(n/2), sp=2.0, tw=perRow*sp;
  var blockLen=tw+1.8, half=Math.PI/6, bd=1.8;
  var pod=bx(blockLen+0.4,1.2,7.5,0x2a2a2a,0.7,0.5);
  pod.position.y=-0.9;root.add(pod);
  makeCrankFly(root,blockLen,0.6,perRow,2.4);
  for(var side=0;side<2;side++){
    var sign=side===0?-1:1;
    var bk=bx(blockLen,5,2.8,0x3a3a3a,0.85,0.4);
    bk.position.set(0,3.4,sign*bd);bk.rotation.x=sign*half;
    root.add(bk);ghostParts.push(bk);
    var hd=bx(blockLen+0.2,1.4,2.8,0x8894a2,0.9,0.25);
    hd.position.set(0,6.4,sign*(bd+1.2));hd.rotation.x=sign*half;
    root.add(hd);ghostParts.push(hd);
    var cv=bx(blockLen,0.8,2.5,0x2a3340,0.75,0.4);
    cv.position.set(0,7.5,sign*(bd+1.5));cv.rotation.x=sign*half;
    root.add(cv);ghostParts.push(cv);
    var inM=cyl(0.32,blockLen*0.9,14,0x8b6a2b,0.9,0.35);
    inM.rotation.z=Math.PI/2;
    inM.position.set(0,7.0,sign*(bd+2.2));root.add(inM);
    for(var j=0;j<perRow;j++){
      var xx=-tw/2+sp/2+j*sp;
      var off=side===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI;
      var a=makeCylAss({x:xx,y:1.1,z:sign*bd,r:1.0,h:4.6,off:off});
      a.g.rotation.x=sign*half;
      root.add(a.g);
      animParts.push({g:a.p,type:'piston',off:off});
    }
  }
}

function buildBoxer(root){
  var n=2, sp=2.4, tw=n*sp, blockLen=tw+1.8;
  var half=Math.PI/2, bd=1.6;
  var pod=bx(blockLen+0.3,1.2,6,0x2a3340,0.7,0.5);
  pod.position.y=-0.6;root.add(pod);
  makeCrankFly(root,blockLen,0.6,n,2.4);
  for(var side=0;side<2;side++){
    var sign=side===0?-1:1;
    var bk=bx(blockLen,4.4,2.6,0x4a5566,0.85,0.4);
    bk.position.set(0,3.4,sign*bd);bk.rotation.x=sign*half;
    root.add(bk);ghostParts.push(bk);
    var hd=bx(blockLen+0.2,1.2,2.7,0x8894a2,0.9,0.25);
    hd.position.set(0,6.0,sign*(bd+1.0));hd.rotation.x=sign*half;
    root.add(hd);ghostParts.push(hd);
    for(var j=0;j<n;j++){
      var xx=-tw/2+sp/2+j*sp;
      var off=side===0?j*Math.PI:j*Math.PI+Math.PI;
      var a=makeCylAss({x:xx,y:1.1,z:sign*bd,r:0.95,h:4.0,off:off});
      a.g.rotation.x=sign*half;
      root.add(a.g);
      animParts.push({g:a.p,type:'piston',off:off});
    }
  }
}

function buildRadial(root){
  var n=9, R=3.2, cylLen=3.0;
  var carter=cyl(3.4,0.8,32,0x3a3a3a,0.75,0.45);
  carter.rotation.x=Math.PI/2;carter.position.set(0,3,0);
  root.add(carter);ghostParts.push(carter);
  var crank=new THREE.Group();crank.position.set(0,3,0);
  var cb=cyl(0.45,5.5,20,0xa8b4c0,0.95,0.2);
  cb.rotation.z=Math.PI/2;crank.add(cb);
  root.add(crank);animParts.push({g:crank,type:'crank'});
  var fw=cyl(1.6,0.35,32,0x8a95a3,0.9,0.3);
  fw.rotation.z=Math.PI/2;fw.position.set(2.75,3,0);
  root.add(fw);animParts.push({g:fw,type:'crank'});
  for(var i=0;i<n;i++){
    var a=i*(Math.PI*2/n)-Math.PI/2;
    var cx=Math.cos(a)*R, cyy=3+Math.sin(a)*R;
    var grp=new THREE.Group();
    grp.position.set(cx,cyy,0);
    grp.rotation.z=a-Math.PI/2;
    root.add(grp);
    var shell=new THREE.Mesh(
      new THREE.CylinderGeometry(1.0,1.0,cylLen,20,1,true),
      M(0x8894a2,0.9,0.15,0.32,true)
    );
    shell.position.y=cylLen/2;grp.add(shell);
    var hd=cyl(1.05,0.4,20,0x8894a2,0.9,0.25);
    hd.position.y=cylLen+0.2;grp.add(hd);
    var p=cyl(0.9,0.7,18,0xd8e0e8,0.95,0.15);
    p.position.y=cylLen*0.5;grp.add(p);
    var rod=bx(0.28,1.6,0.28,0x8894a2,0.9,0.25);
    rod.position.y=-0.5;grp.add(rod);
  }
}

function buildWankel(root){
  var Rr=2,ecc=0.4,depth=1.6,rotR=1.2,space=5;
  var base=bx(space+2.5,0.6,5.5,0x2a3340,0.7,0.5);
  base.position.y=-2.2;root.add(base);
  var ax=cyl(0.28,space+3,16,0xc8d4e0,0.95,0.2);
  ax.rotation.z=Math.PI/2;root.add(ax);
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
    var cm=new THREE.Mesh(eg,M(0x8894a2,0.92,0.2,0.32,true));
    unit.add(cm);ghostParts.push(cm);
    var rg=new THREE.ExtrudeGeometry(rot(),{depth:depth*0.72,bevelEnabled:false});
    rg.center();
    var rm=new THREE.Mesh(rg,M(0xdde5ee,0.95,0.15));
    unit.add(rm);
    animParts.push({g:rm,type:'rotor',ecc:ecc});
    root.add(unit);
  }
  var fw=cyl(1.6,0.4,32,0x8a95a3,0.92,0.28);
  fw.rotation.z=Math.PI/2;fw.position.set(space+2,0,0);
  root.add(fw);animParts.push({g:fw,type:'crank'});
}

function buildScooter(root){
  var L=4;
  var pod=bx(L,1,3.4,0x2a3340,0.7,0.5);pod.position.y=-0.5;root.add(pod);
  makeCrankFly(root,L,0.6,1,1.4);
  var bk=bx(L,3.6,3.4,0x4a5566,0.85,0.4);bk.position.y=2.4;root.add(bk);ghostParts.push(bk);
  var hd=bx(L+0.2,1.2,3.5,0x3a4756,0.85,0.35);hd.position.y=4.8;root.add(hd);ghostParts.push(hd);
  var a4=makeCylAss({x:0,y:1.1,z:0,r:0.9,h:3.4,off:0});
  root.add(a4.g);
  animParts.push({g:a4.p,type:'piston',off:0});
}

function buildTractor(root){
  var L=10;
  var pod=bx(L+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);pod.position.y=-1;root.add(pod);
  makeCrankFly(root,L,0.6,4,3.0);
  var bk=bx(L,5.5,6,0x3a3a3a,0.75,0.55);bk.position.y=3.7;root.add(bk);ghostParts.push(bk);
  var hd=bx(L+0.3,1.6,6.3,0x4a4a4a,0.8,0.45);hd.position.y=7.1;root.add(hd);ghostParts.push(hd);
  var cv=bx(L,0.9,6,0x2a2a2a,0.7,0.45);cv.position.y=8.3;root.add(cv);ghostParts.push(cv);
  for(var j=0;j<4;j++){
    var xx=-L/2+1.5+j*2.5;
    var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.35,h:5.0,off:j*Math.PI});
    root.add(a4.g);
    animParts.push({g:a4.p,type:'piston',off:j*Math.PI});
  }
}

function smartRebuild(){
  var D=window.DVS_3D;if(!D)return;
  var sc=D.getScene();if(!sc)return;
  var old=window._3dRoot;
  if(old){
    while(old.children.length){
      var c=old.children.pop();
      if(c.geometry)try{c.geometry.dispose();}catch(e){}
    }
    sc.remove(old);
  }
  animParts=[];ghostParts=[];
  var root=new THREE.Group();sc.add(root);window._3dRoot=root;
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'').replace(/-/g,'');
  function has(){for(var i=0;i<arguments.length;i++)if(raw.indexOf(arguments[i])>=0)return true;return false;}
  try{
    if(has('wankel','renesis','rotary')) buildWankel(root);
    else if(has('radial','wright','r1820')) buildRadial(root);
    else if(has('boxer','ej25','subaru')) buildBoxer(root);
    else if(has('v22')) buildV(root,22);
    else if(has('v16')) buildV(root,16);
    else if(has('v12')) buildV(root,12);
    else if(has('v8')) buildV(root,8);
    else if(has('v6','galant')) buildV(root,6);
    else if(has('scooter')) buildScooter(root);
    else if(has('tractor','mtz','mt82')) buildTractor(root);
    else if(has('tdi','dci')) buildInline(root,4,2.2,true);
    else buildInline(root,4,2.2,false);
    console.log('3D:',raw);
  }catch(e){console.warn('3D crash:',e);}
}

function animRun(ang){
  for(var i=0;i<animParts.length;i++){
    var A=animParts[i];
    if(A.type==='crank') A.g.rotation.x=-ang;
    else if(A.type==='turbo') A.g.rotation.x=ang*2.5;
    else if(A.type==='piston'){
      var ph=ang+(A.off||0);
      var Rc=0.8,L=3.5,cyA=1.0;
      var s=Math.sin(ph),c=Math.cos(ph);
      var sq=L*L-Rc*Rc*s*s;if(sq<0)sq=0;
      A.g.position.y=cyA+Rc*c+Math.sqrt(sq);
    }
    else if(A.type==='rotor'){
      A.g.rotation.z=-ang/3;
      A.g.position.x=Math.cos(ang)*A.ecc;
      A.g.position.y=Math.sin(ang)*A.ecc;
    }
  }
}

var ghostOn=false;
function ghostToggle(){
  ghostOn=!ghostOn;
  for(var i=0;i<ghostParts.length;i++){
    ghostParts[i].material.transparent=ghostOn;
    ghostParts[i].material.opacity=ghostOn?0.12:1;
  }
  var b=document.getElementById('ghostBtn');
  if(b)b.textContent=ghostOn?'👁 Скелет':'👁 Скрыто';
}

window.DVS_3D_REBUILD=smartRebuild;
window.DVS_3D_ANIM=animRun;
window.DVS_3D_TOGGLE_GHOST=ghostToggle;

console.log('view3d-build.js: OK');
})();