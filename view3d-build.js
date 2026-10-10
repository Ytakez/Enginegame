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

  /* ==================== КАМЕРА ЦИЛИНДРА ==================== */
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
    for(var k=0;k<3;k++){
      var rg=cy(o.r+0.03,0.06,18,0x2a333f,0.6,0.7);
      rg.position.y=o.r*0.3-k*o.r*0.2;p.add(rg);
    }
    var pin=cy(o.r*0.15,o.r*1.1,10,0x2a3543,0.9,0.3);
    pin.rotation.z=Math.PI/2;p.add(pin);
    g.add(p);

    var rod=bx(o.r*0.3,o.h*0.5,o.r*0.3,0x8894a2,0.9,0.25);g.add(rod);

    var ign=new THREE.Group();
    if(o.diesel){
      ign.add(cy(o.r*0.15,o.r*0.5,10,0x3a3a3a,0.7,0.4));
    } else {
      ign.add(cy(o.r*0.13,o.r*0.5,10,0xe8e4dc,0.3,0.5));
    }
    ign.position.y=o.h+0.4;g.add(ign);

    var vv=[];
    for(var s=0;s<2;s++){
      var vg=new THREE.Group();
      vg.add(cy(o.r*0.28,0.1,12,s===0?0x6fd0ff:0xff8a6f,0.75,0.4));
      vg.position.set((s===0?-1:1)*o.r*0.4,o.h+0.05,0);
      g.add(vg);vv.push(vg);
    }
    return {g:g,p:p,rod:rod,vv:vv,x:o.x,y:o.y,z:o.z,h:o.h,r:o.r,off:o.off||0};
  }

  /* ==================== КОЛЕНВАЛ + МАХОВИК ==================== */
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
    fw.position.set(blockLen/2+0.7,y,0);root.add(fw);sF(fw);
  }

  /* ==================== ШКИВЫ ГРМ ==================== */
  function makeBeltsAndCams(root,blockLen,totalWidth,perRow){
    var bt=new THREE.Group();
    var gt=cy(0.9,0.4,20,0x8a95a3,0.9,0.3);gt.rotation.z=Math.PI/2;bt.add(gt);
    for(var gtt=0;gtt<16;gtt++){
      var tg=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a2=(gtt/16)*Math.PI*2;
      tg.position.set(0,Math.cos(a2)*0.95,Math.sin(a2)*0.95);
      tg.rotation.x=-a2;bt.add(tg);
    }
    bt.position.set(-blockLen/2-0.7,6.2,0);root.add(bt);sCam(bt);

    var bb=new THREE.Group();
    var gb=cy(1.3,0.4,20,0x8a95a3,0.9,0.3);gb.rotation.z=Math.PI/2;bb.add(gb);
    for(var gbt=0;gbt<22;gbt++){
      var tg2=bx(0.24,0.2,0.14,0x6a7685,0.9,0.3);
      var a3=(gbt/22)*Math.PI*2;
      tg2.position.set(0,Math.cos(a3)*1.35,Math.sin(a3)*1.35);
      tg2.rotation.x=-a3;bb.add(tg2);
    }
    bb.position.set(-blockLen/2-0.7,0.6,0);root.add(bb);

    var beltMat=new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.2,roughness:0.9});
    var b1=new THREE.Mesh(new THREE.BoxGeometry(0.15,5.6,0.7),beltMat);
    b1.position.set(-blockLen/2-1.5,3.4,0);root.add(b1);
    var b2=new THREE.Mesh(new THREE.BoxGeometry(0.15,5.6,1.0),beltMat);
    b2.position.set(-blockLen/2+0.1,3.4,0);root.add(b2);

    var cs=new THREE.Group();
    var ca=cy(0.25,blockLen+1,16,0xa8b4c0,0.95,0.2);
    ca.rotation.z=Math.PI/2;cs.add(ca);
    cs.position.y=6.4;root.add(cs);
    var camArr=[];
    for(var cc=0;cc<perRow*2;cc++){
      var cg2=new THREE.Group();
      var cd=cy(0.32,0.3,16,0x8a95a3,0.9,0.3);cd.rotation.z=Math.PI/2;cg2.add(cd);
      var cx2=-totalWidth/2+0.5+cc*(totalWidth-1)/Math.max(1,perRow*2-1);
      cg2.position.set(cx2,0,0);cs.add(cg2);
      camArr.push({grp:cg2,off:cc*Math.PI*1.5/Math.max(1,perRow*2)});
    }
    sC(camArr);
  }

  /* ==================== R4 / R1 ==================== */
  function buildInline(root,cfg){
    var perRow=cfg.n||4;
    var spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var pod=bx(blockLen,1.2,5,0x2a3340,0.7,0.5);pod.position.y=-0.6;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.2);
    var bk=bx(blockLen,5,5,0x4a5566,0.85,0.4);bk.position.y=3.4;root.add(bk);pB(bk);
    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.05,0.06,5.05,0x2a3340,0.6,0.6);
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }
    var hd=bx(blockLen+0.2,1.4,5.3,0x3a4756,0.85,0.35);hd.position.y=6.4;root.add(hd);pH(hd);
    var cv=bx(blockLen,0.8,5,0x2a3340,0.75,0.4);cv.position.y=7.5;root.add(cv);pC(cv);
    var inMan=cy(0.34,blockLen*0.9,14,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,5.8,2.5);root.add(inMan);
    var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.3,-2.5);root.add(exMan);
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y:1.1,z:0,r:1.15,h:4.6,diesel:cfg.diesel,off:i*Math.PI});
      root.add(a4.g);arr.push(a4);
    }
    sA(arr);
    makeBeltsAndCams(root,blockLen,totalWidth,perRow);
  }

  /* ==================== V-ДВИГАТЕЛЬ ==================== */
  function buildV(root,cfg){
    var totalN=cfg.n;
    var perRow=Math.floor(totalN/2);
    var spacing=2.0;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.8;
    var half=Math.PI/6;
    var bankDist=1.8;
    var pod=bx(blockLen+0.4,1.2,7.5,0x2a2a2a,0.7,0.5);pod.position.y=-0.9;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.6);
    for(var side=0;side<2;side++){
      var sign=side===0?-1:1;
      var bk=bx(blockLen,5.0,2.8,0x4a5566,0.85,0.4);
      bk.position.set(0,3.4,sign*bankDist);bk.rotation.x=sign*half;root.add(bk);pB(bk);
      for(var rr=0;rr<8;rr++){
        var rb=bx(blockLen+0.05,0.06,2.85,0x1a1a1a,0.6,0.6);
        rb.position.set(0,1.3+rr*0.55,sign*bankDist);
        rb.rotation.x=sign*half;root.add(rb);pR(rb);
      }
      var hd=bx(blockLen+0.2,1.3,3.0,0x3a4756,0.85,0.35);
      hd.position.set(0,6.4,sign*(bankDist+1.1));hd.rotation.x=sign*half;root.add(hd);pH(hd);
      var cv=bx(blockLen,0.8,2.7,0x2a3340,0.75,0.4);
      cv.position.set(0,7.4,sign*(bankDist+1.4));cv.rotation.x=sign*half;root.add(cv);pC(cv);
      var inMan=cy(0.32,blockLen*0.9,14,0x3a4654,0.85,0.4);
      inMan.rotation.z=Math.PI/2;inMan.position.set(0,5.9,sign*(bankDist+2.2));root.add(inMan);
      var exMan=cy(0.36,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
      exMan.rotation.z=Math.PI/2;exMan.position.set(0,0.5,sign*0.5);root.add(exMan);
    }
    var arr=[];
    for(var s2=0;s2<2;s2++){
      var sg=s2===0?-1:1;
      for(var j=0;j<perRow;j++){
        var xx=-totalWidth/2+spacing/2+j*spacing;
        var off=(s2===0?j*Math.PI*2/perRow:(j*Math.PI*2/perRow)+Math.PI);
        var a=makeCylAss({x:xx,y:1.1,z:sg*bankDist,r:1.0,h:4.6,diesel:false,off:off});
        a.g.rotation.x=sg*half;
        root.add(a.g);arr.push(a);
      }
    }
    sA(arr);
    makeBeltsAndCams(root,blockLen,totalWidth,perRow);
  }

  /* ==================== ДИЗЕЛЬ R4 ==================== */
  function buildDieselR4(root,cfg){
    var perRow=4,spacing=2.2;
    var totalWidth=perRow*spacing;
    var blockLen=totalWidth+1.5;
    var pod=bx(blockLen+0.4,1.4,5.2,0x2a2a2a,0.7,0.5);pod.position.y=-0.7;root.add(pod);
    makeCrankAndFly(root,blockLen,0.6,perRow,2.2);
    var bk=bx(blockLen,5,5,0x3a3a3a,0.8,0.5);bk.position.y=3.4;root.add(bk);pB(bk);
    for(var rr=0;rr<9;rr++){
      var rb=bx(blockLen+0.06,0.08,5.05,0x1a1a1a,0.6,0.6);
      rb.position.y=1.2+rr*0.55;root.add(rb);pR(rb);
    }
    var hd=bx(blockLen+0.2,1.4,5.3,0x4a4a4a,0.85,0.4);hd.position.y=6.4;root.add(hd);pH(hd);
    var cv=bx(blockLen,0.8,5,0x2a2a2a,0.75,0.4);cv.position.y=7.5;root.add(cv);pC(cv);
    var inMan=cy(0.32,blockLen*0.9,16,0x3a4654,0.85,0.4);
    inMan.rotation.z=Math.PI/2;inMan.position.set(0,5.6,2.5);root.add(inMan);
    var exMan=cy(0.42,blockLen*0.9,14,0x4a3a2a,0.85,0.5);
    exMan.rotation.z=Math.PI/2;exMan.position.set(0,-0.2,-2.5);root.add(exMan);
    var turbo=new THREE.Group();
    var tb=cy(0.9,0.7,20,0x4a5566,0.85,0.4);tb.rotation.z=Math.PI/2;turbo.add(tb);
    var snail=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.16,8,20),m(0x6a7685,0.9,0.3));
    snail.rotation.y=Math.PI/2;turbo.add(snail);
    turbo.position.set(blockLen/2+0.3,-0.3,-2.5);root.add(turbo);
    window._dciParts={turbo:turbo};
    var pump=bx(1.8,1.5,1.7,0x3a4654,0.85,0.4);
    pump.position.set(blockLen/2+0.5,7.5,-2.5);root.add(pump);
    var rail=cy(0.16,blockLen*0.85,14,0xc8d4e0,0.98,0.1);
    rail.rotation.z=Math.PI/2;rail.position.set(0,6.9,-1.5);root.add(rail);
    for(var t=0;t<perRow;t++){
      var tx=-totalWidth/2+spacing/2+t*spacing;
      var inj=cy(0.16,0.55,10,0x4a4d54,0.85,0.3);
      inj.position.set(tx,7.4,-0.5);root.add(inj);
    }
    var arr=[];
    for(var i=0;i<perRow;i++){
      var xx=-totalWidth/2+spacing/2+i*spacing;
      var a4=makeCylAss({x:xx,y