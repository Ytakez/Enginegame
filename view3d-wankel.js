(function(){
"use strict";
var W=window.DVS_3D_WANKEL=window.DVS_3D_WANKEL||{};

function makeEpiShape(Rr,e){
  var pts=[];
  for(var i=0;i<=96;i++){
    var t=(i/96)*Math.PI*2;
    pts.push(new THREE.Vector2(
      Rr*Math.cos(t)+e*Math.cos(3*t),
      Rr*Math.sin(t)+e*Math.sin(3*t)
    ));
  }
  return new THREE.Shape(pts);
}

function makeRotorShape(rotR){
  var sh=new THREE.Shape();
  for(var k=0;k<3;k++){
    var a=k*(Math.PI*2/3)-Math.PI/2;
    var x=Math.cos(a)*rotR, y=Math.sin(a)*rotR;
    if(k===0)sh.moveTo(x,y);else sh.lineTo(x,y);
  }
  sh.closePath();
  return sh;
}

W.build=function(root,cfg){
  var Rr=2.0, e=0.4, depth=1.6, rotR=1.15, space=5.0;
  var cy=window.DVS_3D_BUILD.cy;
  var bx=window.DVS_3D_BUILD.bx;
  var m=window.DVS_3D_BUILD.m;

  /* ПОДДОН */
  var base=bx(space+2.5,0.6,5.5,0x2a3340,0.7,0.5);
  base.position.y=-2.2;root.add(base);

  window._wankelRotors=[];
  window._wankelFlashes=[];

  for(var ri=0;ri<2;ri++){
    var rx=(ri-0.5)*space;
    var unit=new THREE.Group();
    unit.position.set(rx,0,0);

    /* КОРПУС (полупрозрачный) */
    var epiShape=makeEpiShape(Rr,e);
    var epiGeo=new THREE.ExtrudeGeometry(epiShape,{depth:depth,bevelEnabled:false,curveSegments:64});
    epiGeo.center();
    var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({
      color:0x8894a2,metalness:0.92,roughness:0.2,
      transparent:true,opacity:0.35,side:THREE.DoubleSide
    }));
    unit.add(caseMesh);
    if(window.DVS_3D_REF&&window.DVS_3D_REF.pushBlock)window.DVS_3D_REF.pushBlock(caseMesh);

    /* ЗАДНЯЯ ПЛАСТИНА (тёмная) */
    var backShape=makeEpiShape(Rr*0.98,e*0.98);
    var backGeo=new THREE.ExtrudeGeometry(backShape,{depth:0.1,bevelEnabled:false,curveSegments:64});
    backGeo.center();
    var backMesh=new THREE.Mesh(backGeo,m(0x1a232e,0.8,0.5));
    backMesh.position.z=-depth/2-0.1;
    unit.add(backMesh);

    /* РЁБРА ОХЛАЖДЕНИЯ — 16 по кругу */
    for(var rb=0;rb<16;rb++){
      var ang=(rb/16)*Math.PI*2;
      var rr=Rr+0.35;
      var rib=bx(0.14,0.5,0.25,0x2a3340,0.7,0.5);
      rib.position.set(Math.cos(ang)*rr,Math.sin(ang)*rr,depth/2+0.18);
      rib.rotation.z=ang;
      unit.add(rib);
      if(window.DVS_3D_REF&&window.DVS_3D_REF.pushRib)window.DVS_3D_REF.pushRib(rib);
      var rib2=bx(0.14,0.5,0.25,0x2a3340,0.7,0.5);
      rib2.position.set(Math.cos(ang)*rr,Math.sin(ang)*rr,-depth/2-0.18);
      rib2.rotation.z=ang;
      unit.add(rib2);
    }

    /* РОТОР */
    var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.75,bevelEnabled:false});
    rotGeo.center();
    var rotorMesh=new THREE.Mesh(rotGeo,m(0xdde5ee,0.95,0.15));
    unit.add(rotorMesh);

    /* УПЛОТНЕНИЯ НА 3 ВЕРШИНАХ */
    for(var v=0;v<3;v++){
      var va=v*(Math.PI*2/3)-Math.PI/2;
      var seal=cy(0.13,0.75,10,0x1a232e,0.9,0.25);
      seal.rotation.x=Math.PI/2;
      seal.position.set(Math.cos(va)*rotR,Math.sin(va)*rotR,0);
      rotorMesh.add(seal);
      /* Блик на уплотнении */
      var shine=cy(0.05,0.75,6,0xc8d4e0,0.95,0.1);
      shine.rotation.x=Math.PI/2;
      shine.position.set(Math.cos(va)*(rotR-0.15),Math.sin(va)*(rotR-0.15),0);
      rotorMesh.add(shine);
    }

    /* ЦЕНТРАЛЬНАЯ ВТУЛКА */
    var hub=cy(0.5,0.9,20,0x1a232e,0.9,0.3);
    hub.rotation.x=Math.PI/2;
    rotorMesh.add(hub);
    var hubRing=new THREE.Mesh(new THREE.TorusGeometry(0.65,0.06,8,20),m(0x8a95a3,0.95,0.2));
    hubRing.rotation.x=Math.PI/2;
    rotorMesh.add(hubRing);

    /* 2 СВЕЧИ СВЕРХУ */
    for(var s=0;s<2;s++){
      var sAng=Math.PI/2+(s===0?-0.55:0.55);
      var sX=Math.cos(sAng)*(Rr+e);
      var sY=Math.sin(sAng)*(Rr+e);
      var sGrp=new THREE.Group();
      sGrp.position.set(sX*0.95,sY*0.95,0);
      sGrp.rotation.z=sAng-Math.PI/2;
      /* Металл */
      var sm=cy(0.18,0.5,10,0x8a95a3,0.9,0.3);
      sm.position.y=0.25;
      sGrp.add(sm);
      /* Керамика */
      var sc=cy(0.13,0.5,10,0xe8e4dc,0.3,0.5);
      sc.position.y=0.75;
      sGrp.add(sc);
      /* Электрод */
      var st=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),
        new THREE.MeshStandardMaterial({color:0xfff6c0,emissive:0xfff6c0,emissiveIntensity:0.8}));
      st.position.y=0.0;
      sGrp.add(st);
      unit.add(sGrp);

      /* ВСПЫШКА */
      var flash=new THREE.Mesh(
        new THREE.SphereGeometry(0.6,14,14),
        new THREE.MeshBasicMaterial({color:0xffaa30,transparent:true,opacity:0,blending:THREE.AdditiveBlending})
      );
      flash.position.set(sX*0.6,sY*0.6,0);
      unit.add(flash);
      var light=new THREE.PointLight(0xffaa30,0,6);
      light.position.copy(flash.position);
      unit.add(light);

      window._wankelFlashes.push({
        mesh:flash,light:light,rotor:ri,
        phase:s*Math.PI+ri*Math.PI/3
      });
    }

    /* ВПУСКНОЙ ПАТРУБОК */
    var inPipe=new THREE.Group();
    var inCyl=cy(0.35,0.9,12,0x3a4654,0.85,0.4);
    inCyl.rotation.z=Math.PI/2;
    inPipe.add(inCyl);
    var inTip=new THREE.Mesh(new THREE.TorusGeometry(0.36,0.06,8,16),m(0x8a95a3,0.9,0.3));
    inTip.rotation.y=Math.PI/2;
    inTip.position.x=0.45;
    inPipe.add(inTip);
    inPipe.position.set(Rr+0.5,0,0);
    unit.add(inPipe);

    /* ВЫПУСКНОЙ ПАТРУБОК */
    var exPipe=new THREE.Group();
    var exCyl=cy(0.42,1.0,12,0x2a2a2a,0.7,0.5);
    exCyl.rotation.z=Math.PI/2;
    exPipe.add(exCyl);
    exPipe.position.set(-Rr-0.55,0,0);
    unit.add(exPipe);

    /* Сохраняем для анимации */
    window._wankelRotors.push({
      mesh:rotorMesh,
      ecc:e,
      phase:ri*Math.PI/3
    });

    root.add(unit);
  }

  /* ЭКСЦЕНТРИКОВЫЙ ВАЛ */
  var shaft=new THREE.Group();
  var mainShaft=cy(0.32,space+3,16,0xc8d4e0,0.95,0.2);
  mainShaft.rotation.z=Math.PI/2;
  shaft.add(mainShaft);
  for(var sh=0;sh<2;sh++){
    var shX=(sh-0.5)*space;
    var pin=cy(0.5,0.75,16,0xe8eff6,0.95,0.15);
    pin.rotation.z=Math.PI/2;
    pin.position.set(shX,0,0);
    shaft.add(pin);
  }
  root.add(shaft);
  if(window.DVS_3D_REF&&window.DVS_3D_REF.setCrank)window.DVS_3D_REF.setCrank(shaft);

  /* МАХОВИК */
  var fw=new THREE.Group();
  var fwR=1.6;
  var fwD=cy(fwR,0.5,28,0x8a95a3,0.92,0.28);
  fwD.rotation.x=Math.PI/2;
  fw.add(fwD);
  for(var ft=0;ft<28;ft++){
    var tooth=bx(0.22,0.18,0.25,0x6a7685,0.9,0.3);
    var ta=(ft/28)*Math.PI*2;
    tooth.position.set(Math.cos(ta)*(fwR+0.08),Math.sin(ta)*(fwR+0.08),0);
    tooth.rotation.z=-ta;
    fw.add(tooth);
  }
  var fwHub=cy(0.4,0.6,16,0x1a232e,0.9,0.3);
  fwHub.rotation.x=Math.PI/2;
  fw.add(fwHub);
  fw.position.set(space+2.0,0,0);
  root.add(fw);
  if(window.DVS_3D_REF&&window.DVS_3D_REF.setFly)window.DVS_3D_REF.setFly(fw);

  /* ВЫПУСКНОЙ КОЛЛЕКТОР */
  var col=bx(space+1.5,0.5,0.6,0x3a2a1a,0.85,0.4);
  col.position.set(0,-Rr-1.0,-0.5);
  root.add(col);

  /* ОТДЕЛЬНЫЙ ТИК ДЛЯ ВСПЫШЕК */
  if(!window._wankelTick){
    window._wankelTick=function(){
      var ang=S.crankAngle||0;
      var fl=window._wankelFlashes||[];
      for(var i=0;i<fl.length;i++){
        var f=fl[i];
        var cycle=((ang*1.5+f.phase)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
        var intensity=Math.max(0,1-Math.abs(cycle-Math.PI)*1.8);
        if(intensity<0)intensity=0;
        f.mesh.material.opacity=intensity*0.85;
        f.light.intensity=intensity*4;
        var scale=0.4+intensity*0.9;
        f.mesh.scale.set(scale,scale,scale);
      }
      requestAnimationFrame(window._wankelTick);
    };
    requestAnimationFrame(window._wankelTick);
  }
};

})();