"""The Raffle (v2): the paths a player, a keyboard user and a teacher take, in a real browser (virtual time).

  GAME_HTML=/abs/build.html python3 tests/raffle_paths.py

Checks: a real pointer hold pours (a quick tap pours exactly one unit; holding longer pours more; letting go closes the drum
after a grace, and pressing again inside it resumes); the dock's Pour is a tap-to-start, tap-to-stop latch; keys (Space as a
true hold, ArrowUp adds a unit, Enter is Done); act-to-juice latency <= 200 ms (Events.lat); the dung pat's hold sets the
mating time; untimed mode logs itself and halves the pour rate, and its asks never time out; a Predict ask needs a move;
What if? thaws the level's start with one change and shows its own text; Calm mode stops the drum spinning; a deep link;
teacher mode; ?v1=1 plays the legacy chapter; the learning layer. Exit 1 on any failure."""
import os, sys
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
HTML = os.environ.get('GAME_HTML')
fails, oks = [], []


def check(cond, msg):
    (oks if cond else fails).append(msg)
    print(('  ok   ' if cond else '  FAIL ') + msg)


def page(b, w=390, h=780, q='', calm=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference')
    pg = ctx.new_page()
    pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + HTML + q); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }")
    pg.evaluate("()=>window.__advance(600)")
    return ctx, pg, errs


def play(pg, lv, seed=7):
    pg.evaluate("([lv, sd])=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.raffle, lv, {seed: sd}); window.__advance(1000); }", [lv, seed])


def S(pg, expr):
    return pg.evaluate("()=>{ const ch = TB.REG.raffle, s = ch.sim.s, F = s.fem[Math.min(s.i, s.fem.length - 1)]; return " + expr + "; }")


def centre(pg):
    return pg.evaluate("()=>{ const r = TB.Stage.cv.getBoundingClientRect(); return [r.left + r.width * 0.5, r.top + r.height * 0.5]; }")


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        ctx, pg, errs = page(b)
        pg.evaluate("()=>{ if (TB.Events) TB.Events.debug = true; }")
        play(pg, 0)
        check(S(pg, "s.phase") == 'pour', 'L1 opens with the first female ready for your pour')
        x, y = centre(pg)
        pg.mouse.move(x, y); pg.mouse.down(); pg.evaluate("()=>window.__advance(80)"); pg.mouse.up(); pg.evaluate("()=>window.__advance(100)")
        check(abs(S(pg, "F.s") - 1) < 1e-9, 'a quick tap pours exactly one unit (the smallest ejaculate)')
        pg.mouse.down(); pg.evaluate("()=>window.__advance(1200)"); pg.mouse.up()
        u = S(pg, "F.s"); check(8 < u < 16, 'holding 1.2 s pours more (%.1f units) and the supply drains (%s left)' % (u, S(pg, "Math.round(s.left)")))
        pg.evaluate("()=>window.__advance(200)"); pg.mouse.down(); pg.evaluate("()=>window.__advance(400)"); pg.mouse.up()
        check(S(pg, "F.s") > u + 1 and S(pg, "s.i") == 0, 'pressing again inside the grace resumes the same pour')
        pg.evaluate("()=>window.__advance(900)")
        check(S(pg, "s.phase") in ('draw', 'leave'), 'letting go closes her drum after the grace, and the eggs draw (%s)' % S(pg, "s.phase"))
        lat = pg.evaluate("()=>TB.Events && TB.Events.lat ? TB.Events.lat().filter(x => x != null) : []")
        check(len(lat) > 0 and max(lat) <= 200, 'act-to-juice latency %s ms (<= 200)' % (max(lat) if lat else None))
        for k in range(300):
            if S(pg, "s.phase") == 'pour': break
            pg.evaluate("()=>window.__advance(100)")
        # the dock latch and keys
        pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"rf-pour\"]'); b && b.click(); window.__advance(800); }")
        check(S(pg, "s.hold") and S(pg, "F.s") > 3, 'the dock\'s Pour starts a pour with a tap (%.1f units)' % S(pg, "F.s"))
        pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"rf-pour\"]'); b && b.click(); window.__advance(60); }")
        check(not S(pg, "s.hold"), 'and a second tap stops it')
        for k in range(300):
            if S(pg, "s.phase") == 'pour': break
            pg.evaluate("()=>window.__advance(100)")
        u0 = S(pg, "F.s"); pg.keyboard.press('ArrowUp'); pg.keyboard.press('ArrowUp'); pg.evaluate("()=>window.__advance(60)")
        check(abs(S(pg, "F.s") - u0 - 2) < 1e-9, 'ArrowUp adds one unit a press')
        pg.keyboard.down(' '); pg.evaluate("()=>window.__advance(700)"); held = S(pg, "s.hold"); pg.keyboard.up(' '); pg.evaluate("()=>window.__advance(60)")
        check(held and not S(pg, "s.hold"), 'Space is a true hold: pouring while down, stopping on release')
        pg.keyboard.press('Enter'); pg.evaluate("()=>window.__advance(60)")
        check(S(pg, "s.phase") in ('draw', 'ask', 'later'), 'Enter is Done: her drum closes at once (%s)' % S(pg, "s.phase"))
        # a call needs a move: tap Lock in on an untouched ghost; then play the level out with the expert
        for k in range(4000):
            st = S(pg, "({ph: s.phase, ask: s.ask && s.ask.id, card: !!document.querySelector('#cards.on .card')})")
            if st['card']: break
            if st['ask']:
                pg.evaluate("()=>{ const b = document.querySelector('#dock [data-id=\"rf-lock\"]'); b && b.click(); window.__advance(200); }")
                check(S(pg, "!!s.ask && s.pred.p1 == null"), 'Lock in on an untouched marker records no call (needMove)')
                pg.evaluate("()=>{ const ch = TB.REG.raffle; TB.Predict.overlay(0); TB.Sim.act(ch, {k: 'predict', id: 'p1', v: ch.sim.expect(ch.sim.s, 'p1')}); window.__advance(300); }")
                continue
            if st['ph'] in ('pour', 'close'): pg.evaluate("()=>{ const ch = TB.REG.raffle, S = ch.sim, a = S.bots.expert(S.s, S.actions()); if (a) TB.Sim.act(ch, a); }")
            pg.evaluate("()=>window.__advance(60)")
        card = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? c.innerText : ''; }")
        check('Level 1 done' in card and 'What if?' in card, 'L1 ends on its level card with What if?')
        # What if?: thaw the level's start with "Males follow"
        pg.evaluate("()=>{ window.__advance(1500); const b = [...document.querySelectorAll('#cards.on .card-btns button')].find(x => x.textContent === 'What if?'); b && b.click(); window.__advance(300); const c = document.querySelector('#cards.on .chip[data-lever=\"later\"]'); c && c.click(); window.__advance(300); }")
        check(S(pg, "s.auto && s.whatif === 'later'"), 'What if? "Males follow" reruns L1 with the best plan pouring')
        for k in range(600):
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
            pg.evaluate("()=>window.__advance(100)")
        txt = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? c.innerText : ''; }")
        v = S(pg, "ch.sim.wiVars(s).v")
        check(('each virgin gets %d units' % v) in txt, 'the What if? card names the run\'s own number (virgins got %s units)' % v)
        check(not errs, 'no page errors on the L1 paths (%s)' % errs[:2])
        ctx.close()

        # ---- the dung pat: the hold is the mating time ----
        ctx, pg, errs = page(b)
        play(pg, 2)
        for k in range(60):
            if S(pg, "s.phase") == 'pour': break
            pg.evaluate("()=>window.__advance(50)")
        x, y = centre(pg); pg.mouse.move(x, y); pg.mouse.down(); pg.evaluate("()=>window.__advance(3250)"); m = S(pg, "s.mins"); pg.mouse.up(); pg.evaluate("()=>window.__advance(400)")
        check(28 < m < 32, 'L3: holding 3.25 s mates for about 30 minutes (%.1f; ×600 time)' % m)
        check(S(pg, "s.fem[0].t > 25 && Math.abs(s.fem[0].x - 0.8934849 * (1 - Math.exp(-0.0627036 * s.fem[0].t))) < 1e-9"), 'her store share follows the displacement curve')
        check(not errs, 'no page errors on the dung pat')
        ctx.close()

        # ---- untimed: logged, slower pours, asks that wait ----
        ctx, pg, errs = page(b, q='?untimed=1')
        play(pg, 0)
        st = S(pg, "({unt: s.unt, log: JSON.stringify(s.log.slice(0, 1))})")
        check(st['unt'] and '"unt"' in st['log'], 'untimed enters the run as a logged action (%s)' % st['log'])
        x, y = centre(pg); pg.mouse.move(x, y); pg.mouse.down(); pg.evaluate("()=>window.__advance(1250)"); pg.mouse.up()
        check(S(pg, "F.s") < 8, 'untimed pours at about half the rate (%.1f units in 1.25 s)' % S(pg, "F.s"))
        for k in range(4000):
            st = S(pg, "({ph: s.phase, ask: s.ask && s.ask.id, card: !!document.querySelector('#cards.on .card')})")
            if st['ask'] or st['card']: break
            if st['ph'] in ('pour', 'close'): pg.evaluate("()=>{ const ch = TB.REG.raffle, S = ch.sim, a = S.bots.expert(S.s, S.actions()); if (a) TB.Sim.act(ch, a); }")
            pg.evaluate("()=>window.__advance(60)")
        pg.evaluate("()=>window.__advance(60000)")
        check(S(pg, "s.ask && s.ask.id") == 'p1', 'untimed: a call waits a full minute with no soft timer')
        ctx.close()

        # ---- Calm, a deep link, teacher mode, the result code row ----
        ctx, pg, errs = page(b, 390, 780, '?unit=raffle&level=1&seed=5', calm=True)
        pg.evaluate("()=>window.__advance(1500)")
        st = pg.evaluate("()=>({lv: TB.REG.raffle.level, calm: !!(TB.Fx && TB.Fx.calm), risky: TB.REG.raffle.sim.s.risky})")
        check(st['lv'] == 1 and st['calm'] and st['risky'] >= 1, 'a deep link opens L2 in Calm mode')
        pg.evaluate("()=>{ const ch = TB.REG.raffle; TB.Sim.act(ch, {k: 'mate'}); window.__advance(2600); }")
        check(pg.evaluate("()=>TB.REG.raffle.v.spinV < 0.01"), 'Calm: the drum does not spin during the draw')
        ctx.close()
        ctx, pg, errs = page(b, 1280, 720, '?teacher=1&unit=raffle&level=3&seed=3')
        pg.evaluate("()=>window.__advance(1500)")
        check(pg.evaluate("()=>TB.REG.raffle.sim.s && TB.REG.raffle.level === 3") and not errs, 'teacher mode opens the boss without errors')
        ctx.close()

        # ---- ?v1=1 keeps the legacy chapter; the learning layer is v2 otherwise ----
        ctx, pg, errs = page(b, 390, 780, '?v1=1')
        st = pg.evaluate("()=>({v2: TB.REG.raffle.v2 === true, legacy: typeof TB.REG.raffle.optimum === 'function'})")
        check(not st['v2'] and st['legacy'], '?v1=1 registers the legacy Raffle')
        ctx.close()
        ctx, pg, errs = page(b)
        st = pg.evaluate("()=>({v2: TB.REG.raffle.v2 === true, plan: TB.REG.raffle.levels.length})")
        check(st['v2'] and st['plan'] == 4, 'the v2 Raffle replaces it with 4 levels')
        ctx.close()
        b.close()
    print('raffle paths: %d ok, %d failed' % (len(oks), len(fails)))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
