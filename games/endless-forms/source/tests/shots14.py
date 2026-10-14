import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>{TB.App.play(TB.REG.landscape); const L=TB.REG.landscape; const up=L.up(L.cur); if(up.length){ L.cur=up[0]; L.path.push(up[0]); L.seen.add(up[0]); } L.revealed.add(31); L.revealed.add(7); L.upd1();}"); pg.wait_for_timeout(300); shot('land1')
    pg.evaluate("()=>{const L=TB.REG.landscape; TB.Cards.close(); L.lv=1; L.beginLevel(); L.pi=3; L.upd2();}"); pg.wait_for_timeout(300); shot('land2')
    pg.evaluate("()=>{TB.App.play(TB.REG.switch); const S=TB.REG.switch; S.E[2][3]=0; S.hatch();}"); pg.wait_for_timeout(500); shot('switch1')
    pg.evaluate("()=>{TB.App.play(TB.REG.sweep); const W=TB.REG.sweep; [4,12,20,28,36,W.x0-2,W.x0+1].forEach(k=>{ if(k>=0&&k<40&&W.samp[k]==null){ W.samp[k]=W.pi(k); W.left--; } }); W.upd1();}"); pg.wait_for_timeout(300); shot('sweep1')
    pg.evaluate("()=>{const W=TB.REG.sweep; TB.Cards.close(); W.lv=1; W.beginLevel(); W.labels=['hard',null,'soft'];}"); pg.wait_for_timeout(300); shot('sweep2')
    pg.evaluate("()=>{TB.App.play(TB.REG.clock); const C=TB.REG.clock; C.lv=1; C.beginLevel(); C.corr=true; C.est=300; C.upd();}"); pg.wait_for_timeout(300); shot('clock2')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((250,500)) for n in names]
M=Image.new('RGB',(250*len(ims),500),'white')
for i,im in enumerate(ims): M.paste(im,(i*250,0))
M.save('m19.png')
