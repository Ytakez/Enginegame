(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF;
  var B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx,m=B.m;

  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sC(x){if(R.setCams)R.setCams(x);}
  function sCam(x){if(R.setCam)R.setCam(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  var MAT = {
    block:  new THREE.MeshStandardMaterial({color:0x9ab0c4,metalness:0.5,roughness:0.2,transparent:true,opacity:0.25,side:THREE.DoubleSide,depthWrite:false}),
    head:   new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.25}),
    cover:  new THREE.MeshStandardMaterial({color:0x2a3038,metalness:0.7,roughness:0.5}),
    pan:    new THREE.MeshStandardMaterial({color:0x1e242c,metalness:0.7,roughness:0.5}),
    rib:    new THREE.MeshStandardMaterial({color:0x1a1f26,metalness:0.6,roughness:0.6}),
    piston: new THREE.MeshStandardMaterial({color:0xf0f4f8,metalness:0.95,roughness:0.1,emissive:0x778899,emissiveIntensity:0.4}),
    rod:    new THREE.MeshStandardMaterial({color:0xc8d4e0,metalness:0.9,roughness:0.25}),
    crank:  new THREE.MeshStandardMaterial({color:0xc8d4e0,metalness:0.95,roughness:0.2}),
    chrome: new THREE.MeshStandardMaterial({color:0xe0e8f0,metalness:0.98,roughness:0.1}),
    intake: new THREE.MeshStandardMaterial({color:0x3a4654,metalness:0.85,roughness:0.4}),
    exhaust:new THREE.MeshStandardMaterial({color:0x4a3a2a,metalness:0.85,roughness:0.5}),
    turbo:  new THREE.MeshStandardMaterial({color:0x4a5566,metalness:0.85,roughness:0.4})
  };

  function bolt(x,y,z,r){
    var b=new THREE.Mesh(new THREE.CylinderGeometry(r||0.06,r*2,6),MAT.chrome);
    b.rotation.z=Math.PI/2;b.position.set(x,y,z);return b;
  }

  function makePiston(x,centerY,z,r,off){
    var g=new THREE.Group();
    g.position.set(x,centerY-2.9,z);
    var p=new THREE.Group();
    p.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*0.7,24),MAT.piston));
    for(var k=0;k<3;k++){
      var ring=new THREE.Mesh(new THREE.CylinderGeometry(r+0.025,r+0.025,0.05,24),MAT.rib);
      ring.position.y=r*0.22-k*r*0.18;p.add(ring);
    }
    var pin=new THREE.Mesh(new THREE.CylinderGeometry(r*0.14,r*0.14,r*1.05,12),MAT.rib);
    pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);
    var rod=new THREE.Mesh(new THREE.BoxGeometry(r*0.26,1.8,r*0.26),MAT.rod);
    rod.position.y=-0.9;g.add(rod);
    return {g:g,p:p,rod:rod,off:off||0};
  }

  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen+1,24),MAT.crank);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<perRow+1;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=new THREE.Mesh(new THREE.CylinderGeometry(0.52,0.52,0.4,20),MAT.crank);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var pin=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.5,16),MAT.chrome);
      pin.rotation.z=Math.PI/2;pin.position.set(cxx,Math.sin(o1)*0.55,0);cg.add(pin);
    }
    root.add(cg);sCr(cg);
    var fw=new THREE.Group();
    var fwD=new THREE.Mesh(new THREE.CylinderGeometry(fwR,fwR,0.4,36),MAT.crank);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<32;ft++){
      var th=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.28,0.16),MAT.rib);
      var a=(ft/32)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.12),Math.sin(a)*(fwR+0.12));
      th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.7,y,0);root.add(fw);sF(fw);
  }

  function buildInline(root,cfg){
    var n=cfg.n||4;
    var spacing=2.2;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=4.5;
    var blockD=4.5;
    var blockY=3.0;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.3,1.2,blockD+0.2),MAT.pan);
    pod.position.y=0.3;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,n,2.0);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<6;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,blockD+0.04),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/5;root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.1,blockD+0.1),MAT.head);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+0.9;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.6,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    for(var b=0;b<=n;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/n;
      root.add(bolt(bx2,covY+0.4,-(blockD/2-0.7),0.055));
      root.add(bolt(bx2,covY+0.4,(blockD/2-0.7),0.055));
    }

    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,blockLen*0.9,14),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.2,blockD/2+0.35);root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockY-blockH/2-0.3,-blockD/2-0.35);root.add(exMan);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockY,0,1.0,i*Math.PI);
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    for(var sp=0;sp<n;sp++){
      var spx=-totalWidth/2+spacing/2+sp*spacing;
      var plug=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.35,10),MAT.chrome);
      plug.position.set(spx,headY+0.35,-0.5);root.add(plug);
    }
  }

  function buildV(root,cfg){
    var totalN=cfg.n;
    var perRow=Math.floor(totalN/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var half=Math.PI/6;
    var bankDist=1.6;
    var blockH=4.2;
    var blockY=2.9;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.3,6.5),MAT.pan);
    pod.position.y=0.3;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.4);

    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,2.6),MAT.block);
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);

      for(var rr=0;rr<5;rr++){
        var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,2.65),MAT.rib);
        rb.position.set(0,blockY-blockH/2+0.5+rr*(blockH-1)/4,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }

      var headY=blockY+blockH/2+0.5;
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.0,2.8),MAT.head);
      hd.position.set(0,headY,sign*(bankDist+1.3));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);

      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.55,2.6),MAT.cover);
      cv.position.set(0,headY+0.85,sign*(bankDist+1.5));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);

      var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,blockLen*0.9,12),MAT.intake);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,headY+0.3,sign*(bankDist+2.3));root.add(inMan);

      var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.33,blockLen*0.9,12),MAT.exhaust);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.6,sign*0.4);root.add(exMan);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makePiston(xx,blockY,sg*bankDist,0.9,off);
        a.g.rotation.x=sg*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  function buildDiesel(root,cfg){
    var n=4;
    var spacing=2.2;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=4.6;
    var blockD=4.6;
    var blockY=3.0;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.4,blockD+0.2),MAT.pan);
    pod.position.y=0.3;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,n,2.0);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<6;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,blockD+0.04),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/5;root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.1,blockD+0.1),MAT.head);
    hd.position.y=headY;root.add(hd);pH(hd);

    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.6,blockD-0.5),MAT.cover);
    cv.position.y=headY+0.9;root.add(cv);pC(cv);

    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,blockLen*0.9,14),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.2,blockD/2+0.35);root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockY-blockH/2-0.3,-blockD/2-0.35);root.add(exMan);

    var turbo=new THREE.Group();
    var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.65,20),MAT.turbo);
    tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,20),MAT.turbo);
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.35,blockY-blockH/2-0.3,-blockD/2-0.35);
    root.add(turbo);
    window._dciParts={turbo:turbo};

    var pump=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.4,1.6),MAT.turbo);
    pump.position.set(blockLen/2+0.5,headY+1.2,-blockD/2-0.3);root.add(pump);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockY,0,1.05,i*Math.PI);
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
  }

  window.DVS_3D_REBUILD=function(){
    var scene=R.getScene();
    if(!scene)return;
    var cfg=R.getCfg(S.engineType)||{n:4,v:false};

    var old=R.getRoot();
    if(old){
      scene.remove(old);
      try{
        old.traverse(function(ch){
          if(ch.geometry)try{ch.geometry.dispose();}catch(e){}
          if(ch.material){
            if(Array.isArray(ch.material))ch.material.forEach(function(mm){try{mm.dispose();}catch(e){}});
            else try{ch.material.dispose();}catch(e){}
          }
        });
      }catch(e){}
    }
    if(R.clearAll)R.clearAll();
    window._dvsWankelRotors=[];
    window._dciParts=null;

    var root=new THREE.Group();scene.add(root);R.setRoot(root);

    var t=S.engineType;
    try{
      if(t==='tdi'||t==='dci')  buildDiesel(root,cfg);
      else if(cfg.v)             buildV(root,cfg);
      else if(t==='wankel')      buildInline(root,{n:2});
      else                       buildInline(root,cfg);
    }catch(e){console.warn('build crash:',e);}
  };

  console.log('view3d-build: загружен OK');
}
waitRef();
})();