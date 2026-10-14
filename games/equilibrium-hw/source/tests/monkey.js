window.__monkey = function(id, steps, seedv){
  const H=window.HW; H.Save.d.all=true; H.UI.close(); H.Game.go(id);
  const cv=document.getElementById('cv'); let rs=seedv||1; const rnd=()=>{ rs=(rs*1103515245+12345)&0x7fffffff; return rs/0x7fffffff; };
  const ptr=(type,x,y)=>cv.dispatchEvent(new PointerEvent(type,{clientX:x, clientY:y, pointerId:1, bubbles:true}));
  for(let s=0;s<steps;s++){
    if(H.Save.d.done[id]) return {status:'done', step:s, stars:H.Save.d.stars[id]};
    const modal=document.querySelector('#modal.on');
    if(modal){ window.__advance(400); const bs=[...modal.querySelectorAll('.card-btns button')]; if(bs.length){ const prim=bs.filter(b=>b.classList.contains('primary')); const b = (rnd()<0.75 && prim.length) ? prim[0] : bs[Math.floor(rnd()*bs.length)]; const txt=b.textContent; if(/All levels|Keep my|Reset/.test(txt) && bs.length>1){ const alt=bs.find(x=>!/Back to the meadow|Back to the five|Not yet|Reset/.test(x.textContent)); (alt||b).click(); } else b.click(); } window.__advance(120); if(H.Save.d.done[id]) return {status:'done', step:s, stars:H.Save.d.stars[id]}; if(H.Game.id!==id && !id.startsWith('f_') && true) H.Game.go(id); continue; }
    const u=rnd(), S=H.Game.scene;
    if(u<0.06){ const lb=[...document.querySelectorAll('#lens.on button')]; if(lb.length) lb[Math.floor(rnd()*lb.length)].click(); }
    else if(u<0.45){ const bs=[...document.querySelectorAll('#ctl button')].filter(b=>!b.disabled); if(bs.length){ const prim=bs.filter(b=>b.classList.contains('primary')); (rnd()<0.5&&prim.length?prim[0]:bs[Math.floor(rnd()*bs.length)]).click(); } }
    else if(u<0.55){ const ins=[...document.querySelectorAll('#ctl input[type=range]')].filter(i=>!i.disabled); if(ins.length){ const el=ins[Math.floor(rnd()*ins.length)]; el.value = +el.min + rnd()*(el.max-el.min); el.dispatchEvent(new Event('input')); } }
    else { let x=rnd()*innerWidth, y=rnd()*innerHeight; const hs=S&&S.hot?S.hot():[]; if(hs.length && rnd()<0.85){ const h=hs[Math.floor(rnd()*hs.length)]; x=h.x; y=h.y; } ptr('pointerdown',x,y); ptr('pointerup',x,y); }
    window.__advance(150);
    if(window.__errs.length) return {status:'error', step:s, errs:window.__errs.slice(0,2)};
    const eb=document.getElementById('err'); if(eb.style.display==='block') return {status:'errbox', step:s, err:eb.textContent.slice(0,400)};
    if(s%15===0){ const txt=document.body.innerText; const m=txt.match(/NaN|undefined|Infinity|\[object/); if(m){ const i=txt.indexOf(m[0]); return {status:'badtext', step:s, ctx:txt.slice(Math.max(0,i-120),i+40)}; } if(window.__bad.length) return {status:'badcanvas', step:s, bad:window.__bad.slice(0,3)}; }
  }
  return {status:'timeout', scene:H.Game.id, say:(document.getElementById('say').innerText||'').slice(0,160)};
};
