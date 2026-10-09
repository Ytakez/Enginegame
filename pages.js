(function(){
"use strict";
var pages=document.getElementById('pages');
var dots=document.querySelectorAll('#dots .dot');
if(!pages)return;

/* ==================== ИНДИКАТОР + АВТО-3D + СБРОС КНОПОК ==================== */
var lastIdx=-1;
function onScroll(){
  var idx=Math.round(pages.scrollLeft/pages.clientWidth);
  for(var i=0;i<dots.length;i++)dots[i].classList.toggle('on',i===idx);
  if(idx===lastIdx)return;
  lastIdx=idx;

  var gb=document.getElementById('ghostBtn');
  var lb=document.getElementById('lockBtn');

  /* Страница 1 = 3D */
  if(idx===1){
    if(window.DVS_3D && window.DVS_3D_REF){
      var scene=window.DVS_3D_REF.getScene();
      if(!scene){
        /* Первый раз включаем 3D */
        try{window.DVS_3D.toggle();}catch(e){console.warn('3D toggle:',e);}
      }else{
        /* Уже включено — просто пересчитываем размеры */
        if(window.DVS_3D.resize)window.DVS_3D.resize();
      }
      if(gb)gb.style.display='inline-block';
      if(lb)lb.style.display='flex';
    }
  } else {
    /* Ушли с 3D-страницы — прячем кнопки и снимаем замок */
    if(gb)gb.style.display='none';
    if(lb)lb.style.display='none';
    var wrap=document.getElementById('engineWrap');
    if(wrap && wrap.classList.contains('locked')){
      wrap.classList.remove('locked');
      if(lb){
        lb.textContent='🔓';
        lb.classList.remove('on');
      }
    }
  }
}
pages.addEventListener('scroll',onScroll,{passive:true});

/* Первая проверка после загрузки */
setTimeout(onScroll,700);

/* ==================== УТИЛИТЫ CANVAS ==================== */
function setupCanvas(cv){
  var dpr=window.devicePixelRatio||1;
  var rect=cv.getBoundingClientRect();
  if(!rect.width||!rect.height){
    var p=cv.parentNode.getBoundingClientRect();
    rect={width:Math.max(200,p.width-20),height:Math.max(150,p.height-40)};
  }
  cv.width=Math.max(1,Math.floor(rect.width*dpr));
  cv.height=Math.max(1,Math.floor(rect.height*dpr));
  cv.style.width=rect.width+'px';
  cv.style.height=rect.height+'px';
  var ctx=cv.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return {ctx:ctx,w:rect.width,h:rect.height,cv:cv};
}
function fitCanvas(cv,store){
  if(!store || store.cv!==cv || Math.abs(store.w-cv.clientWidth)>2 || Math.abs(store.h-cv.clientHeight)>2){
    return setupCanvas(cv);
  }
  return store;
}

/* ==================== СТРАНИЦА 2: MANIFOLD PRESSURE ==================== */
var manifoldStore=null;
function drawManifold(){
  var cv=document.getElementById('manifoldCv');if(!cv)return;
  manifoldStore=fitCanvas(cv,manifoldStore);
  var ctx=manifoldStore.ctx, W=manifoldStore.w, H=manifoldStore.h;
  ctx.clearRect(0,0,W,H);

  var S=window.S||{};
  var E=(S.engines&&S.engines[S.engineType])||{};
  var thr=typeof S.throttle==='number'?S.throttle:0;
  var isTurbo=!!(E.diesel);
  var vacuum=-30+thr*30;
  var boost=isTurbo&&thr>0.4 ? (thr-0.4)*2.5*12 : 0;
  var pressure=vacuum+boost;
  var pMin=-30, pMax=15;

  var cx=W/2, cyy=H*0.62, R=Math.min(W*0.38,H*0.52);

  ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,.15)';
  ctx.beginPath();ctx.arc(cx,cyy,R,-Math.PI*0.9,-Math.PI*0.1);ctx.stroke();

  for(var i=0;i<=8;i++){
    var t=i/8;
    var a=-Math.PI*0.9+t*(Math.PI*0.8);
    var x1=cx+Math.cos(a)*R, y1=cyy+Math.sin(a)*R;
    var x2=cx+Math.cos(a)*(R-10), y2=cyy+Math.sin(a)*(R-10);
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    var val=Math.round(pMin+t*(pMax-pMin));
    var lx=cx+Math.cos(a)*(R-24), ly=cyy+Math.sin(a)*(R-24);
    ctx.fillStyle='rgba(255,255,255,.55)';
    ctx.font='500 10px -apple-system,Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(val,lx,ly);
  }

  /* Красная зона буста */
  ctx.strokeStyle='rgba(220,80,80,.6)';ctx.lineWidth=4;
  ctx.beginPath();
  ctx.arc(cx,cyy,R,-Math.PI*0.9+(7/8)*(Math.PI*0.8),-Math.PI*0.1);ctx.stroke();

  var norm=(pressure-pMin)/(pMax-pMin);
  if(norm<0)norm=0; if(norm>1)norm=1;
  var a2=-Math.PI*0.9+norm*(Math.PI*0.8);
  ctx.strokeStyle='#f0f0f0';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(cx,cyy);
  ctx.lineTo(cx+Math.cos(a2)*(R-14),cyy+Math.sin(a2)*(R-14));ctx.stroke();

  ctx.fillStyle='#f0f0f0';
  ctx.beginPath();ctx.arc(cx,cyy,7,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#ffffff';ctx.font='700 26px -apple-system,Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(Math.round(pressure),cx,cyy+50);
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='500 11px -apple-system,Inter,sans-serif';
  ctx.fillText('inHg',cx,cyy+72);
}

/* ==================== СТРАНИЦА 3: CYLINDERS ==================== */
var cylsStore=null;
function drawCyls(){
  var cv=document.getElementById('cylsCv');if(!cv)return;
  cylsStore=fitCanvas(cv,cylsStore);
  var ctx=cylsStore.ctx, W=cylsStore.w, H=cylsStore.h;
  ctx.clearRect(0,0,W,H);

  var S=window.S||{};
  var E=(S.engines&&S.engines[S.engineType])||{};
  var n=Math.max(1,Math.min(22,E.cyls||4));
  var N=Math.min(n,8);
  var rpm=typeof S.rpm==='number'?S.rpm:0;
  var angle=(S.crankAngle||0);

  var padW=30;
  var usableW=W-padW*2;
  var blockW=Math.min(72, usableW/N-12);
  var totalW=blockW*N+(N-1)*12;
  var startX=(W-totalW)/2;
  var blockH=H*0.5;
  var blockY=(H-blockH)/2;

  for(var i=0;i<N;i++){
    var x=startX+i*(blockW+12);
    ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=2;
    ctx.strokeRect(x,blockY,blockW,blockH);

    var phase=(angle+i*(Math.PI*4/N));
    var pY=blockY+blockH*0.5+Math.sin(phase)*blockH*0.28;
    ctx.fillStyle='rgba(240,240,240,.85)';
    ctx.fillRect(x+6,pY-6,blockW-12,12);

    var cycle=((phase%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
    if(cycle<Math.PI*0.4){
      var inten=1-cycle/(Math.PI*0.4);
      ctx.fillStyle='rgba(255,200,60,'+(inten*0.5)+')';
      ctx.fillRect(x+2,blockY+2,blockW-4,blockH-4);
    }

    ctx.fillStyle='rgba(255,255,255,.5)';
    ctx.fillRect(x+blockW/2-3,blockY-14,6,12);

    ctx.fillStyle='rgba(255,255,255,.7)';
    ctx.font='600 11px -apple-system,Inter,sans-serif';
    ctx.textAlign='center';
    ctx.fillText('#'+(i+1),x+blockW/2,blockY+blockH+18);
  }

  ctx.fillStyle='#ffffff';ctx.font='700 18px -apple-system,Inter,sans-serif';
  ctx.textAlign='center';
  ctx.fillText(Math.round(rpm)+' rpm',W/2,22);
}

/* ==================== СТРАНИЦА 4: TORQUE / POWER ==================== */
var torqueStore=null;
function drawTorque(){
  var cv=document.getElementById('torqueCv');if(!cv)return;
  torqueStore=fitCanvas(cv,torqueStore);
  var ctx=torqueStore.ctx, W=torqueStore.w, H=torqueStore.h;
  ctx.clearRect(0,0,W,H);

  var S=window.S||{};
  var E=(S.engines&&S.engines[S.engineType])||{};
  var maxT=E.maxTorque||250;
  var idle=E.idle||900;
  var redline=E.redline||7000;

  var padL=36,padR=16,padT=28,padB=24;
  var gW=W-padL-padR, gH=H-padT-padB;

  /* Сетка */
  ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;
  for(var i=0;i<=4;i++){
    var y=padT+(i/4)*gH;
    ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(padL+gW,y);ctx.stroke();
    var x=padL+(i/4)*gW;
    ctx.beginPath();ctx.moveTo(x,padT);ctx.lineTo(x,padT+gH);ctx.stroke();
  }

  var lo=idle*0.8, hi=redline-(redline-idle)*0.15;
  var points=[];
  for(var p=0;p<=50;p++){
    var t=p/50;
    var rpm=idle+t*(redline-idle);
    var xx=Math.max(lo,Math.min(hi,rpm));
    var curve=0.55+0.45*Math.sin(Math.PI*(xx-lo)/(hi-lo));
    var torque=curve*maxT;
    points.push({x:padL+t*gW, y:padT+gH-(torque/(maxT*1.15))*gH, rpm:rpm, torque:torque});
  }

  /* Torque — жёлтая */
  ctx.strokeStyle='#f0c030';ctx.lineWidth=2.5;
  ctx.beginPath();
  for(var a=0;a<points.length;a++){
    if(a===0)ctx.moveTo(points[a].x,points[a].y);
    else ctx.lineTo(points[a].x,points[a].y);
  }
  ctx.stroke();

  /* Power — красная */
  var maxPower=(maxT*(redline-1000)*0.7*Math.PI/30/1000);
  ctx.strokeStyle='#e04040';
  ctx.beginPath();
  for(var b=0;b<points.length;b++){
    var pw=points[b].torque*(points[b].rpm*Math.PI/30)/1000;
    var yy=padT+gH-(pw/(maxPower*1.15))*gH;
    if(b===0)ctx.moveTo(points[b].x,yy);
    else ctx.lineTo(points[b].x,yy);
  }
  ctx.stroke();

  /* Текущая точка */
  var curRpm=S.rpm||0;
  var x2=Math.max(lo,Math.min(hi,curRpm));
  var cur=0.55+0.45*Math.sin(Math.PI*(x2-lo)/(hi-lo));
  var curTorque=cur*maxT;
  var cx=padL+((curRpm-idle)/(redline-idle))*gW;
  var cyy=padT+gH-(curTorque/(maxT*1.15))*gH;
  if(cx>=padL && cx<=padL+gW){
    ctx.fillStyle='#f0f0f0';
    ctx.beginPath();ctx.arc(cx,cyy,4,0,Math.PI*2);ctx.fill();
  }

  /* Легенда */
  ctx.font='500 10px -apple-system,Inter,sans-serif';ctx.textAlign='left';
  ctx.fillStyle='#f0c030';ctx.fillRect(W-110,10,12,3);
  ctx.fillStyle='#d0d0d0';ctx.fillText('Torque',W-94,14);
  ctx.fillStyle='#e04040';ctx.fillRect(W-56,10,12,3);
  ctx.fillStyle='#d0d0d0';ctx.fillText('Power',W-40,14);

  ctx.fillStyle='rgba(255,255,255,.5)';
  ctx.font='500 9px -apple-system,Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('RPM',W/2,H-8);
}

/* ==================== СТРАНИЦА 5: FLOW ==================== */
var flowStore=null;
function drawFlow(){
  var cv=document.getElementById('flowCv');if(!cv)return;
  flowStore=fitCanvas(cv,flowStore);
  var ctx=flowStore.ctx, W=flowStore.w, H=flowStore.h;
  ctx.clearRect(0,0,W,H);

  var S=window.S||{};
  var E=(S.engines&&S.engines[S.engineType])||{};
  var rpm=S.rpm||0;
  var redline=E.redline||7000;
  var load=Math.min(1,rpm/redline);

  var padL=36,padR=16,padT=28,padB=24;
  var gW=W-padL-padR, gH=H-padT-padB;

  ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;
  for(var i=0;i<=4;i++){
    var y=padT+(i/4)*gH;
    ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(padL+gW,y);ctx.stroke();
  }

  /* Нулевая линия */
  ctx.strokeStyle='rgba(255,255,255,.15)';
  ctx.beginPath();ctx.moveTo(padL,padT+gH/2);ctx.lineTo(padL+gW,padT+gH/2);ctx.stroke();

  /* Exhaust — оранжевая */
  ctx.strokeStyle='#e0a030';ctx.lineWidth=2.5;
  ctx.beginPath();
  for(var p=0;p<=60;p++){
    var t=p/60;
    var cycle=t*Math.PI*4;
    var ex=Math.max(0,Math.sin(cycle-3*Math.PI))*0.8;
    var xx=padL+t*gW;
    var yy=padT+gH/2-ex*load*gH*0.4;
    if(p===0)ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy);
  }
  ctx.stroke();

  /* Intake — голубая */
  ctx.strokeStyle='#4090ff';ctx.lineWidth=2.5;
  ctx.beginPath();
  for(var q=0;q<=60;q++){
    var t2=q/60;
    var cycle2=t2*Math.PI*4;
    var inn=Math.max(0,Math.sin(cycle2))*0.7;
    var xx2=padL+t2*gW;
    var yy2=padT+gH/2-inn*load*gH*0.4;
    if(q===0)ctx.moveTo(xx2,yy2); else ctx.lineTo(xx2,yy2);
  }
  ctx.stroke();

  /* Легенда */
  ctx.font='500 10px -apple-system,Inter,sans-serif';ctx.textAlign='left';
  ctx.fillStyle='#e0a030';ctx.fillRect(W-130,10,12,3);
  ctx.fillStyle='#d0d0d0';ctx.fillText('Exhaust',W-114,14);
  ctx.fillStyle='#4090ff';ctx.fillRect(W-68,10,12,3);
  ctx.fillStyle='#d0d0d0';ctx.fillText('Intake',W-52,14);

  ctx.fillStyle='rgba(255,255,255,.5)';
  ctx.font='500 9px -apple-system,Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Cycle',W/2,H-8);
}

/* ==================== ЦИКЛ ОТРИСОВКИ ==================== */
function loop(){
  var idx=Math.round(pages.scrollLeft/pages.clientWidth);
  if(idx===2)drawManifold();
  else if(idx===3)drawCyls();
  else if(idx===4)drawTorque();
  else if(idx===5)drawFlow();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* Сброс store при смене страницы, чтобы канвас пересчитался */
pages.addEventListener('scroll',function(){
  manifoldStore=null;cylsStore=null;torqueStore=null;flowStore=null;
},{passive:true});

/* Сброс при повороте экрана */
window.addEventListener('resize',function(){
  manifoldStore=null;cylsStore=null;torqueStore=null;flowStore=null;
});

})();