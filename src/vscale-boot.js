/* R14 phone layout (inline, runs before anything else).
   Phones in landscape render the game on a virtual desktop canvas (~920 px tall) and the whole <body> is
   scaled down with a CSS transform. This does NOT depend on the browser honouring <meta viewport> changes,
   so it also works inside iframes (CrazyGames), iOS Safari after rotation and in-app browsers.
   Coordinates are virtualised (innerWidth/innerHeight, clientX/Y, getBoundingClientRect, elementFromPoint)
   so all existing layout / drag / raycast code keeps working in virtual pixels. Width/height media queries
   are disabled while scaled (build.mjs prefixes them with html:not([data-vscale])). */
(function(){
 var VH=920,html=document.documentElement,s=1,VW=0,on=false;
 function desc(o,k){return Object.getOwnPropertyDescriptor(o,k);}
 var dW=desc(window,'innerWidth')||desc(Window.prototype,'innerWidth'),dH=desc(window,'innerHeight')||desc(Window.prototype,'innerHeight');
 var rW=function(){return dW&&dW.get?dW.get.call(window):html.clientWidth;},rH=function(){return dH&&dH.get?dH.get.call(window):html.clientHeight;};
 try{
  Object.defineProperty(window,'innerWidth',{configurable:true,get:function(){return on?VW:rW();}});
  Object.defineProperty(window,'innerHeight',{configurable:true,get:function(){return on?VH:rH();}});
  var mx=desc(MouseEvent.prototype,'clientX'),my=desc(MouseEvent.prototype,'clientY');
  Object.defineProperty(MouseEvent.prototype,'clientX',{configurable:true,get:function(){var v=mx.get.call(this);return on?v/s:v;}});
  Object.defineProperty(MouseEvent.prototype,'clientY',{configurable:true,get:function(){var v=my.get.call(this);return on?v/s:v;}});
  if(window.Touch){var tx=desc(Touch.prototype,'clientX'),ty=desc(Touch.prototype,'clientY');
   Object.defineProperty(Touch.prototype,'clientX',{configurable:true,get:function(){var v=tx.get.call(this);return on?v/s:v;}});
   Object.defineProperty(Touch.prototype,'clientY',{configurable:true,get:function(){var v=ty.get.call(this);return on?v/s:v;}});}
  var gb=Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect=function(){var r=gb.call(this);return on?new DOMRect(r.x/s,r.y/s,r.width/s,r.height/s):r;};
  var efp=Document.prototype.elementFromPoint;Document.prototype.elementFromPoint=function(x,y){return on?efp.call(this,x*s,y*s):efp.call(this,x,y);};
  var efps=Document.prototype.elementsFromPoint;if(efps)Document.prototype.elementsFromPoint=function(x,y){return on?efps.call(this,x*s,y*s):efps.call(this,x,y);};
 }catch(e){}
 // R15: evaluate the build-time list of size media conditions against the virtual canvas.
 function mq(W,H){var L=window.__MQ||[],on=[];for(var i=0;i<L.length;i++){var ors=L[i].split(','),hit=false;for(var o=0;o<ors.length&&!hit;o++){var ok=true,parts=ors[o].split(/\)\s*and\s*\(|\band\b/);for(var k=0;k<parts.length;k++){var f=parts[k].replace(/[()\s]/g,'');if(!f)continue;var m=f.match(/^(min|max)-(width|height):([\d.]+)px$/);if(m){var v=m[2]==='width'?W:H,n=+m[3];if(m[1]==='min'?v<n:v>n)ok=false;}else{var r=f.match(/^orientation:(landscape|portrait)$/);if(r){if((r[1]==='landscape')!==(W>=H))ok=false;}else ok=false;}}if(ok)hit=true;}if(hit)on.push('q'+i);}return on.join(' ');}
 function off(){if(on){on=false;html.removeAttribute('data-vscale');html.removeAttribute('data-mq');window.__vdesk=0;window.__vscale=1;['--u-vh','--u-vw','--u-vmin','--u-vmax'].forEach(function(k){html.style.removeProperty(k);});}}
 function fit(){
  var c=matchMedia('(pointer:coarse)').matches,W=rW(),H=rH(),S=Math.min(screen.width,screen.height),mode='';
  // Phone landscape: a SHORT virtual canvas (560px) so text/buttons stay readable (R14 used 920px = too small).
  if(c&&S<700&&W>H*1.15&&H<700){mode='phone';VH=560;s=H/VH;VW=Math.round(W/s);if(VW<1080){s=W/1080;VW=1080;VH=Math.round(H/s);}}
  // Desktop/tablet: enlarge the whole UI up to 30%, but keep at least a 1180x700 virtual canvas so nothing overflows.
  else if(!c||S>=700){var z=Math.min(1.3,H/700,W/1180);if(z>1.04){mode='desk';s=z;VW=Math.round(W/s);VH=Math.round(H/s);}}
  if(!mode)return off();
  on=true;window.__vdesk=mode==='phone'?1:0;window.__vscale=s;html.setAttribute('data-vscale',mode);html.setAttribute('data-mq',mq(VW,VH));
  html.style.setProperty('--vs',s);html.style.setProperty('--vw',VW+'px');html.style.setProperty('--vh',VH+'px');html.style.setProperty('--u-vh',VH/100+'px');html.style.setProperty('--u-vw',VW/100+'px');html.style.setProperty('--u-vmin',Math.min(VW,VH)/100+'px');html.style.setProperty('--u-vmax',Math.max(VW,VH)/100+'px');
 }
 fit();window.__vfit=fit;var tm;
 function later(){clearTimeout(tm);tm=setTimeout(function(){var o=on+':'+s;fit();if(o!==on+':'+s)dispatchEvent(new Event('resize'));},200);}
 addEventListener('orientationchange',later);addEventListener('resize',later,true);
})();
