"""Why Sex? (v2): the paths a player, a keyboard user and a teacher take, in a real browser (virtual time).

  GAME_HTML=/abs/build.html python3 tests/sex_paths.py

Checks: L1 opens on the verb and the one call follows the first breed; it needs a move (Lock in on an untouched marker records nothing) and its strip folds on commit; a real tap on
the lakebed drops a clutch where you tapped, infecting only matching snails inside the radius; press, slide and lift drops at
the lift point; act-to-juice latency <= 200 ms (Events.lat); the season clock lets leftover clutches sink; keys (arrows move the
aim ring, N jumps to a matching snail, Space drops); a tap during the breed hurries it; L3 refuses eggs in deep water; untimed
mode logs itself and stops the clock; What if? thaws the level's start with one change and shows its own text; Calm; a deep
link; teacher mode; ?v1=1 plays the legacy chapter; the learning layer. Exit 1 on any failure."""
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
    pg.evaluate("([lv, sd])=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.sex, lv, {seed: sd}); window.__advance(900); }", [lv, seed])


def S(pg, expr):
    return pg.evaluate("()=>{ const ch = TB.REG.sex, s = ch.sim.s; return " + expr + "; }")


def px(pg, u, v):   # lake units → page px
    return pg.evaluate("([u, v])=>{ const ch = TB.REG.sex, p = ch.toPx(u, v), r = TB.Stage.cv.getBoundingClientRect(); return [r.left + p[0], r.top + p[1]]; }", [u, v])


def wait(pg, cond, n=600, step=50):
    for k in range(n):
        if S(pg, cond): return True
        pg.evaluate("(st)=>window.__advance(st)", step)
    return False


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        ctx, pg, errs = page(b)
        pg.evaluate("()=>{ if (TB.Events) TB.Events.debug = true; }")
        play(pg, 0)
        check(S(pg, "s.phase") == 'season' and S(pg, "s.gen") == 0 and not S(pg, "s.ask"), 'L1 opens on the verb: the first season, no call yet (D6 decision 9)')
        # a real tap: drops a clutch at the tap, infecting only matching snails in the radius
        tgt = S(pg, "(()=>{ const b = ch.sim.best(s); return {x: b[0], y: b[1], key: ch.sim.key(s)}; })()")
        x, y = px(pg, tgt['x'], tgt['y'])
        before = S(pg, "s.patch.map(a => a.inf)")
        pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(60)")
        st = S(pg, "({ki: s.ki, last: s.log[s.log.length - 1][1], pat: s.patch.map(a => ({inf: a.inf, lk: a.lk, x: a.x, y: a.y}))})")
        d = st['last']
        check(st['ki'] == 1 and d['k'] == 'drop' and abs(d['x'] - tgt['x']) < 1 and abs(d['y'] - tgt['y']) < 1, 'a tap drops one clutch where you tapped (%.1f, %.1f)' % (d['x'], d['y']))
        R = S(pg, "s.rad")
        newly = [a for a, b0 in zip(st['pat'], before) if a['inf'] and not b0]
        check(len(newly) > 0 and all(a['lk'] == tgt['key'] and (a['x'] - d['x']) ** 2 + (a['y'] - d['y']) ** 2 <= R * R for a in newly), 'it infected %d snails, every one of the matching lock and inside the radius' % len(newly))
        lat = pg.evaluate("()=>TB.Events && TB.Events.lat ? TB.Events.lat().filter(x => x != null) : []")
        check(len(lat) > 0 and max(lat) <= 200, 'act-to-juice latency %s ms (<= 200)' % (max(lat) if lat else None))
        # press, slide, lift
        a0 = px(pg, 20, 30); a1 = px(pg, 70, 75)
        pg.mouse.move(a0[0], a0[1]); pg.mouse.down(); pg.evaluate("()=>window.__advance(80)"); pg.mouse.move(a1[0], a1[1], steps=6); pg.evaluate("()=>window.__advance(80)")
        aim = S(pg, "ch.v.aim"); pg.mouse.up(); pg.evaluate("()=>window.__advance(60)")
        d = S(pg, "s.log[s.log.length - 1][1]")
        check(aim is not None and S(pg, "s.ki") == 2 and abs(d['x'] - 70) < 1.5 and abs(d['y'] - 75) < 1.5, 'press, slide and lift drops at the lift point (%.1f, %.1f), with the aim ring shown meanwhile' % (d['x'], d['y']))
        # keys: arrows move the aim ring, N jumps to a match, Space drops
        c0 = S(pg, "ch.v.cur.slice()"); pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowDown')
        c1 = S(pg, "ch.v.cur.slice()")
        check(abs(c1[0] - c0[0] - 6) < 1e-9 and abs(c1[1] - c0[1] - 6) < 1e-9, 'arrow keys move the aim ring by 6 lake units')
        pg.keyboard.press('n'); cn = S(pg, "ch.v.cur.slice()"); m = S(pg, "s.patch.some(a => !a.inf && a.lk === ch.sim.key(s) && Math.abs(a.x - ch.v.cur[0]) < 1e-9 && Math.abs(a.y - ch.v.cur[1]) < 1e-9)")
        check(m, 'N jumps the aim ring onto a snail the current eggs fit')
        k0 = S(pg, "s.ki"); pg.keyboard.press(' '); pg.evaluate("()=>window.__advance(60)")
        check(S(pg, "s.ki") == k0 + 1 or S(pg, "s.phase") == 'gap', 'Space drops a clutch at the aim ring')
        # the clock: leftover clutches sink when it runs out; then the one call, after the first breed
        pg.evaluate("()=>window.__advance(14500)")
        check(S(pg, "s.phase !== 'season' || s.gen >= 1"), 'when the season clock runs out, the clutches left sink anyway and the snails breed')
        check(wait(pg, "s.phase === 'ask'", 200, 50) and S(pg, "s.ask.id") == 'p1' and S(pg, "s.gen") == 1, 'after the first breed comes the one call: the clone share at generation 6')
        hud = pg.evaluate("()=>document.getElementById('hud').innerText")
        c1 = S(pg, "Math.round(100 * s.askC)")
        check(('→ %d%%' % c1) in hud, 'the call names the share the player has just seen (%d%%)' % c1)
        pg.evaluate("()=>{ document.querySelector('#dock [data-id=\"sx-lock\"]').click(); window.__advance(200); }")
        check(S(pg, "!!s.ask && s.pred.p1 == null"), 'Lock in on an untouched marker records no call (needMove)')
        box = pg.evaluate("()=>{ const ch = TB.REG.sex, s = ch.sim.s, A = s.ask, c = TB.Strip.canvas(0); const r = c.getBoundingClientRect(), G = c._lg.G; return [r.x + G.X(A.at), r.y + G.Y(70)]; }")
        pg.mouse.move(box[0] + 10, box[1] + 50); pg.mouse.down(); pg.mouse.move(box[0], box[1], steps=5); pg.mouse.up(); pg.evaluate("()=>window.__advance(150)")
        pg.evaluate("()=>{ document.querySelector('#dock [data-id=\"sx-lock\"]').click(); window.__advance(300); }")
        v = S(pg, "s.pred.p1")
        check(v is not None and 55 < v < 85 and S(pg, "s.phase") == 'season', 'a dragged marker commits the call (%s%%) and the season opens' % v)
        check(not pg.evaluate("()=>TB.Strip.isOpen && TB.Predict.opened"), 'the phone strip folds at once on commit, so the lake is visible for the next tap')
        wait(pg, "s.phase === 'season' && s.ki === 0", 400, 100)
        pg.evaluate("()=>window.__advance(14500)")
        wait(pg, "s.phase === 'breed'", 200, 50)
        t0 = S(pg, "s.pt"); c = pg.evaluate("()=>{ const r = TB.Stage.cv.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
        pg.mouse.click(c[0], c[1]); pg.evaluate("()=>window.__advance(60)")
        check(S(pg, "s.ff") == 3, 'a tap during the breed hurries it (×3)')
        # play the level out with the aim policy through Sim.act; the reveal and the card
        for k in range(6000):
            st = S(pg, "({ph: s.phase, card: !!document.querySelector('#cards.on .card')})")
            if st['card']: break
            if st['ph'] == 'season': pg.evaluate("()=>{ const ch = TB.REG.sex, S = ch.sim, a = S.bots.expert(S.s, S.actions()); if (a) TB.Sim.act(ch, a); }")
            pg.evaluate("()=>window.__advance(120)")
        check(S(pg, "s.revealed"), 'the call was revealed against the twofold rule at generation 6')
        card = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? c.innerText : ''; }")
        e = S(pg, "Math.round(ch.sim.expect(s, 'p1'))")
        check('Level 1 done' in card and 'What if?' in card and ('gave %d%%' % e) in card, 'L1 ends on its level card with What if? and the twofold number (%d%%)' % e)
        # What if?: No sons
        pg.evaluate("()=>{ window.__advance(1500); const b = [...document.querySelectorAll('#cards.on .card-btns button')].find(x => x.textContent === 'What if?'); b && b.click(); window.__advance(300); const c = document.querySelector('#cards.on .chip[data-lever=\"nosons\"]'); c && c.click(); window.__advance(300); }")
        check(S(pg, "s.auto && s.whatif === 'nosons' && s.noSons"), 'What if? "No sons" reruns L1 with the parasite playing')
        for k in range(1200):
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
            pg.evaluate("()=>window.__advance(100)")
        txt = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? c.innerText : ''; }")
        cnum = S(pg, "Math.round(100 * ch.sim.end(s).c)")
        check(('ended at %d%%' % cnum) in txt, 'the What if? card names the run\'s own number (clone ended at %d%%)' % cnum)
        check(not errs, 'no page errors on the L1 paths (%s)' % errs[:2])
        ctx.close()

        # ---- L3: deep water is out of reach ----
        ctx, pg, errs = page(b)
        play(pg, 2)
        wait(pg, "s.phase === 'season'", 100, 50)
        x, y = px(pg, 50, 80); k0 = S(pg, "s.ki"); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(80)")
        check(S(pg, "s.ki") == k0, 'L3: a tap in deep water drops nothing (ducks feed in the shallows)')
        x, y = px(pg, 50, 30); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(80)")
        check(S(pg, "s.ki") == k0 + 1, 'and a tap in the shallows drops a clutch')
        check(not errs, 'no page errors on L3')
        ctx.close()

        # ---- untimed: logged, no clock ----
        ctx, pg, errs = page(b, q='?untimed=1')
        play(pg, 1)
        st = S(pg, "({unt: s.unt, log: JSON.stringify(s.log.slice(0, 1))})")
        check(st['unt'] and '"unt"' in st['log'], 'untimed enters the run as a logged action (%s)' % st['log'])
        wait(pg, "s.phase === 'season'", 100, 50)
        pg.evaluate("()=>window.__advance(60000)")
        check(S(pg, "s.phase === 'season' && s.ki === 0 && s.gen === 0"), 'untimed: a season waits a full minute for your clutches')
        ctx.close()

        # ---- Calm, a deep link, teacher mode ----
        ctx, pg, errs = page(b, 390, 780, '?unit=sex&level=1&seed=5', calm=True)
        pg.evaluate("()=>window.__advance(1500)")
        st = pg.evaluate("()=>({lv: TB.REG.sex.level, calm: !!(TB.Fx && TB.Fx.calm), track: TB.REG.sex.sim.s.track})")
        check(st['lv'] == 1 and st['calm'] and st['track'], 'a deep link opens L2 (tracking keys) in Calm mode')
        for k in range(40):
            pg.evaluate("()=>{ const ch = TB.REG.sex, S = ch.sim, a = S.bots.expert(S.s, S.actions()); if (a) TB.Sim.act(ch, a); window.__advance(200); }")
        check(pg.evaluate("()=>TB.REG.sex.sim.s.gen >= 1") and not errs, 'Calm: seasons drop and breed without errors')
        ctx.close()
        ctx, pg, errs = page(b, 1280, 720, '?teacher=1&unit=sex&level=2&seed=3')
        pg.evaluate("()=>window.__advance(1500)")
        check(pg.evaluate("()=>TB.REG.sex.sim.s && TB.REG.sex.level === 2") and not errs, 'teacher mode opens the boss without errors')
        ctx.close()

        # ---- ?v1=1 keeps the legacy chapter; the learning layer is v2 otherwise ----
        ctx, pg, errs = page(b, 390, 780, '?v1=1')
        st = pg.evaluate("()=>({v2: TB.REG.sex.v2 === true, legacy: typeof TB.REG.sex.gen1 === 'function'})")
        check(not st['v2'] and st['legacy'], '?v1=1 registers the legacy Why Sex?')
        ctx.close()
        ctx, pg, errs = page(b)
        st = pg.evaluate("()=>({v2: TB.REG.sex.v2 === true, plan: TB.REG.sex.levels.length, take: TB.TAKE ? TB.TAKE.sex : ''})")
        check(st['v2'] and st['plan'] == 3, 'the v2 Why Sex? replaces it with 3 levels')
        ctx.close()
        b.close()
    print('sex paths: %d ok, %d failed' % (len(oks), len(fails)))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
