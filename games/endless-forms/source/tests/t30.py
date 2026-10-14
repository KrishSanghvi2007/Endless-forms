import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const L=TB.REG.landscape; TB.App.play(L); let nulls=0, greedyWin=0, reach=0;
      for(let i=0;i<30;i++){ const Ld=L.mkLand(); if(!Ld){nulls++; continue;} L.Ld=Ld; const up=g=>L.nbrs(g).filter(h=>Ld.w[h]>Ld.w[g]); let g=Ld.start; while(up(g).length) g=up(g).reduce((a,b)=>Ld.w[a]>Ld.w[b]?a:b); if(g===Ld.gmax) greedyWin++; const st=[Ld.start], seen=new Set([Ld.start]); while(st.length){ const x=st.shift(); for(const y of up(x)) if(!seen.has(y)){ seen.add(y); st.push(y);} } if(seen.has(Ld.gmax)) reach++; }
      out.land='nulls '+nulls+' greedyWin '+greedyWin+'/30 reachable '+reach+'/30';
      out.types=['none','pos','neg','sign','recip'].map(t=>{ const [a,bb,ab]=L.mkPair(t); return t+':'+a.toFixed(2)+','+bb.toFixed(2)+','+ab.toFixed(2)+' prod '+(a*bb).toFixed(2); }).join(' | ');
      const S=TB.REG.switch; TB.App.play(S); const sol=[[2,3],[1,0],[2,2],[3,4]]; out.hox=S.TASKS.map((T,i)=>{ const E=S.WT(); E[sol[i][0]][sol[i][1]]^=1; return S.ident(E).every((v,j)=>v===T.id[j]); }).join(',')+' wt '+S.ident(S.WT()).join('/');
      const W=TB.REG.sweep; const g01=()=>Math.sqrt(-2*Math.log(Math.random()+1e-12))*Math.cos(2*Math.PI*Math.random()); let found=0; for(let rep=0;rep<30;rep++){ TB.Cards.close(); TB.App.play(W); W.lv=0; W.ri=rep%3; W.found=0; W.newChrom(); const samp=k=>{ if(W.samp[k]!=null) return; W.samp[k]=Math.max(0,W.pi(k)*(1+0.1*g01())); W.left--; }; [4,12,20,28,36].forEach(samp); let best=Object.keys(W.samp).map(Number).sort((a,b)=>W.samp[a]-W.samp[b])[0]; [best-3,best+3].filter(k=>k>=0&&k<40).forEach(samp); const ks=Object.keys(W.samp).map(Number).sort((a,b)=>W.samp[a]-W.samp[b]); const k1=ks[0], k2=ks[1]; const g=Math.round((k1*2+k2)/3); if(Math.abs(g-W.x0)<=1) found++; }
      out.sweepBot=found+'/30';
      const C=TB.REG.clock; for(const pol of ['best','raw']){ const right=[0,0]; for(let rep=0;rep<10;rep++){ TB.Cards.close(); TB.App.play(C); for(const lv of [0,1]){ C.lv=lv; C.beginLevel(); for(let i=0;i<3;i++){ const P=C.pairs[C.pi]; const pc=C.cal.k/1000, pp=P.k/1000; C.est=Math.round(pol==='best'?C.bestT(P):C.cal.t*pp/pc); C.confirm(); } if(C.res.at(-1).pass) right[lv]++; TB.Cards.close(); } } out['clock '+pol]='L1 pass '+right[0]+'/10, L2 pass '+right[1]+'/10'; }
      TB.Cards.close(); return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
