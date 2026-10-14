import sys
shell=open('shell.html').read()
js="(function(){\n'use strict';\n"+"\n".join(open(f).read() for f in ['core.js','hunt.js','steward.js','app.js'])+"\n})();\n"
assert '/*__JS__*/' in shell
out=shell.replace('/*__JS__*/',js)
name=sys.argv[1] if len(sys.argv)>1 else 'Tangled_Bank_v1.html'
open(name,'w').write(out)
open('game.js','w').write(js)
print(name, len(out))
