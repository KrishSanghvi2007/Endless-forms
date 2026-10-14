/* E3 browser self-test, injected by tests/selftest_e3.py after the game has booted under vclock.js.
   window.__e3[group](arg) → {ok: [...], bad: [...]}. Groups: core, cvd, v1, desktop, perf. */
(function () {
  const T = window.TB, A = ms => window.__advance(ms), $ = id => document.getElementById(id);
  function suite() { const r = { ok: [], bad: [], info: {} }; r.t = (c, m) => (c ? r.ok : r.bad).push(m); return r; }
  // a minimal v2 chapter: a tap verb on a moth-sized target, labels through Lbl.put
  function chapter(o) {
    const ch = Object.assign({
      id: 'e3test', v2: true, place: 'wood', intro: { goal: 'Test unit.' }, title: 'E3 test', num: 0, level: 0, dts: [], draws: 0,
      start(c, opt) { this.level = (opt && opt.level) || 0; this.dts = []; this.draws = 0; if (this.onStart) this.onStart(); },
      update(dt) { this.dts.push(dt); },
      draw(c, w, h) { this.draws++; c.fillStyle = T.Pal.place('wood').ground; c.fillRect(0, 0, w, h); T.Lbl.put('hello', 'Two words', w / 2, 120); },
      notes() { return { stats: [], charts: [] }; }
    }, o || {});
    T.REG[ch.id] = ch; return ch;
  }
  const play = ch => { T.App.playLevel(ch, 0); A(200); };

  window.__e3 = {
    core() {
      const r = suite(), P = T.Pal;
      r.t(['Fx', 'Layer', 'Ghost', 'Lbl', 'Live', 'Whisper', 'Txt', 'Snd2', 'Pal', 'CVD', 'WF'].every(k => T[k]), 'EXPORT: all E3 modules on window.TB');
      r.t(!!$('ef-tokens') && getComputedStyle(document.documentElement).getPropertyValue('--v-A').trim() === '#6B97FF', 'token CSS injected, Dusk --v-A');
      r.t(!(window.__errs || []).length && $('err').style.display !== 'block', 'boot: no errors');
      // a v2 chapter gets its place ground behind the canvas
      const ch = chapter(); play(ch);
      const sp = $('scr-play'), stageBg = getComputedStyle($('stage')).backgroundColor, g = P.rgb(P.place('wood').ground);
      r.t(sp.dataset.place === 'wood' && stageBg === 'rgb(' + g.join(', ') + ')', 'v2: #stage shows the Dusk-dimmed wood ground (' + stageBg + ')');
      r.t(ch.draws > 0 && T.Lbl.list.some(l => l.id === 'hello') && !T.Lbl.warnings.length, 'Lbl.put draws a label in the live loop, no warnings');
      // juice in the loop
      T.Fx.burst('dust', 100, 100, 8); T.Fx.pop('+1', 120, 100, 1); T.Fx.ring(100, 100, 20, { dashed: true });
      r.t(T.Fx.count === 8, 'burst: 8 dust puffs'); A(400); r.t(T.Fx.count === 0, 'dust gone after 300 ms');
      r.t(T.Fx.shake() === true && T.Fx.shake() === false, 'shake rate limit in the page');
      ch.dts = []; T.Fx.hitstop(120); A(400); const z = ch.dts.filter(d => d === 0).length;
      r.t(z >= 2 && z <= 4 && ch.dts.some(d => d > 0), 'hit-stop: v2 update gets dt 0 for ~120 ms (' + z + ' frames of 40 ms)');
      // tween keeps running under a card (pump), done fires once
      const o = { v: 0 }; let done = 0; T.Fx.tween(o, { v: 100 }, 600, 'out', () => done++);
      T.Cards.open({ html: '<p>card</p>', buttons: [] }); A(800); r.t(o.v === 100 && done === 1, 'tween finishes while a card pauses the stage'); T.Cards.close(); A(100);
      // Ghost: first show, dismissal by pointer, verb bits, '?' replay
      T.Save.d.ui.verbs = 0; const gh = T.Ghost.show({ verb: 'tap', at: () => [195, 300] }); A(1500);
      r.t(gh.shown && T.Ghost.active && (T.Save.d.ui.verbs & 1), 'Ghost shows within 3 s and sets the tap bit');
      const shot = $('scene').toDataURL().length; r.info.ghostPNG = shot;
      $('scene').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 300 })); A(80);
      r.t(!T.Ghost.active, 'the first pointer input hides the ghost');
      r.t(!T.Ghost.show({ verb: 'tap', at: () => [1, 1] }).shown, 'a demonstrated verb is not shown again');
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true })); A(60); if (T.Cards.isOpen()) T.Cards.close(); A(120);
      r.t(T.Ghost.active, '? replays the last demonstration'); T.Ghost.hide();
      T.Save.d.ui.calm = 1; T.Save.d.ui.verbs = 0; T.Ghost.show({ verb: 'drag', at: () => [100, 300], to: () => [250, 300] }); A(500); r.t(T.Ghost.active && !(window.__errs || []).length, 'Calm ghost: static arrow, no errors'); T.Ghost.hide(); T.Save.d.ui.calm = 0;
      // Live region
      A(6200);   // the ghost lines above hold the region for up to 6 s
      T.Live.say('Generation 2. Dark moths 40%.'); T.Live.say('Generation 3.'); T.Live.say('Generation 4.');
      const l1 = $('live').textContent; A(3100); r.t(l1 === 'Generation 2. Dark moths 40%.' && $('live').textContent === 'Generation 4.', 'Live: ≤ 1 line per 3 s, newest pending wins');
      // Whisper inside a v2 chapter
      toastViaPage('Seed link copied.'); r.t($('whisper').textContent === 'Seed link copied.' && !$('toasts').children.length, 'v2: toast goes to the in-canvas whisper');
      T.Whisper.say('Second line here.', 'k'); r.t($('whisper').textContent === 'Second line here.', 'one slot: a new whisper replaces the old');
      A(2500); r.t($('whisper').textContent === '', 'whisper clears after 2.4 s');
      T.Whisper.say('This whisper has far too many words for its slot.'); r.t(T.Whisper.warnings.length === 1, 'whisper over 8 words is recorded');
      T.Cards.open({ cls: 'end', html: '<p>end</p>', buttons: [] }); r.t(getComputedStyle($('whisper')).display === 'none', 'whisper hidden while an end card is open'); T.Cards.close(); A(2600);
      // Snd2 with a real AudioContext (suspended, no gesture): plays, voice limit, twins
      T.Snd.on = true; T.Snd.init(); let n = 0, threw = false;
      try { for (const s of T.Snd2.names) if (T.Snd2.play(s, { x: 100, y: 100, i: 3, left: 0.5 })) n++; } catch (e) { threw = true; }
      r.t(!threw && (T.Snd.ctx ? n >= 1 && n <= 3 : n === 0), 'Snd2: every voice plays without error; ≤ 3 at once (' + n + ' sounded)');
      const w0 = T.Snd2.warnings.length; A(400); r.t(T.Snd2.warnings.length === w0, 'Snd2 with {x, y}: twins drawn, no warnings');
      T.Snd2.play('crack'); A(400); r.t(T.Snd2.warnings.length === w0 + 1, 'Snd2 without a visual twin is reported');
      // Paper theme: chrome follows, choice saved
      P.setTheme('paper'); A(80);
      r.t(document.documentElement.dataset.theme === 'paper' && getComputedStyle(document.documentElement).getPropertyValue('--v-A').trim() === '#2F5FD0' && T.Save.d.ui.th === 'paper', 'Paper theme: tokens and Save.d.ui.th');
      r.t(getComputedStyle($('bar-title')).color === 'rgb(41, 33, 27)' && getComputedStyle(sp).backgroundColor === 'rgb(244, 238, 221)', 'Paper theme: v2 bar text dark on paper');
      P.setTheme('dusk'); A(80); r.t(!document.documentElement.dataset.theme && T.Save.d.ui.th === 'dusk', 'back to Dusk');
      T.App.exit(); A(200);
      // menu: whisper sits where toasts were, one slot, queued
      toastViaPage('First line.'); toastViaPage('Second line.');
      r.t($('toasts').children.length === 1 && $('toasts').textContent === 'First line.', 'menu: one slot in #toasts, second line queued');
      A(3800); r.t($('toasts').textContent.indexOf('Second line.') >= 0, 'menu: the queued line follows');
      A(4500);
      // legacy chapters: theme adapter (contrast-guarded), toasts above cards, unchanged frame
      const map = {}; let worst = 99;
      for (const id of T.ORDER) {
        const c = T.REG[id]; if (!c || c.v2 || !c.theme) continue;
        T.App.play(c); A(60);
        const cs = getComputedStyle(sp), place = sp.dataset.place || '-', cab = cs.getPropertyValue('--cab').trim(), txt = cs.getPropertyValue('--paper').trim();
        const k = place === '-' ? null : P.contrast(txt, cab); if (k != null) worst = Math.min(worst, k);
        map[id] = place + (k ? ' ' + k.toFixed(1) : ''); T.App.exit(); A(60);
      }
      r.info.adapter = map;
      r.t(Object.keys(map).length >= 30 && worst >= 4.5, 'legacy adapter: ' + Object.keys(map).length + ' themed chapters mapped, text contrast ≥ 4.5 (worst ' + worst.toFixed(2) + ')');
      T.App.play(T.REG.mendel); A(60); r.t(sp.dataset.place === 'lab', 'Mendel’s light theme maps to the Lab plate');
      toastViaPage('A legacy teaching toast that is long enough to need more than three seconds of reading time.');
      T.Cards.open({ html: '<p>x</p>', buttons: [] }); r.t($('toasts').children.length === 1 && getComputedStyle($('toasts').firstChild).display !== 'none', 'legacy: toast shows above an open card');
      T.Cards.close(); T.App.exit(); A(200);
      r.t(!(window.__errs || []).length && $('err').style.display !== 'block', 'no errors through the whole run' + ((window.__errs || [])[0] ? ': ' + window.__errs[0].slice(0, 200) : ''));
      r.t(!T.Fx.errors.length, 'Fx.errors empty');
      return r;
    },
    cvd(kind) {
      const r = suite();
      r.t(!!$('ef-cvd') && $('app').style.filter === 'url("#ef-cvd-' + kind + '")' && document.documentElement.dataset.cvd === kind, '?cvd=' + kind + ': feColorMatrix filter over #app');
      r.t(T.CVD.apply(null) === null && !$('app').style.filter, 'CVD.apply(null) removes it');
      T.CVD.apply(kind); return r;
    },
    v1() {
      const r = suite();
      r.t(!$('ef-tokens'), '?v1=1: no token CSS');
      T.App.play(T.REG.mendel); A(60); r.t(!$('scr-play').dataset.place, '?v1=1: legacy themes untouched');
      toastViaPage('one'); toastViaPage('two'); r.t($('toasts').children.length === 2, '?v1=1: legacy stacked toasts'); T.App.exit(); A(100);
      return r;
    },
    desktop() {
      const r = suite(); const ch = chapter(); play(ch);
      r.t(T.Stage.layout === 'desktop' && T.Fx.cap() === 300, 'desktop: particle pool 300');
      for (let i = 0; i < 50; i++) T.Fx.burst('egg', 300, 300, 8); r.t(T.Fx.count === 300, 'desktop: capped at 300');
      T.App.exit(); A(100); r.t(T.Fx.count === 0, 'exit clears particles'); return r;
    },
    // D5 §2 gate: a 2,000-dot cached layer plus ≤ 150 moving sprites; returns ms per frame of blit + Fx.draw (real clock)
    perf() {
      const r = suite(), c = T.Stage.ctx, w = T.Stage.w, h = T.Stage.h;
      const L = T.Layer(w, h), pts = []; for (let i = 0; i < 2000; i++) pts.push([(i * 37) % w, (i * 53) % h]);
      L.dots(pts, { r: 3, fill: '#EFE6CC', stroke: '#1B1612' });
      T.App.ch = { v2: true };
      const t0 = performance.now(); let frames = 0;
      while (performance.now() - t0 < 1500) {
        if (T.Fx.count < 150) T.Fx.burst('scale', (frames * 31) % w, (frames * 17) % h, 6);
        L.blit(c); T.Fx.update(1 / 60); T.Fx.draw(c); c.getImageData(0, 0, 1, 1); frames++;
      }
      const ms = (performance.now() - t0) / frames; r.info.msPerFrame = +ms.toFixed(2); r.info.particles = T.Fx.count;
      r.t(ms < 16.7, 'cached 2,000-dot layer + ' + T.Fx.count + ' moving flakes: ' + ms.toFixed(2) + ' ms a frame');
      T.App.ch = null; T.Fx.clear(true); return r;
    }
  };
  function toastViaPage(s) { T.toast(s); }
})();
