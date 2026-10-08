(function(){
"use strict";
var S = window.S;
if (!S) return;

var ctx = null, nodes = null, muted = false;

function init(){
  if (ctx) return true;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try { ctx = new AC(); } catch(e){ return false; }

  var master = ctx.createGain(); master.gain.value = 0.6;
  master.connect(ctx.destination);

  // Дисторшн для "грубости"
  var shaper = ctx.createWaveShaper();
  var curve = new Float32Array(1024);
  for (var i=0;i<1024;i++){
    var x = (i/512)-1;
    curve[i] = Math.tanh(x * 2.5);
  }
  shaper.curve = curve;
  shaper.oversample = '2x';

  var lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 1.4;

  var engineGain = ctx.createGain(); engineGain.gain.value = 0;
  lp.connect(shaper).connect(engineGain).connect(master);

  var o1 = ctx.createOscillator(); o1.type = 'sawtooth';
  var g1 = ctx.createGain(); g1.gain.value = 0.5;
  o1.connect(g1).connect(lp); o1.start();

  var o2 = ctx.createOscillator(); o2.type = 'square';
  var g2 = ctx.createGain(); g2.gain.value = 0.15;
  o2.connect(g2).connect(lp); o2.start();

  var oSub = ctx.createOscillator(); oSub.type = 'sine';
  var gSub = ctx.createGain(); gSub.gain.value = 1.0;
  oSub.connect(gSub).connect(lp); oSub.start();

  var bufSize = 2 * ctx.sampleRate;
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i2=0; i2<bufSize; i2++) data[i2] = Math.random()*2-1;
  var noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
  var nf = ctx.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=1200; nf.Q.value=0.6;
  var nGain = ctx.createGain(); nGain.gain.value = 0;
  noise.connect(nf).connect(nGain).connect(master); noise.start();

  nodes = { master:master, lp:lp, engineGain:engineGain,
            o1:o1, o2:o2, oSub:oSub, nGain:nGain, nf:nf };
  return true;
}

function update(){
  if (!nodes || muted) return;
  var E = S.engines[S.engineType] || S.engines.r4;
  var rpm = S.rpm, thr = S.throttle;
  var run = S.running && !S.stalled && !S.broken;
  var t = ctx.currentTime;
  var sm = 0.03;

  if (!run || rpm < 40){
    nodes.engineGain.gain.setTargetAtTime(0, t, 0.12);
    nodes.nGain.gain.setTargetAtTime(0, t, 0.12);
    return;
  }

  var fireHz = rpm / E.fireDiv;
  nodes.o1.frequency.setTargetAtTime(fireHz * 2, t, sm);
  nodes.o2.frequency.setTargetAtTime(fireHz * 3, t, sm);
  nodes.oSub.frequency.setTargetAtTime(fireHz * 0.5, t, sm);

  var rpmF = Math.min(1, rpm / 5000);
  var base = 0.08 + thr * 0.24;
  var lvl = base * (0.5 + rpmF * 0.7);
  if (rpm > E.redline) lvl *= 0.6;
  nodes.engineGain.gain.setTargetAtTime(lvl, t, 0.05);

  var nLvl = thr * 0.06 + rpmF * E.noiseBase;
  nodes.nGain.gain.setTargetAtTime(nLvl, t, 0.05);
  nodes.nf.frequency.setTargetAtTime(700 + rpm * 0.4 + thr * 1200, t, 0.05);
  nodes.lp.frequency.setTargetAtTime(E.lpBase + rpm * E.lpRpm + thr * 600, t, 0.05);
}

function starter(){
  if (!ctx || muted) return;
  var t = ctx.currentTime;
  var o = ctx.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(60, t);
  o.frequency.linearRampToValueAtTime(170, t + 0.6);
  var g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.15, t + 0.05);
  g.gain.linearRampToValueAtTime(0, t + 0.75);
  var f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=550;
  o.connect(f).connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 0.8);
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
  }
});
document.body.appendChild(muteBtn);

function loop(){ update(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
})();