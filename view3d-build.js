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

  /* ============================================================
     МАТЕРИАЛЫ
     ============================================================ */
  function M(c, mt, rg, op, tr){
    var o = {
      color: c,
      metalness: mt === undefined ? 0.8 : mt,
      roughness: rg === undefined ? 0.4 : rg
    };
    if (op !== undefined) { o.transparent = true; o.opacity = op; }
    if (tr) o.side = THREE.DoubleSide;
    var m2 = new THREE.MeshStandardMaterial(o);
    m2.userData = { baseOp: op !== undefined ? op : 1 };
    return m2;
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
    yellow: M(0xd8b840, 0.60, 0.40)
  };

  /* ============================================================
     ХЕЛПЕРЫ
     ============================================================ */
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
  function pR(x){ if (x && R.pushRib) R.pushRib(x); }
  function sA(x){ if (R.setAsm) R.setAsm(x); }
  function sCr(x){ if (R.setCrank) R.setCrank(x); }
  function sF(x){ if (R.setFly) R.setFly(x); }

  /* ============================================================
     ФИРМЕННЫЕ ТАБЛИЧКИ
     ============================================================ */
  function makeBrandTex(text, bg, fg){
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
    c.fillText(text, 512, 138);
    var tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    return tex;
  }

  function addPlate(root, x, y, z, w, h, text, bg, fg){
    var tex = makeBrandTex(text, bg, fg);
    var mat = new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.3,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    var pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    pl.position.set(x, y, z);
    pl.rotation.x = -Math.PI / 2;
    root.add(pl);
    pC(pl);
  }

  /* ============================================================
     ПОРШЕНЬ
     ============================================================ */
  function makePiston(r, h){
    var g = new THREE.Group();
    // Тело
    g.add(cyl(r, r, h, 26, MAT.dark));
    // Юбка
    var skirt = cyl(r * 0.98, r * 0.9, h * 0.35, 26, MAT.darkB);
    skirt.position.y = -h * 0.3;
    g.add(skirt);
    // 3 кольца
    for (var k = 0; k < 3; k++){
      var rg = tor(r * 0.99, 0.045, 6, 26, MAT.ring);
      rg.rotation.x = Math.PI / 2;
      rg.position.y = h * 0.32 - k * h * 0.13;
      g.add(rg);
    }
    // Плоский верх
    var top = cyl(r * 0.99, r * 0.99, 0.04, 26, MAT.darkB);
    top.position.y = h * 0.5;
    g.add(top);
    return g;
  }

  /* ============================================================
     ШАТУН
     ============================================================ */
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

  /* ============================================================
     ЦИЛИНДР
     ============================================================ */
  function makeCyl(cfg){
    var g = new THREE.Group();
    g.position.set(cfg.x, 0, cfg.z);

    // Прозрачная гильза
    var sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(cfg.r, cfg.r, cfg.cylH, 24, 1, true),
      MAT.glassD
    );
    sleeve.position.y = cfg.cylY;
    g.add(sleeve);
    pB(sleeve);

    // Верхнее кольцо
    var tr = tor(cfg.r * 1.02, 0.06, 8, 24, MAT.metal);
    tr.rotation.x = Math.PI / 2;
    tr.position.y = cfg.cylY + cfg.cylH / 2;
    g.add(tr);

    // Нижнее кольцо
    var br = tor(cfg.r * 1.02, 0.06, 8, 24, MAT.metal);
    br.rotation.x = Math.PI / 2;
    br.position.y = cfg.cylY - cfg.cylH / 2;
    g.add(br);

    // Поршень
    var p = makePiston(cfg.r * 0.92, cfg.pH);
    g.add(p);

    // Шатун
    var r = makeRod(cfg.rodLen);
    g.add(r);

    return {
      g: g,
      p: p,
      rod: r,
      off: cfg.off || 0,
      crankR: cfg.crankR,
      rodLen: cfg.rodLen,
      crankY: cfg.crankY
    };
  }

  /* ============================================================
     КОЛЕНВАЛ + МАХОВИК
     ============================================================ */
  function makeCrank(root, length, crankY, n, crankR, fwR){
    var cg = new THREE.Group();
    cg.position.y = crankY;

    // Главная ось
    var ax = cyl(0.22, 0.22, length + 1.4, 24, MAT.crank);
    ax.rotation.z = Math.PI / 2;
    cg.add(ax);

    // Коренные шейки
    for (var mi = 0; mi <= n; mi++){
      var mx = -length / 2 + 0.5 + mi * (length - 1) / n;
      var mn = cyl(0.42, 0.42, 0.32, 22, MAT.crankJ);
      mn.rotation.z = Math.PI / 2;
      mn.position.x = mx;
      cg.add(mn);
    }

    // Шатунные шейки + противовесы
    for (var ci = 0; ci < n; ci++){
      var cxx = -length / 2 + 0.85 + ci * (length - 1.7) / Math.max(1, n - 1);
      var o1 = ci * Math.PI * 2 / n;

      var pinG = new THREE.Group();
      var pin = cyl(0.2, 0.2, 0.42, 18, MAT.crankJ);
      pin.rotation.z = Math.PI / 2;
      pinG.add(pin);
      pinG.position.set(cxx, Math.sin(o1) * crankR, 0);
      cg.add(pinG);

      var cwG = new THREE.Group();
      var cwB = cyl(0.52, 0.52, 0.28, 18, MAT.cw);
      cwB.rotation.z = Math.PI / 2;
      cwB.scale.set(1, 1, 0.7);
      cwG.add(cwB);
      cwG.position.set(cxx, -Math.sin(o1) * crankR, 0);
      cg.add(cwG);
    }

    root.add(cg);
    sCr(cg);

    // Маховик
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
  }

  /* ============================================================
     ГОЛОВКА + КРЫШКА
     ============================================================ */
  function makeHead(root, length, blockH, blockD, blockY){
    var headH = 1.1;
    var headY = blockY + blockH / 2 + 0.15 + headH / 2;

    var hd = box(length + 0.1, headH, blockD + 0.1, MAT.head);
    hd.position.y = headY;
    root.add(hd);
    pH(hd);

    // 4 болта по углам
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

    // Заливная пробка
    var cap = cyl(0.2, 0.2, 0.2, 12, MAT.darkB);
    cap.position.set(length / 2 - 0.8, covY + covH / 2 + 0.1, 0);
    root.add(cap);

    return { headY: headY, headH: headH, covY: covY, covH: covH };
  }

  /* ============================================================
     ПРОЗРАЧНЫЙ БЛОК
     ============================================================ */
  function makeGlassBox(root, length, blockH, blockD, blockY){
    var bk = box(length, blockH, blockD, MAT.glass);
    bk.position.y = blockY;
    root.add(bk);
    pB(bk);

    var pan = box(length + 0.2, 0.6, blockD + 0.15, MAT.oil);
    pan.position.y = blockY - blockH / 2 - 0.5;
    root.add(pan);

    return { blockY: blockY, blockH: blockH, blockD: blockD, length: length };
  }

  /* ============================================================
     ВПУСК
     ============================================================ */
  function makeIntake(root, B, n, sp){
    var tw = n * sp;
    var pY = B.head.headY + B.head.headH / 2 + B.head.covH + 0.5;

    var plenum = cyl(0.35, 0.35, B.length * 0.85, 18, MAT.int);
    plenum.rotation.z = Math.PI / 2;
    plenum.position.set(0, pY, B.blockD / 2 + 0.6);
    root.add(plenum);

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

  /* ============================================================
     ВЫПУСК
     ============================================================ */
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

  /* ============================================================
     ТУРБИНА + ИНТЕРКУЛЕР
     ============================================================ */
  function makeTurbo(root, B){
    var g = new THREE.Group();
    var comp = cyl(0.62, 0.78, 0.75, 22, MAT.turbo);
    comp.rotation.z = Math.PI / 2;
    g.add(comp);

    var compS = tor(0.72, 0.26, 10, 22, MAT.turbo);
    compS.rotation.y = Math.PI / 2;
    compS.position.x = -0.15;
    g.add(compS);

    var turb = cyl(0.5, 0.62, 0.65, 20, MAT.turboH);
    turb.rotation.z = Math.PI / 2;
    turb.position.x = 0.95;
    g.add(turb);

    var turbS = tor(0.58, 0.22, 10, 20, MAT.turboH);
    turbS.rotation.y = Math.PI / 2;
    turbS.position.x = 1.05;
    g.add(turbS);

    var ax = cyl(0.09, 0.09, 2.2, 10, MAT.metal);
    ax.rotation.z = Math.PI / 2;
    ax.position.x = 0.4;
    g.add(ax);

    var wg = cyl(0.26, 0.26, 0.4, 12, MAT.aluD);
    wg.position.set(0.95, 0.7, 0.15);
    g.add(wg);

    g.position.set(B.length / 2 + 0.6, B.blockY - B.blockH / 2 - 0.35, -B.blockD / 2 - 1.0);
    root.add(g);

    if (!window._dciPartsArr) window._dciPartsArr = [];
    window._dciPartsArr.push({ turbo: g });

    var ic = box(1.6, 0.75, 0.3, MAT.alu);
    ic.position.set(0, B.head.headY + 1.5, -B.blockD / 2 - 1.6);
    root.add(ic);
    for (var f = 0; f < 10; f++){
      var fin = box(0.03, 0.7, 0.32, MAT.aluD);
      fin.position.set(-0.7 + f * 0.16, B.head.headY + 1.5, -B.blockD / 2 - 1.6);
      root.add(fin);
    }
  }

  /* ============================================================
     РЯДНАЯ БАЗА
     ============================================================ */
  function inlineBase(root, opt){
    var n = opt.n || 4;
    var sp = opt.spacing || 2.2;
    var tw = n * sp;
    var length = tw + 1.6;
    var blockH = opt.h || 4.5;
    var blockD = opt.d || 3.2;
    var blockY = opt.y || 3.6;
    var pistonR = opt.pR || 0.85;
    var pH2 = opt.pH || 0.75;
    var crankR = opt.crankR || 0.75;
    var rodLen = opt.rodLen || 3.0;
    var cylH = opt.cylH || (blockH - 0.5);
    var cylY = blockY + 0.1;
    var crankY = blockY + blockH / 2 - crankR - rodLen - pH2 / 2 + 0.05;
    var fwR = opt.fwR || 2.0;

    makeCrank(root, length, crankY, n, crankR, fwR);
    var B = makeGlassBox(root, length, blockH, blockD, blockY);
    B.head = makeHead(root, length, blockH, blockD, blockY);

    var arr = [];
    for (var i = 0; i < n; i++){
      var xx = -tw / 2 + sp / 2 + i * sp;
      var a = makeCyl({
        x: xx, z: 0,
        r: pistonR, pH: pH2,
        cylH: cylH, cylY: cylY,
        off: i * Math.PI,
        crankR: crankR, rodLen: rodLen, crankY: crankY
      });
      root.add(a.g);
      arr.push(a);
    }
    sA(arr);

    makeIntake(root, B, n, sp);
    makeExhaust(root, B, n, sp);
    if (opt.diesel) makeTurbo(root, B);

    return B;
  }

  /* ============================================================
     R4
     ============================================================ */
  function buildR4(root){
    var B = inlineBase(root, { n: 4 });
    addPlate(root, 0, B.head.covY + B.head.covH / 2 + 0.03, 0,
      B.length * 0.5, 0.55, 'ENGINE', '#2A2A2A', '#FFFFFF');
  }

  /* ============================================================
     TDI 1.9 — Volkswagen
     ============================================================ */
  function buildTDI(root){
    var B = inlineBase(root, { n: 4, diesel: true });
    addPlate(root, 0, B.head.covY + B.head.covH / 2 + 0.03, 0,
      B.length * 0.55, 0.6, 'VOLKSWAGEN', '#001E50', '#FFFFFF');
  }

  /* ============================================================
     2.0 dCi — Renault
     ============================================================ */
  function buildDCi(root){
    var B = inlineBase(root, { n: 4, diesel: true, pH: 0.8, pR: 0.88 });
    addPlate(root, 0, B.head.covY + B.head.covH / 2 + 0.03, 0,
      B.length * 0.5, 0.6, 'RENAULT', '#EFDF00', '#000000');
  }

  /* ============================================================
     Passat B3 — Volkswagen
     ============================================================ */
  function buildPassatB3(root){
    var B = inlineBase(root, { n: 4 });
    addPlate(root, 0, B.head.covY + B.head.covH / 2 + 0.03, 0,
      B.length * 0.5, 0.6, 'VOLKSWAGEN', '#001E50', '#FFFFFF');
  }

  /* ============================================================
     Bluebird CA20 — Nissan
     ============================================================ */
  function buildBluebird(root){
    var B = inlineBase(root, { n: 4 });
    addPlate(root, 0, B.head.covY + B.head.covH / 2 + 0.03, 0,
      B.length * 0.5, 0.6, 'NISSAN', '#C3002F', '#FFFFFF');
  }

  /* ============================================================
     SCOOTER
     ============================================================ */
  function buildScooter(root){
    var B = inlineBase(root, {
      n: 1, spacing: 1.5, d: 2.4, h: 3.2, y: 2.9,
      pR: 0.75, pH: 0.65, rodLen: 2.4, crankR: 0.6, fwR: 1.2
    });

    var carb = box(0.6, 0.6, 0.6, MAT.aluD);
    carb.position.set(0, B.head.covY + 0.5, B.blockD / 2 + 0.4);
    root.add(carb);

    var flt = cyl(0.45, 0.45, 0.35, 14, MAT.darkB);
    flt.rotation.z = Math.PI / 2;
    flt.position.set(0, B.head.covY + 0.5, B.blockD / 2 + 0.95);
    root.add(flt);

    addPlate(root, 0, B.head.covY + B.head.covH / 2 + 0.03, 0,
      B.length * 0.6, 0.5, 'SCOOTER', '#222222', '#FFFFFF');
  }

  /* ============================================================
     I6 (2JZ) — Toyota
     ============================================================ */
  function buildI6(root){
    var B = inlineBase(root, {
      n: 6, spacing: 1.9, d: 3.4, h: 4.8, y: 3.8,
      pR: 0.9, pH: 0.8, rodLen: 3.3, crankR: 0.8, fwR: 2.2, diesel: true
    });
    addPlate(root, 0, B.head.covY + B.head.covH / 2 + 0.03, 0,
      B.length * 0.5, 0.6, 'TOYOTA', '#EB0A1E', '#FFFFFF');
  }

  /* ============================================================
     V-ОБРАЗНЫЕ
     ============================================================ */
  function buildVBase(root, totalN, half, bankDist){
    var perRow = Math.floor(totalN / 2);
    var sp = 2.0;
    var tw = perRow * sp;
    var length = tw + 1.8;
    var blockH = 4.2;
    var blockD = 3.0;
    var blockY = 3.6;
    var pistonR = 0.82;
    var pH2 = 0.72;
    var crankR = 0.78;
    var rodLen = 3.0;
    var crankY = blockY + blockH / 2 - crankR - rodLen - pH2 / 2 + 0.05;

    makeCrank(root, length, crankY, perRow, crankR, 2.2);

    var pan = box(length + 0.3, 0.6, bankDist * 2 + 3.0, MAT.oil);
    pan.position.y = crankY - 1.0;
    root.add(pan);

    var arr = [];
    var headY = 0;
    for (var side = 0; side < 2; side++){
      var sign = side === 0 ? -1 : 1;

      var bk = box(length, blockH, blockD, MAT.glass);
      bk.position.set(0, blockY, sign * bankDist);
      bk.rotation.x = sign * half;
      root.add(bk);
      pB(bk);

      var headH = 1.0;
      headY = blockY + blockH / 2 + 0.15 + headH / 2;
      var hd = box(length + 0.1, headH, blockD + 0.1, MAT.head);
      hd.position.set(0, headY, sign * (bankDist + 0.4));
      hd.rotation.x = sign * half;
      root.add(hd);
      pH(hd);

      var covH = 0.55;
      var covY = headY + headH / 2 + covH / 2;
      var cv = box(length - 0.15, covH, blockD - 0.4, MAT.cover);
      cv.position.set(0, covY, sign * (bankDist + 0.5));
      cv.rotation.x = sign * half;
      root.add(cv);
      pC(cv);

      for (var j = 0; j < perRow; j++){
        var xx = -tw / 2 + sp / 2 + j * sp;
        var off = side === 0
          ? j * Math.PI * 2 / perRow
          : (j * Math.PI * 2 / perRow) + Math.PI;

        var a = makeCyl({
          x: xx, z: sign * bankDist,
          r: pistonR, pH: pH2,
          cylH: blockH - 0.5, cylY: blockY,
          off: off,
          crankR: crankR, rodLen: rodLen, crankY: crankY
        });
        a.g.rotation.x = sign * half;
        root.add(a.g);
        arr.push(a);
      }
    }
    sA(arr);

    var pY = blockY + blockH / 2 + 2.6;
    var plenum = cyl(0.42, 0.42, length * 0.85, 18, MAT.int);
    plenum.rotation.z = Math.PI / 2;
    plenum.position.set(0, pY, 0);
    root.add(plenum);

    for (var s = 0; s < 2; s++){
      var sg = s === 0 ? -1 : 1;
      var ex = cyl(0.32, 0.32, length * 0.85, 16, MAT.exh);
      ex.rotation.z = Math.PI / 2;
      ex.position.set(0, blockY - blockH / 2 - 0.6, sg * (bankDist + 1.4));
      root.add(ex);
    }

    re