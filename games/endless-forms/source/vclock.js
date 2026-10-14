(()=>{ let vt=0; const q=[]; let id=1;
 window.__vt=()=>vt;
 window.setTimeout=(fn,ms,...a)=>{ ms=+ms||0; if(ms===16) ms=40; const t={id:id++, at: vt+Math.max(0,ms), fn, a}; q.push(t); return t.id; };
 window.clearTimeout=(i)=>{ const k=q.findIndex(t=>t.id===i); if(k>=0) q.splice(k,1); };
 window.setInterval=(fn,ms)=>{ const o={}; const tick=()=>{ fn(); o.id=window.setTimeout(tick, ms); }; o.id=window.setTimeout(tick, ms); return o; };
 window.clearInterval=(o)=>{ if(o&&o.id) window.clearTimeout(o.id); };
 performance.now=()=>vt; Date.now=()=>1700000000000+vt;
 window.__errs=[];
 window.__advance=(ms)=>{ const end=vt+ms; for(let guard=0; guard<100000; guard++){ let bi=-1; for(let k=0;k<q.length;k++) if(q[k].at<=end && (bi<0 || q[k].at<q[bi].at || (q[k].at===q[bi].at && q[k].id<q[bi].id))) bi=k; if(bi<0) break; const t=q.splice(bi,1)[0]; vt=t.at; try{ t.fn(...(t.a||[])); }catch(e){ window.__errs.push(String(e&&e.stack||e)); } } vt=end; };
 // rAF shim (API_v2 §4.3): frames ride the virtual clock at the legacy cadence (16 ms becomes 40 ms above), so frame() on
 // requestAnimationFrame runs inside __advance exactly as the old setTimeout loop did; tests/golden_init.js sets the same.
 window.requestAnimationFrame=fn=>window.setTimeout(()=>fn(performance.now()),16);
 window.cancelAnimationFrame=i=>window.clearTimeout(i);
 window.addEventListener('error', e=>window.__errs.push(String(e.message)));
 const ft=CanvasRenderingContext2D.prototype.fillText; window.__bad=[]; CanvasRenderingContext2D.prototype.fillText=function(s,...r){ if(/NaN|undefined|Infinity|\[object/.test(String(s))) window.__bad.push(String(s)); return ft.call(this,s,...r); };
})();
