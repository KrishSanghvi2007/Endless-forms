"""The Royal Line (v2) input paths: real pointer drags, keys, the dock path, untimed, Calm, What if? and ?v1=1.

  GAME_HTML=/abs/build.html python3 tests/royal_paths.py

Each check prints ok/FAIL; exit 1 on any failure or page error."""
import os, sys
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
fails, errs = [], []


def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)


def page(b, html, q='', vp=(390, 780), calm=False):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference')
    pg = ctx.new_page(); pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + html + '?dev=1&intro=0' + q); pg.evaluate("()=>window.__advance(600)")
    return ctx, pg


def play(pg, lv, seed=5):
    pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.royal, o.lv, {seed: o.seed}); window.__advance(1500); }", {'lv': lv, 'seed': seed})


def cv_xy(pg, expr):
    return pg.evaluate("()=>{ const ch = TB.REG.royal, c = TB.Stage.cv.getBoundingClientRect(), p = (" + expr + "); return [c.x + p[0], c.y + p[1]]; }")


def main():
    html = os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v2.html')
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        # 1. L1: a real drag from the wild female bottle onto the white male crosses them
        ctx, pg = page(b, html); play(pg, 0)
        a = cv_xy(pg, "ch.bottleXY('wf')"); z = cv_xy(pg, "ch.bottleXY('mm')")
        pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move((a[0] + z[0]) / 2, a[1] + 50, steps=6); pg.mouse.move(*z, steps=6); pg.mouse.up(); pg.evaluate("()=>window.__advance(300)")
        st = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return {n: s.crosses.length, f: s.crosses[0] && s.crosses[0].f, m: s.crosses[0] && s.crosses[0].m, left: s.left}; }")
        check(st['n'] == 1 and st['f'] == 'wf' and st['m'] == 'mm' and st['left'] == 5, 'L1: dragging the wild female onto the white male crosses them (%s)' % st)
        # a drop on empty bench does nothing
        pg.evaluate("()=>window.__advance(6000)")
        a = cv_xy(pg, "ch.bottleXY('wf')"); pg.mouse.move(*a); pg.mouse.down(); pg.mouse.move(a[0], a[1] + 220, steps=6); pg.mouse.up(); pg.evaluate("()=>window.__advance(200)")
        check(pg.evaluate("()=>TB.REG.royal.sim.s.crosses.length") == 1, 'L1: a drop away from a male bottle crosses nothing')
        ctx.close()
        # 2. L1 by keys and the dock: 1 selects the wild female, the dock crosses her with a white male
        ctx, pg = page(b, html, vp=(1280, 720)); play(pg, 0)
        pg.keyboard.press('1'); pg.evaluate("()=>window.__advance(100)")
        pg.click('#dock [data-id="ry-xw"]') if pg.query_selector('#dock [data-id="ry-xw"]') else pg.evaluate("()=>{ const b = [...document.querySelectorAll('#dock button')].find(x => /White/.test(x.textContent)); b && b.click(); }")
        pg.evaluate("()=>window.__advance(300)")
        st = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return s.crosses.map(c => c.f + 'x' + c.m); }")
        check(st == ['wfxmm'], 'L1: key 1 then the dock "White ♂" runs the F1 cross (%s)' % st)
        ctx.close()
        # 3. L3 untimed (?untimed=1): flashes on white males catch them; the round waits
        ctx, pg = page(b, html, q='&untimed=1'); play(pg, 2)
        st0 = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return {unt: s.unt, bat: s.bat, ct: s.ct}; }")
        pg.evaluate("()=>window.__advance(4000)")
        st1 = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return {bat: s.bat, phase: s.phase, ct: s.ct}; }")
        check(st0['unt'] and st1['phase'] == 'court' and st1['bat'] == st0['bat'], 'L3 untimed: the courtship round waits (%s, %s)' % (st0, st1))
        xy = cv_xy(pg, "(() => { const s = ch.sim.s, f = s.flies.find(q => q.w && !q.c); return ch.flyXY(f); })()")
        pg.mouse.click(*xy); pg.evaluate("()=>window.__advance(200)")
        st2 = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return {cg: s.cg, bat: s.bat}; }")
        check(st2['cg'] >= 1 and abs(st2['bat'] - (st0['bat'] - 0.5)) < 1e-6, 'L3 untimed: a tap on a white-eyed male flashes the lamp and catches him (%s)' % st2)
        ctx.close()
        # 4. L3 timed: a real sweep with the pointer catches white males; no battery (the round's clock is the limit)
        ctx, pg = page(b, html, vp=(1280, 720)); play(pg, 2)
        pts = pg.evaluate("()=>{ const ch = TB.REG.royal, s = ch.sim.s, c = TB.Stage.cv.getBoundingClientRect(); return s.flies.filter(f => f.w).slice(0, 6).map(f => { const p = ch.flyXY(f); return [c.x + p[0], c.y + p[1]]; }); }")
        pg.mouse.move(*pts[0]); pg.mouse.down()
        for q in pts:
            for k in range(8): pg.mouse.move(q[0], q[1]); pg.evaluate("()=>window.__advance(40)")
        pg.mouse.up(); pg.evaluate("()=>window.__advance(100)")
        st = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return {cg: s.cg, bat: s.bat, bat0: s.bat0, beam: s.beam.on}; }")
        check(st['cg'] >= 1 and st['bat'] == st['bat0'] and not st['beam'], 'L3: a pointer sweep catches white males, spends no battery, and lifting the pointer turns the beam off (%s)' % st)
        ctx.close()
        # 5. the boss: the slider by keys, Seal by Enter; Seal is refused before the slider is set
        ctx, pg = page(b, html); play(pg, 3)
        pg.keyboard.press('Enter'); pg.evaluate("()=>window.__advance(200)")
        check(pg.evaluate("()=>TB.REG.royal.sim.s.judg.length") == 0, 'boss: Enter before the slider is set seals nothing')
        for k in range(10): pg.keyboard.press('ArrowRight')
        pg.keyboard.press('Enter'); pg.evaluate("()=>window.__advance(200)")
        st = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return s.judg.map(j => [j.id, j.st, j.v]); }")
        check(len(st) == 1 and st[0][0] == 'alice' and abs(st[0][2] - 1.0) < 1e-9, 'boss: ten right-arrows from the middle reach 100%%; Enter seals Alice\'s prior (%s)' % st)
        ctx.close()
        # 6. the zigzag: a real tap on the cage breeds the next generation, the dock "Breed" another; then What if? on its card
        ctx, pg = page(b, html); play(pg, 1, 3)
        xy = cv_xy(pg, "[ch.pos().cage.x, ch.pos().cage.y]"); pg.mouse.click(*xy); pg.evaluate("()=>window.__advance(300)")
        g1 = pg.evaluate("()=>TB.REG.royal.sim.s.g")
        pg.click('#dock [data-id="ry-gen"]'); pg.evaluate("()=>window.__advance(300)")
        g2 = pg.evaluate("()=>TB.REG.royal.sim.s.g")
        check(g1 == 1 and g2 == 2, 'L2: a tap on the cage breeds a generation, and the dock "Breed" another (%s, %s)' % (g1, g2))
        pg.evaluate("""()=>{ const ch = TB.REG.royal; for (let k = 0; k < 6000 && !document.querySelector('#cards.on .card'); k++) { const s = ch.sim.s; if (s.kind === 'cage' && s.phase === 'gen' && s.g < 4) TB.Sim.act(ch, {k: 'breed'}); window.__advance(40); } }""")
        has = pg.evaluate("()=>!!document.querySelector('#cards.on .card')")
        pg.evaluate("()=>window.__advance(2000)"); pg.wait_for_timeout(1200); wi = pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on .card button')].find(x => /What if/.test(x.textContent)); if (b) b.click(); window.__advance(300); const c = [...document.querySelectorAll('#cards.on button')].find(x => /Autosomal/.test(x.textContent)); if (c) c.click(); window.__advance(500); return !!c; }")
        pg.evaluate("()=>window.__advance(9000)")
        st = pg.evaluate("()=>{ const s = TB.REG.royal.sim.s; return {whatif: s.whatif, g: s.g, phase: s.phase}; }")
        check(has and wi and st['whatif'] == 'auto', 'L2: the card offers What if? "Autosomal gene", which reruns the cage (%s)' % st)
        ctx.close()
        # 7. Calm: the lamp level plays with no errors and no shake
        ctx, pg = page(b, html, calm=True); play(pg, 2)
        pg.evaluate("()=>window.__advance(3000)")
        check(pg.evaluate("()=>!!(TB.Fx && TB.Fx.calm)"), 'Calm (prefers-reduced-motion) is on for the lamp')
        ctx.close()
        # 8. ?v1=1 is the legacy game: no royal chapter
        ctx = b.new_context(); pg = ctx.new_page(); pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read()); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + html + '?v1=1'); pg.evaluate("()=>window.__advance(600)")
        check(not pg.evaluate("()=>!!(TB.REG.royal && TB.REG.royal.v2)"), '?v1=1: no v2 Royal Line in the legacy game')
        ctx.close()
        b.close()
    for e in errs[:10]: print('ERROR', e)
    print('royal paths: %d failed, %d page errors' % (len(fails), len(errs)))
    sys.exit(1 if fails or errs else 0)


if __name__ == '__main__':
    main()
