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
    pg.evaluate("()=>{TB.App.play(TB.REG.cross); const C=TB.REG.cross; C.co.add(1);}"); pg.wait_for_timeout(300); pg.evaluate("()=>TB.REG.cross.upd1()"); shot('cross1')
    pg.evaluate("()=>{const C=TB.REG.cross; C.lv=1; C.beginLevel(); C.tok[0].x=60; C.tok[1].x=200; C.upd2();}"); pg.wait_for_timeout(300); shot('cross2')
    pg.evaluate("()=>{const C=TB.REG.cross; C.lv=2; C.beginLevel();}"); pg.wait_for_timeout(300); shot('cross3')
    pg.evaluate("()=>{TB.App.play(TB.REG.castaways); const C=TB.REG.castaways; C.size=0; C.upd1(); C.strike(0.3,0.45);}"); pg.wait_for_timeout(2500); shot('cast1')
    pg.evaluate("()=>{const C=TB.REG.castaways; C.lv=1; C.begin2(); for(let i=0;i<12;i++){C.acc=2;C.update(0.01);} C.migrant();}"); pg.wait_for_timeout(700); shot('cast2')
    pg.evaluate("()=>{TB.App.play(TB.REG.hawks);}"); pg.wait_for_timeout(300); pg.evaluate("()=>TB.REG.hawks.play(1)"); pg.wait_for_timeout(1000); shot('hawks')
    pg.evaluate("()=>{TB.App.play(TB.REG.alarm);}"); pg.wait_for_timeout(1600); shot('alarm1')
    pg.evaluate("()=>{const A=TB.REG.alarm; A.lv=1; A.beginLevel(); A.choose(0);}"); pg.wait_for_timeout(700); shot('alarm2')
    pg.evaluate("()=>{TB.Notes.tab='num'; TB.Notes.open();}"); pg.wait_for_timeout(300); shot('alarm_notes'); pg.evaluate("()=>TB.Notes.close()")
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:500])
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((260,520)) for n in names]
M=Image.new('RGB',(260*len(ims),520),'white')
for i,im in enumerate(ims): M.paste(im,(i*260,0))
M.save('m6.png'); print(names)
