"""The Leaky Tap (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/tap_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=deut'] [--calm]

Plays each level with the expert policy through Sim.act (each prediction a real drag on the strip, then Lock in) under virtual
time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """(o)=>{ const ch = TB.REG.tap, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, phase: s.phase, chart: s.ask.chart, kind: s.ask.kind, lo: s.ask.lo, hi: s.ask.hi, exp: s.exp[s.ask.id]};
  const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random);
  if (a && a.k !== 'predict' && !(o.lens && a.k === 'lens' && !a.on)) TB.Sim.act(ch, a);
  return {phase: s.phase, dusk: s.dusk, gen: s.gen, lens: s.lens, busy: s.busy, net: s.net, drum: s.drum, caught: s.caught, si: s.si, note: s.note || ''}; }"""


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
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.tap, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: (pg.evaluate("()=>window.__advance(60)"), pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag))))
                have = set()
                once = lambda name: (name not in have) and (have.add(name) or True)
                pg.evaluate("()=>window.__advance(700)")
                shot('start')
                asks = 0
                for step in range(12000):
                    st = pg.evaluate(STEP, {'lens': lv == 1 and 'lens' not in have})
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        asks += 1
                        shot('ask%d' % asks)
                        box = pg.evaluate("(i)=>{ const c = TB.Strip.canvas(i); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }", st['chart'])
                        m = pg.evaluate("(i)=>{ const c = TB.Strip.canvas(i), sp = c && c._lg && c._lg.spec; if (!sp) return null; const G = TB.LiveGraph.map(c, sp); const s = TB.REG.tap.sim.s; const e = s.exp[s.ask.id]; return {x: G.X(e), y: G.Y(e), ok: true}; }", st['chart'])
                        if box and m:
                            x, y, bw, bh = box
                            if st['kind'] == 'y':
                                pg.mouse.move(x + bw * 0.5, y + 8); pg.mouse.down(); pg.mouse.move(x + bw * 0.5, y + m['y'], steps=6); pg.mouse.up()
                            else:
                                pg.mouse.move(x + bw - 30, y + bh * 0.5); pg.mouse.down(); pg.mouse.move(x + m['x'], y + bh * 0.5, steps=6); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                        shot('drag%d' % asks)
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(500); }")
                        shot('reveal%d' % asks)
                        pg.evaluate("()=>window.__advance(900)")
                        continue
                    ph = st.get('phase')
                    if ph == 'dusk' and st.get('dusk') == 1 and once('dusk1'): pg.evaluate("()=>window.__advance(1500)"); shot('dusk1')
                    if ph == 'dusk' and st.get('busy', 0) > 9 and once('dive'): shot('dive')
                    if ph == 'dusk' and st.get('busy', 0) > 0 and st.get('busy') < 6 and once('carry'): shot('carry')
                    if ph == 'dusk' and st.get('lens') and once('lens'): pg.evaluate("()=>window.__advance(300)"); shot('lens')
                    if ph == 'dawn' and once('dawn'): shot('dawn')
                    if ph == 'pause' and once('pause_' + st.get('note', '')): pg.evaluate("()=>window.__advance(700)"); shot('pause_' + st.get('note', ''))
                    if ph == 'lapse' and st.get('gen', 0) >= 8 and once('lapse8'): shot('lapse8')
                    if ph == 'lapse' and st.get('gen', 0) >= 24 and once('lapse24'): shot('lapse24')
                    if ph == 'dusk' and st.get('gen', 0) >= 20 and lv < 2 and once('bal'): pg.evaluate("()=>window.__advance(1200)"); shot('bal')
                    if lv == 3 and st.get('gen', 0) >= 15 and st.get('drum') and once('drumhint'): pg.evaluate("()=>window.__advance(300)"); shot('drumhint')
                    if lv == 3 and st.get('gen', 0) >= 10 and not st.get('drum') and once('plugged'): shot('plugged')
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
