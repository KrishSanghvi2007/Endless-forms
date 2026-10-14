import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const C=TB.REG.clinic; TB.App.play(C);
      // exhaustive L1 search
      const opts=['none','low','high']; let best=null, cures=0; const naive={};
      const run=(seq,lv)=>{ C.lv=lv; C.beginLevel(); for(const o of seq){ if(C.over) break; C.tox+=C.TOX[o]; C.step(o); C.day++; C.log.push(o); if(C.total()<1) return {cured:true, tox:C.tox, day:C.day}; } return {cured:false, tox:C.tox, R:C.resist(), tot:C.total()}; };
      for(let m=0;m<59049;m++){ const seq=[]; let x=m; for(let d=0;d<10;d++){ seq.push(opts[x%3]); x=(x/3)|0; } const r=run(seq,0); if(r.cured && r.tox<=8){ cures++; if(!best||r.tox<best.tox||(r.tox===best.tox&&r.day<best.day)) best={seq:seq.slice(0,r.day).join(','),tox:r.tox,day:r.day}; } }
      out.l1={cures, best}; for(const s of [['low'],['high']]){ const r=run(Array(10).fill(s[0]),0); naive[s[0]+'x10']=JSON.stringify(r).slice(0,90); } naive['high x3 then none']=JSON.stringify(run(['high','high','high','none','none','none','none','none','none','none'],0)).slice(0,90); out.naive=naive;
      const l2={}; for(const [n,seq] of [['A x10',Array(10).fill('A')],['AB x5',['AB','AB','AB','AB','AB']],['alt A/B',['A','B','A','B','A','B','A','B','A','B']],['AB x4',['AB','AB','AB','AB']]]) l2[n]=JSON.stringify(run(seq,1)).slice(0,90); out.l2=l2;
      const P=TB.REG.virulence; out.patho=P.SEAS.map(S=>P.bestV(S).map(v=>+v.toFixed(2)));
      return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
