(function(){
"use strict";
var S = window.S;
if(!S) return;

/* Общая «грубость» двигателей: 1.0 — как задумано профилями,
   больше — грубее и рычащее, меньше — мягче. */
var ROUGH = 1.0;
/* Сколько секунд звук затихает после выключения зажигания */
var STOP_FADE = 1.2;

var ctx = null;
var masterGain = null;
var muted = false;
var oscStarted = false;
var shuttingDown = false;

var oscSub=null, oscSaw1=null, oscSaw2=null, oscSq=null;
var subGain=null, saw1Gain=null, saw2Gain=null, sqGain=null;
var noiseNode=null, noiseFilter=null, noiseGain=null;
var lfo=null, lfoGain=null;
var preGain=null, shaper=null, mainFilter=null, pulseGain=null, postGain=null;
var curveKey=null;
var stopT0=null, stopRpm=0;

/* rough — насколько двигатель «стучит» и неровно работает на низких оборотах */
var PROFILES = {
  scooter:  { pitch:1.55, sub:0.14, saw:0.24, sq:0.10, noise:0.035, drive:8.0,  filter:1800, q:2.6, wave:'sawtooth', detune:34, rough:0.75 },
  tdi:      { pitch:0.68, sub:0.32, saw:0.30, sq:0.18, noise:0.120, drive:15.0, filter:780,  q:3.6, wave:'square',   detune:70, rough:1.00 },
  dci:      { pitch:0.74, sub:0.30, saw:0.28, sq:0.16, noise:0.110, drive:14.0, filter:900,  q:3.4, wave:'square',   detune:66, rough:0.95 },
  mt82:     { pitch:0.50, sub:0.44, saw:0.36, sq:0.24, noise:0.170, drive:17.0, filter:480,  q:4.2, wave:'square',   detune:95, rough:1.00 },
  passatb3: { pitch:0.96, sub:0.20, saw:0.26, sq:0.12, noise:0.032, drive:8.5,  filter:1400, q:2.8, wave:'sawtooth', detune:34, rough:0.60 },
  bluebird: { pitch:1.00, sub:0.20, saw:0.28, sq:0.13, noise:0.036, drive:9.0,  filter:1450, q:2.9, wave:'sawtooth', detune:38, rough:0.65 },
  galant6:  { pitch:1.14, sub:0.18, saw:0.24, sq:0.10, noise:0.036, drive:7.5,  filter:1700, q:2.5, wave:'sawtooth', detune:24, rough:0.55 },
  wankel:   { pitch:1.30, sub:0.14, saw:0.30, sq:0.16, noise:0.040, drive:9.5,  filter:2200, q:3.4, wave:'sawtooth', detune:50, rough:0.45 },
  r4:       { pitch:0.98, sub:0.22, saw:0.28, sq:0.12, noise:0.034, drive:8.5,  filter:1400, q:2.8, wave:'sawtooth', detune:36, rough:0.65 },
  v8:       { pitch:1.08, sub:0.24, saw:0.26, sq:0.12, noise:0.050, drive:8.5,  filter:1600, q:2.6, wave:'sawtooth', detune:22, rough:0.80 },
  v16:      { pitch:0.86, sub:0.36, saw:0.32, sq:0.18, noise:0.075, drive:11.5, filter:1250, q:3.2, wave:'sawtooth', detune:76, rough:0.90 },
  boxer4:   { pitch:1.10, sub:0.30, saw:0.32, sq:0.13, noise:0.050, drive:8.5,  filter:1150, q:3.0, wave:'sawtooth', detune:40, rough:0.85 },
  i6:       { pitch:1.15, sub:0.28, saw:0.28, sq:0.11, noise:0.036, drive:8.0,  filter:1550, q:2.8, wave:'sawtooth', detune:22, rough:0.60 },
  radial9:  { pitch:0.42, sub:0.52, saw:0.40, sq:0.24, noise:0.170, drive:14.0, filter:620,  q:4.0, wave:'square',   detune:110, rough:1.00 }
};
var DEFAULT_PROFILE = PROFILES.r4;

function getProfile(){
  var t = S.engineType || 'r4';
  return PROFILES[t] || DEFAULT_PROFILE;
}

/* Несимметричное ограничение: добавляет чётные гармоники — «хриплый» звук.
   Кривая строится один раз на тип двигателя, а не каждые 30 мс. */
function makeDriveCurve(amount){
  var n = 2048;
  var curve = new Float32Array(n);
  var bias = 0.22;
  var off = Math.tanh(bias) * 0.7 + Math.tanh(bias * 1.5) * 0.3;
  for(var i = 0; i < n; i++){
    var x = (i * 2) / n - 1;
    var y = Math.tanh(x * amount + bias) * 0.7 + Math.tanh(x * amount * 2 + bias * 1.5) * 0.3 - off;
    curve[i] = Math.max(-1, Math.min(1, y));
  }
  return curve;
}

/* ---------- источники звука (создаются заново после каждой остановки) ---------- */
function buildSources(){
  oscSub = ctx.createOscillator(); oscSub.type = 'sine'; oscSub.frequency.value = 40;
  subGain = ctx.createGain(); subGain.gain.value = 0;
  oscSub.connect(subGain); subGain.connect(preGain);

  oscSaw1 = ctx.createOscillator(); oscSaw1.type = 'sawtooth'; oscSaw1.frequency.value = 80;
  saw1Gain = ctx.createGain(); saw1Gain.gain.value = 0;
  oscSaw1.connect(saw1Gain); saw1Gain.connect(preGain);

  oscSaw2 = ctx.createOscillator(); oscSaw2.type = 'sawtooth'; oscSaw2.frequency.value = 82;
  oscSaw2.detune.value = 40;
  saw2Gain = ctx.createGain(); saw2Gain.gain.value = 0;
  oscSaw2.connect(saw2Gain); saw2Gain.connect(preGain);

  oscSq = ctx.createOscillator(); oscSq.type = 'square'; oscSq.frequency.value = 20;
  sqGain = ctx.createGain(); sqGain.gain.value = 0;
  oscSq.connect(sqGain); sqGain.connect(preGain);

  var bufSize = 2 * ctx.sampleRate;
  var buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for(var i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;
  noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1200;
  noiseFilter.Q.value = 0.8;
  noiseGain = ctx.createGain();
  noiseGain.gain.value = 0;
  noiseNode.connect(noiseFilter); noiseFilter.connect(noiseGain);
  noiseGain.connect(preGain);

  /* LFO на частоте вспышек: пульсация громкости — «тарахтение» двигателя */
  lfo = ctx.createOscillator(); lfo.type = 'sawtooth'; lfo.frequency.value = 10;
  lfoGain = ctx.createGain(); lfoGain.gain.value = 0;
  lfo.connect(lfoGain); lfoGain.connect(pulseGain.gain);
}

function teardownSources(){
  var list = [oscSub, oscSaw1, oscSaw2, oscSq, noiseNode, lfo];
  for(var i = 0; i < list.length; i++){
    var n = list[i];
    if(!n) continue;
    try{ n.stop(); }catch(e){}
    try{ n.disconnect(); }catch(e){}
  }
  var gains = [subGain, saw1Gain, saw2Gain, sqGain, noiseGain, noiseFilter, lfoGain];
  for(var j = 0; j < gains.length; j++){
    if(gains[j]) try{ gains[j].disconnect(); }catch(e){}
  }
}

function initAudio(){
  if(ctx) return true;
  try{
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return false;
    ctx = new AC();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    postGain = ctx.createGain();
    postGain.gain.value = 0.9;
    postGain.connect(masterGain);

    pulseGain = ctx.createGain();
    pulseGain.gain.value = 1;
    pulseGain.connect(postGain);

    mainFilter = ctx.createBiquadFilter();
    mainFilter.type = 'lowpass';
    mainFilter.frequency.value = 1600;
    mainFilter.Q.value = 2.8;
    mainFilter.connect(pulseGain);

    shaper = ctx.createWaveShaper();
    shaper.curve = makeDriveCurve(8);
    shaper.oversample = '4x';
    shaper.connect(mainFilter);

    preGain = ctx.createGain();
    preGain.gain.value = 0.8;
    preGain.connect(shaper);

    buildSources();
    return true;
  }catch(e){ return false; }
}

function startOscillators(){
  if(oscStarted || !ctx) return;
  oscStarted = true;
  try{ oscSub.start(); }catch(e){}
  try{ oscSaw1.start(); }catch(e){}
  try{ oscSaw2.start(); }catch(e){}
  try{ oscSq.start(); }catch(e){}
  try{ noiseNode.start(); }catch(e){}
  try{ lfo.start(); }catch(e){}
}

function unlockAudio(){
  if(!ctx) initAudio();
  if(ctx && ctx.state === 'suspended'){ctx.resume().catch(function(){});}
}
document.addEventListener('touchstart', unlockAudio, {passive:true});
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);

/* ---------- состояние звука ----------
   Раньше при выключении громкость считалась от S.rpm. Если физика не снижает
   обороты (двигатель выключен, но не заглох), звук держался бесконечно.
   Теперь затухание идёт по таймеру и от оборотов не зависит. */
function engineState(t){
  var running = S.running && !S.stalled;
  var stopping = S.ignitionState === 'stopping';
  if(running){
    stopT0 = null;
    return {mode:'run', vol:1, rpm:S.rpm || 0};
  }
  if(stopping){
    if(stopT0 === null){ stopT0 = t; stopRpm = S.rpm || 0; }
    var el = t - stopT0;
    if(el >= STOP_FADE) return {mode:'off'};
    var f = 1 - el / STOP_FADE;
    return {mode:'stop', vol:f, rpm:stopRpm * f * f};
  }
  stopT0 = null;
  return {mode:'off'};
}

function silence(){
  if(!oscStarted || shuttingDown) return;
  shuttingDown = true;
  var t = ctx.currentTime;
  try{
    masterGain.gain.cancelScheduledValues(t);
    masterGain.gain.setTargetAtTime(0, t, 0.03);
  }catch(e){}
  setTimeout(function(){
    /* если за это время двигатель снова завели — не глушим */
    if(engineState(ctx.currentTime).mode !== 'off'){ shuttingDown = false; return; }
    teardownSources();
    try{ buildSources(); }catch(e){}
    oscStarted = false;
    shuttingDown = false;
  }, 180);
}

function updateSound(){
  if(!ctx || !masterGain || shuttingDown) return;
  var t = ctx.currentTime;
  var st = engineState(t);

  if(st.mode === 'off'){ silence(); return; }
  if(!oscStarted) startOscillators();

  var P = getProfile();
  var E = (S.engines && S.engines[S.engineType]) || null;
  var cyls = (E && E.cyls) || 4;
  var redline = (E && E.redline) || 7000;
  var rpm = st.rpm;
  var thr = (st.mode === 'run') ? (S.throttle || 0) : 0;
  var vol = st.vol;
  var rough = Math.min(1.4, P.rough * ROUGH);
  var lump = 1 - Math.min(1, rpm / redline);       /* неровность сильнее на низких оборотах */

  var mainFreq = (30 + rpm * 0.05) * P.pitch;
  mainFreq *= 1 + (Math.random() - 0.5) * 0.03 * rough * (0.3 + lump);   /* дрожание тона */
  if(mainFreq < 15) mainFreq = 15;
  var subFreq = mainFreq * 0.5;
  var sqFreq = mainFreq * 0.25;
  if(sqFreq < 3) sqFreq = 3;

  var gritK = 1 + rough * 0.8;
  var subL   = P.sub   * 0.42 * (0.4 + Math.min(1, rpm/3000) * 0.6) * vol;
  var sawL   = P.saw   * 0.30 * (0.35 + thr * 0.65) * vol;
  var sqL    = P.sq    * 0.20 * (0.45 + Math.min(1, rpm/5000) * 0.55) * vol;
  var noiseL = P.noise * gritK * (0.5 + thr * 0.5) * vol;

  /* пульсация на частоте вспышек, чтобы не превращалась в жужжание,
     частота делится до разумной */
  var fireHz = rpm * cyls / 120;
  if(fireHz < 1) fireHz = 1;
  while(fireHz > 50) fireHz /= 2;
  var depth = Math.min(0.6, rough * (0.10 + 0.34 * lump));

  var smooth = (st.mode === 'stop') ? 0.10 : 0.03;
  var fSmooth = (st.mode === 'stop') ? 0.15 : 0.02;
  try{
    subGain.gain.setTargetAtTime(subL, t, smooth);
    saw1Gain.gain.setTargetAtTime(sawL * 0.65, t, smooth);
    saw2Gain.gain.setTargetAtTime(sawL * 0.55, t, smooth);
    sqGain.gain.setTargetAtTime(sqL, t, smooth);
    noiseGain.gain.setTargetAtTime(noiseL, t, smooth);

    oscSub.frequency.setTargetAtTime(subFreq, t, fSmooth);
    oscSaw1.frequency.setTargetAtTime(mainFreq, t, fSmooth);
    oscSaw2.frequency.setTargetAtTime(mainFreq, t, fSmooth);
    oscSaw2.detune.value = P.detune + Math.sin(t * 4) * 6 + (Math.random() - 0.5) * 12 * rough;
    oscSq.frequency.setTargetAtTime(sqFreq, t, fSmooth);
    if(oscSaw1.type !== P.wave) oscSaw1.type = P.wave;

    var nF = P.filter + rpm * 0.12;
    if(nF > 5000) nF = 5000;
    mainFilter.frequency.setTargetAtTime(nF, t, 0.06);
    mainFilter.Q.setTargetAtTime(P.q, t, 0.1);

    /* кривую меняем только при смене двигателя */
    var key = S.engineType || 'r4';
    if(curveKey !== key){ shaper.curve = makeDriveCurve(P.drive); curveKey = key; }
    /* чем больше газ, тем сильнее перегруз */
    preGain.gain.setTargetAtTime(0.75 + thr * 0.55, t, 0.05);

    lfo.frequency.setTargetAtTime(fireHz, t, 0.03);
    pulseGain.gain.setTargetAtTime(1 - depth / 2, t, 0.05);
    lfoGain.gain.setTargetAtTime(-depth / 2, t, 0.05);

    noiseFilter.frequency.setTargetAtTime(700 + rpm * 0.3, t, 0.05);
    masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, t, 0.08);
  }catch(e){}
}
setInterval(updateSound, 30);

/* ---------- одиночные звуки ---------- */
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

/* Стартер. Раньше звук мог остаться навсегда, если stopCrank не вызвали
   (заглох при пуске, повторное нажатие). Теперь прошлый звук глушится
   при новом запуске и есть автоостановка. */
function killCrank(fast){
  var n = window._crankNodes;
  if(!n) return;
  window._crankNodes = null;
  if(n.timer) clearTimeout(n.timer);
  try{ n.g.gain.cancelScheduledValues(ctx.currentTime); n.g.gain.setTargetAtTime(0, ctx.currentTime, fast ? 0.01 : 0.06); }catch(e){}
  setTimeout(function(){
    try{ n.o.stop(); }catch(e){}
    try{ n.o2.stop(); }catch(e){}
  }, fast ? 60 : 300);
}
function startCrank(){
  if(!initAudio()) return;
  try{
    killCrank(true);
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
    g.gain.linearRampToValueAtTime(0.09, t + 0.05);
    g.gain.linearRampToValueAtTime(0.09, t + 0.6);
    o.connect(g); o2.connect(g); g.connect(ctx.destination);
    o.start(t); o2.start(t);
    var nodes = {o:o, o2:o2, g:g, timer:null};
    nodes.timer = setTimeout(function(){ if(window._crankNodes === nodes) killCrank(false); }, 4500);
    window._crankNodes = nodes;
  }catch(e){}
}
function stopCrank(){
  if(!ctx) return;
  killCrank(false);
}

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
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.8);
  }catch(e){}
}

function stall(){
  if(!ctx) return;
  try{
    var t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(22, t + 0.7);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.9);
  }catch(e){}
}

function gearCrunch(){
  if(!initAudio()) return;
  if(!ctx) return;
  try{
    var t = ctx.currentTime;
    var bufSize = Math.floor(ctx.sampleRate * 0.22);
    var buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for(var i = 0; i < bufSize; i++){
      var env = Math.exp(-i / (bufSize * 0.35));
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
    var o1 = ctx.createOscillator();
    o1.type = 'square';
    o1.frequency.setValueAtTime(320, t);
    o1.frequency.exponentialRampToValueAtTime(90, t + 0.12);
    var og1 = ctx.createGain();
    og1.gain.setValueAtTime(0.15, t);
    og1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o1.connect(og1); og1.connect(ctx.destination);
    o1.start(t); o1.stop(t + 0.18);
    var o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(120, t);
    o2.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    var og2 = ctx.createGain();
    og2.gain.setValueAtTime(0.18, t);
    og2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o2.connect(og2); og2.connect(ctx.destination);
    o2.start(t); o2.stop(t + 0.15);
  }catch(e){}
}

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
  }catch(e){}
}

function toggleMute(){
  muted = !muted;
  try{ localStorage.setItem('dvs_muted', muted ? '1' : '0'); }catch(e){}
  return muted;
}
function isMuted(){ return muted; }

try{
  if(localStorage.getItem('dvs_muted') === '1') muted = true;
}catch(e){}

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
  gearClick: gearClick
};

document.addEventListener('touchstart', function(){ if(!ctx) initAudio(); }, {once:true, passive:true});
document.addEventListener('click', function(){ if(!ctx) initAudio(); }, {once:true});

console.log('sound.js: 14 профилей');
})();
