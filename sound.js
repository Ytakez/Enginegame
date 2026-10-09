(function(){
"use strict";
var S = window.S;
if(!S) return;

/* ==================== СОСТОЯНИЕ ==================== */
var ctx = null;
var masterGain = null;
var muted = false;

/* Источники */
var oscSub = null;      /* низкие частоты — гул */
var oscSaw = null;      /* пила — грубый тембр */
var oscSq = null;       /* квадрат — вспышки */
var noiseNode = null;   /* белый шум */
var noiseFilter = null;
var noiseGain = null;

/* Гейны по каналам */
var subGainNode = null;
var sawGainNode = null;
var sqGainNode = null;

/* Прочие одноразовые звуки */
var crankOsc = null;
var crankGain = null;
var pumpOsc = null;
var pumpGain = null;

var started = false;
var lastFireTime = 0;

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

    /* === SUB — гул низких частот === */
    oscSub = ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.value = 60;

    subGainNode = ctx.createGain();
    subGainNode.gain.value = 0;
    oscSub.connect(subGainNode);
    subGainNode.connect(masterGain);
    oscSub.start();

    /* === SAW — грубый тембр === */
    oscSaw = ctx.createOscillator();
    oscSaw.type = 'sawtooth';
    oscSaw.frequency.value = 120;

    sawGainNode = ctx.createGain();
    sawGainNode.gain.value = 0;
    oscSaw.connect(sawGainNode);
    sawGainNode.connect(masterGain);
    oscSaw.start();

    /* === SQUARE — вспышки === */
    oscSq = ctx.createOscillator();
    oscSq.type = 'square';
    oscSq.frequency.value = 30;

    sqGainNode = ctx.createGain();
    sqGainNode.gain.value = 0;
    oscSq.connect(sqGainNode);
    sqGainNode.connect(masterGain);
    oscSq.start();

    /* === ШУМ — дизельный цокот === */
    var bufSize = 2 * ctx.sampleRate;
    var buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for(var i = 0; i < bufSize; i++){
      data[i] = Math.random() * 2 - 1;
    }
    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1500;
    noiseFilter.Q.value = 0.8;

    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseNode.start();

    started = true;
    console.log('sound.js: аудио инициализировано');
    return true;
  }catch(e){
    console.warn('sound.js: аудио недоступно', e);
    return false;
  }
}

/* ==================== РАЗБЛОКИРОВКА (iOS/Android) ==================== */
function unlockAudio(){
  if(!ctx) initAudio();
  if(ctx && ctx.state === 'suspended'){
    ctx.resume().catch(function(){});
  }
}

document.addEventListener('touchstart', unlockAudio, {once:false, passive:true});
document.addEventListener('click', unlockAudio, {once:false});
document.addEventListener('keydown', unlockAudio, {once:false});

/* ==================== ОСНОВНОЙ ЦИКЛ ==================== */
function updateSound(){
  if(!ctx || !started) return;

  var E = (S.engines && S.engines[S.engineType]) || {};
  var rpm = S.rpm || 0;
  var thr = S.throttle || 0;
  var running = S.running && !S.stalled;
  var stopping = S.ignitionState === 'stopping';

  /* === МНОЖИТЕЛЬ ГРОМКОСТИ — плавное затухание при глушении === */
  var volMul = 1;
  if(stopping){
    /* Пока глохнет — громкость линейно падает с оборотами */
    volMul = Math.max(0, Math.min(1, rpm / 4500));
  } else if(!running && S.ignitionState === 'off'){
    volMul = 0;
  } else if(!running && S.ignitionState === 'ready'){
    volMul = 0;
  } else if(!running && S.ignitionState === 'priming'){
    volMul = 0;
  }

  /* === ЧАСТОТЫ === */
  var baseFreq = (E.lpBase || 500) + rpm * (E.lpRpm || 0.1);
  if(baseFreq < 15) baseFreq = 15;

  /* Частота вспышек (для квадрата) */
  var fireFreq = (rpm / 60) * ((E.cyls || 4) / 2);
  if(fireFreq < 1) fireFreq = 1;

  /* === ГРОМКОСТИ ПО КАНАЛАМ === */
  /* SUB — низкие, есть всегда когда работает */
  var subVol = 0;
  if(running || stopping){
    subVol = (E.subGain || 1.0) * 0.25 * volMul;
    if(!running) subVol *= 0.5;
  }

  /* SAW — грубый тембр, зависит от газа */
  var sawVol = 0;
  if(running){
    sawVol = (E.sawGain || 0.4) * 0.18 * (0.3 + thr * 0.7) * volMul;
  } else if(stopping){
    sawVol = (E.sawGain || 0.4) * 0.12 * volMul;
  }

  /* SQ — вспышки, зависит от оборотов */
  var sqVol = 0;
  if(running){
    sqVol = (E.sqGain || 0.1) * 0.10 * (0.5 + Math.min(1, rpm / 5000) * 0.5) * volMul;
  } else if(stopping){
    sqVol = (E.sqGain || 0.1) * 0.06 * volMul;
  }

  /* NOISE — шум, особенно у дизелей */
  var noiseVol = 0;
  if(running){
    noiseVol = (E.noiseBase || 0.02) * (0.5 + thr * 0.5) * volMul;
  } else if(stopping){
    noiseVol = (E.noiseBase || 0.02) * 0.5 * volMul;
  }

  /* === ПРИМЕНЯЕМ ПЛАВНО === */
  var t = ctx.currentTime;
  var speed = stopping ? 0.15 : 0.03;  /* при глушении плавнее */

  if(subGainNode) subGainNode.gain.setTargetAtTime(subVol, t, speed);
  if(sawGainNode) sawGainNode.gain.setTargetAtTime(sawVol, t, speed);
  if(sqGainNode)  sqGainNode.gain.setTargetAtTime(sqVol, t, speed);
  if(noiseGain)   noiseGain.gain.setTargetAtTime(noiseVol, t, speed);

  /* Частоты — плавно падают с оборотами */
  var freqSpeed = stopping ? 0.2 : 0.02;
  if(oscSub) oscSub.frequency.setTargetAtTime(baseFreq * 0.5, t, freqSpeed);
  if(oscSaw) oscSaw.frequency.setTargetAtTime(baseFreq * 1.5, t, freqSpeed);
  if(oscSq)  oscSq.frequency.setTargetAtTime(fireFreq, t, freqSpeed);

  /* Фильтр шума — вверх при разгоне */
  if(noiseFilter){
    var nFreq = 800 + rpm * 0.4;
    if(nFreq > 6000) nFreq = 6000;
    noiseFilter.frequency.setTargetAtTime(nFreq, t, 0.05);
  }

  /* Общая громкость */
  if(masterGain){
    var masterVol = muted ? 0 : 1;
    masterGain.gain.setTargetAtTime(masterVol, t, 0.1);
  }
}

/* Периодический цикл обновления звука — 30 раз в секунду */
setInterval(updateSound, 33);

/* ==================== ПУСК ТОПЛИВНОГО НАСОСА ==================== */
function fuelPump(){
  if(!initAudio()) return;
  if(!ctx) return;
  try{
    if(pumpOsc){ try{ pumpOsc.stop(); }catch(e){} pumpOsc = null; }
    if(pumpGain){ try{ pumpGain.disconnect(); }catch(e){} pumpGain = null; }

    pumpOsc = ctx.createOscillator();
    pumpOsc.type = 'triangle';
    pumpOsc.frequency.value = 90;

    pumpGain = ctx.createGain();
    pumpGain.gain.value = 0;
    pumpOsc.connect(pumpGain);
    pumpGain.connect(ctx.destination);

    var t = ctx.currentTime;
    pumpGain.gain.setValueAtTime(0, t);
    pumpGain.gain.linearRampToValueAtTime(0.05, t + 0.1);
    pumpGain.gain.linearRampToValueAtTime(0.05, t + 1.2);
    pumpGain.gain.linearRampToValueAtTime(0, t + 1.5);

    pumpOsc.start(t);
    pumpOsc.stop(t + 1.6);
  }catch(e){}
}

/* ==================== СТАРТЕР — крутит ==================== */
function startCrank(){
  if(!initAudio()) return;
  if(!ctx) return;
  try{
    if(crankOsc){ try{ crankOsc.stop(); }catch(e){} crankOsc = null; }
    if(crankGain){ try{ crankGain.disconnect(); }catch(e){} crankGain = null; }

    crankOsc = ctx.createOscillator();
    crankOsc.type = 'sawtooth';
    crankOsc.frequency.value = 8; /* медленное "рррр" */

    crankGain = ctx.createGain();
    crankGain.gain.value = 0;
    crankOsc.connect(crankGain);
    crankGain.connect(ctx.destination);

    var t = ctx.currentTime;
    crankGain.gain.setValueAtTime(0, t);
    crankGain.gain.linearRampToValueAtTime(0.06, t + 0.05);

    crankOsc.start(t);
  }catch(e){}
}

function stopCrank(){
  if(!ctx || !crankOsc) return;
  try{
    var t = ctx.currentTime;
    if(crankGain){
      crankGain.gain.setTargetAtTime(0, t, 0.05);
    }
    setTimeout(function(){
      try{ crankOsc.stop(); }catch(e){}
      crankOsc = null;
      crankGain = null;
    }, 200);
  }catch(e){}
}

/* ==================== СТАРТЕР — запустился ==================== */
function starter(){
  if(!initAudio()) return;
  if(!ctx) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(60, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.25);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.45);
  }catch(e){}
}

/* ==================== ГЛОХНЕТ ==================== */
function stall(){
  if(!ctx) return;
  try{
    var t = ctx.currentTime;
    /* Короткий скрежет + падение */
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(60, t);
    o.frequency.exponentialRampToValueAtTime(20, t + 0.5);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.7);
  }catch(e){}
}

/* ==================== УПРАВЛЕНИЕ ЗВУКОМ ==================== */
function toggleMute(){
  muted = !muted;
  try{
    localStorage.setItem('dvs_muted', muted ? '1' : '0');
  }catch(e){}
  return muted;
}

function isMuted(){
  return muted;
}

/* Загружаем сохранённый mute */
try{
  var savedMute = localStorage.getItem('dvs_muted');
  if(savedMute === '1') muted = true;
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

/* Автозапуск при первом взаимодействии */
function autoInit(){
  if(!ctx) initAudio();
}
document.addEventListener('touchstart', autoInit, {once:true, passive:true});
document.addEventListener('click', autoInit, {once:true});

console.log('sound.js: загружено');
})();