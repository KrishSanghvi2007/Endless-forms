"""E2 shell self-test runner: loads a build in Chromium under virtual time and runs tests/selftest_e2.js.

  GAME_HTML=/path/build.html python3 tests/selftest_e2.py      (or pass the path as the first argument)

The core group runs twice: with vclock.js alone (frame() falls back to its 16 ms timer) and with the
requestAnimationFrame shim of tests/golden_init.js (frame() on rAF). The network is blocked: the page must be offline."""
import os, sys, json
from playwright.sync_api import sync_playwright
TESTS = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.environ.get('GAME_HTML', os.path.join(SRC, 'Endless_Forms_v1.html')))
VCLOCK = open(os.path.join(SRC, 'vclock.js')).read()
RAF = "window.requestAnimationFrame = fn => window.setTimeout(() => fn(performance.now()), 16); window.cancelAnimationFrame = id => window.clearTimeout(id);"
RUNS = [  # name, query, viewport, extra init, group, arg
    ('core (timer)', '', (390, 780), '', 'core', None),
    ('core (rAF)', '', (390, 780), RAF, 'core', None),
    ('url', '?unit=casino&level=2&seed=42&teacher=1&locks=mixer.N:40,casino.Ne:12&cvd=deut&lab=x&theme=paper&calm=1', (390, 780), RAF, 'url', None),
    ('teacher', '?teacher=1', (390, 780), RAF, 'teacher', None),
    ('desktop', '', (1280, 720), RAF, 'desktop', 'desktop'),
    ('projector', '?projector=1', (1280, 720), RAF, 'desktop', 'projector'),
    ('v1', '?v1=1&teacher=1', (390, 780), RAF, 'v1', None),
]
fails = 0
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    for name, q, (w, h), extra, group, arg in RUNS:
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1); ext = []
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
        pg = ctx.new_page(); pg.add_init_script(script=VCLOCK + '\n' + extra)
        pg.goto('file://' + html + q); pg.evaluate("()=>window.__advance(1500)")
        pg.add_script_tag(path=os.path.join(TESTS, 'selftest_e2.js'))
        try: r = pg.evaluate("([g, a]) => window.__e2[g](a)", [group, arg])
        except Exception as e: r = {'ok': [], 'bad': ['exception: ' + str(e).split('\n')[0][:300]]}
        if ext: r['bad'].append('network requests: ' + ', '.join(ext[:3]))
        fails += len(r['bad'])
        print(f"{name:14s} {len(r['ok'])} ok, {len(r['bad'])} failed")
        for m in r['bad']: print('   FAIL', m)
        ctx.close()
    b.close()
print('selftest_e2:', 'PASS' if not fails else f'{fails} FAILED')
sys.exit(1 if fails else 0)
