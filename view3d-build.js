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

  /* Хранилище анимируемых объектов */
  window._dvsAnimated={
    belts:[],       /* {tex, speed, dir} */
    glows:[],       /* {light, mesh, off} свечи */
    flashes:[]      /* {mesh, light, off} вспышки */
  };
  var A=window._dvsAnimated;

  /* ==================== РЕМЕНЬ ГРМ С ТЕКСТУРОЙ ==================== */
  function makeBeltTexture(){
    if(window._dvsBeltTex)return window._dvsBeltTex;
    var c=document.createElement('canvas');
    c.width=32;c.height=32;
    var ctx=c.getContext('2d');
    ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,32,32);
    ctx.fillStyle='#3a3a3a';
    for(var i=0;i<8;i++)ctx.fillRect(0,i*4,32,2);
    var t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;
    window._dvsBeltTex=t;
    return t;
  }

  function makeBelt(len,width,depth){
    var tex=makeBeltTexture().clone();
    tex.needsUpdate=true;
    tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
    tex.repeat.set(len*0.8,1);
    var mat=new THREE.MeshStandardMaterial({map:tex,color:0x1a1a1a,metalness:0.3,roughness:0.85});
    var belt=new THREE.Mesh(new THREE.BoxGeometry(len,depth,width),mat);
    A.belts.push({tex:tex,speed:3});
    return belt;
  }

  /* ==================== БОЛТ ==================== */
  function bolt(x,y,z,r){
    var b=cy(r||0.05,r*2,6,0x8a95a3,0.95,0.3);
    b.rotation.z=Math.PI/2;
    b.position.set(x,y,z);
    return b;
  }

  /* ==================== ХРОМ-ТРУБКА ==================== */
  function chromePipe(len,r){
    var p=cy(r||0.06,len,8,0xd8e0e8,0.98,0.08);
    return p;
  }

  /* ==================== КАМЕРА ЦИЛИНДРА + ВСПЫШКА ==================== */
  function makeCylAss(o){
    var g=new THREE.Group();
    g.position.set(o.x,o.y,o.z);

    /* Гильза — стеклянная */
    var shell=new THREE.Mesh(
      new THREE.CylinderGeometry(o.r+0.15,o.r+0.15,o.h,20,1,true),
      new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.9,roughness:0.15,transparent:true,opacity:0.28,side:THREE.DoubleSide}));
    shell.position.y=o.h/2;g.add(shell);

    /* Поршень */
    var p=new THREE.Group();
    p.position.y=o.h*0.55;
    p.add(cy(o.r,o.r*0.9,18,0xd8e0e8,0.95,0.15));
    /* Кольца поршня */
    for(var k=0;k<3;k++){
      var rg=cy(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);
      rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);
    }
    /* Палец */
    var pin=cy(o.r*0.15,o.r*1.1,10,0x2a3543,0.9,0.3);
    pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);

    /* Шатун */
    var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);g.add(rod);

    /* Верхняя часть — свеча накала/искровая */
    var ign=new THREE.Group();
    if(o.diesel){
      var base=cy(o.r*0.16,o.r*0.5,10,0x2a2a2a,0.7,0.5);
      ign.add(base);
      var cap=cy(o.r*0.1,o.r*0.2,8,0x8a6a3a,0.7,0.4);
      cap.position.y=o.r*0.35;ign.add(cap);
    } else {
      var cer=cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5);
      ign.add(cer);
    }
    ign.position.y=o.h+0.4;g.add(ign);

    /* СВЕЧЕНИЕ свечи — красный при работе */
    var glowMesh=new THREE.Mesh(
      new THREE.SphereGeometry(o.r*0.25,10,10),
      new THREE.MeshBasicMaterial({color:o.diesel?0xff5500:0x66ccff,transparent:true,opacity:0,blending:THREE.AdditiveBlending})
    );
    glowMesh.position.y=o.h+0.05;g.add(glowMesh);

    var glowLight=new THREE.PointLight(o.diesel?0xff5500:0x66ccff,0,2.5);
    glowLight.position.y=o.h+0.05;g.add(glowLight);

    A.glows.push({light:glowLight,mesh:glowMesh,off:o.off||0});

    /* ВСПЫШКА — огонь в цилиндре */
    var flash=new THREE.Mesh(
      new THREE.SphereGeometry(o.r*0.9,12,12),
      new THREE.MeshBasicMaterial({color:0xffaa30,transparent:true,opacity:0,blending:THREE.AdditiveBlending})
    );
    flash.position.y=o.h*0.85;g.add(flash);

    var flashLight=new THREE.PointLight(0xffaa30,0,4);
    flashLight.position.y=o.h*0.85;g.add(flashLight);

    A.flashes.push({mesh:flash,light:flashLight,off:o.off||0});

    /* Клапаны (визуально) */
    var vv=[];
    for(var s=0;s<2;s++){
      var vg=new THREE.Group();
      vg.add(cy(o.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4));
      var vs=cy(0.05,o.r*0.6,6,0xa8b4c0,0.9,0.3);vs.position.y=o.r*0.3;vg.add(vs);
      vg.position.set((s===0?-1:1)*o.r*0.4,o.h+0.05,0);
      g.add(vg);vv.push(vg);
    }

    return {g:g,p:p,rod:rod,vv:vv,x:o.x,y:o.y,z:o.z,h:o.h,r:o.r,off:o.off||0};
  }

  /* ==================== КОЛЕНВАЛ + МАХОВИК ==================== */
  function makeCrankAndFly(root,blockLen,y,perRow,fwR){
    var cg=new THREE.Group();cg.position.y=y;

    /* Главная ось */
    var ax=cy(0.4,blockLen+1,20,0xa8b4c0,0.95,0.2);
    ax.rotation.z=Math.PI/2;cg.add(ax);

    /* Коренные шейки */
    var nMain=perRow+1;
    for(var mi=0;mi<nMain;mi++){
      var mx=-blockLen/2+0.5+mi*(blockLen-1)/(nMain-1);
      var mn=cy(0.55,0.4,16,0xb8c6d4,0.95,0.2);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }

    /* Шатунные шейки (со смещением) */
    for(var ci=0;ci<perRow;ci++){
      var cxx=-blockLen/2+0.85+ci*(blockLen-1.7)/Math.max(1,perRow-1);
      var o1=ci*Math.PI*2/perRow;
      var p1=new THREE.Group();
      var pin1=cy(0.3,0.5,12,0xd8e4f0,0.95,0.2);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*0.55,0);cg.add(p1);
      /* Красная метка, чтобы видеть вращение */
      var mark=bx(0.08,0.15,0.15,0xff4040,0.4,0.6);
      mark.position.set(cxx,Math.sin(o1)*0.55+0.25,0);cg.add(mark);
    }
    root.add(cg);sCr(cg);

    /* Маховик */
    var fw=new THREE.Group();
    var fwD=cy(fwR,0.4,32,0x8a95a3,0.9,0.3);fwD.rotation.z=Math.PI/2;fw.add(fwD);
    /* Зубья */
    for(var ft=0;ft<30;ft++){
      var th=bx(0.4,0.3,0.14,0x6a7685,0.9,0.3);
      var a=(ft/30)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.1),Math.sin(a)*(fwR+0.1));
      th.rotation.x=-a;fw.add(th);
    }
    /* Красная метка вращения */
    var fwMark=bx(0.4,0.5,0.3,0xff4040,0.4,0.6);
    fwMark.position.set(0.25,fwR*0.6,0);fw.add(fwMark);
    fw.position.set(blockLen/2+0.7,y,0);root.add(fw);sF(fw);
  }

  /* ==================== ШКИВЫ + РЕМЕНЬ ГРМ ==================== */
  function makeBeltsAndCams(root,blockLen,totalWidth,perRow){
    var beltMat=new THREE.MeshStandardMaterial({color:0x0a0a0a,metalness:0.3,roughness:0.85});

    /* Верхний шкив распредвала */
    var bt=new THREE.Group();
    var gt=cy(1.0,0.35,24,0x8a95a3,0.9,0.3);
    gt.rotation.z=Math.PI/2;bt.add(gt);
    for(var gtt=0;gtt<24;gtt++){
      var tg=bx(0.22,0.18,0.14,0x6a7685,0.9,0.3);
      var a2=(gtt/24)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*1.05,Math.sin(a2)*1.05);
      tg.rotation.x=-a2;bt.add(tg);
    }
    /* Красная метка */
    var mark1=bx(0.15,0.3,0.15,0xff4040,0.4,0.6);
    mark1.position.set(0.2,0.7,0);bt.add(mark1);
    bt.position.set(-blockLen/2-0.7,6.2,0);root.add(bt);sCam(bt);

    /* Нижний шкив коленвала */
    var bb=new THREE.Group();
    var gb=cy(1.4,0.35,28,0x8a95a3,0.9,0.3);
    gb.rotation.z=Math.PI/2;bb.add(gb);
    for(var gbt=0;gbt<28;gbt++){
      var tg2=bx(0.22,0.18,0.14,0x6a7685,0.9,0.3);
      var a3=(gbt/28)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.45,Math.sin(a3)*1.45);
      tg2.rotation.x=-a3;bb.add(tg2);
    }
    var mark2=bx(0.15,0.3,0.15,0xff4040,0.4,0.6);
    mark2.position.set(0.2,1.0,0);bb.add(mark2);
    bb.position.set(-blockLen/2-0.7,0.6,0);root.add(bb);

    /* Зубчатый ремень с текстурой */
    var beltLen=5.6;
    var belt=makeBelt(beltLen,0.55,0.15);
    belt.position.set(-blockLen/2-0.7,3.4,0);
    belt.rotation.z=Math.PI/2;
    root.add(belt);

    /* Распредвал */
    var cs=new THREE.Group();
    var ca=cy(0.25,blockLen+1,16,0xa8b4c0,0.95,0.2);
    ca.rotation.z=Math.PI/2;cs.add(ca);
    cs.position.y=6.4;root.add(cs);
    var camArr=[];
    for(var cc=0;cc<perRow*2;cc++){
      var cg2=new THREE.Group();
      var cd=cy(0.32,0.3,16,0x8a95a3,0.9,0.3);
      cd.rotation.z=Math.PI/2;cg2.add(cd);
      var nb=cy(0.13,0.3,10,0x6a7685,0.9,0.3);
      nb.rotation.z=Math.PI/2;nb.position.y=0.32;cg2.add(nb);
      var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/Math.max(1,perRow*2-1);
      cg2.position.set(cx2,0,0);cs.add(cg2);
      camArr.push({grp:cg2,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
    }
    sC(camArr);
  }

  /* ==================== 1.9 TDI — ДИЗЕЛЬ R4 КРАСИВЫЙ ==================== */
  function buildDieselR4(root,cfg){
    var perRow=4, spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;

    /* Поддон */
    var pod=bx(blockLen+0.4,1.4,5.2,0x2a3340,0.7,0.5);
    pod.position.y=-0.7;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,2.2);

    /* Блок */
    var bk=bx(blockLen,5,5,0x3a3a3a,0.8,0.5);
    bk.position.y=3.4;root.add(bk);pB(bk);

    /* Рёбра */
    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.06,0.08,5.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }

    /* Головка */
    var hd=bx(blockLen+0.2,1.4,5.3,0x4a4a4a,0.85,0.4);
    hd.position.y=6.4;root.add(hd);pH(hd);

    /* Клапанная крышка */
    var cv=bx(blockLen,0.8,5,0x2a2a2a,0.75,0.4);
    cv.position.y=7.5;root.add(cv);pC(cv);

    /* Болты на крышке */
    for(var b=0;b<5;b++){
      var bxx=-blockLen/2+0.5+b*(blockLen-1)/4;
      root.add(bolt(bxx,7.95,-2.4,0.06));
      root.add(bolt(bxx,7.95,2.4,0.06));
    }

    /* Впускной коллектор */
    var inMan=cy(0.32,blockLen*0.9,16,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,5.6,2.5);root.add(inMan);
    /* Патрубки впуска */
    for(var ip=0;ip<4;ip++){
      var ipx=-totalWidth/2+spacing/2+ip*spacing;
      var pipe=cy(0.18,0.6,10,0x3a4654,0.85,0.4);
      pipe.rotation.x=Math.PI/2;
      pipe.position.set(ipx,5.6,2.85);root.add(pipe);
    }

    /* Выпускной коллектор */
    var exMan=cy(0.42,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;
    exMan.position.set(0,-0.2,-2.5);root.add(exMan);

    /* Турбина */
    var turbo=new THREE.Group();
    var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,8,20),m(0x6a7685,0.9,0.3));
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    var cold=cy(0.55,0.5,14,0x8a95a3,0.9,0.3);cold.rotation.z=Math.PI/2;
    cold.position.set(0.6,0,0);turbo.add(cold);
    turbo.position.set(blockLen/2+0.3,-0.3,-2.5);
    turbo.rotation.y=0.4;root.add(turbo);
    window._dciParts={turbo:turbo};

    /* Интеркулер — патрубок */
    var icPipe=cy(0.24,3.0,12,0x5a6578,0.7,0.5);
    icPipe.rotation.z=Math.PI/2;
    icPipe.position.set(0,7.0,2.9);root.add(icPipe);

    /* ТНВД — большой, справа */
    var pump=bx(1.8,1.5,1.7,0x3a4654,0.85,0.4);
    pump.position.set(blockLen/2+0.5,7.5,-2.5);root.add(pump);
    var pg=cy(0.6,0.35,16,0x8a95a3,0.9,0.3);pg.rotation.z=Math.PI/2;
    pg.position.set(blockLen/2+0.5,7.5,-3.7);root.add(pg);

    /* Common Rail — рампа сверху */
    var rail=cy(0.16,blockLen*0.85,14,0xc8d4e0,0.98,0.1);
    rail.rotation.z=Math.PI/2;rail.position.set(0,6.9,-1.5);root.add(rail);
    /* Заглушка сбоку */
    var railCap=cy(0.2,0.25,12,0x8a95a3,0.9,0.3);
    railCap.rotation.z=Math.PI/2;
    railCap.position.set(-blockLen/2-0.15,6.9,-1.5);root.add(railCap);

    /* Трубки от рампы к форсункам */
    for(var t=0;t<perRow;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var tr=cy(0.045,0.9,6,0xc8d4e0,0.95,0.15);
      tr.position.set(tx,6.4,-0.5);tr.rotation.x=Math.PI/2.6;root.add(tr);
      /* Форсунка */
      var inj=cy(0.16,0.55,10,0x4a4d54,0.85,0.3);
      inj.position.set(tx,7.4,-0.5);root.add(inj);
      /* Разъём */
      var conn=bx(0.25,0.18,0.2,0x2a2a2a,0.5,0.7);
      conn.position.set(tx,7.7,-0.5);root.add(conn);
    }

    /* Свечи накала — видны спереди */
    for(var gn=0;gn<perRow;gn++){
      var gx=-totalWidth/2+spacing/2+gn*spacing;
      var glow=cy(0.13,0.5,10,0x2a2a2a,0.7,0.55);
      glow.position.set(gx,7.4,2.0);root.add(glow);
    }

    /* Поршни */
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.15,h:4.6,diesel:true,off:i*Math.PI});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    /* Ремень ГРМ + шкивы */
    makeBeltsAndCams(root,blockLen,totalWidth,perRow);

    /* Выхлопные трубы */
    for(var e=0;e<perRow;e++){
      var ex=-totalWidth/2+spacing/2+e*spacing;
      var pp=cy(0.24,1.4,10,0x3a2a1a,0.8,0.5);
      pp.position.set(ex,0.3,-3.0);root.add(pp);
    }
    var mp=cy(0.34,blockLen,16,0x3a2a1a,0.8,0.5);
    mp.rotation.z=Math.PI/2;mp.position.set(0,-0.2,-3.3);root.add(mp);
  }

  /* ==================== Д-240 — ТРАКТОРНЫЙ ДИЗЕЛЬ ==================== */
  function buildDieselTractor(root,cfg){
    var perRow=4, spacing=2.5;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+2.0;

    /* Поддон массивный */
    var pod=bx(blockLen+0.5,1.8,6.4,0x2a2a2a,0.7,0.5);
    pod.position.y=-1.0;root.add(pod);

    makeCrankAndFly(root,blockLen,0.6,perRow,3.0);

    /* Блок — крупный */
    var bk=bx(blockLen,5.5,6,0x3a3a3a,0.75,0.55);
    bk.position.y=3.7;root.add(bk);pB(bk);

    /* Рёбра */
    for(var rr=0;rr<10;rr++){
      var rb=bx(blockLen+0.06,0.10,6.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.3+rr*0.55;root.add(rb);pR(rb);
    }

    /* Головка */
    var hd=bx(blockLen+0.3,1.6,6.3,0x4a4a4a,0.8,0.45);
    hd.position.y=7.1;root.add(hd);pH(hd);

    /* Клапанная крышка */
    var cv=bx(blockLen,0.9,6,0x2a2a2a,0.7,0.45);
    cv.position.y=8.3;root.add(cv);pC(cv);

    /* Болты */
    for(var b=0;b<6;b++){
      var bxx=-blockLen/2+0.5+b*(blockLen-1)/5;
      root.add(bolt(bxx,8.7,-2.9,0.08));
      root.add(bolt(bxx,8.7,2.9,0.08));
    }

    /* Поршни */
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.35,h:5.0,diesel:true,off:i*Math.PI});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);

    /* Топливный бак сбоку */
    var tank=bx(blockLen*0.65,2.2,2.0,0x5a5a4a,0.6,0.6);
    tank.position.set(-blockLen/2-1.6,2.2,0);root.add(tank);
    var cap=cy(0.3,0.25,10,0x3a3a2a,0.7,0.5);
    cap.position.set(-blockLen/2-1.6,3.4,0);root.add(cap);

    /* Механический ТНВД — большой */
    var pump=bx(2.4,2.2,2.2,0x3a4654,0.8,0.5);
    pump.position.set(blockLen/2+0.8,7.8,2.6);root.add(pump);
    var pg=cy(0.75,0.45,16,0x8a95a3,0.85,0.4);
    pg.rotation.z=Math.PI/2;
    pg.position.set(blockLen/2+0.8,7.8,4.1);root.add(pg);
    /* Трубки от ТНВД к форсункам */
    for(var t=0;t<perRow;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var tr=cy(0.06,1.6,6,0xc8d4e0,0.9,0.2);
      tr.position.set(tx,8.4,1.7);tr.rotation.x=Math.PI/3;root.add(tr);
    }
    /* Форсунки сверху */
    for(var f=0;f<perRow;f++){
      var fx=-totalWidth/2+spacing/2+f*spacing;
      var inj=cy(0.16,0.55,10,0x4a4d54,0.85,0.3);
      inj.position.set(fx,8.4,0.5);root.add(inj);
    }

    /* Воздушный фильтр — сверху */
    var airFilter=cy(1.0,2.6,18,0x4a4a4a,0.6,0.6);
    airFilter.rotation.z=Math.PI/2;
    airFilter.position.set(-blockLen/2+1.5,10.8,0);root.add(airFilter);
    var afCap=cy(1.05,0.2,18,0x3a3a3a,0.7,0.5);
    afCap.rotation.z=Math.PI/2;
    afCap.position.set(-blockLen/2+1.5,12.2,0);root.add(afCap);
    /* Патрубок от фильтра к впуску */
    var airPipe=cy(0.25,2.4,10,0x3a3a3a,0.6,0.6);
    airPipe.rotation.x=Math.PI/2;
    airPipe.position.set(-blockLen/2+1.5,10.8,-1.6);root.add(airPipe);

    /* Впускной коллектор */
    var inMan=cy(0.4,blockLen*0.8,14,0x3a4654,0.8,0.5);
    inMan.rotation.z=Math.PI/2;
    inMan.position.set(0,8.7,-2.6);root.add(inMan);

    /* Выхлопной коллектор */
    var exMan=bx(blockLen,0.6,0.5,0x2a2a2a,0.7,0.6);
    exMan.position.set(0,8.7,2.6);root.add(exMan);

    /* ВЫХЛОПНАЯ ТРУБА ВВЕРХ — трактор */
    var exhaust=cy(0.38,7.5,14,0x4a4a4a,0.7,0.5);
    exhaust.position.set(blockLen/2-1.4,11.8,0);root.add(exhaust);
    var exhCap=cy(0.55,0.4,14,0x3a3a3a,0.7,0.5);
    exhCap.position.set(blockLen/2-1.4,15.7,0);root.add(exhCap);

    /* Поршневой насос (гидравлика) */
    var hydr=cy(0.35,1.4,12,0x4a4a4a,0.85,0.4);
    hydr.rotation.z=Math.PI/2;
    hydr.position.set(-blockLen/2-1.0,6.5,2.5);root.add(hydr);

    /* Ремень ГРМ */
    makeBeltsAndCams(root,blockLen,totalWidth,perRow);
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
    window._dvsWankelPins=[];
    window._dvsWankelFlashes=[];

    var axis=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,space+3,16),m(0xc8d4e0,0.95,0.2));
    axis.rotation.z=Math.PI/2;root.add(axis);

    for(var ri=0;ri<2;ri++){
      var rx=(ri-0.5)*space;
      var unit=new THREE.Group();unit.position.set(rx,0,0);
      var epiGeo=new THREE.ExtrudeGeometry(makeEpiShape(Rr,ecc),{depth:depth,bevelEnabled:false,curveSegments:64});
      epiGeo.center();
      var caseMesh=new THREE.Mesh(epiGeo,new THREE.MeshStandardMaterial({color:0x8894a2,metalness:0.92,roughness:0.2,transparent:true,opacity:0.32,side:THREE.DoubleSide}));
      unit.add(caseMesh);pB(caseMesh);

      var rotGeo=new THREE.ExtrudeGeometry(makeRotorShape(rotR),{depth:depth*0.72,bevelEnabled:false});
      rotGeo.center();
      var rotorMesh=new THREE.Mesh(rotGeo,m(0xdde5ee,0.95,0.15));
      unit.add(rotorMesh);
      window._dvsWankelRotors.push({mesh:rotorMesh,ecc:ecc});
      root.add(unit);
    }

    var fw=new THREE.Group();
    var fwDisc=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.4,32),m(0x8a95a3,0.92,0.28));
    fwDisc.rotation.z=Math.PI/2;fw.add(fwDisc);
    fw.position.set(space+2.0,0,0);root.add(fw);sF(fw);
  }

  /* ==================== 2.0 dCi ==================== */
  function buildDCI(root,cfg){
    buildDieselR4(root,cfg);
  }

  /* ==================== ГЛАВНЫЙ REBUILD ==================== */
  window.DVS_3D_REBUILD=function(){
    var scene=R.getScene();
    if(!scene){console.warn('no scene');return;}
    var cfg=R.getCfg(S.engineType)||{n:4,v:false};

    window._dvsWankelTickActive=false;

    /* Сброс анимаций */
    A.belts=[];A.glows=[];A.flashes=[];

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
    window._dvsWankelRotors=[];window._dvsWankelPins=[];window._dvsWankelFlashes=[];window._dciParts=null;

    var root=new THREE.Group();scene.add(root);R.setRoot(root);

    var t=S.engineType;
    try{
      if(t==='wankel')      buildWankel(root);
      else i