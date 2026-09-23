import {studioMarkup,applyLayout,LAYOUTS} from './redesign.js';
const STEPS=[
 {number:'01',title:'看清风险，再投一笔。',body:'先看成功率与回报，选择投入金额，再点「投资」。普通项目失败，只损失这次投入。',example:'例如投入 $25，返还 ×1.80：成功拿回 $45；失败损失 $25。',icon:'↗'},
 {number:'02',title:'点击或右滑，遇见下一站。',body:'你有 200 点体力，可升级到 400。前进消耗 5，投资消耗 3。体力越少，天色越晚；用完就去休息。',example:'只前进约 40 站会耗尽体力。假期可慢慢恢复，也可花游戏币立即恢复。',icon:'→'},
 {number:'03',title:'钱变多，世界也会变大。',body:'随着金钱增加，更多机制会解锁。地图、自动过滤、利息和进阶界面，都能在沿途商店逐步买到。',example:'起步不用记住所有规则。先做好眼前的一次选择。',icon:'✦'}
];
export class Onboarding{
 constructor(ctx){this.c=ctx;this.preview={screen:'street',wealth:'poor',device:ctx.meta().device||'desktop'};this.active=false;this.step=0;this.mode='start';this.element=document.createElement('section');this.element.id='start-screen';this.element.className='start-screen';this.element.setAttribute('role','dialog');this.element.setAttribute('aria-modal','true');this.element.setAttribute('aria-labelledby','start-title');document.getElementById('app').append(this.element);
  document.addEventListener('keydown',e=>{if(!this.active)return;if(e.key==='Tab'){const buttons=[...this.element.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus();}}if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(this.mode==='tutorial')this.finish();}if(e.key==='Enter'&&!e.target.closest('button')){e.preventDefault();e.stopImmediatePropagation();this.element.querySelector('.start-primary')?.click();}if(['ArrowRight','`'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();}},true);
 }
 show(){document.body.dataset.device='desktop';this.active=true;this.mode='start';this.element.hidden=false;this.c.block(true);document.getElementById('game').inert=true;document.getElementById('game').classList.add('at-start');this.c.world.setRest(null);this.c.world.setTitle(true);this.render();}
 tutorial(){this.active=true;this.mode='tutorial';this.step=0;this.element.hidden=false;this.c.block(true);document.getElementById('game').inert=true;document.getElementById('game').classList.add('at-start');this.c.world.setRest(null);this.c.world.setTitle(true);this.render();}
 render(){
  if(this.mode==='start'){
   this.element.innerHTML=studioMarkup(this.c.meta(),this.c.run(),this.preview);}

  else{const s=STEPS[this.step];this.element.innerHTML=`<div class="tutorial-copy"><div class="tutorial-top"><span>快速上手</span><strong>${s.number} / 03</strong></div><div class="tutorial-progress">${STEPS.map((_,i)=>`<i class="${i<=this.step?'done':''}"></i>`).join('')}</div><div class="tutorial-icon">${s.icon}</div><h1 id="start-title">${s.title}</h1><p class="tutorial-body">${s.body}</p><div class="tutorial-example">${s.example}</div><button class="start-primary" data-action="onboard-next">${this.step===2?'明白了，出发！':'下一步'} <span>→</span></button><div class="tutorial-bottom">${this.step>0?'<button data-action="onboard-back">上一步</button>':'<span></span>'}<button data-action="onboard-skip">跳过教程</button></div></div><div class="start-world-label"><i></i>你始终是这段旅程的主角。</div>`;}
  if(this.mode==='tutorial')requestAnimationFrame(()=>this.element.querySelector('.start-primary')?.focus());
 }
 finish(){applyLayout(this.c.meta());this.c.meta().tutorial31=true;this.active=false;this.element.hidden=true;document.getElementById('game').inert=false;document.getElementById('game').classList.remove('at-start');this.c.world.setTitle(false);this.c.block(false);this.c.save();this.c.enter();}
 handle(a,v){
 if(a==='studio-toggle-device'){this.c.meta().device=this.c.meta().device==='phone'?'desktop':'phone';this.preview.device=this.c.meta().device;applyLayout(this.c.meta());this.c.save();this.c.world.resize();return true;}
 if(a.startsWith('studio-')){if(!this.active)return true;
  if(a==='studio-layout'&&LAYOUTS.some(x=>x.id===v))this.c.meta().layout=v;
  if(a==='studio-screen'&&['street','map','rest','assets'].includes(v))this.preview.screen=v;
  if(a==='studio-wealth'&&['poor','rich'].includes(v))this.preview.wealth=v;
  if(a==='studio-device'&&['desktop','phone'].includes(v)){this.preview.device=v;this.c.meta().device=v;}
  this.c.save();const scroll=this.element.scrollTop;this.render();this.element.scrollTop=scroll;
  this.element.querySelector(`[data-action="${a}"][data-value="${v}"]`)?.focus({preventScroll:true});return true;
 }
 if(!a.startsWith('onboard-'))return false;this.c.unlock();switch(a){case 'onboard-legacy':this.element.hidden=true;this.c.legacyOpen();break;case 'onboard-legacy-back':this.c.close();this.show();break;case 'onboard-perk':this.c.legacyBuy(v);break;case 'onboard-skin':this.c.legacySkin(v);break;case 'onboard-theme':this.c.meta().theme=v;document.documentElement.dataset.theme=v;document.body.dataset.theme=v;this.c.save();this.render();break;case 'onboard-play':this.finish();break;case 'onboard-tour':this.c.close();this.tutorial();break;case 'onboard-next':if(this.step<2){this.step++;this.render();}else this.finish();break;case 'onboard-back':this.step=Math.max(0,this.step-1);this.render();break;case 'onboard-skip':this.finish();break;case 'onboard-home':this.c.close();this.show();break;}return true;}
}
