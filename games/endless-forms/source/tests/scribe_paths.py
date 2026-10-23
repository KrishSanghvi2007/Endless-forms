"""The Scribe (v2): real-input paths. Taps on sparks, tubes, plates and colonies, a velvet drag, keys, untimed, What if?,
teacher mode, the opening card and ?v1=1. Also act-to-juice latency (Events.lat, D5 §3 line 1).

  GAME_HTML=/abs/build.html python3 tests/scribe_paths.py [--vp 390x780]

Prints one line per check; exit 1 on a failed check or a page error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
fails, errs = [], []


def check(ok, msg):
    print(('  ok   ' if ok else '  FAIL ') + msg)
    if not ok: fails.append(msg)


def page(b, html, q, w, h):
    pg = b.new_page(viewport={'width': w, 'height': h})
    pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + html + q)
    pg.evaluate("()=>window.__advance(800)")
    return pg


def adv(pg, ms): pg.evaluate("(m)=>window.__advance(m)", ms)


def stage_xy(pg, x, y):
    r = pg.evaluate("()=>{ const r = TB.Stage.cv.getBoundingClientRect(); return [r.left, r.top, r.width / TB.Stage.w]; }")
    return r[0] + x * r[2], r[1] + y * r[2]


def tap(pg, x, y):
    X, Y = stage_xy(pg, x, y); pg.mouse.click(X, Y)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--vp', default='390x780'); a = ap.parse_args()
    html = os.environ.get('GAME_HTML'); w, h = [int(x) for x in a.vp.split('x')]
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        # 1. opening card from a seed link, then a real tap on the first spark
        pg = page(b, html, '?unit=scribe&seed=3', w, h)
        check(pg.evaluate("()=>!!document.querySelector('#cards.on .card [data-play]')"), 'a ?unit= link opens on the description card')
        pg.evaluate("()=>{ TB.Events.debug = true; document.querySelector('#cards.on .card [data-play]').click(); }"); adv(pg, 1200)
        xy = pg.evaluate("()=>TB.REG.scribe.sparkXY()")
        check(xy is not None, 'the first spark is waiting')
        if xy: tap(pg, xy[0], xy[1]); adv(pg, 200)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.tags") == 1, 'a real tap on the spark tags it')
        for _ in range(60):
            adv(pg, 100)
            if pg.evaluate("()=>TB.REG.scribe.sim.s.sp.some(p => !p.tag && !p.gone)"): break
        pg.keyboard.press(' '); adv(pg, 100)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.tags") == 2 or pg.evaluate("()=>!!TB.REG.scribe.sim.s.ask"), 'Space tags the newest spark')
        lat = pg.evaluate("()=>{ const l = TB.Events.lat(); return Array.isArray(l) ? l.filter(x => x != null) : l; }")
        mx = max(lat) if isinstance(lat, list) and lat else (lat if isinstance(lat, (int, float)) else None)
        check(mx is not None and mx <= 200, 'act-to-juice latency %s ms (≤ 200)' % mx)
        pg.close()
        # 2. Jackpots: the one prediction, then tap a tube, Space for the next; all poured ends on the spread key number
        pg = page(b, html, '?dev=1&intro=0', w, h)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.scribe, 1, {seed: 4}); window.__advance(3400); }")
        check(pg.evaluate("()=>{ const s = TB.REG.scribe.sim.s; return !!(s.ask && s.ask.id === 'z1'); }"), 'after the tubes grow, the one prediction opens: how many plates stay empty')
        pg.evaluate("()=>{ const ch = TB.REG.scribe, s = ch.sim.s; if (s.ask) TB.Sim.act(ch, {k: 'predict', id: s.ask.id, v: 6}); window.__advance(1600); }")
        c0 = pg.evaluate("()=>{ const c = TB.REG.scribe.pos().cells[0]; return [c.x, c.y]; }")
        tap(pg, c0[0], c0[1]); adv(pg, 200)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.n[0]") >= 0, 'a real tap on a tube plates it')
        pg.keyboard.press(' '); adv(pg, 200)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.plated") == 2, 'Space plates the next tube')
        for _ in range(18): pg.keyboard.press(' '); adv(pg, 120)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.phase") in ('end', 'over'), 'all 20 plated: no flagging step, the level winds up')
        hud = pg.evaluate("()=>{ const h = document.getElementById('hud'); return h ? h.textContent : ''; }")
        check('the mean' in hud, 'the HUD shows the spread key number (%s)' % hud[:80])
        pg.close()
        # 3. Velvet: a real drag from the master onto drug A, a tap on drug B, a tap on a colony
        pg = page(b, html, '?dev=1&intro=0', w, h)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.scribe, 2, {seed: 5}); window.__advance(1500); }")
        P = pg.evaluate("()=>{ const P = TB.REG.scribe.pos(); return [P.mx, P.my, P.ax, P.ay, P.bx, P.by]; }")
        X0, Y0 = stage_xy(pg, P[0], P[1]); X1, Y1 = stage_xy(pg, P[2], P[3])
        pg.mouse.move(X0, Y0); pg.mouse.down(); pg.mouse.move((X0 + X1) / 2, (Y0 + Y1) / 2, steps=5); pg.mouse.move(X1, Y1, steps=5); pg.mouse.up(); adv(pg, 1100)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.st") == 1, 'dragging the velvet from master to drug A stamps it')
        tap(pg, P[4], P[5]); adv(pg, 1100)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.phase") == 'pick', 'a tap on drug B stamps it; picking opens')
        q = pg.evaluate("()=>{ const ch = TB.REG.scribe, s = ch.sim.s, P = ch.pos(), i = s.m1.findIndex(q => q.res), q = s.m1[i]; return [P.mx + q.x * P.mr * 0.92, P.my + q.y * P.mr * 0.92]; }")
        tap(pg, q[0], q[1]); adv(pg, 300)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.m2res") == 1, 'a real tap picks the matching colony')
        pg.close()
        # 4. untimed: a spark waits; a tap on the agar lets it go
        pg = page(b, html, '?dev=1&intro=0&untimed=1', w, h)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.scribe, 0, {seed: 6}); window.__advance(1200); const ch = TB.REG.scribe; TB.Sim.act(ch, {k: 'tag'}); window.__advance(400); }")
        for _ in range(100):
            adv(pg, 100)
            if pg.evaluate("()=>TB.REG.scribe.sim.s.sp.some(p => !p.tag && !p.gone)"): break
        adv(pg, 4000)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.unt && TB.REG.scribe.sim.s.sp.some(p => !p.tag && !p.gone)"), 'untimed: a spark still waits after 4 s')
        cx = pg.evaluate("()=>{ const P = TB.REG.scribe.pos(), s = TB.REG.scribe.sim.s, p = s.sp.find(p => !p.tag && !p.gone); return [P.cx - P.R * 0.94 * p.r0 * Math.cos(p.th) * 0.0 + (p.th > 0 && p.th < 3.14 ? 0 : 0), P.cy - P.R * 0.05]; }")
        tap(pg, cx[0], cx[1] - pg.evaluate("()=>TB.REG.scribe.pos().R") * 0.9); adv(pg, 200)
        check(not pg.evaluate("()=>TB.REG.scribe.sim.s.sp.some(p => !p.tag && !p.gone)") or pg.evaluate("()=>!!TB.REG.scribe.sim.s.ask"), 'untimed: a tap off the spark lets it go')
        pg.close()
        # 5. What if? from a level card replays by itself and ends on a card that earns nothing
        pg = page(b, html, '?dev=1&intro=0', w, h)
        pg.evaluate("""()=>{ const ch = TB.REG.scribe; TB.App.playLevel(ch, 2, {seed: 8}); for (let k = 0; k < 400; k++) { const s = ch.sim.s; if (document.querySelector('#cards.on .card')) break;
          const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a) TB.Sim.act(ch, a); window.__advance(80); } }""")
        check(pg.evaluate("()=>!!document.querySelector('#cards.on .card.lvl')"), 'L3 ends on a level card')
        pg.wait_for_timeout(900); adv(pg, 900)   # the card arms its buttons after a short real-time delay
        pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on .card button')].find(x => /What if/.test(x.textContent)); if (b) b.click(); }"); adv(pg, 200)
        pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card [data-lever]'); if (c) c.click(); }"); adv(pg, 400)
        check(pg.evaluate("()=>TB.REG.scribe.sim.s.whatif") == 'inducedD', 'the What if? chip thaws the level with its lever')
        for _ in range(80):
            adv(pg, 100)
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
        check(pg.evaluate("()=>!!document.querySelector('#cards.on .card') && /random spots/.test(document.querySelector('#cards.on .card').textContent)"), 'the What if? card reports its own run')
        pg.close()
        # 6. teacher mode loads; ?v1=1 plays the legacy chapter
        pg = page(b, html, '?unit=scribe&seed=2&teacher=1&intro=0', w, h); adv(pg, 1500)
        check(pg.evaluate("()=>TB.App.ch && TB.App.ch.id === 'scribe'"), 'teacher mode opens the unit')
        pg.close()
        pg = page(b, html, '?v1=1', w, h)
        check(pg.evaluate("()=>TB.REG.scribe && TB.REG.scribe.v2 !== true && typeof TB.REG.scribe.newRound === 'function'"), '?v1=1 keeps the legacy Scribe')
        pg.close()
        b.close()
    for e in errs[:10]: print('ERROR', e)
    print('paths: %d failed, %d page errors' % (len(fails), len(errs)))
    sys.exit(1 if fails or errs else 0)


if __name__ == '__main__':
    main()
