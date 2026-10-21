"""Alarm Call (v2) screenshots: every level and its main phases at two viewports (plus --cvd mono,deut and --calm).

  GAME_HTML=/abs/build.html python3 tests/alarm_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3,4] [--cvd mono] [--calm]

A scripted player under virtual time (calls by the tags, tags truthfully in peace time, a prediction drag, help or breed by
the expected gene copies) saves L<n>_<phase>_<w>x<h>.png. Prints page errors; exit 1 on any."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """(lv)=>{ const ch = TB.REG.alarm, s = ch.sim.s, A = s.atk, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, phase: s.phase};
  if (s.phase === 'peace') return {phase: 'peace', tags: Object.keys(s.tags).length, n: s.col.length};
  if (s.phase === 'attack' && A && A.st === 'decide') return {phase: 'decide', i: A.i, pred: A.pred, vig: A.vig || ''};
  if (s.phase === 'spring') return {phase: 'spring', i: s.si};
  return {phase: s.phase, st: A ? A.st : '', i: A ? A.i : (s.si || 0)}; }"""
ACT = """(o)=>{ const ch = TB.REG.alarm, s = ch.sim.s, S = ch.sim;
  if (o === 'call') { const A = s.atk; TB.Sim.act(ch, {k: 'call', a: A.pred === 'hawk' || A.srt * 0.4 > 0.22 ? 1 : 0}); }
  else if (o === 'wrong') { const A = s.atk; TB.Sim.act(ch, {k: 'call', a: A.srt * 0.4 > 0.22 ? 0 : 1}); }
  else if (o === 'tag') { const m = s.col.find(q => !s.tags[q.id]); if (m) TB.Sim.act(ch, {k: 'tag', id: m.id, t: m.rel === 'hs' ? '1/2' : S.tagOf(m.rel)}); else TB.Sim.act(ch, {k: 'done'}); }
  else if (o === 'done') TB.Sim.act(ch, {k: 'done'});
  else if (o === 'spring') { const q = s.sp[s.si]; TB.Sim.act(ch, {k: 'choose', a: q.vH > q.vB ? 'help' : 'breed'}); }
}"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out'); ap.add_argument('--vp', default='390x780,1280x720'); ap.add_argument('--levels', default='0,1,2,3,4')
    ap.add_argument('--cvd', default=''); ap.add_argument('--calm', action='store_true'); ap.add_argument('--seed', type=int, default=7)
    a = ap.parse_args()
    html = os.environ.get('GAME_HTML'); os.makedirs(a.out, exist_ok=True)
    vclock = open(os.path.join(SRC, 'vclock.js')).read(); errs = []
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for vp in a.vp.split(','):
            w, h = [int(x) for x in vp.split('x')]
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if a.calm else 'no-preference')
            pg = ctx.new_page(); pg.add_init_script(vclock)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            q = ('?cvd=' + a.cvd) if a.cvd else ''
            pg.goto('file://' + html + q); pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + ('_' + a.cvd if a.cvd else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.alarm, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                done = set()
                def shot(name, once=True):
                    if once and name in done: return
                    done.add(name); pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                for step in range(3000):
                    st = pg.evaluate(STEP, lv)
                    if 'card' in st:
                        if 'ef-intro' in st['card']:
                            shot('intro'); pg.evaluate("()=>{ const b = document.querySelector('#cards.on [data-play]'); if (b) b.click(); window.__advance(400); }"); continue
                        pg.evaluate("()=>window.__advance(1500)"); shot('card'); break
                    if 'ask' in st:
                        pg.evaluate("()=>window.__advance(300)"); shot('ask_' + st['ask'])
                        box = pg.evaluate("(i)=>{ const c = TB.Strip.canvas(i); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }", {'be': 0, 'tr': 0, 'wh': 1, 'f4': 0, 'm4': 1, 'sw': 2}[st['ask']])
                        if box:
                            x, y, bw, bh = box
                            pg.mouse.move(x + bw * 0.6, y + bh * 0.3); pg.mouse.down(); pg.mouse.move(x + bw * 0.6, y + bh * 0.62, steps=5); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)"); shot('askmoved_' + st['ask'])
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(500); }")
                        pg.evaluate("(id)=>{ const s = TB.REG.alarm.sim.s; if (s.ask && s.ask.id === id && s.pred[id] == null) TB.Sim.act(TB.REG.alarm, {k: 'void', id}); window.__advance(300); }", st['ask'])
                        if st['ask'] in ('wh', 'm4'): shot('committed_' + st['ask'])
                        continue
                    ph = st.get('phase')
                    if ph == 'peace':
                        if st['tags'] == 0:
                            pg.evaluate("()=>window.__advance(1600)"); shot('peace')
                            # open the tag menu on the first sister's node with a real tap
                            pt = pg.evaluate("()=>{ const ch = TB.REG.alarm, p = ch.nodeAt('f1'), r = document.getElementById('scene').getBoundingClientRect(); return [r.x + p[0], r.y + p[1]]; }")
                            pg.mouse.click(pt[0], pt[1]); pg.evaluate("()=>window.__advance(150)"); shot('peacemenu')
                        if st['tags'] < st['n']: pg.evaluate(ACT, 'tag'); pg.evaluate("()=>window.__advance(120)")
                        else: shot('peacetagged'); pg.evaluate(ACT, 'done'); pg.evaluate("()=>window.__advance(200)")
                        continue
                    if ph == 'decide':
                        i = st['i']; pg.evaluate("()=>window.__advance(700)")
                        nm = 'decide%d' % i if i < 3 else ('decide_' + st['pred'] + (st['vig'] or ''))
                        shot(nm)
                        pg.evaluate(ACT, 'wrong' if (i == 1 and lv < 2) else 'call')
                        pg.evaluate("()=>window.__advance(420)"); shot('strike%d' % min(i, 1))
                        pg.evaluate("()=>window.__advance(1300)"); shot('debrief%d' % min(i, 1))
                        continue
                    if ph == 'spring':
                        pg.evaluate("()=>window.__advance(400)"); shot('spring%d' % min(st['i'], 1))
                        pg.evaluate(ACT, 'spring'); pg.evaluate("()=>window.__advance(1600)"); shot('fly%d' % min(st['i'], 1))
                        pg.evaluate("()=>window.__advance(1300)"); shot('tally%d' % min(st['i'], 1))
                        continue
                    if ph in ('season', 'auto', 'swap'):
                        pg.evaluate("()=>window.__advance(500)"); shot(ph)
                    pg.evaluate("()=>window.__advance(200)")
            ctx.close()
        b.close()
    for e in errs: print('ERROR', e)
    print('shots in', a.out, '; errors:', len(errs))
    sys.exit(1 if errs else 0)

if __name__ == '__main__': main()
