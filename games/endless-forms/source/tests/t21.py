import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':780})
    pg.add_init_script(path=SRC+'/vclock.js')
    pg.goto('file://'+SRC+'/Endless_Forms_v1.html'); pg.evaluate("()=>window.__advance(1500)")
    r=pg.evaluate("""()=>{ const out={}; const L=TB.REG.livefast; TB.App.play(L);
      out.dp_fox=[1,2,3,4,5,6,7,8].map(a=>L.bestR(a,0.5).toFixed(2)).join(' '); out.dp_island=[1,2,3,4,5,6,7,8].map(a=>L.bestR(a,0.08).toFixed(2)).join(' ');
      out.eggs=L.ENV2.map(E=>{ let bs=1,bv=0; for(let s=1;s<=6;s++){const v=L.val2(s,E.s0); if(v>bv){bv=v;bs=s;}} return bs; }).join(',');
      // optimal bot through live fast L1
      const effs=[]; for(let rep=0;rep<5;rep++){ TB.Cards.close(); TB.App.play(L); let g=0; while(L.lv===0 && g++<40){ const m=L.LIVES[L.life].m; L.r=L.bestR(L.age,m); L.year(); } effs.push((L.res[0].eff).toFixed(2)); } out.live_opt=effs.join(' ');
      TB.Cards.close(); TB.App.play(L); let g=0; while(L.lv===0 && g++<40){ L.r=0.5; L.year(); } out.live_half=L.res[0].eff.toFixed(2);
      const P=TB.REG.plastic; const pol={opt:(q)=>P.ev(true,q)>P.ev(false,q), follow:()=>P.cue, never:()=>false, always:()=>true};
      for(const [n,f] of Object.entries(pol)){ const e=[]; for(let rep=0;rep<30;rep++){ TB.Cards.close(); TB.App.play(P); while(P.lv===0){ const q=P.post(); P.decide(f(q)); } e.push(P.res[0].eff||0); } out['plastic '+n]=(e.reduce((a,b)=>a+b,0)/30).toFixed(2)+' pass '+P.res.length; }
      // compute plastic efficiencies properly
      const C=TB.REG.crowd; const cp={opt:null, stayA:'A', alt:'alt'};
      for(const lv of [0,1]) for(const n of Object.keys(cp)){ const e=[]; for(let rep=0;rep<20;rep++){ TB.Cards.close(); TB.App.play(C); C.lv=lv; C.beginLevel(); let k=0; while(C.round<C.N && k++<50){ C.anim=null; const [ra,rb]=C.rates(),[wa,wb]=C.weights(); const s= n==='opt' ? (ra/(wa+1)>=rb/(wb+1)?'A':'B') : n==='stayA' ? 'A' : (C.round%2?'A':'B'); C.choose(s); } e.push(C.got/C.best); } out['crowd L'+(lv+1)+' '+n]=(e.reduce((a,b)=>a+b,0)/20).toFixed(2); }
      const e3=[]; for(const n of ['opt','own','crowd']){ let s=0; for(let rep=0;rep<20;rep++){ TB.Cards.close(); TB.App.play(C); C.lv=2; C.beginLevel(); let k=0; while(C.round<C.N && k++<20){ const t=C.dInfo+C.sig, opt=t===0?C.sig:Math.sign(t); const Lc=C.prior.filter(a=>a>0).length, Rc=C.prior.length-Lc; const a= n==='opt'?opt : n==='own'? C.sig : (Lc===Rc? C.sig : (Lc>Rc?1:-1)); C.pick3(a); } s+=C.got/C.best; } e3.push(n+' '+(s/20).toFixed(2)); } out.cascade=e3.join(', ');
      return out; }""")
    for k,v in r.items(): print(k, v)
    b.close()
