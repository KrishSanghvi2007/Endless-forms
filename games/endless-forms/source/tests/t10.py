import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
from PIL import Image
errs=[]; names=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)))
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.wait_for_timeout(1200)
    def eb(tag):
        t=pg.evaluate("()=>{const e=document.getElementById('err');const t=e.style.display==='block'?e.textContent:'';e.style.display='none';return t}")
        if t: errs.append(tag+': '+t[:600])
    def shot(n): pg.screenshot(path=f's_{n}.png'); names.append(n)
    # Mendel: L1 quick solve, then L2
    pg.evaluate("()=>{TB.App.play(TB.REG.mendel); const M=TB.REG.mendel; M.pl.slice(0,6).forEach(p=>p.mark=(p.g[0]+p.g[1]===1)?'carrier':'pure'); M.upd(); M.check();}")
    pg.wait_for_timeout(1900); pg.evaluate("()=>{TB.Cards.close(); TB.REG.mendel.begin2();}")
    r=pg.evaluate("""()=>{ const M=TB.REG.mendel; const dh=M.pl2.findIndex(p=>p.h[0][0]+p.h[1][0]===1&&p.h[0][1]+p.h[1][1]===1); M.pick2(dh); M.pick2(4); M.update2(1);
      const k=M.classes(M.tray.kids); return {linked:M.linked, rep:M.pl2[dh].rep, classes:k}; }""")
    print('mendel L2 dihybrid testcross', r); pg.wait_for_timeout(700); shot('mendel2')
    pg.evaluate("()=>{const M=TB.REG.mendel; M.pl2.slice(0,4).forEach(P=>{P.mk.c=(P.h[0][0]+P.h[1][0]===1)?'carrier':'pure'; P.mk.s=(P.h[0][1]+P.h[1][1]===1)?'carrier':'pure';}); M.linkAns=M.linked?'linked':'independent'; M.upd2(); M.check2();}")
    pg.wait_for_timeout(2300); shot('mendel_end'); eb('mendel')
    # linkage stats over many test crosses
    r=pg.evaluate("""()=>{ const M=TB.REG.mendel; const out={}; for(const L of [true,false]){ M.linked=L; M.rr=L?0.08:0.5; const h=[[1,1],[0,0]]; const k=[0,0,0,0]; for(let i=0;i<16000;i++){ const g=M.gam2(h); k[(g[0]?0:2)+(g[1]?0:1)]++; } out[L?'linked':'indep']=k.map(v=>+(v/16000).toFixed(3)); } return out; }""")
    print('gamete class freqs', r)
    # Brood optimal bot
    r=pg.evaluate("""()=>{ TB.Cards.close(); const B=TB.REG.brood; TB.App.play(B); let g=0; while(B.season<=12 && g++<100){ if(TB.Cards.isOpen()) TB.Cards.close(); B.sons=B.bestS()[0]; B.lay(); B.update(3); }
      return {eff:+(B.total/B.best).toFixed(3), ms:B.log.filter(l=>l.act<2).map(l=>+l.m.toFixed(2)), bs:B.log.map(l=>l.bs)}; }""")
    print('brood', r); pg.wait_for_timeout(600); shot('brood_end'); eb('brood')
    pg.evaluate("()=>{TB.Cards.close(); const B=TB.REG.brood; TB.App.play(B); B.season=8; B.upd();}"); pg.wait_for_timeout(300); shot('brood_fig')
    # Alarm bot
    r=pg.evaluate("""()=>{ TB.Cards.close(); const A=TB.REG.alarm; TB.App.play(A); const preds=A.order.map(o=>o.pred+':'+o.nb.map(x=>x.ring[0]+(x.male?'m':'f')).join('')); let g=0;
      while(A.lv<2 && g++<500){ if(TB.Cards.isOpen()){TB.Cards.close(); if(A.lv<2) A.beginLevel(); continue;} if(!A.decided){ if(A.lv===0){ const G=A.order[A.i]; A.choose(A.sumR()*A.B>G.c?1:0);} else { const v=A.yearVals(); A.choose(v.own>v.help?1:0);} } A.update(2.5); }
      return {res:A.res.map(r=>[r.lv,r.pass,r.perfect]), preds:preds.slice(0,4)}; }""")
    print('alarm', r); eb('alarm')
    pg.evaluate("()=>{TB.Cards.close(); TB.App.play(TB.REG.alarm);}"); pg.wait_for_timeout(1500); shot('alarm_new')
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
ims=[Image.open(f's_{n}.png').resize((300,600)) for n in names]
M=Image.new('RGB',(300*len(ims),600),'white')
for i,im in enumerate(ims): M.paste(im,(i*300,0))
M.save('m8.png'); print(names)
