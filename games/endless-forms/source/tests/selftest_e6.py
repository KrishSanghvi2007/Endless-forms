"""E6 browser self-test: the v2 Hunt extensions, the rigs and the Petri/Strata scenes in Chromium.

  python3 tests/selftest_e6.py [OUT_DIR]

Builds the private fixture build of tests/selftest_e6.js (node tests/selftest_e6.js --build-only), then, under virtual
time (vclock.js with its rAF shim) with the network blocked, plays the fixture Hunt chapter with real mouse clicks at
390x780, 1280x720 and in Calm (reduced motion): taps, a long-press pin, the egg tray and cull, the slide into the graph,
"Lock in" on the dock, trunks with the lens and the ghost-jay thumbnails, two species on two barks. It checks the
act→fx latency (≤ 200 ms), that no canvas text reads NaN or undefined, and that no warning list fills (Lbl, Whisper,
Txt, Snd2, Layer, HUD, Dock). Screenshots of each phase, a rig gallery (Dusk and Paper) and a scene gallery go to OUT_DIR
(default: a temp dir) for a look by eye. Exit 1 on any failure."""
import os, sys, subprocess, tempfile
from playwright.sync_api import sync_playwright
TESTS = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
VCLOCK = open(os.path.join(SRC, 'vclock.js')).read()
html = subprocess.run(['node', os.path.join(TESTS, 'selftest_e6.js'), '--build-only'], capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1]
out = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='e6_shots_')
os.makedirs(out, exist_ok=True)
fails = []; oks = 0


def ok(c, m):
    global oks
    if c: oks += 1
    else: fails.append(m); print('   FAIL', m)


ITEMS = """(k) => { const H = TB.Hunt, r = document.getElementById('scene').getBoundingClientRect();
  return H.items.filter(it => it.alive && (!k || it.kind === k)).map(it => [r.left + it.x * TB.Stage.w, r.top + it.y * TB.Stage.h]); }"""
WARN = """() => ({ lbl: TB.Lbl.warnings.length, wh: TB.Whisper.warnings ? TB.Whisper.warnings.length : 0, txt: TB.Txt.warnings.length, snd: TB.Snd2.warnings.length,
  layer: TB.Layer.warnings.length, hud: TB.HUD.warnings.length, dock: TB.Dock.warnings.length, errs: window.__errs.length, bad: window.__bad.slice(0, 3),
  list: [].concat(TB.Lbl.warnings.map(w => w.text + ': ' + w.why), TB.Txt.warnings, TB.Snd2.warnings, TB.HUD.warnings, TB.Dock.warnings, window.__errs).slice(0, 4) })"""
ADV = "(ms) => window.__advance(ms)"


def clicks(pg, k, n, gap=60):
    for _ in range(n):
        pts = pg.evaluate(ITEMS, k)
        if not pts or pg.evaluate("() => TB.Hunt.state") not in ('hunt', 'dawn'): break
        pg.mouse.click(pts[0][0], pts[0][1]); pg.evaluate(ADV, gap)


def to_phase(pg, ph, limit=200):
    for _ in range(limit):
        if pg.evaluate("() => { const k = TB.Hunt.x && TB.Hunt.x.dk; return k ? k.phase : TB.Hunt.state; }") == ph: return True
        pg.evaluate(ADV, 40)
    return False


with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    for name, (w, h), calm in [('phone', (390, 780), False), ('desktop', (1280, 720), False), ('calm', (390, 780), True)]:
        print(name)
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, reduced_motion='reduce' if calm else 'no-preference'); ext = []
        ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
        pg = ctx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
        pg.add_init_script(script=VCLOCK)
        pg.goto('file://' + html)
        pg.evaluate(ADV, 1500)
        pg.evaluate("() => { TB.Events.debug = true; TB.App.open(TB.REG.e6fix); }"); pg.evaluate(ADV, 600)
        ok(pg.evaluate("() => TB.App.ch === TB.REG.e6fix && TB.App.mode === TB.Hunt && !!TB.Hunt.x"), 'the fixture opens straight into the Hunt (no card)')
        pg.screenshot(path=os.path.join(out, name + '_L0_hunt.png'))
        clicks(pg, 'prey', 3)
        lat = pg.evaluate("() => TB.Events.lat().filter(x => x != null)")
        ok(len(lat) >= 3 and max(lat) <= 200, 'act → fx latency ≤ 200 ms (%s)' % lat[:5])
        ok(pg.evaluate("() => TB.Hunt.eaten") == 3, 'three clicks, three moths eaten')
        # a long press pins
        pts = pg.evaluate(ITEMS, 'prey'); pg.mouse.move(pts[0][0], pts[0][1]); pg.mouse.down(); pg.evaluate(ADV, 520); pg.mouse.up(); pg.evaluate(ADV, 40)
        ok(pg.evaluate("() => TB.Pin.list.length") == 1 and pg.evaluate("() => TB.Hunt.eaten") == 3, 'a long press pins without eating')
        pg.screenshot(path=os.path.join(out, name + '_L0_pinned.png'))
        clicks(pg, 'prey', 12)
        ok(pg.evaluate("() => TB.Hunt.state") == 'dusk', 'fifteen eaten: dusk')
        ok(to_phase(pg, 'eggs'), 'the egg tray opens')
        pg.evaluate(ADV, 240 if not calm else 40); pg.screenshot(path=os.path.join(out, name + '_L0_eggs.png'))
        ok(to_phase(pg, 'slide') and to_phase(pg, 'ask'), 'eggs → slide into the graph → prediction')
        pg.screenshot(path=os.path.join(out, name + '_L0_ask.png'))
        btn = pg.query_selector('#dock button.primary')
        ok(btn is not None and 'Lock in' in btn.text_content(), 'Lock in is the primary dock button')
        if btn: btn.click()
        for _ in range(100):
            if pg.evaluate("() => TB.Hunt.gen") == 2: break
            pg.evaluate(ADV, 40)
        ok(pg.evaluate("() => TB.Hunt.gen === 2 && TB.Hunt.preds.length === 1"), 'gen 2, the prediction scored')
        pg.evaluate(ADV, 400); pg.screenshot(path=os.path.join(out, name + '_L0_gen2.png'))
        # level 1: trunks, lens, ghost jays
        pg.evaluate("() => { TB.App.playLevel(TB.REG.e6fix, 1); }"); pg.evaluate(ADV, 700)
        pg.evaluate("() => TB.Hunt.lens.set('genes')"); pg.evaluate(ADV, 100); pg.screenshot(path=os.path.join(out, name + '_L1_genes.png'))
        pg.evaluate("() => TB.Hunt.lens.set('jars')"); pg.evaluate(ADV, 1400); pg.screenshot(path=os.path.join(out, name + '_L1_jars.png'))
        pg.evaluate("() => TB.Hunt.lens.set('look')")
        clicks(pg, 'prey', 15)
        ok(pg.evaluate("() => TB.Hunt.state") == 'dusk', 'level 1 dusk')
        to_phase(pg, 'slide'); pg.evaluate(ADV, 200); pg.screenshot(path=os.path.join(out, name + '_L1_jays.png'))
        ok(pg.evaluate("() => TB.Hunt.x.jays.length") == 3, 'ghost-jay thumbnails for three trunks')
        # level 2: barks, species, models
        pg.evaluate("() => { TB.App.playLevel(TB.REG.e6fix, 2); }"); pg.evaluate(ADV, 700)
        pg.screenshot(path=os.path.join(out, name + '_L2_species.png'))
        clicks(pg, 'toxic', 1)
        ok(pg.evaluate("() => TB.Hunt.bitter") == 1, 'a toxic insect bites back')
        pg.evaluate(ADV, 120); pg.screenshot(path=os.path.join(out, name + '_L2_bitter.png'))
        wr = pg.evaluate(WARN)
        ok(not perr and wr['errs'] == 0, 'no page errors (%s %s)' % (perr[:2], wr['list']))
        ok(not wr['bad'], 'no NaN or undefined drawn on the canvas (%s)' % wr['bad'])
        for k in ('lbl', 'wh', 'txt', 'snd', 'layer', 'hud', 'dock'): ok(wr[k] == 0, '%s warnings empty (%s)' % (k, wr['list']))
        ok(not ext, 'no external requests (%s)' % ext[:2])
        ctx.close()

    # galleries: every rig at hero, actor and crowd size in Dusk and Paper; the scenes
    for theme in ('dusk', 'paper'):
        ctx = b.new_context(viewport={'width': 1200, 'height': 1650}, device_scale_factor=1); pg = ctx.new_page(); perr = []; pg.on('pageerror', lambda e: perr.append(str(e)))
        pg.add_init_script(script=VCLOCK); pg.goto('file://' + html); pg.evaluate(ADV, 500)
        pg.evaluate("""(theme) => { const TB = window.TB, Rig = TB.Rig; TB.Pal.setTheme(theme, true); const cv = document.createElement('canvas'), W = 1200, H = 1650; cv.width = W; cv.height = H;
          cv.style.cssText = 'position:fixed;left:0;top:0;z-index:9999'; document.body.appendChild(cv); const c = cv.getContext('2d'); c.fillStyle = TB.Pal.ground; c.fillRect(0, 0, W, H);
          const PH = { moth: [{tone:.3},{tone:.7,morph:'band'},{tone:.7,morph:'mottle'},{tone:.7,morph:'speck'},{carb:true},{tone:.6,cg:[0,1],_g:1}], beetle: [{a:[0,0]},{a:[0,1],_g:1},{a:[1,1]},{a:[0,1],dark:.2},{a:[0,1],dark:.85},{a:[1,-1],_g:1}],
            crab: [{claw:'up',ink:'A'},{claw:'down',ink:'a'},{claw:'idle',lum:.2}], stickleback: [{pelvis:1,plates:1},{pelvis:0,plates:0},{pelvis:1,plates:1,red:true}], lizard: [{morph:'O',_l:1},{morph:'B',_l:1},{morph:'Y',_l:1}],
            warbler: [{},{carry:true,ring:2},{chick:true,gape:true}], dungfly: [{sex:'m',size:1},{sex:'m',size:0},{sex:'f',size:.5}], fowl: [{sex:'m',comb:1},{sex:'m',comb:0},{sex:'f'}],
            squirrel: [{pose:'up',blaze:'stripe'},{pose:'up',blaze:'chevron',call:true},{pose:'down',blaze:'spot'}], tit: [{stripe:0},{stripe:1},{stripe:.5,carry:true}], chick: [{fed:0,gape:true},{fed:1}],
            artemia: [{}], isopod: [{}], lobster: [{},{maxi:1}], mantis: [{}], fossil: ['ammonite','trilobite','clam','brachiopod','fish','leaf','tooth','bone','worm','beetle','feather'].map(kind => ({kind})) };
          let x = 20, y = 20, rowH = 0;
          for (const sp in PH) { for (const ph of PH[sp]) { const big = 84; if (x + big > W - 20) { x = 20; y += rowH + 14; rowH = 0; }
            Rig.draw(c, sp, ph, x + big / 2, y + big / 2, { size: big, genes: !!ph._g, letters: !!ph._l }); Rig.draw(c, sp, ph, x + 18, y + big + 22, { size: Rig.size('actor'), id: x }); Rig.draw(c, sp, ph, x + 60, y + big + 22, { size: Rig.size('crowd') });
            x += big + 16; rowH = Math.max(rowH, big + 44); } }
          y += rowH + 30; const g = Rig.ground('rocks', 360, 160, 1, 2); c.drawImage(g.cv, 20, y); Rig.draw(c, 'lizard', {morph:'B'}, 200, y + 80, {size: 120, letters: true});
          const S = TB.Strata, P = TB.Petri, cols = []; for (let i = 0; i < 36; i++) cols.push({ x: TB.Det.cos(i * 2.4) * (0.2 + 0.7 * ((i * 37) % 10) / 10), y: TB.Det.sin(i * 2.4) * (0.2 + 0.7 * ((i * 37) % 10) / 10), variant: i % 9 === 0 });
          P.plate(c, 480, y + 80, 70, { colonies: cols, count: true, jackpot: true }); P.grid(c, { x: 580, y, w: 340, h: 200 }, Array.from({ length: 20 }, (_, i) => ({ colonies: cols.slice(0, i * 2), jackpot: i === 7 })));
          P.rack(c, { x: 950, y, w: 220, h: 190 }, Array.from({ length: 12 }, (_, i) => ({ turbidity: i % 6, label: i === 11 ? 'g 31,000' : null, ring: i === 7 })));
          y += 230; S.section(c, { x: 20, y, w: 420, h: 300 }, { layers: [{ thick: 2, pattern: 'sand' }, { thick: 1, pattern: 'ash', fossils: [{ x: 0.3, kind: 'ammonite' }, { x: 0.7, kind: 'trilobite' }] }, { thick: 3, pattern: 'shale', fossils: [{ x: 0.5, kind: 'fish' }] }, { thick: 1.5, pattern: 'limestone' }, { thick: 1, pattern: 'silt', fossils: [{ x: 0.2, kind: 'worm' }] }], erosion: [{ layer: 2, amp: 0.7 }] });
          S.zircon(c, 560, y + 90, { parents: 7, flash: 6, label: '⅓ left' }); S.ruler(c, { x: 480, y: y + 190, w: 700, h: 60 }, { decades: [3, 10], marks: [{ t: 4e9, kind: 'you', label: 'you' }, { t: 6.6e7, kind: 'truth' }, { t: 2e5, kind: 'tick' }], window: [1e8, 1e7] });
          S.range(c, { x: 760, y: y + 10, w: 400, h: 140, lo: 0, hi: 541e6 }, [{ label: 'Trilobites', found: [521e6, 260e6], inferred: [260e6, 252e6] }, { label: 'Ammonites', found: [400e6, 70e6], inferred: [70e6, 66e6] }, { label: 'Corals', found: [480e6, 0] }]);
          const vv = P.velvet({ x: 480, y: y - 150, r: 70, colonies: cols }, { x: 600, y: y - 150, r: 50 }); window.__vv = vv; }""", theme)
        pg.evaluate(ADV, 100)
        pg.screenshot(path=os.path.join(out, 'gallery_' + theme + '.png'))
        ok(not perr, 'gallery draws with no error (%s)' % perr[:2])
        ok(pg.evaluate("() => TB.Lbl.warnings.length") == 0, 'gallery: no label warnings (%s)' % pg.evaluate("() => TB.Lbl.warnings.slice(0, 3)"))
        ctx.close()
    b.close()

print(('FAILED' if fails else 'PASS') + ': %d passed, %d failed; shots in %s' % (oks, len(fails), out))
sys.exit(1 if fails else 0)
