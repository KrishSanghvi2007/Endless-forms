"""The Dig (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/dig_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3,4] [--query '?cvd=deut'] [--calm]

Plays each level with the expert policy through Sim.act (every prediction a real drag on the strip chart, then Lock in) under
virtual time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """(o)=>{ const ch = TB.REG.dig, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, kind: s.ask.kind, phase: s.phase, chart: s.ask.id === 'b1' ? 1 : 0, exp: s.exp[s.ask.id]};
  if (o.act && (ch._tick = (ch._tick || 0) + 1) % o.every === 0) { const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a && a.k !== 'predict') TB.Sim.act(ch, a); }
  return {phase: s.phase, e: s.e, n: s.n, T: s.T, ns: s.ns, used: s.used, season: s.season, br: s.br, ci: s.ci, buried: s.an ? s.an.filter(a => a.b).length : 0}; }"""
TARGET = """(o)=>{ const cv = TB.Strip.canvas(o.chart); if (!cv) return null; const r = cv.getBoundingClientRect(), ch = TB.REG.dig, spec = ch.notes().charts[o.chart];
  const G = TB.LiveGraph && TB.LiveGraph.map ? TB.LiveGraph.map(cv, spec) : null; if (!G) return [r.x, r.y, r.width, r.height, null, null];
  return [r.x, r.y, r.width, r.height, o.kind === 'y' ? null : G.X(o.exp), o.kind === 'y' ? G.Y(o.exp) : null]; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3,4')
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
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.dig, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: (pg.evaluate("()=>window.__advance(60)"), pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag))))
                have = set()
                once = lambda name: (name not in have) and (have.add(name) or True)
                pg.evaluate("()=>window.__advance(1600)")
                shot('start')
                asks = 0
                every = 6 if lv == 0 else 3
                for step in range(12000):
                    st = pg.evaluate(STEP, {'act': True, 'every': every})
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        asks += 1
                        pg.evaluate("()=>window.__advance(400)")
                        shot('ask%d' % asks)
                        t = pg.evaluate(TARGET, {'chart': st['chart'], 'kind': st['kind'], 'exp': st['exp']})
                        if t:
                            x, y, bw, bh, tx, ty = t
                            if st['kind'] == 'y':
                                pg.mouse.move(x + bw * 0.5, y + bh * 0.2); pg.mouse.down(); pg.mouse.move(x + bw * 0.5, y + (ty if ty is not None else bh * 0.5), steps=6); pg.mouse.up()
                            else:
                                pg.mouse.move(x + bw * 0.5, y + bh * 0.5); pg.mouse.down(); pg.mouse.move(x + (tx if tx is not None else bw * 0.4), y + bh * 0.5, steps=6); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                        stuck = pg.evaluate("(id)=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(500); const ch = TB.REG.dig, s = ch.sim.s; if (s.ask && s.ask.id === id) { TB.Sim.act(ch, {k: 'predict', id, v: s.exp[id]}); window.__advance(300); return true; } return false; }", st['ask'])
                        if stuck: print('L%d ask %s: the drag did not move the ghost; committed directly' % (lv + 1, st['ask']))
                        shot('reveal%d' % asks)
                        pg.evaluate("()=>window.__advance(900)")
                        continue
                    ph = st.get('phase')
                    if lv == 0:
                        if ph == 'epoch' and st.get('buried', 0) >= 2 and once('pour'): shot('pour')
                        if ph == 'epoch' and st.get('e') == 3 and st.get('buried', 0) >= 1 and once('epoch4'): shot('epoch4')
                        if ph == 'uplift' and once('uplift'): pg.evaluate("()=>window.__advance(900)"); shot('uplift')
                        if ph == 'reveal' and once('reveal'): pg.evaluate("()=>window.__advance(1800)"); shot('cliff')
                    if lv == 1:
                        if ph == 'run' and st.get('T', 0) > 300 and once('run'): shot('run')
                        if ph == 'run' and st.get('T', 0) > 1500 and once('run2'): shot('run2')
                        if ph == 'ash' and (st.get('ns') or 0) >= 24 and once('ash'): shot('ash')
                        if ph == 'lab' and once('lab'): pg.evaluate("()=>window.__advance(800)"); shot('lab')
                    if lv == 2:
                        if ph == 'free' and once('free'): shot('free')
                        if ph == 'assay' and (st.get('used') or 0) >= 30 and once('assay'): shot('assay')
                        if ph == 'bracket' and once('bracket'): pg.evaluate("()=>window.__advance(800)"); shot('bracket')
                    if lv == 3:
                        if ph == 'brush' and (st.get('br') or 0) > 0.45 and once('brush%d' % st.get('season', 0)) and st.get('season', 0) < 2: shot('brush%d' % st.get('season', 0))
                        if ph == 'gap' and once('find%d' % st.get('season', 0)) and st.get('season', 0) in (0, 2): pg.evaluate("()=>window.__advance(500)"); shot('find%d' % st.get('season', 0))
                        if ph == 'pick' and st.get('season') == 3 and once('map'): shot('map')
                    if lv == 4:
                        if ph == 'place' and st.get('ci') == 4 and once('place'): shot('place')
                        if ph == 'bush' and once('bush'): pg.evaluate("()=>window.__advance(1800)"); shot('bush')
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
