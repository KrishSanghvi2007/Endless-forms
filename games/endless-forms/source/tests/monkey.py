"""Monkey test: a seeded random player drives each chapter to its end card (tests/monkey.js).

  python3 tests/monkey.py IDS SEEDS [--vp 390x780,1024x768,1280x720] [--steps N] [--level N] [--replays N]
                                    [--query '?teacher=1'] [--calm] [--jobs N] [--html PATH]
  GAME_HTML=/abs/build.html python3 tests/monkey.py lichen,soot 1,2,3

IDS is a comma list, or 'legacy' (the 48 legacy ids), 'v2' (every v2 chapter in the build) or 'all'.
One line per run: 'id seed json' (plus the viewport when --vp is given), then a summary. 'end' means the run reached
the end card. Runs are deterministic: Math.random is seeded per run and monkey.js seeds R() from the run seed.
The network is blocked; a request to anything but file: or data: fails the run (the game must work offline).
Exit 1 if any run fails, except the known legacy baseline (KNOWN below; API_v2 §11.1), which is reported as 'known'.
--calm emulates prefers-reduced-motion. --steps 0 (default) uses 5200 steps for legacy and 1.5 x the unit's minutes for v2.
"""
import os, sys, json, argparse
from concurrent.futures import ProcessPoolExecutor, as_completed

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)  # the source/ folder
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}  # cloud sandbox chromium
LEGACY_IDS = ['mendel', 'scribe', 'cross', 'census', 'coal', 'casino', 'castaways', 'sex', 'lichen', 'soot', 'fancier', 'sieve',
              'bitter', 'landscape', 'jaws', 'hawks', 'bats', 'brood', 'gametes', 'lek', 'raffle', 'spindle', 'meadow', 'alarm',
              'nest', 'commons', 'many', 'livefast', 'forager', 'crowd', 'plastic', 'lock', 'clinic', 'virulence', 'guest',
              'switch', 'copy', 'sweep', 'clock', 'river', 'fruits', 'ring', 'double', 'arch', 'tree', 'web', 'islands', 'fire']
# Legacy puzzles a blind tapper cannot finish (pre-existing; do not "fix" them in chapter files you do not own).
# Mendel and the Fancier timed out before Wave 2; monkey.js HINTS fixed both, so they are no longer listed.
KNOWN = {'cross': ('stuck', 'timeout'), 'landscape': ('stuck', 'timeout'), 'double': ('stuck', 'timeout')}
SEEDED_RANDOM = """(() => { let s = %d >>> 0; Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();"""


def vp_list(s):
    return [tuple(int(v) for v in x.lower().split('x')) for x in s.split(',') if x.strip()]


def resolve_ids(spec, html):
    if spec not in ('legacy', 'v2', 'all'):
        return spec.split(',')
    if spec == 'legacy':
        return list(LEGACY_IDS)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        pg = b.new_page()
        pg.add_init_script(path=os.path.join(SRC, 'vclock.js'))
        pg.goto('file://' + html)
        pg.evaluate("()=>window.__advance(500)")
        reg = pg.evaluate("()=>TB.ORDER.filter(id=>TB.REG[id]).map(id=>[id, TB.REG[id].v2===true])")
        b.close()
    return [i for i, v in reg if v or spec == 'all']


def run_chunk(args):
    return list(run_iter(*args))


def run_iter(html, jobs, o):
    """One browser for these runs; yields (id, seed, viewport, result) as each run ends."""
    from playwright.sync_api import sync_playwright
    vclock = open(os.path.join(SRC, 'vclock.js')).read()
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for cid, sd, (w, h) in jobs:
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if o['calm'] else 'no-preference')
            ext = []
            ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
            pg = ctx.new_page()
            pg.add_init_script(script=vclock + '\n' + SEEDED_RANDOM % (sd * 7919 + 1))
            try:
                pg.goto('file://' + html + o['query'])
                pg.evaluate("()=>window.__advance(1500)")
                pg.add_script_tag(path=os.path.join(TESTS, 'monkey.js'))
                r = pg.evaluate("([id, steps, sd, rep, opts]) => window.__monkey(id, steps, sd, rep, opts)", [cid, o['steps'], sd, o['replays'], {'level': o['level']}])
            except Exception as e:
                r = {'status': 'pyexc', 'e': str(e)[:300]}
            if ext:
                r = {'status': 'network', 'requests': ext[:3], 'was': r.get('status')}
            ctx.close()
            yield (cid, sd, (w, h), r)
        b.close()


def verdict(cid, r):
    st = r.get('status')
    if st == 'end':
        return 'ok'
    return 'known' if st in KNOWN.get(cid, ()) else 'FAIL'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('ids')
    ap.add_argument('seeds')
    ap.add_argument('--vp', help='viewports, e.g. 390x780,1024x768,1280x720 (default 390x780)')
    ap.add_argument('--steps', type=int, default=0)
    ap.add_argument('--level', type=int, default=0, help='v2 only: start at this level')
    ap.add_argument('--replays', type=int, default=0)
    ap.add_argument('--query', default='', help="extra URL query, e.g. '?teacher=1'")
    ap.add_argument('--calm', action='store_true', help='emulate prefers-reduced-motion: reduce')
    ap.add_argument('--jobs', type=int, default=1)
    ap.add_argument('--html', default=os.environ.get('GAME_HTML') or os.path.join(SRC, 'Endless_Forms_v1.html'))
    a = ap.parse_args()
    html = os.path.abspath(a.html)
    q = a.query if not a.query or a.query.startswith('?') else '?' + a.query
    ids = resolve_ids(a.ids, html)
    seeds = [int(x) for x in a.seeds.split(',') if x.strip()]
    vps = vp_list(a.vp) if a.vp else [(390, 780)]
    runs = [(cid, sd, vp) for cid in ids for sd in seeds for vp in vps]
    o = {'steps': a.steps, 'replays': a.replays, 'level': a.level, 'query': q, 'calm': a.calm}
    jobs = max(1, min(a.jobs, len(runs)))
    res = []
    show = lambda cid, sd, vp, r: print(cid, sd, *(['%dx%d' % vp] if a.vp else []), json.dumps(r, ensure_ascii=False)[:600], flush=True)
    if jobs == 1:
        for item in run_iter(html, runs, o):
            show(*item)
            res.append(item)
    else:
        with ProcessPoolExecutor(jobs) as ex:
            for f in as_completed([ex.submit(run_chunk, (html, [run], o)) for run in runs]):
                for item in f.result():
                    show(*item)
                    res.append(item)
    v = [verdict(cid, r) for cid, sd, vp, r in res]
    fails = [(cid, sd, vp, r.get('status')) for (cid, sd, vp, r), x in zip(res, v) if x == 'FAIL']
    known = sorted({cid for (cid, sd, vp, r), x in zip(res, v) if x == 'known'})
    print(f'monkey: {v.count("ok")} of {len(res)} runs reached the end card' + (f'; known baseline: {", ".join(known)}' if known else '')
          + (f'; FAILED: ' + ', '.join(f'{c} {s} {w}x{h} {st}' for c, s, (w, h), st in fails) if fails else ''))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
