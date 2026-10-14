import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Tangled_Bank_v1.html')); pg.wait_for_timeout(500)
    r=pg.evaluate(r"""()=>{ const St=TB.Steward, out=[];
      for(let s=0;s<8;s++){ TB.seed(500+s*31); const ch=TB.CHAPTERS[3]; TB.App.play(ch); St.sync=true; St.setSpeed(0); St.free=true; const S=St.S; const ns=[S.pools[0].fish.length];
        for(let i=0;i<150;i++){ St.step(); if(i%10===9) ns.push(S.pools[0].fish.length+'/'+(S.hist.c0.at(-1)||0).toFixed(2)); }
        St.sync=false; out.push(ns.join(' ')); }
      return out; }""")
    for x in r: print(x)
    b.close()
