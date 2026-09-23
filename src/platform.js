// CrazyGames v3 adapter. No server API key ever belongs in this client.
// https://docs.crazygames.com/sdk/leaderboards-client/
export async function encryptScore(score,keyBase64){
 const bytes=Uint8Array.from(atob(keyBase64),c=>c.charCodeAt(0));
 if(bytes.length!==32)throw Error('Leaderboard encryption key must decode to 32 bytes');
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['encrypt']);
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(String(score)));
 const joined=new Uint8Array(12+encrypted.byteLength);joined.set(iv);joined.set(new Uint8Array(encrypted),12);
 return btoa(String.fromCharCode(...joined));
}
export class Platform {
 constructor(config={}){this.config=config;this.sdk=null;this.user=null;this.status='offline';this.error='';this.memory=new Map();this.storageMode='local';this.lastSubmit=0;this.active=false;this.muted=false;this.onSettings=()=>{};this.onAuth=()=>{};this.onAdState=()=>{};}
 async init(){
  const c=this.config.crazygames||{};
  const host=location.hostname+' '+document.referrer;
  const wanted=c.enabled===true||(c.enabled!=='off'&&c.enabled!==false&&(/crazygames\.|crazygamesgamefiles\./i.test(host)||new URLSearchParams(location.search).get('isCrazyGames')==='true'));
  if(!wanted)return;
  this.status='connecting';
  try{
   if(!window.CrazyGames?.SDK)await new Promise((resolve,reject)=>{
    const script=document.createElement('script');let settled=false;
    const timer=setTimeout(()=>{if(!settled){settled=true;reject(Error('SDK load timeout'));}},7000);
    script.src='https://sdk.crazygames.com/crazygames-sdk-v3.js';script.async=true;
    script.onload=()=>{if(!settled){settled=true;clearTimeout(timer);resolve();}};
    script.onerror=()=>{if(!settled){settled=true;clearTimeout(timer);reject(Error('SDK unavailable'));}};document.head.appendChild(script);
   });
   const sdk=window.CrazyGames.SDK;
   await Promise.race([sdk.init(),new Promise((_,r)=>setTimeout(()=>r(Error('SDK initialization timeout')),10000))]);
   this.sdk=sdk;this.status='connected';this.storageMode='crazygames';
   this.call('loadingStart');
   this.muted=!!sdk.game?.settings?.muteAudio;
   sdk.game?.addSettingsChangeListener?.(settings=>{this.muted=!!settings.muteAudio;this.onSettings(settings);});
   if(sdk.user?.isUserAccountAvailable){
    try{this.user=await sdk.user.getUser();}catch{}
    sdk.user.addAuthListener?.(user=>{this.user=user;this.onAuth(user);});
   }
   this.locale=sdk.user?.systemInfo?.locale;
  }catch(e){this.status='unavailable';this.error=e.message;this.sdk=null;}
 }
 call(name,...args){try{return this.sdk?.game?.[name]?.(...args);}catch(e){this.error=e.message;}}
 ready(){this.call('loadingStop');}
 play(value){if(value===this.active)return;this.active=value;this.call(value?'gameplayStart':'gameplayStop');}
 load(key){
  try{if(this.sdk)return this.sdk.data.getItem(key);return localStorage.getItem(key);}catch(e){this.storageMode='session';this.error=e.message;return this.memory.get(key)||null;}
 }
 save(key,value){
  this.memory.set(key,value);
  try{if(this.sdk){this.sdk.data.setItem(key,value);return true;}localStorage.setItem(key,value);return true;}catch(e){this.storageMode='session';this.error=e.message;return false;}
 }
 async submit(run){
  if(run.unranked)return {code:'unranked'};
  if(!this.sdk)return {code:'offline'};
  const key=this.config.crazygames?.encryptionKey;
  if(!key)return {code:'unconfigured'};
  if(!this.sdk.user?.isUserAccountAvailable||!this.user)return {code:'login'};
  const cooldown=(this.config.crazygames?.cooldownSeconds||15)*1000;
  if(Date.now()-this.lastSubmit<cooldown)return {code:'cooldown'};
  try{
   const score=run.peak/100;
   if(!Number.isFinite(score)||score<0||score>(this.config.crazygames?.maxScore||9000000000000))return {code:'range'};
   const encryptedScore=await encryptScore(score,key);
   await this.sdk.user.submitScore({encryptedScore,score});
   this.lastSubmit=Date.now();
   // The API intentionally does not confirm acceptance; never claim a verified rank.
   return {code:'sent',score};
  }catch(e){this.error=e.message;return {code:'error',error:e.message};}
 }
 async login(){if(!this.sdk?.user?.isUserAccountAvailable)return false;try{this.user=await this.sdk.user.showAuthPrompt();return !!this.user;}catch{return false;}}
 canReward(){return !!(this.config.crazygames?.ads&&this.sdk?.ad?.requestAd);}
 async rewarded(){
  if(!this.canReward()||this.rewardBusy)return false;
  this.rewardBusy=true;this.play(false);this.onAdState(true);
  return new Promise(resolve=>{
   let done=false;const finish=success=>{if(done)return;done=true;clearTimeout(timer);this.rewardBusy=false;this.onAdState(false);resolve(success);};
   const timer=setTimeout(()=>finish(false),180000);
   try{this.sdk.ad.requestAd('rewarded',{adStarted:()=>this.onAdState(true),adFinished:()=>finish(true),adError:()=>finish(false)});}catch{finish(false);}
  });
 }
 async midgame(){
  if(!this.config.crazygames?.ads||!this.sdk?.ad)return;
  this.play(false);
  await new Promise(resolve=>{
   let done=false;const finish=()=>{if(done)return;done=true;this.onAdState(false);resolve();};
   try{this.sdk.ad.requestAd('midgame',{adStarted:()=>this.onAdState(true),adFinished:finish,adError:finish});}catch{finish();}
  });
 }
 context(run){this.call('setGameContext',{page:run.page,run:run.runNumber,offer:run.offer.type,unranked:run.unranked});}
 celebrate(){if(!this.lastHappy||Date.now()-this.lastHappy>60000){this.lastHappy=Date.now();this.call('happytime');}}
}
