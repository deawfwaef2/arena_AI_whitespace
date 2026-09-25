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
/* R16: build target (esbuild define __TARGET__): web (GitHub Pages / CrazyGames auto-detect), crazygames, poki,
   gamedistribution, gamemonetize, gamepix, itch, newgrounds, y8 (plain = no ad SDK). */
// eslint-disable-next-line no-undef
export const TARGET=typeof __TARGET__!=='undefined'?__TARGET__:'web';
const CG_SDK=(typeof __TARGET__==='undefined'||__TARGET__==='web'||__TARGET__==='crazygames')?'https://sdk.crazygames.com/crazygames-sdk-v3.js':''; // eslint-disable-line no-undef
function loadScript(src,ms=8000){return new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const t=setTimeout(()=>{if(!done){done=true;reject(Error('SDK load timeout'));}},ms);s.src=src;s.async=true;s.onload=()=>{if(!done){done=true;clearTimeout(t);resolve();}};s.onerror=()=>{if(!done){done=true;clearTimeout(t);reject(Error('SDK unavailable'));}};document.head.appendChild(s);});}
/* Each ad adapter: init(), loaded(), start(), stop(), interstitial()->Promise<bool>, rewarded()->Promise<bool>, canReward, preroll */
function makeAds(target,cfg,adState){
 if(target==='poki')return {canReward:true,preroll:false,
  async init(){await loadScript('https://game-cdn.poki.com/scripts/v2/poki-sdk.js');try{await window.PokiSDK.init();}catch{}},
  loaded(){try{window.PokiSDK?.gameLoadingFinished();}catch{}},start(){try{window.PokiSDK?.gameplayStart();}catch{}},stop(){try{window.PokiSDK?.gameplayStop();}catch{}},
  async interstitial(){if(!window.PokiSDK)return false;try{await window.PokiSDK.commercialBreak(()=>adState(true));return true;}catch{return false;}},
  async rewarded(){if(!window.PokiSDK)return false;try{return !!(await window.PokiSDK.rewardedBreak(()=>adState(true)));}catch{return false;}}};
 if(target==='gamedistribution'){let reward=false;return {canReward:true,preroll:true,
  async init(){window.GD_OPTIONS={gameId:cfg.gameId||'',onEvent:e=>{switch(e.name){case 'SDK_GAME_PAUSE':adState(true);break;case 'SDK_GAME_START':adState(false);break;case 'SDK_REWARDED_WATCH_COMPLETE':reward=true;break;case 'SDK_READY':try{window.gdsdk?.preloadAd?.('rewarded');}catch{}break;}}};await loadScript('https://html5.api.gamedistribution.com/main.min.js');},
  loaded(){},start(){},stop(){},
  async interstitial(){if(!window.gdsdk?.showAd)return false;try{await window.gdsdk.showAd();return true;}catch{return false;}},
  async rewarded(){if(!window.gdsdk?.showAd)return false;reward=false;try{await window.gdsdk.showAd('rewarded');try{window.gdsdk.preloadAd?.('rewarded');}catch{}return reward||true;}catch{return false;}}};}
 if(target==='gamemonetize'){let resume=null;return {canReward:false,preroll:true,
  async init(){window.SDK_OPTIONS={gameId:cfg.gameId||'',onEvent:a=>{switch(a.name){case 'SDK_GAME_PAUSE':adState(true);break;case 'SDK_GAME_START':adState(false);if(resume){resume(true);resume=null;}break;}}};await loadScript('https://api.gamemonetize.com/sdk.js');},
  loaded(){},start(){},stop(){},
  interstitial(){if(!window.sdk?.showBanner)return Promise.resolve(false);return new Promise(r=>{resume=r;setTimeout(()=>{if(resume){resume(false);resume=null;}},60000);try{window.sdk.showBanner();}catch{resume=null;r(false);}});},
  async rewarded(){return false;}};}
 if(target==='gamepix')return {canReward:true,preroll:true,
  async init(){await loadScript('https://integration.gamepix.com/sdk/v3/gamepix.sdk.js');},
  loaded(){try{window.GamePix?.loaded?.();}catch{}},start(){},stop(){},
  async interstitial(){if(!window.GamePix?.interstitialAd)return false;adState(true);try{await window.GamePix.interstitialAd();return true;}catch{return false;}finally{adState(false);}},
  async rewarded(){if(!window.GamePix?.rewardAd)return false;adState(true);try{const r=await window.GamePix.rewardAd();return !!(r&&r.success);}catch{return false;}finally{adState(false);}}};
 /* R18: Playgama Bridge v2 — one build for Playgama + the 25 hosts Bridge auto-detects (Yandex, MSN, YouTube Playables, Lagged, Y8, Telegram…). */
 if(target==='playgama'){let B=null;
  const watch=(evt,show,okState)=>new Promise(resolve=>{const A=B?.advertisement;if(!A){resolve(false);return;}let opened=false,good=false,done=false,wait=null;
   const fin=v=>{if(done)return;done=true;clearTimeout(wait);try{A.off?.(evt,h);}catch{}resolve(v);};
   const arm=ms=>{clearTimeout(wait);wait=setTimeout(()=>fin(false),ms);};
   const h=st=>{if(st==='loading')arm(12000);else if(st==='opened'){opened=true;clearTimeout(wait);adState(true);}else if(st===okState)good=true;else if(st==='closed')fin(opened&&(okState==='closed'||good));else if(st==='failed')fin(false);};
   try{A.on(evt,h);arm(2500);show();}catch{fin(false);}});
  return {canReward:true,preroll:false,
  async init(){if(!window.bridge)await loadScript('https://bridge.playgama.com/v2/stable/playgama-bridge.js',10000);B=window.bridge;await B.initialize();this.bridge=B;},
  loaded(){try{B?.platform.sendMessage('game_ready');}catch{}},
  start(){try{B?.platform.sendMessage('level_resumed');}catch{}},stop(){try{B?.platform.sendMessage('level_paused');}catch{}},
  interstitial(){if(!B?.advertisement?.isInterstitialSupported)return Promise.resolve(false);return watch(B.EVENT_NAME.INTERSTITIAL_STATE_CHANGED,()=>B.advertisement.showInterstitial('break'),'closed');},
  rewarded(){if(!B?.advertisement?.isRewardedSupported)return Promise.resolve(false);return watch(B.EVENT_NAME.REWARDED_STATE_CHANGED,()=>B.advertisement.showRewarded('reward'),'rewarded');}};}
 return null;
}
export class Platform {
 constructor(config={}){this.config=config;this.sdk=null;this.user=null;this.status='offline';this.error='';this.memory=new Map();this.storageMode='local';this.lastSubmit=0;this.active=false;this.muted=false;this.onSettings=()=>{};this.onAuth=()=>{};this.onAdState=()=>{};try{this.demo=new URLSearchParams(location.search).has('adtest');}catch{this.demo=false;}}
 async init(){
  this.target=TARGET;
  if(TARGET==='poki'||TARGET==='gamedistribution'||TARGET==='gamemonetize'||TARGET==='gamepix'||TARGET==='playgama'){
   const ads=makeAds(TARGET,(this.config.platforms||{})[TARGET]||{},v=>this.onAdState(v));this.status='connecting';
   try{await Promise.race([ads.init(),new Promise((_,r)=>setTimeout(()=>r(Error('SDK timeout')),9000))]);this.ads=ads;this.status='connected';}catch(e){this.ads=ads;this.status='unavailable';this.error=e.message;}
   if(TARGET==='playgama'&&this.status==='connected')await this.bridgeSetup(ads.bridge);
   return;
  }
  if(TARGET!=='web'&&TARGET!=='crazygames')return;
  const c=this.config.crazygames||{};
  const host=location.hostname+' '+document.referrer;
  const wanted=c.enabled===true||(c.enabled!=='off'&&c.enabled!==false&&(/crazygames\.|crazygamesgamefiles\./i.test(host)||new URLSearchParams(location.search).get('isCrazyGames')==='true'));
  if(!wanted)return;
  this.status='connecting';
  try{
   if(!window.CrazyGames?.SDK)await new Promise((resolve,reject)=>{
    const script=document.createElement('script');let settled=false;
    const timer=setTimeout(()=>{if(!settled){settled=true;reject(Error('SDK load timeout'));}},7000);
    script.src=CG_SDK;script.async=true;
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
 // R18: Playgama Bridge — host mute/pause + storage (cloud saves on Yandex/MSN etc.; Bridge forbids direct localStorage).
 async bridgeSetup(B){this.bridge=B;
  try{this.muted=B.platform.isAudioEnabled===false;B.platform.on(B.EVENT_NAME.AUDIO_STATE_CHANGED,on=>{this.muted=!on;this.onSettings({muteAudio:!on});});}catch{}
  try{B.platform.on(B.EVENT_NAME.PAUSE_STATE_CHANGED,p=>{if(!this.rewardBusy)this.onAdState(!!p);});}catch{}
  try{B.advertisement.on(B.EVENT_NAME.INTERSTITIAL_STATE_CHANGED,st=>{if(!this.rewardBusy&&st==='opened')this.onAdState(true);if(!this.rewardBusy&&(st==='closed'||st==='failed'))this.onAdState(false);});}catch{}
  try{const keys=['upshift-save-v3','upshift-save-v2'];const d=await Promise.race([B.storage.get(keys),new Promise((_,r)=>setTimeout(()=>r(Error('storage timeout')),6000))]);
   this.bs=new Map();keys.forEach((k,i)=>{const v=Array.isArray(d)?d[i]:d?.[k];if(v!=null)this.bs.set(k,typeof v==='string'?v:JSON.stringify(v));});
   this.dirty=new Set();this.storageMode='bridge:'+(B.storage.defaultType||'default');
   const flush=()=>this.flush();addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
  }catch(e){this.bs=null;this.error=e.message;}
 }
 flush(){if(!this.bs||!this.dirty?.size)return;const k=[...this.dirty];this.dirty.clear();try{this.bridge.storage.set(k,k.map(x=>this.bs.get(x)));}catch(e){this.error=e.message;}}
 call(name,...args){try{return this.sdk?.game?.[name]?.(...args);}catch(e){this.error=e.message;}}
 ready(){this.call('loadingStop');this.ads?.loaded();}
 play(value){if(value===this.active)return;this.active=value;this.call(value?'gameplayStart':'gameplayStop');if(this.ads){try{value?this.ads.start():this.ads.stop();}catch{}}}
 load(key){
  if(this.bs){const v=this.bs.get(key);return v==null?null:String(v);}
  try{if(this.sdk)return this.sdk.data.getItem(key);return localStorage.getItem(key);}catch(e){this.storageMode='session';this.error=e.message;return this.memory.get(key)||null;}
 }
 remove(key){this.memory.delete(key);if(this.bs){this.bs.delete(key);try{this.bridge.storage.delete([key]);}catch{}return;}try{if(this.sdk){this.sdk.data.removeItem?.(key);this.sdk.data.setItem?.(key,'null');}localStorage.removeItem(key);}catch(e){this.error=e.message;}}
 save(key,value){
  this.memory.set(key,value);
  if(this.bs){this.bs.set(key,value);this.dirty.add(key);clearTimeout(this.flushT);this.flushT=setTimeout(()=>this.flush(),2500);return true;}
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
 canReward(){return !!(this.config.crazygames?.ads&&this.sdk?.ad?.requestAd)||!!(this.ads?.canReward&&this.status==='connected')||this.demo;}
 // R16: platform pre-roll on the first Play press (GameDistribution / GameMonetize / GamePix ask for it; Poki forbids it).
 async preroll(){if(this.prerolled||!this.ads?.preroll||this.status!=='connected')return false;this.prerolled=true;return this.adRun(()=>this.ads.interstitial());}
 async adRun(fn){if(this.rewardBusy)return false;this.rewardBusy=true;const was=this.active;this.play(false);this.onAdState(true);let ok=false;try{ok=await Promise.race([fn(),new Promise(r=>setTimeout(()=>r(false),120000))]);}catch{ok=false;}this.rewardBusy=false;this.onAdState(false);if(was)this.play(true);return !!ok;}
 // local test mode (?adtest=1): a fake 3-second ad so the reward flow can be tested outside CrazyGames
 demoAd(kind='rewarded'){return new Promise(resolve=>{const el=document.createElement('div');el.id='demo-ad';el.innerHTML='<div><b>AD</b><p>CrazyGames '+kind+' ad (test mode)</p><i></i></div>';document.body.append(el);setTimeout(()=>{el.remove();resolve(true);},3000);});}
 // R11: midgame interstitial (player-initiated story node or natural break). Resolves true if an ad actually played.
 async midgame(){
  if(this.ads){if(this.status!=='connected'||this.rewardBusy)return false;return this.adRun(()=>this.ads.interstitial());}
  if(!this.canReward()||this.rewardBusy)return false;
  if(!this.sdk&&this.demo){this.rewardBusy=true;this.onAdState(true);const ok=await this.demoAd('midgame');this.rewardBusy=false;this.onAdState(false);return ok;}
  this.rewardBusy=true;const was=this.active;this.play(false);this.onAdState(true);
  return new Promise(resolve=>{let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);this.rewardBusy=false;this.onAdState(false);if(was)this.play(true);resolve(ok);};
   const timer=setTimeout(()=>finish(false),120000);
   try{this.sdk.ad.requestAd('midgame',{adStarted:()=>this.onAdState(true),adFinished:()=>finish(true),adError:()=>finish(false)});}catch{finish(false);}});
 }
 // R11: static display banner inside an in-world frame. Returns true when CrazyGames filled it.
 async banner(id,w,h){if(!this.sdk?.banner?.requestBanner||!this.config.crazygames?.ads)return false;try{await this.sdk.banner.requestBanner({id,width:w,height:h});return true;}catch(e){this.error=e?.message||String(e);return false;}}
 clearBanner(id){try{this.sdk?.banner?.clearBanner?.(id);}catch{}}
 clearBanners(){try{this.sdk?.banner?.clearAllBanners?.();}catch{}}
 async rewarded(){
  if(!this.canReward()||this.rewardBusy)return false;
  if(this.ads)return this.adRun(()=>this.ads.rewarded());
  if(!this.sdk&&this.demo){this.rewardBusy=true;this.onAdState(true);const ok=await this.demoAd();this.rewardBusy=false;this.onAdState(false);return ok;}
  this.rewardBusy=true;this.play(false);this.onAdState(true);
  return new Promise(resolve=>{
   let done=false;const finish=success=>{if(done)return;done=true;clearTimeout(timer);this.rewardBusy=false;this.onAdState(false);resolve(success);};
   const timer=setTimeout(()=>finish(false),180000);
   try{this.sdk.ad.requestAd('rewarded',{adStarted:()=>this.onAdState(true),adFinished:()=>finish(true),adError:()=>finish(false)});}catch{finish(false);}
  });
 }
 context(run){this.call('setGameContext',{page:run.page,run:run.runNumber,offer:run.offer.type,unranked:run.unranked});}
 celebrate(){if(!this.lastHappy||Date.now()-this.lastHappy>60000){this.lastHappy=Date.now();this.call('happytime');}}
}
