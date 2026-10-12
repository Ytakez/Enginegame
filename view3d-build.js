function buildRadial(root,cfg,brand){
  var n=9;
  var angStep=Math.PI*2/n;
  var R_cyl=3.2;
  var cylLen=3.0;

  var carter=cy(3.4,0.8,32,0x3a3a3a,0.75,0.45);
  carter.rotation.x=Math.PI/2;
  carter.position.set(0,3,0);
  root.add(carter);pB(carter);

  var crank=new THREE.Group();
  crank.position.set(0,3,0);
  var crBar=cy(0.45,0.45,5.5,20,0xa8b4c0,0.95,0.2);
  crBar.rotation.z=Math.PI/2;
  crank.add(crBar);
  root.add(crank);sCr(crank);

  var fw=new THREE.Group();
  var fwD=cy(1.6,1.6,0.35,32,0x8a95a3,0.9,0.3);
  fwD.rotation.z=Math.PI/2;
  fw.add(fwD);
  for(var ft=0;ft<28;ft++){
    var th=bx(0.35,0.24,0.13,0x6a7685,0.9,0.3);
    var a=(ft/28)*Math.PI*2;
    th.position.set(0,Math.cos(a)*1.75,Math.sin(a)*1.75);
    th.rotation.x=-a;
    fw.add(th);
  }
  fw.position.set(2.75,3,0);
  root.add(fw);sF(fw);

  var arr=[];
  for(var i=0;i<n;i++){
    var a=i*angStep-Math.PI/2;
    var cx=Math.cos(a)*R_cyl;
    var cyy=3+Math.sin(a)*R_cyl;
    var grp=new THREE.Group();
    grp.position.set(cx,cyy,0);
    grp.rotation.z=a-Math.PI/2;
    root.add(grp);

    var shell=new THREE.Mesh(
      new THREE.CylinderGeometry(1.0,1.0,cylLen,20,1,true),
      new THREE.MeshStandardMaterial({
        color:0x8894a2,metalness:0.9,roughness:0.15,
        transparent:true,opacity:0.32,side:THREE.DoubleSide
      }));
    shell.position.y=cylLen/2;grp.add(shell);pB(shell);

    var hd=cy(1.05,0.4,20,0x8894a2,0.9,0.25);
    hd.position.y=cylLen+0.2;grp.add(hd);pH(hd);

    var p=cy(0.9,0.7,18,0xd8e0e8,0.95,0.15);
    p.position.y=cylLen*0.5;grp.add(p);

    var rod=bx(0.28,1.6,0.28,0x8894a2,0.9,0.25);
    rod.position.y=-0.5;grp.add(rod);

    arr.push({g:grp,p:p,rod:rod,off:i*angStep});
  }
  sA(arr);

  if(brand)addPlate(root,0,7.5,0,4.5,0.6,brand.text,brand.bg,brand.fg);
}