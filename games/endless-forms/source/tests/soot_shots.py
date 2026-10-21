"""Screenshots of every level of The Black Country (v2/soot.js), driven through real pointer events where it matters.

  python3 tests/soot_shots.py BUILD.html OUTDIR [--vp 390x780,1280x720] [--seed 3]

Each viewport loads ?unit=soot&level=0 under virtual time (vclock.js, seeded Math.random, network blocked) and walks
L4 → L5 → L6, saving a PNG at each moment worth looking at (opening haze, a peck, dusk eggs, the cull, each prediction,
each reveal, clean air, the morph triangle, the gene lens, the night, the light trap, the verdict, the end cards).
Predictions are committed at the expectation the sim would score (a competent player), so the reveals show hits.
Exit 1 on a JavaScript error, an error box, bad canvas text or a network request.
"""
import os, sys, json, argparse

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}
SEEDED_RANDOM = """(() => { let s = %d >>> 0; Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();"""

HELP = r"""
window.__soot = {
  ch() { return TB.REG.soot; }, s() { return TB.REG.soot.sim.s; },
  tapAt(x, y) { const cv = document.getElementById('scene'), r = cv.getBoundingClientRect();
    for (const t of ['pointerdown', 'pointerup']) cv.dispatchEvent(new PointerEvent(t, { clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true, cancelable: true })); },
  peck() {   // tap the most visible moth on the trunk, as a sharp-eyed jay would
    const ch = this.ch(), s = this.s(), i = ch.sim.mostVisible(); if (i < 0) return false;
    const p = s.pos[i], cv = document.getElementById('scene'), r = cv.getBoundingClientRect(); this.tapAt(p[0] * r.width, p[1] * r.height); return true; },
  hunt(n) { for (let k = 0; k < n; k++) { const s = this.s(); if (s.phase !== 'hunt' && s.phase !== 'dawn') break; this.peck(); window.__advance(260); } },
  commit() {   // commit the open prediction at the sim's own expectation (what a competent player would mark)
    const ch = this.ch(), s = this.s(); if (!s.ask) return false; const e = ch.sim.expect(s.ask);
    const v = Array.isArray(e) ? e : s.ask.kind === 'x' ? Math.round(e) : e, P = TB.Predict;
    if (P && P.cur && P.cur.id === s.ask.id) { P.cur.v = v; P.commit(); } else TB.Sim.act(ch, { k: 'predict', id: s.ask.id, v });
    return true; },
  untilPhase(ph, max) { for (let k = 0; k < (max || 400); k++) { if (this.s().phase === ph || (Array.isArray(ph) && ph.indexOf(this.s().phase) >= 0)) return true; window.__advance(40); } return false; },
  gen() { const s = this.s(); if (s.phase === 'hunt' || s.phase === 'dawn') this.hunt(40); this.untilPhase(['ask', 'post', 'dawn', 'over'], 300); if (this.s().ask) { this.commit(); } this.untilPhase(['dawn', 'over'], 200); },
  card() { return document.querySelector('#cards.on .card'); },
  next() { const c = this.card(); if (!c) return false; const bs = [...c.querySelectorAll('.card-btns button')]; bs[bs.length - 1].click(); window.__advance(400); return true; }
};
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('out')
    ap.add_argument('--vp', default='390x780,1280x720')
    ap.add_argument('--seed', type=int, default=3)
    a = ap.parse_args()
    html, out = os.path.abspath(a.html), os.path.abspath(a.out)
    os.makedirs(out, exist_ok=True)
    init = open(os.path.join(SRC, 'vclock.js')).read() + '\n' + SEEDED_RANDOM % (a.seed * 7919 + 1)
    from playwright.sync_api import sync_playwright
    problems, saved = [], []
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)
        for vp in a.vp.split(','):
            w, h = (int(v) for v in vp.split('x'))
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
            ext = []
            ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('file:', 'data:')) else (ext.append(r.request.url), r.abort()))
            pg = ctx.new_page()
            pg.add_init_script(script=init)
            pg.goto('file://' + html + f'?unit=soot&level=0&seed={a.seed}'); pg.evaluate("()=>{ if (window.TB && TB.Intro) { TB.Intro.off = true; if (TB.Intro.box()) TB.Intro.go(); } }")   # skip the description card (D6 decision 8; covered by selftest_e4 and the monkey)
            pg.evaluate(HELP)
            ev = lambda js: pg.evaluate(js)

            def shot(name):
                path = os.path.join(out, f'soot_{w}x{h}_{name}.png')
                pg.screenshot(path=path)
                saved.append(path)
                errs = ev("()=>window.__errs.slice(0,3)")
                bad = ev("()=>window.__bad.slice(0,3)")
                eb = ev("()=>{const e=document.getElementById('err'); return e && e.style.display==='block' ? e.textContent.slice(0,300) : ''}")
                if errs or bad or eb:
                    problems.append((vp, name, errs, bad, eb))

            ev("()=>window.__advance(700)"); shot('L4_01_open')
            ev("()=>window.__advance(2600)"); shot('L4_02_haze')
            ev("()=>{ __soot.peck(); window.__advance(60); }"); shot('L4_03_peck')
            ev("()=>{ window.__advance(200); __soot.hunt(12); window.__advance(900); }"); shot('L4_04_dusk_eggs')
            ev("()=>window.__advance(700)"); shot('L4_05_cull')
            ev("()=>__soot.untilPhase('ask')"); ev("()=>window.__advance(600)"); shot('L4_06_ask_a1')
            ev("()=>{ __soot.commit(); window.__advance(500); }"); shot('L4_07_reveal_a1')
            ev("()=>{ __soot.untilPhase('dawn'); window.__advance(500); }"); shot('L4_08_dawn2')
            ev("()=>{ __soot.hunt(40); __soot.untilPhase('ask'); window.__advance(600); }"); shot('L4_09_ask_tri')
            ev("()=>{ __soot.commit(); window.__advance(500); }"); shot('L4_10_reveal_tri')
            ev("()=>{ __soot.untilPhase('dawn'); __soot.gen(); __soot.hunt(40); __soot.untilPhase('ask'); window.__advance(1300); }"); shot('L4_11_ask_jars')
            ev("()=>{ __soot.commit(); __soot.untilPhase('dawn'); __soot.hunt(40); __soot.untilPhase('ask'); window.__advance(600); }"); shot('L4_12_ask_rec')
            ev("()=>{ __soot.commit(); __soot.untilPhase('dawn'); window.__advance(2000); __soot.hunt(5); }"); shot('L4_13_late_hunt')
            ev("()=>{ for (let k=0;k<6;k++) { if (__soot.s().phase==='over' || __soot.card()) break; __soot.gen(); } window.__advance(3500); }"); shot('L4_14_level_card')
            # L5
            ev("()=>{ __soot.next(); window.__advance(800); }"); shot('L5_01_open')
            ev("()=>{ window.__advance(1500); __soot.hunt(6); }"); shot('L5_02_hunt')
            ev("()=>{ __soot.hunt(40); __soot.untilPhase('ask'); window.__advance(600); }"); shot('L5_03_ask_b1')
            ev("()=>{ __soot.commit(); window.__advance(1600); }"); shot('L5_04_reveal_b1')
            ev("()=>{ __soot.untilPhase('dawn'); __soot.hunt(40); __soot.untilPhase('ask'); window.__advance(600); }"); shot('L5_05_ask_morph')
            ev("()=>{ __soot.commit(); window.__advance(600); }"); shot('L5_06_reveal_morph')
            ev("""()=>{ __soot.untilPhase('dawn'); for (let k=0;k<12;k++) { const s=__soot.s(); if (s.phase==='over' || __soot.card()) break;
                     if (s.phase==='hunt'||s.phase==='dawn') __soot.hunt(40); __soot.untilPhase(['ask','post','dawn','over'], 300); if (__soot.s().ask) break; __soot.untilPhase(['dawn','over'], 200); }
                     window.__advance(1300); }"""); shot('L5_07_ask_late')
            ev("()=>{ __soot.commit(); __soot.untilPhase('dawn'); window.__advance(2000); __soot.hunt(4); }"); shot('L5_08_clean_hunt')
            ev("()=>{ for (let k=0;k<14;k++) { if (__soot.s().phase==='over' || __soot.card()) break; __soot.gen(); } window.__advance(3500); }"); shot('L5_09_level_card')
            # L6
            ev("()=>{ __soot.next(); window.__advance(1000); }"); shot('L6_01_open')
            ev("""()=>{ const cv=document.getElementById('scene'), r=cv.getBoundingClientRect(), J=[[150,222],[246,308],[150,400],[240,460]];
                     for (const j of J) { __soot.tapAt(j[0]/390*r.width, j[1]/540*r.height); window.__advance(300); } }"""); shot('L6_02_released')
            ev("()=>{ TB.Sim.act(__soot.ch(), {k:'night'}); window.__advance(800); }"); shot('L6_03_ask')
            ev("()=>{ __soot.commit(); window.__advance(1200); }"); shot('L6_04_night')
            ev("()=>window.__advance(1300)"); shot('L6_05_birds')
            ev("()=>window.__advance(900)"); shot('L6_06_trap')
            ev("()=>{ __soot.untilPhase('tally'); window.__advance(400); }"); shot('L6_07_tally_countup')
            ev("""()=>{ __soot.untilPhase('place'); const ch=__soot.ch();
                     for (let n=0;n<6;n++) { const s=__soot.s(); if (s.phase!=='place') break; TB.Sim.act(ch,{k:'wood', w: n%2? 'soot':'clean'});
                       for (const j of [[150,222],[246,308],[150,400],[240,460]]) TB.Sim.act(ch,{k:'release', x:j[0], y:j[1]});
                       TB.Sim.act(ch,{k:'night'}); window.__advance(300); if (__soot.s().ask) __soot.commit(); __soot.untilPhase(['place','conclude'], 400); }
                     window.__advance(1300); }"""); shot('L6_08_data')
            ev("()=>{ if (__soot.s().phase==='place') TB.Sim.act(__soot.ch(), {k:'conclude'}); window.__advance(400); }"); shot('L6_09_conclude')
            ev("""()=>{ const ch=__soot.ch(), L=ch.concludeLayout(), c=L.cards.find(x=>x.id==='rev'), p=L.pips[3]; __soot.tapAt(c.x+c.w/2, c.y+c.ht/2); window.__advance(200); __soot.tapAt(p.x, p.y); window.__advance(300); }"""); shot('L6_10_confidence')
            ev("()=>{ const b=[...document.querySelectorAll('#dock button')].find(x=>/submit/i.test(x.textContent)); if (b) b.click(); window.__advance(700); }"); shot('L6_11_verdict')
            ev("()=>window.__advance(3000)"); shot('L6_12_end_card')
            if ext:
                problems.append((vp, 'network', ext[:3]))
            ctx.close()
        b.close()
    for s in saved:
        print(s)
    if problems:
        print('PROBLEMS', json.dumps(problems, indent=1)[:3000])
        sys.exit(1)
    print('ok', len(saved), 'shots')


if __name__ == '__main__':
    main()
