import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const F=TB.REG.fancier; 
      const fr=[]; for(let rep=0;rep<10;rep++){ TB.Cards.close(); TB.App.play(F); for(const lv of [0,1]){ F.lv=lv; F.beginLevel(); let g=0; while(g++<12){ const ord=F.pop.map((x,i)=>[x.a,i]).sort((a,b)=>b[0]-a[0]).slice(0,6); F.sel=new Set(ord.map(o=>o[1])); const before=F.res.length; F.breed(); TB.Cards.close(); if(F.res.length>before) break; } } const H=F.hist; fr.push(F.res.map(r=>r.pass?'P'+r.n:'F').join('/')+' ears '+H[0].ears.toFixed(2)+'>'+H.at(-1).ears.toFixed(2)); } out.fancier=fr.slice(0,5).join('  ');
      const C=TB.REG.coal; TB.App.play(C); const pairs=[], alls=[]; for(let k=0;k<300;k++){ const P=C.sim(new Array(301).fill(20)); pairs.push(C.trace(P,[0,1]).T); if(k<120) alls.push(C.trace(P,[...Array(20).keys()]).T); } out.coal='pair mean '+(pairs.reduce((a,b)=>a+b,0)/300).toFixed(1)+', all mean '+(alls.reduce((a,b)=>a+b,0)/120).toFixed(1);
      C.lv=2; C.beginLevel(); out.trees=C.trees.map((T,i)=>C.hists[i]+':T='+T.tr.T+' merges@'+T.tr.merges.slice(0,6).join(',')).join(' | ');
      const S=TB.REG.sex; const pol={asex:()=>false, sex:()=>true, alt:(b)=>b%2===0, third:(b)=>b%3===0, quarter:(b)=>b%4===0};
      for(const [name,f] of Object.entries(pol)){ let ws=[], surv0=0, surv1=0; for(let rep=0;rep<12;rep++){ TB.Cards.close(); TB.App.play(S); for(const lv of [0,1]){ S.lv=lv; S.beginLevel(); let g=0; while(!S.over && g++<60){ S.run(f(S.blocks)); let k=0; while(S.anim && k++<50) S.update(0.4); } const L=S.res.at(-1); if(lv===0){ ws.push(S.hist.at(-1).w); if(L.pass) surv0++; } else if(L.pass) surv1++; window.__advance(1000); TB.Cards.close(); } }
        out['sex '+name]='L1 pass '+surv0+'/12 w '+(ws.reduce((a,b)=>a+b,0)/ws.length).toFixed(2)+' | L2 pass '+surv1+'/12'; }
      return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
