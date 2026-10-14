import sys
shell=open('shell.html').read()
import glob
chs=sorted(glob.glob('ch[0-9]*.js'), key=lambda f:int(f[2:-3]))
v2=sorted(glob.glob('v2/*.js'))  # redesigned / new chapters; see V2 and PLAN_ADD in ui.js
files=['core.js','hunt.js','ui.js']+chs+v2+['boot.js']
js="(function(){\n'use strict';\n"+"\n".join(open(f).read() for f in files)+"\n})();\n"
out=shell.replace('/*__JS__*/',js)
name=sys.argv[1] if len(sys.argv)>1 else 'Endless_Forms_v1.html'
open(name,'w').write(out); open('game.js','w').write(js); print(name,len(out))
