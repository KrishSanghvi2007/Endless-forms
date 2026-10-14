import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(1200)
    def eb(tag):
        t=pg.evaluate("()=>{const e=document.getElementById('err');const t=e.style.display==='block'?e.textContent:'';e.style.display='none';return t}")
        if t: errs.append(tag+': '+t[:500])
    # Sieve bot calibration
    r=pg.evaluate(r"""()=>{ const out=[];
      for(let s=0;s<6;s++){ TB.seed(100+s*37); const S=TB.REG.sieve; TB.App.play(S); const res={};
        let guard=0;
        while(S.mi<3 && guard++<40){ const M=S.MISSIONS[S.mi], st=S.stats(S.pop), bm=S.bin(st.mean), bs=Math.max(1,Math.round(st.sd/(S.HI-S.LO)*S.NB));
          for(let b=0;b<S.NB;b++){ S.fit[b]= M.k==='dir'? (b>=bm?1:0.08) : M.k==='stab' ? (Math.abs(b-bm)<=Math.max(1,Math.round(bs*0.7))?1:0.03) : (Math.abs(b-bm)>=Math.max(1,Math.round(bs*0.8))?1:0.03); }
          if(S.expected()<0.3){ for(let b=0;b<S.NB;b++) S.fit[b]=Math.max(S.fit[b],0.3); }
          const k=M.k, w0=S.winter; S.run(); if(!S.anim){res[k]='blocked';break;} S.update(1.5); S.update(1);
          if(S.mi>0 && !(k in res)) res[k]=S.got.includes(k)? 'ok@'+(w0+1) : (S.MISSIONS[S.mi-1].k===k? 'fail':undefined);
          if(S.got.includes(k)) res[k]='ok@'+(w0+1);
        }
        res.got=S.got.join(','); out.push(JSON.stringify(res)); TB.Cards.close(); }
      return out; }""")
    print('sieve', r); eb('sieve')
    # Scribe: perfect then sloppy
    pg.evaluate("()=>{TB.Cards.close();TB.App.play(TB.REG.scribe)}"); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const S=TB.REG.scribe; for(let i=0;i<30;i++){ const want=S.gene[S.pos]; S.key(i===5?'A':i===8?(want==='A'?'G':'A'):want);} }"); pg.wait_for_timeout(2600); pg.screenshot(path='s_scribe.png'); eb('scribe1')
    r=pg.evaluate("()=>{const S=TB.REG.scribe; S.next(); for(let i=0;i<30;i++){ if(i===13){S.update(2);continue;} S.key(S.gene[S.pos]); } S.next(); for(let i=0;i<30;i++){ S.key(S.gene[S.pos]); } return TB.REG.scribe.results.map(r=>[r.works,r.silent,r.missense,r.nonsense,r.frameshift,r.verdict]);}")
    print('scribe', r); pg.evaluate("()=>TB.REG.scribe.next()"); pg.wait_for_timeout(600); pg.screenshot(path='s_scribe_end.png'); eb('scribe')
    # Sieve screenshot mid-draw
    pg.evaluate("()=>{TB.Cards.close();TB.App.play(TB.REG.sieve)}"); pg.wait_for_timeout(300)
    pg.mouse.move(40,90); pg.mouse.down(); 
    for x in range(40,380,15): pg.mouse.move(x, 60+ (x-40)*0.5 if x<200 else 60+(380-x)*0.5)
    pg.mouse.up(); pg.wait_for_timeout(200); pg.screenshot(path='s_sieve.png'); eb('sieve draw')
    # Jaws: auto-play, guard right always
    pg.evaluate("()=>{TB.Cards.close();TB.App.play(TB.REG.jaws)}"); pg.wait_for_timeout(2500); pg.screenshot(path='s_jaws.png')
    r=pg.evaluate("""()=>{ const J=TB.REG.jaws; const out=[]; let g=0; while(J.season<=8 && g++<20000){ const A=J.a; if(A && !A.done && A.t>A.T*0.5){ /* anticipating player: guard the side seen most last season, react 50% */ } J.update(0.05); if(J.inter>0){ J.inter=0.01; J.update(0.05);} } return {hist:J.hist.map(v=>+v.toFixed(2)), bites:J.totalB, att:J.totalA}; }""")
    print('jaws guard-right', r); pg.wait_for_timeout(500); eb('jaws')
    pg.evaluate("()=>{TB.Cards.close();TB.App.exit()}"); pg.wait_for_timeout(300); pg.screenshot(path='s_menu3.png')
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
