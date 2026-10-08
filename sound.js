(function(){
"use strict";
var S = window.S;
if (!S) return;

var ctx = null, nodes = null, muted = false;

function makeDistortionCurve(amount){
  var n = 4096;
  var curve = new Float32Array(n);
  for (var i=0;i<n;i++){
    var x = (i*2/n) - 1;
    // мягкое насыщение для баса + жёсткое для верха
    curve[i] = Math.tanh(x * amount);
  }
  return curve;
}

function makeHardClipCurve(){
  var n = 4096;
  var curve = new Float32Array(n);
  for (var i=0;i<n;i++){
    var x = (i*2/n) - 1;
    // жёсткое обрезание — звучит зло
    var v = x * 3;
    if (v > 1) v = 1;
    if (v < -1) v = -1;
    curve[i] = v;
  }
  return curve;
}

function init(){
  if (ctx) return true;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try { ctx = new AC(); } catch(e){ return false; }

  var master = ctx.createGain(); master.gain.value = 0.7;
  master.connect(ctx.destination);

  /* ===== ЦЕПОЧКА ГРУБОСТИ ===== */
  // 1) жёсткий клиппер
  var hardClip = ctx.createWaveShaper();
  hardClip.curve = makeHardClipCurve();
  hardClip.oversample = '4x';

  // 2) мягкое насыщение
  var softSat = ctx.createWaveShaper();
  softSat.curve = makeDistortionCurve(3.5);
  softSat.oversample = '2x';

  // 3) режекторный фильтр с резонансом (создаёт "рык")
  var growl = ctx.createBiquadFilter();
  growl.type = 'peaking';
  growl.frequency.value = 180;
  growl.Q.value = 2.5;
  growl.gain.value = 12;

  // 4) фазовый фильтр высоких
  var highShelf = ctx.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 2500;
  highShelf.gain.value = 6;

  // 5) низкий проход (срезает визг на высоких)
  var lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  lp.Q.value = 1.2;

  // 6) полосовой фильтр (собирает "комбаст" частоты)
  var bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 320;
  bp.Q.value = 0.7;

  // основная цепь: oscillators → lp → hardClip → softSat → growl → highShelf → bp → engineGain → master
  lp.connect(hardClip);
  hardClip.connect(softSat);
  softSat.connect(growl);
  growl.connect(highShelf);
  highShelf.connect(bp);

  var engineGain = ctx.createGain(); engineGain.gain.value = 0;
  bp.connect(engineGain).connect(master);

  /* ===== ОСЦИЛЛЯТОРЫ ===== */
  // 3 пилообразных с расстройкой — для "толщины" и "дрожания"
  var o1 = ctx.createOscillator(); o1.type = 'sawtooth';
  var g1 = ctx.createGain(); g1.gain.value = 0.55;
  o1.connect(g1).connect(lp); o1.start();

  var o1b = ctx.createOscillator(); o1b.type = 'sawtooth';
  o1b.detune.value = 18; // расстройка +18 центов
  var g1b = ctx.createGain(); g1b.gain.value = 0.35;
  o1b.connect(g1b).connect(lp); o1b.start();

  var o2 = ctx.createOscillator(); o2.type = 'square';
  var g2 = ctx.createGain(); g2.gain.value = 0.18;
  o2.connect(g2).connect(lp); o2.start();

  // суб для баса — для "злого" рокота
  var oSub = ctx.createOscillator(); oSub.type = 'sine';
  var gSub = ctx.createGain(); gSub.gain.value = 1.2;
  oSub.connect(gSub).connect(lp); oSub.start();

  // второй суб-осциллятор — октавой ниже, для большой V16
  var oSub2 = ctx.createOscillator(); oSub2.type = 'triangle';
  var gSub2 = ctx.createGain(); gSub2.gain.value = 0.7;
  oSub2.connect(gSub2).connect(lp); oSub2.start();

  /* ===== ШУМ ВЫХЛОПА ===== */
  var bufSize = 2 * ctx.sampleRate;
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i2=0;i2<bufSize;i2++) data[i2] = Math.random()*2-1;
  var noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;

  var nf = ctx.createBiquadFilter();
  nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = 0.8;
  var nGain = ctx.createGain(); nGain.gain.value = 0;
  noise.connect(nf).connect(nGain).connect(hardClip); // шум идёт в клиппер — будет рычать
  noise.start();

  /* ===== ВТОРОЙ ШУМ — "стрельба" на высоких ===== */
  var nf2 = ctx.createBiquadFilter();
  nf2.type = 'highpass'; nf2.frequency.value = 3000;
  var nGain2 = ctx.createGain(); nGain2.gain.value = 0;
  var noise2 = ctx.createBufferSource(); noise2.buffer = buf; noise2.loop = true;
  noise2.connect(nf2).connect(nGain2).connect(hardClip);
  noise2.start();

  nodes = {
    master: master, lp: lp, engineGain: engineGain,
    o1: o1, o1b: o1b, o2: o2, oSub: oSub, oSub2: oSub2,
    nGain: nGain, nGain2: nGain2, nf: nf, nf2: nf2,
    growl: growl, highShelf: highShelf, bp: bp
  };
  return true;
}

function update(){
  if (!nodes || muted) return;
  var E = S.engines[S.engineType] || S.engines.r4;
  var rpm = S.rpm, thr = S.throttle;
  var run = S.running && !S.stalled && !S.broken;
  var t = ctx.currentTime;
  var sm = 0.02;

  if (!run || rpm < 40){
    nodes.engineGain.gain.setTargetAtTime(0, t, 0.1);
    nodes.nGain.gain.setTargetAtTime(0, t, 0.1);
    nodes.nGain2.gain.setTargetAtTime(0, t, 0.1);
    return;
  }

  // Частота вспышек (зависит от количества цилиндров и RPM)
  var fireHz = rpm / E.fireDiv;

  // Основные частоты — базовая частота × кратные, чтобы звучало "много цилиндров"
  nodes.o1.frequency.setTargetAtTime(fireHz * 2, t, sm);
  nodes.o1b.frequency.setTargetAtTime(fireHz * 2 * 1.005, t, sm);   // чуть расстроена
  nodes.o2.frequency.setTargetAtTime(fireHz * 3, t, sm);
  nodes.oSub.frequency.setTargetAtTime(fireHz * 0.5, t, sm);
  nodes.oSub2.frequency.setTargetAtTime(fireHz * 0.25, t, sm);

  // Динамика: с ростом RPM звук становится громче и злее
  var rpmF = Math.min(1, rpm / 6000);
  var rpmF2 = rpmF * rpmF; // квадратичный рост для агрессии

  // Основная громкость
  var base = 0.10 + thr * 0.28;
  var lvl = base * (0.5 + rpmF * 0.9);
  // На отсечке добавляем "крика"
  if (rpm > E.redline * 0.9) lvl *= 1.15;
  if (rpm > E.redline) lvl *= 0.7;
  nodes.engineGain.gain.setTargetAtTime(lvl, t, 0.04);

  // Шум выхлопа — с ростом RPM становится громче
  var nLvl = (0.03 + thr * 0.07) + rpmF * E.noiseBase * 1.8;
  nodes.nGain.gain.setTargetAtTime(nLvl, t, 0.05);
  nodes.nf.frequency.setTargetAtTime(1200 + rpm * 0.6 + thr * 1500, t, 0.05);

  // Шум "стрельбы" только на высоких оборотах — стреляет
  var nLvl2 = Math.max(0, (rpmF - 0.55)) * 0.15 + thr * rpmF2 * 0.12;
  nodes.nGain2.gain.setTargetAtTime(nLvl2, t, 0.05);
  nodes.nf2.frequency.setTargetAtTime(3500 + rpm * 0.8, t, 0.05);

  // Динамический фильтр — на высоких RPM звук ярче и агрессивнее
  var lpFreq = E.lpBase + rpm * E.lpRpm + thr * 900 + rpmF2 * 1500;
  if (lpFreq > 4500) lpFreq = 4500;
  nodes.lp.frequency.setTargetAtTime(lpFreq, t, 0.05);
  nodes.lp.Q.setTargetAtTime(1.2 + rpmF2 * 2.5, t, 0.05);

  // Резонанс "рыка" смещается с RPM — низкий рёв на холостых, злой на высоких
  nodes.growl.frequency.setTargetAtTime(140 + rpm * 0.03, t, 0.06);
  nodes.growl.gain.setTargetAtTime(10 + rpmF2 * 10, t, 0.06);

  // Полосовой фильтр — на высоких RPM центр смещается вверх для "крика"
  nodes.bp.frequency.setTargetAtTime(280 + rpm * 0.05 + thr * 200, t, 0.06);
  nodes.bp.Q.setTargetAtTime(0.6 + rpmF * 1.2, t, 0.06);
}

function starter(){
  if (!ctx || muted) return;
  var t = ctx.currentTime;
  var o = ctx.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(55, t);
  o.frequency.linearRampToValueAtTime(180, t + 0.7);
  var g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.18, t + 0.06);
  g.gain.linearRampToValueAtTime(0, t + 0.85);
  var dist = ctx.createWaveShaper();
  dist.curve = makeHardClipCurve();
  var f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=500;
  o.connect(f).connect(dist).connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 0.9);
}

function resume(){
  if (!ctx){ if (!init()) return; }
  if (ctx.state === 'suspended') ctx.resume();
}

document.addEventListener('touchstart', resume, {passive:true});
document.addEventListener('mousedown', resume);
document.addEventListener('keydown', resume);

var ignBtn = document.getElementById('ignBtn');
if (ignBtn) ignBtn.addEventListener('click', function(){
  resume();
  if (!S.running) starter();
});

var muteBtn = document.createElement('button');
muteBtn.type = 'button'; muteBtn.textContent = '🔊';
muteBtn.setAttribute('style',
  'position:fixed;top:8px;right:8px;z-index:1000;width:44px;height:44px;' +
  'border-radius:50%;border:1px solid #263547;background:rgba(20,28,38,.85);' +
  'color:#8fd8ff;font-size:18px;cursor:pointer;touch-action:manipulation');
muteBtn.addEventListener('click', function(){
  muted = !muted; muteBtn.textContent = muted ? '🔇' : '🔊';
  if (muted && nodes){
    var t = ctx.currentTime;
    nodes.engineGain.gain.setTargetAtTime(0, t, 0.05);
    nodes.nGain.gain.setTargetAtTime(0, t, 0.05);
    nodes.nGain2.gain.setTargetAtTime(0, t, 0.05);
  }
});
document.body.appendChild(muteBtn);

function loop(){ update(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
})();