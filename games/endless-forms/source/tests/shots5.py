import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
from PIL import Image
errs=[]; names=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(1300)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>{TB.App.play(TB.REG.river); const C=TB.REG.river; C.DRY=0; for(let i=0;i<4;i++) C.wait(); }"); pg.wait_for_timeout(300); shot('river1')
    pg.evaluate("()=>{const C=TB.REG.river; C.test();}"); pg.wait_for_timeout(300); shot('river1_test')
    pg.evaluate("()=>{const C=TB.REG.river; C.wait(); C.wait(); C.meet();}"); pg.wait_for_timeout(1300); shot('river1_meet')
    pg.evaluate("()=>{const C=TB.REG.river; C.lv=1; C.begin2();}"); pg.wait_for_timeout(500); shot('river2')
    pg.evaluate("()=>{TB.App.play(TB.REG.lek); const L=TB.REG.lek; L.next1(); L.next1();}"); pg.wait_for_timeout(300); shot('lek1')
    pg.evaluate("()=>{const L=TB.REG.lek; L.lv=1; L.beginLevel(); L.i=2; L.season2(); L.d=5.5;}"); pg.wait_for_timeout(300); shot('lek2')
    pg.evaluate("()=>{TB.Notes.tab='gra'; TB.Notes.open();}"); pg.wait_for_timeout(400); shot('lek2_notes'); pg.evaluate("()=>TB.Notes.close()")
    pg.evaluate("()=>{TB.App.play(TB.REG.jaws)}"); pg.wait_for_timeout(2200); shot('jaws_paced')
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:500])
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((260,520)) for n in names]
M=Image.new('RGB',(260*len(ims),520),'white')
for i,im in enumerate(ims): M.paste(im,(i*260,0))
M.save('m7.png'); print(names)
