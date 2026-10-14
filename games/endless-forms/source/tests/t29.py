import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
import re
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out=[]; const M=TB.REG.many; M.GOAL=99;
      for(const [VA,NZ,CO] of [[0.45,0.12,0.015],[0.35,0.08,0.015],[0.35,0.08,0.025],[0.25,0.06,0.02]]){ M.VA=VA; M.NZ=NZ; M.CO=CO; const row={set:[VA,NZ,CO]};
        for(const K of [3,8,20,50,110]){ const mg=[]; let lost=0; for(let rep=0;rep<10;rep++){ TB.Cards.close(); TB.App.play(M); M.lv=0; M.beginLevel(); let g=0; while(M.lv===0 && g++<40){ M.settle(); let k=0; while(M.atBottom().length<K && k++<600) M.update(0.02); M.transfer(); } if(/lost/.test(M.res[0].note)) lost++; else mg.push(M.meanG()); } row['K'+K]=[mg.length?+(mg.reduce((a,b)=>a+b,0)/mg.length).toFixed(1):0, lost]; } out.push(row); }
      const l2={}; for(const MU of [0.035,0.06,0.08]){ M.MU2=MU; for(const pol of ['police','ignore']){ let pass=0; for(let rep=0;rep<10;rep++){ TB.Cards.close(); TB.App.play(M); M.lv=1; M.beginLevel(); let k=0; while(!M.done2 && k++<5000){ M.update(0.05); if(pol==='police') for(let i=M.cells.length-1;i>=0;i--) if(M.cells[i].ch){ M.cells.splice(i,1); M.kills++; } } if(M.res.at(-1).pass) pass++; } l2['MU'+MU+' '+pol]=pass; } } out.push(l2);
      TB.Cards.close(); return out; }""")
    b.close()
for row in r: print(row)
# choose L1 set: maximise best-K meanG while extremes (K=3 lost often, K=110 low meanG)
best=None
for row in r[:-1]:
    ks={k:v for k,v in row.items() if k.startswith('K')}
    bestK=max(ks, key=lambda k: ks[k][0] if ks[k][1]<=2 else 0)
    bm=ks[bestK][0]; late=ks['K110'][0]
    score=bm-late
    if best is None or score>best[0]: best=(score,row['set'],bestK,bm,late)
print('chosen L1', best)
_,(VA,NZ,CO),bk,bm,late=best
goal=max(4, round((bm*0.8+late*0.2)*2)/2)  # between best and late
l2=r[-1]; mu=min([m for m in [0.035,0.06,0.08] if l2['MU%s police'%m]>=9 and l2['MU%s ignore'%m]<=2] or [0.08])
print('goal', goal, 'MU2', mu)
s=open(SRC+'/ch24.js').read()
s=s.replace("VA: 0.45, NZ: 0.12, CO: 0.015, GOAL: 12, MU2: 0.035,","VA: %s, NZ: %s, CO: %s, GOAL: %s, MU2: %s,"%(VA,NZ,CO,goal,mu))
s=s.replace("Level 1: average cluster size of 12 cells within ten days","Level 1: average cluster size of %s cells within ten days"%goal)
s=s.replace("'Average cluster: <b>' + mg.toFixed(1) + ' cells</b> (goal 12).'","'Average cluster: <b>' + mg.toFixed(1) + ' cells</b> (goal ' + this.GOAL + ').'")
s=s.replace("['Average cluster', this.meanG().toFixed(1) + ' cells', 'Goal 12.']","['Average cluster', this.meanG().toFixed(1) + ' cells', 'Goal ' + this.GOAL + '.']")
s=s.replace("['Mutation to cheating', '3.5% of divisions', '']","['Mutation to cheating', pct(this.MU2) + ' of divisions', '']")
s=s.replace("'Growth of a 1-cell vs 12-cell lineage', (Math.pow(1.915, 5)).toFixed(0) + '× vs ' + (Math.pow(1.53, 5)).toFixed(0) + '× a day'","'Growth of a 1-cell vs 12-cell lineage', Math.pow(1.95 - this.CO, 5).toFixed(0) + '× vs ' + Math.pow(1.95 - 12 * this.CO, 5).toFixed(0) + '× a day'")
open(SRC+'/ch24.js','w').write(s)
print(re.findall(r"VA: [\d.]+, NZ: [\d.]+, CO: [\d.]+, GOAL: [\d.]+, MU2: [\d.]+,", s))
