"""Mendel's Garden (v2) screenshots: every level and its main phases at two viewports.

  GAME_HTML=/abs/build.html python3 tests/mendel_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2] [--query '?cvd=deut'] [--calm]

Plays each level with a scripted player: a real pointer drag for the first cross (the unit's verb), then the expert bot's
actions through Sim.act, and the dock buttons for the prediction and Done. Saves L<n>_<phase>_<w>x<h>.png under virtual time.
Prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """()=>{ const ch = TB.REG.mendel, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  return {phase: s.phase, ask: s.ask && s.ask.id, n: s.crosses.length, pt: s.pt, left: s.left}; }"""
EXPERT = """()=>{ const ch = TB.REG.mendel, S = ch.sim, s = S.s; const acts = S.actions(); const a = S.bots.expert(s, acts);
  if (!a || a.k === 'predict' || a.k === 'done') return a ? a.k : null; TB.Sim.act(ch, a); return a.k; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2')
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
            pg.goto('file://' + html + a.query)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + a.query.strip('?').replace('=', '-').replace('&', '_')) if a.query else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("([lv, sd])=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.mendel, lv, {seed: sd}); window.__advance(300); }", [lv, a.seed])
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):
                    if lv == 0: shot('intro')
                    pg.evaluate("()=>{ window.__advance(900); const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(300); }")
                pg.evaluate("()=>window.__advance(1600)")
                shot('start')
                # the verb: a real drag from the first flower to the second
                fx = pg.evaluate("""()=>{ const ch = TB.REG.mendel, r = document.getElementById('scene').getBoundingClientRect(), a = ch.flowerXY(0), b = ch.flowerXY(1);
                  return [r.x + a[0], r.y + a[1], r.x + b[0], r.y + b[1]]; }""")
                pg.mouse.move(fx[0], fx[1]); pg.mouse.down()
                for k in range(1, 9):
                    pg.mouse.move(fx[0] + (fx[2] - fx[0]) * k / 8, fx[1] + (fx[3] - fx[1]) * k / 8 + 10 * (1 - abs(4 - k) / 4)); pg.evaluate("()=>window.__advance(30)")
                    if k == 5: shot('drag')
                pg.mouse.up(); pg.evaluate("()=>window.__advance(300)")
                shot('brush')
                seen = set()
                for step in range(4000):
                    st = pg.evaluate(STATE)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card')
                        break
                    ph, n = st.get('phase'), st.get('n')
                    if st.get('ask'):
                        pg.evaluate("()=>window.__advance(400)"); shot('ask')
                        pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"mg-a1\"]'); if (b) b.click(); window.__advance(300); }")
                        continue
                    key = (ph, n)
                    if ph in ('pod', 'peas', 'grow') and key not in seen and (n in (0, 1, 2) or ph == 'grow'):
                        target = {'pod': 0.85, 'peas': 0.7, 'grow': 0.8}[ph]
                        if st['pt'] >= target * (1.0 if ph == 'pod' else 1.3 if ph == 'peas' else 0.95):
                            seen.add(key); shot('%s%d' % (ph, n + 1))
                    if ph == 'idle':
                        if ('idle', n) not in seen:
                            seen.add(('idle', n)); pg.evaluate("()=>window.__advance(500)"); shot('idle%d' % n)
                        if lv == 0 and pg.evaluate("()=>{ const s = TB.REG.mendel.sim.s; return !!s.pl[2] && s.hs === 0; }"):
                            # the hybrid's self: a real tap on its flower (the L1 shortcut the ghost demonstrates)
                            hx = pg.evaluate("()=>{ const ch = TB.REG.mendel, r = document.getElementById('scene').getBoundingClientRect(), a = ch.flowerXY(2); return [r.x + a[0], r.y + a[1]]; }")
                            pg.mouse.click(hx[0], hx[1]); pg.evaluate("()=>window.__advance(60)")
                            if pg.evaluate("()=>TB.REG.mendel.sim.s.phase") == 'idle': errs.append('L1: a tap on the hybrid did not self it')
                            continue
                        k = pg.evaluate(EXPERT)
                        if k == 'done':
                            shot('called')
                            pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"mg-done\"]'); if (b) b.click(); window.__advance(300); }")
                            pg.evaluate("()=>window.__advance(1200)"); shot('reveal')
                        elif k == 'call':
                            pass
                    if ph == 'end' and ('end', 0) not in seen:
                        seen.add(('end', 0)); pg.evaluate("()=>window.__advance(800)"); shot('tally')
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
