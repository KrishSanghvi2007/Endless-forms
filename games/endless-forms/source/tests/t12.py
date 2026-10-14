import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1000)
    r=pg.evaluate("""()=>{ const C=TB.REG.casino; TB.App.play(C); return C.TABLES.slice(5).map(t=>{ const [N,p,s,bn]=t; return JSON.stringify(t)+' -> '+C.sim(N,p,4000,s||0,bn||null).map(v=>v.toFixed(2)).join('/'); }); }""")
    print('casino truths (blue/red/mixed):'); print('\n'.join(r))
    r=pg.evaluate("""()=>{ const F=TB.REG.forager; TB.App.play(F); F.lv=2; F.beginLevel(); F.round=2; const out={mixedOpt:F.optRate(3)};
      const res={}; for(const pol of ['downOpen','upOpen','hedge','mixed']){ const rr=[]; for(let s=0;s<8;s++){ TB.seed(50+s*13); TB.Cards.close(); F.lv=3; F.begin4(); const run=[];
        for(let round=0;round<2;round++){ F.round=round; F.round4(); F.intro4=0; if(pol==='hedge') { F.place='hedge'; } F.headUp = pol==='upOpen' || (pol==='mixed' && round===1); let g=0, react=0;
          while(!F.done4 && g++<10000){ const dt=0.05; if(F.hawk && F.hawk.ph==='warn'){ react+=dt; if(react>=0.4) F.dive(); } else react=0; if(F.grub && F.mv<=0 && F.cover<=0){ F._gw=(F._gw||0)+dt; if(F._gw>0.35){ F.tap4(F.grub.x,F.grub.y); F._gw=0; } } F.update4(dt); }
          run.push((F.alive?'':'X')+F.food); F.done4=false; }
        rr.push(run.join('/')); } res[pol]=rr.join(' '); }
      out.l4=res;
      // L5 optimal and always-steady
      const l5={}; for(const pol of ['opt','steady','lucky']){ F.lv=4; F._v={}; F.night=0; F.gotV=0; F.bestV=0; F.nights=[]; const N5=F.N5; let q=0,qb=0; for(const N of N5){ let e=N.e; for(let t=F.T5;t>0;t--){ const a0=F.Q5(0,e,t,N.need), a1=F.Q5(1,e,t,N.need); const a= pol==='opt'? (a1>a0?1:0) : pol==='steady'?0:1; if(Math.max(a0,a1)>0){ q+= a?a1:a0; qb+=Math.max(a0,a1);} e+= a===0?2:(Math.random()<0.5?0:4); } } l5[pol]=(q/qb).toFixed(2); }
      out.l5=l5; return out; }""")
    print('forager', r)
    r=pg.evaluate("""()=>{ const Q=TB.REG.raffle; const FEM=[{L0:30,rem:6},{L0:30,rem:2},{L0:8,rem:2},{L0:8,rem:6},{L0:30,rem:3.5}]; return FEM.map(F=>{ const m=Q.opt(F,'m'), f=Q.opt(F,'f'); return 'L0 '+F.L0+' rem '+F.rem+': male best '+m[0].toFixed(2)+' ('+m[1].toFixed(0)+') female best '+f[0].toFixed(2)+' ('+f[1].toFixed(0)+'), her eggs at male best '+Q.life(F,m[0]).hers.toFixed(0); }); }""")
    print('\n'.join(r))
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
