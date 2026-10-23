"""Why Sex? (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/sex_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2] [--query '?cvd=mono'] [--whatif]

Plays each level with a scripted player under virtual time: real mouse taps on the scene at the aim policy's best spot for each
clutch, a real drag for the prediction, then saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors and
Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """()=>{ const ch = TB.REG.sex, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  return {phase: s.phase, gen: s.gen, ki: s.ki, ask: s.ask && s.ask.id, auto: s.auto}; }"""
AIM = """()=>{ const ch = TB.REG.sex, S = ch.sim, s = S.s; if (s.phase !== 'season' || s.ki >= s.keys.length) return null;
  const b = S.best(s), p = ch.toPx(b[0], b[1]), r = document.getElementById('scene').getBoundingClientRect(); return [r.left + p[0], r.top + p[1]]; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    ap.add_argument('--whatif', action='store_true')
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
            pg.goto('file://' + html + q)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.sex, lv, {seed: 7}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):
                    shot('intro')
                    pg.evaluate("()=>{ window.__advance(900); const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(300); }")
                pg.evaluate("()=>window.__advance(500)")
                shot('start')
                seen = set()
                for step in range(4000):
                    st = pg.evaluate(STATE)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card')
                        if a.whatif:
                            pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on .card-btns button')].find(x => x.textContent === 'What if?'); if (b) b.click(); window.__advance(300); const c = document.querySelector('#cards.on .chip[data-lever]'); if (c) c.click(); window.__advance(300); }")
                            for k in range(600):
                                if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
                                pg.evaluate("()=>window.__advance(200)")
                            pg.evaluate("()=>window.__advance(1500)")
                            shot('whatif')
                        break
                    ph = st.get('phase')
                    if st.get('ask'):
                        pg.evaluate("()=>window.__advance(500)")
                        shot('ask')
                        box = pg.evaluate("""()=>{ const ch = TB.REG.sex, s = ch.sim.s, A = s.ask, c = TB.Strip.canvas(0); if (!c || !c._lg) return null; const r = c.getBoundingClientRect(), G = c._lg.G, e = ch.sim.expect(s, A.id);
                          return [r.x + G.X(A.at), r.y + G.Y(e + 3)]; }""")
                        if box:
                            pg.mouse.move(box[0] + 20, box[1] + 60); pg.mouse.down(); pg.mouse.move(box[0], box[1], steps=5); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                            shot('askmoved')
                        pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"sx-lock\"]'); if (b) b.click(); window.__advance(300); }")
                        pg.evaluate("()=>window.__advance(700)")
                        shot('committed')
                        continue
                    if ph == 'season' and not st.get('auto'):
                        xy = pg.evaluate(AIM)
                        if xy:
                            key = ('season', st.get('gen'))
                            if key not in seen and st.get('gen') in (0, 2, 4, 6) and st.get('ki') == 1:
                                seen.add(key); pg.mouse.move(xy[0], xy[1]); pg.mouse.down(); pg.evaluate("()=>window.__advance(120)"); shot('aim%d' % st.get('gen')); pg.mouse.up()
                                pg.evaluate("()=>window.__advance(160)"); shot('drop%d' % st.get('gen'))
                            else:
                                pg.mouse.click(xy[0], xy[1])
                            pg.evaluate("()=>window.__advance(260)")
                            continue
                    if ph == 'breed' and ('breed', st.get('gen')) not in seen and st.get('gen') in (1, 3, 6, 9):
                        seen.add(('breed', st.get('gen')))
                        pg.evaluate("()=>window.__advance(500)")
                        shot('breed%d' % st.get('gen'))
                        pg.evaluate("()=>window.__advance(700)")
                        shot('breedB%d' % st.get('gen'))
                    pg.evaluate("()=>window.__advance(120)")
            warn = pg.evaluate("()=>[].concat((TB.Lbl && TB.Lbl.warnings) || [], (TB.Whisper && TB.Whisper.warnings) || [], (TB.HUD && TB.HUD.warnings) || [], (TB.LiveGraph && TB.LiveGraph.errors) || [])")
            if warn: print('warnings', vp, warn[:10])
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERROR', e)
    print('shots in', a.out, '; errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
