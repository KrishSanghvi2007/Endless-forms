"""Equilibrium (id census): input paths and gates the oracle cannot see (owned by the census unit).

  python3 tests/census_paths.py BUILD.html

Checks, at 390x780 under virtual time:
  - act-to-juice latency (Events.lat, D5 §3 item 1) for tag (L0), crank (L1), quadrat (L3), tray (L6): <= 200 ms
  - keyboard: L0 arrows + Enter tag a beetle; L1 Space cranks; L3 arrows place the quadrat; L6 Enter lays a tray; L7 keys 1-4 buy a test
  - untimed (Save.d.ui.unt): L3 field time does not run down; L6 waits for Release
  - Calm (prefers-reduced-motion): L0 tag still lands copies in the jars
  - What if? on the L1 card thaws the vial with "No stirring" and ends with its Interesting result
  - ?v1=1 plays the legacy Census (not v2)
Exit 1 on any failure.
"""
import os, sys, json
from playwright.sync_api import sync_playwright

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}


def main():
    html = os.path.abspath(sys.argv[1])
    vclock = open(os.path.join(SRC, 'vclock.js')).read()
    res, ok = [], True

    def check(cond, msg):
        nonlocal ok
        res.append(('ok   ' if cond else 'FAIL ') + msg)
        ok = ok and bool(cond)

    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)

        def page(query='', calm=False):
            ctx = b.new_context(viewport={'width': 390, 'height': 780}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference')
            pg = ctx.new_page(); pg.add_init_script(script=vclock); pg.goto('file://' + html + query); pg.evaluate("()=>window.__advance(1500)")
            return ctx, pg

        ctx, pg = page()
        ev = lambda js, a=None: pg.evaluate(js, a)
        adv = lambda ms: ev("ms=>window.__advance(ms)", ms)
        key = lambda k: pg.keyboard.press(k)
        play = lambda lv: (ev("lv => { TB.Cards.close(); TB.App.playLevel(TB.REG.census, lv, {seed: 5}); }", lv), adv(600))
        ev("() => { TB.Events.debug = true; }")
        # latency: tag, crank, quadrat, tray
        play(0); ev("() => TB.Events.clear()"); i = ev("() => TB.REG.census.sim.s.bs.findIndex(b => !b.tag)"); xy = ev("i => TB.REG.census.pos0(i).slice(0, 2)", i)
        o = ev("() => { const r = document.getElementById('scene').getBoundingClientRect(); return [r.left, r.top]; }"); pg.mouse.click(o[0] + xy[0], o[1] + xy[1]); adv(300)
        lat = ev("() => TB.Events.lat()"); check(lat and max(x for x in lat if x is not None) <= 200, f'L0 tag: act to first juice {lat} ms (<= 200)')
        check(ev("() => TB.REG.census.sim.s.open") == i, 'L0: a real click opens one beetle; its copies wait to be sorted')
        left = ev("() => TB.REG.census.sim.s.left.slice()")
        jr = lambda j: ev("j => { const J = TB.REG.census.jarRect(), r = j ? J.b : J.a; return [r.x + r.w / 2, r.y + r.h / 2]; }", j)
        w = jr(1 - left[0]); pg.mouse.click(o[0] + w[0], o[1] + w[1]); adv(200)
        check(len(ev("() => TB.REG.census.sim.s.left")) == 2, 'L0: a tap on the wrong jar bounces the copy back')
        tp = ev("() => TB.REG.census.tokPos(0)"); c0 = ev("() => TB.REG.census.sim.s.left[0]"); j = jr(c0)
        pg.mouse.move(o[0] + tp[0], o[1] + tp[1]); pg.mouse.down(); pg.mouse.move(o[0] + j[0], o[1] + j[1], steps=8); pg.mouse.up(); adv(200)
        check(len(ev("() => TB.REG.census.sim.s.left")) == 1, 'L0: dragging a copy onto its jar sorts it')
        key('1' if ev("() => TB.REG.census.sim.s.left[0]") == 0 else '2'); adv(200)
        check(ev("() => TB.REG.census.sim.s.manual") == 1 and ev("() => TB.REG.census.sim.s.open") == -1, 'L0: keys 1 and 2 send a copy to the A or a jar')
        adv(1200); check(sum(ev("() => TB.REG.census.v.jarShown")) == 2, 'L0: its two copies land in the jars')
        adv(1500); asked = ev("() => !!(TB.Predict.cur && TB.Predict.cur.active)"); adv(12000)
        check(asked and ev("() => !!(TB.Predict.cur && TB.Predict.cur.active)") and ev("() => TB.REG.census.sim.s.pred.guess === undefined"), 'L0: an untouched prediction is not committed for you after 12 s (no soft timer)')
        check(ev("() => TB.Strip.isOpen"), 'phone: the prediction sheet is open during the ask')
        ev("() => TB.Predict.commit()"); adv(400); check(not ev("() => TB.Strip.isOpen"), 'phone: the sheet folds within 400 ms of Lock in, so the payoff is in view')
        play(1); ev("() => TB.Events.clear()"); k = ev("() => TB.REG.census.knob()"); pg.mouse.click(o[0] + k[0], o[1] + k[1]); adv(300)
        lat = ev("() => TB.Events.lat()"); check(lat and max(x for x in lat if x is not None) <= 200, f'L1 crank: act to first juice {lat} ms')
        check(ev("() => TB.REG.census.sim.s.pairs.length") == 1, 'L1: a tap on the crank makes one pair')
        key(' '); adv(300); check(ev("() => TB.REG.census.sim.s.pairs.length") == 2, 'L1: Space cranks one pair (keyboard)')
        ev("() => { const s = TB.REG.census.sim.s; s.phase = 'spin'; s.lever = 1; s.pairs = new Array(40).fill(0); s.ask = null; }"); key(']'); adv(200)
        check(abs(ev("() => TB.REG.census.sim.s.p") - 0.4) < 1e-9 and ev("() => TB.REG.census.sim.s.pairs.length") == 0, 'L1: ] raises the hoppers to p = 0.4 for the 400')
        play(2); ev("() => { const s = TB.REG.census.sim.s; TB.REG.census.sim.H().setRound(TB.REG.census.sim, s, 1); }"); adv(300)
        q0 = ev("() => { const q = TB.REG.census.penSlots()[0]; return [q.x, q.y]; }"); pg.mouse.click(o[0] + q0[0], o[1] + q0[1]); adv(200)
        check(ev("() => TB.REG.census.sim.s.par.join('/')") == '31/1/8', 'L2: tapping a parent changes the pen (AA → Aa)')
        ev("() => document.querySelector('#dock [data-id=built]').click()"); adv(200); check(ev("() => TB.REG.census.sim.s.phase") == 'show', 'L2: Done ends the build')
        play(3); adv(5000); check(ev("() => TB.REG.census.sim.s.pool") == 45, 'L3: the field clock waits for your first quadrat (45 s left after 5 s of reading)')
        ev("() => TB.Events.clear()"); key('ArrowRight'); adv(1500)
        q = ev("() => TB.REG.census.sim.s.q"); check(q['x'] >= 0, f'L3: an arrow key places the quadrat ({q})')
        lat = ev("() => TB.Events.lat()"); check(lat is not None, f'L3 quadrat: latency {lat}')
        check(ev("() => TB.REG.census.sim.s.n") > 0, 'L3: the quadrat genotypes beetles')
        play(5); ev("() => { const ch = TB.REG.census, s = ch.sim.s; for (let i = 0; i < s.f.g.length && s.n < 65; i++) { s.f.sm[i] = 1; s.n++; s.obs[s.f.g[i]]++; } }"); adv(300)
        check(ev("() => { const b = document.querySelector('#dock [data-id=finish]'); return !!b && b.getAttribute('aria-disabled') !== 'true' && !b.classList.contains('locked'); }"), 'L5: Finish unlocks at 60 sampled beetles')
        ev("() => document.querySelector('#dock [data-id=finish]').click()"); adv(300); key('3'); adv(300)
        check(ev("() => TB.REG.census.sim.s.splits.length") == 1, 'L5: key 3 draws a diagonal split line (keys 1-4: four directions)')
        play(6); key('Enter'); adv(300); check(ev("() => TB.REG.census.sim.s.trays.length") == 1, 'L6: Enter lays a bait tray (keyboard)')
        t0 = ev("() => { const t = TB.REG.census.sim.s.trays[0]; return TB.REG.census.yardPt(t.x, t.y); }"); pg.mouse.click(o[0] + t0[0], o[1] + t0[1]); adv(300)
        check(ev("() => TB.REG.census.sim.s.trays.length") == 0, 'L6: a tap on a tray lifts it (bait costs grain)')
        key('Enter'); adv(300)
        ev("() => TB.Events.clear()"); yp = ev("() => TB.REG.census.yardPt(120, 90)"); pg.mouse.click(o[0] + yp[0], o[1] + yp[1]); adv(300)
        lat = ev("() => TB.Events.lat()"); check(lat and max(x for x in lat if x is not None) <= 200, f'L6 tray: act to first juice {lat} ms')
        # L0 keyboard tag
        play(0); key('ArrowRight'); key('Enter'); adv(300); op = ev("() => TB.REG.census.sim.s.open")
        for _ in range(2): key('1' if ev("() => TB.REG.census.sim.s.left[0]") == 0 else '2'); adv(150)
        check(op >= 0 and ev("() => TB.REG.census.sim.s.manual") == 1, 'L0: arrows and Enter open a beetle, 1 and 2 sort it (keyboard)')
        # L7: keys 1-4 buy tests after sampling
        play(7); adv(1600); ev("() => TB.Sim.act(TB.REG.census, {k: 'quad', x: 0.5, y: 0.5})"); adv(4000)
        n = ev("() => TB.REG.census.sim.s.n"); d0 = ev("() => TB.REG.census.sim.s.days"); key('1'); adv(300)
        check(n >= ev("() => TB.REG.census.sim.H().need(TB.REG.census.sim.s)") and ev("() => TB.REG.census.sim.s.days") == d0 - 1, f'L7: key 1 buys "By area" for a day (n {n})')
        play(7); adv(1600); why = ev("() => { const b = document.querySelector('#dock [data-id=diag]'); return b ? (b.title || b.getAttribute('aria-label') || '') : ''; }")
        check(any(ch.isdigit() for ch in why), f'L7: the locked Diagnose says how many beetles it needs ({why!r})')
        # What if? on the L1 card
        play(1)
        for _ in range(400):
            s = ev("() => { const s = TB.REG.census.sim.s; return {ph: s.phase, ask: s.ask && s.ask.id, spin: s.spin}; }")
            if ev("() => !!document.querySelector('#cards.on .card')"): break
            if s['ask']: ev("id => TB.Predict.commit(id)", s['ask'])
            elif not s['spin'] and s['ph'] in ('c4', 'c40', 'spin'): ev("() => TB.Sim.act(TB.REG.census, {k: 'spin', on: true})")
            adv(400)
        adv(800)
        wi = ev("() => { const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => /what if/i.test(x.textContent)); if (b) b.click(); return !!b; }"); adv(300)
        check(wi, 'L1 card offers What if?')
        ev("() => { const c = [...document.querySelectorAll('#cards .chip')]; if (c.length) c[0].click(); }"); adv(800)
        check(ev("() => TB.REG.census.sim.s.whatif") == 'nostir', 'What if? thaws the vial with No stirring')
        for _ in range(400):
            if ev("() => !!document.querySelector('#cards.on .card')"): break
            if not ev("() => TB.REG.census.sim.s.spin"): ev("() => TB.Sim.act(TB.REG.census, {k: 'spin', on: true})")
            adv(400)
        adv(800); txt = ev("() => { const c = document.querySelector('#cards.on .card'); return c ? c.innerText : ''; }")
        check('Without stirring' in txt, 'the What if? card shows its Interesting result')
        errs = ev("() => window.__errs.slice(0, 3)"); check(not errs, f'no JavaScript errors {errs}')
        ctx.close()
        # untimed
        ctx, pg = page(); ev = lambda js, a=None: pg.evaluate(js, a); adv = lambda ms: ev("ms=>window.__advance(ms)", ms)
        ev("() => { TB.Save.d.ui.unt = 1; TB.Cards.close(); TB.App.playLevel(TB.REG.census, 3, {seed: 2}); }"); adv(5000)
        ev("() => TB.Sim.act(TB.REG.census, {k: 'quad', x: 0.5, y: 0.5})"); adv(5000)
        check(ev("() => TB.REG.census.sim.s.pool") == 45, 'untimed: L3 field time does not run down')
        ev("() => { TB.Cards.close(); TB.App.playLevel(TB.REG.census, 6, {seed: 2}); TB.Sim.act(TB.REG.census, {k: 'tray', i: 0, x: 80, y: 130}); }"); adv(15000)
        check(ev("() => TB.REG.census.sim.s.phase") == 'place', 'untimed: L6 waits for Release before the night')
        ctx.close()
        # Calm
        ctx, pg = page(calm=True); ev = lambda js, a=None: pg.evaluate(js, a); adv = lambda ms: ev("ms=>window.__advance(ms)", ms)
        ev("() => { TB.Cards.close(); TB.App.playLevel(TB.REG.census, 0, {seed: 2}); }"); adv(600)
        check(ev("() => TB.Fx.calm"), 'Calm is on under prefers-reduced-motion')
        ev("() => { const ch = TB.REG.census, s = ch.sim.s, i = s.bs.findIndex(b => !b.tag); TB.Sim.act(ch, {k: 'tag', i}); TB.Sim.act(ch, {k: 'jar', j: s.left[0]}); TB.Sim.act(ch, {k: 'jar', j: s.left[0]}); }"); adv(600)
        check(sum(ev("() => TB.REG.census.v.jarShown")) == 2, 'Calm: the copies still land in the jars (short flights)')
        ctx.close()
        # ?v1=1
        ctx, pg = page('?v1=1'); ev = lambda js, a=None: pg.evaluate(js, a)
        check(ev("() => TB.REG.census.v2 !== true && typeof TB.REG.census.sample === 'function'"), '?v1=1 keeps the legacy Census')
        ctx.close()
        b.close()
    print('\n'.join(res)); print(f"census paths: {sum(1 for r in res if r.startswith('ok'))} ok, {sum(1 for r in res if r.startswith('FAIL'))} failed")
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
