import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const C=TB.REG.commons; TB.App.play(C); C.predIn='fall'; C.predAll='rise'; C.run1(); out.price=JSON.stringify(C.price)+' sum '+(C.price.between+C.price.within).toFixed(4)+' pass '+C.res[0].pass; out.within=C.after.map(a=>a[1].toFixed(2)).join(',');
      window.__advance(3000); TB.Cards.close(); C.lv=1; C.begin2(); out.kbest=C.SC.map(S=>C.kBest(S)).join(','); out.check=C.SC.map(S=>{ const kb=C.kBest(S); const run=k=>{let p=0.5; for(let t=0;t<12;t++) p=C.step2(p,k,S); return p.toFixed(3);}; return run(kb)+'@'+kb+' vs '+run(kb+1)+'@'+(kb+1); }).join(' | ');
      const L=TB.REG.lock; const pol={opt:(h2)=>h2.indexOf(Math.max(...h2)), common:()=>L.h.indexOf(Math.max(...L.h)), rare:()=>L.h.indexOf(Math.min(...L.h))};
      for(const [n,f] of Object.entries(pol)){ TB.Cards.close(); TB.App.play(L); L.lv=0; L.beginLevel(); while(L.t<L.N){ const [h2]=L.next1(); L.pick1(f(h2)); } out['lock L1 '+n]=(L.got/L.best).toFixed(2); }
      for(const n of ['opt','R6','R10']){ TB.Cards.close(); TB.App.play(L); L.lv=1; L.beginLevel(); while(L.t<L.N){ if(n==='opt'){ let bR=0,bp=-9; for(let r=0;r<=20;r+=0.1){const pp=L.pay(r); if(pp>bp){bp=pp;bR=r;}} L.R=bR; } else L.R=n==='R6'?6:10; L.gen2(); } out['lock L2 '+n]=(L.got/L.best).toFixed(2)+' m '+L.m.toFixed(1); }
      const G=TB.REG.guest; const gp={oracle:()=>{ const fx=G.nod.map((n,i)=>[n.fix,i]).filter(z=>z[0]).slice(0,4); G.nod.forEach(n=>n.lvl=0); fx.forEach(([,i])=>G.nod[i].lvl=3); }, even:()=>{ G.nod.forEach((n,i)=>n.lvl=i<4?2:1); }, sanction:()=>{ const sc=G.nod.map((n,i)=>[n.read==null?0.9:n.read,i]).sort((a,b)=>b[0]-a[0]); G.nod.forEach(n=>n.lvl=0); let bud=12; for(const [v,i] of sc){ if(bud<=0) break; const l = v>1.2?3 : v>0.5?2 : v>=0.9&&G.nod[i].read==null?1 : 0; const L2=Math.min(l,bud); G.nod[i].lvl=L2; bud-=L2; } }};
      for(const [n,f] of Object.entries(gp)){ let e=0, pass=0; for(let rep=0;rep<20;rep++){ TB.Cards.close(); TB.App.play(G); G.lv=0; G.begin1(); while(G.season<8 && G.lv===0){ f(); G.grow1(); } e+=G.res[0].eff; if(G.res[0].pass) pass++; } out['guest '+n]=(e/20).toFixed(2)+' pass '+pass+'/20'; }
      out.guestL2=G.EXP.map(E=>G.cat(G.mStar(E.v))+'('+G.mStar(E.v).toFixed(2)+')').join(',');
      TB.Cards.close(); return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
