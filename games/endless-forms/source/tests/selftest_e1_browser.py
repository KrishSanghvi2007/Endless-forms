"""E1 browser self-test: core.js inside a real Chromium page.

  python3 tests/selftest_e1_browser.py BUILD.html      (or GAME_HTML=BUILD.html)

Checks: Det returns the same bits in the browser as in Node (fingerprint); the save survives a reload in an
iframe where localStorage throws (IndexedDB mirror, D5 gate); SCORM 1.2 found in a parent frame and resumed;
Events stamps records. The build is copied to a temp dir with one line appended inside the IIFE that exposes
{Det, Gen, Save, Events, R} as window.__E1, and served over http://127.0.0.1 (as an LMS or web host would)."""
import os, sys, json, shutil, tempfile, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright

TESTS = os.path.dirname(os.path.abspath(__file__))
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('GAME_HTML')
if not html: sys.exit('usage: selftest_e1_browser.py BUILD.html')

tmp = tempfile.mkdtemp(prefix='ef_e1_')
src = open(html, encoding='utf-8').read()
i = src.rindex('})();')
open(os.path.join(tmp, 'game.html'), 'w', encoding='utf-8').write(src[:i] + 'window.__E1 = { Det, Gen, Save, Events, R };\n' + src[i:])
open(os.path.join(tmp, 'frame.html'), 'w').write('<!doctype html><meta charset="utf-8"><body style="margin:0"><iframe id="f" src="game.html" style="width:390px;height:780px;border:0"></iframe>')
open(os.path.join(tmp, 'lms.html'), 'w').write('''<!doctype html><meta charset="utf-8"><script>
window.LMS = JSON.parse(sessionStorage.getItem('lms') || '{"cmi.suspend_data":""}');
const put = () => sessionStorage.setItem('lms', JSON.stringify(LMS));
window.API = { LMSInitialize: () => 'true', LMSFinish: () => 'true', LMSCommit: () => { put(); return 'true'; }, LMSGetLastError: () => '0',
  LMSGetValue: k => LMS[k] || '', LMSSetValue: (k, v) => { LMS[k] = String(v); return 'true'; } };
</script><body style="margin:0"><div><iframe id="f" src="frame.html" style="width:400px;height:800px;border:0"></iframe></div>''')

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=tmp))
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = 'http://127.0.0.1:%d/' % srv.server_address[1]

fails = []
def ok(c, m):
    print(('ok   ' if c else 'FAIL ') + m, flush=True)
    if not c: fails.append(m)

FP = '''() => { const D = window.__E1.Det, F = new Float64Array(1), U = new Uint32Array(F.buffer); let h = 0x811c9dc5;
  const feed = v => { F[0] = v; for (const w of [U[0], U[1]]) for (let k = 0; k < 4; k++) { h ^= (w >>> (8 * k)) & 255; h = Math.imul(h, 0x01000193); } };
  for (let i = 0; i < 600; i++) { const x = (i - 300) * 1.37 + 0.123; feed(D.exp(x / 3)); feed(D.log(Math.abs(x) + 1e-3)); feed(D.sin(x * 11)); feed(D.cos(x * 11)); feed(D.pow(Math.abs(x) / 50 + 0.01, (i % 37) / 7 - 2)); }
  return (h >>> 0).toString(16); }'''
THROW_LS = "Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });"

def game(pg, depth):   # the frame that holds the game (depth = how many frames up the LMS sits; kept for readability)
    pg.wait_for_load_state('load')
    for _ in range(50):
        for f in pg.frames:
            if f.url.endswith('/game.html'):
                try:
                    f.wait_for_function('() => window.__E1 && window.__E1.Save.d', timeout=2000)
                    return f
                except Exception:
                    pass
        pg.wait_for_timeout(100)
    raise RuntimeError('game frame did not load')

with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    # 1. Det bits in Chromium
    ctx = b.new_context(); pg = ctx.new_page(); pg.goto(base + 'game.html')
    g = game(pg, 0)
    ok(g.evaluate(FP) == '811a6df1', 'Det fingerprint in Chromium matches Node and the CPython port (811a6df1)')
    ok(g.evaluate("() => window.__E1.Save.adapter.kind") == 'local', 'top-level page: localStorage adapter')
    r = g.evaluate("() => { const E = window.__E1.Events; E.clear(); const r = E.emit('act', {a: {k: 'tap'}}); return [r.type, r.unit, typeof r.t, E.csv().split('\\n').length]; }")
    ok(r[0] == 'act' and r[1] is None and r[2] == 'number' and r[3] == 3, 'Events in the page')
    ctx.close()

    # 2. D5 gate: a save survives in an iframe where localStorage throws (IndexedDB mirror)
    ctx = b.new_context(); ctx.add_init_script(script=THROW_LS); pg = ctx.new_page(); pg.goto(base + 'frame.html')
    g = game(pg, 1)
    a = g.evaluate("() => window.__E1.Save.adapter")
    ok(a['kind'] == 'memory' and a['idb'], 'iframe, localStorage throws: memory adapter with IndexedDB mirror (%s)' % a)
    g.evaluate("() => { window.__E1.Save.star2('lichen', 0, 7); window.__E1.Save.d.ui.calm = 1; window.__E1.Save.save(); }")
    g.wait_for_timeout(400)
    pg.reload(); g = game(pg, 1)
    g.wait_for_function("() => window.__E1.Save.d.stars.lichen === 3", timeout=5000)
    st = g.evaluate("() => [window.__E1.Save.d.stars.lichen, window.__E1.Save.d.ui.calm, window.__E1.Save.d.v1stars.lichen]")
    ok(st == [3, 1, 0], 'after reload the IndexedDB copy is adopted (%s)' % st)
    ok(len(g.evaluate("() => window.__E1.Save.code()")) > 10, 'save code available in memory mode')
    ctx.close()

    # 3. SCORM 1.2 API two frames up; suspend_data written, then resumed after a reload
    ctx = b.new_context(); pg = ctx.new_page(); pg.goto(base + 'lms.html')
    g = game(pg, 2)
    ok(g.evaluate("() => window.__E1.Save.adapter.kind") == 'scorm', 'SCORM 1.2 API found two frames up')
    g.evaluate("() => window.__E1.Save.star2('mixer', 1, 3)")
    sd = pg.evaluate("() => LMS['cmi.suspend_data']")
    ok(json.loads(sd)['u']['mixer'] == '0.03' and pg.evaluate("() => LMS['cmi.core.exit']") == 'suspend', 'suspend_data and exit=suspend written (%s)' % sd)
    pg.reload(); g = game(pg, 2)
    ok(g.evaluate("() => window.__E1.Save.d.stars.mixer") == 2, 'resumed from suspend_data after reload')
    ctx.close()
    b.close()
srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
print('FAILED %d' % len(fails) if fails else 'ok: all browser checks passed')
sys.exit(1 if fails else 0)
