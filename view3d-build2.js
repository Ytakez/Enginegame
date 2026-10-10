(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  if(!window.DVS_3D_MODELS){setTimeout(waitRef,150);return;}

  var R=window.DVS_3D_REF;
  var B=window.DVS_3D_BUILD;
  var M=window.DVS_3D_MODELS;
  var MAT=M.MAT;

  /* ==================== ДИЗЕЛЬ R4 ==================== */
  M.buildDiesel=function(root,cfg){
    var n=4;
    var spacing=2.2;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=4.6;
    var blockD=4.6;
    var blockY=3.0;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.4,blockD+0.2),MAT.pan);
    pod.position.y=0.3;root.add(pod);
    M.makeCrankAndFly(root,blockLen,0.6,n,2.0);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockGD);
    bk.position.y=blockY;root.add(bk);M.pB(bk);

    for(var rr=0;rr<6;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,blockD+0.04),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/5;root.add(rb);M.pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.1,blockD+0.1),MAT.headD);
    hd.position.y=headY;root.add(hd);M.pH(hd);

    var covY=headY+0.9;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.6,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);M.pC(cv);

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
      var a4=M.makePiston(xx,blockY,0,1.05,i*Math.PI);
      root.add(a4.g);arr.push(a4);
    }
    M.sA(arr);
  };

  /* ==================== ТРАКТОР ==================== */
  M.buildTractor=function(root,cfg){
    var n=4;
    var spacing=2.4;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.8;
    var blockH=5.0;
    var blockD=5.4;
    var blockY=3.2;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.5,1.8,blockD+0.3),MAT.pan);
    pod.position.y=0.3;root.add(pod);
    M.makeCrankAndFly(root,blockLen,0.6,n,2.8);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockGD);
    bk.position.y=blockY;root.add(bk);M.pB(bk);

    for(var rr=0;rr<7;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/6;root.add(rb);M.pR(rb);
    }

    var headY=blockY+blockH/2+0.7;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.25,1.4,blockD+0.2),MAT.headD);
    hd.position.y=headY;root.add(hd);M.pH(hd);

    var covY=headY+1.0;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.8,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);M.pC(cv);

    var tank=new THREE.Mesh(new THREE.BoxGeometry(blockLen*0.6,2.0,1.8),MAT.turbo);
    tank.position.set(-blockLen/2-1.6,2.5,0);root.add(tank);

    var pump=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.0,2.0),MAT.turbo);
    pump.position.set(blockLen/2+0.9,covY+0.5,blockD/2-0.3);root.add(pump);

    var af=new THREE.Mesh(new THREE.CylinderGeometry(0.95,0.95,2.4,18),MAT.turbo);
    af.rotation.z=Math.PI/2;
    af.position.set(-blockLen/2+1.5,covY+2.3,0);root.add(af);

    var ex=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,7.0,14),MAT.turbo);
    ex.position.set(blockLen/2-1.3,covY+3.3,0);root.add(ex);
    var exC=new THREE.Mesh(new THREE.CylinderGeometry(0.52,0.52,0.4,14),MAT.rib);
    exC.position.set(blockLen/2-1.3,covY+6.8,0);root.add(exC);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=M.makePiston(xx,blockY,0,1.25,i*Math.PI);
      root.add(a4.g);arr.push(a4);
    }
    M.sA(arr);
  };

  /* ==================== SHAHED ==================== */
  M.buildShahed=function(root,cfg){
    var perRow=2;
    var spacing=2.4;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.4;
    var blockH=3.0;
    var blockD=6.8;
    var blockY=2.4;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,0.9,blockD+0.3),MAT.pan);
    pod.position.y=0.3;root.add(pod);
    M.makeCrankAndFly(root,blockLen,0.6,perRow,1.6);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockG);
    bk.position.y=blockY;root.add(bk);M.pB(bk);

    for(var rr=0;rr<4;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.05,blockD+0.05),MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/3;root.add(rb);M.pR(rb);
    }

    var headY=blockY+blockH/2+0.5;
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.1,1.0,1.5),MAT.head);
      hd.position.set(0,headY,sign*(blockD/2+0.7));root.add(hd);M.pH(hd);
      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.55,1.3),MAT.cover);
      cv.position.set(0,headY+0.75,sign*(blockD/2+0.8));root.add(cv);M.pC(cv);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var zz=sg*(blockD/2-1.2);
        var off=(s2===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=M.makePiston(xx,blockY,zz,0.85,off);
        a.g.rotation.x=sg*Math.PI/2;
        root.add(a.g);arr.push(a);
      }
    }
    M.sA(arr);

    var propGrp=new THREE.Group();
    propGrp.position.set(blockLen/2+1.8,blockY,0);
    var hub=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.6,14),MAT.turbo);
    hub.rotation.x=Math.PI/2;propGrp.add(hub);
    for(var bl=0;bl<2;bl++){
      var blade=new THREE.Mesh(new THREE.BoxGeometry(0.18,3.2,0.08),MAT.chrome);
      blade.rotation.y=bl*Math.PI/2;
      blade.rotation.x=0.35;propGrp.add(blade);
    }
    root.add(propGrp);
    window._shahedProp=propGrp;

    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,blockLen*0.8,12),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+1.2,0);root.add(inMan);

    for(var e=0;e<2;e++){
      var es=e===0?-1:1;
      var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,2.2,10),MAT.exhaust);
      pipe.position.set(-blockLen/2-0.6,blockY,es*2.0);
      pipe.rotation.x=Math.PI/2;root.add(pipe);
    }
  };

  /* ==================== ВАНКЕЛЬ ==================== */
  function makeEpiPoints(Rr,e,N){
    var pts=[];
    for(var i=0;i<N;i++){
      var t=(i/N)*Math.PI*2;
      pts.push({x:Rr*Math.cos(t)+e*Math.cos(3*t),y:Rr*Math.sin(t)+e*Math.sin(3*t)});
    }
    return pts;
  }
  function makeRotorPoints(rotR,N){
    var pts=[];
    for(var i=0;i<N;i++){
      var t=(i/N)*Math.PI*2;
      var r=rotR*(0.85+0.15*Math.cos(3*(t+Math.PI/2)));
      pts.push({x:r*Math.cos(t+Math.PI/2),y:r*Math.sin(t+Math.PI/2)});
    }
    return pts;
  }

  M.buildWankel=function(root){
    var Rr=2.0,ecc=0.35,depth=1.8;
    var rotR=1.35;
    var space=5.0;
    window._dvsWankelRotors=[];

    var axis=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,space+3,20),MAT.crank);
    axis.rotation.z=Math.PI/2;root.add(axis);

    for(var ri=0;ri<2;ri++){
      var rx=(ri-0.5)*space;
      var unit=new THREE.Group();unit.position.set(rx,0,0);

      var epiPts=makeEpiPoints(Rr,ecc,96);
      var epiShape=new THREE.Shape();
      epiShape.moveTo(epiPts[0].x,epiPts[0].y);
      for(var i=1;i<epiPts.length;i++) epiShape.lineTo(epiPts[i].x,epiPts[i].y);
      epiShape.closePath();

      var epiGeo=new THREE.ExtrudeGeometry(epiShape,{depth:depth,bevelEnabled:false,curveSegments:64});
      epiGeo.translate(0,0,-depth/2);

      var caseMat=new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.2,transparent:true,opacity:0.4,side:THREE.DoubleSide});
      var caseMesh=new THREE.Mesh(epiGeo,caseMat);
      unit.add(caseMesh);M.pB(caseMesh);

      for(var rb=0;rb<14;rb++){
        var ang=(rb/14)*Math.PI*2;
        var rr=Rr+0.32;
        var rib=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.35,0.22),MAT.rib);
        rib.position.set(Math.cos(ang)*rr,Math.sin(ang)*rr,depth/2+0.12);
        rib.rotation.z=ang;unit.add(rib);M.pR(rib);
      }

      var rotorPts=makeRotorPoints(rotR,120);
      var rotShape=new THREE.Shape();
      rotShape.moveTo(rotorPts[0].x,rotorPts[0].y);
      for(var j=1;j<rotorPts.length;j++) rotShape.lineTo(rotorPts[j].x,rotorPts[j].y);
      rotShape.closePath();

      var rotGeo=new THREE.ExtrudeGeometry(rotShape,{depth:depth*0.7,bevelEnabled:false,curveSegments:32});
      rotGeo.translate(0,0,-depth*0.35);
      var rotorMesh=new THREE.Mesh(rotGeo,MAT.piston);
      unit.add(rotorMesh);

      for(var v=0;v<3;v++){
        var vAng=v*(Math.PI*2/3)+Math.PI/2;
        var seal=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.95,10),MAT.rib);
        seal.rotation.x=Math.PI/2;
        seal.position.set(Math.cos(vAng)*rotR,Math.sin(vAng)*rotR,0);
        rotorMesh.add(seal);
      }
      var hub=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.95,20),MAT.rib);
      hub.rotation.x=Math.PI/2;rotorMesh.add(hub);

      var inPipe=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,0.9,12),MAT.intake);
      inPipe.rotation.z=Math.PI/2;inPipe.position.set(Rr+0.4,0,0);unit.add(inPipe);
      var exPipe=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,1.0,12),MAT.exhaust);
      exPipe.rotation.z=Math.PI/2;exPipe.position.set(-Rr-0.5,0,0);unit.add(exPipe);

      window._dvsWankelRotors.push({mesh:rotorMesh,ecc:ecc});
      root.add(unit);
    }

    var fw=new THREE.Group();
    var fwDisc=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.35,36),MAT.crank);
    fwDisc.rotation.z=Math.PI/2;fw.add(fwDisc);
    fw.position.set(space+2.0,0,0);root.add(fw);M.sF(fw);

    var base=new THREE.Mesh(new THREE.BoxGeometry(space+2.5,0.4,5.0),MAT.pan);
    base.position.y=-2.3;root.add(base);
  };

  /* ==================== ГЛАВНЫЙ REBUILD ==================== */
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
    window._shahedProp=null;

    var root=new THREE.Group();scene.add(root);R.setRoot(root);

    var t=S.engineType;
    try{
      if(t==='wankel')        M.buildWankel(root);
      else if(t==='tdi')      M.buildDiesel(root,cfg);
      else if(t==='dci')      M.buildDiesel(root,cfg);
      else if(t==='mt82')     M.buildTractor(root,cfg);
      else if(t==='shahed')   M.buildShahed(root,cfg);
      else if(cfg.v)          M.buildV(root,cfg);
      else                    M.buildInline(root,cfg);
    }catch(e){console.warn('build crash:',e);}
  };

  console.log('view3d-build2.js: часть 2 (дизель/трактор/Shahed/Ванкель) загружена');
}
waitRef();
})();