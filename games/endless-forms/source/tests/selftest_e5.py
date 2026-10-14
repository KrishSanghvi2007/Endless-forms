"""E5 browser self-test: v2/01_widgets.js in Chromium, on the e5fix fixture (tests/selftest_e5.js holds it).

  python3 tests/selftest_e5.py [BUILD.html]     without BUILD it asks selftest_e5.js --build-only for a private build
  E5_SHOTS=/dir python3 tests/selftest_e5.py    also writes screenshots there (phone ask, commit, gallery, Evidence, lab)

Virtual time (vclock.js plus the rAF shim), network blocked. Checks real pointer drags and taps on the strip canvas, the
keyboard path (P, arrows, Enter), the phone strip opening for an ask, the band after commit, Calm, a chart gallery in three
themes, Evidence clicks, the scene lab, and no page errors, network requests or budget warnings. Exit 1 on any failure."""
import os, sys, json, subprocess
from playwright.sync_api import sync_playwright
TESTS = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
html = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else subprocess.run(['node', os.path.join(TESTS, 'selftest_e5.js'), '--build-only'], capture_output=True, text=True, check=True).stdout.strip()
VCLOCK = open(os.path.join(SRC, 'vclock.js')).read()
RAF = "window.requestAnimationFrame = fn => window.setTimeout(() => fn(performance.now()), 16); window.cancelAnimationFrame = id => window.clearTimeout(id);"
SHOTS = os.environ.get('E5_SHOTS')
fails = 0; oks = 0

def t(cond, msg):
    global fails, oks
    if cond: oks += 1
    else: fails += 1; print('   FAIL', msg)

def page(b, w, h, q, calm=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce' if calm else 'no-preference'); ext = []
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
    pg = ctx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
    pg.add_init_script(script=VCLOCK + '\n' + RAF)
    pg.goto('file://' + html + q); pg.evaluate("() => window.__advance(1500)")
    return ctx, pg, ext, perr

def adv(pg, ms): pg.evaluate(f"() => window.__advance({ms})")
def shot(pg, name):
    if SHOTS: os.makedirs(SHOTS, exist_ok=True); pg.screenshot(path=os.path.join(SHOTS, name + '.png'))

GEO = """i => { const cv = TB.Strip.canvas(i); if (!cv || !cv._lg) return null; const r = cv.getBoundingClientRect(), G = cv._lg.G;
  return { left: r.left, top: r.top, w: r.width, h: r.height, bar: G.bar || null, plot: G.plot || null, kind: TB.Predict.cur ? TB.Predict.cur.kind : null }; }"""
WARN = """() => ({ lbl: (TB.Lbl && TB.Lbl.warnings.length) || 0, wh: (TB.Whisper && TB.Whisper.warnings.length) || 0, hud: TB.HUD.warnings.length, dock: TB.Dock.warnings.length, lg: TB.LiveGraph.errors.length, err: document.getElementById('err').style.display === 'block' ? document.getElementById('err').textContent.slice(0, 200) : '' })"""

with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    for (w, h, tag) in [(390, 780, 'phone'), (1280, 720, 'desktop')]:
        print(f'{tag} {w}x{h}')
        ctx, pg, ext, perr = page(b, w, h, '?unit=e5fix&level=0&seed=5')
        st = pg.evaluate("() => ({ ask: !!TB.Predict.cur, kind: TB.Predict.cur && TB.Predict.cur.kind, open: TB.Strip.isOpen, layout: document.body.dataset.layout })")
        t(st['ask'] and st['kind'] == 'pq', f'{tag}: the fixture opens a pq ask ({st})')
        t(st['open'] == (tag == 'phone'), f'{tag}: the phone strip opens for an ask, the desktop column does not ({st})')
        shot(pg, f'{tag}_ask')
        g = pg.evaluate(GEO, 0); t(g and g['bar'], f'{tag}: chart 0 drawn with a bar ({g})')
        if g and g['bar']:
            bx = lambda f: g['left'] + g['bar']['x'] + f * g['bar']['w']; by = g['top'] + g['bar']['y'] + g['bar']['h'] / 2
            pg.mouse.move(bx(0.5), by); pg.mouse.down(); pg.mouse.move(bx(0.4), by, steps=4); pg.mouse.move(bx(0.3), by, steps=4); pg.mouse.up()
            v = pg.evaluate("() => TB.Predict.cur && TB.Predict.cur.v"); t(v is not None and abs(v - 0.3) < 0.01, f'{tag}: a real drag moves the ghost to 0.3 ({v})')
            pg.mouse.click(bx(0.3), by); adv(pg, 120)
            r = pg.evaluate("() => { const s = TB.REG.e5fix.sim.s, id = s.asks[0]; return { v: s.pred[id], ov: TB.Predict.overlay(0) && { band: TB.Predict.overlay(0).band, exp: TB.Predict.overlay(0).expect } }; }")
            t(r['v'] is not None and abs(r['v'] - 0.3) < 0.01, f'{tag}: tapping the ghost commits through Sim.act ({r})')
            t(r['ov'] and r['ov']['exp'] == 0.5 and abs(r['ov']['band'][0] - 0.4) < 1e-9, f'{tag}: reveal draws the band on the expectation ({r})')
            adv(pg, 500); shot(pg, f'{tag}_revealed')
        # keyboard path on the second ask
        adv(pg, 800); t(pg.evaluate("() => !!TB.Predict.cur"), f'{tag}: second ask open')
        pg.keyboard.press('p'); pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowRight'); pg.keyboard.press('Shift+ArrowRight')
        v = pg.evaluate("() => TB.Predict.cur && TB.Predict.cur.v"); t(v is not None and abs(v - 0.64) < 1e-9, f'{tag}: P, arrows, Shift+arrow move the ghost ({v})')
        shot(pg, f'{tag}_keys'); pg.keyboard.press('Enter'); adv(pg, 100)
        v = pg.evaluate("() => { const s = TB.REG.e5fix.sim.s; return s.pred[s.asks[1]]; }"); t(v is not None and abs(v - 0.64) < 1e-9, f'{tag}: Enter commits ({v})')
        # the dock button on the third ask (Predict.commit), then the level card, then the trace and triangle levels
        adv(pg, 800); pg.click('#dock button[data-id=commit]'); adv(pg, 600)
        t(pg.evaluate("() => !!document.querySelector('#cards .card.lvl, #cards .card.end')"), f'{tag}: the level card opens after three predictions')
        if tag == 'phone': adv(pg, 1600); t(not pg.evaluate("() => TB.Strip.isOpen"), 'phone: the strip the asks opened closes after the last commit')
        pg.evaluate("() => TB.App.playLevel(TB.REG.e5fix, 1, {seed: 6})"); adv(pg, 800)
        g = pg.evaluate(GEO, 0); t(g and g['kind'] == 'y' and g['plot'], f'{tag}: trace level opens a y ask ({g})')
        if g and g['plot']:
            x = g['left'] + g['plot']['x'] + g['plot']['w'] * 0.6; y = g['top'] + g['plot']['y'] + g['plot']['h'] * 0.25
            pg.mouse.click(x, y); v = pg.evaluate("() => TB.Predict.cur && TB.Predict.cur.v"); t(v is not None and abs(v - 0.75) < 0.03, f'{tag}: a tap on the trace sets y ({v})')
            shot(pg, f'{tag}_trace')
        pg.evaluate("() => TB.App.playLevel(TB.REG.e5fix, 2, {seed: 7})"); adv(pg, 800)
        g = pg.evaluate(GEO, 0); t(g and g['kind'] == 'tri', f'{tag}: triangle level opens a tri ask')
        tri = pg.evaluate("() => { const cv = TB.Strip.canvas(0), G = cv._lg.G, r = cv.getBoundingClientRect(), q = G.P([0.6, 0.3, 0.1]); return [r.left + q[0], r.top + q[1]]; }")
        pg.mouse.click(tri[0], tri[1]); v = pg.evaluate("() => TB.Predict.cur && TB.Predict.cur.v")
        t(v and abs(v[0] - 0.6) < 0.03 and abs(v[1] - 0.3) < 0.03, f'{tag}: a tap on the triangle sets the shares ({v})')
        pg.mouse.click(tri[0], tri[1]); adv(pg, 500); shot(pg, f'{tag}_tri')
        t(pg.evaluate("() => { const s = TB.REG.e5fix.sim.s; return Array.isArray(s.pred[s.asks[0]]); }"), f'{tag}: the triangle commit is stored')
        wn = pg.evaluate(WARN); t(not any(wn.values()), f'{tag}: no budget warnings, chart errors or error box ({wn})')
        t(not ext, f'{tag}: no network requests ({ext[:2]})'); t(not perr, f'{tag}: no page errors ({perr[:1]})')
        if tag == 'desktop':   # a gallery of every chart type in three themes, plus Evidence on a card
            pg.evaluate("() => TB.App.exit()")
            gal = pg.evaluate("""() => {
              const S = {
                trace: { type: 'trace', title: 'a share', x: { lo: 1, hi: 10, label: 'generation' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: [0.2, 0.3, 0.38, 0.5, 0.55], ink: 'a', label: 'a share' }, { d: [0.5, 0.45, 0.4, 0.42, 0.38], ink: 'A', label: 'you', you: true }], fan: [[0.2, 0.25, 0.3, 0.28], [0.2, 0.15, 0.2, 0.26]], ghost: [{ d: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], label: 'neutral' }], marks: [4], target: { lo: 0.6, hi: 0.8 }, frame: 'designed' },
                dots: { type: 'dots', title: 'Wing tone', x: { lo: 0, hi: 1, label: 'tone' }, bins: 16, groups: [{ v: [0.1, 0.15, 0.2, 0.22, 0.3, 0.8, 0.85], style: 'hollow', label: 'eaten' }, { v: [0.45, 0.5, 0.52, 0.55, 0.6, 0.62, 0.66, 0.7], style: 'solid', label: 'spared' }, { v: [0.4, 0.5, 0.55, 0.58], style: 'hatched', label: 'young' }], arrows: { S: [0.42, 0.58], R: [0.42, 0.5] }, frame: 'real', source: 'test' },
                pq: { type: 'pq', title: 'Gene pool', p: 0.62, n: 80, ghost: 0.55, frame: 'designed' },
                pq4: { type: 'pq', title: 'Five alleles', parts: [{ v: 3, allele: 0 }, { v: 2, allele: 1 }, { v: 2, allele: 2 }, { v: 1, allele: 3 }, { v: 2, allele: 5 }], n: 70 },
                tri: { type: 'tri', title: 'Genotypes', variant: 'hw', pts: [{ f: [0.5, 0.0, 0.5], kind: 'dawn', label: 'dawn' }, { f: [0.25, 0.5, 0.25], kind: 'dusk', label: 'dusk' }, { f: [0.3, 0.3, 0.4], kind: 'you' }], trail: [[0.5, 0, 0.5], [0.25, 0.5, 0.25]] },
                simplex: { type: 'tri', title: 'Throat morphs', variant: 'simplex', corners: ['O', 'B', 'Y'], pts: [{ f: [0.2, 0.5, 0.3], kind: 'dusk' }], trail: [[0.6, 0.2, 0.2], [0.3, 0.4, 0.3], [0.2, 0.5, 0.3]] },
                scatter: { type: 'scatter', title: 'Diet vs supply', x: { label: 'available' }, y: { label: 'eaten' }, series: [{ pts: [[0.1, 0.2], [0.3, 0.25], [0.6, 0.75], [0.8, 0.9]], shape: 'disc', ink: 'A', label: 'dark' }, { pts: [[0.2, 0.1], [0.5, 0.4]], shape: 'square', label: 'mid' }, { pts: [[0.4, 0.6]], shape: 'tri', label: 'pale' }], ref: 'diag', fit: [[0, 0.05], [1, 0.95]] },
                xhud: { type: 'xhud', title: 'X copies', female: [0.3, 0.5, 0.2], pf: 0.55, pm: 0.25, trail: [[0.7, 0.1], [0.4, 0.7], [0.55, 0.4]] },
                deme: { type: 'deme', title: 'Islands', demes: [{ x: 0.05, y: 0.2, p: 0.8, N: 100, label: 'west' }, { x: 0.95, y: 0.3, p: 0.2, N: 50, label: 'east' }, { x: 0.5, y: 0.9, p: 0.5, N: 80, label: 'south' }], links: [{ a: 0, b: 1, m: 0.05 }, { a: 1, b: 0, m: 0.01 }, { a: 2, b: 0, m: 0.02 }] },
                price: { type: 'price', title: 'Two levels', between: 0.04, within: -0.03, total: 0.01 },
                tree: { type: 'tree', title: 'Who is related', nodes: [{ id: 'r' }, { id: 'x', parent: 'r' }, { id: 'A', parent: 'x', label: 'Whale' }, { id: 'B', parent: 'x', label: 'Hippo' }, { id: 'C', parent: 'r', label: 'Shark' }] },
                genome: { type: 'genome', title: 'Genome scan', chroms: [{ lo: 0, hi: 100, label: '1' }, { lo: 100, hi: 180, label: '2' }, { lo: 180, hi: 240, label: '3' }], pts: Array.from({ length: 2400 }, (_, i) => [i / 10, (i * 7919 % 1000) / 200 + (Math.abs(i - 1300) < 20 ? 6 : 0)]), thr: { v: 7.3, label: 'threshold' }, truth: [130] }
              };
              const box = document.createElement('div'); box.id = 'gal'; box.style.cssText = 'position:fixed;inset:0;z-index:99;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:6px;overflow:auto;background:#777';
              document.body.appendChild(box); let n = 0;
              for (const th of ['dusk', 'paper', 'projector']) for (const k in S) { if (th === 'projector' && !['trace', 'pq', 'tri', 'dots'].includes(k)) continue; const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:' + (k === 'pq' ? 78 : 150) + 'px;background:' + (th === 'dusk' ? '#1C2A28' : th === 'paper' ? '#E8DFC9' : '#FFFDF6'); box.appendChild(cv); TB.LiveGraph.draw(cv, S[k], th); n++; }
              return { n, errors: TB.LiveGraph.errors.length };
            }""")
            t(gal['n'] >= 28 and gal['errors'] == 0, f'gallery: every type in Dusk and Paper, four in Projector ({gal})')
            shot(pg, 'gallery')
            pg.evaluate("() => document.getElementById('gal').remove()")
            pg.evaluate("""() => { const box = TB.Cards.open({ cls: 'v2', html: '<h3>Evidence</h3><div id="evh"></div>', buttons: [{ t: 'Close', fn: () => TB.Cards.close() }] });
              window.__ev = TB.Evidence.create({ budget: 12, truth: 'pale', hypotheses: [{ id: 'pale', label: 'Pale survive' }, { id: 'none', label: 'No difference' }],
                instruments: [{ id: 'trap', name: 'Moth trap', cost: 3, sample: n => Array.from({ length: 10 }, (_, i) => i) }, { id: 'site', name: 'Rest sites', cost: 5, sample: () => ({ n: 5 }) }],
                power: b => Math.min(1, b.length * 0.35), posterior: b => ({ pale: 0.55 + 0.1 * b.length, none: 0.45 - 0.1 * b.length }) });
              window.__ev.mount(box.querySelector('#evh')); }""")
            adv(pg, 500)
            pg.click('.ev-tile >> nth=0'); pg.click('.ev-tile >> nth=1'); pg.click('.ev-hyp >> nth=0'); pg.click('.ev-c >> nth=3'); pg.click('.ev-go')
            ev = pg.evaluate("() => ({ left: __ev.left, done: __ev.done && { brier: __ev.done.brier, conf: __ev.done.conf }, pips: document.querySelectorAll('.ev-pips').length })")
            t(ev['left'] == 4 and ev['done'] and ev['done']['conf'] == 0.8 and abs(ev['done']['brier'] - 0.08) < 1e-9 and ev['pips'] == 2, f'Evidence: clicks buy, pick, set confidence and conclude ({ev})')
            shot(pg, 'evidence')
        ctx.close()
    # Calm: the band appears at once; Paper theme in dev; the scene lab
    print('calm + lab')
    ctx, pg, ext, perr = page(b, 390, 780, '?unit=e5fix&level=0&seed=5&dev=1&theme=paper', calm=True)
    pg.evaluate("() => TB.Predict.commit()"); adv(pg, 50)
    t(pg.evaluate("() => TB.Predict.overlay(0) && TB.Predict.overlay(0).hatch") == 1, 'Calm: the band is drawn at once, no hatch-in')
    t(pg.evaluate("() => TB.Pal.theme") == 'paper', 'paper theme in dev'); shot(pg, 'paper_calm')
    ctx.close()
    ctx, pg, ext, perr = page(b, 1280, 720, '?lab=e5fix&dev=1&level=1&seed=9')
    lab = pg.evaluate("() => ({ panel: !!document.getElementById('scenelab'), sliders: document.querySelectorAll('#scenelab input[type=range]').length, levels: document.querySelectorAll('#scenelab .sl-lv').length, ch: TB.App.ch && TB.App.ch.id, level: TB.App.ch && TB.App.ch.level, seed: TB.App.seed })")
    t(lab['panel'] and lab['sliders'] == 1 and lab['levels'] == 3 and lab['ch'] == 'e5fix' and lab['level'] == 1 and lab['seed'] == 9, f'lab: ?lab=&dev=1 opens the unit at the level and seed, with the panel ({lab})')
    pg.click('#scenelab .sl-lv >> nth=2'); adv(pg, 200); t(pg.evaluate("() => TB.App.ch.level") == 2 and pg.evaluate("() => TB.App.seed") == 9, 'lab: a level chip restarts with the same seed')
    shot(pg, 'lab'); t(not perr and not ext, f'lab: no page errors or requests ({perr[:1]} {ext[:1]})')
    ctx.close()
    b.close()
print('selftest_e5.py:', 'PASS' if not fails else f'{fails} FAILED', f'({oks} checks ok)')
sys.exit(1 if fails else 0)
