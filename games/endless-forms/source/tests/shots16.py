import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
from PIL import Image
names=[]; errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(1200)
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    shot('title')
    pg.evaluate("()=>{TB.Save.d.done={lichen:1}; TB.App.open(TB.REG.soot);}"); pg.wait_for_timeout(600); shot('transfer')
    pg.evaluate("()=>{TB.Cards.close(); TB.App.play(TB.REG.casino); const C=TB.REG.casino; C.i=1; C.newTable();}"); pg.wait_for_timeout(600); shot('casino')
    pg.evaluate("()=>{TB.Cards.close(); TB.App.play(TB.REG.fancier); TB.Notes.tab='idea'; TB.Notes.open(); document.querySelectorAll('#sh-body details').forEach(d=>d.open=true);}"); pg.wait_for_timeout(500); shot('notes')
    pg.evaluate("()=>{TB.Notes.close(); const F=TB.REG.fancier; F.lv=1; F.beginLevel(); F.answer(true,[0.3,0.3]);}"); pg.wait_for_timeout(700); shot('end')
    b.close()
print(errs or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((260,520)) for n in names]
M=Image.new('RGB',(260*len(ims),520),'white')
for i,im in enumerate(ims): M.paste(im,(i*260,0))
M.save('m21.png')
