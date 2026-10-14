"""E7 self-test, browser half: the monkey's v2 path, the rAF shim, Det in Chromium and the screenshot harness.

  python3 tests/selftest_e7.py [BUILD.html]

Without BUILD it asks tests/selftest_e7.js --build-only for a private build that holds the fixtures (the contract
skeleton and tests/fixtures/e7_fixture.js). Checks: the monkey plays the fixture to its end card at 390x780, 1024x768
and 1280x720 (level cards, data-stars, dock, keys, strip drags, never Notes); an over-budget HUD line fails a run;
Mendel and the Fancier reach their end cards; frame() runs on the vclock rAF shim at the legacy cadence; Det gives the
bits of tests/det_vectors.json in Chromium; monkey.py exits 0 and 1 as it should; shots.py writes normal, mono and
deut images. The network is blocked throughout. Exit 1 on any failure.
"""
import os, sys, json, subprocess, tempfile
from playwright.sync_api import sync_playwright

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else subprocess.run(['node', os.path.join(TESTS, 'selftest_e7.js'), '--build-only'], capture_output=True, text=True, check=True).stdout.strip()
VCLOCK = open(os.path.join(SRC, 'vclock.js')).read()
ok_n, bad = 0, []


def t(cond, msg):
    global ok_n
    if cond:
        ok_n += 1
    else:
        bad.append(msg)
        print('FAIL', msg)


def page(b, w=390, h=780, q=''):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
    ext = []
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
    pg = ctx.new_page()
    pg.add_init_script(script=VCLOCK)
    pg.goto('file://' + html + q)
    pg.evaluate("()=>window.__advance(1500)")
    pg.add_script_tag(path=os.path.join(TESTS, 'monkey.js'))
    return ctx, pg, ext


with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    # 1. the monkey's v2 path on the fixture, three viewports
    for (w, h) in [(390, 780), (1024, 768), (1280, 720)]:
        ctx, pg, ext = page(b, w, h)
        r = pg.evaluate("()=>window.__monkey('e7fix', 3000, 1, 0)")
        extra = pg.evaluate("()=>({strip: TB.REG.e7fix.stripHits || 0, v2: document.getElementById('scr-play').classList.contains('v2')})")
        tag = f'{w}x{h}'
        t(r.get('status') == 'end', f'{tag}: monkey reaches the fixture end card ({json.dumps(r)[:200]})')
        t(isinstance(r.get('stars'), int) and 0 <= r['stars'] <= 3, f'{tag}: stars read from data-stars ({r.get("stars")})')
        t(r.get('levels', 0) >= 2, f'{tag}: two level cards passed with their last button ({r.get("levels")})')
        t(r.get('keys', 0) > 0 and r.get('notes') == 0, f'{tag}: keys pressed from ch.keys, Notes never opened ({r.get("keys")}, {r.get("notes")})')
        t(r.get('strip', 0) > 0 and extra['strip'] > 0, f'{tag}: strip drags reach Hooks.chartPointer ({r.get("strip")}, {extra["strip"]})')
        t(extra['v2'], f'{tag}: the fixture runs in the v2 layout')
        t(not ext, f'{tag}: no network requests ({ext[:2]})')
        ctx.close()
    # 2. a warning fails a v2 run
    ctx, pg, ext = page(b, q='?e7warn=1')
    r = pg.evaluate("()=>window.__monkey('e7fix', 400, 1, 0)")
    t(r.get('status') == 'warnings' and 'HUD' in json.dumps(r), f'an over-budget HUD line fails the run ({json.dumps(r)[:200]})')
    ctx.close()
    # 3. Mendel and the Fancier (the old timeouts), and a replay on the fixture
    for cid in ('mendel', 'fancier'):
        ctx, pg, ext = page(b)
        r = pg.evaluate(f"()=>window.__monkey('{cid}', 5200, 2, 0)")
        t(r.get('status') == 'end', f'{cid}: monkey reaches the end card ({json.dumps(r)[:200]})')
        ctx.close()
    ctx, pg, ext = page(b)
    r = pg.evaluate("()=>window.__monkey('e7fix', 4000, 3, 1)")
    t(r.get('status') == 'end' and r.get('played') == 1, f'a v2 replay restarts at level 0 and ends again ({json.dumps(r)[:160]})')
    # 4. the rAF shim drives frame() at the legacy cadence
    rf = pg.evaluate("""()=>{ TB.Cards.close(); TB.App.play(TB.REG.tree); window.__advance(200); const t0 = TB.App.t; window.__advance(400);
                       return {native: /\\[native code\\]/.test(String(requestAnimationFrame)), dt: TB.App.t - t0}; }""")
    t(not rf['native'] and abs(rf['dt'] - 0.4) < 1e-9, f'frame() runs on the vclock rAF shim: 10 frames of 40 ms in 400 ms ({rf})')
    # 5. Det in Chromium against the stored vectors
    ref = json.load(open(os.path.join(TESTS, 'det_vectors.json')))
    got = pg.evaluate("""(ref) => { const dv = new DataView(new ArrayBuffer(8));
        const hex = x => { dv.setFloat64(0, x); let s = ''; for (let i = 0; i < 8; i++) s += dv.getUint8(i).toString(16).padStart(2, '0'); return s; };
        const un = h => { for (let i = 0; i < 8; i++) dv.setUint8(i, parseInt(h.slice(2 * i, 2 * i + 2), 16)); return dv.getFloat64(0); };
        const D = TB.Det, v = ref.v.map(r => hex(r[0] === 'pow' ? D.pow(un(r[1]), un(r[2])) : D[r[0]](un(r[1]))));
        TB.seed(ref.seq.seed); const g = ref.seq.gauss.map(() => hex(D.gauss())); const lam = [0.5, 3, 12, 29.9, 30.1, 80];
        const po = ref.seq.poisson.map((_, i) => D.poisson(lam[i % lam.length])); return {v, g, po, state: TB.R.state()}; }""", ref)
    diff = [i for i, r in enumerate(ref['v']) if r[-1] != got['v'][i]]
    t(not diff, f'Det in Chromium matches det_vectors.json bit for bit ({len(diff)} differ, first {diff[:3]})')
    t(got['g'] == ref['seq']['gauss'] and got['po'] == ref['seq']['poisson'] and got['state'] == ref['seq']['state'], 'Det.gauss and Det.poisson draw the same R() sequence in Chromium')
    ctx.close()
    b.close()

# 6. monkey.py exit codes, and 7. shots.py
r = subprocess.run([sys.executable, os.path.join(TESTS, 'monkey.py'), 'e7fix', '1', '--html', html, '--vp', '390x780,1280x720'], capture_output=True, text=True)
t(r.returncode == 0 and 'e7fix 1 390x780' in r.stdout and '2 of 2 runs' in r.stdout, f'monkey.py: exit 0 when the fixture ends at two viewports ({r.stdout.strip()[-160:]})')
r = subprocess.run([sys.executable, os.path.join(TESTS, 'monkey.py'), 'e7fix', '1', '--html', html, '--query', '?e7warn=1', '--steps', '300'], capture_output=True, text=True)
t(r.returncode == 1 and 'FAILED' in r.stdout, f'monkey.py: exit 1 on a failing run ({r.stdout.strip()[-160:]})')
out = tempfile.mkdtemp(prefix='ef_e7_shots_')
r = subprocess.run([sys.executable, os.path.join(TESTS, 'shots.py'), html, 'e7fix', '--at', '2000', '--play', '6', '--out', out, '--sheet'], capture_output=True, text=True)
files = sorted(os.listdir(out))
t(r.returncode == 0 and len(files) == 10, f'shots.py: 3 viewports x (normal, mono, deut) + sheet ({len(files)} files; {r.stdout.strip()[-200:]} {r.stderr.strip()[-300:]})')
try:
    from PIL import Image
    import numpy as np
    n = np.asarray(Image.open(os.path.join(out, 'e7fix_L0_390x780_2000ms.png')).convert('RGB')).astype(int)
    m = np.asarray(Image.open(os.path.join(out, 'e7fix_L0_390x780_2000ms_mono.png')).convert('RGB')).astype(int)
    d = np.asarray(Image.open(os.path.join(out, 'e7fix_L0_390x780_2000ms_deut.png')).convert('RGB')).astype(int)
    t(np.abs(m[..., 0] - m[..., 1]).max() <= 1 and np.abs(m[..., 1] - m[..., 2]).max() <= 1, 'shots.py: mono is grey')
    t(np.abs(d - n).max() > 8 and n.shape == d.shape, 'shots.py: deut changes the colours, same frame size')
except Exception as e:
    t(False, f'shots.py images: {e}')

print(f'selftest_e7 (browser): {ok_n} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
