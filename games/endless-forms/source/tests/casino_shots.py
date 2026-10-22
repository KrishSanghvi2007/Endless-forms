"""Drift Casino (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/casino_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--calm] [--query '?cvd=deut']

Plays each level (fly bottles, Buri's bottles, the castaways, the hurricane; D6 decisions 9 and 10) with a scripted player
(chips near the expectation) under virtual time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Also checks act-to-juice
latency on a chip tap. Prints any page error. Exit 1 on an error."""
import os, sys, json, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

PLAYER = """(lv)=>{
  const ch = TB.REG.casino, s = ch.sim.s, X = ch.sci, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className, phase: s.phase};
  const alloc = w => { const n = w.length, tot = w.reduce((a, b) => a + b, 0), raw = w.map(x => 10 * x / tot), base = raw.map(Math.floor); let left = 10 - base.reduce((a, b) => a + b, 0); const ord = raw.map((x, i) => [x - base[i], i]).sort((a, b) => b[0] - a[0]); for (let k = 0; k < n && left > 0; k++, left--) base[ord[k][1]]++; return base; };
  if (s.phase === 'bet') {
    const e = X.DC_SC.expectBins({level: s.level, N: s.N, p: s.p0, n: s.n, surv: s.surv, mode: 'w'}), t = alloc(e);
    for (let b = 0; b < t.length; b++) if (s.chips[b] < t[b]) { TB.Sim.act(ch, {k: 'add', b}); return {phase: 'bet', placed: s.chips.reduce((a, b) => a + b, 0)}; }
    return {phase: 'bet', placed: 10, ready: 1};
  }
  return {phase: s.phase, ti: s.ti, gen: s.gen};
}"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    ap.add_argument('--whatif', action='store_true')
    a = ap.parse_args()
    html = os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v1.html')
    os.makedirs(a.out, exist_ok=True)
    vclock = open(os.path.join(SRC, 'vclock.js')).read()
    errs, notes = [], []
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for vp in a.vp.split(','):
            w, h = [int(x) for x in vp.split('x')]
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if a.calm else 'no-preference')
            pg = ctx.new_page()
            pg.add_init_script(vclock)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            q = a.query
            pg.goto('file://' + html + q); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.casino, lv, {seed: 11}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                pg.evaluate("()=>window.__advance(700)")
                shot('start')
                if lv == 0:   # act-to-juice latency: a real tap on bin 0, then the time to the first Fx call
                    lat = pg.evaluate("""()=>{ const ch = TB.REG.casino, G = ch.geo(), B = G.bins[0], cv = document.getElementById('scene'), r = cv.getBoundingClientRect();
                      let t0 = performance.now(), seen = -1; const F = TB.Fx, orig = F.tween; const mark = () => { if (seen < 0) seen = performance.now() - t0; };
                      const o1 = F.ring; F.ring = function () { mark(); return o1.apply(this, arguments); };
                      const ev = (t, x, y) => cv.dispatchEvent(new PointerEvent(t, {clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true}));
                      ev('pointerdown', B.x + B.w / 2, B.y + B.h * 0.5); window.__advance(60); t0 = performance.now(); ev('pointerup', B.x + B.w / 2, B.y + B.h * 0.5);
                      for (let i = 0; i < 20 && seen < 0; i++) window.__advance(20);
                      F.ring = o1; return {seen, chips: ch.sim.s.chips.slice()}; }""")
                    notes.append('L1 chip tap: chips %s, juice after %s ms (virtual)' % (lat['chips'], lat['seen']))
                last, shots, runShot, k = None, set(), 0, 0
                for step in range(6000):
                    st = pg.evaluate(PLAYER, lv)
                    ph = st.get('phase')
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1600)")
                        shot('card')
                        if a.whatif:   # open What if? and thaw the first lever
                            ok = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); const b = [...c.querySelectorAll('.card-btns button')].find(x => x.textContent === 'What if?'); if (!b) return false; b.click(); const chip = c.querySelector('.chip[data-lever]'); if (!chip) return false; chip.click(); return true; }")
                            if ok:
                                for s2 in range(800):
                                    done = pg.evaluate("()=>!!document.querySelector('#cards.on .card')")
                                    if s2 == 40: shot('whatif_run')
                                    if done: break
                                    pg.evaluate("()=>window.__advance(150)")
                                pg.evaluate("()=>window.__advance(1600)")
                                shot('whatif_card')
                        break
                    key = (ph, st.get('ti'))
                    if ph == 'bet' and st.get('placed') == 5 and ('bet5', st.get('ti')) not in shots:
                        shots.add(('bet5', st.get('ti'))); shot('bet%d_t%d' % (5, (st.get('ti') or 0) + 1))
                    if ph == 'bet' and st.get('ready'):
                        if ('ready', st.get('ti')) not in shots and st.get('ti', 0) == 0:
                            shots.add(('ready', st.get('ti'))); shot('ready')
                        pg.evaluate("()=>TB.Sim.act(TB.REG.casino, {k: 'spin'})")
                    if ph == 'run' and key != last:
                        runShot = 0
                    if ph == 'run':
                        runShot += 1
                        if runShot == 6 and (ph, st.get('ti')) not in shots:
                            shots.add((ph, st.get('ti'))); shot('run_t%d' % ((st.get('ti') or 0) + 1))
                    if ph == 'settle' and ('settle', st.get('ti')) not in shots:
                        pg.evaluate("()=>window.__advance(900)")
                        shots.add(('settle', st.get('ti'))); shot('settle_t%d' % ((st.get('ti') or 0) + 1))
                    last = key
                    pg.evaluate("()=>window.__advance(120)")
                else:
                    notes.append('L%d: no card after 6000 steps (%s)' % (lv + 1, json.dumps(st)))
            ctx.close()
        b.close()
    for n in notes: print('note', n)
    for e in errs[:10]: print('ERROR', e)
    print('casino_shots: %d errors; shots in %s' % (len(errs), a.out))
    sys.exit(1 if errs else 0)

if __name__ == '__main__':
    main()
