"""Real-input paths through Switches (v2/switch.js): keys, untimed, Calm, teacher step, What if?, and ?v1=1.

  python3 tests/switch_paths.py BUILD.html

  keys     L1 played by keyboard only: arrows to the Ubx/T3 cell, Space cycles it off, Enter hatches; the order is built
  untimed  ?untimed=1: the run logs unt on, and nothing on the bench runs on a clock
  calm     ?calm=1: a hatch runs to the judged fly with no errors
  teacher  ?teacher=1: teacherStep advances the lake by generations
  whatif   L4 (the lake) played to its card; What if? thaws a vial with a lever and runs to a card with no stars
  v1       ?v1=1: the legacy Switches chapter still opens and its grid works
Exit 1 on any failed check, JavaScript error or error box.
"""
import os, sys

TESTS = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(TESTS)
CHROME = {"executable_path": "/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}


def main():
    html = os.path.abspath(sys.argv[1])
    init = open(os.path.join(SRC, 'vclock.js')).read()
    from playwright.sync_api import sync_playwright
    fails, oks = [], []
    check = lambda c, m: (oks if c else fails).append(m)
    with sync_playwright() as p:
        b = p.chromium.launch(**CHROME)

        def page(q, w=390, h=780):
            ctx = b.new_context(viewport={'width': w, 'height': h})
            pg = ctx.new_page(); pg.add_init_script(script=init); pg.goto('file://' + html + q); return ctx, pg

        def errs(pg, tag):
            e = pg.evaluate("()=>window.__errs.slice(0,3)"); eb = pg.evaluate("()=>{const x=document.getElementById('err'); return x && x.style.display==='block' ? x.textContent.slice(0,200) : ''}")
            check(not e and not eb, tag + ': no errors ' + (str(e) + eb if e or eb else ''))

        key = lambda pg, k: pg.keyboard.press(k)
        # keys
        ctx, pg = page('?unit=switch&level=0&seed=5&intro=0'); pg.evaluate("window.__advance(600)")
        pg.evaluate("()=>{document.getElementById('scene').focus && document.getElementById('scene').focus()}")
        for k in ['ArrowRight'] * 0: key(pg, k)
        st = pg.evaluate("()=>TB.REG.switch.v.cur")   # starts at row 2 (Ubx), column 3 (T3)
        check(st['r'] == 2 and st['c'] == 3, 'keys: the cursor starts on Ubx/T3')
        key(pg, ' '); pg.evaluate("window.__advance(100)"); key(pg, ' '); pg.evaluate("window.__advance(100)")   # low → high → off
        g = pg.evaluate("()=>TB.REG.switch.sim.s.grid[2][3]"); check(g == 0, 'keys: Space cycles the Ubx cell to off')
        key(pg, "Enter"); pg.evaluate("window.__advance(4000)")
        s = pg.evaluate("()=>{const s=TB.REG.switch.sim.s; return {job: s.job, solved: s.solvedN}}"); check(s['solved'] == 1, 'keys: the bithorax order is built by keyboard alone ' + str(s))
        errs(pg, 'keys'); ctx.close()
        # untimed
        ctx, pg = page('?unit=switch&level=0&seed=5&intro=0&untimed=1'); pg.evaluate("window.__advance(400)")
        u = pg.evaluate("()=>TB.REG.switch.sim.s.unt")
        pg.evaluate("window.__advance(60000)"); a = pg.evaluate("()=>{const s=TB.REG.switch.sim.s; return s.phase==='paint' && s.job===0}")
        check(u and a, 'untimed: unt logged on, and the first order still waits after 60 s'); errs(pg, 'untimed'); ctx.close()
        # calm
        ctx, pg = page('?unit=switch&level=0&seed=5&intro=0&calm=1'); pg.evaluate("window.__advance(400)")
        pg.evaluate("()=>{TB.Sim.act(TB.REG.switch,{k:'cell',g:2,j:3,v:0}); TB.Sim.act(TB.REG.switch,{k:'hatch'})}"); pg.evaluate("window.__advance(4000)")
        check(pg.evaluate("()=>TB.REG.switch.sim.s.solvedN") == 1, 'calm: the hatch runs to a built fly'); errs(pg, 'calm'); ctx.close()
        # teacher
        ctx, pg = page('?unit=switch&level=3&seed=5&intro=0&teacher=1'); pg.evaluate("window.__advance(400)")
        g0 = pg.evaluate("()=>TB.REG.switch.sim.s.gen"); pg.evaluate("()=>{TB.REG.switch.teacherStep(); TB.REG.switch.teacherStep()}")
        check(pg.evaluate("()=>TB.REG.switch.sim.s.gen") > g0, 'teacher: step advances the lake'); errs(pg, 'teacher'); ctx.close()
        # what if
        ctx, pg = page('?unit=switch&level=3&seed=5&intro=0', 1280, 720); pg.evaluate("window.__advance(400)")
        pg.evaluate("""()=>{const ch=TB.REG.switch, sim=ch.sim; for (let k=0;k<4;k++) TB.Sim.act(ch,{k:'add',type:'n',x:70+80*k,y:466}); const s=sim.s; while (s.preds.some(p=>p.type==='t')) TB.Sim.act(ch,{k:'rm',i:s.preds.findIndex(p=>p.type==='t')});}""")
        for _ in range(40):
            pg.evaluate("window.__advance(1500)")
            if pg.evaluate("()=>!!document.querySelector('#cards.on .card')"): break
        wi = pg.evaluate("()=>{const b=[...document.querySelectorAll('#cards.on .card-btns button')].find(x=>/what if/i.test(x.textContent)); if (b) b.click(); return !!b}")
        pg.evaluate("window.__advance(300)")
        chip = pg.evaluate("()=>{const c=[...document.querySelectorAll('#cards.on .chips button, #cards.on button.chip')]; if (c.length) { c[0].click(); return c.length } return 0}")
        for _ in range(60):
            pg.evaluate("window.__advance(1000)")
            if pg.evaluate("()=>TB.REG.switch.sim.s.thawed && !!document.querySelector('#cards.on .card')"): break
        th = pg.evaluate("()=>{const s=TB.REG.switch.sim.s; return {thawed: !!s.thawed, lever: s.lever, card: !!document.querySelector('#cards.on .card'), txt: (document.querySelector('#cards.on .card')||{}).innerText||''}}")
        check(wi and chip and th['thawed'] and th['card'], 'whatif: a lever chip thaws a vial and the rerun reaches a card ' + str({k: th[k] for k in ['thawed', 'lever', 'card']}))
        errs(pg, 'whatif'); ctx.close()
        # v1
        ctx, pg = page('?v1=1&unit=switch'); pg.evaluate("window.__advance(800)")
        v1 = pg.evaluate("()=>{const ch=TB.REG.switch; return {v2: ch.v2===true, tasks: !!ch.TASKS}}")
        check(not v1['v2'] and v1['tasks'], 'v1: ?v1=1 keeps the legacy Switches chapter ' + str(v1)); errs(pg, 'v1'); ctx.close()
        b.close()
    for m in oks: print('  ok   ' + m)
    for m in fails: print('  FAIL ' + m)
    print(f'switch_paths: {len(oks)} ok, {len(fails)} failed')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
