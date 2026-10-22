"""Alarm Call (v2) input paths in a real browser: canvas taps, keys, dock buttons, untimed, Calm, teacher and ?v1=1.

  GAME_HTML=/abs/build.html python3 tests/alarm_paths.py

Checks: a tap on your squirrel calls; a tap on your burrow stays silent; C and S keys call and stay silent; L2 opens on an
attack with blank sister flags; the boss hides the whistle's cost until the first hawk's ledger; act-to-juice latency ≤ 200 ms (Events.lat); ?untimed=1 never times a decision out; ?calm=1 and
?teacher=1 load and play; ?v1=1 opens the legacy chapter. Exit 1 on a failed check or a page error."""
import os, sys
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
fails, errs = [], []

def check(c, msg):
    print(('  ok   ' if c else '  FAIL ') + msg)
    if not c: fails.append(msg)

def open_level(pg, lv, seed=5):
    pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.alarm, o.lv, {seed: o.seed}); window.__advance(300); }", {'lv': lv, 'seed': seed})
    for _ in range(20):
        if not pg.evaluate("()=>{ const b = document.querySelector('#cards.on .card.ef-intro [data-play]'); if (b) b.click(); window.__advance(200); return !!document.querySelector('#cards.on .card'); }"): break

def canvas_xy(pg, expr):
    return pg.evaluate("()=>{ const ch = TB.REG.alarm, p = (" + expr + "), r = document.getElementById('scene').getBoundingClientRect(); return [r.x + p[0], r.y + p[1]]; }")

def main():
    html = os.environ.get('GAME_HTML'); vclock = open(os.path.join(SRC, 'vclock.js')).read()
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for vp in [(390, 780), (1280, 720)]:
            ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}); pg = ctx.new_page(); pg.add_init_script(vclock)
            pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            pg.goto('file://' + html); pg.evaluate("()=>{ window.__advance(500); if (TB.Events) TB.Events.debug = true; }")
            print('viewport %dx%d' % vp)
            open_level(pg, 0); pg.evaluate("()=>window.__advance(1000)")
            x, y = canvas_xy(pg, "ch.youAt()"); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(100)")
            check(pg.evaluate("()=>TB.REG.alarm.sim.s.recs.length === 1 && TB.REG.alarm.sim.s.recs[0].a === 1"), 'L1: a tap on your squirrel calls')
            pg.evaluate("()=>window.__advance(4500)")
            x, y = canvas_xy(pg, "(()=>{ const G = ch.geo(); return [G.yx + G.hero * 0.85, G.by]; })()"); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(100)")
            check(pg.evaluate("()=>{ const r = TB.REG.alarm.sim.s.recs; return r.length === 2 && r[1].a === 0 && !r[1].slow; }"), 'L1: a tap on your burrow stays silent')
            pg.evaluate("()=>window.__advance(3300)"); pg.keyboard.press('c'); pg.evaluate("()=>window.__advance(100)")
            check(pg.evaluate("()=>{ const r = TB.REG.alarm.sim.s.recs; return r.length === 3 && r[2].a === 1; }"), 'L1: the C key calls')
            pg.evaluate("()=>window.__advance(3400)")
            check(pg.evaluate("()=>{ const s = TB.REG.alarm.sim.s; return !!s.ask && s.ask.id === 'be'; }"), 'L1: after three attacks the break-even ask opens')
            pg.keyboard.press('Enter'); pg.evaluate("()=>window.__advance(200)")
            check(pg.evaluate("()=>TB.REG.alarm.sim.s.pred.be == null"), 'L1: Lock in on an untouched ghost is no prediction (needMove)')
            pg.keyboard.press('p')
            for _ in range(6): pg.keyboard.press('Shift+ArrowDown')
            pg.keyboard.press('Enter'); pg.evaluate("()=>window.__advance(300)")
            check(pg.evaluate("()=>{ const v = TB.REG.alarm.sim.s.pred.be; return v != null && v < 2; }"), 'L1: P, arrows and Enter commit a prediction from the keyboard')
            pg.evaluate("()=>window.__advance(1200)"); pg.keyboard.press('s'); pg.evaluate("()=>window.__advance(100)")
            check(pg.evaluate("()=>{ const r = TB.REG.alarm.sim.s.recs; return r.length === 4 && r[3].a === 0; }"), 'L1: the S key stays silent')
            lat = pg.evaluate("()=>TB.Events && TB.Events.lat ? TB.Events.lat().filter(v => v != null) : []")
            check(len(lat) > 0 and max(lat) <= 200, 'act-to-juice latency ≤ 200 ms (%s)' % lat[:6])
            pg.evaluate("()=>window.__advance(3300)"); pg.click('#dock [data-id="al-call"]'); pg.evaluate("()=>window.__advance(100)")
            check(pg.evaluate("()=>TB.REG.alarm.sim.s.recs.length === 5"), 'L1: the dock Call button calls')
            # L2: sisters' flags are blank; their face blazes decide; the same verb
            open_level(pg, 1); pg.evaluate("()=>window.__advance(1500)")
            check(pg.evaluate("()=>{ const s = TB.REG.alarm.sim.s; return s.phase === 'attack' && s.atk.nb.some(id => s.tags[id] == null); }"), 'L2: opens on an attack with a blank-flagged sister to read')
            x, y = canvas_xy(pg, "ch.youAt()"); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(100)")
            check(pg.evaluate("()=>TB.REG.alarm.sim.s.recs.length === 1"), 'L2: a tap on your squirrel calls (one verb all chapter)')
            # the boss: the first hawk's cost is hidden until its ledger
            open_level(pg, 3); pg.evaluate("()=>window.__advance(800)"); pg.keyboard.press('s'); pg.evaluate("()=>window.__advance(3400)")
            check(pg.evaluate("()=>{ const s = TB.REG.alarm.sim.s; return s.atk && s.atk.pred === 'hawk' && !s.hawkSeen; }"), 'boss: the second attack is a hawk, its whistle cost still hidden')
            pg.keyboard.press('c'); pg.evaluate("()=>window.__advance(3400)")
            check(pg.evaluate("()=>TB.REG.alarm.sim.s.hawkSeen === true"), 'boss: after the first hawk the whistle cost is known')
            ctx.close()
        for q, name in [('?untimed=1', 'untimed'), ('?calm=1', 'calm'), ('?teacher=1', 'teacher')]:
            ctx = b.new_context(viewport={'width': 390, 'height': 780}); pg = ctx.new_page(); pg.add_init_script(vclock)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('file://' + html + q); pg.evaluate("()=>window.__advance(500)")
            open_level(pg, 0); pg.evaluate("()=>window.__advance(800)"); pg.keyboard.press('c'); pg.evaluate("()=>window.__advance(3300)")
            pg.evaluate("()=>window.__advance(20000)")
            st = pg.evaluate("()=>{ const s = TB.REG.alarm.sim.s; return {n: s.recs.length, st: s.atk && s.atk.st, slow: s.recs.some(r => r.slow)}; }")
            if name == 'untimed': check(st['n'] == 1 and st['st'] == 'decide', 'untimed: the second attack waits 20 s for you (%s)' % st)
            else: check(st['n'] >= 2, '%s: the level plays on (%s)' % (name, st))
            ctx.close()
        ctx = b.new_context(viewport={'width': 390, 'height': 780}); pg = ctx.new_page(); pg.add_init_script(vclock)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + html + '?v1=1'); pg.evaluate("()=>window.__advance(500)")
        check(pg.evaluate("()=>TB.REG.alarm && TB.REG.alarm.v2 !== true"), '?v1=1: the legacy Alarm Call is registered')
        ctx.close(); b.close()
    for e in errs: print('  ERROR', e)
    print('alarm paths: %d failed, %d page errors' % (len(fails), len(errs)))
    sys.exit(1 if fails or errs else 0)

if __name__ == '__main__': main()
