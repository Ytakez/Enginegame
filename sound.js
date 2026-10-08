(function(){
"use strict";
var S = window.S;
if (!S) return;

var ctx = null;
var nodes = null;
var muted = false;

function init(){
  if (ctx) return true;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try { ctx = new AC(); } catch(e){ return false; }

  var master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);

  var lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1200;
  lp.Q.value = 1.2;

  var engineGain = ctx.createGain();
  engineGain.gain.value = 0;
  lp.connect(engineGain).connect(master);

  var o1 = ctx.createOscillator(); o1.type = 'sawtooth';
  var g1 = ctx.createGain(); g1.gain.value = 0.5;
  o1.connect(g1).connect(lp); o1.start();

  var o2 = ctx.createOscillator(); o2.type = 'square';
  var g2 = ctx.createGain(); g2.gain.value = 0.15;
  o2.connect(g2).connect(lp); o2.start();

  var oSub = ctx.createOscillator(); oSub.type = 'sine';
  var gSub = ctx.createGain(); gSub.gain.value = 0.9;
  oSub.connect(gSub).connect(lp); oSub.start();

  var bufSize = 2 * ctx.sampleRate;
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  var noise = ctx.createBufferSource();
  noise.buffer = buf; noise.loop = true;
  var nf = ctx.createBiquadFilter();
  nf.type = 'bandpass'; nf.frequency.value = 1400; nf.Q.value = 0.7;
  var nGain = ctx.createGain(); nGain.gain.value = 0;
  noise.connect(nf).connect(nGain).connect(master);
  noise.start();

  nodes = { master: master, lp: lp, engineGain: engineGain,
            o1: o1, o2: o2, oSub: oSub, nGain: nGain, nf: nf };
  return true;
}

function update(){
  if (!nodes || muted) return;
  var rpm = S.rpm, thr = S.throttle;
  var run = S.running && !S.stalled && !S.broken;
  var t = ctx.currentTime;
  var sm = 0.03;

  if (!run || rpm < 40){
    nodes.engineGain.gain.setTargetAtTime(0, t, 0.12);
    nodes.nGain.gain.setTargetAtTime(0, t, 0.12);
    return;
  }

  var fireHz = rpm / 30;
  nodes.o1.frequency.setTargetAtTime(fireHz * 2, t, sm);
  nodes.o2.frequency.setTargetAtTime(fireHz * 3, t, sm);
  nodes.oSub.frequency.setTargetAtTime(fireHz, t, sm);

  var rpmF = Math.min(1, rpm / 5000);
  var base = 0.07 + thr * 0.22;
  var lvl = base * (0.5 + rpmF * 0.7);
  if (rpm > 6800) lvl *= 0.6;
  nodes.engineGain.gain.setTargetAtTime(lvl, t, 0.05);

  var nLvl = thr * 0.06 + rpmF * 0.015;
  nodes.nGain.gain.setTargetAtTime(nLvl, t, 0.05);
  nodes.nf.frequency.setTargetAtTime(900 + rpm * 0.5 + thr * 1500, t, 0.05);
  nodes.lp.frequency.setTargetAtTime(700 + rpm * 0.15 + thr * 800, t, 0.05);
}

function starter(){
  if (!ctx || muted) return;
  var t = ctx.currentTime;
  var o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(75, t);
  o.frequency.linearRampToValueAtTime(190, t + 0.55);
  var g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.13, t + 0.05);
  g.gain.linearRampToValueAtTime(0, t + 0.7);
  var f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 600;
  o.connect(f).connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 0.75);
}

function resume(){
  if (!ctx){ if (!init()) return; }
  if (ctx.state === 'suspended') ctx.resume();
}

document.addEventListener('touchstart', resume, {passive:true});
document.addEventListener('mousedown', resume);
document.addEventListener('keydown', resume);

var ignBtn = document.getElementById('ignBtn');
if (ignBtn){
  ignBtn.addEventListener('click', function(){
    resume();
    if (!S.running) starter();
  });
}

/* Кнопка mute */
var muteBtn = document.createElement('button');
muteBtn.type = 'button';
muteBtn.textContent = '🔊';
muteBtn.setAttribute('style',
  'position:fixed;top:8px;right:8px;z-index:1000;width:44px;height:44px;' +
  'border-radius:50%;border:1px solid #263547;background:rgba(20,28,38,.85);' +
  'color:#8fd8ff;font-size:18px;cursor:pointer;touch-action:manipulation');
muteBtn.addEventListener('click', function(){
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
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