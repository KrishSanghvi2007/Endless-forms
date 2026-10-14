/* ================= v2/00_cvd.js: CVD, colour-vision preview and colour lints (FCR-11; D4 §2.4; API_v2 §5.2) =================
   ?cvd=deut|prot|trit|mono lays an SVG feColorMatrix (Machado, Oliveira & Fernandes 2009, severity 1.0, linear RGB) over the
   game, for screenshots and design checks. The lints compare colours in CIEDE2000 (threshold 8): pairs told apart only by
   colour, hue-only star traits, natural paint too close to a data ink, and moth–bark agreement across vision types.
   Colour maths only, never a sim value: it uses Det and its own atan2, so the file stays free of Math.exp/log/pow/sin/cos. */
const CVD = (() => {
  const M = {   // linear-RGB matrices, rows r, g, b
    prot: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
    deut: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.011820, 0.042940, 0.968881],
    trit: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.303900],
    mono: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722]
  };
  const KINDS = ['normal', 'deut', 'prot', 'trit'], PI = 3.141592653589793, DEG = PI / 180;
  const NONHUE = { shape: 1, pattern: 1, letter: 1, marker: 1, size: 1, position: 1, motion: 1 };
  const toRGB = c => typeof c === 'string' ? (typeof Pal !== 'undefined' ? Pal.rgb(c) : [0, 2, 4].map(i => parseInt(c.replace('#', '').slice(i, i + 2), 16))) : c;
  const lin = v => { v = Math.max(0, Math.min(255, v)) / 255; return v <= 0.04045 ? v / 12.92 : Det.pow((v + 0.055) / 1.055, 2.4); };
  const enc = v => { v = Math.max(0, Math.min(1, v)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Det.pow(v, 1 / 2.4) - 0.055); };
  function atan(x) {   // |error| < 1e-15: reduce to |x| ≤ tan(π/8), then the odd series in Horner form
    let sg = 1, off = 0; if (x < 0) { sg = -1; x = -x; }
    if (x > 2.414213562373095) { off = PI / 2; x = -1 / x; } else if (x > 0.41421356237309503) { off = PI / 4; x = (x - 1) / (x + 1); }
    const z = x * x; let s = 0; for (let k = 27; k >= 0; k--) s = (k % 2 ? -1 : 1) / (2 * k + 1) + z * s;
    return sg * (off + x * s);
  }
  const atan2 = (y, x) => x > 0 ? atan(y / x) : x < 0 ? atan(y / x) + (y >= 0 ? PI : -PI) : y > 0 ? PI / 2 : y < 0 ? -PI / 2 : 0;
  const p7 = v => { const v2 = v * v; return v2 * v2 * v2 * v; };
  function lab(c) {   // cosmetic: sRGB 0..255 → CIELAB (D65), a colour metric, never a sim value
    const [r, g, b] = toRGB(c).map(lin), f = t => t > 0.008856451679035631 ? Math.cbrt(t) : t / 0.12841854934601665 + 4 / 29;
    const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047, Y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b, Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883;
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }
  function de2000(l1, l2) {   // Sharma, Wu & Dalal (2005), kL = kC = kH = 1
    const [L1, a1, b1] = l1, [L2, a2, b2] = l2, C1 = Math.sqrt(a1 * a1 + b1 * b1), C2 = Math.sqrt(a2 * a2 + b2 * b2), Cb = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(p7(Cb) / (p7(Cb) + 6103515625))), A1 = (1 + G) * a1, A2 = (1 + G) * a2;
    const c1 = Math.sqrt(A1 * A1 + b1 * b1), c2 = Math.sqrt(A2 * A2 + b2 * b2);
    const hue = (b, a) => { if (a === 0 && b === 0) return 0; const h = atan2(b, a) / DEG; return h < 0 ? h + 360 : h; };
    const h1 = hue(b1, A1), h2 = hue(b2, A2), dL = L2 - L1, dC = c2 - c1;
    let dh = 0; if (c1 * c2 !== 0) { dh = h2 - h1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
    const dH = 2 * Math.sqrt(c1 * c2) * Det.sin(dh * DEG / 2), Lb = (L1 + L2) / 2, cb = (c1 + c2) / 2;
    let hb = h1 + h2; if (c1 * c2 !== 0) hb = Math.abs(h1 - h2) <= 180 ? hb / 2 : hb < 360 ? (hb + 360) / 2 : (hb - 360) / 2;
    const T = 1 - 0.17 * Det.cos((hb - 30) * DEG) + 0.24 * Det.cos(2 * hb * DEG) + 0.32 * Det.cos((3 * hb + 6) * DEG) - 0.20 * Det.cos((4 * hb - 63) * DEG);
    const q = (hb - 275) / 25, dT = 30 * Det.exp(-q * q), RC = 2 * Math.sqrt(p7(cb) / (p7(cb) + 6103515625));
    const SL = 1 + 0.015 * (Lb - 50) * (Lb - 50) / Math.sqrt(20 + (Lb - 50) * (Lb - 50)), SC = 1 + 0.045 * cb, SH = 1 + 0.015 * cb * T, RT = -Det.sin(2 * dT * DEG) * RC;
    const x = dL / SL, y = dC / SC, z = dH / SH;
    return Math.sqrt(x * x + y * y + z * z + RT * y * z);
  }

  const C = {
    kind: null, M, KINDS, _lab: lab, _de: de2000, _atan2: atan2,
    sim(c, kind) {   // [r, g, b] 0..255 as seen under 'deut' | 'prot' | 'trit' | 'mono' (null or 'normal': unchanged)
      const v = toRGB(c), m = M[kind]; if (!m) return v.slice(0, 3);
      const l = v.map(lin);
      return [0, 1, 2].map(i => enc(m[3 * i] * l[0] + m[3 * i + 1] * l[1] + m[3 * i + 2] * l[2]));
    },
    dE(c1, c2) { return de2000(lab(c1), lab(c2)); },
    // encodings [{k, rgb, channels}]: pairs whose only shared cue is colour must stay ≥ 8 apart in every vision type.
    // A shared non-hue channel (shape, pattern, letter, marker…) separates a pair; 'luminance' counts only if ΔL* ≥ 8 for everyone.
    pairs(encodings, o) {
      o = o || {}; const out = [], min = o.min || 8, E = encodings || [];
      for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) {
        const a = E[i], b = E[j], ca = a.channels || ['colour'], cb = b.channels || ['colour'];
        if (ca.some(ch => NONHUE[ch] && cb.indexOf(ch) >= 0)) continue;
        const lumOK = ca.indexOf('luminance') >= 0 && cb.indexOf('luminance') >= 0 && KINDS.every(k => Math.abs(lab(this.sim(a.rgb, k === 'normal' ? null : k))[0] - lab(this.sim(b.rgb, k === 'normal' ? null : k))[0]) >= min);
        if (lumOK) continue;
        for (const k of KINDS) { const d = this.dE(this.sim(a.rgb, k === 'normal' ? null : k), this.sim(b.rgb, k === 'normal' ? null : k)); if (d < min || o.all) out.push({ a: a.k, b: b.k, kind: k, dE: Math.round(d * 100) / 100 }); }
      }
      return out;
    },
    // hue lint: every trait in a star, score or prediction predicate (ch.starTraits) needs a non-hue channel in ch.encodings
    hue(ch) {
      const enc = (ch && ch.encodings) || [];
      return ((ch && ch.starTraits) || []).filter(t => !enc.some(e => e.k === t && (e.channels || []).some(c => NONHUE[c] || c === 'luminance')));
    },
    // gamut lint: natural paint within ΔE 8 of any data ink, in either theme (D4 §2.2 rule 3)
    gamut(paints, o) {
      o = o || {}; const out = [], min = o.min || 8, inks = [];
      if (typeof Pal !== 'undefined') for (const t of ['dusk', 'paper']) for (const r of Pal.ROLES) inks.push([t + '.' + r, Pal.INK[t][r]]);
      for (const p of paints || []) for (const [n, ink] of inks) { const d = this.dE(p, ink); if (d < min) out.push({ paint: p, ink: n, dE: Math.round(d * 100) / 100 }); }
      return out;
    },
    // camouflage agreement: ΔE under each sim ÷ ΔE under normal vision (D4 asks ≥ 0.9 for deuteranopia)
    agree(c1, c2, kind) { const n = this.dE(c1, c2); return n > 0 ? this.dE(this.sim(c1, kind || 'deut'), this.sim(c2, kind || 'deut')) / n : 1; },
    lint(ch) { return { pairs: this.pairs(ch && ch.encodings), hue: this.hue(ch) }; },
    // the preview filter over the whole game (#app, cards, toasts, notes sheet); null removes it
    apply(kind) {
      if (typeof document === 'undefined' || !document.body) return null;
      kind = M[kind] ? kind : null; this.kind = kind;
      if (kind && !document.getElementById('ef-cvd')) {
        const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('id', 'ef-cvd'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
        for (const k in M) {
          const f = document.createElementNS(NS, 'filter'), cm = document.createElementNS(NS, 'feColorMatrix'), m = M[k];
          f.setAttribute('id', 'ef-cvd-' + k); f.setAttribute('color-interpolation-filters', 'linearRGB');
          cm.setAttribute('type', 'matrix'); cm.setAttribute('values', [0, 1, 2].map(i => m[3 * i] + ' ' + m[3 * i + 1] + ' ' + m[3 * i + 2] + ' 0 0').join(' ') + ' 0 0 0 1 0');
          f.appendChild(cm); svg.appendChild(f);
        }
        document.body.appendChild(svg);
      }
      for (const id of ['app', 'cards', 'toasts', 'sheet']) { const el = document.getElementById(id); if (el) el.style.filter = kind ? 'url(#ef-cvd-' + kind + ')' : ''; }
      if (kind) document.documentElement.dataset.cvd = kind; else delete document.documentElement.dataset.cvd;
      return kind;
    }
  };
  return C;
})();
EXPORT.CVD = CVD;
if (Url.cvd) CVD.apply(Url.cvd);
