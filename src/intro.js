// Boot sequence (R12: no language picker; variant by completed runs) → "Deawfwaef Games" logo → micro CG teaser (poor → rich UI tease) → main menu.
const ART=()=>window.UPSHIFT_ART||{};
const RANKS=[
 {zh:'生存',en:'Survival',money:'$100'},{zh:'工薪',en:'Worker',money:'$2,400'},{zh:'中产',en:'Middle class',money:'$86,000'},
 {zh:'富裕',en:'Affluent',money:'$1.2M'},{zh:'大人物',en:'Magnate',money:'$48M'},{zh:'私人资本',en:'Private capital',money:'$3.6B'}];
export function runsDone(meta){return meta.runsDone??Math.max(0,(meta.runCount||1)-1);}
export function runIntro({meta,save,done,motion=true}){
 const el=document.createElement('div');el.id='v8-intro';document.body.append(el);
 const zh=()=>meta.lang==='zh';const T=(a,b)=>zh()?b:a;let timers=[],finished=false;
 const later=(fn,ms)=>timers.push(setTimeout(fn,motion?ms:Math.min(ms,60)));
 const finish=()=>{if(finished)return;finished=true;timers.forEach(clearTimeout);el.classList.add('out');setTimeout(()=>{el.remove();done();},motion?600:0);};
 // R12: opening depends on completed runs — 0-2: fast "poor → rich" loading bar · 3-6: tap-to-start + one story frame · 7+: logo cinematic.
 const c=runsDone(meta);
 if(c>=7)logo();else if(c>=3)tapIntro();else loadIntro();
 function loadIntro(){
  const ST=[
   {r:['Survival','生存'],m:'$100',t:['Scraping coins off the pavement…','在人行道上捡硬币……']},
   {r:['Worker','工薪'],m:'$2,400',t:['Clocking in. First real paycheck.','打卡上班，第一份工资。']},
   {r:['Middle class','中产'],m:'$86,000',t:['A small flat. A real sofa.','一间小公寓，一张真沙发。']},
   {r:['Affluent','富裕'],m:'$1.2M',t:['Tailored suits. Quiet money.','定制西装，安静的钱。']},
   {r:['Magnate','大人物'],m:'$48M',t:['The city starts returning your calls.','整座城市开始回你电话。']},
   {r:['???','???'],m:'$???,???',t:['Classified.','机密。']},
   {r:['???','???'],m:'$?,???,???,???',t:['…','……']}];
  el.innerHTML=`<div class="r12-load" data-s="0"><div class="r12-load-box"><small class="r12-load-k">BROKE TO BILLIONAIRE</small><div class="r12-load-rank"><b id="r12-rank"></b><span id="r12-money"></span></div><div class="r12-bar"><i id="r12-fill"></i></div><p id="r12-line"></p><div class="r12-ladder">${ST.map((x,i)=>`<em class="${i>=5?'lock':''}" style="--i:${i}">${i>=5?'🔒':''}</em>`).join('')}<em class="lock">🔒</em></div><small class="r12-pct" id="r12-pct">0%</small></div></div><button class="v8i-skip big">${T('Skip','跳过')} ›</button>`;
  el.querySelector('.v8i-skip').onclick=finish;
  const box=el.querySelector('.r12-load'),fill=el.querySelector('#r12-fill'),pct=el.querySelector('#r12-pct');
  const stage=i=>{const x=ST[i];box.dataset.s=i;el.querySelector('#r12-rank').textContent=zh()?x.r[1]:x.r[0];el.querySelector('#r12-money').textContent=x.m;const ln=el.querySelector('#r12-line');ln.textContent=zh()?x.t[1]:x.t[0];ln.classList.remove('on');void ln.offsetWidth;ln.classList.add('on');el.querySelectorAll('.r12-ladder em').forEach((e,k)=>e.classList.toggle('on',k<=i));};
  const total=motion?5200:200,t0=performance.now();stage(0);let cur=0;
  (function step(){if(finished)return;const k=Math.min(1,(performance.now()-t0)/total);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;const v=Math.round(e*100);fill.style.width=v+'%';pct.textContent=v+'%';const si=Math.min(ST.length-1,Math.floor(e*ST.length*.999));if(si!==cur){cur=si;stage(si);}if(k<1)requestAnimationFrame(step);else later(finish,450);})();
 }
 function tapIntro(){
  el.innerHTML=`<div class="r12-tap"><div class="r12-ring"><i></i><i></i></div><p>${T('Tap the screen','轻触屏幕')}</p></div><button class="v8i-skip big">${T('Skip','跳过')} ›</button>`;
  el.querySelector('.v8i-skip').onclick=e=>{e.stopPropagation();finish();};
  const go=()=>{el.removeEventListener('pointerdown',go);document.removeEventListener('keydown',kgo);story();};const kgo=e=>{if(e.key!=='Escape')go();};
  el.addEventListener('pointerdown',go);document.addEventListener('keydown',kgo);
  function story(){el.querySelector('.r12-tap')?.classList.add('gone');
   later(()=>{if(finished)return;el.insertAdjacentHTML('afterbegin',`<div class="r12-story"><div class="r12-story-img" style="background-image:url('${ART()['cg-poor']||''}')"></div><p class="r12-story-cap">${T('Rainy morning. $100 in your pocket.<br><b>The whole city is still for sale.</b>','下雨的清晨，口袋里只有 $100。<br><b>整座城市，还等着你去买下。</b>')}</p></div>`);el.querySelector('.r12-tap')?.remove();
    el.addEventListener('pointerdown',()=>finish(),{once:true});later(finish,4600);},420);}
 }
 function logo(){el.innerHTML=`<div class="v8i-logo"><img src="${ART().logo||''}" alt=""><h1>Deawfwaef Games</h1><small>${T('presents','出品')}</small></div><button class="v8i-skip big">${T('Skip','跳过')} ›</button>`;el.querySelector('.v8i-skip').onclick=finish;later(cg,2600);}
 function cg(){
  el.innerHTML=`<div class="v8i-cg">
   <div class="v8i-shot poor" style="background-image:url('${ART()['cg-poor']||''}')"></div>
   <div class="v8i-shot rich" style="background-image:url('${ART()['cg-rich']||''}')"></div>
   <div class="v8i-cap" id="v8i-cap"></div>
   <div class="v8i-panel" id="v8i-panel" data-r="0"><small id="v8i-rank"></small><b id="v8i-money">$100</b><div class="v8i-icons">${Array.from({length:6},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div>
   <div class="v8i-title" id="v8i-title"><small>Deawfwaef Games</small><h1>Broke to Billionaire</h1><h2 class="v8i-sub">The $100 Start</h2><p>${T('Every golden frame must be earned.','每一份华丽，都要一步一步赢回来。')}</p><button id="v8i-go">${T('ENTER','进入游戏')}</button></div>
  </div><button class="v8i-skip big">${T('Skip','跳过')} ›</button>`;
  el.querySelector('.v8i-skip').onclick=finish;
  const cap=el.querySelector('#v8i-cap'),panel=el.querySelector('#v8i-panel'),cgEl=el.querySelector('.v8i-cg');
  const say=t=>{cap.classList.remove('on');later(()=>{cap.textContent=t;cap.classList.add('on');},200);};
  say(T('Rainy morning. $100 in your pocket.','下雨的清晨。你口袋里只有 $100。'));
  cgEl.dataset.step='1';
  later(()=>{say(T('This is what your screen looks like today…','这是你今天的界面……灰的、土的、空的。'));panel.classList.add('on');setRank(0);},2600);
  RANKS.forEach((_,i)=>{if(i)later(()=>setRank(i),5200+i*650);});
  later(()=>{say(T('…and this is what it could become.','……而这，是它可能变成的样子。'));cgEl.dataset.step='2';},5600);
  later(()=>{say(T('Yachts. Jets. A crown nobody sees. Locked — for now.','游艇、私人飞机、无人看见的王冠。——暂时锁着。'));panel.classList.add('locked');},9400);
  later(()=>{cap.classList.remove('on');panel.classList.add('gone');cgEl.dataset.step='3';el.querySelector('#v8i-title').classList.add('on');el.querySelector('#v8i-go').focus();},12600);
  el.querySelector('#v8i-go').onclick=finish;
  function setRank(i){panel.dataset.r=i;el.querySelector('#v8i-rank').textContent=zh()?RANKS[i].zh:RANKS[i].en;el.querySelector('#v8i-money').textContent=RANKS[i].money;if(motion)panel.animate([{transform:'translate(-50%,-50%) scale(1.12)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1.3)'});}
 }
 document.addEventListener('keydown',function k(e){if(finished){document.removeEventListener('keydown',k);return;}if(e.key==='Escape')finish();});
}
