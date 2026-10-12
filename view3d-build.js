(function(){
"use strict";
var S = window.S;
if (!S) return;

function waitRef(){
  if (!window.DVS_3D_REF || !window.DVS_3D_BUILD) {
    setTimeout(waitRef, 150);
    return;
  }
  var R = window.DVS_3D_REF;
  var B = window.DVS_3D_BUILD;
  var cy = B.cy;
  var bx = B.bx;

  function M(c, mt, rg, op, tr){
    var o = {
      color: c,
      metalness: mt === undefined ? 0.8 : mt,
      roughness: rg === undefined ? 0.4 : rg
    };
    if (op !== undefined) { o.transparent = true; o.opacity = op; }
    if (tr) o.side = THREE.DoubleSide;
    var mm = new THREE.MeshStandardMaterial(o);
    mm.userData = { baseOp: op !== undefined ? op : 1 };
    return mm;
  }

  var MAT = {
    glass:  M(0x9ecfff, 0.10, 0.05, 0.22, true),
    glassD: M(0x6aaeff, 0.20, 0.10, 0.35, true),
    dark:   M(0x1a1d22, 0.40, 0.75),
    darkB:  M(0x25292f, 0.50, 0.60),
    ring:   M(0xc8d8e8, 0.90, 0.15),
    rod:    M(0x8a95a2, 0.92, 0.15),
    crank:  M(0x6a7580, 0.95, 0.12),
    crankJ: M(0x9aa5b0, 1.00, 0.10),
    cw:     M(0x4a535e, 0.70, 0.40),
    fly:    M(0x707a85, 0.90, 0.20),
    metal:  M(0xb0b8c0, 0.95, 0.20),
    bolt:   M(0xd0d8e0, 1.00, 0.15),
    rail:   M(0x3a424a, 0.85, 0.30),
    head:   M(0x586270, 0.75, 0.35),
    cover:  M(0x272c34, 0.55, 0.55),
    oil:    M(0xb08050, 0.50, 0.55),
    int:    M(0x546070, 0.70, 0.40),
    exh:    M(0x6a4a30, 0.60, 0.65),
    alu:    M(0xa8b0ba, 0.90, 0.22),
    aluD:   M(0x6a727c, 0.85, 0.35),
    turbo:  M(0x8895a2, 0.90, 0.20),
    turboH: M(0x4a4a4a, 0.60, 0.70),
    yellow: M(0xd8b840, 0.60, 0.40),
    red:    M(0xc02020, 0.50, 0.60)
  };

  function cyl(r1, r2, h, s, mat){
    return new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, s || 22), mat);
  }
  function box(w, h, d, mat){
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  }
  function tor(rad, tube, s, ts, mat){
    return new THREE.Mesh(new THREE.TorusGeometry(rad, tube, s || 8, ts || 24), mat);
  }
  function pB(x){ if (x && R.pushBlock) R.pushBlock(x); }
  function pH(x){ if (x && R.pushHead) R.pushHead(x); }
  function pC(x){ if (x && R.pushCover) R.pushCover(x); }
  function sA(x){ if (R.setAsm) R.setAsm(x); }
  function sCr(x){ if (R.setCrank) R.setCrank(x); }
  function sF(x){ if (R.setFly) R.setFly(x); }

  function makeBrandTex(t, bg, fg){
    var cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 256;
    var c = cv.getContext('2d');
    c.fillStyle = bg;
    c.fillRect(0, 0, 1024, 256);
    c.strokeStyle = fg;
    c.lineWidth = 8;
    c.strokeRect(12, 12, 1000, 232);
    c.fillStyle = fg;
    c.font = 'bold 130px Arial';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(t, 512, 138);
    var tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    return tex;
  }

  function addPlate(root, x, y, z, w, h, t, bg, fg){
    var tex = makeBrandTex(t, bg, fg);
    var mat = new THREE.MeshStandardMaterial({
      map: tex, metalness: 0.3, roughness: 0.6,
      side: THREE.DoubleSide
    });
    var pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    pl.position.set(x, y, z);
    pl.rotation.x = -Math.PI / 2;
    root.add(pl);
    pC(pl);
  }

  function makePiston(r, h){
    var g = new THREE.Group();
    g.add(cyl(r, r, h, 26, MAT.dark));
    var sk = cyl(r * 0.98, r * 0.9, h * 0.35, 26, MAT.darkB);
    sk.position.y = -h * 0.3;
    g.add(sk);
    for (var k = 0; k < 3; k++){
      var rg = tor(r * 0.99, 0.045, 6, 26, MAT.ring);
      rg.rotation.x = Math.PI / 2;
      rg.position.y = h * 0.32 - k * h * 0.13;
      g.add(rg);
    }
    var tp = cyl(r * 0.99, r * 0.99, 0.04, 26, MAT.darkB);
    tp.position.y = h * 0.5;
    g.add(tp);
    return g;
  }

  function makeRod(len){
    var g = new THREE.Group();
    g.add(box(0.11, len * 0.9, 0.18, MAT.rod));
    var sm = cyl(0.14, 0.14, 0.26, 14, MAT.metal);
    sm.rotation.z = Math.PI / 2;
    sm.position.y = len / 2;
    g.add(sm);
    var bg = tor(0.19, 0.075, 10, 20, MAT.metal);
    bg.rotation.y = Math.PI / 2;
    bg.position.y = -len / 2;
    g.add(bg);
    return g;
  }

  function makeCyl(cfg){
    var g = new THREE.Group();
    g.position.set(cfg.x, 0, cfg.z);
    var sl = new THREE.Mesh(
      new THREE.CylinderGeometry(cfg.r, cfg.r, cfg.cylH, 24, 1, true),
      MAT.glassD
    );
    sl.position.y = cfg.cylY;
    g.add(sl);
    pB(sl);
    var tr = tor(cfg.r * 1.02, 0.06, 8, 24, MAT.metal);
    tr.rotation.x = Math.PI / 2;
    tr.position.y = cfg.cylY + cfg.cylH / 2;
    g.add(tr);
    var br = tor(cfg.r * 1.02, 0.06, 8, 24, MAT.metal);
    br.rotation.x = Math.PI / 2;
    br.position.y = cfg.cylY - cfg.cylH / 2;
    g.add(br);
    var p = makePiston(cfg.r * 0.92, cfg.pH);
    g.add(p);
    var r = makeRod(cfg.rodLen);
    g.add(r);
    return {
      g: g, p: p, rod: r,
      off: cfg.off || 0,
      crankR: cfg.crankR,
      rodLen: cfg.rodLen,
      crankY: cfg.crankY
    };
  }

function makeCrank(root, length, crankY, n, crankR, fwR){
  var cg = new THREE.Group();
  cg.position.y = crankY;
  var ax = cyl(0.22, 0.22, length + 1.4, 24, MAT.crank);
  ax.rotation.z = Math.PI / 2;
  cg.add(ax);
  for (var mi = 0; mi <= n; mi++){
    var mx = -length / 2 + 0.5 + mi * (length - 1) / n;
    var mn = cyl(0.42, 0.42, 0.32, 22, MAT.crankJ);
    mn.rotation.z = Math.PI / 2;
    mn.position.x = mx;
    cg.add(mn);
  }
  for (var ci = 0; ci < n; ci++){
    var cxx = -length / 2 + 0.85 + ci * (length - 1.7) / Math.max(1, n - 1);
    var o1 = ci * Math.PI * 2 / n;
    var pg = new THREE.Group();
    var pin = cyl(0.2, 0.2, 0.42, 18, MAT.crankJ);
    pin.rotation.z = Math.PI / 2;
    pg.add(pin);
    pg.position.set(cxx, Math.sin(o1) * crankR, 0);
    cg.add(pg);
    var cwg = new THREE.Group();
    var cwb = cyl(0.52, 0.52, 0.28, 18, MAT.cw);
    cwb.rotation.z = Math.PI / 2;
    cwb.scale.set(1, 1, 0.7);
    cwg.add(cwb);
    cwg.position.set(cxx, -Math.sin(o1) * crankR, 0);
    cg.add(cwg);
  }
  root.add(cg);
  sCr(cg);

  var fw = new THREE.Group();
  var fwD = cyl(fwR, fwR, 0.28, 32, MAT.fly);
  fwD.rotation.z = Math.PI / 2;
  fw.add(fwD);
  var fwI = cyl(fwR * 0.45, fwR * 0.45, 0.32, 22, MAT.crank);
  fwI.rotation.z = Math.PI / 2;
  fw.add(fwI);
  for (var ft = 0; ft < 40; ft++){
    var th = box(0.3, 0.11, 0.11, MAT.crank);
    var a = (ft / 40) * Math.PI * 2;
    th.position.set(0, Math.cos(a) * (fwR + 0.04), Math.sin(a) * (fwR + 0.04));
    th.rotation.x = -a;
    fw.add(th);
  }
  fw.position.set(length / 2 + fwR + 0.15, crankY, 0);
  root.add(fw);
  sF(fw);

  var pulley = new THREE.Group();
  var pD = cyl(0.9, 0.9, 0.35, 24, MAT.crankJ);
  pD.rotation.z = Math.PI / 2;
  pulley.add(pD);
  for (var pt = 0; pt < 20; pt++){
    var tooth = box(0.35, 0.11, 0.11, MAT.crank);
    var ta = (pt / 20) * Math.PI * 2;
    tooth.position.set(0, Math.cos(ta) * 0.95, Math.sin(ta) * 0.95);
    tooth.rotation.x = -ta;
    pulley.add(tooth);
  }
  pulley.position.set(-length / 2 - fwR - 0.15, crankY, 0);
  root.add(pulley);

  var belt = tor(1.0, 0.08, 10, 32, MAT.darkB);
  belt.rotation.y = Math.PI / 2;
  belt.position.set(-length / 2 - fwR - 0.15, crankY, 0);
  root.add(belt);
}

function makeHead(root, length, blockH, blockD, blockY){
  var headH = 1.1;
  var headY = blockY + blockH / 2 + 0.15 + headH / 2;
  var hd = box(length + 0.1, headH, blockD + 0.1, MAT.head);
  hd.position.y = headY;
  root.add(hd);
  pH(hd);
  for (var b = 0; b < 4; b++){
    var bolt = cyl(0.07, 0.07, 0.16, 10, MAT.bolt);
    bolt.position.set(
      (b < 2 ? -1 : 1) * (length / 2 + 0.01),
      headY + headH / 2 + 0.08,
      (b % 2 === 0 ? -1 : 1) * (blockD / 2 + 0.01)
    );
    root.add(bolt);
  }
  var covH = 0.6;
  var covY = headY + headH / 2 + covH / 2;
  var cv = box(length - 0.15, covH, blockD - 0.5, MAT.cover);
  cv.position.y = covY;
  root.add(cv);
  pC(cv);
  var cap = cyl(0.2, 0.2, 0.2, 12, MAT.darkB);
  cap.position.set(length / 2 - 0.8, covY + covH / 2 + 0.1, 0);
  root.add(cap);

  var nSp = Math.round((length - 1) / 2.2) + 1;
  for (var sp = 0; sp < nSp; sp++){
    var sx = -length / 2 + 1 + sp * (length - 2) / Math.max(1, nSp - 1);
    var plug = cyl(0.12, 0.12, 0.55, 10, MAT.darkB);
    plug.position.set(sx, covY + covH / 2 + 0.28, 0);
    root.add(plug);
    var pt2 = cyl(0.15, 0.15, 0.12, 10, MAT.metal);
    pt2.position.set(sx, covY + covH / 2 + 0.6, 0);
    root.add(pt2);
    var wire = box(0.08, 0.6, 0.08, MAT.red);
    wire.position.set(sx, covY + covH / 2 + 0.9, 0);
    root.add(wire);
  }
  return { headY: headY, headH: headH, covY: covY, covH: covH };
}

function makeGlassBox(root, length, blockH, blockD, blockY){
  var bk = box(length, blockH, blockD, MAT.glass);
  bk.position.y = blockY;
  root.add(bk);
  pB(bk);

  var pan = box(length + 0.2, 0.6, blockD + 0.15, MAT.oil);
  pan.position.y = blockY - blockH / 2 - 0.5;
  root.add(pan);

  var oilF = cyl(0.32, 0.32, 0.6, 18, MAT.aluD);
  oilF.rotation.z = Math.PI / 2;
  oilF.position.set(length / 2 - 0.5, blockY - blockH / 2 + 0.2, blockD / 2 + 0.4);
  root.add(oilF);
  var oilCap = cyl(0.35, 0.35, 0.08, 18, MAT.crank);
  oilCap.rotation.z = Math.PI / 2;
  oilCap.position.set(length / 2 - 0.5, blockY - blockH / 2 + 0.2, blockD / 2 + 0.75);
  root.add(oilCap);

  for (var ms = -1; ms <= 1; ms += 2){
    var mount = box(0.35, 0.6, 0.35, MAT.darkB);
    mount.position.set(ms * (length / 2 + 0.25), blockY - blockH / 2 - 0.2, 0);
    root.add(mount);
    var mb = cyl(0.08, 0.08, 0.5, 8, MAT.bolt);
    mb.rotation.x = Math.PI / 2;
    mb.position.set(ms * (length / 2 + 0.25), blockY - blockH / 2 - 0.5, 0);
    root.add(mb);
  }
  return { blockY: blockY, blockH: blockH, blockD: blockD, length: length };
}

function makeIntake(root, B, n, sp){
  var tw = n * sp;
  var pY = B.head.headY + B.head.headH / 2 + B.head.covH + 0.5;
  var pl = cyl(0.35, 0.35, B.length * 0.85, 18, MAT.int);
  pl.rotation.z = Math.PI / 2;
  pl.position.set(0, pY, B.blockD / 2 + 0.6);
  root.add(pl);
  for (var i = 0; i < n; i++){
    var xx = -tw / 2 + sp / 2 + i * sp;
    var fl = box(0.5, 0.12, 0.28, MAT.aluD);
    fl.position.set(xx, B.head.headY + 0.05, B.blockD / 2 + 0.25);
    root.add(fl);
    var rl = cyl(0.18, 0.22, pY - (B.head.headY + 0.05), 12, MAT.int);
    rl.position.set(xx, (pY + B.head.headY) / 2, B.blockD / 2 + 0.45);
    root.add(rl);
  }
  var tb = cyl(0.45, 0.45, 0.35, 16, MAT.aluD);
  tb.rotation.z = Math.PI / 2;
  tb.position.set(-B.length * 0.5, pY, B.blockD / 2 + 0.6);
  root.add(tb);
}

function makeExhaust(root, B, n, sp){
  var tw = n * sp;
  for (var i = 0; i < n; i++){
    var xx = -tw / 2 + sp / 2 + i * sp;
    var fl = box(0.5, 0.12, 0.28, MAT.exh);
    fl.position.set(xx, B.blockY + B.blockH / 2 + 0.05, -B.blockD / 2 - 0.25);
    root.add(fl);
    var rl = cyl(0.18, 0.22, 0.55, 12, MAT.exh);
    rl.position.set(xx, B.blockY + B.blockH / 2 - 0.3, -B.blockD / 2 - 0.45);
    rl.rotation.x = Math.PI / 7;
    root.add(rl);
  }
  var hd = cyl(0.32, 0.32, B.length * 0.85, 16, MAT.exh);
  hd.rotation.z = Math.PI / 2;
  hd.position.set(0, B.blockY - B.blockH / 2 - 0.55, -B.blockD / 2 - 0.8);
  root.add(hd);
}

function makeTurbo(root, B){
  var g = new THREE.Group();
  var comp = cyl(0.62, 0.78, 0.75, 22, MAT.turbo);
  comp.rotation.z = Math.PI / 2;
  g.add(comp);
  var cs = tor(0.72, 0.26, 10, 22, MAT.turbo);
  cs.rotation.y = Math.PI / 2;
  cs.position.x = -0.15;
  g.add(cs);
  var tb = cyl(0.5, 0.62, 0.65, 20, MAT.turboH);
  tb.rotation.z = Math.PI / 2;
  tb.position.x = 0.95;
  g.add(tb);
  var ts = tor(0.58, 0.22, 10, 20, MAT.turboH);
  ts.rotation.y = Math.PI / 2;
  ts.position.x = 1.05;
  g.add(ts);
  var ax = cyl(0.09, 0.09, 2.2, 10, MAT.metal);
  ax.rotation.z = Math.PI / 2;
  ax.position.x = 0.4;
  g.add(ax);
  g.position.set(B.length / 2 + 0.6, B.blockY - B.blockH / 2 - 0.35, -B.blockD / 2 - 1.0);
  root.add(g);
  if (!window._dciPartsArr) window._dciPartsArr = [];
  window._dciPartsArr.push({ turbo: g });
  var ic = box(1.6, 0.75, 0.3, MAT.alu);
  ic.position.set(0, B.head.headY + 1.5, -B.blockD / 2 - 1.6);
  root.add(ic);
}