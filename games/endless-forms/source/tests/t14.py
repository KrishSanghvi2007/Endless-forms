import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1000)
    r=pg.evaluate("""()=>{ const S=TB.REG.sieve; const out=[];
      for(const mi of [3,4]) for(const frac of [0.3,0.45]) { const res=[]; for(let s=0;s<6;s++){ TB.seed(400+s*9); TB.Cards.close(); TB.App.play(S); S.mi=mi; S.beginMission(); const M=S.MISSIONS[mi]; let g=0, lags=[];
          while(S.mi===mi && g++<20){ // keep the fraction closest above the target: truncation toward target
            const zs=S.pop.map(x=>x.z).sort((a,b)=>a-b), thr=zs[Math.floor(zs.length*(1-frac))]; const tgt=M.target+M.delta;
            for(let bb=0;bb<S.NB;bb++){ const z=S.LO+(bb+0.5)/S.NB*(S.HI-S.LO); S.fit[bb]= z>=Math.min(thr,tgt)?1:0.02; }
            if(S.expected()<0.3){ for(let bb=0;bb<S.NB;bb++){ const z=S.LO+(bb+0.5)/S.NB*(S.HI-S.LO); S.fit[bb]= z>=zs[Math.floor(zs.length*0.69)]?1:0.02; } }
            S.run(); if(!S.anim) break; S.update(1.5); S.update(1); lags.push((8*(M.target-S.stats(S.pop).mean)).toFixed(2)); }
          res.push((S.got.includes(M.k)?'OK':'fail@'+M.fail)+'['+lags.join(',')+']'); }
        out.push('mission '+(mi+1)+' keep '+frac+': '+res.join(' ')); }
      return out; }""")
    print('\n'.join(r))
    r=pg.evaluate("""()=>{ TB.Cards.close(); const H=TB.REG.hawks; TB.App.play(H); H.lv=3; H.beginLevel(); let g=0; while(H.lv===3 && g++<200){ if(H.ready){ H.play(H.exp4(1,H.d4,H.V4)>H.exp4(0,H.d4,H.V4)?1:0); } H.update(2); }
      const r4=H.res.at(-1); TB.Cards.close(); H.lv=4; H.beginLevel(); const pers=[]; g=0; while(H.lv===4 && g++<60){ const [bt]=H.best5(); H.hold5(true); let k=0; while(H.phase==='show' && k++<2000){ H.update(0.05); if(H.tt>=bt && H.phase==='show') H.hold5(false); } H.evolve5(); H.k++; pers.push(H.mean5().toFixed(1)); if(H.k>=8){ H.end5(); break;} H.phase='wait'; }
      return {l4:[r4.eff.toFixed(2), H.f4.map(v=>v.toFixed(2))], l5:[H.res.at(-1).eff.toFixed(2), pers.join(',')]}; }""")
    print('hawks', r)
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
