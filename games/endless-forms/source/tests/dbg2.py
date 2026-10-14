import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    pg.add_script_tag(path=SRC+'/tests/monkey.js')
    # instrument: wrap hawks methods to log lv transitions
    pg.evaluate("""()=>{ const H=TB.REG.hawks; window.__hl=[]; for(const k of ['beginLevel','begin4','begin5','end4','end5','endLevel','nextCard','finalEnd','start']){ const o=H[k]; H[k]=function(...a){ window.__hl.push(k+'@lv'+this.lv); return o.apply(this,a); }; } }""")
    r=pg.evaluate("()=>window.__monkey('hawks', 2600, 31)")
    print(r['status'], pg.evaluate("()=>{const H=TB.REG.hawks; return {lv:H.lv, f5:typeof H.f5, card:TB.Cards.isOpen(), log:window.__hl.slice(-12)}}"))
    # Cross L2 drag via real pointer events
    pg.evaluate("()=>{ const C=TB.REG.cross; TB.App.play(C); C.lv=1; C.beginLevel(); window.__advance(200); }")
    r=pg.evaluate("""()=>{ const C=TB.REG.cross, cv=document.getElementById('scene'), rc=cv.getBoundingClientRect(), G=C.geo2(TB.Stage.w,TB.Stage.h); const ptr=(t,x,y)=>cv.dispatchEvent(new PointerEvent(t,{clientX:rc.left+x,clientY:rc.top+y,pointerId:1,bubbles:true}));
      const t=C.tok[0], p=C.tokPos(t,G,TB.Stage.w); ptr('pointerdown',p.x,p.y); ptr('pointermove',p.x,p.y-40); ptr('pointermove',120,G.ly+5); ptr('pointerup',120,G.ly+5); window.__advance(100);
      return {placed:C.tok.filter(t=>t.x!=null).length, hud:document.getElementById('hud').innerText.slice(0,60)}; }""")
    print('cross drag', r)
    b.close()
