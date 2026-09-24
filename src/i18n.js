// Runtime zh→en translator. When English is active, every Chinese text node / attribute
// rendered anywhere in the page is translated through the generated dictionary.
import PAIRS from './i18n-en.js';

const CJK=/[\u3400-\u9fff\uf900-\ufaff]/;
const norm=s=>s.replace(/\s+/g,' ').trim();
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const exact=new Map();const templates=[];const subs=[];
for(const [zh,en] of PAIRS){
  const k=norm(zh);if(!k)continue;
  if(k.includes('{}')){
    const parts=k.split('{}');const lit=parts.join('');const cjk=(lit.match(/[\u3400-\u9fff]/g)||[]).length;
    const body=parts.map(esc);
    const anchored=new RegExp('^'+body.join('(.+?)')+'$');
    let loose=null;if(cjk>=2){const g='([^\\u3400-\\u9fff]+?)';let src=body.join(g);if(parts[parts.length-1]==='')src=src.slice(0,-g.length)+'([^\\u3400-\\u9fff]+)';loose=new RegExp(src,'g');}
    templates.push({anchored,loose,en:norm(en),w:lit.length});
  }else{exact.set(k,norm(en)===en.trim()?en.trim():en.trim());if([...k].length>=2&&CJK.test(k))subs.push(k);}
}
templates.sort((a,b)=>b.w-a.w);
subs.sort((a,b)=>b.length-a.length);
const subRe=subs.length?new RegExp(subs.map(esc).join('|'),'g'):null;
const fill=(en,vals)=>{let i=0;return en.replace(/\{\}/g,()=>{const v=vals[i++]??'';return CJK.test(v)?tr(v):v;});};
const PUNCT={'，':', ','。':'. ','：':': ','；':'; ','！':'! ','？':'? ','（':' (','）':') ','「':'"','」':'"','『':'"','』':'"','、':', ','《':'"','》':'"','“':'"','”':'"','‘':"'",'’':"'",'…':'…','——':' — ','～':'~','　':' '};
function tidy(s){return s.replace(/——|[，。：；！？（）「」『』、《》“”‘’～　]/g,m=>PUNCT[m]??m).replace(/ {2,}/g,' ').replace(/ ([,.:;!?)])/g,'$1').replace(/\( /g,'(');}
const cache=new Map();
export const missing=new Set();
export function tr(input){
  if(!input||!CJK.test(input))return input;
  const hit=cache.get(input);if(hit!==undefined)return hit;
  const lead=input.match(/^\s*/)[0],trail=input.match(/\s*$/)[0];
  const k=norm(input);let out=exact.get(k);
  if(out===undefined){for(const t of templates){const m=k.match(t.anchored);if(m){out=fill(t.en,m.slice(1));break;}}}
  if(out===undefined){
    let s=k;
    for(const t of templates){if(t.loose&&CJK.test(s)){t.loose.lastIndex=0;s=s.replace(t.loose,(...a)=>{const vals=a.slice(1,-2);return fill(t.en,vals);});}}
    if(subRe&&CJK.test(s))s=s.replace(subRe,m=>' '+exact.get(m)+' ');
    out=s;
  }
  out=tidy(out).trim();
  if(CJK.test(out)){missing.add(k);try{(globalThis.__i18nMissing||(globalThis.__i18nMissing=new Set())).add(k);}catch{}}
  out=lead+out+trail;
  if(cache.size>20000)cache.clear();cache.set(input,out);cache.set(out,out);return out;
}
const done=new WeakMap();
const ATTRS=['title','placeholder','aria-label','alt','data-tip'];
function walk(node){
  if(node.nodeType===3){const v=node.nodeValue;if(done.get(node)!==v&&CJK.test(v)){const t=tr(v);done.set(node,t);if(t!==v)node.nodeValue=t;}return;}
  if(node.nodeType!==1)return;
  if(node.hasAttribute&&node.hasAttribute('data-notr'))return;const tag=node.nodeName;if(tag==='SCRIPT'||tag==='STYLE'||tag==='TEXTAREA')return;
  for(const a of ATTRS){const v=node.getAttribute&&node.getAttribute(a);if(v&&CJK.test(v)){const t=tr(v);if(t!==v)node.setAttribute(a,t);}}
  if(tag==='INPUT'){const v=node.value;if((node.type==='button'||node.type==='submit')&&CJK.test(v))node.value=tr(v);}
  for(let c=node.firstChild;c;c=c.nextSibling)walk(c);
}
let observer=null,active=false,getLang=()=> 'zh';
function onMut(list){
  if(!active)return;
  for(const m of list){
    if(m.type==='characterData')walk(m.target);
    else if(m.type==='attributes')walk(m.target);
    else for(const n of m.addedNodes)walk(n);
  }
}
export function syncLanguage(){
  const en=getLang()==='en';
  if(en===active)return;active=en;
  if(en){walk(document.body);if(document.title&&CJK.test(document.title))document.title=tr(document.title);
    observer=observer||new MutationObserver(onMut);
    observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});}
  else if(observer){observer.disconnect();}
}
export function installI18n(langGetter){
  getLang=langGetter;globalThis.__tr=tr;globalThis.__i18nSync=syncLanguage;
  const start=()=>{syncLanguage();setInterval(syncLanguage,400);};
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
}
