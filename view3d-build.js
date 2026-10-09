(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF;
  var B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx,m=B.m,bl=B.bl;

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

  /* ====== ЭПИТРОХОИДА ВАНКЕЛЯ ====== */
  function makeEpiShape(R,e){
    var shape=new THREE.Shape();
    var steps=64;
    for(var i=0;i<=steps;i++){
      var t=(i/steps)*Math.PI*2;
      var x=R*Math.cos(t)+e*Math.cos(3*t);
      var y=R*Math.sin(t)+e*Math.sin(3*t);
      if(i===0)shape.moveTo(x,y);
      else shape.lineTo(x,y);
    }
    return shape;
  }

  /* ====== ТРЕУГОЛЬНЫЙ РОТОР ====== */
  function makeRotorMesh(rotR,depth){
    var shape=new THREE.Shape();
    var A=Math.PI*2/3;
    for(var k=0;k<3;k++){
      var ang=k*A-Math.PI/2;
      var x=Math.cos(ang)*rotR;
      var y=Math.sin(ang)*rotR;
      if(k===0)shape.moveTo(x,y);
      else shape.lineTo(x,y);
    }
    shape.closePath();
    var geo=new THREE.ExtrudeGeometry(shape,{depth:depth,bevelEnabled:false});
    geo.center();
    return new THREE.Mesh(geo,m(0xd8e0e8,0.9,0.25));
  }

  /* ====== СБОРКА ВАНКЕЛЯ (Mazda RX-8) ====== */
  function buildWankel(root,cfg){
    var perRotor=1;
    var R=1.8;        // радиус корпуса
    var e=0.35;       // эксцентриситет
    var depth=1.4;    // толщина корпуса
    var rotR=1.1;     // радиус ротора
    var rotorSpace=4.2; // расстояние между роторами

    /* ОСНОВАНИЕ */
    var base=bx(4.5,0.6,5.5,0x2a3340,0.7,0.5);
    base.position.y=-1.8;
    root.add(base);

    /* 2 РОТОРА */
    var rotors=[];
    for(var i=0;i<2;i++){
      var rx=(i-0.5)*rotorSpace;
      var rg=new THREE.Group();
      rg.position.set(rx,0,0);

      /* Эпитрохоидальный корпус */
      var epiShape=makeEpiShape(R,e);
      var epiGeo=new THREE.ExtrudeGeometry(epiShape,{depth:depth,bevelEnabled:false});
      epiGeo.center();
      var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({
        color:0x5a6878,metalness:0.85,roughness:0.3,transparent:true,opacity:0.55,side:THREE.DoubleSide
      }));
      rg.add(caseMesh);
      R.pushBlock(caseMesh);

      /* Обод корпуса (тонкий слой) */
      var rimMesh=new THREE.Mesh(epiGeo.clone(),m(0x3a4654,0.9,0.3));
      rimMesh.scale.set(1.08,1.08,1.08);
      rg.add(rimMesh);

      /* РОТОР ВНУТРИ (треугольник) */
      var rotorMesh=makeRotorMesh(rotR,depth*0.75);
      rg.add(rotorMesh);
      rotors.push(rotorMesh);

      /* Втулка в центре ротора */
      var hub=cy(0.4,0.4,16,0x2a333f,0.9,0.3);
      hub.rotation.x=Math.PI/2;
      rg.add(hub);

      /* Свеча зажигания сверху */
      var spark=cy(0.15,0.7,10,0xe8e4dc,0.3,0.5);
      spark.position.set(0,R+e,0);
      rg.add(spark);
      var sparkMetal=cy(0.2,0.4,10,0x8a95a3,0.9,0.3);
      sparkMetal.position.set(0,R+e-0.4,0);
      rg.add(sparkMetal);

      /* Впускное окно справа */
      var inPort=bx(0.7,0.8,0.4,0x1d2530,0.7,0.4);
      inPort.position.set(R-0.1,0,0);
      rg.add(inPort);
      /* Выпускное окно слева */
      var exPort=bx(0.7,0.8,0.4,0x1d2530,0.7,0.4);
      exPort.position.set(-R+0.1,0,0);
      rg.add(exPort);

      /* Рёбра охлаждения сбоку */
      for(var rb=0;rb<6;rb++){
        var rib=bx(0.1,1.2,0.15,0x2a3340,0.6,0.6);
        rib.position.set(rx+ (rb-2.5)*0.15, 0, depth/2 + 0.2);
        root.add(rib);
        R.pushRib(rib);
      }

      root.add(rg);

      /* Сохраняем ротор для анимации */
      if(!R.setAsm)continue;
    }

    /* МАХОВИК */
    var fw=new THREE.Group();
    var fwR=1.2;
    var fwD=cy(fwR,0.35,24,0x8a95a3,0.9,0.3);
    fwD.rotation.x=Math.PI/2;
    fw.add(fwD);
    for(var ft=0;ft<20;ft++){
      var th=bx(0.25,0.2,0.1,0x6a7685,0.9,0.3);
      var a=(ft/20)*Math.PI*2;
      th.position.set(Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1),0);
      th.rotation.z=-a;
      fw.add(th);
    }
    fw.position.set(rotorSpace+1.2,0,0);
    root.add(fw);
    R.setFly(fw);

    /* ВЫПУСКНОЙ КОЛЛЕКТОР */
    var col=bx(4,0.5,0.5,0x3a2a1a,0.8,0.5);
    col.position.set(0,-R-0.6,-1);
    root.add(col);

    /* Вспомогательный объект для передачи роторов в анимацию */
    window._wankelRotors=[];
    for(var ri=0;ri<rotors.length;ri++){
      window._wankelRotors.push({mesh:rotors[ri],ecc:0.35,phase:ri*Math.PI/3});
    }
  }

  /* ====== ОБЫЧНЫЙ ДВИГАТЕЛЬ ====== */
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
    root.add(cg);R.setCrank(cg);
    var fw=new THREE.Group();var fwR=isV?2.4:2.2;
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.7,0.6,0);root.add(fw);R.setFly(fw);
    var bt=new THREE.Group();
    var gt=cy(0.9,0.4,20,0x8a95a3,0.9,0.3);gt.rotation.z=Math.PI/2;bt.add(gt);
    for(var gtt=0;gtt<16;gtt++){
      var tg=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a2=(gtt/16)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.95,Math.sin(a2)*0.95);tg.rotation.x=-a2;bt.add(tg);
    }
    bt.position.set(-blockLen/2-0.7,6.2,0);root.add(bt);R.setBeltT(bt);
    var bb=new THREE.Group();
    var gb=cy(1.3,0.4,20,0x8a95a3,0.9,0.3);gb.rotation.z=Math.PI/2;bb.add(gb);
    for(var gbt=0;gbt<22;gbt++){
      var tg2=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a3=(gbt/22)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.35,Math.sin(a3)*1.35);tg2.rotation.x=-a3;bb.add(tg2);
    }
    bb.position.set(-blockLen/2-0.7,0.6,0);root.add(bb);R.setBeltB(bb);
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
    cs.position.y=6.4;root.add(cs);R.setCam(cs);R.setCams(camArr);
    if(isV){
      var angV=Math.PI/6;
      for(var side=0;side<2;side++){
        var sign=side===0?-1:1;
        var bk=bx(blockLen,5,2.6,0x4a5566,0.85,0.4);
        bk.position.set(0,3.4,sign*1.6);bk.rotation.x=sign*angV;root.add(bk);R.pushBlock(bk);
        for(var rr=0;rr<7;rr++){
          var rb=bx(blockLen+0.05,0.06,2.65,0x2a3340,0.6,0.6);
          rb.position.set(0,1.2+rr*0.55,sign*1.6);rb.rotation.x=sign*angV;root.add(rb);R.pushRib(rb);
        }
        var hd=bx(blockLen+0.2,1.4,2.8,0x3a4756,0.85,0.35);
        hd.position.set(0,6.4,sign*2.6);hd.rotation.x=sign*angV;root.add(hd);R.pushHead(hd);
        var cv=bx(blockLen,0.8,2.5,0x2a3340,0.75,0.4);
        cv.position.set(0,7.5,sign*3.1);cv.rotation.x=sign*angV;root.add(cv);R.pushCover(cv);
      }
    } else {
      var bk2=bx(blockLen,5,5,0x4a5566,0.85,0.4);
      bk2.position.y=3.4;root.add(bk2);R.pushBlock(bk2);
      for(var rr2=0;rr2<9;rr2++){
        var rb2=bx(blockLen+0.05,0.06,5.05,0x2a3340,0.6,0.6);
        rb2.position.y=1.2+rr2*0.55;root.add(rb2);R.pushRib(rb2);
      }
      var hd2=bx(blockLen+0.2,1.4,5.3,0x3a4756,0.85,0.35);
      hd2.position.y=6.4;root.add(hd2);R.pushHead(hd2);
      var cv2=bx(blockLen,0.8,5,0x2a3340,0.75,0.4);
      cv2.position.y=7.5;root.add(cv2);R.pushCover(cv2);
    }
    for(var b=0;b<perRow+1;b++){
      var bxx=-totalWidth/2+b*(totalWidth/perRow);
      if(!isV){
        for(var sg=-1;sg<=1;sg+=2){
          var bo=bl(0.16);bo.position.set(bxx,7.95,sg*2.4);root.add(bo);
        }
      } else {
        for(var sd=0;sd<2;sd++){
          var sg2=sd===0?-1:1;
          var bo2=bl(0.16);bo2.position.set(bxx,7.9,sg2*3.3);root.add(bo2);
        }
      }
    }
    var arr=[];
    if(!isV){
      for(var i=0;i<perRow;i++){
        var xx=-totalWidth/2+spacing/2+i*spacing;
        var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.15,h:4.6,diesel:cfg.diesel,off:i*Math.PI});
        root.add(a4.g);arr.push(a4);
      }
    } else {
      var angV2=Math.PI/6;
      for(var s2=0;s2<2;s2++){
        var sg3=s2===0?-1:1;
        for(var j=0;j<perRow;j++){
          var xx2=-totalWidth/2+spacing/2+j*spacing;
          var off2=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
          var a5=makeCylAss({x:xx2,y:1.1,z:sg3*2.1,r:1.15,h:4.6,diesel:cfg.diesel,off:off2});
          a5.g.rotation.x=sg3*angV2;root.add(a5.g);arr.push(a5);
        }
      }
    }
    R.setAsm(arr);
    var col=cfg.tractor?0x3a2a1a:0x4a3a2a;
    for(var e=0;e<perRow;e++){
      var ex=-totalWidth/2+spacing/2+e*spacing;
      var pp=cy(0.24,1.4,10,col,0.8,0.5);pp.position.set(ex,8.2,isV?-3.5:-2.6);root.add(pp);
    }
    var mp=cy(0.34,blockLen,16,col,0.8,0.5);mp.rotation.z=Math.PI/2;mp.position.set(0,8.9,isV?-3.5:-2.6);root.add(mp);
    if(cfg.diesel){
      var pump=bx(1.8,1.4,1.6,0x3a4654,0.85,0.4);pump.position.set(-blockLen/2-0.4,8.5,isV?2.8:1.8);root.add(pump);
      var pg=cy(0.6,0.3,16,0x8a95a3,0.9,0.3);pg.rotation.z=Math.PI/2;pg.position.set(-blockLen/2-0.4,8.5,isV?3.9:2.9);root.add(pg);
      if(cfg.turbo){
        var tg3=new THREE.Group();
        var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);tb.rotation.z=Math.PI/2;tg3.add(tb);
        var sp=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,20),m(0x6a7685,0.9,0.3));
        sp.rotation.y=Math.PI/2;tg3.add(sp);
        tg3.position.set(blockLen/2-0.8,8.2,isV?3.5:2.6);root.add(tg3);
      }
      if(cfg.tractor){
        var st=cy(0.35,3.2,12,0x2a2a2a,0.5,0.7);st.position.set(blockLen/2-0.8,10.5,isV?3:2.6);root.add(st);
        var cp=cy(0.45,0.3,12,0x1a1a1a,0.5,0.7);cp.position.set(blockLen/2-0.8,12.2,isV?3:2.6);root.add(cp);
      }
    }
  }

  /* ====== ЗАПУСК ПЕРЕСБОРКИ ====== */
  window.DVS_3D_REBUILD=function(){
    var scene=R.getScene();
    if(!scene)return;
    var cfg=R.getCfg(S.engineType);
    var old=R.getRoot();
    if(old)scene.remove(old);
    var root=new THREE.Group();
    scene.add(root);
    R.setRoot(root);
    R.clearAll();
    window._wankelRotors=[];
    if(S.engineType==='mt82')buildMTZPlaceholder(root,cfg);
    else if(S.engineType==='wankel')buildWankel(root,cfg);
    else buildNormal(root,cfg);
  };

  /* Заглушка для МТЗ — использует обычную сборку, если buildMTZ не определено */
  function buildMTZPlaceholder(root,cfg){
    if(typeof buildMTZReal==='function'){buildMTZReal(root,cfg);return;}
    buildNormal(root,cfg);
  }
}
waitRef();
})();