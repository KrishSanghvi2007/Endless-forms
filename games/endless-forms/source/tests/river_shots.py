"""The River (v2) screenshots: every level and its main phases at two viewports.

  GAME_HTML=/abs/build.html python3 tests/river_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2] [--fuse] [--calm] [--query '?cvd=mono']

Plays each level with a scripted player under virtual time: a real tap on the log when the expert would join (or at 2 changes
per bank with --fuse, to see a merger), the dock button for the one prediction, and saves PNGs named L<n>_<phase>_<w>x<h>.png.
Prints page errors and Lbl/Whisper/HUD/Dock warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """()=>{ const ch = TB.REG.river, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  return {phase: s.phase, k: s.k, e: s.e, ask: s.ask && s.ask.id, down: s.down, mode: s.mode, contact: s.contact, rev: s.rev, n: s.cells.length, nights: s.hist.length,
          es: TB.REG.river.sim.s ? (function(){ let q = 1 - s.pc + s.pc * 0.55, r = 1; const m = s.line ? s.k : s.k * s.k; for (let i = 0; i < m; i++) r *= q; return r; })() : 1}; }"""
TAP_LOG = """()=>{ const ch = TB.REG.river, t = ch.logTip(), r = document.getElementById('scene').getBoundingClientRect(); return [r.x + t[0], r.y + t[1]]; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2')
    ap.add_argument('--fuse', action='store_true')
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
            pg.goto('file://' + html + q)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + ('_fuse' if a.fuse else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.river, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):
                    shot('intro')
                    pg.evaluate("()=>{ window.__advance(900); const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(300); }")
                pg.evaluate("()=>window.__advance(700)")
                shot('start')
                seen = set()
                for step in range(4000):
                    st = pg.evaluate(STATE)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card')
                        break
                    ph = st.get('phase')
                    if st.get('ask'):
                        pg.evaluate("()=>window.__advance(500)")
                        shot('ask')
                        pg.evaluate("""()=>{ const s = TB.REG.river.sim.s, i = s.ask.opts.indexOf(36), b = document.querySelector('#dock [data-id="rv-a' + i + '"]'); if (b) b.click(); window.__advance(300); }""")
                        shot('asked')
                        continue
                    key = None
                    if ph == 'run' and not st.get('contact') and st.get('mode') != 'zone':
                        if st['k'] == 2 and 'apart' not in seen:
                            seen.add('apart'); pg.evaluate("()=>window.__advance(900)"); shot('apart'); continue
                        if st['k'] == 5 and 'apart5' not in seen:
                            seen.add('apart5'); pg.evaluate("()=>window.__advance(600)"); shot('apart5'); continue
                        want = (st['k'] >= 2) if (a.fuse and lv == 0 and 'fused' not in seen) else (st['es'] < 0.1)
                        if want and not st['down']:
                            xy = pg.evaluate(TAP_LOG)
                            pg.mouse.click(xy[0], xy[1])
                            pg.evaluate("()=>window.__advance(500)")
                            shot('join%d' % st['k'])
                            continue
                    if ph == 'wait' and 'wait' not in seen:
                        seen.add('wait'); pg.evaluate("()=>window.__advance(600)"); shot('wait')
                        xy = pg.evaluate(TAP_LOG); pg.mouse.click(xy[0], xy[1]); pg.evaluate("()=>window.__advance(400)"); shot('laid'); continue
                    if ph == 'reveal' and ('reveal', st['e']) not in seen and st['rev'] >= st['n'] * 0.6:
                        seen.add(('reveal', st['e'])); shot('reveal%d' % st['k']); continue
                    if ph in ('fuse', 'species', 'dry') and (ph, st['e']) not in seen:
                        seen.add((ph, st['e'])); pg.evaluate("()=>window.__advance(700)"); shot(ph); seen.add('fused' if ph == 'fuse' else ph); continue
                    if ph == 'run' and (st.get('contact') or st.get('mode') == 'zone') and st['nights'] in (3, 9) and ('night', st['nights']) not in seen:
                        seen.add(('night', st['nights'])); pg.evaluate("()=>window.__advance(900)"); shot('night%d' % st['nights']); continue
                    pg.evaluate("()=>window.__advance(100)")
            warn = pg.evaluate("()=>[].concat((TB.Lbl && TB.Lbl.warnings) || [], (TB.Whisper && TB.Whisper.warnings) || [], (TB.HUD && TB.HUD.warnings) || [], (TB.Dock && TB.Dock.warnings) || [], (TB.LiveGraph && TB.LiveGraph.errors) || [])")
            if warn: print('warnings', vp, warn[:10])
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERROR', e)
    print('shots in', a.out, '; errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
