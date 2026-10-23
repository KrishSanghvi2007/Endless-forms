"""Tree Thinking (v2) screenshots: every level and its main phases at two viewports.

  GAME_HTML=/abs/build.html python3 tests/tree_shots.py OUTDIR [--vp 390x780,1280x720] [--levels 0,1,2,3] [--query '?cvd=mono'] [--calm]

Plays each level with a scripted player under virtual time: real pointer taps on the canvas (a joint, a specimen) for
the first moves, then the expert's moves through Sim.act, and a deliberate wrong move where a level teaches one (the
ladder pick is right; the bat is first hung by the sparrow; the first root goes on a wrong tip). Saves PNGs named
L<n>_<phase>_<w>x<h>.png. Prints page errors and Lbl/Whisper/HUD/Dock warnings. Exit 1 on an error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """()=>{ const ch = TB.REG.tree, s = ch.sim.s, card = document.querySelector('#cards.on .card');
  if (card) return {card: card.className};
  return {phase: s.phase, ci: s.ci, plate: s.plate, sis: s.cs ? s.cs[s.ci].sis : null, vis: s.cs ? s.cs[s.ci].vis : null, mounts: s.cs ? s.cs[s.ci].mounts.length : null,
          root: s.rc ? s.rc[s.ci].root : null, taps: s.rc ? s.rc[s.ci].taps : null, sw: s.swTot}; }"""
EXPERT = """()=>{ const ch = TB.REG.tree, S = ch.sim, s = S.s, A = S.actions(); if (!A.length) return null; const a = S.bots.expert(s, A); if (a) TB.Sim.act(ch, a); return a; }"""
# canvas coordinates of a target, then a real click there
JOINT = """()=>{ const ch = TB.REG.tree, s = ch.sim.s, J = ch.joints(), w = ch.sim.firstWrong(s), j = J[w < 0 ? 0 : w], r = document.getElementById('scene').getBoundingClientRect(); return [r.left + j.x, r.top + j.y]; }"""
TIP = """(t)=>{ const ch = TB.REG.tree, p = ch.tipXY(t), r = document.getElementById('scene').getBoundingClientRect(); return [r.left + p[0], r.top + p[1]]; }"""
WARN = """()=>[['Lbl', TB.Lbl], ['Whisper', TB.Whisper], ['HUD', TB.HUD], ['Dock', TB.Dock]].filter(x => x[1] && x[1].warnings && x[1].warnings.length).map(x => x[0] + ': ' + JSON.stringify(x[1].warnings.slice(0, 3)))"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--levels', default='0,1,2,3')
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
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
            tag = '%dx%d' % (w, h) + ('_calm' if a.calm else '')
            adv = lambda ms: pg.evaluate("(ms)=>window.__advance(ms)", ms)
            for lv in [int(x) for x in a.levels.split(',')]:
                pg.evaluate("(lv)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.tree, lv, {seed: 7}); window.__advance(300); }", lv)
                shot = lambda name: pg.screenshot(path=os.path.join(a.out, 'L%d_%s_%s.png' % (lv + 1, name, tag)))
                if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):
                    shot('intro')
                    pg.evaluate("()=>{ window.__advance(900); const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(300); }")
                adv(1600)
                shot('start')
                seen = set()
                for step in range(800):
                    st = pg.evaluate(STATE)
                    if 'card' in st:
                        adv(1500); shot('card'); break
                    ph = st['phase']
                    if lv == 0:
                        if ph == 'play':
                            if st['sw'] == 0 or ('tap%d' % st['plate']) not in seen:
                                seen.add('tap%d' % st['plate'])
                                x, y = pg.evaluate(JOINT); pg.mouse.click(x, y); adv(120)
                                shot('swing%d' % st['plate']); adv(400)
                            else:
                                pg.evaluate(EXPERT); adv(420)
                        elif ph == 'match' and ('m%d' % st['plate']) not in seen:
                            seen.add('m%d' % st['plate']); adv(300); shot('matched%d' % st['plate']); adv(1200)
                        elif ph == 'ask':
                            adv(600); shot('ask'); x, y = pg.evaluate(TIP, 5); pg.mouse.click(x, y); adv(1400); shot('reveal'); adv(2500)
                        else:
                            adv(250)
                    elif lv in (1, 2):
                        key = 'c%d' % st['ci']
                        if ph == 'play':
                            if key not in seen:
                                seen.add(key); adv(500); shot('case%d' % st['ci'])
                                t = 1 if (lv == 2 and st['ci'] == 0) else pg.evaluate("()=>{ const s = TB.REG.tree.sim.s; return s.cs[s.ci].ord[0]; }")
                                x, y = pg.evaluate(TIP, t); pg.mouse.click(x, y); adv(700); shot('hung%d' % st['ci'])
                                if lv == 2 and st['ci'] == 0:
                                    pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"tt-mount\"]'); if (b) b.click(); }"); adv(900); shot('drawers'); adv(3500); shot('reopened')
                            else:
                                a2 = pg.evaluate(EXPERT); adv(700)
                                if a2 and a2.get('k') == 'hang': shot('rehang%d' % st['ci'])
                        elif ph == 'mounted' and ('mt' + key) not in seen:
                            seen.add('mt' + key); adv(300); shot('mounted%d' % st['ci']); adv(2200)
                        else:
                            adv(250)
                    else:
                        key = 'r%d' % st['ci']
                        if ph == 'play':
                            if key not in seen:
                                seen.add(key); adv(500); shot('case%d' % st['ci'])
                                wrong = pg.evaluate("()=>{ const S = TB.REG.tree.sim, s = S.s, r = S.r(s), R0 = S.R0(s); for (let t = 1; t < R0.tips.length; t++) if (t !== r.root && t !== R0.out) return t; return 1; }")
                                x, y = pg.evaluate(TIP, wrong); pg.mouse.click(x, y); adv(900); shot('wrongroot%d' % st['ci'])
                            else:
                                pg.evaluate(EXPERT); adv(500)
                        elif ph == 'rooted' and ('rt' + key) not in seen:
                            seen.add('rt' + key); adv(700); shot('rooted%d' % st['ci']); adv(2000)
                        else:
                            adv(250)
                ws = pg.evaluate(WARN)
                if ws: errs.extend(ws)
            ctx.close()
        b.close()
    print('shots in', a.out, '; errors:', len(errs))
    for e in errs[:20]: print('  ', e)
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
