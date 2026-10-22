"""The Forager (v2): real-input paths. Clicks, keys, untimed, Calm, teacher, What if? and ?v1=1, in Chromium under virtual time.

  GAME_HTML=/abs/build.html python3 tests/forager_paths.py

Each check prints ok/FAIL; exit 1 on any failure or page error."""
import os, sys, json
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
fails = []


def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: fails.append(msg)


def page(b, html, q='', vp=(390, 780)):
    pg = b.new_page(viewport={'width': vp[0], 'height': vp[1]})
    pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + html + q + ('&' if q else '?') + 'intro=0')   # the opening card (D6 addendum 8) is tested by the engine; these paths start in play
    pg.evaluate("()=>window.__advance(600)")
    return pg, errs


def play(pg, lv, seed=3):
    pg.evaluate("(o)=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.forager, o.lv, {seed: o.seed}); window.__advance(2200); }", {'lv': lv, 'seed': seed})


def canvas_xy(pg, x, y):
    r = pg.evaluate("()=>{ const r = TB.Stage.cv.getBoundingClientRect(); return [r.x, r.y]; }")
    return r[0] + x, r[1] + y


def main():
    html = os.environ.get('GAME_HTML')
    if not html: print('set GAME_HTML'); sys.exit(2)
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)

        # 1. a real tap on the first caterpillar takes it; the food arrives after the trip home
        pg, errs = page(b, html, '?dev=1')
        play(pg, 0)
        xy = pg.evaluate("()=>TB.REG.forager.preyXY()")
        check(xy is not None, 'L1: the first caterpillar is in view within 2.2 s')
        x, y = canvas_xy(pg, xy[0], xy[1]); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(2400)")
        st = pg.evaluate("()=>{ const s = TB.REG.forager.sim.s; return {food: s.food, took: s.rec[0].takeB}; }")
        check(st['took'] == 1 and st['food'] == 3, 'L1: a real tap took the big caterpillar and the chicks got 3 food (%s)' % json.dumps(st))
        # 2. keys: wait for a prey, ArrowRight passes it, then Space takes the next
        passed = took = False
        for k in range(600):
            s = pg.evaluate("()=>{ const s = TB.REG.forager.sim.s; return {prey: !!s.prey, busy: s.busy, seen: s.rec.reduce((a, r) => a + r.seenS + r.seenB, 0), take: s.rec.reduce((a, r) => a + r.takeS + r.takeB, 0)}; }")
            if s['prey'] and not s['busy']:
                if not passed:
                    before = s['take']; pg.keyboard.press('ArrowRight'); pg.evaluate("()=>window.__advance(80)")
                    after = pg.evaluate("()=>TB.REG.forager.sim.s.prey"); passed = after is None
                elif not took:
                    before = s['take']; pg.keyboard.press(' '); pg.evaluate("()=>window.__advance(80)")
                    took = pg.evaluate("()=>TB.REG.forager.sim.s.rec.reduce((a, r) => a + r.takeS + r.takeB, 0)") == before + 1
                    break
            pg.evaluate("()=>window.__advance(40)")
        check(passed and took, 'keys: ArrowRight passes a caterpillar, Space takes one')
        # 3. the dock buttons work by click
        btns = pg.evaluate("()=>[...document.querySelectorAll('#dock button')].map(b => b.textContent)")
        check(any('Take' in t for t in btns) and any('Pass' in t for t in btns), 'dock shows Take and Pass (%s)' % btns)
        check(not errs, 'no page errors in the hedgerow' + ('' if not errs else ': ' + errs[0]))
        pg.close()

        # 4. untimed: a caterpillar waits; the orchard moves only by Stay
        pg, errs = page(b, html, '?dev=1&untimed=1')
        play(pg, 0)
        pg.evaluate("()=>{ const ch = TB.REG.forager; TB.Sim.act(ch, {k: 'take'}); window.__advance(2500); }")
        for k in range(400):
            if pg.evaluate("()=>{ const s = TB.REG.forager.sim.s; return !!s.prey && !s.prey.wait && !s.busy; }"): break
            pg.evaluate("()=>window.__advance(40)")
        id0 = pg.evaluate("()=>TB.REG.forager.sim.s.prey && TB.REG.forager.sim.s.prey.id"); pg.evaluate("()=>window.__advance(4000)")
        id1 = pg.evaluate("()=>TB.REG.forager.sim.s.prey && TB.REG.forager.sim.s.prey.id")
        check(id0 is not None and id0 == id1, 'untimed: a caterpillar stays for 4 s until you decide')
        play(pg, 1)
        pg.evaluate("()=>window.__advance(4000)")
        tt0 = pg.evaluate("()=>TB.REG.forager.sim.s.tt"); pg.evaluate("()=>window.__advance(2000)"); tt1 = pg.evaluate("()=>TB.REG.forager.sim.s.tt")
        pg.keyboard.press(' '); pg.evaluate("()=>window.__advance(100)"); tt2 = pg.evaluate("()=>TB.REG.forager.sim.s.tt")
        check(tt0 == tt1 and tt2 == tt1 + 15, 'untimed orchard: no time passes in a tree until Stay (Space) adds half a second (%s, %s, %s)' % (tt0, tt1, tt2))
        dock = pg.evaluate("()=>[...document.querySelectorAll('#dock button')].map(b => b.textContent)")
        check(any('Stay' in t for t in dock), 'untimed orchard dock offers Stay (%s)' % dock)
        check(not errs, 'no page errors untimed' + ('' if not errs else ': ' + errs[0]))
        pg.close()

        # 5. Calm and teacher load and play a level with the scripted player
        for q in ('?dev=1&calm=1', '?teacher=1&unit=forager&seed=5'):
            pg, errs = page(b, html, q)
            play(pg, 3, 5)
            for k in range(2000):
                done = pg.evaluate("""()=>{ const ch = TB.REG.forager, s = ch.sim.s; if (document.querySelector('#cards.on .card')) return true;
                  const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a) TB.Sim.act(ch, a); window.__advance(60); return false; }""")
                if done: break
            check(done and not errs, 'boss plays to its card with %s' % q + ('' if not errs else ': ' + errs[0]))
            pg.close()

        # 6. What if? from a level card: a lever chip thaws the level, runs it by one rule and earns no stars
        pg, errs = page(b, html, '?dev=1')
        play(pg, 1, 4)
        for k in range(6000):
            done = pg.evaluate("""()=>{ const ch = TB.REG.forager, s = ch.sim.s; if (document.querySelector('#cards.on .card')) return true;
              const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a) TB.Sim.act(ch, a); window.__advance(40); return false; }""")
            if done: break
        pg.evaluate("()=>window.__advance(700)")   # a fresh card arms after 380 ms (ghost-tap guard)
        s2 = pg.evaluate("()=>JSON.stringify(TB.Save.d.lv.forager || [])")
        pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => x.textContent === 'What if?'); b && b.click(); }")
        pg.evaluate("()=>window.__advance(200)")
        chip = pg.evaluate("()=>{ const c = document.querySelector('#cards .chip[data-lever]'); if (!c) return null; const t = c.textContent; c.click(); return t; }")
        check(chip is not None, 'L2 card offers What if? levers (%s)' % chip)
        pg.evaluate("()=>window.__advance(800)")
        check(pg.evaluate("()=>!document.querySelector('#cards.on .card') && TB.REG.forager.sim.s.whatif === 'quick'"), 'the lever restarts the level as a What if? run')
        for k in range(3000):
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
            pg.evaluate("()=>window.__advance(60)")
        body = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card .body'); return c ? c.textContent : ''; }")
        check('far orchard again' in body and 'undefined' not in body and 'NaN' not in body, 'the What if? card reads its own run: ' + body[:90])
        check(pg.evaluate("()=>JSON.stringify(TB.Save.d.lv.forager || [])") == s2, 'a What if? run records no stars')
        check(not errs, 'no page errors in What if?' + ('' if not errs else ': ' + errs[0]))
        pg.close()

        # 7. ?v1=1 keeps the legacy chapter
        pg, errs = page(b, html, '?v1=1')
        st = pg.evaluate("()=>{ const ch = TB.REG.forager; TB.App.open(ch); return {v2: ch.v2 === true, card: !!document.querySelector('#cards.on .card')}; }")
        check(not st['v2'] and st['card'], '?v1=1: the legacy Forager opens with its intro card')
        check(not errs, 'no page errors under ?v1=1' + ('' if not errs else ': ' + errs[0]))
        pg.close()
        b.close()
    print('forager paths: %d failed' % len(fails))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
