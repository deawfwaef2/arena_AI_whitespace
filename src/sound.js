/* R15 sound design: recorded UI clicks (Kenney CC0), tier ambience beds and street one-shots (Freesound CC0 field
   recordings). Credits: assets/sfx/SFX-CREDITS.json.
   - UI clicks are tiny and inlined (instant feedback on the very first menu tap).
   - Ambience beds (one per wealth class) and one-shots are lazy script packs in sfx-pack/ (file:// compatible).
   - Everything runs through ONE AudioContext; on iOS we ask for the 'playback' audio session so the silent switch
     does not mute it (Safari 16.4+). */
import UI_SOUNDS from '../assets/sfx/ui.json';
const packTasks=new Map();
function loadPack(id){
 const bag=window.UPSHIFT_SFX||(window.UPSHIFT_SFX={});if(bag[id])return Promise.resolve(bag[id]);if(packTasks.has(id))return packTasks.get(id);
 const t=new Promise((ok,fail)=>{const s=document.createElement('script');s.src='sfx-pack/'+id+'.js';s.async=true;s.onload=()=>{const d=window.UPSHIFT_SFX?.[id];d?ok(d):fail(Error('empty sfx pack '+id));};s.onerror=()=>{packTasks.delete(id);fail(Error('sfx pack missing '+id));};document.head.append(s);});
 packTasks.set(id,t);return t;
}
const b64=d=>{const raw=atob(d.substring(d.indexOf(',')+1));const u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);return u.buffer;};
/* one-shots per class: [id, weight, gain] — lower classes are busy streets, upper classes calmer & glossier */
const SHOTS=[
 [['car1',3,.55],['car2',3,.5],['scoot',4,.5],['horn',2,.32],['bell',2,.35]],
 [['car1',4,.55],['car2',3,.5],['scoot',2,.42],['horn',2,.3],['bell',2,.35]],
 [['car2',3,.4],['bell',3,.35],['car1',2,.38],['coins',1,.3]],
 [['car2',2,.35],['super',2,.45],['cork',2,.4],['coins',1,.3]],
 [['gull',4,.4],['super',2,.4],['cork',2,.4],['heli',1,.35]],
 [['gull',3,.35],['heli',2,.38],['cork',2,.38],['super',1,.35]]];
export class Sound{
 constructor(){this.ctx=null;this.sfxOn=true;this.ambOn=true;this.volume=.24;/*R16: user asked -70% (was .8)*/this.muted=false;this.hidden=false;this.buffers=new Map();this.tier=-1;this.bed=null;this.inStreet=false;this.duck=1;this.nextShot=0;this.lastHover=0;this.error='';
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
  setInterval(()=>this.tick(),500);}
 ensure(){if(this.ctx)return this.ctx;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;this.ctx=new C();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.uiBus=this.ctx.createGain();this.uiBus.connect(this.master);this.ambBus=this.ctx.createGain();this.ambBus.gain.value=0;this.ambBus.connect(this.master);this.apply();}catch(e){this.error=e.message;}return this.ctx;}
 /* must be called inside a user gesture */
 unlock(){const c=this.ensure();if(!c)return;if(c.state!=='running'){c.resume().catch(()=>{});try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0);}catch{}}this.decodeUI();}
 level(){return this.muted||this.hidden?0:this.volume;}
 apply(){if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.level(),t,.08);this.uiBus.gain.setTargetAtTime(this.sfxOn?1:0,t,.05);this.ambBus.gain.setTargetAtTime(this.ambOn&&this.inStreet?.9*this.duck:0,t,.6);}
 setSfx(on){this.sfxOn=!!on;this.apply();}
 setAmbience(on){this.ambOn=!!on;this.apply();}
 setMuted(v){this.muted=!!v;this.apply();}
 setHidden(v){this.hidden=!!v;this.apply();if(this.ctx){if(v)this.ctx.suspend().catch(()=>{});else this.ctx.resume().catch(()=>{});}}
 setStreet(on,duck=1){on=!!on;if(on===this.inStreet&&duck===this.duck)return;this.inStreet=on;this.duck=duck;this.apply();}
 async decode(id,data){if(this.buffers.has(id))return this.buffers.get(id);const c=this.ensure();if(!c)throw Error('no audio');const p=new Promise((ok,fail)=>{try{const r=c.decodeAudioData(b64(data),ok,fail);if(r&&r.then)r.then(ok,fail);}catch(e){fail(e);}});this.buffers.set(id,p);p.catch(()=>this.buffers.delete(id));return p;}
 decodeUI(){if(this.uiDecoded)return;this.uiDecoded=true;for(const [k,v] of Object.entries(UI_SOUNDS))this.decode('ui-'+k,v).catch(()=>{});}
 async play(id,{gain=1,rate=1,pan=0,bus}={}){
  const c=this.ctx;if(!c||c.state!=='running'||this.level()===0)return;
  let buf;try{if(id.startsWith('ui-')){if(!this.sfxOn)return;buf=await this.decode(id,UI_SOUNDS[id.slice(3)]);}else buf=await this.buffers.get(id);}catch{return;}if(!buf)return;
  const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.playbackRate.value=rate;g.gain.value=gain;let node=g;
  if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);node=p;}
  s.connect(g);node.connect(bus||(id.startsWith('ui-')?this.uiBus:this.ambBus));s.start();
 }
 ui(kind){ // tap | hover | confirm | back | open | toggle
  const map={tap:['click1',.55],hover:['rollover2',.25],confirm:['confirmation_001',.5],back:['back_002',.45],open:['open_001',.45],toggle:['switch2',.5]};const m=map[kind]||map.tap;
  if(kind==='hover'){const n=performance.now();if(n-this.lastHover<70)return;this.lastHover=n;}
  this.play('ui-'+m[0],{gain:m[1],rate:kind==='tap'?.94+Math.random()*.12:1});
 }
 /* wealth class 0..5 -> ambience bed + one-shot palette */
 setTier(t){t=Math.max(0,Math.min(5,t|0));if(t===this.tier)return;this.tier=t;this.loadTier(t);}
 async loadTier(t){
  try{const c=this.ensure();if(!c)return;const data=await loadPack('bed'+t);const buf=await this.decode('bed'+t,data);if(t!==this.tier)return;this.startBed(buf);
   const shots=await loadPack('shots');for(const [id] of SHOTS.flat())if(shots[id])this.decode(id,shots[id]).catch(()=>{});}
  catch(e){this.error=e.message;}
 }
 startBed(buf){
  const c=this.ctx;const old=this.bed;const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.loop=true;s.loopStart=.06;s.loopEnd=buf.duration-.06;g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(1,c.currentTime+2.5);s.connect(g);g.connect(this.ambBus);s.start(0,Math.random()*buf.duration*.8);this.bed={s,g};
  if(old){old.g.gain.cancelScheduledValues(c.currentTime);old.g.gain.setTargetAtTime(0,c.currentTime,.7);setTimeout(()=>{try{old.s.stop();old.s.disconnect();old.g.disconnect();}catch{}},4000);}
 }
 tick(){
  if(!this.ctx||this.ctx.state!=='running'||!this.inStreet||!this.ambOn||this.level()===0||this.tier<0)return;const now=performance.now();if(now<this.nextShot)return;
  const pal=SHOTS[this.tier];const total=pal.reduce((n,x)=>n+x[1],0);let r=Math.random()*total,pick=pal[0];for(const x of pal){r-=x[1];if(r<=0){pick=x;break;}}
  this.nextShot=now+(this.tier<=1?3500:6000)+Math.random()*(this.tier<=1?6000:9000);
  this.play(pick[0],{gain:pick[2]*(.7+Math.random()*.4),rate:.92+Math.random()*.16,pan:(Math.random()*2-1)*.7});
 }
 status(){return {ctx:this.ctx?.state||'none',tier:this.tier,street:this.inStreet,bed:!!this.bed,decoded:[...this.buffers.keys()].length,error:this.error};}
}
/* R15: if the browser blocks autoplay, show a one-tap "start" veil over the main menu. The tap is the user gesture
   that starts the menu BGM (and unlocks sound effects) the moment the player reaches the menu. */
export function audioGate(music,sound,{zh=true,enabled=true}={}){
 if(!enabled)return;
 const tryPlay=music.tryAutoplay();let done=false;
 const show=()=>{if(done||music.unlocked||document.getElementById('r15-gate'))return;const g=document.createElement('div');g.id='r15-gate';g.setAttribute('role','button');g.tabIndex=0;
  g.innerHTML=`<div class="r15-gate-card"><b>${zh?'点击开始':'Tap to start'}</b><small>${zh?'Tap to start · 开启音乐与音效':'点击开始 · music & sound on'}</small></div>`;
  const go=e=>{e.preventDefault();e.stopPropagation();music.unlock();sound.unlock();setTimeout(()=>sound.ui('confirm'),60);g.classList.add('out');setTimeout(()=>g.remove(),380);};
  g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go(e);});document.body.append(g);};
 Promise.race([tryPlay,new Promise(r=>setTimeout(()=>r('pending'),900))]).then(ok=>{done=ok===true||ok==='pending'&&!music.blocked;if(!done)show();});
 music.on(s=>{if(s.playing||s.unlocked){done=true;const g=document.getElementById('r15-gate');if(g&&!g.classList.contains('out')){g.classList.add('out');setTimeout(()=>g.remove(),380);}}});
}
