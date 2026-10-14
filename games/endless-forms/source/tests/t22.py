import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const P=TB.REG.plastic; const pol={opt:(q)=>P.ev(true,q)>P.ev(false,q), follow:()=>P.cue, never:()=>false, always:()=>true};
      for(const [n,f] of Object.entries(pol)){ let e=0, pass=0; for(let rep=0;rep<30;rep++){ TB.Cards.close(); TB.App.play(P); while(P.i<12){ const q=P.post(); P.decide(f(q)); } e+=P.got/P.best; if(P.res[0].pass) pass++; } out[n]=(e/30).toFixed(2)+' pass '+pass+'/30'; }
      return out; }""")
    print(r); b.close()
