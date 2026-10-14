import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const q=()=>{ const c=document.querySelector('#cards.on .card'); return c? c.innerText.replace(/\\s+/g,' ').slice(0,140):null; };
      out.title=document.querySelector('.sub') ? document.querySelector('.sub').textContent : '';
      TB.Save.d.done={lichen:1}; TB.App.open(TB.REG.soot); window.__advance(500); out.transfer=q(); const bs=document.querySelectorAll('#cards.on .card-btns button'); bs[0].click(); window.__advance(500); out.transfer2=q(); document.querySelector('#cards.on .card-btns button').click(); window.__advance(500); out.afterTransfer=q();
      TB.Cards.close(); TB.App.play(TB.REG.casino); const C=TB.REG.casino; C.i=1; C.newTable(); window.__advance(500); out.casino=q(); TB.Cards.close();
      TB.App.play(TB.REG.mendel); const M=TB.REG.mendel; const wIdx=M.pl.findIndex(x=>x.white), pIdx=M.pl.findIndex(x=>!x.white); 
      TB.Notes.tab='idea'; TB.Notes.open(); window.__advance(100); out.notes=document.getElementById('sh-body').innerText.includes('In this model') && document.getElementById('sh-body').innerText.includes('The principle'); TB.Notes.close();
      TB.App.play(TB.REG.fancier); TB.REG.fancier.lv=1; TB.REG.fancier.beginLevel(); TB.REG.fancier.answer(true,[0.3,0.3]); window.__advance(300); out.endTake=q();
      // sieve split: run bot with strong disruptive curve
      const S=TB.REG.sieve; const res=[]; for(let rep=0;rep<6;rep++){ TB.Cards.close(); TB.App.play(S); S.mi=S.MISSIONS.length-1; S.beginMission(); let bcs=[]; for(let w=0;w<6;w++){ const st=S.stats(S.pop); const lo=st.mean-0.8*st.sd, hi=st.mean+0.8*st.sd; for(let i=0;i<S.NB;i++){ const z=(i+0.5)/S.NB; S.fit[i]= (z<lo||z>hi)?1:0; } if(S.expected()<0.3){ for(let i=0;i<S.NB;i++){ const z=(i+0.5)/S.NB; S.fit[i]=(z<st.mean-0.5*st.sd||z>st.mean+0.5*st.sd)?1:0.15; } } S.winterGo ? S.winterGo() : document.getElementById('sv-go').click(); let k=0; while(S.anim && k++<200){ S.update(0.05); } bcs.push(S.stats(S.pop).bc.toFixed(2)); if(S.mi>=S.MISSIONS.length||TB.Cards.isOpen()) break; } res.push(bcs.join(',')); } out.sieveSplitBC=res.join(' | ');
      TB.Cards.close(); return out; }""")
    for k,v in r.items(): print(k, '=>', v)
    b.close()
