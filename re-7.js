(function(){var RB=window.RB;if(!RB)return;var RE=window.RE=window.RE||{};

/* Знаменитая кривая Ванкеля — эпитрохоида */
function epiPoint(t,R,e){
  /* Параметрическое уравнение эпитрохоиды */
  var x = R*Math.cos(t) + e*Math.cos(3*t);
  var y = R*Math.sin(t) + e*Math.sin(3*t);
  return {x:x,y:y};
}

RE.drawWankel=function(c,S){
  var W=c.canvas.width,H=c.canvas.height;
  var br=S.broken;

  /* Два ротора в ряд */
  var rotors=[
    {cx:W*0.32,cy:H*0.42,phase:S.crankAngle},
    {cx:W*0.68,cy:H*0.42,phase:S.crankAngle+Math.PI/3}
  ];

  var R=95;      // радиус корпуса
  var e=16;      // эксцентриситет
  var rotR=58;   // радиус ротора
  var rotE=22;   // смещение ротора от центра

  /* === ОСНОВАНИЕ: блок двигателя === */
  var blockGrad=c.createLinearGradient(0,50,0,H-30);
  if(br){blockGrad.addColorStop(0,'#3a2424');blockGrad.addColorStop(1,'#1a0808');}
  else{blockGrad.addColorStop(0,'#2b3746');blockGrad.addColorStop(0.5,'#1d2733');blockGrad.addColorStop(1,'#131b24');}
  c.fillStyle=blockGrad;
  RB.rr(c,20,20,W-40,H-60,14);c.fill();
  c.strokeStyle=br?'#6a3a3a':'#3a4a5c';c.lineWidth=2.5;c.stroke();

  /* Осевая линия блока */
  c.strokeStyle=br?'rgba(120,60,60,0.4)':'rgba(30,40,52,0.6)';
  c.lineWidth=1.5;
  for(var li=0;li<12;li++){
    var ly=35+li*28;
    c.beginPath();c.moveTo(30,ly);c.lineTo(W-30,ly);c.stroke();
  }

  /* === КАЖДЫЙ РОТОР === */
  for(var ri=0;ri<rotors.length;ri++){
    var rt=rotors[ri];
    drawRotorUnit(c,rt.cx,rt.cy,R,e,rotR,rotE,rt.phase,br,S,ri+1);
  }

  /* === ВЫПУСКНОЙ КОЛЛЕКТОР СЗАДИ === */
  var colGrad=c.createLinearGradient(0,H-45,0,H-25);
  if(br){colGrad.addColorStop(0,'#3a2424');colGrad.addColorStop(1,'#2a1a1a');}
  else{colGrad.addColorStop(0,'#3a2a1a');colGrad.addColorStop(1,'#2a1a0a');}
  c.strokeStyle=colGrad;c.lineWidth=14;c.lineCap='round';
  c.beginPath();
  c.moveTo(W*0.32,H-38);
  c.lineTo(W*0.68,H-38);
  c.stroke();
  c.beginPath();
  c.moveTo(W*0.5,H-38);
  c.lineTo(W*0.5,H-12);
  c.stroke();

  /* === ПОДПИСЬ === */
  c.fillStyle=br?'#a05050':'#8fb5d8';
  c.font='bold 13px Segoe UI, sans-serif';
  c.textAlign='left';c.textBaseline='top';
  c.fillText('13B-MSP Renesis  •  Mazda RX-8',30,12);
  c.fillStyle=br?'#7a4a4a':'#5d7189';
  c.font='bold 10px Segoe UI, sans-serif';
  c.fillText('2-роторный Ванкель  •  1.3 L  •  231 л.с.  •  9000 об/мин',30,H-18);
};

function drawRotorUnit(c,cx,cy,R,e,rotR,rotE,phase,br,S,num){
  /* === КОРПУС (эпитрохоида) === */
  c.save();
  c.translate(cx,cy);

  /* Внешний контур корпуса */
  c.beginPath();
  var steps=120;
  for(var i=0;i<=steps;i++){
    var t=(i/steps)*Math.PI*2;
    var p=epiPoint(t,R,e);
    if(i===0)c.moveTo(p.x,p.y);
    else c.lineTo(p.x,p.y);
  }
  c.closePath();

  /* Заливка корпуса (металл) */
  var caseGrad=c.createRadialGradient(0,0,20,0,0,R+e+20);
  if(br){caseGrad.addColorStop(0,'#2a1a1a');caseGrad.addColorStop(1,'#1a0e0e');}
  else{caseGrad.addColorStop(0,'#5a6878');caseGrad.addColorStop(1,'#2a3340');}
  c.fillStyle=caseGrad;
  c.fill();
  c.strokeStyle=br?'#7a4a4a':'#4a5a6c';
  c.lineWidth=4;
  c.stroke();

  /* Внутренняя камера (тёмная) */
  c.beginPath();
  for(var j=0;j<=steps;j++){
    var t2=(j/steps)*Math.PI*2;
    var p2=epiPoint(t2,R-12,e-4);
    if(j===0)c.moveTo(p2.x,p2.y);
    else c.lineTo(p2.x,p2.y);
  }
  c.closePath();
  var innerGrad=c.createRadialGradient(0,0,10,0,0,R);
  if(br){innerGrad.addColorStop(0,'#1a0808');innerGrad.addColorStop(1,'#050303');}
  else{innerGrad.addColorStop(0,'#0a0f15');innerGrad.addColorStop(1,'#05080c');}
  c.fillStyle=innerGrad;
  c.fill();
  c.strokeStyle=br?'#4a2a2a':'#2a3a4a';
  c.lineWidth=2;
  c.stroke();

  /* === РОТОР (треугольник) === */
  c.save();
  c.rotate(phase*0.5);   /* ротор вращается в 2 раза медленнее вала */

  /* Положение ротора: смещён эксцентриком */
  var eccX=Math.cos(phase)*e;
  var eccY=Math.sin(phase)*e;
  c.translate(eccX,eccY);

  /* Контур ротора — треугольник с закруглёнными углами */
  c.beginPath();
  var A=Math.PI*2/3;
  var corners=[];
  for(var k=0;k<3;k++){
    var ang=k*A-Math.PI/2;
    corners.push({x:Math.cos(ang)*rotR,y:Math.sin(ang)*rotR});
  }
  c.moveTo(corners[0].x,corners[0].y);
  for(var k2=1;k2<3;k2++){
    c.lineTo(corners[k2].x,corners[k2].y);
  }
  c.closePath();

  /* Заливка ротора */
  var rotGrad=c.createRadialGradient(-rotR*0.3,-rotR*0.3,10,0,0,rotR);
  if(br){rotGrad.addColorStop(0,'#8a6a6a');rotGrad.addColorStop(.5,'#5a4040');rotGrad.addColorStop(1,'#2a1a1a');}
  else{rotGrad.addColorStop(0,'#d8e0e8');rotGrad.addColorStop(.5,'#8b98a7');rotGrad.addColorStop(1,'#3a4654');}
  c.fillStyle=rotGrad;
  c.fill();
  c.strokeStyle=br?'#5a3030':'#1a232e';
  c.lineWidth=3;
  c.stroke();

  /* Вершины ротора с уплотнениями */
  for(var v=0;v<3;v++){
    var vp=corners[v];
    /* Уплотнение (апекс) */
    c.fillStyle=br?'#8a5a5a':'#a8b4c0';
    c.beginPath();
    c.arc(vp.x,vp.y,6,0,7);c.fill();
    c.strokeStyle='#1a232e';c.lineWidth=1.5;c.stroke();
    /* Свеча рядом с вершиной */
    if(v===0){
      var sparkX=vp.x*0.85, sparkY=vp.y*0.85;
      c.fillStyle=br?'#7a4a4a':'#e8e4dc';
      c.beginPath();c.arc(sparkX,sparkY,3.5,0,7);c.fill();
    }
  }

  /* Внутренний треугольный вырез (охлаждение) */
  c.beginPath();
  var innerR=rotR*0.45;
  var innerAngs=[0,Math.PI*2/3,Math.PI*4/3];
  c.moveTo(Math.cos(innerAngs[0])*innerR,Math.sin(innerAngs[0])*innerR);
  for(var i2=1;i2<3;i2++){
    c.lineTo(Math.cos(innerAngs[i2])*innerR,Math.sin(innerAngs[i2])*innerR);
  }
  c.closePath();
  c.fillStyle=br?'#3a2424':'#2a3340';
  c.fill();
  c.strokeStyle=br?'#5a3030':'#1a232e';
  c.lineWidth=2;c.stroke();

  /* Центральная втулка */
  c.fillStyle=br?'#5a3030':'#1a232e';
  c.beginPath();c.arc(0,0,12,0,7);c.fill();
  c.strokeStyle=br?'#7a4a4a':'#3a4d61';
  c.lineWidth=2;c.stroke();
  /* Метка на втулке */
  c.strokeStyle=br?'#a05050':'#6d8299';
  c.lineWidth=3;
  c.beginPath();
  c.moveTo(0,0);
  c.lineTo(Math.cos(phase)*10,Math.sin(phase)*10);
  c.stroke();

  c.restore();

  /* === СВЕЧА СВЕРХУ === */
  var sparkTopY=-R-e-8;
  c.fillStyle=br?'#7a4a4a':'#e8e4dc';
  RB.rr(c,-6,sparkTopY,12,20,3);c.fill();
  c.strokeStyle='#2a333f';c.lineWidth=2;c.stroke();
  /* Искра */
  if(S.running&&!S.stalled&&!br){
    var cycPos=((phase%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    /* 3 вспышки за оборот ротора */
    var phaseIn=cycPos/Math.PI;
    var firing=Math.max(0,1-Math.abs(phaseIn-Math.floor(phaseIn+0.5))*2);
    if(firing>0.7){
      var spG=c.createRadialGradient(0,sparkTopY+18,1,0,sparkTopY+18,40);
      spG.addColorStop(0,'rgba(255,255,220,'+(0.9*firing)+')');
      spG.addColorStop(0.4,'rgba(255,180,50,'+(0.6*firing)+')');
      spG.addColorStop(1,'rgba(255,60,10,0)');
      c.fillStyle=spG;
      c.beginPath();c.arc(0,sparkTopY+18,40,0,7);c.fill();
    }
  }

  /* === ВПУСКНОЕ и ВЫПУСКНОЕ ОКНА === */
  /* Впуск справа */
  c.fillStyle=br?'#3a2424':'#1d2530';
  RB.rr(c,R-8,-14,18,28,3);c.fill();
  c.strokeStyle=br?'#5a3030':'#3a4a5c';c.lineWidth=2;c.stroke();
  c.fillStyle=br?'#7a4a4a':'#6fd0ff';
  c.font='bold 8px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='middle';
  c.fillText('IN',R+1,0);

  /* Выпуск слева */
  c.fillStyle=br?'#3a2424':'#1d2530';
  RB.rr(c,-R-10,-14,18,28,3);c.fill();
  c.strokeStyle=br?'#5a3030':'#3a4a5c';c.lineWidth=2;c.stroke();
  c.fillStyle=br?'#7a4a4a':'#ff8a6f';
  c.fillText('EX',-R-1,0);

  /* Номер ротора */
  c.fillStyle=br?'#a05050':'#5d7189';
  c.font='bold 10px Segoe UI, sans-serif';
  c.textAlign='center';c.textBaseline='top';
  c.fillText('РОТОР '+(num||''),0,R+e+20);

  c.restore();
}

})();