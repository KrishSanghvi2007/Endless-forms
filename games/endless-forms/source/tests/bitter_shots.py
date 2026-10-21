"""Screenshots of every level of Bitter Wings (v2/bitter.js), driven through real pointer events.

  python3 tests/bitter_shots.py BUILD.html OUTDIR [--vp 390x780,1280x720] [--seed 3] [--cvd mono,deut] [--levels 0,1,2,3,4]

Each viewport loads ?unit=bitter&level=N under virtual time (vclock.js, seeded Math.random, network blocked) and saves
a PNG at each moment worth looking at: the opening, a peck, a bitter mouthful, the ledger and avoid-ring, dusk, each
prediction and its reveal, the young birds, the islands, the level and end cards. The player is a competent bird (the
sim's own auto rule, tapped through the canvas); predictions are committed at the sim's expectation, so reveals show hits.
Exit 1 on a JavaScript error, an error box, bad canvas text, a label or whisper warning, or a network request.
"""
import os, sys, argparse

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
SEEDED_RANDOM = """(() => { let s = %d >>> 0; Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();"""

HELP = r"""
window.__bw = {
  ch() { return TB.REG.bitter; }, s() { return TB.REG.bitter.sim.s; },
  tapAt(x, y) { const cv = document.getElementById('scene'), r = cv.getBoundingClientRect();
    for (const t of ['pointerdown', 'pointerup']) cv.dispatchEvent(new PointerEvent(t, { clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true, cancelable: true })); },
  tapIns(i) { const s = this.s(), q = s.ins[i]; if (!q) return false; const cv = document.getElementById('scene'), r = cv.getBoundingClientRect(); this.tapAt(q.x / 390 * r.width, q.y / 540 * r.height); return true; },
  peck() { const i = this.ch().sim.autoPick(); return i >= 0 ? this.tapIns(i) : false; },
  bitter() { const s = this.s(); const i = s.ins.findIndex(q => !q.st && (q.k === 'm' || q.k === 'b' || q.k === 's' || q.k === 'g')); return i >= 0 ? this.tapIns(i) : false; },
  hunt(n) { for (let k = 0; k < n; k++) { const s = this.s(); if (s.phase !== 'hunt' && s.phase !== 'dawn') break; if (!this.peck()) window.__advance(300); window.__advance(420); } },
  commit() { const ch = this.ch(), s = this.s(); if (!s.ask) return false; const e = ch.sim.expect(s.ask.id), P = TB.Predict;
    if (P && P.cur && P.cur.id === s.ask.id) { P.cur.v = e; P.cur.moved = true; P.commit(); } else TB.Sim.act(ch, { k: 'predict', id: s.ask.id, v: e }); return true; },
  untilPhase(ph, max) { const L = Array.isArray(ph) ? ph : [ph]; for (let k = 0; k < (max || 400); k++) { if (L.indexOf(this.s().phase) >= 0) return true; window.__advance(40); } return false; },
  gen() { const s = this.s(); if (s.phase === 'hunt' || s.phase === 'dawn') this.hunt(30); this.untilPhase(['ask', 'post', 'dawn', 'over', 'reveal'], 300); if (this.s().ask) this.commit(); this.untilPhase(['dawn', 'over', 'reveal'], 300); },
  card() { return document.querySelector('#cards.on .card'); },
  next() { const c = this.card(); if (!c) return false; const bs = [...c.querySelectorAll('.card-btns button')]; bs[bs.length - 1].click(); window.__advance(400); return true; },
  warnings() { const L = (TB.Lbl && TB.Lbl.warnings) || [], W = (TB.Whisper && TB.Whisper.warnings) || []; return L.concat(W).slice(0, 4).map(x => JSON.stringify(x)); }
};
"""

SCRIPT = {
    0: [("open", "window.__advance(700)"), ("peck", "__bw.peck(); window.__advance(70)"), ("bitter", "window.__advance(400); __bw.bitter(); window.__advance(160)"),
        ("hunt", "window.__advance(1400); __bw.hunt(4); window.__advance(100)"), ("dusk", "__bw.hunt(30); __bw.untilPhase('dusk'); window.__advance(900)"),
        ("gen2", "__bw.untilPhase('dawn'); window.__advance(300); __bw.hunt(5)"), ("ask", "__bw.hunt(30); __bw.untilPhase('ask'); window.__advance(500)"),
        ("reveal", "__bw.commit(); window.__advance(500)"), ("late", "__bw.gen(); __bw.gen(); __bw.hunt(6)"), ("card", "for (let k = 0; k < 6 && !__bw.card(); k++) __bw.gen(); window.__advance(1600)")],
    1: [("open", "window.__advance(700)"), ("hunt", "__bw.hunt(5); __bw.bitter(); window.__advance(120)"), ("ask", "__bw.gen(); __bw.hunt(30); __bw.untilPhase('ask'); window.__advance(500)"),
        ("reveal", "__bw.commit(); window.__advance(500)"), ("crash", "__bw.gen(); __bw.gen(); window.__advance(400); __bw.hunt(6)"),
        ("card", "for (let k = 0; k < 8 && !__bw.card(); k++) __bw.gen(); window.__advance(1600)")],
    2: [("open", "window.__advance(700)"), ("deadly", "__bw.gen(); window.__advance(500); __bw.hunt(3); __bw.bitter(); window.__advance(150)"),
        ("ask", "__bw.hunt(30); __bw.untilPhase('ask'); window.__advance(500)"), ("reveal", "__bw.commit(); window.__advance(500)"),
        ("card", "for (let k = 0; k < 8 && !__bw.card(); k++) __bw.gen(); window.__advance(1600)")],
    3: [("open", "window.__advance(700)"), ("taste", "__bw.hunt(3); __bw.bitter(); window.__advance(150)"), ("young", "__bw.hunt(30); __bw.untilPhase('dusk'); window.__advance(1300)"),
        ("ask", "__bw.untilPhase('ask'); window.__advance(500)"), ("reveal", "__bw.commit(); window.__advance(500)"),
        ("mid", "__bw.gen(); __bw.gen(); __bw.gen(); window.__advance(300); __bw.hunt(4)"), ("card", "for (let k = 0; k < 8 && !__bw.card(); k++) __bw.gen(); window.__advance(1600)")],
    4: [("open", "window.__advance(700)"), ("taste", "__bw.hunt(3); __bw.bitter(); window.__advance(150)"), ("young", "__bw.hunt(30); __bw.untilPhase('dusk'); window.__advance(1400)"),
        ("ask", "__bw.gen(); __bw.gen(); __bw.hunt(30); __bw.untilPhase('ask'); window.__advance(500)"), ("reveal", "__bw.commit(); window.__advance(500)"),
        ("reveal_c", "for (let k = 0; k < 6 && __bw.s().phase !== 'reveal' && __bw.s().phase !== 'over'; k++) __bw.gen(); window.__advance(1500)"),
        ("card", "__bw.untilPhase('over', 200); window.__advance(1800)")],
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--seed', type=int, default=3)
    ap.add_argument('--cvd', default='')
    ap.add_argument('--levels', default='0,1,2,3,4')
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
                if cvd and lv not in (0, 3, 4):
                    continue
                ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
                ext = []
                ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
                pg = ctx.new_page()
                pg.add_init_script(script=init)
                pg.goto('file://' + html + f'?unit=bitter&intro=0&level={lv}&seed={a.seed}' + (f'&cvd={cvd}' if cvd else ''))
                pg.evaluate(HELP)
                ev = lambda js: pg.evaluate(js)
                for name, js in SCRIPT[lv]:
                    ev("()=>{" + js + "}")
                    tag = f'bitter_{w}x{h}' + (f'_{cvd}' if cvd else '') + f'_L{lv + 1}_{name}.png'
                    path = os.path.join(out, tag)
                    pg.screenshot(path=path)
                    saved.append(path)
                    errs = ev("()=>window.__errs.slice(0,3)")
                    bad = ev("()=>window.__bad.slice(0,3)")
                    warn = ev("()=>__bw.warnings()")
                    eb = ev("()=>{const e=document.getElementById('err'); return e && e.style.display==='block' ? e.textContent.slice(0,300) : ''}")
                    if errs or bad or eb or warn:
                        problems.append((vp, cvd, lv, name, errs, bad, eb, warn))
                if ext:
                    problems.append((vp, cvd, lv, 'network', ext[:3]))
                ctx.close()
        b.close()
    print(f'bitter_shots: {len(saved)} screenshots in {out}')
    for pr in problems:
        print('  PROBLEM', pr)
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
