"""Wave 2 engine integration test (docs/changes/wave2/engine_integration.md).

  python3 tests/selftest_integ.py [OUT_DIR]
  Builds two private copies of source/ into OUT_DIR (default: a temp dir): the full game (every v2 file) and the same plus
  tests/fixtures/integ_fixture.js as v2/integtest.js. Then, in Chromium under vclock with the network blocked:
  1. smoke: the full build loads the title, Begin is pressed, the menu shows, a legacy intro card opens, no console errors
     or warnings, at 390x780 and 1280x720 (and ?v1=1 the same way);
  2. fixture: the menu row of the throwaway chapter opens straight into play; beetles are eaten by real clicks (Fx bursts,
     pops, rings); the dusk Predict ask is moved by a real click on the strip's pq chart and committed by clicking the
     ghost; the band is revealed; the level card opens with data-stars; Next level; the end card; Save.d.s2/lv/stars/done
     hold the stars; localStorage has them; a reload shows them in the menu."""
import os, sys, shutil, subprocess, json, tempfile
from playwright.sync_api import sync_playwright
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VCLOCK = open(os.path.join(SRC, 'vclock.js')).read()
HERE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='ef_integ_')
os.makedirs(HERE, exist_ok=True)


def private_build(name, extra):   # a copy of source/ (top-level files + v2/) plus extra v2 files, built with every v2 file
    P = os.path.join(HERE, 'src_' + name)
    shutil.rmtree(P, ignore_errors=True); os.makedirs(os.path.join(P, 'v2'))
    for f in os.listdir(SRC):
        if os.path.isfile(os.path.join(SRC, f)) and f.endswith(('.js', '.html', '.py')) and f not in ('game.js', 'Endless_Forms_v1.html'):
            shutil.copy(os.path.join(SRC, f), P)
    for f in os.listdir(os.path.join(SRC, 'v2')): shutil.copy(os.path.join(SRC, 'v2', f), os.path.join(P, 'v2'))
    for dst, src in extra.items(): shutil.copy(src, os.path.join(P, 'v2', dst))
    out = os.path.join(HERE, name + '.html')
    subprocess.run(['python3', 'build.py', out], cwd=P, check=True, env=dict(os.environ, V2_ONLY=''), capture_output=True)
    return out


FULL = private_build('full', {})
FIX = private_build('integ_fixture', {'integtest.js': os.path.join(SRC, 'tests', 'fixtures', 'integ_fixture.js')})
fails = []; oks = 0
def ok(c, m):
    global oks
    if c: oks += 1; print('   ok  ', m)
    else: fails.append(m); print('   FAIL', m)

def page(b, w, h, url, store=None):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
    ext = []
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    init = VCLOCK + ("\ntry{localStorage.setItem('ef_v2', %s)}catch(e){}" % json.dumps(store) if store else '')
    pg.add_init_script(script=init)
    pg.goto(url); pg.evaluate("() => window.__advance(1500)")
    return ctx, pg, errs, ext

def to_menu(pg):   # Begin drops into the live Wood when v2/lichen.js is in the build and unfinished (D2 §9); back reaches the menu
    pg.evaluate("() => { if (TB.App.scr === 'play' && TB.App.ch && TB.App.ch.id === 'lichen') { document.getElementById('bar-back').click(); window.__advance(400); } }")

def errbox(pg):
    return pg.evaluate("() => { const e = document.getElementById('err'); return e && getComputedStyle(e).display !== 'none' ? e.textContent.slice(0, 300) : ''; }")

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    # ---------- 1. smoke on the real full build ----------
    for q in ('', '?v1=1'):
        for (w, h) in ((390, 780), (1280, 720)):
            print('smoke', q or '(v2)', '%dx%d' % (w, h))
            ctx, pg, errs, ext = page(b, w, h, 'file://' + FULL + q)
            ok(pg.evaluate("() => document.getElementById('scr-title').classList.contains('on') || TB.App.scr === 'title'"), 'title screen shows')
            pg.click('#btn-begin'); pg.evaluate("() => window.__advance(600)")
            # with v2/lichen.js in the build, Begin drops straight into the live Wood (D2 §9); the back button reaches the menu
            wood = not q and pg.evaluate("() => !!(TB.REG.lichen && TB.REG.lichen.v2 === true)")
            if wood:
                ok(pg.evaluate("() => TB.App.scr === 'play' && TB.App.ch.id === 'lichen' && !!document.querySelector('#cards.on .card.ef-intro')"), 'Begin goes straight into the live Wood, behind its description card (D6 decision 8)')
                pg.click('#cards .card.ef-intro [data-play]'); pg.evaluate("() => window.__advance(400)")
                ok(pg.evaluate("() => !document.querySelector('#cards.on .card')"), 'Play starts the Wood')
                pg.evaluate("() => { document.getElementById('bar-back').click(); window.__advance(400); }")
            scr = pg.evaluate("() => TB.App.scr")
            heads = pg.evaluate("() => [...document.querySelectorAll('#menu-body .part h3')].map(h => h.textContent).slice(0, 2)")
            ok(scr == 'menu', 'Begin opens the menu (%s; %s)' % (scr, heads))
            ok(bool(heads) and (heads[0].startswith('I') if q else heads[0] == 'Act 0The Wood'), 'menu heading is %s' % (heads[:1],))
            # open one chapter that is still legacy in this build and check its intro card, so the shell works past the menu
            pg.evaluate("() => { const id = ['casino', 'mendel', 'web'].find(k => TB.REG[k] && TB.REG[k].v2 !== true); document.querySelector('#menu-body .chap[data-id=\"' + id + '\"]').click(); window.__advance(400); }")
            ok(pg.evaluate("() => !!document.querySelector('#cards.on .card')"), 'a legacy intro card opens')
            pg.screenshot(path=os.path.join(HERE, 'smoke%s_%dx%d.png' % ('_v1' if q else '', w, h)))
            ok(not errs and not errbox(pg) and not pg.evaluate("() => window.__errs.concat(window.__bad)"), 'no console errors (%s %s)' % (errs[:3], errbox(pg)))
            ok(not ext, 'no network requests (%s)' % ext[:2])
            ctx.close()

    # ---------- 2. the throwaway chapter, end to end ----------
    for (w, h) in ((390, 780), (1280, 720)):
        print('fixture %dx%d' % (w, h))
        ctx, pg, errs, ext = page(b, w, h, 'file://' + FIX)
        pg.click('#btn-begin'); pg.evaluate("() => window.__advance(600)")
        to_menu(pg)
        ok(pg.evaluate("() => !!document.querySelector('#menu-body .chap[data-id=\"integtest\"]') && TB.REG.integtest && TB.REG.integtest.title === 'Integration test'"), 'V2.push + PLAN_ADD register the unit and its menu row')
        pg.click('#menu-body .chap[data-id="integtest"]'); pg.evaluate("() => window.__advance(400)")
        ok(pg.evaluate("() => !!document.querySelector('#cards.on .card.ef-intro')"), 'a v2 unit opens on its description card (D6 decision 8)')
        pg.click('#cards .card.ef-intro [data-play]'); pg.evaluate("() => window.__advance(400)")
        st = pg.evaluate("() => ({ scr: TB.App.scr, ch: TB.App.ch && TB.App.ch.id, level: TB.App.ch && TB.App.ch.level, card: !!document.querySelector('#cards.on .card'), v2cls: document.getElementById('scr-play').classList.contains('v2'), layout: document.body.dataset.layout, seed: TB.App.seed })")
        ok(st['scr'] == 'play' and st['ch'] == 'integtest' and not st['card'] and st['v2cls'], 'Play starts level 0, v2 layout %s (%s)' % (st['layout'], st))
        hud = pg.evaluate("() => document.getElementById('hud').textContent")
        ok('Tap a beetle' in hud, 'HUD.say shows firstWords (%r)' % hud[:60])
        for lvl in (0, 1):
            for day in range(2):
                # eat four beetles by real clicks on the stage canvas
                for k in range(4):
                    xy = pg.evaluate("""() => { const ch = TB.App.ch, s = ch.sim.s, i = s.pop.findIndex(b => b.alive), r = document.getElementById('stage').getBoundingClientRect();
                        return [r.left + s.pop[i].x * TB.Stage.w, r.top + s.pop[i].y * TB.Stage.h]; }""")
                    pg.mouse.click(xy[0], xy[1]); pg.evaluate("() => window.__advance(120)")
                fx = pg.evaluate("() => ({ fx: TB.App.ch.fx, parts: TB.Fx.count, phase: TB.App.ch.sim.s.phase, eaten: TB.App.ch.sim.s.eaten })")
                if lvl == 0 and day == 0: ok(fx['fx']['bursts'] >= 4 and fx['phase'] == 'dusk', 'four clicks eat four beetles with Fx juice (%s)' % fx)
                pg.evaluate("() => window.__advance(200)")
                ov = pg.evaluate("() => { const o = TB.Predict.overlay(0); return o && { active: o.active, v: o.v, kind: o.kind, id: o.id }; }")
                if lvl == 0 and day == 0: ok(ov and ov['active'] and ov['kind'] == 'pq', 'dusk opens a Predict ask on the pq chart (%s)' % ov)
                # move the ghost with a real click on the strip canvas at the expectation, then click the ghost to commit
                target = pg.evaluate("() => TB.App.ch._expectNow")
                pt = pg.evaluate("""(v) => { const cv = TB.Strip.canvas(0), m = TB.LiveGraph.map(cv, TB.App.ch.notes().charts[0]), r = cv.getBoundingClientRect();
                    return { x: r.left + m.X(v), y: r.top + m.plot.y + m.plot.h / 2, w: r.width, h: r.height }; }""", target)
                if lvl == 0 and day == 0:
                    shot = os.path.join(HERE, 'fix_ask_%dx%d.png' % (w, h)); pg.screenshot(path=shot)
                g0 = pg.evaluate("() => { const cv = TB.Strip.canvas(0), m = TB.LiveGraph.map(cv, TB.App.ch.notes().charts[0]), r = cv.getBoundingClientRect(); return { x: r.left + m.X(TB.Predict.overlay(0).v), y: r.top + m.plot.y + m.plot.h / 2 }; }")
                # drag the ghost from where it sits to the target (a tap within 24 px of the ghost would commit at once)
                pg.mouse.move(g0['x'], g0['y']); pg.mouse.down()
                for k in range(1, 9): pg.mouse.move(g0['x'] + (pt['x'] - g0['x']) * k / 8, pt['y']); pg.evaluate("() => window.__advance(20)")
                pg.mouse.up(); pg.evaluate("() => window.__advance(120)")
                v1 = pg.evaluate("() => TB.Predict.overlay(0).v")
                pg.mouse.click(pt['x'], pt['y']); pg.evaluate("() => window.__advance(200)")
                ov2 = pg.evaluate("() => { const o = TB.Predict.overlay(0); return { committed: o.committed, band: o.band, expect: o.expect, hit: o.hit }; }")
                pred = pg.evaluate("() => TB.App.ch.sim.s.pred")
                if lvl == 0 and day == 0:
                    ok(abs(v1 - target) < 0.03, 'a drag on the strip chart moves the ghost to %.3f (target %.3f; chart %dx%d)' % (v1, target, pt['w'], pt['h']))
                    ok(ov2['committed'] and ov2['band'] and ov2['hit'], 'clicking the ghost commits through Sim.act; reveal draws the band (%s)' % ov2)
                    ok(len(pred) == 1, 'the prediction is sim state (%s)' % pred)
                pg.evaluate("() => window.__advance(1700)")   # the phone strip, expanded for the ask, folds 1.5 s after the commit
            # level card / end card
            pg.evaluate("() => window.__advance(800)")
            card = pg.evaluate("""() => { const c = document.querySelector('#cards.on .card'); if (!c) return null; const bs = [...c.querySelectorAll('.card-btns button')].map(b => b.textContent);
                const cv = c.querySelector('canvas'); let ink = 0; if (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 400) if (d[i]) ink++; }
                return { cls: c.className, stars: c.dataset.stars, buttons: bs, ink }; }""")
            if lvl == 0:
                ok(card and 'lvl' in card['cls'] and card['stars'] == '2', 'level card: lvl v2, data-stars 2 (%s)' % card)
                ok(card and card['buttons'][-1] == 'Next level' and card['ink'] > 0, 'level card has Next level last and a drawn chart (%s)' % card)
                strip = pg.evaluate("() => { const cv = TB.Strip.canvas(1); if (!cv) return -1; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 40) if (d[i]) n++; return n; }")
                ok(strip > 0, 'the strip drew the LiveGraph trace (%s samples inked)' % strip)
                pg.screenshot(path=os.path.join(HERE, 'fix_lvlcard_%dx%d.png' % (w, h)))
                pg.evaluate("() => window.__advance(500)")
                pg.evaluate("() => { const bs = document.querySelectorAll('#cards.on .card .card-btns button'); bs[bs.length - 1].click(); }")
                pg.evaluate("() => window.__advance(400)")
                ok(pg.evaluate("() => TB.App.ch.level === 1 && !document.querySelector('#cards.on')"), 'Next level plays level 1')
            else:
                ok(card and 'end' in card['cls'] and card['stars'] == '3', 'end card: end v2, data-stars 3 (%s)' % card)
                pg.screenshot(path=os.path.join(HERE, 'fix_endcard_%dx%d.png' % (w, h)))
        sv = pg.evaluate("() => ({ s2: TB.Save.d.s2.integtest, lv: TB.Save.d.lv.integtest, stars: TB.Save.d.stars.integtest, done: TB.Save.d.done.integtest, ls: localStorage.getItem('ef_v2'), size: TB.Save.size() })")
        ok(sv['s2'] == 7 and sv['lv'] == [3, 7] and sv['stars'] == 3 and sv['done'] == 1, 'Save.star2 stored masks: s2 %s, lv %s, stars %s, done %s' % (sv['s2'], sv['lv'], sv['stars'], sv['done']))
        ok(sv['ls'] and 'integtest' in sv['ls'], 'localStorage ef_v2 holds the unit (%s chars)' % (sv['size']))
        ev = pg.evaluate("() => { const L = TB.Events.log; const n = t => L.filter(e => e.type === t && e.unit === 'integtest').length; return { open: n('open'), act: n('act'), predict: n('predict'), level: n('level'), star: n('star') }; }")
        ok(ev['open'] == 2 and ev['act'] >= 20 and ev['predict'] >= 8 and ev['level'] == 2, 'Events logged the run (%s)' % ev)
        ok(not errs and not errbox(pg) and not pg.evaluate("() => window.__errs.concat(window.__bad)"), 'no console errors (%s %s)' % (errs[:3], errbox(pg)))
        warn = pg.evaluate("() => ({ lbl: (TB.Lbl.warnings || []).length, wh: (TB.Whisper.warnings || []).length, hud: (TB.HUD.warnings || []).length, dock: (TB.Dock.warnings || []).length, chart: (TB.LiveGraph.errors || []).length, fx: (TB.Fx.errors || []).length })")
        ok(not any(warn.values()), 'no Lbl/Whisper/HUD/Dock/chart/Fx warnings (%s)' % warn)
        # reload: the stars persist and show in the menu
        store = sv['ls']; ctx.close()
        ctx, pg, errs, ext = page(b, w, h, 'file://' + FIX, store)
        pg.click('#btn-begin'); pg.evaluate("() => window.__advance(600)")
        to_menu(pg)
        m = pg.evaluate("() => { const r = document.querySelector('#menu-body .chap[data-id=\"integtest\"]'); return { stars: r.querySelector('.stars-i').getAttribute('aria-label'), won: r.classList.contains('won'), s2: TB.Save.d.s2.integtest }; }")
        ok(m['stars'] == '3 of 3 stars' and m['won'] and m['s2'] == 7, 'after a reload the menu shows 3 of 3 stars (%s)' % m)
        ok(not errs, 'no console errors after reload (%s)' % errs[:3])
        ctx.close()
    b.close()

print('%d ok, %d failed' % (oks, len(fails)))
sys.exit(1 if fails else 0)
