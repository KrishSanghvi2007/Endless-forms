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
    pg.evaluate("()=>{TB.App.play(TB.REG.livefast); const L=TB.REG.livefast; L.life=1; L.newLife(); for(let i=0;i<3;i++){ L.r=0.6; L.year(); if(L.life!==1) break; } }"); pg.wait_for_timeout(400); shot('live1')
    pg.evaluate("()=>{const L=TB.REG.livefast; TB.Cards.close(); L.lv=1; L.beginLevel(); L.sz=3; L.upd2();}"); pg.wait_for_timeout(300); shot('live2')
    pg.evaluate("()=>{TB.App.play(TB.REG.plastic); const P=TB.REG.plastic; P.lv=1; P.beginLevel();}"); pg.wait_for_timeout(300); shot('plastic2')
    pg.evaluate("()=>{TB.App.play(TB.REG.crowd); const C=TB.REG.crowd; C.lv=1; C.beginLevel(); C.choose('B');}"); pg.wait_for_timeout(1500); shot('crowd2')
    pg.evaluate("()=>{const C=TB.REG.crowd; TB.Cards.close(); C.lv=2; C.beginLevel();}"); pg.wait_for_timeout(1500); shot('crowd3')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m17.png')
