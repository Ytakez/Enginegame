(function(){
"use strict";
var RE=window.RE={};

function frame(c,x,y,w,h,grad,br){
  c.fillStyle=grad;c.fillRect(x,y,w,h);
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.strokeRect(x,y,w,h);
}

function drawInline(c,S,n,r,sp,label,col){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var coverY=12,coverH=28;
  var headY=coverY+coverH+3,headH=30;
  var blockY=headY+headH+3;
  var crankCY=H*0.78;
  var crankR=r*0.9;
  var blockB=crankCY-crankR-8;
  var panY=blockB+3,panB=H-8;
  var xs=[];
  var totalW=(n-1)*sp;
  var startX=W/2-totalW/2;
  for(var i=0;i<n;i++)xs.push(startX+i*sp);
  var L=xs[0]-r-12,R=xs[n-1]+r+12;

  // поддон
  var pg=c.createLinearGradient(0,panY,0,panB);
  if(br){pg.addColorStop(0,'#2a1818');pg.addColorStop(1,'#130808');}
  else{pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#0d1319');}
  c.fillStyle=pg;
  c.beginPath();
  c.moveTo(L+8,panY);c.lineTo(R-8,panY);
  c.lineTo(R-18,panB);c.lineTo(L+18,panB);
  c.closePath();c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.stroke();

  // блок (тёмный, внутри будут видны цилиндры)
  c.fillStyle=br?'#0d0808':'#0a0f15';
  c.fillRect(L,blockY,R-L,blockB-blockY);
  c.strokeStyle=br?'#5a3030':'#3a4a5c';c.lineWidth=3;
  c.strokeRect(L,blockY,R-L,blockB-blockY);
  // рёбра блока
  c.strokeStyle=br?'rgba(90,40,40,.4)':'rgba(50,70,90,.3)';c.lineWidth=1;
  for(var ri=1;ri<7;ri++){
    var ry=blockY+ri*(blockB-blockY)/7;
    c.beginPath();c.moveTo(L+3,ry);c.lineTo(R-3,ry);c.stroke();
  }

  // головка (плотная, на блоке)
  var hg=c.createLinearGradient(0,headY,0,headY+headH);
  if(br){hg.addColorStop(0,'#4a3030');hg.addColorStop(1,'#2a1818');}
  else{hg.addColorStop(0,'#3a4858');hg.addColorStop(1,'#1e2630');}
  frame(c,L,headY,R-L,headH,hg,br);

  // клапанная крышка (сверху)
  var cg=c.createLinearGradient(0,coverY,0,coverY+coverH);
  if(br){cg.addColorStop(0,'#3a2424');cg.addColorStop(1,'#1a1010');}
  else{cg.addColorStop(0,'#222c38');cg.addColorStop(1,'#121821');}
  frame(c,L,coverY,R-L,coverH,cg,br);
  // болты крышки
  c.fillStyle=br?'#7a5a5a':'#8a95a3';
  for(var bi=0;bi<=n;bi++){
    var bx=L+(bi/n)*(R-L);
    c.beginPath();c.arc(bx,coverY+coverH/2,3,0,7);c.fill();
  }

  // коленвал (снизу)
  c.strokeStyle=br?'#5a3a3a':'#a8b4c0';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(L-8,crankCY);c.lineTo(R+8,crankCY);c.stroke();
  c.strokeStyle='#0a1018';c.lineWidth=2;
  c.beginPath();c.moveTo(L-8,crankCY);c.lineTo(R+8,crankCY);c.stroke();

  // противовесы и шейки
  for(var i=0;i<n;i++){
    var cx=xs[i];
    var ph=S.crankAngle+i*Math.PI;
    var cwY=crankCY-Math.cos(ph)*crankR;
    var pinY=crankCY+Math.cos(ph)*crankR;
    // противовес
    c.fillStyle=br?'#5a3a3a':'#4a535e';
    c.beginPath();c.arc(cx,cwY,r*0.55,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();
    // шейка
    c.fillStyle=br?'#7a5a5a':'#d8e4f0';
    c.beginPath();c.arc(cx,pinY,5,0,7);c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=1.5;c.stroke();
  }

  // маховик справа
  var fwX=R+22,fwR=r*0.9;
  var fg=c.createRadialGradient(fwX-fwR*.3,crankCY-fwR*.3,2,fwX,crankCY,fwR);
  if(br){fg.addColorStop(0,'#6a4a4a');fg.addColorStop(1,'#2a1818');}
  else{fg.addColorStop(0,'#a8b4c0');fg.addColorStop(.5,'#6a7580');fg.addColorStop(1,'#2a3340');}
  c.fillStyle=fg;c.beginPath();c.arc(fwX,crankCY,fwR,0,7);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=2;c.stroke();
  for(var t=0;t<20;t++){
    var ta=(t/20)*Math.PI*2;
    c.strokeStyle=br?'#4a3030':'#6a7685';c.lineWidth=3;
    c.beginPath();
    c.moveTo(fwX+Math.cos(ta)*(fwR-2),crankCY+Math.sin(ta)*(fwR-2));
    c.lineTo(fwX+Math.cos(ta)*(fwR+2),crankCY+Math.sin(ta)*(fwR+2));
    c.stroke();
  }
  c.save();c.translate(fwX,crankCY);c.rotate(S.crankAngle);
  c.strokeStyle='#0a1018';c.lineWidth=3;
  for(var s=0;s<4;s++){c.save();c.rotate(s*Math.PI/2);c.beginPath();c.moveTo(0,0);c.lineTo(0,fwR*0.7);c.stroke();c.restore();}
  c.fillStyle='#1a232e';c.beginPath();c.arc(0,0,fwR*0.22,0,7);c.fill();
  c.restore();

  // цилиндры + поршни + шатуны
  var cylTop=blockY+6,cylBot=blockB-6,cylH=cylBot-cylTop;
  var pistonH=r*0.65;
  var travel=cylH-pistonH-12;
  for(var i=0;i<n;i++){
    var cx=xs[i];
    var ph=S.crankAngle+i*Math.PI;

    // ствол цилиндра
    c.fillStyle=br?'#1a0e0e':'#050810';
    c.fillRect(cx-r,cylTop,r*2,cylH);
    c.strokeStyle=br?'#3a2828':'#3a4a5c';c.lineWidth=1.5;
    c.strokeRect(cx-r,cylTop,r*2,cylH);
    // блеск стенок
    c.fillStyle='rgba(150,200,255,.06)';
    c.fillRect(cx-r+1,cylTop+1,r*0.6,cylH-2);

    // поршень
    var pistonY=cylTop+6+((Math.cos(ph)+1)/2)*travel;
    var pg2=c.createLinearGradient(cx-r,0,cx+r,0);
    if(br){pg2.addColorStop(0,'#4a3838');pg2.addColorStop(.3,'#8a6a6a');pg2.addColorStop(1,'#3a2828');}
    else{pg2.addColorStop(0,'#4a5566');pg2.addColorStop(.25,'#d8e0e8');pg2.addColorStop(.6,'#8b98a7');pg2.addColorStop(1,'#2a333f');}
    c.fillStyle=pg2;
    c.fillRect(cx-r+3,pistonY,r*2-6,pistonH);
    c.strokeStyle='#0a1018';c.lineWidth=1.5;
    c.strokeRect(cx-r+3,pistonY,r*2-6,pistonH);
    // кольца поршня
    c.strokeStyle=br?'#8a6a6a':'#2a333f';c.lineWidth=1.5;
    for(var k=0;k<3;k++){
      c.beginPath();
      c.moveTo(cx-r+5,pistonY+4+k*4);
      c.lineTo(cx+r-5,pistonY+4+k*4);
      c.stroke();
    }
    // палец
    c.fillStyle='#0a1018';
    c.beginPath();c.arc(cx,pistonY+pistonH-4,3,0,7);c.fill();

    // шатун: от пальца поршня до шейки коленвала
    var pinY2=crankCY+Math.cos(ph)*crankR;
    c.strokeStyle='#0a1018';c.lineWidth=6;
    c.beginPath();c.moveTo(cx,pistonY+pistonH-4);c.lineTo(cx,pinY2);c.stroke();
    c.strokeStyle=br?'#7a5a5a':'#8894a2';c.lineWidth=3;
    c.beginPath();c.moveTo(cx,pistonY+pistonH-4);c.lineTo(cx,pinY2);c.stroke();

    // свеча на головке
    c.fillStyle=br?'#5a3030':'#e8e4dc';
    c.fillRect(cx-2,headY+4,4,headH-8);

    // клапаны на головке
    var inO=0,exO=0;
    if(S.running&&!S.stalled){
      var cp=((ph%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
      if(cp<Math.PI)inO=Math.sin(cp);
      if(cp>3*Math.PI)exO=Math.sin(cp-3*Math.PI);
    }
    var inX=cx-r*0.45,exX=cx+r*0.45;
    c.strokeStyle=br?'#8a5a5a':'#6fd0ff';c.lineWidth=3;
    c.beginPath();c.moveTo(inX,headY+6);c.lineTo(inX,headY+headH-2+inO*3);c.stroke();
    c.strokeStyle=br?'#8a4a4a':'#ff8a6f';c.lineWidth=3;
    c.beginPath();c.moveTo(exX,headY+6);c.lineTo(exX,headY+headH-2+exO*3);c.stroke();

    // вспышка
    if(!br&&S.running){
      var cyc=((ph%(Math.PI*4))+Math.PI*4)%(Math.PI*4);
      var d=cyc-2*Math.PI;
      var inten=Math.max(0,1-Math.abs(d)/1.2);
      if(inten>0.05){
        var sg=c.createRadialGradient(cx,cylTop+18,1,cx,cylTop+18,28);
        sg.addColorStop(0,'rgba(255,255,255,'+inten+')');
        sg.addColorStop(.4,'rgba(255,220,120,'+(0.85*inten)+')');
        sg.addColorStop(1,'rgba(255,100,20,0)');
        c.fillStyle=sg;
        c.beginPath();c.arc(cx,cylTop+18,28,0,7);c.fill();
      }
    }
  }

  // подпись
  c.fillStyle=br?'#8a5a5a':col;
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText(label,18,H-22);
}

RE.drawR4=function(c,S){drawInline(c,S,4,38,135,'R4 · 4 цилиндра','#8fb5d8');};
RE.drawInline6=function(c,S){drawInline(c,S,6,28,95,'I6 · Toyota 2JZ','#EB0A1E');};
RE.drawTDI=function(c,S){drawInline(c,S,4,38,135,'1.9 TDI · Volkswagen','#8fb5d8');};
RE.drawDCi=function(c,S){drawInline(c,S,4,38,135,'2.0 dCi · Renault','#f0d860');};
RE.drawPassatB3=function(c,S){drawInline(c,S,4,38,135,'1.8 · Passat B3','#8fb5d8');};
RE.drawBluebird=function(c,S){drawInline(c,S,4,38,135,'CA20 · Nissan','#e08080');};
RE.drawMTZ=function(c,S){drawInline(c,S,4,38,135,'Д-240 · МТЗ-82','#8fb5d8');};

RE.drawScooter=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cx=W/2;
  var crankCY=H*0.78,crankR=45;
  var blockY=90,blockB=crankCY-crankR-10;
  var headY=60,headH=30,coverY=30,coverH=28;
  var r=70;

  var pg=c.createLinearGradient(0,blockB+10,0,H-8);
  pg.addColorStop(0,'#2a3340');pg.addColorStop(1,'#0d1319');
  c.fillStyle=pg;
  c.beginPath();c.moveTo(cx-r-20,blockB+10);c.lineTo(cx+r+20,blockB+10);c.lineTo(cx+r, H-8);c.lineTo(cx-r,H-8);c.closePath();c.fill();

  c.fillStyle='#0a0f15';c.fillRect(cx-r,blockY,r*2,blockB-blockY);
  c.strokeStyle='#3a4a5c';c.lineWidth=3;c.strokeRect(cx-r,blockY,r*2,blockB-blockY);

  var hg=c.createLinearGradient(0,headY,0,headY+headH);
  hg.addColorStop(0,'#3a4858');hg.addColorStop(1,'#1e2630');
  c.fillStyle=hg;c.fillRect(cx-r,headY,r*2,headH);
  c.strokeStyle='#4a5a6c';c.lineWidth=2;c.strokeRect(cx-r,headY,r*2,headH);

  c.fillStyle='#222c38';c.fillRect(cx-r,coverY,r*2,coverH);
  c.strokeStyle='#2a3a4c';c.lineWidth=2;c.strokeRect(cx-r,coverY,r*2,coverH);

  // коленвал
  c.strokeStyle='#a8b4c0';c.lineWidth=8;
  c.beginPath();c.moveTo(cx-140,crankCY);c.lineTo(cx+140,crankCY);c.stroke();
  c.fillStyle='#d8e4f0';
  var pinY=crankCY+Math.cos(S.crankAngle)*crankR;
  c.beginPath();c.arc(cx,pinY,7,0,7);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=2;c.stroke();

  // цилиндр
  var cylTop=blockY+6,cylBot=blockB-6,cylH=cylBot-cylTop;
  c.fillStyle='#050810';c.fillRect(cx-r+3,cylTop,r*2-6,cylH);
  c.strokeStyle='#3a4a5c';c.lineWidth=1.5;c.strokeRect(cx-r+3,cylTop,r*2-6,cylH);

  var pistonH=r*0.6;
  var travel=cylH-pistonH-12;
  var pistonY=cylTop+6+((Math.cos(S.crankAngle)+1)/2)*travel;
  var pg2=c.createLinearGradient(cx-r,0,cx+r,0);
  pg2.addColorStop(0,'#4a5566');pg2.addColorStop(.25,'#d8e0e8');pg2.addColorStop(.6,'#8b98a7');pg2.addColorStop(1,'#2a333f');
  c.fillStyle=pg2;
  c.fillRect(cx-r+6,pistonY,r*2-12,pistonH);
  c.strokeStyle='#0a1018';c.lineWidth=1.5;c.strokeRect(cx-r+6,pistonY,r*2-12,pistonH);

  c.strokeStyle='#8894a2';c.lineWidth=5;
  c.beginPath();c.moveTo(cx,pistonY+pistonH-4);c.lineTo(cx,pinY);c.stroke();

  // маховик
  var fwX=cx+150,fwR=34;
  var fg=c.createRadialGradient(fwX-fwR*.3,crankCY-fwR*.3,2,fwX,crankCY,fwR);
  fg.addColorStop(0,'#a8b4c0');fg.addColorStop(.5,'#6a7580');fg.addColorStop(1,'#2a3340');
  c.fillStyle=fg;c.beginPath();c.arc(fwX,crankCY,fwR,0,7);c.fill();
  c.strokeStyle='#0a1018';c.lineWidth=2;c.stroke();

  c.fillStyle='#5d7189';c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('S1 · скутер 1 цилиндр',20,H-22);
};

RE.drawV=function(c,S,n){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cyMid=H/2;
  var perRow=Math.floor(n/2);
  var sp=Math.min(80,(W-100)/perRow);
  var r=Math.min(22,sp*0.28);
  var startX=W/2-(perRow-1)*sp/2;

  // верхний блок
  c.fillStyle='#0a0f15';
  c.fillRect(startX-r-15,60,(perRow-1)*sp+r*2+30,cyMid-100);
  c.strokeStyle='#3a4a5c';c.lineWidth=2.5;
  c.strokeRect(startX-r-15,60,(perRow-1)*sp+r*2+30,cyMid-100);
  // головка
  c.fillStyle='#2a3a4c';
  c.fillRect(startX-r-15,30,(perRow-1)*sp+r*2+30,30);
  c.strokeStyle='#4a5a6c';c.strokeRect(startX-r-15,30,(perRow-1)*sp+r*2+30,30);

  // нижний блок
  c.fillStyle='#0a0f15';
  c.fillRect(startX-r-15,cyMid+40,(perRow-1)*sp+r*2+30,cyMid-100);
  c.strokeStyle='#3a4a5c';c.lineWidth=2.5;
  c.strokeRect(startX-r-15,cyMid+40,(perRow-1)*sp+r*2+30,cyMid-100);
  // головка
  c.fillStyle='#2a3a4c';
  c.fillRect(startX-r-15,H-60,(perRow-1)*sp+r*2+30,30);
  c.strokeStyle='#4a5a6c';c.strokeRect(startX-r-15,H-60,(perRow-1)*sp+r*2+30,30);

  // коленвал
  c.strokeStyle='#a8b4c0';c.lineWidth=7;
  c.beginPath();c.moveTo(60,cyMid);c.lineTo(W-60,cyMid);c.stroke();

  var topPistY=(60+30+cyMid-100)/2+20;
  var botPistY=(cyMid+40+H-60)/2+20;

  for(var i=0;i<perRow;i++){
    var cx=startX+i*sp;
    var ph=S.crankAngle+i*Math.PI*2/perRow;
    var ph2=ph+Math.PI;

    // верхний цилиндр
    c.fillStyle='#050810';
    c.fillRect(cx-r,60,r*2,cyMid-100);
    c.strokeStyle='#3a4a5c';c.lineWidth=1.5;c.strokeRect(cx-r,60,r*2,cyMid-100);
    var py1=60+6+((Math.cos(ph)+1)/2)*(cyMid-100-30);
    var pg=c.createLinearGradient(cx-r,0,cx+r,0);
    pg.addColorStop(0,'#4a5566');pg.addColorStop(.3,'#d8e0e8');pg.addColorStop(1,'#2a333f');
    c.fillStyle=pg;c.fillRect(cx-r+3,py1,r*2-6,20);
    c.strokeStyle='#0a1018';c.strokeRect(cx-r+3,py1,r*2-6,20);
    var pinY=crankCY+Math.cos(ph)*(r*0.8);
    c.strokeStyle='#8894a2';c.lineWidth=4;
    c.beginPath();c.moveTo(cx,py1+18);c.lineTo(cx,pinY);c.stroke();

    // нижний цилиндр
    c.fillStyle='#050810';
    c.fillRect(cx-r,cyMid+40,r*2,cyMid-100);
    c.strokeStyle='#3a4a5c';c.strokeRect(cx-r,cyMid+40,r*2,cyMid-100);
    var py2=cyMid+40+6+((Math.cos(ph2)+1)/2)*(cyMid-100-30);
    c.fillStyle=pg;c.fillRect(cx-r+3,py2,r*2-6,20);
    c.strokeRect(cx-r+3,py2,r*2-6,20);
    var pinY2=crankCY+Math.cos(ph2)*(r*0.8);
    c.beginPath();c.moveTo(cx,py2+18);c.lineTo(cx,pinY2);c.stroke();

    // свечи
    c.fillStyle='#e8e4dc';
    c.fillRect(cx-2,35,4,10);
    c.fillRect(cx-2,H-45,4,10);
  }

  c.fillStyle='#5d7189';c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('V'+n+' · '+n+' цилиндров V-образно',20,H-22);
};

RE.drawWankel=function(c,S){
  var W=c.canvas.width,H=c.canvas.height,br=S.broken;
  c.clearRect(0,0,W,H);
  var cy=H/2,R=Math.min(W/3,H/2)-25;
  var cxL=W/2-R-20,cxR=W/2+R+20;
  var ecc=R*0.3,rotR=R*0.62;
  var ang=S.crankAngle||0;

  c.fillStyle=br?'#1a0a0a':'#0a0f15';
  c.fillRect(30,40,W-60,H-80);
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2;c.strokeRect(30,40,W-60,H-80);

  function rot(cx,phase){
    c.save();c.translate(cx,cy);
    // эпитрохоида
    c.fillStyle=br?'rgba(120,60,60,.15)':'rgba(80,140,200,.15)';
    c.beginPath();
    for(var i=0;i<=72;i++){
      var t=i/72*Math.PI*2;
      var r2=R*(1+0.25*Math.cos(3*t));
      if(i===0)c.moveTo(Math.cos(t)*r2,Math.sin(t)*r2);
      else c.lineTo(Math.cos(t)*r2,Math.sin(t)*r2);
    }
    c.closePath();c.fill();
    c.strokeStyle=br?'#8a5a5a':'#5a8fc0';c.lineWidth=2.5;c.stroke();

    // ротор
    c.save();
    c.translate(Math.cos(phase)*ecc,Math.sin(phase)*ecc);
    c.rotate(-phase/3);
    c.beginPath();
    for(var k=0;k<3;k++){
      var a=k*Math.PI*2/3-Math.PI/2;
      if(k===0)c.moveTo(Math.cos(a)*rotR,Math.sin(a)*rotR);
      else c.lineTo(Math.cos(a)*rotR,Math.sin(a)*rotR);
    }
    c.closePath();
    var rg=c.createRadialGradient(-rotR/3,-rotR/3,2,0,0,rotR);
    if(br){rg.addColorStop(0,'#8a6a6a');rg.addColorStop(1,'#2a1818');}
    else{rg.addColorStop(0,'#e0e8f0');rg.addColorStop(.5,'#8a95a3');rg.addColorStop(1,'#3a4654');}
    c.fillStyle=rg;c.fill();
    c.strokeStyle='#0a1018';c.lineWidth=3;c.stroke();
    c.fillStyle='#1a232e';
    for(var v=0;v<3;v++){
      var va=v*Math.PI*2/3-Math.PI/2;
      c.beginPath();c.arc(Math.cos(va)*rotR,Math.sin(va)*rotR,5,0,7);c.fill();
    }
    c.beginPath();c.arc(0,0,8,0,7);c.fill();
    c.restore();
    c.restore();
  }

  rot(cxL,ang);
  rot(cxR,ang+Math.PI);

  c.strokeStyle='#a8b4c0';c.lineWidth=8;c.lineCap='round';
  c.beginPath();c.moveTo(60,cy);c.lineTo(W-60,cy);c.stroke();

  c.fillStyle='#5d7189';c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('WANKEL · 13B Renesis · 2 ротора',20,H-22);
};

RE.render=function(c,S){
  var raw=(S.engineType||S.engine||'r4').toString().toLowerCase().replace(/\s+/g,'').replace(/-/g,'');
  function has(){for(var i=0;i<arguments.length;i++)if(raw.indexOf(arguments[i])>=0)return true;return false;}
  if(has('wankel','renesis','rotary'))       return RE.drawWankel(c,S);
  if(has('radial','wright','r1820'))         return RE.drawRadial?RE.drawRadial(c,S):RE.drawR4(c,S);
  if(has('boxer','ej25','subaru'))           return RE.drawBoxer?RE.drawBoxer(c,S):RE.drawR4(c,S);
  if(has('v22'))                             return RE.drawV(c,S,22);
  if(has('v16'))                             return RE.drawV(c,S,16);
  if(has('v12'))                             return RE.drawV(c,S,12);
  if(has('v8'))                              return RE.drawV(c,S,8);
  if(has('v6','galant'))                     return RE.drawV(c,S,6);
  if(has('i6','2jz','inline6'))              return RE.drawInline6(c,S);
  if(has('scooter'))                         return RE.drawScooter(c,S);
  if(has('tdi'))                             return RE.drawTDI(c,S);
  if(has('dci'))                             return RE.drawDCi(c,S);
  if(has('passat'))                          return RE.drawPassatB3(c,S);
  if(has('bluebird','ca20'))                 return RE.drawBluebird(c,S);
  if(has('tractor','mtz','mt82','belarus'))  return RE.drawMTZ(c,S);
  return RE.drawR4(c,S);
};

console.log('render-engines.js: v2 OK');
})();