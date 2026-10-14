import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
import re
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out=[]; const L=TB.REG.lock; const pol={opt:(h2)=>h2.indexOf(Math.max(...h2)), common:()=>L.h.indexOf(Math.max(...L.h)), lastbest:()=>L.q.indexOf(Math.min(...L.q))};
      for(const [a,bq] of [[3,3],[4,4],[5,5],[6,6],[4,6],[6,4]]){ L.SA=a; L.SB=bq; const row={a,bq}; for(const [n,f] of Object.entries(pol)){ TB.Cards.close(); TB.App.play(L); L.lv=0; L.beginLevel(); while(L.t<L.N){ const [h2]=L.next1(); L.pick1(f(h2)); } row[n]=+(L.got/L.best).toFixed(2); } out.push(row); } TB.Cards.close(); return out; }""")
    b.close()
for row in r: print(row)
best=min(r, key=lambda z: z['common'] + 0.5*z['lastbest'])
print('chosen', best)
s=open(SRC+'/ch22.js').read()
s=s.replace("SA: 4, SB: 4,","SA: %d, SB: %d,"%(best['a'],best['bq']))
s=s.replace("Each season a host type loses fitness in proportion to the parasites matching it: h′ ∝ h (1 − 0.63 q). Parasites grow with their matching hosts: q′ ∝ q h.","Each season a host type loses fitness steeply with the share of parasites matching it: h′ ∝ h × e^(−%dq). Parasites grow with their matching hosts: q′ ∝ q × e^(%dh)."%(best['a'],best['bq']))
s=s.replace("'Each host type loses 63% × its matching parasite share.'","'Next season: h′ ∝ h × e^(−%dq), then rescaled to sum to 100%%.'"%best['a'])
open(SRC+'/ch22.js','w').write(s)
print(re.findall(r"SA: \d+, SB: \d+,", s), s.count("e^(−%dq)"%best['a']))
