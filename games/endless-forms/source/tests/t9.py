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
    r=pg.evaluate("""()=>{ const out=[]; const C=TB.REG.river;
      for(const pol of ['wait6','test']) { const res=[]; for(let s=0;s<20;s++){ TB.seed(300+s*7); TB.Cards.close(); TB.App.play(C); C.l1done=false; let g=0;
        while(!C.l1done && g++<400){ if(C.mixing){ C.update(3); continue; }
          if(pol==='wait6'){ if(C.k>=6) C.meet(); else C.wait(); }
          else { if(C.k>=4 && (!C.tested || C.tested.k!==C.k)) C.test(); else if(C.tested && C.tested.k===C.k && C.tested.n<=2) C.meet(); else C.wait(); } }
        res.push(C.done.length+'/'+C.E+'/'+C.fused); TB.Cards.close(); }
        const ok=res.filter(r=>r.startsWith('3/')), e=ok.map(r=>+r.split('/')[1]);
        out.push(pol+': success '+ok.length+'/20, epochs '+(e.length?(e.reduce((a,b)=>a+b,0)/e.length).toFixed(1):'-')+', <=22: '+e.filter(x=>x<=22).length+'  e.g. '+res.slice(0,6).join(' ')); }
      // L2 threshold frog
      const sc=[]; for(let s=0;s<20;s++){ TB.seed(900+s); TB.Cards.close(); TB.App.play(C); C.lv=1; C.begin2(); let g=0;
        while(C.night<6 && g++<200){ if(C.out){ C.night++; if(C.night>=6) break; C.newNight(); continue; } const m=C.males[C.mi]; const mid=(C.mu[0]+C.mu[1])/2; if(m.rate<mid-1 || C.mi===C.NM-1) { C.out='x'; const v=m.sp===0?1:0.2; C.score+=v; const gap=C.mu[1]-C.mu[0], ov=2*(function(z){const t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2),p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p;})(-gap/(2*C.sd)); C.mu=[C.mu[0]-3*ov,C.mu[1]+3*ov]; } else C.mi++; }
        sc.push(+C.score.toFixed(1)); }
      out.push('frog scores '+sc.join(' ')+'  mean '+(sc.reduce((a,b)=>a+b,0)/sc.length).toFixed(2)+'  >=4.2: '+sc.filter(x=>x>=4.2).length);
      return out; }""")
    print('\n'.join(r)); eb('river')
    r=pg.evaluate("""()=>{ const L=TB.REG.lek; const out=[];
      for(const pol of ['opt','first3']) { const effs=[]; for(let s=0;s<10;s++){ TB.seed(40+s); TB.Cards.close(); TB.App.play(L); let g=0;
        while(L.lv===0 && g++<200){ if(TB.Cards.isOpen()) break; if(L.out){ L.i++; if(L.i>=5){ L.endLevel(); break;} L.season1(); continue; } const S=L.SEASONS1[L.i], m=L.males[L.j];
          const acc = pol==='opt' ? (L.j===7 || L.post(m.x,S) >= L.V[7-L.j]-S.cost) : (L.j>=2); if(acc) L.accept1(); else L.next1(); }
        effs.push(+L.res[0].eff.toFixed(2)); }
        out.push('lek L1 '+pol+': '+effs.join(' ')); }
      TB.Cards.close(); TB.App.play(L); L.lv=1; L.beginLevel(); let g=0;
      while(L.lv===1 && g++<100){ if(L.out){ L.i++; if(L.i>=6){ L.endLevel(); break; } L.season2(); continue; } const [bd]=L.bestD(L.CONDS[L.i]); L.d=bd; L.settle(); }
      out.push('lek L2 opt eff '+L.res.at(-1).eff.toFixed(2)+'  bestD poor/avg/prime '+[0.5,1,2].map(c=>L.bestD(c)[0].toFixed(2)).join('/'));
      return out; }""")
    print('\n'.join(r)); eb('lek')
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
