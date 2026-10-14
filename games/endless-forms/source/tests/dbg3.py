import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Endless_Forms_v1.html')); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out=[]; const cv=document.getElementById('scene'); const tap=(x,y)=>{ const rc=cv.getBoundingClientRect(); for(const t of ['pointerdown','pointerup']) cv.dispatchEvent(new PointerEvent(t,{clientX:rc.left+x,clientY:rc.top+y,pointerId:1,bubbles:true})); window.__advance(50); };
      const drag=(x0,y0,x1,y1)=>{ const rc=cv.getBoundingClientRect(); cv.dispatchEvent(new PointerEvent('pointerdown',{clientX:rc.left+x0,clientY:rc.top+y0,pointerId:1,bubbles:true})); cv.dispatchEvent(new PointerEvent('pointermove',{clientX:rc.left+x1,clientY:rc.top+y1,pointerId:1,bubbles:true})); cv.dispatchEvent(new PointerEvent('pointerup',{clientX:rc.left+x1,clientY:rc.top+y1,pointerId:1,bubbles:true})); window.__advance(50); };
      const clickCard=()=>{ const bs=document.querySelectorAll('#cards.on .card-btns button'); if(bs.length){ window.__advance(500); bs[bs.length-1].click(); window.__advance(100); return true;} return false; };
      for(let run=0;run<2;run++){
      // ---- Mendel via taps
      const M=TB.REG.mendel; TB.App.play(M); window.__advance(200); const W=TB.Stage.w, H=TB.Stage.h;
      for(let i=0;i<6;i++){ const a=M.pos(i,W,H), w6=M.pos(6,W,H); tap(a.x,a.fy+18*a.s); tap(w6.x,w6.fy+18*w6.s); window.__advance(1000); }
      for(let i=0;i<6;i++){ const a=M.pos(i,W,H), want=(M.pl[i].g[0]+M.pl[i].g[1]===1)?'carrier':'pure'; let k=0; while(M.pl[i].mark!==want && k++<4) tap(a.x, a.fy+56*a.s+12); }
      document.getElementById('md-check').click(); window.__advance(2000); clickCard(); window.__advance(300);
      for(let i=0;i<4;i++){ const P=M.pl2[i], a=M.pos2(i,W,H), t=M.pos2(4,W,H); if(P.h[0][0]+P.h[1][0]===1 && P.h[0][1]+P.h[1][1]===1){ tap(a.x,a.fy+16*a.s); tap(t.x,t.fy+16*t.s); window.__advance(1000);} }
      for(let i=0;i<4;i++){ const P=M.pl2[i], a=M.pos2(i,W,H), b1=a.fy+52*a.s; const wc=(P.h[0][0]+P.h[1][0]===1)?'carrier':'pure', ws=(P.h[0][1]+P.h[1][1]===1)?'carrier':'pure'; let k=0; while(P.mk.c!==wc&&k++<4) tap(a.x,b1+12); k=0; while(P.mk.s!==ws&&k++<4) tap(a.x,b1+39); }
      let k=0; while(M.linkAns!==(M.linked?'linked':'independent') && k++<4) document.getElementById('md-link').click();
      document.getElementById('md-check').click(); window.__advance(2500);
      const endM=document.querySelector('#cards.on .card.end'); out.push('mendel run'+run+': '+(endM? endM.querySelector('h3').textContent+' stars:'+endM.querySelector('.stars').textContent.replace(/<[^>]+>/g,'') : 'NO END; hud='+document.getElementById('hud').innerText.slice(0,80)));
      // ---- Cross via taps and drags
      const C=TB.REG.cross; TB.App.play(C); window.__advance(200);
      for(let pz=0;pz<3;pz++){ const P=C.PUZ[C.pi]; let best=null; for(let m=0;m<16;m++){ const co=new Set([0,1,2,3].filter(i=>m>>i&1)); if(co.size>P.k) continue; for(const st of [0,1]) if(C.score(P,co,st)===P.best){ best={co,st}; break; } if(best) break; }
        const G=C.geo1(W,H); for(const j of best.co){ const gx=G.x0+(C.POS[j]+C.POS[j+1])/2*(G.x1-G.x0); tap(gx,(G.yM+G.yD)/2); } if(best.st!==C.st) document.getElementById('co-sw').click(); document.getElementById('co-ck').click(); window.__advance(200); }
      clickCard(); window.__advance(300);
      const G2=C.geo2(W,H); for(const t of C.tok.slice()){ const pp=C.tokPos(t,G2,W); drag(pp.x,pp.y, G2.lx0+ (G2.lx1-G2.lx0)*(t.i/4), G2.ly); }
      document.getElementById('co-ck').click(); window.__advance(300); clickCard(); window.__advance(300);
      let g=0; while(!C.made && g++<10){ const G3=C.geo3(W,H); let idx=C.kids.findIndex(kd=>C.wildAt(kd,C.RP)&&!C.wildAt(kd,C.DP)); if(idx<0) idx=C.kids.findIndex(kd=>C.wildAt(kd,C.RP)); const col=idx%G3.cols,row=(idx/G3.cols)|0; tap(G3.x0+col*G3.cw+G3.cw/2, G3.y0+row*G3.rh+G3.rh*0.4); }
      window.__advance(1500); clickCard(); window.__advance(300);
      const endC=document.querySelector('#cards.on .card.end'); out.push('cross run'+run+': '+(endC? endC.querySelector('h3').textContent : 'NO END; hud='+document.getElementById('hud').innerText.slice(0,80)));
      }
      return {out, errs:window.__errs.slice(0,3), errbox:document.getElementById('err').style.display==='block'?document.getElementById('err').textContent.slice(0,300):''}; }""")
    print(r); b.close()
