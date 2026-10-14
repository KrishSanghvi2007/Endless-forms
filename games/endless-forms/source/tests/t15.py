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
    r=pg.evaluate("""()=>{ const N=TB.REG.nest; TB.App.play(N); const out={best:N.SP.map(S=>N.bestVal1(S))};
      // L1 bot: lay best clutch, feed chicks in order to 6 each, with 0.2 s reaction; in cost spring stop after best
      const res=[]; for(let s=0;s<3;s++){ N.s1=s; N.lay1(); const [bv,bn]=N.bestVal1(N.SP[s]); N.clutch=bn; N.startFeed(); let g=0, rt=0; while(N.phase==='feed' && g++<2000){ const dt=0.05; if(N.pending){ rt+=dt; if(rt>=0.2){ const c=N.chicks.find(c=>c.f<6); if(c){ const i=N.chicks.indexOf(c); const p=N.chickPos(i,N.chicks.length,TB.Stage.w,TB.Stage.h); N.tap(p.x,p.y-20);} rt=0; } } N.update(dt); } res.push(N.log1.at(-1)); }
      out.l1=res.map(l=>[l.clutch,l.fled,+l.v.toFixed(2),+l.bv.toFixed(2)]);
      TB.Cards.close(); N.lv=1; N.begin2(); let g=0; const conf=[]; while(N.v2<12 && g++<100){ const q=[0,1,2].map(a=>N.qa(a)); const a=q.indexOf(Math.max(...q)); N.beg(a); conf.push(a); N.anim2=null; N.v2++; if(N.v2>=12) break; }
      out.l2={acts:conf.join(''), eff:(N.gain2/N.best2).toFixed(2), m:N.m.map(v=>+v.toFixed(2))};
      return out; }""")
    print(r)
    pg.evaluate("()=>{TB.Cards.close(); const N=TB.REG.nest; TB.App.play(N); N.clutch=5; N.startFeed(); N.pending=true; N.chicks[0].f=6; N.chicks[1].f=3; N.upd1();}"); pg.wait_for_timeout(400); shot('nest1')
    pg.evaluate("()=>{const N=TB.REG.nest; N.lv=1; N.begin2(); N.beg(2);}"); pg.wait_for_timeout(500); shot('nest2')
    pg.evaluate("()=>{const N=TB.REG.nest; N.anim2=null; N.lv=2; N.begin3(); N.s3=2; N.upd3(); N.hatch('async');}"); pg.wait_for_timeout(1200); shot('nest3')
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:500])
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m12.png')
