import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const B=TB.REG.bats; TB.App.play(B); const out={};
      for(const lv of [0,1]) for(const pol of ['never','all','tft','oracle']){ let surv=0, wasted=0; for(let rep=0;rep<40;rep++){ TB.Cards.close(); B.lv=lv; B.res=[]; B.wasted=0; B.beginLevel(); let g=0; while(B.phase!=='over' && g++<400){ if(B.phase==='ready') B.nightStart(); else if(B.phase==='ask'){ const b=B.queue[0]; const sh= pol==='all' ? true : pol==='never' ? false : pol==='oracle' ? b.s!=='cheat' : (b.gaveMe>=b.refusedMe*0.34 || b.gaveMe+b.refusedMe===0); B.decide(sh);} } window.__advance(1000); if(B.res.at(-1)&&B.res.at(-1).pass) surv++; wasted+=B.wasted; }
        out['L'+(lv+1)+' '+pol]='survive '+surv+'/40, wasted '+(wasted/40).toFixed(1); }
      return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
