import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
      const F=TB.REG.fruits; TB.App.play(F); for(const KA of [0.4,0.5]){ F.KA=KA; out['fruits KA'+KA]=F.EXP.flat().map(E=>{ const H=F.sim(E); return H.at(-1).corr.toFixed(2)+'/'+H.at(-1).apple.toFixed(2); }).join(' | '); }
      F.KA=0.4; out['swarm s sweep']=[0.3,0.5,0.7,0.9].map(s=>F.sim({fruit:false,r:0.5,s,c:0.9}).at(-1).corr.toFixed(2)).join(','); out['fruit s sweep']=[0.05,0.1,0.2,0.3,0.5,0.7].map(s=>F.sim({fruit:true,r:0.5,s,c:0.9}).at(-1).corr.toFixed(2)).join(',');
      const D=TB.REG.double; for(const [PR,SELF,VIG,V3] of [[1,0.3,1.4,0.3],[1,0.4,1.5,0.2],[1,0.2,1.3,0.3],[2,0.4,1.5,0.2]]){ D.PR=PR; D.SELF=SELF; D.VIG=VIG; D.V3=V3; const res={clump:[],scatter:[]}; for(const mode of Object.keys(res)) for(let rep=0;rep<16;rep++){ TB.Cards.close(); TB.App.play(D); D.lv=0; D.begin1(); const cells = mode==='clump' ? [52,53,54,64,65,66,76,77,78,41] : shuffle([...Array(120).keys()]).slice(0,10); cells.forEach(k=>{D.g[k]=4;}); D.placed=10; for(let g=0;g<12;g++) D.step1(); res[mode].push(D.frac(4)); } out['double '+[PR,SELF,VIG,V3].join('/')]=Object.entries(res).map(([k,v])=>k+' '+(v.reduce((a,b)=>a+b,0)/16).toFixed(2)+' pass '+v.filter(x=>x>=0.25).length+' great '+v.filter(x=>x>=0.4).length).join(' | '); }
      TB.Cards.close(); return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
