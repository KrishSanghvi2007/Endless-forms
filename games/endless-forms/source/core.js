/* ================= CORE ================= */
const TAU = Math.PI * 2;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
let _s = 1;
function seed(n) { _s = (n >>> 0) || 1; }
function R() { _s |= 0; _s = _s + 0x6D2B79F5 | 0; let t = Math.imul(_s ^ _s >>> 15, 1 | _s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
seed((Date.now() ^ (Math.random() * 1e9)) >>> 0);
function rng(sv) { let s = (sv >>> 0) || 1; return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss() { let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * R()); }
function poisson(l) { if (l <= 0) return 0; if (l > 30) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss())); const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; }
R.state = () => _s | 0;              // int32 state of R(), for snapshots and replays
R.restore = s => { _s = s | 0; };

/* ---------- Det: bit-exact maths ----------
   Only + − × ÷, Math.sqrt/floor/round/abs/trunc and a typed-array view of the exponent bits,
   evaluated in a fixed (Horner) order, so every engine returns the same bits. Relative error ≤ 1e-14.
   Use it for any value between an R() draw and a scored or encoded outcome. */
const Det = (() => {
  const F = new Float64Array(1), U = new Uint32Array(F.buffer);
  const HI = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1 ? 1 : 0, LO = 1 - HI; // word order of a double
  const LN2_HI = 6.93147180369123816490e-01, LN2_LO = 1.90821492927058770002e-10;   // fdlibm split of ln 2
  const LOG2E = 1.44269504088896338700e+00, SQRT2 = 1.4142135623730951, INV_PIO2 = 6.36619772367581382433e-01;
  const PIO2_1 = 1.57079632673412561417e+00, PIO2_2 = 6.07710050630396597660e-11, PIO2_3 = 2.02226624879595063154e-21; // Cody–Waite π/2
  const P2 = new Float64Array(2046);                  // exact 2^k, k = −1022 … 1023, built from the bits
  for (let k = -1022; k <= 1023; k++) { U[HI] = (k + 1023) << 20; U[LO] = 0; P2[k + 1022] = F[0]; }
  const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  const EC = [], LC = [], SC = [], CC = [];
  for (let i = 0; i <= 13; i++) EC.push(1 / fact(i));                    // exp: Σ r^i / i!, to r^13
  for (let i = 0; i <= 10; i++) LC.push(1 / (2 * i + 1));                // log: 2s Σ s^2i / (2i+1), to s^21
  for (let i = 1; i <= 8; i++) SC.push((i % 2 ? -1 : 1) / fact(2 * i + 1)); // sin: r^3 … r^17
  for (let i = 1; i <= 9; i++) CC.push((i % 2 ? -1 : 1) / fact(2 * i));     // cos: r^2 … r^18
  function exp(x) {
    if (x !== x) return x;
    if (x > 709.782712893384) return Infinity;
    if (x < -745.1332191019411) return 0;
    const k = Math.round(x * LOG2E), r = (x - k * LN2_HI) - k * LN2_LO;
    let p = EC[13]; for (let i = 12; i >= 0; i--) p = p * r + EC[i];
    if (k > 1023) return p * 2 * P2[k - 1 + 1022];
    if (k < -1022) return p * P2[k + 54 + 1022] * P2[-54 + 1022];   // one rounding into the subnormals
    return p * P2[k + 1022];
  }
  function log(x) {
    if (x !== x || x < 0) return NaN;
    if (x === 0) return -Infinity;
    if (x === Infinity) return x;
    let e = 0;
    if (x < 2.2250738585072014e-308) { x *= 18014398509481984; e = -54; }  // subnormal: scale by 2^54 first
    F[0] = x; const hi = U[HI];
    e += (hi >>> 20) - 1023; U[HI] = (hi & 0x000fffff) | 0x3ff00000;
    let m = F[0];                                        // x = m · 2^e, m in [1, 2)
    if (m > SQRT2) { m *= 0.5; e++; }                     // now m in [√½, √2]
    const f = m - 1, s = f / (2 + f), z = s * s;
    let p = LC[10]; for (let i = 9; i >= 0; i--) p = p * z + LC[i];
    return e * LN2_HI + (2 * s * p + e * LN2_LO);
  }
  let RN = 0, RR = 0;                                     // reduce(): x = RN·π/2 + RR, |RR| ≤ π/4
  function reduce(x) { RN = Math.round(x * INV_PIO2); RR = ((x - RN * PIO2_1) - RN * PIO2_2) - RN * PIO2_3; }
  function sinp(r) { const z = r * r; let p = SC[7]; for (let i = 6; i >= 0; i--) p = p * z + SC[i]; return r + r * z * p; }
  function cosp(r) { const z = r * r; let p = CC[8]; for (let i = 7; i >= 0; i--) p = p * z + CC[i]; return 1 + z * p; }
  function sin(x) {                                       // valid for |x| ≤ 1e5
    if (x === 0 || x !== x) return x;
    if (x - x !== 0) return NaN;
    reduce(x); const q = RN & 3;
    return q === 0 ? sinp(RR) : q === 1 ? cosp(RR) : q === 2 ? -sinp(RR) : -cosp(RR);
  }
  function cos(x) {
    if (x - x !== 0) return NaN;
    reduce(x); const q = RN & 3;
    return q === 0 ? cosp(RR) : q === 1 ? -sinp(RR) : q === 2 ? -cosp(RR) : sinp(RR);
  }
  function pow(x, y) {                                    // x > 0, or x < 0 with integer y
    if (y === 0) return 1;
    if (x !== x || y !== y) return NaN;
    const yi = Math.trunc(y) === y;
    if (yi && Math.abs(y) <= 64) {                        // exponentiation by squaring
      let b = x, n = Math.abs(y), r = 1;
      for (;;) { if (n % 2 === 1) r *= b; n = Math.floor(n / 2); if (!n) break; b *= b; }
      return y < 0 ? 1 / r : r;
    }
    if (x === 0) return y > 0 ? 0 : Infinity;
    if (x < 0) { if (!yi) return NaN; const v = exp(y * log(-x)); return Math.abs(y) % 2 === 1 ? -v : v; }
    return exp(y * log(x));
  }
  // Same R() draws as the legacy gauss() and poisson(); only the last bits of the values differ.
  function gauss() { let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * log(u)) * cos(TAU * R()); }
  function poisson(l) { if (l <= 0) return 0; if (l > 30) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss())); const L = exp(-l); let k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; }
  return { exp, log, sin, cos, pow, gauss, poisson };
})();

function pick(a) { return a[(R() * a.length) | 0]; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function mean(a) { if (!a.length) return 0; let s = 0; for (const x of a) s += x; return s / a.length; }
function wpick(w) { let t = 0; for (const x of w) t += x; let r = R() * t; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; } return w.length - 1; }
const pct = x => Math.round(x * 100) + '%';
const f2 = x => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(2);
const $ = id => document.getElementById(id);

/* ---------- genetics: diploid, additive, free recombination ----------
   trait spec: {k, n (loci), m0, s0 (initial genetic mean/sd), mu (per-locus mutation prob), msd (effect sd), ve (environmental sd)}
   kind 'dom': one biallelic locus, allele 1 dominant. kind 'count': loci hold counts of deleterious mutations.
   Opt-in extensions (any spec with det, kind 'multi', ploidy, track, link or fx makes lay.x true; legacy layouts never see them):
   det: true        Det maths everywhere for this layout; the same R() draws, only the last bits differ.
   kind 'multi'     {alleles: K, p0: [K shares], dom: [most dominant first] | codom: true, mu}; allele index stored as a float.
   ploidy 'X'|'hap' a male carries one copy (copy 2 = −1, "absent"); an absent copy is never transmitted and draws no R().
   track: true      genomes carry g.id, g.pa = [mother, father] and g.lin (founder lineage of each copy; 0 = absent). */
const Gen = {
  layout(specs) {
    if (specs.some(this._isX)) return this._layoutX(specs);
    let o = 0; const T = {}; for (const s of specs) { s.off = o; o += s.n; T[s.k] = s; } return { specs, T, L: o };
  },
  genome(lay, over, opt) {
    if (lay.x) return this._genomeX(lay, over, opt || {});
    const L = lay.L, g = new Float32Array(L * 2);
    for (const s of lay.specs) {
      const o = (over && over[s.k]) || {};
      for (let i = 0; i < s.n; i++) {
        const j = s.off + i;
        if (s.kind === 'dom') { const p = o.p != null ? o.p : s.p0; g[j] = R() < p ? 1 : 0; g[L + j] = R() < p ? 1 : 0; }
        else if (s.kind === 'count') { const c = s.c0f ? s.c0f(i) : (s.c0 || 0); g[j] = Math.min(s.cap || 99, poisson(c)); g[L + j] = Math.min(s.cap || 99, poisson(c)); }
        else { const m = o.m != null ? o.m : s.m0, sd = o.s != null ? o.s : s.s0, n2 = s.n * 2; g[j] = m / n2 + sd / Math.sqrt(n2) * gauss(); g[L + j] = m / n2 + sd / Math.sqrt(n2) * gauss(); }
      }
    }
    return g;
  },
  mate(lay, a, b, o) { if (lay.x) return this._mateX(lay, a, b, o || {}); const L = lay.L, c = new Float32Array(L * 2); this._gam(lay, a, c, 0); this._gam(lay, b, c, L); return c; },
  _gam(lay, g, out, off) {
    const L = lay.L;
    for (const s of lay.specs) {
      for (let i = 0; i < s.n; i++) {
        const j = s.off + i; let a = R() < 0.5 ? g[j] : g[L + j];
        if (s.kind === 'dom') { if (a < 0.5) { if (R() < s.mu) a = 1; } else if (s.back && R() < s.back) a = 0; }
        else if (s.kind === 'count') { a = Math.min(s.cap || 99, a + poisson(s.u)); }
        else if (R() < s.mu) a += s.msd * gauss();
        out[off + j] = a;
      }
    }
  },
  add(lay, g, k) { const s = lay.T[k], L = lay.L; let v = 0; for (let i = 0; i < s.n; i++) v += g[s.off + i] + g[L + s.off + i]; return v; },
  ph(lay, g, k) { if (lay.x) return this._phX(lay, g, k); const s = lay.T[k]; return clamp(this.add(lay, g, k) + (s.ve || 0) * gauss(), s.lo != null ? s.lo : 0, s.hi != null ? s.hi : 1); },
  dom(lay, g, k) { const s = lay.T[k]; return g[s.off] > 0.5 || g[lay.L + s.off] > 0.5; },
  cnt(lay, g, k, i) { const s = lay.T[k]; return g[s.off + i] + g[lay.L + s.off + i]; },
  freq(lay, pop, k) { if (lay.sexed && lay.T[k].ploidy) return this._freqX(lay, pop, k); const s = lay.T[k]; let c = 0; for (const x of pop) c += x.g[s.off] + x.g[lay.L + s.off]; return pop.length ? c / (2 * pop.length) : 0; },

  /* ----- extensions (only ever reached through lay.x, or called by name) ----- */
  mateX(lay, mom, dad, sex) { return this.mate(lay, mom, dad, { sex }); },
  hap(lay, mom) {                     // haplodiploid son from an unfertilised egg
    for (const s of lay.specs) if (!s.ploidy) throw new Error('Gen.hap: trait ' + s.k + ' needs ploidy');
    const L = lay.L, c = new Float32Array(L * 2), lin = lay.track ? new Uint32Array(2 * L) : null;
    this._gamX(lay, mom, c, 0, lin, false); c.fill(-1, L);
    c.sex = 'm'; if (lin) this._tag(lay, c, mom.id || 0, 0, lin);
    return c;
  },
  clone(lay, g) {                     // asexual copy; mutation still applies, copy 1 then copy 2
    const L = lay.L, c = new Float32Array(L * 2), G = lay.det ? Det.gauss : gauss, P = lay.det ? Det.poisson : poisson;
    for (let h = 0; h < 2; h++) for (const s of lay.specs) for (let i = 0; i < s.n; i++) {
      const j = h * L + s.off + i; c[j] = s.ploidy && g[j] === -1 ? -1 : this._mut(s, g[j], G, P);
    }
    if (g.sex) c.sex = g.sex;
    if (lay.track) this._tag(lay, c, g.id || 0, 0, g.lin ? Uint32Array.from(g.lin) : new Uint32Array(2 * L));
    return c;
  },
  allele(lay, g, k, i = 0) { const s = lay.T[k]; return [g[s.off + i], g[lay.L + s.off + i]]; },
  mph(lay, g, k) {                    // phenotype class: most dominant allele index, or "a1/a2" when codominant
    const s = lay.T[k], a = g[s.off], b = g[lay.L + s.off];
    if (s.codom) return b < 0 ? String(a) : a < 0 ? String(b) : Math.min(a, b) + '/' + Math.max(a, b);
    if (s.kind === 'dom' || a < 0 || b < 0) return Math.max(a, b);
    const d = s.dom; if (!d) return Math.min(a, b);   // default order: allele 0 most dominant
    const ia = d.indexOf(a), ib = d.indexOf(b);
    return ib < 0 || (ia >= 0 && ia <= ib) ? a : b;
  },
  mfreq(lay, pop, k, i = 0) {         // copy frequency of each allele (absent copies skipped)
    const s = lay.T[k], K = s.kind === 'multi' ? s.alleles : 2, f = new Float64Array(K), j = s.off + i, L = lay.L; let n = 0;
    for (const x of pop) {
      const g = x.g || x, a = g[j], b = g[L + j];
      if (a >= 0 && a < K && (a | 0) === a) { f[a]++; n++; }
      if (b >= 0 && b < K && (b | 0) === b) { f[b]++; n++; }
    }
    if (n) for (let q = 0; q < K; q++) f[q] /= n;
    return f;
  },
  pack(lay, g) {                      // plain-JSON form for sim snapshots
    const p = { v: Array.from(g) };
    if (g.id != null) { p.id = g.id; p.pa = g.pa.slice(); }
    if (g.lin) p.lin = Array.from(g.lin);
    if (g.sex) p.sex = g.sex;
    return p;
  },
  unpack(lay, p) {                    // accepts pack() output or a plain array of 2L values
    const g = Float32Array.from(Array.isArray(p) ? p : p.v);
    if (!Array.isArray(p)) {
      if (p.id != null) { g.id = p.id; g.pa = p.pa.slice(); if (lay.nextId != null && p.id >= lay.nextId) lay.nextId = p.id + 1; }
      if (p.lin) g.lin = Uint32Array.from(p.lin);
      if (p.sex) g.sex = p.sex;
    }
    return g;
  },
  _isX(s) { return !!(s.det || s.kind === 'multi' || s.ploidy || s.track || s.link || s.fx); },
  _layoutX(specs) {
    let o = 0; const T = {};
    for (const s of specs) {
      if (s.kind === 'multi') { if (s.n == null) s.n = 1; if (!(s.alleles >= 2)) throw new Error('Gen multi: trait ' + s.k + ' needs alleles >= 2'); }
      if (s.ploidy != null && s.ploidy !== 'X' && s.ploidy !== 'hap') throw new Error('Gen ploidy ' + s.ploidy + ': not yet');
      s.off = o; o += s.n; T[s.k] = s;
    }
    const any = f => specs.some(f);
    return { specs, T, L: o, x: true, det: any(s => s.det), nextId: 1, sexed: any(s => !!s.ploidy), track: any(s => s.track) };
  },
  _sex(lay, o) {
    if (!lay.sexed) return null;
    if (o.sex !== 'f' && o.sex !== 'm') throw new Error('Gen: this layout needs o.sex = f or m');
    return o.sex;
  },
  _genomeX(lay, over, opt) {          // the legacy genome() draws, in the same order; a male skips copy 2 of an X or hap locus
    const L = lay.L, g = new Float32Array(L * 2), G = lay.det ? Det.gauss : gauss, P = lay.det ? Det.poisson : poisson;
    const male = this._sex(lay, opt) === 'm';
    for (const s of lay.specs) {
      const o = (over && over[s.k]) || {}, half = male && !!s.ploidy;
      for (let i = 0; i < s.n; i++) {
        const j = s.off + i;
        if (s.kind === 'dom') { const p = o.p != null ? o.p : s.p0; g[j] = R() < p ? 1 : 0; g[L + j] = half ? -1 : R() < p ? 1 : 0; }
        else if (s.kind === 'count') { const c = s.c0f ? s.c0f(i) : (s.c0 || 0); g[j] = Math.min(s.cap || 99, P(c)); g[L + j] = half ? -1 : Math.min(s.cap || 99, P(c)); }
        else if (s.kind === 'multi') { const p0 = o.p0 || s.p0; g[j] = this._draw(s, p0); g[L + j] = half ? -1 : this._draw(s, p0); }
        else { const m = o.m != null ? o.m : s.m0, sd = o.s != null ? o.s : s.s0, n2 = s.n * 2; g[j] = m / n2 + sd / Math.sqrt(n2) * G(); g[L + j] = half ? -1 : m / n2 + sd / Math.sqrt(n2) * G(); }
      }
    }
    if (lay.sexed) g.sex = male ? 'm' : 'f';
    if (lay.track) this._tag(lay, g, 0, 0, null);
    return g;
  },
  _draw(s, p0) {                      // one R(): inversion over the allele shares (uniform when p0 is absent)
    const K = s.alleles; let t = 0;
    for (let a = 0; a < K; a++) t += p0 ? p0[a] : 1;
    const u = R() * t; let c = 0, a = 0;
    for (; a < K - 1; a++) { c += p0 ? p0[a] : 1; if (u < c) break; }
    return a;
  },
  _mateX(lay, mom, dad, o) {
    const sex = this._sex(lay, o), L = lay.L, c = new Float32Array(L * 2), lin = lay.track ? new Uint32Array(2 * L) : null;
    this._gamX(lay, mom, c, 0, lin, false);
    this._gamX(lay, dad, c, L, lin, sex === 'm');   // a son gets no paternal copy of an X locus
    if (lay.sexed) c.sex = sex;
    if (lin) this._tag(lay, c, mom.id || 0, dad.id || 0, lin);
    return c;
  },
  _gamX(lay, g, out, off, lin, noX) { // _gam with the same draws in the same order, plus absent copies and Det maths
    const L = lay.L, G = lay.det ? Det.gauss : gauss, P = lay.det ? Det.poisson : poisson;
    for (const s of lay.specs) {
      if (s.link) throw new Error('Gen ext link: not yet');
      if (s.fx) throw new Error('Gen ext fx: not yet');
      for (let i = 0; i < s.n; i++) {
        const j = s.off + i; let k;   // index of the transmitted copy; −1 = none
        if (noX && s.ploidy === 'X') k = -1;
        else if (s.ploidy && g[j] === -1) k = g[L + j] === -1 ? -1 : L + j;
        else if (s.ploidy && g[L + j] === -1) k = j;
        else k = R() < 0.5 ? j : L + j;
        out[off + j] = k < 0 ? -1 : this._mut(s, g[k], G, P);
        if (lin) lin[off + j] = k >= 0 && g.lin ? g.lin[k] : 0;
      }
    }
  },
  _mut(s, a, G, P) {                  // one transmitted copy: the legacy mutation draws, plus multi-allele
    if (s.kind === 'dom') { if (a < 0.5) { if (R() < s.mu) a = 1; } else if (s.back && R() < s.back) a = 0; }
    else if (s.kind === 'count') a = Math.min(s.cap || 99, a + P(s.u));
    else if (s.kind === 'multi') { if (s.mu > 0 && R() < s.mu) { let b = Math.floor(R() * (s.alleles - 1)); if (b >= a) b++; a = b; } }
    else if (R() < s.mu) a += s.msd * G();
    return a;
  },
  _tag(lay, g, ma, pa, lin) {         // track: id, parents and lineages (a founder's copies get lineages 2·id and 2·id + 1)
    g.id = lay.nextId++; g.pa = [ma, pa];
    if (!lin) { const L = lay.L; lin = new Uint32Array(2 * L); for (const s of lay.specs) for (let i = 0; i < s.n; i++) { const j = s.off + i; lin[j] = 2 * g.id; lin[L + j] = s.ploidy && g[L + j] === -1 ? 0 : 2 * g.id + 1; } }
    g.lin = lin;
  },
  _phX(lay, g, k) {                   // legacy ph() (same sum order, same gauss draw) skipping absent copies; multi → mph
    const s = lay.T[k], L = lay.L;
    if (s.fx) throw new Error('Gen ext fx: not yet');
    if (s.kind === 'multi') return this.mph(lay, g, k);
    let v = 0;
    for (let i = 0; i < s.n; i++) { const a = g[s.off + i], b = g[L + s.off + i]; v += (s.ploidy && a === -1 ? 0 : a) + (s.ploidy && b === -1 ? 0 : b); }
    return clamp(v + (s.ve || 0) * (lay.det ? Det.gauss() : gauss()), s.lo != null ? s.lo : 0, s.hi != null ? s.hi : 1);
  },
  _freqX(lay, pop, k) {               // present copies only
    const s = lay.T[k], L = lay.L; let c = 0, n = 0;
    for (const x of pop) { const a = x.g[s.off], b = x.g[L + s.off]; if (a !== -1) { c += a; n++; } if (b !== -1) { c += b; n++; } }
    return n ? c / n : 0;
  }
};

/* ---------- colour ---------- */
function hsl2rgb(h, s, l) { h = (((h % 360) + 360) % 360) / 360; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = t => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]; }
const css = (c, a) => a == null ? 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')' : 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

/* ---------- value noise ---------- */
function makeNoise(sv) {
  const r = rng(sv), P = new Uint8Array(512), p = []; for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
  const V = new Float32Array(256); for (let i = 0; i < 256; i++) V[i] = r();
  return function (x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const a = V[P[P[X] + Y]], b = V[P[P[X + 1] + Y]], c = V[P[P[X] + Y + 1]], d = V[P[P[X + 1] + Y + 1]];
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
function fbm(n, x, y, o) { let s = 0, a = 0.5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * n(x * f, y * f); t += a; a *= 0.5; f *= 2.03; } return s / t; }

/* ---------- sound (WebAudio, synthesised) ---------- */
const Snd = {
  ctx: null, on: true,
  init() { if (this.ctx) return; try { const A = window.AudioContext || window.webkitAudioContext; if (A) this.ctx = new A(); } catch (e) { this.ctx = null; } },
  resume() { try { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { } },
  env(g, t, a, d, v) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); },
  tone(f, d, type, v, f2v) { if (!this.on || !this.ctx) return; try { const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2v) o.frequency.exponentialRampToValueAtTime(f2v, t + d); this.env(g, t, 0.006, d, v || 0.08); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.05); } catch (e) { } },
  noise(d, v, fq, q) { if (!this.on || !this.ctx) return; try { const c = this.ctx, t = c.currentTime, n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq || 2000; f.Q.value = q || 1; const g = c.createGain(); this.env(g, t, 0.004, d, v || 0.1); s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); } catch (e) { } },
  peck() { this.noise(0.05, 0.25, 3000, 2); this.tone(820, 0.05, 'triangle', 0.05, 480); },
  miss() { this.tone(170, 0.09, 'sine', 0.05, 120); },
  bitter() { this.tone(210, 0.38, 'sawtooth', 0.045, 85); this.noise(0.32, 0.05, 520, 0.7); },
  chime() { this.tone(660, 0.5, 'sine', 0.06); setTimeout(() => this.tone(990, 0.6, 'sine', 0.05), 120); },
  star() { [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 0.5, 'sine', 0.06), i * 110)); },
  click() { this.tone(1300, 0.025, 'square', 0.015); },
  flood() { this.noise(1.5, 0.12, 380, 0.5); },
  dawn() { this.tone(1568, 0.12, 'sine', 0.025, 1760); setTimeout(() => this.tone(2093, 0.1, 'sine', 0.02, 1976), 140); }
};

/* ---------- save (v2) ----------
   Save.d is the live record (shape below); legacy code reads stars, quick, snd, done and opens at top level.
   Storage: SCORM suspend_data → localStorage → memory (+ Save.code()); IndexedDB mirrors local and memory saves.
   The stored string is a compact form of Save.d (see _ser) so the whole save stays ≤ 3,500 characters.
   ?v1=1 is the legacy game: legacy key and shape, localStorage only. */
const Save = {
  k: 'ef_v2', d: null, adapter: { kind: 'memory', idb: false },
  _UI: { th: 'dusk', calm: 0, read: 0, hap: 0, lh: 0, verbs: 0, unt: 0, real: 0 },
  _KNOWN: { schema: 1, stars: 1, s2: 1, lv: 1, v1stars: 1, done: 1, res: 1, ui: 1, rev: 1, quick: 1, snd: 1, opens: 1 },
  _V2ONLY: ['schema', 's2', 'lv', 'v1stars', 'res', 'ui', 'rev'],
  _fns: [], _loaded: false, _legacy: false, _mem: null, _sc: null, _pend: null, _busy: false, _dbp: null,
  _fresh() { return { schema: 2, stars: {}, s2: {}, lv: {}, v1stars: {}, done: {}, res: {}, ui: Object.assign({}, this._UI), rev: {}, quick: false, snd: true, opens: 0 }; },

  load() {
    this._legacy = this._v1(); this.k = this._legacy ? 'endlessforms_v1' : 'ef_v2'; this.d = this._fresh();
    if (this._legacy) {
      this.adapter = { kind: this._ls() ? 'local' : 'memory', idb: false };
      try { const s = localStorage.getItem(this.k); if (s) { const o = JSON.parse(s); if (o && typeof o === 'object') this.d = Object.assign(this.d, o); if (!this.d.stars) this.d.stars = {}; } } catch (e) { }
    } else {
      this._pick(); let ok = false;
      try { const raw = this._read(); if (raw) ok = this._deser(JSON.parse(raw)); } catch (e) { }
      if (!ok && this.adapter.kind !== 'scorm' && this._importV1()) this.save();
      if (!ok && this.adapter.idb) this._idbBoot();   // the synchronous store was empty or threw
    }
    this._loaded = true; this._fire();
  },
  save() {
    try {
      const s = this._legacy ? this._serV1() : this._ser();
      this._write(s);
      if (this.adapter.idb) { this._pend = s; this._flush(); }
    } catch (e) { }
  },
  star(id, n) { if (n > (this.d.stars[id] || 0)) { this.d.stars[id] = n; this.save(); } },
  star2(id, level, mask) {            // Discover 1, Predict 2, Transfer 4
    const d = this.d; this._mig(id);  // a deep link can reach a level without App.open
    const lv = d.lv[id] || (d.lv[id] = []), n = Math.max(0, level | 0);
    while (lv.length <= n) lv.push(0);
    lv[n] |= mask & 7; d.s2[id] = (d.s2[id] || 0) | (mask & 7); d.stars[id] = this._pop(d.s2[id]);
    this.save(); return d.stars[id];
  },
  migrate(id) { if (this._mig(id)) this.save(); },
  code() { return this._b64e(this._utf8e(this._ser())); },
  fromCode(str) {                     // replaces the save; also accepts a legacy (v1) record
    try {
      if (!this._deser(JSON.parse(this._utf8d(this._b64d(String(str).replace(/\s+/g, '')))))) return false;
      this.save(); this._fire(); return true;
    } catch (e) { return false; }
  },
  size() { return this._ser().length; },
  onLoad(fn) { this._fns.push(fn); if (this._loaded) try { fn(this.d); } catch (e) { } },

  /* Resident snapshot, ≤ 96 bytes, little-endian: u8 version 1 | u16 N | u16 gen | u32 seed | u8 nf | nf × u8 round(p·255)
     | u8 tone mean | u8 tone sd (×255) | u8 np | np × (u16 id + 8 caller-packed genome bytes); nf ≤ 16, np ≤ 4. Base64url. */
  res: {
    put(place, snap) { const b = Save._resEnc(snap); Save.d.res[place] = b; Save.save(); return b; },
    get(place) { const b = Save.d.res[place]; if (!b) return null; try { return Save._resDec(b); } catch (e) { return null; } }
  },
  _resEnc(o) {
    const fr = (o.freqs || []).slice(0, 16), pins = (o.pins || []).slice(0, 4), tone = o.tone || [0, 0];
    const b = new Uint8Array(13 + fr.length + 10 * pins.length); let i = 0;
    const u8 = v => { b[i++] = v & 255; }, u16 = v => { u8(v); u8(v >>> 8); }, q = p => Math.round(clamp(+p || 0, 0, 1) * 255);
    const sv = o.seed >>> 0;
    u8(1); u16(clamp(Math.round(+o.N || 0), 0, 65535)); u16(clamp(Math.round(+o.gen || 0), 0, 65535)); u16(sv & 65535); u16(sv >>> 16);
    u8(fr.length); for (const p of fr) u8(q(p));
    u8(q(tone[0])); u8(q(tone[1])); u8(pins.length);
    for (const p of pins) { u16(p.id & 65535); for (let k = 0; k < 8; k++) u8((p.bytes && p.bytes[k]) || 0); }
    return this._b64e(b);
  },
  _resDec(str) {
    const b = this._b64d(str); let i = 0;
    const u8 = () => { if (i >= b.length) throw new Error('short snapshot'); return b[i++]; }, u16 = () => u8() | u8() << 8;
    if (u8() !== 1) return null;
    const N = u16(), gen = u16(), seed = (u16() | u16() << 16) >>> 0, nf = u8(), freqs = [];
    for (let k = 0; k < nf; k++) freqs.push(u8() / 255);
    const tone = [u8() / 255, u8() / 255], np = u8(), pins = [];
    for (let k = 0; k < np; k++) { const id = u16(), bytes = new Uint8Array(8); for (let j = 0; j < 8; j++) bytes[j] = u8(); pins.push({ id, bytes }); }
    return { N, gen, seed, freqs, tone, pins };
  },

  /* Stored form: {schema: 2, u: {id: S[.L…][!]}, res, ui (non-defaults), rev: {box: 'code code'}, quick: 1, snd: 0, opens, x: {other keys}}.
     S is the legacy star count (or, once migrated, v1stars); '.' marks a migrated unit, followed by one octal digit (mask) per level;
     '!' means done. s2 and a migrated unit's stars are rebuilt from the level masks. */
  _ser() {
    const d = this.d, o = { schema: 2 }, u = {}, own = (m, k) => Object.prototype.hasOwnProperty.call(m, k);
    const ids = Object.keys(Object.assign({}, d.stars, d.v1stars, d.done));
    for (const id of ids) {
      const m = own(d.v1stars, id), n = clamp((m ? d.v1stars[id] : d.stars[id]) | 0, 0, 9), dn = d.done[id] ? '!' : '';
      if (n || m || dn) u[id] = n + (m ? '.' + (d.lv[id] || []).map(x => x & 7).join('') : '') + dn;
    }
    if (ids.length) o.u = u;
    if (Object.keys(d.res).length) o.res = d.res;
    const ui = {}; for (const k in d.ui) if (d.ui[k] !== this._UI[k]) ui[k] = d.ui[k];
    if (Object.keys(ui).length) o.ui = ui;
    const rev = {}; for (const c in d.rev) { const bx = d.rev[c]; rev[bx] = rev[bx] ? rev[bx] + ' ' + c : c; }
    if (Object.keys(rev).length) o.rev = rev;
    if (d.quick) o.quick = 1;
    if (d.snd === false) o.snd = 0;
    if (d.opens) o.opens = d.opens;
    const x = {}; for (const k in d) if (!this._KNOWN[k]) x[k] = d[k];
    if (Object.keys(x).length) o.x = x;
    return JSON.stringify(o);
  },
  _serV1() { const o = Object.assign({}, this.d); for (const k of this._V2ONLY) delete o[k]; return JSON.stringify(o); },
  _deser(o) {                         // stored form (or a legacy record) → this.d; false if unreadable
    if (!o || typeof o !== 'object') return false;
    const d = this._fresh();
    if (o.schema === 2) {
      for (const id in o.u || {}) {
        const m = /^(\d)(?:\.([0-7]*))?(!?)$/.exec(o.u[id]); if (!m) continue;
        if (m[2] != null) {
          d.v1stars[id] = +m[1]; d.lv[id] = m[2].split('').map(Number);
          let s = 0; for (const v of d.lv[id]) s |= v; d.s2[id] = s; d.stars[id] = this._pop(s);
        } else if (+m[1]) d.stars[id] = +m[1];
        if (m[3]) d.done[id] = 1;
      }
      Object.assign(d.res, o.res); Object.assign(d.ui, o.ui);
      for (const bx in o.rev || {}) for (const c of String(o.rev[bx]).split(' ')) if (c) d.rev[c] = +bx;
      d.quick = !!o.quick; d.snd = o.snd !== 0; d.opens = o.opens | 0;
      for (const k in o.x || {}) if (!this._KNOWN[k]) d[k] = o.x[k];
    } else if (o.schema == null && o.stars && typeof o.stars === 'object') this._legacyInto(d, o);
    else return false;
    this.d = d; return true;
  },
  _legacyInto(d, o) {                 // first run: stars, quick, snd, done and opens from a legacy record
    for (const id in o.stars) { const n = o.stars[id] | 0; if (n > 0) d.stars[id] = Math.min(3, n); }
    for (const id in o.done || {}) if (o.done[id]) d.done[id] = 1;
    d.quick = !!o.quick; d.snd = o.snd !== false; d.opens = o.opens | 0;
  },
  _importV1() { try { const s = localStorage.getItem('endlessforms_v1'); if (!s) return false; const o = JSON.parse(s); if (!o || typeof o !== 'object' || !o.stars) return false; this._legacyInto(this.d, o); return true; } catch (e) { return false; } },
  _mig(id) {                          // once per id: the pre-v2 best moves to v1stars
    const d = this.d; if (Object.prototype.hasOwnProperty.call(d.v1stars, id)) return false;
    d.v1stars[id] = d.stars[id] || 0; d.s2[id] = d.s2[id] || 0; d.lv[id] = d.lv[id] || []; d.stars[id] = this._pop(d.s2[id]);
    return true;
  },
  _pop(m) { return (m & 1) + (m >> 1 & 1) + (m >> 2 & 1); },
  _v1() {
    try { if (Url) return !!Url.v1; } catch (e) { }   // Url (ui.js) when present
    try { return /[?&]v1=(1|true)(&|$)/.test(location.search || ''); } catch (e) { return false; }
  },

  /* ----- adapters ----- */
  _ls() { try { localStorage.setItem('__ef', '1'); localStorage.removeItem('__ef'); return true; } catch (e) { return false; } },
  _pick() {
    this._sc = this._scorm();
    if (this._sc) { this.adapter = { kind: 'scorm', idb: false }; return; }   // the LMS is authoritative: no local import or mirror
    let idb = false; try { idb = typeof indexedDB !== 'undefined' && !!indexedDB; } catch (e) { }
    this.adapter = { kind: this._ls() ? 'local' : 'memory', idb };
  },
  _scorm() {                          // SCORM 2004 API_1484_11 or 1.2 API: window.parent up to 7 levels, then opener
    const find = w => {
      for (let n = 0; w && n <= 7; n++) {
        try { if (w.API_1484_11) return { v: 4, api: w.API_1484_11 }; if (w.API) return { v: 1, api: w.API }; if (!w.parent || w.parent === w) return null; w = w.parent; } catch (e) { return null; }
      }
      return null;
    };
    let sc = null; try { sc = find(window) || (window.opener ? find(window.opener) : null); } catch (e) { return null; }
    if (!sc) return null;
    const a = sc.api, f = sc.v === 4
      ? { init: 'Initialize', fin: 'Terminate', get: 'GetValue', set: 'SetValue', commit: 'Commit', err: 'GetLastError', exit: 'cmi.exit' }
      : { init: 'LMSInitialize', fin: 'LMSFinish', get: 'LMSGetValue', set: 'LMSSetValue', commit: 'LMSCommit', err: 'LMSGetLastError', exit: 'cmi.core.exit' };
    try {
      if (String(a[f.init]('')) !== 'true') { const e = String(a[f.err]()); if (e !== '101' && e !== '103') return null; }   // already initialised is fine
      a[f.set](f.exit, 'suspend');
      window.addEventListener('pagehide', () => { try { a[f.commit](''); a[f.fin](''); } catch (e) { } }, { once: true });
    } catch (e) { return null; }
    sc.f = f; return sc;
  },
  _read() {
    const k = this.adapter.kind;
    if (k === 'scorm') { const f = this._sc.f; return String(this._sc.api[f.get]('cmi.suspend_data') || ''); }
    if (k === 'local') return localStorage.getItem(this.k);
    return this._mem;
  },
  _write(s) {
    this._mem = s;
    if (this.adapter.kind === 'scorm') {
      try { const a = this._sc.api, f = this._sc.f; if (String(a[f.set]('cmi.suspend_data', s)) === 'true') { a[f.commit](''); return; } } catch (e) { }
      try { localStorage.setItem(this.k, s); } catch (e) { }   // the LMS refused: keep a local copy
      return;
    }
    if (this.adapter.kind === 'local') { try { localStorage.setItem(this.k, s); } catch (e) { this.adapter.kind = 'memory'; } }
  },
  _db() {
    if (!this._dbp) this._dbp = new Promise((ok, no) => {
      const rq = indexedDB.open('ef', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('save');
      rq.onsuccess = () => ok(rq.result);
      rq.onerror = rq.onblocked = () => no(rq.error);
    });
    return this._dbp;
  },
  _idbBoot() {                        // writes wait until this read is done, so the mirror is never overwritten first
    this._busy = true;
    this._db().then(db => new Promise((ok, no) => { const rq = db.transaction('save').objectStore('save').get('d'); rq.onsuccess = () => ok(rq.result); rq.onerror = () => no(rq.error); }))
      .then(rec => {
        let ok = false; try { ok = !!rec && typeof rec.s === 'string' && this._deser(JSON.parse(rec.s)); } catch (e) { }
        if (ok) { this._busy = false; this.save(); this._fire(); }
      })
      .catch(() => { this.adapter.idb = false; })
      .then(() => { this._busy = false; this._flush(); });
  },
  _flush() {                          // write-behind: only the newest pending string is written
    const s = this._pend; if (s == null || this._busy || !this.adapter.idb) return;
    this._pend = null; this._busy = true;
    this._db().then(db => new Promise(done => { const tx = db.transaction('save', 'readwrite'); tx.objectStore('save').put({ t: Date.now(), s }, 'd'); tx.oncomplete = tx.onerror = tx.onabort = () => done(); }))
      .catch(() => { this.adapter.idb = false; })
      .then(() => { this._busy = false; this._flush(); });
  },
  _fire() { for (const fn of this._fns) try { fn(this.d); } catch (e) { } },

  /* ----- base64url (no padding; also reads + / =) and UTF-8, without btoa or TextEncoder ----- */
  _A: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  _b64e(b) {
    let s = ''; const A = this._A;
    for (let i = 0; i < b.length; i += 3) {
      const n = b[i] << 16 | (b[i + 1] || 0) << 8 | (b[i + 2] || 0);
      s += A[n >> 18 & 63] + A[n >> 12 & 63] + (i + 1 < b.length ? A[n >> 6 & 63] : '') + (i + 2 < b.length ? A[n & 63] : '');
    }
    return s;
  },
  _b64d(s) {
    const out = []; let n = 0, k = 0;
    for (const ch of s.replace(/=+$/, '')) {
      let v = this._A.indexOf(ch); if (v < 0) v = ch === '+' ? 62 : ch === '/' ? 63 : -1;
      if (v < 0) throw new Error('not base64');
      n = (n << 6 | v) & 0xffff; k += 6;
      if (k >= 8) { k -= 8; out.push(n >> k & 255); }
    }
    return Uint8Array.from(out);
  },
  _utf8e(s) {
    const out = [];
    for (const ch of s) {
      const c = ch.codePointAt(0);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | c >> 6, 0x80 | c & 63);
      else if (c < 0x10000) out.push(0xe0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63);
      else out.push(0xf0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63);
    }
    return Uint8Array.from(out);
  },
  _utf8d(b) {
    let s = '', i = 0;
    while (i < b.length) {
      const c = b[i++];
      const cp = c < 0x80 ? c : c < 0xe0 ? (c & 31) << 6 | b[i++] & 63 : c < 0xf0 ? (c & 15) << 12 | (b[i++] & 63) << 6 | b[i++] & 63
        : (c & 7) << 18 | (b[i++] & 63) << 12 | (b[i++] & 63) << 6 | b[i++] & 63;
      s += String.fromCodePoint(cp);
    }
    return s;
  }
};
Save.d = Save._fresh();

/* ---------- events: the run log (CSV export for students and teachers) ---------- */
const Events = {
  log: [], debug: false, _fns: {},
  _BASE: { t: 1, type: 1, unit: 1, level: 1, seed: 1 },
  emit(type, data) {                  // → rec {t, type, unit, level, seed, ...data}; ring buffer of 5000
    if (type === 'fx' && !this.debug) return null;
    let A = null; try { A = App; } catch (e) { }   // App lives in ui.js
    const ch = A && A.ch;
    const rec = Object.assign({ t: Math.round(performance.now()), type, unit: ch ? ch.id : null, level: ch && ch.level != null ? ch.level : null, seed: A && A.seed != null ? A.seed : null }, data);
    this.log.push(rec); if (this.log.length > 5000) this.log.splice(0, this.log.length - 5000);
    for (const fn of (this._fns[type] || []).concat(this._fns['*'] || [])) try { fn(rec); } catch (e) { }
    return rec;
  },
  on(type, fn) {                      // type or '*'; → off()
    (this._fns[type] = this._fns[type] || []).push(fn);
    return () => { const a = this._fns[type], i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); };
  },
  csv() {                             // t,type,unit,level,seed,data (data = the other fields as JSON)
    const q = v => { const s = v == null ? '' : String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const rows = ['t,type,unit,level,seed,data'];
    for (const r of this.log) {
      const o = {}; for (const k in r) if (!this._BASE[k]) o[k] = r[k];
      let js = '{}'; try { js = JSON.stringify(o); } catch (e) { }
      rows.push([r.t, r.type, r.unit, r.level, r.seed, js].map(q).join(','));
    }
    return rows.join('\n') + '\n';
  },
  clear() { this.log.length = 0; },
  lat() {                             // ms from each 'act' to the next 'fx' (null if none followed); needs debug
    const out = []; let next = null;
    for (let i = this.log.length - 1; i >= 0; i--) { const r = this.log[i]; if (r.type === 'fx') next = r.t; else if (r.type === 'act') out.push(next == null ? null : next - r.t); }
    return out.reverse();
  }
};

/* ---------- UI helpers ---------- */
function toast(msg) { const box = $('toasts'); while (box.children.length >= 3) box.firstChild.remove(); const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; $('toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 3200); setTimeout(() => t.remove(), 3800); }
function starStr(n) { return '★'.repeat(n) + '<span class="off">' + '★'.repeat(3 - n) + '</span>'; }
const Cards = {
  open(o) {
    const layer = $('cards'); layer.innerHTML = '';
    const box = document.createElement('div'); box.className = 'card ' + (o.cls || ''); box.innerHTML = o.html;
    const row = document.createElement('div'); row.className = 'card-btns';
    for (const b of o.buttons || []) {
      const bt = document.createElement('button'); bt.className = 'btn' + (b.primary ? ' primary' : ''); bt.textContent = b.t;
      bt.addEventListener('click', () => { if (box.dataset.armed !== '1') return; Snd.click(); if (b.fn) b.fn(); });
      row.appendChild(bt);
    }
    box.appendChild(row); layer.appendChild(box); layer.classList.add('on');
    setTimeout(() => { box.dataset.armed = '1'; }, 380); // ghost-tap guard: taps from the scene can't hit a fresh card
    if (o.onOpen) requestFrame(() => o.onOpen(box));
    return box;
  },
  close() { const l = $('cards'); l.classList.remove('on'); l.innerHTML = ''; },
  isOpen() { return $('cards').classList.contains('on'); }
};
function requestFrame(fn) { setTimeout(fn, 20); }

/* ---------- charts ---------- */
function fitCanvas(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(3, window.devicePixelRatio || 1);
  const w = Math.max(10, Math.round(r.width * d)), h = Math.max(10, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return { c, w: Math.max(10, r.width), h: Math.max(10, r.height) };
}
const THEMES = { dark: { axis: 'rgba(232,223,201,.28)', text: 'rgba(232,223,201,.62)', ref: 'rgba(232,223,201,.5)' }, paper: { axis: 'rgba(41,33,27,.35)', text: 'rgba(41,33,27,.7)', ref: 'rgba(41,33,27,.55)' } };
function lineChart(cv, o) {
  const { c, w, h } = fitCanvas(cv), th = THEMES[o.theme || 'dark'];
  c.clearRect(0, 0, w, h);
  const L = 30, Rm = 8, T = 8, B = 17, pw = w - L - Rm, ph = h - T - B;
  let xmax = o.xmax || 1; for (const s of o.series) xmax = Math.max(xmax, s.d.length - 1);
  const X = i => L + pw * i / xmax, Y = v => T + ph * (1 - (v - o.y0) / (o.y1 - o.y0));
  if (o.bands) for (const b of o.bands) { c.fillStyle = b.c; for (let i = 0; i < b.d.length; i++) { const v = b.d[i]; if (!v) continue; c.globalAlpha = v; c.fillRect(X(i - 0.5), T, Math.max(1, pw / xmax), ph); } c.globalAlpha = 1; }
  c.strokeStyle = th.axis; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T); c.lineTo(L, T + ph); c.lineTo(L + pw, T + ph); c.stroke();
  c.fillStyle = th.text; c.font = '10px ' + getComputedStyle(document.body).getPropertyValue('--fm');
  c.textAlign = 'right'; c.textBaseline = 'middle';
  const fy = o.fy || (v => (Math.round(v * 100) / 100) + '');
  c.fillText(fy(o.y1), L - 4, T + 3); c.fillText(fy(o.y0), L - 4, T + ph - 2);
  c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillText(o.x0l || '0', L, h - 4);
  c.textAlign = 'right'; c.fillText(o.xl || String(xmax), L + pw, h - 4);
  if (o.refs) for (const r of o.refs) { const y = Y(r.v); c.strokeStyle = r.c || th.ref; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(L, y); c.lineTo(L + pw, y); c.stroke(); c.setLineDash([]); if (r.label) { c.fillStyle = r.c || th.ref; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(r.label, L + pw, y - 2); } }
  if (o.marks) for (const m of o.marks) { const x = X(m); c.strokeStyle = th.ref; c.beginPath(); c.moveTo(x, T + ph); c.lineTo(x, T + ph - 6); c.stroke(); }
  for (const s of o.series) {
    c.strokeStyle = s.c; c.lineWidth = s.w || 2; c.setLineDash(s.dash || []); c.lineJoin = 'round'; c.beginPath(); let on = false, lx = 0, ly = 0;
    for (let i = 0; i < s.d.length; i++) { const v = s.d[i]; if (v == null || isNaN(v)) { on = false; continue; } const x = X(i), y = Y(clamp(v, o.y0, o.y1)); if (!on) { c.moveTo(x, y); on = true; } else c.lineTo(x, y); lx = x; ly = y; }
    c.stroke(); c.setLineDash([]);
    if (on && !s.dash) { c.fillStyle = s.c; c.beginPath(); c.arc(lx, ly, 2.6, 0, TAU); c.fill(); }
  }
}
function histChart(cv, o) {
  const { c, w, h } = fitCanvas(cv), th = THEMES[o.theme || 'paper'];
  c.clearRect(0, 0, w, h);
  const L = 8, Rm = 8, T = 6, B = 18, pw = w - L - Rm, ph = h - T - B, nb = o.bins || 16;
  const bin = v => clamp(Math.floor((v - o.lo) / (o.hi - o.lo) * nb), 0, nb - 1);
  const counts = o.layers.map(ly => { const a = new Array(nb).fill(0); for (const v of ly.v) a[bin(v)]++; return a; });
  let mx = 1; for (const a of counts) for (const x of a) mx = Math.max(mx, x);
  const bw = pw / nb;
  o.layers.forEach((ly, k) => { c.fillStyle = ly.c; for (let i = 0; i < nb; i++) { const hh = ph * counts[k][i] / mx; if (hh > 0) c.fillRect(L + i * bw + 1, T + ph - hh, bw - 2, hh); } });
  c.strokeStyle = th.axis; c.beginPath(); c.moveTo(L, T + ph + 0.5); c.lineTo(L + pw, T + ph + 0.5); c.stroke();
  if (o.marker != null) { const x = L + pw * (o.marker - o.lo) / (o.hi - o.lo); c.strokeStyle = o.markerC || '#b07a14'; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, T + ph); c.stroke(); c.setLineDash([]); c.lineWidth = 1; }
  c.fillStyle = th.text; c.font = '11px ' + getComputedStyle(document.body).getPropertyValue('--fb'); c.textBaseline = 'alphabetic';
  c.textAlign = 'left'; c.fillText(o.l0 || '', L, h - 4); c.textAlign = 'right'; c.fillText(o.l1 || '', L + pw, h - 4);
  if (o.ml) { c.textAlign = 'center'; c.fillStyle = o.markerC || '#b07a14'; const x = L + pw * (o.marker - o.lo) / (o.hi - o.lo); c.fillText(o.ml, clamp(x, L + 30, L + pw - 30), h - 4); }
}
function barChart(cv, o) { // o.groups: [{label, parts:[{v,c}]}]
  const { c, w, h } = fitCanvas(cv), th = THEMES.paper;
  c.clearRect(0, 0, w, h);
  const T = 6, B = 18, ph = h - T - B, n = o.groups.length, gw = w / n;
  let mx = 1; for (const g of o.groups) { let s = 0; for (const p of g.parts) s += p.v; mx = Math.max(mx, s); }
  o.groups.forEach((g, i) => {
    let y = T + ph; const x = i * gw + gw * 0.25, bw = gw * 0.5;
    for (const p of g.parts) { const hh = ph * p.v / mx; c.fillStyle = p.c; c.fillRect(x, y - hh, bw, hh); y -= hh; }
    c.fillStyle = th.text; c.font = '12px ' + getComputedStyle(document.body).getPropertyValue('--fb'); c.textAlign = 'center'; c.fillText(g.label, i * gw + gw / 2, h - 4);
  });
}

/* ---------- stage ---------- */
const Stage = {
  cv: null, ctx: null, w: 1, h: 1, dpr: 1,
  init() {
    this.cv = $('scene'); this.ctx = this.cv.getContext('2d');
    window.addEventListener('resize', () => this.resize());
    try { if (window.ResizeObserver) new ResizeObserver(() => { const r = this.cv.parentElement.getBoundingClientRect(); if (Math.abs(r.width - this.w) > 1 || Math.abs(r.height - this.h) > 1) this.resize(); }).observe(this.cv.parentElement); } catch (e) { }
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
    const pos = e => { const r = this.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    this.cv.addEventListener('pointerdown', e => {
      Snd.init(); Snd.resume(); if (Cards.isOpen() || App.paused || !App.mode) return;
      const [x, y] = pos(e); this.pressed = true; try { this.cv.setPointerCapture(e.pointerId); } catch (_) { }
      if (App.mode.down) App.mode.down(x, y); else if (App.mode.tap) App.mode.tap(x, y);
      e.preventDefault();
    }, { passive: false });
    this.cv.addEventListener('pointermove', e => { if (!this.pressed || !App.mode || App.paused) return; const [x, y] = pos(e); if (App.mode.move) App.mode.move(x, y); e.preventDefault(); }, { passive: false });
    const up = e => { if (!this.pressed) return; this.pressed = false; if (!App.mode || App.paused) return; const [x, y] = pos(e); if (App.mode.up) App.mode.up(x, y); };
    this.cv.addEventListener('pointerup', up); this.cv.addEventListener('pointercancel', up);
  },
  resize() {
    const p = this.cv.parentElement; if (!p) return; const r = p.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    this.dpr = Math.min(3, window.devicePixelRatio || 1); this.w = r.width; this.h = r.height;
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.cv.style.width = this.w + 'px'; this.cv.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (App.mode && App.mode.onResize) App.mode.onResize();
  }
};
