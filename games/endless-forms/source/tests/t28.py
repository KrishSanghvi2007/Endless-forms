import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const M=TB.REG.many;
      for(const K of [5,10,20,40,80]){ let pass=0, lost=0, mg=0; for(let rep=0;rep<12;rep++){ TB.Cards.close(); TB.App.play(M); M.lv=0; M.beginLevel(); let g=0; while(M.lv===0 && g++<60){ M.settle(); let k=0; while(M.atBottom().length<K && k++<400) M.update(0.02); M.transfer(); } const L=M.res[0]; if(L.pass) pass++; if(/lost/.test(L.note)) lost++; mg+=M.meanG(); } out['K'+K]='pass '+pass+'/12 lost '+lost+' meanG '+(mg/12).toFixed(1); }
      for(const pol of ['police','ignore']){ let pass=0, fr=0; for(let rep=0;rep<10;rep++){ TB.Cards.close(); TB.App.play(M); M.lv=1; M.beginLevel(); let k=0; while(!M.done2 && k++<5000){ M.update(0.05); if(pol==='police'){ for(let i=M.cells.length-1;i>=0;i--) if(M.cells[i].ch){ M.cells.splice(i,1); M.kills++; } } } const L=M.res.at(-1); if(L.pass) pass++; } out['L2 '+pol]='pass '+pass+'/10'; }
      TB.Cards.close(); return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
