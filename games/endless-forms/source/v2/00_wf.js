/* ================= v2/00_wf.js: WF, the one haploid Wright–Fisher and sampling helper (D2-6, API_v2 §5.4) =================
   Every draw comes from the shared R(), in a fixed order, so a run is (seed, actions). Between a draw and a count only
   + − × ÷, Math.sqrt/floor and Det are used (D5 decision 24). Expectation curves that need Math.exp live in WF.ghost
   and are drawn only as ghosts. Used by Invasion, the Drift Casino, the Scribe's plates, the Coalescent and others.
   Model honesty: above n·p = 30 a binomial draw is a rounded normal (MODEL card: "normal approximation above n·p = 30"). */
const WF = {
  // q^n for an integer n ≥ 0 by repeated squaring: exact operation order, no Math.pow
  _powi(q, n) { let r = 1, b = q; while (n > 0) { if (n & 1) r *= b; b *= b; n = Math.floor(n / 2); } return r; },

  // successes in n trials with probability p. 1 draw by inversion when n·p < 30, else 2 (rounded normal); none when p ≤ 0, p ≥ 1 or n ≤ 0
  binom(n, p) {
    n = Math.floor(n);
    if (!(n > 0) || !(p > 0)) return 0;
    if (p >= 1) return n;
    if (p > 0.5) return n - this.binom(n, 1 - p);
    const q = 1 - p;
    if (n * p < 30) {
      const u = R(); let f = this._powi(q, n), k = 0, c = f;
      while (u > c && k < n) { f *= (n - k) / (k + 1) * p / q; k++; c += f; }
      return k;
    }
    const x = Math.floor(n * p + 0.5 + Math.sqrt(n * p * q) * Det.gauss());
    return x < 0 ? 0 : x > n ? n : x;
  },

  // counts over K types; ps need not sum to 1. Conditional binomials in index order; the last type takes the rest (no draw)
  multinom(n, ps) {
    const K = ps.length, out = new Int32Array(K); n = Math.floor(n);
    if (!K || !(n > 0)) return out;
    const suf = new Float64Array(K + 1);
    for (let i = K - 1; i >= 0; i--) suf[i] = suf[i + 1] + (ps[i] > 0 ? ps[i] : 0);
    let rem = n;
    for (let i = 0; i < K - 1 && rem > 0; i++) {
      const w = ps[i] > 0 ? ps[i] : 0;
      out[i] = suf[i] > 0 ? this.binom(rem, w / suf[i]) : 0;
      rem -= out[i];
    }
    if (rem > 0) { let j = K - 1; while (j > 0 && !(suf[j] > 0)) j--; out[j] += rem; }   // a zero-weight last type never receives copies
    return out;
  },

  // successes in n draws without replacement from N items of which K are successes (n sequential draws, one R() each)
  hyper(N, K, n) {
    N = Math.floor(N); K = Math.max(0, Math.min(N, Math.floor(K))); n = Math.max(0, Math.min(N, Math.floor(n)));
    let k = 0, rN = N, rK = K;
    for (let i = 0; i < n; i++) { if (R() * rN < rK) { k++; rK--; } rN--; }
    return k;
  },

  // k distinct items of arr, in draw order (partial Fisher–Yates on a copy)
  sample(arr, k) {
    const a = Array.prototype.slice.call(arr), m = a.length; k = Math.max(0, Math.min(m, Math.floor(k)));
    for (let i = 0; i < k; i++) { const j = i + Math.floor(R() * (m - i)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a.slice(0, k);
  },

  freqs(counts) {
    const K = counts.length, out = new Float64Array(K); let t = 0;
    for (let i = 0; i < K; i++) t += counts[i];
    if (t > 0) for (let i = 0; i < K; i++) out[i] = counts[i] / t;
    return out;
  },

  // one generation: x_i ∝ counts_i · w_i, then mutation (o.mu to each other type, or o.M[i][j] = P(i → j)), then multinom(N, x).
  // w: array, or function (x, gen) → weights (x = current shares, gen = o.gen || 0). N defaults to the current total.
  step(counts, w, N, o) {
    o = o || {}; const K = counts.length;
    if (typeof w === 'function') w = w(this.freqs(counts), o.gen || 0);
    let tot = 0; for (let i = 0; i < K; i++) tot += counts[i];
    if (N == null) N = tot;
    const x = new Float64Array(K); let s = 0;
    for (let i = 0; i < K; i++) { x[i] = counts[i] * (w ? w[i] : 1); if (!(x[i] > 0)) x[i] = 0; s += x[i]; }
    if (!(s > 0)) return new Int32Array(K);   // nobody left to reproduce
    for (let i = 0; i < K; i++) x[i] = x[i] / s;
    if (o.M) {
      const y = new Float64Array(K);
      for (let j = 0; j < K; j++) { let v = 0; for (let i = 0; i < K; i++) v += x[i] * o.M[i][j]; y[j] = v; }
      return this.multinom(N, y);
    }
    if (o.mu > 0 && K > 1) for (let j = 0; j < K; j++) x[j] = x[j] * (1 - (K - 1) * o.mu) + o.mu * (1 - x[j]);
    return this.multinom(N, x);
  },

  // gens generations → [Int32Array per generation], element 0 = the start; o.stop(counts, gen) → true ends early
  run(counts, w, N, gens, o) {
    o = Object.assign({}, o); let c = Int32Array.from(counts); const out = [c];
    for (let g = 0; g < gens; g++) {
      o.gen = g; c = this.step(c, w, N, o); out.push(c);
      if (o.stop && o.stop(c, g + 1)) break;
    }
    return out;
  },

  /* Expectations for dashed ghosts only. Ne counts individuals; ploidy copies each (1 = haploid, the default here),
     so a population holds ploidy·Ne copies. Math.exp/log are allowed in these functions and nowhere else in this file. */
  ghost: {
    // ghost-only. Fixation probability of a type at share p0 with selection coefficient s (Kimura 1962): (1 − e^(−S·p0)) / (1 − e^(−S)), S = 2·ploidy·Ne·s
    kimura(p0, Ne, s, ploidy) {
      const S = 2 * (ploidy || 1) * Ne * s;
      if (Math.abs(S) < 1e-9) return p0;
      if (S < -700) return 0;
      return -Math.expm1(-S * p0) / -Math.expm1(-S);
    },
    neutral(p0) { return p0; },   // ghost-only. A neutral type fixes with probability equal to its share
    // ghost-only. Expected heterozygosity after t generations of drift: H0·(1 − 1/(ploidy·Ne))^t
    decay(H0, Ne, t, ploidy) { return H0 * Math.pow(1 - 1 / ((ploidy || 1) * Ne), t); },
    // ghost-only. Mean generations until one of two neutral types is lost: −2·Nc·(p ln p + q ln q), Nc = ploidy·Ne copies
    absorb(p0, Ne, ploidy) { const q = 1 - p0, Nc = (ploidy || 1) * Ne, f = v => v > 0 ? v * Math.log(v) : 0; return -2 * Nc * (f(p0) + f(q)); }
  }
};
EXPORT.WF = WF;
