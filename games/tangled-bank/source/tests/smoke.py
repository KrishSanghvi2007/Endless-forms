import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
import sys, time
from playwright.sync_api import sync_playwright
from PIL import Image
f='file://'+SRC+'/'+(sys.argv[1] if len(sys.argv)>1 else 'Tangled_Bank_v1.html')
errs=[]; shots=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2,has_touch=True)
    pg.on('console',lambda m: errs.append('console.'+m.type+': '+m.text) if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto(f); pg.wait_for_timeout(3500)
    def shot(n):
        pg.screenshot(path=fSRC+'/s_{n}.png'); shots.append(n)
    shot('title')
    pg.click('#btn-begin'); pg.wait_for_timeout(600); shot('tree')
    pg.click('.tip[data-i="0"]'); pg.wait_for_timeout(600); shot('intro')
    pg.wait_for_timeout(400); pg.click('.card .btn.primary'); pg.wait_for_timeout(900); shot('dawn1')
    pg.wait_for_timeout(1500); shot('hunt1')
    # tap a few moths via page coords
    for i in range(6):
        pg.evaluate("""()=>{const H=TB.Hunt;const it=H.items.find(x=>x.alive&&x.kind==='prey'); if(it) H.tap(it.x*TB.Stage.w,it.y*TB.Stage.h);}""")
    pg.wait_for_timeout(200); shot('hunt1b')
    pg.evaluate("()=>{TB.Hunt.time=0.01}"); pg.wait_for_timeout(1400); shot('interlude1')
    err=pg.evaluate("()=>document.getElementById('err').textContent"); 
    if err: errs.append('ERRBOX: '+err)
    for ci in [1,2]:
        pg.evaluate(f"()=>{{TB.Cards.close();TB.App.play(TB.CHAPTERS[{ci}])}}"); pg.wait_for_timeout(2400); shot(f'hunt{ci+1}')
    for ci in [3,4,5]:
        pg.evaluate(f"()=>{{TB.Cards.close();TB.App.play(TB.CHAPTERS[{ci}]);TB.Steward.setSpeed(3)}}"); pg.wait_for_timeout(2500); shot(f'stew{ci+1}')
        err=pg.evaluate("()=>document.getElementById('err').textContent")
        if err: errs.append(f'ERRBOX ch{ci}: '+err); pg.evaluate("()=>{document.getElementById('err').textContent='';document.getElementById('err').style.display='none'}")
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(fSRC+'/s_{n}.png').resize((260,520)) for n in shots]
cols=6; rows=(len(ims)+cols-1)//cols
M=Image.new('RGB',(260*cols,520*rows),'white')
for i,im in enumerate(ims): M.paste(im,((i%cols)*260,(i//cols)*520))
M.save(SRC+'/montage.png'); print(shots)
