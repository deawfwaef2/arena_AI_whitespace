import CITY_CREDITS from '../assets/music/CITY-CREDITS.json';
import ORIGINAL_SCORES from '../assets/music/ORIGINAL-SCORES.json';
// Six CC BY 4.0 city recordings, two legacy CC0 tracks and six original rest-class scores.
export const MUSIC_CREDITS=[...CITY_CREDITS,...ORIGINAL_SCORES.filter(s=>s.id.startsWith('class'))];
export class Music{
 constructor(){this.enabled=true;this.volume=.28;this.muted=false;this.hidden=false;this.ducked=false;this.mode='taipei';this.unlocked=false;this.buffers=new Map();this.nodes=new Map();this.pending=new Map();this.error='';this.epoch=0;}
 async unlock(){
  if(!this.enabled||this.muted||this.hidden)return;
  try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();this.master??=this.ctx.createGain();if(!this.connected){this.master.connect(this.ctx.destination);this.connected=true;}this.master.gain.value=this.level();await this.ctx.resume();this.unlocked=this.ctx.state==='running';if(this.unlocked)await this.start(this.mode);}catch(e){this.error=e.message;}
 }
 level(){return this.enabled&&!this.muted&&!this.hidden?this.volume*(this.ducked?.4:1):0;}
 apply(){if(this.master&&this.ctx){this.master.gain.cancelScheduledValues(this.ctx.currentTime);if(this.level()===0)this.master.gain.setValueAtTime(0,this.ctx.currentTime);else this.master.gain.setTargetAtTime(this.level(),this.ctx.currentTime,.12);}}
 setEnabled(on){this.enabled=on;this.apply();if(on)this.unlock();}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.apply();}
 setMuted(value){this.muted=value;this.apply();if(!value&&this.unlocked&&!this.hidden)this.ctx?.resume().catch(()=>{});}
 setDucked(value){this.ducked=value;this.apply();}
 setHidden(value){this.hidden=value;this.apply();if(value)this.ctx?.suspend().catch(()=>{});else if(this.unlocked&&this.enabled&&!this.muted)this.ctx?.resume().catch(()=>{});}
 setMode(mode){if(mode===this.mode)return;this.mode=mode;if(this.unlocked)this.start(mode);}
 async decode(id){
  if(this.buffers.has(id))return this.buffers.get(id);if(this.pending.has(id))return this.pending.get(id);
  const data=window.UPSHIFT_AUDIO?.[id];if(!data)throw Error('Embedded music missing');
  const task=(async()=>{const raw=atob(data.substring(data.indexOf(',')+1)),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const buffer=await this.ctx.decodeAudioData(bytes.buffer);this.buffers.set(id,buffer);if(this.buffers.size>2){for(const key of this.buffers.keys()){if(key!==id&&key!==this.mode){this.buffers.delete(key);if(this.buffers.size<=2)break;}}}this.pending.delete(id);return buffer;})();this.pending.set(id,task);return task;
 }
 async start(id){
  if(!this.ctx||!this.unlocked||!this.enabled)return;
  try{
   const stamp=++this.epoch,buffer=await this.decode(id);if(stamp!==this.epoch||id!==this.mode)return;
   if(this.nodes.has(id)){const n=this.nodes.get(id);n.gain.gain.cancelScheduledValues(this.ctx.currentTime);n.gain.gain.setTargetAtTime(1,this.ctx.currentTime,.18);return;}
   const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;gain.gain.setValueAtTime(0,this.ctx.currentTime);gain.gain.linearRampToValueAtTime(1,this.ctx.currentTime+.55);source.connect(gain);gain.connect(this.master);source.start();this.nodes.set(id,{source,gain});
   for(const [key,n] of this.nodes){if(key===id)continue;n.gain.gain.cancelScheduledValues(this.ctx.currentTime);n.gain.gain.setTargetAtTime(0,this.ctx.currentTime,.16);this.nodes.delete(key);setTimeout(()=>{try{n.source.stop();n.source.disconnect();n.gain.disconnect();}catch{}},750);}
  }catch(e){this.error=e.message;}
 }
 status(){return {enabled:this.enabled,mode:this.mode,unlocked:this.unlocked,playing:!!this.nodes.get(this.mode)&&this.ctx?.state==='running'&&this.level()>0,context:this.ctx?.state||'not-started',decoded:[...this.buffers.keys()],volume:this.volume,error:this.error};}
}
