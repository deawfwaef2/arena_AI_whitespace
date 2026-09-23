import * as T from 'three';
// Shared articulated characters and hand-built props. No image textures.
export const material=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.72,...extra});
export function shape(g,geo,c,x=0,y=0,z=0){const m=new T.Mesh(geo,c?.isMaterial?c:material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
export const cube=(g,w,h,d,c,x=0,y=0,z=0)=>shape(g,new T.BoxGeometry(w,h,d),c,x,y,z);
export const ball=(g,r,c,x=0,y=0,z=0)=>shape(g,new T.SphereGeometry(r,20,16),c,x,y,z);
export const tube=(g,r,h,c,x=0,y=0,z=0,r2=r)=>shape(g,new T.CylinderGeometry(r,r2,h,18),c,x,y,z);
export function joint(parent,x,y,z){const q=new T.Group();q.position.set(x,y,z);parent.add(q);return q;}
export function mug(g,x,y,z,color=0xede8da){const q=joint(g,x,y,z);tube(q,.115,.2,color,0,.1,0);tube(q,.09,.01,0x755944,0,.205,0);const h=shape(q,new T.TorusGeometry(.08,.025,8,20),color,.135,.11,0);h.rotation.y=Math.PI/2;return q;}
export function book(g,x=0,y=0,z=0){const q=joint(g,x,y,z);for(const s of [-1,1]){const side=joint(q,s*.12,0,0);side.rotation.z=s*.13;cube(side,.25,.035,.33,0xccab67,0,0,0);cube(side,.23,.03,.31,0xf4ecda,0,.029,0);}return q;}
export function plant(g,x,z,scale=1){const q=joint(g,x,0,z);q.scale.setScalar(scale);tube(q,.26,.38,0xc49a74,0,.19,0,.19);tube(q,.035,.9,0x72856a,0,.7,0);for(let i=0;i<7;i++){const a=i*2.4;const leaf=ball(q,.26,[0x6e9275,0x8aaa80,0x9cbb8e][i%3],Math.cos(a)*.22,.6+i*.09,Math.sin(a)*.22);leaf.scale.set(.55,1,.8);leaf.rotation.z=Math.cos(a)*.65;}return q;}
export function chair(g,x=0,z=0,{luxury=false,recline=false}={}){const q=joint(g,x,0,z),wood=luxury?0xbca267:0x9d7755,fabric=luxury?0xece6d6:0x7e9682;cube(q,1,.14,recline?1.85:.8,fabric,0,.59,recline?.18:0);const back=cube(q,1,.8,.13,fabric,0,1.01,-.39);back.rotation.x=recline?-.43:-.08;for(const a of [-.46,.46]){cube(q,.075,.62,.075,wood,a,.30,.27);cube(q,.075,.8,.075,wood,a,.4,-.34);cube(q,.09,.07,1,wood,a,.83,.02);}return q;}
export function person({color=0x497d70,pants=0x435957,skin=0xf0eee1,hair=0x6e6759,scale=1,hat=false,hero=false}={}){
 const root=new T.Group();root.scale.setScalar(scale);const body=joint(root,0,0,0),torso=joint(body,0,1.09,0);
 const coat=material(color);const shirt=shape(torso,new T.CapsuleGeometry(.245,.34,6,18),coat);shirt.scale.z=.77;
 cube(torso,.055,.27,.023,hero?0xe6bb67:0xeadbc1,0,.05,.196);tube(body,.10,.18,skin,0,1.39,0);
 const head=joint(body,0,1.72,0);const face=ball(head,.32,skin);face.scale.set(1,1.05,.91);
 for(const s of [-1,1]){ball(head,.065,skin,s*.31,-.03,0);const eye=ball(head,.029,0x284c4a,s*.105,.025,.273);eye.scale.z=.55;ball(head,.009,0xffffff,s*.105-.005,.035,.288);const brow=cube(head,.085,.018,.018,0x75847a,s*.10,.105,.268);brow.rotation.z=s*.10;const blush=ball(head,.041,0xe3bca5,s*.17,-.075,.25);blush.scale.set(1,.48,.25);}
 const smile=shape(head,new T.TorusGeometry(.052,.011,7,14,Math.PI*.7),0x698679,0,-.105,.279);smile.rotation.z=Math.PI*1.15;
 if(hat){const cap=ball(head,.327,hero?0xd5b36e:hair,0,.06,-.01);cap.scale.set(1,.67,1);cube(head,.49,.035,.25,hero?0xbd984d:hair,0,.085,.28);}else{const locks=ball(head,.315,hair,0,.15,-.065);locks.scale.set(1,.58,.83);}
 const arms=[],legs=[];
 for(const s of [-1,1]){
  const arm=joint(body,s*.32,1.28,0);shape(arm,new T.CapsuleGeometry(.078,.22,5,12),coat,0,-.17,0);const elbow=joint(arm,0,-.34,0);shape(elbow,new T.CapsuleGeometry(.065,.18,5,12),skin,0,-.14,0);ball(elbow,.079,skin,0,-.3,0);const hand=joint(elbow,0,-.29,0);arms.push({root:arm,elbow,hand});
  const hip=joint(body,s*.135,.79,0);shape(hip,new T.CapsuleGeometry(.095,.20,5,14),pants,0,-.17,0);const knee=joint(hip,0,-.34,0);shape(knee,new T.CapsuleGeometry(.083,.21,5,14),pants,0,-.17,0);const foot=ball(knee,.12,hero?0xede5ce:0x52655d,0,-.31,.055);foot.scale.set(.9,.65,1.6);legs.push({root:hip,knee});
 }
 const props=joint(body,0,0,0);const cup=mug(props,-.28,1.14,.37,hero?0xd5b76c:0xe0d9c5),pages=book(props,0,.94,.37);pages.rotation.x=.32;cup.visible=false;pages.visible=false;
 const p={root,body,torso,head,arms,legs,props,cup,pages,hero,pose:'stand',seed:Math.random()*6};setPose(p,'stand');return p;
}
export function setPose(p,pose){p.pose=pose;p.body.position.set(0,0,0);p.body.rotation.set(0,0,0);p.head.rotation.set(0,0,0);p.cup.visible=pose==='drink'||pose==='toast';p.pages.visible=pose==='read';for(const a of p.arms){a.root.rotation.set(0,0,0);a.elbow.rotation.set(0,0,0);}for(const l of p.legs){l.root.rotation.set(0,0,0);l.knee.rotation.set(0,0,0);}
 const seated=['sit','drink','read','lounge','massage','toast','sleep'].includes(pose);
 if(seated){p.body.position.y=-.20;for(const l of p.legs){l.root.rotation.x=-Math.PI/2;l.knee.rotation.x=Math.PI/2;}}
 if(pose==='drink'||pose==='toast'){p.arms[0].root.rotation.x=-.55;p.arms[0].elbow.rotation.x=-1.5;p.arms[1].root.rotation.x=-.35;p.arms[1].elbow.rotation.x=-.7;}
 if(pose==='read'){for(const a of p.arms){a.root.rotation.x=-.55;a.elbow.rotation.x=-1;}p.head.rotation.x=.17;}
 if(pose==='lounge'||pose==='sleep'){p.body.rotation.x=-.36;p.body.position.y=-.12;for(const l of p.legs){l.root.rotation.x=-1.1;l.knee.rotation.x=.22;}p.arms[0].root.rotation.z=-.4;p.arms[1].root.rotation.z=.4;p.head.rotation.x=.13;}
 if(pose==='massage'){p.head.rotation.x=.22;p.arms[0].root.rotation.x=-.55;p.arms[1].root.rotation.x=-.55;}
 if(pose==='stretch'){p.arms[0].root.rotation.z=-2.3;p.arms[1].root.rotation.z=2.3;p.arms[0].elbow.rotation.z=-.6;p.arms[1].elbow.rotation.z=.6;}
 if(pose==='wave'||pose==='pitch'){p.arms[1].root.rotation.z=pose==='wave'?2.3:1.1;p.arms[1].elbow.rotation.x=-.4;p.arms[0].root.rotation.x=-.4;}
 if(pose==='work'){p.arms[0].root.rotation.x=-1.1;p.arms[1].root.rotation.x=-1.2;p.arms[0].elbow.rotation.x=-.4;p.head.rotation.x=.14;}
 if(pose==='guitar'){p.arms[0].root.rotation.z=-.65;p.arms[0].root.rotation.x=-.65;p.arms[1].root.rotation.x=-.7;p.arms[1].elbow.rotation.x=-1.1;}
 if(pose==='dance'){p.arms[0].root.rotation.z=-1.3;p.arms[1].root.rotation.z=1.0;p.legs[0].root.rotation.z=.16;p.legs[1].root.rotation.z=-.16;}
 return p;
}
export function animatePerson(p,t,motion=true){if(!motion)return;const f=t+p.seed,pose=p.pose;p.torso.scale.y=1+Math.sin(f*1.8)*.012;
 if(['stand','pitch','wave'].includes(pose)){p.head.rotation.y=Math.sin(f*.9)*.11;if(pose!=='stand')p.arms[1].elbow.rotation.z=Math.sin(f*2.5)*.24;}
 if(pose==='drink'||pose==='toast'){const lift=(Math.sin(f*.75)+1)/2;p.cup.position.y=1.14+lift*.22;p.cup.position.z=.37-lift*.10;p.arms[0].elbow.rotation.x=-1.4-lift*.25;p.head.rotation.x=-lift*.04;}
 if(pose==='read'){p.head.rotation.y=Math.sin(f*.55)*.06;p.pages.rotation.z=Math.sin(f*.9)*.025;}
 if(pose==='sleep'||pose==='lounge')p.head.rotation.z=Math.sin(f*.8)*.035;
 if(pose==='stretch'){p.body.rotation.z=Math.sin(f*.85)*.10;p.arms[0].root.rotation.z=-2.3+Math.sin(f)*.08;}
 if(pose==='massage'){p.head.rotation.x=.22+Math.sin(f*2)*.03;}
 if(pose==='work'){p.arms[0].elbow.rotation.x=-.5+Math.sin(f*3)*.18;p.arms[1].elbow.rotation.x=-.4+Math.cos(f*3)*.16;}
 if(pose==='guitar'){p.arms[1].elbow.rotation.x=-1.1+Math.sin(f*7)*.12;p.head.rotation.z=Math.sin(f*2)*.035;}
 if(pose==='dance'){p.body.position.y=Math.abs(Math.sin(f*3))*.08;p.body.rotation.z=Math.sin(f*2)*.12;p.arms[0].root.rotation.z=-1.3+Math.sin(f*3)*.3;p.arms[1].root.rotation.z=1+Math.sin(f*3+1)*.3;}
}
export function peopleProject(kind){const root=new T.Group();const colors=[0x658d7c,0xc09d6e,0x859aac,0xb69399];const list=[];const positions=kind==='busker'?[[0,0]]:kind==='founders'?[[0,0],[-1.15,-.25]]:[[-1.05,0],[.25,-.3],[1.35,.3]];
 positions.forEach(([x,z],i)=>{const p=person({color:colors[i],scale:i===0?1.03:.92,hat:['couriers','expedition'].includes(kind),hair:0x5f6258});p.root.position.set(x,.1,z);p.root.rotation.y=-.2+i*.2;root.add(p.root);list.push(p);p.root.userData.projectPerson=p;setPose(p,kind==='busker'?'guitar':kind==='dancecrew'?'dance':['makers','researchers'].includes(kind)?'work':i===0?'pitch':'stand');});
 if(kind==='busker'){const guitar=joint(list[0].body,.04,.96,.3);guitar.rotation.z=-.4;const body=ball(guitar,.25,0xc19a58);body.scale.set(.85,1,.25);cube(guitar,.09,.62,.08,0x876849,0,.45,0);ball(guitar,.075,0x586658,0,.06,.07).scale.z=.25;for(let i=0;i<4;i++)cube(guitar,.003,.84,.005,0xe7d9b0,-.025+i*.016,.2,.073);tube(root,.025,1.25,0x576d67,.8,.625,.25);ball(root,.06,0x425953,.8,1.29,.25);cube(root,.55,.36,.3,0x5c7067,-.7,.18,.5);tube(root,.23,.08,0x997b57,.4,.05,.9);}
 if(kind==='couriers'){for(let i=0;i<3;i++){cube(root,.46,.4,.42,0xbe9d71,-1+i*.55,.2,1.0);cube(root,.06,.41,.425,0xe4c990,-1+i*.55,.205,1.0);}const bike=joint(root,1.4,0,.8);for(const x of [-.4,.4]){const wheel=shape(bike,new T.TorusGeometry(.28,.038,8,24),0x586d65,x,.3,0);cube(bike,.035,.55,.045,0xba9567,x,.6,0);}cube(bike,.8,.045,.06,0xc6a877,0,.52,0);}
 if(['makers','researchers'].includes(kind)){cube(root,2.8,.12,.85,0xb5a183,0,.92,.5);for(const x of [-1.2,1.2])cube(root,.1,.88,.65,0x728479,x,.44,.5);for(let i=0;i<4;i++){if(kind==='researchers'){tube(root,.07,.28,0x9cbbc4,-.75+i*.47,1.12,.5);ball(root,.10,[0xb5be97,0xcbaaaf][i%2],-.75+i*.47,1.06,.5);}else{cube(root,.34,.18,.31,0x88a1a0,-.7+i*.47,1.08,.5);tube(root,.035,.23,0xcdb879,-.7+i*.47,1.25,.5);}}}
 if(kind==='dancecrew'){cube(root,3.6,.07,2.4,0x8e9a93,0,.03,.15);for(const x of [-1.8,1.8]){cube(root,.45,.8,.4,0x455f60,x,.4,.15);ball(root,.135,0x93b1aa,x,.5,.37);ball(root,.11,0xb6c8aa,x,.22,.37);}}
 if(kind==='filmcrew'){const camera=joint(root,1.6,1.15,.9);cube(camera,.5,.3,.26,0x4b6468);const lens=tube(camera,.13,.3,0x718989,0,0,.23);lens.rotation.x=Math.PI/2;for(const a of [-.3,0,.3]){const leg=cube(root,.035,1.2,.035,0x6f827c,1.6+a,.6,.9+Math.abs(a));leg.rotation.z=a*.8;}cube(root,.06,.5,.8,0xdcd4b5,-1.7,1.6,1);}
 if(kind==='founders'){const board=cube(root,1.5,1.1,.08,0xecebdd,1.15,1.3,-.6);for(let i=0;i<4;i++)cube(root,.16,.18+i*.13,.02,[0x93b693,0xd9bd7d][i%2],.65+i*.32,1.03+i*.065,-.55);cube(root,.08,1.9,.08,0x8c9b89,1.15,.95,-.65);cube(root,1.2,.1,.7,0xa68c69,0,.55,.9);cube(root,.45,.05,.32,0x8ba0a4,0,.65,.9);}
 if(kind==='expedition'){for(const [x,z]of [[-1,.9],[.6,1.1]]){cube(root,.55,.4,.35,0x82957e,x,.2,z);cube(root,.42,.06,.35,0xbbaf88,x,.43,z);}const map=cube(root,.8,.02,.55,0xe1d7b3,0,.76,.7);map.rotation.x=.15;tube(root,.025,1.6,0x7d8870,1.85,.8,.1);cube(root,.35,.28,.025,0xcba774,2.02,1.5,.1);}
 return root;
}
export function disposeGroup(root){const gs=new Set(),ms=new Set(),ts=new Set();root.traverse(o=>{if(o.isLight)o.shadow?.dispose?.();if(o.geometry)gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){ms.add(m);if(m.map)ts.add(m.map);}});gs.forEach(x=>x.dispose());ts.forEach(x=>x.dispose());ms.forEach(x=>x.dispose());root.removeFromParent();}
