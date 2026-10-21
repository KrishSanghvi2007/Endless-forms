/* E2 shell self-test (API_v2 §4), injected into a loaded game page after vclock.js. Run it with tests/selftest_e2.py.
   window.__e2[group]() → {ok: [...], bad: [...]}. Groups need these page URLs and viewports:
     core     390×780, no params       Url defaults, Stage.u/hit/zones, legacy isolation, App.playLevel, HUD, Dock, Strip, Hooks, keys, level select
     url      390×780, ?unit=casino&level=2&seed=42&teacher=1&locks=mixer.N:40,casino.Ne:12&cvd=deut&lab=x&theme=paper&calm=1
     teacher  390×780, ?teacher=1      speed, step, pause, freeze, reveal, seed chip
     desktop  1280×720 (kind = 'desktop') or with ?projector=1 (kind = 'projector')
     v1       390×780, ?v1=1&teacher=1 nothing new shows */
(function () {
  const $ = id => document.getElementById(id);
  function suite() {
    const ok = [], bad = [];
    const t = (cond, msg) => (cond ? ok : bad).push(msg);
    return { t, eq: (a, b, msg) => t(JSON.stringify(a) === JSON.stringify(b), msg + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'), done: () => { t(!window.__errs.length, 'no JS errors ' + window.__errs.slice(0, 2).join(' | ')); t($('err').style.display !== 'block', 'no error box ' + $('err').textContent.slice(0, 120)); return { ok, bad }; } };
  }
  const key = (k, target) => (target || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  const ptr = (el, type, x, y) => { const r = el.getBoundingClientRect(); el.dispatchEvent(new PointerEvent(type, { clientX: r.left + x, clientY: r.top + y, pointerId: 7, bubbles: true })); };
  // a minimal v2 chapter that records what the shell does to it
  function testChapter() {
    const T = {
      id: 'zz_e2', v2: true, title: 'E2 test', num: 99, intro: { goal: 'Test the shell.' }, keys: { X: 'test key' },
      levels: [{ name: 'First', minutes: 2 }, { name: 'Second', minutes: 3 }, { name: 'Boss', minutes: 4 }],
      log: [], dts: [], polls: 0, plates: 0, n: 0, steps: 0, asked: 0, keysSeen: [], pressed: 0, typed: false,
      start(ch, o) { this.o = o; this.level = o.level || 0; this.r0 = TB.R(); this.n = 0; this.dts = []; this.log = []; TB.Dock.set([{ id: 'a', label: 'Do it', key: 'D', fn: () => this.pressed++ }, { id: 'b', label: 'Other', disabled: true, why: 'Not yet' }]); TB.HUD.say('Tap a beetle you can see.', '42%'); },
      update(dt) { this.n++; this.dts.push(dt); },
      draw() { this.log.push('draw'); },
      notes() { this.polls++; return { stats: [['Copies', '61%', 'Share of a copies.']], charts: [this.typed ? { type: 'trace', title: 'Typed' } : { title: 'Plate', draw: () => this.plates++ }] }; },
      onKey(k) { this.keysSeen.push(k); },
      teacherStep() { this.steps++; }, freezeAsk() { this.asked++; }
    };
    return T;
  }
  const TBx = () => { const T = window.TB; if (T && T.Intro) T.Intro.off = true; return T; };   // shell checks drive v2 levels directly; the description card and the dock's "?" (D6 decision 8) are tested in selftest_e4
  // a chapter that is still legacy in this build: lichen until v2/lichen.js is in it, else an appendix chapter (never rebuilt, D6)
  const legacyCh = REG => ['lichen', 'web', 'islands', 'fire', 'nest'].map(id => REG[id]).find(c => c && c.v2 !== true);

  window.__e2 = {
    core() {
      const S = suite(), { App, Url, Stage, Hooks, Dock, Strip, HUD, Notes, Cards, REG } = TBx();
      // Url defaults (file: page, no params)
      S.eq([Url.unit, Url.level, Url.seed, Url.teacher, Url.projector, Url.v1, Url.cvd, Url.lab, Url.theme, Url.calm], [null, null, null, false, false, false, null, null, null, false], 'Url defaults');
      S.t(Url.dev === true, 'file: page is a dev build');
      S.t(/\?unit=a&level=1&seed=5&teacher=1$/.test(Url.link({ unit: 'a', level: 1, seed: 5, teacher: true, projector: false })), 'Url.link orders unit, level, seed and drops false: ' + Url.link({ unit: 'a', level: 1, seed: 5, teacher: true }));
      S.t(/locks=mixer\.N%3A40$/.test(Url.link({ locks: { 'mixer.N': 40 } })), 'Url.link encodes locks');
      S.eq(Url.lock('mixer', 'N', 3), 3, 'Url.lock default');
      // legacy chapter: nothing v2 appears, geometry is the legacy column
      Cards.close(); TB.seed(7); App.play(legacyCh(REG)); window.__advance(400);
      S.t(!$('scr-play').classList.contains('v2') && !document.body.dataset.layout, 'legacy: no v2 class or layout');
      S.eq(['strip', 'dock', 'teacher', 'lv-btn'].map(id => getComputedStyle($(id)).display), ['none', 'none', 'none', 'none'], 'legacy: strip, dock, teacher, Levels hidden');
      S.t(getComputedStyle($('notes-btn')).display !== 'none', 'legacy: Notes button shown');
      S.eq([Stage.layout, App.seed], ['legacy', null], 'legacy: Stage.layout and no reseed');
      S.t($('app').getBoundingClientRect().width <= 560, 'legacy: 560 px column');
      Notes.open(); S.t($('sheet').classList.contains('on') && App.paused, 'legacy: Notes opens and pauses'); Notes.close();
      // a legacy chapter whose state has a numeric v2 field (CH_NEST counts visits in this.v2) stays legacy
      App.play(REG.nest); REG.nest.v2 = 5; Stage.resize(); Notes.open();
      S.t(!$('scr-play').classList.contains('v2') && Stage.layout === 'legacy' && $('sheet').classList.contains('on'), 'ch.v2 must be === true (nest keeps a visit counter in v2)');
      Notes.close(); delete REG.nest.v2; App.play(legacyCh(REG));
      // Stage.u, Stage.hit
      S.eq(Stage.u, Math.min(Stage.w, 1.2 * Stage.h), 'Stage.u = min(w, 1.2h)');
      const pts = [{ x: 100, y: 100 }, { x: 130, y: 100, r: 40 }, null, { x: -1e4, y: -1e4 }];
      S.eq([Stage.hit(110, 100, pts), Stage.hit(160, 100, pts), Stage.hit(300, 300, pts), Stage.hit(100, 125, pts, 30), Stage.hit(100, 125, pts)], [0, 1, -1, 0, 1], 'Stage.hit nearest within max(rmin, r)');
      // v2 chapter through App.playLevel
      const T = testChapter(); REG.zz_e2 = T; const played = [], exited = [];
      const fp = (ch, o) => played.push([ch.id, o.level]), fx = ch => exited.push(ch.id);
      Hooks.play.push(fp); Hooks.exit.push(fx);
      App.playLevel(T, 2, { seed: 99 }); TB.seed(99); const r0 = TB.R();
      S.eq([T.o.level, T.o.seed, App.seed, T.r0 === r0, App._o], [2, 99, 99, true, null], 'playLevel: level and seed reach start; R() seeded; App._o cleared');
      S.eq(played, [['zz_e2', 2]], 'Hooks.play gets (ch, o)');
      S.t($('scr-play').classList.contains('v2') && document.body.dataset.layout === 'phone' && Stage.layout === 'phone', 'v2: phone layout at 390×780');
      const sr = $('stage').getBoundingClientRect(), dr = $('dock').getBoundingClientRect(), tr = $('strip').getBoundingClientRect(), hr = $('hud').getBoundingClientRect();
      S.eq([Math.round(sr.top), Math.round(sr.height), Math.round(tr.height), Math.round(dr.height), Math.round(dr.bottom)], [48, 548, 112, 72, 780], 'v2 phone: bar 48, canvas 548, strip 112, dock 72');
      S.t(Math.round(hr.top) === 48 && hr.height >= 56 && hr.height < 120, 'v2: HUD line overlays the top of the canvas');
      S.eq([Stage.zones.hud.h, Stage.zones.thumb.y, Stage.zones.graph], [56, Math.round(Stage.h * 0.65), null], 'Stage.zones');
      S.t($('hud').textContent.indexOf('Tap a beetle') === 0 && $('hud').querySelector('b').textContent === '42%', 'HUD.say: text and number');
      HUD.say('Tap a beetle you can see.', '43%'); S.eq($('hud').querySelector('b').textContent, '43%', 'HUD.say updates the number');
      const db = [...document.querySelectorAll('#dock button')];
      S.eq(db.map(b => [b.className, b.getAttribute('aria-disabled')]), [['btn', null], ['btn locked', 'true']], 'Dock.set: buttons, locked state');
      db[1].click(); S.eq(T.pressed, 0, 'Dock: a locked button does nothing');
      db[0].click(); key('d'); S.eq(T.pressed, 2, 'Dock: click and key D');
      Dock.update('a', { disabled: true }); S.t([...document.querySelectorAll('#dock button')].every(b => b.classList.contains('busy')), 'Dock: choices never grey out together (busy instead)');
      Dock.update('a', { disabled: false, label: 'Again' }); S.eq($('dock').firstChild.firstChild.textContent, 'Again', 'Dock.update relabels');
      S.t(getComputedStyle($('notes-btn')).display === 'none' && getComputedStyle($('lv-btn')).display !== 'none', 'v2: Notes hidden, Levels shown');
      Notes.open(); S.t(!$('sheet').classList.contains('on') && !App.paused, 'v2: Notes.open is a no-op');
      // the loop: update then draw with hooks around it; strip polls notes() at 2 Hz without pausing
      const order = []; let hit = 0; const fpre = () => order.push('pre'), ffr = () => order.push('frame'), fdt = d => (hit ? 0 : d);
      Hooks.pre.push(fpre); Hooks.frame.push(ffr); Hooks.dt.push(fdt);
      T.log = order; T.draw = function () { order.push('draw'); }; T.polls = 0; T.plates = 0;
      window.__advance(1200);
      S.t(order.slice(0, 3).join() === 'pre,draw,frame', 'Hooks.pre → draw → Hooks.frame: ' + order.slice(0, 3).join());
      S.t(T.n > 20 && T.dts.every(d => d > 0 && d <= 0.05), 'update runs with legacy dt');
      hit = 1; T.dts = []; window.__advance(200); S.t(T.dts.length && T.dts.every(d => d === 0), 'Hooks.dt can stop time (hit-stop)'); hit = 0;
      S.t(T.polls >= 2 && T.polls <= 4 && T.plates >= 2, 'strip polls notes() at 2 Hz and draws plates (' + T.polls + ' polls)');
      S.t(!App.paused && Strip.canvas(0) instanceof HTMLCanvasElement && Strip.canvas(1) === null, 'strip never pauses; Strip.canvas(i)');
      S.t($('strip-charts').firstChild.classList.contains('plate'), 'legacy draw spec sits on a paper plate');
      T.typed = true; const calls = []; Hooks.chart = (cv, spec, th) => calls.push([spec.title, th]); Strip.redraw();
      S.eq(calls, [['Typed', 'dusk']], 'typed spec drawn through Hooks.chart with the theme');
      const pe = []; Hooks.chartPointer = (i, type, x, y) => pe.push([i, type, Math.round(x), Math.round(y)]);
      const cv = Strip.canvas(0); ptr(cv, 'pointerdown', 10, 12); ptr(cv, 'pointermove', 20, 12); ptr(cv, 'pointerup', 20, 12);
      S.eq(pe, [[0, 'down', 10, 12], [0, 'move', 20, 12], [0, 'up', 20, 12]], 'strip forwards pointer events to Hooks.chartPointer');
      Hooks.chart = null; Hooks.chartPointer = null; T.typed = false;
      Strip.open(true); S.t($('strip').classList.contains('open') && Stage.zones.graph && Stage.zones.graph.h > 200, 'Strip.open: expands over the canvas; Stage.zones.graph set');
      key('g'); S.t(!$('strip').classList.contains('open') && Stage.zones.graph === null, 'key G collapses the strip');
      $('strip-data').click(); window.__advance(100); S.t(!$('strip-table').hidden && /Copies/.test($('strip-table').textContent), 'Show data: stats table');
      $('strip-data').click(); Strip.open(false);
      // keys: Hooks.key first, then chapter onKey; inputs ignored
      const fk = e => e.key === 'q'; Hooks.key.push(fk);
      key('q'); key('x'); key('ArrowLeft');
      S.eq(T.keysSeen, ['x', 'ArrowLeft'], 'Hooks.key pre-empts; chapter onKey gets e.key');
      const inp = document.createElement('input'); document.body.appendChild(inp); key('x', inp); inp.remove(); S.eq(T.keysSeen.length, 2, 'keys typed into inputs are ignored');
      key('?'); S.t(!!document.querySelector('#cards .card.help') && /test key/.test($('cards').textContent) && /Do it|Again/.test($('cards').textContent), 'key ? lists chapter and dock keys');
      key('Escape'); S.t(!Cards.isOpen(), 'Escape closes help');
      // level select: L1 open, later levels locked until played; a second tap jumps
      TB.LevelSelect.open(T); window.__advance(400);
      const chips = [...document.querySelectorAll('#cards .lvchip')];
      S.eq(chips.map(c => c.className), ['lvchip next', 'lvchip locked', 'lvchip boss locked'], 'level select chips');
      chips[2].click(); S.t(Cards.isOpen(), 'locked level: first tap explains'); chips[2].click();
      S.eq([Cards.isOpen(), T.level, App.ch.id], [false, 2, 'zz_e2'], 'locked level: second tap plays it');
      S.t(App.seed !== 99 && App.seed > 0, 'v2 without a seed gets a fresh one');
      // exit: hooks run, layout cleared
      App.exit(); S.eq(exited, ['zz_e2'], 'Hooks.exit gets ch');
      S.t(!document.body.dataset.layout && !$('scr-play').classList.contains('v2') && Stage.layout === 'legacy', 'exit clears the v2 layout');
      S.t(/<svg class="star/.test($('menu-body').innerHTML) && $('menu-body').querySelector('.part h3 span').textContent === (window.TB.ACT_PLAN ? 'Act 0' : 'I'), 'menu: SVG stars, act headings (legacy numerals without 00_entry.js)');
      for (const [L, f] of [[Hooks.play, fp], [Hooks.exit, fx], [Hooks.pre, fpre], [Hooks.frame, ffr], [Hooks.dt, fdt], [Hooks.key, fk]]) L.splice(L.indexOf(f), 1);
      // a throwing hook is dropped and reported, the chapter keeps running
      const boom = () => { throw new Error('boom'); }; Hooks.frame.push(boom); App.play(legacyCh(REG)); window.__advance(200);
      S.t(Hooks.frame.indexOf(boom) < 0 && !!App.mode && /boom/.test($('err').textContent), 'a throwing hook is dropped and reported');
      $('err').style.display = 'none'; window.__errs.length = 0; App.exit();
      return S.done();
    },
    url() {
      const S = suite(), { Url, App, Teacher } = TBx();
      S.eq([Url.unit, Url.level, Url.seed, Url.teacher, Url.cvd, Url.lab, Url.theme, Url.calm], ['casino', 2, 42, true, 'deut', 'x', 'paper', true], 'Url parses every parameter');
      S.eq(Url.locks, { 'mixer.N': 40, 'casino.Ne': 12 }, 'Url.locks');
      S.eq([Url.lock('casino', 'Ne', 1), Url.lock('casino', 'N', 1)], [12, 1], 'Url.lock');
      S.eq([App.scr, App.ch && App.ch.id, App.seed], ['play', 'casino', 42], 'deep link plays the unit with its seed');
      S.t(Teacher.on && getComputedStyle($('teacher')).display === 'flex' && $('t-seed').textContent === 'seed 42', 'teacher strip with the seed chip');
      S.t((getComputedStyle($('t-speed')).display === 'none') === !TBx().isV2(App.ch), 'speed control shown only for a v2 unit (casino is v2 once v2/casino.js is in the build)');
      App.play(App.ch); S.t(App.seed === 42, '?seed= applies to every play of that unit');
      return S.done();
    },
    teacher() {
      const S = suite(), { App, Teacher, REG } = TBx(), T = testChapter(); REG.zz_e2 = T;
      App.playLevel(T, 1); window.__advance(200);
      S.t(App.seed > 0 && $('t-seed').textContent === 'seed ' + App.seed, 'seed chip shows App.seed');
      S.eq(TB.Url.link({ unit: 'zz_e2', level: 1, seed: App.seed }).split('?')[1], 'unit=zz_e2&level=1&seed=' + App.seed, 'seed link');
      S.t(getComputedStyle($('t-speed')).display !== 'none', 'speed control shown for v2');
      let n0 = T.n; window.__advance(40); const one = T.n - n0;
      key(']'); S.eq(Teacher.speed, 4, '] speeds up'); n0 = T.n; window.__advance(40); const four = T.n - n0;
      S.eq([one, four], [1, 4], 'speed ×4 runs update four times a frame');
      key(']'); key(']'); S.eq(Teacher.speed, 16, 'speed caps at 16'); key('['); key('['); key('['); S.eq(Teacher.speed, 1, '[ slows to 1');
      key(' '); S.t(App.paused && $('t-play').textContent === 'Play', 'Space pauses'); n0 = T.n; window.__advance(400); S.eq(T.n, n0, 'paused: no updates');
      key(' '); S.t(!App.paused, 'Space resumes');
      key('ArrowRight'); S.t(App.paused && T.steps === 1, 'ArrowRight steps one generation (teacherStep) and pauses');
      key('f'); S.t(App.paused && Teacher.frozen && T.asked === 1, 'F freezes and asks');
      key('r'); S.t(!App.paused && Teacher.revealed && !Teacher.frozen, 'R resumes and reveals');
      key('x'); S.eq(T.keysSeen, ['x'], 'non-teacher keys reach the chapter');
      App.play(legacyCh(REG)); S.t(App.seed > 0, 'teacher mode seeds legacy runs so the seed chip works');
      App.exit();
      return S.done();
    },
    desktop(kind) {
      const S = suite(), { App, REG, Stage } = TBx(), T = testChapter(); REG.zz_e2 = T;
      App.playLevel(T, 0); window.__advance(200);
      S.eq([document.body.dataset.layout, Stage.layout], [kind, kind], 'layout class ' + kind);
      const ar = $('app').getBoundingClientRect(), sr = $('stage').getBoundingClientRect(), tr = $('strip').getBoundingClientRect(), dr = $('dock').getBoundingClientRect();
      const share = kind === 'projector' ? 0.6 : 7 / 12;
      S.t(Math.abs(sr.width / ar.width - share) < 0.02, 'canvas takes ' + share.toFixed(2) + ' of the width (' + (sr.width / ar.width).toFixed(3) + ')');
      S.t(tr.left >= sr.right - 1 && dr.left >= sr.right - 1 && dr.top >= tr.bottom - 1, 'strip and dock in the right column, dock under strip');
      if (kind === 'projector') S.eq(document.documentElement.dataset.theme, 'projector', 'projector theme');
      App.exit(); S.t($('app').getBoundingClientRect().width <= 560, 'menu returns to the 560 px column');
      return S.done();
    },
    v1() {
      const S = suite(), { App, REG, Teacher } = TBx();
      S.t(document.documentElement.classList.contains('v1') && !Teacher.on && !document.body.classList.contains('teacher'), 'v1: no teacher strip');
      App.go('menu'); S.t(!/<svg/.test($('menu-body').innerHTML), 'v1: text stars in the menu');
      App.play(legacyCh(REG)); const before = TB.Save.d.snd; key('m'); S.eq(TB.Save.d.snd, before, 'v1: no global keys');
      App.exit();
      return S.done();
    }
  };
})();
