import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>{TB.App.play(TB.REG.copy); const C=TB.REG.copy; C.lv=1; C.beginLevel(); C.call(C.Eans); C.call(C.Eans);}"); pg.wait_for_timeout(300); shot('copy2')
    pg.evaluate("()=>{TB.App.play(TB.REG.arch); const A=TB.REG.arch; A.feed(); A.b=8.5; A.upd1();}"); pg.wait_for_timeout(300); shot('arch1')
    pg.evaluate("()=>{TB.App.play(TB.REG.tree);}"); pg.wait_for_timeout(300); shot('tree1')
    pg.evaluate("()=>{const T=TB.REG.tree; TB.Cards.close(); T.lv=1; T.beginLevel();}"); pg.wait_for_timeout(300); shot('tree2')
    pg.evaluate("()=>{TB.App.play(TB.REG.web); TB.REG.web.remove('star');}"); pg.wait_for_timeout(400); shot('web1')
    pg.evaluate("()=>{TB.App.play(TB.REG.islands); const I=TB.REG.islands; I.A=2.4; I.upd1();}"); pg.wait_for_timeout(300); shot('isl1')
    pg.evaluate("()=>{TB.App.play(TB.REG.fire); TB.REG.fire.T=30; TB.REG.fire.go1();}"); pg.wait_for_timeout(2000); shot('fire1')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((220,440)) for n in names]
M=Image.new('RGB',(220*len(ims),440),'white')
for i,im in enumerate(ims): M.paste(im,(i*220,0))
M.save('m20.png')
