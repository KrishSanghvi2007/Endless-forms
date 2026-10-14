import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
import sys
from playwright.sync_api import sync_playwright
from PIL import Image
f='file://'+SRC+'/'+(sys.argv[1] if len(sys.argv)>1 else 'Endless_Forms_v1.html')
errs=[]; shots=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2,has_touch=True)
    pg.on('console',lambda m: errs.append('console.'+m.type+': '+m.text) if m.type=='error' and '403' not in m.text else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto(f); pg.wait_for_timeout(2500)
    def shot(n): pg.screenshot(path=fSRC+'/s_{n}.png'); shots.append(n)
    def errbox(tag):
        t=pg.evaluate("()=>{const e=document.getElementById('err');const t=e.style.display==='block'?e.textContent:'';e.style.display='none';return t}")
        if t: errs.append(tag+' ERRBOX: '+t[:600])
    def notes(tag):
        for t in ['idea','num','gra']:
            pg.evaluate(f"()=>{{TB.Notes.tab='{t}';TB.Notes.open();}}"); pg.wait_for_timeout(250)
            if t=='gra': shot(tag+'_notes')
            pg.evaluate("()=>TB.Notes.close()")
        errbox(tag+' notes')
    shot('title'); pg.click('#btn-begin'); pg.wait_for_timeout(500); shot('menu')
    # Mendel
    pg.evaluate("()=>TB.App.open(TB.REG.mendel)"); pg.wait_for_timeout(500); shot('intro')
    pg.evaluate("()=>{TB.Cards.close();TB.App.play(TB.REG.mendel)}"); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const M=TB.REG.mendel;M.pick(0);M.pick(6);}"); pg.wait_for_timeout(1600); shot('mendel')
    notes('mendel')
    pg.evaluate("()=>{const M=TB.REG.mendel; for(let i=1;i<6;i++){M.pick(i);M.pick(6);M.update(1);} M.pl.slice(0,6).forEach(p=>p.mark=(p.g[0]+p.g[1]===1)?'carrier':'pure'); M.upd(); M.check();}")
    pg.wait_for_timeout(2300); shot('mendel_end'); errbox('mendel')
    # Casino
    pg.evaluate("()=>{TB.Cards.close();TB.App.play(TB.REG.casino)}"); pg.wait_for_timeout(400)
    pg.click('[data-b="0"]'); pg.click('[data-s="25"]'); pg.click('#dc-go'); pg.wait_for_timeout(2000); shot('casino')
    pg.evaluate("()=>{const C=TB.REG.casino; for(let t=0;t<8;t++){ if(!C.resolved){C.bet=C.bet??2; C.run=C.run||{t:0}; for(let k=0;k<200&&!C.resolved;k++) C.update(0.2);} if(t<7){C.go(); C.bet=2; C.go();} } }")
    pg.wait_for_timeout(300); notes('casino'); pg.evaluate("()=>TB.REG.casino.go()"); pg.wait_for_timeout(700); shot('casino_end'); errbox('casino')
    # Brood
    pg.evaluate("()=>{TB.Cards.close();TB.App.play(TB.REG.brood)}"); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const B=TB.REG.brood; B.sons=8; B.upd(); B.lay();}"); pg.wait_for_timeout(1300); shot('brood')
    pg.evaluate("()=>{const B=TB.REG.brood; B.update(3); for(let i=0;i<5;i++){B.sons=5;B.lay();B.update(3);} TB.Cards.close(); }"); pg.wait_for_timeout(300); shot('brood_fig')
    pg.evaluate("()=>{const B=TB.REG.brood; for(let i=0;i<4;i++){B.sons=2;B.lay();B.update(3);} }"); pg.wait_for_timeout(600); shot('brood_end'); errbox('brood')
    # Hunts
    for cid in ['lichen','soot','bitter']:
        pg.evaluate(f"()=>{{TB.Cards.close();TB.App.play(TB.REG.{cid})}}"); pg.wait_for_timeout(2600)
        for i in range(8): pg.evaluate("()=>{const H=TB.Hunt;const it=H.items.find(x=>x.alive&&x.kind==='prey'); if(it) H.tap(it.x*TB.Stage.w,it.y*TB.Stage.h);}")
        pg.wait_for_timeout(200); shot(cid); notes(cid); errbox(cid)
    pg.evaluate("()=>{TB.Hunt.time=0.01}"); pg.wait_for_timeout(1400); shot('bitter_interlude')
    pg.evaluate("()=>{TB.Cards.close();TB.App.exit()}"); pg.wait_for_timeout(400); shot('menu2'); errbox('menu')
    b.close()
print('\n'.join(errs) or 'NO ERRORS'); print(shots)
def mont(names,out,cols=4):
    ims=[Image.open(fSRC+'/s_{n}.png').resize((300,600)) for n in names]
    rows=(len(ims)+cols-1)//cols; M=Image.new('RGB',(300*cols,600*rows),'white')
    for i,im in enumerate(ims): M.paste(im,((i%cols)*300,(i//cols)*600))
    M.save(out)
mont(shots[:8],SRC+'/m1.png'); mont(shots[8:16],SRC+'/m2.png'); mont(shots[16:],SRC+'/m3.png')
