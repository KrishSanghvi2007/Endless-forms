"""Left Jaw, Right Jaw (v2): the paths a player, a keyboard user and a teacher take, in a real browser (virtual time).

  GAME_HTML=/abs/build.html python3 tests/jaws_paths.py

Checks: real canvas taps raise a plate on the tapped flank of the nearest fish; keys (arrows, 1-3, Space, P, Enter);
act-to-juice latency <= 200 ms (Events.lat); a whole level by real input, with a prediction placed by keys; What if?
thaws the last season and shows a text chosen from its own run; untimed mode freezes each wave until Strike, and the boss's
sneaker until you lunge; Calm; a deep link; teacher step; ?v1=1 plays the legacy chapter. Exit 1 on any failure."""
import os, sys
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
HTML = os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v1.html')
fails = []


def check(cond, msg):
    if not cond: fails.append(msg)
    print(('  ok   ' if cond else '  FAIL ') + msg)


def page(b, w=390, h=780, q='', calm=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference')
    pg = ctx.new_page()
    pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + HTML + q)
    pg.evaluate("()=>window.__advance(600)")
    return ctx, pg, errs


def play(pg, lv, seed=7):
    pg.evaluate("([lv, sd])=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.jaws, lv, {seed: sd}); window.__advance(200); }", [lv, seed])
    if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"):   # the opening card (D6 decision 8): Play closes it (the card ignores taps in its first moments)
        pg.evaluate("()=>window.__advance(800)"); pg.click('#cards.on .card.ef-intro .btn.primary'); pg.evaluate("()=>window.__advance(300)")


def flank_xy(pg, f, side):
    return pg.evaluate("""([f, side])=>{ const ch = TB.REG.jaws, G = ch.geo(), p = ch.flank(G, f, side), r = TB.Stage.cv.getBoundingClientRect(); return [r.left + p[0], r.top + p[1]]; }""", [f, side])


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)

        # ---- the opening card: three labelled parts from content.intro, the coral accent, Play, and "?" to reopen ----
        ctx, pg, errs = page(b)
        pg.evaluate("()=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.jaws, 0, {seed: 7}); window.__advance(300); }")
        card = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card.ef-intro'); return c ? {n: c.querySelectorAll('.ef-in-part').length, text: c.innerText} : null; }")
        check(bool(card) and card['n'] == 3 and 'Lake Tanganyika' in card['text'], 'the opening card shows the game, the biology and how to play')
        pg.evaluate("()=>window.__advance(800)"); pg.click('#cards.on .card.ef-intro .btn.primary'); pg.evaluate("()=>window.__advance(400)")
        check(not pg.evaluate("()=>!!document.querySelector('#cards.on .card')"), 'Play closes the opening card')
        q = pg.query_selector('.ef-q')
        if q:
            q.click(); pg.evaluate("()=>window.__advance(900)")
            check(pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"), 'the dock "?" reopens the card during play')
            pg.click('#cards.on .card.ef-intro .btn.primary'); pg.evaluate("()=>window.__advance(300)")
        check(not errs, 'no page errors on the opening card: %s' % errs[:2])
        ctx.close()

        # ---- taps, keys, latency, a whole level by real input ----
        ctx, pg, errs = page(b)
        pg.evaluate("()=>{ TB.Events.debug = true; TB.Events.clear && TB.Events.clear(); }")
        play(pg, 0)
        pg.evaluate("()=>window.__advance(1500)")
        x, y = flank_xy(pg, 0, 1); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(60)")
        pl = pg.evaluate("()=>TB.REG.jaws.sim.s.plates.map(p => [p.f, p.side])")
        check(pl == [[0, 1]], 'a real tap on the right flank raises the right plate (%s)' % pl)
        pg.keyboard.press('ArrowLeft'); pg.evaluate("()=>window.__advance(60)")
        pl = pg.evaluate("()=>TB.REG.jaws.sim.s.plates.map(p => [p.f, p.side])")
        check(pl == [[0, 0]], 'ArrowLeft moves the one plate to the left flank (%s)' % pl)
        steps, asked, card = 0, False, None
        while steps < 4000:
            steps += 1
            info = pg.evaluate("""()=>{ const s = TB.REG.jaws.sim.s, c = document.querySelector('#cards.on .card'); return {card: c ? c.className : null, ask: !!s.ask, phase: s.phase, wave: !!s.wave, p: TB.REG.jaws.sim.pAll(s)}; }""")
            if info['card']: card = info['card']; break
            if info['ask']:
                asked = True; pg.keyboard.press('p'); [pg.keyboard.press('ArrowDown') for _ in range(3)]; pg.keyboard.press('Enter')
            elif info['phase'] == 'swim' and info['wave'] and steps % 4 == 0:
                x, y = flank_xy(pg, 0, 1 if info['p'] >= 0.5 else 0); pg.mouse.click(x, y)
            pg.evaluate("()=>window.__advance(120)")
        lat = pg.evaluate("()=>TB.Events.lat ? TB.Events.lat() : null")
        vals = [v for v in (lat or []) if v is not None]
        check(len(vals) >= 3 and max(vals) <= 200, 'act-to-juice latency max %s ms over %d acts (<= 200)' % (max(vals) if vals else 'n/a', len(vals)))
        preds = pg.evaluate("()=>Object.values(TB.REG.jaws.sim.s.pred).filter(v => v != null).length")
        check(asked and preds >= 1, 'predictions placed by P, arrows and Enter (%d locked)' % preds)
        check(card is not None and 'lvl' in card, 'L1 ends on a v2 level card after real taps (%s)' % card)
        pg.evaluate("()=>window.__advance(800)")
        clicked = pg.evaluate("""()=>{ const c = document.querySelector('#cards.on .card'); const w = [...c.querySelectorAll('.card-btns button')].find(b => /what if/i.test(b.textContent)); if (!w) return false; w.click(); window.__advance(100);
          const chip = c.querySelector('.chip[data-lever="equal"]'); if (!chip) return false; chip.click(); window.__advance(300); return true; }""")
        check(clicked, 'What if? offers "Guard evenly" on the L1 card')
        for _ in range(200):
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
            pg.evaluate("()=>window.__advance(150)")
        wi = pg.evaluate("()=>{ const s = TB.REG.jaws.sim.s, c = document.querySelector('#cards.on .card'); return {whatif: s.whatif, n: s.wps ? s.wps[0].length : 0, txt: c ? c.innerText : ''}; }")
        check(wi['whatif'] == 'equal' and wi['n'] == 9 and 'Interesting result' in wi['txt'], 'the thawed run plays eight seasons and shows its Interesting result')
        check(not errs, 'no page errors (%s)' % (errs[:2],))
        ctx.close()

        # ---- the school: fish choice by keys, the plate limit ----
        ctx, pg, errs = page(b, 1280, 720)
        play(pg, 1)
        pg.evaluate("()=>window.__advance(900)")
        pg.keyboard.press('2'); pg.keyboard.press('ArrowRight'); pg.keyboard.press('3'); pg.keyboard.press('ArrowLeft'); pg.keyboard.press('1'); pg.keyboard.press('ArrowLeft'); pg.evaluate("()=>window.__advance(60)")
        pl = pg.evaluate("()=>TB.REG.jaws.sim.s.plates.map(p => [p.f, p.side])")
        check(pl == [[2, 0], [0, 0]], 'keys 1-3 pick a fish; a third plate slides the oldest off (two at most): %s' % pl)
        for f in (0, 1, 2):
            x, y = flank_xy(pg, f, 1); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(40)")
        pl = pg.evaluate("()=>TB.REG.jaws.sim.s.plates.map(p => [p.f, p.side])")
        check(len(pl) == 2 and [2, 1] in pl, 'real taps on three right flanks leave two plates up (%s)' % pl)
        check(not errs, 'no page errors at 1280x720 (%s)' % (errs[:2],))
        ctx.close()

        # ---- untimed: a wave waits until Strike; the boss's sneaker waits for your lunge ----
        ctx, pg, errs = page(b, 390, 780, '?untimed=1')
        play(pg, 1)
        pg.evaluate("()=>window.__advance(9000)")
        st = pg.evaluate("()=>{ const s = TB.REG.jaws.sim.s; return [s.unt, s.att, !!s.wave, s.wave ? s.wave.tb : 0]; }")
        check(st[0] and st[1] == 0 and st[2] and st[3] >= 1e9, 'untimed: the wave waits 9 s with no strike (%s)' % st[:3])
        dock = pg.evaluate("()=>[...document.querySelectorAll('#dock button')].map(b => b.textContent)")
        check(any(t.startswith('Strike') for t in dock), 'untimed: the dock offers Strike (%s)' % dock)
        pg.evaluate("()=>{ const ch = TB.REG.jaws, s = ch.sim.s; for (const a of s.wave.att) TB.Sim.act(ch, {k: 'guard', f: a.f, side: 1}); }")
        pg.keyboard.press(' '); pg.evaluate("()=>window.__advance(700)")
        st = pg.evaluate("()=>TB.REG.jaws.sim.s.att")
        check(st >= 1, 'untimed: Space strikes and the wave resolves (%d attacks)' % st)
        play(pg, 4)
        pg.evaluate("()=>window.__advance(12000)")
        st = pg.evaluate("()=>{ const s = TB.REG.jaws.sim.s; return [s.sAtt, s.cur.map(q => q.k)]; }")
        check(st[0] == 0 and (('Y' in st[1]) or st[1] == []), 'untimed boss: a yellow sneaker waits for your lunge (%s)' % st)
        check(not errs, 'no page errors in untimed play (%s)' % (errs[:2],))
        ctx.close()

        # ---- the boss by keys ----
        ctx, pg, errs = page(b, 1280, 720)
        play(pg, 4)
        lunged = pg.evaluate("""()=>{ const ch = TB.REG.jaws; let n = 0; for (let i = 0; i < 400; i++) { const s = ch.sim.s; const y = s.cur && s.cur.find(q => q.k === 'Y'); if (y && (!s.guard || s.guard.side !== y.side) && y.tb - s.T < 0.45) { window.dispatchEvent(new KeyboardEvent('keydown', {key: y.side ? 'ArrowRight' : 'ArrowLeft'})); n++; } window.__advance(40); } return [n, ch.sim.s.blk, ch.sim.s.att]; }""")
        check(lunged[0] >= 2 and lunged[1] >= 1, 'boss: arrow keys lunge at sneakers (%d lunges, %d of %d blocked)' % tuple(lunged))
        check(not errs, 'no page errors in the boss (%s)' % (errs[:2],))
        ctx.close()

        # ---- Calm, a deep link, teacher step ----
        ctx, pg, errs = page(b, 390, 780, '?unit=jaws&level=2&seed=5', calm=True)
        pg.evaluate("()=>window.__advance(3000)")
        if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"): pg.click('#cards.on .card.ef-intro .btn.primary'); pg.evaluate("()=>window.__advance(400)")
        st = pg.evaluate("()=>({lv: TB.REG.jaws.level, calm: !!(TB.Fx && TB.Fx.calm), v2: TB.REG.jaws.v2 === true})")
        check(st['lv'] == 2 and st['calm'] and st['v2'], 'a deep link opens L3 in Calm mode')
        pg.evaluate("""()=>{ const ch = TB.REG.jaws; for (let i = 0; i < 600; i++) { const s = ch.sim.s; if (s.ask) TB.Sim.act(ch, {k: 'predict', id: s.ask.id, v: 0.4}); else { const a = ch.sim.bots.greedy(s, ch.sim.actions()); if (a) TB.Sim.act(ch, a); } window.__advance(100); } }""")
        check(not errs, 'Calm play shows no errors (%s)' % (errs[:2],))
        ctx.close()
        ctx, pg, errs = page(b, 1280, 720, '?teacher=1&unit=jaws&level=1&seed=3')
        pg.evaluate("()=>window.__advance(2500)")
        if pg.evaluate("()=>!!document.querySelector('#cards.on .card.ef-intro')"): pg.click('#cards.on .card.ef-intro .btn.primary'); pg.evaluate("()=>window.__advance(400)")
        st = pg.evaluate("()=>{ const ch = TB.REG.jaws, s0 = ch.sim.s.season; TB.Sim.act(ch, {k: 'guard', f: 0, side: 1}); window.__advance(100); TB.Teacher && TB.Teacher.step && TB.Teacher.step(); window.__advance(200); return [s0, ch.sim.s.phase, ch.sim.s.att, ch.sim.cfg(1).att]; }")
        check(st[1] in ('dusk', 'ask', 'breed') and st[2] >= st[3], 'teacher step resolves the rest of the season (%s)' % st)
        check(not errs, 'teacher mode shows no errors (%s)' % (errs[:2],))
        ctx.close()

        # ---- ?v1=1 keeps the legacy chapter ----
        ctx, pg, errs = page(b, 390, 780, '?v1=1')
        st = pg.evaluate("()=>({v2: TB.REG.jaws.v2 === true, legacy: typeof TB.REG.jaws.newSeason === 'function'})")
        check(not st['v2'] and st['legacy'], '?v1=1 registers the legacy Left Jaw, Right Jaw')
        pg.evaluate("()=>{ TB.App.open(TB.REG.jaws); window.__advance(500); }")
        check(not errs, '?v1=1 opens the legacy chapter without errors (%s)' % (errs[:2],))
        ctx.close()
        b.close()
    print('jaws paths: %d failed' % len(fails))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
