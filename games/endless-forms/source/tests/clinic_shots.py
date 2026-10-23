"""The Clinic (v2) screenshots: every level and its main phases at two viewports, plus colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/clinic_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--cvd] [--calm]

Plays each level with a scripted expert (spaced high doses, both drugs, treat and rub on the ward) under
virtual time, drags each prediction, and saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors; exit 1 on any."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

PLAY = """(lv)=>{ const ch = TB.REG.clinic, S = ch.sim, s = S.s, card = document.querySelector('#cards.on .card');
  if (card && card.classList.contains('ef-intro')) { if (card.dataset.armed === '1' || true) { const bs = card.querySelectorAll('.card-btns button'); bs[bs.length - 1].click(); } return {intro: 1}; }
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, phase: s.phase};
  const sum = a => a.reduce((x, y) => x + y, 0), A = a => TB.Sim.act(ch, a);
  if (s.phase === 'wait') A({k: 'next'});
  if (s.phase === 'run') {
    if (lv <= 1) { const b = s.beds[0]; if (b.cured == null && sum(b.n) >= 1e5 && b.C[0] < 10 && (lv === 1 || s.tick < 3)) A({k: 'dose', bed: 0, d: 0, hi: true}); }
    else if (lv === 2) { const b = s.beds[0]; if (sum(b.n) >= 1e5 && b.C[0] < 2) A({k: 'dose', bed: 0, d: 2}); }
    else { for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1) A({k: 'dose', bed: i}); if (s.tick === 0 && s.ward.hyg < 0.89) A({k: 'rub'}); if (s.tick === 5) A({k: 'sel', bed: s.day % s.beds.length}); }
  }
  return {phase: s.phase, day: s.day, tick: s.tick}; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--cvd', action='store_true')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
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
            pg.goto('file://' + html + q)
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.clinic, lv, {seed: 7}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                pg.evaluate("()=>window.__advance(500)")
                shot('start')
                asked = 0
                for step in range(6000):
                    st = pg.evaluate(PLAY, lv)
                    if 'intro' in st:
                        if not os.path.exists(os.path.join(a.out, 'L%d_intro_%s.png' % (lv + 1, tag))): shot('intro')
                        pg.evaluate("()=>window.__advance(400)"); continue
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        if asked > 3:
                            pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(200); }")
                            continue
                        asked += 1
                        pg.evaluate("()=>window.__advance(300)")
                        shot('ask')
                        box = pg.evaluate("()=>{ const c = TB.Strip.canvas(0); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }")
                        if box:
                            x, y, bw, bh = box
                            pg.mouse.move(x + bw * 0.5, y + bh * 0.6); pg.mouse.down(); pg.mouse.move(x + bw * 0.5, y + bh * 0.35, steps=4); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                            shot('askmoved')
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(500); }")
                        shot('committed')
                        continue
                    d = st.get('day', 0)
                    for mark in (2, 5, 9, 40):
                        fn = os.path.join(a.out, 'L%d_day%d_%s.png' % (lv + 1, mark, tag))
                        if d == mark and st.get('tick', 0) > 10 and not os.path.exists(fn):
                            shot('day%d' % mark)
                    pg.evaluate("()=>window.__advance(100)")
                pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => /why/i.test(x.textContent)); if (b) { b.click(); window.__advance(200); } }")
                shot('why')
            if a.cvd:
                for kind in ('mono', 'deut'):
                    pg.goto('file://' + html + '?cvd=' + kind); pg.evaluate("()=>window.__advance(600)")
                    for lv in (0, 2, 3):
                        pg.evaluate("(lv)=>{ TB.App.playLevel(TB.REG.clinic, lv, {seed: 7}); window.__advance(800); const ch = TB.REG.clinic, s = ch.sim.s; if (s.ask) { TB.Sim.act(ch, {k: 'void', id: s.ask.id}); } window.__advance(6000); }", lv)
                        pg.screenshot(path=os.path.join(a.out, 'L%d_cvd-%s_%s.png' % (lv + 1, kind, tag)))
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERR', e)
    print('shots in', a.out, '; errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
