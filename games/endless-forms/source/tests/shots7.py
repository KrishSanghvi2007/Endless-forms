import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
from PIL import Image
errs=[]; names=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.evaluate("()=>{TB.App.play(TB.REG.hawks); const H=TB.REG.hawks; H.lv=3; H.beginLevel(); H.d4=2; H.V4=8; H.upd4();}"); pg.wait_for_timeout(400); shot('hawks4')
    pg.evaluate("()=>{const H=TB.REG.hawks; H.lv=4; H.beginLevel(); H.hold5(true); H.update(3.2);}"); pg.wait_for_timeout(300); shot('hawks5')
    pg.evaluate("()=>{TB.App.play(TB.REG.sieve); const S=TB.REG.sieve; S.mi=3; S.beginMission(); for(let b=0;b<S.NB;b++) S.fit[b]= b>=12?1:0.05; S.run(); S.update(1.5); S.update(1);}"); pg.wait_for_timeout(400); shot('sieve_track')
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:500])
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m11.png')
