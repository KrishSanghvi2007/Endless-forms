import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(900)
    r=pg.evaluate("""()=>{ const out=[]; const C=TB.REG.castaways;
      for(const [U,G,Q] of [[0.15,2.4,0.25],[0.1,2.4,0.3],[0.15,2.2,0.3],[0.1,2.6,0.35]]) { C.U=U; C.GROW=G; C.Q0=Q; const line=[];
        for(const pol of [0,15,12,8]) { let alive=0, wsum=0, ext=[]; for(let s=0;s<12;s++){ TB.seed(70+s*11); TB.Cards.close(); TB.App.play(C); C.lv=1; C.begin2(); let g=0;
          while(!C.over && g++<200){ if(pol && C.gen%pol===Math.floor(pol/2)) C.migrant(); C.acc=2; C.update(0.01); }
          const s2=C.log.at(-1); if(C.gen>=60&&s2.n>0){alive++; wsum+=s2.w;} else ext.push(C.gen); }
          line.push('m'+pol+':'+alive+'/12 w'+(alive?(wsum/alive).toFixed(2):'-')+' ext@'+ext.slice(0,4).join(',')); }
        out.push('U'+U+' G'+G+' Q'+Q+' | '+line.join(' | ')); }
      return out; }""")
    print('\n'.join(r)); b.close()
