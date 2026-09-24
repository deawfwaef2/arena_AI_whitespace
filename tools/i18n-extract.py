# Extract user-visible Chinese text pieces from src/*.js into tools/i18n-todo.json (keys with {} placeholders).
import re,glob,json,os,sys
CJK=re.compile(r'[\u4e00-\u9fff]')
def strip_comments(t):
    t=re.sub(r'/\*.*?\*/','',t,flags=re.S)
    t=re.sub(r'(?m)^\s*//.*$','',t)
    return t
def scan(t,i,out):
    """t[i] is a quote. Parse literal, append bodies to out (nested first). Return index after closing quote."""
    q=t[i];j=i+1;n=len(t);buf=[]
    while j<n:
        d=t[j]
        if d=='\\': buf.append(t[j:j+2]);j+=2;continue
        if q=='`' and d=='$' and j+1<n and t[j+1]=='{':
            k=j+2;lvl=1
            while k<n and lvl:
                e=t[k]
                if e in '\'"`': k=scan(t,k,out);continue
                if e=='{':lvl+=1
                elif e=='}':lvl-=1
                k+=1
            buf.append('\x00');j=k;continue
        if d==q or (q!='`' and d=='\n'): break
        buf.append(d);j+=1
    out.append(''.join(buf));return j+1
def literals(t):
    out=[];i=0;n=len(t)
    while i<n:
        if t[i] in '\'"`': i=scan(t,i,out)
        else: i+=1
    return [(b,0) for b in out]
def pieces(body):
    # split on HTML tags; keep Chinese-containing parts
    for part in re.split(r'<[^>]*>',body):
        part=part.replace('\x00','{}')
        if not CJK.search(part): continue
        s=part.strip()
        # trim leading/trailing placeholders & punctuation that are not Chinese
        yield s
keys={}
PAIR=re.compile(r"'[^'\n]*[\u4e00-\u9fff][^'\n]*'\s*,\s*['\"][A-Za-z\"“]")
for f in sorted(glob.glob('src/*.js')):
    if f.endswith('i18n-en.js'):continue
    t=strip_comments(open(f).read())
    # remove zh strings that are paired with an English sibling
    t=re.sub(r"this\.T\(\s*(['`])(?:\\.|(?!\1).)*\1",'this.T(0',t)
    t=PAIR.sub(lambda m:"0,'"+m.group(0)[-1] if m.group(0)[-1]!="'" else "0,'",t)
    t=re.sub(r"\bzh\s*:\s*'[^'\n]*'",'zh:0',t)
    for body,_ in literals(t):
        if not CJK.search(body):continue
        for s in pieces(body):
            if s and len(s)<600: keys.setdefault(s,f)
print(len(keys),sum(len(k) for k in keys))
json.dump(keys,open('tools/i18n-keys.json','w'),ensure_ascii=False,indent=0)
