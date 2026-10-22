"""Hawks and Doves (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/hawks_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3,4,5] [--cvd]

Plays each level with a scripted player (Hawk/Dove picks, the new-beach prediction drag) under virtual time and saves PNGs named
L<n>_<phase>_<w>x<h>.png. Prints any page error. Exit 1 on an error."""
import os, sys, json, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--cvd', action='store_true')
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
            pg.goto('file://' + html + q); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.hawks, lv, {seed: 7}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                pg.evaluate("()=>window.__advance(500)")
                shot('start')
                # play: a scripted player; hawk in L2/L3, owner-wins in L4
                for step in range(4000):
                    st = pg.evaluate("""(lv)=>{ const ch = TB.REG.hawks, s = ch.sim.s, D = s.duel, card = document.querySelector('#cards.on .card');
                      if (card) return {card: card.className};
                      if (s.ask) return {ask: s.ask.id, phase: s.phase};
                      if (D && (D.st === 'walk' || D.st === 'face') && D.a == null) { const a = lv === 3 ? (D.d < 0 ? 1 : 0) : lv === 0 ? (s.dn % 2) : 1; TB.Sim.act(ch, {k: 'pick', a}); }
                      return {phase: s.phase, st: D && D.st, dn: s.dn, tide: s.tide}; }""", lv)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        shot('ask')
                        # drag the ghost on chart 0 to the middle of the plot, then tap it to commit
                        box = pg.evaluate("()=>{ const c = TB.Strip.canvas(0); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }")
                        if box:
                            x, y, bw, bh = box
                            pg.mouse.move(x + bw * 0.5, y + bh * 0.5); pg.mouse.down(); pg.mouse.move(x + bw * 0.55, y + bh * 0.45, steps=4); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                            shot('askmoved')
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(400); }")
                        shot('committed')
                        continue
                    if st.get('phase') == 'tide' and not os.path.exists(os.path.join(a.out, 'L%d_tide_%s.png' % (lv + 1, tag))):
                        pg.evaluate("()=>window.__advance(350)")
                        shot('tide')
                    if st.get('st') == 'clash' and st.get('dn') == 3 and not os.path.exists(os.path.join(a.out, 'L%d_clash_%s.png' % (lv + 1, tag))):
                        pg.evaluate("()=>window.__advance(250)")
                        shot('clash')
                    if st.get('phase') == 'duel' and st.get('tide') == 3 and st.get('st') == 'face' and not os.path.exists(os.path.join(a.out, 'L%d_mid_%s.png' % (lv + 1, tag))):
                        shot('mid')
                    if st.get('phase') == 'nbrun' and not os.path.exists(os.path.join(a.out, 'L%d_nbrun_%s.png' % (lv + 1, tag))):
                        pg.evaluate("()=>window.__advance(2500)")
                        shot('nbrun')
                    pg.evaluate("()=>window.__advance(100)")
                pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => /why/i.test(x.textContent)); if (b) { b.click(); window.__advance(200); } }")
                shot('why')
            if a.cvd:
                for kind in ('mono', 'deut'):
                    pg.goto('file://' + html + '?cvd=' + kind); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }"); pg.evaluate("()=>window.__advance(600)")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
                    for lv in (0, 1, 2, 3):
                        pg.evaluate("(lv)=>{ TB.App.playLevel(TB.REG.hawks, lv, {seed: 7}); window.__advance(5000); }", lv)
                        pg.screenshot(path=os.path.join(a.out, 'L%d_cvd-%s_%s.png' % (lv + 1, kind, tag)))
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERR', e)
    print('shots in', a.out, '; errors:', len(errs))
    sys.exit(1 if errs else 0)

if __name__ == '__main__':
    main()
