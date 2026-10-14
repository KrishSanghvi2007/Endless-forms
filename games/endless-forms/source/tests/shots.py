"""Screenshot harness (API_v2 §11.1; D4 §8: CI 'mono' and 'deut' screenshots at phone, tablet and desktop sizes).

  python3 tests/shots.py BUILD.html ID [--vp 390x780,1024x768,1280x720] [--cvd mono,deut] [--out DIR]
                                       [--level N] [--seed S] [--at 1500,6000] [--play N] [--calm] [--query Q] [--sheet]

ID is a chapter id (opened by deep link: ?unit=ID&level=N&seed=S), or 'title' or 'menu'.
For each viewport the page loads under virtual time (vclock.js, seeded Math.random, network blocked) and is captured
at each --at time in ms after load. --play N makes N seeded random taps and dock or HUD presses (150 ms apart) before
each capture, to reach a mid-game state. Each capture is saved as ID_L<level>_<w>x<h>_<t>ms.png, plus one copy per
--cvd kind (deut, prot, trit, mono): the same pixels through Machado et al. (2009) severity 1 in linear RGB, the
matrices of v2/00_cvd.js, applied with numpy after capture, so every variant shows the identical frame.
--calm emulates prefers-reduced-motion. --sheet also writes ID_sheet.png (rows: viewport and time; columns: vision).
Exit 1 on a JavaScript error, an error box or a network request.
"""
import os, sys, json, argparse
import numpy as np
from PIL import Image

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
M = {  # linear-RGB matrices, rows r, g, b (v2/00_cvd.js)
    'prot': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    'deut': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    'trit': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
    'mono': [[0.2126, 0.7152, 0.0722]] * 3,
}
SEEDED_RANDOM = """(() => { let s = %d >>> 0; Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();"""
PLAY = """([n, sd]) => { let rs = sd; const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
  const cv = document.getElementById('scene');
  for (let i = 0; i < n; i++) {
    const card = document.querySelector('#cards.on .card'); if (card) { window.__advance(150); continue; }
    if (rnd() < 0.25) { const bs = [...document.querySelectorAll('#dock button, #hud button')].filter(b => !b.disabled && b.offsetParent);
      if (bs.length) bs[Math.floor(rnd() * bs.length)].click(); }
    else if (cv) { const r = cv.getBoundingClientRect(), x = r.left + rnd() * r.width, y = r.top + rnd() * r.height;
      for (const t of ['pointerdown', 'pointerup']) cv.dispatchEvent(new PointerEvent(t, {clientX: x, clientY: y, pointerId: 1, bubbles: true})); }
    window.__advance(150);
  } }"""


def cvd(img, kind):
    a = np.asarray(img.convert('RGB'), dtype=np.float64) / 255.0
    lin = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    out = np.clip(lin @ np.array(M[kind]).T, 0, 1)
    enc = np.where(out <= 0.0031308, 12.92 * out, 1.055 * out ** (1 / 2.4) - 0.055)
    return Image.fromarray(np.round(enc * 255).astype(np.uint8), 'RGB')


def sheet(rows, kinds, path, h=360):
    thumbs = [[im.resize((max(1, round(im.width * h / im.height)), h)) for im in row] for row in rows]
    W = max(sum(t.width for t in r) + 8 * (len(r) - 1) for r in thumbs)
    S = Image.new('RGB', (W, len(thumbs) * (h + 8) - 8), (40, 40, 40))
    y = 0
    for r in thumbs:
        x = 0
        for t in r:
            S.paste(t, (x, y))
            x += t.width + 8
        y += h + 8
    S.save(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('html')
    ap.add_argument('id')
    ap.add_argument('--vp', default='390x780,1024x768,1280x720')
    ap.add_argument('--cvd', default='mono,deut')
    ap.add_argument('--out')
    ap.add_argument('--level', type=int, default=0)
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--at', default='1500,6000')
    ap.add_argument('--play', type=int, default=0)
    ap.add_argument('--calm', action='store_true')
    ap.add_argument('--query', default='')
    ap.add_argument('--sheet', action='store_true')
    a = ap.parse_args()
    html = os.path.abspath(a.html)
    out = os.path.abspath(a.out or os.path.join(os.path.dirname(html), 'shots_' + a.id))
    os.makedirs(out, exist_ok=True)
    vps = [tuple(int(v) for v in x.lower().split('x')) for x in a.vp.split(',') if x.strip()]
    kinds = [k for k in a.cvd.split(',') if k]
    for k in kinds:
        if k not in M:
            sys.exit(f'unknown --cvd kind {k}; use deut, prot, trit or mono')
    times = sorted(int(t) for t in a.at.split(',') if t.strip())
    q = [] if a.id in ('title', 'menu') else [f'unit={a.id}', f'level={a.level}', f'seed={a.seed}']
    if a.query:
        q.append(a.query.lstrip('?&'))
    url = 'file://' + html + ('?' + '&'.join(q) if q else '')
    init = open(os.path.join(SRC, 'vclock.js')).read() + '\n' + SEEDED_RANDOM % (a.seed * 7919 + 1)
    from playwright.sync_api import sync_playwright
    problems, rows, saved = [], [], 0
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for (w, h) in vps:
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if a.calm else 'no-preference')
            ext = []
            ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
            pg = ctx.new_page()
            pg.add_init_script(script=init)
            pg.goto(url)
            if a.id == 'menu':
                pg.evaluate("()=>{ window.__advance(200); TB.App.go('menu'); }")
            elif a.id != 'title' and not pg.evaluate(f"()=>!!(window.TB && TB.REG[{json.dumps(a.id)}])"):
                sys.exit(f'no chapter {a.id} in this build')
            t = 0
            for at in times:
                if a.play:
                    pg.evaluate(PLAY, [a.play, a.seed * 31 + at])
                    t += a.play * 150
                if at > t:
                    pg.evaluate(f"()=>window.__advance({at - t})")
                    t = at
                base = os.path.join(out, f'{a.id}_L{a.level}_{w}x{h}_{at}ms')
                pg.screenshot(path=base + '.png')
                img = Image.open(base + '.png')
                row = [img]
                for k in kinds:
                    v = cvd(img, k)
                    v.save(f'{base}_{k}.png')
                    row.append(v)
                rows.append(row)
                saved += 1 + len(kinds)
            errs = pg.evaluate("()=>window.__errs.slice(0, 3)")
            box = pg.evaluate("()=>{ const e = document.getElementById('err'); return e && e.style.display === 'block' ? e.textContent.slice(0, 300) : null; }")
            if errs:
                problems.append(f'{w}x{h}: JS errors {errs}')
            if box:
                problems.append(f'{w}x{h}: error box {box}')
            if ext:
                problems.append(f'{w}x{h}: network requests {ext[:3]}')
            ctx.close()
        b.close()
    if a.sheet and rows:
        sheet(rows, kinds, os.path.join(out, f'{a.id}_sheet.png'))
        saved += 1
    for m in problems:
        print('  FAIL ' + m)
    print(f'shots: {saved} image(s) in {out}' + ('' if not problems else f'; {len(problems)} problem(s)'))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
