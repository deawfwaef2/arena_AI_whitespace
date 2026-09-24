export const icons={
 arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
 up:'<path d="M5 17 18 4M7 4h11v11M5 8V4h3M14 20h6v-6"/>',
 rank:'<path d="M8 4h8v5a4 4 0 0 1-8 0Zm0 2H4v2a4 4 0 0 0 5 4m7-6h4v2a4 4 0 0 1-5 4M12 13v5m-5 2h10m-8-2h6"/>',
 estate:'<path d="M4 20V9l7-5 7 5v11M1 20h22M8 20v-6h6v6M8 9h6M8 11h6m10 9V3l-5 2"/>',
 shirt:'<path d="m8 4-5 2-2 5 5 2v7h12v-7l5-2-2-5-5-2a4 4 0 0 1-8 0Z"/>',
 settings:'<path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3Z"/><circle cx="12" cy="11" r="3"/>',
 sound:'<path d="M4 9h4l5-4v14l-5-4H4Zm12-2q5 5 0 10m3-13q8 8 0 16"/>',
 mute:'<path d="M4 9h4l5-4v14l-5-4H4Zm12 0 5 6m0-6-5 6"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M15 8h-5a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9m3-10v12"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
 diamond:'<path d="m7 4-5 6 10 12 10-12-5-6Zm-5 6h20M7 4l5 18 5-18M7 4l5 6 5-6"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
 sparkle:'<path d="m10 2 2.6 7.4L20 12l-7.4 2.6L10 22l-2.6-7.4L0 12l7.4-2.6Zm9-1 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 history:'<path d="M4 9a9 9 0 1 1 0 6M4 3v6h6m2-3v6l4 2"/>',
 lab:'<path d="M8 3h8m-6 0v7L4 20q-1 1 1 1h14q2 0 1-1l-6-10V3M7 16h10"/>',
 reset:'<path d="M4 9a8 8 0 1 1 0 7M4 3v6h6"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 4 3q-1 1-1 3m0 3v.1"/>',
 crown:'<path d="m3 7 4 4 5-8 5 8 4-4-2 13H5Zm2 9h14"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>'
};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.diamond}</svg>`;
export const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function assetIcon(asset){const c=asset.color;return `<svg viewBox="0 0 100 86" aria-hidden="true"><ellipse cx="50" cy="73" rx="37" ry="8" fill="${c}" opacity=".13"/><path d="m14 55 34-18 38 17-35 22Z" fill="#aab8a4" opacity=".3"/><path d="m28 55 24 12V${20+Math.max(0,5-asset.tier)*4}L28 24Z" fill="${c}"/><path d="m52 67 22-13V25L52 ${20+Math.max(0,5-asset.tier)*4}Z" fill="${c}" opacity=".6"/><path d="m28 24 22-12 24 13-22 12Z" fill="${c}" opacity=".85"/><path d="m36 34 8 4m-8 6 8 4m-8 6 8 4m16-21 7-4m-7 14 7-4m-7 14 7-4" stroke="#eef2e5" stroke-width="3" opacity=".65"/></svg>`;}
export function outfitIcon(outfit){return `<svg viewBox="0 0 80 88" aria-hidden="true"><ellipse cx="40" cy="79" rx="22" ry="4" fill="#9db19c" opacity=".15"/><path d="M34 55v18m12-18v18" stroke="#e7e9df" stroke-width="10" stroke-linecap="round"/><path d="m24 34-7 21m39-21 7 21" stroke="#e7e9df" stroke-width="8" stroke-linecap="round"/><rect x="25" y="29" width="30" height="31" rx="12" fill="${outfit.color}"/><circle cx="40" cy="19" r="14" fill="#eeeee5"/><circle cx="36" cy="20" r="1.5" fill="#546257"/><circle cx="44" cy="20" r="1.5" fill="#546257"/>${outfit.kind==='plain'?'':`<path d="m34 31 6 7 6-7" fill="none" stroke="${outfit.trim}" stroke-width="3"/>`}</svg>`;}

Object.assign(icons,{
 timer:'<circle cx="12" cy="14" r="8"/><path d="M9 2h6M12 2v4m6 2 2-2M12 10v5l3 2"/>',
 bag:'<path d="M5 8h14l1 13H4Zm3 0V6a4 4 0 0 1 8 0v2"/>',
 music:'<path d="M9 17V5l11-3v13M9 8l11-3"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
 risk:'<path d="m12 3 10 18H2Zm0 6v5m0 3v1"/>',
 fire:'<path d="M13 2c3 7-3 6-1 11 2-1 3-3 3-5 7 7 4 14-3 14S1 15 8 8c-1 5 3 4 5-6Z"/>',
 pause:'<path d="M8 4v16M16 4v16"/>',
 play:'<path d="m7 3 14 9-14 9Z"/>',
 check:'<path d="m5 12 4 4L19 6"/>'
});
export const shell=`
<div class="game" id="game">
 <div class="sky-backdrop"></div>
 <div id="world" class="world-canvas"></div>
 <div class="world-vignette"></div><div class="sky-cloud-layer" aria-hidden="true"><i></i><i></i><i></i></div>
 <div id="swipe-surface" class="swipe-surface" aria-label="Swipe right to walk to the next event"></div>
 <div class="portrait-hud">
  <header class="top-hud">
   <div class="cash-hud" aria-label="Available game cash"><span class="cash-coin">${icon('coin')}</span><div><span class="cash-label" id="cash-label">YOUR CASH</span><strong id="cash-value">$100</strong></div></div>
   <button class="hud-round small scale-quick-btn" data-action="quick-scale" id="quick-scale-btn" title="点击缩放界面大小" aria-label="缩放界面大小">100%</button>
   <button class="hud-round" data-action="menu" id="menu-button" aria-label="Pause and open menu">${icon('settings')}</button>
  </header>
  <div class="route-hud"><div class="route-pill"><span class="route-dot"></span><span id="page-label">STOP 001</span></div><button class="hud-chip" data-action="leaderboard" id="rank-button">${icon('rank')}<span>RANKS</span></button><button class="hud-round small" id="music-button" data-action="music-toggle" aria-label="Toggle background music">${icon('music')}</button></div>
  <button id="challenge-hud" class="challenge-hud" data-action="challenge-details" hidden aria-label="Active timed challenge"></button>
  <div class="test-badge" id="test-badge" hidden>TEST RUN · UNRANKED</div>
 </div>
 <div class="street-title"><span>BROKE TO BILLIONAIRE</span><small id="tier-label">STREET LEVEL</small></div>
 <div class="avatar-tag" id="avatar-tag"><span></span><strong id="avatar-name">YOU</strong></div>
 <div class="scene-toast" id="scene-toast" role="status" aria-live="polite"></div>
 <div class="discovery" id="discovery" aria-live="polite"></div>
 <div id="game-dock" class="game-dock" aria-label="Current opportunity"></div>
 <div class="world-prompt" id="swipe-cue"><span>SWIPE RIGHT TO MOVE</span>${icon('arrow')}</div>
 <div class="prestige-frame" aria-hidden="true"></div>
 <div id="transition-cover" class="transition-cover"></div>
</div>
<canvas id="effects" aria-hidden="true"></canvas>
<div class="toast-stack" id="toast-stack" role="status" aria-live="polite"></div>
<div id="modal" class="modal-overlay" hidden><section id="modal-card" class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"></section></div>
<div class="sr-only" id="announcement" aria-live="polite"></div>
`;
