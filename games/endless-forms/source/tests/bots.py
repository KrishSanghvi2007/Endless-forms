"""Five-bot sweep (D5 §3.4, API_v2 §11.3): no simple bot may earn three stars in any level.

  python3 tests/bots.py BUILD.html <id>[,<id>…]|v2 [--seeds 1-20] [--bots alwaysA,alwaysB,random,greedy,threshold]
                                                   [--levels 0,2] [--every K] [--untimed] [--jobs N]

Runs tests/bots.js (Node, headless through tests/vmgame.js) once per id, in parallel, and prints each bot x level
table. 'v2' sweeps every v2 chapter in the build. Exit 1 if any bot earns three stars on any seed, or a sim throws.
"""
import os, sys, json, argparse, subprocess
from concurrent.futures import ThreadPoolExecutor

TESTS = os.path.dirname(os.path.abspath(__file__))
LIST = "const {load}=require(%r); const R=load(process.argv[1]).TB.REG; console.log(JSON.stringify(Object.keys(R).filter(k=>R[k]&&R[k].v2===true)))"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('html')
    ap.add_argument('ids')
    ap.add_argument('--seeds', default='1-20')
    ap.add_argument('--bots')
    ap.add_argument('--levels')
    ap.add_argument('--every', type=int)
    ap.add_argument('--untimed', action='store_true')
    ap.add_argument('--jobs', type=int, default=4)
    a = ap.parse_args()
    html = os.path.abspath(a.html)
    if a.ids == 'v2':
        ids = json.loads(subprocess.run(['node', '-e', LIST % os.path.join(TESTS, 'vmgame.js'), html], capture_output=True, text=True, check=True).stdout)
        if not ids:
            print('bots: no v2 chapters in this build')
            return
    else:
        ids = [i for i in a.ids.split(',') if i]
    extra = ['--seeds', a.seeds] + (['--bots', a.bots] if a.bots else []) + (['--levels', a.levels] if a.levels else []) \
        + (['--every', str(a.every)] if a.every else []) + (['--untimed'] if a.untimed else [])
    run = lambda cid: (cid, subprocess.run(['node', os.path.join(TESTS, 'bots.js'), html, cid] + extra, capture_output=True, text=True))
    fails = []
    with ThreadPoolExecutor(max(1, a.jobs)) as ex:
        for cid, p in ex.map(run, ids):
            print(p.stdout.rstrip())
            if p.stderr.strip():
                print(p.stderr.rstrip()[-2000:])
            if p.returncode:
                fails.append(cid)
    print(f'bots: {len(ids) - len(fails)} of {len(ids)} chapter(s) pass' + (f'; FAILED: {", ".join(fails)}' if fails else ''))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
