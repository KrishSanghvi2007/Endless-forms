import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(900)
    r=pg.evaluate(r"""()=>{ const out=[];
      for(const wid of [0.4,0.7,1.0]) for(let s=0;s<5;s++){ TB.seed(900+s*13); const S=TB.REG.sieve; TB.App.play(S); S.mi=1; S.beginMission(); const M=S.MISSIONS[1]; const tr=[];
        for(let w=0;w<6;w++){ const st=S.stats(S.pop), bm=S.bin(st.mean), bs=st.sd/(S.HI-S.LO)*S.NB; for(let b=0;b<S.NB;b++) S.fit[b]= Math.abs(b-bm)<=Math.max(0.6,bs*wid)?1:0.03; if(S.expected()<0.3) for(let b=0;b<S.NB;b++) S.fit[b]=Math.max(S.fit[b], Math.abs(b-bm)<=bs*wid+1?1:0.03);
          const e=S.expected(); S.run(); if(!S.anim){tr.push('x'+e.toFixed(2)); break;} S.update(1.5); S.update(1); if(S.mi!==1) break; tr.push(+(S.stats(S.pop).sd/M.s0).toFixed(2)); }
        out.push(wid+': '+tr.join(' ')); TB.Cards.close(); }
      return out; }""")
    print('\n'.join(r)); b.close()
