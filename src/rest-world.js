import * as T from 'three';
import {person,setPose,animatePerson,shape,cube,ball,tube,joint,mug,book,plant,chair,material,disposeGroup} from './people.js';
const LOOKS=[
 {floor:0xb4b39f,sky:0xcadbd7,shirt:0x528477,pants:0x596860,pose:'drink'},
 {floor:0xc2b8a1,sky:0xd8e1d1,shirt:0x7e9a88,pants:0x657269,pose:'read'},
 {floor:0xc5b28c,sky:0xc1dedd,shirt:0xd4c297,pants:0x708b81,pose:'lounge'},
 {floor:0xdcd9c7,sky:0xc6dbe0,shirt:0xe5e4d5,pants:0xb4c6b9,pose:'massage'},
 {floor:0xba9e76,sky:0xb1d6e0,shirt:0xe6ddc4,pants:0xa79d82,pose:'toast'},
 {floor:0xe5dfcc,sky:0xdcd8c3,shirt:0xece4cf,pants:0xc4b57e,pose:'lounge'}
];
function parasol(g,x,z,luxury=false){const q=joint(g,x,0,z);tube(q,.035,2.8,0xbca67e,0,1.4,0);const canopy=shape(q,new T.ConeGeometry(1.45,.42,10),luxury?0xe8dfc7:0x99b3a0,0,2.83,0);canopy.rotation.y=.3;return q;}
function pool(g,x,z,w,d){cube(g,w+.3,.13,d+.3,0xe9e1c9,x,.065,z);const water=cube(g,w,.04,d,material(0x80bfc2,{metalness:.2,roughness:.28}),x,.145,z);water.userData.water=true;return water;}
function palm(g,x,z,h=3){const q=joint(g,x,0,z);tube(q,.085,h,0xab9168,0,h/2,0,.13);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=ball(q,.7,0x7b9e80,Math.cos(a)*.5,h+Math.sin(i)*.07,Math.sin(a)*.5);leaf.scale.set(.4,.1,1.7);leaf.rotation.y=-a;leaf.rotation.z=.15;}return q;}
function staff(g,x,z,role='butler'){const p=person({color:role==='therapist'?0xc6d9c8:0x506d67,pants:0x5b6c62,scale:.9});p.root.position.set(x,.03,z);p.root.rotation.y=-.45;setPose(p,role==='therapist'?'work':'stand');g.add(p.root);if(role==='butler'){p.arms[0].root.rotation.x=-1.1;p.arms[0].elbow.rotation.x=-.7;const tray=tube(p.body,.3,.025,0xc5b374,-.25,.99,.42);mug(p.body,-.25,1.01,.42,0xf4e8cf);}return p;}
function skyDecor(scene,level){
 const sun=ball(scene,.72,material(level>=4?0xf7dda2:0xf4e9c2,{emissive:0xf3dcab,emissiveIntensity:.4}),-6,6,-15);sun.castShadow=false;
 for(let j=0;j<5;j++){const g=joint(scene,-10+j*5.2,4.0+(j%2)*1.4,-13);for(let i=0;i<4;i++){const cloud=ball(g,.62+i%2*.17,0xf2f2e5,i*.58,Math.sin(i)*.12,0);cloud.scale.set(1.25,.44,.55);cloud.castShadow=false;}g.userData.cloudX=g.position.x;}
 if(level>=2){cube(scene,100,.09,70,material(0x92c7c7,{roughness:.38}),0,-.28,-30);for(let i=0;i<18;i++)cube(scene,1.5+(i%3),.018,.04,0xc7ded5,-16+i*2,-.218,-6-(i%4)*3);}
 else for(let i=0;i<10;i++){const h=1.6+i%3*.55;cube(scene,1.8,h,1.6,[0xadb9b0,0xc2c2ae,0xb7b5a4][i%3],-13+i*2.9,h/2-.2,-11-i%2);cube(scene,1.95,.08,1.75,0x8b9b8d,-13+i*2.9,h-.16,-11-i%2);}
}
export function buildRestScene(level=0){
 const theme=LOOKS[level],scene=new T.Scene();scene.background=new T.Color(theme.sky);scene.fog=new T.Fog(theme.sky,18,62);scene.add(new T.HemisphereLight(0xfaf5dc,0x809684,2.2));const sun=new T.DirectionalLight(0xffeed1,3.4);sun.position.set(-4,8,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.normalBias=.04;sun.shadow.bias=-.0001;scene.add(sun);const fill=new T.DirectionalLight(0xc6dfed,1.1);fill.position.set(5,4,-5);scene.add(fill);
 const deck=joint(scene,0,0,0);cube(deck,level>=4?17:12,.2,10,theme.floor,0,-.15,-1.5);for(let i=-5;i<=5;i++)cube(deck,.022,.008,8,level>=3?0xc5c2ae:0xa3977f,i,.0,-1.4);
 const p=person({color:theme.shirt,pants:theme.pants,hero:true,scale:1.16,hair:0x817a62});scene.add(p.root);p.root.rotation.y=.12;p.root.position.y=.025;setPose(p,theme.pose);
 const seat=chair(scene,0,0,{luxury:level>=2,recline:level>=2});const props=joint(scene,0,0,0);const guests=[];
 // Grounded belongings, recognizable routines and progressively richer spaces.
 if(level===0){
  cube(props,1.9,.09,.13,0x927854,0,.95,-.47);cube(props,1.9,.09,.13,0xa0865f,0,1.1,-.47);cube(props,.66,.59,.57,0xa78b65,1.15,.29,.15);mug(props,1.15,.61,.15,0xc1b089);cube(props,.33,.1,.24,0xdac49a,1.12,.65,-.04);
  const bag=ball(props,.28,0x718876,-.91,.25,.15);bag.scale.set(.65,.9,.6);const handle=shape(props,new T.TorusGeometry(.11,.025,8,18),0x4c6b5e,-.91,.52,.15);handle.scale.y=.75;
  plant(props,-1.7,-.6,.85);cube(props,6,.45,.22,0x9da797,0,.22,-2.5);cube(props,6,.08,.4,0xb5bfa8,0,.48,-2.5);
 }else if(level===1){
  cube(props,1,.13,.7,0xae9168,1.3,.57,.2);for(const x of [.91,1.7])cube(props,.07,.57,.07,0x7c826b,x,.285,.2);mug(props,1.28,.65,.28);book(props,1.48,.67,.0);plant(props,-1.6,-.8,1.2);plant(props,2.3,-1,1);
  cube(props,7,.85,.25,0xb0ad99,0,.42,-2.4);for(let x=-3;x<=3;x+=.7)cube(props,.035,.65,.035,0x7b8e80,x,1.13,-2.4);cube(props,7,.035,.04,0x7b8e80,0,1.46,-2.4);
  const fan=joint(props,-1.17,.55,.05);tube(fan,.12,.06,0x87978a);tube(fan,.025,.3,0x8fa08d,0,.18,0);const cage=shape(fan,new T.TorusGeometry(.22,.025,8,28),0xb6c2ad,0,.48,0);const rotor=joint(fan,0,.48,.0);for(let i=0;i<3;i++){const blade=ball(rotor,.14,0xa7b6a4,Math.cos(i*2.1)*.08,Math.sin(i*2.1)*.08,.01);blade.scale.set(1,.3,.15);blade.rotation.z=i*2.1;}rotor.userData.rotor=true;
 }else if(level===2){
  parasol(props,-1.2,-.65);plant(props,2,-.9,1.2);tube(props,.45,.52,0xb79c74,1.3,.26,.5);mug(props,1.25,.53,.5,0xf1dab0);book(props,1.5,.54,.33);cube(props,.55,.055,1.1,0x9dad94,0,.69,.68);palm(props,-3,-3,3);palm(props,3.8,-4,3.7);
  for(let i=0;i<3;i++){const b=ball(props,.22,[0xc2b9a1,0xa5bdaf,0xdccaaa][i],-2+i*.4,.18,1.8);b.scale.y=.6;}
 }else if(level===3){
  pool(props,2.6,-2.3,4.5,2.3);cube(props,.7,.58,.7,0xd1c8ac,1.3,.29,.6);for(let i=0;i<3;i++){const towel=tube(props,.095,.43,0xefebdd,1.17+i*.14,.63,.5);towel.rotation.z=Math.PI/2;}mug(props,1.48,.6,.78,0xb8c7b3);plant(props,-1.8,-.7,1.8);parasol(props,2.6,-1.5,true);guests.push(staff(props,0,-.9,'therapist'));
  for(const x of [-3.3,4.3]){cube(props,.3,3.5,.3,0xe7dfc7,x,1.75,-3);cube(props,.3,3.5,.3,0xe7dfc7,x,1.75,1.6);}cube(props,8,.14,4.8,0xeae3ce,.5,3.6,-.7);
 }else if(level===4){
  for(let x=-4;x<=4;x+=.8){tube(props,.03,1.2,0xc1c4b4,x,.6,-2.4);cube(props,.76,.82,.026,material(0xc6e0dc,{transparent:true,opacity:.32,depthWrite:false}),x,.63,-2.4);}cube(props,9,.06,.08,0xd1cdb7,0,1.22,-2.4);
  tube(props,.47,.66,0xe5dfca,1.4,.33,.5);tube(props,.55,.05,0xf0e9d6,1.4,.68,.5);mug(props,1.37,.72,.4,0xd6b777);for(let i=0;i<5;i++)ball(props,.07,[0xd5ad6b,0xaba06e][i%2],1.35+i*.045,.76,.65);guests.push(staff(props,2.55,-.3));
  cube(props,4,1.8,1.3,0xe6e4d5,-2.9,.9,-3.2);cube(props,3.7,.6,.07,material(0x8db8bf,{metalness:.25,roughness:.3}),-2.9,1.35,-2.53);palm(props,5.2,-4.5,3.3);
 }else{
  pool(props,0,-3.9,11,3.0);for(const x of [-4.1,4.1]){for(const z of [-3.4,1.6]){tube(props,.18,3.8,0xefe6ce,x,1.9,z,.22);tube(props,.30,.12,0xd5c092,x,3.75,z);tube(props,.30,.12,0xd5c092,x,.07,z);}}cube(props,8.9,.22,5.7,0xf0e6cb,0,3.93,-.8);
  tube(props,.57,.60,0xc4ae75,1.45,.3,.55);tube(props,.64,.04,0xf0e9d4,1.45,.62,.55);mug(props,1.4,.67,.5,0xcbb16c);const sculpture=shape(props,new T.TorusKnotGeometry(.42,.095,64,9),material(0xc6b16c,{metalness:.55,roughness:.33}),-2.2,1.15,-.5);tube(props,.4,.6,0xe4d9ba,-2.2,.3,-.5);plant(props,-3,1,1.5);plant(props,3.5,-2,1.6);guests.push(staff(props,2.8,-.6),staff(props,-2.8,-1.8));
  const yacht=joint(scene,-3,-.04,-9);cube(yacht,3.8,.37,1.1,0xf3ecd6);cube(yacht,1.8,.65,.85,0xd8ddd1,.15,.48,0);cube(yacht,1.5,.28,.87,0x8baeb3,.15,.72,0);
 }
 skyDecor(scene,level);
 const sceneData={scene,p,seat,props,guests,level,theme,pose:theme.pose,camera:new T.OrthographicCamera(-5,5,4,-4,.1,90),angle:0,time:0};return sceneData;
}
export function setRestPose(stage,pose){if(!pose)pose=stage.theme.pose;if(stage.pose===pose)return;stage.pose=pose;setPose(stage.p,pose);stage.seat.visible=pose!=='stretch'&&pose!=='dance';}
export function resizeRest(stage,w,h,angle=0){const c=stage.camera,small=w<900,frustum=small?6.1:5.8;
 c.left=-frustum*w/h/2;c.right=frustum*w/h/2;c.top=frustum/2;c.bottom=-frustum/2;
 const points=[[3.2,2.6,6.2],[6,3.3,5.5],[-3,2.5,6.4]];const pos=points[angle%3];c.position.set(...pos);c.lookAt(0,.9,.0);if(angle===1){c.left*=1.2;c.right*=1.2;c.top*=1.2;c.bottom*=1.2;}
 c.updateProjectionMatrix();c.updateMatrixWorld(true);const anchor=new T.Vector3(0,1.2,.15).project(c),currX=(anchor.x+1)*w/2,currY=(1-anchor.y)*h/2;const desiredX=small?w*.42:w*.42,desiredY=small?h*.57:h*.56;
 const up=new T.Vector3(0,1,0).applyQuaternion(c.quaternion),right=new T.Vector3(1,0,0).applyQuaternion(c.quaternion);const span=c.top-c.bottom;c.position.addScaledVector(up,-(currY-desiredY)/h*span);c.position.addScaledVector(right,(currX-desiredX)/w*(span*w/h));c.updateMatrixWorld(true);stage.angle=angle;
}
export function animateRest(stage,dt,motion){stage.time+=dt;animatePerson(stage.p,stage.time,motion);for(const p of stage.guests)animatePerson(p,stage.time,motion);if(!motion)return;stage.scene.traverse(o=>{if(o.userData.rotor)o.rotation.z+=dt*3;if(o.userData.cloudX!==undefined)o.position.x=o.userData.cloudX+Math.sin(stage.time*.05+o.id)*.45;if(o.userData.water)o.position.y=.145+Math.sin(stage.time*.65)*.012;});}
export function activityMiniature(pose,level=0){const root=new T.Group(),p=person({hero:true,color:LOOKS[level].shirt,pants:LOOKS[level].pants,scale:1});root.add(p.root);setPose(p,pose);if(['drink','read','lounge','sleep','massage','toast','sit'].includes(pose))chair(root,0,0,{luxury:level>=2,recline:['lounge','sleep'].includes(pose)});cube(root,3,.1,2.8,LOOKS[level].floor,0,-.075,0);return root;}
export function disposeRest(stage){disposeGroup(stage.scene);stage.scene.clear();}
