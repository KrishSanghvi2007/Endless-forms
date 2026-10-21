"""Left Jaw, Right Jaw (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/jaws_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3,4] [--query '?cvd=deut'] [--calm]

Plays each level with a scripted player (the commoner-side guard, through Sim.act; a prediction drag and Lock in) under
virtual time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """(lv)=>{ const ch = TB.REG.jaws, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, kind: s.ask.kind, phase: s.phase};
  const a = ch.sim.bots.greedy(s, ch.sim.actions(), Math.random); if (a && a.k !== 'predict') TB.Sim.act(ch, a);
  return {phase: s.phase, season: s.season, att: s.att, wave: !!(s.wave && s.wave.veered), cur: s.cur ? s.cur.length : 0}; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3,4')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    a = ap.parse_args()
    html = os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v1.html')
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
            pg.goto('file://' + html + q)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.jaws, lv, {seed: 7}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                have = set()
                once = lambda name: (name not in have) and (have.add(name) or True)
                pg.evaluate("()=>window.__advance(500)")
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):   # the opening card (D6 decision 8)
                    if lv == 0: shot('intro')
                    pg.click('#cards.on .card.ef-intro .btn.primary'); pg.evaluate("()=>window.__advance(600)")
                shot('start')
                asks = 0
                for step in range(6000):
                    st = pg.evaluate(STEP, lv)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        asks += 1
                        if asks == 1: shot('ask')
                        chart = 1 if st.get('kind') == 'x' else 0
                        box = pg.evaluate("(i)=>{ const c = TB.Strip.canvas(i); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }", chart)
                        if box:
                            x, y, bw, bh = box
                            pg.mouse.move(x + bw * 0.5, y + bh * 0.5); pg.mouse.down(); pg.mouse.move(x + bw * 0.55, y + bh * 0.45, steps=4); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                            if asks == 1: shot('askmoved')
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(300); }")
                        if asks == 1: shot('committed')
                        pg.evaluate("()=>window.__advance(900)")
                        if asks == 1: shot('reveal')
                        continue
                    ph = st.get('phase')
                    if ph == 'swim' and st.get('wave') and st.get('season') == 2 and once('strike'):
                        pg.evaluate("()=>window.__advance(60)"); shot('strike')
                    if ph == 'swim' and st.get('cur') and st.get('season') == 2 and once('intrude'):
                        pg.evaluate("()=>window.__advance(400)"); shot('intrude')
                    if ph == 'swim' and st.get('season') == 3 and st.get('att', 0) > 0 and once('mid'):
                        shot('mid')
                    if ph == 'dusk' and st.get('season') == 2 and once('dusk'):
                        pg.evaluate("()=>window.__advance(500)"); shot('dusk')
                    if ph == 'breed' and st.get('season') == 2 and once('breed'):
                        pg.evaluate("()=>window.__advance(700)"); shot('breed')
                    pg.evaluate("()=>window.__advance(40)")
                warn = pg.evaluate("()=>[].concat((TB.Lbl && TB.Lbl.warnings) || [], (TB.Whisper && TB.Whisper.warnings) || [], (TB.HUD && TB.HUD.warnings) || [], (TB.Dock && TB.Dock.warnings) || []).slice(0, 8)")
                if warn: errs.append('L%d warnings: %s' % (lv + 1, warn))
            ctx.close()
        b.close()
    for e in errs: print('ERR', e)
    print('shots in', a.out, '; errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
