(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF;
  var B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx,m=B.m,bl=B.bl;

  function pB(x){if(R.pushBlock)R.pushBlock(x);}
  function pH(x){if(R.pushHead)R.pushHead(x);}
  function pC(x){if(R.pushCover)R.pushCover(x);}
  function pR(x){if(R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sC(x){if(R.setCams)R.setCams(x);}
  function sCam(x){if(R.setCam)R.setCam(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}
  function sBT(x){if(R.setBeltT)R.setBeltT(x);}
  function sBB(x){if(R.setBeltB)R.setBeltB(x);}

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
    for(var k=0;k<3;k++){var rg=cy(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);}
    var pin=cy(o.r*0.15,o.r*1.1,10,0x2a3543,0.9,0.3);pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);
    var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);g.add(rod);
    var ign=new THREE.Group();
    if(o.diesel){
      ign.add(cy(o.r*0.15,o.r*0.5,10,0x3a3a3a,0.7,0.4));
      var fy=cy(o.r*0.2,o.r*0.25,10,0x8a95a3,0.9,0.3);fy.position.y=-0.1;ign.add(fy);
    } else {
      ign.add(cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5));
      var mt=cy(o.r*0.17,o.r*0.25,10,0x8a95a3,0.9,0.3);mt.position.y=-0.1;ign.add(mt);
    }
    ign.position.y=o.h+0.4;g.add(ign);
    var vv=[];
    for(var s=0;s<2;s++){
      var vg=new THREE.Group();
      vg.add(cy(o.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4));
      var vs=cy(0.05,o.r*0.6,6,0xa8b4c0,0.9,0.3);vs.position.y=o.r*0.3;vg.add(vs);
      vg.position.set((s===0?-1:1)*o.r*0.4,o.h+0.05,0);g.add(vg);vv.push(vg);
    }
    return {g:g,p:p,rod:rod,vv:vv,x:o.x,y:o.y,z:o.z,h:o.h,r:o.r,off:o.off||0};
  }

  /* =========== ВАНКЕЛЬ =========== */
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

  function buildWankel(root,cfg){
    var Rr=2.0, ecc=0.4, depth=1.6, rotR=1.2, space=5.0;

    var base=bx(space+2.5,0.6,5.5,0x2a3340,0.7,0.5);
    base.position.y=-2.2;root.add(base);

    window._dvsWankelRotors=[];
    window._dvsWankelPins=[];
    window._dvsWankelFlashes=[];

    var axisMesh=new THREE.Mesh(
      new THREE.CylinderGeometry(0.28,0.28,space+3,16),
      m(0xc8d4e0,0.95,0.2)
    );
    axisMesh.rotation.z=Math.PI/2;
    root.add(axisMesh);

    for(var ri=0;ri<2;ri++){
      var rx=(ri-0.5)*space;
      var unit=new THREE.Group();
      unit.position.set(rx,0,0);

      var epiGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false,curveSegments:64});
      epiGeo.center();
      var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({
        color:0x8894a2,metalness:0.92,roughness:0.2,
        transparent:true,opacity:0.32,side:THREE.DoubleSide
      }));
      unit.add(caseMesh);pB(caseMesh);

      var backGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr*0.98,ecc*0.98),{depth:0.12,bevelEnabled:false,curveSegments:64});
      backGeo.center();
      var backMesh=new THREE.Mesh(backGeo,m(0x1a232e,0.8,0.5));
      backMesh.position.z=-depth/2-0.12;unit.add(backMesh);

      for(var rb=0;rb<16;rb++){
        var ang=(rb/16)*Math.PI*2;
        var rr=Rr+0.35;
        var ribF=bx(0.14,0.5,0.22,0x2a3340,0.7,0.5);
        ribF.position.set(Math.cos(ang)*rr,Math.sin(ang)*rr,depth/2+0.16);
        ribF.rotation.z=ang;unit.add(ribF);pR(ribF);
        var ribB=bx(0.14,0.5,0.22,0x2a3340,0.7,0.5);
        ribB.position.set(Math.cos(ang)*rr,Math.sin(ang)*rr,-depth/2-0.16);
        ribB.rotation.z=ang;unit.add(ribB);
      }

      var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.72,bevelEnabled:false});
      rotGeo.center();
      var rotorMesh=new THREE.Mesh(rotGeo,m(0xdde5ee,0.95,0.15));
      unit.add(rotorMesh);

      for(var v=0;v<3;v++){
        var va=v*(Math.PI*2/3)-Math.PI/2;
        var seal=cy(0.13,0.85,10,0x1a232e,0.9,0.25);
        seal.rotation.x=Math.PI/2;
        seal.position.set(Math.cos(va)*rotR,Math.sin(va)*rotR,0);
        rotorMesh.add(seal);
      }

      var hub=cy(0.5,0.9,20,0x1a232e,0.9,0.3);
      hub.rotation.x=Math.PI/2;rotorMesh.add(hub);
      var hubRing=new THREE.Mesh(new THREE.TorusGeometry(0.65,0.06,8,20),m(0x8a95a3,0.95,0.2));
      hubRing.rotation.x=Math.PI/2;rotorMesh.add(hubRing);

      for(var s=0;s<2;s++){
        var sAng=Math.PI/2+(s===0?-0.5:0.5);
        var sX=Math.cos(sAng)*(Rr+ecc);
        var sY=Math.sin(sAng)*(Rr+ecc);
        var sGrp=new THREE.Group();
        sGrp.position.set(sX*0.95,sY*0.95,0);
        sGrp.rotation.z=sAng-Math.PI/2;
        var sm=cy(0.18,0.5,10,0x8a95a3,0.9,0.3);sm.position.y=0.25;sGrp.add(sm);
        var sc=cy(0.13,0.5,10,0xe8e4dc,0.3,0.5);sc.position.y=0.75;sGrp.add(sc);
        var st=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),
          new THREE.MeshStandardMaterial({color:0xfff6c0,emissive:0xfff6c0,emissiveIntensity:0.8}));
        st.position.y=0;sGrp.add(st);
        unit.add(sGrp);

        var flash=new THREE.Mesh(
          new THREE.SphereGeometry(0.6,14,14),
          new THREE.MeshBasicMaterial({color:0xffaa30,transparent:true,opacity:0,blending:THREE.AdditiveBlending})
        );
        flash.position.set(sX*0.55,sY*0.55,0);
        unit.add(flash);
        var light=new THREE.PointLight(0xffaa30,0,6);
        light.position.copy(flash.position);
        unit.add(light);
        window._dvsWankelFlashes.push({mesh:flash,light:light,rotor:ri,phase:s*Math.PI});
      }

      var inPipe=cy(0.35,0.9,12,0x3a4654,0.85,0.4);
      inPipe.rotation.z=Math.PI/2;inPipe.position.set(Rr+0.5,0,0);unit.add(inPipe);
      var exPipe=cy(0.42,1.0,12,0x2a2a2a,0.7,0.5);
      exPipe.rotation.z=Math.PI/2;exPipe.position.set(-Rr-0.55,0,0);unit.add(exPipe);

      window._dvsWankelRotors.push({mesh:rotorMesh,ecc:ecc,initPhase:0});

      root.add(unit);
    }

    for(var pi=0;pi<2;pi++){
      var px=(pi-0.5)*space;
      var pinGrp=new THREE.Group();
      pinGrp.position.set(px,0,0);
      var pinMesh=cy(0.5,0.75,16,0xe8eff6,0.95,0.15);
      pinMesh.rotation.z=Math.PI/2;
      pinMesh.position.set(ecc,0,0);
      pinGrp.add(pinMesh);
      var mark=bx(0.2,0.15,0.15,0xff5b5b,0.4,0.6);
      mark.position.set(ecc,0.3,0);
      pinGrp.add(mark);
      root.add(pinGrp);
      window._dvsWankelPins.push({grp:pinGrp});
    }

    var fw=new THREE.Group();
    var fwR=1.6;
    var fwDisc=new THREE.Mesh(
      new THREE.CylinderGeometry(fwR,fwR,0.4,32),
      m(0x8a95a3,0.92,0.28)
    );
    fwDisc.rotation.z=Math.PI/2;
    fw.add(fwDisc);
    for(var ft=0;ft<28;ft++){
      var ta=(ft/28)*Math.PI*2;
      var tooth=bx(0.3,0.25,0.2,0x6a7685,0.9,0.3);
      tooth.position.set(0,Math.cos(ta)*(fwR+0.08),Math.sin(ta)*(fwR+0.08));
      tooth.rotation.x=ta;
      fw.add(tooth);
    }
    var fwMark=bx(0.4,0.5,0.3,0xff5b5b,0.4,0.6);
    fwMark.position.set(0.25,fwR*0.6,0);
    fw.add(fwMark);
    var fwHub=cy(0.35,0.6,16,0x1a232e,0.9,0.3);
    fwHub.rotation.z=Math.PI/2;
    fw.add(fwHub);
    fw.position.set(space+2.0,0,0);
    root.add(fw);
    sF(fw);

    var col=bx(space+1.5,0.5,0.6,0x3a2a1a,0.85,0.4);
    col.position.set(0,-Rr-1.0,-0.5);root.add(col);

    startWankelTick();
  }

  function startWankelTick(){
    if(window._dvsWankelTickActive)return;
    window._dvsWankelTickActive=true;
    window._dvsWankelTick=function(){
      if(S.engineType!=='wankel'){window._dvsWankelTickActive=false;return;}
      var ang=S.crankAngle||0;
      var wr=window._dvsWankelRotors||[];
      for(var i=0;i<wr.length;i++){
        var W=wr[i];
        W.mesh.rotation.z=-ang/3;
        W.mesh.position.x=Math.cos(ang)*W.ecc;
        W.mesh.position.y=Math.sin(ang)*W.ecc;
      }
      var wp=window._dvsWankelPins||[];
      for(var j=0;j<wp.length;j++){
        wp[j].grp.rotation.z=ang;
      }
      var fl=window._dvsWankelFlashes||[];
      for(var f=0;f<fl.length;f++){
        var F=fl[f];
        var cycle=((ang*1.5+F.phase)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
        var intensity=Math.max(0,1-Math.abs(cycle-Math.PI)*1.8);
        if(intensity<0)intensity=0;
        F.mesh.material.opacity=intensity*0.85;
        F.light.intensity=intensity*4;
        var sc=0.4+intensity*0.9;
        F.mesh.scale.set(sc,sc,sc);
      }
      requestAnimationFrame(window._dvsWankelTick);
    };
    requestAnimationFrame(window._dvsWankelTick);
  }

  /* =========== dCi 2.0 — турбодизель =========== */
  function buildDCI(root,cfg){
    var blockLen=4.4,blockH=1.3;

    /* Поддон */
    var pod=bx(blockLen+1.0,1.0,4.6,0x2a3340,0.7,0.5);
    pod.position.y=-1.1;root.add(pod);

    /* Блок */
    var bk=bx(blockLen,3.8,4.4,0x3a4250,0.85,0.4);
    bk.position.y=0.9;root.add(bk);pB(bk);

    /* Рёбра */
    for(var rr=0;rr<7;rr++){
      var rb=bx(blockLen+0.05,0.07,4.45,0x252c38,0.6,0.6);
      rb.position.y=-0.6+rr*0.5;root.add(rb);pR(rb);
    }

    /* Головка */
    var hd=bx(blockLen+0.2,1.2,4.6,0x3a4756,0.85,0.35);
    hd.position.y=3.2;root.add(hd);pH(hd);

    /* Клапанная крышка */
    var cv=bx(blockLen,0.7,4.4,0x2a3340,0.75,0.4);
    cv.position.y=4.0;root.add(cv);pC(cv);

    /* 4 форсунки — с характерными разъёмами */
    for(var i=0;i<4;i++){
      var cx=-blockLen/2+0.55+i*(blockLen-1.1)/3;
      var inj=cy(0.15,0.55,10,0x4a4d54,0.85,0.3);
      inj.position.set(cx,3.9,0);root.add(inj);
      var con=bx(0.25,0.18,0.2,0x2a2a2a,0.5,0.7);
      con.position.set(cx,4.25,0);root.add(con);
      var wire=cy(0.03,0.6,6,0x1a1a1a,0.3,0.8);
      wire.position.set(cx,4.55,0.15);root.add(wire);
    }

    /* COMMON RAIL — топливная рампа */
    var rail=cy(0.16,blockLen*0.85,12,0xb8bdc4,0.95,0.15);
    rail.rotation.z=Math.PI/2;
    rail.position.set(0,3.4,2.55);root.add(rail);

    /* Трубки от рампы к форсункам */
    for(var t=0;t<4;t++){
      var tx=-blockLen/2+0.55+t*(blockLen-1.1)/3;
      var tr=cy(0.04,0.55,6,0xb8bdc4,0.9,0.2);
      tr.position.set(tx,3.6,2.35);tr.rotation.x=Math.PI/2.6;
      root.add(tr);
    }

    /* ТНВД — спереди справа */
    var pump=bx(1.3,1.0,1.1,0x3a4654,0.85,0.4);
    pump.position.set(blockLen/2+0.4,3.5,1.6);root.add(pump);
    var pg=cy(0.55,0.4,16,0x8a95a3,0.9,0.3);
    pg.rotation.z=Math.PI/2;pg.position.set(blockLen/2+1.1,3.5,1.6);root.add(pg);

    /* Турбина с улиткой */
    var turbo=new THREE.Group();
    var tb=cy(0.85,0.65,20,0x4a5566,0.85,0.4);
    tb.rotation.z=Math.PI/2;turbo.add(tb);
    var sp=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,20),m(0x6a7685,0.9,0.3));
    sp.rotation.y=Math.PI/2;turbo.add(sp);
    var cool=cy(0.55,0.5,14,0x8a95a3,0.9,0.3);
    cool.rotation.z=Math.PI/2;cool.position.set(0.6,0,0);turbo.add(cool);
    var hot=cy(0.5,0.45,14,0x3a2a1a,0.85,0.5);
    hot.rotation.z=Math.PI/2;hot.position.set(-0.6,0,0);turbo.add(hot);
    turbo.position.set(-blockLen/2-0.6,3.0,-1.4);
    turbo.rotation.y=0.4;
    root.add(turbo);

    /* Интеркулер — патрубок впуска */
    var ic=bx(blockLen*0.85,0.5,0.4,0x3a4654,0.85,0.4);
    ic.position.set(0,3.8,-2.5);root.add(ic);
    var icPipe=cy(0.22,2.0,10,0x5a6578,0.7,0.5);
    icPipe.rotation.x=Math.PI/2;
    icPipe.position.set(blockLen/2-0.5,3.8,-3.4);root.add(icPipe);

    /* Впускной коллектор */
    var inMan=cy(0.3,blockLen,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,3.6,-2.2);root.add(inMan);

    /* Выпускной коллектор */
    var exMan=bx(blockLen*0.9,0.35,0.4,0x4a3a2a,0.85,0.5);
    exMan.position.set(0,-0.3,2.4);root.add(exMan);

    /* Свечи накала — 4 шт */
    for(var sg=0;sg<4;sg++){
      var sx=-blockLen/2+0.55+sg*(blockLen-1.1)/3;
      var plug=bl(0.16);
      plug.position.set(sx,4.6,1.2);root.add(plug);
    }

    /* Крышка ГРМ — спереди */
    var grm=bx(0.35,3.4,3.2,0x1a1d22,0.7,0.5);
    grm.position.set(-blockLen/2-0.45,1.2,0);root.add(grm);pC(grm);

    /* Коленвал + шейки */
    var cg=new THREE.Group();cg.position.y=0.4;
    var ax=cy(0.42,blockLen+1,20,0xa8b4c0,0.95,0.2);ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mI=0;mI<5;mI++){
      var mx=-blockLen/2+0.5+mI*(blockLen-1)/4;
      var mn=cy(0.6,0.42,16,0xb8c6d4,0.95,0.2);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var cI=0;cI<4;cI++){
      var cx2=-blockLen/2+0.85+cI*1.0;
      var o1=cI*Math.PI/2;
      var pn=new THREE.Group();
      var pinM=cy(0.32,0.5,12,0xd8e4f0,0.95,0.2);
      pinM.rotation.z=Math.PI/2;pn.add(pinM);
      pn.position.set(cx2,Math.sin(o1)*0.6,0);cg.add(pn);
    }
    root.add(cg);sCr(cg);

    /* Маховик */
    var fw=new THREE.Group();
    var fwR=2.3;
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.8,0.4,0);root.add(fw);sF(fw);

    /* Шкив ГРМ (сверху) */
    var bt=new THREE.Group();
    var gt=cy(0.9,0.4,20,0x8a95a3,0.9,0.3);gt.rotation.z=Math.PI/2;bt.add(gt);
    for(var gtt=0;gtt<16;gtt++){
      var tg=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a2=(gtt/16)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.95,Math.sin(a2)*0.95);tg.rotation.x=-a2;bt.add(tg);
    }
    bt.position.set(-blockLen/2-0.7,3.4,0);root.add(bt);sBT(bt);

    /* Шкив коленвала (снизу) */
    var bb=new THREE.Group();
    var gb=cy(1.3,0.4,20,0x8a95a3,0.9,0.3);gb.rotation.z=Math.PI/2;bb.add(gb);
    for(var gbt=0;gbt<22;gbt++){
      var tg2=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a3=(gbt/22)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.35,Math.sin(a3)*1.35);tg2.rotation.x=-a3;bb.add(tg2);
    }
    bb.position.set(-blockLen/2-0.7,0.4,0);root.add(bb);sBB(bb);

    /* Ремень ГРМ */
    var beltMat=new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.2,roughness:0.9});
    var b1=new THREE.Mesh(new THREE.BoxGeometry(0.15,3.0,0.7),beltMat);
    b1.position.set(-blockLen/2-1.5,1.9,0);root.add(b1);
    var b2=new THREE.Mesh(new THREE.BoxGeometry(0.15,3.0,1.0),beltMat);
    b2.position.set(-blockLen/2+0.1,1.9,0);root.add(b2);

    /* Распредвал */
    var cs=new THREE.Group();
    var ca=cy(0.25,blockLen+1,16,0xa8b4c0,0.95,0.2);
    ca.rotation.z=Math.PI/2;cs.add(ca);
    var camArr=[];
    for(var cc=0;cc<8;cc++){
      var cg2=new THREE.Group();
      var cd=cy(0.32,0.3,16,0x8a95a3,0.9,0.3);cd.rotation.z=Math.PI/2;cg2.add(cd);
      var nb=cy(0.13,0.3,10,0x6a7685,0.9,0.3);nb.rotation.z=Math.PI/2;nb.position.y=0.32;cg2.add(nb);
      var cx3=-blockLen/2+0.5+cc*(blockLen-1)/7;
      cg2.position.set(cx3,0,0);cs.add(cg2);
      camArr.push({grp:cg2,off:cc*Math.PI*1.5/8});
    }
    cs.position.y=4.7;root.add(cs);sCam(cs);sC(camArr);

    /* Поршни */
    var arr=[];
    for(var i2=0;i2<4;i2++){
      var xx=-blockLen/2+0.85+i2*1.0;
      var a4=makeCylAss({x:xx,y:0.9,z:0,r:1.05,h:4.2,diesel:true,off:i2*Math.PI});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    /* Выпускные трубы */
    for(var e=0;e<4;e++){
      var ex=-blockLen/2+0.85+e*1.0;
      var pp=cy(0.22,1.4,10,0x3a2a1a,0.8,0.5);
      pp.position.set(ex,0.3,3.0);root.add(pp);
    }
    var mp=cy(0.32,blockLen,16,0x3a2a1a,0.8,0.5);
    mp.rotation.z=Math.PI/2;mp.position.set(0,-0.2,3.3);root.add(mp);
  }

  /* =========== ОБЫЧНЫЙ ДВИГАТЕЛЬ =========== */
  function buildNormal(root,cfg){
    var isV=cfg.v,totalN=cfg.n;
    var perRow=isV?Math.floor(totalN/2):totalN;
    if(perRow<1)perRow=1;
    var spacing=2.2;
    var totalWidth=Math.max(perRow*spacing,2);
    var blockLen=totalWidth+1.5;
    var pod=bx(blockLen,1.2,isV?7.5:5,0x2a3340,0.7,0.5);pod.position.y=-0.6;root.add(pod);
    var cg=new THREE.Group();cg.position.y=0.6;
    var ax=cy(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);ax.rotation.z=Math.PI/2;cg.add(ax);
    var nMain=perRow+1;
    for(var mi=0;mi<nMain;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/(nMain-1);
      var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-totalWidth/2+spacing/2+ci*spacing;
      var o1=ci*Math.PI*2/perRow;
      var p1=new THREE.Group();
      var pin1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*0.55,0);cg.add(p1);
      if(isV){
        var o2=o1+Math.PI;
        var p2=new THREE.Group();
        var pin2=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);pin2.rotation.z=Math.PI/2;p2.add(pin2);
        p2.position.set(cxx,Math.sin(o2)*0.55,0);cg.add(p2);
      }
    }
    root.add(cg);sCr(cg);
    var fw=new THREE.Group();var fwR=isV?2.4:2.2;
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.7,0.6,0);root.add(fw);sF(fw);
    var bt=new THREE.Group();
    var gt=cy(0.9,0.4,20,0x8a95a3,0.9,0.3);gt.rotation.z=Math.PI/2;bt.add(gt);
    for(var gtt=0;gtt<16;gtt++){
      var tg=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a2=(gtt/16)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.95,Math.sin(a2)*0.95);tg.rotation.x=-a2;bt.add(tg);
    }
    bt.position.set(-blockLen/2-0.7,6.2,0);root.add(bt);sBT(bt);
    var bb=new THREE.Group();
    var gb=cy(1.3,0.4,20,0x8a95a3,0.9,0.3);gb.rotation.z=Math.PI/2;bb.add(gb);
    for(var gbt=0;gbt<22;gbt++){
      var tg2=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a3=(gbt/22)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.35,Math.sin(a3)*1.35);tg2.rotation.x=-a3;bb.add(tg2);
    }
    bb.position.set(-blockLen/2-0.7,0.6,0);root.add(bb);sBB(bb);
    var beltMat=new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.2,roughness:0.9});
    var b1=new THREE.Mesh(new THREE.BoxGeometry(0.15,5.6,0.7),beltMat);b1.position.set(-blockLen/2-1.5,3.4,0);root.add(b1);
    var b2=new THREE.Mesh(new THREE.BoxGeometry(0.15,5.6,1.0),beltMat);b2.position.set(-blockLen/2+0.1,3.4,0);root.add(b2);
    var cs=new THREE.Group();
    var ca=cy(0.25,blockLen+1,16,0xa8b4c0,0.95,0.2);ca.rotation.z=Math.PI/2;cs.add(ca);
    var camArr=[];
    for(var cc=0;cc<perRow*2;cc++){
      var cg2=new THREE.Group();
      var cd=cy(0.32,0.3,16,0x8a95a3,0.9,0.3);cd.rotation.z=Math.PI/2;cg2.add(cd);
      var nb=cy(0.13,0.3,10,0x6a7685,0.9,0.3);nb.rotation.z=Math.PI/2;nb.position.y=0.32;cg2.add(nb);
      var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/(perRow*2-1);
      cg2.position.set(cx2,0,0);cs.add(cg2);
      camArr.push({grp:cg2,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
    }
    cs.position.y=6.4;root.add(cs);sCam(cs);sC(camArr);
    if(isV){
      var angV=Math.PI/6;
      for(var side=0;side<2;side++){
        var sign=side===0?-1:1;
        var bk=bx(blockLen,5,2.6,0x4a5566,0.85,0.4);
        bk.position.set(0,3.4,sign*1.6);bk.rotation.x=sign*angV;root.add(bk);pB(bk);
      