(function(){
"use strict";
var ctx=null,hornNodes=null,hornOn=false;
function initCtx(){
  if(ctx)return true;
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  try{ctx=new AC();}catch(e){return false;}
  return true;
}
function startHorn(){
  if(hornOn)return;
  if(!initCtx())return;
  if(ctx.state==='suspended')ctx.resume();
  var t=ctx.currentTime;
  var master=ctx.createGain();
  master.gain.value=0;
  master.connect(ctx.destination);
  var o1=ctx.createOscillator();o1.type='sawtooth';o1.frequency.value=380;
  var o2=ctx.createOscillator();o2.type='sawtooth';o2.frequency.value=485;
  var o3=ctx.createOscillator();o3.type='triangle';o3.frequency.value=760;
  var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3500;
  var hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=280;
  var g1=ctx.createGain();g1.gain.value=0.30;
  var g2=ctx.createGain();g2.gain.value=0.22;
  var g3=ctx.createGain();g3.gain.value=0.10;
  o1.connect(g1).connect(lp);
  o2.connect(g2).connect(lp);
  o3.connect(g3).connect(lp);
  lp.connect(hp).connect(master);
  o1.start();o2.start();o3.start();
  master.gain.setValueAtTime(0,t);
  master.gain.linearRampToValueAtTime(0.55,t+0.025);
  hornNodes={master:master,o1:o1,o2:o2,o3:o3};
  hornOn=true;
  try{if(navigator.vibrate)navigator.vibrate(25);}catch(e){}
}
function stopHorn(){
  if(!hornOn||!hornNodes||!ctx)return;
  var t=ctx.currentTime;
  var h=hornNodes;
  h.master.gain.cancelScheduledValues(t);
  h.master.gain.setValueAtTime(h.master.gain.value,t);
  h.master.gain.linearRampToValueAtTime(0,t+0.07);
  setTimeout(function(){
    try{h.o1.stop();h.o2.stop();h.o3.stop();h.master.disconnect();}catch(e){}
  },200);
  hornNodes=null;
  hornOn=false;
}
function attach(){
  var btn=document.getElementById('hornBtn');
  if(!btn)return;
  btn.addEventListener('touchstart',function(e){e.preventDefault();btn.classList.add('active');startHorn();},{passive:false});
  btn.addEventListener('touchend',function(e){e.preventDefault();btn.classList.remove('active');stopHorn();},{passive:false});
  btn.addEventListener('touchcancel',function(e){btn.classList.remove('active');stopHorn();});
  btn.addEventListener('mousedown',function(e){e.preventDefault();btn.classList.add('active');startHorn();});
  btn.addEventListener('mouseup',function(){btn.classList.remove('active');stopHorn();});
  btn.addEventListener('mouseleave',function(){btn.classList.remove('active');stopHorn();});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',attach);}else{attach();}
})();