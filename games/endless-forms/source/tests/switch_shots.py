"""Screenshots of every level of Switches (v2/switch.js), driven through real pointer events where it matters.

  python3 tests/switch_shots.py BUILD.html OUTDIR [--vp 390x780,1280x720] [--seed 3] [--cvd mono,deut] [--levels 0,1,2,3,4,5]

Each viewport loads ?unit=switch&level=N&intro=0 under virtual time (vclock.js, seeded Math.random, network blocked) and saves a
PNG at each moment worth looking at: the paint board, a hatch (larva, pupa, adult), the judged fly, each prediction and its
reveal, the chromosome fan, the crustaceans, the Pitx1 board, the lake and the level cards. The player is competent: it paints
the order's solution through canvas taps and commits predictions at the sim's expectation. With --intro it also shoots the
opening description card. Exit 1 on a JavaScript error, an error box, bad canvas text, a label or whisper warning, or a network request.
"""
import os, sys, argparse

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
SEEDED_RANDOM = """(() => { let s = %d >>> 0; Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();"""

HELP = r"""
window.__sw = {
  ch() { return TB.REG.switch; }, s() { return TB.REG.switch.sim.s; }, K() { return TB.SWITCH.K; },
  ptr(type, x, y) { const cv = document.getElementById('scene'), r = cv.getBoundingClientRect(); cv.dispatchEvent(new PointerEvent(type, { clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true, cancelable: true })); },
  tap(x, y) { this.ptr('pointerdown', x, y); this.ptr('pointerup', x, y); },
  drag(x0, y0, x1, y1) { this.ptr('pointerdown', x0, y0); for (let k = 1; k <= 6; k++) this.ptr('pointermove', x0 + (x1 - x0) * k / 6, y0 + (y1 - y0) * k / 6); this.ptr('pointerup', x1, y1); },
  cell(g, j) { const G = this.ch().geo(); this.tap(G.cx0 + (j + 0.5) * G.cw, G.by + (g + 0.5) * G.rh); },
  act(a) { TB.Sim.act(this.ch(), a); },
  dock(id) { const b = document.querySelector('#dock [data-id="' + id + '"]') || [...document.querySelectorAll('#dock button')].find(x => x.textContent.trim() === id); if (b) b.click(); return !!b; },
  commit() { const ch = this.ch(), s = this.s(); if (!s.ask) return false; const e = ch.sim.expect(s.ask.id), P = TB.Predict;
    if (P && P.cur && P.cur.id === s.ask.id) { P.cur.v = e; P.cur.moved = true; P.commit(); } else this.act({ k: 'predict', id: s.ask.id, v: e }); return true; },
  paintSolution() {   // tap the cells (or drag the tabs) that solve the current order
    const ch = this.ch(), s = this.s(), J = s.jobs[s.job], K = this.K(), G = ch.geo(); this.dock('reset');
    if (J.k === 'build') { const c = K.SOL[J.id]; const cur = s.grid[c[0]][c[1]]; let n = c[0] === 2 ? ((c[2] - cur + 3) % 3) : 1; for (let k = 0; k < n; k++) this.cell(c[0], c[1]); }
    else if (J.k === 'bound') { const b = K.MUT[J.id], T = ch.tabs(G); for (let g = 0; g < 5; g++) if (b[g] !== s.b[g]) { const x1 = b[g] >= 7 ? G.cx0 + 7 * G.cw + 14 : G.cx0 + b[g] * G.cw; this.drag(T[g].x, T[g].y, x1, T[g].y); } }
    else if (J.k === 'crust') { const C = ch.crGeo(G); this.drag(C.edgeX(s.ub), C.ry, C.edgeX(K.CR[J.id].maxi + 1), C.ry); }
  },
  markTruth() { const s = this.s(), ids = TB.SWITCH.ident(s.grid), G = this.ch().geo(); ids.forEach((id, j) => { if (/^T/.test(id)) this.tap(G.X(j), G.cy); }); },
  until(f, max) { for (let k = 0; k < (max || 400); k++) { if (f()) return true; window.__advance(40); } return false; },
  phase(p, max) { const L = Array.isArray(p) ? p : [p]; return this.until(() => L.indexOf(this.s().phase) >= 0, max); },
  finishJob() {   // solve and pass the current order or ask
    const s = this.s(), J = s.jobs[s.job]; if (!J) return;
    if (s.phase === 'paint') { this.paintSolution(); window.__advance(80); this.dock('hatch'); }
    else if (s.phase === 'ask') { if (s.ask.kind === 'set') { this.markTruth(); window.__advance(80); this.dock('lock'); } else this.commit(); }
    const j = s.job; this.until(() => this.s().job !== j || this.s().phase === 'over', 300);
  },
  test(m, tis) { const ch = this.ch(), B = ch.board(ch.geo()); this.tap(B.mx(m), B.my); window.__advance(200); if (!tis.length) this.dock('none'); for (const t of tis) this.tap(B.tis[t][0], B.tis[t][1]); window.__advance(100); this.dock('lock'); },
  card() { return document.querySelector('#cards.on .card'); },
  next() { const c = this.card(); if (!c) return false; const bs = [...c.querySelectorAll('.card-btns button')]; bs[bs.length - 1].click(); window.__advance(400); return true; },
  warnings() { const L = (TB.Lbl && TB.Lbl.warnings) || [], W = (TB.Whisper && TB.Whisper.warnings) || []; return L.concat(W).slice(0, 4).map(x => JSON.stringify(x)); }
};
"""

SCRIPT = {
    0: [("open", "window.__advance(900)"), ("painted", "__sw.cell(2, 3); window.__advance(240)"),
        ("larva", "__sw.dock('hatch'); window.__advance(700)"), ("adult", "window.__advance(800)"), ("judged", "window.__advance(800)"),
        ("order2", "__sw.until(() => __sw.s().job === 1); window.__advance(500); __sw.cell(1, 1); __sw.cell(4, 2); window.__advance(200)"),
        ("monster", "__sw.dock('hatch'); __sw.phase('judge'); window.__advance(300)"),
        ("vial", "__sw.phase('paint'); __sw.finishJob(); __sw.finishJob(); __sw.phase('ask'); window.__advance(700)"),
        ("reveal", "__sw.commit(); window.__advance(1500)"), ("card", "__sw.finishJob(); __sw.until(() => __sw.card(), 300); window.__advance(1600)")],
    1: [("open", "window.__advance(900)"), ("marks", "__sw.markTruth(); const G = __sw.ch().geo(); __sw.tap(G.X(5), G.cy); window.__advance(300)"),
        ("trap", "__sw.dock('lock'); window.__advance(1600)"), ("judged_t1", "window.__advance(700)"),
        ("build", "__sw.until(() => __sw.s().job === 1); window.__advance(500); __sw.cell(2, 4); __sw.cell(2, 4); window.__advance(200)"),
        ("legsA1", "__sw.dock('hatch'); __sw.phase('judge'); window.__advance(500)"),
        ("bxc", "__sw.until(() => __sw.s().job === 2, 300); window.__advance(600)"), ("bxc_reveal", "__sw.markTruth(); __sw.dock('lock'); window.__advance(2200)"),
        ("card", "__sw.until(() => __sw.card(), 300); window.__advance(1600)")],
    2: [("open", "window.__advance(900)"), ("dragged", "__sw.paintSolution(); window.__advance(300)"),
        ("judged", "__sw.dock('hatch'); __sw.phase('judge'); window.__advance(400)"),
        ("mutant3", "__sw.until(() => __sw.s().job === 1, 300); __sw.finishJob(); window.__advance(600)"),
        ("card", "__sw.finishJob(); __sw.finishJob(); __sw.until(() => __sw.card(), 300); window.__advance(1600)")],
    3: [("open", "window.__advance(900)"), ("dragged", "__sw.paintSolution(); window.__advance(300)"),
        ("judged", "__sw.dock('hatch'); __sw.phase('judge'); window.__advance(400)"),
        ("ask", "__sw.until(() => __sw.s().job === 1, 300); __sw.finishJob(); __sw.finishJob(); __sw.phase('ask'); window.__advance(700)"),
        ("reveal", "__sw.commit(); window.__advance(1400)"), ("card", "__sw.until(() => __sw.card(), 300); window.__advance(1600)")],
    4: [("open", "window.__advance(900)"), ("ask", "const ch = __sw.ch(), B = ch.board(ch.geo()); __sw.tap(B.mx(3), B.my); window.__advance(300); __sw.tap(B.tis[2][0], B.tis[2][1]); window.__advance(200)"),
        ("stop", "__sw.dock('lock'); window.__advance(2600)"), ("pel_ask", "__sw.test(2, [2]); window.__advance(300)"),
        ("pel", "window.__advance(2600)"), ("send", "__sw.test(1, [1]); __sw.phase('choose'); __sw.tap(__sw.ch().board(__sw.ch().geo()).mx(2), __sw.ch().board(__sw.ch().geo()).my); window.__advance(100); __sw.dock('lock'); window.__advance(2700); __sw.dock('send'); window.__advance(1200)"),
        ("card", "__sw.until(() => __sw.card(), 300); window.__advance(1600)")],
    5: [("open", "window.__advance(900)"), ("stocked", "for (let k = 0; k < 4; k++) __sw.dock('addN'); const s = __sw.s(); while (s.preds.some(p => p.type === 't')) { __sw.act({ k: 'rm', i: s.preds.findIndex(p => p.type === 't') }); } window.__advance(700)"),
        ("ask", "__sw.phase('ask', 900); window.__advance(800)"), ("reveal", "__sw.commit(); window.__advance(1600)"),
        ("run", "window.__advance(4000)"), ("ask2", "__sw.phase('ask', 1200); window.__advance(800)"),
        ("reveal2", "__sw.commit(); window.__advance(1600)"), ("card", "__sw.until(() => __sw.card(), 900); window.__advance(1800)")],
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--seed', type=int, default=3)
    ap.add_argument('--cvd', default='')
    ap.add_argument('--levels', default='0,1,2,3,4,5')
    ap.add_argument('--intro', action='store_true')
    a = ap.parse_args()
    html, out = os.path.abspath(a.html), os.path.abspath(a.out)
    os.makedirs(out, exist_ok=True)
    init = open(os.path.join(SRC, 'vclock.js')).read() + '\n' + SEEDED_RANDOM % (a.seed * 7919 + 1)
    from playwright.sync_api import sync_playwright
    problems, saved = [], []
    runs = [(vp, None) for vp in a.vp.split(',')] + [(a.vp.split(',')[0], k) for k in a.cvd.split(',') if k]
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for vp, cvd in runs:
            w, h = (int(v) for v in vp.split('x'))
            for lv in [int(x) for x in a.levels.split(',')]:
                if cvd and lv not in (0, 2, 5):
                    continue
                ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
                ext = []
                ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
                pg = ctx.new_page()
                pg.add_init_script(script=init)
                intro = a.intro and lv == 0 and not cvd
                pg.goto('file://' + html + f'?unit=switch&level={lv}&seed={a.seed}' + ('' if intro else '&intro=0') + (f'&cvd={cvd}' if cvd else ''))
                pg.evaluate(HELP)
                ev = lambda js: pg.evaluate(js)
                steps = ([("intro", "window.__advance(600)"), ("introplay", "const b = document.querySelector('#cards.on [data-play]'); if (b) b.click(); window.__advance(300)")] if intro else []) + SCRIPT[lv]
                for name, js in steps:
                    ev("()=>{" + js + "}")
                    tag = f'switch_{w}x{h}' + (f'_{cvd}' if cvd else '') + f'_L{lv + 1}_{name}.png'
                    path = os.path.join(out, tag)
                    pg.screenshot(path=path)
                    saved.append(path)
                    errs = ev("()=>window.__errs.slice(0,3)")
                    bad = ev("()=>window.__bad.slice(0,3)")
                    warn = ev("()=>__sw.warnings()")
                    eb = ev("()=>{const e=document.getElementById('err'); return e && e.style.display==='block' ? e.textContent.slice(0,300) : ''}")
                    if errs or bad or eb or warn:
                        problems.append((vp, cvd, lv, name, errs, bad, eb, warn))
                if ext:
                    problems.append((vp, cvd, lv, 'network', ext[:3]))
                ctx.close()
        b.close()
    print(f'switch_shots: {len(saved)} screenshots in {out}')
    for pr in problems:
        print('  PROBLEM', pr)
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
