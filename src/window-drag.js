// All coordinates here use vscale-boot's virtual viewport. Do NOT divide by
// __vscale again: clientX/Y and getBoundingClientRect are already virtualised.
const PROPS=['position','width','height','max-height','left','top','right','bottom','translate','transform','margin'];
export function resetWindowPosition(el){
 if(!el)return;
 for(const k of PROPS)el.style.removeProperty(k);
 el.classList.remove('dragging');delete el.dataset.moved;
}
const clamp=(n,a,b)=>Math.max(a,Math.min(Math.max(a,b),n));
export function bindWindowDrag(){
 let drag=null,suppressClick=false;
 const end=()=>{
  const d=drag;if(!d)return;drag=null;
  d.win.classList.remove('dragging');
  try{if(d.handle.hasPointerCapture(d.id))d.handle.releasePointerCapture(d.id);}catch{}
 };
 document.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.isPrimary===false)return;
  suppressClick=false;
  const handle=e.target.closest?.('.v7-handle');
  if(!handle||e.target.closest('button,input,select,textarea,a,[role="button"]'))return;
  const win=handle.closest('.v7-draggable');
  if(!win||win.closest('[hidden],[inert]'))return;
  end();const r=win.getBoundingClientRect();
  drag={win,handle,id:e.pointerId,x:e.clientX,y:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,moved:false};
  try{handle.setPointerCapture(e.pointerId);}catch{}
  e.preventDefault();e.stopPropagation();
 },true);
 document.addEventListener('pointermove',e=>{
  const d=drag;if(!d||e.pointerId!==d.id)return;
  if(!d.win.isConnected||!d.handle.isConnected||d.win.closest('[hidden],[inert]')){end();return;}
  if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<6)return;
  const w=d.win;
  if(!d.moved){
   d.moved=true;suppressClick=true;
   // Relative flex items cannot take absolute screen coordinates: that was
   // adding the centred position twice on every tiny title-bar movement.
   const width=w.offsetWidth,height=w.offsetHeight;
   w.getAnimations().forEach(a=>a.cancel());
   for(const [k,v] of Object.entries({position:'absolute',width:width+'px',height:height+'px','max-height':height+'px',right:'auto',bottom:'auto',translate:'none',transform:'none',margin:'0',left:'0px',top:'0px'}))w.style.setProperty(k,v,'important');
   w.classList.add('dragging');w.dataset.moved='1';
  }
  const r=w.getBoundingClientRect();
  const x=clamp(e.clientX-d.dx,8,innerWidth-r.width-8);
  const y=clamp(e.clientY-d.dy,8,innerHeight-r.height-8);
  // Correct from the actual laid-out rectangle, including offset-parent
  // padding and any CSS zoom, rather than assuming the parent's origin.
  const sx=r.width/(w.offsetWidth||r.width)||1,sy=r.height/(w.offsetHeight||r.height)||1;
  const left=parseFloat(w.style.left)||0,top=parseFloat(w.style.top)||0;
  w.style.setProperty('left',left+(x-r.left)/sx+'px','important');
  w.style.setProperty('top',top+(y-r.top)/sy+'px','important');
  e.preventDefault();
 },{passive:false});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(ev,e=>{if(drag?.id===e.pointerId)end();},true);
 document.addEventListener('click',e=>{if(suppressClick){suppressClick=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',end);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)end();});
 document.addEventListener('upshift-modal-reset',end);
 window.addEventListener('resize',()=>{end();document.querySelectorAll('.v7-draggable[data-moved]').forEach(resetWindowPosition);});
}
