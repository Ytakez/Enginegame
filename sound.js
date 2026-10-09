(function(){
"use strict";
var S = window.S;
if(!S) return;

/* ==================== СОСТОЯНИЕ ==================== */
var ctx = null;
var masterGain = null;
var muted = false;

/* Генераторы */
var oscSub=null, oscSaw1=null, oscSaw2=null, oscSq=null;
var subGain=null, saw1Gain=null, saw2Gain=null, sqGain=null;

/* Шум */
var noiseNode=null, noiseFilter=null, noiseGain=null;

/* Фильтр + дистошн */
var mainFilter=null;
var shaper=null;
var shaperGain=null;
var postGain=null;

/* ==================== ПРОФИЛИ ДВИГАТЕЛЕЙ ==================== */
var PROFILES = {
  scooter:  { pitch:1.55, sub:0.10, saw:0.16, sq:0.06, noise:0.010, drive:2.5, filter:3200, q:1.4, wave:'sawtooth', detune:12 },
  tdi:      { pitch:0.72, sub:0.24, saw:0.20, sq:0.10, noise:0.038, drive:5.5, filter:1500, q:2.4, wave:'square',   detune:30 },
  dci:      { pitch:0.78, sub:0.22, saw:0.18, sq:0.09, noise:0.032, drive:5.0, filter:1700, q:2.2, wave:'square',   detune:28 },
  mt82:     { pitch:0.55, sub:0.32, saw:0.24, sq:0.14, noise:0.055, drive:7.0, filter:900,  q:2.8, wave:'square',   detune:45 },
  passatb3: { pitch:1.00, sub:0.14, saw:0.16, sq:0.06, noise:0.008, drive:3.0, filter:2400, q:1.6, wave:'sawtooth', detune:14 },
  bluebird: { pitch:1.05, sub:0.14, saw:0.18, sq:0.07, noise:0.010, drive:3.2, filter:2600, q:1.7, wave:'sawtooth', detune:16 },
  galant6:  { pitch:1.18, sub:0.12, saw:0.15, sq:0.05, noise:0.010, drive:2.5, filter:3000, q:1.4, wave:'triangle', detune:10 },
  wankel:   { pitch:1.35, sub:0.10, saw:0.22, sq:0.09, noise:0.012, drive:3.5, filter:3800, q:2.0, wave:'sawtooth', detune:22 },
  r4:       { pitch:1.02, sub:0.15, saw:0.18, sq:0.07, noise:0.010, drive:3.0, filter:2500, q:1.7, wave:'sawtooth', detune:15 },
  v8:       { pitch:1.12, sub:0.16, saw:0.17, sq:0.06, noise:0.014, drive:2.8, filter:2900, q:1.5, wave:'sawtooth', detune:8 },
  v16:      { pitch:0.92, sub:0.26, saw:0.20, sq:0.10, noise:0.022, drive:4.0, filter:2100, q:2.0, wave:'sawtooth', detune:35 }
};
var DEFAULT_PROFILE = PROFILES.r4;

function getProfile(){
  var t = S.engineType || 'r4';
  return PROFILES[t] || DEFAULT_PROFILE;
}

/* ==================== DRIVE CURVE ==================== */
function makeDriveCurve(amount){
  var n = 2048;
  var curve = new Float32Array(n);
  for(var i=0; i<n; i++){
    var x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * amount);
  }
  return curve;
}

/* ==================== ИНИЦИАЛИЗАЦИЯ ==================== */
function initAudio(){
  if(ctx) return true;
  try{
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return false;
    ctx = new AC();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    shaper = ctx.createWaveShaper();
    shaper.curve = makeDriveCurve(3);
    shaper.oversample = '2x';

    shaperGain = ctx.createGain();
    shaperGain.gain.value = 0.7;

    mainFilter = ctx.createBiquadFilter();
    mainFilter.type = 'lowpass';
    mainFilter.frequency.value = 2400;
    mainFilter.Q.value = 1.6;

    postGain = ctx.createGain();
    postGain.gain.value = 1.0;

    shaper.connect(mainFilter);
    mainFilter.connect(postGain);
    postGain.connect(masterGain);

    /* SUB */
    oscSub = ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.value = 40;
    subGain = ctx.createGain();
    subGain.gain.value = 0;
    oscSub.connect(subGain);
    subGain.connect(shaper);
    oscSub.start();

    /* SAW1 */
    oscSaw1 = ctx.createOscillator();
    oscSaw1.type = 'sawtooth';
    oscSaw1.frequency.value = 80;
    saw1Gain = ctx.createGain();
    saw1Gain.gain.value = 0;
    oscSaw1.connect(saw1Gain);
    saw1Gain.connect(shaper);
    oscSaw1.start();

    /* SAW2 */
    oscSaw2 = ctx.createOscillator();
    oscSaw2.type = 'sawtooth';
    oscSaw2.frequency.value = 82;
    oscSaw2.detune.value = 20;
    saw2Gain = ctx.createGain();
    saw2Gain.gain.value = 0;
    oscSaw2.connect(saw2Gain);
    saw2Gain.connect(shaper);
    oscSaw2.start();

    /* SQUARE */
    oscSq = ctx.createOscillator();
    oscSq.type = 'square';
    oscSq.frequency.value = 20;
    sqGain = ctx.createGain();
    sqGain.gain.value = 0;
    oscSq.connect(sqGain);
    sqGain.connect(shaper);
    oscSq.start();

    /* NOISE */
    var bufSize = 2 * ctx.sampleRate;
    var buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for(var i=0; i<bufSize; i++) data[i] = Math.random()*2 - 1;
    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 1.0;

    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(shaper);
    noiseNode.start();

    console.log('sound.js: готово');
    return true;
  }catch(e){
    console.warn('sound.js: ошибка', e);
    return false;
  }
}

function unlockAudio(){
  if(!ctx) initAudio();
  if(ctx && ctx.state === 'suspended'){
    ctx.resume().catch(function(){});
  }
}
document.addEventListener('touchstart', unlockAudio, {passive:true});
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);

/* ==================== ОСНОВНОЙ ЦИКЛ ==================== */
function updateSound(){
  if(!ctx || !masterGain) return;

  var P = getProfile();
  var rpm = S.rpm || 0;
  var thr = S.throttle || 0;
  var running = S.running && !S.stalled;
  var stopping = S.ignitionState === 'stopping';

  var volMul = 1;
  if(stopping) volMul = Math.max(0, Math.min(1, rpm / 4500));
  else if(!running) volMul = 0;

  var mainFreq = (30 + rpm * 0.05) * P.pitch;
  if(mainFreq < 15) mainFreq = 15;

  var subFreq = mainFreq * 0.5;
  var sqFreq = mainFreq * 0.25;
  if(sqFreq < 3) sqFreq = 3;

  var subL = 0, sawL = 0, sqL = 0, noiseL = 0;
  if(running){
    subL   = P.sub   * 0.30 * (0.4 + Math.min(1, rpm/3000) * 0.6);
    sawL   = P.saw   * 0.22 * (0.3 + thr * 0.7);
    sqL    = P.sq    * 0.14 * (0.4 + Math.min(1, rpm/5000) * 0.6);
    noiseL = P.noise * (0.5 + thr * 0.5);
  } else if(stopping){
    subL   = P.sub   * 0.15;
    sawL   = P.saw   * 0.10;
    sqL    = P.sq    * 0.05;
    noiseL = P.noise * 0.4;
  }
  subL *= volMul; sawL *= volMul; sqL *= volMul; noiseL *= volMul;

  var t = ctx.currentTime;
  var smooth = stopping ? 0.12 : 0.03;

  subGain.gain.setTargetAtTime(subL, t, smooth);
  saw1Gain.gain.setTargetAtTime(sawL * 0.65, t, smooth);
  saw2Gain.gain.setTargetAtTime(sawL * 0.55, t, smooth);
  sqGain.gain.setTargetAtTime(sqL, t, smooth);
  noiseGain.gain.setTargetAtTime(noiseL, t, smooth);

  var fSmooth = stopping ? 0.15 : 0.02;
  oscSub.frequency.setTargetAtTime(subFreq, t, fSmooth);
  oscSaw1.frequency.setTargetAtTime(mainFreq, t, fSmooth);
  oscSaw2.frequency.setTargetAtTime(mainFreq, t, fSmooth);
  oscSaw2.detune.value = P.detune + Math.sin(t * 3) * 3;
  oscSq.frequency.setTargetAtTime(sqFreq, t, fSmooth);

  if(oscSaw1.type !== P.wave) oscSaw1.type = P.wave;

  var nF = P.filter + rpm * 0.15;
  if(nF > 6000) nF = 6000;
  mainFilter.frequency.setTargetAtTime(nF, t, 0.06);
  mainFilter.Q.setTargetAtTime(P.q, t, 0.1);

  shaper.curve = makeDriveCurve(P.drive);
  shaperGain.gain.setTargetAtTime(0.5 + thr * 0.3, t, 0.05);

  noiseFilter.frequency.setTargetAtTime(900 + rpm * 0.3, t, 0.05);

  var masterVol = muted ? 0 : 0.85;
  masterGain.gain.setTargetAtTime(masterVol, t, 0.08);
}
setInterval(updateSound, 30);

/* ==================== ТОПЛИВНЫЙ НАСОС ==================== */
function fuelPump(){
  if(!initAudio()) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(100, t);
    o.frequency.linearRampToValueAtTime(140, t + 0.6);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.1);
    g.gain.linearRampToValueAtTime(0.06, t + 1.2);
    g.gain.linearRampToValueAtTime(0, t + 1.5);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 1.6);
  }catch(e){}
}

/* ==================== СТАРТЕР ==================== */
function startCrank(){
  if(!initAudio()) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(45, t);
    o.frequency.linearRampToValueAtTime(65, t + 0.5);

    var o2 = ctx.createOscillator();
    o2.type = 'square';
    o2.frequency.setValueAtTime(12, t);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.05);
    g.gain.linearRampToValueAtTime(0.08, t + 0.6);

    o.connect(g); o2.connect(g); g.connect(ctx.destination);
    o.start(t); o2.start(t);
    window._crankNodes = {o:o, o2:o2, g:g};
  }catch(e){}
}
function stopCrank(){
  if(!ctx || !window._crankNodes) return;
  try{
    var n = window._crankNodes;
    var t = ctx.currentTime;
    n.g.gain.setTargetAtTime(0, t, 0.06);
    setTimeout(function(){
      try{n.o.stop();}catch(e){}
      try{n.o2.stop();}catch(e){}
      window._crankNodes = null;
    }, 300);
  }catch(e){}
}

/* ==================== ЗАВЁЛСЯ ==================== */
function starter(){
  if(!initAudio()) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(50, t);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.6);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.8);
  }catch(e){}
}

/* ==================== ГЛОХНЕТ ==================== */
function stall(){
  if(!ctx) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(22, t + 0.7);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.10, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.9);
  }catch(e){}
}

/* ==================== ХРУСТ КОРОБКИ (сильный) ==================== */
function gearCrunch(){
  if(!initAudio()) return;
  if(!ctx) return;
  try{
    var t = ctx.currentTime;

    /* 1) Металлический скрежет — шум с резонансом */
    var bufSize = Math.floor(ctx.sampleRate * 0.22);
    var buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for(var i = 0; i < bufSize; i++){
      var env = Math.exp(-i / (bufSize * 0.35));
      /* Рваный шум — металл скрежещет */
      var jitter = (Math.random() < 0.4) ? 1.8 : 0.6;
      data[i] = (Math.random() * 2 - 1) * env * jitter;
    }
    var noise = ctx.createBufferSource();
    noise.buffer = buffer;

    var filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 3200;
    filt.Q.value = 8;

    var g = ctx.createGain();
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noise.connect(filt); filt.connect(g); g.connect(ctx.destination);
    noise.start(t);

    /* 2) Резкий металлический удар — высокий */
    var o1 = ctx.createOscillator();
    o1.type = 'square';
    o1.frequency.setValueAtTime(320, t);
    o1.frequency.exponentialRampToValueAtTime(90, t + 0.12);
    var og1 = ctx.createGain();
    og1.gain.setValueAtTime(0.15, t);
    og1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o1.connect(og1); og1.connect(ctx.destination);
    o1.start(t); o1.stop(t + 0.18);

    /* 3) Низкий глухой удар */
    var o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(120, t);
    o2.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    var og2 = ctx.createGain();
    og2.gain.setValueAtTime(0.18, t);
    og2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o2.connect(og2); og2.connect(ctx.destination);
    o2.start(t); o2.stop(t + 0.15);

    /* 4) Дребезг — второй скрежет через 60мс */
    setTimeout(function(){
      if(!ctx) return;
      try{
        var t2 = ctx.currentTime;
        var b2 = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
        var d2 = b2.getChannelData(0);
        for(var j = 0; j < d2.length; j++){
          var env2 = Math.exp(-j / (d2.length * 0.4));
          d2[j] = (Math.random() * 2 - 1) * env2;
        }
        var n2 = ctx.createBufferSource();
        n2.buffer = b2;
        var f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.value = 4200;
        f2.Q.value = 10;
        var g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.15, t2);
        g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.14);
        n2.connect(f2); f2.connect(g2); g2.connect(ctx.destination);
        n2.start(t2);
      }catch(e){}
    }, 60);

  }catch(e){ console.warn('gearCrunch err:', e); }
}

/* ==================== МЯГКИЙ ЩЕЛЧОК ==================== */
function gearClick(){
  if(!initAudio()) return;
  if(!ctx) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(450, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.05);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.09);

    /* Короткий тик */
    var bufSize = Math.floor(ctx.sampleRate * 0.02);
    var b = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var d = b.getChannelData(0);
    for(var i = 0; i < bufSize; i++){
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.2));
    }
    var n = ctx.createBufferSource();
    n.buffer = b;
    var f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1500;
    var g2 = ctx.createGain();
    g2.gain.value = 0.05;
    n.connect(f); f.connect(g2); g2.connect(ctx.destination);
    n.start(t);
  }catch(e){}
}

/* ==================== БУКС (опционально) ==================== */
function tireSqueal(){
  if(!ctx) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(800, t);
    o.frequency.linearRampToValueAtTime(700, t + 0.3);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.linearRampToValueAtTime(0.04, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.45);
  }catch(e){}
}

/* ==================== УПРАВЛЕНИЕ ==================== */
function toggleMute(){
  muted = !muted;
  try{ localStorage.setItem('dvs_muted', muted ? '1' : '0'); }catch(e){}
  return muted;
}
function isMuted(){ return muted; }

try{
  if(localStorage.getItem('dvs_muted') === '1') muted = true;
}catch(e){}

/* ==================== API ==================== */
window.DVS_SOUND = {
  init: initAudio,
  fuelPump: fuelPump,
  startCrank: startCrank,
  stopCrank: stopCrank,
  starter: starter,
  stall: stall,
  toggleMute: toggleMute,
  isMuted: isMuted,
  gearCrunch: gearCrunch,
  gearClick: gearClick,
  tireSqueal: tireSqueal
};

document.addEventListener('touchstart', function(){ if(!ctx) initAudio(); }, {once:true, passive:true});
document.addEventListener('click', function(){ if(!ctx) initAudio(); }, {once:true});

console.log('sound.js: загружено (с хрустом коробки)');
})();