"""The Lichen Wood: a scripted playthrough with screenshots of every level and phase (owned by the lichen unit).

  python3 tests/lichen_shots.py BUILD.html OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--seed 7] [--calm] [--whatif]

A scripted, competent player pecks the darkest moths (real mouse clicks on the canvas), drags each prediction ghost to
the expectation's neighbourhood with the mouse (or taps the triangle), and clicks through the level cards. Captures:
<level>_<phase>_<w>x<h>.png for hunt, a mid-morning, dusk (eggs), the ask, the hatch and the level card.
Prints a JSON line per viewport with errors, warnings and the stars earned. Exit 1 on a JavaScript error.
"""
import os, sys, json, argparse
from playwright.sync_api import sync_playwright

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """() => { const ch = TB.REG.lichen, s = ch.sim.s; if (!s) return null;
  const live = ch.sim.live(s).map(i => { const m = s.moths[i], p = ch.pos(m); return {i, x: p[0], y: p[1], c: ch.sim.consp(s, m), m: m.m}; });
  const card = document.querySelector('#cards.on .card');
  return {phase: s.phase, dk: s.dk, gen: s.gen, gens: s.gens, level: s.level, eaten: s.eaten, quota: s.quota, live, ask: s.ask,
          card: card ? {cls: card.className, stars: card.dataset.stars, text: card.innerText.slice(0, 400)} : null}; }"""


DRAG = """() => { const s = TB.REG.lichen.sim.s, A = s.ask, cv = TB.Strip.canvas(0); if (!A || !cv || !cv._lg) return;
  const G = cv._lg.G, r = cv.getBoundingClientRect(); let x, y; const e = s.exp[A.id];
  if (A.kind === 'tri') { const q = G.P(e); x = q[0]; y = q[1]; } else if (A.kind === 'y') { x = G.X(1); y = G.Y(e + 3); } else { x = G.X(e + 0.005); y = G.plot.y + G.plot.h - 10; }
  const fire = (t, px, py) => cv.dispatchEvent(new PointerEvent(t, {clientX: r.left + px, clientY: r.top + py, pointerId: 2, bubbles: true}));
  fire('pointerdown', x, y); fire('pointerup', x, y); }"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html'); ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720'); ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--seed', type=int, default=7); ap.add_argument('--calm', action='store_true'); ap.add_argument('--whatif', action='store_true')
    ap.add_argument('--query', default=''); ap.add_argument('--untimed', action='store_true')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    vclock = open(os.path.join(SRC, 'vclock.js')).read()
    levels = [int(x) for x in a.levels.split(',')]
    fail = False
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for vp in a.vp.split(','):
            w, h = (int(v) for v in vp.split('x'))
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if a.calm else 'no-preference')
            pg = ctx.new_page()
            logs = []
            pg.on('console', lambda m: logs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
            pg.add_init_script(script=vclock)
            pg.goto('file://' + os.path.abspath(a.html) + a.query); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
            pg.evaluate("()=>window.__advance(1500)")
            if a.untimed: pg.evaluate("()=>{ TB.Save.d.ui.unt = 1; }")
            adv = lambda ms: pg.evaluate("ms=>window.__advance(ms)", ms)
            st = lambda: pg.evaluate(STATE)
            tag = f'{w}x{h}'
            shot = lambda name: pg.screenshot(path=os.path.join(a.out, f'{name}_{tag}.png'))
            res = {'vp': tag, 'levels': {}}
            for lv in levels:
                pg.evaluate("([lv, sd]) => { TB.Cards.close(); TB.App.playLevel(TB.REG.lichen, lv, {seed: sd}); }", [lv, a.seed + lv])
                adv(300); shot(f'L{lv}_start'); adv(900)
                shots = {'hunt': False, 'mid': False, 'dusk': False, 'eggs': False, 'ask': False, 'hatch': False, 'cull': False, 'jays': False}
                for step in range(6000):
                    s = st()
                    if s is None: break
                    if s['card']:
                        shot(f'L{lv}_card'); res['levels'][lv] = {'stars': s['card']['stars'], 'text': s['card']['text'][:200]}
                        if a.whatif and lv in (1, 3):
                            adv(500)
                            chips = pg.evaluate("() => { const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => /what if/i.test(x.textContent)); if (b) b.click(); return !!b; }")
                            adv(200)
                            if chips:
                                pg.evaluate("() => { const c = [...document.querySelectorAll('#cards .chip')]; const k = c.find(x => /inherit|rare/i.test(x.textContent)) || c[0]; if (c.length) c[0].ownerDocument && k.click(); }")
                                adv(600); shot(f'L{lv}_whatif_start')
                                for st2 in range(3000):
                                    s2 = st()
                                    if s2['card']: shot(f'L{lv}_whatif_card'); res['levels'][str(lv) + 'w'] = {'stars': s2['card']['stars'], 'text': s2['card']['text'][:200]}; break
                                    if s2['phase'] in ('hunt', 'dawn') and s2['live']:
                                        t = sorted(s2['live'], key=lambda q: -q['c'])[0]; pg.mouse.click(t['x'] + pg.evaluate("()=>document.getElementById('scene').getBoundingClientRect().left"), t['y'] + pg.evaluate("()=>document.getElementById('scene').getBoundingClientRect().top")); adv(250); continue
                                    if s2['phase'] == 'ask':
                                        adv(300); shot(f'L{lv}_whatif_ask'); pg.evaluate(DRAG); adv(200); shot(f'L{lv}_whatif_ask_moved')
                                        pg.evaluate("() => { const s = TB.REG.lichen.sim.s; if (s.ask) TB.Predict.commit(s.ask.id); }"); adv(150); shot(f'L{lv}_whatif_reveal'); adv(400); continue
                                    if s2['phase'] == 'auto' and not shots.get('auto'): adv(4000); shot(f'L{lv}_whatif_auto'); shots['auto'] = True; continue
                                    adv(200)
                        break
                    ph = s['phase']
                    if ph in ('hunt', 'dawn'):
                        if not shots['hunt'] and ph == 'hunt': shot(f'L{lv}_hunt'); shots['hunt'] = True
                        if s['live']:
                            if lv == 3:   # the search image: stay with the commonest look on this trunk
                                cnt = [0, 0, 0]
                                for q in s['live']: cnt[q['m']] += 1
                                best = cnt.index(max(cnt)); t = [q for q in s['live'] if q['m'] == best][0]
                            else:
                                t = sorted(s['live'], key=lambda q: -q['c'])[0]
                            r = pg.evaluate("()=>{const r=document.getElementById('scene').getBoundingClientRect();return [r.left,r.top]}")
                            if lv == 0 and s['gen'] == 2 and not pg.evaluate("()=>TB.REG.lichen.sim.s.pins.length"):
                                pg.mouse.move(r[0] + t['x'], r[1] + t['y']); pg.mouse.down(); adv(600); pg.mouse.up(); adv(100); shot(f'L{lv}_pin'); continue
                            pg.mouse.click(r[0] + t['x'], r[1] + t['y'])
                            adv(330 if lv < 3 else 300)
                            if not shots['mid'] and s['eaten'] >= 6: shot(f'L{lv}_mid'); shots['mid'] = True
                        else: adv(200)
                        continue
                    if ph == 'dusk':
                        if s['dk'] == 'fall' and lv == 3 and not shots['jays']: adv(700); shot(f'L{lv}_jays'); shots['jays'] = True; continue
                        if s['dk'] == 'eggs' and not shots['eggs']: adv(500); shot(f'L{lv}_eggs'); shots['eggs'] = True; continue
                        if s['dk'] == 'cull' and not shots['cull']: adv(450); shot(f'L{lv}_cull'); shots['cull'] = True; continue
                        adv(150); continue
                    if ph == 'ask':
                        adv(300)
                        if not shots['ask']: shot(f'L{lv}_ask'); shots['ask'] = True
                        # drag the ghost on the strip's first chart towards the expectation, then Lock in
                        pg.evaluate(DRAG)
                        adv(200)
                        if not shots.get('ask2'): shot(f'L{lv}_ask_moved'); shots['ask2'] = True
                        pg.evaluate("() => { const s = TB.REG.lichen.sim.s; if (s.ask) TB.Predict.commit(s.ask.id); }")
                        adv(120)
                        if not shots.get('reveal'): shot(f'L{lv}_reveal'); shots['reveal'] = True
                        adv(100); continue
                    if ph == 'hatch':
                        if not shots['hatch'] and pg.evaluate("()=>TB.REG.lichen.v.hatchT") > 0: adv(350); shot(f'L{lv}_hatch'); shots['hatch'] = True; continue
                        adv(200); continue
                    adv(200)
            errs = pg.evaluate("()=>window.__errs.slice(0,5)")
            warns = pg.evaluate("()=>({lbl: (TB.Lbl||{}).warnings, wh: (TB.Whisper||{}).warnings, hud: (TB.HUD||{}).warnings, dock: (TB.Dock||{}).warnings, bad: window.__bad.slice(0,3), txt: (TB.Txt||{}).warnings})")
            res['errors'] = errs; res['warnings'] = warns; res['console'] = logs[:6]; res['vt'] = pg.evaluate("()=>Math.round(window.__vt()/1000)")
            print(json.dumps(res))
            if errs: fail = True
            ctx.close()
        b.close()
    sys.exit(1 if fail else 0)


if __name__ == '__main__':
    main()
