import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
from PIL import Image
errs=[]; names=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(1500)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    pg.click('#btn-begin'); pg.wait_for_timeout(400); pg.evaluate("()=>document.getElementById('menu-body').scrollTop=620"); pg.wait_for_timeout(200); shot('menu48')
    pg.evaluate("()=>{TB.App.play(TB.REG.mendel);const M=TB.REG.mendel;M.pick(0);M.pick(1);}"); pg.wait_for_timeout(1700); shot('mendel_day')
    pg.evaluate("()=>{TB.App.play(TB.REG.forager)}"); pg.wait_for_timeout(1700)
    for i in range(3):
        pg.wait_for_timeout(700); pg.evaluate("()=>{const F=TB.REG.forager;const it=F.items.find(i=>!i.gone); if(it) F.tap(it.x,it.y);}")
    shot('forager1')
    pg.evaluate("()=>{const F=TB.REG.forager; F.leave();}"); pg.wait_for_timeout(700); shot('forager1_fly')
    pg.evaluate("()=>{const F=TB.REG.forager; F.lv=1; F.beginLevel();}"); pg.wait_for_timeout(4200); shot('forager2')
    pg.evaluate("()=>{const F=TB.REG.forager; F.lv=2; F.beginLevel();}"); pg.wait_for_timeout(3500); pg.evaluate("()=>{const F=TB.REG.forager;const it=F.items.find(i=>!i.gone); if(it) F.tap(it.x,it.y);}"); pg.wait_for_timeout(900); shot('forager3')
    pg.evaluate("()=>{TB.App.play(TB.REG.gametes); const G=TB.REG.gametes; G.x=Math.log2(0.05); G.spawn(); }"); pg.wait_for_timeout(1800); shot('gametes')
    pg.evaluate("()=>{TB.Notes.tab='num'; TB.Notes.open();}"); pg.wait_for_timeout(300); shot('gametes_notes'); pg.evaluate("()=>TB.Notes.close()")
    pg.evaluate("()=>{TB.App.play(TB.REG.raffle); const Rf=TB.REG.raffle; Rf.s=1; Rf.mate(); Rf.update(3); Rf.s=30; Rf.mate();}"); pg.wait_for_timeout(1200); shot('raffle')
    pg.evaluate("()=>{const Rf=TB.REG.raffle; for(let k=0;k<5;k++){ Rf.update(3); if(Rf.i<6){Rf.s=Math.min(Rf.maxS(),[0,30,30,12,1,26][Rf.i]||1); Rf.mate();} } Rf.update(3);}"); pg.wait_for_timeout(800); shot('raffle_end')
    pg.evaluate("()=>{TB.Cards.close();TB.App.play(TB.REG.sieve)}"); pg.wait_for_timeout(500); shot('sieve_theme')
    pg.evaluate("()=>{TB.App.play(TB.REG.casino)}"); pg.wait_for_timeout(500); shot('casino_theme')
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:500])
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((260,520)) for n in names]
cols=6; rows=(len(ims)+cols-1)//cols; M=Image.new('RGB',(260*cols,520*rows),'white')
for i,im in enumerate(ims): M.paste(im,((i%cols)*260,(i//cols)*520))
M.save('m5.png'); print(names)
