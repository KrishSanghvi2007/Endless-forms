parts=['engine.js','lv_a.js','lv_b.js','lv_c.js','lv_d.js']
js="(function () {\n'use strict';\n"+"\n".join(open(p,encoding='utf-8').read() for p in parts)+"\n})();\n"
open('game.js','w',encoding='utf-8').write(js)
shell=open('shell.html',encoding='utf-8').read(); assert '/*__JS__*/' in shell
out=shell.replace('/*__JS__*/', js); open('Equilibrium_HW_v2.html','w',encoding='utf-8').write(out); print('Equilibrium_HW_v2.html', len(out.encode('utf-8')))
