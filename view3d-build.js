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

  /* Материалы */
  function matMetal(color,rough){return new THREE.MeshStandardMaterial({color:color||0xa8b4c0,metalness:0.9,roughness:rough||0.25});}
  function matDark(color){return new THREE.MeshStandardMaterial({color:color||0x2a2a2a,metalness:0.7,roughness:0.5});}
  function bolt(x,y,z,r){
    var b=new THREE.Mesh(new THREE.CylinderGeometry(r||0.06,r*2,6),matMetal(0xc8d4e0,0.2));
    b.rotation.z=Math.PI/2;
    b.position.set(x,y,z);
    return b;
  }

  /* ==================== ОДИН ПОРШЕНЬ ==================== */
  function makePiston(x,y,z,r,h,off,diesel){
    var g=new THREE.Group();
    g.position.set(x,y,z);

    var p=new THREE.Group();
    p.position.y=h*0.5;
    p.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*0.9,20),matMetal(0xd8e0e8,0.15)));
    for(var k=0;k<3;k++){
      var rg=new THREE.Mesh(new THREE.CylinderGeometry(r+0.02,r+0.02,0.06,20),matDark(0x2a333f));
      rg.position.y=r*0.3-k*r*0.2;p.add(rg);
    }
    var pin=new THREE.Mesh(new THREE.CylinderGeometry(r*0.15,r*0.15,r*1.1,10),matDark(0x2a3543));
    pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);

    var rod=new THREE.Mesh(new THREE.BoxGeometry(r*0.28,h*0.6,r*0.28),matMetal(0x8894a2,0.3));
    rod.position.y=-h*0.1;
    g.add(rod);

    var plug=new THREE.Group();
    if(diesel){
      plug.add(new THREE.Mesh(new THREE.CylinderGeometry(r*0.16,r*0.16,r*0.5,10),matDark(0x2a2a2a)));
      var cap=new THREE.Mesh(new THREE.CylinderGeometry(r*0.1,r*0.1,r*0.2,8),matDark(0x8a6a3a));
      cap.position.y=r*0.35;plug.add(cap);
    } else {
      plug.add(new THREE.Mesh(new THREE.CylinderGeometry(r*0.13,r*0.13,r*0.5,10),new THREE.MeshStandardMaterial({color:0xe8e4dc,roughness:0.5})));
    }
    plug.position.y=h*0.95;
    g.add(plug);

    return {g:g,p:p,rod:rod,x:x,y:y,z:z,h:h,r:r,off:off||0};
  }

  /* ==================== КОЛЕНВАЛ + МАХОВИК ==================== */
  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,blockLen+1,20),matMetal(0xa8b4c0,0.2));
    ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<perRow+1;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=new THREE.Mesh(new THREE.CylinderGeometry(0.48,0.48,0.35,16),matMetal(0xb8c6d4,0.2));
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var pin=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.45,12),matMetal(0xd8e4f0,0.2));
      pin.rotation.z=Math.PI/2;
      pin.position.set(cxx,Math.sin(o1)*0.5,0);
      cg.add(pin);
      var mark=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.14,0.14),new THREE.MeshStandardMaterial({color:0xff4040,roughness:0.6}));
      mark.position.set(cxx,Math.sin(o1)*0.5+0.25,0);cg.add(mark);
    }
    root.add(cg);sCr(cg);

    var fw=new THREE.Group();
    var fwD=new THREE.Mesh(new THREE.CylinderGeometry(fwR,fwR,0.35,32),matMetal(0x8a95a3,0.3));
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.25,0.12),matDark(0x6a7685));
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
      th.rotation.x=-a;fw.add(th);
    }
    var fwMark=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.45,0.25),new THREE.MeshStandardMaterial({color:0xff4040,roughness:0.6}));
    fwMark.position.set(0.2,fwR*0.55,0);fw.add(fwMark);
    fw.position.set(blockLen/2+0.7,y,0);root.add(fw);sF(fw);
  }

  /* ==================== ШКИВЫ ГРМ ==================== */
  function makeTimingBelt(root,blockLen,yTop,yBot){
    var bt=new THREE.Group();
    bt.add(new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.85,0.3,24),matMetal(0x8a95a3,0.3)));
    for(var gtt=0;gtt<24;gtt++){
      var tg=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.15,0.12),matDark(0x6a7685));
      var a2=(gtt/24)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.9,Math.sin(a2)*0.9);
      tg.rotation.x=-a2;bt.add(tg);
    }
    var m1=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.25,0.14),new THREE.MeshStandardMaterial({color:0xff4040,roughness:0.6}));
    m1.position.set(0.15,0.6,0);bt.add(m1);
    bt.rotation.z=Math.PI/2;
    bt.position.set(-blockLen/2-0.6,yTop,0);
    root.add(bt);sCam(bt);

    var bb=new THREE.Group();
    bb.add(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,0.3,28),matMetal(0x8a95a3,0.3)));
    for(var gbt=0;gbt<28;gbt++){
      var tg2=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.15,0.12),matDark(0x6a7685));
      var a3=(gbt/28)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.25,Math.sin(a3)*1.25);
      tg2.rotation.x=-a3;bb.add(tg2);
    }
    var m2=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.25,0.14),new THREE.MeshStandardMaterial({color:0xff4040,roughness:0.6}));
    m2.position.set(0.15,0.85,0);bb.add(m2);
    bb.rotation.z=Math.PI/2;
    bb.position.set(-blockLen/2-0.6,yBot,0);
    root.add(bb);

    var belt=new THREE.Mesh(
      new THREE.BoxGeometry(0.15,Math.abs(yTop-yBot)+1.2,0.7),
      new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.2,roughness:0.9})
    );
    belt.position.set(-blockLen/2-0.6,(yTop+yBot)/2,0);
    root.add(belt);
  }

  /* ==================== R4 БЕНЗИН ==================== */
  function buildInline(root,cfg){
    var perRow=cfg.n||4;
    var spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen,1.2,5),matDark(0x2a3340));
    pod.position.y=-0.6;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.2);
    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,5,5),matMetal(0x4a5566,0.4));
    bk.position.y=3.4;root.add(bk);pB(bk);
    for(var rr=0;rr<9;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.06,5.05),matDark(0x1a1a1a));
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.2,1.4,5.3),matMetal(0x5a6a7a,0.4));
    hd.position.y=6.4;root.add(hd);pH(hd);
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.8,5),matDark(0x2a3340));
    cv.position.y=7.5;root.add(cv);pC(cv);
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,blockLen*0.9,14),matMetal(0x3a4654,0.4));
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,5.8,2.5);root.add(inMan);
    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen*0.9,14),matMetal(0x4a3a2a,0.5));
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.3,-2.5);root.add(exMan);
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,2.4,0,1.1,4.0,i*Math.PI,false);
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
    makeTimingBelt(root,blockLen,7.5,0.6);
  }

  /* ==================== V-ДВИГАТЕЛЬ (V6/V12/V22) ==================== */
  function buildV(root,cfg){
    var totalN=cfg.n;
    var perRow=Math.floor(totalN/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var half=Math.PI/6;
    var bankDist=1.8;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.2,7.5),matDark(0x2a2a2a));
    pod.position.y=-0.9;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.6);

    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,5.0,2.8),matMetal(0x4a5566,0.4));
      bk.position.set(0,3.4,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);
      for(var rr=0;rr<8;rr++){
        var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.05,0.07,2.85),matDark(0x1a1a1a));
        rb.position.set(0,1.3+rr*0.55,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }
      var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.2,1.3,3.0),matMetal(0x5a6a7a,0.35));
      hd.position.set(0,6.4,sign*(bankDist+1.1));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);
      var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.8,2.7),matDark(0x2a3340));
      cv.position.set(0,7.4,sign*(bankDist+1.4));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);
      var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,blockLen*0.9,14),matMetal(0x3a4654,0.4));
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,5.9,sign*(bankDist+2.2));
      root.add(inMan);
      var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,blockLen*0.9,14),matMetal(0x4a3a2a,0.5));
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.5,sign*0.5);
      root.add(exMan);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makePiston(xx,2.4,sg*bankDist,1.0,4.2,off,false);
        a.g.rotation.x=sg*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
    makeTimingBelt(root,blockLen,8.2,0.6);
  }

  /* ==================== ДИЗЕЛЬ R4 (TDI / dCi) ==================== */
  function buildDieselR4(root,cfg){
    var perRow=4,spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;

    var pod=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.4,1.4,5.2),matDark(0x2a2a2a));
    pod.position.y=-0.7;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.2);

    var bk=new THREE.Mesh(new THREE.BoxGeometry(blockLen,5,5),matMetal(0x3a3a3a,0.5));
    bk.position.y=3.4;root.add(bk);pB(bk);
    for(var rr=0;rr<9;rr++){
      var rb=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.06,0.08,5.05),matDark(0x1a1a1a));
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }
    var hd=new THREE.Mesh(new THREE.BoxGeometry(blockLen+0.2,1.4,5.3),matMetal(0x4a4a4a,0.45));
    hd.position.y=6.4;root.add(hd);pH(hd);
    var cv=new THREE.Mesh(new THREE.BoxGeometry(blockLen,0.8,5),matDark(0x2a2a2a));
    cv.position.y=7.5;root.add(cv);pC(cv);

    /* Впуск */
    var inMan=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,blockLen*0.9,16),matMetal(0x3a4654,0.4));
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,5.6,2.5);root.add(inMan);
    /* Выпуск */
    var exMan=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,blockLen*0.9,14),matMetal(0x4a3a2a,0.5));
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.2,-2.5);root.add(exMan);

    /* Турбина */
    var turbo=new THREE.Group();
    var tb=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.7,20),matMetal(0x4a5566,0.4));
    tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,8,20),matMetal(0x6a7685,0.3));
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.3,-0.3,-2.5);root.add(turbo);
    window._dciParts={turbo:turbo};

    /* ТНВД */
    var pump=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.5,1.7),matMetal(0x3a4654,0.4));
    pump.position.set(blockLen/2+0.5,7.5,-2.5);root.add(pump);

    /* Rail */
    var rail=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,blockLen*0.85,14),matMetal(0xc8d4e0,0.15));
    rail.rotation.z=Math.PI/2;rail.position.set(0,6.9,-1.5);root.add(rail);

    /* Форсунки */
    for(var t=0;t<perRow;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var inj=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.55,10),matMetal(0x4a4d54,0.3));
      inj.position.set(tx,7.4,-0.5);root.add(inj);
    }

    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makePiston(xx,2.4,0,1.15,4.2,i*Math.PI,true);
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
    makeTimingBelt(root,blockLen,7.5,0.6);
  }

  /* ==================== ТРАКТОР Д-240 — V4 ==================== */
  function buildDieselTractor(root,cfg){
    var perRow = 2;
    var spacing = 3.0;
    var totalWidth = perRow * spacing;
    var blockLen = totalWidth + 2.2;
    var V_ANGLE = Math.PI / 2;    /* 90° */
    var half = V_ANGLE / 2;
    var bankDist = 2.0;

    /* Поддон */
    var pod = new THREE.Mesh(new THREE.BoxGeometry(blockLen + 1.0, 2.0, 7.5), matDark(0x2a2a2a));
    pod.position.y = -1.1; root.add(pod);

    /* Коленвал + маховик */
    makeCrankAndFly(root, blockLen, 0.6, perRow, 3.2);

    /* Два ряда */
    for(var side = 0; side < 2; side++){
      var sign = side === 0 ? -1 : 1;

      var bk = new THREE.Mesh(new THREE.BoxGeometry(blockLen, 5.8, 3.2), matMetal(0x4a4a4a, 0.5));
      bk.position.set(0, 3.8, sign * bankDist);
      bk.rotation.x = sign * half;
      root.add(bk); pB(bk);

      for(var rr = 0; rr < 9; rr++){
        var rb = new THREE.Mesh(new THREE.BoxGeometry(blockLen + 0.06, 0.10, 3.25), matDark(0x1a1a1a));
        rb.position.set(0, 1.3 + rr * 0.6, sign * bankDist);
        rb.rotation.x = sign * half;
        root.add(rb); pR(rb);
      }

      var headY = 7.2;
      var headZ = sign * (bankDist + 1.3);
      var hd = new THREE.Mesh(new THREE.BoxGeometry(blockLen + 0.3, 1.6, 3.4), matMetal(0x5a5a5a, 0.45));
      hd.position.set(0, headY, headZ);
      hd.rotation.x = sign * half;
      root.add(hd); pH(hd);

      var covY = headY + 1.2;
      var covZ = sign * (bankDist + 1.6);
      var cv = new THREE.Mesh(new THREE.BoxGeometry(blockLen, 0.9, 3.1), matDark(0x2a2a2a));
      cv.position.set(0, covY, covZ);
      cv.rotation.x = sign * half;
      root.add(cv); pC(cv);

      for(var b = 0; b < perRow + 1; b++){
        var bx2 = -blockLen/2 + 0.5 + b * (blockLen - 1) / perRow;
        root.add(bolt(bx2, covY + 0.6, covZ - 0.8, 0.08));
        root.add(bolt(bx2, covY + 0.6, covZ + 0.8, 0.08));
      }

      /* Впуск */
      var inMan = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, blockLen * 0.85, 14), matMetal(0x3a4654, 0.45));
      inMan.rotation.z = Math.PI / 2;
      inMan.position.set(0, headY - 0.3, sign * (bankDist + 2.6));
      root.add(inMan);

      for(var ip = 0; ip < perRow; ip++){
        var ipx = -totalWidth/2 + spacing/2 + ip * spacing;
        var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.6, 10), matMetal(0x3a4654, 0.45));
        pipe.position.set(ipx, headY - 0.3, sign * (bankDist + 2.9));
        pipe.rotation.x = Math.PI / 2;
        root.add(pipe);
      }

      /* Выпуск */
      var exMan = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, blockLen * 0.85, 14), matDark(0x2a2a2a));
      exMan.rotation.z = Math.PI / 2;
      exMan.position.set(0, 0.6, sign * 0.6);
      root.add(exMan);
    }

    /* Поршни */
    var arr = [];
    for(var s2 = 0; s2 < 2; s2++){
      var sg = s2 === 0 ? -1 : 1;
      for(var j = 0; j < perRow; j++){
        var xx = -totalWidth/2 + spacing/2 + j * spacing;
        var off = (s2 === 0 ? j * Math.PI : j * Math.PI + Math.PI);
        var a = makePiston(xx, 1.2, sg * bankDist, 1.4, 5.5, off, true);
        a.g.rotation.x = sg * half;
        root.add(a.g);
        arr.push(a);
      }
    }
    sA(arr);

    /* Топливный бак */
    var tank = new THREE.Mesh(new THREE.BoxGeometry(blockLen * 0.7, 2.4, 2.2), matMetal(0x5a5a4a, 0.55));
    tank.position.set(-blockLen/2 - 1.8, 2.5, 0);
    root.add(tank);
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.25, 10), matDark(0x3a3a2a));
    cap.position.set(-blockLen/2 - 1.8, 3.8, 0);
    root.add(cap);

    /* ТНВД */
    var pump = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 2.4), matMetal(0x3a4654, 0.45));
    pump.position.set(blockLen/2 + 1.0, 8.2, 2.8);
    root.add(pump);
    var pg = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), matMetal(0x8a95a3, 0.5));
    pg.rotation.z = Math.PI / 2;
    pg.position.set(blockLen/2 + 1.0, 8.2, 4.4);
    root.add(pg);

    /* Трубки ТНВД */
    for(var t = 0; t < 4; t++){
      var tt = t < 2 ? -1 : 1;
      var tx = -totalWidth/2 + spacing/2 + (t % 2) * spacing;
      var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), matMetal(0xc8d4e0, 0.2));
      tr.position.set(tx, 8.6, tt * 2.2);
      tr.rotation.x = Math.PI / 3;
      root.add(tr);
    }

    /* Форсунки */
    for(var f = 0; f < 2; f++){
      var fs = f === 0 ? -1 : 1;
      for(var fi = 0; fi < perRow; fi++){
        var fx = -totalWidth/2 + spacing/2 + fi * spacing;
        var inj = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 10), matDark(0x2a2a2a));
        inj.position.set(fx, 8.6, fs * (bankDist + 1.3));
        inj.rotation.x = fs * half;
        root.add(inj);
      }
    }

    /* Воздушный фильтр */
    var af = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.8, 18), matMetal(0x4a4a4a, 0.5));
    af.rotation.z = Math.PI / 2;
    af.position.set(-blockLen/2 + 1.5, 11.5, 0);
    root.add(af);
    var afC = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.25, 18), matDark(0x3a3a3a));
    afC.rotation.z = Math.PI / 2;
    afC.position.set(-blockLen/2 + 1.5, 13.0, 0);
    root.add(afC);
    var airPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.0, 10), matDark(0x3a3a3a));
    airPipe.rotation.x = Math.PI / 2;
    airPipe.position.set(-blockLen/2 + 1.5, 11.5, -1.7);
    root.add(airPipe);

    /* Выхлопная вверх */
    var ex = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 8.0, 14), matDark(0x4a4a4a));
    ex.position.set(blockLen/2 - 1.3, 12.5, 0);
    root.add(ex);
    var exC = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.4, 14), matDark(0x3a3a3a));
    exC.position.set(blockLen/2 - 1.3, 16.7, 0);
    root.add(exC);

    /* Гидронасос */
    var hydr = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.5, 12), matMetal(0x4a4a4a, 0.45));
    hydr.rotation.z = Math.PI / 2;
    hydr.position.set(-blockLen/2 - 1.2, 7.0, 2.8);
    root.add(hydr);

    makeTimingBelt(root, blockLen, 8.5, 0.6);
  }

  /* ==================== ВАНКЕЛЬ ==================== */
  function makeEpiShape(Rr,e){
    var pts=[];
    for(var i=0;i<=96;i++){
      var t=(i/96)*Math.PI*2;
      pts.push(new THREE.Vector2(Rr*Math.cos(t)+e*Math.cos(3*t),Rr*Math.sin(t)+e*Math.sin(3*t)));
    }
    return new THREE.Shape(pts);
  }
  function makeRotorShape(rotR){
    var sh=new THREE.Shape();
    for(var k=0;k<3;k++){
      var a=k*(Math.PI*2/3)-Math.PI/2;
      var x=Math.cos(a)*rotR,y=Math.sin(a)*rotR;
      if(k===0)sh.moveTo(x,y);else sh.lineTo(x,y);
    }
    sh.closePath();return sh;
  }
  function buildWankel(root){
    var Rr=2.0,ecc=0.4,depth=1.6,rotR=1.2,space=5.0;
    window._dvsWankelRotors=[];
    var axis=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,space+3,16),matMetal(0xc8d4e0,0.2));
    axis.rotation.z=Math.PI/2;root.add(axis);

    for(var ri=0;ri<2;ri++){
      var rx=(ri-0.5)*space;
      var unit=new THREE.Group();unit.position.set(rx,0,0);
      var epiGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false,curveSegments:64});
      epiGeo.center();
      var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({
        color:0x8894a2,metalness:0.92,roughness:0.2,
        transparent:true,opacity:0.32,side:THREE.DoubleSide
      }));
      unit.add(caseMesh);pB(caseMesh);

      var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.72,bevelEnabled:false})