/* ================= v2/00_tokens.js: Pal, the palette tokens and place grounds (FCR-6; D4 §1.3, §2; API_v2 §5.1) =================
   Data inks have fixed meanings (blue A, amber a, four force inks); organisms keep natural paint. The CSS goes in under a
   --v- prefix so the shell's --ink and --paper keep their legacy meaning. Themes: Dusk (default), Paper, Projector.
   applyTheme is wrapped: a v2 chapter gets its place ground; a legacy chapter's chrome moves to the nearest place ground
   only when its own text still clears 4.5:1 there. Everything here is inert under ?v1=1 except the Pal object itself. */
const Pal = (() => {
  const INK = {   // D4 §2.1 and §2.3: fill column per theme, plus Paper's darker line column
    dusk: { ground: '#152120', surface: '#1C2A28', text: '#E8DFC9', text2: '#B9B29F', A: '#6B97FF', a: '#F2C94C', sel: '#F46034', drift: '#CF81A2', mut: '#5AE2B5', mig: '#7CC4F0', ink: '#1B1612', paper: '#E8DFC9', accent: '#A8263F', ochre: '#CF9A33', line: 'rgba(232,223,201,.15)' },
    paper: { ground: '#F4EEDD', surface: '#E8DFC9', text: '#29211B', text2: '#5C4F44', A: '#2F5FD0', a: '#E8B416', sel: '#C4430A', drift: '#B5588C', mut: '#38B07A', mig: '#7CC4F0', ink: '#1B1612', paper: '#F4EEDD', accent: '#A8263F', ochre: '#CF9A33', line: 'rgba(41,33,27,.18)' },
    projector: { ground: '#FFFDF6', surface: '#E8DFC9', text: '#1B1612', text2: '#3D342C', A: '#2F5FD0', a: '#E8B416', sel: '#C4430A', drift: '#B5588C', mut: '#38B07A', mig: '#7CC4F0', ink: '#1B1612', paper: '#FFFDF6', accent: '#A8263F', ochre: '#CF9A33', line: 'rgba(27,22,18,.25)' }
  };
  const LINE = { A: '#2F5FD0', a: '#AD7B00', sel: '#C4430A', drift: '#B5588C', mut: '#0A9662', mig: '#438BB4' };
  // D4 §1.3: sixteen places and two layers. Painted grounds are dimmed ×0.88 in Dusk; the Lab and Expeditions are paper plates.
  const PLACES = [
    ['wood', 'Wood', '#8F9A7E', 'moth'], ['beetle', 'Beetle Isle', '#B7A57A', 'beetle', '#4A423C'], ['streams', 'Streams', '#3E6B6A', 'guppy'],
    ['shore', 'Shore', '#D2BE96', 'hermit crab'], ['lake', 'Lake', '#2E6F86', 'cichlid'], ['meadow', 'Meadow', '#7C9A55', 'ground squirrel'],
    ['hedge', 'Hedge', '#7A6E4E', 'great tit'], ['pond', 'Pond', '#2F5A4E', 'water flea'], ['fig', 'Fig Grove', '#6F7F3F', 'fig wasp'],
    ['valley', 'Valley', '#A38B6B', 'salamander'], ['outer', 'Outer Islands', '#4E6A7A', 'finch'], ['warren', 'Warren', '#4A3F36', 'rabbit'],
    ['reef', 'Reef', '#5A9A88', 'cleaner wrasse'], ['coast', 'Coast', '#9B7A78', 'mosquito'], ['farm', 'Farm', '#94755C', 'bollworm moth'],
    ['cliff', 'Cliff', '#A7A296', 'ammonite'], ['lab', 'Lab', '#F4EEDD', 'fruit fly', null, 1], ['expeditions', 'Expeditions', '#F4EEDD', null, null, 1]
  ];
  const ROLES = ['A', 'a', 'sel', 'drift', 'mut', 'mig'];
  const LETTERS = 'ABCDEFGHIJKL';
  let theme = 'dusk';

  /* ---- colour helpers (no Math.pow/exp/log: Det for the sRGB curve, Math.cbrt for OKLab) ---- */
  const rgb = h => {   // '#rgb', '#rrggbb', 'rgb(r,g,b)', 'rgba(r,g,b,a)' or [r, g, b] → [r, g, b]
    if (Array.isArray(h)) return h.slice(0, 3); const s = String(h).trim();
    if (/^rgba?\(/i.test(s)) return s.replace(/^rgba?\(|\)$/gi, '').split(',').slice(0, 3).map(Number);
    const x = s.replace('#', ''), f = x.length === 3 ? x.split('').map(q => q + q).join('') : x.slice(0, 6); return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16));
  };
  const hex = a => '#' + a.map(v => ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2)).join('').toUpperCase();
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Det.pow((v + 0.055) / 1.055, 2.4); };
  const lum = h => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (h1, h2) => { const a = lum(h1), b = lum(h2); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
  const mix = (h1, h2, k) => { const a = rgb(h1), b = rgb(h2); return hex(a.map((v, i) => v + (b[i] - v) * k)); };
  // cosmetic: OKLab for colour matching (Math.cbrt), never a sim value
  const oklab = h => {
    const [r, g, b] = rgb(h).map(lin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  };
  const okd = (h1, h2) => { const a = oklab(h1), b = oklab(h2); return 100 * Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2])); };
  const rgba = (h, a) => { const [r, g, b] = rgb(h); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
  const best = (fill, cands) => cands.reduce((x, y) => contrast(fill, y) > contrast(fill, x) ? y : x);

  const P = {
    INK, LINE, ROLES, warnings: [],
    rgb, hex, mix, lum, contrast, oklab, okd, rgba, best,
    get theme() { return theme; },
    line(role) { return theme === 'dusk' ? INK.dusk[role] || INK.dusk.ink : LINE[role] || INK[theme][role] || INK[theme].ink; },
    // → {id, name, ground (for the current theme), raw, lava?, anchor, plate}; an unknown id falls back to the Lab
    place(id) {
      const p = PLACES.find(x => x[0] === id) || PLACES.find(x => x[0] === 'lab'), dim = theme === 'dusk' && !p[5];
      const o = { id: p[0], name: p[1], ground: dim ? mix(p[2], '#000000', 0.12) : p[2], raw: p[2], anchor: p[3], plate: !!p[5] };
      if (p[4]) o.lava = dim ? mix(p[4], '#000000', 0.12) : p[4];
      return o;
    },
    places() { return PLACES.map(p => p[0]); },
    /* nearest place to a colour in OKLab; o.text: only places where that text keeps ≥ 4.5:1. o.hue (the legacy adapter):
       a light colour (L > 0.8) goes to the Lab plate; any other matches painted grounds by hue, lightness weighted 0.1,
       because every legacy cabinet is darker than every ground and plain distance would send them all to the Warren */
    nearest(col, o) {
      o = o || {}; let bestId = null, bd = Infinity; const c = oklab(col);
      for (const p of PLACES) {
        if (o.hue && (c[0] > 0.8) !== (p[0] === 'lab')) continue;
        const g = this.place(p[0]).ground, q = oklab(g), w = o.hue ? 0.1 : 1, d = Math.sqrt(w * w * (c[0] - q[0]) * (c[0] - q[0]) + (c[1] - q[1]) * (c[1] - q[1]) + (c[2] - q[2]) * (c[2] - q[2]));
        if (d < bd && (!o.text || contrast(o.text, g) >= 4.5)) { bd = d; bestId = p[0]; }
      }
      return bestId;
    },
    setTheme(t, keep) {
      if (!INK[t]) t = 'dusk'; theme = t;
      if (typeof document !== 'undefined' && document.documentElement) { const de = document.documentElement; if (t === 'dusk') delete de.dataset.theme; else de.dataset.theme = t; }
      if (!keep && t !== 'projector' && Save.d && Save.d.ui && Save.d.ui.th !== t) { Save.d.ui.th = t; Save.save(); }
      if (typeof App !== 'undefined' && App.scr === 'play' && App.ch) this._stage(App.ch, App.ch.theme);
      return t;
    },
    // fill, overlay, overlay ink and letter for allele index 0..11 (D4 §2.2 rule 7)
    allele(i) {
      i = Math.max(0, Math.min(11, i | 0)); const T = INK[theme], base = i % 4;
      const fill = base === 0 ? T.A : base === 1 ? T.a : base === 2 ? T.paper : T.ink;
      // toString() gives the fill, so c.fillStyle = Pal.allele(i) also works
      return { fill, overlay: ['plain', 'stripe', 'dots'][Math.floor(i / 4)], over: best(fill, [T.ink, T.paper]), letter: LETTERS[i], text: best(fill, ['#FFFFFF', T.ink]), outline: base === 3 ? T.paper : T.ink, toString() { return fill; } };
    },
    // D4 §2.2.1 token: disc, 1.5 px outline, bold serif letter when r ≥ 7; o.oneCopy draws the one-copy bar (o.bar 'Y' | 'W' | '')
    token(c, x, y, r, allele, o) {
      o = o || {}; const A = this.allele(allele);
      if (A.overlay !== 'plain' && r < 8 && this.warnings.length < 50) this.warnings.push('token: allele ' + A.letter + ' under 16 px');
      c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = o.fill || A.fill; c.fill();
      if (A.overlay !== 'plain') { c.clip(); this._overlay(c, x, y, r, A); }
      c.restore(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.lineWidth = o.lw || 1.5; c.strokeStyle = o.outline || A.outline; c.stroke();
      if (r >= 7 && o.letter !== '' && A.overlay !== 'plain') { c.beginPath(); c.arc(x, y, r * 0.6, 0, TAU); c.fillStyle = o.fill || A.fill; c.fill(); }   // a plain field under the letter
      if (r >= 7 && o.letter !== '') this._glyph(c, o.letter || (allele === 0 && !o.multi ? 'A' : allele === 1 && !o.multi ? 'a' : A.letter), x, y, Math.max(10, r * 1.15), A.text);
      if (o.oneCopy) this._bar(c, x, y, r, o.bar);
    },
    // split disc: a1 left, a2 right (never blended); an absent copy (−1) gives one token with the one-copy bar
    genotype(c, x, y, r, a1, a2, o) {
      o = o || {};
      if (a1 < 0 || a2 < 0) { this.token(c, x, y, r, a1 < 0 ? a2 : a1, Object.assign({}, o, { oneCopy: true })); return; }
      const A = this.allele(a1), B = this.allele(a2), T = INK[theme];
      for (const [al, s, e] of [[A, TAU / 4, TAU * 3 / 4], [B, -TAU / 4, TAU / 4]]) {
        c.save(); c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, s, e); c.closePath(); c.fillStyle = al.fill; c.fill();
        if (al.overlay !== 'plain') { c.clip(); this._overlay(c, x, y, r, al); }
        c.restore();
      }
      c.beginPath(); c.moveTo(x, y - r); c.lineTo(x, y + r); c.lineWidth = 1.5; c.strokeStyle = T.ink; c.stroke();
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
      if (r >= 10 && o.letter !== '') {
        const L = (al, i) => o.multi || al.letter > 'B' ? al.letter : i === 0 ? 'A' : 'a';
        for (const [al, dx] of [[A, -0.45], [B, 0.45]]) if (al.overlay !== 'plain') { c.beginPath(); c.arc(x + r * dx, y, r * 0.4, 0, TAU); c.fillStyle = al.fill; c.fill(); }
        this._glyph(c, L(A, a1), x - r * 0.45, y, Math.max(10, r * 0.8), A.text); this._glyph(c, L(B, a2), x + r * 0.45, y, Math.max(10, r * 0.8), B.text);
      }
    },
    _overlay(c, x, y, r, A) {
      c.fillStyle = A.over; c.strokeStyle = A.over;
      if (A.overlay === 'stripe') { c.lineWidth = Math.max(1, r / 6); const s = Math.max(3, r / 2.2); c.beginPath(); for (let k = -2 * r; k <= 2 * r; k += s) { c.moveTo(x + k - r, y + r); c.lineTo(x + k + r, y - r); } c.stroke(); }
      else { const s = Math.max(3, r / 2), d = Math.max(0.8, r / 9); c.beginPath(); for (let i = -r; i <= r; i += s) for (let j = -r; j <= r; j += s) { c.moveTo(x + i + d, y + j); c.arc(x + i, y + j, d, 0, TAU); } c.fill(); }
    },
    _bar(c, x, y, r, letter) {
      const T = INK[theme], w = Math.max(10, r * 1.3), by = y + r + 3;
      c.fillStyle = T.ink; c.fillRect(x - w / 2, by, w, 3);
      if (letter && r >= 10) { c.fillStyle = T.paper; c.fillRect(x + w / 2 + 2, by - 7, 13, 16); this._glyph(c, letter, x + w / 2 + 8.5, by + 1, 12, T.ink); }
    },
    // the only text this file draws: one or two letters inside a token (engine glyph; chapter words go through Lbl.put)
    _glyph(c, s, x, y, px, col) {
      c.save(); c.font = '700 ' + Math.round(px) + 'px ' + (P._fd || (P._fd = cssVar('--fd', 'Georgia, serif'))); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
      c.fillText(s, x, y + px * 0.04); c.restore();
    },
    /* the applyTheme adapter: v2 → the chapter's place ground behind the canvas; legacy → nearest place ground for the chrome
       (CSS only, contrast-guarded, Dusk-dimmed), else nothing */
    _stage(ch, t) {
      if (typeof document === 'undefined') return; const el = document.getElementById('scr-play'); if (!el) return;
      const set = (k, v) => v == null ? el.style.removeProperty(k) : el.style.setProperty(k, v);
      if (typeof isV2 === 'function' ? isV2(ch) : ch && ch.v2 === true) {
        const p = this.place(ch.place); el.dataset.place = p.id; set('--v-place', p.ground); setMeta(INK[theme].ground); return;
      }
      delete el.dataset.place; set('--v-place', null);
      if (!t || !t.cab || !t.text) return;
      const text = hex(rgb(t.text));
      const id = this.nearest(t.cab, { text, hue: true }); if (!id) return;
      const g = this.place(id).ground, hud = mix(g, text, 0.08);
      if (contrast(text, hud) < 4.5) return;
      el.dataset.place = id; set('--v-place', g); set('--cab', g); set('--cab2', hud); setMeta(g);
    }
  };
  const cssVar = (k, d) => { try { const v = getComputedStyle(document.body).getPropertyValue(k).trim(); return v || d; } catch (e) { return d; } };
  const setMeta = col => { try { const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', col); } catch (e) { } };
  for (const k of ['ground', 'surface', 'text', 'text2', 'A', 'a', 'sel', 'drift', 'mut', 'mig', 'ink', 'paper', 'accent', 'ochre'])
    Object.defineProperty(P, k, { get() { return INK[theme][k]; }, enumerable: true });

  P.css = () => {   // D4 §2.3 under the --v- prefix, plus the v2 chrome remap and the place backdrop
    const block = t => { const T = INK[t]; let s = ''; for (const k of ['ground', 'surface', 'text', 'text2', 'A', 'a', 'sel', 'drift', 'mut', 'mig', 'ink', 'paper', 'accent', 'ochre', 'line']) s += '--v-' + k + ':' + T[k] + ';';
      for (const r of ROLES) s += '--v-line-' + r + ':' + (t === 'dusk' ? T[r] : LINE[r]) + ';';
      const keep = theme; theme = t; for (const p of PLACES) s += '--v-place-' + p[0] + ':' + P.place(p[0]).ground + ';'; theme = keep; return s; };
    return ':root{' + block('dusk') + '}:root[data-theme=paper]{' + block('paper') + '}:root[data-theme=projector]{' + block('projector') + '}' +
      // inside a v2 play screen the shell's own names follow the theme, so Paper and Projector chrome stays readable
      '#scr-play.v2{--cab:var(--v-ground);--cab2:var(--v-surface);--paper:var(--v-text);--paper-dim:var(--v-text2);--ink:var(--v-ground);--line:var(--v-line);background:var(--v-ground);color:var(--v-text)}' +
      '#scr-play[data-place] #stage{background:var(--v-place)}';
  };
  return P;
})();
EXPORT.Pal = Pal;

if (!Url.v1) {
  if (typeof document !== 'undefined' && document.head && !document.getElementById('ef-tokens')) {
    const st = document.createElement('style'); st.id = 'ef-tokens'; st.textContent = Pal.css(); document.head.appendChild(st);
  }
  // theme: ?projector=1, else the dev-only ?theme=, else the saved choice (Save.d.ui.th, default Dusk)
  Save.onLoad(d => Pal.setTheme(Url.projector ? 'projector' : Url.theme || (d && d.ui && d.ui.th) || 'dusk', true));
  const _applyTheme = applyTheme;
  applyTheme = function (t) {
    const ch = typeof App !== 'undefined' ? App.ch : null, v2 = typeof isV2 === 'function' && isV2(ch);
    const r = _applyTheme.call(this, v2 ? null : t);   // a v2 chapter clears any legacy theme
    try { Pal._stage(ch, t); } catch (e) { }
    return r;
  };
}
