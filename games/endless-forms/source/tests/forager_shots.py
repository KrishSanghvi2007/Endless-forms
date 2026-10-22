"""The Forager (v2) screenshots: every level and its main phases at two viewports, plus Calm and colour-vision views.

  GAME_HTML=/abs/build.html python3 tests/forager_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=deut'] [--calm]

Plays each level with a scripted player (the right rules, through Sim.act; each prediction a real drag on the strip, then Lock in)
under virtual time and saves PNGs named L<n>_<phase>_<w>x<h>.png. Prints page errors and Lbl/Whisper/HUD warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STEP = """(lv)=>{ const ch = TB.REG.forager, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  if (s.ask) return {ask: s.ask.id, phase: s.phase, chart: s.kind === 'night' ? 1 : 0, lo: s.ask.lo, hi: s.ask.hi, exp: s.exp[s.ask.id]};
  const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a && a.k !== 'predict') TB.Sim.act(ch, a);
  return {phase: s.phase, i: s.i, prey: !!s.prey, busy: s.busy || 0, field: !!(s.carry && s.carry.field), tree: s.tree || 0, tt: s.tt || 0, deps: s.deps ? s.deps.length : 0, gen: s.gen || 0, v: s.v, cd: s.cd || 0, kind: s.kind}; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    ap.add_argument('--seed', type=int, default=7)
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
            pg.goto('file://' + html + ('?dev=1&intro=0' if not q else q + '&dev=1&intro=0'))
            pg.evaluate("()=>window.__advance(600)")
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '') + (('_' + q.strip('?').replace('=', '-').replace('&', '_')) if q else '')
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.forager, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': a.seed})
                shot = lambda name: (pg.evaluate("()=>window.__advance(80)"), pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag))))
                have = set()
                once = lambda name: (name not in have) and (have.add(name) or True)
                pg.evaluate("()=>window.__advance(700)")
                shot('start')
                asks = 0
                for step in range(9000):
                    st = pg.evaluate(STEP, lv)
                    if 'card' in st:
                        pg.evaluate("()=>window.__advance(1500)")
                        shot('card'); break
                    if 'ask' in st:
                        asks += 1
                        shot('ask%d' % asks)
                        box = pg.evaluate("(i)=>{ const c = TB.Strip.canvas(i); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }", st['chart'])
                        if box:
                            x, y, bw, bh = box
                            f = (st['exp'] - st['lo']) / (st['hi'] - st['lo']) if st.get('exp') is not None else 0.5
                            pg.mouse.move(x + bw * 0.9, y + bh * 0.6); pg.mouse.down(); pg.mouse.move(x + bw * (0.06 + 0.8 * f), y + bh * 0.6, steps=6); pg.mouse.up()
                            pg.evaluate("()=>window.__advance(200)")
                        pg.evaluate("()=>{ TB.Predict && TB.Predict.commit && TB.Predict.commit(); window.__advance(500); }")
                        shot('reveal%d' % asks)
                        pg.evaluate("()=>window.__advance(900)")
                        continue
                    ph = st.get('phase'); k = st.get('kind')
                    if k in ('hedge', 'hawk'):
                        if st.get('prey') and st.get('i') == 1 and once('prey'): shot('prey')
                        if st.get('busy', 0) > 30 and st.get('i') == 1 and once('trip'): shot('trip')
                        if st.get('busy', 0) > 0 and st.get('busy') < 22 and st.get('i') == 1 and once('deliver'): shot('deliver')
                        if k == 'hawk' and st.get('field') and once('field'): shot('field')
                        if ph == 'gap' and once('gap'): shot('gap')
                    if k == 'orchard':
                        if ph == 'tree' and st.get('tt', 0) > 90 and once('tree'): shot('tree')
                        if ph == 'fly' and once('fly'): pg.evaluate("()=>window.__advance(500)"); shot('fly')
                        if ph == 'tree' and st.get('deps', 0) >= 5 and once('tangent'): shot('tangent')
                        if ph == 'gens' and st.get('gen') == 3 and once('gens3'): shot('gens3')
                        if ph == 'gens' and st.get('gen') == 20 and once('gens20'): shot('gens20')
                    if k == 'night':
                        if ph == 'eve' and st.get('cd', 0) > 5 and once('feed'): shot('feed')
                        if ph == 'night' and once('night'): pg.evaluate("()=>window.__advance(1200)"); shot('night')
                        if ph == 'eve' and st.get('i') == 2 and once('eve3'): shot('eve3')
                    pg.evaluate("()=>window.__advance(40)")
                warn = pg.evaluate("()=>({lbl: (TB.Lbl && TB.Lbl.warnings || []).slice(0, 5), wh: (TB.Whisper && TB.Whisper.warnings || []).slice(0, 5), hud: (TB.HUD && TB.HUD.warnings || []).slice(0, 5), lg: (TB.LiveGraph && TB.LiveGraph.errors || []).slice(0, 3)})")
                if any(warn.values()): print('L%d %s warnings:' % (lv + 1, tag), warn)
            ctx.close()
        b.close()
    for e in errs[:20]: print('ERROR', e)
    print('shots:', a.out, 'errors:', len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__' and not os.environ.get('FG_BOLD'):
    main()


def bold(html, out, vp='390x780'):
    """Hawk round 2 played bold (every field caterpillar taken): shots of a stoop and a catch."""
    w, h = [int(x) for x in vp.split('x')]
    vclock = open(os.path.join(SRC, 'vclock.js')).read()
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME); pg = b.new_page(viewport={'width': w, 'height': h}); pg.add_init_script(vclock)
        pg.goto('file://' + html + '?dev=1&intro=0'); pg.evaluate("()=>window.__advance(600)")
        for seed in range(1, 12):
            pg.evaluate("(sd)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.forager, 2, {seed: sd}); window.__advance(300); const ch = TB.REG.forager, s = ch.sim.s; s.i = 1; s.rec.length = 1; ch.sim.newRound(s, []); }", seed)
            got = set()
            for step in range(3000):
                st = pg.evaluate("""()=>{ const ch = TB.REG.forager, s = ch.sim.s, v = ch.v; if (s.prey && !s.busy) TB.Sim.act(ch, {k: 'take'}); return {dive: !!v.dive, dt: v.dive ? v.dive.t : 0, kill: v.dive ? v.dive.kill : null, phase: s.phase, ghost: !!v.ghostR}; }""")
                if st['dive'] and st['dt'] > 0.15 and st['dt'] < 0.3 and ('kill' if st['kill'] else 'miss') not in got:
                    got.add('kill' if st['kill'] else 'miss'); pg.screenshot(path=os.path.join(out, 'L3_stoop_%s_%s.png' % ('kill' if st['kill'] else 'miss', vp)))
                if st['ghost'] and 'ghost' not in got: pg.evaluate("()=>window.__advance(300)"); got.add('ghost'); pg.screenshot(path=os.path.join(out, 'L3_caught_%s.png' % vp))
                if st['phase'] != 'run': break
                pg.evaluate("()=>window.__advance(40)")
            if {'kill', 'miss'} <= got: break
        b.close()


if __name__ == '__main__' and os.environ.get('FG_BOLD'):
    bold(os.environ['GAME_HTML'], sys.argv[1], os.environ.get('FG_VP', '390x780'))
