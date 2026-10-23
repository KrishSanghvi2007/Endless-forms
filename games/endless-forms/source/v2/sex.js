/* ================= v2/sex.js: Why Sex? (id 'sex'), the Wave 2 rebuild of the legacy chapter (ch17.js stays at ?v1=1) =================
   D3 §4.4 and D2 §4 triage, simplified by D6 decisions 9 and 10 (22 Oct 2026): one verb, three levels, one prediction, real organisms.
   World: a clear glacial lake in New Zealand's South Island. New Zealand mud snails (Potamopyrgus antipodarum) graze the weed:
   sexual snails (females and smaller males, warm ochre shells) and an all-female clone (identical pale slate shells). The player
   is the trematode parasite (Microphallus): each tap drops a clutch of its eggs, shed by a duck, onto the weed. Snails that eat
   them are infected, and castrated, only if the parasite's key fits their lock (matching alleles; the shell pattern stands for
   the lock). Keys that infect multiply. The verb: TAP (or press, slide, lift) to drop eggs.
   L1 the twofold cost: a clone in a sexual lake, keys at random (the one prediction, after the first breed: the clone's share by generation 6).
   L2 the Red Queen: keys track whatever lock is common, so the clone booms and then crashes; sex persists.
   L3 boss, shallows and deep: ducks feed in the shallows, so parasites are rare in deep water; the clone takes the deep while sex
   holds the shallows (Lively 1987; King et al. 2009). Muller's ratchet, the other reason, is told in the cards.
   Model: each zone of the lake is a set of class shares (sexual females and males by lock, the clone); the patch you see is that
   lake drawn to 40 snails, and the share of each lock you infect there is the share infected across the lake. Headless sim:
   R() and plain arithmetic only; stars read the expectation; juice from Sim.run's events only. Prefix: SX_ / sx. */

const SX_N = 40, SX_RAD = 18, SX_B = 6, SX_MU = 0.01, SX_CL = 3;   // patch size; clutch radius (lake units of 100); brood; lock mutation; the clone's lock
const SX_T = { arrive: 0.6, season: 14, gap: 0.55, breed: 1.9, end: 1.4, auto: 0.32 };   // timers in s (season: the timed clock; untimed has none)
const SX_LV = [
  { G: 8, C: 4, rad: 18, track: false, zones: 1, c0: 0.05, ask: true, levers: ['nosons', 'track'] },
  { G: 10, C: 10, rad: 18, imm: 0.01, track: true, zones: 1, c0: 0.3, levers: ['blind', 'few'] },
  { G: 10, C: 10, rad: 13, imm: 0.01, w0: [1, 1, 1, 2], track: true, zones: 2, c0: 0.3, mig: 0.04, levers: ['ducks', 'nomig'] }
];
const SX_ASK = { p1: { kind: 'y', lo: 0, hi: 100, tol: 12, step: 2, at: 6, from: 1 } };   // asked once the first breed has shown the doubling once (from), scored at generation 6 (at)
const SX_W = { dec: 0.3, floor: 0.4 };    // the parasite's keys next season: 0.3 × this season's weight + infections + 0.4 (a floor of rare keys)
const SX_D1 = 45;                         // L1 Discover: infections across the level (the aim policy makes 57–78, a sloppy aim about 53, a random tapper about 33)
// the world's paints (D6 decision 7): glacier teal water, slate stones, snail ochre, parasite red
const SX_C = { deep: '#0E3B45', water: '#1B6170', teal: '#2E8C94', glint: '#9FD9D3', silt: '#B9BFA8', silt2: '#9DA88E', slate: '#5C6B73', slateD: '#36444B',
  snow: '#F2F5F3', weed: '#2F6B4E', weed2: '#4E8A57', ochre: '#D6A75C', ochreD: '#A87A3A', clone: '#B9C6CA', cloneD: '#6E8187', mark: '#33241A',
  foot: '#8C8A80', red: '#C8402F', redL: '#F07A5E', egg: '#7A3B22', ink: '#1B1612', paper: '#F3EFE4', scaup: '#2A2622' };

const SX_TEXT = {
  intro: {
    game: 'You are a trematode parasite in a clear New Zealand lake. Mud snails graze the weed: sexual snails with males, and an all-female clone.',
    biology: 'A clone wastes nothing on sons, so it makes twice the daughters. Parasites that lock onto common genotypes may be why sex still wins.',
    how: 'Tap the weed to drop eggs. They infect only snails with the shell pattern shown, and infected snails cannot breed.'
  },
  firstWords: 'Tap near glowing snails: only they catch your eggs. Grey shells are the clone.',
  hud: {
    season: 'Your eggs fit {lock} shells. Tap where they are thick.',
    seasonDeep: 'Your eggs fit {lock} shells. Ducks feed only in the shallows.',
    breed1: 'Uninfected mothers breed. Clone mothers make only daughters.',
    breed2: 'Uninfected snails breed. Keys that infected multiply.',
    breed3: 'Both zones breed. Only the shallows have parasites.',
    p1: 'Clones: 5% → {c}% in one generation. What share at generation 6?',
    auto: 'What if? The parasite plays, with one thing changed.',
    over: 'The level is done.',
    ask: 'Drag the marker, then Lock in.'
  },
  whispers: {
    hit: 'Infected!', many: 'A whole cluster!', miss: 'No match: the eggs pass through.', deep: 'Too deep: ducks feed in the shallows.',
    drag: 'Drag the marker first.', inband: 'Inside the band.', outband: 'Outside the band.', none: 'No call this time.',
    track: 'Most eggs now fit the clone.', later: 'Called. Now watch generation 6.', crash: 'The clone is crashing!', rain: 'Time up: the eggs sink anyway.', ff: 'Faster.'
  },
  labels: {
    lock0: 'plain', lock1: 'banded', lock2: 'spotted', lock3: 'banded, spotted',
    next: 'eggs fit', left: '{n} left', clones: 'clones {p}%', males: 'males {p}%', fit: 'clone-fit eggs {p}%', shallows: 'shallows', deep: 'deep water',
    cloneMum: 'clone mother', sexMum: 'sexual mother', dau6: '6 daughters', dau3: '3 daughters', sons3: '+ 3 sons', twice: '2× the daughters', rule: 'clone share → 2c÷(1+c)',
    keys: 'keys now', crash: 'clone crashes', track: 'eggs track clones', mShallow: 'shallows: males {p}%', mDeep: 'deep: males {p}%', sex: 'sex holds', clonal: 'clones win',
    lock: 'Lock in', faster: 'Faster', gen: 'gen {g}/{G}', time: '{s}s', banner: '{n}',
    tClone: 'Clone share', tPair: 'Clones and keys', tZones: 'Shallows and deep', ax: 'generation', share: 'share',
    sClone: 'Clones', sFit: 'Eggs fit clone', sDeep: 'Clones, deep', you: 'clones', keyLine: 'eggs fit clone', deepLine: 'deep',
    sGen: 'Generation', sClones: 'Clones', sMales: 'Males', sInf: 'Infected so far', sFitS: 'Eggs fit clone', sShallow: 'Clones, shallows', sDeepS: 'Clones, deep', sMS: 'Males, shallows'
  },
  captions: {
    mGen: 'Each season is one generation (time ×N).', mClones: 'Share of all snails that are clones.', mMales: 'Sexual snails are half male; clones have none.',
    mInf: 'Snails your eggs infected this level.', mFit: 'Share of next season’s eggs whose key fits the clone’s lock.',
    liveDrop: 'Eggs dropped: {n} infected.', liveAsk: 'Prediction open. Press P, then arrows and Enter.', liveBreed: 'Generation {g}: clones {c} percent.'
  },
  panels: [],
  interesting: {
    held: 'Your eggs held the clone to {c}%. Keys that fit it came only by chance here, so that was luck and aim.',
    fast: 'Clones reached {c}% of the snails in eight generations. Males all but vanished, along with sex.',
    escaped: 'The clone kept {c}% of the lake. The keys fitted it, but many clutches landed away from its shells.',
    cycle: 'The clone crashed to {t}%, then climbed back to {c}% as the eggs moved on to other locks. The Red Queen runs in cycles.',
    shallowclone: 'The clone held {c}% of the shallows too. Drop where its pale shells cluster once your eggs fit them.'
  },
  levers: { nosons: 'No sons', track: 'Keys track', blind: 'Keys stay random', few: 'Fewer eggs', ducks: 'Ducks dive deep', nomig: 'No mixing' },
  whatifBody: {
    nosons: 'If sexual mothers made only daughters, the clone had no head start. It ended at {c}%. Sons are the twofold cost.',
    nosonsB: 'Without sons the clone lost its doubling, yet it ended at {c}%. Your eggs and chance shaped this run more.',
    track: 'With keys that track and only four clutches a season, the clone ended at {c}%. Few parasites only slow it.',
    trackB: 'With keys that track, even four clutches a season pulled the clone down to {c}%.',
    blind: 'With keys at random, the clone ended at {c}% of the lake. Without tracking, sex loses.',
    blindB: 'With keys at random the clone still fell to {c}% this time, but random keys rarely stop it.',
    few: 'With three clutches a season, the keys tracked the clone but could not stop it. It ended at {c}%.',
    fewB: 'Even three clutches a season brought the clone down to {c}% here. Tracking keys bite hard.',
    ducks: 'With ducks feeding in deep water too, clones ended at {d}% there, not near 100%. Parasites everywhere, sex everywhere.',
    ducksB: 'With ducks feeding deep, the deep clone still reached {d}%: one season of eggs there is not enough.',
    nomig: 'With no mixing between zones, the shallows ended {a}% clone and the deep {d}%. Migrants were not the cause.',
    nomigB: 'With no mixing, the shallows ended {a}% clone and the deep {d}%.'
  },
  take: 'Sex costs twice the daughters, yet parasites that track common genotypes can make the clone lose.',
  body: 'A clone outbreeds sex two to one. Your eggs fitted whatever lock was common, so the clone became the easiest target and crashed. Where ducks do not feed, clones win, as in real lakes. Muller’s ratchet is a second, slower cost: clone lines pile up harmful mutations. Males in the shallows: {a}%; deep: {b}%.',
  law: { title: 'The Red Queen' },
  boss: { inverts: 'Sex is not always the winner: where parasites are rare, clones take over.' },
  stars: {
    discover: 'Infect many snails, and see the clone rise and then fall.',
    predict: 'Call the clone’s share at generation 6.',
    transfer: 'Keep the shallows sexual while the deep turns clonal.'
  },
  levelStars: [
    { discover: 'Infect 45 snails, and still see the clone pass half.', predict: 'Call the clone’s share at generation 6, within 12 points.' },
    { discover: 'Crash the clone below 10% by generation 6.' },
    { transfer: 'End with the shallows under 15% clone while the deep turns clonal.' }
  ],
  levelTake: [
    'A clone makes twice the daughters of a sexual mother. Its share doubles each generation, at first.',
    'Your eggs came to fit whatever lock was common. The clone became the easiest target, and sex persisted.'
  ],
  levelBody: {   // [level], plus the texts chosen when the run went the other way (lessons rule 6)
    0: 'Clones went from 5% to {c}% in eight generations. From {q}% at generation 1, the twofold rule 2c ÷ (1 + c) gave {e}% by generation 6. Your call was {p}.',
    1: 'The clone peaked at {k}%. Then up to {f}% of eggs fitted its lock, and it fell to {t}%. Rare locks escaped, and sex keeps making rare locks.',
    held: 'Your eggs held the clone to {c}%, by luck and aim. From {q}% at generation 1, the twofold rule 2c ÷ (1 + c) gave {e}% by generation 6. Your call was {p}.',
    nocrash: 'The clone reached {c}%. Up to {f}% of eggs fitted its lock, but too few landed on its shells. Aim where the pale shells cluster.',
    final: 'A clone outbreeds sex two to one. This time the clone took the shallows too: too few clutches landed on its shells. Where ducks do not feed, clones win, as in real lakes. Muller’s ratchet is a second, slower cost of cloning. Males in the shallows: {a}%; deep: {b}%.'
  },
  model: [
    { level: 0, simulated: 'A lake of mud snails: sexual females and males, plus one clone. Each uninfected mother has six young. Sexual young are half sons; clone young are all daughters. Young compete for a fixed number of places.', simplification: 'Each season is one generation. The 40 snails you see stand for the lake. The share of a lock you infect there is the share infected lake-wide. Keys are random here. Males are drawn smaller only to tell them apart.', params: [{ name: 'young per mother', value: 6, tag: 'designed', real: 'broods of tens of embryos' }, { name: 'sons from sexual mothers', value: '50%', tag: 'realistic' }, { name: 'clutches a season', value: 4, tag: 'designed' }, { name: 'seasons a generation', value: 1, tag: 'xN', real: 'a generation takes months' }], cannot: 'Clones that differ in other ways, or sexual females that compete better.', nature: 'Asexual Potamopyrgus are all-female clones, usually triploid; sexual snails are diploid with males. Both live in the same lakes (Lively 1987; Jokela et al. 2009).', contested: false, refs: ['msmith1978', 'williams1975', 'lively1987'] },
    { level: 1, simulated: 'Keys track infections. Next season’s weight for a key is 0.3 × this season’s, plus its infections, plus a small floor. One young snail in a hundred arrives from nearby lakes.', simplification: 'Two lock genes with two forms each make four shell patterns. Each snail carries one form of each, as in Hamilton’s haploid models. A key infects its own lock, in clones and sexual snails alike (matching alleles). Real resistance genes are invisible; the patterns stand for them.', params: [{ name: 'locks', value: 4, tag: 'designed' }, { name: 'clutches a season', value: 10, tag: 'designed' }, { name: 'clutch radius', value: '18% of the patch', tag: 'designed' }, { name: 'lock mutation', value: '1%', tag: 'xN', real: 'far rarer' }], cannot: 'Parasites that kill hosts, host immunity, or why the cycle repeats over decades.', nature: 'Microphallus castrates the snails it infects; its adults live in waterfowl, mainly ducks. Parasites from a lake infect common local clones best, with a lag (Dybdahl and Lively 1998). Common clones in Lake Alexandrina declined as parasites tracked them (Jokela et al. 2009).', contested: false, refs: ['hamilton1980', 'dl1998', 'ld2000', 'jokela2009'] },
    { level: 2, simulated: 'Two zones, shallows and deep, each its own lake of shares. Four young in a hundred move between zones each generation. Ducks feed in the shallows, so eggs land only there.', simplification: 'Deep water here has no parasites at all; real deep water has few. The zones have equal room.', params: [{ name: 'mixing between zones', value: '4%', tag: 'designed' }, { name: 'clutches a season (shallows)', value: 10, tag: 'designed' }, { name: 'clutch radius', value: '13% of the patch', tag: 'designed' }, { name: 'clutches in deep water', value: 0, tag: 'designed', real: 'few' }], cannot: 'Muller’s ratchet: harmful mutations piling up in clone lines over many generations.', nature: 'Males, and so sex, are commoner where more snails are infected (Lively 1987; King et al. 2009). Infection is highest in shallow water (Jokela and Lively 1995). Asexual lines carry more harmful mitochondrial mutations (Neiman et al. 2010).', contested: false, refs: ['lively1987', 'jl1995', 'king2009', 'neiman2010', 'muller1964', 'felsenstein1974'] }
  ],
  why: {
    real: [
      'Males mean sex in these snails. Curtis Lively found most males in New Zealand lakes with the most trematode infection (Lively 1987). Across habitats, sex goes with parasites (King et al. 2009).',
      'In Lake Alexandrina, common clones became overinfected and declined, while rare clones rose (Jokela, Dybdahl and Lively 2009). This is the Red Queen: running to stay in place.',
      'A second idea is Muller’s ratchet. A small clone line cannot rebuild its least-mutated class once chance loses it (Muller 1964). Asexual mud snails carry more harmful mitochondrial mutations (Neiman et al. 2010).'
    ],
    maths: [
      'Twofold cost: a clone mother has b daughters; a sexual mother has b/2 daughters and b/2 sons. With clone share c, next share is 2c ÷ (1 + c). From 5% that gives 77% by generation 6.',
      'Matching alleles: a key infects only its own lock. Say a share x of clones and y of sexual snails are castrated. The clone still gains only while 2(1 − x) > 1 − y.',
      'Lively’s prediction: sexual snails should be commonest where infection is highest. In deep water with no parasites the clone’s 2c ÷ (1 + c) runs on unchecked.'
    ]
  }
};

/* ---------- pure model helpers (shared by the sim, stars, bots and the oracle): + − × ÷ only ---------- */
const SX = {
  zero() { return { f: [0, 0, 0, 0], m: [0, 0, 0, 0], c: 0 }; },
  start(c0) { const s = (1 - c0) / 8; return { f: [s, s, s, s], m: [s, s, s, s], c: c0 }; },
  males(Z) { return Z.m[0] + Z.m[1] + Z.m[2] + Z.m[3]; },
  twofold(c, n) { for (let i = 0; i < n; i++) c = 2 * c / (1 + c); return c; },   // the clone's share after n generations with no difference in infection
  // one generation in one zone: F = infected fractions {lk: [4], c}; o.noSons: sexual young are all female and outcross among themselves
  breed(Z, F, o) {
    o = o || {}; const fu = [], mu = []; let Ft = 0, Mt = 0;
    for (let k = 0; k < 4; k++) { fu.push(Z.f[k] * (1 - F.lk[k])); mu.push(Z.m[k] * (1 - F.lk[k])); Ft += fu[k]; Mt += mu[k]; }
    const cu = Z.c * (1 - F.c), dad = o.noSons ? fu : mu, Dt = o.noSons ? Ft : Mt, young = [0, 0, 0, 0];
    if (Dt > 1e-12) for (let g = 0; g < 4; g++) {
      if (!(fu[g] > 0)) continue; const g1 = g & 1, g2 = g & 2;
      for (let h = 0; h < 4; h++) {   // each lock gene comes from mother or father with ½ (free recombination)
        const w = fu[g] * dad[h] / Dt * 0.25; if (!(w > 0)) continue; const h1 = h & 1, h2 = h & 2;
        young[g1 | g2] += w; young[g1 | h2] += w; young[h1 | g2] += w; young[h1 | h2] += w;
      }
    }
    const ym = young.map((v, k) => v * (1 - SX_MU) + SX_MU / 2 * (young[k ^ 1] + young[k ^ 2]));
    const sx = ym[0] + ym[1] + ym[2] + ym[3], tot = sx + cu;   // each mother has SX_B young, so SX_B cancels in the shares
    if (!(tot > 1e-12)) return this.zero();
    const sf = o.noSons ? 1 : 0.5;
    return { f: ym.map(v => v * sf / tot), m: ym.map(v => v * (1 - sf) / tot), c: cu / tot };
  },
  mix(A, B, m) { const g = (a, b) => (1 - m) * a + m * b; return { f: A.f.map((v, k) => g(v, B.f[k])), m: A.m.map((v, k) => g(v, B.m[k])), c: g(A.c, B.c) }; },
  counts(Z, n) {   // the patch: n snails drawn from the zone's shares by largest remainder (exact composition; positions are random)
    const cls = []; for (let k = 0; k < 4; k++) { cls.push(['f', k, Z.f[k]]); cls.push(['m', k, Z.m[k]]); } cls.push(['c', SX_CL, Z.c]);
    let tot = 0; for (const q of cls) tot += q[2]; const out = cls.map(q => { const v = tot > 0 ? q[2] / tot * n : 0; return { t: q[0], lk: q[1], n: Math.floor(v), r: v - Math.floor(v) }; });
    let left = n - out.reduce((a, q) => a + q.n, 0); const ord = out.map((q, i) => i).sort((a, b) => out[b].r - out[a].r || a - b);
    for (let i = 0; i < ord.length && left > 0; i++, left--) out[ord[i]].n++;
    return out;
  },
  fracs(P, z) {   // infected fractions in zone z of the patch, per lock: clones and sexual snails of a lock are pooled (matching alleles: a key fits
    // the lock, not the way the snail breeds), so two clones in a small patch never stand for every clone in the lake
    const ni = [0, 0, 0, 0], nn = [0, 0, 0, 0]; let ai = 0, an = 0;
    for (const a of P) { if (a.z !== z) continue; an++; ai += a.inf; nn[a.lk]++; ni[a.lk] += a.inf; }
    const all = an ? ai / an : 0, lk = nn.map((n, k) => n ? ni[k] / n : all);
    return { lk, c: lk[SX_CL] };
  }
};

const CH_SEX_V2 = {
  id: 'sex', v2: true, role: 'environment', place: 'lake', accent: '#2E8C94',   // glacier teal: the chapter's chrome tint (D6 decision 7)
  plan: ['Why Sex?', 'The cost of males and the Red Queen'],
  intro: { goal: 'Be the parasite; see why sex can beat clones.' },
  content: SX_TEXT,
  P: {
    B: { v: SX_B, tag: 'designed', min: 2, max: 20, label: 'young per mother' },
    rad: { v: SX_RAD, tag: 'designed', min: 8, max: 30, label: 'clutch radius' },
    mu: { v: SX_MU, tag: 'xN', min: 0, max: 0.05, real: 'far rarer', label: 'lock mutation' }
  },
  levels: [
    { name: 'Twice the daughters', adds: 'an all-female clone', codes: ['E7'], minutes: 2 },
    { name: 'The Red Queen', adds: 'keys that track common locks', codes: ['E7', 'E5'], minutes: 2.5 },
    { name: 'Shallows and deep', adds: 'parasites only in the shallows', codes: ['E7'], minutes: 2.5 }
  ],
  keys: { Space: 'drop eggs', ArrowLeft: 'move aim', N: 'next match', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why does a clone outbreed sexual snails two to one?', 'Why did the clone become the parasite’s easiest target once it was common?', 'This model has four locks and no other benefit of sex. What would change the result most?'], pool: 'trace' },
  starTraits: [],
  encodings: [   // shells: sexual warm ochre, the clone pale slate (luminance); locks by pattern (band, spots), never hue alone; infection red with cysts and a glow
    { k: 'sexual', rgb: [214, 167, 92], channels: ['luminance'] },
    { k: 'clone', rgb: [199, 206, 200], channels: ['luminance'] },
    { k: 'infected', rgb: [200, 64, 47], channels: ['pattern', 'luminance'] }
  ],
  // the unit's stars across levels (API_v2 §14.1): Discover in both levels that offer it; Predict on L1; Transfer on the boss
  unitStars(lv) { const has = (i, b) => !!((lv[i] || 0) & b); return (has(0, 1) && has(1, 1) ? 1 : 0) | (has(0, 2) ? 2 : 0) | (has(2, 4) ? 4 : 0); },

  /* ================= headless simulation (API_v2 §9.3): R() and plain arithmetic; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {};
      if (o.thaw) { this.restore(o.thaw.snap); const s = this.s; s.whatif = o.thaw.lever || null; s.auto = true; s.log = []; s.ask = null; s.unt = false; this.lever(s); if (s.phase === 'ask') { s.phase = 'season'; s.pt = 0; } return; }
      const L = SX_LV[level], s = { level, phase: 'arrive', pt: 0, t: 0, gen: 0, G: L.G, C: L.C, rad: L.rad, zones: [], patch: [], old: null, keys: [], ki: 0, w: (L.w0 || [1, 1, 1, 1]).slice(),
        clock: 0, unt: false, ask: null, pred: {}, nocall: {}, asks: [], hist: [], infTot: 0, low: 1, infS: 0, peak: 0, fitPeak: 0, whatif: null, auto: false, noSons: false, track: L.track, ducks: false, mig: L.mig || 0, revealed: false, askC: null, askG: 0, pid: 0, log: [] };
      for (let z = 0; z < L.zones; z++) s.zones.push(SX.start(L.c0));
      this.s = s; this.newPatch(s); this.record(s); this.deal(s);
    },
    lever(s) {   // What if?: rerun the level from its start with one thing changed; the parasite (the aim policy) plays
      const k = s.whatif;
      if (k === 'nosons') { s.noSons = true; s.zones = s.zones.map(Z => { const f = Z.f.map((v, i) => v + Z.m[i]); return { f, m: [0, 0, 0, 0], c: Z.c }; }); this.newPatch(s); s.hist = []; this.record(s); }
      else if (k === 'track') s.track = true; else if (k === 'blind') s.track = false;
      else if (k === 'few') { s.C = 3; this.deal(s); } else if (k === 'ducks') s.ducks = true; else if (k === 'nomig') s.mig = 0;
    },
    zoneN(s) { return s.zones.length > 1 ? SX_N / 2 : SX_N; },
    yRange(s, z) { return s.zones.length > 1 ? (z ? [57, 94] : [12, 45]) : [12, 94]; },
    newPatch(s) {   // draw the patch from each zone's shares; positions spaced at random (R())
      const P = [];
      s.zones.forEach((Z, z) => {
        const yr = this.yRange(s, z), cls = SX.counts(Z, this.zoneN(s)), here = [];
        for (const q of cls) for (let i = 0; i < q.n; i++) {
          let x = 50, y = 50;
          for (let tr = 0; tr < 24; tr++) { x = 6 + R() * 88; y = yr[0] + R() * (yr[1] - yr[0]); let ok = true; for (const b of here) if ((b.x - x) * (b.x - x) + (b.y - y) * (b.y - y) < 64) { ok = false; break; } if (ok) break; }
          x = Math.round(x * 10) / 10; y = Math.round(y * 10) / 10;
          const a = { id: s.pid++, z, t: q.t, lk: q.lk, inf: 0, x, y, sh: Math.round(R() * 100) / 100, ang: Math.round((R() - 0.5) * 120) / 100 }; here.push(a); P.push(a);
        }
      });
      s.patch = P;
    },
    deal(s) {   // this season's clutches: keys drawn from the parasite's weights (fixed and even in L1)
      const w = s.track ? s.w : [1, 1, 1, 1], tot = w[0] + w[1] + w[2] + w[3]; s.keys = []; s.ki = 0; s.infS = 0; s.clock = 0; s.inf = [0, 0, 0, 0];
      if (!s.track) { for (let i = 0; i < s.C; i++) s.keys.push(Math.floor(R() * 4)); return; }   // a naive strain: each clutch's key at random
      const q = w.map((v, k) => ({ k, n: Math.floor(v / tot * s.C), r: v / tot * s.C - Math.floor(v / tot * s.C) })); let left = s.C - q.reduce((a, b) => a + b.n, 0);   // tracking keys: dealt in proportion (largest remainder)
      q.slice().sort((a, b) => b.r - a.r || a.k - b.k).forEach(e => { if (left > 0) { e.n++; left--; } });
      for (const e of q) for (let i = 0; i < e.n; i++) s.keys.push(e.k);
      for (let i = s.keys.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = s.keys[i]; s.keys[i] = s.keys[j]; s.keys[j] = t; }   // in a random order
    },
    fitShare(s) { const w = s.track ? s.w : [1, 1, 1, 1]; return w[SX_CL] / (w[0] + w[1] + w[2] + w[3]); },
    record(s) { s.hist.push({ g: s.gen, c: s.zones.map(Z => Z.c), m: s.zones.map(Z => SX.males(Z)), fit: this.fitShare(s) }); const c = s.zones[0].c; if (c > s.peak) s.peak = c; const f = this.fitShare(s); if (f > s.fitPeak) s.fitPeak = f; },
    key(s) { return s.ki < s.keys.length ? s.keys[s.ki] : -1; },
    canDrop(s, y) { return s.zones.length < 2 || s.ducks || y < 50; },
    drop(s, x, y, ev, auto) {   // one clutch: every uninfected snail of the matching lock within the radius is infected
      const k = this.key(s); if (k < 0) return;
      if (!this.canDrop(s, y)) { ev.push({ k: 'deep', x, y }); return; }
      s.ki++; const hits = [];
      for (const a of s.patch) if (!a.inf && a.lk === k && (a.x - x) * (a.x - x) + (a.y - y) * (a.y - y) <= s.rad * s.rad) { a.inf = 1; hits.push(a.id); }
      s.inf[k] += hits.length; s.infS += hits.length; if (!s.whatif) s.infTot += hits.length;
      ev.push({ k: 'drop', x, y, key: k, hits, auto: !!auto });
      if (s.ki >= s.keys.length) { s.phase = 'gap'; s.pt = 0; }
    },
    best(s) {   // the aim policy: the drop point (a matching snail's spot) that infects the most; ties go to the first
      const k = this.key(s); let bx = -1, by = -1, bn = -1;
      for (const c of s.patch) { if (c.inf || c.lk !== k || !this.canDrop(s, c.y)) continue; let n = 0; for (const a of s.patch) if (!a.inf && a.lk === k && (a.x - c.x) * (a.x - c.x) + (a.y - c.y) * (a.y - c.y) <= s.rad * s.rad) n++; if (n > bn) { bn = n; bx = c.x; by = c.y; } }
      return bn > 0 ? [bx, by, bn] : [50, s.zones.length > 1 ? 28 : 50, 0];
    },
    rain(s, ev) {   // the clock ran out: the clutches left sink at random spots (R())
      while (s.ki < s.keys.length) { const yr = this.yRange(s, 0), x = Math.round((6 + R() * 88) * 10) / 10, y = Math.round((yr[0] + R() * (yr[1] - yr[0])) * 10) / 10; this.drop(s, x, y, ev, true); }
      ev.push({ k: 'rain' });
    },
    breed(s, ev) {
      s.old = s.patch.map(a => ({ id: a.id, z: a.z, t: a.t, lk: a.lk, inf: a.inf, x: a.x, y: a.y, sh: a.sh, ang: a.ang }));
      const nz = s.zones.map((Z, z) => SX.breed(Z, SX.fracs(s.patch, z), { noSons: s.noSons }));
      s.zones = nz.length > 1 && s.mig > 0 ? [SX.mix(nz[0], nz[1], s.mig), SX.mix(nz[1], nz[0], s.mig)] : nz;
      const im = SX_LV[s.level].imm || 0; if (im > 0) s.zones = s.zones.map(Z => SX.mix(Z, SX.start(SX_LV[s.level].c0), im));   // a 1% floor of migrants from nearby lakes keeps every lock and both kinds present (D3; D0 guard-rail)
      if (s.track) for (let k = 0; k < 4; k++) s.w[k] = Math.round((SX_W.dec * s.w[k] + s.inf[k] + SX_W.floor) * 1e6) / 1e6;
      s.gen++; this.newPatch(s); this.record(s);
      ev.push({ k: 'breed', g: s.gen, c: s.zones[0].c });
      if (SX_LV[s.level].ask && !s.revealed && s.gen >= SX_ASK.p1.at && !s.whatif) { s.revealed = true; ev.push({ k: 'reveal', id: 'p1' }); }
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; s.pt += dt;
      if (s.phase === 'arrive') { if (s.pt >= SX_T.arrive) { s.pt = 0; s.phase = 'season'; ev.push({ k: 'season', g: s.gen }); } }   // the verb comes first: the call waits for the first breed
      else if (s.phase === 'ask') { if (!s.ask) { s.phase = 'season'; s.pt = 0; ev.push({ k: 'season', g: s.gen }); } }
      else if (s.phase === 'season') {
        if (s.auto) { if (s.pt >= SX_T.auto) { const b = this.best(s); s.pt = 0; this.drop(s, b[0], b[1], ev, true); } }
        else if (!s.unt) { s.clock += dt; if (s.clock >= SX_T.season) this.rain(s, ev); }
      }
      else if (s.phase === 'gap') { if (s.pt >= SX_T.gap) { s.phase = 'breed'; s.pt = 0; s.ff = s.auto ? 3 : 1; this.breed(s, ev); } }
      else if (s.phase === 'breed') {
        if (s.pt * (s.ff || 1) >= SX_T.breed) { s.pt = 0; s.old = null; if (s.gen >= s.G) { s.phase = 'end'; ev.push({ k: 'end' }); }
          else if (SX_LV[s.level].ask && !s.asks.length && !s.auto && !s.whatif && s.gen >= SX_ASK.p1.from) {   // the one call, once the doubling has been seen once
            const A = SX_ASK.p1; this.deal(s); s.askC = s.zones[0].c; s.askG = s.gen; s.ask = { id: 'p1', kind: A.kind, lo: A.lo, hi: A.hi, tol: A.tol, at: A.at }; s.asks.push('p1'); s.phase = 'ask'; ev.push({ k: 'ask', id: 'p1' }); }
          else { s.phase = 'season'; this.deal(s); ev.push({ k: 'season', g: s.gen }); } }
      }
      else if (s.phase === 'end') { if (s.pt >= SX_T.end) { s.phase = 'over'; ev.push({ k: 'over' }); } }
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (a.k === 'unt') { s.unt = !!a.on; return ev; }
      if (a.k === 'predict') {
        if (s.ask && a.id === s.ask.id) { const A = SX_ASK[a.id]; if (a.v == null) s.nocall[a.id] = 1; else s.pred[a.id] = Math.max(A.lo, Math.min(A.hi, Math.round((+a.v || 0) * 10) / 10)); s.ask = null; ev.push({ k: 'predicted', id: a.id, none: a.v == null }); }
        return ev;
      }
      if (a.k === 'ff') { if (s.phase === 'breed' || s.phase === 'gap') { s.ff = 3; ev.push({ k: 'ff' }); } return ev; }
      if (a.k === 'drop' && s.phase === 'season' && !s.auto) {
        const x = Math.max(0, Math.min(100, Math.round((+a.x || 0) * 10) / 10)), y = Math.max(0, Math.min(100, Math.round((+a.y || 0) * 10) / 10));
        this.drop(s, x, y, ev, false);
      }
      return ev;
    },
    expect(s, id) { if (id !== 'p1') return null; const c = s.askC != null ? s.askC : SX_LV[0].c0, g = s.askC != null ? s.askG : 0; return 100 * SX.twofold(c, SX_ASK.p1.at - g); },   // the twofold rule from the share shown when the call was asked (never the realised run)
    hit(s, id) { const v = s.pred[id], e = this.expect(s, id); return v != null && e != null && Math.abs(v - e) <= SX_ASK[id].tol + 1e-9; },
    trough(s) { let pk = 0; const h = s.hist; for (let i = 0; i < h.length; i++) if (h[i].c[0] > h[pk].c[0]) pk = i; let lo = 1; for (let i = pk; i < h.length; i++) lo = Math.min(lo, h[i].c[0]); return lo; },   // the lowest clone share after its peak
    end(s) { const h = s.hist[s.hist.length - 1]; return { c: h.c[0], d: h.c.length > 1 ? h.c[1] : null, m: h.m[0], md: h.m.length > 1 ? h.m[1] : null }; },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_SEX_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0), e = this.end(s);
      return { mask, outcome: { clone: Math.round(100 * e.c), infected: s.infTot }, interesting: s.whatif ? null : this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons rule 6)
      const e = this.end(s), n = s.level;
      if (n === 0) return e.c < 0.5 ? 'held' : e.c >= 0.9 ? 'fast' : null;
      if (n === 1) return e.c >= 0.3 ? (this.trough(s) < 0.1 ? 'cycle' : 'escaped') : null;
      return e.c >= 0.5 ? 'shallowclone' : null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) { const A = SX_ASK[s.ask.id]; for (let v = A.lo; v <= A.hi + 1e-9; v += A.step) out.push({ k: 'predict', id: s.ask.id, v }); return out; }
      if (s.phase !== 'season' || s.auto || s.ki >= s.keys.length) return out;
      for (const a of s.patch) if (!a.inf && this.canDrop(s, a.y)) out.push({ k: 'drop', x: a.x, y: a.y });
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) out.push({ k: 'drop', x: 10 + 20 * i, y: 10 + 20 * j });   // open water and weed too
      return out;
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    near(acts, v) { let b = null, bd = 1e9; for (const a of acts) if (a.k === 'predict') { const d = Math.abs(a.v - v); if (d < bd) { bd = d; b = a; } } return b; },
    bots: {
      alwaysA(s, acts) { if (!acts.length) return null; if (acts[0].k === 'predict') return acts[acts.length - 1]; return { k: 'drop', x: 3, y: 98 }; },      // a corner every time; calls 100%
      alwaysB(s, acts) { if (!acts.length) return null; if (acts[0].k === 'predict') return acts[0]; return { k: 'drop', x: 50, y: s.zones.length > 1 ? 28 : 50 }; },   // the middle every time; calls 0%
      greedy(s, acts) {   // the first matching snail it sees (sloppy aim); calls a linear guess (5% a generation)
        if (!acts.length) return null; if (acts[0].k === 'predict') return CH_SEX_V2.sim.near(acts, 35);
        const k = CH_SEX_V2.sim.key(s), a = s.patch.find(q => !q.inf && q.lk === k && CH_SEX_V2.sim.canDrop(s, q.y)); return a ? { k: 'drop', x: a.x, y: a.y } : acts[0];
      },
      threshold(s, acts) {   // only ever targets clone shells (when the key fits) and calls the middle
        if (!acts.length) return null; if (acts[0].k === 'predict') return CH_SEX_V2.sim.near(acts, 50);
        const a = s.patch.find(q => !q.inf && q.t === 'c' && q.lk === CH_SEX_V2.sim.key(s)); return a ? { k: 'drop', x: a.x, y: a.y } : { k: 'drop', x: 97, y: 50 };
      },
      noChange(s, acts) { if (!acts.length) return null; if (acts[0].k === 'predict') return CH_SEX_V2.sim.near(acts, 100 * s.zones[0].c); return CH_SEX_V2.sim.bots.greedy(s, acts); },   // calls "no change from now"
      expert(s, acts) {   // skilled play (oracle only): the best drop for every clutch, the expected call
        const S = CH_SEX_V2.sim; if (!acts.length) return null; if (acts[0].k === 'predict') return S.near(acts, S.expect(s, s.ask.id));
        const b = S.best(s); return { k: 'drop', x: b[0], y: b[1] };
      }
    }
  },

  /* ---- stars: pure functions of the final state (API_v2 §9.1). No level offers all three: L1 D+P, L2 D, L3 T. ---- */
  stars: {
    discover: (s, n) => { const e = CH_SEX_V2.sim.end(s); if (n === 0) return s.infTot >= SX_D1 && e.c >= 0.5; if (n === 1) return s.hist.some(h => h.g <= 6 && h.c[0] < 0.1); return false; },   // L2: the clone crashed below 10% by generation 6
    predict: (s, n) => n === 0 && CH_SEX_V2.sim.hit(s, 'p1'),
    transfer: (s, n) => { if (n !== 2) return false; const e = CH_SEX_V2.sim.end(s); return e.c < 0.15 && e.d >= 0.7; }   // the shallows nearly clone-free while the deep turns clonal
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–9 final clone share % · 10–16 the L1 call % · 17–26 snails infected
  resultBits(s, level) {
    const S = this.sim, r = S.result(), e = S.end(s), p = level === 0 && s.pred.p1 != null ? Math.round(s.pred.p1) : 0;
    return ((r ? r.mask : 0) & 7) | ((Math.round(100 * e.c) & 127) << 3) | ((p & 127) << 10) | ((Math.min(1023, s.infTot) & 1023) << 17);
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {}); this.level = n; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._said = {};
    Sim.start(this, n, o);
    if (!o.thaw && typeof Freezer !== 'undefined') Freezer.put(this.id, 0, this.sim.snapshot());   // What if? reruns the level from here
    const unt = (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt) || (typeof Url !== 'undefined' && Url.untimed);
    if (unt && !o.thaw && !o.replay) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    this.v = { t: 0, aim: null, cur: [50, 50], keyed: false, splash: [], hit: {}, banner: null, sig: '', bgSig: '', born: {}, eq: 0 };
    this.layout(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const s = this.sim.s, name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(1100, ms + 300) }; });
    this._ghost = !o.thaw && n === 0;   // the hand taps the best spot for the first clutch, once the first season opens (not over the prediction)
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  onResize() { if (this.v) this.layout(); },

  /* ---------- geometry (canvas px): the patch is a square of 100 × 100 lake units ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  geo() {
    const W = Stage.w, H = Stage.h, k = W + 'x' + H + 'x' + this.hudH() + 'x' + (this.sim.s ? this.sim.s.rad : 0);
    if (this._g && this._g.k === k) return this._g;
    const top = this.hudH() + 6, wide = W > H * 1.25 && W >= 700, trayH = wide ? 0 : 50;
    let S = Math.floor(Math.min(W - (wide ? 380 : 16), H - top - trayH - 12)); S = Math.max(160, S);
    const lx = wide ? Math.round((W - S) / 2 - 40) : Math.round((W - S) / 2), ly = top + (wide ? Math.max(0, Math.round((H - top - S - 10) / 2)) : 0);
    const g = { k, W, H, top, wide, S, lx, ly, sz: Math.max(18, Math.min(46, S * 0.074)), r: S * (this.sim.s ? this.sim.s.rad : SX_RAD) / 100 };
    g.tray = wide ? { x: 16, y: ly + 8, w: Math.max(150, lx - 32), h: S - 16, col: true } : { x: 8, y: ly + S + 6, w: W - 16, h: trayH - 6, col: false };
    g.side = wide ? { x: lx + S + 22, y: ly + 8, w: W - (lx + S + 22) - 16, h: S - 16 } : null;
    this._g = g; return g;
  },
  layout() { this._g = null; this.geo(); this.v.bgSig = ''; },
  toPx(u, v) { const g = this.geo(); return [g.lx + u / 100 * g.S, g.ly + v / 100 * g.S]; },
  toLake(x, y) { const g = this.geo(); return [(x - g.lx) / g.S * 100, (y - g.ly) / g.S * 100]; },
  inLake(x, y) { const g = this.geo(); return x >= g.lx - 6 && x <= g.lx + g.S + 6 && y >= g.ly - 6 && y <= g.ly + g.S + 6; },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    for (let i = v.splash.length - 1; i >= 0; i--) { v.splash[i].t += dt; if (v.splash[i].t > 1.1) v.splash.splice(i, 1); }
    for (const id in v.hit) { v.hit[id] -= dt; if (v.hit[id] <= 0) delete v.hit[id]; }
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; this._dockSig = ''; if (typeof Predict === 'undefined') return;
    Predict.ask({ id: A.id, chart: 0, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.lo, at: A.at, tol: A.tol, soft: s.unt ? null : 40, needMove: true, linger: 0,   // the ghost starts at 0%, off every plausible answer (lessons §1.3)
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null }), say: this.content.captions.liveAsk });
    if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.hud.p1, { c: Math.round(100 * (s.askC != null ? s.askC : s.zones[0].c)) }));
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(0); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, S = this.sim, final = n === SX_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    const V = this.vars();
    if (o.interesting) { C.interesting.now = Txt.f(C.interesting[o.interesting], V); o.interesting = 'now'; }   // the engine shows the text as is: fill this run's numbers first
    if (s.whatif) { o.take = null; o.interesting = null; o.body = Txt.f(this.wiText(s), V); }
    else if (!final) { const e = S.end(s), alt = n === 0 ? (e.c < 0.5 ? 'held' : null) : (S.trough(s) < 0.1 && s.peak > S.trough(s) + 0.1 ? null : 'nocrash');   // the text that fits this run
      o.take = alt === 'nocrash' ? null : C.levelTake[n]; o.body = Txt.f(C.levelBody[alt || n], V); }
    else { o.take = C.take; o.body = Txt.f(S.end(s).c < 0.5 ? C.body : C.levelBody.final, V); o.bodyFirst = true; }
    o.stars = C.levelStars[n];
    const vial = typeof Freezer !== 'undefined' ? Freezer.list(this.id).find(x => x.gen === 0) : null;
    if (vial && !s.whatif) o.whatIf = { gen: 0, levers: SX_LV[n].levers };
    const spec = this.chartSpec(true); o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title;
    End.show(this, o);
  },
  wiText(s) {   // the What if? card: the text that fits what this run did (lessons rule 6)
    const W = this.content.whatifBody, e = this.sim.end(s), k = s.whatif;
    const main = k === 'nosons' ? e.c < 0.25 : k === 'track' ? e.c >= 0.3 : k === 'blind' ? e.c >= 0.3 : k === 'few' ? e.c >= 0.3 : k === 'ducks' ? e.d < 0.7 : true;
    return (main ? W[k] : W[k + 'B']) || '';
  },
  vars() {
    const s = this.sim.s, S = this.sim, e = S.end(s), P = x => Math.round(100 * x);
    return { c: P(e.c), d: e.d == null ? 0 : P(e.d), a: P(e.m), b: e.md == null ? 0 : P(e.md), e: Math.round(S.expect(s, 'p1')), p: s.pred.p1 != null ? Math.round(s.pred.p1) + '%' : 'not made', q: P(s.askC != null ? s.askC : SX_LV[0].c0), k: P(s.peak), f: P(s.fitPeak), m: P(e.m), t: P(S.trough(s)) };
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {   // cosmetic (view-only maths)
    const s = this.sim.s, v = this.v, g = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content;
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    if (e.k === 'drop') {
      const [x, y] = this.toPx(e.x, e.y); v.splash.push({ x, y, t: 0, n: e.hits.length, key: e.key });
      if (F) F.ring(x, y, g.r, { ms: 420, ink: SX_C.red });
      for (const id of e.hits) { v.hit[id] = 0.9; const a = s.patch.find(q => q.id === id); if (a && F) { const p = this.toPx(a.x, a.y); F.ring(p[0], p[1], g.sz * 0.7, { ms: 300, ink: SX_C.redL }); } }
      if (F) F.pop(e.hits.length ? '+' + e.hits.length : '0', x, y - g.r * 0.4, e.hits.length ? 1 : 0);
      snd(e.hits.length ? 'count' : 'tick', x, y, { i: e.hits.length * 2 });
      if (!e.auto) {
        if (e.hits.length >= 5) { this.whisper('many'); if (F) F.tier(2, () => { }); } else if (!e.hits.length && this.once('miss')) this.whisper('miss');
        else if (e.hits.length && this.once('hit')) this.whisper('hit');
      }
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveDrop, { n: e.hits.length }));
    }
    else if (e.k === 'deep') { const [x, y] = this.toPx(e.x, e.y); this.whisper('deep'); if (F) F.ring(x, y, 18, { ms: 260, ink: SX_C.glint }); snd('tick', x, y); }
    else if (e.k === 'rain') { if (!s.auto) this.whisper('rain'); }
    else if (e.k === 'breed') {
      if (F) F.tier(2, () => { }); snd('swish', g.lx + g.S / 2, g.ly + g.S / 2);
      this.v.eq = 0; if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
      if (s.track && s.level >= 1 && this.sim.fitShare(s) >= 0.6 && s.zones[0].c >= 0.2 && this.once('track')) this.whisper('track');
      const h = s.hist, n = h.length; if (s.level >= 1 && n >= 3 && h[n - 1].c[0] < h[n - 2].c[0] - 0.08 && h[n - 2].c[0] >= 0.35 && this.once('crash')) this.whisper('crash');
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveBreed, { g: e.g, c: Math.round(100 * e.c) }));
    }
    else if (e.k === 'season') {
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
      if (this._ghost && typeof Ghost !== 'undefined') { this._ghost = false; Ghost.show({ verb: 'tap', at: () => { const S = this.sim, s2 = S.s, b = s2.phase === 'season' && s2.ki < s2.keys.length ? S.best(s2) : [50, 50]; return this.toPx(b[0], b[1]); }, until: () => this.sim.s.ki > 0 || this.sim.s.gen > 0 }); }
    }
    else if (e.k === 'ask') { if (F) F.ring(g.lx + g.S / 2, g.ly + g.S / 2, g.S * 0.3, { ms: 400 }); }
    else if (e.k === 'predicted') { this.whisper(e.none ? 'none' : 'later'); if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); }
    else if (e.k === 'reveal') {
      const ex = this.sim.expect(s, 'p1'); if (typeof Predict !== 'undefined' && s.pred.p1 != null) Predict.reveal('p1', ex, SX_ASK.p1.tol);
      if (s.pred.p1 != null) { this.whisper(this.sim.hit(s, 'p1') ? 'inband' : 'outband'); if (typeof Snd2 !== 'undefined') Snd2.play('interesting', { x: g.lx + g.S / 2, y: g.ly + 20 }); }
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'ff') { if (F) F.ring(g.lx + g.S / 2, g.ly + g.S / 2, g.S * 0.2, { ms: 200 }); }
    else if (e.k === 'end' || e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'sx-' + k); },

  /* ---------- input: press to aim, slide, lift to drop (a quick tap drops at once); keys move an aim ring ---------- */
  canAim() { const s = this.sim.s; return s.phase === 'season' && !s.auto && s.ki < s.keys.length; },
  down(x, y) {
    const s = this.sim.s; if (y < this.hudH()) return;
    if (s.phase === 'breed' || s.phase === 'gap') { Sim.act(this, { k: 'ff' }); return; }
    if (!this.canAim() || !this.inLake(x, y)) return;
    this.v.aim = this.toLake(x, y);
  },
  move(x, y) { if (this.v.aim && this.canAim()) this.v.aim = this.toLake(x, y); },
  up(x, y) {
    const a = this.v.aim; this.v.aim = null; if (!a || !this.canAim()) return;
    const p = x != null && y != null && this.inLake(x, y) ? this.toLake(x, y) : a;
    Sim.act(this, { k: 'drop', x: p[0], y: p[1] });
  },
  onKey(k, e) {
    const s = this.sim.s, v = this.v, st = e && e.shiftKey ? 2 : 6;
    if (s.phase === 'breed' || s.phase === 'gap') { if (k === ' ' || k === 'Enter') Sim.act(this, { k: 'ff' }); return; }
    if (!this.canAim()) return;
    const mv = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[k];
    if (mv) { v.keyed = true; v.cur = [Math.max(2, Math.min(98, v.cur[0] + mv[0])), Math.max(2, Math.min(98, v.cur[1] + mv[1]))]; return; }
    if (k === 'n' || k === 'N') {   // jump the aim ring to the next snail the current eggs fit
      const key = this.sim.key(s), m = s.patch.filter(a => !a.inf && a.lk === key && this.sim.canDrop(s, a.y)); if (!m.length) return;
      v.ni = ((v.ni || 0) + 1) % m.length; v.keyed = true; v.cur = [m[v.ni].x, m[v.ni].y]; return;
    }
    if ((k === ' ' || k === 'Spacebar' || k === 'Enter') && !(e && e.repeat)) { v.keyed = true; Sim.act(this, { k: 'drop', x: v.cur[0], y: v.cur[1] }); }
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, sig = s.phase + (s.ask ? s.ask.id : '') + (s.auto ? 'a' : ''); if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'sx-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (!s.auto && (s.phase === 'breed' || s.phase === 'gap')) { Dock.set([{ id: 'sx-ff', label: L.faster, key: 'f', fn: () => Sim.act(this, { k: 'ff' }) }]); return; }
    Dock.set([]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, lab = this.content.labels, n = s.level; let t;
    if (s.ask) t = Txt.f(C.p1, { c: Math.round(100 * (s.askC != null ? s.askC : s.zones[0].c)) });
    else if (s.auto) t = C.auto;
    else if (s.phase === 'over' || s.phase === 'end') t = C.over;
    else if (s.phase === 'breed' || s.phase === 'gap') t = n === 0 ? C.breed1 : n === 1 ? C.breed2 : C.breed3;
    else if (n === 0 && s.gen === 0 && s.ki === 0) t = this.content.firstWords;
    else { const k = this.sim.key(s); t = Txt.f(n === 2 ? C.seasonDeep : C.season, { lock: lab['lock' + Math.max(0, k)] }); }
    const num = Txt.f(lab.gen, { g: s.gen, G: s.G });
    const sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g); this.drawLight(c, g);
    if (s.phase === 'breed' && s.old) this.drawBreed(c, g); else this.drawSnails(c, g, s.patch, 1);
    this.drawSplash(c, g); this.drawAim(c, g); this.drawTray(c, g); this.drawKeyNumber(c, g);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('sx-banner', v.banner.text, g.lx + g.S / 2, g.ly + g.S * 0.42, { size: 22 }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached: deep water, the lit lakebed patch, weed, slate stones, the shore and peaks
    const sig = g.k + '|' + this.sim.s.zones.length; if (!this._bg || this.v.bgSig !== sig) { this._bg = this._bg || Layer(g.W, g.H); this._bg.resize(g.W, g.H); this._bg.redraw(cc => this.paintBg(cc, g)); this.v.bgSig = sig; }
    this._bg.blit(c, 0, 0);
  },
  paintBg(c, g) {   // cosmetic
    const C = SX_C, rnd = rng(17), two = this.sim.s.zones.length > 1, S = g.S, lx = g.lx, ly = g.ly;
    const bg = c.createLinearGradient(0, 0, 0, g.H); bg.addColorStop(0, C.water); bg.addColorStop(1, C.deep); c.fillStyle = bg; c.fillRect(0, 0, g.W, g.H);
    // distant peaks over the top band (snow on slate), seen past the shore
    const pk = Math.max(10, Math.min(46, g.ly - g.top + 30)); c.save(); c.globalAlpha = 0.55; c.fillStyle = C.slate; c.beginPath(); c.moveTo(0, g.top + pk);
    for (let x = 0; x <= g.W; x += 24) c.lineTo(x, g.top + pk - 6 - 22 * Math.abs(Math.sin(x / g.W * 7.3 + 0.6)) - 10 * rnd()); c.lineTo(g.W, g.top + pk); c.closePath(); c.fill(); c.restore();
    // weed silhouettes in the dark water around the patch
    c.strokeStyle = 'rgba(30,80,60,.55)'; c.lineCap = 'round'; for (let i = 0; i < 70; i++) { const x = rnd() * g.W, y = g.top + rnd() * (g.H - g.top); if (x > lx - 4 && x < lx + S + 4 && y > ly - 4 && y < ly + S + 4) continue; this.frond(c, x, y, 10 + rnd() * 22, rnd() * 0.8 - 0.4, 'rgba(40,96,70,.6)', rnd); }
    // the lakebed: pale glacial silt, lit; the deep zone darker (L3)
    c.save(); this.rr(c, lx, ly, S, S, 14); c.clip();
    const lb = c.createLinearGradient(0, ly, 0, ly + S); lb.addColorStop(0, '#C9CCB4'); lb.addColorStop(1, C.silt2); c.fillStyle = lb; c.fillRect(lx, ly, S, S);
    for (let i = 0; i < 260; i++) { c.fillStyle = 'rgba(70,80,70,' + (0.05 + 0.08 * rnd()) + ')'; c.beginPath(); c.arc(lx + rnd() * S, ly + rnd() * S, 0.6 + rnd() * 1.6, 0, TAU); c.fill(); }
    for (let i = 0; i < 12; i++) { const x = lx + rnd() * S, y = ly + rnd() * S, r = S * (0.01 + 0.014 * rnd()); c.fillStyle = rnd() < 0.5 ? '#8E9A98' : '#7A8786'; c.beginPath(); c.ellipse(x, y, r * 1.4, r, rnd() * 3, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(x - r * 0.3, y - r * 0.3, r * 0.6, r * 0.35, 0, 0, TAU); c.fill(); }
    for (let i = 0; i < 26; i++) { const x = lx + rnd() * S, y = ly + S * (0.1 + 0.88 * rnd()); if (two && y > ly + S * 0.5) continue; this.frond(c, x, y, S * (0.04 + 0.05 * rnd()), rnd() * 0.8 - 0.4, rnd() < 0.5 ? C.weed : C.weed2, rnd); }
    // the shore along the top: slate cobbles and a strip of tussock
    const sh = S * 0.075; c.fillStyle = '#7C8A7A'; c.fillRect(lx, ly, S, sh); for (let x = lx; x < lx + S; x += 9) { c.fillStyle = rnd() < 0.5 ? C.slate : '#8C9690'; c.beginPath(); c.ellipse(x + 4, ly + sh * (0.45 + 0.4 * rnd()), 5 + 3 * rnd(), 3 + 2 * rnd(), 0, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(190,170,90,.8)'; for (let x = lx; x < lx + S; x += 5) { c.beginPath(); c.moveTo(x, ly + sh * 0.35); c.lineTo(x + 2, ly - 2); c.lineTo(x + 3, ly + sh * 0.35); c.fill(); }
    if (two) {   // the drop-off: deeper, bluer, fewer weeds below it
      const d0 = ly + S * 0.5; const dg = c.createLinearGradient(0, d0 - 10, 0, ly + S); dg.addColorStop(0, 'rgba(20,70,85,0)'); dg.addColorStop(0.12, 'rgba(20,70,85,.55)'); dg.addColorStop(1, 'rgba(10,45,58,.72)');
      c.fillStyle = dg; c.fillRect(lx, d0 - 10, S, ly + S - d0 + 10);
      c.setLineDash([6, 5]); c.strokeStyle = 'rgba(230,245,240,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(lx, d0); c.lineTo(lx + S, d0); c.stroke(); c.setLineDash([]);
    }
    c.restore();
    c.strokeStyle = 'rgba(160,220,215,.55)'; c.lineWidth = 2; this.rr(c, lx, ly, S, S, 14); c.stroke();
  },
  frond(c, x, y, h, lean, col, rnd) {   // cosmetic: a charophyte-like weed frond with whorls of short branchlets
    c.strokeStyle = col; c.lineWidth = Math.max(1, h * 0.06); c.beginPath(); c.moveTo(x, y); const tx = x + lean * h, ty = y - h; c.quadraticCurveTo(x + lean * h * 0.3, y - h * 0.6, tx, ty); c.stroke();
    c.lineWidth = Math.max(0.8, h * 0.04); for (let k = 1; k <= 3; k++) { const q = k / 4, px = x + (tx - x) * q, py = y + (ty - y) * q, w = h * 0.22 * (1 - q * 0.4); c.beginPath(); c.moveTo(px - w, py - w * 0.4); c.lineTo(px, py); c.lineTo(px + w, py - w * 0.4); c.stroke(); }
  },
  rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
  drawLight(c, g) {   // cosmetic: caustic light drifting over the lakebed (still in Calm)
    if (typeof Fx !== 'undefined' && Fx.calm) return; const t = this.v.t;
    c.save(); this.rr(c, g.lx, g.ly, g.S, g.S, 14); c.clip(); c.strokeStyle = 'rgba(235,255,250,.10)'; c.lineWidth = 2.2;
    for (let i = 0; i < 7; i++) { const y0 = g.ly + g.S * (i + 0.5) / 7; c.beginPath(); for (let x = 0; x <= g.S; x += 12) { const y = y0 + 6 * Det.sin(x / 31 + t * 0.7 + i * 1.7) + 4 * Det.sin(x / 13 - t * 0.9 + i); if (x) c.lineTo(g.lx + x, y); else c.moveTo(g.lx + x, y); } c.stroke(); }
    c.restore();
  },
  // one mud snail, seen from above: a tall conical shell (Potamopyrgus), head and tentacles from the aperture.
  // o: {t: 'f'|'m'|'c', lk, sh (shade 0–1), inf, ang, alpha, glow (matches the eggs), pulse, scale}
  snail(c, x, y, sz, o, t) {   // cosmetic
    const male = o.t === 'm', clone = o.t === 'c', L = sz * (male ? 0.8 : 1) * (o.scale || 1), Wd = L * (male ? 0.42 : 0.5), C = SX_C, calm = typeof Fx !== 'undefined' && Fx.calm;
    c.save(); c.translate(x, y); c.rotate(o.ang || 0); if (o.alpha != null) c.globalAlpha *= o.alpha;
    if (o.glow) { c.fillStyle = 'rgba(240,122,94,' + (0.34 + (calm ? 0 : 0.12 * Det.sin(t * 5))) + ')'; c.beginPath(); c.ellipse(0, L * 0.08, Wd * 0.95, L * 0.64, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = Math.max(1.2, L * 0.05); c.stroke(); }   // a pale rim too, so the match reads by lightness as well as hue (CVD)
    // foot and head (grey, translucent) crawl out under the body whorl; two tentacles; still when infected
    const wig = o.inf || calm ? 0 : 0.7 * Det.sin(t * 2.2 + (o.sh || 0) * 9);
    c.fillStyle = 'rgba(128,124,112,.9)'; c.beginPath(); c.ellipse(0, L * 0.42, Wd * 0.34, L * 0.19, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(96,92,82,.95)'; c.lineWidth = Math.max(1, L * 0.05); c.lineCap = 'round'; c.beginPath(); c.moveTo(-Wd * 0.12, L * 0.56); c.lineTo(-Wd * 0.36 + wig, L * 0.74); c.moveTo(Wd * 0.12, L * 0.56); c.lineTo(Wd * 0.36 + wig, L * 0.74); c.stroke();
    // the shell: a tall spire of five whorls, the body whorl largest and in front (Potamopyrgus is about 5 mm long)
    const base = clone ? C.clone : this.shade(o.sh || 0.5), edge = clone ? C.cloneD : C.ochreD, mk = 'rgba(51,36,26,.88)';
    for (let i = 4; i >= 0; i--) {
      const cy = L * (0.2 - i * 0.165), rx = Wd * 0.5 * Math.pow(0.79, i), ry = L * 0.15 * Math.pow(0.85, i);
      c.fillStyle = base; c.beginPath(); c.ellipse(0, cy, rx, ry, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.ellipse(-rx * 0.35, cy - ry * 0.25, rx * 0.35, ry * 0.45, 0, 0, TAU); c.fill();
      if (o.lk & 1) { c.strokeStyle = mk; c.lineWidth = Math.max(1.2, L * 0.055); c.beginPath(); c.ellipse(0, cy + ry * 0.1, rx * 0.86, ry * 0.62, 0, 0.12 * Math.PI, 0.88 * Math.PI); c.stroke(); }   // a dark spiral band on every whorl
      if (o.lk & 2) { c.fillStyle = mk; const d = Math.max(1, L * 0.042); for (const q of i ? [[-0.5, -0.1], [0.45, 0.05]] : [[-0.55, -0.2], [0.5, -0.1], [-0.1, -0.45], [0.15, 0.35]]) { c.beginPath(); c.arc(rx * q[0], cy + ry * q[1], d, 0, TAU); c.fill(); } }   // spots
      c.strokeStyle = edge; c.lineWidth = Math.max(0.8, L * 0.035); c.beginPath(); c.ellipse(0, cy, rx, ry, 0, 0, TAU); c.stroke();
    }
    c.fillStyle = 'rgba(60,40,26,.75)'; c.beginPath(); c.ellipse(Wd * 0.1, L * 0.26, Wd * 0.17, L * 0.07, 0.2, 0, TAU); c.fill();   // the aperture
    if (o.inf) {   // castrated: the parasite's cysts fill the gonad; the body whorl glows red
      c.fillStyle = 'rgba(200,64,47,.6)'; c.beginPath(); c.ellipse(0, L * 0.18, Wd * 0.42, L * 0.12, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(252,226,206,.95)'; for (const q of [[-0.2, 0.15], [0.12, 0.2], [0, 0.11], [0.24, 0.13], [-0.08, 0.24]]) { c.beginPath(); c.arc(Wd * q[0], L * q[1], Math.max(0.9, L * 0.032), 0, TAU); c.fill(); }
      c.strokeStyle = C.red; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, L * 0.2, Wd * 0.5, L * 0.15, 0, 0, TAU); c.stroke();
    }
    if (o.pulse > 0) { c.strokeStyle = 'rgba(240,122,94,' + Math.min(1, o.pulse) + ')'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, L * (0.9 - 0.3 * o.pulse), 0, TAU); c.stroke(); }
    c.restore();
  },
  shade(sh) { const a = [214, 166, 96], b = [172, 122, 62], k = Math.max(0, Math.min(1, sh)); return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',') + ')'; },   // cosmetic
  drawSnails(c, g, P, alpha) {   // cosmetic
    const s = this.sim.s, v = this.v, key = this.canAim() ? this.sim.key(s) : -1, t = v.t;
    for (const a of P) {
      const [x, y] = this.toPx(a.x, a.y), creep = a.inf || (typeof Fx !== 'undefined' && Fx.calm) ? 0 : g.sz * 0.05 * Det.sin(t * 0.8 + a.id);
      this.snail(c, x + creep, y, g.sz, { t: a.t, lk: a.lk, sh: a.sh, inf: a.inf, ang: a.ang, alpha, glow: key >= 0 && !a.inf && a.lk === key && this.sim.canDrop(s, a.y), pulse: v.hit[a.id] || 0 }, t);
    }
  },
  drawBreed(c, g) {   // cosmetic: uninfected mothers release young; infected snails fade; the new generation grows in where it settles
    const s = this.sim.s, v = this.v, u = Math.min(1, s.pt * (s.ff || 1) / SX_T.breed), t = v.t, A = Math.min(1, u / 0.45), B = Math.max(0, (u - 0.4) / 0.6);
    for (const a of s.old) {
      const [x, y] = this.toPx(a.x, a.y), mum = !a.inf && a.t !== 'm';
      this.snail(c, x, y, g.sz, { t: a.t, lk: a.lk, sh: a.sh, inf: a.inf, ang: a.ang, alpha: (a.inf ? 1 - A * 0.6 : 1) * (1 - B) }, t);
      if (mum && u < 0.75) {   // her brood: six young (pale when clonal, all daughters)
        const r0 = g.sz * (0.5 + 0.9 * A), al = (1 - B) * Math.min(1, A * 2);
        for (let j = 0; j < SX_B; j++) { const an = j * TAU / SX_B + a.id, bx = x + r0 * Math.cos(an), by = y + r0 * Math.sin(an); const son = a.t !== 'c' && j % 2 === 1 && !s.noSons;
          this.snail(c, bx, by, g.sz * 0.36, { t: a.t === 'c' ? 'c' : son ? 'm' : 'f', lk: a.lk, sh: a.sh, ang: an + TAU / 4, alpha: al }, t); }
      }
    }
    if (B > 0) { const k = 0.4 + 0.6 * B; c.save(); c.globalAlpha = B; for (const a of s.patch) { const [x, y] = this.toPx(a.x, a.y); this.snail(c, x, y, g.sz * k, { t: a.t, lk: a.lk, sh: a.sh, ang: a.ang }, t); } c.restore(); }
    this.drawEq(c, g, u);
  },
  drawEq(c, g, u) {   // the key rule, plainly, during the breed: what each kind of mother makes (L1), or what the keys did (L2, L3)
    const s = this.sim.s, lab = this.content.labels, n = s.level, cx = g.lx + g.S / 2, y = g.ly + g.S * 0.5, a = Math.min(1, u * 4) * Math.min(1, (1 - u) * 5);
    if (a <= 0) return; c.save(); c.globalAlpha = a;
    const bw = Math.min(g.S - 20, 330), bh = n === 0 && !s.noSons ? 116 : 64; c.fillStyle = 'rgba(243,239,228,.94)'; this.rr(c, cx - bw / 2, y - bh / 2, bw, bh, 12); c.fill(); c.strokeStyle = SX_C.slateD; c.lineWidth = 1.2; c.stroke();
    const P = { pill: false, size: 13, ink: SX_C.ink };
    if (n === 0 && !s.noSons) {
      const x0 = cx - bw / 2 + 26;
      this.snail(c, x0, y - 36, 22, { t: 'c', lk: SX_CL, ang: 0 }, 0); Lbl.put('sx-eqc', lab.cloneMum, x0 + 18, y - 36, Object.assign({ align: 'left' }, P)); Lbl.put('sx-eqc2', lab.dau6, cx + bw / 2 - 12, y - 36, Object.assign({ align: 'right' }, P, { weight: 700 }));
      this.snail(c, x0, y - 2, 22, { t: 'f', lk: 1, sh: 0.4, ang: 0 }, 0); Lbl.put('sx-eqs', lab.sexMum, x0 + 18, y - 2, Object.assign({ align: 'left' }, P));
      Lbl.put('sx-eqs2', lab.dau3, cx + bw / 2 - 64, y - 8, Object.assign({ align: 'right' }, P, { weight: 700 })); Lbl.put('sx-eqs3', lab.sons3, cx + bw / 2 - 12, y + 6, Object.assign({ align: 'right' }, P));
      Lbl.put('sx-eqt', lab.twice, cx, y + 26, { size: 12, bg: SX_C.redL, ink: SX_C.ink });
      Lbl.put('sx-eqr', lab.rule, cx, y + 46, Object.assign({}, P, { weight: 700 }));   // the key equation, plainly (D6 decision 9)
    } else if (n === 1 || (n === 0 && s.noSons)) {
      const x1 = cx - bw / 4, x2 = cx + bw / 4;
      this.snail(c, x1 - 40, y - 10, 22, { t: 'c', lk: SX_CL, ang: 0 }, 0); Lbl.put('sx-eq2', Txt.f(lab.clones, { p: Math.round(100 * s.zones[0].c) }), x1 - 24, y - 10, Object.assign({ align: 'left' }, P, { weight: 700 }));
      this.eggs(c, x2 - 44, y - 10, 22); this.snail(c, x2 - 44, y - 10, 16, { t: 'c', lk: SX_CL, ang: 0 }, 0); Lbl.put('sx-eq1', Txt.f(lab.fit, { p: Math.round(100 * this.sim.fitShare(s)) }), x2 - 28, y - 10, Object.assign({ align: 'left' }, P, { weight: 700 }));
      Lbl.put('sx-eq3', lab.track, cx, y + 16, { size: 12, bg: SX_C.redL, ink: SX_C.ink });
    } else {
      const m = s.zones.map(Z => Math.round(100 * SX.males(Z)));
      Lbl.put('sx-eq1', Txt.f(lab.mShallow, { p: m[0] }), cx, y - 12, Object.assign({}, P, { weight: 700 }));
      Lbl.put('sx-eq2', Txt.f(lab.mDeep, { p: m[1] }), cx, y + 12, Object.assign({}, P, { weight: 700 }));
    }
    c.restore();
  },
  drawSplash(c, g) {   // cosmetic: a scaup's shadow passes and a cloud of eggs settles inside the clutch radius
    for (const p of this.v.splash) {
      const u = p.t / 1.1, rnd = rng(Math.round(p.x * 7 + p.y * 13));
      c.save(); c.globalAlpha = Math.max(0, 1 - u);
      c.strokeStyle = SX_C.red; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.arc(p.x, p.y, g.r * (0.85 + 0.15 * Math.min(1, u * 4)), 0, TAU); c.stroke(); c.setLineDash([]);
      c.fillStyle = SX_C.egg; for (let i = 0; i < 22; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * g.r * Math.min(1, 0.3 + u * 2); c.beginPath(); c.ellipse(p.x + r * Math.cos(a), p.y + r * Math.sin(a) + 6 * (1 - Math.min(1, u * 3)), 1.8, 1.2, a, 0, TAU); c.fill(); }
      if (u < 0.6) { const k = u / 0.6; this.scaup(c, p.x - g.r * 1.2 + g.r * 2.4 * k, p.y - g.r * 0.15, g.r * 1.5, 0.16 * (1 - k)); }
      c.restore();
    }
  },
  scaup(c, x, y, L, al) {   // cosmetic: a New Zealand scaup's shadow from below
    c.save(); c.globalAlpha *= al; c.fillStyle = SX_C.scaup; c.beginPath(); c.ellipse(x, y, L * 0.42, L * 0.2, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x + L * 0.42, y, L * 0.13, L * 0.1, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x + L * 0.56, y, L * 0.07, L * 0.035, 0, 0, TAU); c.fill(); c.restore();
  },
  drawAim(c, g) {   // the aim ring while pressing (or the key cursor), the clutch radius drawn true
    const s = this.sim.s, v = this.v; if (!this.canAim()) return;
    const p = v.aim || (v.keyed ? v.cur : null); if (!p) return; const [x, y] = this.toPx(p[0], p[1]), ok = this.sim.canDrop(s, p[1]);
    c.save(); c.strokeStyle = ok ? SX_C.red : 'rgba(230,240,240,.7)'; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.beginPath(); c.arc(x, y, g.r, 0, TAU); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 6, y); c.moveTo(x, y - 6); c.lineTo(x, y + 6); c.stroke(); c.restore();
  },
  drawTray(c, g) {   // the next clutches: each egg cluster shows the shell pattern its key fits; the season clock
    const s = this.sim.s, T = g.tray, lab = this.content.labels, sz = Math.min(34, g.sz * 1.25);
    const showing = (s.phase === 'season' || s.phase === 'ask' || s.phase === 'arrive') && !s.auto, left = s.keys.length - s.ki;
    c.save(); c.fillStyle = 'rgba(14,40,46,.72)'; this.rr(c, T.x, T.y, T.w, T.h, 10); c.fill(); c.restore();
    if (!showing || left <= 0) { if (s.phase !== 'season') Lbl.put('sx-gen', Txt.f(lab.gen, { g: s.gen, G: s.G }), T.x + T.w / 2, T.y + (T.col ? 24 : T.h / 2), { size: 13 }); return; }
    const k = this.sim.key(s);
    if (T.col) {   // desktop: a column on the left
      Lbl.put('sx-next', lab.next, T.x + T.w / 2, T.y + 18, { size: 14 });
      this.eggs(c, T.x + T.w / 2, T.y + 34 + sz * 0.9, sz * 1.5); this.snail(c, T.x + T.w / 2, T.y + 34 + sz * 0.9, sz * 1.25, { t: 'f', lk: k, sh: 0.3, ang: 0, glow: true }, this.v.t);
      Lbl.put('sx-lockname', lab['lock' + k], T.x + T.w / 2, T.y + 50 + sz * 1.9, { size: 14, pill: false, ink: SX_C.paper });
      const rest = s.keys.slice(s.ki + 1), per = Math.max(1, Math.floor((T.w - 16) / (sz * 0.95)));
      rest.forEach((q, i) => { const cx = T.x + 12 + sz * 0.45 + (i % per) * sz * 0.95, cy = T.y + 90 + sz * 2.2 + Math.floor(i / per) * sz * 1.1; this.eggs(c, cx, cy, sz * 0.7); this.snail(c, cx, cy, sz * 0.6, { t: 'f', lk: q, sh: 0.3, ang: 0 }, 0); });
      Lbl.put('sx-left', Txt.f(lab.left, { n: left }), T.x + T.w / 2, T.y + 70 + sz * 2.0, { size: 13 });
      if (!s.unt && s.phase === 'season') this.clock(c, T.x + T.w / 2, T.y + T.h - 30, 18, 1 - s.clock / SX_T.season);
      return;
    }
    const cy = T.y + T.h / 2, x0 = T.x + 10;
    Lbl.put('sx-next', lab.next, x0, cy, { size: 13, align: 'left' });
    const ix = x0 + 66 + sz * 0.5; this.eggs(c, ix, cy, sz * 1.2); this.snail(c, ix, cy, sz, { t: 'f', lk: k, sh: 0.3, ang: 0, glow: true }, this.v.t);
    const rest = s.keys.slice(s.ki + 1), room = Math.max(0, Math.floor((T.w - (ix + sz * 0.8 - T.x) - 48) / (sz * 0.62)));
    rest.slice(0, room).forEach((q, i) => { const qx = ix + sz * 0.95 + i * sz * 0.62; this.snail(c, qx, cy, sz * 0.5, { t: 'f', lk: q, sh: 0.3, ang: 0, alpha: 0.85 }, 0); });
    if (rest.length > room) Lbl.put('sx-more', '+' + (rest.length - room), ix + sz * 0.95 + room * sz * 0.62 + 8, cy, { size: 12, align: 'left' });
    if (!s.unt && s.phase === 'season') this.clock(c, T.x + T.w - 22, cy, 14, 1 - s.clock / SX_T.season);
  },
  eggs(c, x, y, d) { c.save(); c.fillStyle = 'rgba(200,64,47,.22)'; c.beginPath(); c.arc(x, y, d * 0.55, 0, TAU); c.fill(); c.strokeStyle = 'rgba(240,122,94,.8)'; c.lineWidth = 1.5; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); c.restore(); },   // cosmetic
  clock(c, x, y, r, f) { c.save(); c.strokeStyle = 'rgba(243,239,228,.35)'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.strokeStyle = f < 0.25 ? SX_C.redL : SX_C.glint; c.beginPath(); c.arc(x, y, r, -TAU / 4, -TAU / 4 + TAU * Math.max(0, f)); c.stroke(); c.restore(); },   // cosmetic
  drawKeyNumber(c, g) {   // the key number, plainly, on the shore band (phone) or the side panel (desktop)
    const s = this.sim.s, lab = this.content.labels, n = s.level, h = s.hist[s.hist.length - 1], P = x => Math.round(100 * x);
    const items = [];
    if (n === 2) items.push(Txt.f(lab.mShallow, { p: P(h.m[0]) }), Txt.f(lab.mDeep, { p: P(h.m[1]) }));
    else { items.push(Txt.f(lab.clones, { p: P(h.c[0]) })); if (n === 1 || s.track) items.push(Txt.f(lab.fit, { p: P(this.sim.fitShare(s)) })); else items.push(Txt.f(lab.males, { p: P(h.m[0]) })); }
    if (g.side) {
      const x = g.side.x + g.side.w / 2; let y = g.side.y + 22;
      items.forEach((t, i) => { Lbl.put('sx-kn' + i, t, x, y, { size: i ? 15 : 18 }); y += 36; });
      if (n >= 1 || s.track) this.keyBar(c, g.side.x + 8, y + 26, g.side.w - 16, 30);
      return;
    }
    // along the bottom of each zone, clear of the whisper that sits under the HUD
    const y = g.ly + g.S - 14, x = g.lx + g.S / 2;
    if (n === 2) { Lbl.put('sx-kn0', items[0], g.lx + 8, g.ly + g.S * 0.5 - 12, { size: 13, align: 'left' }); Lbl.put('sx-kn1', items[1], g.lx + 8, y, { size: 13, align: 'left' }); }
    else if (items.length === 2) { Lbl.put('sx-kn0', items[0], x - 6, y, { size: 13, align: 'right' }); Lbl.put('sx-kn1', items[1], x + 6, y, { size: 13, align: 'left' }); }
  },
  keyBar(c, x, y, w, h) {   // the parasite's keys now: one segment per lock, each with its shell; the clone's lock outlined
    const s = this.sim.s, ww = s.track ? s.w : [1, 1, 1, 1], tot = ww[0] + ww[1] + ww[2] + ww[3]; let x0 = x;
    Lbl.put('sx-keys', this.content.labels.keys, x + w / 2, y - 10, { size: 12, pill: false, ink: SX_C.paper });
    for (let k = 0; k < 4; k++) { const sw = w * ww[k] / tot; c.fillStyle = k === SX_CL ? 'rgba(200,64,47,.85)' : 'rgba(200,64,47,' + (0.25 + 0.12 * k) + ')'; c.fillRect(x0, y, Math.max(0, sw - 1), h); if (sw > h * 0.8) this.snail(c, x0 + sw / 2, y + h / 2, h * 0.75, { t: k === SX_CL ? 'c' : 'f', lk: k, sh: 0.3, ang: 0 }, 0); x0 += sw; }
    c.strokeStyle = SX_C.paper; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  },

  /* ---------- the live graph (strip) and the level card's chart ---------- */
  notes() {
    const s = this.sim.s, lab = this.content.labels, cap = this.content.captions, h = s.hist[s.hist.length - 1], P = x => Math.round(100 * x) + '%';
    const stats = [[lab.sGen, s.gen + ' of ' + s.G, cap.mGen]];
    if (s.zones.length > 1) stats.push([lab.sShallow, P(h.c[0]), ''], [lab.sDeepS, P(h.c[1]), ''], [lab.sMS, P(h.m[0]), cap.mMales]);
    else stats.push([lab.sClones, P(h.c[0]), cap.mClones], [lab.sMales, P(h.m[0]), cap.mMales]);
    if (s.track) stats.push([lab.sFitS, P(this.sim.fitShare(s)), cap.mFit]);
    stats.push([lab.sInf, String(s.infTot), cap.mInf]);
    return { stats, charts: [this.chartSpec(false)] };
  },
  chartSpec(card) {
    const s = this.sim.s, lab = this.content.labels, H = s.hist, n = s.level, G = s.G;
    const series = [{ d: H.map(e => [e.g, e.c[0]]), label: s.zones.length > 1 ? lab.shallows : lab.you }];
    if (s.zones.length > 1) series.push({ d: H.map(e => [e.g, e.c[1]]), dash: true, label: lab.deepLine });
    else if (s.track) series.push({ d: H.map(e => [e.g, e.fit]), dash: true, label: lab.keyLine });
    const p100 = n === 0 && !card, spec = { type: 'sx_lines', title: s.zones.length > 1 ? lab.tZones : s.track ? lab.tPair : lab.tClone, x: { lo: 0, hi: G, label: lab.ax }, y: { lo: 0, hi: p100 ? 100 : 1, fmt: p100 ? v => Math.round(v) + '%' : 'pct' }, series, frame: 'designed', pct100: p100 };
    if (spec.pct100) spec.series = spec.series.map(q => ({ d: q.d.map(p => [p[0], 100 * p[1]]), dash: q.dash, label: q.label }));
    return spec;
  }
};
V2.push(CH_SEX_V2);

/* ---- this unit's chart type (registered guarded, like hk_hist): shares against generation, solid and dashed lines ---- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.sx_lines) LiveGraph.T.sx_lines = {
  lay(w, h, spec, T, c) { const labels = (spec.series || []).map(q => q.label || ''); const G = wgXY(w, h, spec, T, c, { xlo: spec.x.lo, xhi: spec.x.hi, ylo: spec.y.lo, yhi: spec.y.hi, labels }); G.nextX = null; return G; },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, hi = spec.y.hi, ends = [];
    wgAxes(c, G, spec, T, { xticks: [0, Math.round(spec.x.hi / 2), spec.x.hi], xfmt: v => String(v) });
    if (!T.compact) { const y = G.Y(0.5 * hi); c.strokeStyle = wgRgba(I.text, 0.25); c.setLineDash([2, 3]); c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke(); c.setLineDash([]); }   // the half-way line
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip(); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const q of spec.series || []) {
      if (!q.d || !q.d.length) continue; c.strokeStyle = I.text; c.lineWidth = (q.dash ? 2 : 3) * T.k; c.setLineDash(q.dash ? [6, 4] : []);
      c.beginPath(); q.d.forEach((pt, i) => { const x = G.X(pt[0]), y = G.Y(pt[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.setLineDash([]);
      const l = q.d[q.d.length - 1]; if (!q.dash) { c.fillStyle = I.text; c.beginPath(); c.arc(G.X(l[0]), G.Y(l[1]), 3.5 * T.k, 0, TAU); c.fill(); }
      if (q.label) ends.push({ y: G.Y(l[1]), text: q.label, col: I.text, dash: !!q.dash });
    }
    c.restore();
    wgEnds(c, G, ends, T);
  },
  rows(spec) { const s0 = (spec.series || [])[0] || { d: [] }, s1 = (spec.series || [])[1]; return { head: ['generation', s0.label || 'share'].concat(s1 ? [s1.label] : []), rows: s0.d.map((pt, i) => [String(pt[0]), Math.round(spec.pct100 ? pt[1] : 100 * pt[1]) + '%'].concat(s1 && s1.d[i] ? [Math.round(spec.pct100 ? s1.d[i][1] : 100 * s1.d[i][1]) + '%'] : [])) }; },
  say(spec) { const s0 = (spec.series || [])[0]; if (!s0 || !s0.d.length) return ''; const l = s0.d[s0.d.length - 1]; return 'generation ' + l[0] + ': ' + Math.round(spec.pct100 ? l[1] : 100 * l[1]) + '%'; }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.sex = SX_TEXT.take;
  MODEL.sex = 'Mud snails: sexual mothers make half sons, clone mothers only daughters, so a clone doubles its share. Parasite keys infect only matching locks and track the common one. Each zone is a lake of shares; the 40 snails shown stand for it. Locks, broods and clutches are designed numbers.';
  RECALL.sex = { q: 'Clones are 20% of a lake with no parasites. Roughly what share next generation?', opts: [['a', 'About 33%'], ['b', 'About 22%'], ['c', 'About 40%']], ans: 'a', why: 'Twofold rule: 2c ÷ (1 + c) = 0.4 ÷ 1.2 ≈ 33%.' };
  BRIDGE.sex = 'Selection so far acted on genes passed down whole. Why do most animals shuffle them, at twice the cost?';
}
