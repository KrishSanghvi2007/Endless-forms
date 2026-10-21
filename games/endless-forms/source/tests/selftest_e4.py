"""E4 browser self-test: the v2 level and end cards, Begin and the menu in Chromium.

  python3 tests/selftest_e4.py [OUT_DIR]

Builds the private fixture build of tests/selftest_e4.js (node tests/selftest_e4.js --build-only), then, under virtual
time (vclock.js plus the rAF shim) with the network blocked, checks what a vm cannot: the 700 ms star count-up and its
Calm (reduced-motion) path, focus moving to the primary button once the card arms, the sticky action bar staying on
screen at 390x780, the whisper hidden under a card, keyboard Enter on the primary button, Begin into a stand-in Wood,
and no external requests. Screenshots go to OUT_DIR (default: a temp dir) for a look by eye. Exit 1 on any failure."""
import os, sys, subprocess, tempfile, shutil
from playwright.sync_api import sync_playwright
TESTS = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
VCLOCK = open(os.path.join(SRC, 'vclock.js')).read()
html = subprocess.run(['node', os.path.join(TESTS, 'selftest_e4.js'), '--build-only'], capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1]
out = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='e4_shots_')
os.makedirs(out, exist_ok=True)
fails = []; oks = 0


def ok(c, m):
    global oks
    if c: oks += 1
    else: fails.append(m); print('   FAIL', m)


TAP_TO_CARD = """async () => { for (let i = 0; i < 400 && !document.querySelector('#cards.on .card'); i++) { const b = document.querySelector('#dock button:not(.ef-q)'); if (b) b.click(); window.__advance(60); } return !!document.querySelector('#cards.on .card'); }"""
STARS = """() => [...document.querySelectorAll('#cards .ef-star svg')].map(s => (s.classList.contains('off') ? 'o' : 'X') + (s.classList.contains('pop') ? 'p' : ''))"""

with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    for name, (w, h), calm in [('phone', (390, 780), False), ('desktop', (1280, 720), False), ('calm', (390, 780), True)]:
        print(name)
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference'); ext = []
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
        pg = ctx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
        pg.add_init_script(script=VCLOCK)
        pg.goto('file://' + html)
        pg.evaluate("() => window.__advance(1500)")
        # the menu, with act headings
        pg.evaluate("() => { TB.App.go('menu'); }"); pg.evaluate("() => window.__advance(200)")
        if name == 'phone': pg.screenshot(path=os.path.join(out, 'menu_390.png'))
        ok(pg.evaluate("() => document.querySelector('#menu-body .part h3').textContent") == 'Act 0The Wood', 'menu opens with Act 0, The Wood')
        # level 1 of the fixture, then its card
        pg.evaluate("() => { TB.App.open(TB.REG.e4fix); window.__advance(500); }")
        # D6 decision 8: the unit opens on its description card; Play has focus, the card fits the screen, Enter plays
        ic = pg.evaluate("""() => { const c = document.querySelector('#cards.on .card.ef-intro'); if (!c) return null; const p = c.querySelector('[data-play]'), r = c.getBoundingClientRect();
            return { focus: document.activeElement === p, parts: c.querySelectorAll('.ef-in-part').length, fits: r.bottom <= innerHeight && c.scrollHeight <= c.clientHeight + 1, role: c.getAttribute('role'), modal: c.getAttribute('aria-modal') }; }""")
        ok(bool(ic) and ic['focus'] and ic['role'] == 'dialog' and ic['modal'] == 'true', 'the unit opens on its description card, Play focused (%s)' % ic)
        ok(bool(ic) and ic['fits'], 'the description card fits without scrolling (%s)' % ic)
        if name == 'phone': pg.screenshot(path=os.path.join(out, 'intro_390.png'))
        pg.keyboard.press('Enter'); pg.evaluate("() => window.__advance(700)")
        ok(pg.evaluate("() => !document.querySelector('#cards.on')"), 'Enter on the description card starts the level')
        ok(pg.evaluate(TAP_TO_CARD), 'the fixture reaches its level card')
        pg.evaluate("() => window.TB.Whisper && TB.Whisper.say('Test whisper', 't')")
        st0 = pg.evaluate(STARS)
        ok(st0 == (['X', 'o', 'o'] if calm else ['o', 'o', 'o']), ('Calm: the star is filled at once (%s)' if calm else 'the new star starts hollow (%s)') % st0)
        pg.evaluate("() => window.__advance(320)"); st1 = pg.evaluate(STARS)
        pg.evaluate("() => window.__advance(400)"); st2 = pg.evaluate(STARS)
        if calm:
            ok(st1[0] == 'X' and st2 == ['X', 'o', 'o'], 'Calm: the star lands at once, with no pop (%s, %s)' % (st1, st2))
        else:
            ok(st1[0] in ('Xp',) and st2 == ['Xp', 'o', 'o'], 'the star lands within 700 ms with a pop (%s, %s)' % (st1, st2))
        info = pg.evaluate("""() => { const c = document.querySelector('#cards .card'), bs = [...c.querySelectorAll('.card-btns button')], p = bs[bs.length - 1], r = p.getBoundingClientRect();
            const wh = document.getElementById('whisper'); return { focus: document.activeElement === p, label: p.getAttribute('aria-label'), bottom: r.bottom, h: innerHeight,
            whisper: wh ? getComputedStyle(wh).display : 'none', stars: c.dataset.stars, size: getComputedStyle(c.querySelector('.ef-star svg')).width }; }""")
        ok(info['focus'], 'focus moves to the primary button once the card arms')
        ok(info['bottom'] <= info['h'], 'the primary button is on screen (bottom %s of %s)' % (info['bottom'], info['h']))
        ok(info['whisper'] == 'none', 'the whisper is hidden under the card (%s)' % info['whisper'])
        ok(info['size'] == '36px', 'card stars are 36 px (%s)' % info['size'])
        pg.screenshot(path=os.path.join(out, 'level_%s.png' % name))
        # Why? opens, pages with the keyboard-reachable arrows
        pg.evaluate("() => { const c = document.querySelector('#cards .card'); [...c.querySelectorAll('.card-btns button')].find(b => b.textContent === 'Why?').click(); }")
        wy = pg.evaluate("() => { const w = document.querySelector('#cards .why'); return { shown: !w.hidden && w.offsetHeight > 0, h: w.querySelector('h4').textContent, nav: w.querySelectorAll('.why-nav button').length, minh: Math.min(...[...w.querySelectorAll('.why-nav button')].map(b => b.getBoundingClientRect().height)) }; }")
        ok(wy['shown'] and wy['h'] == 'In nature' and wy['nav'] == 2, 'Why? shows the first chunk with previous and next (%s)' % wy)
        ok(wy['minh'] >= 44, 'Why? arrows are ≥ 44 px (%s)' % wy['minh'])
        if name == 'phone':
            for _ in range(5): pg.evaluate("() => document.querySelector('#cards .why [data-go=\"1\"]').click()")
            pg.screenshot(path=os.path.join(out, 'level_why_model.png'))
        # Enter on the focused primary button plays the next level
        pg.evaluate("() => { const c = document.querySelector('#cards .card'), bs = c.querySelectorAll('.card-btns button'); bs[bs.length - 1].focus(); }")
        pg.keyboard.press('Enter'); pg.evaluate("() => window.__advance(100)")
        ok(pg.evaluate("() => !document.querySelector('#cards.on') && TB.App.ch.level === 1"), 'Enter on Next level plays level 2')
        # levels 2 and 3 → the end card
        for _ in range(2):
            pg.evaluate("() => window.__advance(1200)")
            ok(pg.evaluate(TAP_TO_CARD), 'next card')
            pg.evaluate("() => window.__advance(500)")
            if pg.evaluate("() => document.querySelector('#cards .card').classList.contains('end')"): break
            pg.evaluate("() => { const bs = document.querySelectorAll('#cards .card-btns button'); bs[bs.length - 1].click(); }")
        end = pg.evaluate("() => { const c = document.querySelector('#cards .card'); return { end: c.classList.contains('end') && c.classList.contains('v2'), stars: c.dataset.stars, aria: c.querySelector('.ef-stars').getAttribute('aria-label'), take: !!c.querySelector('.take') }; }")
        ok(end['end'] and end['stars'] == '2' and end['take'], 'the end card (%s)' % end)
        pg.evaluate("() => window.__advance(800)")
        pg.screenshot(path=os.path.join(out, 'end_%s.png' % name))
        # Begin: a stand-in v2 Wood is entered straight from the title
        pg.evaluate("() => { TB.Cards.close(); TB._lichen = TB.REG.lichen; TB.REG.lichen = TB.REG.e4fix; delete TB.Save.d.done.lichen; TB.App.go('title'); }")
        pg.click('#btn-begin'); pg.evaluate("() => window.__advance(200)")
        ok(pg.evaluate("() => TB.App.scr === 'play' && TB.App.ch === TB.REG.e4fix && !!document.querySelector('#cards.on .card.ef-intro')"), 'Begin goes straight into the Wood, behind its description card')
        pg.evaluate("() => { TB.App.exit(); TB.REG.lichen = TB._lichen; TB.App.go('title'); }")
        pg.click('#btn-begin'); pg.evaluate("() => window.__advance(200)")
        ok(pg.evaluate("() => TB.App.scr === 'menu'"), 'Begin with the legacy Wood opens the menu')
        ok(not ext, 'no network requests (%s)' % ext[:2])
        ok(not perr, 'no page errors (%s)' % perr[:1])
        ctx.close()
    # ?v1=1: legacy entry
    ctx = b.new_context(viewport={'width': 390, 'height': 780}); pg = ctx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
    pg.add_init_script(script=VCLOCK); pg.goto('file://' + html + '?v1=1'); pg.evaluate("() => window.__advance(1500)")
    pg.click('#btn-begin'); pg.evaluate("() => window.__advance(200)")
    v1 = pg.evaluate("() => ({ scr: TB.App.scr, first: document.querySelector('#menu-body .part h3').textContent, fix: !!TB.REG.e4fix, style: !!document.getElementById('ef-entry') })")
    print('v1')
    ok(v1['scr'] == 'menu' and v1['first'].endswith('Heredity') and not v1['fix'] and not v1['style'], '?v1=1: legacy menu, no v2 unit, no card style (%s)' % v1)
    ok(not perr, '?v1=1: no page errors')
    ctx.close()
    b.close()
print('screenshots in', out)
print('selftest_e4 (browser):', 'PASS: %d checks' % oks if not fails else '%d FAILED, %d ok' % (len(fails), oks))
sys.exit(1 if fails else 0)
