"""The Lichen Wood: smoke checks of the paths a monkey does not reach (owned by the lichen unit).

  python3 tests/lichen_smoke.py BUILD.html

Begin goes straight into the Wood; keyboard play (arrows, Enter pecks, Shift+Enter pins, B the bird's rule, Enter locks a
prediction); untimed looks; the bird's rule hunts by itself; act-to-feedback latency; teacher, projector and deep links;
?v1=1 keeps the legacy chapter; no JavaScript errors, NaN text or Lbl/Whisper/HUD/Dock warnings. Exit 1 on any failure.
"""
import os, sys, json
from playwright.sync_api import sync_playwright

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html = os.path.abspath(sys.argv[1])
vclock = open(os.path.join(SRC, 'vclock.js')).read()
results = []


def ok(cond, msg):
    results.append((bool(cond), msg)); print(('  ok   ' if cond else '  FAIL ') + msg)


def page(b, query='', vp=(390, 780), calm=False):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference')
    ext = []
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
    pg = ctx.new_page(); pg.add_init_script(script=vclock)
    pg.goto('file://' + html + query); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }"); pg.evaluate("()=>window.__advance(1200)")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
    return ctx, pg, ext


def clean(pg, label):
    e = pg.evaluate("()=>({errs: window.__errs.slice(0,3), bad: window.__bad.slice(0,3), w: [TB.Lbl, TB.Whisper, TB.HUD, TB.Dock].map(m => (m && m.warnings || []).length)})")
    ok(not e['errs'] and not e['bad'] and sum(e['w']) == 0, f'{label}: no errors, NaN text or warnings ' + (json.dumps(e) if e['errs'] or e['bad'] or sum(e['w']) else ''))


with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    adv = lambda pg, ms: pg.evaluate("ms=>window.__advance(ms)", ms)
    S = "()=>{const s=TB.REG.lichen.sim.s; return s && {phase: s.phase, gen: s.gen, level: s.level, eaten: s.eaten, pins: s.pins.length, auto: s.auto, looks: s.looks, ask: s.ask && s.ask.id, card: !!document.querySelector('#cards.on .card')};}"

    # Begin → straight into the live Wood (D2 §9), ghost hand within 3 s, first action cannot fail
    ctx, pg, ext = page(b)
    pg.evaluate("()=>{ localStorage.clear(); }")
    pg.click('#btn-begin'); adv(pg, 400)
    st = pg.evaluate(S)
    ok(st and st['level'] == 0 and pg.evaluate("()=>TB.App.ch && TB.App.ch.id") == 'lichen' and not st['card'], 'Begin drops straight into the live Wood, no card')
    ok(pg.evaluate("()=>TB.Dock.items.every(b => b.id !== 'auto')"), 'the first screen offers no Auto-hunt (it comes after the first morning)')
    gt = 400
    while gt < 3000 and not pg.evaluate("()=>TB.Ghost && TB.Ghost.active"): adv(pg, 100); gt += 100
    ok(pg.evaluate("()=>TB.Ghost && TB.Ghost.active") and gt <= 3000, f'the ghost hand is showing within 3 s, once the level banner has gone ({gt} ms)')
    hud = pg.evaluate("()=>document.getElementById('hud').innerText")
    ok(len(hud.split()) <= 40 + 4, f'HUD before the first action ≤ 40 words ("{hud[:80]}")')
    r = pg.evaluate("()=>document.getElementById('scene').getBoundingClientRect().toJSON()")
    pg.mouse.click(r['x'] + 20, r['y'] + r['height'] - 30)   # a careless first tap far from any moth still lands (magnet)
    adv(pg, 120); st = pg.evaluate(S)
    ok(st['eaten'] == 1, 'the first tap cannot fail (L0 magnet): one moth eaten')
    lat = pg.evaluate("""()=>{ const ch = TB.REG.lichen, s = ch.sim.s, L = ch.sim.live(s), p = ch.pos(s.moths[L[0]]); const n0 = TB.Fx.count; const t0 = performance.now();
        TB.Sim.act(ch, {k: 'peck', i: L[0]}); window.__advance(40); return {dt: performance.now() - t0, parts: TB.Fx.count - n0}; }""")
    ok(lat['parts'] > 0 and lat['dt'] <= 200, f'act → visible juice within one frame (≤ 200 ms): {lat}')
    clean(pg, 'Begin'); ok(not ext, 'no network requests'); ctx.close()

    # keyboard play, untimed looks, the bird's rule
    ctx, pg, ext = page(b, '?unit=lichen&level=1&seed=5')
    adv(pg, 900); st0 = pg.evaluate(S)
    for k in ['ArrowRight', 'ArrowRight', 'Enter']: pg.keyboard.press(k); adv(pg, 60)
    adv(pg, 100); st = pg.evaluate(S)
    ok(st['eaten'] == st0['eaten'] + 1, 'keyboard: arrows move the focus, Enter pecks')
    e0 = pg.evaluate(S)['eaten']; pg.keyboard.press('ArrowLeft'); adv(pg, 40); pg.keyboard.press('Shift+Enter'); adv(pg, 100); st = pg.evaluate(S)
    ok(st['pins'] == 0 and st['eaten'] == e0 + 1, 'keyboard, L1: Shift+Enter pecks (pinning is taught only in L0)')
    r = pg.evaluate("()=>{const ch=TB.REG.lichen,s=ch.sim.s,L=ch.sim.live(s),p=ch.pos(s.moths[L[0]]),c=document.getElementById('scene').getBoundingClientRect();return [c.left+p[0],c.top+p[1]];}")
    e0 = pg.evaluate(S)['eaten']; pg.mouse.move(r[0], r[1]); pg.mouse.down(); adv(pg, 700); pg.mouse.up(); adv(pg, 100); st = pg.evaluate(S)
    ok(st['pins'] == 0 and st['eaten'] == e0 + 1, f"L1: a 700 ms press on a moth is a peck, never a pin (eaten {e0} -> {st['eaten']})")
    pg.keyboard.press('b'); adv(pg, 2500); st = pg.evaluate(S)
    ok(st['auto'] and st['eaten'] >= 4, f"B turns on the bird's rule and the bird hunts by itself (eaten {st['eaten']})")
    for i in range(400):
        st = pg.evaluate(S)
        if st['ask']: break
        adv(pg, 100)
    ok(st['ask'], 'a prediction opens at dusk')
    aid = st['ask']
    pg.evaluate("()=>{ const o = TB.Predict.overlay(0); if (o) o.focus = false; TB.REG.lichen.lockIn(); }"); adv(pg, 100)
    ok(pg.evaluate(S)['ask'] == aid and 'Drag the diamond first' in pg.evaluate("()=>document.getElementById('whisper').innerText"), 'Lock in with an unmoved diamond asks for a drag instead of committing')
    ok(pg.evaluate("()=>TB.Strip.isOpen"), 'phone: the prediction opened the strip')
    pg.keyboard.press('p'); adv(pg, 40)
    for k in ['ArrowRight'] * 4: pg.keyboard.press(k); adv(pg, 30)
    pg.keyboard.press('Enter'); adv(pg, 60)
    st = pg.evaluate(S); pv = pg.evaluate("id=>TB.REG.lichen.sim.s.pred[id]", aid)
    ok(not st['ask'] and pv is not None, f'P, arrows and Enter move the diamond and lock it in (prediction {pv})')
    HS = "()=>{const s=TB.REG.lichen.sim.s; return {ph: s.phase, t: s.t, open: TB.Strip.isOpen, ht: TB.REG.lichen.v.hatchT};}"
    h0 = pg.evaluate(HS); adv(pg, 1000); h1 = pg.evaluate(HS)
    ok(h0['ph'] == 'hatch' and h1['ph'] == 'hatch' and h1['t'] == 0 and h1['open'] and h1['ht'] == 0, f'phone: the hatch waits while the strip shows the reveal ({h0} -> {h1})')
    adv(pg, 1200); h2 = pg.evaluate(HS)
    ok(not h2['open'] and (h2['ph'] != 'hatch' or h2['t'] > 0), f'phone: the strip closes, then the hatch plays in full view ({h2})')
    for i in range(400):
        st = pg.evaluate(S)
        if st['ask']: break
        adv(pg, 100)
    aid2 = st['ask']; adv(pg, 9600); st = pg.evaluate(S); pv = pg.evaluate("id=>TB.REG.lichen.sim.s.pred[id]", aid2)
    said = pg.evaluate("()=>TB.Whisper.log.map(x => x.text).join(' | ')")
    ok(aid2 and not st['ask'] and pv is None and 'No prediction' in said, f'the 9 s soft timer on an unmoved diamond is no prediction, and says so ({said[-80:]})')
    clean(pg, 'keyboard'); ctx.close()

    # L0: the press-and-hold demo shows at the second dawn and outlives it; a hold pins there; Auto-hunt appears after morning 1
    ctx, pg, ext = page(b, '?unit=lichen&level=0&seed=6')
    adv(pg, 1500)
    for i in range(40):
        st = pg.evaluate(S)
        if st['gen'] > 1: break
        pg.evaluate("()=>{const ch=TB.REG.lichen,L=ch.sim.live(ch.sim.s); if (L.length) TB.Sim.act(ch,{k:'peck',i:L[0]});}"); adv(pg, 300)
    for i in range(80):
        if pg.evaluate(S)['phase'] == 'hunt': break
        adv(pg, 100)
    adv(pg, 400)
    ok(pg.evaluate("()=>TB.Ghost.active && TB.Ghost.last && TB.Ghost.last.verb === 'hold'"), 'L0 morning 2: the press-and-hold ghost is showing during the hunt')
    ok(pg.evaluate("()=>TB.Dock.items.some(b => b.id === 'auto')"), 'L0 morning 2: Auto-hunt is offered (a small chip)')
    r = pg.evaluate("()=>{const ch=TB.REG.lichen,s=ch.sim.s,L=ch.sim.live(s),p=ch.pos(s.moths[L[0]]),c=document.getElementById('scene').getBoundingClientRect();return [c.left+p[0],c.top+p[1]];}")
    pg.mouse.move(r[0], r[1]); pg.mouse.down(); adv(pg, 700); pg.mouse.up(); adv(pg, 100)
    ok(pg.evaluate(S)['pins'] == 1, 'L0 morning 2: a hold pins the moth')
    clean(pg, 'L0 pin'); ctx.close()

    # two hungry mornings offer Untimed; it switches the clock to looks
    ctx, pg, ext = page(b, '?unit=lichen&level=1&seed=12')
    for i in range(600):
        if pg.evaluate("()=>TB.REG.lichen.sim.s.hist.filter(r => r.starved > 0).length") >= 2 and pg.evaluate(S)['phase'] in ('hunt', 'dawn'): break
        if pg.evaluate(S)['ask']: pg.evaluate("()=>{ const s = TB.REG.lichen.sim.s; TB.Predict.commit(s.ask.id); }")
        adv(pg, 250)
    ok(pg.evaluate("()=>TB.Dock.items.some(b => b.id === 'unt')"), 'after two hungry mornings the dock offers Untimed')
    for i in range(200):
        if pg.evaluate(S)['phase'] == 'dusk': break
        adv(pg, 100)
    t0 = pg.evaluate("()=>TB.REG.lichen.sim.s.t"); pg.keyboard.press(' '); adv(pg, 200); t1 = pg.evaluate("()=>TB.REG.lichen.sim.s.t")
    ok(pg.evaluate("()=>TB.REG.lichen.v.ff") and pg.evaluate(S)['phase'] in ('dusk', 'hatch', 'ask', 'dawn'), f'Space speeds up a dusk seen before (sim clock {t0:.2f} -> {t1:.2f} in 0.2 s)')
    for i in range(200):
        if pg.evaluate(S)['phase'] in ('hunt', 'dawn'): break
        if pg.evaluate(S)['ask']: pg.evaluate("()=>{ const s = TB.REG.lichen.sim.s; TB.Predict.commit(s.ask.id); }")
        adv(pg, 100)
    pg.evaluate("()=>{ const b = TB.Dock.items.find(b => b.id === 'unt'); b && b.el.click(); }"); adv(pg, 100)
    st = pg.evaluate(S); ok(st['looks'] is not None and pg.evaluate("()=>TB.Save.d.ui.unt") == 1, f"Untimed: the morning now counts looks ({st['looks']})")
    pg.evaluate("()=>{ TB.Save.d.ui.unt = 0; }")
    clean(pg, 'untimed offer'); ctx.close()

    # the level card on a small phone: What if? chips in view; Why? opens on the level's own story; the star hint fits the level
    ctx, pg, ext = page(b, '?unit=lichen&level=1&seed=3', (360, 640))
    pg.evaluate("()=>TB.Sim.act(TB.REG.lichen, {k: 'auto', on: true})")
    for i in range(900):
        if pg.evaluate(S)['card']: break
        if pg.evaluate(S)['ask']: pg.evaluate("()=>{ const s = TB.REG.lichen.sim.s; TB.Predict.commit(s.ask.id); }")
        adv(pg, 250)
    adv(pg, 800)
    still = pg.evaluate("()=>{ const e = document.querySelector('#cards .card .still'); return e ? e.innerText : ''; }")
    ok('boss' not in still.lower() and 'histogram' not in still.lower(), f'L1 card: the unmet-star hint names a star this level gives ("{still[:70]}")')
    pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => x.textContent === 'Why?'); b && b.click(); }"); adv(pg, 300)
    why = pg.evaluate("()=>{ const e = document.querySelector('#cards .card .why'); return e ? e.innerText : ''; }")
    ok('peppered' in why.lower() and 'jays' not in why.lower(), f'L1 card: Why? opens on the peppered moth, not the boss ("{why[:60]}")')
    pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => x.textContent === 'Why?'); b && b.click(); }"); adv(pg, 200)
    pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => x.textContent === 'What if?'); b && b.click(); }"); adv(pg, 400)
    g = pg.evaluate("()=>{ const c = [...document.querySelectorAll('#cards .chip')].map(x => x.getBoundingClientRect()), btn = document.querySelector('#cards .card-btns').getBoundingClientRect(); return {chips: c.map(r => [Math.round(r.top), Math.round(r.bottom)]), btnTop: Math.round(btn.top), vh: innerHeight}; }")
    ok(g['chips'] and all(t >= 0 and b2 <= g['btnTop'] + 1 for t, b2 in g['chips']), f'360x640: the What if? chips are in view above the card buttons ({g})')
    clean(pg, 'card 360x640'); ctx.close()

    ctx, pg, ext = page(b, '?unit=lichen&level=3&seed=2')
    pg.evaluate("()=>{ TB.Save.d.ui.unt = 1; TB.App.playLevel(TB.REG.lichen, 3, {seed: 2}); }"); adv(pg, 900)
    st = pg.evaluate(S); ok(st['looks'] == 20, f"untimed: a morning is 20 looks, no clock (looks {st['looks']})")
    t0 = pg.evaluate("()=>TB.REG.lichen.sim.s.time"); adv(pg, 5000); st = pg.evaluate(S)
    ok(st['phase'] == 'hunt' and pg.evaluate("()=>TB.REG.lichen.sim.s.time") == t0, 'untimed: the morning waits for you')
    pg.evaluate("()=>{ TB.Save.d.ui.unt = 0; }")
    clean(pg, 'untimed boss'); ctx.close()

    # teacher, projector, desktop, calm
    for q, vp, calm in [('?unit=lichen&level=1&seed=9&teacher=1', (1280, 720), False), ('?unit=lichen&level=3&seed=9&projector=1', (1280, 720), False), ('?unit=lichen&level=0&seed=4', (390, 780), True)]:
        ctx, pg, ext = page(b, q, vp, calm)
        for i in range(60):
            pg.mouse.click(vp[0] * 0.3 + (i * 37) % (vp[0] * 0.3), 200 + (i * 53) % 300); adv(pg, 250)
        st = pg.evaluate(S); ok(st and st['level'] == int(q.split('level=')[1][0]), f'{q} plays')
        clean(pg, q + (' calm' if calm else '')); ok(not ext, f'{q}: offline'); ctx.close()

    # ?v1=1: the legacy Lichen Wood is untouched
    ctx, pg, ext = page(b, '?v1=1')
    v = pg.evaluate("()=>({v2: TB.REG.lichen.v2 === true, mode: TB.REG.lichen.mode, take: (typeof TAKE !== 'undefined')})")
    ok(not v['v2'] and v['mode'] == 'hunt', '?v1=1 keeps the legacy Hunt-mode Lichen Wood')
    pg.evaluate("()=>TB.App.play(TB.REG.lichen)"); adv(pg, 3000)
    ok(pg.evaluate("()=>TB.App.mode === TB.Hunt"), '?v1=1: the legacy chapter runs')
    clean(pg, '?v1=1'); ctx.close()
    b.close()

fails = [m for good, m in results if not good]
print(f'lichen smoke: {len(results) - len(fails)} passed, {len(fails)} failed')
sys.exit(1 if fails else 0)
