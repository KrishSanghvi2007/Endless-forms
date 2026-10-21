"""The Scribe (v2) screenshots: every level and its main phases at two viewports, plus colour-vision and Calm views.

  GAME_HTML=/abs/build.html python3 tests/scribe_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=deut'] [--calm]

A scripted player (the expert rules, through Sim.act, with human-like delays) plays each level under virtual time; each prediction
is a real tap on the strip chart at the expectation, then Lock in. PNGs are named L<n>_<phase>_<w>x<h>.png. Prints page errors and
Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """()=>{ const ch = TB.REG.scribe, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) { const A = s.ask, i = {d1: 0, z1: 0, u1: 1, c1: 0, b1: 0, b2: 1}[A.id] || 0; return {ask: A.id, chart: i}; }
  const lit = (s.sp || []).filter(p => !p.tag && !p.gone);
  if (s.kind === 'dish' && s.phase === 'run') { const p = lit.find(q => s.t - q.t0 > 0.45); if (p) TB.Sim.act(ch, {k: 'tag', id: p.id}); }
  else if (s.phase === 'plate') { if (Math.round(s.t * 30) % 9 === 0) TB.Sim.act(ch, {k: 'plate'}); }
  else if (s.phase === 'flag') { const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a && Math.round(s.t * 30) % 6 === 0) TB.Sim.act(ch, a); }
  else if (s.phase === 'stamp' || s.phase === 'stamp2') { if (s.t > 1.2 && !ch.v.vel) TB.Sim.act(ch, {k: 'stamp'}); }
  else if (s.phase === 'pick') { if (s.t > 2.5) TB.Sim.act(ch, {k: 'pick', i: s.m1.findIndex(q => q.res)}); else ch.v.sel = s.m1.findIndex(q => q.res); }
  return {phase: s.phase, kind: s.kind, tags: s.tags || 0, fates: s.fates || 0, plated: s.plated || 0, st: s.st || 0, t: s.t, full: !!s.full, lit: lit.length, pa: !!s.pa, pt: !!s.pt}; }"""

AIM = """(i)=>{ const ch = TB.REG.scribe, s = ch.sim.s, A = s.ask, cv = TB.Strip.canvas(i); if (!cv || !cv._lg) return null;
  const G = cv._lg.G, e = s.exp[A.id], r = cv.getBoundingClientRect(); let x, y;
  if (A.kind === 'tri') { const p = G.P(e); x = p[0]; y = p[1]; }
  else if (A.kind === 'y') { x = G.X(A.id === 'z1' ? 0 : 2); y = G.Y(e); }
  else { x = G.X(e); y = G.plot.y + G.plot.h * 0.6; }
  return [r.x + x, r.y + y]; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--intro', action='store_true', help='also shoot the opening card')
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
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            if a.intro:
                pg.goto('file://' + html + '?unit=scribe&seed=7' + ('&' + q.strip('?') if q else ''))
                pg.evaluate("()=>window.__advance(1500)")
                pg.screenshot(path=os.path.join(a.out, 'L0_intro_%s.png' % tag))
            pg.goto('file://' + html + ('?dev=1&intro=0' if not q else q + '&dev=1&intro=0'))
            pg.evaluate("()=>window.__advance(600)")
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.scribe, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: (pg.evaluate("()=>window.__advance(60)"), pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag))))
                have = set()
                once = lambda name: (name not in have) and (have.add(name) or True)
                pg.evaluate("()=>window.__advance(500)")
                shot('start')
                asks = 0
                for step in range(12000):
                    st = pg.evaluate(STEP)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        asks += 1
                        pg.evaluate("()=>window.__advance(400)")
                        shot('ask%d' % asks)
                        pt = pg.evaluate(AIM, st['chart'])
                        if pt:
                            pg.mouse.move(pt[0], pt[1]); pg.mouse.down(); pg.mouse.move(pt[0] + 3, pt[1] + 2, steps=3); pg.mouse.move(pt[0], pt[1], steps=2); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(450); }")
                        shot('reveal%d' % asks)
                        pg.evaluate("()=>window.__advance(900)")
                        continue
                    ph, k = st.get('phase'), st.get('kind')
                    if k == 'dish':
                        if ph == 'run' and st['lit'] and st['tags'] == 0 and once('spark'): shot('spark')
                        if ph == 'run' and st['fates'] >= 12 and once('mid'): shot('mid')
                        if ph == 'run' and st['full'] and once('full'): shot('full')
                        if ph == 'patch' and st['t'] > 1.2 and once('patch1'): shot('patch1')
                        if ph == 'patch' and st['t'] > 5 and once('patch2'): shot('patch2')
                        if ph == 'pat' and st['t'] > 2.8 and once('pat'): shot('pat')
                    if k == 'tubes':
                        if ph == 'grow' and st['t'] > 1.5 and once('grow'): shot('grow')
                        if ph == 'plate' and st['plated'] == 8 and once('plate8'): pg.evaluate("()=>window.__advance(500)"); shot('plate8')
                        if ph == 'flag' and once('flag0'): pg.evaluate("()=>window.__advance(900)"); shot('flag0')
                        if ph == 'end' and once('ruler'): pg.evaluate("()=>window.__advance(700)"); shot('ruler')
                    if k == 'velvet':
                        if ph == 'stamp' and st['st'] == 0 and st['t'] > 1.25 and once('vel'): pg.evaluate("()=>window.__advance(260)"); shot('stampA')
                        if ph == 'pick' and once('pick'): pg.evaluate("()=>window.__advance(700)"); shot('pick')
                        if ph == 'm2' and st['t'] > 1.2 and once('m2'): shot('m2')
                        if ph == 'test' and st['t'] > 1.0 and once('test'): shot('test')
                    pg.evaluate("()=>window.__advance(40)")
                warn = pg.evaluate("()=>({lbl: (TB.Lbl && TB.Lbl.warnings || []).slice(0, 5), wh: (TB.Whisper && TB.Whisper.warnings || []).slice(0, 5), hud: (TB.HUD && TB.HUD.warnings || []).slice(0, 5), lg: (TB.LiveGraph && TB.LiveGraph.errors || []).slice(0, 3)})")
                if any(warn.values()): print('L%d %s warnings:' % (lv + 1, tag), warn)
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERROR', e)
    print('shots:', a.out, 'errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
