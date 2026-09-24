// Round 9 layer: prominent rest-phase rewarded ad, first-run coach + goal guidance, run modifiers helpers.
const $=id=>document.getElementById(id);
const ART=n=>window.UPSHIFT_ART?.['ic-'+n]||'';
const mmss=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
export class R9{
 constructor(c){this.c=c;this.last=0;}
 get s(){return this.c.run();}
 get zh(){return this.c.meta().lang==='zh';}
 T(zh,en){return this.zh?zh:en;}
 tick(now){if(now-this.last<400)return;this.last=now;try{this.restAd();this.coach();}catch(e){}}
 /* ---- item 91: big, obvious "watch an ad to skip the rest" button in the middle of the rest scene ---- */
 restAd(){const s=this.s,r=s?.life?.rest;const ok=this.c.started()&&r&&r.paid&&r.remaining>0&&!r.adSkip&&this.c.platform.canReward()&&!this.c.modal();
  let el=$('r9-restad');if(!ok){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('button');el.id='r9-restad';el.dataset.action='life-adskip';(document.getElementById('game')||document.body).append(el);}
  const busy=!!this.c.adBusy?.();el.disabled=busy;el.hidden=false;
  const html=`<span class="r9-ra-tv"><i></i></span><span class="r9-ra-t"><b>${busy?this.T('广告播放中…','Ad playing…'):this.T('看广告 · 跳过休息','Watch an ad · skip the rest')}</b><small>${this.T('剩余 ','Time left ')}${mmss(r.remaining/1000)} → 0:00 · ${this.T('体力回满','full energy')}</small></span><em>AD</em>`;
  if(el._h!==html){el.innerHTML=html;el._h=html;}}
 /* ---- item 96: minimal first-run coach — one short hint at a time, anchored to the thing to press ---- */
 hideSpot(){const sp=$('r12-spot');if(sp)sp.hidden=true;}
 coach(){const m=this.c.meta(),s=this.s;if(!this.c.started()||this.c.modal()||m.r9coachDone||!s||s.ended||s.life?.rest||s.life?.travel){this.hideCoach();if(s?.life?.rest&&!m.r9coachDone&&(m.r9coach||0)>=3){m.r9coach=4;m.r9coachDone=true;this.c.save();}return;}
  const cash=s.cash/100,o=s.offer||{};let step=null;
  if(o.type==='v9-work'&&!o.settled&&(m.r9coach||0)<1)step={n:1,sel:'[data-action="v9-tap"]',t:this.T('① 点这里打工！点满进度条就拿到钱。','① Tap here to work! Fill the bar to get paid.')};
  else if((m.r9coach||0)<2&&cash<3000)step={n:2,sel:'#v7-money',t:this.T('② 目标：攒到 $3,000 解锁投资。越有钱，解锁的东西越多。','② Goal: save $3,000 to unlock investing. More money unlocks more of the world.')};
  else if((m.r9coach||0)<3&&(o.type==='project'||o.type==='v12-city')&&!o.settled)step={n:3,sel:'#v7-go, .v8-deal [data-action="invest"], [data-action="v12-city-play"]',t:this.T('③ 拖动滑杆选金额，按圆形按钮投资。只会输掉投入的部分。','③ Drag the slider to pick a stake, then press the round button. You can only lose what you stake.')};
  else if((m.r9coach||0)<4&&s.life.energy<60)step={n:4,sel:'[data-mech="rest"]',t:this.T('④ 体力低了：去休息。休息要付账单，付不起就结束本局！','④ Low energy: rest. Resting costs a bill — if you can\u2019t pay, the run ends!')};
  if(!step){this.hideCoach();if((m.r9coach||0)>=4){m.r9coachDone=true;this.c.save();}return;}
  const target=[...document.querySelectorAll(step.sel)].find(e=>e.offsetParent);let el=$('r9-coach');
  if(!el){el=document.createElement('div');el.id='r9-coach';el.innerHTML='<p></p><button type="button"></button>';(document.getElementById('game')||document.body).append(el);el.querySelector('button').addEventListener('click',()=>{const m=this.c.meta();m.r9coach=Math.max(m.r9coach||0,this.step||0);if(m.r9coach>=4)m.r9coachDone=true;this.c.save();this.hideCoach();});}
  this.step=step.n;el.querySelector('p').textContent=step.t;el.querySelector('button').textContent=this.T('知道了','Got it');el.hidden=false;
  const g=(document.getElementById('game')||document.body).getBoundingClientRect();
  if(target){const r=target.getBoundingClientRect();const w=Math.min(320,g.width*.42);let x=r.left-g.left+r.width/2-w/2;x=Math.max(8,Math.min(g.width-w-8,x));let y=r.top-g.top-12;const below=y<140;el.style.width=w+'px';el.style.left=x+'px';el.style.top=(below?r.bottom-g.top+12:y)+'px';el.classList.toggle('below',below);}
  else{el.style.left='50%';el.style.top='22%';el.style.width='';el.classList.remove('below');}
  {let sp=$('r12-spot');const want=target&&(step.n===1||step.n===3);if(want){if(!sp){sp=document.createElement('div');sp.id='r12-spot';sp.setAttribute('aria-hidden','true');sp.innerHTML='<i class="r12-spot-ring"></i><i class="r12-spot-ring b"></i><svg class="r12-spot-arrow" viewBox="0 0 48 60"><path d="M24 58 4 32h13V2h14v30h13z" fill="#ffd54a" stroke="#3a2600" stroke-width="3" stroke-linejoin="round"/></svg>';(document.getElementById('game')||document.body).append(sp);}const r=target.getBoundingClientRect();sp.style.cssText=`left:${r.left-g.left-6}px;top:${r.top-g.top-6}px;width:${r.width+12}px;height:${r.height+12}px`;sp.hidden=false;}else if(sp)sp.hidden=true;}
  if(step.n===1&&o.taps>0||step.n===3&&o.settled){const m=this.c.meta();m.r9coach=Math.max(m.r9coach||0,step.n);this.c.save();}
  if(step.n===2&&(m.r9coach||0)<2&&!this.c2){this.c2=setTimeout(()=>{const m=this.c.meta();m.r9coach=Math.max(m.r9coach||0,2);this.c.save();this.c2=null;},9000);}
  if(step.n===4){const m=this.c.meta();if(s.life.rest){m.r9coach=4;m.r9coachDone=true;this.c.save();}}}
 hideCoach(){const el=$('r9-coach');if(el)el.hidden=true;this.hideSpot();}
}
