import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
import json, re
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    import subprocess; subprocess.run(['python3','build.py'],capture_output=True)
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out=[]; const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
      const F=TB.REG.fruits; TB.App.play(F); out.push({fruits:F.EXP.flat().map(E=>F.cat(F.sim(E).at(-1).corr)).join(',')});
      const D=TB.REG.double; for(const [PR,SELF,VIG,V3] of [[1,0.5,1.6,0.15],[1,0.5,1.8,0.1],[1,0.6,1.8,0.1],[1,0.5,2.0,0.1],[1,0.6,2.0,0.05]]){ D.PR=PR; D.SELF=SELF; D.VIG=VIG; D.V3=V3; const res={clump:[],scatter:[]}; for(const mode of Object.keys(res)) for(let rep=0;rep<16;rep++){ TB.Cards.close(); TB.App.play(D); D.lv=0; D.begin1(); const cells = mode==='clump' ? [52,53,54,64,65,66,76,77,78,41] : shuffle([...Array(120).keys()]).slice(0,10); cells.forEach(k=>{D.g[k]=4;}); D.placed=10; for(let g=0;g<12;g++) D.step1(); res[mode].push(D.frac(4)); } out.push({set:[PR,SELF,VIG,V3], clump:res.clump.sort((a,b)=>a-b), scatter:res.scatter.sort((a,b)=>a-b)}); }
      TB.Cards.close(); return out; }""")
    b.close()
print('fruits categories:', r[0]['fruits'])
best=None
for e in r[1:]:
    c,s=e['clump'],e['scatter']
    T=max(0.1, int(c[4]*20)/20)   # ~70% of clumped runs pass
    sp=sum(x>=T for x in s); cp=sum(x>=T for x in c)
    print(e['set'], 'T=%.2f clump pass %d/16 scatter pass %d/16 clump median %.2f scatter median %.2f'%(T,cp,sp,c[8],s[8]))
    score=cp-sp
    if best is None or score>best[0]: best=(score,e['set'],T,int(c[11]*20)/20)
print('chosen', best)
_,(PR,SELF,VIG,V3),T,G=best
s=open(SRC+'/ch20.js').read()
s=s.replace("PR: 1, SELF: 0.3, VIG: 1.4, V3: 0.3,","PR: %d, SELF: %s, VIG: %s, V3: %s,"%(PR,SELF,VIG,V3))
s=s.replace("const f = this.frac(4), pass = f >= 0.25;","const f = this.frac(4), pass = f >= %s;"%T)
s=s.replace("great: f >= 0.4,","great: f >= %s,"%max(G,T+0.05))
s=s.replace("<em style=\"left:calc(25% - 1px)\"></em>","<em style=\"left:calc(%d%% - 1px)\"></em>"%round(T*100))
s=s.replace("goal: 'Level 1: tetraploids make up at least a quarter of the meadow at the end. Level 2: make a fertile hybrid and answer its question. A third star for level 1 above 40%.'","goal: 'Level 1: tetraploids make up at least %d%% of the meadow at the end. Level 2: make a fertile hybrid and answer its question. A third star for level 1 above %d%%.'"%(round(T*100),round(max(G,T+0.05)*100)))
s=s.replace("['Tetraploids', pct(this.frac(4)), 'Goal 25%; third star 40%.']","['Tetraploids', pct(this.frac(4)), 'Goal %d%%; third star %d%%.']"%(round(T*100),round(max(G,T+0.05)*100)))
s=s.replace("['Selfing', '30% of seeds',","['Selfing', '%d%% of seeds',"%round(SELF*100))
s=s.replace("(or its own pollen, 30% of the time).","(or its own pollen, %d%% of the time)."%round(SELF*100))
open(SRC+'/ch20.js','w').write(s)
print(re.findall(r"PR: \d, SELF: [\d.]+, VIG: [\d.]+, V3: [\d.]+,", s), re.findall(r"pass = f >= [\d.]+", s))
