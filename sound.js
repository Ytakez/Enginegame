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

/* Тик вспышек */
var fireTick=0;

/* ==================== ПРОФИЛИ ДВИГАТЕЛЕЙ ==================== */
/* pitch  — множитель высоты (больше = выше)
   sub    — уровень саб-гула
   saw    — уровень пилы (основной тембр)
   sq     — уровень квадрата (вспышки)
   noise  — уровень шума (цокот дизеля)
   drive  — обрезка (грубость) 0..10
   filter — частота фильтра (ниже = глуше)
   q      — резонанс фильтра
   wave   — тип основного генератора
   detune — расстройка между 2 генераторами (грубость)
*/
var PROFILES = {
  /* Скутер — визгливый, высокий, 1 цилиндр */
  scooter: {
    pitch:1.55, sub:0.10, saw:0.16, sq:0.06,
    noise:0.010, drive:2.5, filter:3200, q:1.4,
    wave:'sawtooth', detune:12
  },
  /* 1.9 TDI — дизель, рокот, турбо-шипение */
  tdi: {
    pitch:0.72, sub:0.24, saw:0.20, sq:0.10,
    noise:0.038, drive:5.5, filter:1500, q:2.4,
    wave:'square', detune:30
  },
  /* 2.0 dCi — современный дизель, чуть мягче */
  dci: {
    pitch:0.78, sub:0.22, saw:0.18, sq:0.09,
    noise:0.032, drive:5.0, filter:1700, q:2.2,
    wave:'square', detune:28
  },
  /* Д-240 — трактор, ОЧЕНЬ грубый и низкий */
  mt82: {
    pitch:0.55, sub:0.32, saw:0.24, sq:0.14,
    noise:0.055, drive:7.0, filter:900, q:2.8,
    wave:'square', detune:45
  },
  /* 1.8 B3 — бензиновая четвёрка, спокойная */
  passatb3: {
    pitch:1.00, sub:0.14, saw:0.16, sq:0.06,
    noise:0.008, drive:3.0, filter:2400, q:1.6,
    wave:'sawtooth', detune:14
  },
  /* 2.0 CA20 — чуть резче */
  bluebird: {
    pitch:1.05, sub:0.14, saw:0.18, sq:0.07,
    noise:0.010, drive:3.2, filter:2600, q:1.7,
    wave:'sawtooth', detune:16
  },
  /* 2.0 V6 — мягкий, шестицилиндровый */
  galant6: {
    pitch:1.18, sub:0.12, saw:0.15, sq:0.05,
    noise:0.010, drive:2.5, filter:3000, q:1.4,
    wave:'triangle', detune:10
  },
  /* 13B Renesis — роторный, жужжит */
  wankel: {
    pitch:1.35, sub:0.10, saw:0.22, sq:0.09,
    noise:0.012, drive:3.5, filter:3800, q:2.0,
    wave:'sawtooth', detune:22
  },
  /* R4 — обычная бензиновая четвёрка */
  r4: {
    pitch:1.02, sub:0.15, saw:0.18, sq:0.07,
    noise:0.010, drive:3.0, filter:2500, q:1.7,
    wave:'sawtooth', detune:15
  },
  /* V12 — ровный, экзотический, высокооборотный */
  v8: {
    pitch:1.12, sub:0.16, saw:0.17, sq:0.06,
    noise:0.014, drive:2.8, filter:2900, q:1.5,
    wave:'sawtooth', detune:8
  },
  /* V22 — монстр, глубокий, многослойный */
  v16: {
    pitch:0.92, sub:0.26, saw:0.20, sq:0.10,
    noise:0.022, drive:4.0, filter:2100, q:2.0,
    wave:'sawtooth', detune:35
  }
};

var DEFAULT_PROFILE = PROFILES.r4;

function getProfile(){
  var t = S.engineType || 'r4';
  return PROFILES[t] || DEFAULT_PROFILE;
}

/* ==================== КРИВАЯ DRIVE (обрезка) ==================== */
function makeDriveCurve(amount){
  var n = 2048;
  var curve = new Float32Array(n);
  for(var i=0; i<n; i++){
    var x = (i * 2) / n - 1;
    /* tanh для мягкой обрезки */
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

    /* === MASTER === */
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    /* === DRIVE (дистошн) — грубость === */
    shaper = ctx.createWaveShaper();
    shaper.curve = makeDriveCurve(3);
    shaper.oversample = '2x';

    shaperGain = ctx.createGain();
    shaperGain.gain.value = 0.7;

    /* === ФИЛЬТР === */
    mainFilter = ctx.createBiquadFilter();
    mainFilter.type = 'lowpass';
    mainFilter.frequency.value = 2400;
    mainFilter.Q.value = 1.6;

    /* === ПОСТ-ГЕЙН === */
    postGain = ctx.createGain();
    postGain.gain.value = 1.0;

    /* Цепочка: [источники] -> shaper -> filter -> postGain -> masterGain -> dest */
    shaper.connect(mainFilter);
    mainFilter.connect(postGain);
    postGain.connect(masterGain);

    /* === SUB — глубина === */
    oscSub = ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.value = 40;
    subGain = ctx.createGain();
    subGain.gain.value = 0;
    oscSub.connect(subGain);
    subGain.connect(shaper);
    oscSub.start();

    /* === SAW1 — основной тембр === */
    oscSaw1 = ctx.createOscillator();
    oscSaw1.type = 'sawtooth';
    oscSaw1.frequency.value = 80;
    saw1Gain = ctx.createGain();
    saw1Gain.gain.value = 0;
    oscSaw1.connect(saw1Gain);
    saw1Gain.connect(shaper);
    oscSaw1.start();

    /* === SAW2 — расстроенный, для грубости === */
    oscSaw2 = ctx.createOscillator();
    oscSaw2.type = 'sawtooth';
    oscSaw2.frequency.value = 82;
    oscSaw2.detune.value = 20;   /* расстройка в центах */
    saw2Gain = ctx.createGain();
    saw2Gain.gain.value = 0;
    oscSaw2.connect(saw2Gain);
    saw2Gain.connect(shaper);
    oscSaw2.start();

    /* === SQUARE — вспышки === */
    oscSq = ctx.createOscillator();
    oscSq.type = 'square';
    oscSq.frequency.value = 20;
    sqGain = ctx.createGain();
    sqGain.gain.value = 0;
    oscSq.connect(sqGain);
    sqGain.connect(shaper);
    oscSq.start();

    /* === ШУМ — цокот/шипение === */
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

    console.log('sound.js: аудио готово');
    return true;
  }catch(e){
    console.warn('sound.js: ошибка аудио', e);
    return false;
  }
}

/* ==================== РАЗБЛОКИРОВКА ==================== */
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

  /* === МНОЖИТЕЛЬ ГРОМКОСТИ (плавное затухание) === */
  var volMul = 1;
  if(stopping){
    volMul = Math.max(0, Math.min(1, rpm / 4500));
  } else if(!running){
    volMul = 0;
  }

  /* === ЧАСТОТЫ === */
  /* mainFreq = базовая частота, растёт с оборотами */
  var mainFreq = (30 + rpm * 0.05) * P.pitch;
  if(mainFreq < 15) mainFreq = 15;

  var subFreq = mainFreq * 0.5;
  var sqFreq = mainFreq * 0.25;
  if(sqFreq < 3) sqFreq = 3;

  /* === УРОВНИ СИГНАЛОВ === */
  /* Вспышки — импульсами, по тактам */
  var fireRate = (rpm / 60) * ((S.engines[S.engineType] && S.engines[S.engineType].cyls) || 4) / 2;
  if(fireRate < 1) fireRate = 1;

  var subL = 0, sawL = 0, sqL = 0, noiseL = 0;

  if(running){
    subL   = P.sub * 0.30 * (0.4 + Math.min(1, rpm/3000) * 0.6);
    sawL   = P.saw * 0.22 * (0.3 + thr * 0.7);
    sqL    = P.sq  * 0.14 * (0.4 + Math.min(1, rpm/5000) * 0.6);
    noiseL = P.noise * (0.5 + thr * 0.5);
  } else if(stopping){
    subL   = P.sub   * 0.15;
    sawL   = P.saw   * 0.10;
    sqL    = P.sq    * 0.05;
    noiseL = P.noise * 0.4;
  }

  subL   *= volMul;
  sawL   *= volMul;
  sqL    *= volMul;
  noiseL *= volMul;

  /* === ПРИМЕНЯЕМ === */
  var t = ctx.currentTime;
  var smooth = stopping ? 0.12 : 0.03;

  subGain.gain.setTargetAtTime(subL, t, smooth);
  saw1Gain.gain.setTargetAtTime(sawL * 0.65, t, smooth);
  saw2Gain.gain.setTargetAtTime(sawL * 0.55, t, smooth);
  sqGain.gain.setTargetAtTime(sqL, t, smooth);
  noiseGain.gain.setTargetAtTime(noiseL, t, smooth);

  /* Частоты */
  var fSmooth = stopping ? 0.15 : 0.02;
  oscSub.frequency.setTargetAtTime(subFreq, t, fSmooth);
  oscSaw1.frequency.setTargetAtTime(mainFreq, t, fSmooth);
  oscSaw2.frequency.setTargetAtTime(mainFreq, t, fSmooth);
  oscSaw2.detune.value = P.detune + Math.sin(t * 3) * 3;   /* живая расстройка */
  oscSq.frequency.setTargetAtTime(sqFreq, t, fSmooth);

  /* Тип волны основной пилы — свой для каждого движка */
  if(oscSaw1.type !== P.wave) oscSaw1.type = P.wave;

  /* === ФИЛЬТР === */
  var nF = P.filter + rpm * 0.15;
  if(nF > 6000) nF = 6000;
  mainFilter.frequency.setTargetAtTime(nF, t, 0.06);
  mainFilter.Q.setTargetAtTime(P.q, t, 0.1);

  /* === DRIVE (дистошн) === */
  shaper.curve = makeDriveCurve(P.drive);
  shaperGain.gain.setTargetAtTime(0.5 + thr * 0.3, t, 0.05);

  /* === ШУМ-ФИЛЬТР === */
  noiseFilter.frequency.setTargetAtTime(
    P.noiseFreq || (900 + rpm * 0.3),
    t, 0.05
  );

  /* === ОБЩАЯ ГРОМКОСТЬ === */
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

    o.connect(g); o2.connect(g);
    g.connect(ctx.destination);
    o.start(t); o2.start(t);

    window._crankNodes = {o:o, o2:o2, g:g, t:t};
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

/* ==================== ПУБЛИЧНЫЙ API ==================== */
window.DVS_SOUND = {
  init: initAudio,
  fuelPump: fuelPump,
  startCrank: startCrank,
  stopCrank: stopCrank,
  starter: starter,
  stall: stall,
  toggleMute: toggleMute,
  isMuted: isMuted
};

/* Автозапуск при первом касании */
document.addEventListener('touchstart', function(){ if(!ctx) initAudio(); }, {once:true, passive:true});
document.addEventListener('click', function(){ if(!ctx) initAudio(); }, {once:true});

console.log('sound.js: загружено ' + Object.keys(PROFILES).length + ' профилей');
})();