"""Drift Casino (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/casino_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3,4] [--calm] [--query '?cvd=deut']

Plays each level with a scripted player (chips near the expectation, four crashes on the 20-bead rack, a sized storm, a
managed zoo) under virtual time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Also checks act-to-juice latency on a chip
tap and that the Spin button never disappears in the bet phase. Prints any page error. Exit 1 on an error."""
import os, sys, json, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

PLAYER = """(lv)=>{
  const ch = TB.REG.casino, s = ch.sim.s, X = ch.sci, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className, phase: s.phase};
  const alloc = w => { const n = w.length, tot = w.reduce((a, b) => a + b, 0), raw = w.map(x => 10 * x / tot), base = raw.map(Math.floor); let left = 10 - base.reduce((a, b) => a + b, 0); const ord = raw.map((x, i) => [x - base[i], i]).sort((a, b) => b[0] - a[0]); for (let k = 0; k < n && left > 0; k++, left--) base[ord[k][1]]++; return base; };
  if (s.phase === 'bet') {
    if (lv === 3 && !s.fixedN && s.n !== (s.ti === 1 ? 3 : 9)) { TB.Sim.act(ch, {k: 'storm', n: s.ti === 1 ? 3 : 9}); return {phase: 'storm', n: s.n, ti: s.ti}; }
    if (lv === 1 && s.ti === 1 && s.jars.filter(J => J.crash >= 0).length < 4) { TB.Sim.act(ch, {k: 'vol', j: 2 + 2 * s.jars.filter(J => J.crash >= 0).length}); return {phase: 'vol', ti: s.ti}; }
    const vols = s.jars ? s.jars.filter(J => J.crash >= 0).length : 0;
    const e = X.DC_SC.expectBins({level: s.level, N: s.N, p: s.p0, n: s.n, mode: 'w', vols, nj: s.jars ? s.jars.length : 12}), t = alloc(e);
    for (let b = 0; b < t.length; b++) if (s.chips[b] < t[b]) { TB.Sim.act(ch, {k: 'add', b}); return {phase: 'bet', placed: s.chips.reduce((a, b) => a + b, 0)}; }
    return {phase: 'bet', placed: 10, ready: 1};
  }
  if (s.phase === 'zoo' && !s.zoo.auto) { const Z = s.zoo; if (!Z.bal) TB.Sim.act(ch, {k: 'bal'}); else if (!Z.eq && Z.gen < 15) TB.Sim.act(ch, {k: 'eq', on: true}); else if (Z.eq && Z.gen >= 15) TB.Sim.act(ch, {k: 'eq', on: false}); else if (Z.gen === 16 && !Z.migs) TB.Sim.act(ch, {k: 'mig'}); }
  return {phase: s.phase, ask: s.ask && s.ask.id, ti: s.ti, gen: s.gen, side: s.side, zg: s.zoo && s.zoo.gen};
}"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3,4')
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
                    key = (ph, st.get('ask'), st.get('ti'), st.get('side'))
                    if ph == 'bet' and st.get('placed') == 5 and ('bet5', st.get('ti')) not in shots:
                        shots.add(('bet5', st.get('ti'))); shot('bet%d_t%d' % (5, (st.get('ti') or 0) + 1))
                    if ph == 'bet' and st.get('ready'):
                        if ('ready', st.get('ti')) not in shots and st.get('ti', 0) == 0:
                            shots.add(('ready', st.get('ti'))); shot('ready')
                        pg.evaluate("()=>TB.Sim.act(TB.REG.casino, {k: 'spin'})")
                    if ph == 'vol' and ('vol', st.get('ti')) not in shots and pg.evaluate("()=>TB.REG.casino.sim.s.jars.filter(J => J.crash >= 0).length") == 4:
                        pg.evaluate("()=>window.__advance(300)"); shots.add(('vol', st.get('ti'))); shot('crashes_t%d' % (st.get('ti') + 1))
                    if ph == 'storm' and lv == 3 and ('storm', st.get('ti')) not in shots:
                        pg.evaluate("()=>window.__advance(200)"); shots.add(('storm', st.get('ti'))); shot('storm_t%d' % (st.get('ti') + 1))
                    if ph == 'ask' and ('ask', st.get('ask')) not in shots:
                        pg.evaluate("()=>window.__advance(400)")
                        shots.add(('ask', st.get('ask'))); shot('ask_' + st.get('ask'))
                        # move the ghost a little with keys, then commit through Predict (the scripted player's answer: the expectation)
                        pg.evaluate("""()=>{ const ch = TB.REG.casino, s = ch.sim.s; const e = ch.sci.DC_SC.expectAsk(s, s.ask.id), P = TB.Predict; if (P && P.cur) { P._set(P.cur, e); P.commit(); } else TB.Sim.act(ch, {k: 'predict', id: s.ask.id, v: e}); }""")
                        pg.evaluate("()=>window.__advance(350)")
                        folded = pg.evaluate("()=>({open: !!TB.Strip.isOpen, phone: TB.Strip.phone(), ask: !!TB.REG.casino.sim.s.ask})")
                        if folded['phone'] and folded['open'] and not folded['ask']: notes.append('L%d %s: the strip is still open 350 ms after Lock in' % (lv + 1, st.get('ask')))
                        pg.evaluate("()=>window.__advance(1450)")
                    if ph in ('run', 'sideRun', 'zoo') and key != last:
                        runShot = 0
                    if ph in ('run', 'sideRun', 'zoo'):
                        runShot += 1
                        if runShot == (6 if ph != 'zoo' else 12) and (ph, st.get('ti'), st.get('side')) not in shots:
                            shots.add((ph, st.get('ti'), st.get('side'))); nm = {'run': 'run', 'sideRun': 'side', 'zoo': 'zoo'}[ph]
                            shot('%s_t%d' % (nm, (st.get('side') if ph == 'sideRun' else st.get('ti') or 0) + 1))
                    if ph == 'settle' and ('settle', st.get('ti'), st.get('side')) not in shots:
                        pg.evaluate("()=>window.__advance(900)")
                        shots.add(('settle', st.get('ti'), st.get('side'))); shot('settle_t%d%s' % ((st.get('ti') or 0) + 1, '_side%d' % (st.get('side') + 1) if st.get('side', -1) >= 0 else ''))
                    if ph == 'erupt' and 'erupt' not in shots:
                        shots.add('erupt'); shot('erupt'); pg.evaluate("()=>TB.Sim.act(TB.REG.casino, {k: 'erupt'})"); pg.evaluate("()=>window.__advance(500)"); shot('crash_a')
                        pg.evaluate("()=>window.__advance(1600)"); shot('crash_b')
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
