/* Golden trajectories: init script, injected AFTER vclock.js and before the page loads.
   Removes the remaining non-virtual inputs so a run is a pure function of (build, id, seed). */
(() => {
  // 1. Seeded Math.random (boot seeds R() from Date.now() ^ Math.random(); TB.seed() overrides that before play).
  let s = 0x2545F491;
  Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  // 2. No WebAudio: Snd.init() then leaves ctx null, so sound never draws Math.random or changes timing.
  try { window.AudioContext = undefined; window.webkitAudioContext = undefined; } catch (e) { }
  // 3. requestAnimationFrame through the virtual clock at the legacy cadence (vclock turns 16 ms into 40 ms),
  //    so moving frame() from setTimeout to requestAnimationFrame (D5 §5.3) keeps legacy trajectories identical.
  window.requestAnimationFrame = fn => window.setTimeout(() => fn(performance.now()), 16);
  window.cancelAnimationFrame = id => window.clearTimeout(id);
  // 4. Reduced-motion query answers "no" regardless of host settings.
  const mm = window.matchMedia && window.matchMedia.bind(window);
  if (mm) window.matchMedia = q => /prefers-reduced-motion/.test(q) ? { matches: false, media: q, addListener() { }, removeListener() { }, addEventListener() { }, removeEventListener() { } } : mm(q);
})();
