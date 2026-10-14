import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}; const F=TB.REG.fruits; TB.App.play(F);
      out.fruits=F.EXP.flat().map(E=>{ const H=F.sim(E); return F.cat(H.at(-1).corr)+'('+H.at(-1).corr.toFixed(2)+', apple '+H.at(-1).apple.toFixed(2)+')'; }).join(' | ');
      const D=TB.REG.double; const res={clump:[],scatter:[],line:[]};
      for(const mode of Object.keys(res)) for(let rep=0;rep<20;rep++){ TB.Cards.close(); TB.App.play(D); D.lv=0; D.begin1(); const cells = mode==='clump' ? [0,1,2,12,13,14,24,25,26,37].map(k=>k+40) : mode==='line' ? [50,51,52,53,54,55,56,57,58,59] : shuffle([...Array(120).keys()]).slice(0,10); cells.forEach(k=>{D.g[k]=4;}); D.placed=10; for(let g=0;g<12;g++) D.step1(); res[mode].push(D.frac(4)); }
      out.double=Object.entries(res).map(([k,v])=>k+' mean '+(v.reduce((a,b)=>a+b,0)/20).toFixed(2)+' pass '+v.filter(x=>x>=0.25).length+'/20 great '+v.filter(x=>x>=0.4).length).join(' | ');
      const Rg=TB.REG.ring; TB.App.play(Rg); const o=Rg.off, a=(o-1+12)%12, b=o; out.ring_true=Math.abs(Rg.pos(a)-Rg.pos(b))===11; out.ring_c=[1,2,3,4,11].map(d=>Rg.compat(o,(o+d)%12).toFixed(2)).join(',');
      TB.Cards.close(); return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
