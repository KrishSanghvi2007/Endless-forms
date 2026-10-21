"""Equilibrium (id census, v2/mixer.js): a scripted playthrough with screenshots of every level (owned by the census unit).

  python3 tests/census_shots.py BUILD.html OUTDIR [--vp 390x780,1280x720] [--levels 0,...,7] [--seed 7] [--calm] [--untimed]
                                                [--whatif] [--naive]

A scripted, competent player uses real mouse clicks and drags on the canvas for the verbs (tag, crank, quadrat, the split
line, bait trays, diagnosis cards) and commits each prediction at the sim's expectation (or a naive value with --naive).
Captures L<n>_<phase>_<w>x<h>.png at each new phase and the level card. Prints one JSON line per viewport (errors, warnings,
stars per level). Exit 1 on a JavaScript error, an error box, or a Lbl/Whisper/HUD/Dock warning.
"""
import os, sys, json, argparse
from playwright.sync_api import sync_playwright

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}

STATE = """() => { const ch = TB.REG.census, s = ch.sim.s; if (!s) return null; const card = document.querySelector('#cards.on .card');
  const r = {level: s.level, phase: s.phase, t: s.t, ask: s.ask, card: card ? {cls: card.className, stars: card.dataset.stars, text: card.innerText.slice(0, 300)} : null};
  if (s.ask) { try { r.exp = ch.sim.H().expect(ch.sim, s, s.ask.id); } catch (e) { r.exp = null; } }
  r.spin = s.spin; r.n = s.n; r.manual = s.manual; r.round = s.round; r.mode = s.mode; r.want = s.want; r.trays = s.trays ? s.trays.length : 0;
  r.cause = s.cs ? s.cs.cause : null; r.tests = s.cs ? Object.keys(s.cs.tests) : []; r.days = s.days; r.ci = s.ci; r.splits = s.splits ? s.splits.length : 0;
  r.season = s.season; r.whatif = s.whatif; r.open = s.open; r.left = s.left; r.lever = s.lever; r.N = s.cs ? s.cs.N : null; return r; }"""
CV = "() => { const r = document.getElementById('scene').getBoundingClientRect(); return [r.left, r.top]; }"
WARN = "() => [['Lbl', TB.Lbl], ['Whisper', TB.Whisper], ['HUD', TB.HUD], ['Dock', TB.Dock]].filter(x => x[1] && x[1].warnings && x[1].warnings.length).map(x => x[0] + ': ' + JSON.stringify(x[1].warnings.slice(0, 3)))"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html'); ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720'); ap.add_argument('--levels', default='0,1,2,3,4,5,6,7')
    ap.add_argument('--seed', type=int, default=7); ap.add_argument('--calm', action='store_true'); ap.add_argument('--untimed', action='store_true')
    ap.add_argument('--whatif', action='store_true'); ap.add_argument('--naive', action='store_true'); ap.add_argument('--query', default='')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    vclock = open(os.path.join(SRC, 'vclock.js')).read()
    levels = [int(x) for x in a.levels.split(',')]
    fail = False
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for vp in a.vp.split(','):
            w, h = (int(v) for v in vp.split('x'))
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if a.calm else 'no-preference')
            pg = ctx.new_page()
            logs = []
            pg.on('console', lambda m: logs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
            pg.add_init_script(script=vclock)
            pg.goto('file://' + os.path.abspath(a.html) + a.query); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
            pg.evaluate("()=>window.__advance(1500)")
            if a.untimed: pg.evaluate("()=>{ TB.Save.d.ui.unt = 1; }")
            adv = lambda ms: pg.evaluate("ms=>window.__advance(ms)", ms)
            st = lambda: pg.evaluate(STATE)
            act = lambda o: pg.evaluate("o => TB.Sim.act(TB.REG.census, o)", o)
            ev = lambda js, arg=None: pg.evaluate(js, arg)
            tag = f'{w}x{h}'
            shot = lambda name: pg.screenshot(path=os.path.join(a.out, f'{name}_{tag}.png'))
            def click(x, y):
                o = pg.evaluate(CV); pg.mouse.click(o[0] + x, o[1] + y)
            def drag(pts, steps=6):
                o = pg.evaluate(CV); pg.mouse.move(o[0] + pts[0][0], o[1] + pts[0][1]); pg.mouse.down()
                for q in pts[1:]: pg.mouse.move(o[0] + q[0], o[1] + q[1], steps=steps)
                pg.mouse.up()
            def commit(s):
                v = s['exp']
                if a.naive and s['ask']['kind'] != 'tri': v = s['ask']['start']
                if isinstance(v, list): v = [round(x, 3) for x in v]
                ev("([id, v]) => { const r = TB.Predict.cur; if (r && r.id === id) { r.v = v; TB.Predict.commit(id); } else TB.Sim.act(TB.REG.census, {k: 'predict', id, v}); }", [s['ask']['id'], v])
            res = {'vp': tag, 'levels': {}}
            for lv in levels:
                ev("([lv, sd]) => { TB.Cards.close(); TB.App.playLevel(TB.REG.census, lv, {seed: sd}); }", [lv, a.seed + lv])
                adv(400); shot(f'L{lv}_start'); t0 = ev("() => window.__vt()")
                seen, asks = set(), 0
                for step in range(4000):
                    s = st()
                    if s is None: break
                    if s['card']:
                        secs = round((ev("() => window.__vt()") - t0) / 1000); adv(900); shot(f'L{lv}_card'); res['levels'][lv] = {'secs': secs, 'stars': s['card']['stars'], 'text': s['card']['text'][:100].replace('\n', ' | ')}
                        if a.whatif and lv in (1, 6):
                            ok = ev("() => { const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => /what if/i.test(x.textContent)); if (b) b.click(); return !!b; }")
                            adv(300)
                            if ok:
                                ev("() => { const c = [...document.querySelectorAll('#cards .chip')]; if (c.length) c[0].click(); }"); adv(800); shot(f'L{lv}_whatif_start')
                                for k in range(1500):
                                    s2 = st()
                                    if s2['card']: adv(600); shot(f'L{lv}_whatif_card'); res['levels'][str(lv) + 'w'] = {'stars': s2['card']['stars'], 'text': s2['card']['text'][:160].replace('\n', ' | ')}; break
                                    if s2['spin'] == 0 and s2['phase'] == 'spin': act({'k': 'spin', 'on': True})
                                    if k == 40: shot(f'L{lv}_whatif_mid')
                                    adv(200)
                        break
                    ph = s['phase']
                    key = ph + ('' if s.get('round') is None else str(s['round'])) + ('' if s.get('ci') is None else str(s['ci']))
                    if key not in seen:
                        seen.add(key); adv(250); shot(f'L{lv}_{key}'); s = st()
                        if s['card']: continue
                    if s['ask']:
                        asks += 1; adv(500); shot(f'L{lv}_ask_{s["ask"]["id"]}'); commit(s); adv(900); shot(f'L{lv}_rev_{s["ask"]["id"]}'); continue
                    if lv == 0 and ph in ('tag1', 'tag') and s.get('open', -1) is not None and s.get('open', -1) >= 0:
                        c0 = s['left'][0]
                        if (s['manual'] or 0) == 0 and len(s['left']) == 2 and 'L0_open' not in seen:
                            seen.add('L0_open'); shot('L0_open')
                        if (s['manual'] or 0) == 1 and len(s['left']) == 2:   # one wrong jar, to see the bounce
                            jr = ev("j => { const J = TB.REG.census.jarRect(), r = j ? J.b : J.a; return [r.x + r.w / 2, r.y + r.h / 2]; }", 1 - c0); click(jr[0], jr[1]); adv(150); shot('L0_bounce'); adv(300)
                        if (s['manual'] or 0) % 2 == 0:   # drag the copy itself to its jar
                            tp = ev("() => TB.REG.census.tokPos(0)"); jr = ev("j => { const J = TB.REG.census.jarRect(), r = j ? J.b : J.a; return [r.x + r.w / 2, r.y + r.h / 2]; }", c0); drag([tp, jr], 8)
                        else:
                            jr = ev("j => { const J = TB.REG.census.jarRect(), r = j ? J.b : J.a; return [r.x + r.w / 2, r.y + r.h / 2]; }", c0); click(jr[0], jr[1])
                        adv(260); continue
                    if lv == 0 and ph in ('tag1', 'tag') and (s['manual'] or 0) < 12:
                        i = ev("() => TB.REG.census.sim.s.bs.findIndex(b => !b.tag)")
                        xy = ev("i => TB.REG.census.pos0(i).slice(0, 2)", i); click(xy[0], xy[1]); adv(220)
                        if s['manual'] == 6: adv(120); shot('L0_fly')
                        continue
                    if lv == 1 and ph == 'spin' and s.get('lever') and 'lever' not in seen:
                        seen.add('lever'); ev("() => { const b = document.querySelector('#dock [data-id=pup]'); if (b) b.click(); }"); adv(300); ev("() => { const b = document.querySelector('#dock [data-id=pup]'); if (b) b.click(); }"); adv(400); shot('L1_lever'); continue
                    if lv == 2 and ph == 'build':
                        for k in (0, 1, 2, 3, 5, 9, 13):
                            xy = ev("k => { const q = TB.REG.census.penSlots()[k]; return [q.x, q.y]; }", k); click(xy[0], xy[1]); adv(150)
                        shot('L2_built'); ev("() => { const b = document.querySelector('#dock [data-id=built]'); if (b) b.click(); }"); adv(400); continue
                    if lv in (1, 2) and ph in ('c4', 'c40', 'spin', 'crank'):
                        if ph == 'c4' or (ph == 'crank' and s['round'] == 0 and s['n'] is None and ev("() => TB.REG.census.sim.s.ny") < 6):
                            k = ev("() => TB.REG.census.knob()"); click(k[0], k[1]); adv(350)
                            if ph == 'c4': shot('L1_pair')
                            continue
                        if not s['spin']: ev("() => { const b = document.querySelector('#dock [data-id=spin]'); if (b) b.click(); }")
                        adv(400)
                        if ph == 'spin' and 'spinmid' not in seen: seen.add('spinmid'); adv(2500); shot(f'L{lv}_spinmid')
                        continue
                    if lv == 4:
                        if ph == 'valve' or (ph == 'crank' and s['want'] == 'goal' and s['mode'] != 'like'):
                            m = 'like' if s['want'] == 'goal' else s['want']; xy = ev("m => TB.REG.census.valvePos(m)", m); click(xy[0], xy[1]); adv(400); continue
                        if ph == 'crank':
                            if not s['spin']: ev("() => { const b = document.querySelector('#dock [data-id=spin]'); if (b) b.click(); }")
                            adv(500)
                            if 'fammid' not in seen and s['mode'] == 'fam': seen.add('fammid'); adv(600); shot('L4_fammid')
                            if 'likemid' not in seen and s['mode'] == 'like': seen.add('likemid'); adv(600); shot('L4_likemid')
                            continue
                    if lv in (3, 5, 7) and ph in ('sample', 'csample', 'carrier'):
                        if lv == 7 and ph == 'csample' and (s['n'] or 0) >= min(50, int(0.8 * (s['N'] or 300))):
                            want = {'inb': ['gene'], 'wah': ['area'], 'sel': ['age'], 'drift': ['year'], 'mig': ['year'], 'none': ['age']}[s['cause']]
                            todo = [t for t in want if t not in s['tests']]
                            if todo and s['days'] >= (2 if todo[0] == 'year' else 1):
                                xy = ev("k => { const G = TB.REG.census.shelfGeo(), i = ['area', 'age', 'gene', 'year'].indexOf(k); return [G.x + i * (G.tw + 6) + G.tw / 2, G.y + G.h / 2]; }", todo[0]); click(xy[0], xy[1]); adv(700); shot(f'L7_test_{todo[0]}{s["ci"]}'); continue
                            ev("() => { const b = document.querySelector('#dock [data-id=diag]'); if (b) b.click(); }"); adv(500); continue
                        if lv in (3, 5) and (s['n'] or 0) >= (160 if lv == 3 else 140):
                            ev("() => { const b = document.querySelector('#dock [data-id=finish]'); if (b) b.click(); }"); adv(400); continue
                        j = step % 9; ux, uy = [0.2, 0.5, 0.8][j % 3], [0.25, 0.5, 0.75][j // 3]
                        qr = ev("() => { const r = TB.REG.census.quadRect(); return [r.x + r.w / 2, r.y + r.h / 2]; }")
                        to = ev("([x, y]) => TB.REG.census.fieldPt(x, y)", [ux, uy])
                        drag([qr, to]); adv(2600 if lv == 3 else 1800)
                        if 'samplemid' + str(s.get('ci')) not in seen and (s['n'] or 0) > 40: seen.add('samplemid' + str(s.get('ci'))); shot(f'L{lv}_samplemid{s.get("ci") or ""}')
                        continue
                    if lv == 5 and ph == 'split':
                        if s['splits'] == 0:
                            pts = ev("() => { const ch = TB.REG.census, s = ch.sim.s; return ch.sim.H().line(s).map(p => ch.fieldPt(Math.min(0.98, Math.max(0.02, p[0])), Math.min(0.98, Math.max(0.02, p[1])))); }")
                            drag(pts, 3); adv(900); shot('L5_split'); continue
                        ev("() => { const b = document.querySelector('#dock [data-id=done]'); if (b) b.click(); }"); adv(400); continue
                    if lv == 6 and ph in ('dusk', 'place') and s['trays'] < 3 and not s['whatif'] and (s['season'] or 1) <= 2:
                        xy = ev("k => TB.REG.census.yardPt([230, 250, 250][k], [160, 205, 115][k])", s['trays']); click(xy[0], xy[1]); adv(250); continue
                    if lv == 6 and ph == 'place' and s['season'] == 3 and s['trays'] == 3 and 'lift' not in seen:   # lift a tray: bait costs grain
                        seen.add('lift'); xy = ev("() => TB.REG.census.yardPt(250, 115)"); click(xy[0], xy[1]); adv(300); shot('L6_lift'); continue
                    if lv == 6 and ph == 'place':
                        ev("() => { const b = document.querySelector('#dock [data-id=release]'); if (b) b.click(); }"); adv(300); continue
                    if lv == 6 and ph == 'night' and 'night' + str(s['season']) not in seen and s['season'] in (1, 4):
                        seen.add('night' + str(s['season'])); adv(3500); shot(f'L6_night{s["season"]}'); continue
                    if lv == 7 and ph == 'dx':
                        c = ['inb', 'wah', 'sel', 'drift', 'mig', 'none'].index(s['cause'])
                        hit = ev("c => { const G = TB.REG.census.dxGeo(); return [G.x + (c % 2) * (G.cw + 12) + G.cw / 2, G.y + Math.floor(c / 2) * (G.ch + 8) + G.ch / 2]; }", c)
                        click(hit[0], hit[1]); adv(300); shot(f'L7_dx{s["ci"]}')
                        pc = ev("() => { const G = TB.REG.census.dxGeo(), pw = Math.min(64, (G.w - 16) / 5), x0 = G.x + (G.w - 5 * pw) / 2; return [x0 + 3 * pw + (pw - 6) / 2, G.py + 22]; }")
                        click(pc[0], pc[1]); adv(700); shot(f'L7_closed{s["ci"]}'); continue
                    adv(300)
                errs = ev("() => window.__errs.slice(0, 3)"); eb = ev("() => document.getElementById('err').style.display === 'block' ? document.getElementById('err').textContent.slice(0, 300) : ''")
                if errs or eb: res.setdefault('errors', []).append({'level': lv, 'errs': errs, 'errbox': eb}); fail = True
            res['warnings'] = ev(WARN); res['console'] = logs[:6]
            if res['warnings']: fail = True
            print(json.dumps(res))
            ctx.close()
        b.close()
    sys.exit(1 if fail else 0)


if __name__ == '__main__':
    main()
