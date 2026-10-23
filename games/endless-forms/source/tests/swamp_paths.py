"""Gene Swamping (v2) input paths: real pointer and key events on the canvas and dock, under virtual time.

  GAME_HTML=/abs/build.html python3 tests/swamp_paths.py [--vp 390x780]

Checks: L1 a tap on a crossing mouse strikes it, Space strikes by keyboard, untimed mice wait and the dock offers Let go;
L2 dragging a roost moves it and Measure works; L3 dragging from the harbour lays a route, tap-then-tap lays another, a tap on a
route lifts it; L4 lays ferries between isles by the same drag, tap-tap and keys, three at most; ?v1=1 has no swamp chapter.
Exit 1 on any failed check or page error."""
import os, sys, argparse
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
fails, errs = [], []


def check(ok, msg):
    print(('  ok   ' if ok else '  FAIL ') + msg)
    if not ok: fails.append(msg)


def page(b, html, vp, q=''):
    w, h = [int(x) for x in vp.split('x')]
    pg = b.new_page(viewport={'width': w, 'height': h})
    pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + html + '?dev=1&intro=0' + q); pg.evaluate("()=>window.__advance(600)")
    return pg


def to_page(pg, x, y):
    return pg.evaluate("(p)=>{ const r = TB.Stage.cv.getBoundingClientRect(); return [r.x + p[0] * r.width / TB.Stage.w, r.y + p[1] * r.height / TB.Stage.h]; }", [x, y])


def adv(pg, ms): pg.evaluate("(m)=>window.__advance(m)", ms)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--vp', default='390x780'); a = ap.parse_args()
    html = os.environ.get('GAME_HTML')
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        # L1: tap and Space
        pg = page(b, html, a.vp)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.swamp, 0, {seed: 3}); }"); adv(pg, 300)
        for _ in range(200):
            m = pg.evaluate("()=>{ const ch = TB.REG.swamp, s = ch.sim.s; if (s.phase !== 'hunt' || !s.h || s.h.busy) return null; const o = ch.openMice().filter(q => { const mo = s.h.mice.find(z => z.id === q.id); return mo && mo.u > 0.25 && mo.u < 0.7; }); return o.length ? [o[0].x, o[0].y] : null; }")
            if m: break
            adv(pg, 40)
        check(m is not None, 'L1: a mouse crosses the open rock')
        if m:
            x, y = to_page(pg, m[0], m[1]); pg.mouse.click(x, y); adv(pg, 120)
            st = pg.evaluate("()=>{ const s = TB.REG.swamp.sim.s; return s.h ? s.h.strikes : -1; }")
            check(st == 1, 'L1: a tap on the mouse strikes it (strikes %s)' % st)
        adv(pg, 1200)
        for _ in range(200):
            ok = pg.evaluate("()=>{ const ch = TB.REG.swamp, s = ch.sim.s; return s.phase === 'hunt' && s.h && !s.h.busy && ch.openMice().length > 0; }")
            if ok: break
            adv(pg, 40)
        s0 = pg.evaluate("()=>TB.REG.swamp.sim.s.h ? TB.REG.swamp.sim.s.h.strikes : 0")
        pg.keyboard.press(' '); adv(pg, 120)
        s1 = pg.evaluate("()=>TB.REG.swamp.sim.s.h ? TB.REG.swamp.sim.s.h.strikes : 0")
        check(s1 == s0 + 1, 'L1: Space strikes by keyboard (%s → %s)' % (s0, s1))
        pg.close()
        # L1 untimed: mice wait in the open; Let go in the dock
        pg = page(b, html, a.vp, '&untimed=1')
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.swamp, 0, {seed: 3}); }"); adv(pg, 4000)
        st = pg.evaluate("()=>{ const s = TB.REG.swamp.sim.s; return {unt: s.unt, open: s.h ? s.h.mice.length : -1, u: s.h && s.h.mice[0] ? s.h.mice[0].u : null, dock: [...document.querySelectorAll('#dock button')].map(b => b.textContent)}; }")
        check(st['unt'] and st['open'] == 1 and st['u'] is not None and abs(st['u'] - 0.5) < 0.05, 'L1 untimed: a mouse waits mid-crossing (%s)' % st)
        check(any('Let go' in t for t in st['dock']), 'L1 untimed: the dock offers Let go (%s)' % st['dock'])
        pg.click('#dock button:has-text("Let go")'); adv(pg, 1500)
        st2 = pg.evaluate("()=>{ const s = TB.REG.swamp.sim.s; return s.h ? s.h.n : -1; }")
        check(st2 >= 2, 'L1 untimed: Let go sends it on and the next mouse comes (%s emerged)' % st2)
        pg.close()
        # L2: drag a roost, Measure
        pg = page(b, html, a.vp)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.swamp, 1, {seed: 3}); }"); adv(pg, 1500)
        P = pg.evaluate("()=>{ const ch = TB.REG.swamp, P = ch.pos(), s = ch.sim.s; return [P.X(s.roosts[0]), P.postY, P.X(22)]; }")
        x0, y0 = to_page(pg, P[0], P[1]); x1, _ = to_page(pg, P[2], P[1])
        pg.mouse.move(x0, y0); pg.mouse.down(); pg.mouse.move(x1, y0, steps=8); pg.mouse.up(); adv(pg, 200)
        r0 = pg.evaluate("()=>TB.REG.swamp.sim.s.roosts[0]")
        check(abs(r0 - 22) < 1.5, 'L2: dragging a roost moves it (%s km)' % r0)
        for i, k in enumerate([26, 34, 39]):
            P = pg.evaluate("(i)=>{ const ch = TB.REG.swamp, P = ch.pos(), s = ch.sim.s; return [P.X(s.roosts[i]), P.postY]; }", i + 1)
            xx, yy = to_page(pg, P[0], P[1]); tx, _ = to_page(pg, pg.evaluate("(k)=>TB.REG.swamp.pos().X(k)", k), P[1])
            pg.mouse.move(xx, yy); pg.mouse.down(); pg.mouse.move(tx, yy, steps=6); pg.mouse.up(); adv(pg, 150)
        adv(pg, 1500); pg.click('#dock button:has-text("Measure")'); adv(pg, 300)
        ph = pg.evaluate("()=>TB.REG.swamp.sim.s.phase")
        check(ph == 'measured', 'L2: Measure clamps the caliper (%s)' % ph)
        pg.close()
        # L3: routes by drag, tap-tap and lift
        pg = page(b, html, a.vp)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.swamp, 2, {seed: 3}); }"); adv(pg, 1800)
        pg.evaluate("()=>{ const ch = TB.REG.swamp, s = ch.sim.s; if (s.ask) TB.Sim.act(ch, {k: 'predict', id: s.ask.id, v: 0.6}); }")
        for _ in range(400):
            if pg.evaluate("()=>TB.REG.swamp.sim.s.phase === 'lay'"): break
            adv(pg, 80)
        adv(pg, 1200)
        n = lambda i: pg.evaluate("(i)=>TB.REG.swamp.pos().node(i)", i)
        a0, b0 = to_page(pg, *n(-1)), to_page(pg, *n(4))
        pg.mouse.move(*a0); pg.mouse.down(); pg.mouse.move(*b0, steps=10); pg.mouse.up(); adv(pg, 150)
        r = pg.evaluate("()=>TB.REG.swamp.sim.s.routes")
        check(r == [[-1, 4]], 'L3: a drag from the harbour lays a route (%s)' % r)
        pg.mouse.click(*to_page(pg, *n(0))); adv(pg, 100); pg.mouse.click(*to_page(pg, *n(2))); adv(pg, 150)
        r = pg.evaluate("()=>TB.REG.swamp.sim.s.routes")
        check(len(r) == 2 and [0, 2] in r, 'L3: tap one isle, then another, lays a route (%s)' % r)
        A, B = n(0), n(2); pg.mouse.click(*to_page(pg, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2)); adv(pg, 150)
        r = pg.evaluate("()=>TB.REG.swamp.sim.s.routes")
        check(r == [[-1, 4]], 'L3: a tap on a route lifts it (%s)' % r)
        pg.close()
        # L4: the L3 verb again: drag a route between isles, tap-tap, the three-ferry budget, lift by tap
        pg = page(b, html, a.vp)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.swamp, 3, {seed: 3}); }"); adv(pg, 1500)
        n = lambda i: pg.evaluate("(i)=>TB.REG.swamp.pos().node(i)", i)
        a0, b0 = to_page(pg, *n(0)), to_page(pg, *n(1))
        pg.mouse.move(*a0); pg.mouse.down(); pg.mouse.move(*b0, steps=10); pg.mouse.up(); adv(pg, 150)
        r = pg.evaluate("()=>TB.REG.swamp.sim.s.routes")
        check(r == [[0, 1]], 'L4: a drag from Lava 1 to Lava 2 lays a ferry (%s)' % r)
        pg.mouse.click(*to_page(pg, *n(3))); adv(pg, 100); pg.mouse.click(*to_page(pg, *n(4))); adv(pg, 150)
        pg.keyboard.press('3'); adv(pg, 80); pg.keyboard.press('4'); adv(pg, 150)
        r = pg.evaluate("()=>TB.REG.swamp.sim.s.routes")
        check(len(r) == 3 and [3, 4] in r and [2, 3] in r, 'L4: tap-tap and keys 3 then 4 lay ferries (%s)' % r)
        pg.keyboard.press('1'); adv(pg, 80); pg.keyboard.press('5'); adv(pg, 150)
        r = pg.evaluate("()=>TB.REG.swamp.sim.s.routes")
        check(len(r) == 3, 'L4: a fourth ferry is refused (%s)' % r)
        dock = pg.evaluate("()=>[...document.querySelectorAll('#dock button')].map(b => b.textContent)")
        check(dock == ['Sail'] or (len(dock) == 1 and 'Sail' in dock[0]), 'L4: the dock holds only Sail (%s)' % dock)
        pg.close()
        # ?v1=1: the classic game has no swamp chapter
        pg = page(b, html, a.vp, '&v1=1')
        v1 = pg.evaluate("()=>!!(TB.REG.swamp && TB.REG.swamp.v2)")
        check(not v1, '?v1=1: no v2 swamp chapter')
        pg.close()
        b.close()
    for e in errs[:10]: print('ERROR', e)
    print('swamp_paths: %d failed, %d page errors' % (len(fails), len(errs)))
    sys.exit(1 if fails or errs else 0)


if __name__ == '__main__':
    main()
