import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>TB.App.play(TB.REG.spindle)"); pg.wait_for_timeout(300)
    pg.click('#sp-f'); pg.wait_for_timeout(300); pg.click('#sp-f'); pg.wait_for_timeout(300); pg.click('#sp-m'); pg.wait_for_timeout(1500); shot('sp1')
    pg.evaluate("()=>{TB.Notes.tab='num'; TB.Notes.open();}"); pg.wait_for_timeout(300); shot('sp1_notes'); pg.evaluate("()=>TB.Notes.close()")
    pg.evaluate("()=>{const S=TB.REG.spindle; S.lv=1; S.begin2();}"); pg.wait_for_timeout(1500); shot('sp2')
    pg.evaluate("()=>{const S=TB.REG.spindle; S.lv=2; S.begin3(); S.round3=1; S.cage(); S.target='dsx'; S.upd3(); S.release(); for(let i=0;i<5;i++){ S.acc3=2; S.update3(0.01);} }"); pg.wait_for_timeout(500); shot('sp3')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m14.png')
