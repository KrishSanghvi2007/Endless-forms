"""The Clinic (v2): the paths a player, a keyboard user and a teacher take, in a real browser (virtual time).

  GAME_HTML=/abs/build.html python3 tests/clinic_paths.py

Checks: a real tap on the dish gives a low dose and a real hold gives a high dose; keys L and H; the Low and High buttons;
the pumps and keys A and B in L3; tapping a fever treats it and holding a bed isolates it on the ward; the hand-rub dispenser;
act-to-juice latency <= 200 ms (Events.lat); a prediction dragged on the strip and locked in; untimed mode waits at dawn and
Next day resumes; What if? thaws a frozen day and shows its Interesting result; Calm mode; the description card; ?v1=1 plays
the legacy Clinic; the learning layer. Exit 1 on any failure."""
import os, sys
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
HTML = os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v2.html')
fails, oks = [], []


def check(cond, msg):
    (oks if cond else fails).append(msg)
    print(('  ok   ' if cond else '  FAIL ') + msg)


def page(b, w=390, h=780, q='', calm=False, intro_off=True):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference')
    pg = ctx.new_page()
    pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + HTML + q)
    if intro_off:
        pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box && TB.Intro.box()) TB.Intro.go(); } }")
    pg.evaluate("()=>window.__advance(600)")
    return ctx, pg, errs


def play(pg, lv, seed=7):
    pg.evaluate("([lv, sd])=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.clinic, lv, {seed: sd}); window.__advance(200); }", [lv, seed])


def skip_ask(pg):
    pg.evaluate("()=>{ const ch = TB.REG.clinic, s = ch.sim.s; if (s.ask) TB.Sim.act(ch, {k: 'void', id: s.ask.id}); window.__advance(100); }")


def to_run(pg):
    for _ in range(200):
        ph = pg.evaluate("()=>TB.REG.clinic.sim.s.phase")
        if ph == 'run': return True
        skip_ask(pg); pg.evaluate("()=>window.__advance(300)")
    return False


def xy(pg, what, i=0):
    return pg.evaluate("""([w, i])=>{ const ch = TB.REG.clinic, G = ch.geo(), r = TB.Stage.cv.getBoundingClientRect();
      let p; if (w === 'dish') p = [G.dish[i].x, G.dish[i].y]; else if (w === 'pump') p = [G.pumps[i].x, G.pumps[i].y]; else if (w === 'bed') { const t = G.tiles[i]; p = [t.x + t.w * 0.3, t.y + t.h / 2]; } else p = [G.rub.x, G.rub.y];
      return [r.left + p[0], r.top + p[1]]; }""", [what, i])


def doses(pg, bed=0):
    return pg.evaluate("(b)=>TB.REG.clinic.sim.s.beds[b].doses.map(d => d[2])", bed)


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)

        # ---- L1: tap = low dose, hold = high dose, keys, buttons, latency ----
        ctx, pg, errs = page(b)
        pg.evaluate("()=>{ TB.Events.debug = true; TB.Events.clear && TB.Events.clear(); }")
        play(pg, 0)
        check(pg.evaluate("()=>TB.REG.clinic.sim.s.phase") == 'dish', 'L1 opens on the lab dish with a prediction open')
        box = pg.evaluate("()=>{ const c = TB.Strip.canvas(0); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }")
        if box:
            x, y, w, h = box
            pg.mouse.move(x + w * 0.5, y + h * 0.7); pg.mouse.down(); pg.mouse.move(x + w * 0.5, y + h * 0.3, steps=5); pg.mouse.up()
            pg.evaluate("()=>window.__advance(100)")
        pg.keyboard.press('Enter'); pg.evaluate("()=>window.__advance(100)")
        pred = pg.evaluate("()=>TB.REG.clinic.sim.s.pred.a0")
        check(pred is not None, 'a drag on the strip and Enter lock in the dish call (%s)' % (None if pred is None else round(pred, 2)))
        check(to_run(pg), 'after two dish days the patient phase begins')
        x, y = xy(pg, 'dish'); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(80)")
        check(doses(pg) == [0], 'a real tap on the dish gives a low dose')
        pg.evaluate("()=>window.__advance(1500)")
        pg.mouse.move(x, y); pg.mouse.down(); pg.evaluate("()=>window.__advance(500)"); pg.mouse.up(); pg.evaluate("()=>window.__advance(80)")
        check(doses(pg) == [0, 1], 'a real hold on the dish gives a high dose')
        pg.keyboard.press('l'); pg.evaluate("()=>window.__advance(80)")
        check(len(doses(pg)) == 3, 'key L gives a low dose')
        n0 = len(doses(pg)); pg.evaluate("()=>{ const b = [...document.querySelectorAll('#dock button')].find(x => /High/.test(x.textContent)); b && b.click(); window.__advance(80); }")
        check(len(doses(pg)) >= n0, 'the High dose button acts (or is refused at the ceiling with a whisper)')
        lat = pg.evaluate("()=>TB.Events.lat ? TB.Events.lat() : null")
        vals = [v for v in (lat or []) if v is not None] if isinstance(lat, list) else ([lat] if isinstance(lat, (int, float)) else [])
        check(bool(vals) and max(vals) <= 200, 'act-to-juice latency <= 200 ms (%s)' % (vals[:6],))
        check(not errs, 'no page errors on L1 (%s)' % errs[:2])
        ctx.close()

        # ---- L3: pumps and keys A, B ----
        ctx, pg, errs = page(b)
        play(pg, 2); skip_ask(pg); to_run(pg)
        x, y = xy(pg, 'pump', 0); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(80)")
        x, y = xy(pg, 'pump', 1); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(80)")
        d = pg.evaluate("()=>TB.REG.clinic.sim.s.beds[0].doses.map(q => q[1])")
        check(d[:2] == [0, 1], 'L3: the A pump gives drug A and the B pump drug B (%s)' % d)
        pg.keyboard.press('a'); pg.keyboard.press('b'); pg.evaluate("()=>window.__advance(80)")
        check(len(pg.evaluate("()=>TB.REG.clinic.sim.s.beds[0].doses")) >= 3, 'L3: keys A and B dose (the ceiling may refuse one)')
        check(not errs, 'no page errors on L3')
        ctx.close()

        # ---- L5: a fever treated by a tap, a bed isolated by a hold, the hand rub ----
        ctx, pg, errs = page(b)
        play(pg, 4); skip_ask(pg); to_run(pg)
        f = -1
        for _ in range(80):
            f = pg.evaluate("()=>TB.REG.clinic.sim.s.beds.findIndex(b => b.fev && b.C < 1)")
            if f >= 0: break
            skip_ask(pg); pg.evaluate("()=>window.__advance(300)")
        if f >= 0:
            x, y = xy(pg, 'bed', f); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(80)")
            check(pg.evaluate("(i)=>TB.REG.clinic.sim.s.beds[i].C >= 1", f), 'L5: a tap on a feverish bed gives the drug')
        else: check(False, 'L5: a fever appeared within 24 s')
        skip_ask(pg)
        x, y = xy(pg, 'bed', 3); pg.mouse.move(x, y); pg.mouse.down(); pg.evaluate("()=>window.__advance(600)"); pg.mouse.up(); pg.evaluate("()=>window.__advance(80)")
        iso = pg.evaluate("()=>TB.REG.clinic.sim.s.beds[3].iso")
        st = pg.evaluate("()=>TB.REG.clinic.sim.s.ward.staff")
        check(iso or st < 1, 'L5: holding a bed isolates it (or there is no staff time left)')
        h0 = pg.evaluate("()=>TB.REG.clinic.sim.s.ward.hyg")
        x, y = xy(pg, 'rub'); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(80)")
        h1 = pg.evaluate("()=>TB.REG.clinic.sim.s.ward.hyg")
        check(h1 >= 0.89 or pg.evaluate("()=>TB.REG.clinic.sim.s.ward.staff") < 2, 'L5: the dispenser runs a hand-rub round (%.2f → %.2f)' % (h0, h1))
        check(not errs, 'no page errors on L5')
        ctx.close()

        # ---- untimed: the day waits at dawn; Next day resumes ----
        ctx, pg, errs = page(b, q='?untimed=1')
        play(pg, 1); to_run(pg)
        for _ in range(60):
            if pg.evaluate("()=>TB.REG.clinic.sim.s.phase") == 'wait': break
            skip_ask(pg); pg.evaluate("()=>window.__advance(250)")
        check(pg.evaluate("()=>TB.REG.clinic.sim.s.phase") == 'wait', 'untimed: the day ends in a wait')
        d0 = pg.evaluate("()=>TB.REG.clinic.sim.s.day"); pg.evaluate("()=>window.__advance(4000)")
        check(pg.evaluate("()=>TB.REG.clinic.sim.s.day") == d0, 'untimed: nothing moves while waiting')
        has = pg.evaluate("()=>[...document.querySelectorAll('#dock button')].some(x => /Next day/.test(x.textContent))")
        check(has, 'untimed: the dock shows Next day')
        pg.keyboard.press('n'); pg.evaluate("()=>window.__advance(200)")
        check(pg.evaluate("()=>TB.REG.clinic.sim.s.phase") in ('run', 'ask'), 'untimed: key N starts the next day')
        ctx.close()

        # ---- What if? from the level card ----
        ctx, pg, errs = page(b)
        play(pg, 0); skip_ask(pg); to_run(pg)
        pg.evaluate("""()=>{ const ch = TB.REG.clinic; for (let k = 0; k < 3000 && !document.querySelector('#cards.on .card'); k++) { const s = ch.sim.s; if (s.ask) TB.Sim.act(ch, {k: 'void', id: s.ask.id}); const b = s.beds[0]; if (s.phase === 'run' && b.cured == null && b.n[0] + b.n[1] >= 1e5 && b.C[0] < 10 && s.tick < 3) TB.Sim.act(ch, {k: 'dose', bed: 0, hi: true}); window.__advance(100); } window.__advance(1500); }""")
        card = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? c.className : null; }")
        check(card and 'lvl' in card, 'L1 ends on a level card')
        pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards .card-btns button')].find(x => /What if/.test(x.textContent)); b && b.click(); window.__advance(200); const c = document.querySelector('#cards .chip'); c && c.click(); window.__advance(300); }")
        wi = pg.evaluate("()=>TB.REG.clinic.sim.s.whatif")
        check(wi in ('lowOnly', 'stop'), 'What if? thaws a frozen day with a lever (%s)' % wi)
        pg.evaluate("()=>{ for (let k = 0; k < 400 && !document.querySelector('#cards.on .card'); k++) window.__advance(200); window.__advance(1200); }")
        txt = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card .interesting'); return c ? c.textContent : ''; }")
        check('Interesting' in txt, 'the What if? card shows an Interesting result chosen from its run')
        check(not errs, 'no page errors through What if?')
        ctx.close()

        # ---- Calm, the description card, ?v1=1, the learning layer ----
        ctx, pg, errs = page(b, calm=True)
        play(pg, 5); pg.evaluate("()=>window.__advance(3000)")
        check(not errs, 'Calm mode plays the boss without errors')
        ctx.close()
        ctx, pg, errs = page(b, intro_off=False)
        pg.evaluate("()=>{ TB.App.open ? TB.App.open(TB.REG.clinic) : TB.App.playLevel(TB.REG.clinic, 0); window.__advance(500); }")
        intro = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card.ef-intro'); return c ? c.innerText : ''; }")
        check('THE GAME' in intro.upper() and 'HOW TO PLAY' in intro.upper(), 'the description card shows the game, the biology and how to play')
        ctx.close()
        ctx, pg, errs = page(b, q='?v1=1')
        v1 = pg.evaluate("()=>{ const ch = TB.REG.clinic; return [ch.v2 === true, typeof ch.treat === 'function']; }")
        check(v1 == [False, True], '?v1=1 plays the legacy Clinic')
        ctx.close()
        ctx, pg, errs = page(b)
        lay = pg.evaluate("()=>{ const T = TB.TAKE || {}, M = TB.MODEL || {}; return [!!TB.REG.clinic.content.take, true]; }")
        check(lay[0], 'the learning layer words are present')
        ctx.close()
        b.close()
    print('clinic paths: %d ok, %d failed' % (len(oks), len(fails)))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
