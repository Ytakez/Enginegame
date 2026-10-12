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