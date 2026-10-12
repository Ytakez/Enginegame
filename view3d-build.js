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

  /* КРИТИЧНО: view3d.js поднимает поршень на 2.15..3.65 от группы.
     Сдвигаем группу вниз на 2.9 — центр колебания окажется в центре блока */
  var PY_MEAN = 2.9;
  var ROD_LEN = 4.5;  /* длина шатуна — достаёт до коленвала */

  /* ============ КАМЕРА ЦИЛИНДРА — БЕЗ shell ============ */
  function makeCylAss(o){
    var g=new THREE.Group();
    g.position.set(o.x, o.y - PY_MEAN, o.z);

    /* Поршень (view3d.js перезапишет p.position.y = 2.15..3.65) */
    var p=new THREE.Group();
    p.add(cy(o.r,o.r*0.9,18,0xd8e0e8,0.95,0.15));
    for(var k=0;k<3;k++){
      var rg=cy(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);
      rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);
    }
    var pin=cy(o.r*0.15,o.r*1.1,10,0x2a3543,0.9,0.3);
    pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);

    /* Длинный шатун — идёт вниз до коленвала */
    var rod=bx(o.r*0.30, ROD_LEN, o.r*0.30, 0x8894a2, 0.9, 0.25);
    g.add(rod);

    /* Свеча сверху — на уровне головки */
    var ign=new THREE.Group();
    if(o.diesel){ign.add(cy(o.r*0.15,o.r*0.5,10,0x3a3a3a,0.7,0.4));}
    else{ign.add(cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5));}
    ign.position.y = o.h * 0.55;
    g.add(ign);

    /* Клапаны наверху */
    var vv=[];
    for(var s=0;s<2;s++){
      var vg=new THREE.Group();
      vg.add(cy(o.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4));
      vg.position.set((s===0?-1:1)*o.r*0.4, o.h*0.55, 0);
      g.add(vg);vv.push(vg);
    }

    return {g:g,p:p,rod:rod,vv:vv,off:o.off||0,h:o.h,r:o.r};
  }

  /* ============ КОЛЕНВАЛ + МАХОВИК ============ */
  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;
    var ax=cy(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<perRow+1;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/perRow;
      var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var p1=new THREE.Group();
      var pin1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*0.55,0);cg.add(p1);
    }
    root.add(cg);sCr(cg);
    var fw=new THREE.Group();
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
      th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(blockLen/2+0.7,y,0);
    root.add(fw);sF(fw);
  }

  /* ============ ОБЩАЯ РЯДНАЯ ============ */
  function inlineBase(root,opt){
    var n=opt.n||4;
    var spacing=opt.spacing||2.2;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.5;
    var blockD=opt.d||5;
    var blockH=opt.h||5;
    var blockY=opt.y||3.4;
    var blockColor=opt.diesel?0x3a3a3a:0x4a5566;
    var headColor=opt.diesel?0x4a4a4a:0x3a4756;
    var panColor=opt.diesel?0x2a2a2a:0x2a3340;

    var pod=bx(blockLen,1.2,blockD,panColor,0.7,0.5);
    pod.position.y=-0.6;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,n,opt.fwR||2.2);

    /* Прозрачный блок — видно поршни */
    var bk=new THREE.Mesh(
      new THREE.BoxGeometry(blockLen,blockH,blockD),
      new THREE.MeshStandardMaterial({
        color:blockColor,metalness:0.6,roughness:0.35,
        transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false
      }));
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.05,0.06,blockD+0.05,0x1a1a1a,0.6,0.6);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/8;root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=bx(blockLen+0.2,1.4,blockD+0.3,headColor,0.85,0.35);
    hd.position.y=headY;root.add(hd);pH(hd);

    var covY=headY+0.9;
    var cv=bx(blockLen,0.8,blockD-0.5,0x2a3340,0.75,0.4);
    cv.position.y=covY;root.add(cv);pC(cv);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      /* Передаём центр блока — внутри makeCylAss сдвиг на -PY_MEAN */
      var a=makeCylAss({x:xx,y:blockY,z:0,r:1.15,h:blockH+0.6,off:i*Math.PI,diesel:opt.diesel});
      root.add(a.g);arr.push(a);
    }
    sA(arr);

    return {blockLen:blockLen,totalWidth:totalWidth,n:n,headY:headY,covY:covY,blockD:blockD,spacing:spacing,blockY:blockY,blockH:blockH};
  }

  /* ============ R4 ============ */
  function buildR4(root,cfg){
    var B=inlineBase(root,{n:4,diesel:false});
    var inMan=cy(0.34,B.blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,B.headY+0.2,B.blockD/2+0.35);root.add(inMan);
    var exMan=cy(0.36,B.blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.3,-B.blockD/2-0.35);root.add(exMan);
  }

  /* ============ SCOOTER ============ */
  function buildScooter(root,cfg){
    var B=inlineBase(root,{n:1,spacing:1.5,d:3,h:3.5,y:2.4,fwR:1.2});
    var carb=bx(0.8,0.8,0.8,0x3a3a3a,0.7,0.5);
    carb.position.set(0,B.headY+0.5,B.blockD/2+0.3);root.add(carb);
    var filter=cy(0.55,0.4,14,0x1a1a1a,0.5,0.7);
    filter.position.set(0,B.headY+0.5,B.blockD/2+0.9);root.add(filter);
    var filterLabel=bx(0.3,0.1,0.3,0xff5b5b,0.3,0.7);
    filterLabel.position.set(0,B.headY+0.5,B.blockD/2+1.15);root.add(filterLabel);
    var ex=cy(0.15,0.8,10,0x2a2a2a,0.6,0.5);
    ex.rotation.z=Math.PI/2;
    ex.position.set(-B.blockLen/2-0.5,-0.3,-B.blockD/2-0.3);root.add(ex);
    var cvt=cy(1.0,0.4,24,0x6a7685,0.85,0.4);
    cvt.rotation.z=Math.PI/2;
    cvt.position.set(B.blockLen/2+1.0,0,-1.0);root.add(cvt);
    var belt=bx(0.15,2.0,0.4,0x1a1a1a,0.4,0.7);
    belt.position.set(B.blockLen/2+0.5,-0.3,-1.0);root.add(belt);
  }

  /* ============ B3 ============ */
  function buildPassatB3(root,cfg){
    var B=inlineBase(root,{n:4,diesel:false});
    var inMan=cy(0.34,B.blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,B.headY+0.2,B.blockD/2+0.35);root.add(inMan);
    var exMan=cy(0.36,B.blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.3,-B.blockD/2-0.35);root.add(exMan);
    var plast=bx(B.blockLen*0.9,0.4,B.blockD*0.7,0x1a1d22,0.4,0.7);
    plast.position.y=B.covY+0.55;root.add(plast);
    var logo=cy(0.3,0.05,20,0xa8b4c0,0.9,0.2);
    logo.position.set(0,B.covY+0.78,0);root.add(logo);
  }

  /* ============ CA20 ============ */
  function buildBluebird(root,cfg){
    var B=inlineBase(root,{n:4,diesel:false});
    var inMan=cy(0.34,B.blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,B.headY+0.2,B.blockD/2+0.35);root.add(inMan);
    var exMan=cy(0.36,B.blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.3,-B.blockD/2-0.35);root.add(exMan);
    for(var i=0;i<4;i++){
      var ix=-B.totalWidth/2+B.spacing/2+i*B.spacing;
      var coil=bx(0.35,0.5,0.35,0x1a1a1a,0.6,0.6);
      coil.position.set(ix,B.covY+0.7,0);root.add(coil);
      var coilTop=cy(0.12,0.15,10,0x3a3a3a,0.7,0.5);
      coilTop.position.set(ix,B.covY+1.0,0);root.add(coilTop);
    }
  }

  /* ============ TDI ============ */
  function buildTDI(root,cfg){
    var B=inlineBase(root,{n:4,diesel:true});
    var inMan=cy(0.32,B.blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,B.headY+0.2,B.blockD/2+0.35);root.add(inMan);
    var exMan=cy(0.42,B.blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.2,-B.blockD/2-0.35);root.add(exMan);
    var turbo=new THREE.Group();
    var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,8,20),m(0x6a7685,0.9,0.3));
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    var cold=cy(0.55,0.4,14,0x8a95a3,0.9,0.3);cold.rotation.z=Math.PI/2;
    cold.position.set(0.6,0,0);turbo.add(cold);
    turbo.position.set(B.blockLen/2+0.3,-0.3,-B.blockD/2-0.35);
    root.add(turbo);
    window._dciParts={turbo:turbo};
    var pump=bx(1.6,1.3,1.5,0x3a4654,0.85,0.4);
    pump.position.set(B.blockLen/2+0.5,B.covY+0.4,-B.blockD/2-0.3);root.add(pump);
    for(var i=0;i<4;i++){
      var tx=-B.totalWidth/2+B.spacing/2+i*B.spacing;
      var inj=cy(0.15,0.5,10,0x3a3a3a,0.7,0.4);
      inj.position.set(tx,B.headY+0.4,-0.6);root.add(inj);
    }
  }

  /* ============ dCi ============ */
  function buildDCi(root,cfg){
    var B=inlineBase(root,{n:4,diesel:true});
    var inMan=cy(0.30,B.blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,B.headY+0.2,B.blockD/2+0.35);root.add(inMan);
    var exMan=cy(0.42,B.blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.2,-B.blockD/2-0.35);root.add(exMan);
    var turbo=new THREE.Group();
    var tb=cy(0.85,0.65,20,0x4a5566,0.85,0.4);tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.15,8,20),m(0x6a7685,0.9,0.3));
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(B.blockLen/2+0.4,-0.3,-B.blockD/2-0.35);root.add(turbo);
    window._dciParts={turbo:turbo};
    var rail=cy(0.13,0.13,B.blockLen*0.85,0xc8d4e0,0.95,0.15);
    rail.rotation.z=Math.PI/2;
    rail.position.set(0,B.covY+0.5,B.blockD/2-0.3);root.add(rail);
    for(var i=0;i<4;i++){
      var tx=-B.totalWidth/2+B.spacing/2+i*B.spacing;
      var tr=cy(0.04,0.6,6,0xc8d4e0,0.9,0.2);
      tr.position.set(tx,B.headY+0.7,0.3);tr.rotation.x=Math.PI/3;root.add(tr);
    }
    var pump=bx(1.5,1.2,1.4,0x3a4654,0.85,0.4);
    pump.position.set(B.blockLen/2+0.5,B.covY+0.4,B.blockD/2-0.3);root.add(pump);
  }

  /* ============ BOXER ============ */
  function buildBoxer(root,cfg){
    var n=2;
    var spacing=2.4;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+2.0;
    var blockH=4.5;
    var blockD=4.5;
    var blockY=2.8;

    var pod=bx(blockLen+0.5,1.3,blockD+0.3,0x2a3340,0.7,0.5);
    pod.position.y=0.3;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,n,2.4);

    /* Центральный блок прозрачный */
    var bk=new THREE.Mesh(
      new THREE.BoxGeometry(blockLen,blockH,2.5),
      new THREE.MeshStandardMaterial({
        color:0x4a5566,metalness:0.6,roughness:0.35,
        transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false
      }));
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<6;rr++){
      var rb=bx(blockLen+0.04,0.05,2.55,0x1a1a1a,0.6,0.6);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/5;root.add(rb);pR(rb);
    }

    var headY=blockY;
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var hd=bx(blockLen+0.2,3.0,1.3,0x3a4756,0.85,0.35);
      hd.position.set(0,headY,sign*(blockD/2+0.5));
      hd.rotation.x=sign*Math.PI/2;root.add(hd);pH(hd);
      var cv=bx(blockLen,2.8,1.0,0x2a3340,0.75,0.4);
      cv.position.set(0,headY,sign*(blockD/2+1.0));
      cv.rotation.x=sign*Math.PI/2;root.add(cv);pC(cv);
      var inMan=cy(0.28,blockLen*0.85,14,0x3a4654,0.85,0.4);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,headY+1.8,sign*(blockD/2+0.5));root.add(inMan);
      var exMan=cy(0.32,blockLen*0.85,14,0x4a3a2a,0.85,0.5);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,headY-1.8,sign*(blockD/2+0.5));root.add(exMan);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<n;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var zz=sg*(blockD/2+0.4);
        var off=(s2===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=makeCylAss({x:xx,y:headY,z:zz,r:1.0,h:3.8,off:off});
        a.g.rotation.x=sg*Math.PI/2;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  /* ============ I6 2JZ ============ */
  function buildI6(root,cfg){
    var n=6,spacing=2.0;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+1.5;
    var blockH=5.2;
    var blockD=5.0;
    var blockY=3.5;

    var pod=bx(blockLen+0.3,1.3,blockD+0.2,0x2a3340,0.7,0.5);
    pod.position.y=-0.7;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,n,2.4);

    var bk=new THREE.Mesh(
      new THREE.BoxGeometry(blockLen,blockH,blockD),
      new THREE.MeshStandardMaterial({
        color:0x4a5566,metalness:0.6,roughness:0.35,
        transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false
      }));
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<11;rr++){
      var rb=bx(blockLen+0.05,0.06,blockD+0.05,0x1a1a1a,0.6,0.6);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/10;root.add(rb);pR(rb);
    }

    var headY=blockY+blockH/2+0.6;
    var hd=bx(blockLen+0.2,1.5,blockD+0.3,0x3a4756,0.85,0.35);
    hd.position.y=headY;root.add(hd);pH(hd);
    var covY=headY+1.0;
    var cv=bx(blockLen,0.9,blockD-0.5,0x2a3340,0.75,0.4);
    cv.position.y=covY;root.add(cv);pC(cv);

    for(var b=0;b<=n;b++){
      var bx2=-blockLen/2+0.5+b*(blockLen-1)/n;
      var bolt1=cy(0.06,0.12,6,0x8a95a3,0.9,0.3);
      bolt1.rotation.z=Math.PI/2;
      bolt1.position.set(bx2,covY+0.55,-(blockD/2-0.8));root.add(bolt1);
      var bolt2=cy(0.06,0.12,6,0x8a95a3,0.9,0.3);
      bolt2.rotation.z=Math.PI/2;
      bolt2.position.set(bx2,covY+0.55,(blockD/2-0.8));root.add(bolt2);
    }

    var inMan=cy(0.34,blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,headY+0.2,blockD/2+0.4);root.add(inMan);
    var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.3,-blockD/2-0.4);root.add(exMan);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a=makeCylAss({x:xx,y:blockY,z:0,r:1.1,h:blockH+0.6,off:i*Math.PI});
      root.add(a.g);arr.push(a);
    }
    sA(arr);
  }

  /* ============ РАДИАЛЬНЫЙ ============ */
  function buildRadial(root,cfg){
    var n=9;
    var angStep=Math.PI*2/n;
    var R_cyl=3.2;
    var cylLen=3.5;

    var carter=cy(3.6,0.9,32,0x3a3a3a,0.7,0.5);
    carter.rotation.x=Math.PI/2;
    carter.position.z=-1.5;root.add(carter);

    var crank=cy(0.45,1.2,20,0xa8b4c0,0.95,0.2);
    crank.rotation.x=Math.PI/2;root.add(crank);sCr(crank);

    var axis=cy(0.25,3.5,16,0xc8d4e0,0.95,0.2);
    axis.rotation.x=Math.PI/2;axis.position.z=1.5;root.add(axis);

    var fw=new THREE.Group();
    var fwD=cy(2.2,0.3,32,0x8a95a3,0.9,0.3);
    fwD.rotation.x=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<30;ft++){
      var th=bx(0.3,0.25,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(Math.cos(a)*2.3,Math.sin(a)*2.3,0);
      th.rotation.z=a;fw.add(th);
    }
    fw.position.z=3.5;root.add(fw);sF(fw);

    var arr=[];
    for(var i=0;i<n;i++){
      var a=i*angStep - Math.PI/2;
      var cx=Math.cos(a)*R_cyl;
      var cyy=Math.sin(a)*R_cyl;

      var cylGrp=new THREE.Group();
      cylGrp.position.set(cx,cyy,0);
      cylGrp.rotation.z=a - Math.PI/2;
      root.add(cylGrp);

      var shell=new THREE.Mesh(
        new THREE.CylinderGeometry(0.95,0.95,cylLen,20,1,true),
        new THREE.MeshStandardMaterial({
          color:0x8894a2,metalness:0.9,roughness:0.15,
          transparent:true,opacity:0.35,side:THREE.DoubleSide
        }));
      shell.position.y=cylLen/2;
      cylGrp.add(shell);

      var hd=cy(1.05,0.4,20,0x3a4756,0.85,0.35);
      hd.position.y=cylLen+0.2;cylGrp.add(hd);

      var plug=cy(0.12,0.5,10,0xe8e4dc,0.3,0.5);
      plug.position.y=cylLen+0.6;cylGrp.add(plug);

      var p=new THREE.Group();
      p.position.y=cylLen*0.5;
      p.add(cy(0.85,0.7,18,0xd8e0e8,0.95,0.15));
      for(var k=0;k<3;k++){
        var rg=cy(0.88,0.06,18,0x2a333f,0.6,0.7);
        rg.position.y=0.25-k*0.18;p.add(rg);
      }
      cylGrp.add(p);

      var rod=bx(0.25,1.8,0.25,0x8894a2,0.9,0.25);
      rod.position.y=-0.9;cylGrp.add(rod);

      arr.push({g:cylGrp,p:p,rod:rod,off:i*angStep});
    }
    sA(arr);
  }

  /* ============ V ============ */
  function buildVBase(root,totalN,half,bankDist,scale){
    var perRow=Math.floor(totalN/2);
    var spacing=2.0*scale;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var blockY=3.4;

    var pod=bx(blockLen+0.4,1.2,7.5*scale,0x2a2a2a,0.7,0.5);
    pod.position.y=-0.9;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.4*scale);

    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bk=new THREE.Mesh(
        new THREE.BoxGeometry(blockLen,5*scale,2.8*scale),
        new THREE.MeshStandardMaterial({
          color:0x4a5566,metalness:0.6,roughness:0.35,
          transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false
        }));
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);

      for(var rr=0;rr<8;rr++){
        var rb=bx(blockLen+0.05,0.06,2.85*scale,0x1a1a1a,0.6,0.6);
        rb.position.set(0,blockY-2.5+0.5+rr*0.55,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }

      var hd=bx(blockLen+0.2,1.4,3*scale,0x3a4756,0.85,0.35);
      hd.position.set(0,blockY+3.2,sign*(bankDist+1.2));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);

      var cv=bx(blockLen,0.8,2.7*scale,0x2a3340,0.75,0.4);
      cv.position.set(0,blockY+4.3,sign*(bankDist+1.5));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);

      var inMan=cy(0.32,blockLen*0.9,14,0x3a4654,0.85,0.4);
      inMan.rotation.z=Math.PI/2;
      inMan.position.set(0,blockY+3.8,sign*(bankDist+2.2));root.add(inMan);

      var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
      exMan.rotation.z=Math.PI/2;
      exMan.position.set(0,0.5,sign*0.5);root.add(exMan);
    }

    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makeCylAss({x:xx,y:blockY,z:sg*bankDist,r:1.0*scale,h:5*scale,off:off});
        a.g.rotation.x=sg*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  function buildV6(root){buildVBase(root,6,Math.PI/6,1.6,1.0);}
  function buildV12(root){buildVBase(root,12,Math.PI/6,1.8,1.0);}
  function buildV22(root){buildVBase(root,22,Math.PI/4,2.2,1.0);}

  /* ============ ТРАКТОР ============ */
  function buildTractor(root,cfg){
    var n=4,spacing=2.5;
    var totalWidth=n*spacing;
    var blockLen=totalWidth+2.0;
    var blockY=3.7;
    var pod=bx(blockLen+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);
    pod.position.y=-1.0;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,n,3.0);

    var bk=new THREE.Mesh(
      new THREE.BoxGeometry(blockLen,5.5,6),
      new THREE.MeshStandardMaterial({
        color:0x3a3a3a,metalness:0.6,roughness:0.4,
        transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false
      }));
    bk.position.y=blockY;root.add(bk);pB(bk);

    for(var rr=0;rr<10;rr++){
      var rb=bx(blockLen+0.06,0.10,6.05,0x1a1a1a,0.6,0.6);
      rb.position.y=blockY-2.75+0.5+rr*0.55;root.add(rb);pR(rb);
    }

    var headY=blockY+3.4;
    var hd=bx(blockLen+0.3,1.6,6.3,0x4a4a4a,0.8,0.45);
    hd.position.y=headY;root.add(hd);pH(hd);
    var covY=headY+1.0;
    var cv