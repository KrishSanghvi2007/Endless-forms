import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const S=TB.REG.spindle; TB.App.play(S); const out={};
      // L2 policies
      for(const pol of ['none','naive','smart']){ let tot=0, errs=0; for(let rep=0;rep<30;rep++){ S.lv=1; S.begin2(); for(let e=0;e<10;e++){ let g=0; while(!S.done2 && g++<2000){ if(pol==='naive' && S.o<0) S.reorient(); if(pol==='smart' && S.o<0 && S.T-S.t>1.0 && S.err==null) S.reorient(); S.update2(0.05); } const L=S.log2.at(-1); if(L.ok&&L.mine) tot++; if(!L.ok) errs++; S.oo++; if(S.oo<10) S.newOo(); } } out[pol]=[(tot/300).toFixed(2), (errs/300).toFixed(2)]; }
      // L3: variable vs dsx, releases at gen 0,1,2
      for(const tgt of ['variable','dsx']){ const res=[]; for(let rep=0;rep<8;rep++){ S.lv=2; S.begin3(); S.round3=1; S.cage(); S.target=tgt; S.release(); let g=0; while(!S.over3 && g++<400){ if(S.gen===1&&S.rel<2) S.release(); if(S.gen===2&&S.rel<3) S.release(); S.acc3=2; S.update3(0.01); } const r=S.r3.at(-1); res.push((r.crashed?'crash@':'alive@')+r.gen+'/R'+(r.R*100).toFixed(0)); S.r3=[]; } out[tgt]=res.join(' '); }
      return out; }""")
    print(r); b.close()
