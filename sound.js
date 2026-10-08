(function(){
"use strict";
var S = window.S;
if (!S) return;

var ctx = null, nodes = null, muted = false;

function makeHardClipCurve(){
  var n = 4096;
  var curve = new Float32Array(n);
  for (var i=0;i<n;i++){
    var x = (i*2/n) - 1;
    var v = x * 3;
    if (v > 1) v = 1;
    if (v < -1) v = -1;
    curve[i] = v;
  }
  return curve;
}
function makeSoftCurve(k){
  var n = 4096;
  var curve = new Float32Array(n);
  for (var i=0;i<n;i++){
    var x = (i*2/n) - 1;
    curve[i] = Math.tanh(x * k);
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

  var hardClip = ctx.createWaveShaper();
  hardClip.curve = makeHardClipCurve();
  hardClip.oversample = '4x';

  var softSat = ctx.createWaveShaper();
  softSat.curve = makeSoftCurve(3.5);
  softSat.oversample = '2x';

  var growl = ctx.createBiquadFilter();
  growl.type = 'peaking';
  growl.frequency.value = 180;
  growl.Q.value = 2.5;
  growl.gain.value = 12;

  var highShelf = ctx.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 2500;
  highShelf.gain.value = 6;

  var lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  lp.Q.value = 1.2;

  var bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 320;
  bp.Q.value = 0.7;

  lp.connect(hardClip);
  hardClip.connect(softSat);
  softSat.connect(growl);
  growl.connect(highShelf);
  highShelf.connect(bp);

  var engineGain = ctx.createGain(); engineGain.gain.value = 0;
  bp.connect(engineGain).connect(master);

  var o1 = ctx.createOscillator(); o1.type = 'sawtooth';
  var g1 = ctx.createGain(); g1.gain.value = 0.55;
  o1.connect(g1).connect(lp); o1.start();

  var o1b = ctx.createOscillator(); o1b.type = 'sawtooth';
  o1b.detune.value = 18;
  var g1b = ctx.createGain(); g1b.gain.value = 0.35;
  o1b.connect(g1b).connect(lp); o1b.start();

  var o2 = ctx.createOscillator(); o2.type = 'square';
  var g2 = ctx.createGain(); g2.gain.value = 0.18;
  o2.connect(g2).connect(lp); o2.start();

  var oSub = ctx.createOscillator(); oSub.type = 'sine';
  var gSub = ctx.createGain(); gSub.gain.value = 1.2;
  oSub.connect(gSub).connect(lp); oSub.start();

  var oSub2 = ctx.createOscillator(); oSub2.type = 'triangle';
  var gSub2 = ctx.createGain(); gSub2.gain.value = 0.7;
  oSub2.connect(gSub2).connect(lp); oSub2.start();

  var bufSize = 2 * ctx.sampleRate;
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i2=0;i2<bufSize;i2++) data[i2] = Math.random()*2-1;
  var noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;

  var nf = ctx.createBiquadFilter();
  nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = 0.8;
  var nGain = ctx.createGain(); nGain.gain.value = 0;
  noise.connect(nf).connect(nGain).connect(hardClip);
  noise.start();

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
    growl: growl, highShelf: highShelf, bp: bp,
    g1: g1, g1b: g1b, g2: g2, gSub: gSub, gSub2: gSub2
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

  var isScooter = S.engineType === 'scooter';

  if (!run || rpm < 20){
    nodes.engineGain.gain.setTargetAtTime(0, t, 0.1);
    nodes.nGain.gain.setTargetAtTime(0, t, 0.1);
    nodes.nGain2.gain.setTargetAtTime(0, t, 0.1);
    return;
  }

  var fireHz = rpm / E.fireDiv;

  nodes.o1.frequency.setTargetAtTime(fireHz * 2, t, sm);
  nodes.o1b.frequency.setTargetAtTime(fireHz * 2 * 1.005, t, sm);
  nodes.o2.frequency.setTargetAtTime(fireHz * 3, t, sm);
  nodes.oSub.frequency.setTargetAtTime(fireHz * 0.5, t, sm);
  nodes.oSub2.frequency.setTargetAtTime(fireHz * 0.25, t, sm);

  var rpmRange = Math.max(1, E.redline - E.idle);
  var rpmF = Math.min(1, Math.max(0, (rpm - E.idle) / rpmRange));
  var rpmF2 = rpmF * rpmF;

  /* Громкость для скутера выше и агрессивнее */
  var base = isScooter ? (0.20 + thr * 0.45) : (0.10 + thr * 0.28);
  var lvl = base * (isScooter ? (0.85 + rpmF * 1.05) : (0.5 + rpmF * 0.9));
  if (rpm > E.redline * 0.9) lvl *= 1.15;
  if (rpm > E.redline) lvl *= 0.7;
  /* Громче для скутера */
  if (isScooter) lvl *= 1.8;
  nodes.engineGain.gain.setTargetAtTime(lvl, t, 0.04);

  /* Больше шума для скутера = грубее */
  var nLvl = (isScooter ? (0.10 + thr * 0.20) : (0.03 + thr * 0.07)) + rpmF * E.noiseBase * 1.8;
  nodes.nGain.gain.setTargetAtTime(nLvl, t, 0.05);
  nodes.nf.frequency.setTargetAtTime(
    (isScooter ? 2000 : 1200) + rpm * 1.2 + thr * (isScooter ? 2500 : 1500), t, 0.05);

  var nLvl2 = Math.max(0, (rpmF - 0.5)) * (isScooter ? 0.35 : 0.15) + thr * rpmF2 * (isScooter ? 0.25 : 0.12);
  nodes.nGain2.gain.setTargetAtTime(nLvl2, t, 0.05);
  nodes.nf2.frequency.setTargetAtTime(3500 + rpm * 1.5, t, 0.05);

  var lpFreq;
  if (isScooter){
    /* Для скутера фильтр ниже — звук грубее */
    lpFreq = E.lpBase - rpm * 0.4 + thr * 900 + rpmF2 * 1200;
    if (lpFreq < 400) lpFreq = 400;
    if (lpFreq > 3500) lpFreq = 3500;
  } else {
    lpFreq = E.lpBase + rpm * E.lpRpm + thr * 900 + rpmF2 * 1500;
    if (lpFreq > 4500) lpFreq = 4500;
  }
  nodes.lp.frequency.setTargetAtTime(lpFreq, t, 0.05);
  nodes.lp.Q.setTargetAtTime((isScooter ? 2.5 : 1.2) + rpmF2 * 3.5, t, 0.05);

  /* growl для скутера — сильнее и шире */
  nodes.growl.frequency.setTargetAtTime(
    (isScooter ? 200 : 140) + rpm * (isScooter ? 0.15 : 0.03), t, 0.06);
  nodes.growl.gain.setTargetAtTime((isScooter ? 20 : 10) + rpmF2 * 14, t, 0.06);

  nodes.bp.frequency.setTargetAtTime(280 + rpm * 0.08 + thr * 300, t, 0.06);
  nodes.bp.Q.setTargetAtTime(0.6 + rpmF * 1.4, t, 0.06);

  /* Громкость отдельных осцилляторов */
  nodes.g1.gain.setTargetAtTime(E.sawGain, t, 0.05);
  nodes.g1b.gain.setTargetAtTime(E.sawGain * 0.65, t, 0.05);
  nodes.g2.gain.setTargetAtTime(E.sqGain, t, 0.05);
  nodes.gSub.gain.setTargetAtTime(E.subGain, t, 0.05);
  nodes.gSub2.gain.setTargetAtTime(E.subGain * 0.6, t, 0.05);
}

function starter(){
  if (!ctx || muted) return;
  var E = S.engines[S.engineType];
  var isScooter = S.engineType === 'scooter';
  var t = ctx.currentTime;
  var o = ctx.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(isScooter ? 120 : 55, t);
  o.frequency.linearRampToValueAtTime(isScooter ? 320 : 180, t + (isScooter ? 0.4 : 0.7));
  var g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(isScooter ? 0.22 : 0.18, t + 0.06);
  g.gain.linearRampToValueAtTime(0, t + (isScooter ? 0.5 : 0.85));
  var dist = ctx.createWaveShaper();
  dist.curve = makeHardClipCurve();
  var f = ctx.createBiquadFilter(); f.type='lowpass';
  f.frequency.value = isScooter ? 900 : 500;
  o.connect(f).connect(dist).connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + (isScooter ? 0.55 : 0.9));
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