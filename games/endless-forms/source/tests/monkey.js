/* Monkey: a seeded random player for any chapter, legacy or v2. Injected after vclock.js (see monkey.py).
   window.__monkey(id, steps, seed, replays, opts) → {status, …}; status is 'end' (reached the end card) or one of
   'error' 'errbox' 'stuck' 'timeout' 'badtext' 'badcanvas' 'card-stuck' 'no-mode' 'missing' 'warnings' 'notes-error' 'notes-badtext'.
   Each step is one random act, then 150 ms of virtual time. R() is seeded from `seed` (opts.seedR === false keeps the old
   unseeded start), so with monkey.py's seeded Math.random a run is a pure function of (build, id, seed, viewport).
   Legacy chapters: taps, drags, holds, #hud buttons and sliders, and the Notes sheet, as before; plus HINTS for chapters whose
   small targets a blind tapper cannot finish (Mendel, the Fancier).
   v2 chapters (ch.v2 === true, API_v2 §11.3): App.playLevel(ch, opts.level, {seed}); #hud and #dock buttons; keys from ch.keys;
   drags and taps on #strip canvases; never Notes. '.card.lvl' is a level card (sometimes Why? or a What if? chip, then the last
   button); '.card.end' ends the run, stars from its data-stars. Any new Lbl, Whisper, HUD or Dock warning fails the run. */
(function () {
  const HINTS = {
    // Mendel L1 has six 68×26 px "mark" pills and L2 eight; a blind tapper almost never had them all marked at once (G3 review)
    mendel: { tap(ch, W, H, rnd) {
      if (ch.lv === 1 && ch.pos2) { const p = ch.pos2(Math.floor(rnd() * 4), W, H), b1 = p.fy + 52 * p.s; return [p.x, b1 + (rnd() < 0.5 ? 12 : 39)]; }
      if (ch.pos) { const p = ch.pos(Math.floor(rnd() * 6), W, H); return [p.x, p.fy + 56 * p.s + 13]; }
      return null;
    } },
    // the Fancier: "Clear choices" fired as often as taps chose a breeder, so six were rarely chosen before a clear
    fancier: { avoid: ['fa-auto'] }
  };
  const BAD = /NaN|undefined|Infinity|\[object/;
  // input-driven chapter state for the stuck check: strings, booleans, integers and short arrays of them (labels, marks,
  // counters). Float timers are left out, so a chapter whose labels live only on the canvas is not called stuck while
  // the monkey is still changing them (coal L3, sweep L2, ring L1 were false 'stuck' before).
  const flat = v => typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && Number.isInteger(v)) || v === null;
  const stateSig = o => { if (!o || typeof o !== 'object') return ''; let s = ''; for (const k in o) { let v; try { v = o[k]; } catch (e) { continue; } if (flat(v)) s += k + '=' + v + ';'; else if (Array.isArray(v) && v.length <= 64 && v.every(flat)) s += k + '=' + v.join(',') + ';'; } return s; };
  const vis = el => el && el.offsetParent !== null && el.getClientRects().length > 0;

  window.__monkey = function (id, steps, seedv, replays, opts) {
    opts = opts || {}; replays = replays || 0; seedv = seedv || 1;
    const TB = window.TB, ch = TB.REG[id]; if (!ch) return { status: 'missing', id };
    const v2 = ch.v2 === true, hint = HINTS[id] || {};
    if (!steps) steps = v2 ? Math.max(5200, Math.ceil((ch.levels || []).reduce((a, l) => a + (l.minutes || 5), 0) * 60 / 0.15 * 1.5)) : 5200;
    let rs = seedv; const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
    const warnLists = () => [['Lbl', TB.Lbl], ['Whisper', TB.Whisper], ['HUD', TB.HUD], ['Dock', TB.Dock]].filter(x => x[1] && Array.isArray(x[1].warnings));
    const warn0 = new Map(warnLists().map(([k, m]) => [k, m.warnings.length]));
    const newWarnings = () => { const out = []; for (const [k, m] of warnLists()) m.warnings.slice(warn0.get(k) || 0).forEach(w => out.push(k + ': ' + (typeof w === 'string' ? w : JSON.stringify(w)))); return out; };
    let notesOpened = 0;
    if (v2 && TB.Notes) { const o = TB.Notes.open; TB.Notes.open = function () { notesOpened++; return o.apply(this, arguments); }; }
    const start = () => {
      TB.Cards.close();
      if (opts.seedR !== false) TB.seed((seedv * 2654435761) >>> 0 || 1);
      if (v2) TB.App.playLevel(ch, opts.level || 0, { seed: (seedv * 2654435761) >>> 0 || 1 }); else TB.App.play(ch);
    };
    start();
    const cv = document.getElementById('scene'); const rc = () => cv.getBoundingClientRect();
    const ptr = (el, type, x, y) => { const r = el.getBoundingClientRect(); el.dispatchEvent(new PointerEvent(type, { clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true, cancelable: true })); };
    const key = k => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    const keyList = v2 ? Object.keys(ch.keys || {}).map(k => k === 'Space' ? ' ' : k).concat(['Enter', 'ArrowLeft', 'ArrowRight', 'l', 'p']) : [];
    let played = 0, lastSig = '', same = 0, holdUntil = 0, holding = false, cards = 0, levels = 0, whatifs = 0, strip = 0, keys = 0, maxWords = 0;
    const extra = () => v2 ? { levels, whatifs, strip, keys, maxWords, notes: notesOpened } : {};
    for (let s = 0; s < steps; s++) {
      const card = document.querySelector('#cards.on .card');
      if (card) {
        const end = card.classList.contains('end');
        if (end && played < replays) {
          played++;
          if (v2) { TB.Cards.close(); TB.App.playLevel(ch, 0, { seed: ((seedv + played) * 2654435761) >>> 0 || 1 }); }
          else { const b0 = card.querySelector('.card-btns button'); b0.click(); }
          window.__advance(300); continue;
        }
        if (end) {
          let stars = null;
          if (card.dataset.stars != null) stars = parseInt(card.dataset.stars, 10);
          else { const st = card.querySelector('.stars'); if (st) stars = st.textContent.split('').filter(c => c === '★').length - (st.querySelector('.off') ? st.querySelector('.off').textContent.length : 0); }
          if (v2) {   // exercise Why? once on the final card
            const why = [...card.querySelectorAll('.card-btns button')].find(b => /^why/i.test(b.textContent.trim()));
            if (why && card.dataset.armed === '1') { why.click(); window.__advance(120); }
            if (window.__errs.length) return { status: 'error', step: s, errs: window.__errs.slice(0, 2), where: 'end card' };
            const m = card.innerText.match(BAD); if (m) return { status: 'badtext', step: s, ctx: card.innerText.slice(0, 200) };
            const w = newWarnings(); if (w.length) return Object.assign({ status: 'warnings', step: s, warnings: w.slice(0, 4) }, extra());
          }
          return Object.assign({ status: 'end', played, step: s, t: Math.round(window.__vt() / 1000), stars, title: (card.querySelector('h3') || {}).textContent }, extra());
        }
        if (card.dataset.armed === '1') {
          if (v2 && card.classList.contains('lvl')) {
            const chips = [...card.querySelectorAll('.chips button, button.chip')].filter(vis);
            const btns = [...card.querySelectorAll('.card-btns button')];
            if (chips.length && whatifs < 2 && rnd() < 0.5) { chips[Math.floor(rnd() * chips.length)].click(); whatifs++; window.__advance(120); continue; }
            const wi = btns.find(b => /what if/i.test(b.textContent));
            if (wi && whatifs < 2 && !card.dataset.e7wi && rnd() < 0.15) { card.dataset.e7wi = '1'; wi.click(); window.__advance(120); continue; }
            const why = btns.find(b => /^why/i.test(b.textContent.trim()));
            if (why && !card.dataset.e7why && rnd() < 0.3) { card.dataset.e7why = '1'; why.click(); window.__advance(120); continue; }
            if (btns.length) { btns[btns.length - 1].click(); levels++; }
          } else { const bs = card.querySelectorAll('.card-btns button'); if (bs.length) { bs[bs.length - 1].click(); cards++; } }
        }
        window.__advance(120);
        if (document.querySelector('#cards.on .card') === card && card.dataset.armed === '1') { window.__cs = (window.__lastCard === card ? (window.__cs || 0) + 1 : 1); window.__lastCard = card; if (window.__cs > 50) return { status: 'card-stuck', html: card.innerText.slice(0, 200) }; }
        if (window.__errs.length) return { status: 'error', step: s, errs: window.__errs.slice(0, 2), where: 'card' };
        continue;
      }
      if (!TB.App.mode) return { status: 'no-mode', step: s };
      const W = rc().width, H = rc().height, u = rnd();
      const buttons = sel => [...document.querySelectorAll(sel)].filter(b => !b.disabled && vis(b) && (hint.avoid || []).indexOf(b.id) < 0);
      if (holding) { if (window.__vt() >= holdUntil) { ptr(cv, 'pointerup', W / 2, H / 2); holding = false; } }
      else if (!v2 && u < 0.03) { TB.Notes.tab = ['idea', 'num', 'gra'][Math.floor(rnd() * 3)]; TB.Notes.open(); window.__advance(60); if (window.__errs.length) return { status: 'notes-error', errs: window.__errs.slice(0, 2) }; const t = document.getElementById('sh-body').innerText; const m = t.match(BAD); if (m) return { status: 'notes-badtext', tab: TB.Notes.tab, ctx: t.slice(Math.max(0, t.indexOf(m[0]) - 120), t.indexOf(m[0]) + 40) }; TB.Notes.close(); }
      else if (v2 && u < 0.05) { if (keyList.length) { key(keyList[Math.floor(rnd() * keyList.length)]); keys++; } }
      else if (u < 0.4) { const bs = buttons(v2 ? '#hud button, #dock button' : '#hud button'); if (bs.length) bs[Math.floor(rnd() * bs.length)].click(); }
      else if (u < 0.47) { const ins = [...document.querySelectorAll(v2 ? '#hud input[type=range], #dock input[type=range]' : '#hud input[type=range]')]; if (ins.length) { const el = ins[Math.floor(rnd() * ins.length)]; el.value = +el.min + rnd() * (el.max - el.min); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } }
      else if (v2 && u < 0.52) {   // the strip: a Predict drag or tap on a chart canvas
        const cs = [...document.querySelectorAll('#strip canvas')].filter(vis);
        if (cs.length) { const c = cs[Math.floor(rnd() * cs.length)], r = c.getBoundingClientRect(); let x = rnd() * r.width, y = rnd() * r.height; ptr(c, 'pointerdown', x, y); for (let k = 0; k < 3; k++) { x = Math.max(0, Math.min(r.width, x + (rnd() - 0.5) * 60)); y = Math.max(0, Math.min(r.height, y + (rnd() - 0.5) * 60)); ptr(c, 'pointermove', x, y); } ptr(c, 'pointerup', x, y); strip++; }
      }
      else if (u < 0.85) {
        let x = rnd() * W, y = rnd() * H; const M = TB.App.mode;
        if (hint.tap && rnd() < 0.5) { const p = hint.tap(ch, W, H, rnd); if (p) { x = p[0]; y = p[1]; } }
        else if (M === TB.Hunt && M.items && rnd() < 0.7) { const it = M.items.filter(i => i.alive); if (it.length) { const t = it[Math.floor(rnd() * it.length)]; x = t.x * W; y = t.y * H; } }
        ptr(cv, 'pointerdown', x, y); ptr(cv, 'pointerup', x, y);
      }
      else if (u < 0.95) { let x = rnd() * W, y = rnd() * H; ptr(cv, 'pointerdown', x, y); for (let k = 0; k < 4; k++) { x += (rnd() - .5) * 140; y += (rnd() - .5) * 140; ptr(cv, 'pointermove', x, y); } ptr(cv, 'pointerup', x, y); }
      else { ptr(cv, 'pointerdown', rnd() * W, rnd() * H); holding = true; holdUntil = window.__vt() + 300 + rnd() * 3500; }
      window.__advance(150);
      if (window.__errs.length) return { status: 'error', step: s, errs: window.__errs.slice(0, 2) };
      const eb = document.getElementById('err'); if (eb.style.display === 'block') return { status: 'errbox', step: s, err: eb.textContent.slice(0, 500) };
      if (v2) { const w = newWarnings(); if (w.length) return Object.assign({ status: 'warnings', step: s, warnings: w.slice(0, 4) }, extra()); if (notesOpened) return { status: 'notes-opened', step: s }; }
      const dock = v2 ? document.getElementById('dock') : null;
      const M = TB.App.mode, txt = (document.getElementById('hud').innerText || '') + '|' + document.getElementById('bar-gen').innerText + (dock ? '|' + dock.innerText : '');
      const sig = txt + (M && M !== TB.Hunt ? '|' + stateSig(M) + (M.sim ? '|' + stateSig(M.sim.s) : '') : '');
      if (sig === lastSig) same++; else { same = 0; lastSig = sig; }
      if (same > 600) return Object.assign({ status: 'stuck', step: s, hud: txt.slice(0, 300) }, extra());
      if (s % 20 === 0) {
        const txt = document.body.innerText; const m = txt.match(BAD);
        if (m) { const i = txt.indexOf(m[0]); return { status: 'badtext', step: s, ctx: txt.slice(Math.max(0, i - 150), i + 60) }; }
        if (window.__bad.length) return { status: 'badcanvas', step: s, bad: window.__bad.slice(0, 3) };
        if (v2) { const words = ['hud', 'dock', 'whisper'].map(k => document.getElementById(k)).filter(vis).map(e => e.innerText).join(' ').split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length; if (words > maxWords) maxWords = words; }
      }
    }
    return Object.assign({ status: 'timeout', t: Math.round(window.__vt() / 1000), hud: (document.getElementById('hud').innerText || '').slice(0, 240), bar: document.getElementById('bar-gen').innerText }, extra());
  };
})();
