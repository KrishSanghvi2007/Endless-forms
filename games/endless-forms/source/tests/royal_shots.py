"""The Royal Line (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/royal_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=deut'] [--calm]

Plays each level with the expert policy through Sim.act (L1's first cross as a real drag of a bottle; every prediction a real
drag on the strip, then Lock in; the boss slider a real drag) under virtual time and saves PNGs named L<n>_<phase>_<w>x<h>.png.
Prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """(o)=>{ const ch = TB.REG.royal, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, kind: s.ask.kind, lo: s.ask.lo, hi: s.ask.hi, exp: s.exp[s.ask.id], at: s.ask.at};
  const r = {phase: s.phase, kind: s.kind, n: (s.crosses || []).length, g: s.g || 0, ci: s.ci || 0, cg: s.cg || 0, son: s.son || 0, ct: s.ct || 0, i: s.cur && s.cur.i || 0};
  if (s.kind === 'cross' && s.phase === 'pick' && r.n === 0 && o.drag) return Object.assign(r, {drag: true});
  if (s.kind === 'gallery' && (s.phase === 'prior' || s.phase === 'post')) return Object.assign(r, {judge: true});
  const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a && a.k !== 'predict' && a.k !== 'judge') TB.Sim.act(ch, a);
  return r; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    ap.add_argument('--seed', type=int, default=7)
    a = ap.parse_args()
    html = os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v2.html')
    os.makedirs(a.out, exist_ok=True)
    vclock = open(os.path.join(SRC, 'vclock.js')).read()
    errs = []
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
            pg.goto('file://' + html + ('?dev=1&intro=0' if not q else q + '&dev=1&intro=0'))
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.royal, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: (pg.evaluate("()=>window.__advance(80)"), pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag))))
                have = set()
                once = lambda name: (name not in have) and (have.add(name) or True)
                pg.evaluate("()=>window.__advance(900)")
                shot('start')
                asks = 0
                for step in range(9000):
                    st = pg.evaluate(STEP, {'drag': True})
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        asks += 1
                        shot('ask%d' % asks)
                        box = pg.evaluate("()=>{ const c = TB.Strip.canvas(0); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }")
                        if box:
                            x, y, bw, bh = box
                            f = (st['exp'] - st['lo']) / (st['hi'] - st['lo'])
                            if st['kind'] == 'x':
                                pg.mouse.move(x + bw * 0.5, y + bh * 0.85); pg.mouse.down(); pg.mouse.move(x + bw * (0.04 + 0.7 * f), y + bh * 0.85, steps=6); pg.mouse.up()
                            else:
                                pg.mouse.move(x + bw * 0.6, y + bh * 0.5); pg.mouse.down(); pg.mouse.move(x + bw * 0.6, y + bh * (0.85 - 0.7 * f), steps=6); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                        # land exactly on the expectation through the ghost (the drag above shows the gesture; the axis mapping varies by layout)
                        pg.evaluate("(e)=>{ const r = TB.Predict.overlay(0); if (r && r.active) { r.v = e; r.moved = true; } TB.Predict.commit(); window.__advance(500); }", st['exp'])
                        shot('reveal%d' % asks)
                        pg.evaluate("()=>window.__advance(900)")
                        continue
                    if st.get('drag'):
                        bx = pg.evaluate("()=>{ const ch = TB.REG.royal, c = TB.Stage.cv.getBoundingClientRect(), a = ch.bottleXY('wf'), b = ch.bottleXY('mm'); return [c.x + a[0], c.y + a[1], c.x + b[0], c.y + b[1]]; }")
                        pg.mouse.move(bx[0], bx[1]); pg.mouse.down(); pg.mouse.move((bx[0] + bx[2]) / 2, bx[1] + 40, steps=5)
                        pg.evaluate("()=>window.__advance(60)"); shot('drag')
                        pg.mouse.move(bx[2], bx[3], steps=5); pg.mouse.up(); pg.evaluate("()=>window.__advance(200)")
                        continue
                    if st.get('judge'):
                        sl = pg.evaluate("()=>{ const ch = TB.REG.royal, s = ch.sim.s, c = TB.Stage.cv.getBoundingClientRect(), P = ch.pos(), cs = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); return [c.x + P.sl.x, c.y + P.sl.y, P.sl.w, cs.v]; }")
                        pg.mouse.move(sl[0] + sl[2] * 0.5, sl[1]); pg.mouse.down(); pg.mouse.move(sl[0] + sl[2] * sl[3], sl[1], steps=6); pg.mouse.up()
                        pg.evaluate("()=>window.__advance(100)")
                        nm = 'prior%d' % st['ci'] if st['phase'] == 'prior' else 'post%d' % st['ci']
                        if st['ci'] in (0, 1, 3) and once(nm): shot(nm)
                        pg.evaluate("()=>{ const ch = TB.REG.royal; ch.sealIt(); window.__advance(120); }")
                        if st['phase'] == 'post' and st['ci'] in (1, 3) and once('rev%d' % st['ci']): pg.evaluate("()=>window.__advance(500)"); shot('reveal%d' % st['ci'])
                        continue
                    ph = st.get('phase'); k = st.get('kind')
                    if k == 'cross':
                        if ph == 'hatch' and st['i'] > 20 and once('hatch%d' % st['n']) and st['n'] in (1, 3, 4): shot('hatch%d' % st['n'])
                        if ph == 'sorted' and once('sorted%d' % st['n']) and st['n'] in (2, 4): shot('sorted%d' % st['n'])
                    if k == 'cage':
                        if ph == 'gen' and st['g'] in (4, 8) and once('gen%d' % st['g']): shot('gen%d' % st['g'])
                        if ph == 'tgen' and once('tgen'): pg.evaluate("()=>window.__advance(1500)"); shot('tgen')
                    if k == 'lamp':
                        if ph == 'court' and st['ct'] > 1.0 and once('court%d' % st['g']) and st['g'] in (0, 3): shot('court%d' % st['g'])
                        if ph == 'court' and st['cg'] >= 1 and once('stumble'): pg.evaluate("()=>window.__advance(150)"); shot('stumble')
                        if ph == 'auto' and st['g'] > 40 and once('auto'): shot('auto')
                    if k == 'gallery':
                        if ph == 'sons' and st['son'] >= 1 and once('sons%d' % st['ci']) and st['ci'] in (0, 1): pg.evaluate("()=>window.__advance(300)"); shot('sons%d' % st['ci'])
                    pg.evaluate("()=>window.__advance(40)")
                warn = pg.evaluate("()=>({lbl: (TB.Lbl && TB.Lbl.warnings || []).slice(0, 5), wh: (TB.Whisper && TB.Whisper.warnings || []).slice(0, 5), hud: (TB.HUD && TB.HUD.warnings || []).slice(0, 5), lg: (TB.LiveGraph && TB.LiveGraph.errors || []).slice(0, 3)})")
                if any(warn.values()): print('L%d %s warnings:' % (lv + 1, tag), warn)
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERROR', e)
    print('shots:', a.out, 'errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
