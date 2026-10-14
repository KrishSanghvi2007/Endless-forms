import sys
shell=open('shell.html').read()
import glob
chs=sorted(glob.glob('ch[0-9]*.js'), key=lambda f:int(f[2:-3]))
import os, fnmatch
v2=sorted(glob.glob('v2/*.js'))  # redesigned / new chapters; see V2 and PLAN_ADD in ui.js
# V2_ONLY='0*,lichen.js' builds only the matching v2 files (lets parallel agents ignore each other's unfinished files)
if os.environ.get('V2_ONLY'):
    pats=[x.strip() for x in os.environ['V2_ONLY'].split(',') if x.strip()]
    v2=[f for f in v2 if any(fnmatch.fnmatch(os.path.basename(f), q) for q in pats)]
files=['core.js','hunt.js','ui.js']+chs+v2+['boot.js']
js="(function(){\n'use strict';\n"+"\n".join(open(f).read() for f in files)+"\n})();\n"
out=shell.replace('/*__JS__*/',js)
name=sys.argv[1] if len(sys.argv)>1 else 'Endless_Forms_v1.html'
open(name,'w').write(out); open('game.js','w').write(js); print(name,len(out))
