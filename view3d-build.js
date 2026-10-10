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

  /* Смещение = среднее py в анимации view3d.js (2.9) */
  var PY_MEAN = 2.9;

  var MAT_GLASS = new THREE.MeshStandardMaterial({
    color:0x9ab0c4, metalness:0.4, roughness:0.15,
    transparent:true, opacity:0.22,
    side:THREE.DoubleSide, depthWrite:false
  });
  var MAT_GLASS_D = new THREE.MeshStandardMaterial({
    color:0x8a9098, metalness:0.4, roughness:0.2,
    transparent:true, opacity:0.24,
    side:THREE.DoubleSide, depthWrite:false
  });

  var MAT = {
    head:  new THREE.MeshStandardMaterial({color:0x8894a2, metalness:0.9, roughness:0.25}),
    headD: new THREE.MeshStandardMaterial({color:0x5a5a5a, metalness:0.85, roughness:0.35}),
    cover: new THREE.MeshStandardMaterial({color:0x2a3038, metalness:0.7, roughness:0.5}),
    pan:   new THREE.MeshStandardMaterial({color:0x1e242c, metalness:0.7, roughness:0.5}),
    rib:   new THREE.MeshStandardMaterial({color:0x1a1f26, metalness:0.6, roughness:0.6}),
    piston:new THREE.MeshStandardMaterial({color:0xf0f4f8, metalness:0.95, roughness:0.1, emissive:0x778899, emissiveIntensity:0.4}),
    rod:   new THREE.MeshStandardMaterial({color:0xc8d4e0, metalness:0.9, roughness:0.25, emissive:0x445566, emissiveIntensity:0.25}),
    crank: new THREE.MeshStandardMaterial({color:0xc8d4e0, metalness:0.95, roughness:0.2}),
    chrome:new THREE.MeshStandardMaterial({color:0xe0e8f0, metalness:0.98, roughness:0.1}),
    intake:new THREE.MeshStandardMaterial({color:0x3a4654, metalness:0.85, roughness:0.4}),
    exhaust:new THREE.MeshStandardMaterial({color:0x4a3a2a, metalness:0.85, roughness:0.5}),
    turbo: new THREE.MeshStandardMaterial({color:0x4a5566, metalness:0.85, roughness:0.4}),
    belt:  new THREE.MeshStandardMaterial({color:0x1a1a1a, metalness:0.3, roughness:0.85})
  };

  function bolt(x,y,z,r){
    var b=new THREE.Mesh(new THREE.CylinderGeometry(r||0.06,r*2,6),MAT.chrome);
    b.rotation.z=Math.PI/2;
    b.position.set(x,y,z);
    return b;
  }

  /* ==================== ПОРШЕНЬ ==================== */
  /* centerY — центр блока. Группа смещена на -PY_MEAN, чтобы после
     анимации (A.p.position.y = 2.15..3.65) поршень оказался в центре блока */
  function makePiston(x,centerY,z,r,off){
    var g=new THREE.Group();
    g.position.set(x, centerY - PY_MEAN, z);

    var p=new THREE.Group();
    p.position.y=0;  /* view3d.js перезапишет */
    p.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*0.7,24),MAT.piston));
    for(var k=0;k<3;k++){
      var ring=new THREE.Mesh(new THREE.CylinderGeometry(r+0.025,r+0.025,0.05,24),MAT.rib);
      ring.position.y=r*0.22-k*r*0.18;
      p.add(ring);
    }
    var pin=new THREE.Mesh(new THREE.CylinderGeometry(r*0.14,r*0.14,r*1.05,12),MAT.rib);
    pin.rotation.z=Math.PI/2;
    p.add(pin);
    g.add(p);

    /* Шатун (его положение перезапишет view3d.js) */
    var rod=new THREE.Mesh(new THREE.BoxGeometry(r*0.26,1.8,r*0.26),MAT.rod);
    rod.position.y=-0.9;
    g.add(rod);

    return {g:g,p:p,rod:rod,off:off||0};
  }

  /* ==================== КОЛЕНВАЛ + МАХОВИК ==================== */
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
      pin.rotation.z=Math.PI/2;
      pin.position.set(cxx,Math.sin(o1)*0.55,0);
      cg.add(pin);
    }
    root.add(cg);sCr(cg);

    var fw=new THREE.Group();
    var fwD=new THREE.Mesh(new THREE.CylinderGeometry(fwR,fwR,0.4,36),MAT.crank);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<32;ft++){
      var th=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.28,0.16),MAT.rib);
      var a=(ft/32)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.12),Math.sin(a)*(fwR+0.12));
      th.rotation.x=-a;
      fw.add(th);
    }
    var fwHub=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.5,16),MAT.rib);
    fwHub.rotation.z=Math.PI/2;fw.add(fwHub);
    fw.position.set(blockLen/2+0.7,y,0);
    root.add(fw);sF(fw);
  }

  /* ==================== ГРМ + ШКИВЫ + РАСПРЕДВАЛ ==================== */
  function makeBeltsAndCams(root,blockLen,totalWidth,perRow,yTop,yBot,camY){
    var bt=new THREE.Group();
    bt.add(new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.85,0.4,24),MAT.crank));
    for(var gtt=0;gtt<20;gtt++){
      var tg=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.18,0.14),MAT.rib);
      var a2=(gtt/20)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.9,Math.sin(a2)*0.9);
      tg.rotation.x=-a2;bt.add(tg);
    }
    bt.rotation.z=Math.PI/2;
    bt.position.set(-blockLen/2-0.7,yTop,0);
    root.add(bt);sCam(bt);

    var bb=new THREE.Group();
    bb.add(new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,0.4,28),MAT.crank));
    for(var gbt=0;gbt<24;gbt++){
      var tg2=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.18,0.14),MAT.rib);
      var a3=(gbt/24)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.2,Math.sin(a3)*1.2);
      tg2.rotation.x=-a3;bb.add(tg2);
    }
    bb.rotation.z=Math.PI/2;
    bb.position.set(-blockLen/2-0.7,yBot,0);
    root.add(bb);

    var belt=new THREE.Mesh(new THREE.BoxGeometry(0.18,Math.abs(yTop-yBot)+1.0,0.6),MAT.belt);
    belt.position.set(-blockLen/2-0.7,(yTop+yBot)/2,0);
    root.add(belt);

    var cam=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,blockLen+0.5,18),MAT.crank);
    cam.rotation.z=Math.PI/2;
    cam.position.set(0,camY,0);
    root.add(cam);sCam(cam);

    var camArr=[];
    for(var cc=0;cc<perRow*2;cc++){
      var cg2=new THREE.Group();
      var cd=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.28,18),MAT.head);
      cd.rotation.z=Math.PI/2;cg2.add(cd);
      var nb=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.30,10),MAT.rib);
      nb.rotation.z=Math.PI/2;nb.position.y=0.32;cg2.add(nb);
      var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/Math.max(1,perRow*2-1);
      cg2.position.set(cx2,0,0);
      cam.add(cg2);
      camArr.push({grp:cg2,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
    }
    sC(camArr);
  }

  /* ==================== РЯДНАЯ ЧЕТВЁРКА ==================== */
  function buildInline(root,cfg){
    var n=cfg.n||4;
    var spacing=2.2;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=4.5;
    var blockD=4.5;
    var blockY=3.0;   /* центр блока */

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.3,1.2,blockD+0.2),MAT.pan);
    pod.position.y=0.3;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,n,2.0);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT_GLASS);
    bk.position.y=blockY;
    root.add(bk);pB(bk);

    for(var rr=0;rr<6;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,blockD+0.04),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/5;
      root.add(rb);pR(rb);
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
    inMan.position.set(0,headY+0.2,blockD/2+0.35);
    root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockY-blockH/2-0.3,-blockD/2-0.35);
    root.add(exMan);

    /* Поршни — с centerY = blockY */
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockY,0,1.0,i*Math.PI);
      root.add(a4.g);
      arr.push(a4);
    }
    sA(arr);

    for(var sp=0;sp<n;sp++){
      var spx=-totalWidth/2+spacing/2+sp*spacing;
      var plug=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.35,10),MAT.chrome);
      plug.position.set(spx,headY+0.35,-0.5);
      root.add(plug);
    }

    makeBeltsAndCams(root,blockLen,totalWidth,n,headY,0.6,headY+0.4);
  }

  /* ==================== V-ДВИГАТЕЛЬ ==================== */
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
      var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,2.6),MAT_GLASS);
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;
      root.add(bk);pB(bk);

      for(var rr=0;rr<5;rr++){
        var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,2.65),MAT.rib);
        rb.position.set(0,blockY-blockH/2+0.5+rr*(blockH-1)/4,sign*bankDist);
        rb.rotation.x=sign*half;
        root.add(rb);pR(rb);
      }

      var headY=blockY+blockH/2+0.5;
      var headZ=sign*(bankDist+1.3);
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.0,2.8),MAT.head);
      hd.position.set(0,headY,headZ);
      hd.rotation.x=sign*half;
      root.add(hd);pH(hd);

      var covY=headY+0.85;
      var covZ=sign*(bankDist+1.5);
      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.55,2.6),MAT.cover);
      cv.position.set(0,covY,covZ);
      cv.rotation.x=sign*half;
      root.add(cv);pC(cv);

      var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,blockLen*0.9,12),MAT.intake);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,headY+0.3,sign*(bankDist+2.3));
      root.add(inMan);

      var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.33,blockLen*0.9,12),MAT.exhaust);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.6,sign*0.4);
      root.add(exMan);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makePiston(xx,blockY,sg*bankDist,0.9,off);
        a.g.rotation.x=sg*half;
        root.add(a.g);
        arr.push(a);
      }
    }
    sA(arr);

    makeBeltsAndCams(root,blockLen,totalWidth,perRow,blockY+blockH/2+0.9,0.6,blockY+blockH/2+0.9);
  }

  /* ==================== ДИЗЕЛЬ R4 ==================== */
  function buildDieselR4(root,cfg){
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

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT_GLASS_D);
    bk.position.y=blockY;
    root.add(bk);pB(bk);

    for(var rr=0;rr<6;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,blockD+0.04),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/5;
      root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.1,blockD+0.1),MAT.headD);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+0.9;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.6,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,blockLen*0.9,14),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.2,blockD/2+0.35);
    root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockY-blockH/2-0.3,-blockD/2-0.35);
    root.add(exMan);

    var turbo=new THREE.Group();
    var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.65,20),MAT.turbo);
    tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,20),MAT.turbo);
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.35,blockY-blockH/2-0.3,-blockD/2-0.35);
    root.add(turbo);
    window._dciParts={turbo:turbo};

    var pump=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.4,1.6),MAT.turbo);
    pump.position.set(blockLen/2+0.5,covY+0.3,-blockD/2-0.3);root.add(pump);

    var rail=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,blockLen*0.85,14),MAT.chrome);
    rail.rotation.z=Math.PI/2;
    rail.position.set(0,headY+0.5,-blockD/2+0.2);
    root.add(rail);

    for(var t=0;t<n;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var inj=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.5,10),MAT.rib);
      inj.position.set(tx,headY+0.4,-0.5);
      root.add(inj);
    }

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockY,0,1.05,i*Math.PI);
      root.add(a4.g);
      arr.push(a4);
    }
    sA(arr);

    makeBeltsAndCams(root,blockLen,totalWidth,n,headY,0.6,headY+0.4);
  }

  /* ==================== ТРАКТОР ==================== */
  function buildDieselTractor(root,cfg){
    var n=4;
    var spacing=2.4;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.8;
    var blockH=5.0;
    var blockD=5.4;
    var blockY=3.2;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.5,1.8,blockD+0.3),MAT.pan);
    pod.position.y=0.3;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,n,2.8);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT_GLASS_D);
    bk.position.y=blockY;
    root.add(bk);pB(bk);

    for(var rr=0;rr<7;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/6;
      root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.7;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.25,1.4,blockD+0.2),MAT.headD);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+1.0;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.8,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

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
      var a4=makePiston(xx,blockY,0,1.25,i*Math.PI);
      root.add(a4.g);
      arr.push(a4);
    }
    sA(arr);

    makeBeltsAndCams(root,blockLen,totalWidth,n,headY,0.6,headY+0.4);
  }

  /* ==================== SHAHED ==================== */
  function buildShahed(root,cfg){
    var perRow=2;
    var spacing=2.4;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.4;
    var blockH=3.0;
    var blockD=6.8;
    var blockY=2.4;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,0.9,blockD+0.3),MAT.pan);
    pod.position.y=0.3;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,1.6);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT_GLASS);
    bk.position.y=blockY;
    root.add(bk);pB(bk);

    for(var rr=0;rr<4;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.05,blockD+0.05),MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/3;
      root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.5;
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.1,1.0,1.5),MAT.head);
      hd.position.set(0,headY,sign*(blockD/2+0.7));
      root.add(hd);pH(hd);
      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.55,1.3),MAT.cover);
      cv.position.set(0,headY+0.75,sign*(blockD/2+0.8));
      root.add(cv);pC(cv);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var zz=sg*(blockD/2-1.2);
        var off=(s2===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=makePiston(xx,blockY,zz,0.85,off);
        a.g.rotation.x=sg*Math.PI/2;
        root.add(a.g);
        arr.push(a);
      }
    }
    sA(arr);

    var propGrp=new THREE.Group();
    propGrp.position.set(blockLen/2+1.8,blockY,0);
    var hub=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.6,14),MAT.turbo);
    hub.rotation.x=Math.PI/2;propGrp.add(hub);
    for(var bl=0;bl<2;bl++){
      var blade=new THREE.Mesh(new THREE.BoxGeometry(0.18,3.2,0.08),MAT.chrome);
      blade.rotation.y=bl*Math.PI/2;
      blade.rotation.x=0.35;
      propGrp.add(blade);
    }
    root.add(propGrp);
    window._shahedProp=propGrp;

    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,blockLen*0.8,12),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+1.2,0);
    root.add(inMan);

    for(var e=0;e<2;e++){
      var es=e===0?-1:1;
      var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,2.2,10),MAT.exhaust);
      pipe.position.set(-blockLen/2-0.6,blockY,es*2.0);
      pipe.rotation.x=Math.PI/2;
      root.add(pipe);
    }

    makeBeltsAndCams(root,blockLen,totalWidth,perRow,headY+1.0,0.6,headY+0.5);
  }

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