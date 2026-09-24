/* R14 phone layout (inline, runs before anything else).
   Phones in landscape render the game on a virtual desktop canvas (~920 px tall) and the whole <body> is
   scaled down with a CSS transform. This does NOT depend on the browser honouring <meta viewport> changes,
   so it also works inside iframes (CrazyGames), iOS Safari after rotation and in-app browsers.
   Coordinates are virtualised (innerWidth/innerHeight, clientX/Y, getBoundingClientRect, elementFromPoint)
   so all existing layout / drag / raycast code keeps working in virtual pixels. Width/height media queries
   are disabled while scaled (build.mjs prefixes them with html:not([data-vscale])). */
(function(){
 var VH=920,MINW=1360,html=document.documentElement,s=1,VW=0,on=false;
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
 function fit(){
  var c=matchMedia('(pointer:coarse)').matches,W=rW(),H=rH(),S=Math.min(screen.width,screen.height);
  var want=c&&S<700&&W>H*1.15&&H<700;
  if(!want){if(on){on=false;html.removeAttribute('data-vscale');window.__vdesk=0;['--u-vh','--u-vw','--u-vmin','--u-vmax'].forEach(function(k){html.style.removeProperty(k);});}return;}
  s=H/VH;VW=Math.max(MINW,Math.round(W/s));if(VW>Math.round(W/s)){s=W/VW;}
  on=true;window.__vdesk=1;window.__vscale=s;html.setAttribute('data-vscale','1');
  html.style.setProperty('--vs',s);html.style.setProperty('--vw',VW+'px');html.style.setProperty('--vh',VH+'px');html.style.setProperty('--u-vh',VH/100+'px');html.style.setProperty('--u-vw',VW/100+'px');html.style.setProperty('--u-vmin',Math.min(VW,VH)/100+'px');html.style.setProperty('--u-vmax',Math.max(VW,VH)/100+'px');
 }
 fit();window.__vfit=fit;var tm;
 function later(){clearTimeout(tm);tm=setTimeout(function(){var o=on+':'+s;fit();if(o!==on+':'+s)dispatchEvent(new Event('resize'));},200);}
 addEventListener('orientationchange',later);addEventListener('resize',later,true);
})();
