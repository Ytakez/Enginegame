(function(){
"use strict";
var S=window.S;if(!S)return;

function waitRef(){
  if(!window.DVS_3D_REF||!window.DVS_3D_BUILD){setTimeout(waitRef,150);return;}
  var R=window.DVS_3D_REF, B=window.DVS_3D_BUILD;
  var cy=B.cy,bx=B.bx;

  function M(c,mt,rg,op,tr){
    var o={color:c,metalness:mt===undefined?0.8:mt,roughness:rg===undefined?0.4:rg};
    if(op!==undefined){o.transparent=true;o.opacity=op;}
    if(tr)o.side=THREE.DoubleSide;
    return new THREE.MeshStandardMaterial(o);
  }
  function MM(c,mt,rg,op,tr){
    var mat=M(c,mt,rg,op,tr);
    if(op!==undefined)mat.userData={baseOpacity:op};
    return mat;
  }
  var MAT={
    cast:MM(0x2b3036,0.5,0.72),
    block:MM(0x475060,0.55,0.45,0.18,true),
    head:MM(0x59616e,0.75,0.35),
    cover:MM(0x272c34,0.5,0.55),
    rib:MM(0x1e2228,0.6,0.65),
    alu:MM(0xa8b0ba,0.9,0.22),
    aluD:MM(0x6a727c,0.85,0.35),
    chrome:MM(0xe4eaf0,1.0,0.08),
    piston:MM(0xdfe6ee,0.95,0.1),
    ring:MM(0x2a2e33,0.5,0.7),
    rod:MM(0x8a95a2,0.9,0.22),
    exhaust:MM(0x6a4a30,0.6,0.65),
    intake:MM(0x546070,0.7,0.4),
    rubber:MM(0x1a1d22,0.05,0.92),
    bolt:MM(0xc0c8d0,0.95,0.2),
    plug:MM(0x2a2d33,0.6,0.5),
    blue:MM(0x2d5fa8,0.7,0.38),
    yellow:MM(0xd8b840,0.7,0.38),
    red:MM(0xb03030,0.7,0.38)
  };

  function cyl(r1,r2,h,seg,mat){return new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||20),mat);}
  function box(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);}
  function tor(rad,tube,seg,tseg,mat){return new THREE.Mesh(new THREE.TorusGeometry(rad,tube,seg||8,tseg||20),mat);}

  function pB(x){if(x&&R.pushBlock)R.pushBlock(x);}
  function pH(x){if(x&&R.pushHead)R.pushHead(x);}
  function pC(x){if(x&&R.pushCover)R.pushCover(x);}
  function pR(x){if(x&&R.pushRib)R.pushRib(x);}
  function sA(x){if(R.setAsm)R.setAsm(x);}
  function sCr(x){if(R.setCrank)R.setCrank(x);}
  function sF(x){if(R.setFly)R.setFly(x);}

  /* ============ ПОРШЕНЬ ============ */
  function makePiston(r,h){
    var g=new THREE.Group();
    g.add(cyl(r,r,h,22,MAT.piston));
    var crown=cyl(r*1.001,r*0.96,h*0.12,22,MAT.aluD);
    crown.position.y=h*0.44;g.add(crown);
    for(var k=0;k<3;k++){
      var rg=tor(r*0.94,0.035,6,22,MAT.ring);
      rg.rotation.x=Math.PI/2;
      rg.position.y=h*0.15-k*h*0.15;g.add(rg);
    }
    var pin=cyl(r*0.16,r*0.16,r*1.3,12,MAT.chrome);
    pin.rotation.z=Math.PI/2;pin.position.y=-h*0.1;g.add(pin);
    return g;
  }

  /* ============ ШАТУН ============ */
  function makeRod(len){
    var g=new THREE.Group();
    g.add(box(0.16,len*0.85,0.22,MAT.rod));
    var small=cyl(0.15,0.15,0.28,12,MAT.chrome);
    small.rotation.z=Math.PI/2;small.position.y=len/2;g.add(small);
    var big=tor(0.22,0.09,8,18,MAT.aluD);
    big.rotation.y=Math.PI/2;big.position.y=-len/2;g.add(big);
    var cap=box(0.12,0.1,0.5,MAT.aluD);
    cap.position.y=-len/2-0.22;g.add(cap);
    return g;
  }

  /* ============ ЦИЛИНДР ============ */
  function makeCylUnit(cfg){
    // cfg: {x, z, blockY, blockH, radius, phase, crankR, rodLen, pH}
    var g=new THREE.Group();
    g.position.set(cfg.x, 0, cfg.z);
    var piston=makePiston(cfg.radius*0.88, cfg.pH||0.9);
    piston.position.y=cfg.blockY;
    g.add(piston);
    var rodBaseLen=cfg.rodLen||2.6;
    var rod=makeRod(rodBaseLen);
    rod.position.y=cfg.blockY-rodBaseLen*0.5;
    g.add(rod);
    return {
      g:g, p:piston, rod:rod,
      rodBaseLen:rodBaseLen,
      off:cfg.phase||0,
      crankR:cfg.crankR||0.8,
      rodLen:rodBaseLen,
      pH:cfg.pH||0.9
    };
  }

  /* ============ КОЛЕНВАЛ ============ */
  function makeCrank(root,length,crankY,n,crankR,fwR){
    var cg=new THREE.Group();cg.position.y=crankY;
    var ax=cyl(0.3,0.3,length+1.4,20,MAT.alu);
    ax.rotation.z=Math.PI/2;cg.add(ax);
    for(var mi=0;mi<=n;mi++){
      var mx=-length/2+0.5+mi*(length-1)/n;
      var mn=cyl(0.5,0.5,0.4,20,MAT.aluD);
      mn.rotation.z=Math.PI/2;mn.position.x=mx;cg.add(mn);
    }
    for(var ci=0;ci<n;ci++){
      var cxx=-length/2+0.85+ci*(length-1.7)/Math.max(1,n-1);
      var o1=ci*Math.PI*2/n;
      var p1=new THREE.Group();
      var pin1=cyl(0.26,0.26,0.5,14,MAT.chrome);
      pin1.rotation.z=Math.PI/2;p1.add(pin1);
      p1.position.set(cxx,Math.sin(o1)*crankR,0);cg.add(p1);
      var cw=new THREE.Group();
      var cwb=cyl(0.68,0.68,0.34,16,MAT.cast);
      cwb.rotation.z=Math.PI/2;cwb.scale.y=0.65;cw.add(cwb);
      cw.position.set(cxx,-Math.sin(o1)*crankR,0);cg.add(cw);
    }
    root.add(cg);sCr(cg);

    var fw=new THREE.Group();
    var fwD=cyl(fwR,fwR,0.32,28,MAT.aluD);
    fwD.rotation.z=Math.PI/2;fw.add(fwD);
    var fwI=cyl(fwR*0.5,fwR*0.5,0.35,20,MAT.cast);
    fwI.rotation.z=Math.PI/2;fw.add(fwI);
    for(var ft=0;ft<36;ft++){
      var th=box(0.32,0.14,0.13,MAT.aluD);
      var a=(ft/36)*Math.PI*2;
      th.position.set(0,Math.cos(a)*(fwR+0.05),Math.sin(a)*(fwR+0.05));
      th.rotation.x=-a;fw.add(th);
    }
    fw.position.set(length/2+0.85,crankY,0);
    root.add(fw);sF(fw);
  }

  /* ============ БЛОК + ГОЛОВКА + КРЫШКА ============ */
  function makeBlock(root,length,blockH,blockD,blockY,diesel){
    // Поддон
    var pan=box(length+0.3,1.1,blockD+0.2,MAT.cast);
    pan.position.y=blockY-blockH/2-0.85;root.add(pan);
    var lip=box(length+0.4,0.14,blockD+0.3,MAT.rib);
    lip.position.y=blockY-blockH/2-0.22;root.add(lip);

    // Прозрачный блок
    var bk=box(length,blockH,blockD,MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);

    // Рёбра на блоке — тонкие
    for(var rr=0;rr<8;rr++){
      var rb=box(length+0.03,0.04,blockD+0.03,MAT.rib);
      rb.position.y=blockY-blockH/2+0.5+rr*(blockH-1.0)/7;
      root.add(rb);pR(rb);
    }

    // Прокладка
    var gk=box(length+0.14,0.1,blockD+0.14,MAT.rib);
    gk.position.y=blockY+blockH/2+0.15;root.add(gk);

    // Головка (сплошная)
    var headH=1.3;
    var headY=blockY+blockH/2+0.15+headH/2;
    var head=box(length+0.1,headH,blockD+0.1,MAT.head);
    head.position.y=headY;root.add(head);pH(head);

    // Болты головки
    for(var b=0;b<4;b++){
      var bolt=cyl(0.07,0.07,0.16,8,MAT.bolt);
      bolt.position.set(
        (b<2?-1:1)*(length/2+0.01),
        headY+headH/2+0.08,
        (b%2===0?-1:1)*(blockD/2+0.01)
      );
      root.add(bolt);
    }

    // Крышка (сплошная, тёмная)
    var covH=0.75;
    var covY=headY+headH/2+covH/2;
    var cover=box(length-0.2,covH,blockD-0.5,MAT.cover);
    cover.position.y=covY;root.add(cover);pC(cover);

    // Заливная горловина
    var cap=cyl(0.22,0.22,0.22,14,MAT.plug);
    cap.position.set(length/2-0.9,covY+covH/2+0.1,0);root.add(cap);
    var cap2=cyl(0.14,0.14,0.06,10,MAT.yellow);
    cap2.position.set(length/2-0.9,covY+covH/2+0.22,0);root.add(cap2);

    // Щуп
    var dip=cyl(0.05,0.05,0.5,8,MAT.aluD);
    dip.position.set(-length/2+0.5,covY+covH/2+0.2,blockD*0.35);root.add(dip);

    return {blockY:blockY,blockH:blockH,blockD:blockD,headY:headY,headH:headH,covY:covY,covH:covH,length:length};
  }

  /* ============ ВПУСК ============ */
  function makeIntake(root,B,n,spacing,blockY){
    var tw=n*spacing;
    var plenumY=blockY+B.blockH/2+B.headH+0.6;
    var plenum=cyl(0.42,0.42,B.length*0.85,18,MAT.intake);
    plenum.rotation.z=Math.PI/2;
    plenum.position.set(0,plenumY,B.blockD/2+0.7);root.add(plenum);

    for(var e=0;e<2;e++){
      var cap=cyl(0.44,0.44,0.15,16,MAT.aluD);
      cap.rotation.z=Math.PI/2;
      cap.position.set((e===0?-1:1)*B.length*0.42,plenumY,B.blockD/2+0.7);
      root.add(cap);
    }

    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var fl=box(0.55,0.15,0.32,MAT.aluD);
      fl.position.set(xx,blockY+B.blockH/2+0.1,B.blockD/2+0.28);
      root.add(fl);
      var runner=cyl(0.22,0.28,plenumY-(blockY+B.blockH/2+0.1),12,MAT.intake);
      runner.position.set(xx,(plenumY+blockY+B.blockH/2)/2,B.blockD/2+0.5);
      root.add(runner);
    }
    var tb=cyl(0.55,0.55,0.4,18,MAT.aluD);
    tb.rotation.z=Math.PI/2;
    tb.position.set(-B.length*0.5,plenumY,B.blockD/2+0.7);root.add(tb);
  }

  /* ============ ВЫПУСК ============ */
  function makeExhaust(root,B,n,spacing,blockY){
    var tw=n*spacing;
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var fl=box(0.55,0.15,0.32,MAT.exhaust);
      fl.position.set(xx,blockY+B.blockH/2+0.1,-B.blockD/2-0.28);root.add(fl);
      var runner=cyl(0.22,0.26,0.7,12,MAT.exhaust);
      runner.position.set(xx,blockY+B.blockH/2-0.5,-B.blockD/2-0.5);
      runner.rotation.x=Math.PI/7;root.add(runner);
    }
    var header=cyl(0.38,0.38,B.length*0.85,16,MAT.exhaust);
    header.rotation.z=Math.PI/2;
    header.position.set(0,blockY-B.blockH/2-0.6,-B.blockD/2-0.9);
    root.add(header);
  }

  /* ============ ТУРБИНА ============ */
  function makeTurbo(root,B,blockY){
    var g=new THREE.Group();
    var comp=cyl(0.75,0.9,0.85,22,MAT.alu);comp.rotation.z=Math.PI/2;g.add(comp);
    var compS=tor(0.85,0.3,10,22,MAT.alu);
    compS.rotation.y=Math.PI/2;compS.position.x=-0.15;g.add(compS);
    var turb=cyl(0.6,0.75,0.75,20,MAT.cast);
    turb.rotation.z=Math.PI/2;turb.position.x=1.1;g.add(turb);
    var turbS=tor(0.7,0.26,10,20,MAT.cast);
    turbS.rotation.y=Math.PI/2;turbS.position.x=1.2;g.add(turbS);
    var axis=cyl(0.1,0.1,2.7,10,MAT.chrome);
    axis.rotation.z=Math.PI/2;axis.position.x=0.45;g.add(axis);
    var wg=cyl(0.3,0.3,0.5,14,MAT.aluD);
    wg.position.set(1.1,0.85,0.2);g.add(wg);
    g.position.set(B.length/2+0.7,blockY-B.blockH/2-0.4,-B.blockD/2-1.1);
    root.add(g);
    if(!window._dciPartsArr)window._dciPartsArr=[];
    window._dciPartsArr.push({turbo:g});

    var ic=box(2.2,1.0,0.4,MAT.alu);
    ic.position.set(0,blockY+B.blockH/2+2.0,-B.blockD/2-2.0);root.add(ic);
    for(var f=0;f<12;f++){
      var fin=box(0.04,0.95,0.42,MAT.aluD);
      fin.position.set(-1.0+f*0.18,blockY+B.blockH/2+2.0,-B.blockD/2-2.0);
      root.add(fin);
    }
  }

  /* ============ БАЗА РЯДНОГО ============ */
  function inlineBase(root,opt){
    var n=opt.n||4, spacing=opt.spacing||2.2;
    var tw=n*spacing;
    var length=tw+1.6;
    var blockD=opt.d||4.8, blockH=opt.h||4.5;
    var blockY=opt.y||3.5;
    var diesel=!!opt.diesel;
    var pistonR=opt.pR||1.0;
    var pH=opt.pH||0.9;

    makeCrank(root,length,blockY-blockH/2-1.0,n,0.8,opt.fwR||2.3);
    var B=makeBlock(root,length,blockH,blockD,blockY,diesel);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylUnit({
        x:xx, z:0, blockY:blockY, blockH:blockH, radius:pistonR,
        phase:i*Math.PI, crankR:0.8, rodLen:blockH*0.75, pH:pH
      });
      root.add(a.g);arr.push(a);
    }
    sA(arr);
    makeIntake(root,B,n,spacing,blockY);
    makeExhaust(root,B,n,spacing,blockY);
    if(diesel)makeTurbo(root,B,blockY);
    return B;
  }

  function buildR4(root){inlineBase(root,{n:4});}
  function buildTDI(root){inlineBase(root,{n:4,diesel:true});}
  function buildDCi(root){inlineBase(root,{n:4,diesel:true});}
  function buildPassatB3(root){inlineBase(root,{n:4});}
  function buildBluebird(root){inlineBase(root,{n:4});}

  function buildScooter(root){
    var B=inlineBase(root,{n:1,spacing:1.8,d:3.2,h:3.4,y:2.6,pR:1.0,pH:0.85,fwR:1.3});
    var carb=box(0.7,0.7,0.7,MAT.aluD);
    carb.position.set(0,B.blockY+B.blockH/2+B.headH+0.5,B.blockD/2+0.4);root.add(carb);
    var filter=cyl(0.5,0.5,0.4,16,MAT.rubber);
    filter.rotation.z=Math.PI/2;
    filter.position.set(0,B.blockY+B.blockH/2+B.headH+0.5,B.blockD/2+1.0);root.add(filter);
    var cvt=cyl(1.0,1.0,0.4,22,MAT.aluD);
    cvt.rotation.z=Math.PI/2;
    cvt.position.set(B.length/2+1.0,B.blockY-0.5,-0.8);root.add(cvt);
  }

  function buildI6(root){
    var n=6,spacing=2.0;
    var tw=n*spacing;
    var length=tw+1.6;
    var blockD=4.8,blockH=5.0,blockY=3.8;
    makeCrank(root,length,blockY-blockH/2-1.0,n,0.85,2.4);
    var B=makeBlock(root,length,blockH,blockD,blockY,false);
    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylUnit({
        x:xx, z:0, blockY:blockY, blockH:blockH, radius:1.05,
        phase:i*Math.PI, crankR:0.85, rodLen:blockH*0.75, pH:0.95
      });
      root.add(a.g);arr.push(a);
    }
    sA(arr);
    makeIntake(root,B,n,spacing,blockY);
    makeExhaust(root,B,n,spacing,blockY);
    makeTurbo(root,B,blockY);
  }

  /* ============ V-ОБРАЗНЫЕ ============ */
  function buildVBase(root,totalN,half,bankDist,scale){
    var perRow=Math.floor(totalN/2);
    var spacing=2.1*scale;
    var tw=perRow*spacing;
    var length=tw+2.0;
    var blockY=3.6;
    var blockH=4.6*scale;
    var bankW=2.4*scale;
    var bankH=blockH;
    var crankY=blockY-blockH/2-1.0;
    var crankR=0.85;
    var rodLen=blockH*0.75;

    makeCrank(root,length,crankY,perRow,crankR,2.6*scale);

    var pan=box(length+0.4,1.3,bankDist*2+3.0*scale,MAT.cast);
    pan.position.y=crankY-0.9;root.add(pan);

    var arr=[];
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      // Блок (полупрозрачный)
      var bk=box(length,bankH,bankW,MAT.block);
      bk.position.set(0,blockY,sign*bankDist);
      bk.rotation.x=sign*half;root.add(bk);pB(bk);
      // Рёбра
      for(var rr=0;rr<6;rr++){
        var rb=box(length+0.03,0.04,bankW+0.03,MAT.rib);
        rb.position.set(0,blockY-bankH/2+0.5+rr*(bankH-1.0)/5,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }
      // Головка
      var headH=1.2;
      var headY=blockY+bankH/2+0.15+headH/2;
      var hd=box(length+0.1,headH,bankW+0.1,MAT.head);
      hd.position.set(0,headY,sign*(bankDist+0.6*scale));
      hd.rotation.x=sign*half;root.add(hd);pH(hd);
      // Крышка
      var covH=0.7;
      var covY=headY+headH/2+covH/2;
      var cv=box(length-0.2,covH,bankW-0.3,MAT.cover);
      cv.position.set(0,covY,sign*(bankDist+0.7*scale));
      cv.rotation.x=sign*half;root.add(cv);pC(cv);
      // Цилиндры
      for(var j=0;j<perRow;j++){
        var xx=-tw/2+spacing/2+j*spacing;
        var off=(side===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makeCylUnit({
          x:xx, z:sign*bankDist, blockY:blockY, blockH:bankH,
          radius:0.95*scale, phase:off, crankR:crankR, rodLen:rodLen, pH:0.85*scale
        });
        a.g.rotation.x=sign*half;
        // Компенсация: сдвигаем вверх, чтобы дно поршня было у верха блока
        a.g.position.y=0;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);

    // Впуск в развале
    var plenumY=blockY+blockH/2+2.2;
    var plenum=cyl(0.5,0.5,length*0.85,18,MAT.intake);
    plenum.rotation.z=Math.PI/2;
    plenum.position.set(0,plenumY,0);root.add(plenum);
    for(var s=0;s<2;s++){
      var sg=s===0?-1:1;
      var ex=cyl(0.35,0.35,length*0.85,16,MAT.exhaust);
      ex.rotation.z=Math.PI/2;
      ex.position.set(0,blockY-blockH/2-0.5,sg*(bankDist+1.6*scale));
      root.add(ex);
    }
  }
  function buildV6(root){buildVBase(root,6,Math.PI/6,1.7,1.0);}
  function buildV8(root){buildVBase(root,8,Math.PI/6,1.8,1.0);}
  function buildV12(root){buildVBase(root,12,Math.PI/6,2.0,1.0);}
  function buildV16(root){buildVBase(root,16,Math.PI/6,2.1,1.0);}
  function buildV22(root){buildVBase(root,22,Math.PI/4,2.4,1.0);}

  /* ============ BOXER ============ */
  function buildBoxer(root){
    var n=2,spacing=2.6;
    var tw=n*spacing;
    var length=tw+2.0;
    var blockY=3.2,blockH=3.6,blockD=4.2;
    var crankY=blockY-blockH/2-1.0;
    var crankR=0.8,rodLen=blockH*0.85;

    makeCrank(root,length,crankY,n,crankR,2.5);
    var pan=box(length+0.5,1.2,blockD+0.3,MAT.cast);
    pan.position.y=crankY-0.7;root.add(pan);

    var bk=box(length,blockH,2.4,MAT.block);
    bk.position.y=blockY;root.add(bk);pB(bk);
    for(var rr=0;rr<5;rr++){
      var rb=box(length+0.03,0.04,2.5,MAT.rib);
      rb.position.y=blockY-blockH/2+0.4+rr*(blockH-0.8)/4;root.add(rb);pR(rb);
    }

    var headY=blockY;
    var headH=2.4;
    var arr=[];
    for(var s=0;s<2;s++){
      var sign=s===0?-1:1;
      var hd=box(length+0.1,headH,1.2,MAT.head);
      hd.position.set(0,headY,sign*(blockD/2+0.6));
      hd.rotation.x=sign*Math.PI/2;root.add(hd);pH(hd);
      var cv=box(length-0.2,headH*0.9,0.9,MAT.cover);
      cv.position.set(0,headY,sign*(blockD/2+1.1));
      cv.rotation.x=sign*Math.PI/2;root.add(cv);pC(cv);
      for(var j=0;j<n;j++){
        var xx=-tw/2+spacing/2+j*spacing;
        var off=(s===0?j*Math.PI:j*Math.PI+Math.PI);
        var a=makeCylUnit({
          x:xx, z:sign*(blockD/2+0.4), blockY:headY, blockH:headH*0.8,
          radius:0.9, phase:off, crankR:crankR, rodLen:rodLen, pH:0.8
        });
        a.g.rotation.x=sign*Math.PI/2;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
  }

  /* ============ RADIAL ============ */
  function buildRadial(root){
    var n=9;
    var step=Math.PI*2/n;
    var R_cyl=3.2;
    var cylLen=3.0;
    var crankR=0.7;
    var rodLen=2.6;

    // Картер
    var carter=cyl(3.6,3.6,1.0,36,MAT.cast);
    carter.rotation.x=Math.PI/2;carter.position.set(0,3,0);root.add(carter);

    // Коленвал
    var crank=cyl(0.45,0.45,3.0,20,MAT.chrome);
    crank.rotation.x=Math.PI/2;crank.position.set(0,3,0);root.add(crank);sCr(crank);

    // Ось
    var axis=cyl(0.28,0.28,4.0,16,MAT.alu);
    axis.rotation.x=Math.PI/2;axis.position.set(0,3,2.0);root.add(axis);

    // Маховик
    var fw=new THREE.Group();
    var fwD=cyl(2.2,2.2,0.35,32,MAT.aluD);
    fwD.rotation.x=Math.PI/2;fw.add(fwD);
    for(var ft=0;ft<32;ft++){
      var th=box(0.3,0.2,0.14,MAT.aluD);
      var a=(ft/32)*Math.PI*2;
      th.position.set(Math.cos(a)*2.3,Math.sin(a)*2.3,0);
      th.rotation.z=a;fw.add(th);
    }
    fw.position.set(0,3,3.0);root.add(fw);sF(fw);

    // Цилиндры вокруг
    var arr=[];
    for(var i=0;i<n;i++){
      var a=i*step-Math.PI/2;
      var cx=Math.cos(a)*R_cyl;
      var cyy=3+Math.sin(a)*R_cyl;

      var grp=new THREE.Group();
      grp.position.set(cx,cyy,0);
      grp.rotation.z=a-Math.PI/2;
      root.add(grp);

      var shell=new THREE.Mesh(
        new THREE.CylinderGeometry(0.95,0.95,cylLen,22,1,true),
        MAT.block);
      shell.position.y=cylLen/2;grp.add(shell);
      pB(shell);

      var hd=cyl(1.05,1.05,0.45,22,MAT.head);
      hd.position.y=cylLen+0.22;grp.add(hd);pH(hd);

      var plug=cyl(0.12,0.12,0.5,10,MAT.plug);
      plug.position.y=cylLen+0.6;grp.add(plug);

      var piston=makePiston(0.82,0.8);
      piston.position.y=cylLen*0.5;grp.add(piston);

      var rod=makeRod(1.6);
      rod.position.y=-0.4;grp.add(rod);

      arr.push({
        g:grp, p:piston, rod:rod,
        rodBaseLen:1.6,
        off:i*step-Math.PI/2,
        crankR:0.7, rodLen:1.6, pH:0.8
      });
    }
    sA(arr);
  }

  /* ============ ТРАКТОР ============ */
  function buildTractor(root){
    var n=4,spacing=2.7;
    var tw=n*spacing;
    var length=tw+2.2;
    var blockH=5.5,blockD=5.5,blockY=4.0;
    var crankY=blockY-blockH/2-1.0;
    var crankR=0.9,rodLen=blockH*0.75;

    makeCrank(root,length,crankY,n,crankR,3.0);
    var B=makeBlock(root,length,blockH,blockD,blockY,true);

    var arr=[];
    for(var i=0;i<n;i++){
      var xx=-tw/2+spacing/2+i*spacing;
      var a=makeCylUnit({
        x:xx, z:0, blockY:blockY, blockH:blockH, radius:1.2,
        phase:i*Math.PI, crankR:crankR, rodLen:rodLen, pH:1.05
      });
      root.add(a.g);arr.push(a);
    }
    sA(arr);

    var tank=box(length*0.55,2.0,2.0,MAT.yellow);
    tank.position.set(-length/2-2.0,blockY+1.5,0);root.add(tank);

    var pump=box(2.2,2.0,2.0,MAT.aluD);
    pump.position.set(length/2+1.0,B.covY+0.5,blockD/2-0.3);root.add(pump);

    var af=cyl(0.95,0.95,2.4,20,MAT.aluD);
    af.rotation.z=Math.PI/2;
    af.position.set(-length/2+1.8,B.covY+1.8,0);root.add(af);

    var ex=cyl(0.36,0.36,7.5,14,MAT.exhaust);
    ex.position.set(length/2-1.5,B.covY+2.5,0);root.add(ex);

    var rad=box(3.4,3.0,0.5,MAT.aluD);
    rad.position.set(length/2+2.6,blockY,0);root.add(rad);
    for(var rf=0;rf<14;rf++){
      var fin=box(3.3,0.06,0.5,MAT.alu);
      fin.position.set(length/2+2.6,block