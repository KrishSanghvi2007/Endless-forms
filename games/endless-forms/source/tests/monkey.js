window.__monkey = function(id, steps, seedv, replays){ replays = replays||0; let played = 0;
  const ch=TB.REG[id]; TB.Cards.close(); TB.App.play(ch);
  const cv=document.getElementById('scene'); const rc=()=>cv.getBoundingClientRect();
  let rs = seedv||1; const rnd=()=>{ rs=(rs*1103515245+12345)&0x7fffffff; return rs/0x7fffffff; };
  const ptr=(type,x,y)=>{ const r=rc(); cv.dispatchEvent(new PointerEvent(type,{clientX:r.left+x, clientY:r.top+y, pointerId:1, bubbles:true})); };
  let lastSig='', same=0, holdUntil=0, holding=false, cards=0;
  for(let s=0;s<steps;s++){
    const card=document.querySelector('#cards.on .card');
    if(card){ if(card.classList.contains('end') && played < replays){ played++; const b0=card.querySelector('.card-btns button'); b0.click(); window.__advance(300); continue; }
      if(card.classList.contains('end')){ const st=card.querySelector('.stars'); return {status:'end', played, step:s, t:Math.round(window.__vt()/1000), stars:(st?st.textContent.split('').filter(c=>c==='★').length - (st.querySelector('.off')?st.querySelector('.off').textContent.length:0):null), title:(card.querySelector('h3')||{}).textContent}; }
      const bs=card.querySelectorAll('.card-btns button'); if(bs.length){ bs[bs.length-1].click(); cards++; } window.__advance(120);
      if(document.querySelector('#cards.on .card')===card && card.dataset.armed==='1'){ window.__cs=(window.__lastCard===card?(window.__cs||0)+1:1); window.__lastCard=card; if(window.__cs>50) return {status:'card-stuck', html: card.innerText.slice(0,200)}; }
      continue; }
    if(!TB.App.mode) return {status:'no-mode', step:s};
    const W=rc().width, H=rc().height, u=rnd();
    if(holding){ if(window.__vt()>=holdUntil){ ptr('pointerup', W/2, H/2); holding=false; } }
    else if(u<0.03){ TB.Notes.tab=['idea','num','gra'][Math.floor(rnd()*3)]; TB.Notes.open(); window.__advance(60); if(window.__errs.length) return {status:'notes-error', errs:window.__errs.slice(0,2)}; const t=document.getElementById('sh-body').innerText; const m=t.match(/NaN|undefined|Infinity|\[object/); if(m) return {status:'notes-badtext', tab:TB.Notes.tab, ctx:t.slice(Math.max(0,t.indexOf(m[0])-120), t.indexOf(m[0])+40)}; TB.Notes.close(); }
    else if(u<0.4){ const bs=[...document.querySelectorAll('#hud button')].filter(b=>!b.disabled && b.offsetParent!==null); if(bs.length) bs[Math.floor(rnd()*bs.length)].click(); }
    else if(u<0.47){ const ins=[...document.querySelectorAll('#hud input[type=range]')]; if(ins.length){ const el=ins[Math.floor(rnd()*ins.length)]; el.value = +el.min + rnd()*(el.max-el.min); el.dispatchEvent(new Event('input')); } }
    else if(u<0.85){ let x=rnd()*W, y=rnd()*H; const M=TB.App.mode; if(M===TB.Hunt && M.items && rnd()<0.7){ const it=M.items.filter(i=>i.alive); if(it.length){ const t=it[Math.floor(rnd()*it.length)]; x=t.x*W; y=t.y*H; } } ptr('pointerdown',x,y); ptr('pointerup',x,y); }
    else if(u<0.95){ let x=rnd()*W, y=rnd()*H; ptr('pointerdown',x,y); for(let k=0;k<4;k++){ x+=(rnd()-.5)*140; y+=(rnd()-.5)*140; ptr('pointermove',x,y); } ptr('pointerup',x,y); }
    else { ptr('pointerdown', rnd()*W, rnd()*H); holding=true; holdUntil=window.__vt()+300+rnd()*3500; }
    window.__advance(150);
    if(window.__errs.length) return {status:'error', step:s, errs:window.__errs.slice(0,2)};
    const eb=document.getElementById('err'); if(eb.style.display==='block') return {status:'errbox', step:s, err:eb.textContent.slice(0,500)};
    const sig=(document.getElementById('hud').innerText||'')+'|'+document.getElementById('bar-gen').innerText;
    if(sig===lastSig) same++; else { same=0; lastSig=sig; }
    if(same>600) return {status:'stuck', step:s, hud:sig.slice(0,300)};
    if(s%20===0){ const txt=document.body.innerText; const m=txt.match(/NaN|undefined|Infinity|\[object/); if(m){ const i=txt.indexOf(m[0]); return {status:'badtext', step:s, ctx:txt.slice(Math.max(0,i-150),i+60)}; } if(window.__bad.length) return {status:'badcanvas', step:s, bad:window.__bad.slice(0,3)}; }
  }
  return {status:'timeout', t:Math.round(window.__vt()/1000), hud:(document.getElementById('hud').innerText||'').slice(0,240), bar:document.getElementById('bar-gen').innerText};
};
