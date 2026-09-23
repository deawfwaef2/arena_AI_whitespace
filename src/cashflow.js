// Money feedback. Amounts are integer cents everywhere, matching the rest of the game.
// Gains fly TOWARD the wallet; losses fly AWAY from the wallet toward whatever the player chose.

// Denomination ladder: the bigger the sum, the heavier the prop that flies.
const DENOMS=[
 {at:0,        glyph:'🪙', unit:'硬币',   size:26, count:5},
 {at:2000,     glyph:'💵', unit:'钞票',   size:30, count:7},
 {at:50000,    glyph:'💴', unit:'钞票束', size:34, count:9},
 {at:1000000,  glyph:'💰', unit:'钱袋',   size:38, count:11},
 {at:50000000, glyph:'🏦', unit:'金库车', size:42, count:13},
 {at:2000000000,glyph:'📦',unit:'美元箱', size:46, count:15}
];
export function denomFor(cents){
 const a=Math.abs(cents);let d=DENOMS[0];
 for(const x of DENOMS)if(a>=x.at)d=x;
 return d;
}
const fmt=c=>{
 const a=Math.abs(c)/100;
 if(a>=1e9)return '$'+(a/1e9).toFixed(a>=1e10?0:1)+'B';
 if(a>=1e6)return '$'+(a/1e6).toFixed(a>=1e7?0:1)+'M';
 if(a>=1e4)return '$'+(a/1e3).toFixed(a>=1e5?0:1)+'k';
 return '$'+a.toLocaleString('en-US',{maximumFractionDigits:a<100?2:0});
};

export class CashFlow{
 constructor(){
  this.layer=document.createElement('div');
  this.layer.id='cash-flow-layer';
  this.layer.setAttribute('aria-hidden','true');
  document.body.append(this.layer);
  this.motion=()=>true;
 }
 setMotion(fn){this.motion=fn;}
 // Where the wallet lives right now (cash HUD), falling back to the top-left corner.
 walletPoint(){
  const el=document.getElementById('cash-value')||document.querySelector('.cash-hud');
  if(!el)return {x:innerWidth*.2,y:60,el:null};
  const r=el.getBoundingClientRect();
  return {x:r.left+r.width/2,y:r.top+r.height/2,el:el.closest('.cash-hud')||el};
 }
 rectPoint(target){
  if(!target)return {x:innerWidth/2,y:innerHeight*.6};
  const r=typeof target.getBoundingClientRect==='function'?target.getBoundingClientRect():target;
  return {x:r.left+r.width/2,y:r.top+r.height/2};
 }
 /**
  * @param cents  signed amount in cents (positive = player receives)
  * @param origin element or rect the money comes from / goes to
  */
 play(cents,origin){
  if(!cents)return;
  const gain=cents>0,d=denomFor(cents),wallet=this.walletPoint();
  const other=this.rectPoint(origin);
  const from=gain?other:wallet,to=gain?wallet:other;
  this.label(cents,gain?other:other,d);
  if(!this.motion()){this.thump(wallet.el,gain);return;}
  const n=Math.min(d.count,18);
  for(let i=0;i<n;i++)this.note(from,to,d,i,n,gain);
  setTimeout(()=>this.thump(wallet.el,gain),620);
 }
 label(cents,at,d){
  const el=document.createElement('div');
  el.className='cash-burst-label'+(cents>0?'':' neg');
  el.textContent=(cents>0?'+':'−')+fmt(cents)+' '+d.glyph;
  el.style.left=Math.max(90,Math.min(innerWidth-90,at.x))+'px';
  el.style.top=Math.max(60,Math.min(innerHeight-90,at.y))+'px';
  this.layer.append(el);
  setTimeout(()=>el.remove(),1600);
 }
 note(from,to,d,i,n,gain){
  const el=document.createElement('div');
  el.className='cash-note';
  el.textContent=d.glyph;
  el.style.fontSize=d.size+'px';
  // Spread the swarm so it reads as a stream of bills, not one sprite.
  const spread=54,jitterX=(Math.random()-.5)*spread,jitterY=(Math.random()-.5)*spread;
  const sx=from.x+jitterX,sy=from.y+jitterY;
  const arc=(gain?-1:1)*(70+Math.random()*90);
  const midX=(sx+to.x)/2+(Math.random()-.5)*120;
  const midY=(sy+to.y)/2+arc;
  el.style.left='0px';el.style.top='0px';
  this.layer.append(el);
  const dur=560+Math.random()*320,delay=i*(260/n);
  const spin=(Math.random()-.5)*540;
  const a=el.animate([
   {transform:`translate(${sx}px,${sy}px) translate(-50%,-50%) scale(.5) rotate(0deg)`,opacity:0,offset:0},
   {transform:`translate(${sx}px,${sy}px) translate(-50%,-50%) scale(1.15) rotate(${spin*.15}deg)`,opacity:1,offset:.14},
   {transform:`translate(${midX}px,${midY}px) translate(-50%,-50%) scale(1) rotate(${spin*.6}deg)`,opacity:1,offset:.6},
   {transform:`translate(${to.x}px,${to.y}px) translate(-50%,-50%) scale(${gain?.35:.7}) rotate(${spin}deg)`,opacity:0,offset:1}
  ],{duration:dur,delay,easing:'cubic-bezier(.35,.05,.3,1)',fill:'forwards'});
  a.onfinish=()=>el.remove();
  setTimeout(()=>el.remove(),dur+delay+240);
 }
 thump(el,gain){
  if(!el||!this.motion())return;
  el.classList.remove('wallet-hit');void el.offsetWidth;el.classList.add('wallet-hit');
  setTimeout(()=>el.classList.remove('wallet-hit'),480);
  if(gain){
   const glow=el.animate([{filter:'brightness(1)'},{filter:'brightness(1.25)'},{filter:'brightness(1)'}],{duration:520});
   glow.onfinish=()=>{};
  }
 }
}
