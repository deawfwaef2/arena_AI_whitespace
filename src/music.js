import CITY_CREDITS from '../assets/music/CITY-CREDITS.json';
import ORIGINAL_SCORES from '../assets/music/ORIGINAL-SCORES.json';
import MENU_CREDITS from '../assets/music/MENU-CREDITS.json';
// Menu theme, six CC BY 4.0 city recordings and six original rest-class scores.
export const MUSIC_CREDITS=[...MENU_CREDITS,...CITY_CREDITS,...ORIGINAL_SCORES.filter(s=>s.id.startsWith('class'))];
const KNOWN=new Set(MUSIC_CREDITS.map(c=>c.id));
/* R15: BGM is streamed with <audio> elements from plain MP3 files in music-pack/ (works on http(s) AND file://).
   Why not WebAudio any more: decoding a 3-minute MP3 into PCM needs ~60 MB on a phone and only starts after the
   whole file downloaded; WebAudio is also silenced by the iPhone ring/silent switch. Media elements stream
   (music starts after a few KB), use no decode memory and play through the silent switch.
   Autoplay: we try to start the menu theme immediately; if the browser blocks it, the first tap/click/key
   (see unlock(), which MUST run synchronously inside the gesture) starts it. */
export class Music{
 constructor(){this.enabled=true;this.volume=.28;this.muted=false;this.hidden=false;this.ducked=false;this.mode='menu';this.unlocked=false;this.error='';this.els=[];this.cur=null;this.fadeT=0;this.blocked=false;this.listeners=new Set();}
 src(id){return 'music-pack/'+encodeURIComponent(KNOWN.has(id)?id:'taipei')+'.mp3';}
 level(){return this.enabled&&!this.muted&&!this.hidden?this.volume*(this.ducked?.4:1):0;}
 el(){const a=new Audio();a.loop=true;a.preload='auto';a.setAttribute('playsinline','');a.crossOrigin=null;a.addEventListener('error',()=>{if(a===this.cur?.a)this.error=location.protocol==='file:'?'music-pack folder missing next to index.html':'track failed to load';this.emit();});a.addEventListener('playing',()=>{if(a===this.cur?.a){this.error='';this.unlocked=true;this.blocked=false;this.emit();}});return a;}
 on(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 emit(){for(const f of this.listeners)try{f(this.status());}catch{}}
 /* start/refresh the current track; returns the play() promise */
 play(){
  if(!this.enabled||this.level()===0&&this.muted)return Promise.resolve(false);
  const id=this.mode;if(!this.cur||this.cur.id!==id){const old=this.cur;const a=this.el();a.src=this.src(id);a.volume=0;this.cur={id,a,v:0};if(old)this.fadeOut(old);}
  const a=this.cur.a;if(!a.paused){this.fade();return Promise.resolve(true);}
  let p;try{p=a.play();}catch(e){p=Promise.reject(e);}
  return Promise.resolve(p).then(()=>{this.unlocked=true;this.blocked=false;this.fade();this.emit();return true;},e=>{if(e&&e.name==='NotAllowedError')this.blocked=true;else if(e&&e.name!=='AbortError')this.error=e.message||String(e);this.emit();return false;});
 }
 /* call from inside a user gesture (pointerdown/touchend/click/keydown) */
 unlock(){if(!this.enabled||this.hidden)return;if(this.cur&&!this.cur.a.paused&&this.unlocked)return;this.play();}
 tryAutoplay(){return this.play();}
 fade(){
  clearInterval(this.fadeT);const step=()=>{const c=this.cur;if(!c)return clearInterval(this.fadeT);const target=this.level();c.v+=Math.sign(target-c.v)*Math.min(Math.abs(target-c.v),.04);try{c.a.volume=Math.max(0,Math.min(1,c.v));}catch{}c.a.muted=target===0;if(Math.abs(c.v-target)<.001)clearInterval(this.fadeT);};
  this.fadeT=setInterval(step,40);step();
 }
 fadeOut(c){const t=setInterval(()=>{c.v=Math.max(0,c.v-.035);try{c.a.volume=c.v;}catch{}if(c.v<=0){clearInterval(t);c.a.pause();c.a.removeAttribute('src');try{c.a.load();}catch{}}},40);}
 apply(){if(!this.cur)return;if(this.level()===0){this.cur.a.muted=true;this.fade();}else{this.cur.a.muted=false;this.fade();if(this.unlocked&&this.cur.a.paused&&!this.hidden)this.play();}}
 setEnabled(on){this.enabled=on;if(!on&&this.cur){this.cur.a.pause();}this.apply();if(on)this.unlock();this.emit();}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.apply();}
 setMuted(value){this.muted=value;this.apply();}
 setDucked(value){this.ducked=value;this.apply();}
 setHidden(value){this.hidden=value;if(value){this.cur?.a.pause();}else if(this.unlocked&&this.enabled)this.play();this.apply();}
 setMode(mode){if(!mode||mode===this.mode)return;this.mode=mode;if(this.unlocked&&this.enabled&&!this.hidden)this.play();}
 status(){const a=this.cur?.a;return {enabled:this.enabled,mode:this.mode,unlocked:this.unlocked,blocked:this.blocked,playing:!!a&&!a.paused&&a.readyState>=3&&this.level()>0,context:a?(a.paused?'paused':'playing'):'not-started',decoded:[],volume:this.volume,error:this.error};}
}
