/* Golden trajectories: a deterministic driver + fingerprint for legacy chapters.
   Injected after vclock.js and golden_init.js. Defines window.__golden(id, steps, seed, every).

   Determinism comes from: virtual time (vclock.js), TB.seed(seed) just before App.play,
   a seeded Math.random and no AudioContext (golden_init.js), blocked network (golden.py),
   and running the whole chapter inside ONE synchronous evaluate (no real-time callbacks).

   Fingerprint per checkpoint:
     k  per-key hash of the live chapter state: own enumerable keys of App.mode ('m.') and,
        when different, App.ch ('c.'). Functions, DOM nodes, canvases and other host objects
        are skipped, so wrapping a method or caching a texture never changes a hash.
     h  hash of #hud and #bar-gen textContent (CSS-independent).
   Events: cards (hash of every non-end card's text), ends (stars + title of each end card),
   errs (first line of each JS error). */
(function () {
  const HEX = n => ('0000000' + (n >>> 0).toString(16)).slice(-8);
  function Hasher() { let h = 0x811c9dc5; return { s(str) { for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } h ^= 0x1f; h = Math.imul(h, 0x01000193); }, get() { return HEX(h); } }; }
  const hashStr = str => { const H = Hasher(); H.s(str); return H.get(); };
  const TYPED = v => ArrayBuffer.isView(v) && !(v instanceof DataView);
  function feed(H, v, depth, seen) {
    const t = typeof v;
    if (v === null) { H.s('n'); return; }
    if (t === 'undefined') { H.s('u'); return; }
    if (t === 'number') { H.s(Object.is(v, -0) ? '-0' : String(v)); return; }
    if (t === 'string') { H.s('"' + v); return; }
    if (t === 'boolean') { H.s(v ? 'T' : 'F'); return; }
    if (t === 'bigint') { H.s(v + 'n'); return; }
    if (t === 'function' || t === 'symbol') { H.s('f'); return; }
    if (seen.has(v)) { H.s('@'); return; }
    if (depth > 9) { H.s('…'); return; }
    if (TYPED(v)) { H.s('[' + v.length); for (let i = 0; i < v.length; i++) H.s(String(v[i])); H.s(']'); return; }
    if (typeof Node !== 'undefined' && v instanceof Node) { H.s('<dom>'); return; }
    seen.add(v);
    if (Array.isArray(v)) { H.s('[' + v.length); for (let i = 0; i < v.length; i++) feed(H, v[i], depth + 1, seen); H.s(']'); }
    else if (v instanceof Map) { H.s('M' + v.size); for (const [a, b] of v) { feed(H, a, depth + 1, seen); feed(H, b, depth + 1, seen); } }
    else if (v instanceof Set) { H.s('S' + v.size); for (const a of v) feed(H, a, depth + 1, seen); }
    else {
      const pr = Object.getPrototypeOf(v);
      if (pr !== Object.prototype && pr !== null) { H.s('<' + ((v.constructor && v.constructor.name) || 'obj') + '>'); seen.delete(v); return; } // host or class object: canvas, ctx, gradient, audio…
      H.s('{'); const chap = isChapter(v);
      for (const k of Object.keys(v)) { const x = v[k]; if (typeof x === 'function' || (chap && META[k])) continue; H.s(k + ':'); feed(H, x, depth + 1, seen); }
      H.s('}');
    }
    seen.delete(v);
  }
  // Menu metadata that reg() copies from PLAN (00_entry.js rewrites PLAN into acts): not behaviour.
  const META = { title: 1, concept: 1, num: 1 };
  const isChapter = v => typeof v.id === 'string' && v.intro && typeof v.intro === 'object';
  function keyHashes(obj, prefix, out) {
    if (!obj) return; const chap = isChapter(obj);
    for (const k of Object.keys(obj)) {
      const v = obj[k]; if (typeof v === 'function' || (chap && META[k])) continue;
      const H = Hasher(); feed(H, v, 1, new Set([obj])); out[prefix + k] = H.get();
    }
  }
  function fingerprint() {
    const A = TB.App, out = {};
    keyHashes(A.mode, 'm.', out);
    if (A.ch && A.ch !== A.mode) keyHashes(A.ch, 'c.', out);
    const hudT = ((document.getElementById('hud') || {}).textContent || '') + '|' + ((document.getElementById('bar-gen') || {}).textContent || '');
    return { k: out, h: hashStr(hudT), t: hudT.replace(/\s+/g, ' ').trim().slice(0, 70) };
  }
  // Card body text without its buttons ("Next: <title>" depends on PLAN order, which 00_entry.js rewrites)
  // and without the star row (FCR-5 may redraw stars as vector icons; the count is recorded separately).
  const SKIP = n => n.classList && (n.classList.contains('card-btns') || n.classList.contains('stars'));
  const cardText = card => { let t = ''; for (const n of card.childNodes) if (!SKIP(n)) t += n.textContent; return t; };
  const starCount = card => {
    if (card.dataset && card.dataset.stars != null) return +card.dataset.stars;
    const st = card.querySelector('.stars'); if (!st) return null;
    if (st.dataset && st.dataset.stars != null) return +st.dataset.stars;
    const off = st.querySelector('.off'); return [...st.textContent].filter(c => c === '★').length - (off ? [...off.textContent].filter(c => c === '★').length : 0);
  };
  const firstLine = e => String(e).split('\n')[0].replace(/file:\/\/\S+/g, '').slice(0, 160);

  window.__golden = function (id, steps, seedv, every) {
    every = every || 100;
    const res = { id, seed: seedv, steps, every, cps: [], cards: [], ends: [], errs: [], status: 'steps' };
    const ch = TB.REG[id];
    if (!ch) { res.status = 'missing'; return res; }
    if (ch.v2) { res.status = 'v2'; return res; }
    // Pin the three font variables to fixed system fonts so embedding fonts (FCR-3) cannot move legacy layout under test.
    if (!document.getElementById('golden-fonts')) { const st = document.createElement('style'); st.id = 'golden-fonts'; st.textContent = ':root,:root[data-theme]{--fd:Georgia,serif!important;--fb:Georgia,serif!important;--fm:"Courier New",monospace!important}'; document.head.appendChild(st); }
    TB.Cards.close();
    TB.seed(seedv);
    TB.App.play(ch);
    const cv = document.getElementById('scene'), rc = () => cv.getBoundingClientRect();
    let rs = seedv || 1; const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
    const ptr = (type, x, y) => { const r = rc(); cv.dispatchEvent(new PointerEvent(type, { clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true })); };
    const cp = s => { const f = fingerprint(); res.cps.push({ s, h: f.h, t: f.t, k: f.k }); };
    let holding = false, holdUntil = 0, lastCard = null, cardSame = 0;
    const errCheck = s => {
      if (window.__errs.length) { res.errs.push(...window.__errs.map(firstLine)); window.__errs.length = 0; res.status = 'error'; res.at = s; return true; }
      const eb = document.getElementById('err'); if (eb && eb.style.display === 'block') { res.errs.push(firstLine(eb.textContent.replace(/^Something broke: /, ''))); res.status = 'errbox'; res.at = s; return true; }
      return false;
    };
    cp(0);
    for (let s = 1; s <= steps; s++) {
      const card = document.querySelector('#cards.on .card');
      if (card) {
        if (card !== lastCard) {
          lastCard = card; cardSame = 0;
          if (card.classList.contains('end')) {
            const stars = starCount(card);
            res.ends.push([s, stars, ((card.querySelector('h3') || {}).textContent || '').slice(0, 60), hashStr(cardText(card))]);
            if (res.ends.length >= 3) { res.status = 'end'; res.at = s; cp(s); break; }
            const b0 = card.querySelector('.card-btns button'); window.__advance(400); if (b0) b0.click(); window.__advance(300);
            if (errCheck(s)) { cp(s); break; }
            if (s % every === 0) cp(s);
            continue;
          }
          res.cards.push([s, hashStr(cardText(card))]);
        }
        const bs = card.querySelectorAll('.card-btns button'); if (bs.length) bs[bs.length - 1].click();
        window.__advance(120);
        if (++cardSame > 60) { res.status = 'card-stuck'; res.at = s; cp(s); break; }
        if (errCheck(s)) { cp(s); break; }
        if (s % every === 0) cp(s);
        continue;
      }
      lastCard = null;
      if (!TB.App.mode) { res.status = 'no-mode'; res.at = s; cp(s); break; }
      const W = rc().width, H = rc().height, u = rnd();
      if (holding) { if (window.__vt() >= holdUntil) { ptr('pointerup', W / 2, H / 2); holding = false; } }
      else if (u < 0.37) { const bs = [...document.querySelectorAll('#hud button')].filter(b => !b.disabled && b.offsetParent !== null); if (bs.length) bs[Math.floor(rnd() * bs.length)].click(); }
      else if (u < 0.44) { const ins = [...document.querySelectorAll('#hud input[type=range]')]; if (ins.length) { const el = ins[Math.floor(rnd() * ins.length)]; el.value = +el.min + rnd() * (el.max - el.min); el.dispatchEvent(new Event('input')); } }
      else if (u < 0.84) { let x = rnd() * W, y = rnd() * H; const M = TB.App.mode; if (M === TB.Hunt && M.items && rnd() < 0.7) { const it = M.items.filter(i => i.alive); if (it.length) { const t = it[Math.floor(rnd() * it.length)]; x = t.x * W; y = t.y * H; } } ptr('pointerdown', x, y); ptr('pointerup', x, y); }
      else if (u < 0.95) { let x = rnd() * W, y = rnd() * H; ptr('pointerdown', x, y); for (let k = 0; k < 4; k++) { x += (rnd() - .5) * 140; y += (rnd() - .5) * 140; ptr('pointermove', x, y); } ptr('pointerup', x, y); }
      else { ptr('pointerdown', rnd() * W, rnd() * H); holding = true; holdUntil = window.__vt() + 300 + rnd() * 3500; }
      window.__advance(150);
      if (errCheck(s)) { cp(s); break; }
      if (s % every === 0) cp(s);
    }
    res.vt = Math.round(window.__vt());
    return res;
  };
})();
