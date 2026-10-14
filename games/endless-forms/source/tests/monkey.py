import os; SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the source/ folder
import sys, json
from playwright.sync_api import sync_playwright
ids=sys.argv[1].split(','); seeds=[int(x) for x in sys.argv[2].split(',')]
with sync_playwright() as p:
    b=p.chromium.launch()
    for cid in ids:
        for sd in seeds:
            pg=b.new_page(viewport={'width':390,'height':780})
            pg.add_init_script(path=SRC+'/vclock.js')
            pg.goto('file://'+SRC+'/Endless_Forms_v1.html')
            pg.evaluate("()=>window.__advance(1500)")
            pg.add_script_tag(path=SRC+'/tests/monkey.js')
            try: r=pg.evaluate(f"()=>window.__monkey('{cid}', 5200, {sd}, 1)")
            except Exception as e: r={'status':'pyexc','e':str(e)[:300]}
            print(cid, sd, json.dumps(r, ensure_ascii=False)[:600], flush=True)
            pg.close()
    b.close()
