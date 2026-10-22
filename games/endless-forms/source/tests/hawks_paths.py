"""Hawks and Doves (v2): the paths a player, a keyboard user and a teacher take, in a real browser (virtual time).

  GAME_HTML=/abs/build.html python3 tests/hawks_paths.py

Checks: real canvas taps (rival = Hawk, your crab = Dove); keys (arrows, H, D, Enter); the Hawk and Dove buttons are
never both disabled (D5 §4 item 3); act-to-juice latency <= 200 ms (Events.lat); only Big shells has a prediction (the new
beach, D6 decision 9), placed with P, arrows and Enter; untimed mode waits (duel, ask); What if? thaws a frozen tide and
shows its Interesting result; Calm mode; a deep link; the key number V/C on the posts; the last level's card; ?v1=1 plays
the legacy chapter; the learning layer. Exit 1 on any failure."""
import os, sys, json
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
HTML = os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v1.html')
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
    pg.goto('file://' + HTML + q); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
    pg.evaluate("()=>window.__advance(600)")
    return ctx, pg, errs


def play(pg, lv, seed=7):
    pg.evaluate("([lv, sd])=>{ TB.Cards.close && TB.Cards.close(); TB.App.playLevel(TB.REG.hawks, lv, {seed: sd}); window.__advance(200); }", [lv, seed])


def canvas_xy(pg, which):
    return pg.evaluate("""(w)=>{ const ch = TB.REG.hawks, G = ch.geo(), r = TB.Stage.cv.getBoundingClientRect(); const p = w === 'rival' ? [G.xr, G.cy] : w === 'you' ? [G.xs, G.cy] : [G.W / 2, G.cy + G.hero * 0.3]; return [r.left + p[0], r.top + p[1]]; }""", which)


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)

        # ---- canvas taps, keys, latency, buttons never both disabled ----
        ctx, pg, errs = page(b)
        pg.evaluate("()=>{ TB.Events.debug = true; TB.Events.clear && TB.Events.clear(); }")
        play(pg, 0)
        pg.evaluate("()=>window.__advance(500)")
        x, y = canvas_xy(pg, 'rival'); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(60)")
        a = pg.evaluate("()=>TB.REG.hawks.sim.s.duel.a")
        check(a == 1, 'a real tap on the rival plays Hawk')
        pg.evaluate("()=>window.__advance(1600)")
        x, y = canvas_xy(pg, 'you'); pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(60)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.duel.a, s.q]; }")
        check(0 in st, 'a real tap on your own crab plays Dove (now, or queued for the next rival)')
        pg.evaluate("()=>window.__advance(1600)")
        pg.keyboard.press('ArrowRight'); pg.evaluate("()=>window.__advance(60)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.duel.a, s.q]; }")
        check(1 in st, 'ArrowRight plays Hawk')
        pg.evaluate("()=>window.__advance(1600)")
        pg.keyboard.press('d'); pg.evaluate("()=>window.__advance(60)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.duel.a, s.q]; }")
        check(0 in st, 'D plays Dove')
        lat = pg.evaluate("()=>{ const l = TB.Events.lat ? TB.Events.lat() : null; return l; }")
        vals = [v for v in (lat or []) if v is not None]
        check(len(vals) >= 3 and max(vals) <= 200, 'act-to-juice latency %s ms (<= 200)' % (max(vals) if vals else 'n/a'))
        # play to the end of L1 by keys, sampling the dock on every step
        both_off, saw_ask, committed, steps = 0, False, False, 0
        while steps < 3000:
            steps += 1
            info = pg.evaluate("""()=>{ const s = TB.REG.hawks.sim.s, card = document.querySelector('#cards.on .card'); const bs = [...document.querySelectorAll('#dock button')].filter(b => /Hawk|Dove/.test(b.textContent));
              return {card: !!card, ask: !!s.ask, phase: s.phase, n: bs.length, off: bs.filter(b => b.disabled || b.getAttribute('aria-disabled') === 'true').length}; }""")
            if info['card']: break
            if info['phase'] in ('duel', 'tide') and info['n'] == 2 and info['off'] == 2: both_off += 1
            if info['ask'] and not committed:
                saw_ask = True; pg.keyboard.press('p'); pg.keyboard.press('ArrowUp'); pg.keyboard.press('Enter'); committed = True
            elif info['phase'] == 'duel': pg.keyboard.press('ArrowRight' if steps % 3 else 'ArrowLeft')
            pg.evaluate("()=>window.__advance(150)")
        check(both_off == 0, 'the Hawk and Dove buttons are never both disabled (%d samples)' % steps)
        pred = pg.evaluate("()=>TB.REG.hawks.sim.s.pred")
        check(not saw_ask and not pred, 'the tide pool has no prediction interlude (D6 decision 9)')
        card = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? {cls: c.className, stars: c.dataset.stars, txt: c.innerText.slice(0, 300)} : null; }")
        check(card is not None and 'lvl' in card['cls'], 'L1 ends on a v2 level card')
        # What if? on the level card: thaw the last frozen tide with one lever changed
        pg.evaluate("()=>window.__advance(800)")
        clicked = pg.evaluate("""()=>{ const c = document.querySelector('#cards.on .card'); const w = [...c.querySelectorAll('.card-btns button')].find(b => /what if/i.test(b.textContent)); if (!w) return false; w.click(); window.__advance(100);
          const chip = c.querySelector('.chip[data-lever="cheap"]'); if (!chip) return false; chip.click(); window.__advance(300); return true; }""")
        check(clicked, 'What if? offers the "Cheap fights" lever on the L1 card')
        for _ in range(200):
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
            pg.evaluate("()=>window.__advance(150)")
        wi = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s, c = document.querySelector('#cards.on .card'); return {whatif: s.whatif, p: s.hist[s.hist.length - 1].p, txt: c ? c.innerText : ''}; }")
        check(wi['whatif'] == 'cheap' and wi['p'] > 0.85 and 'Interesting result' in wi['txt'], 'the thawed run takes hawks to %.2f and shows its Interesting result' % wi['p'])
        check(not errs, 'no page errors (%s)' % (errs[:2],))
        ctx.close()

        # ---- untimed mode: nothing happens for you ----
        ctx, pg, errs = page(b)
        pg.evaluate("()=>{ TB.Save.d.ui.unt = 1; }")
        play(pg, 2)
        pg.evaluate("()=>window.__advance(9000)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.dn, s.duel.st, s.duel.a]; }")
        check(st[0] == 0 and st[1] == 'face', 'untimed: the rival waits 9 s for your choice (no default Dove)')
        pg.evaluate("""()=>{ const ch = TB.REG.hawks; for (let i = 0; i < 600 && !ch.sim.s.ask; i++) { const s = ch.sim.s; if (s.duel && s.duel.a == null && (s.duel.st === 'face' || s.duel.st === 'walk')) TB.Sim.act(ch, {k: 'pick', a: 1}); window.__advance(100); } }""")
        pg.evaluate("()=>window.__advance(20000)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.phase, !!s.ask]; }")
        check(st[0] == 'nb' and st[1], 'untimed: the new-beach call waits 20 s (no soft timer)')
        ctx.close()

        # ---- the one prediction: Big shells' new beach, placed with P, arrows and Enter ----
        ctx, pg, errs = page(b)
        play(pg, 2)
        for _ in range(600):
            if pg.evaluate("()=>!!TB.REG.hawks.sim.s.ask"): break
            pg.evaluate("()=>{ const ch = TB.REG.hawks, s = ch.sim.s; if (s.duel && s.duel.a == null && (s.duel.st === 'face' || s.duel.st === 'walk')) TB.Sim.act(ch, {k: 'pick', a: 1}); window.__advance(150); }")
        pg.evaluate("()=>window.__advance(300)")
        ids = pg.evaluate("()=>[...document.querySelectorAll('#dock button')].map(b => b.dataset.id)")
        check(ids == ['lock'], 'during the call the dock holds only Lock in (%s)' % ids)
        hud = pg.evaluate("()=>document.querySelector('#hud') ? document.querySelector('#hud').innerText : ''")
        check('shell 6' in hud and 'injury 8' in hud, 'the call names the new beach\'s shell and injury (%s)' % hud[:80])
        pg.keyboard.press('p')
        for _ in range(10): pg.keyboard.press('ArrowUp')
        pg.keyboard.press('Enter'); pg.evaluate("()=>window.__advance(400)")
        pred = pg.evaluate("()=>TB.REG.hawks.sim.s.pred")
        check(pred.get('nb') is not None and pred['nb'] > 0.5, 'the new-beach call is placed and locked with P, arrows and Enter (%s)' % pred)
        check(not errs, 'no page errors in the call (%s)' % (errs[:2],))
        ctx.close()

        # ---- Calm mode, a deep link, teacher mode ----
        ctx, pg, errs = page(b, 390, 780, '?unit=hawks&level=3&seed=5', calm=True)
        pg.evaluate("()=>window.__advance(3000)")
        st = pg.evaluate("()=>({lv: TB.REG.hawks.level, calm: !!(TB.Fx && TB.Fx.calm), v2: TB.REG.hawks.v2 === true})")
        check(st['lv'] == 3 and st['calm'] and st['v2'], 'a deep link opens L4 in Calm mode')
        pg.evaluate("""()=>{ const ch = TB.REG.hawks; for (let i = 0; i < 300; i++) { const s = ch.sim.s; if (s.ask) TB.Sim.act(ch, {k: 'predict', id: s.ask.id, v: 2.2}); else if (s.duel && s.duel.a == null) TB.Sim.act(ch, {k: 'pick', a: 1}); window.__advance(150); } }""")
        check(not errs, 'Calm play shows no errors (%s)' % (errs[:2],))
        ctx.close()
        ctx, pg, errs = page(b, 1280, 720, '?teacher=1&unit=hawks&level=0&seed=3')
        pg.evaluate("()=>window.__advance(2500)")
        check(pg.evaluate("()=>TB.REG.hawks.sim.s && TB.REG.hawks.level === 0") and not errs, 'teacher mode opens the unit without errors')
        ctx.close()

        # ---- review round: the clock, misses, the dock's inks, Space as a true hold, cues, the boss card ----
        ctx, pg, errs = page(b)
        play(pg, 0)
        pg.evaluate("()=>window.__advance(10000)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.dn, s.duel.st, s.duel.a]; }")
        check(st[0] == 0 and st[1] == 'face', 'timed: the first rival of a level waits 10 s for your first pick')
        x, y = pg.evaluate("""()=>{ const ch = TB.REG.hawks, G = ch.geo(), r = TB.Stage.cv.getBoundingClientRect(); return [r.left + G.W / 2, r.top + G.cy + G.hero * 0.32]; }""")
        pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(60)")
        st = pg.evaluate("()=>({a: TB.REG.hawks.sim.s.duel.a, w: TB.Whisper.log.slice(-1)[0]})")
        check(st['a'] is None and st['w'] and 'Tap the rival' in st['w']['text'], 'a tap on the prize shell is not silent: a hint, and no pick (%s)' % (st['w'] or {}).get('text'))
        x, y = pg.evaluate("""()=>{ const ch = TB.REG.hawks, G = ch.geo(), r = TB.Stage.cv.getBoundingClientRect(); return [r.left + G.W * 0.08, r.top + G.cy + G.hero * 0.5]; }""")
        pg.mouse.click(x, y); pg.evaluate("()=>window.__advance(60)")
        check(pg.evaluate("()=>TB.REG.hawks.sim.s.duel.a") == 0, 'a tap on the sand on your side plays Dove (the arena is two halves)')
        pg.evaluate("()=>window.__advance(1700)")
        info = pg.evaluate("""()=>{ const h = document.querySelector('#dock [data-id="hk-hawk"]'), d = document.querySelector('#dock [data-id="hk-dove"]');
          const rgb = x => getComputedStyle(x).boxShadow + '|' + getComputedStyle(x.querySelector('svg')).color; return {h: h && rgb(h), d: d && rgb(d), A: TB.Pal.INK[TB.Pal.theme].A, prim: h && h.classList.contains('primary'), glyph: !!(h && h.querySelector('svg'))}; }""")
        check(info['h'] and info['h'].count('rgb(107, 151, 255)') == 2 and not info['prim'] and info['glyph'], 'the Hawk button is neutral chrome keyed by the Hawk blue (side bar and claws-up glyph), not the crimson primary (%s)' % info['h'])   # D6 decision 7
        pg.evaluate("()=>window.__advance(6000)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return {dn: s.dn, slow: s.dl[1] && s.dl[1][0] === 0, log: TB.Whisper.log.slice(-3).map(x => x.text)}; }")
        check(st['dn'] >= 2 and st['slow'] and any('Too slow' in t for t in st['log']) and 'Too slow' in st['log'][-1], 'a later rival waits 5.5 s, then "Too slow, so you displayed." stays the last word (%s)' % st['log'])
        check(not errs, 'no page errors in the review checks (%s)' % (errs[:2],))
        ctx.close()

        ctx, pg, errs = page(b, 390, 780, '?untimed=1')
        play(pg, 1); pg.evaluate("()=>{ TB.Sim.act(TB.REG.hawks, {k: 'pick', a: 1}); window.__advance(20000); }")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.unt, s.dn, s.duel.st]; }")
        check(st[0] and st[1] == 1 and st[2] == 'face', '?untimed=1 turns the clock off for playtests (%s)' % st)
        ctx.close()

        ctx, pg, errs = page(b, 1280, 720)
        play(pg, 3)
        pg.evaluate("()=>{ TB.Sim.act(TB.REG.hawks, {k: 'pick', a: 1}); window.__advance(1100); }")
        pg.keyboard.press('ArrowRight'); w = pg.evaluate("()=>{ window.__advance(60); return TB.Whisper.log.slice(-1)[0].text; }"); pg.evaluate("()=>window.__advance(700)")
        st = pg.evaluate("()=>{ const s = TB.REG.hawks.sim.s; return [s.q, s.duel.a, s.duel.st, '%s', s.dn]; }" % w)
        check(st[0] is None and st[1] is None and st[4] == 1 and 'Wait' in st[3], 'Owners: a tap during the clash is not a blind pick for the next rival (%s)' % st)
        lab = pg.evaluate("()=>TB.Lbl.list.filter(l => /· owner/.test(l.text)).map(l => l.text).slice(-1)[0]")
        check(bool(lab), 'Owners: the scene names who owns the shell (%s)' % lab)
        ctx.close()

        ctx, pg, errs = page(b, 1280, 720)
        play(pg, 1)
        pg.evaluate(r"""()=>{ const ch = TB.REG.hawks; for (let i = 0; i < 4000 && !document.querySelector('#cards.on .card'); i++) { const s = ch.sim.s, D = s.duel; if (D && D.a == null && (D.st === 'face' || D.st === 'walk')) TB.Sim.act(ch, {k: 'pick', a: 1}); if (s.tide >= 3 && !ch._vc) ch._vc = TB.Lbl.list.filter(l => /V\/C = 4\/10/.test(l.text)).length; window.__advance(100); } window.__advance(1500); }""")
        st = pg.evaluate(r"()=>({vc: TB.REG.hawks._vc, w: TB.Whisper.log.map(x => x.text).filter(t => /V\/C/.test(t))})")
        check(st['vc'] and st['w'], 'The mutant shows the key number on the posts (V/C = 4/10) with a one-line meaning (%s)' % st)
        ctx.close()

        ctx, pg, errs = page(b, 1280, 720)
        play(pg, 3)
        pg.evaluate("""()=>{ const ch = TB.REG.hawks; for (let i = 0; i < 4000 && !document.querySelector('#cards.on .card'); i++) { const s = ch.sim.s, D = s.duel; if (D && D.a == null && (D.st === 'face' || D.st === 'walk')) TB.Sim.act(ch, {k: 'pick', a: D.d < 0 ? 1 : 0}); window.__advance(100); } window.__advance(1500); }""")
        card = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? {btns: [...c.querySelectorAll('.card-btns button')].map(b => b.textContent), txt: c.innerText} : null; }")
        check(card is not None and 'Replay level' in card['btns'], 'the last level\'s card offers Replay level (%s)' % (card and card['btns']))
        check(card is not None and ('convention' in card['txt'] or 'Owning' in card['txt']), 'the last card leads with the Owners lesson')
        pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on .card-btns button')].find(x => x.textContent === 'Replay level'); b && b.click(); window.__advance(600); }")
        st = pg.evaluate("()=>({card: !!document.querySelector('#cards.on .card'), lv: TB.REG.hawks.level, dn: TB.REG.hawks.sim.s.dn})")
        check(not st['card'] and st['lv'] == 3 and st['dn'] == 0, 'Replay level restarts Owners')
        check(not errs, 'no page errors in the last-level checks (%s)' % (errs[:2],))
        ctx.close()

        # ---- ?v1=1 keeps the legacy chapter; the learning layer is v2 otherwise ----
        ctx, pg, errs = page(b, 390, 780, '?v1=1')
        st = pg.evaluate("()=>({v2: TB.REG.hawks.v2 === true, lv: Array.isArray(TB.REG.hawks.LV)})")
        check(not st['v2'] and st['lv'], '?v1=1 registers the legacy Hawks and Doves')
        pg.evaluate("()=>{ TB.App.open(TB.REG.hawks); window.__advance(400); }")
        check(pg.evaluate("()=>!!document.querySelector('#cards.on .card')") and not errs, 'the legacy chapter opens with its intro card, no errors')
        ctx.close()
        ctx, pg, errs = page(b)
        take = pg.evaluate("()=>{ try { return TB.REG.hawks.content.take; } catch (e) { return null; } }")
        check(bool(take), 'the v2 unit carries its TAKE line')
        ctx.close()
        b.close()
    print('hawks paths: %d ok, %d failed' % (len(oks), len(fails)))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
