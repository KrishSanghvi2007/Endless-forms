"""Gene Swamping (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/swamp_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=deut'] [--calm]

Plays each level with the scripted expert (through Sim.act; each prediction a real drag on the strip, then Lock in) under virtual
time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """(lv)=>{ const ch = TB.REG.swamp, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, phase: s.phase, chart: s.ask.chart, kind: s.ask.kind, lo: s.ask.lo, hi: s.ask.hi, exp: s.exp[s.ask.id]};
  const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a && a.k !== 'predict') TB.Sim.act(ch, a);
  return {phase: s.phase, n: s.n || 0, r: s.r || 0, open: s.h ? s.h.mice.length : 0, fed: s.h ? s.h.fed : 0, gen: s.gen || 0, ws: s.ws ? s.ws.length : 0, routes: s.routes ? s.routes.length : 0, t: s.t}; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    ap.add_argument('--seed', type=int, default=7)
    a = ap.parse_args()
    html = os.environ.get('GAME_HTML')
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
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.swamp, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: (pg.evaluate("()=>window.__advance(60)"), pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag))))
                have = set()
                once = lambda name: (name not in have) and (have.add(name) or True)
                pg.evaluate("()=>window.__advance(700)")
                shot('start')
                asks = 0
                for step in range(12000):
                    st = pg.evaluate(STEP, lv)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        asks += 1
                        shot('ask%d' % asks)
                        box = pg.evaluate("(i)=>{ const c = TB.Strip.canvas(i); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }", st['chart'])
                        if box:
                            x, y, bw, bh = box
                            f = (st['exp'] - st['lo']) / (st['hi'] - st['lo']) if st.get('exp') is not None else 0.5
                            if st['kind'] == 'y':
                                pg.mouse.move(x + bw * 0.6, y + bh * 0.5); pg.mouse.down(); pg.mouse.move(x + bw * 0.6, y + bh * (0.85 - 0.7 * f), steps=6); pg.mouse.up()
                            else:
                                pg.mouse.move(x + bw * 0.9, y + bh * 0.6); pg.mouse.down(); pg.mouse.move(x + bw * (0.06 + 0.8 * f), y + bh * 0.6, steps=6); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(400); }")
                        if pg.evaluate("()=>!!TB.REG.swamp.sim.s.ask"):
                            pg.evaluate("()=>{ const s = TB.REG.swamp.sim.s; TB.Sim.act(TB.REG.swamp, {k: 'predict', id: s.ask.id, v: s.exp[s.ask.id]}); window.__advance(300); }")
                        shot('commit%d' % asks)
                        pg.evaluate("()=>window.__advance(600)")
                        continue
                    ph = st.get('phase')
                    if lv == 0:
                        if ph == 'hunt' and st.get('open', 0) >= 2 and once('hunt%d' % st['r']): shot('hunt_r%d_n%d' % (st['r'] + 1, st['n']))
                        if ph == 'hunt' and st['n'] == 10 and st.get('open', 0) >= 1 and once('n10_%d' % st['r']): shot('night10_r%d' % (st['r'] + 1))
                        if ph == 'dawn' and st['n'] == 1 and st['t'] > 1.0 and once('dawn%d' % st['r']): shot('dawn_r%d' % (st['r'] + 1))
                        if ph == 'dawn' and st['n'] == 5 and once('lapse%d' % st['r']): shot('lapse_r%d' % (st['r'] + 1))
                        if ph == 'gap' and once('gap%d' % st['r']): shot('gap_r%d' % (st['r'] + 1))
                    if lv == 1:
                        if ph == 'build' and st['t'] > 2 and once('build'): shot('build')
                        if ph == 'measured' and once('meas%d' % st['ws']): pg.evaluate("()=>window.__advance(900)"); shot('measured%d' % st['ws'])
                        if ph == 'relax' and once('relax%d' % st['ws']): pg.evaluate("()=>window.__advance(500)"); shot('relax%d' % st['ws'])
                        if ph == 'hold' and once('hold%d' % st['ws']): pg.evaluate("()=>window.__advance(300)"); shot('hold%d' % st['ws'])
                    if lv == 2:
                        if ph == 'drift' and st['gen'] >= 50 and once('drift'): shot('drift')
                        if ph == 'lay' and st['routes'] == 2 and once('lay'): shot('lay')
                        if ph == 'flow' and st['gen'] >= 180 and once('flow'): shot('flow')
                    if lv == 3:
                        if ph == 'plan' and once('plan0'): shot('plan0')
                        if ph == 'plan' and st['routes'] == 3 and once('plan3'): shot('plan3')
                        if ph == 'run' and st['gen'] >= 50 and once('run'): shot('run')
                    pg.evaluate("()=>window.__advance(40)")
                warn = pg.evaluate("()=>({lbl: (TB.Lbl && TB.Lbl.warnings || []).slice(0, 5), wh: (TB.Whisper && TB.Whisper.warnings || []).slice(0, 5), hud: (TB.HUD && TB.HUD.warnings || []).slice(0, 5), lg: (TB.LiveGraph && TB.LiveGraph.errors || []).slice(0, 5)})")
                if any(warn.values()): print('L%d %s warnings:' % (lv + 1, tag), warn)
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERROR', e)
    print('shots:', a.out, 'errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
