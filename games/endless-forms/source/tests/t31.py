import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const C=TB.REG.copy; let ok=0; for(let rep=0;rep<10;rep++){ TB.Cards.close(); TB.App.play(C); C.lv=1; C.beginLevel(); while(C.ev<8) C.call(C.Eans); if(C.right2===8) ok++; } out.copy='rule bot 8/8 in '+ok+'/10'; TB.Cards.close();
      const A=TB.REG.arch; TB.App.play(A); out.arch=A.ISL.map(I=>A.bestB(I)[0].toFixed(1)).join(', ');
      const T=TB.REG.tree; out.tree=T.DATA.map(D=>[0,1,2].map(i=>T.steps(D,i)).join('/')).join(' | ');
      const I=TB.REG.islands; TB.App.play(I); const solve=(tg)=>{ let best=null; for(let la=0;la<=300;la+=2) for(let d=0;d<=300;d+=3){ const A2=Math.pow(10,la/100); if(tg.fixA && Math.abs(A2-tg.fixA)>tg.fixA*0.05) continue; if(tg.fixD!=null && d!==tg.fixD) continue; const S=I.Sstar(tg.fixA||A2, tg.fixD!=null?tg.fixD:d); if(Math.abs(S-tg.t)<=3){ best=[(tg.fixA||A2).toFixed(1), tg.fixD!=null?tg.fixD:d, S.toFixed(1)]; break; } } return best? best.join('@'):'INFEASIBLE'; };
      out.isl=I.TG.map(t=>solve({...t, fixA: t.fixA})).join(' | ');
      out.meta=I.SC.map(S=>{ const o={restore:I.pstar(S.h+S.dh,S.c,S.e), corr:I.pstar(S.h,S.c*S.fc,S.e), prot:I.pstar(S.h,S.c,S.e*S.fe)}; return Object.entries(o).map(([k,v])=>k+' '+v.toFixed(2)).join(','); }).join(' | ');
      const F=TB.REG.fire; out.fire=F.LAND.map(L=>{ const [bt,bd]=F.bestT(L); return 'best T '+bt+' D '+bd.toFixed(3)+' ; T2 '+(F.run(2,L).D/bd).toFixed(2)+' T150 '+(F.run(150,L).D/bd).toFixed(2); }).join(' | ');
      TB.Cards.close(); return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
