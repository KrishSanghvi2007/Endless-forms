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
    # Forager bot: plays near-optimal with 0.3 s reaction
    r=pg.evaluate(r"""()=>{ const F=TB.REG.forager; TB.App.play(F); const out=[]; let g=0;
      const bestK=()=>{ const Rd=F.rounds[F.round]; return F.lv===1?null:F.optRate(Rd.T)[1]; };
      while(g++<200000){ if(TB.Cards.isOpen()){ TB.Cards.close(); if(F.lv<3) F.beginLevel(); }
        if(F.lv>=3) break;
        const dt=0.05; F.update(dt);
        if(F.state==='patch'){
          if(F.lv===1){ const ok=F.items.filter(i=>!i.gone && i.p>0.3 && i.p<0.9 && F.busy<=0); const Rd=F.rounds[F.round]; const spec=Rd.lL>0.5; const it=ok.find(i=>i.big)||(!spec&&ok[0]); if(it){ F.tap(it.x,it.y);} }
          else { const it=F.items.find(i=>!i.gone && i.t>0.3); if(it) F.tap(it.x,it.y); if(F.load>=bestK()) F.leave(); }
        }
        if(F.state==='done'){ for(let k=0;k<40;k++){} }
        if(F.state==='done' && !F._w){ F._w=1; setTimeout(()=>{},0); }
        if(F.state==='done'){ F.round++; F._w=0; if(F.round<F.rounds.length) F.beginRound(); else F.endLevel(); }
      }
      return F.res.map(r=>[r.lv, +r.eff.toFixed(2), r.logs.map(l=>l.bk!=null?[+l.mean.toFixed(1),l.bk]:[l.small,l.big,+l.eff.toFixed(2)])]); }""")
    print('forager', r); eb('forager')
    # Gametes: best-response bot and naive bot
    for mode in ['best','stay']:
        r=pg.evaluate("""(mode)=>{ TB.Cards.close(); const G=TB.REG.gametes; TB.App.play(G); const tr=[];
          for(let k=0;k<12;k++){ if(mode==='best'){ const P=G.pool(); let bx=G.x,bw=-1; for(let x=G.XLO;x<=G.XHI;x+=0.1){ const f=G.fit(x,P).w; if(f>bw){bw=f;bx=x;} } G.x=bx; } G.anim=0; G.spawn(); G.anim=0; tr.push([+Math.pow(2,G.x).toFixed(2), +G.share.toFixed(3)]); }
          for(let g=0;g<80;g++) G.step(false); const hb=G.histo(); return {tr, hb:hb.join(' ')}; }""", mode)
        print('gametes', mode, r['tr']); print('   final hist', r['hb'])
    eb('gametes')
    r=pg.evaluate("()=>{TB.Cards.close(); const Rf=TB.REG.raffle; TB.App.play(Rf); const O=Rf.optimum(); return {s:O.s.map(v=>+v.toFixed(1)), eggs:+O.eggs.toFixed(2), even: (()=>{let e=0; Rf.rv.forEach(R=>{const s=100/6; e+=20*s/(s+R);}); return +e.toFixed(2);})() }; }")
    print('raffle optimum', r)
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
