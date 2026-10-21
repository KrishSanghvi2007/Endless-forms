"""Browser checks for The Black Country beyond the monkey: What if? thaw, keyboard play, untimed mode, Calm, teacher
step, the peck's 200 ms feedback, and ?v1=1 (legacy soot). python3 tests/soot_paths.py BUILD.html OUTDIR"""
import os, sys, json
TESTS = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html, out = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]); os.makedirs(out, exist_ok=True)
vclock = open(os.path.join(SRC, 'vclock.js')).read()
from playwright.sync_api import sync_playwright
res = {}
def page(b, q='', w=390, h=780, calm=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce' if calm else 'no-preference')
    pg = ctx.new_page(); pg.add_init_script(script=vclock); pg.goto('file://' + html + q); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }"); pg.evaluate("()=>window.__advance(500)"); return ctx, pg   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    # 1. peck latency: Events act → fx within 200 ms; screenshot of the peck at 40 and 150 ms
    ctx, pg = page(b, '?unit=soot&level=0&seed=4', 1280, 720)
    pg.evaluate("()=>{ TB.Events.debug = true; window.__advance(2500); }")
    r = pg.evaluate("""()=>{ const ch=TB.REG.soot, s=ch.sim.s, i=ch.sim.mostVisible(), cv=document.getElementById('scene'), rc=cv.getBoundingClientRect(), p=s.pos[i];
       TB.Events.clear && TB.Events.clear(); for (const t of ['pointerdown','pointerup']) cv.dispatchEvent(new PointerEvent(t,{clientX:rc.left+p[0]*rc.width, clientY:rc.top+p[1]*rc.height, pointerId:1, bubbles:true}));
       window.__advance(40); return { lat: TB.Events.lat ? TB.Events.lat() : null, eaten: s.eaten }; }""")
    pg.screenshot(path=os.path.join(out, 'peck_40ms.png')); pg.evaluate("()=>window.__advance(110)"); pg.screenshot(path=os.path.join(out, 'peck_150ms.png'))
    res['peck'] = r; ctx.close()
    # 2. keyboard: arrows move the beak, Space pecks; A toggles the auto hunt; the level still ends
    ctx, pg = page(b, '?unit=soot&level=0&seed=5')
    r = pg.evaluate("""()=>{ const key=k=>document.body.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}));
       window.__advance(1600); for (let k=0;k<6;k++){ key('ArrowLeft'); key('ArrowUp'); key(' '); window.__advance(200); }
       const s=TB.REG.soot.sim.s, misses=TB.REG.soot.sim.s.time; key('a'); window.__advance(9000); return { eaten: s.eaten, gen: s.gen, phase: s.phase, auto: s.auto, errs: window.__errs.slice(0,2) }; }""")
    pg.screenshot(path=os.path.join(out, 'keyboard.png')); res['keyboard'] = r; ctx.close()
    # 3. What if?: finish L4 with a sharp-eyed jay, open the level card, thaw "Two copies needed"
    ctx, pg = page(b, '?unit=soot&level=0&seed=6')
    r = pg.evaluate("""()=>{ const ch=TB.REG.soot; for (let k=0;k<6000;k++){ const s=ch.sim.s; if (document.querySelector('#cards.on .card')) break;
         if (s.phase==='hunt'||s.phase==='dawn'){ const i=ch.sim.mostVisible(); if(i>=0) TB.Sim.act(ch,{k:'tap',i}); }
         if (s.ask && TB.Predict.cur) TB.Predict.commit(); window.__advance(120); }
       const card=document.querySelector('#cards.on .card'); if(!card) return {err:'no card'}; window.__advance(600);
       const wi=[...card.querySelectorAll('.card-btns button')].find(b=>/what if/i.test(b.textContent)); if(!wi) return {err:'no what if', html: card.innerText.slice(0,200)};
       wi.click(); window.__advance(300); const chip=[...card.querySelectorAll('.chip')].find(c=>/two copies/i.test(c.textContent)); if(!chip) return {err:'no chip'};
       chip.click(); window.__advance(800); const s=ch.sim.s; return { thawed: s.thawed, lever: s.lever, dom: s.dom, gen: s.gen, black: s.hist[s.hist.length-1].B, cards: !!document.querySelector('#cards.on .card') }; }""")
    pg.screenshot(path=os.path.join(out, 'whatif_recessive.png'))
    r.update(pg.evaluate("()=>({ hud: document.getElementById('hud').innerText, auto: TB.REG.soot.sim.s.auto || TB.REG.soot.sim.s.autoAll })"))
    pg.evaluate("()=>window.__advance(15000)"); pg.screenshot(path=os.path.join(out, 'whatif_auto15s.png'))
    r['after15s'] = pg.evaluate("()=>{ const s=TB.REG.soot.sim.s; return { gen: s.gen, auto: s.auto, black: Math.round(s.hist[s.hist.length-1].B*100) }; }")
    r2 = pg.evaluate("""()=>{ const ch=TB.REG.soot; for (let k=0;k<8000;k++){ const s=ch.sim.s; if (document.querySelector('#cards.on .card')) break;
         if (s.phase==='hunt'||s.phase==='dawn'){ const i=ch.sim.mostVisible(); if(i>=0) TB.Sim.act(ch,{k:'tap',i}); } if (s.ask && TB.Predict.cur) TB.Predict.commit(); window.__advance(120); }
       const card=document.querySelector('#cards.on .card'); window.__advance(600); return card ? { stars: card.dataset.stars, text: card.innerText.slice(0,240) } : null; }""")
    pg.screenshot(path=os.path.join(out, 'whatif_card.png')); res['whatif'] = [r, r2]; ctx.close()
    # 3b. a stray stage tap at dusk does not wipe the eggs (only Skip or Enter does)
    ctx, pg = page(b, '?unit=soot&level=0&seed=6')
    r = pg.evaluate("""()=>{ const ch=TB.REG.soot; for (let k=0;k<400;k++){ const s=ch.sim.s; if (s.phase==='dusk') break; if (s.phase==='hunt'||s.phase==='dawn'){ const i=ch.sim.mostVisible(); if(i>=0) TB.Sim.act(ch,{k:'tap',i}); } window.__advance(120); }
       const cv=document.getElementById('scene'), rc=cv.getBoundingClientRect(); window.__advance(100); const t0=ch.sim.s.t;
       for (const t of ['pointerdown','pointerup']) cv.dispatchEvent(new PointerEvent(t,{clientX:rc.left+rc.width/2, clientY:rc.top+rc.height/2, pointerId:1, bubbles:true}));
       window.__advance(80); return { phase: ch.sim.s.phase, t0: +t0.toFixed(2), t1: +ch.sim.s.t.toFixed(2) }; }""")
    res['dusktap'] = r; ctx.close()
    # 3c. the L6 dock fits a 390 px phone: no label runs under the next button
    ctx, pg = page(b, '?unit=soot&level=2&seed=3')
    pg.evaluate("()=>window.__advance(1200)")
    r = pg.evaluate("""()=>{ const ch=TB.REG.soot, out=[]; const m=()=>[...document.querySelectorAll('#dock button')].map(b=>({t:b.textContent, over: b.scrollWidth - b.clientWidth}));
       out.push(m()); const cv=document.getElementById('scene'), rc=cv.getBoundingClientRect(); TB.Sim.act(ch,{k:'release', x:150, y:222}); window.__advance(300); out.push(m()); return out; }""")
    pg.screenshot(path=os.path.join(out, 'l6_dock_phone.png')); res['dock'] = r; ctx.close()
    # 4. untimed + Calm: no clock, looks instead; predictions wait without a soft timer
    ctx, pg = page(b, '?unit=soot&level=1&seed=7', calm=True)
    r = pg.evaluate("""()=>{ TB.Save.d.ui.unt = 1; TB.App.playLevel(TB.REG.soot, 1, {seed: 7}); window.__advance(20000); const s=TB.REG.soot.sim.s;
       const r1={ phase: s.phase, time: s.time, looks: s.looks, unt: s.unt }; for (let k=0;k<20;k++){ TB.Sim.act(TB.REG.soot,{k:'tap',i:-1}); } window.__advance(4000);
       return [r1, { phase: s.phase, looks: s.looks, ask: !!s.ask }, window.__errs.slice(0,2)]; }""")
    pg.screenshot(path=os.path.join(out, 'untimed_calm.png')); res['untimed'] = r; ctx.close()
    # 5. teacher step
    ctx, pg = page(b, '?unit=soot&level=0&seed=8&teacher=1', 1280, 720)
    r = pg.evaluate("""()=>{ const g0=TB.REG.soot.sim.s.gen; for (let k=0;k<4;k++){ TB.Teacher.step(); window.__advance(100); if (TB.REG.soot.sim.s.ask && TB.Predict.cur) TB.Predict.commit(); } return { g0, g1: TB.REG.soot.sim.s.gen, phase: TB.REG.soot.sim.s.phase, errs: window.__errs.slice(0,2) }; }""")
    pg.screenshot(path=os.path.join(out, 'teacher.png')); res['teacher'] = r; ctx.close()
    # 6. persistence: the wood the Lichen Wood saved (Save.res 'wood') is the wood the soot falls on
    ctx, pg = page(b, '')
    r = pg.evaluate("""()=>{ TB.Save.res.put('wood', { N: 120, gen: 6, seed: 9, freqs: [0.45, 0.08], tone: [0.66, 0.06], pins: [] });
       TB.App.playLevel(TB.REG.soot, 0, { seed: 3 }); window.__advance(300); const s=TB.REG.soot.sim.s, L=TB.Gen;
       let a=0, b=0; for (const m of s.pop) { a += (m.g[1] > .5) + (m.g[8] > .5); b += (m.g[2] > .5) + (m.g[9] > .5); }
       return { saved: s.wood.saved, pA: s.wood.pA, pB: s.wood.pB, tone: s.wood.tone, popA: a / 240, popB: b / 240, morph0: s.morph0.map(x => +x.toFixed(2)) }; }""")
    res['persist'] = r; ctx.close()
    # 7. ?v1=1: the legacy chapter, with its TRANSFER card and intro
    ctx, pg = page(b, '?v1=1')
    r = pg.evaluate("""()=>{ const ch=TB.REG.soot; TB.App.open(ch); window.__advance(400); const c=document.querySelector('#cards.on .card'); return { v2: ch.v2===true, mode: ch.mode, card: c ? c.innerText.slice(0,160) : null, transfer: typeof TB !== 'undefined' }; }""")
    pg.screenshot(path=os.path.join(out, 'v1.png')); res['v1'] = r; ctx.close()
    b.close()
print(json.dumps(res, indent=1))
