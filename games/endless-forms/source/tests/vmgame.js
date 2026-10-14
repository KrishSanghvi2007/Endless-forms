/* tests/vmgame.js: run a built game HTML headless in a Node vm (API_v2 §11.3).

     const { load } = require('./vmgame');
     const G = load('/abs/build.html', { search: '?v1=1' });   // → {TB, window, document, advance(ms), frames(n), errors, texts}
     G.TB.seed(7); G.TB.REG.lichen.sim.reset(0, {});

   It cuts the single 'use strict' IIFE out of the HTML and runs it in a fresh vm context with stub DOM, canvas,
   storage, performance and requestAnimationFrame. Time is virtual, as in vclock.js: nothing runs until you call
   G.advance(ms); setTimeout(fn, 16) means 40 ms, so frames keep the legacy cadence. Math.random is seeded (opts.random
   = 'native' to opt out), so a load is a pure function of the build. Game code must not need real layout at load, and
   sim code must not touch the DOM at all. Also exported: runSim (the headless driver bots.js and oracles share), mulberry. */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

function extract(html) {
  const a = html.indexOf("(function(){\n'use strict';");
  if (a < 0) throw new Error('vmgame: no game IIFE in this HTML (was it built with build.py?)');
  const b = html.indexOf('</script>', a);
  return html.slice(a, b < 0 ? undefined : b);
}

function mulberry(seed) {   // small seeded PRNG for Math.random and bots (never R())
  let s = seed >>> 0;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/* ---------- a permissive stub DOM: enough for boot(), Shell.init() and chapter start() ---------- */
function makeDom(o) {
  const byId = new Map(), VW = o.vw || 390, VH = o.vh || 780;
  const camel = s => s.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
  function style() {
    const st = { cssText: '', setProperty(k, v) { st[k] = String(v); }, removeProperty(k) { const v = st[k]; delete st[k]; return v || ''; }, getPropertyValue(k) { return st[k] || ''; } };
    return st;
  }
  function ctx2d(cv) {   // a no-op 2D context; reads of unset fields give a no-op function (calls) or a default
    const store = { canvas: cv, globalAlpha: 1, lineWidth: 1, font: '10px sans-serif', fillStyle: '#000', strokeStyle: '#000', textAlign: 'start', textBaseline: 'alphabetic',
      lineCap: 'butt', lineJoin: 'miter', globalCompositeOperation: 'source-over', shadowBlur: 0, shadowColor: 'transparent', imageSmoothingEnabled: true, filter: 'none', lineDashOffset: 0, miterLimit: 10 };
    const grad = () => ({ addColorStop() { } });
    const img = (w, h) => ({ width: w | 0, height: h | 0, data: new Uint8ClampedArray(Math.max(0, (w | 0) * (h | 0) * 4)) });
    const fns = {
      measureText: s => ({ width: String(s).length * 7, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2, actualBoundingBoxLeft: 0, actualBoundingBoxRight: String(s).length * 7, fontBoundingBoxAscent: 9, fontBoundingBoxDescent: 3 }),
      createLinearGradient: grad, createRadialGradient: grad, createConicGradient: grad, createPattern: () => ({ setTransform() { } }),
      getImageData: (x, y, w, h) => img(w, h), createImageData: (w, h) => typeof w === 'object' ? img(w.width, w.height) : img(w, h),
      getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, inverse() { return this; }, transformPoint: p => p }),
      isPointInPath: () => false, isPointInStroke: () => false, getLineDash: () => [],
      fillText(s) { o.texts.push(String(s)); if (o.texts.length > 5000) o.texts.splice(0, 2500); }
    };
    return new Proxy(store, {
      get(t, k) { if (k in fns) return fns[k]; if (k in t) return t[k]; return typeof k === 'string' ? () => { } : undefined; },
      set(t, k, v) { t[k] = v; return true; }
    });
  }
  class ClassList {
    constructor(el) { this.el = el; }
    get _s() { return new Set(this.el._cls.split(/\s+/).filter(Boolean)); }
    _put(s) { this.el._cls = [...s].join(' '); }
    add(...c) { const s = this._s; c.forEach(x => s.add(x)); this._put(s); }
    remove(...c) { const s = this._s; c.forEach(x => s.delete(x)); this._put(s); }
    toggle(c, f) { const s = this._s, on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); this._put(s); return on; }
    contains(c) { return this._s.has(c); }
    replace(a, b) { const s = this._s; if (!s.has(a)) return false; s.delete(a); s.add(b); this._put(s); return true; }
    get length() { return this._s.size; }
    item(i) { return [...this._s][i] || null; }
    get value() { return this.el._cls; }
    [Symbol.iterator]() { return this._s[Symbol.iterator](); }
  }
  // simple selectors only: '#id', '.a.b', 'tag', 'tag.a', '[attr]', '[attr=v]', with descendant combinators matched on the last part
  function matches(el, sel) {
    sel = String(sel).trim(); if (!sel) return false;
    if (sel.indexOf(',') >= 0) return sel.split(',').some(s => matches(el, s));
    const last = sel.split(/\s+|>/).filter(Boolean).pop() || '';
    const m = last.match(/^([a-zA-Z0-9*-]*)((?:[#.][\w-]+|\[[^\]]+\]|:[\w-]+(?:\([^)]*\))?)*)$/); if (!m) return false;
    if (m[1] && m[1] !== '*' && m[1].toUpperCase() !== el.tagName) return false;
    for (const p of m[2].match(/[#.][\w-]+|\[[^\]]+\]|:[\w-]+(?:\([^)]*\))?/g) || []) {
      if (p[0] === '#' && el.id !== p.slice(1)) return false;
      if (p[0] === '.' && !el.classList.contains(p.slice(1))) return false;
      if (p[0] === '[') { const a = p.slice(1, -1).split('='), k = a[0].trim(), v = a[1] != null ? a[1].replace(/["']/g, '').trim() : null; const got = el.getAttribute(k); if (got == null || (v != null && got !== v)) return false; }
    }
    return true;
  }
  const all = (root, sel, out) => { for (const c of root.children) { if (matches(c, sel)) out.push(c); all(c, sel, out); } return out; };
  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', times: '×', minus: '−' };
  const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] != null ? ENT[e.toLowerCase()] : m);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const textNode = t => { const e = new El('#text'); e.nodeType = 3; e._text = String(t); return e; };
  function parseInto(parent, html, before) {   // a tolerant HTML fragment parser: tags, attributes, text, void elements
    const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)|</g;
    const stack = [parent], put = (top, n) => top === parent && before ? parent.insertBefore(n, before) : top.appendChild(n); let m;
    while ((m = re.exec(String(html)))) {
      const top = stack[stack.length - 1];
      if (m[0].startsWith('<!--')) continue;
      if (m[5] != null) { put(top, textNode(decode(m[5]))); continue; }
      if (m[0] === '<') { put(top, textNode('<')); continue; }
      const tag = m[2].toLowerCase();
      if (m[1]) { for (let i = stack.length - 1; i > 0; i--) if (stack[i].localName === tag) { stack.length = i; break; } continue; }
      const el = new El(tag);
      for (const at of m[3].matchAll(/([^\s=>\/]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) { let v = at[2] == null ? '' : at[2]; if (/^["']/.test(v)) v = v.slice(1, -1); el.setAttribute(at[1], decode(v)); }
      put(top, el);
      if (!m[4] && !VOID.has(tag)) stack.push(el);
    }
  }
  const byWalk = (root, id) => { for (const c of root.children) { if (c._id === id) return c; const f = byWalk(c, id); if (f) return f; } return null; };
  class El {
    constructor(tag, id) {
      this.tagName = String(tag || 'div').toUpperCase(); this.nodeName = this.tagName; this.nodeType = 1; this.localName = this.tagName.toLowerCase();
      this._nodes = []; this.parentNode = null; this.style = style(); this.dataset = {}; this.attrs = {}; this._cls = ''; this._text = '';
      this.listeners = {}; this.value = ''; this.checked = false; this.disabled = false; this.hidden = false; this.tabIndex = 0; this.width = 300; this.height = 150; this.scrollTop = 0; this.scrollLeft = 0;
      this.classList = new ClassList(this); this._id = '';
      if (id) this.id = id;
    }
    get ownerDocument() { return o.document; }
    get id() { return this._id; } set id(v) { this._id = String(v); if (v) byId.set(this._id, this); }
    get className() { return this._cls; } set className(v) { this._cls = String(v); }
    get children() { return this._nodes.filter(n => n.nodeType === 1); } get childNodes() { return this._nodes.slice(); }
    get firstChild() { return this._nodes[0] || null; } get lastChild() { return this._nodes[this._nodes.length - 1] || null; }
    get firstElementChild() { return this.children[0] || null; } get lastElementChild() { const c = this.children; return c[c.length - 1] || null; } get childElementCount() { return this.children.length; }
    get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
    get nextSibling() { const p = this.parentNode; return p ? p._nodes[p._nodes.indexOf(this) + 1] || null : null; }
    get previousSibling() { const p = this.parentNode; return p ? p._nodes[p._nodes.indexOf(this) - 1] || null : null; }
    get nextElementSibling() { const p = this.parentNode; if (!p) return null; const c = p.children; return c[c.indexOf(this) + 1] || null; }
    get previousElementSibling() { const p = this.parentNode; if (!p) return null; const c = p.children; return c[c.indexOf(this) - 1] || null; }
    get innerHTML() { return this._nodes.map(c => c.outerHTML).join(''); }
    set innerHTML(v) { this._nodes.forEach(c => { c.parentNode = null; }); this._nodes = []; if (v != null && v !== '') parseInto(this, v); }
    get outerHTML() {
      if (this.nodeType === 3) return esc(this._text);
      if (this.nodeType !== 1) return this.innerHTML;
      let a = (this._id ? ' id="' + this._id + '"' : '') + (this._cls ? ' class="' + this._cls + '"' : '');
      for (const k in this.attrs) if (k !== 'id' && k !== 'class' && !k.startsWith('data-')) a += ' ' + k + '="' + esc(this.attrs[k]) + '"';
      for (const k in this.dataset) a += ' data-' + k.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + '="' + esc(this.dataset[k]) + '"';
      return '<' + this.localName + a + '>' + (VOID.has(this.localName) ? '' : this.innerHTML + '</' + this.localName + '>');
    }
    get textContent() { return this.nodeType === 3 ? this._text : this._nodes.map(c => c.textContent).join(''); }
    set textContent(v) { v = v == null ? '' : String(v); if (this.nodeType === 3) { this._text = v; return; } this.innerHTML = ''; if (v) this.appendChild(textNode(v)); }
    get nodeValue() { return this.nodeType === 3 ? this._text : null; } set nodeValue(v) { if (this.nodeType === 3) this._text = String(v); }
    get data() { return this._text; } set data(v) { this._text = String(v); }
    get innerText() { return this.textContent; } set innerText(v) { this.textContent = v; }
    get isConnected() { let e = this; while (e.parentNode) e = e.parentNode; return e === o.document.documentElement; }
    get offsetParent() { return this.parentNode || o.document.body; }
    get offsetWidth() { return VW; } get offsetHeight() { return VH; } get clientWidth() { return VW; } get clientHeight() { return VH; }
    get scrollWidth() { return VW; } get scrollHeight() { return VH; } get offsetLeft() { return 0; } get offsetTop() { return 0; }
    appendChild(c) { return this.insertBefore(c, null); }
    append(...cs) { for (const c of cs) this.appendChild(typeof c === 'string' ? textNode(c) : c); }
    prepend(...cs) { const f = this.firstChild; for (const c of cs) this.insertBefore(typeof c === 'string' ? textNode(c) : c, f); }
    insertBefore(c, ref) {
      if (c.nodeType === 11) { c._nodes.slice().forEach(x => this.insertBefore(x, ref)); return c; }
      if (c.parentNode) c.parentNode.removeChild(c);
      const i = ref ? this._nodes.indexOf(ref) : -1; c.parentNode = this;
      if (i < 0) this._nodes.push(c); else this._nodes.splice(i, 0, c);
      return c;
    }
    removeChild(c) { const i = this._nodes.indexOf(c); if (i >= 0) this._nodes.splice(i, 1); c.parentNode = null; return c; }
    replaceChild(n, c) { this.insertBefore(n, c); return this.removeChild(c); }
    replaceChildren(...cs) { this.innerHTML = ''; this.append(...cs); }
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }
    replaceWith(n) { if (this.parentNode) this.parentNode.replaceChild(typeof n === 'string' ? textNode(n) : n, this); }
    before(n) { if (this.parentNode) this.parentNode.insertBefore(typeof n === 'string' ? textNode(n) : n, this); }
    after(n) { if (this.parentNode) this.parentNode.insertBefore(typeof n === 'string' ? textNode(n) : n, this.nextSibling); }
    insertAdjacentHTML(pos, h) {
      pos = String(pos).toLowerCase();
      if (pos === 'afterbegin') parseInto(this, h, this.firstChild || null);
      else if (pos === 'beforebegin' && this.parentNode) parseInto(this.parentNode, h, this);
      else if (pos === 'afterend' && this.parentNode) { const nx = this.nextSibling; if (nx) parseInto(this.parentNode, h, nx); else parseInto(this.parentNode, h); }
      else parseInto(this, h);
    }
    insertAdjacentElement(pos, el) { pos = String(pos).toLowerCase(); if (pos === 'afterbegin') return this.insertBefore(el, this.firstChild); if (pos === 'beforebegin' && this.parentNode) return this.parentNode.insertBefore(el, this); if (pos === 'afterend' && this.parentNode) return this.parentNode.insertBefore(el, this.nextSibling); return this.appendChild(el); }
    cloneNode(deep) { const e = new El(this.tagName); e.nodeType = this.nodeType; e._text = this._text; e._cls = this._cls; Object.assign(e.attrs, this.attrs); Object.assign(e.dataset, this.dataset); if (this._id) e._id = this._id; if (deep) this._nodes.forEach(c => e.appendChild(c.cloneNode(true))); return e; }
    setAttribute(k, v) {
      v = String(v); k = String(k);
      if (k === 'id') { this.id = v; return; } if (k === 'class') { this._cls = v; return; }
      if (k.startsWith('data-')) { this.dataset[camel(k.slice(5))] = v; return; }
      if (k === 'style') { for (const d of v.split(';')) { const i = d.indexOf(':'); if (i > 0) this.style[camel(d.slice(0, i).trim())] = d.slice(i + 1).trim(); } }
      if (k === 'disabled') this.disabled = true; if (k === 'hidden') this.hidden = true; if (k === 'value') this.value = v;
      this.attrs[k] = v;
    }
    getAttribute(k) { if (k === 'id') return this._id || null; if (k === 'class') return this._cls || null; if (k.startsWith('data-')) { const v = this.dataset[camel(k.slice(5))]; return v == null ? null : String(v); } if (k === 'disabled') return this.disabled ? '' : null; return k in this.attrs ? this.attrs[k] : null; }
    hasAttribute(k) { return this.getAttribute(k) != null; }
    removeAttribute(k) { delete this.attrs[k]; if (k.startsWith('data-')) delete this.dataset[camel(k.slice(5))]; if (k === 'class') this._cls = ''; if (k === 'id') this._id = ''; if (k === 'disabled') this.disabled = false; if (k === 'hidden') this.hidden = false; }
    toggleAttribute(k, f) { const on = f === undefined ? !this.hasAttribute(k) : !!f; if (on) this.setAttribute(k, ''); else this.removeAttribute(k); return on; }
    addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); }
    removeEventListener(t, fn) { const l = this.listeners[t]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } }
    dispatchEvent(e) {
      if (!e.target) try { e.target = this; } catch (x) { }
      for (let el = this; el; el = el.parentNode) {
        try { e.currentTarget = el; } catch (x) { }
        for (const f of (el.listeners[e.type] || []).slice()) f.call(el, e);
        if (typeof el['on' + e.type] === 'function') el['on' + e.type](e);
        if (!e.bubbles || e._stop) return !e.defaultPrevented;
      }
      if (this.isConnected) { o.document.dispatchEvent(e); if (!e._stop) o.window.dispatchEvent(e); }
      return !e.defaultPrevented;
    }
    click() { if (!this.disabled) this.dispatchEvent(new o.Event('click', { bubbles: true, cancelable: true })); }
    focus() { o.document.activeElement = this; } blur() { if (o.document.activeElement === this) o.document.activeElement = o.document.body; }
    querySelector(s) { return all(this, s, [])[0] || null; } querySelectorAll(s) { return all(this, s, []); }
    getElementsByTagName(t) { return all(this, t, []); } getElementsByClassName(c) { return all(this, '.' + c, []); }
    matches(s) { return matches(this, s); }
    closest(s) { for (let e = this; e && e.nodeType === 1; e = e.parentNode) if (matches(e, s)) return e; return null; }
    contains(n) { for (let e = n; e; e = e.parentNode) if (e === this) return true; return false; }
    getBoundingClientRect() { const w = parseFloat(this.style.width) || VW, h = parseFloat(this.style.height) || VH; return { left: 0, top: 0, x: 0, y: 0, right: w, bottom: h, width: w, height: h }; }
    getClientRects() { return [this.getBoundingClientRect()]; }
    getContext(kind) { if (kind !== '2d') return null; return this._ctx || (this._ctx = ctx2d(this)); }
    toDataURL() { return 'data:,'; } toBlob(fn) { fn(null); }
    scrollIntoView() { } scrollTo() { } scrollBy() { } setPointerCapture() { } releasePointerCapture() { } hasPointerCapture() { return false; }
    animate() { return { finished: Promise.resolve(), cancel() { }, finish() { }, onfinish: null }; }
    getAnimations() { return []; } attachShadow() { return new El('shadow'); } showModal() { } show() { } close() { } select() { } setSelectionRange() { }
  }
  const document = {
    nodeType: 9, readyState: 'complete', hidden: false, visibilityState: 'visible', title: '', cookie: '', referrer: '', listeners: {},
    fonts: { ready: Promise.resolve(), load: () => Promise.resolve([]), check: () => true, add() { }, forEach() { }, status: 'loaded' },
    createElement: t => new El(t), createElementNS: (ns, t) => new El(t), createTextNode: t => textNode(t),
    createDocumentFragment: () => { const e = new El('#fragment'); e.nodeType = 11; return e; },
    createComment: () => { const e = new El('#comment'); e.nodeType = 8; return e; },
    getElementById(id) {   // browser semantics: connected elements only, null when absent
      id = String(id); const c = byId.get(id);
      if (c && c._id === id && c.isConnected) return c;
      const f = byWalk(document.documentElement, id); if (f) byId.set(id, f); return f;
    },
    querySelector(s) { s = String(s).trim(); if (/^#[\w-]+$/.test(s)) return document.getElementById(s.slice(1)); return document.documentElement.querySelector(s); },
    querySelectorAll(s) { return document.documentElement.querySelectorAll(s); },
    getElementsByTagName(t) { return document.documentElement.getElementsByTagName(t); }, getElementsByClassName(c) { return document.documentElement.getElementsByClassName(c); },
    addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); }, removeEventListener(t, fn) { const l = this.listeners[t]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } },
    dispatchEvent(e) { for (const f of (this.listeners[e.type] || []).slice()) f.call(document, e); return true; },
    hasFocus: () => true, execCommand: () => false, elementFromPoint: () => null, elementsFromPoint: () => [], getSelection: () => ({ removeAllRanges() { }, addRange() { }, toString: () => '' }),
    createRange: () => ({ selectNodeContents() { }, setStart() { }, setEnd() { } }), exitFullscreen: () => Promise.resolve(), fullscreenElement: null
  };
  document.documentElement = new El('html'); document.head = new El('head'); document.body = new El('body');
  document.documentElement.appendChild(document.head); document.documentElement.appendChild(document.body);
  if (o.bodyHTML) parseInto(document.body, o.bodyHTML);
  document.activeElement = document.body; document.scrollingElement = document.documentElement;
  o.document = document;
  return { document, El, byId };
}

/* ---------- virtual timers (vclock.js semantics) ---------- */
function makeClock() {
  let vt = 0, nid = 1; const q = [], errors = [];
  const setTimeout = (fn, ms, ...a) => { ms = +ms || 0; if (ms === 16) ms = 40; const t = { id: nid++, at: vt + Math.max(0, ms), fn, a }; q.push(t); return t.id; };
  const clearTimeout = i => { const k = q.findIndex(t => t.id === i); if (k >= 0) q.splice(k, 1); };
  const setInterval = (fn, ms, ...a) => { const h = { id: 0 }; const tick = () => { h.id = setTimeout(tick, ms); fn(...a); }; h.id = setTimeout(tick, ms); return h; };
  const clearInterval = h => { if (h && h.id) clearTimeout(h.id); else clearTimeout(h); };
  const advance = ms => {
    const end = vt + Math.max(0, +ms || 0);
    for (let guard = 0; guard < 1e6; guard++) {
      let bi = -1; for (let k = 0; k < q.length; k++) if (q[k].at <= end && (bi < 0 || q[k].at < q[bi].at || (q[k].at === q[bi].at && q[k].id < q[bi].id))) bi = k;
      if (bi < 0) break;
      const t = q.splice(bi, 1)[0]; vt = t.at;
      try { t.fn(...(t.a || [])); } catch (e) { errors.push(String(e && e.stack || e)); }
    }
    vt = end;
  };
  return { setTimeout, clearTimeout, setInterval, clearInterval, advance, now: () => vt, errors, pending: () => q.length };
}

/* ---------- load ---------- */
function load(htmlPath, opts) {
  opts = opts || {};
  const html = fs.readFileSync(path.resolve(htmlPath), 'utf8'), js = extract(html);
  const search = opts.search ? (String(opts.search)[0] === '?' ? String(opts.search) : '?' + opts.search) : '';
  const clock = makeClock(), store = new Map(), texts = [];
  const bi = html.indexOf('<body'), bs = bi < 0 ? -1 : html.indexOf('>', bi) + 1, be = html.lastIndexOf('<script', html.indexOf("(function(){\n'use strict';"));
  const o = { vw: opts.vw || 390, vh: opts.vh || 780, texts, bodyHTML: bs > 0 && be > bs ? html.slice(bs, be) : '' };   // the shell's own markup
  const storage = m => ({ getItem: k => m.has(String(k)) ? m.get(String(k)) : null, setItem: (k, v) => { m.set(String(k), String(v)); }, removeItem: k => { m.delete(String(k)); }, clear: () => m.clear(), key: i => [...m.keys()][i] || null, get length() { return m.size; } });
  const winListeners = {};
  class Event {
    constructor(type, init) { init = init || {}; this.type = type; this.bubbles = !!init.bubbles; this.cancelable = !!init.cancelable; this.defaultPrevented = false; this.target = null; this.timeStamp = clock.now(); Object.assign(this, init); }
    preventDefault() { this.defaultPrevented = true; } stopPropagation() { this._stop = true; } stopImmediatePropagation() { this._stop = true; }
  }
  class UIEvent extends Event { }
  class KeyboardEvent extends UIEvent { constructor(t, i) { super(t, Object.assign({ key: '', code: '', repeat: false, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false }, i)); } }
  class MouseEvent extends UIEvent { constructor(t, i) { super(t, Object.assign({ clientX: 0, clientY: 0, button: 0, buttons: 0 }, i)); } }
  class PointerEvent extends MouseEvent { constructor(t, i) { super(t, Object.assign({ pointerId: 1, pointerType: 'mouse', isPrimary: true }, i)); } }
  class CustomEvent extends Event { constructor(t, i) { super(t, i); this.detail = (i || {}).detail; } }
  o.Event = Event;
  const win = {
    console: opts.console || console,
    location: { search, hash: '', href: 'file:///vmgame/game.html' + search, protocol: 'file:', host: '', hostname: '', pathname: '/vmgame/game.html', origin: 'null', reload() { }, assign() { }, replace() { } },
    navigator: { userAgent: 'vmgame (Node ' + process.version + ')', language: 'en-GB', languages: ['en-GB', 'en'], maxTouchPoints: 0, onLine: true, platform: 'node', vibrate: () => false, clipboard: { writeText: () => Promise.resolve(), readText: () => Promise.resolve('') }, share: undefined },
    history: { length: 1, state: null, replaceState() { }, pushState() { }, back() { } },
    screen: { width: o.vw, height: o.vh, availWidth: o.vw, availHeight: o.vh, orientation: { type: 'portrait-primary', angle: 0, addEventListener() { } } },
    innerWidth: o.vw, innerHeight: o.vh, outerWidth: o.vw, outerHeight: o.vh, devicePixelRatio: 1, scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0,
    localStorage: storage(store), sessionStorage: storage(new Map()),
    performance: { now: clock.now, mark() { }, measure() { }, timeOrigin: 1700000000000 },
    setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout, setInterval: clock.setInterval, clearInterval: clock.clearInterval,
    requestAnimationFrame: fn => clock.setTimeout(() => fn(clock.now()), 16), cancelAnimationFrame: id => clock.clearTimeout(id),
    requestIdleCallback: fn => clock.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 10 }), 1), cancelIdleCallback: id => clock.clearTimeout(id),
    queueMicrotask: fn => Promise.resolve().then(fn), structuredClone: v => JSON.parse(JSON.stringify(v)),
    matchMedia: q => ({ matches: !!(opts.reducedMotion && /prefers-reduced-motion:\s*reduce/.test(q)), media: q, onchange: null, addListener() { }, removeListener() { }, addEventListener() { }, removeEventListener() { } }),
    getComputedStyle: el => new Proxy({ getPropertyValue: k => (el && el.style && el.style[k]) || '' }, { get: (t, k) => k in t ? t[k] : '' }),
    addEventListener(t, fn) { (winListeners[t] = winListeners[t] || []).push(fn); },
    removeEventListener(t, fn) { const l = winListeners[t]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } },
    dispatchEvent(e) { if (!e.target) try { e.target = win; } catch (x) { } for (const f of (winListeners[e.type] || []).slice()) f.call(win, e); return !e.defaultPrevented; },
    scrollTo() { }, scrollBy() { }, focus() { }, blur() { }, print() { }, alert() { }, confirm: () => false, prompt: () => null, open: () => null, close() { }, postMessage() { },
    Event, UIEvent, KeyboardEvent, MouseEvent, PointerEvent, CustomEvent, FocusEvent: UIEvent, TouchEvent: UIEvent, WheelEvent: MouseEvent, InputEvent: UIEvent,
    TextEncoder, TextDecoder, URL, URLSearchParams, Blob: typeof Blob !== 'undefined' ? Blob : class { }, atob, btoa, AbortController,
    Image: class { constructor(w, h) { this.width = w || 0; this.height = h || 0; this.complete = false; } set src(v) { this._src = v; this.complete = true; clock.setTimeout(() => { if (this.onload) this.onload(); }, 0); } get src() { return this._src || ''; } decode() { return Promise.resolve(); } },
    FontFace: class { constructor(f) { this.family = f; this.status = 'loaded'; } load() { return Promise.resolve(this); } },
    ResizeObserver: class { observe() { } unobserve() { } disconnect() { } },
    MutationObserver: class { observe() { } disconnect() { } takeRecords() { return []; } },
    IntersectionObserver: class { observe() { } unobserve() { } disconnect() { } },
    Path2D: class { addPath() { } moveTo() { } lineTo() { } arc() { } rect() { } closePath() { } bezierCurveTo() { } quadraticCurveTo() { } ellipse() { } },
    DOMMatrix: class { constructor() { Object.assign(this, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }); } },
    CSS: { supports: () => false, escape: s => String(s) }
  };
  win.window = win; win.self = win; win.globalThis = win; win.top = win; win.parent = win; win.opener = null; win.frames = win;
  if (opts.globals) Object.assign(win, opts.globals);   // e.g. {API: scormMock}, {indexedDB: …}
  o.window = win;
  const dom = makeDom(o);
  win.document = dom.document; win.HTMLElement = dom.El; win.Element = dom.El; win.HTMLCanvasElement = dom.El; win.HTMLInputElement = dom.El; win.HTMLButtonElement = dom.El;
  const ctx = vm.createContext(win);
  // virtual Date.now (vclock.js), seeded Math.random (golden_init.js) unless opts.random === 'native'
  vm.runInContext('Date.now = () => 1700000000000 + performance.now();', ctx);
  if (opts.random !== 'native') { vm.runInContext('Math', ctx).random = mulberry(opts.randomSeed == null ? 0x2545F491 : opts.randomSeed); }
  if (opts.storage) for (const k in opts.storage) store.set(k, String(opts.storage[k]));
  try { vm.runInContext(js, ctx, { filename: path.basename(htmlPath) + ' (game IIFE)' }); }
  catch (e) { const err = new Error('vmgame: the game threw at load: ' + (e && e.stack || e)); err.cause = e; throw err; }
  const G = {
    TB: win.TB, window: win, document: dom.document, store, texts, errors: clock.errors,
    advance: ms => { clock.advance(ms); return G; },
    frames: (n, ms) => { for (let i = 0; i < (n || 1); i++) clock.advance(ms || 40); return G; },
    now: clock.now,
    errorBox: () => { const e = dom.document.getElementById('err'); return e && e.style.display === 'block' ? e.textContent : null; }
  };
  if (!G.TB) throw new Error('vmgame: the build loaded but set no window.TB');
  return G;
}

/* ---------- the headless sim driver shared by bots.js and oracles (API_v2 §9.3, §11.3) ----------
   runSim(TB, ch, level, {seed, policy(s, acts, rnd) → action | null, cap (ticks), every (ticks between decisions), untimed, P, rnd})
   → {result, ticks, acts, s, capped}. R() is seeded once; reset → (actions → policy → act) / step → result, as Sim.run does. */
function runSim(TB, ch, level, o) {
  o = o || {};
  const sim = ch.sim; if (!sim || typeof sim.reset !== 'function') throw new Error('runSim: ' + ch.id + ' has no headless sim');
  const ui = TB.Save && TB.Save.d && TB.Save.d.ui, unt0 = ui ? ui.unt : 0;
  if (ui) ui.unt = o.untimed ? 1 : 0;
  try {
    TB.seed(o.seed == null ? 1 : o.seed); ch.level = level;
    sim.reset(level, Object.assign({}, o.P ? { P: o.P } : {}, o.reset || {}));
    if (sim.s && !Array.isArray(sim.s.log)) sim.s.log = [];
    const dt = sim.dt || 1 / 30, lv = (ch.levels || [])[level] || {}, minutes = lv.minutes || 5;
    const cap = o.cap || Math.ceil(2 * minutes * 60 / dt), every = Math.max(1, o.every || 1), rnd = o.rnd || mulberry((o.seed || 1) * 7919 + 13);
    let ticks = 0, acts = 0, result = sim.result();
    while (!result && ticks < cap) {
      if (o.policy && ticks % every === 0) {
        const A = sim.actions ? sim.actions() || [] : [];
        const a = A.length ? o.policy(sim.s, A, rnd, ticks) : null;
        if (a) { sim.s.log.push([ticks, a]); sim.act(a); acts++; result = sim.result(); if (result) break; }
      }
      sim.step(dt); ticks++;
      result = sim.result();
    }
    return { result, ticks, acts, s: sim.s, capped: !result };
  } finally { if (ui) ui.unt = unt0; }
}

module.exports = { load, extract, runSim, mulberry, makeClock };
