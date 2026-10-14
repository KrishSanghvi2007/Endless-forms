import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const C=TB.REG.cross; TB.App.play(C); C.res=[{lv:0,pass:true,note:'a'},{lv:1,pass:true,note:'b'}]; C.lv=2; C.beginLevel(); window.__advance(100);
      const cv=document.getElementById('scene'), rc=cv.getBoundingClientRect(), W=TB.Stage.w, H=TB.Stage.h; let g=0;
      while(!C.made && g++<12){ const G3=C.geo3(W,H); let idx=C.kids.findIndex(k=>C.wildAt(k,C.RP)&&!C.wildAt(k,C.DP)); if(idx<0) idx=C.kids.findIndex(k=>C.wildAt(k,C.RP)); const x=G3.x0+(idx%G3.cols)*G3.cw+G3.cw/2, y=G3.y0+((idx/G3.cols)|0)*G3.rh+G3.rh*0.4; for(const t of ['pointerdown','pointerup']) cv.dispatchEvent(new PointerEvent(t,{clientX:rc.left+x,clientY:rc.top+y,pointerId:1,bubbles:true})); window.__advance(80); }
      window.__advance(1500); const e=document.querySelector('#cards.on .card.end'); return {end: !!e, title: e? e.querySelector('h3').textContent:'', errs: window.__errs.slice(0,2)}; }""")
    print('cross L3 end:', r); b.close()
