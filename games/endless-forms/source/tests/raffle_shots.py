"""The Raffle (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/raffle_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=mono']

Plays each level with a scripted player (a real pointer hold on the first female, then the expert's pours through Sim.act,
a real drag for each prediction) under virtual time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors and
Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """()=>{ const ch = TB.REG.raffle, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  return {phase: s.phase, i: s.i, ask: s.ask && s.ask.id, hold: s.hold, mins: s.mins, F: s.fem[Math.min(s.i, s.fem.length - 1)].s, auto: s.auto}; }"""
POUR = """()=>{ const ch = TB.REG.raffle, S = ch.sim, s = S.s; const a = S.bots.expert(s, S.actions()); if (a) TB.Sim.act(ch, a); return a; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
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
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.raffle, lv, {seed: 7}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):
                    shot('intro')
                    pg.evaluate("()=>{ window.__advance(900); const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(300); }")
                pg.evaluate("()=>window.__advance(400)")
                shot('start')
                seen, done_first = set(), False
                for step in range(6000):
                    st = pg.evaluate(STATE)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card')
                        if a.whatif and lv in (0, 2):
                            pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on .card-btns button')].find(x => x.textContent === 'What if?'); if (b) b.click(); window.__advance(300); const c = document.querySelector('#cards.on .chip[data-lever]'); if (c) c.click(); window.__advance(300); }")
                            for k in range(400):
                                if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
                                pg.evaluate("()=>window.__advance(200)")
                            pg.evaluate("()=>window.__advance(1500)")
                            shot('whatif')
                        break
                    ph = st.get('phase')
                    if st.get('ask'):
                        pg.evaluate("()=>window.__advance(500)")
                        shot('ask_' + st['ask'])
                        box = pg.evaluate("""()=>{ const ch = TB.REG.raffle, s = ch.sim.s, A = s.ask, i = A.id === 'p4' ? 1 : 0, c = TB.Strip.canvas(i); if (!c || !c._lg) return null; const r = c.getBoundingClientRect(), G = c._lg.G, e = ch.sim.expect(s, A.id);
                          const x = A.kind === 'y' ? G.X(A.at) : G.X(e), y = A.kind === 'y' ? G.Y(e + 0.6) : G.plot.y + G.plot.h * 0.5; return [r.x + x, r.y + y, r.x + G.plot.x + 5, r.y + G.plot.y + 5]; }""")
                        if box:
                            pg.mouse.move(box[0] + 30, box[1] - 20); pg.mouse.down(); pg.mouse.move(box[0], box[1], steps=5); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                            shot('askmoved_' + st['ask'])
                        pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"rf-lock\"]'); if (b) b.click(); window.__advance(300); }")
                        pg.evaluate("()=>window.__advance(600)")
                        shot('committed_' + st['ask'])
                        continue
                    if ph in ('pour', 'close') and not st.get('auto'):
                        if not done_first:   # a real hold on the scene: the tactile verb
                            done_first = True
                            cv = pg.evaluate("()=>{ const r = document.getElementById('scene').getBoundingClientRect(); return [r.x + r.width * 0.5, r.y + r.height * 0.45]; }")
                            pg.mouse.move(cv[0], cv[1]); pg.mouse.down()
                            pg.evaluate("(lv)=>window.__advance(lv === 2 ? 2600 : 900)", lv)
                            shot('hold')
                            pg.evaluate("(lv)=>window.__advance(lv === 2 ? 1500 : 300)", lv)
                            pg.mouse.up()
                            pg.evaluate("()=>window.__advance(700)")
                            continue
                        pg.evaluate(POUR)
                        pg.evaluate("()=>window.__advance(40)")
                        continue
                    for name in ('draw', 'later', 'search', 'pm', 'leave'):
                        if ph == name and (name, st.get('i')) not in seen and (st.get('i') in (0, 1, 3) or name in ('pm',)):
                            seen.add((name, st.get('i')))
                            pg.evaluate("(n)=>window.__advance(n === 'draw' ? 1100 : n === 'later' ? 900 : 700)", name)
                            shot('%s%d' % (name, st.get('i') + 1))
                    pg.evaluate("()=>window.__advance(80)")
            warn = pg.evaluate("()=>[].concat((TB.Lbl && TB.Lbl.warnings) || [], (TB.Whisper && TB.Whisper.warnings) || [], (TB.HUD && TB.HUD.warnings) || [], (TB.LiveGraph && TB.LiveGraph.errors) || [])")
            if warn: print('warnings', vp, warn[:10])
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERROR', e)
    print('shots in', a.out, '; errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
