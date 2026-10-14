import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const Rg=TB.REG.ring; TB.App.play(Rg); Rg.phase='mark'; Rg.guess=[0,1]; Rg.ask(); window.__advance(500); const bs=document.querySelectorAll('#cards.on .card-btns button'); let err=null; try { bs[bs.length-1].click(); } catch(e){ err=String(e.stack||e); } window.__advance(200); return {err, errs: window.__errs.slice(0,2), h3: (document.querySelector('#cards.on .card h3')||{}).textContent}; }""")
    print(r, errs[:2]); b.close()
