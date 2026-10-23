"""The Commons (v2) screenshots: every level and its main phases at two viewports.

  GAME_HTML=/abs/build.html python3 tests/commons_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=mono'] [--whatif]

Plays each level with a scripted player under virtual time: real pointer taps split the droplets (the expert's choice of
droplet), the dock's Grow button grows them, and the prediction is answered with the dock. Saves PNGs named
L<n>_<phase>_<w>x<h>.png and prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """()=>{ const ch = TB.REG.commons, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  return {phase: s.phase, round: s.round, ask: s.ask && s.ask.id, nd: s.drops.length, auto: s.auto}; }"""
# the expert's next split, as a canvas point (CSS px) to tap; null when it would grow
NEXT = """()=>{ const ch = TB.REG.commons, S = ch.sim, s = S.s, a = S.bots.expert(s, S.actions()); if (!a || a.k !== 'split') return a ? {k: a.k} : null;
  const d = s.drops[a.i], q = ch.v.dp[d.path]; if (!q) return {k: 'wait'}; const r = TB.Stage.cv.getBoundingClientRect(); return {k: 'split', x: r.x + q.x, y: r.y + q.y}; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--query', default='')
    ap.add_argument('--whatif', action='store_true')
    ap.add_argument('--calm', action='store_true')
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
            pg.goto('file://' + html + a.query)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + a.query.strip('?').replace('=', '-').replace('&', '_')) if a.query else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.commons, lv, {seed: 7}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):
                    shot('intro')
                    pg.evaluate("()=>{ window.__advance(900); const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(300); }")
                pg.evaluate("()=>window.__advance(1400)")
                shot('start')
                seen = set()
                for step in range(3000):
                    st = pg.evaluate(STATE)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card')
                        if a.whatif:
                            pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on .card-btns button')].find(x => x.textContent === 'What if?'); if (b) b.click(); window.__advance(300); const c = document.querySelector('#cards.on .chip[data-lever]'); if (c) c.click(); window.__advance(300); }")
                            for k in range(600):
                                if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
                                pg.evaluate("()=>window.__advance(200)")
                                if k == 25: shot('whatif_run')
                            pg.evaluate("()=>window.__advance(1500)")
                            shot('whatif')
                        break
                    ph, rd = st.get('phase'), st.get('round')
                    if st.get('ask'):
                        pg.evaluate("()=>window.__advance(500)")
                        shot('ask')
                        pg.evaluate("()=>{ const ch = TB.REG.commons, S = ch.sim, a = S.bots.expert(S.s, S.actions()); const id = a.v > 0 ? 'cm-more' : 'cm-fewer'; const b = document.querySelector('#dock [data-id=\"' + id + '\"]'); if (b) b.click(); window.__advance(200); }")
                        continue
                    if ph == 'split' and not st.get('auto'):
                        nx = pg.evaluate(NEXT)
                        if nx and nx.get('k') == 'split':
                            if ('split1', rd) not in seen and st['nd'] >= 2:
                                seen.add(('split1', rd)); shot('split_r%d' % (rd + 1))
                            pg.mouse.click(nx['x'], nx['y'])
                            pg.evaluate("()=>window.__advance(260)")
                            continue
                        if nx and nx.get('k') == 'wait':
                            pg.evaluate("()=>window.__advance(100)"); continue
                        pg.evaluate("()=>window.__advance(500)")
                        shot('ready_r%d' % (rd + 1))
                        pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"cm-grow\"]'); if (b) b.click(); window.__advance(100); }")
                        continue
                    if ph == 'grow' and ('grow', rd) not in seen:
                        seen.add(('grow', rd)); pg.evaluate("()=>window.__advance(2300)"); shot('grown_r%d' % (rd + 1)); continue
                    if ph == 'pool' and ('pool', rd) not in seen:
                        seen.add(('pool', rd)); pg.evaluate("()=>window.__advance(700)"); shot('pool_r%d' % (rd + 1)); continue
                    pg.evaluate("()=>window.__advance(200)")
            warn = pg.evaluate("()=>({lbl: TB.Lbl.warnings.slice(0, 8), wh: (TB.Whisper.warnings || []).slice(0, 8), hud: (TB.HUD.warnings || []).slice(0, 8)})")
            for k, v in warn.items():
                if v:
                    print(vp, k, v)
            ctx.close()
        b.close()
    for e in errs[:10]:
        print('ERROR', e)
    print('shots:', len(os.listdir(a.out)), 'errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
