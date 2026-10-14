/* tests/lint_text.js: words and determinism lint for v2 chapters (API_v2 §1.5, §1.6, §9; D5 decision 15; D4 §3, §2.4).

     node tests/lint_text.js BUILD.html [id[,id…]] [--src DIR] [--json] [--quiet]

   Content (every v2 chapter in the build, or the ids given), loaded headless through tests/vmgame.js:
     budgets   firstWords 40 · hud 15 · whispers 8 · labels 3 · panels 35–60 · interesting 25 · levers 3 · take 20 · body 60 ·
               law.title 4 · boss.inverts 15 · stars.* 15 · why.* 60 per chunk · chips/captions 25 · intro.goal 15 · keys 4
               (a {placeholder} counts as one word)
     sentences ≤ 18 words, in every string of content, intro, plan, levels and teacher prompts
     spelling  British (-ise, colour, behaviour, grey, centre, ageing …)
     agency    D0 §3: variants are selected, populations evolve (no "the moths learned", "you evolved", "genes want")
     science   a few D0 §3 "never" phrases ("mutations are copying errors", "half your genes" …)
     shape     levels 3–6 with minutes; P tags realistic|designed|xN (xN needs real); MODEL cards; stars, sim and bots hooks;
               CVD pairs and the hue lint through CVD.lint when 00_cvd.js is in the build
   Source (v2/*.js; with ids, only the files that define them):
     every file  Math.exp/log/pow/sin/cos/tan/atan2 (and their kin) or a non-integer ** outside a function marked
                 // ghost-only (or // cosmetic for view-only maths); a declaration of URL, Map, Set, Node or Event
     chapters    direct fillText/strokeText (use Lbl.put); Math.random (use R() in the sim, Fx.rnd for looks)
     sim/stars   Math.random, Date.now, performance.now, DOM or view objects inside sim: {…} or stars: {…}
   Exit 1 on any error. Warnings are printed and do not fail. */
'use strict';
const fs = require('fs'), path = require('path');

const BUDGET = { firstWords: 40, hud: 15, whispers: 8, labels: 3, interesting: 25, levers: 3, take: 20, body: 60, 'law.title': 4,
  'boss.inverts': 15, stars: 15, why: 60, chips: 25, captions: 25, panelMin: 35, panelMax: 60, sentence: 18, goal: 15, key: 4, model: 60 };
const CONTENT_KEYS = ['firstWords', 'hud', 'whispers', 'labels', 'panels', 'interesting', 'levers', 'take', 'body', 'law', 'boss', 'stars', 'model', 'why', 'chips', 'captions'];

const plain = s => String(s).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
/* words: whitespace tokens holding a letter or digit; '{n}' counts as one (Txt.words semantics, API_v2 §5.3) */
const words = s => plain(s).split(/\s+/).filter(w => /[A-Za-z0-9À-ɏͰ-Ͽ{]/.test(w)).length;
const sentences = s => plain(s).split(/(?<=[.!?…])\s+(?=[A-Z0-9“"‘(¿¡])/).map(x => x.trim()).filter(Boolean);

/* ---------- British spelling ---------- */
const US = {
  color: 'colour', colors: 'colours', colored: 'coloured', coloring: 'colouring', colorful: 'colourful', colorless: 'colourless', coloration: 'colouration',
  behavior: 'behaviour', behaviors: 'behaviours', behavioral: 'behavioural', favor: 'favour', favors: 'favours', favored: 'favoured', favoring: 'favouring',
  favorite: 'favourite', favorites: 'favourites', favorable: 'favourable', unfavorable: 'unfavourable', honor: 'honour', labor: 'labour', neighbor: 'neighbour',
  neighbors: 'neighbours', neighboring: 'neighbouring', flavor: 'flavour', humor: 'humour', rumor: 'rumour', vapor: 'vapour', odor: 'odour', armor: 'armour',
  armored: 'armoured', harbor: 'harbour', endeavor: 'endeavour', rigor: 'rigour', vigor: 'vigour', tumor: 'tumour', tumors: 'tumours',
  center: 'centre', centers: 'centres', centered: 'centred', theater: 'theatre', fiber: 'fibre', fibers: 'fibres', liter: 'litre', liters: 'litres',
  caliber: 'calibre', somber: 'sombre', specter: 'spectre', luster: 'lustre', maneuver: 'manoeuvre', gray: 'grey', grays: 'greys', grayish: 'greyish',
  mold: 'mould', molds: 'moulds', moldy: 'mouldy', defense: 'defence', defenses: 'defences', offense: 'offence', pretense: 'pretence',
  catalog: 'catalogue', dialog: 'dialogue', analog: 'analogue',
  traveled: 'travelled', traveling: 'travelling', traveler: 'traveller', modeled: 'modelled', modeling: 'modelling', modeler: 'modeller',
  labeled: 'labelled', labeling: 'labelling', canceled: 'cancelled', signaled: 'signalled', signaling: 'signalling', fueled: 'fuelled',
  leveled: 'levelled', leveling: 'levelling', channeled: 'channelled', tunneled: 'tunnelled', totaled: 'totalled', equaled: 'equalled',
  dialed: 'dialled', rivaled: 'rivalled', spiraled: 'spiralled', marveled: 'marvelled', quarreled: 'quarrelled', counseled: 'counselled',
  aging: 'ageing', artifact: 'artefact', artifacts: 'artefacts', esophagus: 'oesophagus', estrogen: 'oestrogen', estrus: 'oestrus',
  hemoglobin: 'haemoglobin', hemophilia: 'haemophilia', hemophiliac: 'haemophiliac', anemia: 'anaemia', leukemia: 'leukaemia', edema: 'oedema',
  paleontology: 'palaeontology', paleontologist: 'palaeontologist', paleozoic: 'Palaeozoic', archeology: 'archaeology', ameba: 'amoeba', amebae: 'amoebae',
  diarrhea: 'diarrhoea', pediatric: 'paediatric', anesthesia: 'anaesthesia', anesthetic: 'anaesthetic', hematology: 'haematology', fecal: 'faecal', feces: 'faeces',
  plow: 'plough', mustache: 'moustache', pajamas: 'pyjamas', skeptic: 'sceptic', skeptical: 'sceptical', skepticism: 'scepticism',
  enroll: 'enrol', fulfill: 'fulfil', skillful: 'skilful', willful: 'wilful', installment: 'instalment', jewelry: 'jewellery', woolen: 'woollen',
  cozy: 'cosy', airplane: 'aeroplane', mom: 'mum', math: 'maths', gotten: 'got', analyze: 'analyse', analyzed: 'analysed', analyzes: 'analyses',
  analyzing: 'analysing', paralyze: 'paralyse', paralyzed: 'paralysed', catalyze: 'catalyse', catalyzed: 'catalysed', hydrolyze: 'hydrolyse'
};
const US_WARN = { toward: 'towards', license: 'licence (noun)', program: 'programme (not software)', practice: 'practise (verb)' };
const IZE_OK = /^(size[sd]?|sizing|sizeable|resize[sd]?|oversized?|undersized?|downsize[sd]?|prize[sd]?|seize[sd]?|seizing|maize|baize|capsize[sd]?|assize[s]?)$/i;
const IZE = /\b([A-Za-z]+)(iz)(e|es|ed|ing|ation|ations|er|ers|able)\b/g;

/* ---------- agency and science phrases (D0 §3) ---------- */
const ORG = '(?:moths?|beetles?|birds?|fish(?:es)?|bacteri(?:a|um)|microbes?|virus(?:es)?|species|populations?|plants?|flowers?|insects?|crabs?|fox(?:es)?|lizards?|rats?|mice|mouse|genes?|alleles?|mutants?|lineages?|variants?|cells?|parasites?|hosts?|peas?|pigeons?|finch(?:es)?|squirrels?|wasps?|flies|cichlids?|snails?|frogs?|guppies|sticklebacks?|warblers?|bats?|prey|predators?)';
const AGENCY = [
  [new RegExp('\\b' + ORG + '\\s+(?:have\\s+|has\\s+|had\\s+)?(?:learn(?:ed|t|s)?|decid(?:e|es|ed)|want(?:s|ed)?|tr(?:y|ies|ied)\\s+to|strive[sd]?|plan(?:s|ned)?\\s+to|intend(?:s|ed)?|aim(?:s|ed)?\\s+to|need(?:s|ed)?\\s+to)\\b', 'i'), 'gives a variant, gene or organism intentions (D0 §3: variants are selected, populations evolve)'],
  [/\b(?:individuals?|an? (?:moth|beetle|bird|fish|plant|animal|organism|fox|rat|crab|bacterium|cell))\s+(?:evolves?|evolved|evolving)\b/i, 'individuals do not evolve; populations do (D0 §3)'],
  [/\byou\s+(?:evolve[sd]?|evolving)\b/i, 'the player is the bird, the weather or the doctor, never the evolving lineage (D2 §14)'],
  [/\b(?:evolv(?:e|es|ed|ing)|adapt(?:s|ed|ing)?)\s+in order to\b/i, 'teleology: "evolved in order to" (D0 §3)'],
  [/\bfor the good of the (?:species|group|population)\b/i, 'group-benefit fallacy'],
  [/\bmutations? (?:are|is) (?:just |simply |only |mostly )?(?:a |random )?copying errors?\b/i, 'D0 §3: mutation is copying errors, DNA damage and faulty repair, all blind to need'],
  [/\bhalf (?:of )?(?:your|their|its|his|her) genes\b/i, 'D0 §3: identity by descent, on average (not "half your genes")'],
  [/\bfiddler crabs?\b[^.]*\bshells?\b/i, 'D0 §3: hermit crabs fight over shells; fiddlers over burrows'],
  [/\bmimics? (?:only )?works? (?:only )?while rare\b/i, 'D0 §3: mimics do best while rare relative to their models'],
  [/\bthe moths learned\b|\bthe beetles learned\b/i, 'D2 §14: never "the moths learned"']
];
const AGENCY_WARN = [[/\b(?:evolv(?:e|es|ed|ing)|adapt(?:ed)?)\s+to\s+(?:survive|escape|avoid|resist|hide|win|beat|outwit)\b/i, 'teleological phrasing ("evolved to resist"); say what was selected']];

function textChecks(str, where, E, W) {
  const s = plain(str);
  for (const sen of sentences(s)) { const n = words(sen); if (n > BUDGET.sentence) E.push(`${where}: sentence of ${n} words > ${BUDGET.sentence}: "${sen.slice(0, 90)}${sen.length > 90 ? '…' : ''}"`); }
  for (const m of s.matchAll(/[A-Za-z]+/g)) {
    const w = m[0], lw = w.toLowerCase();
    if (US[lw]) E.push(`${where}: US spelling "${w}" → ${US[lw]}`);
    else if (US_WARN[lw]) W.push(`${where}: check spelling "${w}" → ${US_WARN[lw]}`);
  }
  for (const m of s.matchAll(IZE)) if (!IZE_OK.test(m[0]) && !US[m[0].toLowerCase()]) E.push(`${where}: US spelling "${m[0]}" → ${m[1]}is${m[3]}`);
  for (const [re, why] of AGENCY) { const m = s.match(re); if (m) E.push(`${where}: "${m[0]}": ${why}`); }
  for (const [re, why] of AGENCY_WARN) { const m = s.match(re); if (m) W.push(`${where}: "${m[0]}": ${why}`); }
  if (/\b(?:undefined|NaN)\b|\[object/.test(s)) E.push(`${where}: literal "undefined", "NaN" or "[object" in text`);
  if (/<[a-z][^>]*>/i.test(String(str))) W.push(`${where}: HTML in a content string (words should be plain text; Lbl and DOM labels escape it)`);
}
function budget(str, max, where, E, min, W) {
  if (typeof str !== 'string') { E.push(`${where}: expected a string, got ${str === null ? 'null' : typeof str}`); return; }
  const n = words(str);
  if (n > max) E.push(`${where}: ${n} words > ${max}: "${plain(str).slice(0, 90)}${str.length > 90 ? '…' : ''}"`);
  if (min && n < min) W.push(`${where}: ${n} words < ${min} (D4: a teaching panel is 35–60 words, one idea)`);
}
const each = (obj, fn) => { if (obj && typeof obj === 'object') for (const k of Object.keys(obj)) fn(obj[k], k); };

function checkParams(list, where, E, W) {
  for (const [k, p] of list) {
    const at = `${where}.${k}`;
    if (!p || typeof p !== 'object') { E.push(`${at}: expected {v, tag, …}`); continue; }
    if (['realistic', 'designed', 'xN'].indexOf(p.tag) < 0) E.push(`${at}: tag "${p.tag}" must be realistic, designed or xN`);
    if (p.tag === 'xN' && (p.real == null || p.real === '')) E.push(`${at}: an xN parameter must say the real value (real)`);
    const v = p.v != null ? p.v : p.value;
    if (typeof v === 'number' && typeof p.min === 'number' && v < p.min) E.push(`${at}: value ${v} < min ${p.min}`);
    if (typeof v === 'number' && typeof p.max === 'number' && v > p.max) E.push(`${at}: value ${v} > max ${p.max}`);
    if (p.label != null) budget(p.label, 4, at + '.label', W, 0, W);
  }
}

/* ---------- one chapter object ---------- */
function lintChapter(ch, o) {
  o = o || {}; const E = [], W = [], id = ch.id, C = ch.content, hunt = ch.mode === 'hunt';
  const T = (s, where) => { if (typeof s === 'string') textChecks(s, where, E, W); };
  if (!ch.intro || !ch.intro.goal) E.push('intro.goal: missing (boot.js requires it; ≤ 15 words)');
  else { budget(ch.intro.goal, BUDGET.goal, 'intro.goal', E); T(ch.intro.goal, 'intro.goal'); }
  if (!C || typeof C !== 'object') E.push('content: missing (all player-facing words live in ch.content, API_v2 §9.2)');
  else {
    for (const k of Object.keys(C)) if (CONTENT_KEYS.indexOf(k) < 0) W.push(`content.${k}: not a content key in API_v2 §9.2 (checked as text only)`);
    if (C.firstWords != null) { budget(C.firstWords, BUDGET.firstWords, 'content.firstWords', E); T(C.firstWords, 'content.firstWords'); } else W.push('content.firstWords: missing (≤ 40 words before the first action)');
    for (const k of ['hud', 'whispers', 'labels', 'interesting', 'levers', 'chips', 'captions'])
      each(C[k], (v, kk) => { budget(v, BUDGET[k], `content.${k}.${kk}`, E); T(v, `content.${k}.${kk}`); });
    if (C.panels != null) {
      if (!Array.isArray(C.panels)) E.push('content.panels: expected [{id, text}]');
      else C.panels.forEach((p, i) => { const at = `content.panels[${i}]${p && p.id ? ' (' + p.id + ')' : ''}`; if (!p || typeof p.text !== 'string') { E.push(at + ': expected {id, text}'); return; } budget(p.text, BUDGET.panelMax, at, E, BUDGET.panelMin, W); T(p.text, at); });
    }
    for (const k of ['take', 'body']) if (C[k] != null) { budget(C[k], BUDGET[k], 'content.' + k, E); T(C[k], 'content.' + k); }
    if (!C.take) W.push('content.take: missing (the end card TAKE, ≤ 20 words)');
    if (C.law) { budget(C.law.title, BUDGET['law.title'], 'content.law.title', E); T(C.law.title, 'content.law.title'); }
    if (C.boss) { budget(C.boss.inverts, BUDGET['boss.inverts'], 'content.boss.inverts', E); T(C.boss.inverts, 'content.boss.inverts'); }
    if (C.stars) for (const k of ['discover', 'predict', 'transfer']) if (C.stars[k] != null) { budget(C.stars[k], BUDGET.stars, 'content.stars.' + k, E); T(C.stars[k], 'content.stars.' + k); }
    if (C.why) for (const k of ['real', 'maths']) {
      const v = C.why[k]; if (v == null) continue;
      (Array.isArray(v) ? v : [v]).forEach((s, i) => { budget(s, BUDGET.why, `content.why.${k}[${i}]`, E); T(s, `content.why.${k}[${i}]`); });
    }
    if (!Array.isArray(C.model) || !C.model.length) E.push('content.model: missing (a MODEL card per level: simulated, simplification, tagged params, cannot, nature, contested, refs)');
    else {
      C.model.forEach((m, i) => {
        const at = `content.model[${i}]`;
        if (!m || typeof m !== 'object') { E.push(at + ': expected an object'); return; }
        if (typeof m.level !== 'number') E.push(at + '.level: a level number is required');
        for (const f of ['simulated', 'simplification', 'cannot', 'nature']) { if (typeof m[f] !== 'string' || !m[f].trim()) E.push(`${at}.${f}: missing`); else { budget(m[f], BUDGET.model, `${at}.${f}`, W); T(m[f], `${at}.${f}`); } }
        if (!Array.isArray(m.params)) E.push(at + '.params: expected [{name, value, tag, real}]'); else checkParams(m.params.map((p, j) => [p && p.name ? p.name : j, p]), at + '.params', E, W);
        if (typeof m.contested !== 'boolean') W.push(at + '.contested: say true or false (contested science gets a pill and no star)');
        if (!Array.isArray(m.refs) || !m.refs.length) W.push(at + '.refs: no reference ids');
      });
      if (!C.model.some(m => m && m.level === 0)) E.push('content.model: no card for level 0 (a card covers its level and the ones after it until the next card)');
    }
  }
  if (ch.plan != null) { if (!Array.isArray(ch.plan) || ch.plan.length !== 2) E.push('plan: expected [title, subtitle]'); else ch.plan.forEach((s, i) => T(s, `plan[${i}]`)); }
  if (!Array.isArray(ch.levels)) E.push('levels: missing (3–6 levels, D5 §3.4)');
  else {
    if (ch.levels.length < 3 || ch.levels.length > 6) E.push(`levels: ${ch.levels.length} levels; a unit has 3–6`);
    ch.levels.forEach((l, i) => {
      const at = `levels[${i}]`;
      if (!l || typeof l.name !== 'string') { E.push(at + '.name: missing'); return; }
      T(l.name, at + '.name'); if (words(l.name) > 4) W.push(`${at}.name: ${words(l.name)} words (level chips read best at ≤ 4)`);
      if (typeof l.minutes !== 'number' || !(l.minutes > 0)) E.push(at + '.minutes: a positive number is required (bots and the monkey budget time from it)');
      if (typeof l.adds !== 'string' || !l.adds.trim()) W.push(at + '.adds: name the one new variable this level adds');
      else if (/\band\b|,|\+|&/.test(l.adds)) W.push(`${at}.adds: "${l.adds}" looks like more than one variable (a level adds exactly one)`);
      if (l.codes != null && !Array.isArray(l.codes)) E.push(at + '.codes: expected an array of concept codes');
    });
  }
  if (ch.P) checkParams(Object.entries(ch.P), 'P', E, W);
  each(ch.keys, (v, k) => { budget(String(v), BUDGET.key, 'keys.' + k, E); T(String(v), 'keys.' + k); });
  if (!ch.keys) W.push('keys: no keyboard map (D4 §8: every action on the keyboard)');
  if (ch.untimed !== true) W.push('untimed: not declared (every timed verb needs an untimed path)');
  if (ch.teacher) { const p = ch.teacher.prompts; if (!Array.isArray(p) || p.length !== 3) W.push('teacher.prompts: expected 3 prompts (rising Bloom level, one a model critique)'); else p.forEach((s, i) => T(s, `teacher.prompts[${i}]`)); }
  else W.push('teacher: no teacher prompts');
  if (!hunt) {
    const st = ch.stars || {};
    for (const k of ['discover', 'predict', 'transfer']) if (typeof st[k] !== 'function') E.push(`stars.${k}: missing function (s, level) → bool`);
    const sim = ch.sim;
    if (!sim) E.push('sim: missing headless simulation (API_v2 §9.3)');
    else {
      for (const k of ['reset', 'step', 'act', 'result', 'actions']) if (typeof sim[k] !== 'function') E.push(`sim.${k}: missing`);
      if (!(sim.dt > 0)) E.push('sim.dt: a positive tick length is required');
      const b = sim.bots || {};
      for (const k of ['alwaysA', 'alwaysB', 'greedy', 'threshold']) if (typeof b[k] !== 'function') W.push(`sim.bots.${k}: missing (bots.py sweeps it)`);
    }
  } else if (!ch.sim) W.push('sim: none (a Hunt chapter; bots and oracles cannot run it headless)');
  if (o.CVD && typeof o.CVD.lint === 'function') {
    if (!Array.isArray(ch.encodings) || !ch.encodings.length) W.push('encodings: none declared (CVD pair lint skipped)');
    else { const r = o.CVD.lint(ch); (r.pairs || []).forEach(p => E.push(`encodings: ${p.a} and ${p.b} differ only by colour and are ΔE ${p.dE} < 8 under ${p.kind}`)); (r.hue || []).forEach(t => E.push(`starTraits: "${t}" is scored but has no non-hue channel in encodings (D4 §2.4 hue lint)`)); }
  }
  return { id, errors: E, warnings: W };
}

/* ---------- source rules ---------- */
function skipper(src) {   // marks string, template, comment characters so brace matching ignores them
  const code = new Uint8Array(src.length); let i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (c === '"' || c === "'" || c === '`') { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; else if (q !== '`' && src[i] === '\n') break; i++; } i++; continue; }
    code[i] = 1; i++;
  }
  return code;
}
function blockEnd(src, code, open) { let depth = 0; for (let i = open; i < src.length; i++) { if (!code[i]) continue; if (src[i] === '{') depth++; else if (src[i] === '}' && --depth === 0) return i; } return src.length; }
function lintSource(file, src, o) {
  o = o || {}; const E = [], W = [], base = path.basename(file), engine = /^(0\d|zz)_/.test(base), code = skipper(src);
  const lineOf = i => src.slice(0, i).split('\n').length;
  const exempt = [];   // [from, to] ranges: functions marked ghost-only or cosmetic
  for (const m of src.matchAll(/\/\/[^\n]*\b(ghost-only|cosmetic)\b|\/\*[^]*?\b(ghost-only|cosmetic)\b[^]*?\*\//g)) {
    const lineStart = src.lastIndexOf('\n', m.index) + 1; let j = lineStart;
    while (j < src.length && !(src[j] === '{' && code[j])) j++;
    exempt.push([lineStart, blockEnd(src, code, j)]);
  }
  const isExempt = i => exempt.some(([a, b]) => i >= a && i <= b);
  const blocks = [];   // deterministic surfaces: sim: {…} and stars: {…}
  for (const m of src.matchAll(/\b(sim|stars)\s*:\s*\{/g)) { if (!code[m.index]) continue; const open = m.index + m[0].length - 1; blocks.push([m[1], open, blockEnd(src, code, open)]); }
  const inBlock = (i, k) => blocks.some(([n, a, b]) => (!k || n === k) && i > a && i < b);
  const at = i => `${base}:${lineOf(i)}`;
  for (const m of src.matchAll(/\bMath\.(exp|expm1|log|log1p|log2|log10|pow|sin|cos|tan|atan2|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|cbrt|hypot)\b/g)) {
    if (!code[m.index] || isExempt(m.index)) continue;
    const soft = m[1] === 'cbrt' || m[1] === 'hypot';
    (soft && !inBlock(m.index) ? W : E).push(`${at(m.index)}: Math.${m[1]} is not bit-exact across browsers; use Det (or mark a view-only function // ghost-only or // cosmetic)`);
  }
  for (const m of src.matchAll(/\*\*\s*(\(?[-\w.]+)/g)) {
    if (!code[m.index] || isExempt(m.index)) continue;
    if (!/^\(?\d+$/.test(m[1])) (/^\(?[\d.]+$/.test(m[1]) || inBlock(m.index) ? E : W).push(`${at(m.index)}: "** ${m[1]}" with a non-integer exponent is not bit-exact; use Det.pow`);
  }
  for (const m of src.matchAll(/^\s*(?:const|let|var|function|class)\s+(URL|Map|Set|Node|Event)\b/gm)) E.push(`${at(m.index)}: never declare ${m[1]} (it shadows the browser global inside the IIFE, API_v2 §1.8)`);
  for (const m of src.matchAll(/\b(fillText|strokeText)\s*\(/g)) { if (!code[m.index] || engine) continue; E.push(`${at(m.index)}: direct ${m[1]}; canvas words go through Lbl.put (D4 §3)`); }
  for (const m of src.matchAll(/\bMath\.random\s*\(/g)) { if (!code[m.index]) continue; (inBlock(m.index) || !engine ? E : W).push(`${at(m.index)}: Math.random; the sim draws from R(), looks from Fx.rnd`); }
  for (const m of src.matchAll(/\b(Date\.now|performance\.now)\s*\(/g)) if (code[m.index] && inBlock(m.index)) E.push(`${at(m.index)}: ${m[1]}() inside sim/stars breaks replays`);
  for (const m of src.matchAll(/\b(document|window|Stage|Fx|HUD|Dock|Strip|Lbl|Whisper|Live|Ghost|Predict|Snd|Snd2|Cards|End)\s*\.|\$\(/g)) if (code[m.index] && inBlock(m.index, 'sim')) E.push(`${at(m.index)}: "${m[0]}" inside sim: {…}; the sim must run headless (no DOM, canvas or view)`);
  if (!engine) for (const m of src.matchAll(/\bR\(\)/g)) if (code[m.index] && !inBlock(m.index) && !isExempt(m.index)) W.push(`${at(m.index)}: R() outside sim: {…}; cosmetic randomness uses Fx.rnd (API_v2 §1.3)`);
  return { file: base, errors: E, warnings: W };
}

/* ---------- CLI ---------- */
function main() {
  const args = process.argv.slice(2), flag = k => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const json = args.indexOf('--json') >= 0, quiet = args.indexOf('--quiet') >= 0;
  for (const f of ['--json', '--quiet']) { const i = args.indexOf(f); if (i >= 0) args.splice(i, 1); }
  const srcDir = flag('--src') || path.join(__dirname, '..', 'v2');
  const html = args[0], ids = args[1] ? args[1].split(',').filter(Boolean) : null;
  if (!html) { console.log('usage: node tests/lint_text.js BUILD.html [id[,id…]] [--src DIR] [--json] [--quiet]'); process.exit(2); }
  const { load } = require('./vmgame');
  const G = load(html), TB = G.TB, REG = TB.REG;
  const v2ids = Object.keys(REG).filter(k => REG[k] && REG[k].v2 === true);
  const want = ids || v2ids, out = [];
  for (const id of want) {
    const ch = REG[id];
    if (!ch) { out.push({ id, errors: [`no chapter "${id}" in this build`], warnings: [] }); continue; }
    if (ch.v2 !== true) { out.push({ id, errors: [`"${id}" is a legacy chapter (v2 !== true); nothing to lint`], warnings: [] }); continue; }
    out.push(lintChapter(ch, { CVD: TB.CVD }));
  }
  const files = fs.existsSync(srcDir) ? fs.readdirSync(srcDir).filter(f => f.endsWith('.js')).sort() : [];
  const srcOut = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(srcDir, f), 'utf8');
    if (ids && !ids.some(id => new RegExp("\\bid\\s*:\\s*['\"]" + id.replace(/[^\w-]/g, '') + "['\"]").test(src))) continue;
    srcOut.push(lintSource(f, src));
  }
  const nE = out.concat(srcOut).reduce((a, r) => a + r.errors.length, 0), nW = out.concat(srcOut).reduce((a, r) => a + r.warnings.length, 0);
  if (json) console.log(JSON.stringify({ chapters: out, sources: srcOut, errors: nE, warnings: nW }, null, 1));
  else {
    for (const r of out.concat(srcOut)) {
      if (!r.errors.length && (quiet || !r.warnings.length)) { if (!quiet) console.log(`${r.id || r.file}: clean`); continue; }
      console.log(`${r.id || r.file}:`);
      r.errors.forEach(e => console.log('  ERROR ' + e));
      if (!quiet) r.warnings.forEach(w => console.log('  warn  ' + w));
    }
    if (!want.length) console.log('(no v2 chapters in this build)');
    console.log(`lint_text: ${out.length} chapter(s), ${srcOut.length} source file(s): ${nE} error(s), ${nW} warning(s)`);
  }
  process.exit(nE ? 1 : 0);
}

module.exports = { lintChapter, lintSource, words, sentences, textChecks, BUDGET };
if (require.main === module) main();
