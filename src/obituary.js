export const obituaryArt=`<svg class="obituary-art" viewBox="0 0 540 240" role="img" aria-label="黑色幽默：资本家被巨额账单砸倒，钱包的灵魂升天，西装死神手拿零元公文包">
 <defs>
  <radialGradient id="graveyard-glow" cx="50%" cy="80%" r="60%">
   <stop offset="0%" stop-color="#1b2a3a" stop-opacity=".8"/>
   <stop offset="100%" stop-color="#0a121a" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="anvil-grad" x1="0" y1="0" x2="0" y2="1">
   <stop offset="0%" stop-color="#3d4957"/>
   <stop offset="100%" stop-color="#1f262f"/>
  </linearGradient>
  <linearGradient id="reaper-robe" x1="0" y1="0" x2="1" y2="1">
   <stop offset="0%" stop-color="#1a202c"/>
   <stop offset="100%" stop-color="#0d1117"/>
  </linearGradient>
 </defs>
 <ellipse cx="270" cy="205" rx="210" ry="20" fill="url(#graveyard-glow)"/>
 <path d="M40 205h460" stroke="#485c6d" stroke-width="2" stroke-dasharray="6 4" opacity=".5"/>

 <!-- 墓碑 R.I.P. NET WORTH -->
 <g class="tombstone-bg" transform="translate(420, 120)">
  <path d="M0 80V25a25 25 0 0 1 50 0v55Z" fill="#2d3748" stroke="#4a5568" stroke-width="2"/>
  <text x="25" y="38" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" font-weight="700" fill="#a0aec0">R.I.P.</text>
  <text x="25" y="52" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#718096">NET WORTH</text>
  <text x="25" y="68" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#e53e3e">☠</text>
 </g>

 <!-- 倒下的倒霉资本家 -->
 <g class="fallen-capitalist">
  <!-- 扬起的灰尘 -->
  <ellipse cx="230" cy="198" rx="75" ry="10" fill="#2d3748" opacity=".6"/>
  <!-- 身体与四肢（被压扁的滑稽姿势） -->
  <path d="M165 198l-25 -10m45 10l-15 -35m75 35l30 -5m-15 5l25 -25" stroke="#4a5568" stroke-width="14" stroke-linecap="round"/>
  <!-- 皱巴巴的西装身躯 -->
  <path d="M190 196h65" stroke="#d69e2e" stroke-width="24" stroke-linecap="round"/>
  <path d="M198 193h45" stroke="#b7791f" stroke-width="6"/>
  <!-- 晕头转向的脑袋与领带 -->
  <circle cx="160" cy="186" r="18" fill="#feebc8"/>
  <!-- 蚊香眼 (X_X / 螺旋) -->
  <path d="M152 181l6 6m0-6l-6 6M164 181l6 6m0-6l-6 6" stroke="#742a2a" stroke-width="2.5" stroke-linecap="round"/>
  <!-- 吐出来的小舌头 -->
  <path d="M157 194q4 8 8 2" stroke="#e53e3e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- 歪掉的高礼帽 -->
  <g transform="translate(130, 160) rotate(-35)">
   <ellipse cx="16" cy="18" rx="18" ry="4" fill="#1a202c"/>
   <rect x="5" y="0" width="22" height="18" rx="2" fill="#2d3748"/>
   <rect x="5" y="14" width="22" height="4" fill="#e53e3e"/>
  </g>
 </g>

 <!-- 压在身上的巨大 100 吨账单铁砧 -->
 <g class="bill-anvil">
  <path d="M190 130h110l15 25h-140z" fill="url(#anvil-grad)" stroke="#4a5568" stroke-width="2"/>
  <rect x="200" y="85" width="90" height="45" rx="4" fill="url(#anvil-grad)" stroke="#4a5568" stroke-width="2"/>
  <path d="M225 85v-15a15 15 0 0 1 30 0v15" fill="none" stroke="#718096" stroke-width="5"/>
  <text x="245" y="105" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" font-weight="700" fill="#feb2b2">催缴账单 BILLS</text>
  <text x="245" y="121" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" font-weight="900" fill="#fc8181">100 TONS</text>
 </g>

 <!-- 站在一旁的死神西装清算官 -->
 <g class="reaper-accountant" transform="translate(325, 75)">
  <!-- 斗篷身体 -->
  <path d="M35 125L20 40Q35 30 50 40L35 125Z" fill="url(#reaper-robe)"/>
  <!-- 白骨骷髅头 -->
  <circle cx="35" cy="30" r="14" fill="#edf2f7"/>
  <circle cx="31" cy="28" r="3" fill="#1a202c"/>
  <circle cx="39" cy="28" r="3" fill="#1a202c"/>
  <path d="M30 37q5 4 10 0" stroke="#1a202c" stroke-width="2" fill="none"/>
  <!-- 死神的小礼帽 -->
  <ellipse cx="35" cy="18" rx="14" ry="3" fill="#1a202c"/>
  <rect x="26" y="5" width="18" height="13" fill="#2d3748"/>
  <rect x="26" y="15" width="18" height="3" fill="#9b2c2c"/>
  <!-- 死神的公文包，印着 $0.00 -->
  <g transform="translate(48, 85)">
   <rect x="0" y="6" width="30" height="22" rx="3" fill="#744210" stroke="#975a16" stroke-width="1.5"/>
   <path d="M8 6V2a3 3 0 0 1 6 0v4" fill="none" stroke="#d69e2e" stroke-width="2"/>
   <text x="15" y="21" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="9" font-weight="700" fill="#fefcbf">$0.00</text>
  </g>
  <!-- 催缴清单夹板 -->
  <g transform="translate(2, 65) rotate(10)">
   <rect x="0" y="0" width="18" height="26" rx="2" fill="#ecc94b"/>
   <rect x="4" y="-3" width="10" height="4" rx="1" fill="#718096"/>
   <path d="M3 6h12M3 11h9M3 16h11M3 21h7" stroke="#744210" stroke-width="1.5"/>
  </g>
 </g>

 <!-- 升天的小钱包灵魂 (带翅膀和小光环) -->
 <g class="wallet-ghost">
  <!-- 光环 -->
  <ellipse cx="215" cy="25" rx="16" ry="4" fill="none" stroke="#ecc94b" stroke-width="2.5"/>
  <!-- 小翅膀 -->
  <path d="M192 38q-18 -10 -12 -22q14 2 16 14z" fill="#fed7d7" opacity=".8"/>
  <path d="M238 38q18 -10 12 -22q-14 2 -16 14z" fill="#fed7d7" opacity=".8"/>
  <!-- 钱包身躯 -->
  <path d="M196 42v-16a19 19 0 0 1 38 0v24l-6 -5 -7 5 -6 -5 -6 5 -7 -5 -6 5Z" fill="#fffaf0" stroke="#e2e8f0" stroke-width="1.5"/>
  <!-- 呆萌小幽灵表情与一滴泪 -->
  <circle cx="208" cy="28" r="2.5" fill="#2d3748"/>
  <circle cx="222" cy="28" r="2.5" fill="#2d3748"/>
  <ellipse cx="205" cy="35" rx="1.5" ry="2.5" fill="#63b3ed"/>
  <text x="215" y="44" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-weight="800" fill="#e53e3e" font-size="12">$0</text>
 </g>

 <!-- 从空钱包里飞出的飞蛾 -->
 <g class="flying-moth" transform="translate(160, 60)">
  <ellipse cx="10" cy="10" rx="3" ry="5" fill="#cbd5e0"/>
  <path d="M10 8q-12 -10 -8 -18q10 4 9 16z" fill="#e2e8f0" opacity=".7"/>
  <path d="M10 8q12 -10 8 -18q-10 4 -9 16z" fill="#e2e8f0" opacity=".7"/>
 </g>
</svg>`;

export const SATIRICAL_EPITAPHS=[
  '「他生前是个讲究人，直到他满怀信心地把全部家当押在了一张 50% 胜率的神秘合约上。」',
  '「法医尸检结论：该名资本家在收到本周第 12 笔豪宅物业与私人岛屿催缴单时，血压瞬间清零。」',
  '「生前最后遗言：『兄弟们放心，这把胜率高达 88%，赢了我们直接全款拿下亚轨道太空发射场！』」',
  '「破产清算组公开信：逝者走得非常安详，至少他的每一分美金都原汤化原食地回馈了街头经济。」',
  '「在地中海私人游艇举杯狂欢仅 5 分钟后，因未能补缴 42 美元超额港务税，被当场依法宣布人生终结。」',
  '「他以为自己是天命所归的投资巨鳄，结果在暗巷遭遇了三名手持催缴计算器的职业财务稽查员。」',
  '「生前最高成就：曾在短短十分钟内坐拥千万资产，并在随后的三十秒内彻底回归无产阶级队伍。」',
  '「转世投胎处特别通报：鉴于你上一世折腾不息的顽强精神，下一世特批继续为你发放 $100 初始体验金！」'
];

export function getSatiricalEpitaph(cause=''){
  if(cause.includes('账单')||cause.includes('维护'))
    return '「死因鉴定：为了给豪华资产交齐高昂的管理费与特许税，连续 72 小时心跳剧烈波动，最终心肌被账单彻底压垮。」';
  if(cause.includes('暗杀')||cause.includes('帮派'))
    return '「死因鉴定：试图用 $100 初始资金的思维去白嫖地下势力的过桥贷款，被连夜装进麻袋运往公海。」';
  if(cause.includes('健康'))
    return '「死因鉴定：拼命赚钱却忘了按期光顾皇家健康抗衰诊所，身体零件全部报废，万贯家财只能留给下一任房客。」';
  if(cause.includes('现金')||cause.includes('破产'))
    return '「死因鉴定：盲目笃信『单车变火箭』的财富神话，最终在街角小吃摊前因为付不起一根香肠而含恨离场。」';
  return SATIRICAL_EPITAPHS[Math.floor(Math.random()*SATIRICAL_EPITAPHS.length)];
}


export function playDeathSound(){
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx) return;
    const ctx = new AudioCtx();
    if(ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const notes = [311.13, 293.66, 277.18, 261.63]; // Eb4 -> D4 -> C#4 -> C4 sad trombone
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const start = now + i * 0.32;
      const dur = i === 3 ? 0.95 : 0.3;
      osc.frequency.setValueAtTime(freq, start);
      if(i === 3){
        osc.frequency.linearRampToValueAtTime(207.65, start + dur);
      }
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.024, start + 0.04); // R16: -70%
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }catch(e){}
}

export async function playObituary(reduced=false, deathCause=''){
  if(!reduced) playDeathSound();
  const layer=document.createElement('div');
  layer.className='obituary-overlay';
  layer.setAttribute('role','status');
  layer.setAttribute('aria-live','assertive');

  const epitaph=getSatiricalEpitaph(deathCause);
  layer.innerHTML=`
    <div class="obituary-content-wrap">
      ${obituaryArt}
      <span class="news-kicker">FINANCIAL AFTERLIFE / 极乐财务清算处</span>
      <h2>资本离场，账单永生。</h2>
      <div class="obituary-epitaph">${epitaph}</div>
      <p class="obituary-sub">
        好消息：地府投胎办公室已完成审批。<br>
        下辈子你的启动资金依然是沉甸甸的 <strong>$100</strong>。
      </p>
      <div class="obituary-progress"></div>
      <button class="obituary-skip-btn" id="obituary-skip" data-action="skip-obituary">跳过悲伤 · 立即投胎 (SKIP) →</button>
    </div>
  `;
  document.body.append(layer);

  return new Promise(resolve=>{
    let timer;
    const finish=()=>{
      clearTimeout(timer);
      layer.classList.add('fade-out');
      setTimeout(()=>{layer.remove();resolve();},250);
    };
    layer.querySelector('#obituary-skip')?.addEventListener('click',finish);
    timer=setTimeout(finish,reduced?400:3600);
  });
}
