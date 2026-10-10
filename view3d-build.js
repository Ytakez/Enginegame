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
  function sCam(x){if(R.setCam)R.setCam(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  var PY_MEAN = 2.9;

  var MAT = {
    blockG:  new THREE.MeshStandardMaterial({color:0x9ab0c4,metalness:0.5,roughness:0.2,transparent:true,opacity:0.25,side:THREE.DoubleSide,depthWrite:false}),
    blockGD: new THREE.MeshStandardMaterial({color:0x8a9098,metalness:0.5,roughness:0.25,transparent:true,opacity:0.27,side:THREE.DoubleSide,depthWrite:false}),
    head:    new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.25}),
    headD:   new THREE.MeshStandardMaterial({color:0x5a5a5a,metalness:0.85,roughness:0.35}),
    cover:   new THREE.MeshStandardMaterial({color:0x2a3038,metalness:0.7,roughness:0.5}),
    pan:     new THREE.MeshStandardMaterial({color:0x1e242c,metalness:0.7,roughness:0.5}),
    rib:     new THREE.MeshStandardMaterial({color:0x1a1f26,metalness:0.6,roughness:0.6}),
    piston:  new THREE.MeshStandardMaterial({color:0xf0f4f8,metalness:0.95,roughness:0.1,emissive:0x778899,emissiveIntensity:0.45}),
    rod:     new THREE.MeshStandardMaterial({color:0xc8d4e0,metalness:0.9,roughness:0.25}),
    crank:   new THREE.MeshStandardMaterial({color:0xc8d4e0,metalness:0.95,roughness:0.2}),
    chrome:  new THREE.MeshStandardMaterial({color:0xe8f0f8,metalness:0.98,roughness:0.08}),
    intake:  new THREE.MeshStandardMaterial({color:0x3a4654,metalness:0.85,roughness:0.4}),
    exhaust: new THREE.MeshStandardMaterial({color:0x4a3a2a,metalness:0.85,roughness:0.5}),
    turbo:   new THREE.MeshStandardMaterial({color:0x4a5566,metalness:0.85,roughness:0.4})
  };

  function bolt(x,y,z,r){
    var b=new THREE.Mesh(new THREE.CylinderGeometry(r||0.06,r*2,6),MAT.chrome);
    b.rotation.z=Math.PI/2;b.position.set(x,y,z);return b;
  }

  function makePiston(x,centerY,z,r,off){
    var g=new THREE.Group();
    g.position.set(x,centerY-PY_MEAN,z);
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

  /* Распредвал без шкивов — только вал с кулачками */
  function makeCamshaft(root,blockLen,perRow,totalWidth,camY){
    var cam=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,blockLen+0.4,16),MAT.crank);
    cam.rotation.z=Math.PI/2;
    cam.position.set(0,camY,0);
    root.add(cam);sCam(cam);

    for(var cc=0;cc<perRow*2;cc++){
      var cg2=new THREE.Group();
      var cd=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,0.26,16),MAT.head);
      cd.rotation.z=Math.PI/2;cg2.add(cd);
      var nb=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.28,10),MAT.rib);
      nb.rotation.z=Math.PI/2;nb.position.y=0.30;cg2.add(nb);
      var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/Math.max(1,perRow*2-1);
      cg2.position.set(cx2,0,0);
      cam.add(cg2);
    }
  }

  /* R4 */
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

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockG);
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<8;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,blockD+0.04),MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/7;root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.1,blockD+0.1),MAT.head);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+0.9;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.6,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    /* Болты на крышке */
    for(var b=0;b<=n;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/n;
      root.add(bolt(bx2,covY+0.4,-(blockD/2-0.7),0.055));
      root.add(bolt(bx2,covY+0.4,(blockD/2-0.7),0.055));
    }

    /* Распредвал внутри головки */
    makeCamshaft(root,blockLen,n,totalWidth,headY-0.3);

    /* Впускной коллектор с патрубками */
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,blockLen*0.9,14),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.2,blockD/2+0.35);root.add(inMan);

    for(var ip=0;ip<n;ip++){
      var ipx=-totalWidth/2+spacing/2+ip*spacing;
      var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.5,10),MAT.intake);
      pipe.position.set(ipx,headY+0.2,blockD/2+0.65);
      pipe.rotation.x=Math.PI/2;
      root.add(pipe);
    }

    /* Выпускной коллектор */
    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockY-blockH/2-0.3,-blockD/2-0.35);root.add(exMan);

    /* Поршни */
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockY,0,1.0,i*Math.PI);
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    /* Свечи */
    for(var sp=0;sp<n;sp++){
      var spx=-totalWidth/2+spacing/2+sp*spacing;
      var plug=new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.10,0.35,10),MAT.chrome);
      plug.position.set(spx,headY+0.35,-0.5);root.add(plug);
      var plugTop=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.15,8),MAT.rib);
      plugTop.position.set(spx,headY+0.6,-0.5);root.add(plugTop);
    }
  }

  /* V */
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
      var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,2.6),MAT.blockG);
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);

      for(var rr=0;rr<6;rr++){
        var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,2.65),MAT.rib);
        rb.position.set(0,blockY-blockH/2+0.4+rr*(blockH-0.8)/5,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }

      var headY=blockY+blockH/2+0.5;
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.0,2.8),MAT.head);
      hd.position.set(0,headY,sign*(bankDist+1.3));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);

      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.55,2.6),MAT.cover);
      cv.position.set(0,headY+0.85,sign*(bankDist+1.5));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);

      /* Болты */
      for(var b2=0;b2<=perRow;b2++){
        var bx3=-blockLen/2+0.5+b2*(blockLen-1)/perRow;
        root.add(bolt(bx3,headY+1.15,sign*(bankDist+1.85),0.05));
      }

      /* Распредвал каждого ряда */
      var cam=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,blockLen+0.3,14),MAT.crank);
      cam.rotation.z=Math.PI/2;
      cam.rotation.x=sign*half;
      cam.position.set(0,headY-0.3,sign*(bankDist+0.9));
      root.add(cam);sCam(cam);

      /* Впуск с патрубками */
      var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,blockLen*0.9,12),MAT.intake);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,headY+0.3,sign*(bankDist+2.3));root.add(inMan);

      for(var ip=0;ip<perRow;ip++){
        var ipx=-totalWidth/2+spacing/2+ip*spacing;
        var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.5,10),MAT.intake);
        pipe.position.set(ipx,headY+0.3,sign*(bankDist+2.55));
        pipe.rotation.x=Math.PI/2;
        root.add(pipe);
      }

      /* Выпуск */
      var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.33,blockLen*0.9,12),MAT.exhaust);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.6,sign*0.4);root.add(exMan);
    }

    /* Поршни */
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

  /* Дизель R4 */
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

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockGD);
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<8;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.04,0.05,blockD+0.04),MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/7;root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.15,1.1,blockD+0.1),MAT.headD);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+0.9;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.6,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    /* Болты */
    for(var b=0;b<=n;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/n;
      root.add(bolt(bx2,covY+0.4,-(blockD/2-0.7),0.055));
      root.add(bolt(bx2,covY+0.4,(blockD/2-0.7),0.055));
    }

    /* Распредвал */
    makeCamshaft(root,blockLen,n,totalWidth,headY-0.3);

    /* Впуск */
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,blockLen*0.9,14),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.2,blockD/2+0.35);root.add(inMan);

    for(var ip=0;ip<n;ip++){
      var ipx=-totalWidth/2+spacing/2+ip*spacing;
      var pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.5,10),MAT.intake);
      pipe.position.set(ipx,headY+0.2,blockD/2+0.65);
      pipe.rotation.x=Math.PI/2;
      root.add(pipe);
    }

    /* Выпуск */
    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockY-blockH/2-0.3,-blockD/2-0.35);root.add(exMan);

    /* Турбина с улиткой */
    var turbo=new THREE.Group();
    var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.65,20),MAT.turbo);
    tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,20),MAT.turbo);
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    var coldSide=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.5,16),MAT.crank);
    coldSide.rotation.z=Math.PI/2;coldSide.position.set(0.6,0,0);turbo.add(coldSide);
    turbo.position.set(blockLen/2+0.35,blockY-blockH/2-0.3,-blockD/2-0.35);
    root.add(turbo);
    window._dciParts={turbo:turbo};

    /* ТНВД */
    var pump=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.4,1.6),MAT.turbo);
    pump.position.set(blockLen/2+0.5,headY+1.2,-blockD/2-0.3);root.add(pump);

    /* Rail */
    var rail=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,blockLen*0.85,14),MAT.chrome);
    rail.rotation.z=Math.PI/2;
    rail.position.set(0,headY+0.45,-blockD/2+0.2);root.add(rail);

    /* Форсунки */
    for(var t=0;t<n;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var inj=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.5,10),MAT.rib);
      inj.position.set(tx,headY+0.4,-0.5);root.add(inj);
    }

    /* Поршни */
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockY,0,1.05,i*Math.PI);
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
  }

  /* Трактор */
  function buildTractor(root,cfg){
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

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,blockH,blockD),MAT.blockGD);
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<9;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,blockD+0.05),MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1)/8;root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.7;
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.25,1.4,blockD+0.2),MAT.headD);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+1.0;
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.8,blockD-0.5),MAT.cover);
    cv.position.y=covY;root.add(cv);pC(cv);

    /* Болты */
    for(var b=0;b<=n;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/n;
      root.add(bolt(bx2,covY+0.5,-(blockD/2-0.7),0.07));
      root.add(bolt(bx2,covY+0.5,(blockD/2-0.7),0.07));
    }

    /* Распредвал */
    makeCamshaft(root,blockLen,n,totalWidth,headY-0.3);

    /* Впуск/выпуск */
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,blockLen*0.9,14),MAT.intake);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,headY+0.25,blockD/2+0.4);root.add(inMan);

    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,blockLen*0.9,14),MAT.exhaust);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,blockY-blockH/2-0.3,-blockD/2-0.4);root.add(exMan);

    /* Топливный бак */
    var tank=new THREE.Mesh(new THREE.BoxGeometry(blockLen*0.6,2.0,1.8),MAT.turbo);
    tank.position.set(-blockLen/2-1.6,2.5,0);root.add(tank);

    /* ТНВД */
    var pump=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.0,2.0),MAT.turbo);
    pump.position.set(blockLen/2+0.9,covY+0.5,blockD/2-0.3);root.add(pump);

    /* Воздушный фильтр */
    var af=new THREE.Mesh(new THREE.CylinderGeometry(0.95,0.95,2.4,18),MAT.turbo);
    af.rotation.z=Math.PI/2;
    af.position.set(-blockLen/2+1.5,covY+2.3,0);root.add(af);

    /* Выхлопная труба вверх */
    var ex=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,7.0,14),MAT.turbo);
    ex.position.set(blockLen/2-1.3,covY+3.3,0);root.add(ex);
    var exC=new THREE.Mesh(new THREE.CylinderGeometry(0.52,0.52,0.4,14),MAT.rib);
    exC.position.set(blockLen/2-1.3,covY+6.8,0);root.add(exC);

    /* Поршни */
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,blockY,0,1.25,i*Math.PI);
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
  }

  /* Ванкель */
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

  function buildWankel(root){
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
      unit.add(caseMesh);pB(caseMesh);

      for(var rb=0;rb<16;rb++){
        var ang=(rb/16)*Math.PI*2;
        var rr=Rr+0.32;
        var rib=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.35,0.22),MAT.rib);
        rib.position.set(Math.cos(ang)*rr,Math.sin(ang)*rr,depth/2+0.12);
        rib.rotation.z=ang;unit.add(rib);pR(rib);
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

      /* Свечи */
      for(var s=0;s<2;s++){
        var sAng=Math.PI/2+(s===0?-0.55:0.55