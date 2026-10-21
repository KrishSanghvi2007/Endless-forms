"""Browser checks for Bitter Wings beyond the monkey: a real tap and its feedback within 200 ms, keyboard play, a real
drag on the prediction strip, untimed mode, Calm, teacher step, What if? thaw, and ?v1=1 (legacy bitter).

  python3 tests/bitter_paths.py BUILD.html OUTDIR

Prints one JSON line per check and exits 1 if any check fails, a JavaScript error is thrown, or the canvas shows NaN text."""
import os, sys, json
TESTS = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html, out = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]); os.makedirs(out, exist_ok=True)
vclock = open(os.path.join(SRC, 'vclock.js')).read()
from playwright.sync_api import sync_playwright

TAP = """(i)=>{ const s=TB.REG.bitter.sim.s, q=s.ins[i], cv=document.getElementById('scene'), r=cv.getBoundingClientRect();
  for (const t of ['pointerdown','pointerup']) cv.dispatchEvent(new PointerEvent(t,{clientX:r.left+q.x/390*r.width, clientY:r.top+q.y/540*r.height, pointerId:1, bubbles:true, cancelable:true})); }"""
FINISH = """()=>{ const ch=TB.REG.bitter; for (let k=0;k<9000;k++){ const s=ch.sim.s; if (document.querySelector('#cards.on .card')) break;
    if (s.phase==='hunt'||s.phase==='dawn'){ const i=ch.sim.autoPick(); if (i>=0) TB.Sim.act(ch,{k:'tap',i}); }
    if (s.ask) { const P=TB.Predict; if (P.cur && P.cur.id===s.ask.id) { P.cur.v=ch.sim.expect(s.ask.id); P.cur.moved=true; P.commit(); } }
    window.__advance(150); } window.__advance(800); const c=document.querySelector('#cards.on .card'); return c ? { stars: c.dataset.stars, text: c.innerText.slice(0,200) } : null; }"""
res, fails = {}, []


def page(b, q='', w=390, h=780, calm=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce' if calm else 'no-preference')
    pg = ctx.new_page(); pg.add_init_script(script=vclock); pg.goto('file://' + html + q); pg.evaluate("()=>window.__advance(500)"); return ctx, pg


def check(name, ok, data, pg):
    errs = pg.evaluate("()=>window.__errs.slice(0,3)"); bad = pg.evaluate("()=>window.__bad.slice(0,3)")
    good = bool(ok) and not errs and not bad
    res[name] = {'ok': good, 'data': data, 'errs': errs, 'bad': bad}
    if not good: fails.append(name)
    print(json.dumps({name: res[name]}, ensure_ascii=False)[:600])


with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    # 1. a real tap on a palewing eats it; the juice (an Fx event) lands within 200 ms of the act
    ctx, pg = page(b, '?unit=bitter&intro=0&level=0&seed=4', 1280, 720)
    pg.evaluate("()=>{ TB.Events.debug = true; window.__advance(300); }")
    i = pg.evaluate("()=>TB.REG.bitter.sim.autoPick()")
    pg.evaluate("()=>TB.Events.clear && TB.Events.clear()")
    pg.evaluate(TAP, i); pg.evaluate("()=>window.__advance(40)"); pg.screenshot(path=os.path.join(out, 'paths_peck_40ms.png'))
    r = pg.evaluate("()=>({ lat: TB.Events.lat ? TB.Events.lat() : null, eaten: TB.REG.bitter.sim.s.eaten, hud: document.getElementById('hud').innerText })")
    pg.evaluate("()=>window.__advance(110)"); pg.screenshot(path=os.path.join(out, 'paths_peck_150ms.png'))
    lat = r['lat']; lmax = max([x for x in (lat if isinstance(lat, list) else [lat]) if isinstance(x, (int, float))] or [0])
    check('tap', r['eaten'] == 1 and lmax <= 200, r, pg)
    # 1b. a bitter mouthful: the clock loses the retch, a ledger tile appears
    r = pg.evaluate("""()=>{ const ch=TB.REG.bitter, s=ch.sim.s, i=s.ins.findIndex(q=>!q.st&&q.k==='m'); const t0=s.time; const cv=document.getElementById('scene'), rc=cv.getBoundingClientRect(), q=s.ins[i];
       window.__advance(400); for (const t of ['pointerdown','pointerup']) cv.dispatchEvent(new PointerEvent(t,{clientX:rc.left+q.x/390*rc.width, clientY:rc.top+q.y/540*rc.height, pointerId:1, bubbles:true}));
       window.__advance(60); return { led: s.led.length, bitter: s.bitN, lost: +(t0 - s.time).toFixed(2), gone: q.st }; }""")
    pg.screenshot(path=os.path.join(out, 'paths_bitter.png'))
    check('bitter', r['led'] == 1 and r['bitter'] == 1 and r['lost'] >= 2.0 and r['gone'] == 2, r, pg); ctx.close()

    # 2. keyboard: arrows move the beak, Space pecks; A toggles the auto bird; the morning still ends
    ctx, pg = page(b, '?unit=bitter&intro=0&level=0&seed=5')
    r = pg.evaluate("""()=>{ const key=k=>document.body.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true})); const ch=TB.REG.bitter;
       window.__advance(300); for (let k=0;k<8;k++){ key(k%2?'ArrowLeft':'ArrowDown'); key(' '); window.__advance(300); }
       const tried = ch.sim.s.eaten + ch.sim.s.bitN; key('a'); window.__advance(9000); const s=ch.sim.s; return { tried, auto: s.auto, gen: s.gen, phase: s.phase, eatenAll: s.eatenAll }; }""")
    pg.screenshot(path=os.path.join(out, 'paths_keyboard.png'))
    check('keyboard', r['eatenAll'] >= 6 and (r['gen'] >= 2 or r['phase'] != 'hunt'), r, pg); ctx.close()

    # 3. a real mouse drag on the strip moves the prediction ghost; a tap on the ghost commits it through the sim
    ctx, pg = page(b, '?unit=bitter&intro=0&level=3&seed=6', 1280, 720)
    pg.evaluate("""()=>{ const ch=TB.REG.bitter; for (let k=0;k<4000;k++){ const s=ch.sim.s; if (s.ask) break; if (s.phase==='hunt'||s.phase==='dawn'){ const i=ch.sim.autoPick(); if (i>=0) TB.Sim.act(ch,{k:'tap',i}); } window.__advance(120); } window.__advance(600); }""")
    box = pg.evaluate("()=>{ const cv=TB.Strip.canvas(0); if (!cv) return null; const r=cv.getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width, h:r.height}; }")
    if box:
        x = box['x'] + box['w'] * 0.92; pg.mouse.move(x, box['y'] + box['h'] * 0.5); pg.mouse.down(); pg.mouse.move(x, box['y'] + box['h'] * 0.3, steps=6); pg.mouse.up()
        pg.evaluate("()=>window.__advance(200)")
        g = pg.evaluate("()=>{ const o=TB.Predict.overlay(0); return o ? { v: o.v, moved: o.moved } : null; }")
        pg.screenshot(path=os.path.join(out, 'paths_drag.png'))
        pg.evaluate("()=>{ TB.Predict.commit(); window.__advance(300); }")
        r = pg.evaluate("()=>{ const s=TB.REG.bitter.sim.s; return { pred: s.pred.p4, exp: s.exp.p4, hit: s.hit.p4 }; }")
        r['ghost'] = g
        check('drag', g and g['moved'] and r['pred'] is not None and abs(r['pred'] - g['v']) < 1e-6, r, pg)
    else:
        check('drag', False, 'no strip canvas', pg)
    ctx.close()

    # 4. untimed + Calm: looks instead of a clock; a tap spends a look; the ask waits with no timer
    ctx, pg = page(b, '?unit=bitter&intro=0&level=1&seed=7&untimed=1&calm=1', calm=True)
    r = pg.evaluate("""()=>{ const ch=TB.REG.bitter, s=ch.sim.s; window.__advance(300); const l0=s.looks; const i=ch.sim.autoPick(); TB.Sim.act(ch,{k:'tap',i}); window.__advance(200);
       const l1=s.looks; window.__advance(30000); return { unt: s.unt, l0, l1, time: s.time, phase: s.phase, calm: TB.Fx ? TB.Fx.calm : null }; }""")
    pg.screenshot(path=os.path.join(out, 'paths_untimed.png'))
    check('untimed', r['unt'] and r['l1'] < r['l0'] and abs(r['time'] - 12) < 1e-6, r, pg); ctx.close()

    # 5. teacher: step runs to the next dawn or prediction
    ctx, pg = page(b, '?unit=bitter&intro=0&level=2&seed=8&teacher=1')
    r = pg.evaluate("()=>{ const ch=TB.REG.bitter, g0=ch.sim.s.gen; ch.teacherStep(); const s=ch.sim.s; return { g0, g1: s.gen, ask: !!s.ask, phase: s.phase }; }")
    check('teacher', r['g1'] > r['g0'] or r['ask'], r, pg); ctx.close()

    # 6. What if?: finish L5, open the final card, thaw "Scatter B"; the rerun ends with a text chosen from it and no stars
    ctx, pg = page(b, '?unit=bitter&intro=0&level=4&seed=9')
    c1 = pg.evaluate(FINISH)
    r = pg.evaluate("""()=>{ const card=document.querySelector('#cards.on .card'); if (!card) return {err:'no card'};
       const wi=[...card.querySelectorAll('.card-btns button')].find(b=>/what if/i.test(b.textContent)); if (!wi) return {err:'no what if'}; wi.click(); window.__advance(400);
       const chip=[...card.querySelectorAll('.chip')].find(c=>/scatter/i.test(c.textContent)); if (!chip) return {err:'no chip'}; chip.click(); window.__advance(800);
       const s=TB.REG.bitter.sim.s; return { thawed: s.thawed, lever: s.lever, gen: s.gen }; }""")
    pg.screenshot(path=os.path.join(out, 'paths_whatif.png'))
    c2 = pg.evaluate("""()=>{ for (let k=0;k<6000 && !document.querySelector('#cards.on .card');k++) window.__advance(150); window.__advance(800);
       const c=document.querySelector('#cards.on .card'), r=TB.REG.bitter.sim.result(); return c ? { stars: c.dataset.stars, text: c.innerText.slice(0,240), mask: r ? r.mask : null, why: r ? r.interesting : null } : null; }""")
    pg.screenshot(path=os.path.join(out, 'paths_whatif_card.png'))
    check('whatif', r.get('thawed') and r.get('lever') == 'scatterB' and c2 and c2['mask'] == 0 and (c2['why'] or '').startswith('w_'), {'first': c1, 'thaw': r, 'card': c2}, pg); ctx.close()

    # 7. ?v1=1 plays the legacy Hunt chapter under the same id
    ctx, pg = page(b, '?v1=1')
    r = pg.evaluate("()=>{ const ch=TB.REG.bitter; return { v2: ch.v2 === true, mode: ch.mode, title: ch.title }; }")
    check('v1', r['v2'] is False and r['mode'] == 'hunt', r, pg); ctx.close()
    b.close()

print('bitter_paths: %d of %d checks pass' % (len(res) - len(fails), len(res)) + (('; FAILED: ' + ', '.join(fails)) if fails else ''))
sys.exit(1 if fails else 0)
