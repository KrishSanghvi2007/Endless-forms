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
    r=pg.evaluate("""()=>{ const M=TB.REG.meadow; TB.App.play(M); const out=[];
      for(const Md of [0,1,2]){ const MM=['Alpine','Forest','Desert'][Md]; let best=null,bv=0; const cand=[];
        for(const col of ['white','yellow','blue','red']) for(let sh=0;sh<3;sh++) for(const night of [false,true]) for(const lots of [false,true]){ const d={col,sh,night,lots}, v=M.seeds(d, [ {ab:{bee:1,fly:1.2,bird:0,moth:0.1,rob:0}}, {ab:{bee:0.6,fly:0.4,bird:1,moth:0.2,rob:0.6}}, {ab:{bee:0.2,fly:0.2,bird:0.1,moth:1.2,rob:0.1}} ][Md]); cand.push([v,JSON.stringify(d)]); }
        cand.sort((a,b)=>b[0]-a[0]); out.push(MM+': best '+cand[0][1]+' '+cand[0][0].toFixed(2)+' | 2nd '+cand[1][1]+' '+(cand[1][0]/cand[0][0]).toFixed(2)+' | yellow dish day little: '+(cand.find(c=>c[1]==='{"col":"yellow","sh":0,"night":false,"lots":false}')[0]/cand[0][0]).toFixed(2)); }
      // L2 best-response bot and fixed-22 bot
      for(const pol of ['best','fixed']){ TB.Cards.close(); TB.App.play(M); M.lv=1; M.begin2(); for(let g=0;g<8;g++){ M.sp = pol==='best'? M.best2(M.mu)[0] : 22; M.flower(); M.update2(4); } out.push('orchid '+pol+': eff '+(M.got/M.bestSum).toFixed(2)+' tongues '+M.hist.map(h=>h.mu.toFixed(1)).join(',')+' spurs '+M.hist.map(h=>h.sp.toFixed(1)).join(',')); }
      return out; }""")
    print('\n'.join(r))
    pg.evaluate("()=>{TB.Cards.close(); TB.App.play(TB.REG.meadow); const M=TB.REG.meadow; M.d={col:'blue',sh:1,night:false,lots:false}; M.opts(); M.bloom();}"); pg.wait_for_timeout(2000); shot('meadow1')
    pg.evaluate("()=>{const M=TB.REG.meadow; M.update(3); M.mi=2; M.newMeadow(); M.d={col:'white',sh:2,night:true,lots:true}; M.opts(); M.bloom();}"); pg.wait_for_timeout(1800); shot('meadow_night')
    pg.evaluate("()=>{const M=TB.REG.meadow; M.anim=null; M.lv=1; M.begin2(); M.sp=26; M.flower(); M.update2(4); M.sp=29; M.upd2();}"); pg.wait_for_timeout(300); shot('orchid')
    t=pg.evaluate("()=>{const e=document.getElementById('err');return e.style.display==='block'?e.textContent:''}")
    if t: errs.append(t[:500])
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m9.png'); print(names)
