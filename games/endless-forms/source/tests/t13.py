import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.wait_for_timeout(900)
    r=pg.evaluate("""()=>{ const Q=TB.REG.raffle; const FEM=[{L0:30,rem:6,n:'young sparse'},{L0:30,rem:2,n:'young crowded'},{L0:8,rem:2,n:'old crowded'},{L0:8,rem:6,n:'old sparse'},{L0:30,rem:3.5,n:'young some'}]; const out=[];
      for(const K of [{egg:0.6,rem:2.5,life:0.35},{egg:0.5,rem:1.2,life:0.6},{egg:0.4,rem:1.0,life:0.8},{egg:0.5,rem:0.8,life:0.5},{egg:0.3,rem:1.5,life:0.9}]){ Q.K=K; out.push(JSON.stringify(K)+' | '+FEM.map(F=>{const m=Q.opt(F,'m'),f=Q.opt(F,'f'); return F.n+': m'+m[0].toFixed(2)+' f'+f[0].toFixed(2);}).join('  ')); }
      return out; }""")
    print('\n'.join(r))
    r=pg.evaluate("""()=>{ const F=TB.REG.forager; TB.App.play(F); const res={}; for(const [pol,react] of [['downOpen',0.4],['downOpen',0.55],['upOpen',0.5],['hedge',0.5]]){ const rr=[]; let ok=0; for(let s=0;s<10;s++){ TB.seed(50+s*13); F.lv=3; F.begin4(); const run=[]; let pass=true;
        for(let round=0;round<2;round++){ F.round=round; F.round4(); F.intro4=0; if(pol==='hedge') F.place='hedge'; F.headUp = pol==='upOpen'; let g=0, rt=0;
          while(!F.done4 && g++<10000){ const dt=0.05; if(F.hawk && F.hawk.ph==='warn'){ rt+=dt; if(rt>=react) F.dive(); } else rt=0; if(F.grub && F.mv<=0 && F.cover<=0){ F._gw=(F._gw||0)+dt; if(F._gw>0.35){ F.tap4(F.grub.x,F.grub.y); F._gw=0; } } F.update4(dt); }
          if(!F.alive || F.food<F.R4[round].need) pass=false; run.push((F.alive?'':'X')+F.food); F.done4=false; }
        if(pass) ok++; rr.push(run.join('/')); } res[pol+'@'+react]=ok+'/10  '+rr.slice(0,5).join(' '); } return res; }""")
    for k,v in r.items(): print(k, v)
    b.close()
