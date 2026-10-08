(function(){
"use strict";
var S=window.S;
if(!S)return;
var ctx=null,nodes=null,muted=false;
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
  var pumpBuf=ctx.createBuffer(1,2*ctx.sampleRate,ctx.sampleRate);
  var pd=pumpBuf.getChannelData(0);
  for(var i3=0;i3<pd.length;i3++)pd[i3]=(Math.random()*2-1)*0.5;
  var pumpNoise=ctx.createBufferSource();pumpNoise.buffer=pumpBuf;pumpNoise.loop=true;
  var pnf=ctx.createBiquadFilter();pnf.type='lowpass';pnf.frequency.value=380;pnf.Q.value=2;
  var pnG=ctx.createGain();pnG.gain.value=0;pumpNoise.connect(pnf).connect(pnG).connect(master);pumpNoise.start();
  nodes={master:master,lp:lp,eg:eg,o1:o1,o1b:o1b,o2:o2,oS:oS,oS2:oS2,nG:nG,nG2:nG2,nf:nf,nf2:nf2,growl:growl,hs:hs,bp:bp,g1:g1,g1b:g1b,g2:g2,gS:gS,gS2:gS2,oTurbo:oTurbo,gTurbo:gTurbo,cG:cG,cf:cf,pnG:pnG,pnf:pnf};
  return true;
}
function update(){
  if(!nodes||muted)return;
  var E=S.engines[S.engineType]||S.engines.r4;
  var rpm=S.rpm,thr=S.throttle;
  var run=S.running&&!S.stalled&&!S.broken;
  var t=ctx.currentTime;
  var sm=0.02;
  var isScooter=S.engineType==='scooter';
  var isDiesel=E.diesel===true;
  var isJDM=(S.engineType==='passatb3'||S.engineType==='bluebird'||S.engineType==='galant6');
  if(!run||rpm<20){
    nodes.eg.gain.setTargetAtTime(0,t,0.1);
    nodes.nG.gain.setTargetAtTime(0,t,0.1);
    nodes.nG2.gain.setTargetAtTime(0,t,0.1);
    nodes.cG.gain.setTargetAtTime(0,t,0.1);
    nodes.gTurbo.gain.setTargetAtTime(0,t,0.15);
    return;
  }
  var fireHz=rpm/E.fireDiv;
  var rr=Math.max(1,E.redline-E.idle);
  var rpmF=Math.min(1,Math.max(0,(rpm-E.idle)/rr));
  var rpmF2=rpmF*rpmF;
  if(isDiesel){
    nodes.o1.frequency.setTargetAtTime(fireHz*1.5,t,sm);
    nodes.o1b.frequency.setTargetAtTime(fireHz*1.5*1.008,t,sm);
    nodes.o2.frequency.setTargetAtTime(fireHz*2,t,sm);
    nodes.oS.frequency.setTargetAtTime(fireHz*0.5,t,sm);
    nodes.oS2.frequency.setTargetAtTime(fireHz*0.25,t,sm);
    var bD=0.16+thr*0.22;
    var lD=bD*(0.8+rpmF*0.5);
    if(rpm>E.redline*0.9)lD*=1.05;
    if(rpm>E.redline)lD*=0.85;
    nodes.eg.gain.setTargetAtTime(lD,t,0.05);
    var cl=0.10+rpmF*0.14+thr*0.10;
    nodes.cG.gain.setTargetAtTime(cl,t,0.04);
    nodes.cf.frequency.setTargetAtTime(2200+rpm*0.5+thr*800,t,0.05);
    nodes.cf.Q.setTargetAtTime(2.8+rpmF*1.5,t,0.05);
    nodes.nG.gain.setTargetAtTime(0.05+thr*0.06,t,0.05);
    nodes.nf.frequency.setTargetAtTime(1400+rpm*0.7,t,0.05);
    nodes.nG2.gain.setTargetAtTime(0.03+rpmF*0.05,t,0.05);
    nodes.nf2.frequency.setTargetAtTime(3200+rpm*0.8,t,0.05);
    var tF=2800+rpmF*5200;
    nodes.oTurbo.frequency.setTargetAtTime(tF,t,0.15);
    var tOn=Math.max(0,rpmF-0.15);
    nodes.gTurbo.gain.setTargetAtTime(tOn*tOn*0.055*(0.4+thr*0.6),t,0.12);
    var lpF=350+rpm*0.12+thr*400+rpmF2*500;
    if(lpF>2800)lpF=2800;
    nodes.lp.frequency.setTargetAtTime(lpF,t,0.05);
    nodes.lp.Q.setTargetAtTime(2.8+rpmF2*3,t,0.05);
    nodes.growl.frequency.setTargetAtTime(110+rpm*0.05,t,0.06);
    nodes.growl.gain.setTargetAtTime(16+rpmF2*12,t,0.06);
    nodes.bp.frequency.setTargetAtTime(240+rpm*0.06+thr*200,t,0.06);
    nodes.bp.Q.setTargetAtTime(1.0+rpmF*1.5,t,0.06);
    nodes.g1.gain.setTargetAtTime(0.35,t,0.05);
    nodes.g1b.gain.setTargetAtTime(0.22,t,0.05);
    nodes.g2.gain.setTargetAtTime(0.08,t,0.05);
    nodes.gS.gain.setTargetAtTime(1.8,t,0.05);
    nodes.gS2.gain.setTargetAtTime(1.1,t,0.05);
    if(E.tractor){
      nodes.oTurbo.frequency.setTargetAtTime(0,t,0.01);
      nodes.gTurbo.gain.setTargetAtTime(0,t,0.01);
      nodes.cG.gain.setTargetAtTime(0.22+rpmF*0.18+thr*0.15,t,0.03);
      nodes.cf.frequency.setTargetAtTime(1600+rpm*0.4+thr*500,t,0.04);
      nodes.gS.gain.setTargetAtTime(2.4,t,0.04);
      nodes.gS2.gain.setTargetAtTime(1.6,t,0.04);
      var lpTr=280+rpm*0.08+thr*300;
      if(lpTr>2000)lpTr=2000;
      nodes.lp.frequency.setTargetAtTime(lpTr,t,0.04);
      nodes.lp.Q.setTargetAtTime(3.5+rpmF*2.5,t,0.04);
      nodes.growl.frequency.setTargetAtTime(80+rpm*0.03,t,0.05);
      nodes.growl.gain.setTargetAtTime(20+rpmF*14,t,0.05);
    }
    return;
  }
  if(isJDM){
    var isV6=S.engineType==='galant6';
    nodes.o1.frequency.setTargetAtTime(fireHz*(isV6?2.5:2),t,sm);
    nodes.o1b.frequency.setTargetAtTime(fireHz*(isV6?2.5:2)*1.006,t,sm);
    nodes.o2.frequency.setTargetAtTime(fireHz*(isV6?3.5:3),t,sm);
    nodes.oS.frequency.setTargetAtTime(fireHz*0.5,t,sm);
    nodes.oS2.frequency.setTargetAtTime(fireHz*0.25,t,sm);
    var bJ=0.09+thr*0.26;
    var lJ=bJ*(0.5+rpmF*0.95);
    if(rpm>E.redline*0.9)lJ*=1.12;
    if(rpm>E.redline)lJ*=0.75;
    nodes.eg.gain.setTargetAtTime(lJ,t,0.04);
    nodes.nG.gain.setTargetAtTime(0.02+thr*0.06+rpmF*0.02,t,0.05);
    nodes.nf.frequency.setTargetAtTime(1400+rpm*1.2,t,0.05);
    nodes.nG2.gain.setTargetAtTime(Math.max(0,rpmF-0.6)*0.08,t,0.05);
    nodes.nf2.frequency.setTargetAtTime(3500+rpm*1.5,t,0.05);
    var lpJ=(isV6?550:750)+rpm*0.18+thr*900;
    if(lpJ>4500)lpJ=4500;
    nodes.lp.frequency.setTargetAtTime(lpJ,t,0.05);
    nodes.lp.Q.setTargetAtTime(1.2+rpmF2*2.5,t,0.05);
    nodes.growl.frequency.setTargetAtTime((isV6?120:150)+rpm*0.04,t,0.06);
    nodes.growl.gain.setTargetAtTime((isV6?14:10)+rpmF2*12,t,0.06);
    nodes.bp.frequency.setTargetAtTime(280+rpm*0.06+thr*250,t,0.06);
    nodes.bp.Q.setTargetAtTime(0.7+rpmF*1.3,t,0.06);
    nodes.g1.gain.setTargetAtTime(E.sawGain,t,0.05);
    nodes.g1b.gain.setTargetAtTime(E.sawGain*0.6,t,0.05);
    nodes.g2.gain.setTargetAtTime(E.sqGain,t,0.05);
    nodes.gS.gain.setTargetAtTime(E.subGain,t,0.05);
    nodes.gS2.gain.setTargetAtTime(E.subGain*0.6,t,0.05);
    nodes.gTurbo.gain.setTargetAtTime(0,t,0.1);
    nodes.cG.gain.setTargetAtTime(0,t,0.1);
    return;
  }
  nodes.gTurbo.gain.setTargetAtTime(0,t,0.15);
  nodes.cG.gain.setTargetAtTime(0,t,0.1);
  nodes.o1.frequency.setTargetAtTime(fireHz*2,t,sm);
  nodes.o1b.frequency.setTargetAtTime(fireHz*2*1.005,t,sm);
  nodes.o2.frequency.setTargetAtTime(fireHz*3,t,sm);
  nodes.oS.frequency.setTargetAtTime(fireHz*0.5,t,sm);
  nodes.oS2.frequency.setTargetAtTime(fireHz*0.25,t,sm);
  var b2=isScooter?(0.09+thr*0.20):(0.10+thr*0.28);
  var l2=b2*(isScooter?(0.85+rpmF*1.05):(0.5+rpmF*0.9));
  if(rpm>E.redline*0.9)l2*=1.15;
  if(rpm>E.redline)l2*=0.7;
  if(isScooter)l2*=0.45;
  nodes.eg.gain.setTargetAtTime(l2,t,0.04);
  var nB=(isScooter?(0.04+thr*0.07):(0.03+thr*0.07))+rpmF*E.noiseBase*1.2;
  nodes.nG.gain.setTargetAtTime(nB,t,0.05);
  nodes.nf.frequency.setTargetAtTime((isScooter?1800:1200)+rpm*1.0+thr*1500,t,0.05);
  var nB2=Math.max(0,(rpmF-0.5))*(isScooter?0.12:0.15)+thr*rpmF2*(isScooter?0.08:0.12);
  nodes.nG2.gain.setTargetAtTime(nB2,t,0.05);
  nodes.nf2.frequency.setTargetAtTime(3500+rpm*1.5,t,0.05);
  var lp2;
  if(isScooter){lp2=E.lpBase-rpm*0.4+thr*700+rpmF2*900;if(lp2<400)lp2=400;if(lp2>3200)lp2=3200;}
  else{lp2=E.lpBase+rpm*E.lpRpm+thr*900+rpmF2*1500;if(lp2>4500)lp2=4500;}
  nodes.lp.frequency.setTargetAtTime(lp2,t,0.05);
  nodes.lp.Q.setTargetAtTime((isScooter?2.0:1.2)+rpmF2*2.5,t,0.05);
  nodes.growl.frequency.setTargetAtTime((isScooter?200:140)+rpm*(isScooter?0.15:0.03),t,0.06);
  nodes.growl.gain.setTargetAtTime((isScooter?14:10)+rpmF2*10,t,0.06);
  nodes.bp.frequency.setTargetAtTime(280+rpm*0.08+thr*300,t,0.06);
  nodes.bp.Q.setTargetAtTime(0.6+rpmF*1.4,t,0.06);
  nodes.g1.gain.setTargetAtTime(E.sawGain,t,0.05);
  nodes.g1b.gain.setTargetAtTime(E.sawGain*0.65,t,0.05);
  nodes.g2.gain.setTargetAtTime(E.sqGain,t,0.05);
  nodes.gS.gain.setTargetAtTime(E.subGain,t,0.05);
  nodes.gS2.gain.setTargetAtTime(E.subGain*0.6,t,0.05);
}
function starter(){
  if(!ctx||muted)return;
  var E=S.engines[S.engineType];
  var isScooter=S.engineType==='scooter';
  var isDiesel=E&&E.diesel;
  var t=ctx.currentTime;
  var o=ctx.createOscillator();o.type='sawtooth';
  o.frequency.setValueAtTime(isScooter?120:(isDiesel?60:55),t);
  o.frequency.linearRampToValueAtTime(isScooter?320:(isDiesel?160:180),t+(isScooter?0.4:0.7));
  var g=ctx.createGain();
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(isScooter?0.10:(isDiesel?0.20:0.18),t+0.06);
  g.gain.linearRampToValueAtTime(0,t+(isScooter?0.5:0.85));
  var d=ctx.createWaveShaper();d.curve=hardCurve();
  var f=ctx.createBiquadFilter();f.type='lowpass';
  f.frequency.value=isScooter?900:(isDiesel?400:500);
  o.connect(f).connect(d).connect(g).connect(ctx.destination);
  o.start(t);o.stop(t+(isScooter?0.55:0.9));
}
function fuelPumpSound(){
  if(!ctx||muted)return;
  var t=ctx.currentTime;
  var o=ctx.createOscillator();o.type='sine';
  o.frequency.setValueAtTime(75,t);
  o.frequency.linearRampToValueAtTime(115,t+0.4);
  o.frequency.setValueAtTime(115,t+1.1);
  o.frequency.linearRampToValueAtTime(75,t+1.45);
  var g=ctx.createGain();
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(0.09,t+0.1);
  g.gain.setValueAtTime(0.09,t+1.3);
  g.gain.linearRampToValueAtTime(0,t+1.5);
  var f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=250;
  o.connect(f).connect(g).connect(ctx.destination);
  o.start(t);o.stop(t+1.55);
  if(nodes&&nodes.pnG){
    nodes.pnG.gain.cancelScheduledValues(t);
    nodes.pnG.gain.setValueAtTime(0,t);
    nodes.pnG.gain.linearRampToValueAtTime(0.05,t+0.1);
    nodes.pnG.gain.setValueAtTime(0.05,t+1.3);
    nodes.pnG.gain.linearRampToValueAtTime(0,t+1.5);
  }
}
function resume(){
  if(!ctx){if(!init())return;}
  if(ctx.state==='suspended')ctx.resume();
}
document.addEventListener('touchstart',resume,{passive:true});
document.addEventListener('mousedown',resume);
document.addEventListener('keydown',resume);
var ignBtn=document.getElementById('ignBtn');
if(ignBtn)ignBtn.addEventListener('click',function(){
  resume();
  setTimeout(function(){
    if(S.running||S.stalled&&S.rpm>0)starter();
    else if(!S.running&&!S.fuelPrimed&&S.ignitionOn)fuelPumpSound();
  },50);
});
function setMuted(v){
  muted=!!v;
  if(muted&&nodes&&ctx){
    var t=ctx.currentTime;
    nodes.eg.gain.setTargetAtTime(0,t,0.05);
    nodes.nG.gain.setTargetAtTime(0,t,0.05);
    nodes.nG2.gain.setTargetAtTime(0,t,0.05);
    nodes.cG.gain.setTargetAtTime(0,t,0.05);
    nodes.gTurbo.gain.setTargetAtTime(0,t,0.05);
    if(nodes.pnG)nodes.pnG.gain.setTargetAtTime(0,t,0.05);
  }
  try{localStorage.setItem('dvs_muted',muted?'1':'0');}catch(e){}
}
function isMuted(){return muted;}
function toggleMute(){setMuted(!muted);return muted;}
window.DVS_SOUND={setMuted:setMuted,isMuted:isMuted,toggleMute:toggleMute,resume:resume};
function loop(){update();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
})();