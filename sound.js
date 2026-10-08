(function(){
"use strict";
var S=window.S;if(!S)return;
var ctx=null,nodes=null,muted=false;
var crankNodes=null;
try{if(localStorage.getItem('dvs_muted')==='1')muted=true;}catch(e){}
function hardCurve(){var n=4096,c=new Float32Array(n);for(var i=0;i<n;i++){var x=(i*2/n)-1,v=x*3;if(v>1)v=1;if(v<-1)v=-1;c[i]=v;}return c;}
function softCurve(k){var n=4096,c=new Float32Array(n);for(var i=0;i<n;i++){var x=(i*2/n)-1;c[i]=Math.tanh(x*k);}return c;}
function init(){
  if(ctx)return true;
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  try{ctx=new AC();}catch(e){return false;}
  var master=ctx.createGain();master.gain.value=0.7;master.connect(ctx.destination);
  var hc=ctx.createWaveShaper();hc.curve=hardCurve();hc.oversample='4x';
  var ss=ctx.createWaveShaper();ss.curve=softCurve(3.5);ss.oversample='2x';
  var growl=ctx.createBiquadFilter();growl.type='peaking';growl.frequency.value=180;growl.Q.value=2.5;growl.gain.value=12;
  var hs=ctx.createBiquadFilter();hs.type='highshelf';hs.frequency.value=2500;hs.gain.value=6;
  var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=1.2;
  var bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=320;bp.Q.value=0.7;
  lp.connect(hc);hc.connect(ss);ss.connect(growl);growl.connect(hs);hs.connect(bp);
  var eg=ctx.createGain();eg.gain.value=0;bp.connect(eg).connect(master);
  var o1=ctx.createOscillator();o1.type='sawtooth';var g1=ctx.createGain();g1.gain.value=0.55;o1.connect(g1).connect(lp);o1.start();
  var o1b=ctx.createOscillator();o1b.type='sawtooth';o1b.detune.value=18;var g1b=ctx.createGain();g1b.gain.value=0.35;o1b.connect(g1b).connect(lp);o1b.start();
  var o2=ctx.createOscillator();o2.type='square';var g2=ctx.createGain();g2.gain.value=0.18;o2.connect(g2).connect(lp);o2.start();
  var oS=ctx.createOscillator();oS.type='sine';var gS=ctx.createGain();gS.gain.value=1.2;oS.connect(gS).connect(lp);oS.start();
  var oS2=ctx.createOscillator();oS2.type='triangle';var gS2=ctx.createGain();gS2.gain.value=0.7;oS2.connect(gS2).connect(lp);oS2.start();
  var oTurbo=ctx.createOscillator();oTurbo.type='sine';var gTurbo=ctx.createGain();gTurbo.gain.value=0;oTurbo.connect(gTurbo).connect(master);oTurbo.start();
  var buf=ctx.createBuffer(1,2*ctx.sampleRate,ctx.sampleRate);
  var d=buf.getChannelData(0);
  for(var i2=0;i2<d.length;i2++)d[i2]=Math.random()*2-1;
  var noise=ctx.createBufferSource();noise.buffer=buf;noise.loop=true;
  var nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=1800;nf.Q.value=0.8;
  var nG=ctx.createGain();nG.gain.value=0;noise.connect(nf).connect(nG).connect(hc);noise.start();
  var noise2=ctx.createBufferSource();noise2.buffer=buf;noise2.loop=true;
  var nf2=ctx.createBiquadFilter();nf2.type='highpass';nf2.frequency.value=3000;
  var nG2=ctx.createGain();nG2.gain.value=0;noise2.connect(nf2).connect(nG2).connect(hc);noise2.start();
  var clatter=ctx.createBufferSource();clatter.buffer=buf;clatter.loop=true;
  var cf=ctx.createBiquadFilter();cf.type='bandpass';cf.frequency.value=2400;cf.Q.value=2.5;
  var cG=ctx.createGain();cG.gain.value=0;clatter.connect(cf).connect(cG).connect(hc);clatter.start();
  nodes={master:master,lp:lp,eg:eg,o1:o1,o1b:o1b,o2:o2,oS:oS,oS2:oS2,nG:nG,nG2:nG2,nf:nf,nf2:nf2,growl:growl,hs:hs,bp:bp,g1:g1,g1b:g1b,g2:g2,gS:gS,gS2:gS2,oTurbo:oTurbo,gTurbo:gTurbo,cG:cG,cf:cf,buf:buf};
  return true;
}
function setP(p,v,sm){if(!p)return;v=(typeof v==='number'&&isFinite(v))?v:0;try{p.setTargetAtTime(v,ctx.currentTime,sm||0.05);}catch(e){}}
function safe(n){return (typeof n==='number'&&isFinite(n))?n:0;}
function update(){
  if(!nodes||muted)return;
  var E=S.engines[S.engineType]||S.engines.r4;
  var rpm=safe(S.rpm),thr=safe(S.throttle);
  var run=S.running&&!S.stalled&&!S.broken;
  var sm=0.02;
  var isScooter=S.engineType==='scooter';
  var isDiesel=E.diesel===true;
  var isJDM=(S.engineType==='passatb3'||S.engineType==='bluebird'||S.engineType==='galant6');
  if(!run||rpm<20){
    setP(nodes.eg.gain,0,0.1);setP(nodes.nG.gain,0,0.1);setP(nodes.nG2.gain,0,0.1);
    setP(nodes.cG.gain,0,0.1);setP(nodes.gTurbo.gain,0,0.15);
    return;
  }
  var fireHz=rpm/E.fireDiv;if(!isFinite(fireHz))fireHz=0;
  var rr=Math.max(1,E.redline-E.idle);
  var rpmF=Math.min(1,Math.max(0,(rpm-E.idle)/rr));
  var rpmF2=rpmF*rpmF;
  /* ТРЯСКА ЗИМОЙ */
  var cold=(S.engineTemp<40)?(40-S.engineTemp)/55:0;
  if(cold>0.9)cold=0.9;
  if(isDiesel){
    setP(nodes.o1.frequency,fireHz*1.5,sm);setP(nodes.o1b.frequency,fireHz*1.5*1.008,sm);
    setP(nodes.o2.frequency,fireHz*2,sm);setP(nodes.oS.frequency,fireHz*0.5,sm);
    setP(nodes.oS2.frequency,fireHz*0.25,sm);
    var bD=0.16+thr*0.22;var lD=bD*(0.8+rpmF*0.5);
    if(rpm>E.redline*0.9)lD*=1.05;if(rpm>E.redline)lD*=0.85;
    setP(nodes.eg.gain,lD,0.05);
    var cl=0.10+rpmF*0.14+thr*0.10;
    setP(nodes.cG.gain,cl,0.04);
    setP(nodes.cf.frequency,2200+rpm*0.5+thr*800,0.05);
    setP(nodes.cf.Q,2.8+rpmF*1.5,0.05);
    setP(nodes.nG.gain,0.05+thr*0.06,0.05);
    setP(nodes.nf.frequency,1400+rpm*0.7,0.05);
    setP(nodes.nG2.gain,0.03+rpmF*0.05,0.05);
    setP(nodes.nf2.frequency,3200+rpm*0.8,0.05);
    var tF=2800+rpmF*5200;setP(nodes.oTurbo.frequency,tF,0.15);
    var tOn=Math.max(0,rpmF-0.15);
    setP(nodes.gTurbo.gain,tOn*tOn*0.055*(0.4+thr*0.6),0.12);
    var lpF=350+rpm*0.12+thr*400+rpmF2*500;if(lpF>2800)lpF=2800;
    setP(nodes.lp.frequency,lpF,0.05);
    setP(nodes.lp.Q,2.8+rpmF2*3,0.05);
    setP(nodes.growl.frequency,110+rpm*0.05,0.06);
    setP(nodes.growl.gain,16+rpmF2*12,0.06);
    setP(nodes.bp.frequency,240+rpm*0.06+thr*200,0.06);
    setP(nodes.bp.Q,1.0+rpmF*1.5,0.06);
    setP(nodes.g1.gain,0.35,0.05);setP(nodes.g1b.gain,0.22,0.05);
    setP(nodes.g2.gain,0.08,0.05);setP(nodes.gS.gain,1.8,0.05);setP(nodes.gS2.gain,1.1,0.05);
    if(E.tractor){
      setP(nodes.oTurbo.frequency,0,0.01);setP(nodes.gTurbo.gain,0,0.01);
      setP(nodes.cG.gain,0.22+rpmF*0.18+thr*0.15,0.03);
      setP(nodes.cf.frequency,1600+rpm*0.4+thr*500,0.04);
      setP(nodes.gS.gain,2.4,0.04);setP(nodes.gS2.gain,1.6,0.04);
      var lpTr=280+rpm*0.08+thr*300;if(lpTr>2000)lpTr=2000;
      setP(nodes.lp.frequency,lpTr,0.04);
      setP(nodes.lp.Q,3.5+rpmF*2.5,0.04);
      setP(nodes.growl.frequency,80+rpm*0.03,0.05);
      setP(nodes.growl.gain,20+rpmF*14,0.05);
    }
    return;
  }
  if(isJDM){
    var isV6=S.engineType==='galant6';
    setP(nodes.o1.frequency,fireHz*(isV6?2.5:2),sm);
    setP(nodes.o1b.frequency,fireHz*(isV6?2.5:2)*1.006,sm);
    setP(nodes.o2.frequency,fireHz*(isV6?3.5:3),sm);
    setP(nodes.oS.frequency,fireHz*0.5,sm);setP(nodes.oS2.frequency,fireHz*0.25,sm);
    var bJ=0.09+thr*0.26;var lJ=bJ*(0.5+rpmF*0.95);
    if(rpm>E.redline*0.9)lJ*=1.12;if(rpm>E.redline)lJ*=0.75;
    setP(nodes.eg.gain,lJ,0.04);
    setP(nodes.nG.gain,0.02+thr*0.06+rpmF*0.02,0.05);
    setP(nodes.nf.frequency,1400+rpm*1.2,0.05);
    setP(nodes.nG2.gain,Math.max(0,rpmF-0.6)*0.08,0.05);
    setP(nodes.nf2.frequency,3500+rpm*1.5,0.05);
    var lpJ=(isV6?550:750)+rpm*0.18+thr*900;if(lpJ>4500)lpJ=4500;
    setP(nodes.lp.frequency,lpJ,0.05);setP(nodes.lp.Q,1.2+rpmF2*2.5,0.05);
    setP(nodes.growl.frequency,(isV6?120:150)+rpm*0.04,0.06);
    setP(nodes.growl.gain,(isV6?14:10)+rpmF2*12,0.06);
    setP(nodes.bp.frequency,280+rpm*0.06+thr*250,0.06);
    setP(nodes.bp.Q,0.7+rpmF*1.3,0.06);
    setP(nodes.g1.gain,E.sawGain,0.05);setP(nodes.g1b.gain,E.sawGain*0.6,0.05);
    setP(nodes.g2.gain,E.sqGain,0.05);setP(nodes.gS.gain,E.subGain,0.05);
    setP(nodes.gS2.gain,E.subGain*0.6,0.05);
    setP(nodes.gTurbo.gain,0,0.1);setP(nodes.cG.gain,0,0.1);
    return;
  }
  setP(nodes.gTurbo.gain,0,0.15);setP(nodes.cG.gain,0,0.1);
  setP(nodes.o1.frequency,fireHz*2,sm);
  setP(nodes.o1b.frequency,fireHz*2*1.005,sm);
  setP(nodes.o2.frequency,fireHz*3,sm);
  setP(nodes.oS.frequency,fireHz*0.5,sm);setP(nodes.oS2.frequency,fireHz*0.25,sm);
  var b2=isScooter?(0.09+thr*0.20):(0.10+thr*0.28);
  var l2=b2*(isScooter?(0.85+rpmF*1.05):(0.5+rpmF*0.9));
  if(rpm>E.redline*0.9)l2*=1.15;if(rpm>E.redline)l2*=0.7;if(isScooter)l2*=0.45;
  setP(nodes.eg.gain,l2,0.04);
  var nB=(isScooter?(0.04+thr*0.07):(0.03+thr*0.07))+rpmF*E.noiseBase*1.2;
  setP(nodes.nG.gain,nB,0.05);
  setP(nodes.nf.frequency,(isScooter?1800:1200)+rpm*1.0+thr*1500,0.05);
  var nB2=Math.max(0,(rpmF-0.5))*(isScooter?0.12:0.15)+thr*rpmF2*(isScooter?0.08:0.12);
  setP(nodes.nG2.gain,nB2,0.05);
  setP(nodes.nf2.frequency,3500+rpm*1.5,0.05);
  var lp2;
  if(isScooter){lp2=E.lpBase-rpm*0.4+thr*700+rpmF2*900;if(lp2<400)lp2=400;if(lp2>3200)lp2=3200;}
  else{lp2=E.lpBase+rpm*E.lpRpm+thr*900+rpmF2*1500;if(lp2>4500)lp2=4500;}
  setP(nodes.lp.frequency,lp2,0.05);
  setP(nodes.lp.Q,(isScooter?2.0:1.2)+rpmF2*2.5,0.05);
  setP(nodes.growl.frequency,(isScooter?200:140)+rpm*(isScooter?0.15:0.03),0.06);
  setP(nodes.growl.gain,(isScooter?14:10)+rpmF2*10,0.06);
  setP(nodes.bp.frequency,280+rpm*0.08+thr*300,0.06);
  setP(nodes.bp.Q,0.6+rpmF*1.4,0.06);
  setP(nodes.g1.gain,E.sawGain,0.05);setP(nodes.g1b.gain,E.sawGain*0.65,0.05);
  setP(nodes.g2.gain,E.sqGain,0.05);setP(nodes.gS.gain,E.subGain,0.05);
  setP(nodes.gS2.gain,E.subGain*0.6,0.05);
}
/* СТАРТЕР — одиночный звук (при запуске) */
function playStarter(){
  if(!ctx||muted)return;
  var E=S.engines[S.engineType];if(!E)return;
  var isScooter=S.engineType==='scooter';var isDiesel=E.diesel;
  var t=ctx.currentTime;
  var o=ctx.createOscillator();o.type='sawtooth';
  o.frequency.setValueAtTime(isScooter?120:(isDiesel?60:55),t);
  o.frequency.linearRampToValueAtTime(isScooter?320:(isDiesel?160:180),t+(isScooter?0.4:0.7));
  var g=ctx.createGain();
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(isScooter?0.10:(isDiesel?0.20:0.18),t+0.06);
  g.gain.linearRampToValueAtTime(0,t+(isScooter?0.5:0.85));
  var d=ctx.createWaveShaper();d.curve=hardCurve();
  var f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=isScooter?900:(isDiesel?400:500);
  o.connect(f).connect(d).connect(g).connect(ctx.destination);
  o.start(t);o.stop(t+(isScooter?0.55:0.9));
}
/* ===== НЕПРЕРЫВНЫЙ СТАРТЕР "ТАРАХ-ТАРАХ" ===== */
function startCrank(){
  if(!ctx||muted||crankNodes)return;
  var t=ctx.currentTime;
  var master=ctx.createGain();
  master.gain.value=0.16;
  master.connect(ctx.destination);
  /* Низкое моторное гудение стартера */
  var o1=ctx.createOscillator();o1.type='sawtooth';o1.frequency.value=48;
  var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=220;
  var g1=ctx.createGain();g1.gain.value=0.35;
  o1.connect(lp).connect(g1).connect(master);
  /* LFO — пульсация "тарах" ~7 раз/сек */
  var lfo=ctx.createOscillator();lfo.type='sine';lfo.frequency.value=7;
  var lfoG=ctx.createGain();lfoG.gain.value=0.35;
  lfo.connect(lfoG).connect(g1.gain);
  /* Щелчки воспламенения */
  var o2=ctx.createOscillator();o2.type='square';o2.frequency.value=95;
  var g2=ctx.createGain();g2.gain.value=0;
  var lfo2=ctx.createOscillator();lfo2.type='square';lfo2.frequency.value=7;
  var lfo2G=ctx.createGain();lfo2G.gain.value=0.08;
  lfo2.connect(lfo2G).connect(g2.gain);
  o2.connect(g2).connect(master);
  /* Шум стартера */
  var nBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
  var nd=nBuf.getChannelData(0);
  for(var i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1);
  var ns=ctx.createBufferSource();ns.buffer=nBuf;ns.loop=true;
  var nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=380;nf.Q.value=0.8;
  var ng=ctx.createGain();ng.gain.value=0.12;
  ns.connect(nf).connect(ng).connect(master);
  o1.start();lfo.start();o2.start();lfo2.start();ns.start();
  crankNodes={master:master,o1:o1,lfo:lfo,o2:o2,lfo2:lfo2,ns:ns,g1:g1,g2:g2};
}
function stopCrank(){
  if(!crankNodes)return;
  var t=ctx.currentTime;
  var c=crankNodes;
  c.master.gain.cancelScheduledValues(t);
  c.master.gain.setValueAtTime(c.master.gain.value,t);
  c.master.gain.linearRampToValueAtTime(0,t+0.08);
  setTimeout(function(){
    try{c.o1.stop();c.lfo.stop();c.o2.stop();c.lfo2.stop();c.ns.stop();c.master.disconnect();}catch(e){}
  },200);
  crankNodes=null;
}
function playFuelPump(){
  if(!ctx||muted)return;
  var t=ctx.currentTime;
  var o=ctx.createOscillator();o.type='sine';
  o.frequency.setValueAtTime(75,t);
  o.frequency.linearRampToValueAtTime(115,t+0.4);
  o.frequency.setValueAtTime(115,t+1.1);
  o.frequency.linearRampToValueAtTime(75,t+1.45);
  var g=ctx.createGain();
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(0.10,t+0.1);
  g.gain.setValueAtTime(0.10,t+1.3);
  g.gain.linearRampToValueAtTime(0,t+1.5);
  var f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=250;
  o.connect(f).connect(g).connect(ctx.destination);
  o.start(t);o.stop(t+1.55);
}
function resume(){if(!ctx){if(!init())return;}if(ctx.state==='suspended')ctx.resume();}
document.addEventListener('touchstart',resume,{passive:true});
document.addEventListener('mousedown',resume);
document.addEventListener('keydown',resume);
function setMuted(v){
  muted=!!v;
  if(muted&&nodes&&ctx){setP(nodes.eg.gain,0,0.05);setP(nodes.nG.gain,0,0.05);setP(nodes.nG2.gain,0,0.05);setP(nodes.cG.gain,0,0.05);setP(nodes.gTurbo.gain,0,0.05);stopCrank();}
  try{localStorage.setItem('dvs_muted',muted?'1':'0');}catch(e){}
}
function isMuted(){return muted;}
function toggleMute(){setMuted(!muted);return muted;}
window.DVS_SOUND={
  setMuted:setMuted,isMuted:isMuted,toggleMute:toggleMute,resume:resume,
  starter:playStarter,fuelPump:playFuelPump,
  startCrank:startCrank,stopCrank:stopCrank
};
function loop(){try{update();}catch(e){}requestAnimationFrame(loop);}
requestAnimationFrame(loop);
})();