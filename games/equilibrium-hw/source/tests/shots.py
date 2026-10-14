import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
import sys
scheme=sys.argv[1]; names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); ctx=b.new_context(viewport={'width':390,'height':780},device_scale_factor=2,color_scheme=scheme); pg=ctx.new_page()
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Equilibrium_HW_v2.html')); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f'sh_{scheme}_{n}.png'); names.append(n)
    def ev(js, wait): pg.evaluate(js); pg.wait_for_timeout(wait)
    shot('title')
    ev("()=>{HW.Save.d.done={l1:1,l2:1,l3:1}; HW.Save.d.stars={l1:3,l2:2,l3:3}; HW.Game.go('map')}",400); shot('map')
    ev("()=>{HW.Game.go('l1')}",300); shot('l1')
    ev("()=>{HW.Game.go('l2'); HW.Game.scene.split();}",2600); shot('l2')
    ev("()=>{HW.Game.go('l3'); const S=HW.Game.scene; S.next(); }",2600); shot('l3')
    ev("()=>{HW.Game.go('l4'); const S=HW.Game.scene; S.next(); for(let i=0;i<90;i++) S.draw1(false); for(let i=0;i<4;i++) S.draw1(true,i*0.15);}",700); shot('l4')
    ev("()=>{HW.Game.go('l6'); const S=HW.Game.scene; S.cells=['AA','Aa','Aa','aa']; S.si=1; S.next(); S.col=0.0001;}",1900); shot('l6')
    ev("()=>{HW.Game.go('l7'); const S=HW.Game.scene; S.next(); S.pred=[0.2,0.55,0.25]; S.gen();}",1400); shot('l7')
    ev("()=>{HW.Game.go('l8'); const S=HW.Game.scene; S.next(); S.sw.mate=0; S.go(12);}",3800); shot('l8')
    ev("()=>{HW.Game.go('l9'); const S=HW.Game.scene; S.mode='simrun'; S.simQ=[0.5]; S.simT=0;}",5200); shot('l9')
    ev("()=>{HW.Game.go('l11'); const S=HW.Game.scene; S.next(); S.season();}",700); shot('l11')
    ev("()=>{HW.Game.go('l12'); HW.Game.scene.run(10,null);}",3400); shot('l12')
    ev("()=>{HW.Game.go('l14'); const S=HW.Game.scene; S.next(); const bs=document.querySelectorAll('#ctl button'); bs[0].click(); }",2900); shot('l14')
    ev("()=>{HW.Game.go('l16'); const S=HW.Game.scene; S.next(); S.next(); S.q=0.04;}",400); shot('l16')
    ev("()=>{HW.Game.go('l17'); const S=HW.Game.scene; S.next1(); S.shown=true; }",400); shot('l17')
    ev("()=>{HW.Game.go('cases'); const S=HW.Game.scene; S.ci=6; S.qi=0; S.ask(); }",400); shot('case')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f'sh_{scheme}_{n}.png').resize((195,390)) for n in names]
M=Image.new('RGB',(195*8,390*2),'black')
for i,im in enumerate(ims): M.paste(im,((i%8)*195,(i//8)*390))
M.save(f'mont_{scheme}.png')
