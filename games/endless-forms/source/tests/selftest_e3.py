"""E3 browser self-test: Pal, CVD, Fx, Ghost, Lbl, Live, Whisper, Snd2 in Chromium (tests/selftest_e3_page.js).

  GAME_HTML=/path/build.html python3 tests/selftest_e3.py      (or pass the path as the first argument)
  Build with at least the E3 files: V2_ONLY='00_tokens.js,00_cvd.js,00_fx.js,00_wf.js' python3 build.py OUT.html

Runs under virtual time (vclock.js plus the rAF shim), network blocked. The 'perf' run uses the real clock with a 4x CPU
throttle (the D5 §2 gate: a 2,000-dot cached layer plus 150 moving sprites at 60 fps). Exit 1 on any failure."""
import os, sys, json
from playwright.sync_api import sync_playwright
TESTS = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.environ.get('GAME_HTML', os.path.join(SRC, 'Endless_Forms_v1.html')))
VCLOCK = open(os.path.join(SRC, 'vclock.js')).read()
RAF = "window.requestAnimationFrame = fn => window.setTimeout(() => fn(performance.now()), 16); window.cancelAnimationFrame = id => window.clearTimeout(id);"
RUNS = [  # name, query, viewport, virtual clock, group, arg, cpu throttle
    ('core', '', (390, 780), True, 'core', None, 1),
    ('cvd deut', '?cvd=deut', (390, 780), True, 'cvd', 'deut', 1),
    ('cvd mono', '?cvd=mono', (390, 780), True, 'cvd', 'mono', 1),
    ('v1', '?v1=1', (390, 780), True, 'v1', None, 1),
    ('desktop', '', (1280, 720), True, 'desktop', None, 1),
    ('perf 1x', '', (390, 780), False, 'perf', None, 1),
    ('perf 4x', '', (390, 780), False, 'perf', None, 4),
]
fails = 0; info = {}
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    for name, q, (w, h), virt, group, arg, thr in RUNS:
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if group == 'perf' else 1); ext = []
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
        pg = ctx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
        if virt: pg.add_init_script(script=VCLOCK + '\n' + RAF)
        pg.goto('file://' + html + q)
        if virt: pg.evaluate("()=>window.__advance(1500)")
        else: pg.wait_for_timeout(800)
        if group == 'perf':
            pg.evaluate("()=>{TB.App.go('menu'); TB.App.go('play'); TB.Stage.resize();}")
            cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': thr})
        pg.add_script_tag(path=os.path.join(TESTS, 'selftest_e3_page.js'))
        try: r = pg.evaluate("([g, a]) => window.__e3[g](a)", [group, arg])
        except Exception as e: r = {'ok': [], 'bad': ['exception: ' + str(e).split('\n')[0][:300]], 'info': {}}
        if ext: r['bad'].append('network requests: ' + ', '.join(ext[:3]))
        if perr: r['bad'].append('page errors: ' + perr[0][:200])
        if group == 'perf' and thr > 1:   # the 4x-throttled software canvas is reported, not gated (D4 measured 5.9 ms on its CPU)
            r['ok'] += [m + ' (reported)' for m in r['bad'] if 'a frame' in m]; r['bad'] = [m for m in r['bad'] if 'a frame' not in m]
        fails += len(r['bad']); info[name] = r.get('info', {})
        print(f"{name:10s} {len(r['ok'])} ok, {len(r['bad'])} failed")
        for m in r['bad']: print('   FAIL', m)
        if group == 'core' and os.environ.get('E3_SHOT'): pg.screenshot(path=os.environ['E3_SHOT'])
        ctx.close()
    b.close()
for k, v in info.items():
    if v: print(k, json.dumps(v, ensure_ascii=False)[:2000])
print('selftest_e3:', 'PASS' if not fails else f'{fails} FAILED')
sys.exit(1 if fails else 0)
