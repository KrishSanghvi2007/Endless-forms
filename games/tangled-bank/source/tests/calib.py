import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
CHROME={"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
HTML_OVERRIDE=os.environ.get("GAME_HTML")  # optional: path of a specific build to test
import json
from playwright.sync_api import sync_playwright
JS = r"""
(args)=>{
 const {which, seeds} = args; const out=[];
 const Hn=TB.Hunt, St=TB.Steward;
 function botHunt(ci, pickFn){
   const ch=TB.CHAPTERS[ci]; TB.App.play(ch); Hn.sync=true; Hn.quick=true;
   let guard=0;
   while(Hn.state!=='done' && guard++<60){
     Hn.state='hunt'; Hn.time=ch.roundTime;
     const alive=Hn.items.filter(i=>i.alive);
     const chosen=pickFn(ch, Hn, alive);
     for(const it of chosen){ if(Hn.state!=='hunt')break; Hn.tap(it.x*TB.Stage.w, it.y*TB.Stage.h); }
     if(Hn.state==='hunt') Hn.endRound();
   }
   Hn.sync=false; return {gen:Hn.gen, stars:Hn.stars, obj:Hn.obj.value, traj:Hn.hist.map(r=>+r.obj.toFixed(2))};
 }
 function softTop(items, score, k, temp){ // sample k without replacement, weight exp(score/temp)
   const pool=items.slice(), res=[];
   while(res.length<k && pool.length){ const w=pool.map(i=>Math.exp(score(i)/temp)); const j=(()=>{let t=0;for(const x of w)t+=x;let r=Math.random()*t;for(let q=0;q<w.length;q++){r-=w[q];if(r<=0)return q;}return w.length-1;})(); res.push(pool[j]); pool.splice(j,1); }
   return res;
 }
 for(let s=0;s<seeds;s++){
  TB.seed(1000+s*7919);
  if(which==='lichen'){ out.push(botHunt(0,(ch,H,al)=>softTop(al, i=>1-ch.match(i.ind.ph), 15, 0.12))); }
  if(which==='lichen_lazy'){ out.push(botHunt(0,(ch,H,al)=>softTop(al, i=>1-ch.match(i.ind.ph), 10, 0.25))); }
  if(which==='soot'){ out.push(botHunt(1,(ch,H,al)=>softTop(al, i=>{const p=i.ind.ph,e=H.env; return Math.abs(p.tone-e.T)*1.5+Math.abs(p.hue-e.H)*0.4;}, 15, 0.12))); }
  if(which==='bitter'){ out.push(botHunt(2,(ch,H,al)=>{
     // human-ish: avoid things that look bitter; eat conspicuous palewings first
     const looks=i=>ch.resem(i.ind.ph);
     const safe=al.filter(i=>looks(i) < 0.5 + 0.15*(Math.random()-0.5));
     const risky=al.filter(i=>safe.indexOf(i)<0);
     let pick=softTop(safe, i=>-looks(i), 12, 0.12);
     if(pick.length<12) pick=pick.concat(softTop(risky, i=>-looks(i), Math.min(2,12-pick.length), 0.1)); // time runs out; maybe gamble on 1-2
     return pick; })); }
 }
 return out;
}
"""
STEW = r"""
(args)=>{
 const {which, seeds}=args; const out=[]; const St=TB.Steward;
 for(let s=0;s<seeds;s++){
  TB.seed(2000+s*104729);
  const ci={aripo:3,island:4,commons:5,commons_naive:5}[which]; const ch=TB.CHAPTERS[ci];
  TB.App.play(ch); St.sync=true; St.setSpeed(0); St.free=true; const S=St.S; const ev={};
  const run=(n,cond)=>{ for(let i=0;i<n;i++){ St.step(); if(cond&&cond())return true;} return false; };
  if(which==='aripo'){
    run(3); ch.transplant(S); const t0=S.gen;
    run(150,()=>St.got.endler); ev.endler=St.got.endler? St.got.endler-t0 : null; ev.c=[+S.hist.c0.at(-1).toFixed(2), +S.hist.c1.at(-1).toFixed(2)];
    S.pools[0].pred=false; const t1=S.gen; run(150,()=>St.got.release); ev.release=St.got.release? St.got.release-t1:null;
    S.pools[1].pred=true; const t2=S.gen; run(150,()=>St.got.reverse); ev.reverse=St.got.reverse? St.got.reverse-t2:null;
    ev.pref=[+S.hist.p0.at(-1).toFixed(2), +(S.hist.p1.at(-1)||0).toFixed(2)];
  }
  if(which==='island'){
    const st0=S.st[0]; ev.main0={e:+st0.e.toFixed(2),L:+st0.L.toFixed(2),m:+st0.m.toFixed(2),n:st0.n};
    run(5); ch.found(S); const t0=S.gen;
    run(1200,()=>St.got.austad); ev.austad=St.got.austad?St.got.austad-t0:null;
    run(1200,()=>St.got.shadow); ev.shadow=St.got.shadow?St.got.shadow-t0:null;
    const [a,b]=S.st; ev.at={main:{e:+a.e.toFixed(2),L:+a.L.toFixed(2),m:+a.m.toFixed(2)}, isl:b?{e:+b.e.toFixed(2),L:+b.L.toFixed(2),m:+b.m.toFixed(2),n:b.n}:null};
    S.pops[1].fox=true; const t2=S.gen; run(1000,()=>St.got.reverse); ev.reverse=St.got.reverse?St.got.reverse-t2:null;
  }
  if(which==='commons_naive'){ run(120); ev.p=+S.hist.p.at(-1).toFixed(2); ev.cum=[+S.cum.bet.toFixed(2),+S.cum.wit.toFixed(2)]; }
  if(which==='commons'){
    S.rain=0.0; S.founders=3; let g=0;
    for(let i=0;i<250 && !(St.got.hold&&St.got.ninety);i++){ if(i%4===0) ch.flood(S); St.step(); }
    ev.hold=St.got.hold||null; ev.ninety=St.got.ninety||null; ev.p=+S.hist.p.at(-1).toFixed(2); ev.cum=[+S.cum.bet.toFixed(2),+S.cum.wit.toFixed(2)];
    S.rain=0.3; const t2=S.gen; run(200,()=>St.got.tragedy); ev.tragedy=St.got.tragedy?St.got.tragedy-t2:null;
  }
  St.sync=false; out.push(ev);
 }
 return out;
}
"""
import sys
tests=sys.argv[1:] or ['lichen','lichen_lazy','soot','bitter','aripo','island','commons_naive','commons']
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':390,'height':780})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+(HTML_OVERRIDE or SRC+'/Tangled_Bank_v1.html')); pg.wait_for_timeout(800)
    pg.evaluate("()=>{TB.App.go('tree')}")
    for t in tests:
        if t in ('lichen','lichen_lazy','soot','bitter'):
            r=pg.evaluate(JS,{'which':t,'seeds':5})
            print(t, [ (x['gen'],x['stars'],round(x['obj'],2)) for x in r]); print('  traj', r[0]['traj'])
        else:
            r=pg.evaluate(STEW,{'which':t,'seeds':3})
            for x in r: print(t, json.dumps(x))
    print('errors:',errs)
    b.close()
