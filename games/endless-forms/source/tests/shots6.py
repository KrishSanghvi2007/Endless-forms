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
    pg.evaluate("()=>{TB.App.play(TB.REG.forager); const F=TB.REG.forager; F.lv=2; F.beginLevel(); F.round=2; F.beginRound(); F.state='patch'; F.newBush();}"); pg.wait_for_timeout(1600); shot('forager_mixed')
    pg.evaluate("()=>{const F=TB.REG.forager; F.lv=3; F.begin4(); F.intro4=0; F.headUp=true; F.upd4(); F.hawk={ph:'warn',t:0.2};}"); pg.wait_for_timeout(400); shot('forager_danger')
    pg.evaluate("()=>{const F=TB.REG.forager; F.lv=4; F.begin5(); F.feed(0); F.feed(1);}"); pg.wait_for_timeout(400); shot('forager_night')
    pg.evaluate("()=>{TB.App.play(TB.REG.raffle); const Q=TB.REG.raffle; Q.begin2(); Q.x=7; Q.mate2();}"); pg.wait_for_timeout(600); shot('raffle_conflict')
    pg.evaluate("()=>{TB.App.play(TB.REG.casino); const C=TB.REG.casino; C.i=8; C.newTable(); C.bet=2; C.go(); for(let k=0;k<3;k++) C.update(0.15);}"); pg.wait_for_timeout(300); shot('casino_bneck')
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:500])
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m10.png'); print(names)
