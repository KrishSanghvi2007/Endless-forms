import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>TB.App.play(TB.REG.raffle)"); pg.wait_for_timeout(600); shot('rf_start')
    pg.click('#rf-m'); pg.click('#rf-m'); pg.click('#rf-m'); pg.click('#rf-go'); pg.wait_for_timeout(1500); shot('rf_race')
    for i in range(5):
        pg.wait_for_timeout(2800); pg.click('#rf-go')
    pg.wait_for_timeout(3000); shot('rf_l1end')
    pg.click('#cards .card-btns button'); pg.wait_for_timeout(500); pg.click('#rf-p'); pg.click('#rf-p'); pg.click('#rf-go'); pg.wait_for_timeout(800); shot('rf_l2')
    for i in range(4):
        pg.wait_for_timeout(4300); pg.click('#rf-go')
    pg.wait_for_timeout(4500); shot('rf_end')
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:300])
    b.close()
print(errs or 'NO ERRORS', names)
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m13.png')
