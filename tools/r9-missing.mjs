// Round 9: static audit — every CJK string literal in src/ that the runtime translator cannot fully translate.
import fs from 'node:fs';
globalThis.document=undefined;
const {tr}=await import('../src/i18n.js');
const CJK=/[\u3400-\u9fff]/;const out=new Map();
for(const f of fs.readdirSync('src')){if(!f.endsWith('.js')||f==='i18n-en.js')continue;const s=fs.readFileSync('src/'+f,'utf8');
 const re=/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;let m;
 while((m=re.exec(s))){let v=m[1]??m[2]??m[3];if(!CJK.test(v))continue;
  const after=s.slice(m.index+m[0].length,m.index+m[0].length+400),before=s.slice(Math.max(0,m.index-400),m.index);
  const asciiLit=/^\s*(?:,|\]\s*,|\}\s*,)?\s*(?:en\s*:\s*)?(['"`])(?:(?!\1)[^\u3400-\u9fff\n])*[A-Z ](?:(?!\1)[^\u3400-\u9fff\n])*\1/;
  const beforeLit=/(['"`])(?:(?!\1)[^\u3400-\u9fff\n])*[A-Za-z](?:(?!\1)[^\u3400-\u9fff\n])*\1\s*,\s*$/;
  if(asciiLit.test(after)||beforeLit.test(before)||/en\s*:\s*['"`][^'"`]*$/.test(before.slice(-200))&&false)continue;
  const segs=m[3]!=null?v.split(/\$\{[^}]*\}/):[v];
  // for templates, test the whole with {} placeholders too
  const cand=m[3]!=null?[v.replace(/\$\{[^}]*\}/g,'{}')]:[v];
  for(const c of cand){for(const piece of c.split(/<[^>]+>/)){const p=piece.trim();if(!p||!CJK.test(p))continue;const t=tr(p.replace(/\{\}/g,'7'));if(CJK.test(t))out.set(p,f);}}
 }}
fs.writeFileSync('tools/r9-missing.txt',[...out].map(([k,f])=>f+'\t'+k).join('\n'));console.log(out.size);
