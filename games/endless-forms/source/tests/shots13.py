import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>{TB.App.play(TB.REG.commons); const C=TB.REG.commons; C.predIn='fall'; C.predAll='rise'; C.run1();}"); pg.wait_for_timeout(600); shot('commons1')
    pg.evaluate("()=>{TB.App.play(TB.REG.lock); const L=TB.REG.lock; for(let i=0;i<5;i++){ const [h2]=L.next1(); L.pick1(h2.indexOf(Math.max(...h2))); } }"); pg.wait_for_timeout(400); shot('lock1')
    pg.evaluate("()=>{TB.App.play(TB.REG.guest); const G=TB.REG.guest; G.grow1();}"); pg.wait_for_timeout(400); shot('guest1')
    pg.evaluate("()=>{TB.App.play(TB.REG.many); TB.REG.many.settle();}"); pg.wait_for_timeout(2200); shot('many1')
    pg.evaluate("()=>{const M=TB.REG.many; TB.Cards.close(); M.lv=1; M.beginLevel();}"); pg.wait_for_timeout(5500); shot('many2')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m18.png')
