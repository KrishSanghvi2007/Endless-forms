"""The Leaky Tap (v2) input paths in a real browser: real canvas taps dive, keys (arrows, Space, L, E, D), the lens blocks dives,
?untimed=1 freezes the chicks, Calm (reduced motion) plays, the opening card shows, What if? runs, and ?v1=1 has no tap chapter.

  GAME_HTML=/abs/build.html python3 tests/tap_paths.py      exit 1 on any failure or page error"""
import os, sys
from playwright.sync_api import sync_playwright

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
fails, errs = [], []


def ok(c, msg):
    print(('  ok   ' if c else '  FAIL ') + msg)
    if not c: fails.append(msg)


def page(b, html, q='', vp=(390, 780), calm=False):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, reduced_motion='reduce' if calm else 'no-preference')
    pg = ctx.new_page(); pg.add_init_script(open(os.path.join(SRC, 'vclock.js')).read())
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + html + '?dev=1' + q); pg.evaluate("()=>window.__advance(600)")
    return ctx, pg


def main():
    html = os.environ.get('GAME_HTML')
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        # 1. the opening card, then a real tap on a tottering chick dives and catches
        ctx, pg = page(b, html, '&unit=tap&seed=4')
        pg.evaluate("()=>window.__advance(800)")
        ok(pg.evaluate("()=>!!document.querySelector('#cards.on [data-play]')"), 'the opening card shows with a Play button')
        pg.evaluate("()=>{ document.querySelector('#cards.on [data-play]').click(); window.__advance(2500); }")
        got = False
        for k in range(300):
            xy = pg.evaluate("""()=>{ const ch = TB.REG.tap, s = ch.sim.s; if (s.phase !== 'dusk' || s.busy) return null; const i = s.vis.findIndex(c => c.alive && c.aff && c.ex && c.tm > 0.45); if (i < 0) return null;
              const p = ch.nestXY(i), r = TB.Stage.cv.getBoundingClientRect(); return [r.left + p[0], r.top + p[1]]; }""")
            if xy:
                before = pg.evaluate("()=>TB.REG.tap.sim.s.caught"); pg.mouse.click(xy[0], xy[1]); pg.evaluate("()=>window.__advance(500)")
                got = pg.evaluate("()=>TB.REG.tap.sim.s.caught") > before; break
            pg.evaluate("()=>window.__advance(80)")
        ok(got, 'a real tap on a chick tottering at the edge is a catch')
        # 2. keys: arrows move the cursor, L turns the lens (L2), Space under the lens is blocked, E ends the dusk
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.tap, 1, {seed: 3}); window.__advance(2500); }")
        pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowRight')
        ok(pg.evaluate("()=>TB.REG.tap.v.cur") == 2, 'arrow keys move the nest cursor')
        pg.keyboard.press('l'); pg.evaluate("()=>window.__advance(100)")
        lens = pg.evaluate("()=>TB.REG.tap.sim.s.lens"); d0 = pg.evaluate("()=>TB.REG.tap.sim.s.dives")
        pg.keyboard.press(' '); pg.evaluate("()=>window.__advance(100)")
        ok(lens and pg.evaluate("()=>TB.REG.tap.sim.s.dives") == d0, 'L turns the lens on, and Space cannot dive under it')
        pg.keyboard.press('l'); pg.keyboard.press('e'); pg.evaluate("()=>window.__advance(300)")
        ok(pg.evaluate("()=>TB.REG.tap.sim.s.dusk") >= 1 and pg.evaluate("()=>TB.REG.tap.sim.s.phase") in ('dawn', 'dusk'), 'E ends the dusk')
        # 3. the boss: D shuts the drum
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.tap, 3, {seed: 2}); window.__advance(2500); }")
        pg.keyboard.press('d'); pg.evaluate("()=>window.__advance(200)")
        ok(pg.evaluate("()=>TB.REG.tap.sim.s.drum") is False, 'D shuts the drum in the boss')
        ctx.close()
        # 4. untimed: the chicks hold still while you think
        ctx, pg = page(b, html, '&untimed=1&intro=0')
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.tap, 0, {seed: 5}); window.__advance(2000); }")
        a = pg.evaluate("()=>JSON.stringify(TB.REG.tap.sim.s.vis.map(c => c.ex))"); pg.evaluate("()=>window.__advance(6000)")
        ok(pg.evaluate("()=>TB.REG.tap.sim.s.unt") and pg.evaluate("()=>JSON.stringify(TB.REG.tap.sim.s.vis.map(c => c.ex))") == a, 'untimed: the chicks hold still')
        ctx.close()
        # 5. Calm at desktop size plays a level to its card; What if? runs and reports
        ctx, pg = page(b, html, '&intro=0', vp=(1280, 720), calm=True)
        pg.evaluate("()=>{ TB.App.playLevel(TB.REG.tap, 0, {seed: 6}); window.__advance(500); }")
        for k in range(4000):
            st = pg.evaluate("""()=>{ const ch = TB.REG.tap, s = ch.sim.s; if (document.querySelector('#cards.on .card')) return 'card'; if (s.ask) { TB.Sim.act(ch, {k: 'predict', id: s.ask.id, v: s.exp[s.ask.id]}); return 'ask'; }
              const a = ch.sim.bots.expert(s, ch.sim.actions(), Math.random); if (a) TB.Sim.act(ch, a); return s.phase; }""")
            if st == 'card': break
            pg.evaluate("()=>window.__advance(60)")
        ok(st == 'card', 'Calm, 1280×720: L1 plays to its level card')
        has = pg.evaluate("()=>[...document.querySelectorAll('#cards.on button')].map(b => b.textContent)")
        ok(any('What if' in x for x in has), 'the level card offers What if?')
        pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on button')].find(b => /What if/.test(b.textContent)); b && b.click(); window.__advance(400); }")
        pg.evaluate("()=>{ const b = [...document.querySelectorAll('#cards.on button, #cards.on .chip')].find(b => /Half the catch/.test(b.textContent)); b && b.click(); window.__advance(300); }")
        for k in range(600):
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
            pg.evaluate("()=>window.__advance(100)")
        body = pg.evaluate("()=>{ const c = document.querySelector('#cards.on .card'); return c ? c.innerText : ''; }")
        ok('half your catch rate' in body and 'NaN' not in body, 'the What if? run ends on a card that reports its own numbers')
        ctx.close()
        # 6. ?v1=1 keeps the legacy game: no tap chapter
        ctx, pg = page(b, html, '&v1=1')
        ok(not pg.evaluate("()=>!!TB.REG.tap"), '?v1=1 has no tap chapter')
        ctx.close(); b.close()
    for e in errs[:10]: print('ERROR', e)
    print('tap paths: %d failed, %d page errors' % (len(fails), len(errs)))
    sys.exit(1 if fails or errs else 0)


if __name__ == '__main__':
    main()
