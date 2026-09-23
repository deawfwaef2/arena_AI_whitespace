// Boot sequence: black language picker → "Deawfwaef Games" logo → micro CG teaser (poor → rich UI tease) → main menu.
const ART=()=>window.UPSHIFT_ART||{};
const RANKS=[
 {zh:'生存',en:'Survival',money:'$100'},{zh:'工薪',en:'Worker',money:'$2,400'},{zh:'中产',en:'Middle class',money:'$86,000'},
 {zh:'富裕',en:'Affluent',money:'$1.2M'},{zh:'大人物',en:'Magnate',money:'$48M'},{zh:'私人资本',en:'Private capital',money:'$3.6B'}];
export function runIntro({meta,save,done,motion=true}){
 const el=document.createElement('div');el.id='v8-intro';document.body.append(el);
 const zh=()=>meta.lang==='zh';const T=(a,b)=>zh()?b:a;let timers=[],finished=false;
 const later=(fn,ms)=>timers.push(setTimeout(fn,motion?ms:Math.min(ms,60)));
 const finish=()=>{if(finished)return;finished=true;timers.forEach(clearTimeout);el.classList.add('out');setTimeout(()=>{el.remove();done();},motion?600:0);};
 // 1) language
 el.innerHTML=`<div class="v8i-lang"><p>選擇語言 · SELECT LANGUAGE</p><div><button data-l="zh"><b>中文</b><small>简体中文</small></button><button data-l="en"><b>English</b><small>English</small></button></div></div>`;
 el.querySelectorAll('[data-l]').forEach(b=>b.addEventListener('click',()=>{meta.lang=b.dataset.l;meta.introLang=true;save();document.documentElement.lang=zh()?'zh-CN':'en';logo();}));
 el.querySelector(`[data-l="${meta.lang==='en'?'en':'zh'}"]`)?.focus();
 function logo(){el.innerHTML=`<div class="v8i-logo"><img src="${ART().logo||''}" alt=""><h1>Deawfwaef Games</h1><small>${T('presents','出品')}</small></div><button class="v8i-skip">${T('Skip','跳过')} ›</button>`;el.querySelector('.v8i-skip').onclick=finish;later(cg,2600);}
 function cg(){
  el.innerHTML=`<div class="v8i-cg">
   <div class="v8i-shot poor" style="background-image:url('${ART()['cg-poor']||''}')"></div>
   <div class="v8i-shot rich" style="background-image:url('${ART()['cg-rich']||''}')"></div>
   <div class="v8i-cap" id="v8i-cap"></div>
   <div class="v8i-panel" id="v8i-panel" data-r="0"><small id="v8i-rank"></small><b id="v8i-money">$100</b><div class="v8i-icons">${Array.from({length:6},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div>
   <div class="v8i-title" id="v8i-title"><small>Deawfwaef Games</small><h1>Last $100</h1><p>${T('Every golden frame must be earned.','每一份华丽，都要一步一步赢回来。')}</p><button id="v8i-go">${T('ENTER','进入游戏')}</button></div>
  </div><button class="v8i-skip">${T('Skip','跳过')} ›</button>`;
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
