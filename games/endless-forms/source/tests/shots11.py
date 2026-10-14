import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>{TB.App.play(TB.REG.fancier); const F=TB.REG.fancier; F.lv=1; F.beginLevel(); for(let g=0;g<3;g++){ const o=F.pop.map((x,i)=>[x.a,i]).sort((a,b)=>b[0]-a[0]).slice(0,6); F.sel=new Set(o.map(z=>z[1])); F.breed(); } F.sel=new Set([0,3]); F.upd();}"); pg.wait_for_timeout(300); shot('fancy')
    pg.evaluate("()=>{TB.App.play(TB.REG.coal);}"); pg.wait_for_timeout(200); pg.click('#co-go'); pg.wait_for_timeout(2500); shot('coal1')
    pg.evaluate("()=>{const C=TB.REG.coal; C.lv=2; C.beginLevel(); C.labels=['constant',null,'bottleneck'];}"); pg.wait_for_timeout(300); shot('coal3')
    pg.evaluate("()=>{TB.App.play(TB.REG.sex);}"); pg.wait_for_timeout(200); pg.click('#sx-a'); pg.wait_for_timeout(2200); shot('sex1')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m16.png')
