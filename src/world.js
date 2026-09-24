import {localModel,eventPlot} from './local-models.js';
import {peopleProject,animatePerson,disposeGroup,person} from './people.js';
function wrapX(x){const W=28;return ((x+W/2)%W+W)%W-W/2;}
import {buildRestScene,setRestPose,resizeRest,animateRest,activityMiniature,disposeRest} from './rest-world.js';
import {CITY_DATA,classIndex} from './life-core.js';
import * as T from 'three';
import {getAsset,getOutfit,getProject,getRarity,getSpecial,getChallenge} from './catalog.js';

const palette={cream:0xf1eee3,concrete:0xd4d9ce,wood:0xb78b65,leaf:0x88a482,trunk:0x8b7660,glass:0x96c8d4,dark:0x354b49,gold:0xdaba6b};
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.68,...extra});
function mesh(g,geo,color,x=0,y=0,z=0,extra={}){const m=new T.Mesh(geo,color?.isMaterial?color:mat(color,extra));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
const box=(g,w,h,d,color,x=0,y=0,z=0,extra)=>mesh(g,new T.BoxGeometry(w,h,d),color,x,y,z,extra);
const cyl=(g,rt,rb,h,color,x=0,y=0,z=0,n=16)=>mesh(g,new T.CylinderGeometry(rt,rb,h,n),color,x,y,z);
const sphere=(g,r,color,x=0,y=0,z=0)=>mesh(g,new T.SphereGeometry(r,16,12),color,x,y,z);
const torus=(g,r,t,color,x=0,y=0,z=0)=>mesh(g,new T.TorusGeometry(r,t,8,48),color,x,y,z);
function roundSlab(g,w,d,h,r,color,x=0,y=0,z=0){const s=new T.Shape();const a=-w/2,b=-d/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.05,bevelThickness:.05,curveSegments:5});geo.rotateX(-Math.PI/2);return mesh(g,geo,color,x,y,z);}
function label(g,text,w=1.6,h=.42,x=0,y=1,z=0,bg='#314944',fg='#f0f1df'){if(document.documentElement.lang!=='zh-CN'&&globalThis.__tr)text=globalThis.__tr(String(text));
 const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,160);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 62px sans-serif';ctx.fillText(text,256,83,480);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=mesh(g,new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.8,side:T.DoubleSide}),x,y,z);return m;
}
function tree(g,x,z,s=1,type='round'){
 const a=new T.Group();g.add(a);a.position.set(x,0,z);a.scale.setScalar(s);
 cyl(a,.095,.15,1.15,0x876d53,0,.57,0,8);
 if(type==='palm'){
  for(let i=0;i<7;i++){const leaf=mesh(a,new T.ConeGeometry(.27,1.65,5),0x4e9d77,Math.sin(i*.9)*.48,1.6,Math.cos(i*.9)*.48);leaf.rotation.z=Math.cos(i*.9)*1.3;leaf.rotation.x=Math.sin(i*.9)*1.3;}
 }else{for(const [px,py,pz,r,c] of [[0,1.5,0,.61,0x74b97e],[-.38,1.33,.07,.43,0x62a774],[.38,1.55,.08,.46,0x95c783],[.05,1.9,0,.4,0xa4d08a],[.04,1.5,-.35,.43,0x7fb784]])sphere(a,r,c,px,py,pz);}
 return a;
}
function pot(g,x,z,s=.4){cyl(g,s*.7,s*.5,s*.9,0xd2c2aa,x,s*.45,z);sphere(g,s*.85,0x9cae87,x,s*1.1,z);}
function windows(g,width,height,cols,rows,z,centerY,color=0x9fc3cd){
 const geo=new T.BoxGeometry(width/cols*.56,height/rows*.51,.045);const material=mat(color,{roughness:.32,metalness:.14});const m=new T.InstancedMesh(geo,material,cols*rows);const dummy=new T.Object3D();let n=0;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){dummy.position.set((c+.5)*width/cols-width/2,centerY-height/2+(r+.5)*height/rows,z);dummy.updateMatrix();m.setMatrixAt(n++,dummy.matrix);}g.add(m);return m;
}
function building(g,{w=2.8,h=2.3,d=1.8,color=palette.cream,roof=0x82948c,rows=2,cols=3,flat=true}={}){
 box(g,w,h,d,color,0,h/2,0);box(g,w+.13,.14,d+.14,roof,0,h+.05,0);
 windows(g,w*.86,h*.75,cols,rows,d/2+.027,h*.52);
 box(g,.4,.68,.06,palette.dark,0,.35,d/2+.05);
 if(!flat){const roofMesh=mesh(g,new T.ConeGeometry(w*.77,1,4),roof,0,h+.52,0);roofMesh.rotation.y=Math.PI/4;roofMesh.scale.z=d/w;}
 box(g,w+.32,.1,d+.28,0xe9e5da,0,.04,0);
}
function bench(g,x,z){box(g,1,.1,.36,0xb99269,x,.43,z);box(g,1,.33,.08,0xb99269,x,.66,z-.15);box(g,.09,.4,.32,0x606e63,x-.36,.2,z);box(g,.09,.4,.32,0x606e63,x+.36,.2,z);}
function pool(g,x=1.6,z=0,w=2,d=1){roundSlab(g,w+.18,d+.18,.06,.15,0xeae5d6,x,.055,z);roundSlab(g,w,d,.03,.14,0x85c3cf,x,.13,z);}
function lamp(g,x,z){cyl(g,.025,.05,1.65,0x5e6a5c,x,.83,z,8);sphere(g,.13,0xf4e4af,x,1.69,z);}
function car(g,x,z,color=0xb3bead){const c=new T.Group();g.add(c);c.position.set(x,0,z);box(c,1.2,.31,.65,color,0,.3,0);box(c,.65,.3,.57,0x7eabb6,.05,.58,0);for(const wx of [-.38,.4])for(const wz of [-.35,.35]){const m=cyl(c,.13,.13,.09,0x42504b,wx,.19,wz,12);m.rotation.x=Math.PI/2;}return c;}
function dispose(root){const gs=new Set(),ms=new Set(),ts=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){ms.add(m);if(m.map)ts.add(m.map);}});gs.forEach(x=>x.dispose());ms.forEach(x=>x.dispose());ts.forEach(x=>x.dispose());root.removeFromParent();}

function model(g,kind,color=palette.cream){
 if(['busker','couriers','makers','dancecrew','filmcrew','researchers','founders','expedition'].includes(kind)){g.add(peopleProject(kind));return;}
 if(kind==='coffee'||kind==='bakery'||kind==='stall'){
  roundSlab(g,2.5,1.35,.12,.14,0xd6bba0,0,.62,0);box(g,2.24,.7,1.05,kind==='bakery'?0xc7ad8d:0xbfa58a,0,.37,0);
  for(const x of [-1.08,1.08]){cyl(g,.035,.035,1.6,0x6f8070,x,1.49,-.43);const w=cyl(g,.22,.22,.12,0x4f5c55,x,.2,.5);w.rotation.x=Math.PI/2;}
  box(g,2.55,.12,1.7,0xe2cfa8,0,2.2,-.03);for(let i=0;i<7;i++)box(g,.18,.04,1.75,i%2?0xf2e9d7:0x7a947d,-1.08+i*.36,2.29,-.03);
  box(g,2.55,.22,.05,0x7a947d,0,2.1,.85);label(g,kind==='bakery'?'RISE & SHINE':'COFFEE',1.45,.33,0,1.99,.887);
  box(g,.55,.45,.39,0x4b6059,-.58,.98,-.15);cyl(g,.055,.045,.19,0xeee7d4,.1,.89,.32);cyl(g,.06,.045,.2,0xeee7d4,.33,.89,.31);
  cyl(g,.08,.07,.31,0xd8bf8a,.75,.95,-.1);pot(g,1.6,-.4,.34);box(g,.51,.85,.06,0x324c42,-1.5,.45,.6);label(g,'OPEN',.4,.2,-1.5,.61,.64,'#324c42');
 }else if(kind==='solar'){
  for(let r=0;r<2;r++)for(let c=0;c<3;c++){const p=new T.Group();g.add(p);p.position.set(-1.4+c*1.15,.5,-.7+r*1.2);box(p,.08,.7,.08,0x889e9c,0,-.12,0);const a=new T.Group();p.add(a);a.rotation.x=-.35;box(a,1,.07,.83,0x9eb8c4);box(a,.92,.02,.75,0x43758e,0,.045,0);for(let i=-1;i<=1;i++)box(a,.008,.01,.75,0x95bec8,i*.24,.058,0);box(a,.92,.01,.01,0x95bec8,0,.058,0);}
  cyl(g,.04,.13,2.4,0xe9eade,2,1.2,-.5);sphere(g,.14,0xe5e8de,2,2.45,-.43);const blades=new T.Group();g.add(blades);blades.position.set(2,2.45,-.29);blades.userData.spin=.4;for(let i=0;i<3;i++){const a=new T.Group();blades.add(a);a.rotation.z=i*Math.PI*2/3;box(a,.11,.95,.04,0xe8ebde,0,.46,0);}
 }else if(kind==='greenhouse'){
  box(g,3,.08,2,0xcebc9b,0,.05,0);box(g,2.8,1.3,1.8,mat(0xb2d4cb,{transparent:true,opacity:.35,depthWrite:false}),0,.73,0);
  for(const x of [-1.45,0,1.45]){box(g,.045,1.5,.045,0x729e89,x,.8,.93);box(g,.045,1.5,.045,0x729e89,x,.8,-.93);}
  const top=mesh(g,new T.ConeGeometry(2.1,.75,4),mat(0xaed3c4,{transparent:true,opacity:.6}),0,1.85,0);top.rotation.y=Math.PI/4;top.scale.z=.67;
  for(const x of [-1.45,1.45])box(g,.07,.07,1.9,0x789e87,x,1.54,0);
  for(let x=-1;x<=1;x+=.5)for(let z=-.6;z<=.6;z+=.6){cyl(g,.12,.09,.2,0xaa8c6e,x,.16,z);sphere(g,.17,0x8eae77,x,.35,z);}
 }else if(kind==='rocket'||kind==='spaceport'){
  cyl(g,1.7,1.85,.16,0xbfc7bd,0,.1,0,40);cyl(g,1.2,1.2,.04,0xe0dbc7,0,.2,0,40);const r=new T.Group();g.add(r);cyl(r,.34,.34,1.7,0xf1ece0,0,1.3,0,24);mesh(r,new T.ConeGeometry(.34,.7,24),0xc1a58c,0,2.5,0);cyl(r,.19,.24,.4,0x686f65,0,.3,0);box(r,.1,.32,.01,0x98bdcc,0,1.67,.345);for(let i=0;i<4;i++){const f=box(r,.12,.6,.63,0xbb8e72,0,.55,0);f.rotation.y=i*Math.PI/2;}
  box(g,.18,2.8,.18,0x899989,-1.1,1.4,-.3);box(g,1.4,.08,.15,0x8a9d8c,-.48,2.5,-.3);for(let i=0;i<6;i++)box(g,.5,.055,.1,0xa8b4a5,-1.1,.3+i*.42,-.28);
  if(kind==='spaceport'){const b=new T.Group();g.add(b);b.position.set(2,0,-1);building(b,{w:2,h:1.3,d:1.8,rows:1,color:0xb6b5ca});}
 }else if(kind==='port'||kind==='container'){
  const colors=[0x9db5a6,0xc6a680,0x92adb8];for(let i=0;i<(kind==='port'?3:1);i++){const x=i===1?1.05:-.9,z=i===2?-.85:.1,y=i===2?1.22:.48;box(g,1.65,.86,1.1,colors[i],x,y,z);for(let j=0;j<8;j++)box(g,.026,.75,.022,0xd0d8c9,x-.71+j*.2,y,z+.57);}
  if(kind==='port'){box(g,.15,2.7,.15,0xccaa67,1.5,1.35,-.9);box(g,3,.14,.16,0xd6b872,.3,2.7,-.9);box(g,.025,1.3,.025,0x708079,-.8,2,-.9);box(g,.36,.13,.2,0x61756e,-.8,1.34,-.9);}else{box(g,.44,.66,.04,0x628e95,-.55,.35,.68);label(g,'MY SPACE',1,.25,-.9,.98,.67);}
 }else if(kind==='ocean'||kind==='marina'||kind==='island'){
  pool(g,0,0,4.6,2.6);roundSlab(g,2.9,.8,.18,.3,0xf0e9d9,0,.35,.05);box(g,1.15,.65,.7,0x8eb9c4,.05,.73,.05);box(g,1.6,.09,.86,0xf1e9d9,.08,1.1,.05);cyl(g,.035,.035,1.8,0xddd9c7,-.75,1.15,.05);const sail=mesh(g,new T.ConeGeometry(.67,1.2,3),0xeee7d6,-.59,1.6,.05);sail.scale.z=.06;sail.rotation.z=-.18;
  if(kind==='island'){roundSlab(g,2,2.1,.16,.7,0xd9cf9e,-2.2,.17,-.7);tree(g,-2.35,-.85,.95,'palm');}
  if(kind==='marina'){box(g,4.3,.12,.35,0xb59d7b,0,.3,1.1);for(const x of [-1.8,-.6,.6,1.8])box(g,.1,.6,.1,0x998f75,x,.25,1.1);}
 }else if(kind==='cloud'||kind==='lab'){
  if(kind==='cloud'){for(let i=0;i<3;i++){box(g,.74,1.9,.85,0x5a7977,-.9+i*.9,1,0);for(let j=0;j<6;j++){box(g,.57,.17,.025,0xaec4ba,-.9+i*.9,.28+j*.28,.44);sphere(g,.025,0xbedd96,-.69+i*.9,.28+j*.28,.461);}}box(g,3.2,.09,1.4,0xd2d8ca,0,2.03,0);label(g,'CLOUD NINE',2,.35,0,2.32,0);}else{cyl(g,1.2,1.4,.32,0xa5b4ae,0,.17,0,32);cyl(g,.8,.9,.13,0xe2d8e9,0,.4,0,32);const crystal=mesh(g,new T.OctahedronGeometry(.78),mat(0xa8bfd9,{metalness:.3,roughness:.23}),0,1.7,0);crystal.userData.float=1.7;crystal.userData.spin=.35;const ring=torus(g,1.02,.035,0xb4a0d1,0,1.7,0);ring.rotation.x=Math.PI/2;label(g,'FUTURE MATTER',2,.35,0,.72,1.2);}
 }else if(kind==='gold'){
  mesh(g,new T.DodecahedronGeometry(1.25,0),0xc6bea5,0,.7,-.2).scale.set(1.7,.8,.8);for(let i=0;i<7;i++)box(g,.38,.2,.23,0xd9b863,(i%3)*.43-.55,.15+Math.floor(i/3)*.21,.8);box(g,.8,.6,.56,0x9e896b,-1.5,.36,.55);cyl(g,.045,.045,1.6,0x6e806d,-1.7,.8,-.1);label(g,'GOLDEN HOUR',1.1,.25,-1.7,1.7,-.1);
 }else if(['vinyl','fashion','arcade','studio'].includes(kind)){
  building(g,{w:3,h:1.75,d:1.8,cols:2,rows:1,color,roof:0x536d62});box(g,2.5,.45,.09,0x486158,0,1.5,.96);label(g,{vinyl:'AFTERHOURS',fashion:'STUDIO No. 8',arcade:'PIXEL DISTRICT',studio:'NEXT TAKE'}[kind],2.2,.29,0,1.52,1.02);
  if(kind==='vinyl'){for(const x of [-.8,.8]){const disc=cyl(g,.3,.3,.035,0x333e3d,x,.8,1.08,24);disc.rotation.x=Math.PI/2;const center=cyl(g,.08,.08,.039,0xc7b885,x,.8,1.11,16);center.rotation.x=Math.PI/2;}}
  if(kind==='arcade'){for(const x of [-.78,.75]){box(g,.57,.8,.45,0xaf9bbb,x,.45,1.65);box(g,.43,.37,.035,0x314c48,x,.76,1.9);label(g,'PLAY',.32,.12,x,.75,1.925,'#314c48','#c9e996');}}
  if(kind==='studio'){cyl(g,.035,.035,1.1,0x50645b,1.5,.58,1.6);box(g,.46,.32,.25,0x3b5048,1.5,1.21,1.6);sphere(g,.16,0x87b6b6,1.5,1.2,1.78);}
  if(kind==='fashion'){cyl(g,.18,.29,.6,0xf0e2c9,.78,.75,1.66);sphere(g,.13,0xddd2b7,.78,1.19,1.66);cyl(g,.04,.04,.4,0x758270,.78,.25,1.66);}
 }else if(kind==='truck'){
  box(g,2.9,1.15,1.35,0xb4c4a5,0,.9,0);box(g,.9,.7,1.25,0xddcda7,-1.05,1.42,0);box(g,.92,.37,1.27,0x8eaeb0,-1.05,1.51,0);box(g,1.3,.53,.045,0x4a6858,.55,1.1,.7);box(g,1.7,.1,.5,0xeddfbf,.55,1.62,.8);label(g,'GOOD FOOD',1.3,.2,.55,1.4,.74);for(const x of [-1,1])for(const z of [-.69,.69]){const w=cyl(g,.3,.3,.13,0x414e45,x,.32,z);w.rotation.x=Math.PI/2;}
 }else if(['cottage','townhouse','loft','glass','villa','beach','penthouse','vineyard','gallery','manor','resort','palace','castle','tower','skycity','stadium'].includes(kind)){
  if(kind==='stadium'){
   const stadium=cyl(g,2.2,2.4,1.1,0xd5d6c7,0,.6,0,48);stadium.scale.z=.68;const bowl=cyl(g,1.75,1.75,.15,0x759a80,0,1.17,0,40);bowl.scale.z=.65;const ring=torus(g,2,.19,0xa8b8bc,0,1.22,0);ring.rotation.x=Math.PI/2;ring.scale.y=.65;box(g,.04,.01,1.5,0xf4e8ce,0,1.26,0);for(const x of [-1.6,1.6])for(const z of [-1,1]){box(g,.07,2,.07,0x93a2a0,x,1,z);box(g,.55,.23,.08,0xf3e6c7,x,2,z);}label(g,'UPSHIFT ARENA',2.1,.28,0,.87,1.57);
  }else if(['tower','skycity','penthouse','loft'].includes(kind)){
   const count=kind==='skycity'?3:1;
   for(let i=0;i<count;i++){const a=new T.Group();g.add(a);a.position.x=(i-(count-1)/2)*1.65;a.position.z=i%2?-.5:0;const h=kind==='loft'?2.5:kind==='penthouse'?3.4:3.8+i*.8;building(a,{w:count>1?1.35:2,h,d:1.5,color:0xb1c2c4,roof:0x849e9e,rows:Math.round(h*2),cols:count>1?3:4});for(let j=1;j<h;j+=.48)box(a,count>1?1.4:2.1,.07,1.6,0xe2e0d2,0,j,0);if(kind==='penthouse'){box(a,1.5,.5,1.1,0xe2ddce,0,h+.33,0);pool(a,.1,0,.95,.68);}}
  }else if(kind==='castle'){
   building(g,{w:3,h:2,d:1.6,color:0xb6adc0,roof:0x746c88,rows:2,cols:4});for(const x of [-1.7,1.7]){cyl(g,.46,.5,2.5,0xc4b7c6,x,1.25,0,16);mesh(g,new T.ConeGeometry(.58,1,16),0x7c7490,x,3,0);cyl(g,.025,.025,.55,0xae9d76,x,3.75,0);box(g,.3,.22,.015,0xd5bb83,x+.16,3.86,0);}box(g,.48,.95,.08,0x5d596b,0,.5,.86);
  }else if(['palace','manor','resort'].includes(kind)){
   building(g,{w:3,h:kind==='palace'?2.7:2.1,d:1.9,color:0xe2d6b9,roof:0xc1b386,rows:3,cols:5});for(const x of [-2,2]){const wing=new T.Group();g.add(wing);wing.position.set(x,0,-.25);building(wing,{w:1.1,h:1.7,d:1.6,color:0xd4c6a8,rows:2,cols:2});}
   for(let i=-1;i<=1;i++)cyl(g,.095,.11,1.2,0xf0e4c9,i*.43,.7,1.18,16);box(g,1.6,.14,.75,0xc6b686,0,1.36,1.02);roundSlab(g,1.1,1.5,.05,.03,0xae7c70,0,.09,1.9);if(kind==='resort')pool(g,0,1.7,3,1.1);
  }else if(kind==='vineyard'){
   building(g,{w:2.6,h:1.4,d:1.5,color:0xd6c3a4,roof:0x9e8771,flat:false,rows:1});for(let i=0;i<3;i++)for(let j=0;j<5;j++){sphere(g,.17,0x8a9c73,-2.8+i*.48,.3,-1+j*.45);}
  }else if(kind==='gallery'){
   box(g,3.5,1.8,1.8,0xe7e2d8,0,.9,0);box(g,2.6,1.55,.04,0x9bb8bb,0,.81,.93);box(g,3.8,.12,2.1,0xe3dacb,0,1.85,0);for(let i=0;i<4;i++)box(g,.07,1.6,.12,0xc7bbaa,-1.3+i*.87,.8,1);const art=torus(g,.5,.13,0xc7b18b,1.8,.71,1.4);art.rotation.y=.4;
  }else if(['glass','villa','beach'].includes(kind)){
   building(g,{w:2.8,h:1.4,d:1.8,color:0xe1dbcc,roof:0xc2bfab,rows:1,cols:4});const upper=new T.Group();g.add(upper);upper.position.set(-.4,1.5,-.1);building(upper,{w:2,h:1,d:1.4,color:0xc4cec4,roof:0xe1dcc9,rows:1,cols:3});pool(g,2.1,.4,1.4,2);if(kind==='beach'){tree(g,-2.2,-1,.9,'palm');tree(g,2,-1.5,.8,'palm');}box(g,1.7,.12,.8,0xb0a084,.6,.17,1.4);
  }else building(g,{w:kind==='townhouse'?1.9:2.8,h:kind==='townhouse'?3.2:1.5,d:1.8,color:kind==='townhouse'?0xbd9a86:0xd4cbb5,roof:0x8c9b88,rows:kind==='townhouse'?4:1,flat:kind==='townhouse'});
 }else building(g,{color});
}

function instanceBoxes(parent,positions,size,color){const geo=new T.BoxGeometry(...size),material=mat(color);const m=new T.InstancedMesh(geo,material,positions.length),d=new T.Object3D();positions.forEach((p,i)=>{d.position.set(...p);d.updateMatrix();m.setMatrixAt(i,d.matrix);});m.receiveShadow=true;m.castShadow=true;parent.add(m);return m;}
function flowerBed(g,x,z){roundSlab(g,1.2,.72,.15,.16,0xc3cbb4,x,.08,z);box(g,1.07,.06,.58,0x6a8b63,x,.26,z);for(let i=0;i<7;i++){const px=x-.44+(i%4)*.28,pz=z+(i%2?.12:-.12);cyl(g,.012,.012,.21,0x729456,px,.36,pz,5);const f=sphere(g,.056,i%3?0xf0b5a4:0xf7d584,px,.49,pz);f.scale.y=.6;}}
function lampTall(g,x,z){cyl(g,.044,.075,2.6,0x3e5967,x,1.42,z,10);cyl(g,.18,.18,.12,0x3c5663,x,.26,z,12);box(g,.52,.07,.11,0x3e5967,x+.16,2.74,z);const orb=sphere(g,.15,mat(0xffe5a0,{emissive:0xe9b452,emissiveIntensity:.25,roughness:.4}),x+.36,2.67,z);orb.scale.y=.7;}
function signpost(g,title,x,y,z,color='#2d6572'){
 const panel=roundSlab(g,2.75,.46,.1,.09,0xe9e5da,x,y,z);panel.rotation.x=Math.PI/2;
 label(g,title,2.66,.42,x,y+.18,z+.13,color,'#fff7df');
}
function cup(g,x,y,z,scale=1){const a=new T.Group();g.add(a);a.position.set(x,y,z);a.scale.setScalar(scale);cyl(a,.28,.22,.48,0xfff3d7,0,.24,0,24);cyl(a,.26,.26,.015,0x795339,0,.487,0,24);const h=torus(a,.16,.044,0xfff1d1,.28,.26,0);h.rotation.y=Math.PI/2;for(let i=0;i<3;i++){const steam=sphere(a,.055,mat(0xffffff,{transparent:true,opacity:.43,depthWrite:false}),-.12+i*.11,.63+i*.06,0);steam.scale.set(.45,1.6,.7);steam.userData.steam={base:.62+i*.08,phase:i*1.4};}return a;}
function clockTower(g,color){const a=new T.Group();g.add(a);a.position.set(.55,.25,.45);cyl(a,.5,.66,.26,0x8a99ba,0,.15,0,24);cyl(a,.11,.15,1.2,0x8295b1,0,.82,0,12);const face=cyl(a,.77,.77,.18,0xeaefff,0,2,0,40);face.rotation.x=Math.PI/2;const ring=torus(a,.78,.06,new T.Color(color),0,2,.12);for(let i=0;i<12;i++){const l=box(a,.036,.1,.035,0x6e80a1,Math.sin(i*Math.PI/6)*.63,2+Math.cos(i*Math.PI/6)*.63,.13);l.rotation.z=-i*Math.PI/6;}const pivot=new T.Group();a.add(pivot);pivot.position.set(0,2,.16);box(pivot,.04,.51,.045,0x7187b1,0,.2,0);pivot.userData.clockHand=true;box(a,.37,.035,.045,0x5d6e91,.14,2,.16);sphere(a,.06,0xb1a2e2,0,2,.19);label(a,'TIME TRIAL',1.9,.28,0,.8,.21,'#636990','#fff8e8');}
function neonCoin(g,x,y,z,color=0xeec064){const p=new T.Group();g.add(p);p.position.set(x,y,z);const coin=cyl(p,.61,.61,.14,mat(color,{metalness:.52,roughness:.28}),0,0,0,32);coin.rotation.x=Math.PI/2;const rim=torus(p,.51,.026,0xffeda7,0,0,.08);label(p,'$',.51,.49,0,0,.093,'#eac367','#fff2cb');p.userData.spin=.65;p.userData.float=y;return p;}
let PLOT_CITY='taipei';
const DB={
 taipei:{colors:[0xd0c8c0,0xa7c3c6,0xc7b4c7,0xe6c5ab,0xb2c5b4,0xafc1d2],roof:0x7c939b,aw:[0xc0392b,0xcb9b89,0xa3b889],labels:['BAKERY','TEA HOUSE','NIGHT MARKET','BUBBLE TEA','LOFTS','SCOOTERS'],lab:['#8e2b22','#fff4dd'],h:3.3},
 tokyo:{colors:[0x8d97ad,0xc9c3cc,0x6f7a90,0xb9aebd,0x9aa6b8,0xd6cfd8],roof:0x4f5566,aw:[0x2d3a5a,0x6b3a5a,0x3a5a5a],labels:['RAMEN','ARCADE','VINYL','KARAOKE','ROBOTS','SAKE'],lab:['#1d2340','#ffd6ea'],h:4.6,neon:[0xff6fa8,0x5fe1d8,0xb68cff,0xffd166]},
 vegas:{colors:[0xb08fc2,0xe0c08a,0x8f7fb0,0xd7a6c8,0xc9a36b,0x9c7fc0],roof:0x3a2a4a,aw:[0xff4f96,0xffc15a,0x9b59b6],labels:['CASINO','SLOTS','WEDDING','SHOWTIME','BUFFET','JACKPOT'],lab:['#3a1440','#ffe08a'],h:4.2,bulbs:true},
 singapore:{colors:[0xf2c6c2,0xbfe3d0,0xf6e3a8,0xc9d9f0,0xf0d1e6,0xd3ecd8],roof:0xb5654a,aw:[0x2e8b57,0x3aa0a0,0xe07a5f],labels:['HAWKER','KOPITIAM','SPICES','ORCHIDS','SHIPPING','FINTECH'],lab:['#1f5f4a','#fffbe8'],h:3.1,shop:true},
 newyork:{colors:[0x8e5a44,0x9aa3ab,0x6f4b3e,0xb3a58f,0x7d6a5f,0xa0928a],roof:0x3f474d,aw:[0x1e3a5f,0x7a1f1f,0x2f4f2f],labels:['DELI','BAGELS','PIZZA','BROADWAY','BROKERS','LOFTS'],lab:['#1a1a1a','#f4e3b0'],h:4.8,fire:true},
 monaco:{colors:[0xf1dcc0,0xf4e7d0,0xe9c9b4,0xf7efe0,0xefd9c6,0xf5e6cf],roof:0xd0764a,aw:[0x1f5f8b,0xffffff,0x0f3d5c],labels:['BOUTIQUE','JOAILLERIE','CAFÉ DE PARIS','YACHT CLUB','PARFUMS','GALERIE'],lab:['#0f3d5c','#fdf5e2'],h:3.0,pitched:true}};
function districtBuilding(root,x,z,idx){const b=new T.Group();root.add(b);b.position.set(x,.12,z);const D=DB[PLOT_CITY]||DB.taipei;const colors=D.colors,h=D.h+(idx%3)*.8,w=2.65;
 building(b,{w,h,d:2,color:colors[idx%colors.length],roof:D.roof,rows:3+idx%2+(D.h>4?1:0),cols:3,flat:!D.pitched});
 for(let i=0;i<3;i++)box(b,w+.1,.08,2.06,0xe9e5d8,0,.72+i*1.06,0);
 if(!D.pitched){box(b,.5,.36,.45,0xb5b6b0,.65,h+.31,-.2);cyl(b,.04,.045,.6,0x8b999c,-.6,h+.4,-.3,8);}
 const awning=box(b,2.2,.08,.6,D.aw[idx%3],0,1.1,1.19);awning.rotation.x=.12;
 label(b,D.labels[idx%6],2,.28,0,1.5,1.07,D.lab[0],D.lab[1]);
 box(b,1.58,.52,.035,0x6d9ba8,0,.56,1.03);pot(b,-1.04,1.15,.22);pot(b,1.04,1.15,.22);
 if(D.neon){const c=D.neon[idx%4];box(b,.28,h*.55,.07,mat(c,{emissive:c,emissiveIntensity:1}),w/2-.2,h*.6,1.06);}
 if(D.bulbs){for(let i=0;i<9;i++)sphere(b,.06,mat(0xffe08a,{emissive:0xffc860,emissiveIntensity:1.3}),-1.1+i*.275,1.78,1.1);box(b,w+.05,.1,.1,mat(0xff5fa2,{emissive:0xff4f96,emissiveIntensity:1}),0,h-.2,1.02);}
 if(D.shop){for(let i=0;i<3;i++)box(b,.3,.5,.05,[0x2e8b57,0x3aa0a0,0xe07a5f][i],-.8+i*.8,2.3,1.03);}
 if(D.fire){for(let i=0;i<2;i++){box(b,1.2,.04,.4,0x222222,.5,2.2+i*1.1,1.2);box(b,.03,1.1,.03,0x222222,1.05,2.75+i*1.1-.55,1.38);}if(idx%2===0){cyl(b,.35,.35,.6,0x7a5a3a,-.6,h+.45,-.2,10);mesh(b,new T.ConeGeometry(.4,.35,10),0x5a4030,-.6,h+.92,-.2);}}
 if(PLOT_CITY==='taipei'){for(let i=0;i<3;i++)sphere(b,.14,mat(0xd9412b,{emissive:0xc0392b,emissiveIntensity:.5}),-.8+i*.8,1.55,1.35);}
 return b;
}

// A deterministic in-browser material generator. No online service or API key.
function cityPavement(){
 const c=document.createElement('canvas');c.width=c.height=256;const p=c.getContext('2d');p.fillStyle='#b8b9a6';p.fillRect(0,0,256,256);let seed=723;const r=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(let i=0;i<6500;i++){p.fillStyle=r()>.5?'#deded322':'#595e4822';p.fillRect(r()*256,r()*256,1+r()*2,1+r()*2);}p.strokeStyle='#929d8d';p.lineWidth=1;for(let i=0;i<256;i+=64){p.beginPath();p.moveTo(i,0);p.lineTo(i,256);p.moveTo(0,i);p.lineTo(256,i);p.stroke();}
 const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(5,3);tex.colorSpace=T.SRGBColorSpace;return mat(0xffffff,{map:tex,roughness:.92});
}
function enrichBlock(root,city){
 const g=new T.Group();root.add(g);g.position.z=-8.2;
 const cream=0xe3d9c0,green=0x618e81;
 if(city==='taipei'){
  const t=new T.Group();g.add(t);t.position.set(5,0,-1.7);box(t,1.5,.7,1.3,0x659590,0,.35,0);
  for(let i=0;i<7;i++){const level=box(t,1.4-i*.075,.6,1.2-i*.07,0x8cafa0,0,1+i*.6,0);box(t,1.55-i*.075,.085,1.36-i*.07,0x6e998b,0,1.3+i*.6,0);}cyl(t,.03,.09,1.5,0x719f95,0,5.65,0,8);
  for(let x=-5;x<3;x+=.85){cyl(root,.022,.022,2.6,0x5e7469,x,1.3,-1.9,6);sphere(root,.145,mat(0xecad74,{emissive:0xdd9158,emissiveIntensity:.3}),x,2.4,-1.9);}
  for(let i=0;i<3;i++){const b=new T.Group();g.add(b);b.position.set(-5+i*2.4,0,.5);building(b,{w:2.1,h:1.6+i*.65,d:1.8,color:[0xbdbda5,0xc1a68e,0xadbfaf][i],rows:2,cols:3});for(let j=0;j<2;j++){box(b,.65,.13,.36,0xa69c84,.2,.8+j*.8,1.1);box(b,.23,.22,.22,0xd3d4c2,-.8,1+j*.8,1.08);}}
 }else if(city==='tokyo'){
  for(let i=0;i<6;i++){const b=new T.Group();g.add(b);b.position.set(-6+i*2.35,0,-i%2);building(b,{w:2,h:2.3+i%3,d:2,color:[0x8f9caf,0xc3b4b1,0xa8a1b3][i%3],roof:0x657181,rows:3,cols:3});const hue=[0xd49ab2,0x8acbc5,0xc5b3e4][i%3];box(b,.4,1.7,.06,mat(hue,{emissive:hue,emissiveIntensity:.6}),-.65,1.55,1.04);label(b,['PLAY','VINYL','STUDIO'][i%3],1.35,.23,0,2.1,1.08,'#536076','#f6d3e6');}
  const a=new T.Group();root.add(a);a.position.set(-5,0,-2);tree(a,0,0,1.4);for(let i=0;i<8;i++)sphere(a,.32,0xe3bccc,Math.cos(i)*.7,1.9+Math.sin(i*3)*.3,Math.sin(i)*.55);
 }else if(city==='vegas'){
  for(const x of [-5,4]){const b=new T.Group();g.add(b);b.position.x=x;building(b,{w:3,h:3.5,d:2.1,color:0x9d8eae,roof:0x79708f,rows:4,cols:5});for(let j=-1;j<=1;j++){box(b,.045,3.3,.07,mat(0xdfb56c,{emissive:0xe9b872,emissiveIntensity:1}),j,1.8,1.1);}label(b,x<0?'NIGHTFALL':'HIGH ROLLER',2.6,.4,0,3.1,1.12,'#755b7c','#ffdea0');}
  for(let i=0;i<4;i++)tree(root,-6+i*4,-3,1.25,'palm');
  const wheel=torus(g,1.8,.065,mat(0xe2b79d,{emissive:0xde9fb2,emissiveIntensity:.7}),0,2.6,-1);for(let i=0;i<12;i++){const a=i*Math.PI/6;sphere(g,.14,mat(0xf5d7b2,{emissive:0xffb679,emissiveIntensity:.5}),Math.cos(a)*1.8,2.6+Math.sin(a)*1.8,-1);}
 }else if(city==='singapore'){
  for(const x of [-1.8,0,1.8]){box(g,1.15,4,1.6,mat(0x94babc,{metalness:.15,roughness:.32}),x,2,-1);for(let y=.5;y<4;y+=.35)box(g,1.17,.05,1.63,0xd8dcc7,x,y,-1);}
  roundSlab(g,6.7,2,.25,.7,cream,0,4.12,-1);for(let x=-2;x<=2;x+=.7)sphere(g,.23,0x749b74,x,4.45,-1);pool(g,.3,-.9,2.5,.7);
  for(let i=0;i<3;i++){cyl(g,.09,.35,2.1,0x9d8291,-5+i*.7,1,-.3,8);const ring=torus(g,.5,.075,0x89a68c,-5+i*.7,2.1,-.3);ring.rotation.x=Math.PI/2;}
 }else if(city==='newyork'){
  for(let i=0;i<5;i++){const b=new T.Group();g.add(b);b.position.set(-6+i*2.8,0,-i%2);building(b,{w:2.2,h:3.5+i%3,d:2,color:[0xa4a89e,0x92a9b4,0xbbab93][i%3],roof:0x6e8282,rows:6,cols:4});if(i===2){box(b,1.25,1.1,1.2,0xbcc9bc,0,5.2,0);cyl(b,.025,.08,1.6,0xabbcae,0,6.5,0,8);}}
  const taxi=car(root,4.2,4.6,0xd6ac49);taxi.userData.drive={baseX:4.2,span:2};label(taxi,'TAXI',.4,.15,0,.82,0,'#e3bf68','#5d6855');
 }else if(city==='monaco'){
  for(let i=0;i<5;i++){const b=new T.Group();g.add(b);b.position.set(-6+i*2.8,0,-(i%2));building(b,{w:2.4,h:1.6+(i%3)*.5,d:1.9,color:[0xe1caae,0xe5d7bd,0xd8baac][i%3],roof:0xbc9480,flat:false,rows:2,cols:3});}
  pool(root,0,-4.6,13,2.2);const yacht=new T.Group();root.add(yacht);yacht.position.set(-3,.15,-4.5);model(yacht,'ocean');yacht.scale.setScalar(.66);
  for(const x of [-6,6])tree(root,x,-2,1.6,'palm');
 }
 // Everyday street life belongs to every tier, including a humble start.
 for(let i=0;i<4;i++){const npc=avatar(.63+(i%2)*.09);npc.root.position.set(-6.3+i*3.8,.1,-2.6);npc.root.rotation.y=i%2?1.3:-1.2;npc.clothes.color.set([0xb19b82,0x93a88c,0x839caa,0xb495a5][i]);npc.root.userData.streetWalker={start:npc.root.position.x,phase:i*2.7};npc.root.userData.avatar=npc;root.add(npc.root);}
 const paving=box(root,13,.015,1.1,cityPavement(),0,.177,2.2);paving.castShadow=false;

}

/* ---- v12.2: strongly different city neighbourhoods + distant landmark ---- */
const CITY_SCENE={
 taipei:{ground:0xa9b79f,road:0x6f8288,walk:0xcfc9b3,fog:0xc4d2bd,sky:'#c5dccc',sky2:'#e8e2c8',sun:0xffe7c4},
 tokyo:{ground:0xa9b2c3,road:0x4f5566,walk:0xd4cfd6,fog:0xc5c4dc,sky:'#9fb3db',sky2:'#f1c9dd',sun:0xffd6ea},
 vegas:{ground:0xd6b98b,road:0x4c4550,walk:0xe3cfa8,fog:0xc9a6b8,sky:'#6f5fa8',sky2:'#f2a878',sun:0xffc38a},
 singapore:{ground:0x8fbf94,road:0x5f7a80,walk:0xd9e3d2,fog:0xbfe0dc,sky:'#9fd6de',sky2:'#f4f1d2',sun:0xfff4d6},
 newyork:{ground:0x9aa19c,road:0x3f474d,walk:0xbfc1b8,fog:0xb9c3cc,sky:'#9fb4c9',sky2:'#e6d7c0',sun:0xfff0d8},
 monaco:{ground:0xcfe0d8,road:0x7a8a8e,walk:0xf1e7d4,fog:0xd6ecef,sky:'#8fd0e6',sky2:'#fbf1dc',sun:0xfff3d6}};
function cityTile(tile,city,CS,seed,palette){
 const r=i=>((Math.sin(seed*12.9898+i*78.233)*43758.5453)%1+1)%1;
 if(city==='tokyo'){
  for(let i=0;i<4;i++){const h=4+r(i)*5,xx=-6+i*3.8,c=[0x8d97ad,0xb9aebd,0x6f7a90,0xc9c3cc][i];box(tile,2.6,h,3,c,xx,h/2,-3.6);windows(tile,2.2,h*.8,3,Math.max(3,Math.round(h/1.2)),-2.07,h*.5,0xf3e6c4);
   const hue=[0xff6fa8,0x5fe1d8,0xb68cff,0xffd166][i];box(tile,.35,h*.6,.08,mat(hue,{emissive:hue,emissiveIntensity:.9}),xx+1.1,h*.55,-2.05);}
  for(let i=0;i<2;i++){const tr=tree(tile,-4+i*8,1.2,1.1);for(let k=0;k<6;k++)sphere(tr,.3,0xf2b8cf,Math.cos(k)*.5,1.7+Math.sin(k*2)*.25,Math.sin(k)*.45);}
  box(tile,.1,2.6,.1,0xc0392b,6.5,1.3,1.4);box(tile,1.6,.14,.14,0xc0392b,6.5,2.5,1.4);box(tile,1.9,.14,.14,0xc0392b,6.5,2.8,1.4);box(tile,.1,2.6,.1,0xc0392b,7.4,1.3,1.4);
 }else if(city==='vegas'){
  for(let i=0;i<3;i++){const h=5+r(i)*4,xx=-5.5+i*5.2,c=[0xb08fc2,0xe0c08a,0x8f7fb0][i];box(tile,3.6,h,3,c,xx,h/2,-3.8);for(let j=-1;j<=1;j++)box(tile,.06,h*.92,.06,mat(0xffd27a,{emissive:0xffc15a,emissiveIntensity:1.2}),xx+j*1.2,h*.47,-2.27);
   box(tile,3.8,.35,.12,mat(0xff5fa2,{emissive:0xff4f96,emissiveIntensity:1}),xx,h-.4,-2.25);}
  for(let i=0;i<3;i++)tree(tile,-6+i*6,1.3,1.3,'palm');
  if(r(9)>.6){const py=mesh(tile,new T.ConeGeometry(2.4,3.2,4),mat(0x2a2233,{metalness:.5,roughness:.3}),5,1.6,-1);py.rotation.y=Math.PI/4;}
 }else if(city==='singapore'){
  for(let i=0;i<3;i++){const h=3+r(i)*3,xx=-5.2+i*4.8;box(tile,3,h,3.2,[0x9cc7c0,0xe8e1cf,0xb7d3c5][i],xx,h/2,-3.6);for(let y=.6;y<h;y+=.7)box(tile,3.1,.12,3.3,0x6fae7e,xx,y,-3.6);}
  box(tile,16,.04,1.6,mat(0x5fb3c4,{roughness:.2,metalness:.2}),0,.02,.4);
  for(let i=0;i<4;i++)tree(tile,-6.5+i*4.3,1.6,1.2,i%2?'palm':'round');
 }else if(city==='newyork'){
  for(let i=0;i<4;i++){const h=6+r(i)*7,xx=-6.2+i*4,c=[0x8e7a6a,0x9aa3ab,0x6f5b50,0xb3a58f][i];box(tile,3.2,h,3.2,c,xx,h/2,-3.6);windows(tile,2.8,h*.85,4,Math.round(h/1.1),-1.98,h*.5,0xe9dfb9);
   if(r(i+4)>.5){cyl(tile,.45,.45,.8,0x7a5a3a,xx+.6,h+.4,-3.6,10);mesh(tile,new T.ConeGeometry(.5,.5,10),0x5a4030,xx+.6,h+1.05,-3.6);}}
  box(tile,.05,1.1,.05,0x333333,5.5,.55,1.8);box(tile,.25,.6,.25,0x2d3436,5.5,1.3,1.8);
 }else if(city==='monaco'){
  if(Math.abs(seed)%3===0||tile.userData.gz<=-2){box(tile,18,.05,18,mat(0x3f9fc0,{roughness:.15,metalness:.25}),0,-.08,0);for(let i=0;i<2;i++){const hull=box(tile,3.2,.5,1,0xffffff,-4+i*7,.2,-2+i*2);box(tile,1.6,.45,.8,0xe9e4da,-4.3+i*7,.65,-2+i*2);}return;}
  for(let i=0;i<4;i++){const h=1.6+r(i)*1.6,xx=-6+i*4,c=[0xf1dcc0,0xf4e7d0,0xe9c9b4,0xf7efe0][i];box(tile,3,h,3,c,xx,h/2,-3.6);const roof=mesh(tile,new T.ConeGeometry(2.3,1,4),0xd0764a,xx,h+.5,-3.6);roof.rotation.y=Math.PI/4;windows(tile,2.6,h*.7,3,2,-2.07,h*.5,0x6aa8c6);}
  for(let i=0;i<3;i++)tree(tile,-5+i*5,1.4,1.4,'palm');
 }else{
  for(let i=0;i<3;i++){const h=1.7+((i*3+1)%5)*.55+r(i),b=[0xb6b89d,0x91ab98,0xc9a88b][i],xx=-5.2+i*4.8;box(tile,3.2,h,3.5,b,xx,h/2,-3.5);box(tile,3.45,.18,3.75,0xdad3bf,xx,h+.1,-3.5);for(let j=0;j<3;j++)box(tile,.48,.7,.03,0x64838a,xx-1+j,h*.65,-1.73);
   box(tile,3.2,.1,.9,0xa0523a,xx,1.2,-1.4);}
  for(let x=-6;x<7;x+=3)sphere(tile,.2,mat(0xe8904f,{emissive:0xd9793a,emissiveIntensity:.5}),x,2.1,-1.2);
 }
}
function landmark(g,city){
 const L=new T.Group();g.add(L);L.position.set(-34,0,-58);L.scale.setScalar(2.2);
 if(city==='taipei'){for(let i=0;i<8;i++){box(L,2.4-i*.18,2.2,2.4-i*.18,0x6f9f97,0,1.1+i*2.2,0);box(L,2.9-i*.18,.25,2.9-i*.18,0x5b8a80,0,2.2+i*2.2,0);}cyl(L,.08,.25,4,0x6f9f97,0,19.6,0,8);
  for(let i=0;i<5;i++){const m=mesh(L,new T.ConeGeometry(9+i*2,8+i*1.5,6),0x7fa58c,-20+i*11,3.5,-14);}}
 else if(city==='tokyo'){for(let i=0;i<4;i++){const s=4-i*.9;mesh(L,new T.CylinderGeometry(s*.55,s,5,4,1,true),mat(i%2?0xffffff:0xe0452b,{side:T.DoubleSide,wireframe:true}),0,2.5+i*5,0);}cyl(L,.08,.2,4,0xe0452b,0,21,0,6);
  const fuji=mesh(L,new T.ConeGeometry(18,11,24),0x8e9bb8,24,5.5,-20);mesh(L,new T.ConeGeometry(6,3.7,24),0xf6f6fb,24,9.2,-20);}
 else if(city==='vegas'){const w=torus(L,7,.25,mat(0xffffff,{emissive:0xff8ad0,emissiveIntensity:.8}),0,8,0);for(let i=0;i<16;i++){const a=i*Math.PI/8;sphere(L,.45,mat(0xffe08a,{emissive:0xffc860,emissiveIntensity:1}),Math.cos(a)*7,8+Math.sin(a)*7,0);}box(L,.5,8,.5,0xdddddd,0,4,0);
  const py=mesh(L,new T.ConeGeometry(8,9,4),mat(0x1e1a24,{metalness:.6,roughness:.25}),16,4.5,-3);py.rotation.y=Math.PI/4;box(L,.25,40,.25,mat(0xffffff,{emissive:0xfff4c0,emissiveIntensity:1.5}),16,29,-3);
  for(let i=0;i<5;i++)mesh(L,new T.ConeGeometry(10,5+i,5),0xc78a5c,-26+i*10,2.5,-16);}
 else if(city==='singapore'){for(let i=0;i<3;i++)box(L,2.6,16,3.2,0xd8dcd2,-5+i*5,8,0);const deck=box(L,17,.9,3.6,0x9cc7b0,0,16.5,0);for(let i=0;i<6;i++)sphere(L,.8,0x6fae7e,-7+i*2.8,17.3,0);
  for(let i=0;i<5;i++){const t=mesh(L,new T.ConeGeometry(1.4,6,6),0x6f8f7a,14+i*2.2,3,4);}}
 else if(city==='newyork'){box(L,4,14,4,0xb9b3a4,0,7,0);box(L,3,6,3,0xc2bcad,0,17,0);box(L,1.8,4,1.8,0xcac4b5,0,22,0);cyl(L,.12,.3,5,0xcac4b5,0,26.5,0,8);
  for(let i=0;i<6;i++){const h=10+((i*7)%9);box(L,3.4,h,3.4,[0x8e9aa6,0x7b6f68,0xa9a293][i%3],-16+i*6+(i>2?8:0),h/2,-6);}}
 else if(city==='monaco'){for(let i=0;i<4;i++)mesh(L,new T.ConeGeometry(14+i*3,12+i*2,7),0x8fa98a,-18+i*12,6,-16);box(L,10,4,5,0xf1e2c4,0,8,-6);for(let i=0;i<4;i++){cyl(L,.9,.9,6,0xf1e2c4,-4.5+i*3,9,-6,10);mesh(L,new T.ConeGeometry(1.1,2,10),0xc46a45,-4.5+i*3,13,-6);}
  box(L,60,.2,30,mat(0x3f9fc0,{roughness:.15}),0,.1,18);}
 L.traverse(o=>{o.castShadow=false;o.receiveShadow=false;});
}

/* R9: roadside sponsor stop — a real billboard + promo tent + a walking banner crew, blended into the street. */
const SPONSOR_LOOK={cola:{bg:['#e8332f','#ff9a3c'],fg:'#fff',en:'GLACIER COLA',zh:'极冰可乐',tag:['Taste the cold','冰爽一夏']},phone:{bg:['#2b2f8f','#6b5bff'],fg:'#fff',en:'NOVA PHONE X',zh:'NOVA 手机 X',tag:['See the future','看见未来']},car:{bg:['#111','#4a4a4a'],fg:'#ffd65c',en:'AURORA MOTORS',zh:'极光汽车',tag:['Drive the dream','驾驭梦想']},bank:{bg:['#0f3d2e','#1f7a5a'],fg:'#f5d77a',en:'MERIDIAN PRIVATE',zh:'子午线私人银行',tag:['Wealth, quietly','财富，安静地']}};
function adTexture(look,zh,w=1024,h=440){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,look.bg[0]);g.addColorStop(1,look.bg[1]);x.fillStyle=g;x.fillRect(0,0,w,h);
 x.globalAlpha=.12;x.fillStyle='#fff';for(let i=-h;i<w;i+=70){x.beginPath();x.moveTo(i,0);x.lineTo(i+35,0);x.lineTo(i+35+h,h);x.lineTo(i+h,h);x.fill();}x.globalAlpha=1;
 x.fillStyle=look.fg;x.textAlign='left';x.textBaseline='middle';x.font='900 96px sans-serif';x.fillText(zh?look.zh:look.en,60,150,700);x.font='600 54px sans-serif';x.globalAlpha=.9;x.fillText(zh?look.tag[1]:look.tag[0],64,250,640);x.globalAlpha=1;
 x.fillStyle='#ffd400';x.fillRect(60,320,300,70);x.fillStyle='#111';x.font='900 44px sans-serif';x.fillText('SPONSORED',78,357);
 x.beginPath();x.arc(860,220,120,0,Math.PI*2);x.fillStyle='#ffffffee';x.fill();x.beginPath();x.moveTo(825,160);x.lineTo(825,280);x.lineTo(925,220);x.closePath();x.fillStyle=look.bg[0];x.fill();
 x.font='800 40px sans-serif';x.fillStyle=look.fg;x.textAlign='center';x.fillText('▶ AD · 30s',860,390);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
function sponsorPlot(offer,lang){const root=new T.Group();const look=SPONSOR_LOOK[offer.sponsor]||SPONSOR_LOOK.cola;const zh=lang==='zh';
 box(root,16,.2,18,0xa9bea6,0,-.18,-1.7);box(root,16,.13,5.1,0xdbe0d6,0,-.01,.38);box(root,16,.06,1.65,0xc8d3c9,0,.11,2.25);box(root,16,.045,2.25,0x78939e,0,.012,4.5);
 // billboard on two steel posts
 const bb=new T.Group();bb.position.set(.6,0,-2.2);root.add(bb);for(const x of [-2.6,2.6])box(bb,.28,4.2,.28,0x5d6670,x,2.1,0);box(bb,7.6,.18,.9,0x5d6670,0,3.95,.25);
 box(bb,7.4,3.3,.25,0x222831,0,5.6,0);const face=new T.Mesh(new T.PlaneGeometry(7.0,3.0),new T.MeshBasicMaterial({map:adTexture(look,zh)}));face.position.set(0,5.6,.14);bb.add(face);
 for(let i=0;i<14;i++){const b=sphere(bb,.09,0xfff2a8,-3.4+i*(6.8/13),7.35,.18);b.material=new T.MeshBasicMaterial({color:0xfff2a8});b.userData.blink=i;}
 for(const x of [-2.2,0,2.2]){const l=box(bb,.35,.12,.35,0x333a44,x,4.15,.55);}
 // promo tent with striped roof + counter
 const tent=new T.Group();tent.position.set(-4.3,0,.1);root.add(tent);for(const [x,z] of [[-1,-.7],[1,-.7],[-1,.7],[1,.7]])box(tent,.08,1.9,.08,0xdddddd,x,.95,z);
 for(let i=0;i<6;i++)box(tent,.36,.14,1.7,i%2?0xffffff:new T.Color(look.bg[0]).getHex(),-.9+i*.36,2.0,0);box(tent,1.9,.8,.6,new T.Color(look.bg[1]).getHex(),0,.4,.45);label(tent,zh?look.zh:look.en,1.6,.34,0,.55,.76,look.bg[0],'#ffffff');
 for(let i=0;i<3;i++){box(tent,.3,.42,.3,new T.Color(look.bg[0]).getHex(),-.5+i*.5,1.02,.4);}
 // walking banner crew (the "street walk" ad)
 const crew=new T.Group();crew.position.set(3.2,0,1.25);crew.userData.march={base:3.2,range:2.2,phase:0};root.add(crew);
 const a=person({color:new T.Color(look.bg[0]).getHex(),scale:.92});a.root.position.set(-.9,0,0);crew.add(a.root);a.root.userData.projectPerson=a;
 const b2=person({color:new T.Color(look.bg[0]).getHex(),scale:.92});b2.root.position.set(.9,0,0);crew.add(b2.root);b2.root.userData.projectPerson=b2;
 for(const x of [-.9,.9])box(crew,.05,2.4,.05,0x8a6a44,x,1.3,.25);const ban=new T.Mesh(new T.PlaneGeometry(1.9,.62),new T.MeshBasicMaterial({map:adTexture(look,zh,768,250),side:T.DoubleSide}));ban.position.set(0,2.15,.26);crew.add(ban);
 return root;}

function makePlot(offer,lang='en'){PLOT_CITY=offer?.city||PLOT_CITY;
 if(offer.type==='v12-ad'||offer.type==='v13-stroll'||offer.type==='v13-promo')return sponsorPlot(offer,lang);
 if(offer.type==='regional-story')return eventPlot({type:'interlude',scene:['park','waterfront','alley'][offer.story?.band||0],city:offer.city});
 if(offer.type==='world-event')return eventPlot({type:'interlude',scene:'alley',city:offer.city});
 if(['district-gate','district-task','interlude'].includes(offer.type))return eventPlot(offer);
 const root=new T.Group();const project=offer.type==='project'?getProject(offer.project):null,asset=offer.type==='asset'?getAsset(offer.asset):null;
 const special=offer.type==='special'?getSpecial(offer.special):null,challenge=offer.type==='challenge'?getChallenge(offer.challenge):null;
 const color=project?.color||asset?.color||special?.color||challenge?.color||'#d9a5bf';
 const kind=asset?.model||special?.scene||challenge?.scene||project?.id||'fashion';
 const coast=['ocean','marina','island','beach','resort'].includes(kind),nature=['solar','greenhouse','vineyard','cottage'].includes(kind),future=['rocket','spaceport','cloud','lab'].includes(kind),royal=['manor','palace','castle'].includes(kind);
 // The world is an actual continuous city block, not a floating display plinth.
 box(root,16,.2,18,coast?0x93cbd7:nature?0x98bd92:future?0xa6bed0:0xa9bea6,0,-.18,-1.7);
 box(root,16,.13,5.1,0xdbe0d6,0,-.01,.38);box(root,16,.06,1.65,0xc8d3c9,0,.11,2.25);
 box(root,16,.045,2.25,0x78939e,0,.012,4.5);box(root,16,.12,.18,0xe0e4d9,0,.095,3.33);box(root,16,.12,.18,0xe0e4d9,0,.095,5.67);
 const paving=[];for(let x=-7.75;x<8;x+=.51)for(let z=1.6;z<3.15;z+=.5)paving.push([x,.157,z]);instanceBoxes(root,paving,[.46,.018,.44],0xe0e6db);
 const lines=[];for(let x=-7.6;x<8;x+=2.3)lines.push([x,.044,4.45]);instanceBoxes(root,lines,[1.13,.013,.055],0xf6ead1);
 const crossing=[];for(let z=3.6;z<5.5;z+=.26)crossing.push([3.9,.048,z]);instanceBoxes(root,crossing,[1.22,.016,.16],0xe9ece2);
 const ds=new T.Group();root.add(ds);
 if(coast){
  box(ds,16,.055,7.5,0x80bdcb,0,-.045,-4.55);for(let i=0;i<11;i++)box(ds,1.3+(i%3)*.4,.015,.035,0xbce1e0,-7+(i%6)*2.5,.014,-7+(i%3)*1.7);
  box(ds,9,.12,.72,0xba9e75,0,.21,-2.35);for(const x of [-4,-2,0,2,4])cyl(ds,.065,.09,.6,0x9a886d,x,.15,-2.35,8);
  for(const [x,c] of [[-4.5,0xb8cfd0],[3.4,0xe5c6a6]]){const h=new T.Group();ds.add(h);h.position.set(x,.24,-4.1);building(h,{w:2.1,h:1.65,d:1.55,color:c,roof:0x6c999b,rows:1,flat:false});}
  tree(ds,-6.3,-3.7,1.7,'palm');tree(ds,5.8,-3.6,1.8,'palm');cyl(ds,.2,.23,.38,0xe5a18b,.5,.16,-5.4,12);
 }else if(nature){
  box(ds,13,.04,4.5,0x9dbc8b,0,.02,-4.4);
  const rows=[];for(let x=-5.4;x<5.5;x+=.6)for(let z=-5.8;z<-2.7;z+=.7)rows.push([x,.2,z]);instanceBoxes(ds,rows,[.43,.2,.35],0x83ab76);
  const barn=new T.Group();ds.add(barn);barn.position.set(-3.8,.1,-4.7);building(barn,{w:2.8,h:2.25,d:1.95,color:0xd7c59e,roof:0x829c87,rows:1,cols:2,flat:false});label(barn,'FIELD / WORK',2.1,.35,0,1.68,1,'#577b6e','#fff5d8');
  const mill=new T.Group();ds.add(mill);mill.position.set(4.2,0,-5);cyl(mill,.15,.35,3.65,0xe0e6d5,0,1.9,0,12);const blades=new T.Group();mill.add(blades);blades.position.set(0,3.63,.21);blades.userData.windmill=true;for(let i=0;i<3;i++){const a=new T.Group();blades.add(a);a.rotation.z=i*Math.PI*2/3;box(a,.14,1.55,.08,0xf1ead8,0,.74,0);}sphere(mill,.16,0x93ada0,0,3.63,.28);
 }else if(future){
  box(ds,13,.045,4.4,0xb7cbd7,0,.04,-4.1);
  for(const x of [-4.3,3.3]){const b=new T.Group();ds.add(b);b.position.set(x,.1,-4.1);building(b,{w:3,h:2.6,d:2,color:0xc4d3dc,roof:0x718ca5,rows:2,cols:4});label(b,'RESEARCH / LAB',2.4,.34,0,1.75,1.04,'#526f9a','#e9f6ff');const dome=sphere(b,.77,mat(0xa6cadf,{metalness:.28,roughness:.25}),0,2.73,0);dome.scale.y=.7;box(b,.11,1.25,.11,0x7897ac,1.1,3.3,0);sphere(b,.1,mat(0xc7b8f0,{emissive:0x8a69c6,emissiveIntensity:.3}),1.1,3.98,0);}
  for(let i=0;i<5;i++){const line=box(ds,.08,.02,2.65,0xd5ecff,-1.6+i*.8,.08,-4.3);}
 }else if(royal){
  box(ds,14,.25,.4,0xc5b897,0,.23,-5.5);for(let i=-6;i<=6;i+=2){box(ds,.3,1.35,.35,0xddceb0,i,.7,-5.5);sphere(ds,.22,0xe9d7b0,i,1.46,-5.5);}
  for(const x of [-4.9,4.9]){const hedge=box(ds,2.2,.7,2.35,0x80a084,x,.5,-3.6);tree(ds,x,-3.7,1.28);}
  cyl(ds,.85,.98,.18,0xd5c5a4,0,.17,-4.35,32);cyl(ds,.7,.7,.035,0x9ecace,0,.28,-4.35,32);cyl(ds,.2,.25,.9,0xe6d8b7,0,.67,-4.35,16);sphere(ds,.23,0xf1e1b9,0,1.17,-4.35);
 }else{for(const [x,z,i] of [[-6.4,-5.1,0],[-3.35,-5.2,1],[0,-5.7,2],[3.3,-5.2,3],[6.4,-5,4]])districtBuilding(ds,x,z,i);}
 ds.traverse(o=>{o.castShadow=false;});
 box(root,13,.08,1.1,0xc6d5c7,0,.01,-3.25);
 tree(root,-4.55,-1.2,1.25);tree(root,4.65,-1.38,1.17);tree(root,-6.9,2.05,.83);tree(root,6.7,1.8,.9);
 flowerBed(root,-3.35,.3);flowerBed(root,3.45,.6);bench(root,-4.55,.55);lampTall(root,-5.4,3.15);lampTall(root,5.15,3.15);
 for(const x of [-6.4,-.45,6.3]){cyl(root,.07,.09,.57,0x809f9b,x,.39,3.05,9);cyl(root,.078,.079,.045,0xe8dabb,x,.58,3.05,9);}
 box(root,4.4,.13,2.95,0xc7d2c9,.4,.092,-.12);
 const exhibit=new T.Group();exhibit.position.set(.4,.17,-.12);root.add(exhibit);
 if(['shop','talent-market'].includes(offer.type)){
  model(exhibit,'fashion',0xe9c4d2);label(exhibit,offer.type==='talent-market'?'TALENT / HOUSE':'STREET / STYLE',2.4,.4,0,1.53,1.08,'#946887','#fff9ee');
  const rail=new T.Group();exhibit.add(rail);rail.position.set(-1.7,0,1.18);for(const x of [-.55,.55]){cyl(rail,.025,.025,1.42,0x738294,x,.75,0,8);box(rail,.35,.04,.31,0x77848e,x,.1,0);}box(rail,1.2,.04,.04,0x738294,0,1.43,0);for(let i=0;i<3;i++){const shirt=box(rail,.27,.39,.075,[0xb6d7af,0xa0bce5,0xe4b6a1][i],-.4+i*.4,1.06,0);box(rail,.36,.13,.085,[0xb6d7af,0xa0bce5,0xe4b6a1][i],-.4+i*.4,1.24,0);}
 }else if(special){
  const bk=new T.Group();exhibit.add(bk);bk.position.set(.2,0,-.3);model(bk,special.scene,new T.Color(color));bk.scale.setScalar(.77);
  neonCoin(exhibit,-1.1,2.35,.7,special.id==='half'?0xe0a282:0xe8c168);roundSlab(exhibit,3.7,1.2,.04,.18,new T.Color(color),0,.03,1.14);label(exhibit,special.id==='half'?'50% IN / ALL AT RISK':special.id==='jackpot'?'ALL-IN / 7X':special.id==='flip'?'HEADS OR TAILS':'REDLINE / 2.8X',3.5,.44,0,3.28,0,'#694568','#ffead4');
 }else if(challenge){
  const bk=new T.Group();exhibit.add(bk);bk.position.set(.8,0,-.8);model(bk,challenge.scene,new T.Color(color));bk.scale.setScalar(.65);clockTower(exhibit,color);label(exhibit,'BEAT THE CLOCK',3.4,.38,.1,3.32,-.1,'#626d9b','#fff5d6');
 }else{
  if(offer.localModel&&!asset)localModel(exhibit,offer);else model(exhibit,asset?.model||project?.id,new T.Color(color));
  if(!offer.localModel&&(project?.id==='coffee'||project?.id==='bakery')){
   const backdrop=new T.Group();root.add(backdrop);backdrop.position.set(.6,.16,-2.3);box(root,4.1,.13,1.8,0xc7d2c9,.6,.092,-2.3);building(backdrop,{w:3.3,h:2.3,d:1.2,color:project.id==='coffee'?0xd5bea2:0xe2c7a5,roof:0x638b87,rows:1,cols:3});
   box(backdrop,3.6,.2,1.45,0xeadfc7,0,2.42,0);label(backdrop,project.id==='coffee'?'CORNER COFFEE':'RISE & SHINE',2.8,.5,0,1.73,.63,'#48777a','#fff4d3');cup(backdrop,0,2.57,0,1.4);cup(exhibit,.1,.8,.29,.38);
  }
  if(asset){const a=getAsset(offer.asset);label(exhibit,lang==='zh'?a.name.zh.toUpperCase():a.name.en.toUpperCase(),Math.min(3.5,2+a.name.en.length*.03),.36,0,.75,1.65,'#827454','#fff4d4');}
 }
 // Lamps, pavement details, a street scooter, and a slowly moving delivery car.
 const scooter=new T.Group();root.add(scooter);scooter.position.set(2.6,.18,2.77);box(scooter,.69,.1,.2,0xbf9775,0,.19,0);cyl(scooter,.025,.025,.65,0x708391,.28,.5,0,8);box(scooter,.04,.04,.4,0x667981,.28,.83,0);for(const x of [-.3,.3]){const w=cyl(scooter,.115,.115,.08,0x476274,x,.12,0,12);w.rotation.x=Math.PI/2;}
 const vehicle=car(root,-4.4,4.6,0xb8d6d0);vehicle.userData.drive={baseX:-4.4,span:1.4};vehicle.scale.setScalar(1.13);
 for(const [x,z,c] of [[-3.6,1.97,0xe0bba8],[3.7,1.76,0xaabed9]]){const npc=avatar(.77);npc.root.position.set(x,.05,z);npc.root.rotation.y=x<0?1.1:-1.3;npc.clothes.color.set(c);npc.root.userData.streetWalker={start:x,phase:x*2};npc.root.userData.avatar=npc;root.add(npc.root);}
 const rank=asset?asset.tier:special?4:challenge?3:offer.type==='shop'?2:['common','uncommon','rare','epic','legendary','mythic'].indexOf(offer.rarity);
 if(rank>=2){const ring=torus(root,2.15,.038,new T.Color(color),.4,.22,-.1);ring.rotation.x=Math.PI/2;for(let i=0;i<8+rank*2;i++){const gem=mesh(root,new T.OctahedronGeometry(.045+rank*.009),mat(rank>=4?0xf0c56c:0x91cce1,{metalness:.4,roughness:.23}),Math.cos(i)*2+.4,.5+(i%4)*.37,Math.sin(i)*1.13);gem.userData.float=gem.position.y;gem.userData.spin=.7;}}
 enrichBlock(root,offer.city||'taipei');
 return root;
}
function avatar(scale=1){
 const root=new T.Group(),body=new T.Group();root.add(body);root.scale.setScalar(scale);
 const white=mat(0xf7faf7,{roughness:.45}),clothes=mat(0xf9fcf9,{roughness:.53}),trousers=mat(0xf0f4f0,{roughness:.58});
 const torso=mesh(body,new T.CapsuleGeometry(.235,.37,5,14),clothes,0,1.04,0);torso.scale.z=.78;
 const head=sphere(body,.304,white,0,1.66,0);head.scale.set(.99,1.07,.94);cyl(body,.095,.102,.17,white,0,1.36,0);
 for(const x of [-.095,.095]){const eye=sphere(body,.027,0x305369,x,1.687,.278);eye.scale.set(.72,1.08,.46);sphere(body,.008,0xffffff,x-.007,1.696,.299);}
 const smile=mesh(body,new T.TorusGeometry(.046,.009,5,10,Math.PI*.75),0x719296,0,1.577,.281);smile.rotation.z=Math.PI*1.13;
 const limbs=[];
 for(let i=0;i<4;i++){
  const arm=i<2,side=i%2?1:-1,pivot=new T.Group();body.add(pivot);pivot.position.set(side*(arm?.3:.132),arm?1.23:.77,0);
  mesh(pivot,new T.CapsuleGeometry(arm?.068:.079,arm?.31:.38,4,10),arm?white:trousers,0,arm?-.235:-.275,0);
  if(arm){sphere(pivot,.079,white,0,-.46,.018);sphere(pivot,.072,white,0,-.24,0);}else{
   const foot=mesh(pivot,new T.CapsuleGeometry(.085,.14,3,10),white,0,-.53,.069);foot.rotation.x=Math.PI/2;box(pivot,.18,.034,.26,0xcddbdc,0,-.599,.06);
  }
  limbs.push(pivot);
 }
 const dress=new T.Group();body.add(dress);return {root,body,head,clothes,white,trousers,limbs,dress};
}
function skyline(scene){const g=new T.Group();scene.add(g);for(let i=0;i<19;i++){const h=3.8+(i*7%10)*.52,w=1.9+(i%3)*.6,x=-27+i*3;box(g,w,h,2.7,[0xa4c2d4,0xb3ccd8,0xc8dbe3,0xb2c6d5][i%4],x,h/2,-17-(i%3)*1.7);box(g,w*.82,.22,2.4,0xc9dce4,x,h+.1,-17-(i%3)*1.7);}
 for(let j=0;j<4;j++){const c=new T.Group();g.add(c);c.position.set(-16+j*11,9+(j%2)*2,-25-(j%2)*3);for(let i=0;i<5;i++){const cloud=sphere(c,.8+((i*3)%5)*.12,mat(0xfaf9ed,{roughness:1}),i*.95,Math.sin(i)*.35,0);cloud.scale.set(1.4,.72,1);}c.userData.cloudBase=c.position.x;}
 return g;}
export class World{
 constructor(container,{onError=()=>{}}={}){
  this.container=container;this.time=0;this.travelTime=null;this.motion=true;this.paused=false;this.speed=1;this.last=performance.now();this.hop=0;this.drag=0;this.lossPose=0;this.lang='en';this.onHeroPosition=()=>{};this.onProjectPosition=()=>{};this.blockAngle=0;
  try{
   this.renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,window.__vdesk?1.2:1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;container.appendChild(this.renderer.domElement);
   this.scene=new T.Scene();this.scene.fog=new T.FogExp2(0xc2d9e8,.022);this.camera=new T.OrthographicCamera(-8,8,6,-6,.1,100);
   this.scene.add(new T.HemisphereLight(0xe3f3ff,0x94b297,2.0));const sun=new T.DirectionalLight(0xffefcd,3.2);sun.position.set(-5,11,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-13,right:13,top:12,bottom:-11});sun.shadow.normalBias=.028;sun.shadow.bias=-.0001;sun.shadow.radius=3;this.scene.add(sun);this.sun=sun;const rim=new T.DirectionalLight(0xaedcff,.9);rim.position.set(8,5,-7);this.scene.add(rim);
   const ground=box(this.scene,180,.12,120,0xa6bca7,0,-.35,-7);ground.castShadow=false;this.ground=ground;
   this.sky=skyline(this.scene);this.sky.visible=true;this.sky.children.forEach(o=>o.visible=o.userData.cloudBase!==undefined);this.scene.background=new T.Color(0xb6c4ad);this.sky.traverse(o=>{o.castShadow=false;});this.actor=avatar(1.42);this.actor.root.position.set(-1.65,0,2.2);this.actor.root.rotation.y=.59;this.scene.add(this.actor.root);
   this.heroMarker=torus(this.scene,.66,.045,0xf3d78e,-1.65,.19,2.2);this.heroMarker.rotation.x=Math.PI/2;
   this.heroIdentity=new T.Group();this.actor.body.add(this.heroIdentity);const cap=sphere(this.heroIdentity,.313,0xd1b26d,0,1.81,-.035);cap.scale.set(1,.40,1);box(this.heroIdentity,.47,.034,.23,0xbe9f58,0,1.8,.24);box(this.heroIdentity,.27,.32,.16,0xb29861,0,1.08,-.22);
   this.cosmetics=new T.Group();this.scene.add(this.cosmetics);this.followers=[];this.buildSurroundings('taipei');
   this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(container);this.resize();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
   this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onError('contextlost');});this.renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
  }catch(e){onError(e.message);this.fallback=true;container.innerHTML='<div class="webgl-fallback">当前设备无法显示 3D 模型。<br>游戏按钮仍可使用，请使用支持 WebGL 的浏览器。</div>';}
 }
 resize(cameraOnly=false){
  if(!this.renderer||!this.camera)return;const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;if(!cameraOnly)this.renderer.setSize(w,h);
  if(this.restStage){resizeRest(this.restStage,w,h,this.restAngle||0);return;}
  const desktop=w>=760;
  const dock=document.getElementById('game-dock');
  let foot=desktop?h*.73:Math.max(h*.40,(dock?.getBoundingClientRect().top-this.container.getBoundingClientRect().top||h*.62)-20);let f=desktop?12.2:15.5;if(this.titleMode){f=11;foot=h*.74;}f*=1-(this.cornerZoom||0);
  this.frustum=f;const c=this.camera;c.left=-f*w/h/2;c.right=f*w/h/2;c.top=f/2;c.bottom=-f/2;
  c.position.set(8,8.7,13);c.position.applyAxisAngle(new T.Vector3(0,1,0),(this.blockAngle||0)+(this.cameraOrbit||0));c.lookAt(0,.8,0);c.updateProjectionMatrix();c.updateMatrixWorld(true);
  const p=new T.Vector3(this.actor?.root.position.x??-1.65,.18,this.actor?.root.position.z??2.2).project(c),cx=(p.x+1)*w/2,cy=(1-p.y)*h/2;
  const dx=this.titleMode?w*.38:w*.34;
  const up=new T.Vector3(0,1,0).applyQuaternion(c.quaternion),right=new T.Vector3(1,0,0).applyQuaternion(c.quaternion);c.position.addScaledVector(up,-(cy-foot)/h*f);c.position.addScaledVector(right,(cx-dx)/w*(f*w/h));c.updateMatrixWorld(true);
 }
 setStreetCast(people,crew,market){
  if(this.fallback)return;const key=JSON.stringify([people.length,crew.map(p=>p.id),market]);if(this.streetCastKey===key&&this.streetActors)return;this.streetCastKey=key;
  if(this.streetCast)disposeGroup(this.streetCast);this.streetCast=new T.Group();this.scene.add(this.streetCast);this.streetActors=[];
  const positions=[[-5.7,1.7],[3.9,2.0],[-3.4,-.7],[5.2,-1.2],[2.3,4.1],[-6.2,4.4]];
  people.forEach((n,i)=>{const a=person({color:n.color,scale:1.02+(i%2)*.05,hat:i%3===0});a.root.position.set(positions[i][0],.05,positions[i][1]);this.streetCast.add(a.root);this.streetActors.push({a,id:'npc-'+i,base:positions[i],i,kind:'npc'});});
  const boss=person({color:0xa18e68,scale:1.12});boss.root.position.set(1.1,.08,1.35);this.streetCast.add(boss.root);this.streetActors.push({a:boss,id:'manager',kind:'manager'});
  crew.forEach((n,i)=>{const a=person({color:n.color,scale:1.08,hat:n.id==='guide'});this.streetCast.add(a.root);this.streetActors.push({a,id:'crew-'+n.id,i,kind:'crew'});});
  if(market){const booth=new T.Group();booth.position.set(-5.2,0,-.65);box(booth,1.35,.75,.75,0x729b80,0,.4,0);box(booth,1.65,.12,1.0,0xe7ce92,0,1.55,0);for(const x of [-.65,.65])box(booth,.05,1.5,.05,0x887d59,x,.78,0);label(booth,'TALENT',1.05,.28,0,1.30,.45,'#305747','#fff2c9');this.streetCast.add(booth);this.streetMarket=booth;}else this.streetMarket=null;
 }
 updateStreetCast(t,dt){
  if(!this.streetCast)return;
  // R12: pedestrians live in WORLD space. While the hero rounds a corner the cast stays on the old street (no orbiting with
  // the camera); it is hidden for the last part of the swing and re-appears on the new street once the turn settles.
  const cp=this.corner?Math.min(1,(performance.now()-this.corner.start)/this.corner.duration):1;const castAngle=this.corner?this.corner.from:(this.blockAngle||0);
  if(this.corner)this.castHideUntil=performance.now()+350;
  this.streetCast.visible=!this.titleMode&&!this.restStage&&!(this.corner&&cp>.72)&&!(this.castHideUntil&&performance.now()<this.castHideUntil&&!this.corner);this.streetCast.rotation.y=castAngle;
  const localHero=this.actor.root.position.clone().applyAxisAngle(new T.Vector3(0,1,0),-castAngle);
  for(const p of this.streetActors){const a=p.a;if(p.kind==='npc'&&this.motion){const tt=t+p.i*3.1,cyc=12+p.i%3*2,walking=tt%cyc<3.5,step=Math.floor(tt/cyc)*3.5+Math.min(tt%cyc,3.5),phase=step*.25+p.i*1.9;let nx=p.base[0]+Math.sin(phase)*.95;const bz=p.base[1];const shiftX=this.castShift||0;
   // keep walkers out of the hero / manager / crew footprint so bodies never overlap
   const blockers=[[localHero.x,localHero.z,1.25],[1.1,1.35,1.05]];for(const q of this.streetActors)if(q.kind==='crew')blockers.push([q.a.root.position.x,q.a.root.position.z,.9]);for(const q of this.streetActors)if(q!==p&&q.kind==='npc'&&q.i<p.i)blockers.push([q.a.root.position.x,q.a.root.position.z,.85]);
   for(const [bx,bz2,r] of blockers){if(Math.abs(bz-bz2)<r&&Math.abs(nx-bx)<r){nx=nx<bx?bx-r:bx+r;}}
   const prevX=a.root.position.x-(p.lastShift||0);const lx=prevX+wrapX(nx-prevX)*.2;const vx=lx-prevX;a.root.position.x=wrapX(lx+shiftX);p.lastShift=a.root.position.x-lx;if(Math.abs(vx)>.0005)p.face=vx>0?1.45:-1.45;a.root.rotation.y=T.MathUtils.lerp(a.root.rotation.y,p.face??1.45,.15);for(let j=0;j<2;j++){a.legs[j].root.rotation.x=walking?Math.sin(t*4+p.i+j*Math.PI)*.28:0;a.arms[j].root.rotation.x=walking?-Math.sin(t*4+p.i+j*Math.PI)*.2:0;}}else if(p.kind==='crew'){{const tx=localHero.x-1.05-p.i*.8,tz=localHero.z+.55+(p.i%2)*.6;a.root.position.x=T.MathUtils.lerp(a.root.position.x||tx,tx,.18);a.root.position.z=T.MathUtils.lerp(a.root.position.z||tz,tz,.18);a.root.position.y=.05;a.root.rotation.y=.35;}animatePerson(a,t,this.motion);}else{if(p.kind==='manager'){const sx=this.castShift||0;a.root.position.x=1.1+(sx<-9?sx+18:sx);}else if(p.kind==='npc'){a.root.position.x=wrapX(p.base[0]+(this.castShift||0));}animatePerson(a,t,this.motion);}}
  this.streetCast.updateMatrixWorld(true);const rect=this.container.getBoundingClientRect();const points=this.streetActors.map(p=>{const v=new T.Vector3(0,2.55,0);p.a.root.localToWorld(v);v.project(this.camera);return {id:p.id,x:rect.left+(v.x+1)*rect.width/2,y:rect.top+(1-v.y)*rect.height/2,visible:this.streetCast.visible&&v.z>-1&&v.z<1};});
  if(this.streetMarket){const v=new T.Vector3(0,1.8,0);this.streetMarket.localToWorld(v);v.project(this.camera);points.push({id:'market',x:rect.left+(v.x+1)*rect.width/2,y:rect.top+(1-v.y)*rect.height/2,visible:this.streetCast.visible});}
  this.onStreetPositions?.(points);
 }
 setTitle(value){this.titleMode=value;this.resize();}
 setRest(rest){
  if(this.fallback)return;
  if(!rest){if(this.restStage){disposeRest(this.restStage);this.restStage=null;this.restKey=null;this.resize();}return;}
  const key=rest.id+':'+rest.class;if(this.restKey!==key){if(this.restStage)disposeRest(this.restStage);this.restStage=buildRestScene(rest.class);this.restKey=key;this.restAngle=rest.camera||0;this.resize();}
  setRestPose(this.restStage,rest.pose);if(this.restAngle!==(rest.camera||0)){this.restAngle=rest.camera||0;this.resize();}
 }
 modelSnapshot(root,{width=240,height=190,size=4.7,lookY=.95,position=[4,3.2,5],background=0xebeada}={}){
  if(this.fallback)return '';
  const r=this.renderer,scene=new T.Scene();scene.background=new T.Color(background);scene.add(root,new T.HemisphereLight(0xfff8de,0x92a38b,2.2));const light=new T.DirectionalLight(0xffefd1,3.1);light.position.set(-3,7,5);scene.add(light);
  const camera=new T.OrthographicCamera(-size*width/height/2,size*width/height/2,size/2,-size/2,.1,100);camera.position.set(...position);camera.lookAt(0,lookY,0);
  const target=new T.WebGLRenderTarget(width,height,{depthBuffer:true});target.texture.colorSpace=T.SRGBColorSpace;
  const old=r.getRenderTarget(),viewport=r.getViewport(new T.Vector4()),color=r.getClearColor(new T.Color()).clone(),alpha=r.getClearAlpha();
  try{r.setRenderTarget(target);r.render(scene,camera);const data=new Uint8Array(width*height*4);r.readRenderTargetPixels(target,0,0,width,height,data);const cv=document.createElement('canvas');cv.width=width;cv.height=height;const ctx=cv.getContext('2d'),image=ctx.createImageData(width,height);for(let row=0;row<height;row++)image.data.set(data.subarray((height-row-1)*width*4,(height-row)*width*4),row*width*4);ctx.putImageData(image,0,0);return cv.toDataURL('image/webp',.8);}catch{return '';}finally{r.setRenderTarget(old);r.setViewport(viewport);r.setClearColor(color,alpha);target.dispose();disposeGroup(root);scene.clear();}
 }
 cityPreview(id){if(window.UPSHIFT_ART?.[id])return window.UPSHIFT_ART[id];this.previewCache??=new Map();const key='city:'+id;if(this.previewCache.has(key))return this.previewCache.get(key);if(this.fallback)return '';const city=CITY_DATA.find(c=>c.id===id)||CITY_DATA[0];const root=makePlot({type:'project',project:city.projects[0],city:id,rarity:'common'},this.lang);const url=this.modelSnapshot(root,{width:384,height:240,size:11,lookY:.9,position:[9,10,14],background:0xc7d4bd});this.previewCache.set(key,url);return url;}
 restPreview(pose,level){this.previewCache??=new Map();const key='rest:'+pose+':'+level;if(this.previewCache.has(key))return this.previewCache.get(key);if(this.fallback)return '';const url=this.modelSnapshot(activityMiniature(pose,level),{width:160,height:160,size:2.9,lookY:.95,position:[3,2.7,5]});this.previewCache.set(key,url);return url;}
 setEnvironment(id,wealth=0){
  if(this.fallback)return;const city=CITY_DATA.find(c=>c.id===id)||CITY_DATA[0];if(this.city!==id)this.buildSurroundings(id);this.city=id;this.wealth=wealth;
  const CS=CITY_SCENE[id]||CITY_SCENE.taipei;this.scene.fog.color.set(CS.fog);this.scene.background.set(CS.fog);this.sun.color.set(CS.sun);this.sun.intensity=id==='vegas'?2.2:3.1;
  this.ground.material.color.set(CS.ground);
  const sky=document.querySelector('.sky-backdrop');if(sky)sky.style.background=`linear-gradient(180deg,${CS.sky} 0%,${CS.sky2} 70%,${CS.sky2} 100%)`;
  document.getElementById('app')?.setAttribute('data-city',id);PLOT_CITY=id;
 }
 setDaylight(energy,cap=200){
  if(this.fallback)return;this.dayRatio=Math.max(0,Math.min(1,energy/cap));const r=this.dayRatio,day=new T.Color((CITY_SCENE[this.city]||CITY_SCENE.taipei).fog),dusk=new T.Color('#ba888b'),night=new T.Color('#15233e');let sky=day.clone();if(r<.45&&r>.2)sky.lerp(dusk,(.45-r)/.25);else if(r<=.2)sky=dusk.clone().lerp(night,(.2-r)/.2);this.scene.background.copy(sky);this.scene.fog.color.copy(sky);this.sun.intensity=.6+2.6*Math.min(1,r*2.3);this.sun.color.set(r<.42?'#f2ba83':'#fff1d0');const hemi=this.scene.children.find(o=>o.isHemisphereLight);if(hemi){hemi.intensity=.6+1.4*Math.min(1,r*2);hemi.color.set(r<.2?'#a5b9ff':'#e3f3ff');}const b=this.beauty||0;this.renderer.toneMappingExposure=(r<.2?1.14:1.08)-.1+b*.05;this.sun.intensity*=.8+b*.07;if(hemi)hemi.intensity*=.8+b*.07;if(b<2&&r>.45){this.scene.background.lerp(new T.Color('#b9bcb6'),.45-b*.2);this.scene.fog.color.copy(this.scene.background);}
 }
 buildSurroundings(city){
  if(!this.scene)return;if(this.neighborhood)dispose(this.neighborhood);const g=new T.Group();this.scene.add(g);this.neighborhood=g;
  const palette={taipei:[0xb6b89d,0x91ab98,0xc9a88b],tokyo:[0xa6adc1,0xb7a4bc,0x839aaa],vegas:[0xb397b6,0xc2a38c,0x8c829f],singapore:[0x87b7b3,0xadc6bc,0xd5bba1],newyork:[0xa1adb7,0xb59379,0x9c9d95],monaco:[0xdfcfb5,0xc69f87,0xb9cbd0]}[city]||[0xb4c4b5];
  const CS=CITY_SCENE[city]||CITY_SCENE.taipei;const shared={};
  this.hoodTiles=[];for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++){if(x===0&&z===0)continue;const tile=new T.Group();g.add(tile);tile.position.set(x*18,-.08,z*18);tile.userData.gx=x;tile.userData.gz=z;this.hoodTiles.push(tile);
   box(tile,18,.15,18,CS.ground,0,-.18,0);box(tile,18,.05,3.1,CS.road,0,-.045,4.5);box(tile,2.8,.05,18,CS.road,-8,.0,0);box(tile,18,.08,1.05,CS.walk,0,.04,2.4);
   for(let i=0;i<5;i++)box(tile,1.3,.012,.05,0xf0e6c8,-7+i*3,.01,4.5);
   cityTile(tile,city,CS,x*7+z*3,palette);
  }

  // A permanent perpendicular street connects the current block to the next block.
  box(g,3,.08,40,0x758993,9,-.06,-4);box(g,1.1,.1,40,0xd6ddce,7.2,.02,-4);for(let z=-20;z<15;z+=2.7)box(g,.06,.012,1.2,0xf1e6c7,9,.005,z);
  g.traverse(o=>{o.castShadow=false;});
 }
 streetPoint(x,z,angle=this.blockAngle||0){return new T.Vector3(x,0,z).applyAxisAngle(new T.Vector3(0,1,0),angle);}
 turnCorner(){
  if(this.fallback)return Promise.resolve();
  if(!this.motion){
    this.blockAngle=(this.blockAngle||0)+Math.PI/2;
    this.actor.root.position.copy(this.streetPoint(-1.65,2.2));
    this.actor.root.rotation.y=(this.blockAngle||0)+0.59;
    this.justTurned=true;
    this.resize();
    return Promise.resolve();
  }
  this.corner={
    from:this.blockAngle||0,
    start:performance.now(),
    duration:2600
  };
  return new Promise(resolve=>this.corner.resolve=resolve);
 }
 setLanguage(lang){this.lang=lang;}
 setSkin(color){this.skinColor=color??null;if(this.actor&&color!=null)this.actor.clothes.color.set(color);}
 setBeauty(rank){if(this.fallback||!this.renderer)return;this.beauty=rank;const r=Math.max(0,Math.min(5,rank));this.scene.fog.density=.026-r*.0035;if(this.ground)this.ground.material.color.lerp(new T.Color(r>=3?0x9fcf9a:0xaabca3),.5);if(this.dayRatio!=null)this.setDaylight(this.dayRatio*200,200);const sky=document.querySelector('.sky-backdrop');if(sky)sky.style.filter=`saturate(${.55+r*.18}) brightness(${.94+r*.03})`;}
 setOffer(offer){if(this.fallback)return;if(this.neighborhood)this.neighborhood.position.set(0,0,0);if(this.hideTile){this.hideTile.visible=true;this.hideTile=null;}if(this.travelResolve){this.travelResolve();this.travelResolve=null;}if(this.plot)dispose(this.plot);if(this.incoming)dispose(this.incoming);this.incoming=null;this.plot=makePlot(offer,this.lang);this.plot.rotation.y=this.blockAngle||0;this.scene.add(this.plot);this.travelTime=null;this.drag=0;this.justTurned=false;this.actor.root.position.copy(this.streetPoint(-1.65,2.2));this.resize();}
 travel(offer,duration=850){if(this.fallback)return Promise.resolve();if(this.incoming)dispose(this.incoming);this.incoming=makePlot(offer,this.lang);this.incoming.rotation.y=this.blockAngle||0;this.justTurned=false;this.incoming.position.copy(this.streetPoint(18,0));this.incoming.scale.set(1,1,1);this.incoming.visible=true;this.scene.add(this.incoming);this.travelTime=0;this.travelStarted=performance.now();this.duration=this.motion?duration/this.speed:80;this.drag=0;return new Promise(r=>{this.travelResolve=r;});}
 setDrag(n){this.drag=n;}
 updateStyle(s){
  if(this.fallback)return;const o=getOutfit(s.equipped);if(this.heroIdentity)this.heroIdentity.visible=o.kind!=='royal'&&o.kind!=='gold';this.actor.clothes.color.set(o.color);this.actor.trousers.color.set(['suit','gold','cyber','royal'].includes(o.kind)?o.color:0xf0f4f0);this.actor.dress.children.slice().forEach(dispose);const d=this.actor.dress;
  const effects=(s.assets||[]).map(id=>getAsset(id)?.effect).filter(Boolean);const wealth=classIndex(s);if(wealth>=2)effects.push('silver');if(wealth>=3)effects.push('gold','petals');if(wealth>=4)effects.push('welcome4','diamond');if(wealth>=5)effects.push('welcome8','royal','cosmic');if(s.equipped==='plain'){this.actor.clothes.color.set([0x46796e,0x789887,0x577b71,0x365c55,0xdcd5bd,0xe9dcc0][wealth]);this.actor.trousers.color.set(wealth>=3?0x53645d:0x9fa79d);}this.effects=effects;
  if(this.skinColor!=null&&s.equipped==='plain')this.actor.clothes.color.set(this.skinColor);
  {const r=wealth,acc=d;if(r>=1){const strap=box(acc,.03,.05,.07,0x6d6f73,-.31,.86,.05);}if(r>=2){const tie=mesh(acc,new T.ConeGeometry(.04,.2,4),0x2f4f6f,0,1.13,.21);tie.rotation.z=Math.PI;}
   if(r>=3){const chain=torus(acc,.17,.014,mat(0xe3bd57,{metalness:.9,roughness:.25}),0,1.3,.05);chain.rotation.x=Math.PI/2.3;const watch=box(acc,.06,.06,.08,mat(0xe3bd57,{metalness:.9,roughness:.2}),-.31,.86,.05);}
   if(r>=4){const hat=cyl(acc,.2,.2,.16,0x1f2328,0,1.98,0,18);cyl(acc,.33,.33,.02,0x1f2328,0,1.9,0,24);cyl(acc,.205,.205,.035,0xc9a24a,0,1.92,0,18);}
   if(r>=5){this.crown(acc,0,2.1,0,.32);const cape=box(acc,.5,.72,.03,0x7a1022,0,1.0,-.2);}}
  if(o.kind!=='plain'){
   for(const x of [-.287,.287]){const sleeve=cyl(d,.095,.083,.21,new T.Color(o.color),x,1.19,0,12);sleeve.rotation.z=x<0?-.15:.15;}
   if(['suit','gold','royal'].includes(o.kind)){
     box(d,.21,.28,.017,0xf1e9da,0,1.16,.194);
     const tie=mesh(d,new T.ConeGeometry(.045,.21,4),o.kind==='royal'?0x9b111e:0x456074,0,1.13,.215);
     tie.rotation.z=Math.PI;
     for(const y of [1,.88])sphere(d,.014,new T.Color(o.trim),.065,y,.204);
   }
   if(o.kind==='hoodie'){const hood=torus(d,.31,.06,new T.Color(o.color),0,1.5,-.067);hood.rotation.x=.3;}
   if(o.kind==='cyber'){
     for(const y of [.9,1.02,1.14])box(d,.32,.025,.03,mat(0x9fffe6,{emissive:0x2bb599,emissiveIntensity:.5}),0,y,.19);
     // Cyber holographic visor
     const visor=box(d,.32,.07,.04,mat(0x00f3ff,{emissive:0x00f3ff,emissiveIntensity:.9,transparent:true,opacity:.85}),0,1.68,.21);
     // Cyber shoulder energy pauldrons
     for(const x of [-.32,.32])box(d,.11,.05,.16,mat(0x182030,{metalness:.8,emissive:0x00f3ff,emissiveIntensity:.4}),x,1.36,0);
   }
   if(o.kind==='royal'){
     // Sovereign imperial flowing velvet cape with gold trim
     const cape=mesh(d,new T.PlaneGeometry(.54,.96),mat(0x800020,{roughness:.35,side:T.DoubleSide}),0,.84,-.22);
     cape.rotation.x=.12;
     box(d,.56,.05,.05,mat(0xd4af37,{metalness:.7,roughness:.2}),0,1.33,-.2);
     // Floating golden imperial halo
     const halo=torus(d,.28,.022,mat(0xf5d184,{emissive:0xd4af37,emissiveIntensity:.7}),0,2.36,0);
     halo.rotation.x=Math.PI/2;
   }
   if(o.kind==='gold'){
     // Golden age sparkling shoulder pads
     for(const x of [-.3,.3])sphere(d,.09,mat(0xffd700,{metalness:.9,roughness:.1,emissive:0xb7791f,emissiveIntensity:.3}),x,1.34,0);
   }
  }
  const hasCrown=['royal','gold'].includes(o.kind)||effects.some(x=>['royal','sovereign'].includes(x));
  if(hasCrown)this.crown(d,0,2.02,0,.68);
  this.trail=[];this.trailClock=0;const old=this.cosmetics;this.cosmetics=new T.Group();this.scene.add(this.cosmetics);dispose(old);this.followers=[];
  const count=effects.some(x=>['welcome8','sovereign'].includes(x))?6:effects.includes('welcome4')?4:effects.includes('welcome2')?2:0;
  for(let i=0;i<count;i++){const npc=avatar(.66);npc.clothes.color.set(0x2d3748);npc.trousers.color.set(0x1a202c);npc.root.position.set(-3.1+Math.floor(i/2)*1.2,.065,i%2?1.46:3.02);npc.root.rotation.y=this.actor.root.rotation.y;this.cosmetics.add(npc.root);this.followers.push(npc);}
  this.actor.root.position.y=count>=4?.09:0;this.trailFloor=count>=4?.25:.18;
  const style=effects.includes('cosmic')||effects.includes('sovereign')?0xc4b1f2:effects.includes('aqua')?0x8ef1eb:0xefc573;
  const isPetal=effects.includes('petals'),hasTrail=effects.some(e=>['gold','silver','glass','cosmic','sovereign','prism'].includes(e));
  if(hasTrail||isPetal)for(let i=0;i<20;i++){const p=mesh(this.cosmetics,isPetal?new T.PlaneGeometry(.09,.16):new T.CircleGeometry(.069,8),new T.MeshBasicMaterial({color:isPetal?(i%2?0xf3b4c7:0xffdec0):style,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}),0,.22,0);p.rotation.x=-Math.PI/2;p.visible=false;p.userData.petal=isPetal;this.trail.push(p);}
  if(this.actorAuras){dispose(this.actorAuras);this.actor.root.remove(this.actorAuras);}
  this.actorAuras=new T.Group();this.actor.root.add(this.actorAuras);this.orbitingCrystals=[];
  if(effects.length){
    const r=torus(this.actorAuras,.64,.028,style,0,.08,0);r.rotation.x=Math.PI/2;r.userData.spin=.7;
    const numCrystals=Math.min(effects.length*3,18);
    for(let i=0;i<numCrystals;i++){
      const a=mesh(this.actorAuras,new T.OctahedronGeometry(.052),mat(style,{metalness:.5,roughness:.2,emissive:style,emissiveIntensity:.18}),0,1.3,0);
      a.userData.orbit={phase:i*(Math.PI*2/numCrystals),radius:.68+(i%3)*.08,height:1.2+(i%4)*.22,speed:.85+(i%2)*.25};
      a.userData.spin=1.2;
      if(effects.includes('prism'))a.userData.isPrism=true;
      this.orbitingCrystals.push(a);
    }
  }
 }
 crown(parent,x,y,z,scale=1){const g=new T.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(scale);cyl(g,.37,.33,.13,mat(0xe6c46d,{metalness:.5,roughness:.3}),0,0,0,20);for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh(g,new T.ConeGeometry(.075,.25,4),0xf5d184,Math.cos(a)*.3,.15,Math.sin(a)*.3);}g.userData.float=y;return g;}
 celebrate(){this.hop=1;this.lossPose=0;}
 fail(){this.lossPose=1;}
 quality(low){if(!this.renderer)return;this.renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:(window.__vdesk?1.2:1.5)));this.renderer.shadowMap.enabled=!low;this.resize();}
 inspect(a){this.setOffer({type:'asset',asset:a.id});}
 loop(now){requestAnimationFrame(this.loop);const rawDt=(now-this.last)/1000,dt=Math.min(rawDt,.05);this.last=now;if(document.hidden)return;
  if(this.corner){
    const c=this.corner,p=Math.min(1,(now-c.start)/c.duration);
    const ease=p*p*(3-2*p);
    const tP=ease,it=1-tP;
    // Smooth cubic Bezier sidewalk corner trajectory from (-1.65, 2.2) to (2.2, 1.65)
    const p0x=-1.65, p0z=2.2;
    const p1x=0.55,  p1z=2.2;
    const p2x=2.2,   p2z=2.2;
    const p3x=2.2,   p3z=1.65;
    const bx=it*it*it*p0x + 3*it*it*tP*p1x + 3*it*tP*tP*p2x + tP*tP*tP*p3x;
    const bz=it*it*it*p0z + 3*it*it*tP*p1z + 3*it*tP*tP*p2z + tP*tP*tP*p3z;
    const vx=3*it*it*(p1x-p0x) + 6*it*tP*(p2x-p1x) + 3*tP*tP*(p3x-p2x);
    const vz=3*it*it*(p1z-p0z) + 6*it*tP*(p2z-p1z) + 3*tP*tP*(p3z-p2z);
    const tangentAngle=Math.atan2(Math.max(0.001,vx), -vz);
    this.actor.root.position.copy(this.streetPoint(bx,bz,c.from));
    // Smoothly blend from tangent curve heading to the target block resting angle without snapping
    const newBlockHeading=(c.from+Math.PI/2)+0.59;
    const walkHeading=c.from+tangentAngle;
    const settle=Math.max(0,(p-0.65)/0.35);
    const settleEase=settle*settle*(3-2*settle);
    this.cornerFacing=T.MathUtils.lerp(walkHeading, newBlockHeading, settleEase);
    this.blockAngle=c.from+(Math.PI/2)*ease;
    this.cameraOrbit=Math.sin(Math.PI*p)*1.05;this.cornerZoom=Math.sin(Math.PI*p)*.28;
    this.resize(true);
    if(p===1){
      const resolve=c.resolve;
      this.corner=null;this.cameraOrbit=0;this.cornerZoom=0;
      this.justTurned=true;
      this.blockAngle=c.from+Math.PI/2;
      this.actor.root.position.copy(this.streetPoint(-1.65,2.2));
      this.actor.root.rotation.y=(this.blockAngle||0)+0.59;
      this.resize(true);
      resolve?.();
    }
  }
  if(this.restStage){if(!this.sceneSuspended)animateRest(this.restStage,dt,this.motion);this.renderer.render(this.restStage.scene,this.restStage.camera);return;}if(this.paused&&!this.titleMode){this.renderer.render(this.scene,this.camera);return;}this.time+=dt;const t=this.time;let walking=false;
  if(this.travelTime!==null){
    this.travelTime=now-this.travelStarted;
    const p=Math.min(1,this.travelTime/this.duration),e=p*p*(3-2*p);
    /* v10: the street stays still — old buildings sink, new ones rise in place (no whole-screen slide) */
    /* v11: the scenery travels past the hero (camera fixed): old block slides out, next block slides in, neighbourhood scrolls */
    const D=18,sh=-D*e;
    this.plot.scale.set(1,1,1);this.plot.visible=true;this.plot.position.copy(this.streetPoint(sh,0));
    this.incoming.scale.set(1,1,1);this.incoming.visible=true;this.incoming.position.copy(this.streetPoint(D+sh,0));
    if(this.neighborhood){this.neighborhood.position.copy(this.streetPoint(sh,0));if(!this.hideTile&&this.hoodTiles){const target=this.streetPoint(D,0);this.hideTile=this.hoodTiles.find(o=>Math.abs(o.position.x-target.x)<1&&Math.abs(o.position.z-target.z)<1);if(this.hideTile)this.hideTile.visible=false;}}
    this.actor.root.position.copy(this.streetPoint(-1.65+Math.sin(p*Math.PI)*0.35,2.2));
    this.castShift=sh; /* R9: pedestrians are part of the street — they slide past with the scenery instead of travelling with the hero */
    walking=true;
    if(p>=1){
      this.castShift=0;for(const q of this.streetActors||[])if(q.kind==='npc'){q.base=[wrapX(q.base[0]-D),q.base[1]];q.lastShift=0;q.a.root.position.x=wrapX(q.a.root.position.x);}
      dispose(this.plot);
      this.plot=this.incoming;
      this.incoming=null;
      this.plot.position.set(0,0,0);this.plot.scale.set(1,1,1);this.plot.visible=true;
      if(this.neighborhood)this.neighborhood.position.set(0,0,0);if(this.hideTile){this.hideTile.visible=true;this.hideTile=null;}
      this.travelTime=null;
      this.travelResolve?.();
      this.travelResolve=null;
      this.resize(true);
    }
  }
  else if(this.corner||this.justTurned){walking=!!this.corner;}
  else if(this.plot){this.plot.position.set(0,0,0);this.actor.root.position.copy(this.streetPoint(-1.65+this.drag*.36,2.2));walking=Math.abs(this.drag)>.03;}
  this.heroMarker.position.x=this.actor.root.position.x;this.heroMarker.position.z=this.actor.root.position.z;
  this.actor.root.rotation.y=T.MathUtils.lerp(this.actor.root.rotation.y,this.corner?this.cornerFacing:(this.blockAngle||0)+(walking?1.57:.59),.12);
  for(let i=0;i<4;i++)this.actor.limbs[i].rotation.x=this.motion?(walking?Math.sin(t*12+(i%2?Math.PI:0)+(i<2?Math.PI:0))*.64:Math.sin(t*1.7+i)*.045):0;
  this.hop=Math.max(0,this.hop-dt*1.15);this.lossPose=Math.max(0,this.lossPose-dt*.48);
  this.actor.body.position.y=this.motion?(walking?Math.abs(Math.sin(t*12))*.048:Math.sin(t*2)*.018)+Math.sin(this.hop*Math.PI)*.5:0;
  this.actor.body.rotation.z=this.motion?Math.sin(this.lossPose*Math.PI)*-.13:0;this.actor.head.rotation.x=this.motion?Math.sin(this.lossPose*Math.PI)*.3:0;
  if(this.hop>.1){this.actor.limbs[0].rotation.z=-Math.sin(this.hop*Math.PI)*1.8;this.actor.limbs[1].rotation.z=Math.sin(this.hop*Math.PI)*1.8;}else{this.actor.limbs[0].rotation.z=0;this.actor.limbs[1].rotation.z=0;}
  if(this.motion){
   if(walking&&this.trail?.length){
     this.trailClock+=dt;
     if(this.trailClock>.08){
       this.trailClock=0;
       const p=this.trail.find(p=>!p.visible)||this.trail[0];
       p.visible=true;
       p.userData.life=1.6;
       p.position.copy(this.actor.root.position);
       p.position.y=p.userData.petal?(this.actor.root.position.y+1.25):this.trailFloor;
       p.position.x+=(Math.random()-.5)*.35;
       p.position.z+=(Math.random()-.5)*.35;
       const facing=this.actor.root.rotation.y;
       p.userData.vx=-Math.sin(facing)*.7;
       p.userData.vz=-Math.cos(facing)*.7;
     }
   }
   for(const p of this.trail||[]){
     if(!p.visible)continue;
     p.userData.life-=dt;
     p.position.x+=(p.userData.vx||-.7)*dt;
     p.position.z+=(p.userData.vz||0)*dt;
     if(p.userData.petal){p.position.y-=dt*.48;p.rotation.z+=dt*.9;}
     p.material.opacity=Math.max(0,p.userData.life/1.6)*.8;
     if(p.userData.life<=0)p.visible=false;
   }
   for(const root of [this.plot,this.incoming,this.cosmetics,this.sky])root?.traverse(o=>{
    const u=o.userData;if(u.projectPerson)animatePerson(u.projectPerson,t,this.motion);if(u.float!==undefined)o.position.y=u.float+Math.sin(t*1.65+o.id)*.075;
    if(u.march){const ph=t*.45+u.march.phase;o.position.x=u.march.base+Math.sin(ph)*u.march.range;o.rotation.y=Math.cos(ph)>0?0:Math.PI;}if(u.blink!==undefined&&o.material?.color)o.material.color.setHex(((Math.floor(t*4)+u.blink)%3)?0xfff2a8:0xff8a3c);if(u.spin)o.rotation.y+=dt*u.spin;if(u.windmill)o.rotation.z+=dt*.38;if(u.clockHand)o.rotation.z-=dt*.6;if(u.cloudBase!==undefined)o.position.x=((u.cloudBase+t*.45+40)%80)-40;
    if(u.followAvatar){o.position.x=this.actor.root.position.x;o.position.z=this.actor.root.position.z;if(u.baseY!==undefined)o.position.y=u.baseY+(this.actor.body.position.y||0);}
    if(u.orbit){o.position.x=this.actor.root.position.x+Math.cos(t*.7+u.orbit.phase)*u.orbit.radius;o.position.z=this.actor.root.position.z+Math.sin(t*.7+u.orbit.phase)*u.orbit.radius;if(u.baseY!==undefined)o.position.y=u.baseY+(this.actor.body.position.y||0);}
    if(u.drive)o.position.x=u.drive.baseX+Math.sin(t*.23)*u.drive.span;
    if(u.steam){o.position.y=u.steam.base+(Math.sin(t*1.8+u.steam.phase)+1)*.12;o.material.opacity=.23+(Math.sin(t*1.8+u.steam.phase)+1)*.1;}
    if(u.streetWalker){const n=u.avatar;o.position.x=u.streetWalker.start+Math.sin(t*.24+u.streetWalker.phase)*.32;for(let i=0;i<4;i++)n.limbs[i].rotation.x=Math.sin(t*3.2+(i%2?Math.PI:0)+(i<2?Math.PI:0))*.16;}
   });
   this.followers.forEach((a,i)=>{
     const followAngle=this.actor.root.rotation.y+Math.PI;
     const row=Math.floor(i/2)+1;
     const side=(i%2===0?-1:1)*.75;
     const perpAngle=this.actor.root.rotation.y+Math.PI/2;
     const targetX=this.actor.root.position.x+Math.sin(followAngle)*(row*1.1)+Math.sin(perpAngle)*side;
     const targetZ=this.actor.root.position.z+Math.cos(followAngle)*(row*1.1)+Math.cos(perpAngle)*side;
     a.root.position.x=T.MathUtils.lerp(a.root.position.x,targetX,0.25);
     a.root.position.z=T.MathUtils.lerp(a.root.position.z,targetZ,0.25);
     a.root.rotation.y=this.actor.root.rotation.y;
     if(walking){
       a.limbs[0].rotation.x=Math.sin(t*12+i)*.55;
       a.limbs[1].rotation.x=-Math.sin(t*12+i)*.55;
       a.limbs[2].rotation.x=-Math.sin(t*12+i)*.6;
       a.limbs[3].rotation.x=Math.sin(t*12+i)*.6;
       a.body.position.y=Math.abs(Math.sin(t*12+i))*.04;
     }else{
       a.limbs[0].rotation.x=0;a.limbs[0].rotation.z=-.18;
       a.limbs[1].rotation.x=0;a.limbs[1].rotation.z=.18;
       a.limbs[2].rotation.x=0;a.limbs[3].rotation.x=0;
       a.body.position.y=0;
     }
   });
   if(this.actorAuras){
     this.actorAuras.rotation.y+=dt*0.75;
   }
   for(const cry of this.orbitingCrystals||[]){
     const u=cry.userData;
     if(!u?.orbit)continue;
     cry.position.set(
       Math.cos(t*u.orbit.speed+u.orbit.phase)*u.orbit.radius,
       u.orbit.height+Math.sin(t*2.2+u.orbit.phase)*.14,
       Math.sin(t*u.orbit.speed+u.orbit.phase)*u.orbit.radius
     );
     cry.rotation.y+=dt*2.6;
     cry.rotation.x+=dt*1.6;
     if(u.isPrism)cry.material.color.setHSL((t*.25+u.orbit.phase*.2)%1,.85,.65);
   }
  }
  for(const root of [this.plot,this.incoming])root?.traverse(o=>{if(o.userData.billboard){const q=this.billboardParentQ??=new T.Quaternion();o.parent.getWorldQuaternion(q);o.quaternion.copy(q.invert()).multiply(this.camera.quaternion);}});
  if(this.plot){const p=new T.Vector3(.4,3.2,-.1);p.applyMatrix4(this.plot.matrixWorld);p.project(this.camera);const rect=this.container.getBoundingClientRect();this.onProjectPosition(rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2);}
  this.updateStreetCast(t,dt);this.renderer.render(this.scene,this.camera);this.fps=1/Math.max(rawDt,.001);
  const p=this.actor.root.position.clone();p.y+=3.05;p.project(this.camera);const rect=this.container.getBoundingClientRect();this.onHeroPosition(rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2);
 }
}
