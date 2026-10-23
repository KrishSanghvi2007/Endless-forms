"""The Archipelago (v2) screenshots: every level and its phases at two viewports.

  GAME_HTML=/abs/build.html python3 tests/arch_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--whatif] [--calm]

Plays each level with a scripted player (a real pointer hold on an island in the first season, then the expert's weather
through Sim.act, and a dock tap for the one prediction) under virtual time, and saves PNGs named L<n>_<phase>_<w>x<h>.png.
Prints page errors and Lbl/Whisper/HUD/Dock warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """()=>{ const ch = TB.REG.arch, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  return {phase: s.phase, year: s.year, ask: s.ask && s.ask.id, hold: s.hold, rain: s.rain, auto: s.auto}; }"""
EXPERT = """()=>{ const ch = TB.REG.arch, S = ch.sim, s = S.s; const a = S.bots.expert(s, S.actions()); if (a) TB.Sim.act(ch, a); return a; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--whatif', action='store_true')
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
            pg.goto('file://' + html)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.arch, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):
                    if lv == 0: shot('intro')
                    pg.evaluate("()=>{ window.__advance(900); const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(300); }")
                pg.evaluate("()=>window.__advance(700)")
                shot('start')
                seen, held = set(), False
                for step in range(9000):
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
                        pg.evaluate("()=>{ const ch = TB.REG.arch, s = ch.sim.s, v = s.expS > 0.05 ? 'deep' : s.expS < -0.05 ? 'slim' : 'none'; const b = document.querySelector('#dock [data-id=\"arc-' + v + '\"]'); if (b) b.click(); window.__advance(300); }")
                        continue
                    if ph == 'season' and not st.get('auto'):
                        if not held:   # a real hold on the first island for 1.2 s
                            held = True
                            box = pg.evaluate("()=>{ const ch = TB.REG.arch, g = ch.geo(), c = document.getElementById('scene').getBoundingClientRect(), I = g.isl[0]; return [c.left + I.cx * c.width / TB.Stage.w, c.top + I.cy * c.height / TB.Stage.h]; }")
                            pg.mouse.move(box[0], box[1]); pg.mouse.down()
                            pg.evaluate("()=>window.__advance(700)")
                            shot('raining')
                            pg.evaluate("()=>window.__advance(500)")
                            pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                            shot('rained')
                        k = 'season%d' % st.get('year', 0)
                        if st.get('year') in (1, 3) and k not in seen:
                            seen.add(k); shot('season_y%d' % (st.get('year', 0) + 1))
                        for _ in range(4):
                            act = pg.evaluate(EXPERT)
                            if not act or act.get('k') == 'end': break
                        pg.evaluate("()=>window.__advance(120)")
                        continue
                    key = '%s%d' % (ph, st.get('year', 0))
                    if ph in ('feed', 'breed', 'tally') and key not in seen and (st.get('year', 0) < 3 or ph == 'tally'):
                        seen.add(key)
                        pg.evaluate("()=>window.__advance(%d)" % (900 if ph == 'feed' else 700))
                        shot('%s_y%d' % (ph, st.get('year', 0) + (0 if ph == 'tally' else 1)))
                        continue
                    pg.evaluate("()=>window.__advance(200)")
            warns = pg.evaluate("()=>[['Lbl', TB.Lbl], ['Whisper', TB.Whisper], ['HUD', TB.HUD], ['Dock', TB.Dock]].map(([k, m]) => m && m.warnings ? m.warnings.map(x => k + ': ' + (typeof x === 'string' ? x : JSON.stringify(x))) : []).flat()")
            for x in warns: print('WARN', tag, x)
            ctx.close()
        b.close()
    for e in errs: print('ERROR', e)
    print('shots in', a.out)
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
