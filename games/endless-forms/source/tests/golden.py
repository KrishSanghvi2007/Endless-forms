"""Golden trajectories for the 48 legacy chapters (D5 decision 26, §3 item 13).

Each legacy chapter is played by a deterministic driver (tests/golden.js) for a fixed number of
steps from a fixed seed, under virtual time (vclock.js) with Math.random seeded, WebAudio off and
the network blocked (tests/golden_init.js). Every `every` steps it fingerprints the chapter state
(one hash per top-level key of App.mode / App.ch) and the HUD text; it also logs card texts, end
cards (stars, title) and JS errors. Goldens are per browser build: compare within one Chromium.

  python3 tests/golden.py record [HTML]        # write tests/golden/*.json (default: private legacy-only build of current source)
  python3 tests/golden.py check  [HTML]        # compare; exit 1 on any divergence (default: private build of current source, all v2 files)
  python3 tests/golden.py check HTML --v1      # load HTML?v1=1 (zz_v1switch): every legacy id must match, even ids v2 replaces
  python3 tests/golden.py selftest             # determinism proof: record twice into temp dirs and diff them
Options: --ids a,b  --jobs 4  --seed 7  --steps 1600  --every 100  --dir PATH  --legacy-only  --verbose
HTML may also come from $GAME_HTML. Ids that a v2 file replaces are skipped (reported) unless --v1.
Without an HTML argument the script copies source/ to a temp dir and builds there, so it never touches
the shared source/Endless_Forms_v1.html or source/game.js.
"""
import os, sys, json, shutil, subprocess, tempfile, time, argparse
from concurrent.futures import ProcessPoolExecutor

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
GOLD = os.path.join(TESTS, 'golden')
LEGACY_IDS = ['mendel', 'scribe', 'cross', 'census', 'coal', 'casino', 'castaways', 'sex', 'lichen', 'soot', 'fancier', 'sieve',
              'bitter', 'landscape', 'jaws', 'hawks', 'bats', 'brood', 'gametes', 'lek', 'raffle', 'spindle', 'meadow', 'alarm',
              'nest', 'commons', 'many', 'livefast', 'forager', 'crowd', 'plastic', 'lock', 'clinic', 'virulence', 'guest',
              'switch', 'copy', 'sweep', 'clock', 'river', 'fruits', 'ring', 'double', 'arch', 'tree', 'web', 'islands', 'fire']
DEF = dict(seed=7, steps=3000, every=50, viewport=(390, 780))
ABSENT = '-' * 8


def private_build(legacy_only):
    """Copy source/ to a temp dir and build there (build.py also writes game.js into its cwd)."""
    tmp = tempfile.mkdtemp(prefix='ef_golden_')
    for f in os.listdir(SRC):
        if f.endswith('.js') or f in ('shell.html', 'build.py'):
            shutil.copy(os.path.join(SRC, f), tmp)
    if os.path.isdir(os.path.join(SRC, 'v2')):
        shutil.copytree(os.path.join(SRC, 'v2'), os.path.join(tmp, 'v2'))
    env = dict(os.environ)
    env.pop('V2_ONLY', None)
    if legacy_only:
        env['V2_ONLY'] = '__no_v2_files__'
    out = os.path.join(tmp, 'golden_build.html')
    subprocess.run([sys.executable, 'build.py', out], cwd=tmp, env=env, check=True, stdout=subprocess.DEVNULL)
    return out


def run_chunk(args):
    html, ids, seed, steps, every, vw, vh, v1 = args
    from playwright.sync_api import sync_playwright
    init = open(os.path.join(SRC, 'vclock.js')).read() + '\n' + open(os.path.join(TESTS, 'golden_init.js')).read()
    url = 'file://' + os.path.abspath(html) + ('?v1=1' if v1 else '')
    out = {}
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        ver = b.version
        for cid in ids:
            ctx = b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=1)
            ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
            pg = ctx.new_page()
            pg.add_init_script(script=init)
            t0 = time.time()
            try:
                pg.goto(url)
                pg.evaluate("()=>window.__advance(1500)")
                pg.add_script_tag(path=os.path.join(TESTS, 'golden.js'))
                r = pg.evaluate(f"()=>window.__golden({json.dumps(cid)}, {steps}, {seed}, {every})")
            except Exception as e:
                r = {'id': cid, 'status': 'pyexc', 'errs': [str(e).split('\n')[0][:200]], 'cps': [], 'cards': [], 'ends': []}
            r['secs'] = round(time.time() - t0, 1)
            r['browser'] = ver
            out[cid] = r
            ctx.close()
        b.close()
    return out


def run_all(html, ids, o):
    jobs = max(1, min(o.jobs, len(ids)))
    chunks = [ids[i::jobs] for i in range(jobs)]
    args = [(html, c, o.seed, o.steps, o.every, DEF['viewport'][0], DEF['viewport'][1], o.v1) for c in chunks if c]
    res = {}
    if jobs == 1:
        res.update(run_chunk(args[0]))
    else:
        with ProcessPoolExecutor(jobs) as ex:
            for r in ex.map(run_chunk, args):
                res.update(r)
    return res


def compact(r):
    """Per-key hashes -> one key list + one fixed-width hex string per checkpoint."""
    keys = []
    for c in r.get('cps', []):
        for k in c['k']:
            if k not in keys:
                keys.append(k)
    cps = [[c['s'], c['h'], ''.join(c['k'].get(k, ABSENT) for k in keys), c['t']] for c in r.get('cps', [])]
    return {'id': r['id'], 'seed': r.get('seed'), 'steps': r.get('steps'), 'every': r.get('every'), 'status': r['status'],
            'at': r.get('at'), 'vt': r.get('vt'), 'errs': r.get('errs', []), 'ends': r.get('ends', []), 'cards': r.get('cards', []),
            'keys': keys, 'cps': cps}


def expand(g):
    keys = g['keys']
    return [(c[0], c[1], {k: c[2][8 * i:8 * i + 8] for i, k in enumerate(keys) if c[2][8 * i:8 * i + 8] != ABSENT}, c[3]) for c in g['cps']]


def compare(g, r):
    """Return (ok, problems, notes) for golden g (compact) vs fresh run r (compact)."""
    probs, notes = [], []
    if r['status'] in ('v2', 'missing'):
        return None, [], ['skipped: ' + ('a v2 chapter replaces this id (use --v1)' if r['status'] == 'v2' else 'not registered')]
    G, N = expand(g), expand(r)
    for i, (s, h, ks, t) in enumerate(G):
        if i >= len(N):
            probs.append(f'run ended early: golden has a checkpoint at step {s}, run stopped at {r.get("at")} ({r["status"]})')
            break
        s2, h2, ks2, t2 = N[i]
        if s2 != s:
            probs.append(f'checkpoint {i}: step {s2}, golden {s}')
            break
        diff = [k for k in ks if ks2.get(k) != ks[k]]
        extra = [k for k in ks2 if k not in ks]
        if extra and not notes:
            notes.append(f'new state keys (ignored): {", ".join(extra[:8])}')
        if diff or h2 != h:
            msg = f'first divergence at step {s}:'
            if diff:
                msg += f' state keys {", ".join(diff[:10])}' + (' …' if len(diff) > 10 else '')
            if h2 != h:
                msg += f'\n      HUD golden: {t}\n      HUD now:    {t2}'
            probs.append(msg)
            break
    if len(N) > len(G) and not probs:
        probs.append(f'run has {len(N)} checkpoints, golden {len(G)} (golden ended {g["status"]} at {g.get("at")})')
    for fld in ('status', 'errs', 'ends', 'cards'):
        a, b = g.get(fld), r.get(fld)
        if fld == 'cards':
            a, b = [list(x) for x in a or []], [list(x) for x in b or []]
        if fld == 'ends':
            a, b = [list(x) for x in a or []], [list(x) for x in b or []]
        if a != b:
            if fld == 'cards' or fld == 'ends':
                j = next((j for j in range(min(len(a), len(b))) if a[j] != b[j]), min(len(a), len(b)))
                probs.append(f'{fld} differ at #{j}: golden {a[j] if j < len(a) else None} now {b[j] if j < len(b) else None}')
            else:
                probs.append(f'{fld}: golden {a} now {b}')
    return not probs, probs, notes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('cmd', choices=['record', 'check', 'selftest'])
    ap.add_argument('html', nargs='?')
    ap.add_argument('--ids')
    ap.add_argument('--jobs', type=int, default=max(1, min(6, (os.cpu_count() or 2) - 1)))
    ap.add_argument('--seed', type=int, default=DEF['seed'])
    ap.add_argument('--steps', type=int, default=DEF['steps'])
    ap.add_argument('--every', type=int, default=DEF['every'])
    ap.add_argument('--dir', default=GOLD)
    ap.add_argument('--v1', action='store_true', help='append ?v1=1 to the page URL')
    ap.add_argument('--legacy-only', action='store_true', help='private build without any v2 files')
    ap.add_argument('--verbose', action='store_true')
    o = ap.parse_args()
    ids = o.ids.split(',') if o.ids else LEGACY_IDS
    html = o.html or os.environ.get('GAME_HTML')
    if o.cmd == 'selftest':
        html = html or private_build(True)
        a = {k: compact(v) for k, v in run_all(html, ids, o).items()}
        b = {k: compact(v) for k, v in run_all(html, ids, o).items()}
        bad = [k for k in ids if json.dumps(a[k], sort_keys=True) != json.dumps(b[k], sort_keys=True)]
        print('selftest:', 'IDENTICAL' if not bad else 'DIFFERENT: ' + ', '.join(bad), f'({len(ids)} chapters, two runs)')
        sys.exit(1 if bad else 0)
    if not html:
        html = private_build(o.cmd == 'record' or o.legacy_only)
        print('built', html)
    t0 = time.time()
    res = run_all(html, ids, o)
    if o.cmd == 'record':
        os.makedirs(o.dir, exist_ok=True)
        meta = {'seed': o.seed, 'steps': o.steps, 'every': o.every, 'viewport': list(DEF['viewport']), 'v1': o.v1,
                'browser': next(iter(res.values())).get('browser'), 'recorded': time.strftime('%Y-%m-%d %H:%M'),
                'git': subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=SRC, capture_output=True, text=True).stdout.strip(),
                'chapters': {}}
        mp = os.path.join(o.dir, '_meta.json')
        if os.path.exists(mp) and o.ids:
            old = json.load(open(mp))
            meta['chapters'] = old.get('chapters', {})
        for cid in ids:
            r = res[cid]
            if r['status'] in ('v2', 'missing'):
                print(f'{cid:10s} SKIPPED ({r["status"]})')
                continue
            g = compact(r)
            json.dump(g, open(os.path.join(o.dir, cid + '.json'), 'w'), separators=(',', ':'))
            meta['chapters'][cid] = {'status': g['status'], 'at': g['at'], 'cps': len(g['cps']), 'ends': [e[1] for e in g['ends']], 'errs': len(g['errs']), 'secs': r.get('secs')}
            print(f'{cid:10s} {g["status"]:9s} cps={len(g["cps"]):3d} ends={[e[1] for e in g["ends"]]} errs={len(g["errs"])} {r.get("secs")}s', flush=True)
        json.dump(meta, open(mp, 'w'), indent=1)
        print(f'recorded {len(ids)} chapters into {o.dir} in {time.time() - t0:.0f}s')
        return
    # check
    meta = json.load(open(os.path.join(o.dir, '_meta.json')))
    for k in ('seed', 'steps', 'every'):
        if getattr(o, k) != meta[k]:
            print(f'warning: --{k} {getattr(o, k)} differs from the recorded {meta[k]}')
    br = next(iter(res.values())).get('browser')
    if br != meta.get('browser'):
        print(f'warning: browser {br} differs from the recorded {meta.get("browser")}; goldens are per browser')
    fails, skips = [], []
    for cid in ids:
        p = os.path.join(o.dir, cid + '.json')
        if not os.path.exists(p):
            print(f'{cid:10s} NO GOLDEN')
            fails.append(cid)
            continue
        ok, probs, notes = compare(json.load(open(p)), compact(res[cid]))
        if ok is None:
            skips.append(cid)
            print(f'{cid:10s} SKIP  {notes[0]}')
        elif ok:
            print(f'{cid:10s} ok' + (('  (' + notes[0] + ')') if notes and o.verbose else ''))
        else:
            fails.append(cid)
            print(f'{cid:10s} FAIL')
            for m in probs:
                print('    ' + m)
            for m in notes:
                print('    note: ' + m)
    print(f'golden check: {len(ids) - len(fails) - len(skips)} ok, {len(fails)} failed, {len(skips)} skipped ({time.time() - t0:.0f}s)')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
