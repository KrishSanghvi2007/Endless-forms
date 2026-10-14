import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const S=TB.REG.sex, out=[]; const pol={asex:()=>false, sex:()=>true, alt:(b)=>b%2===0};
      for(const [UB,TP,SB] of [[0.0005,40,0.3],[0.001,40,0.3],[0.0003,40,0.5],[0.001,30,0.3]]){ S.UB=UB; S.TP=TP; S.SB=SB; const line=[]; for(const [name,f] of Object.entries(pol)){ let pass=0; for(let rep=0;rep<12;rep++){ TB.Cards.close(); TB.App.play(S); S.lv=1; S.beginLevel(); let g=0; while(!S.over && g++<60){ S.run(f(S.blocks)); let k=0; while(S.anim && k++<50) S.update(0.4); } if(S.res.at(-1).pass) pass++; window.__advance(1000); } line.push(name+' '+pass+'/12'); } out.push('u='+UB+' s='+SB+' parasite@'+TP+': '+line.join(', ')); }
      return out; }""")
    print('\n'.join(r)); b.close()
