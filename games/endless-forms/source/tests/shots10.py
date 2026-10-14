import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>TB.App.play(TB.REG.census)"); pg.wait_for_timeout(300); pg.click('[data-s=all]'); pg.click('[data-s=all]'); pg.click('[data-s=all]'); pg.wait_for_timeout(300); shot('census1')
    pg.evaluate("()=>{const C=TB.REG.census; C.lv=1; C.beginLevel();}"); pg.wait_for_timeout(200); pg.click('[data-s=north]'); pg.click('[data-s=south]'); pg.click('[data-s=adults]'); pg.wait_for_timeout(300); shot('census2')
    pg.evaluate("()=>TB.App.play(TB.REG.clinic)"); pg.wait_for_timeout(300); pg.click('[data-o=low]'); pg.wait_for_timeout(900); pg.click('[data-o=low]'); pg.wait_for_timeout(900); pg.click('[data-o=low]'); pg.wait_for_timeout(900); shot('clinic1')
    pg.evaluate("()=>TB.App.play(TB.REG.virulence)"); pg.wait_for_timeout(300); pg.click('#pa-go'); pg.wait_for_timeout(2500); shot('patho')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m15.png')
