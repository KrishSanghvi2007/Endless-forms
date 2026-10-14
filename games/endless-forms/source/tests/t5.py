import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def eb(tag):
        t=pg.evaluate("()=>{const e=document.getElementById('err');const t=e.style.display==='block'?e.textContent:'';e.style.display='none';return t}")
        if t: errs.append(tag+': '+t[:600])
    r=pg.evaluate("""()=>{ const C=TB.REG.cross; TB.App.play(C); const out={best:C.PUZ.map(P=>C.bestOf(P))};
      // L3 recombinant rate: fraction of gametes from F1 with R and not D
      let good=0,hasR=0; for(let i=0;i<20000;i++){ const g=C.gamete([[0,1]]); if(C.wildAt(g,40)){hasR++; if(!C.wildAt(g,45)) good++;} } out.pR=hasR/20000; out.pGood=good/20000;
      out.rf=[[0,1],[1,2],[2,3],[3,4],[0,4],[1,4]].map(([a,b])=>+C.rf(a,b).toFixed(1)); return out; }""")
    print('cross', r); eb('cross')
    r=pg.evaluate("""()=>{ const out=[]; const C=TB.REG.castaways;
      for(const pol of [0,1,5,10,99]) { const res=[]; for(let s=0;s<6;s++){ TB.seed(70+s*11); TB.Cards.close(); TB.App.play(C); C.lv=1; C.begin2(); let g=0;
        while(!C.over && g++<200){ if(pol && pol<99 && C.gen%pol===2 && C.mig<(pol===1?1:20)) C.migrant(); if(pol===99 && C.gen%6===2) C.migrant(); C.acc=2; C.update(0.01); }
        const s2=C.log.at(-1); res.push([C.gen, s2.n, +s2.w.toFixed(2), C.mig]); }
        out.push('policy '+pol+': '+res.map(x=>x.join('/')).join('  ')); }
      return out; }""")
    print('\n'.join(r)); eb('cast')
    r=pg.evaluate("""()=>{ TB.Cards.close(); const H=TB.REG.hawks; TB.App.play(H); const out=[]; let g=0;
      while(H.lv<3 && g++<500){ if(TB.Cards.isOpen()){TB.Cards.close(); if(H.lv<3) H.beginLevel(); continue;} if(H.ready){ H.play(H.exp(1)>H.exp(0)?1:0); } H.update(2); }
      return H.res.map(r=>[r.lv,+r.eff.toFixed(2), r.lv<2? +r.hist.at(-1).toFixed(2) : r.hist.at(-1).map(v=>+v.toFixed(2))]); }""")
    print('hawks', r); eb('hawks')
    r=pg.evaluate("""()=>{ TB.Cards.close(); const A=TB.REG.alarm; TB.App.play(A); let g=0;
      while(A.lv<2 && g++<500){ if(TB.Cards.isOpen()){TB.Cards.close(); if(A.lv<2) A.beginLevel(); continue;} if(!A.decided){ if(A.lv===0) A.choose(A.sumR()*A.B>A.C?1:0); else { const v=A.yearVals(); A.choose(v.own>v.help?1:0);} } A.update(2.5); }
      return A.res.map(r=>[r.lv,r.right,r.pass]); }""")
    print('alarm', r); eb('alarm')
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
