/* ================= v2/tree.js: Tree Thinking (id 'tree'), the Wave 2 rebuild of legacy ch28 =================
   D3 §4.1 and D2 §4 triage, simplified by D6 (21–22 Oct addenda: own world, opening card, decision 9 "simple beats clever",
   decision 10 "real biology, not symbols").
   World: a Victorian natural-history museum gallery at night. Mahogany cabinets, gas-light, chalk labels and a brass tree of
   life that the curator re-mounts before the doors open. Role: investigator. The tips are real specimens (spirit jars and
   mounts), the traits are drawn on them, and the abstract read-outs (the chalk ledger, the step plaque) sit beside them.
   ONE VERB: tap the brass tree. In L1 you tap a joint to swing its two arms; after that you tap a specimen (to hang the
   newcomer beside it, or to put the root on its branch). Four levels, one idea each:
     L1 Same tree, new look: swing joints until the specimens match the chalk plate. 5 joints give 2⁵ = 32 drawings of one
        tree. The last plate is the "ladder of progress", and the unit's one prediction is its aha (Baum, Smith and Donovan
        2005): in that drawing the frog stands beside the salmon; tap the frog's closer relative.
     L2 Count the changes: Fitch parsimony on four specimens; hang the newcomer where the fewest trait changes are needed
        (sparrow, then the whale with its SINE insertions, Nikaido et al. 1999).
     L3 Look-alikes: convergence versus homology. The bat's wings say "bird" until the other drawers open; the octopus's
        camera eye says "fish".
     L4 Where is the root? (boss, inverts the unit): steps cannot choose a root. An outgroup does, and gains turn into losses.
   Headless sim (R() only for shuffles at reset); stars are pure functions of the final state; juice from Sim.run's events. */

const TT_T = { swing: 0.32, hang: 0.45, root: 0.6, match: 1.25, reveal: 3.4, mounted: 2.2, drawer: 0.65, rooted: 2.0, end: 1.2 };
const TT_PAR = [1, 2, 3];                    // L1: fewest swings for plates 1, 2 and 3 (the ladder); built that way at reset
const TT_L1 = { tips: ['salmon', 'frog', 'lizard', 'sparrow', 'mouse', 'human'], tree: [0, [1, [[2, 3], [4, 5]]]], frog: 1, near: 0, far: 5,
  clade: ['bony', 'tetra', 'amnio', 'rept', 'mamm'] };   // canonical order = the ladder: salmon, frog, lizard, sparrow, mouse, human
// L2 and L3: tip 0 is the newcomer; chars [label key, states per tip, weight (identical characters at separate sites)]
const TT_CASES = [
  [{ id: 'bird', tips: ['sparrow', 'ostrich', 'crocodile', 'lizard'], chars: [['feathers', [1, 1, 0, 0]], ['beak', [1, 1, 0, 0]], ['heart4', [1, 1, 1, 0]]] },
    { id: 'whale', tips: ['whale', 'hippo', 'cow', 'pig'], chars: [['sines', [1, 1, 0, 0], 3], ['sine4', [1, 1, 1, 0]], ['coat', [0, 1, 1, 1]], ['hooves', [0, 1, 1, 1]], ['cud', [0, 0, 1, 0]]] }],
  [{ id: 'bat', tips: ['bat', 'sparrow', 'mouse', 'lizard'], vis0: 1, chars: [['wings', [1, 1, 0, 0]], ['hair', [1, 0, 1, 0]], ['milk', [1, 0, 1, 0]], ['ear3', [1, 0, 1, 0]], ['feathers', [0, 1, 0, 0]]] },
    { id: 'octo', tips: ['octopus', 'limpet', 'salmon', 'lancelet'], chars: [['eye', [1, 0, 1, 0]], ['radula', [1, 1, 0, 0]], ['mantle', [1, 1, 0, 0]], ['noto', [0, 0, 1, 1]], ['cord', [0, 0, 1, 1]]] }]
];
// L4: an unrooted tree (written rooted on the outgroup), the outgroup tip, the wrong root it starts on, and its characters
const TT_ROOTS = [
  { id: 'verts', tips: ['lancelet', 'lamprey', 'salmon', 'frog', 'mouse'], tree: [0, [1, [2, [3, 4]]]], out: 0, start: 4,
    chars: [['skull', [0, 1, 1, 1, 1]], ['jaws', [0, 0, 1, 1, 1]], ['limbs', [0, 0, 0, 1, 1]], ['hair', [0, 0, 0, 0, 1]]] },
  { id: 'snake', tips: ['frog', 'gecko', 'monitor', 'snake'], tree: [0, [1, [2, 3]]], out: 0, start: 3,
    chars: [['legs', [1, 1, 1, 0]], ['scales', [0, 1, 1, 1]], ['fork', [0, 0, 1, 1]]] }
];
const TT_WET = { salmon: 1, frog: 1, lizard: 1, crocodile: 1, octopus: 1, lancelet: 1, lamprey: 1, gecko: 1, monitor: 1, snake: 1 };
// the gallery's paints (D6 decision 7): mahogany, brass, parchment, gas-light green; chalk on slate for the curator's notes
const TT_C = { wall: '#24150F', wall2: '#3A2216', panel: '#4B2B1C', panelL: '#6A3D25', floor: '#1C110C', mahog: '#5C2E1B', mahogL: '#87492B', mahogD: '#2E160D',
  brass: '#C99B3D', brassL: '#F3D88F', brassD: '#73501A', gas: '#CFEFC0', gasG: '#8FD9A0', glow: '#7FD69A', parch: '#EFE3C4', parchD: '#C9B68A',
  slate: '#253029', slateL: '#34423A', chalk: '#EEEBDF', amber: '#E6A94A', fluid: '#D8B062', fluidD: '#A9802F', ink: '#1E140E', warn: '#F0B04E' };

const TT_TEXT = {
  intro: {
    game: 'Night in a Victorian natural-history museum. You are the curator, re-mounting the brass tree of life before the doors open.',
    biology: 'A tree shows who shares a more recent ancestor, not who is “higher”. Parsimony picks the tree needing the fewest trait changes; an outgroup sets the root.',
    how: 'Tap a brass joint to swing it. Later you tap specimens: to hang a newcomer beside one, or to root the tree on it.'
  },
  firstWords: 'Tap a brass joint: its two arms swap sides. Match the chalk plate above the cabinets.',
  hud: {
    plate: 'Plate {i} of 3: tap brass joints until every specimen sits under its chalk.',
    ladder: 'Last plate: the old “ladder of progress”. Swing the brass to match it.',
    match: 'Plate matched. Same tree, new look.',
    ask: 'Here the frog stands by the salmon. Tap the frog’s closer relative.',
    reveal: 'Frog and human share the younger joint. Standing beside is not being closer.',
    hang: 'Tap a specimen to hang the {x} beside it.',
    hung: 'Steps {n}. Each chalk tick is one trait change. Try others, then Mount.',
    drawers: 'The other drawers open: more traits for the same specimens.',
    rehang: 'Steps {n} now. Re-hang the bat if another place needs fewer.',
    mounted: 'Mounted. Fewest steps: the {x} beside the {y}, {n} steps.',
    root: 'Steps {n}. Tap the specimen outside this group to root the tree on it.',
    rootWrong: 'Steps still {n}, but the story changed. Which specimen lies outside the rest?',
    rootHint: 'Steps still {n}. The {o} lies outside this group: tap it.',
    rooted: 'Rooted on the outgroup: gains and losses now read the right way.',
    over: 'The gallery is ready for the morning.'
  },
  whispers: {
    hint: 'The glowing joint needs a swing.', auto: 'The curator swings it for you.', par: 'Matched at par!', rept: 'Birds are reptiles too.',
    pick: 'Tap the salmon or the human.', right: 'Yes: the human.', wrong: 'No: the human is closer.', newc: 'Tap where it should hang.',
    fewer: 'Fewer steps.', more: 'More steps.', same: 'Same steps.', twice: 'Wings needed twice here.', eye: 'Camera eye needed twice here.',
    best: 'The fewest-step tree!', notBest: 'Another tree needs fewer steps.', automount: 'The curator mounts it.', still: 'Steps unchanged. The story flipped.',
    out: 'Rooted on the outgroup!', autoroot: 'The curator roots it.', isRoot: 'The root is already there.'
  },
  labels: {
    salmon: 'salmon', frog: 'frog', lizard: 'lizard', sparrow: 'sparrow', mouse: 'mouse', human: 'human', ostrich: 'ostrich', crocodile: 'crocodile',
    whale: 'whale', hippo: 'hippo', cow: 'cow', pig: 'pig', bat: 'bat', octopus: 'octopus', limpet: 'limpet', lancelet: 'lancelet', lamprey: 'lamprey',
    gecko: 'gecko', monitor: 'monitor lizard', snake: 'snake',
    feathers: 'feathers', beak: 'toothless beak', heart4: 'four-chambered heart', sines: 'SINEs 1–3', sine4: 'SINE 4', hair: 'hair', coat: 'coat of hair', hooves: 'hooves',
    cud: 'chews the cud', wings: 'wings', milk: 'milk', ear3: 'three ear bones', eye: 'camera eye', radula: 'radula', mantle: 'mantle',
    noto: 'notochord', cord: 'dorsal nerve cord', skull: 'skull', jaws: 'jaws', limbs: 'four limbs', legs: 'legs', scales: 'scaly skin', fork: 'deeply forked tongue',
    bony: 'bony vertebrates', tetra: 'tetrapods', amnio: 'amniotes', rept: 'reptiles', mamm: 'mammals',
    steps: 'Steps {n}', stepsQ: 'Steps ?', fewest: 'fewest wins', anyRoot: 'on every root', drawings: '2⁵ = 32', oneTree: 'drawings, one tree',
    par: 'par {p}', swings: 'swings {n}', younger: 'younger joint', older: 'older joint', newc: 'new arrival', root: 'root', outgroup: 'outgroup',
    gain: '+ {t}', loss: '− {t}', times: '×{w}', twice: '×2', matched: 'Plate matched', mounted: 'Mounted', fewestB: 'Fewest steps!', rooted: 'Rooted',
    drawer: 'drawer', tSwings: 'Swings per plate', tSteps: 'Steps per tree', tRoot: 'Steps per root', stepsAx: 'steps', swingsAx: 'swings',
    sSwings: 'Swings', sPar: 'Par', sDraw: 'Drawings, one tree', sSteps: 'Steps', sBest: 'Fewest steps', sTrees: 'Possible trees', sRoots: 'Roots tried',
    plate: 'plate {i}', you: 'yours', parL: 'par', bestL: 'fewest'
  },
  panels: [],
  interesting: {
    ladder: 'You picked the salmon. The ladder drawing put it beside the frog, but the frog and the human share the younger joint.',
    swings: 'You used {sw} swings where {par} would do. Each joint needs at most one swing per plate.',
    hooves: 'You mounted the whale by the {y}. A coat and hooves cost one step on any tree. The SINEs shared with the hippo decide it.',
    wings: 'Wings alone hung the bat by the sparrow. Three other traits then outvoted them: wings arose twice.',
    notFooled: 'You hung the bat by the mouse even with only wings in view. The other drawers agreed.',
    eye: 'The octopus by the salmon? Its camera eye looks like a fish’s, but four traits say limpet.',
    wrong: 'You moved the root {w} times. The steps never changed; only the story of gains and losses did.'
  },
  levers: {},
  take: 'A tree records shared ancestors. Spins change nothing, the fewest changes pick the tree, and an outgroup sets the root.',
  body: 'Wherever the root went, the steps stayed the same. Parsimony cannot place a root; an outgroup can. Rooted on the lancelet, skull, jaws, limbs and hair are each gained once. Rooted on the mouse, they read as losses. The root even decides who is whose sister. Rooted on the frog, snakes lost their legs.',
  law: { title: 'Read the joints' },
  boss: { inverts: 'Steps chose every tree. They cannot choose the root: only an outgroup can.' },
  stars: {
    discover: 'Swing near par, mount the fewest-step trees and root on outgroups.',
    predict: 'Pick the frog’s closer relative while the ladder drawing tempts you.',
    transfer: 'Hang the octopus by its true sister at the first try.'
  },
  levelStars: [
    { discover: 'Match all three plates within three swings of par.', predict: 'Pick the frog’s closer relative in the ladder drawing.',
      here: 'Earned here. The unit’s Discover star lights once three of four levels earn it.' },
    { discover: 'Mount both newcomers on the fewest-step tree.' },
    { discover: 'End both cases on the fewest-step tree.', transfer: 'Hang the octopus by its true sister at the first try.' },
    { discover: 'Root each tree on its outgroup within two taps.' }
  ],
  levelTake: [
    'Swinging a joint changes the picture, not the tree. Read relatedness from the joints, never from tip order.',
    'Parsimony: the tree that needs the fewest trait changes is the best guess. Shared new traits do the work.',
    'Look-alikes mislead. Many independent traits outvote one convergent trait, such as wings or camera eyes.'
  ],
  levelBody: [
    'You used {sw} swings; par was {par}. Every plate showed the same tree: five joints give 2⁵ = 32 drawings. The ladder put the frog beside the salmon, yet the frog shares a younger joint with the human. Read trees by their joints, not by neighbours.',
    'The sparrow hangs by the ostrich, and the whale by the hippo. There, shared traits need one change each; elsewhere they need two. A trait shared by three costs one step on every tree, so it says nothing. You mounted {right} of 2 on the fewest-step tree.',
    'Wings alone put the bat by the sparrow. Hair, milk and three ear bones put it by the mouse, so wings arose twice. Those three are homologies, inherited from one ancestor. The octopus eye is a camera like a fish’s, built separately. You ended {right} of 2 on the fewest-step tree.'
  ],
  captions: {
    liveSwing: 'Joint swung. {m} of 6 specimens match.', liveMatch: 'Plate matched in {n} swings.', liveAsk: 'Tap the salmon or the human.',
    liveHang: 'Hung by the {y}: {n} steps.', liveRoot: 'Rooted on the {y}: still {n} steps.',
    mSwings: 'Swings used on this plate.', mPar: 'The fewest swings that match the plate.', mDraw: 'Five joints, two ways each: 2⁵.',
    mSteps: 'Trait changes this tree needs.', mBest: 'Steps on the best of the three trees.', mTrees: 'Four specimens can be joined three ways.', mRoots: 'Places you have put the root.'
  },
  model: [
    { level: 0, simulated: 'A fixed tree of six living vertebrates. A swing swaps the two branches at one joint; the joints never change.', simplification: 'Branch lengths are left out: the joints show only the order of splits. Six specimens stand for millions of species.', params: [{ name: 'specimens', value: 6, tag: 'designed' }, { name: 'drawings of one tree', value: 32, tag: 'realistic', real: '2⁵ for five joints' }], cannot: 'How long ago each split happened, or how much each lineage changed.', nature: 'Many readers misread trees by tip order, or as ladders of progress. Students are no exception (Baum, Smith and Donovan 2005; Gregory 2008; Meir et al. 2007).', contested: false, refs: ['baum2005', 'gregory2008', 'meir2007'] },
    { level: 1, simulated: 'Fitch parsimony on four specimens. Each trait is present or absent, and steps are the fewest changes a tree needs.', simplification: 'A handful of traits stands for a whole data set, and every change counts the same. The three SINE insertions are three separate sites.', params: [{ name: 'traits per case', value: '3 to 7', tag: 'designed' }, { name: 'insertions shared only by whale and hippo', value: 3, tag: 'realistic', real: 'several loci (Nikaido et al. 1999)' }], cannot: 'Changes that are more likely than others, or likelihood and Bayesian methods.', nature: 'A SINE insertion at the same site very rarely arises twice. Shared insertions showed hippos are the closest living relatives of whales (Nikaido, Rooney and Okada 1999).', contested: false, refs: ['fitch1971', 'nikaido1999', 'springer2021'] },
    { level: 2, simulated: 'The same parsimony, with one convergent trait in each case. Wings in bats and birds; camera eyes in octopus and fish.', simplification: 'Each case has one misleading trait among five; real data sets hold more. Salmon count as having a notochord: they do as embryos.', params: [{ name: 'traits per case', value: 5, tag: 'designed' }, { name: 'convergent traits per case', value: 1, tag: 'designed' }], cannot: 'Long-branch attraction, where fast-changing lineages share many chance matches (Felsenstein 1978).', nature: 'Bat wings are skin on long fingers; bird wings are feathers on the arm. The arm bones are homologous; flight arose twice. Octopus optic nerves leave behind the retina, so there is no blind spot (Land and Nilsson 2012).', contested: false, refs: ['land2012', 'ogura2004', 'felsenstein1978'] },
    { level: 3, simulated: 'The same unrooted tree, rooted on whichever branch you tap. Steps are counted again, and gains and losses are read from the root.', simplification: 'The outgroup is given. In real studies it comes from other evidence, often many genes.', params: [{ name: 'steps on every root', value: '4 and 3', tag: 'realistic', real: 'unrooted parsimony ignores the root' }], cannot: 'Rooting by a molecular clock, or an outgroup that is itself misplaced.', nature: 'Lancelets lie outside the vertebrates (Delsuc et al. 2006). Fossil snakes such as Najash kept hind legs, so snakes lost their legs (Apesteguía and Zaher 2006).', contested: false, refs: ['delsuc2006', 'az2006', 'pyron2013'] }
  ],
  why: {
    real: [
      'Relatedness is read from the most recent common ancestor, not from the order of the tips. Tips can be swung around any joint (Baum, Smith and Donovan 2005). Every living tip is equally modern: none is an ancestor of another.',
      'Parsimony prefers the tree with the fewest changes (Fitch 1971). Rare, complex changes such as SINE insertions are strong evidence. They joined whales to hippos (Nikaido, Rooney and Okada 1999).',
      'Convergence makes unrelated lineages look alike: wings in bats and birds, camera eyes in octopuses and fish. Independent traits that agree, such as hair, milk and ear bones, reveal the history.',
      'An unrooted tree says who groups with whom, not which way time ran. An outgroup, known from other evidence to lie outside, roots it. Fossil snakes with legs show snakes lost theirs (Apesteguía and Zaher 2006).'
    ],
    maths: [
      'A tree with n tips has n − 1 joints. Each joint can be drawn two ways, so one tree has 2ⁿ⁻¹ drawings: 32 for six tips.',
      'Four specimens can be joined three ways. A trait split two against two costs one step on the tree that pairs them. It costs two on the others. A trait shared by three costs one everywhere.',
      'Total steps are summed over traits. The bat by the mouse needs 6 steps; by the sparrow, 8. Wings cost 2 there: one change in bats, one in birds.',
      'Fitch counts on an unrooted tree, so every root gives the same total. The root only decides which end of each change is old. A gain read one way is a loss read the other.'
    ]
  }
};

/* ---------- trees: pure helpers shared by the sim, the stars, the bots and the oracle ---------- */
const TT = {
  nodes(tree) {   // internal nodes in preorder: [[childRef, childRef]…]; a ref is {t: tip} or {n: node}
    const out = [], walk = n => { if (typeof n === 'number') return { t: n }; const i = out.length; out.push(null); const a = walk(n[0]), b = walk(n[1]); out[i] = [a, b]; return { n: i }; };
    walk(tree); return out;
  },
  tipsOf(N, r) { if (r.t != null) return [r.t]; const k = N[r.n]; return this.tipsOf(N, k[0]).concat(this.tipsOf(N, k[1])); },
  order(N, flip, r) { r = r || { n: 0 }; if (r.t != null) return [r.t]; const k = N[r.n], a = this.order(N, flip, k[0]), b = this.order(N, flip, k[1]); return flip[r.n] ? b.concat(a) : a.concat(b); },
  key(tips) { return tips.slice().sort((a, b) => a - b).join('.'); },
  // Fitch parsimony on a rooted binary tree (nested arrays of tip indices). pref: the root's state when the root set is
  // ambiguous. Returns the steps and where each change falls: {k: the child's clade key, s: the state it changes to}.
  fitch(tree, v, pref) {
    let steps = 0; const ch = [];
    const down = n => { if (typeof n === 'number') return { m: 1 << v[n], t: [n] }; const a = down(n[0]), b = down(n[1]); let m = a.m & b.m; if (!m) { m = a.m | b.m; steps++; } return { m, t: a.t.concat(b.t), a, b }; };
    const root = down(tree), pick = (m, p) => ((m >> p) & 1 ? p : m & 1 ? 0 : 1);
    const up = (d, st) => { if (!d.a) return; for (const c of [d.a, d.b]) { const cs = pick(c.m, st); if (cs !== st) ch.push({ k: this.key(c.t), s: cs }); up(c, cs); } };
    up(root, pick(root.m, pref || 0));
    return { steps, ch };
  },
  // the same unrooted tree, rooted on tip r's branch: [r, the rest]
  reroot(tree, r) {
    const adj = {}; let nid = 1000;
    const link = (a, b) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); };
    const build = n => { if (typeof n === 'number') return n; const id = nid++; link(id, build(n[0])); link(id, build(n[1])); return id; };
    const top = build(tree), xy = adj[top]; adj[xy[0]] = adj[xy[0]].map(q => (q === top ? xy[1] : q)); adj[xy[1]] = adj[xy[1]].map(q => (q === top ? xy[0] : q)); delete adj[top];
    const grow = (n, from) => { if (n < 1000) return n; const k = adj[n].filter(q => q !== from); return [grow(k[0], n), grow(k[1], n)]; };
    return [r, grow(adj[r][0], r)];
  },
  pair(sis) { const o = [1, 2, 3].filter(i => i !== sis); return [[0, sis], o]; },   // four specimens, the newcomer (tip 0) beside sis
  // steps of a four-specimen case with the newcomer beside sis, counting the first vis characters (weights count separate sites)
  steps4(C, sis, vis) { let n = 0; const T = this.pair(sis); C.chars.slice(0, vis == null ? C.chars.length : vis).forEach(ch => { n += (ch[2] || 1) * this.fitch(T, ch[1], 0).steps; }); return n; },
  best4(C, vis) { let b = 1, bn = 1e9; for (const t of [1, 2, 3]) { const n = this.steps4(C, t, vis); if (n < bn) { bn = n; b = t; } } return { sis: b, n: bn }; },
  stepsRoot(R0, r) { const T = this.reroot(R0.tree, r); let n = 0; for (const ch of R0.chars) n += this.fitch(T, ch[1], ch[1][r]).steps; return n; },
  // L4's drawing: the rerooted tree with a seeded flip per joint (the root's own two arms stay: the root tip on the left)
  flipT(T, fl) { let i = 0; const go = (n, top) => { if (typeof n === 'number') return n; const k = i++, a = go(n[0], false), b = go(n[1], false); return !top && fl[k % fl.length] ? [b, a] : [a, b]; }; return go(T, true); },
  rootView(R0, r, fl) { const T = this.flipT(this.reroot(R0.tree, r), fl), ord = []; const walk = n => { if (typeof n === 'number') ord.push(n); else { walk(n[0]); walk(n[1]); } }; walk(T); return { T, ord }; },
  ham(a, b) { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; }
};
const TT_N1 = TT.nodes(TT_L1.tree);

const CH_TREE_V2 = {
  id: 'tree', v2: true, role: 'investigator', place: 'warren', accent: '#4F8F78',   // gas-light green: the chapter's chrome tint (D6 decision 7)
  plan: ['Tree Thinking', 'Reading the tree of life'],
  intro: { goal: 'Re-mount the brass tree of life; read it by its joints.' },
  content: TT_TEXT,
  P: {
    tips: { v: 6, tag: 'designed', min: 4, max: 6, label: 'specimens, first tree' }
  },
  levels: [
    { name: 'Same tree, redrawn', adds: 'joints that swing', codes: ['A1'], minutes: 2 },
    { name: 'Count the changes', adds: 'traits counted as steps', codes: ['A1'], minutes: 2 },
    { name: 'Look-alikes', adds: 'a convergent trait', codes: ['A1'], minutes: 2 },
    { name: 'Find the root', adds: 'an outgroup', codes: ['A1'], minutes: 1.5 }
  ],
  keys: { ArrowLeft: 'previous joint or specimen', ArrowRight: 'next joint or specimen', Space: 'tap the lit one', Enter: 'mount the tree' },
  teacher: { prompts: ['Swing the ladder drawing so the human stands on the far left. What changed about who is related to whom?', 'Why does a trait shared by three of four specimens tell you nothing about which tree is right?', 'This model counts every change the same. Which real traits should count for more, and why?'], pool: 'trace' },
  untimed: true,   // no timed verb: every tap waits for the player
  starTraits: [],
  encodings: [   // chalk ticks: one change white; a trait needing two changes amber, and its row also prints the number 2
    { k: 'tick', rgb: [238, 235, 223], channels: ['luminance'] },
    { k: 'twice', rgb: [240, 176, 78], channels: ['luminance', 'pattern'] }
  ],
  // the unit's stars (API_v2 §14.1): Discover on three of four levels; Predict from L1's frog; Transfer from L3's octopus
  unitStars(lv) {
    const has = (i, b) => !!((lv[i] || 0) & b), d = [0, 1, 2, 3].filter(i => has(i, 1)).length;
    return (d >= 3 ? 1 : 0) | (has(0, 2) ? 2 : 0) | (has(2, 4) ? 4 : 0);
  },

  /* ================= headless simulation (API_v2 §9.3): R() at reset only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    reset(level, o) {
      const s = { level, phase: 'play', pt: 0, t: 0, ci: 0, log: [] };
      if (level === 0) {
        // plates: the ladder is the canonical drawing (all joints unswung); plate 2 sits 3 swings from it, plate 1 two from
        // plate 2, and the brass starts one swing from plate 1, so par is 1, 2, 3 (TT_PAR)
        const p3 = [0, 0, 0, 0, 0], p2 = p3.slice(); for (const b of this.shuffle([0, 1, 2, 3, 4]).slice(0, 3)) p2[b] = 1;
        const p1 = p2.slice(); for (const b of this.shuffle([0, 1, 2, 3, 4]).slice(0, 2)) p1[b] ^= 1;
        const pick = this.shuffle([0, 1, 2, 3, 4]); let sb = pick[0]; for (const b of pick) { const st = p1.slice(); st[b] ^= 1; if (st.some(x => x)) { sb = b; break; } }
        const st = p1.slice(); st[sb] ^= 1;
        Object.assign(s, { flip: st, plates: [p1, p2, p3], plate: 0, sw: 0, swTot: 0, swBy: [0, 0, 0], auto: [0, 0, 0], pick: -1, hint: -1, last: -1 });
      } else if (level <= 2) {
        s.cs = TT_CASES[level - 1].map(C => ({ id: C.id, ord: this.shuffle([1, 2, 3]), sis: -1, vis: C.vis0 || C.chars.length, hangs: 0, first: -1, mounts: [], tried: {}, auto: 0 }));
      } else {
        s.rc = TT_ROOTS.map(C => { const fl = []; for (let i = 0; i < 6; i++) fl.push(R() < 0.5 ? 1 : 0); return { id: C.id, root: C.start, taps: 0, done: false, auto: 0, fl, tried: [C.start] }; });
      }
      this.s = s;
    },
    C(s) { return TT_CASES[s.level - 1][s.ci]; },
    c(s) { return s.cs[s.ci]; },
    R0(s) { return TT_ROOTS[s.ci]; },
    r(s) { return s.rc[s.ci]; },
    matched(s) { return TT.ham(s.flip, s.plates[s.plate]) === 0; },
    nMatch(s) { const a = TT.order(TT_N1, s.flip), b = TT.order(TT_N1, s.plates[Math.min(2, s.plate)]); let m = 0; for (let i = 0; i < 6; i++) if (a[i] === b[i]) m++; return m; },
    firstWrong(s) { const p = s.plates[Math.min(2, s.plate)]; for (let i = 0; i < 5; i++) if (s.flip[i] !== p[i]) return i; return -1; },
    stepsNow(s) { const c = this.c(s); return c.sis > 0 ? TT.steps4(this.C(s), c.sis, c.vis) : null; },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; s.pt += dt; const ph = s.phase;
      if (ph === 'anim') { if (s.pt >= s.animT) { s.phase = 'play'; s.pt = 0; ev.push({ k: 'ready' }); } }
      else if (ph === 'match') {
        if (s.pt >= TT_T.match) {
          s.pt = 0; s.sw = 0; s.hint = -1;
          if (s.plate < 2) { s.plate++; s.phase = 'play'; ev.push({ k: 'plate', i: s.plate }); }
          else { s.phase = 'ask'; ev.push({ k: 'ask' }); }
        }
      }
      else if (ph === 'reveal') { if (s.pt >= TT_T.reveal) { s.phase = 'end'; s.pt = 0; } }
      else if (ph === 'drawers') {
        const c = this.c(s), C = this.C(s);
        if (s.pt >= TT_T.drawer) { s.pt = 0; c.vis++; if (c.sis > 0) c.tried[c.sis + '.' + c.vis] = this.stepsNow(s); ev.push({ k: 'drawer', row: c.vis - 1, n: this.stepsNow(s) }); if (c.vis >= C.chars.length) { s.phase = 'play'; ev.push({ k: 'rehang' }); } }
      }
      else if (ph === 'mounted') { if (s.pt >= TT_T.mounted) this.nextCase(s, ev, s.cs.length); }
      else if (ph === 'rooted') { if (s.pt >= TT_T.rooted) this.nextCase(s, ev, s.rc.length); }
      else if (ph === 'end') { if (s.pt >= TT_T.end) { s.phase = 'over'; ev.push({ k: 'over' }); } }
      return ev;
    },
    nextCase(s, ev, n) { s.pt = 0; if (s.ci + 1 < n) { s.ci++; s.phase = 'play'; ev.push({ k: 'case', i: s.ci }); } else { s.phase = 'end'; ev.push({ k: 'done' }); } },
    anim(s, t) { s.phase = 'anim'; s.pt = 0; s.animT = t; },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (s.level === 0) {
        if (a.k === 'swing' && s.phase === 'play') {
          const n = a.n | 0; if (n < 0 || n > 4) return ev;
          s.flip[n] ^= 1; s.sw++; s.swTot++; s.swBy[s.plate]++; s.last = n;
          ev.push({ k: 'swing', n, m: this.nMatch(s) });
          if (this.matched(s)) { s.phase = 'match'; s.pt = 0; s.hint = -1; ev.push({ k: 'matched', i: s.plate, sw: s.swBy[s.plate], par: TT_PAR[s.plate] }); return ev; }
          if (s.sw >= TT_PAR[s.plate] + 12) {   // a stuck curator is helped: the brass swings itself into the plate (no Discover)
            s.flip = s.plates[s.plate].slice(); s.auto[s.plate] = 1; s.phase = 'match'; s.pt = 0; s.hint = -1;
            ev.push({ k: 'auto' }, { k: 'matched', i: s.plate, sw: s.swBy[s.plate], par: TT_PAR[s.plate], auto: true }); return ev;
          }
          if (s.sw >= TT_PAR[s.plate] + 4) s.hint = this.firstWrong(s);
          this.anim(s, TT_T.swing);
        } else if (a.k === 'pick' && s.phase === 'ask') {
          const t = a.t | 0; if (t !== TT_L1.near && t !== TT_L1.far) return ev;
          s.pick = t; s.phase = 'reveal'; s.pt = 0; ev.push({ k: 'picked', t, right: t === TT_L1.far });
        }
        return ev;
      }
      if (s.level <= 2) {
        if (s.phase !== 'play') return ev;
        const c = this.c(s), C = this.C(s);
        if (a.k === 'hang') {
          const t = a.t | 0; if (t < 1 || t > 3 || t === c.sis) return ev;
          const before = this.stepsNow(s); c.sis = t; c.hangs++; if (c.first < 0) c.first = t;
          const n = this.stepsNow(s); c.tried[t + '.' + c.vis] = n;
          ev.push({ k: 'hang', t, n, before });
          if (c.hangs >= 14) { ev.push({ k: 'automount' }); return ev.concat(this.mount(s)); }
          this.anim(s, TT_T.hang);
        } else if (a.k === 'mount' && c.sis > 0) return ev.concat(this.mount(s));
        return ev;
      }
      if (a.k === 'root' && s.phase === 'play') {
        const r = this.r(s), R0 = this.R0(s), t = a.t | 0; if (t < 0 || t >= R0.tips.length || t === r.root) return ev;
        r.root = t; r.taps++; if (r.tried.indexOf(t) < 0) r.tried.push(t);
        ev.push({ k: 'root', t, n: TT.stepsRoot(R0, t), out: t === R0.out });
        if (t === R0.out) { r.done = true; s.phase = 'rooted'; s.pt = 0; ev.push({ k: 'rooted' }); return ev; }
        if (r.taps >= 8) { r.root = R0.out; r.done = true; r.auto = 1; s.phase = 'rooted'; s.pt = 0; ev.push({ k: 'autoroot' }, { k: 'root', t: R0.out, n: TT.stepsRoot(R0, R0.out), out: true }, { k: 'rooted' }); return ev; }
        this.anim(s, TT_T.root);
      }
      return ev;
    },
    mount(s) {
      const c = this.c(s), C = this.C(s), n = TT.steps4(C, c.sis, c.vis), b = TT.best4(C, c.vis);
      c.mounts.push({ sis: c.sis, vis: c.vis, n, best: b.n });
      const ev = [{ k: 'mount', n, best: b.n, sis: c.sis, bsis: b.sis, ok: n === b.n }];
      if (c.vis < C.chars.length) { s.phase = 'drawers'; s.pt = 0; ev.push({ k: 'drawers' }); }
      else { s.phase = 'mounted'; s.pt = 0; if (n !== b.n) c.shown = b.sis; }
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_TREE_V2.stars, n = s.level, mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: this.outcome(s), interesting: this.interesting(s) };
    },
    outcome(s) {
      if (s.level === 0) return { swings: s.swTot, par: 6, pick: s.pick };
      if (s.level <= 2) return { right: this.right(s) };
      return { taps: s.rc.map(r => r.taps) };
    },
    right(s) { let k = 0; s.cs.forEach((c, i) => { const m = c.mounts[c.mounts.length - 1], C = TT_CASES[s.level - 1][i]; if (m && m.vis === C.chars.length && m.n === TT.best4(C).n) k++; }); return k; },
    interesting(s) {   // chosen from what happened (lessons rule 6)
      if (s.level === 0) { if (s.pick === TT_L1.near) return 'ladder'; if (s.swTot > 6 + 6) return 'swings'; return null; }
      if (s.level === 1) { const w = s.cs[1], m = w.mounts[w.mounts.length - 1]; if (m && m.sis !== 1) return 'hooves'; return null; }
      if (s.level === 2) {
        const b = s.cs[0], m0 = b.mounts[0], o = s.cs[1];
        if (o.mounts.some(m => m.sis === 2)) return 'eye';
        if (m0 && m0.vis === 1 && m0.sis === 1) return 'wings';
        if (m0 && m0.vis === 1 && m0.sis === 2) return 'notFooled';
        return null;
      }
      const w = s.rc.reduce((a, r) => a + Math.max(0, r.taps - 1), 0); return w >= 1 ? 'wrong' : null;
    },
    iVars(s) {
      if (s.level === 0) return { sw: s.swTot, par: 6 };
      if (s.level === 1) { const w = s.cs[1], m = w.mounts[w.mounts.length - 1]; return { y: CH_TREE_V2.content.labels[TT_CASES[0][1].tips[m ? m.sis : 1]] }; }
      if (s.level === 3) return { w: s.rc.reduce((a, r) => a + Math.max(0, r.taps - 1), 0) };
      return {};
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.level === 0) {
        if (s.phase === 'play') for (let n = 0; n < 5; n++) out.push({ k: 'swing', n });
        else if (s.phase === 'ask') out.push({ k: 'pick', t: TT_L1.near }, { k: 'pick', t: TT_L1.far });
        return out;
      }
      if (s.level <= 2) { if (s.phase !== 'play') return out; const c = this.c(s); for (const t of c.ord) if (t !== c.sis) out.push({ k: 'hang', t }); if (c.sis > 0) out.push({ k: 'mount' }); return out; }
      if (s.phase !== 'play') return out;
      const r = this.r(s), R0 = this.R0(s); for (const t of TT.rootView(R0, r.root, r.fl).ord) if (t !== r.root) out.push({ k: 'root', t }); return out;   // left to right, as drawn
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    bots: {
      alwaysA(s, acts) { return acts[0] || null; },               // the first joint / first specimen in view / the salmon
      alwaysB(s, acts) { return acts[acts.length - 1] || null; },  // the last joint / mount at once / the last specimen
      greedy(s, acts) {   // what looks right: the first wrong joint; hangs by what shares the most visible traits; picks the salmon (the neighbour); roots on the leftmost tip
        if (!acts.length) return null; const S = CH_TREE_V2.sim;
        if (s.level === 0) { if (s.phase === 'ask') return { k: 'pick', t: TT_L1.near }; const w = S.firstWrong(s); return { k: 'swing', n: w < 0 ? 0 : w }; }
        if (s.level <= 2) { const c = S.c(s), C = S.C(s); if (c.sis > 0) return { k: 'mount' }; let b = 1, bn = -1; for (const t of [1, 2, 3]) { let m = 0; C.chars.slice(0, c.vis).forEach(ch => { if (ch[1][0] && ch[1][t]) m++; }); if (m > bn) { bn = m; b = t; } } return { k: 'hang', t: b }; }
        return acts[0];   // the leftmost specimen after the current root
      },
      threshold(s, acts) {   // swings joints in turn; hangs by each specimen once, then mounts the last; roots by walking the tips
        if (!acts.length) return null; const S = CH_TREE_V2.sim;
        if (s.level === 0) { if (s.phase === 'ask') return { k: 'pick', t: TT_L1.far }; return { k: 'swing', n: s.swTot % 5 }; }
        if (s.level <= 2) { const c = S.c(s); return c.hangs >= 3 ? { k: 'mount' } : { k: 'hang', t: c.ord[c.hangs % 3] === c.sis ? c.ord[(c.hangs + 1) % 3] : c.ord[c.hangs % 3] }; }
        return acts[0];
      },
      ladder(s, acts) {   // reads the tree as a ladder: picks the neighbour, roots on the tip at the "top" (the last specimen)
        if (!acts.length) return null; const S = CH_TREE_V2.sim;
        if (s.level === 0) { if (s.phase === 'ask') return { k: 'pick', t: TT_L1.near }; return S.bots.expert(s, acts); }
        if (s.level <= 2) return S.bots.lookalike(s, acts);
        return acts[acts.length - 1];   // the rightmost specimen: the 'top' of the drawing
      },
      lookalike(s, acts) {   // trusts the first trait in view (wings, the camera eye): hangs where it matches, then mounts
        if (!acts.length) return null; const S = CH_TREE_V2.sim;
        if (s.level === 0) return S.bots.expert(s, acts);
        if (s.level <= 2) { const c = S.c(s), C = S.C(s); if (c.sis > 0) return { k: 'mount' }; const v = C.chars[0][1]; let t = 1; for (const q of [1, 2, 3]) if (v[q] === v[0]) { t = q; break; } return { k: 'hang', t }; }
        return S.bots.expert(s, acts);
      },
      expert(s, acts) {   // skilled play (oracle only): every star the unit offers
        if (!acts.length) return null; const S = CH_TREE_V2.sim;
        if (s.level === 0) { if (s.phase === 'ask') return { k: 'pick', t: TT_L1.far }; return { k: 'swing', n: S.firstWrong(s) }; }
        if (s.level <= 2) { const c = S.c(s), C = S.C(s), b = TT.best4(C, c.vis).sis; return c.sis === b ? { k: 'mount' } : { k: 'hang', t: b }; }
        return { k: 'root', t: S.R0(s).out };
      }
    }
  },

  /* ---- stars: pure functions of the final state (API_v2 §9.1). No level offers all three (L1 D+P, L2 D, L3 D+T, L4 D). ---- */
  stars: {
    discover: (s, n) => {
      if (n === 0) return s.swTot <= 6 + 3 && !s.auto.some(x => x);
      if (n <= 2) return CH_TREE_V2.sim.right(s) === s.cs.length && s.cs.every(c => !c.auto);
      return s.rc.every(r => r.done && !r.auto && r.taps <= 2);
    },
    predict: (s, n) => n === 0 && s.pick === TT_L1.far,
    transfer: (s, n) => n === 2 && s.cs[1].first === TT.best4(TT_CASES[1][1]).sis
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–9 swings or steps · 10–12 right cases · 13–15 the L1 pick / first hangs
  resultBits(s, level) {
    const r = this.sim.result(), m = r ? r.mask & 7 : 0;
    if (level === 0) return m | (Math.min(127, s.swTot) << 3) | ((s.pick === TT_L1.far ? 1 : s.pick === TT_L1.near ? 2 : 0) << 13);
    if (level <= 2) return m | (this.sim.right(s) << 10) | (((s.cs[1].first | 0) & 3) << 13) | (((s.cs[0].first | 0) & 3) << 15);
    return m | (Math.min(7, s.rc[0].taps) << 10) | (Math.min(7, s.rc[1].taps) << 13);
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {}); this.level = n; this._ended = false; this._pend = false; this._dockSig = ''; this._said = {};
    Sim.start(this, n, o);
    this.v = { t: 0, x: {}, lift: {}, glow: [], banner: null, sig: '', bgSig: '', focus: 0, pulse: {}, tick: {}, label: null, revealT: -1, rows: 0, keyHit: 0 };
    this._cab = {}; this.layout(); this.snapTips(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: this.levels[n].name, t: 0, ms: Math.max(1100, ms + 300) }; });
    if (typeof Ghost !== 'undefined') {   // the hand demonstrates the level's tap once
      const s = this.sim.s;
      if (n === 0) Ghost.show({ verb: 'tap', at: () => { const J = this.joints(); const w = this.sim.firstWrong(this.sim.s); const j = J[w < 0 ? 0 : w]; return j ? [j.x, j.y] : [Stage.w / 2, Stage.h / 2]; }, until: () => this.sim.s.swTot > 0 });
      else if (n <= 2) Ghost.show({ verb: 'tap', at: () => { const c = this.sim.c(this.sim.s), t = c.ord[2], p = this.tipXY(t); return [p[0], p[1]]; }, until: () => { const ss = this.sim.s; return !ss.cs || ss.cs[0].hangs > 0 || ss.ci > 0; } });
      else Ghost.show({ verb: 'tap', at: () => { const r = this.sim.r(this.sim.s), R0 = this.sim.R0(this.sim.s); let t = 1; for (let q = 1; q < R0.tips.length; q++) if (q !== r.root && q !== R0.out) { t = q; break; } const p = this.tipXY(t); return [p[0], p[1]]; }, until: () => { const ss = this.sim.s; return !ss.rc || ss.rc[0].taps > 0 || ss.ci > 0; } });
      void s;
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  onResize() { if (this.v) { this.v.hudMax = 0; this.layout(); this.snapTips(); } },
  lab(k) { return this.content.labels[k] || k; },

  /* ---------- what is on show: tips, their order, the tree drawn ---------- */
  tipNames() {
    const s = this.sim.s;
    if (s.level === 0) return TT_L1.tips;
    if (s.level <= 2) return this.sim.C(s).tips;
    return this.sim.R0(s).tips;
  },
  // the drawn tree as nested arrays of tip indices plus a left-to-right order. L2/L3 before the hang: a star of three
  shape() {
    const s = this.sim.s;
    if (s.level === 0) return { kind: 'rooted', tree: TT_L1.tree, order: TT.order(TT_N1, s.flip) };
    if (s.level <= 2) {
      const c = this.sim.c(s), sis = c.sis > 0 ? c.sis : (s.phase === 'mounted' && c.shown ? c.shown : -1);
      const shownSis = s.phase === 'mounted' && c.shown ? c.shown : sis;
      if (shownSis < 0) return { kind: 'star', order: [0].concat(c.ord) };
      return { kind: 'pair', sis: shownSis, tree: TT.pair(shownSis), order: this.pairOrder(c, shownSis) };
    }
    const r = this.sim.r(s), R0 = this.sim.R0(s), V = TT.rootView(R0, r.root, r.fl);
    return { kind: 'rooted', tree: V.T, order: V.ord, rootTip: r.root };
  },
  pairOrder(c, sis) {   // the newcomer beside its sister on one fork; the other two on the other fork; the fewest moves from the slots in view
    const prev = this.v && this.v.order ? this.v.order : [0].concat(c.ord), o = [1, 2, 3].filter(i => i !== sis), opts = [];
    for (const L of [[0, sis], [sis, 0]]) for (const Rr of [[o[0], o[1]], [o[1], o[0]]]) { opts.push(L.concat(Rr)); opts.push(Rr.concat(L)); }
    let best = opts[0], bd = 1e9; for (const a of opts) { let d = 0; for (let i = 0; i < 4; i++) d += Math.abs(i - prev.indexOf(a[i])) * (a[i] === 0 ? 0.2 : 1); if (d < bd) { bd = d; best = a; } }
    return best;
  },

  /* ---------- geometry (canvas px) ---------- */
  hudH() {   // cosmetic: the HUD's real bottom on the canvas (it wraps on a phone), the most this level has needed
    let h = (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56;
    try { const el = document.getElementById('hud'), cv = Stage.cv; if (el && cv && el.offsetParent !== null) { const a = cv.getBoundingClientRect(), b = el.getBoundingClientRect(); if (b.height > 0) h = Math.max(h, b.bottom - a.top); } } catch (e) { }
    if (this.v) { this.v.hudMax = Math.max(this.v.hudMax || 0, Math.round(h)); return this.v.hudMax; }
    return Math.round(h);
  },
  geo() {
    const s = this.sim.s, W = Stage.w, H = Stage.h, n = this.tipNames().length, k = W + 'x' + H + 'x' + this.hudH() + 'x' + s.level + 'x' + n;
    if (this._g && this._g.k === k) return this._g;
    const top = this.hudH() + 40, lv = s.level,   // a lane under the HUD for the whisper (it always sits there)
      sw = Math.min(lv === 0 ? 118 : 150, (W - 16) / n), x0 = (W - sw * n) / 2;
    const cw = Math.round(Math.min(sw - (n > 5 ? 8 : 14), lv === 0 ? 96 : 116)), chh = Math.round(cw * (lv === 0 ? 1.0 : 0.98));
    const g = { k, W, H, n, sw, x0, cw, chh, top, lv };
    g.slate = lv === 0 ? Math.round(Math.max(34, cw * 0.62)) : 0;
    g.cabY = top + (lv === 0 ? g.slate + 10 : 2);
    g.labY = g.cabY + chh + 11;
    g.tipY = g.labY + 13;
    const foot = H - 8;
    if (lv === 0) { g.rootY = Math.min(foot - 72, g.tipY + Math.max(140, (foot - g.tipY) * 0.78)); g.plaqueY = Math.min(foot - 16, g.rootY + 58); }
    else if (lv <= 2) {
      g.treeH = Math.round(Math.max(56, Math.min(150, (H - g.tipY) * 0.3, H - g.tipY - 226))); g.barY = g.tipY + g.treeH;   // room below for five ledger rows and the plaque
      g.ledY = g.barY + 18; g.wide = x0 >= 120; g.rh = Math.round(Math.max(g.wide ? 24 : 30, Math.min(38, (foot - 56 - g.ledY) / 7)));
      g.plaqueY = foot - 22;
    } else { g.rootY = foot - 76; g.plaqueY = foot - 16; }
    this._g = g; return g;
  },
  layout() { this._g = null; this.v.bgSig = ''; },
  slotX(i) { const g = this.geo(); return g.x0 + g.sw * (i + 0.5); },
  snapTips() { const sh = this.shape(); this.v.order = sh.order.slice(); this.v.x = {}; sh.order.forEach((t, i) => { this.v.x[t] = this.slotX(i); }); this.v.shapeSig = JSON.stringify(sh.order); },
  tipX(t) { const x = this.v.x[t]; return x == null ? this.slotX(Math.max(0, this.v.order.indexOf(t))) : x; },
  tipXY(t) { const g = this.geo(); return [this.tipX(t), g.cabY + g.chh / 2 - (this.v.lift[t] || 0)]; },
  // joint positions for a rooted tree (L1, L4): x the middle of its children, y by the tips it holds
  layoutRooted(tree, g, y0, y1) {
    const n = g.n, J = [], E = [];   // J: joints in preorder {x, y, tips, kids}; E: edges {k (child clade key), x0, y0, x1, y1, tips}
    const place = (node, depth) => {
      if (typeof node === 'number') return { x: this.tipX(node), y: y0, tips: [node] };
      const i = J.length; J.push(null);
      const a = place(node[0], depth + 1), b = place(node[1], depth + 1), tips = a.tips.concat(b.tips);
      const y = y0 + (y1 - y0) * (tips.length - 1) / Math.max(1, n - 1), x = (a.x + b.x) / 2, j = { x, y, tips, a, b, i };
      J[i] = j; for (const c of [a, b]) E.push({ k: TT.key(c.tips), x0: x, y0: y, x1: c.x, y1: c.y, tips: c.tips });
      return j;
    };
    const root = place(tree, 0); return { J, E, root };
  },
  joints() {   // L1: the five joints in TT_N1 preorder (the sim's node indices)
    const g = this.geo(), L = this.layoutRooted(this.orientedL1(), g, g.tipY, g.rootY); return L.J;
  },
  orientedL1() { const s = this.sim.s, go = r => { if (r.t != null) return r.t; const k = TT_N1[r.n], a = go(k[0]), b = go(k[1]); return s.flip[r.n] ? [b, a] : [a, b]; }; return go({ n: 0 }); },

  /* ---------- update: Sim.run → juice; tip slides; end ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    const sh = this.shape(), sig = JSON.stringify(sh.order);
    if (sig !== v.shapeSig) { v.shapeSig = sig; v.order = sh.order.slice(); v.from = {}; for (const t of sh.order) v.from[t] = this.tipX(t); v.slide = 0; v.slideMs = s.level === 3 ? 0.55 : 0.34; }
    if (v.slide != null) {   // cosmetic: specimens swing along an arc to their new slots
      v.slide = Math.min(1, v.slide + dt / v.slideMs); const p = v.slide, e = p < 0.5 ? 4 * p * p * p : 1 - (2 - 2 * p) * (2 - 2 * p) * (2 - 2 * p) / 2;
      v.order.forEach((t, i) => { const a = v.from[t], b = this.slotX(i); v.x[t] = a + (b - a) * e; v.lift[t] = Math.abs(b - a) > 2 ? 4 * p * (1 - p) * Math.min(26, Math.abs(b - a) * 0.25) : 0; });
      if (v.slide >= 1) { v.slide = null; v.lift = {}; }
    }
    for (let i = v.glow.length - 1; i >= 0; i--) { v.glow[i].t += dt; if (v.glow[i].t > v.glow[i].d) v.glow.splice(i, 1); }
    for (const k in v.pulse) { v.pulse[k] -= dt; if (v.pulse[k] <= 0) delete v.pulse[k]; }
    if (v.label) { v.label.t += dt; if (v.label.t > 1.4) v.label = null; }
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (s.phase === 'reveal') v.revealT = (v.revealT < 0 ? 0 : v.revealT) + dt; else v.revealT = -1;
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, final = n === this.levels.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (o.interesting) { C.interesting.now = Txt.f(C.interesting[o.interesting], this.sim.iVars(s)); o.interesting = 'now'; }   // the engine shows the text as is
    const V = { sw: s.swTot || 0, par: 6, right: s.cs ? this.sim.right(s) : 0 };
    if (!final) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); } else { o.take = C.take; o.body = C.body; o.bodyFirst = true; }
    o.stars = (r.mask & 1) ? Object.assign({}, C.levelStars[n], { discover: C.levelStars[0].here }) : C.levelStars[n];
    const spec = this.chartSpec(true); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {   // cosmetic (view-only maths)
    const s = this.sim.s, v = this.v, g = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, L = C.labels;
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    const live = t => { if (typeof Live !== 'undefined') Live.say(t); };
    if (e.k === 'swing') {
      const J = this.joints(), j = J[e.n]; if (!j) return;
      v.glow.push({ tips: j.tips, t: 0, d: 0.9 }); v.label = { text: L[TT_L1.clade[e.n]], x: j.x, y: j.y, t: 0 };
      snd('tock', j.x, j.y); if (F) { F.ring(j.x, j.y, 18, { ms: 220, ink: TT_C.brassL }); F.burst('spark', j.x, j.y, 5, { ink: TT_C.brassL }); }
      if (e.n === 3 && this.once('rept')) this.whisper('rept');
      live(Txt.f(C.captions.liveSwing, { m: e.m }));
      if (s.hint >= 0 && this.once('hint' + s.plate)) this.whisper('hint');
    }
    else if (e.k === 'matched') {
      for (let i = 0; i < 6; i++) { const x = this.slotX(i); if (F) F.burst('spark', x, g.top + g.slate / 2, 4, { ink: TT_C.gasG }); }
      if (F) F.tier(2, () => { v.banner = { text: L.matched, t: 0, ms: 1100 }; });
      snd('interesting', g.W / 2, g.top + g.slate / 2);
      if (!e.auto && e.sw <= e.par) this.whisper('par');
      live(Txt.f(C.captions.liveMatch, { n: e.sw }));
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'auto') this.whisper('auto');
    else if (e.k === 'ask') { this.whisper('pick'); live(C.captions.liveAsk); for (const t of [TT_L1.near, TT_L1.far]) { const p = this.tipXY(t); if (F) F.ring(p[0], p[1], g.cw * 0.6, { ms: 600, ink: TT_C.gasG }); } }
    else if (e.k === 'picked') {
      const p = this.tipXY(e.t); this.whisper(e.right ? 'right' : 'wrong'); snd(e.right ? 'interesting' : 'tock', p[0], p[1]);
      if (F) { F.ring(p[0], p[1], g.cw * 0.7, { ms: 500, ink: e.right ? TT_C.gasG : TT_C.warn }); if (e.right) F.burst('spark', p[0], p[1], 8, { ink: TT_C.gasG }); }
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'hang') {
      const p = this.tipXY(e.t); snd('tock', p[0], p[1]); if (F) F.ring(p[0], p[1], g.cw * 0.55, { ms: 260, ink: TT_C.brassL });
      v.tick = { t: v.t };
      if (e.before != null) this.whisper(e.n < e.before ? 'fewer' : e.n > e.before ? 'more' : 'same');
      const c = this.sim.c(s), C2 = this.sim.C(s); if (C2.id === 'bat' && c.vis === C2.chars.length) { const w = TT.fitch(TT.pair(e.t), C2.chars[0][1], 0).steps; if (w === 2 && this.once('twice')) this.whisper('twice'); }
      if (C2.id === 'octo' && e.t !== 2 && this.once('eye')) this.whisper('eye');
      live(Txt.f(C.captions.liveHang, { y: L[C2.tips[e.t]], n: e.n }));
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'mount') {
      const x = g.W / 2, y = g.barY; snd(e.ok ? 'interesting' : 'tock', x, y);
      if (F) { F.ring(x, y, 40, { ms: 500, ink: e.ok ? TT_C.gasG : TT_C.warn }); if (e.ok) { F.burst('spark', x, y, 10, { ink: TT_C.brassL }); } F.tier(2, () => { v.banner = { text: e.ok ? L.fewestB : L.mounted, t: 0, ms: 1100 }; }); }
      const c = this.sim.c(s), C2 = this.sim.C(s); if (c.vis === C2.chars.length) this.whisper(e.ok ? 'best' : 'notBest');
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'automount') this.whisper('automount');
    else if (e.k === 'drawer') { const y = this.rowY(e.row); snd('swish', g.W / 2, y); if (F) { F.burst('dust', g.W / 2, y, 8); F.ring(g.W * 0.2, y, 14, { ms: 240 }); } if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); }
    else if (e.k === 'rehang') { const c = this.sim.c(s); if (TT.fitch(TT.pair(c.sis), this.sim.C(s).chars[0][1], 0).steps === 2) this.whisper('twice'); }
    else if (e.k === 'root') {
      const p = this.tipXY(e.t); snd('tock', p[0], p[1]); if (F) { F.ring(p[0], p[1], g.cw * 0.55, { ms: 300, ink: e.out ? TT_C.gasG : TT_C.brassL }); F.shake(2, 120); }
      if (!e.out) this.whisper('still');
      v.pulse.steps = 1.2; live(Txt.f(C.captions.liveRoot, { y: L[this.sim.R0(s).tips[e.t]], n: e.n }));
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'rooted') { const x = g.W / 2, y = g.rootY; snd('interesting', x, y); if (F) { F.burst('spark', x, y, 10, { ink: TT_C.gasG }); F.tier(2, () => { v.banner = { text: L.rooted, t: 0, ms: 1100 }; }); } if (!this.sim.r(s).auto) this.whisper('out'); }
    else if (e.k === 'autoroot') this.whisper('autoroot');
    else if (e.k === 'case' || e.k === 'plate') { this._cab = {}; v.order = null; this._g = null; this.snapTips(); if (F) F.ring(g.W / 2, g.cabY + g.chh / 2, 30, { ms: 300 }); snd('swish', g.W / 2, g.cabY); if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); }
    else if (e.k === 'done' || e.k === 'over') { if (F) F.ring(g.W / 2, g.H / 2, 30, { ms: 300 }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'tt-' + k); },

  /* ---------- input: one verb, a tap; keys walk a lit target ---------- */
  targets() {   // what a tap can act on now: [{x, y, r, a}] (a: the action)
    const s = this.sim.s, g = this.geo(), out = [];
    if (s.level === 0) {
      if (s.phase === 'play') { this.joints().forEach((j, n) => out.push({ x: j.x, y: j.y, a: { k: 'swing', n } })); }
      else if (s.phase === 'ask') for (const t of [TT_L1.near, TT_L1.far]) { const p = this.tipXY(t); out.push({ x: p[0], y: p[1], a: { k: 'pick', t }, tip: t }); }
      return out;
    }
    if (s.phase !== 'play') return out;
    if (s.level <= 2) { const c = this.sim.c(s); for (const t of c.ord) if (t !== c.sis) { const p = this.tipXY(t); out.push({ x: p[0], y: p[1], a: { k: 'hang', t }, tip: t }); } return out; }
    const r = this.sim.r(s), R0 = this.sim.R0(s); for (let t = 0; t < R0.tips.length; t++) if (t !== r.root) { const p = this.tipXY(t); out.push({ x: p[0], y: p[1], a: { k: 'root', t }, tip: t }); }
    return out;
  },
  tap(x, y) {   // cosmetic: view-only hit-testing
    const s = this.sim.s, g = this.geo(); if (y < this.hudH()) return;
    if (s.level === 0 && s.phase === 'play') {   // the nearest joint; a tap on a cabinet swings the joint above that specimen
      const J = this.joints(); let bi = -1, bd = 1e9;
      J.forEach((j, n) => { const d = Math.hypot(j.x - x, j.y - y); if (d < bd) { bd = d; bi = n; } });
      if (y < g.tipY + 4) { const ord = TT.order(TT_N1, s.flip), i = Math.max(0, Math.min(5, Math.floor((x - g.x0) / g.sw))), t = ord[i]; let pn = -1; TT_N1.forEach((k, n) => { if (k.some(q => q.t === t)) pn = n; }); if (pn >= 0) { bi = pn; bd = 0; } }
      if (bi >= 0 && bd < Math.max(60, g.sw * 0.9)) Sim.act(this, { k: 'swing', n: bi });
      return;
    }
    if (s.level === 0 && s.phase === 'ask') { const t = this.tipAt(x, y); if (t === TT_L1.near || t === TT_L1.far) Sim.act(this, { k: 'pick', t }); else if (t >= 0) this.whisper('pick'); return; }
    if (s.phase !== 'play') return;
    const t = this.tipAt(x, y); if (t < 0) return;
    if (s.level <= 2) { const c = this.sim.c(s); if (t === 0) { this.whisper('newc'); return; } if (t === c.sis) return; Sim.act(this, { k: 'hang', t }); return; }
    const r = this.sim.r(s); if (t === r.root) { this.whisper('isRoot'); return; } Sim.act(this, { k: 'root', t });
  },
  tipAt(x, y) {   // the specimen whose column holds the tap, above the ledger or the plinth
    const g = this.geo(), s = this.sim.s; if (y < g.top - 4) return -1;
    if (s.level >= 1 && s.level <= 2 && y > g.ledY - 6) return -1;
    if (y > g.H - 8) return -1;
    let bt = -1, bd = 1e9; for (const t of this.v.order || []) { const d = Math.abs(this.tipX(t) - x); if (d < bd) { bd = d; bt = t; } }
    return bd <= g.sw * 0.55 ? bt : -1;
  },
  onKey(k, e) {
    const T = this.targets(); if (!T.length) { if (k === 'Enter') this.mountKey(); return; }
    const v = this.v; v.focus = ((v.focus % T.length) + T.length) % T.length;
    if (k === 'ArrowRight' || k === 'ArrowDown') { v.focus = (v.focus + 1) % T.length; v.keyHit = v.t; }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { v.focus = (v.focus + T.length - 1) % T.length; v.keyHit = v.t; }
    else if (k === ' ' || k === 'Spacebar') { if (e && e.repeat) return; Sim.act(this, T[v.focus].a); v.keyHit = v.t; }
    else if (k === 'Enter') { if (this.sim.s.level >= 1 && this.sim.s.level <= 2 && this.sim.c(this.sim.s).sis > 0) this.mountKey(); else { Sim.act(this, T[v.focus].a); v.keyHit = v.t; } }
  },
  mountKey() { const s = this.sim.s; if (s.level >= 1 && s.level <= 2 && s.phase === 'play' && this.sim.c(s).sis > 0) Sim.act(this, { k: 'mount' }); },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels; let sig = s.phase + '|' + s.level;
    if (s.level >= 1 && s.level <= 2) sig += '|' + this.sim.c(s).sis + '|' + s.ci;
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.level >= 1 && s.level <= 2 && (s.phase === 'play' || s.phase === 'anim')) {
      const c = this.sim.c(s);
      Dock.set([{ id: 'tt-mount', label: 'Mount', key: 'Enter', primary: true, disabled: !(c.sis > 0), why: this.content.whispers.newc, fn: () => this.mountKey() }]);
      return;
    }
    Dock.set([]); void L;
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; let t, num = '';
    if (s.phase === 'end' || s.phase === 'over') t = C.over;
    else if (s.level === 0) {
      if (s.phase === 'ask') t = C.ask; else if (s.phase === 'reveal') t = C.reveal; else if (s.phase === 'match') t = C.match;
      else if (s.plate === 0 && s.swTot === 0) t = this.content.firstWords;
      else t = s.plate === 2 ? C.ladder : Txt.f(C.plate, { i: s.plate + 1 });
      if (s.phase === 'play' || s.phase === 'anim') num = Txt.f(L.par, { p: TT_PAR[s.plate] });
    } else if (s.level <= 2) {
      const c = this.sim.c(s), C2 = this.sim.C(s), n = this.sim.stepsNow(s);
      if (s.phase === 'drawers') t = C.drawers;
      else if (s.phase === 'mounted') { const b = TT.best4(C2); t = Txt.f(C.mounted, { x: L[C2.tips[0]], y: L[C2.tips[b.sis]], n: b.n }); }
      else if (c.sis < 0) t = Txt.f(C.hang, { x: L[C2.tips[0]] });
      else if (C2.vis0 && c.mounts.length) t = Txt.f(C.rehang, { n });
      else t = Txt.f(C.hung, { n });
      num = n == null ? L.stepsQ : Txt.f(L.steps, { n });
    } else {
      const r = this.sim.r(s), R0 = this.sim.R0(s), n = TT.stepsRoot(R0, r.root);
      if (s.phase === 'rooted') t = C.rooted; else if (r.taps >= 2) t = Txt.f(C.rootHint, { n, o: L[R0.tips[R0.out]] }); else if (r.taps > 0) t = Txt.f(C.rootWrong, { n }); else t = Txt.f(C.root, { n, o: L[R0.tips[R0.out]] });
      num = Txt.f(L.steps, { n });
    }
    const sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g);
    if (s.level === 0) this.drawSlates(c, g);
    this.drawTree(c, g);
    this.drawCabinets(c, g);
    if (s.level >= 1 && s.level <= 2) this.drawLedger(c, g);
    this.drawPlaque(c, g);
    this.drawFocus(c, g);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('tt-banner', v.banner.text, W / 2, g.tipY + 30, { size: 22, bg: TT_C.parch }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached: panelled mahogany walls, tall cabinets, gas sconces, parquet
    const sig = g.k; if (!this._bg || this.v.bgSig !== sig) { this._bg = this._bg || Layer(g.W, g.H); this._bg.resize(g.W, g.H); this._bg.redraw(cc => this.paintBg(cc, g)); this.v.bgSig = sig; }
    this._bg.blit(c, 0, 0);
  },
  paintBg(c, g) {   // cosmetic
    const W = g.W, H = g.H, rnd = rng(1858);
    let gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1A0F0A'); gr.addColorStop(0.55, TT_C.wall2); gr.addColorStop(1, TT_C.wall); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    // tall back cabinets with faint shelves and jars
    const nC = Math.max(3, Math.round(W / 190)), cwid = W / nC;
    for (let i = 0; i < nC; i++) {
      const x = i * cwid + cwid * 0.12, w = cwid * 0.76, y = H * 0.1, h = H * 0.8;
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + 4, y + 6, w, h);
      c.fillStyle = TT_C.mahogD; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(201,155,61,.18)'; c.lineWidth = 1; c.strokeRect(x + 3, y + 3, w - 6, h - 6);
      c.fillStyle = 'rgba(160,200,170,.035)'; c.fillRect(x + 6, y + 6, w - 12, h - 12);
      for (let k = 1; k < 6; k++) { const sy = y + h * k / 6; c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 6, sy, w - 12, 3); c.fillStyle = 'rgba(201,155,61,.10)'; c.fillRect(x + 6, sy - 1, w - 12, 1);
        for (let j = 0; j < 4; j++) { const jx = x + 12 + rnd() * (w - 30), jh = 10 + rnd() * 14, jw = 7 + rnd() * 8; c.fillStyle = 'rgba(216,176,98,' + (0.05 + rnd() * 0.07).toFixed(3) + ')'; rrect(c, jx, sy - jh, jw, jh, 2); c.fill(); } }
      c.strokeStyle = 'rgba(255,255,255,.04)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + w * 0.2, y + 10); c.lineTo(x + w * 0.05, y + h * 0.5); c.stroke();
    }
    // gas sconces: warm-green pools of light
    for (const fx of [0.08, 0.92]) {
      const x = W * fx, y = H * 0.16, R = Math.max(W, H) * 0.42;
      const rg = c.createRadialGradient(x, y, 4, x, y, R); rg.addColorStop(0, 'rgba(207,239,192,.30)'); rg.addColorStop(0.25, 'rgba(160,214,150,.10)'); rg.addColorStop(1, 'rgba(160,214,150,0)');
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
      c.fillStyle = TT_C.brassD; c.fillRect(x - 2, y + 6, 4, 16); c.fillStyle = TT_C.brass; c.beginPath(); c.arc(x, y + 22, 5, 0, TAU); c.fill();
      c.fillStyle = 'rgba(230,250,220,.9)'; c.beginPath(); c.ellipse(x, y, 6, 9, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y - 1, 10, 13, 0, 0, TAU); c.stroke();
    }
    // wainscot and parquet
    const fy = H * 0.9; c.fillStyle = TT_C.panel; c.fillRect(0, fy - 10, W, 10); c.fillStyle = 'rgba(201,155,61,.25)'; c.fillRect(0, fy - 10, W, 1.5);
    c.fillStyle = TT_C.floor; c.fillRect(0, fy, W, H - fy);
    c.strokeStyle = 'rgba(120,70,40,.25)'; c.lineWidth = 1; for (let x = -H; x < W; x += 22) { c.beginPath(); c.moveTo(x, H); c.lineTo(x + (H - fy), fy); c.stroke(); }
    const vg = c.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  },

  /* ---- L1: the chalk plate, one slate above each cabinet ---- */
  drawSlates(c, g) {   // cosmetic
    const s = this.sim.s, tgt = TT.order(TT_N1, s.plates[Math.min(2, s.plate)]), cur = TT.order(TT_N1, s.flip), hide = s.phase === 'ask' || s.phase === 'reveal' || s.phase === 'end' || s.phase === 'over';
    const y = g.top, h = g.slate;
    c.save(); c.fillStyle = TT_C.mahogD; rrect(c, g.x0 + 2, y - 3, g.sw * g.n - 4, h + 6, 6); c.fill(); c.restore();
    for (let i = 0; i < 6; i++) {
      const x = this.slotX(i), w = g.sw - 6, ok = tgt[i] === cur[i] && !(this.v.slide != null);
      c.fillStyle = TT_C.slate; rrect(c, x - w / 2, y, w, h, 4); c.fill();
      c.strokeStyle = ok && !hide ? TT_C.gasG : 'rgba(238,235,223,.18)'; c.lineWidth = ok && !hide ? 2 : 1; c.stroke();
      if (!hide) this.art(c, TT_L1.tips[tgt[i]], x, y + h / 2, Math.min(w, h * 1.5) * 0.42, 'chalk', ok ? TT_C.gasG : TT_C.chalk);
      else if (s.phase !== 'ask') { c.fillStyle = 'rgba(238,235,223,.12)'; c.fillRect(x - w * 0.3, y + h / 2 - 1, w * 0.6, 2); }
    }
  },

  /* ---- the brass tree ---- */
  drawTree(c, g) {
    const s = this.sim.s, sh = this.shape();
    if (sh.kind === 'rooted') {
      const y1 = g.rootY, L = this.layoutRooted(sh.tree, g, g.tipY, y1); this._lay = L;
      // the root stand: a mahogany plinth and a short brass trunk
      this.plinth(c, L.root.x, y1, g);
      this.rod(c, L.root.x, y1, L.root.x, y1 + 18, g);
      const lit = this.litTips();
      for (const e of L.E) this.rod(c, e.x0, e.y0, e.x1, e.y1, g, lit && e.tips.every(t => lit.indexOf(t) >= 0) ? lit.ink : null);
      if (s.level === 0) this.revealPaths(c, g, L);
      L.J.forEach((j, n) => this.knob(c, j.x, j.y, g, s.level === 0 && s.hint === n ? 1 : 0));
      if (s.level === 3) this.drawChanges(c, g, L);
      if (s.level === 3) Lbl.put('tt-root', this.lab('root'), L.root.x, y1 + 30, { size: 12, bg: TT_C.slate, ink: TT_C.chalk });
      if (this.v.label && s.level === 0) { const lb = this.v.label, a = lb.t < 0.15 ? lb.t / 0.15 : lb.t > 1.1 ? Math.max(0, (1.4 - lb.t) / 0.3) : 1; c.save(); c.globalAlpha = a; Lbl.put('tt-clade', lb.text, lb.x, lb.y - 22, { size: 13, bg: TT_C.slate, ink: TT_C.gas }); c.restore(); }
      return;
    }
    if (sh.kind === 'star') {
      const t3 = sh.order.slice(1), xs = t3.map(t => this.tipX(t)), jx = (xs[0] + xs[1] + xs[2]) / 3, jy = g.barY;
      for (let i = 0; i < 3; i++) this.rod(c, jx, jy, xs[i], g.tipY, g);
      this.knob(c, jx, jy, g, 0);
      const p = this.tipXY(0); Lbl.put('tt-new', this.lab('newc'), p[0], g.tipY + 10, { size: 12, bg: TT_C.amber });
      return;
    }
    // a pair tree: two forks joined by a brass bar (unrooted: no trunk)
    const o = this.v.order, xA = (this.tipX(o[0]) + this.tipX(o[1])) / 2, xB = (this.tipX(o[2]) + this.tipX(o[3])) / 2, y = g.barY;
    for (let i = 0; i < 4; i++) this.rod(c, i < 2 ? xA : xB, y, this.tipX(o[i]), g.tipY, g);
    this.rod(c, xA, y, xB, y, g);
    this.knob(c, xA, y, g, 0); this.knob(c, xB, y, g, 0);
    const L = { E: [] }, mid = (xA + xB) / 2, A = TT.key([o[0], o[1]]), B = TT.key([o[2], o[3]]);
    for (let i = 0; i < 4; i++) L.E.push({ k: String(o[i]), x0: i < 2 ? xA : xB, y0: y, x1: this.tipX(o[i]), y1: g.tipY });
    L.E.push({ k: A, x0: mid, y0: y, x1: xA, y1: y }, { k: B, x0: mid, y0: y, x1: xB, y1: y });
    this._lay = L; this.drawTicks(c, g, L, sh);
  },
  litTips() {   // L1: the clade lit by the last swing (gas-light green); L1 ask: nothing
    const v = this.v; if (!v.glow.length) return null; const gl = v.glow[v.glow.length - 1], a = Math.max(0, 1 - gl.t / gl.d);
    const r = gl.tips.slice(); r.ink = 'rgba(143,217,160,' + (0.35 + 0.6 * a).toFixed(3) + ')'; return r;
  },
  rod(c, x0, y0, x1, y1, g, glow) {   // cosmetic: a brass rod (shadow, body, highlight)
    const w = Math.max(3, Math.min(7, g.sw * 0.06));
    c.save(); c.lineCap = 'round';
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x0 + 1.5, y0 + 2); c.lineTo(x1 + 1.5, y1 + 2); c.stroke();
    if (glow) { c.strokeStyle = glow; c.lineWidth = w + 8; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
    c.strokeStyle = TT_C.brassD; c.lineWidth = w + 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = TT_C.brass; c.lineWidth = w - 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = 'rgba(243,216,143,.8)'; c.lineWidth = Math.max(1, w * 0.3); c.beginPath(); c.moveTo(x0 - 0.8, y0 - 0.8); c.lineTo(x1 - 0.8, y1 - 0.8); c.stroke();
    c.restore();
  },
  knob(c, x, y, g, hint) {   // cosmetic: a brass joint with a rivet; a hinted joint glows and pulses
    const r = Math.max(6, Math.min(11, g.sw * 0.1)), v = this.v;
    if (hint) { const p = 0.5 + 0.5 * Det.sin(v.t * 6); c.fillStyle = 'rgba(143,217,160,' + (0.25 + 0.35 * p).toFixed(3) + ')'; c.beginPath(); c.arc(x, y, r * 2.4, 0, TAU); c.fill(); }
    const gr = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); gr.addColorStop(0, TT_C.brassL); gr.addColorStop(0.6, TT_C.brass); gr.addColorStop(1, TT_C.brassD);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.arc(x + 1.5, y + 2, r, 0, TAU); c.fill();
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = TT_C.brassD; c.lineWidth = 1; c.stroke();
    c.fillStyle = TT_C.brassD; c.beginPath(); c.arc(x, y, r * 0.28, 0, TAU); c.fill();
  },
  plinth(c, x, y, g) {   // cosmetic: the mahogany stand the rooted tree grows from
    const w = Math.max(70, Math.min(150, g.W * 0.24)), h = 22;
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x - w / 2 + 3, y + 18 + 3, w, h);
    const gr = c.createLinearGradient(0, y + 18, 0, y + 18 + h); gr.addColorStop(0, TT_C.mahogL); gr.addColorStop(1, TT_C.mahogD); c.fillStyle = gr; rrect(c, x - w / 2, y + 18, w, h, 3); c.fill();
    c.fillStyle = TT_C.brass; c.fillRect(x - w / 2, y + 18, w, 2);
  },
  revealPaths(c, g, L) {   // cosmetic: L1 reveal: gas-light runs from the frog to its joints with the human (younger) and the salmon (older)
    const s = this.sim.s; if (!(s.phase === 'reveal' || ((s.phase === 'end' || s.phase === 'over') && s.pick >= 0))) return;
    const tA = this.v.revealT < 0 ? 9 : this.v.revealT, J = L.J;
    const mrca = (a, b) => { let best = null; for (const j of J) if (j.tips.indexOf(a) >= 0 && j.tips.indexOf(b) >= 0 && (!best || j.tips.length < best.tips.length)) best = j; return best; };
    const chain = (nd, tip) => nd.tips.length === 1 ? [[nd.x, nd.y]] : chain(nd.a.tips.indexOf(tip) >= 0 ? nd.a : nd.b, tip).concat([[nd.x, nd.y]]);
    const paths = [[TT_L1.far, TT_C.gasG, 'younger'], [TT_L1.near, TT_C.warn, 'older']];
    paths.forEach(([t, ink, lab], k) => {
      const j = mrca(TT_L1.frog, t); if (!j) return; const u = Math.max(0, Math.min(1, (tA - k * 0.9) / 0.8)); if (u <= 0) return;
      c.save(); c.globalAlpha = 0.9; c.strokeStyle = ink; c.lineWidth = 4; c.lineCap = 'round'; c.setLineDash([2, 6]);
      for (const tip of [TT_L1.frog, t]) {   // along the brass, tip to joint, so the path is the tree's own
        const P = chain(j, tip); let tot = 0; for (let i = 1; i < P.length; i++) tot += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
        let left = tot * u; c.beginPath(); c.moveTo(P[0][0], P[0][1]);
        for (let i = 1; i < P.length && left > 0; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]) || 1, f = Math.min(1, left / d); c.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f); left -= d; }
        c.stroke();
      }
      c.restore();
      if (u >= 1) { c.fillStyle = ink; c.beginPath(); c.arc(j.x, j.y, 13, 0, TAU); c.fill(); Lbl.put('tt-' + lab, this.lab(lab), j.x + (k ? 0 : 0), j.y + 26, { size: 13, bg: ink }); }
    });
  },
  // L2/L3: one chalk tick per trait change, on the branch where it falls; a trait needing two ticks glows amber
  changes4(sh) {
    const s = this.sim.s, c = this.sim.c(s), C = this.sim.C(s), out = [];
    C.chars.slice(0, c.vis).forEach((ch, row) => { const f = TT.fitch(sh.tree, ch[1], 0), w = ch[2] || 1; for (const x of f.ch) for (let k = 0; k < w; k++) out.push({ k: x.k, row, twice: f.steps === 2 }); });
    return out;
  },
  drawTicks(c, g, L, sh) {   // cosmetic
    const ch = this.changes4(sh), by = {}, v = this.v, fresh = v.tick && v.tick.t != null ? Math.min(1, (v.t - v.tick.t) / 0.35) : 1;
    for (const x of ch) (by[x.k] = by[x.k] || []).push(x);
    for (const e of L.E) {
      const a = by[e.k]; if (!a) continue;
      a.forEach((x, i) => {
        const f = (i + 1) / (a.length + 1), px = e.x0 + (e.x1 - e.x0) * (0.25 + 0.6 * f), py = e.y0 + (e.y1 - e.y0) * (0.25 + 0.6 * f);
        const dx = e.x1 - e.x0, dy = e.y1 - e.y0, len = Math.hypot(dx, dy) || 1, sg = dx / len > 0.5 ? -1 : 1, nx = -dy / len * sg, ny = dx / len * sg, h = 9 * fresh;   // glyphs above a level bar, never into the ledger
        const ink = x.twice ? TT_C.warn : TT_C.chalk;
        c.save(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(px - nx * h, py - ny * h); c.lineTo(px + nx * h, py + ny * h); c.stroke();
        c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.moveTo(px - nx * h, py - ny * h); c.lineTo(px + nx * h, py + ny * h); c.stroke(); c.restore();
        this.glyph(c, x.row, px + nx * (h + 8), py + ny * (h + 8), 4.5, ink);
      });
    }
  },
  glyph(c, row, x, y, r, ink) {   // cosmetic: a small chalk shape naming a trait row (shape, not colour, carries identity)
    c.save(); c.fillStyle = ink; c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath();
    const k = row % 6;
    if (k === 0) c.arc(x, y, r, 0, TAU);
    else if (k === 1) { c.moveTo(x, y - r * 1.15); c.lineTo(x + r * 1.1, y + r * 0.85); c.lineTo(x - r * 1.1, y + r * 0.85); c.closePath(); }
    else if (k === 2) c.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8);
    else if (k === 3) { c.moveTo(x, y - r * 1.2); c.lineTo(x + r, y); c.lineTo(x, y + r * 1.2); c.lineTo(x - r, y); c.closePath(); }
    else if (k === 4) { c.rect(x - r * 1.1, y - r * 0.35, r * 2.2, r * 0.7); c.rect(x - r * 0.35, y - r * 1.1, r * 0.7, r * 2.2); }
    else { c.arc(x, y, r, 0, TAU); c.moveTo(x + r * 0.45, y); c.arc(x, y, r * 0.45, 0, TAU); }
    if (k === 5) c.fill('evenodd'); else c.fill();
    c.restore();
  },
  // L4: gains and losses written on the branches, read from the root
  drawChanges(c, g, L) {   // cosmetic
    const s = this.sim.s, r = this.sim.r(s), R0 = this.sim.R0(s), sh = this.shape(), by = {};
    for (const ch of R0.chars) { const f = TT.fitch(sh.tree, ch[1], ch[1][r.root]); for (const x of f.ch) (by[x.k] = by[x.k] || []).push({ t: ch[0], s: x.s }); }
    if (this.v.slide != null) return;
    for (const e of L.E) {
      const a = by[e.k]; if (!a) continue;
      a.forEach((x, i) => {
        const px = e.x0 + (e.x1 - e.x0) * 0.5, py = e.y0 + (e.y1 - e.y0) * 0.5 + i * 20 - (a.length - 1) * 10;
        const txt = Txt.f(x.s ? this.lab('gain') : this.lab('loss'), { t: this.lab(x.t) });
        Lbl.put('tt-ch' + e.k + i, txt, px, py, { size: 12, bg: x.s ? TT_C.slate : '#4A2418', ink: x.s ? TT_C.gas : TT_C.warn });
      });
    }
  },

  /* ---- cabinets: real specimens in spirit jars and mounts, with brass name plates ---- */
  drawCabinets(c, g) {
    const s = this.sim.s, names = this.tipNames(), v = this.v, ask = s.level === 0 && s.phase === 'ask';
    for (const t of v.order || []) {
      const x = this.tipX(t), y = g.cabY - (v.lift[t] || 0), kind = names[t];
      let state = '';
      if (s.level >= 1 && s.level <= 2 && t === 0) state = 'new';
      if (s.level === 3 && t === this.sim.r(s).root) state = 'root';
      this.cabinet(c, x - g.cw / 2, y, g.cw, g.chh, kind, state);
      if (ask && (t === TT_L1.near || t === TT_L1.far)) { const p = 0.5 + 0.5 * Det.sin(v.t * 5); c.save(); c.strokeStyle = 'rgba(143,217,160,' + (0.5 + 0.5 * p).toFixed(3) + ')'; c.lineWidth = 3; rrect(c, x - g.cw / 2 - 4, y - 4, g.cw + 8, g.chh + 8, 8); c.stroke(); c.restore(); }
      if (s.phase === 'reveal' && t === TT_L1.frog) { c.save(); c.strokeStyle = TT_C.gas; c.lineWidth = 2; rrect(c, x - g.cw / 2 - 3, y - 3, g.cw + 6, g.chh + 6, 7); c.stroke(); c.restore(); }
      Lbl.put('tt-name' + t, this.lab(kind), x, g.labY - (v.lift[t] || 0), { size: 12, bg: state === 'new' ? TT_C.amber : TT_C.parch });
    }
  },
  cabinet(c, x, y, w, h, kind, state) {   // cosmetic, cached per kind and size
    const key = kind + '|' + w + '|' + h + '|' + state;
    let L = this._cab[key];
    if (!L) { L = Layer(w + 8, h + 8); L.redraw(cc => this.paintCabinet(cc, 4, 4, w, h, kind, state)); this._cab[key] = L; }
    L.blit(c, x - 4, y - 4);
  },
  paintCabinet(c, x, y, w, h, kind, state) {   // cosmetic
    const wet = !!TT_WET[kind];
    c.fillStyle = 'rgba(0,0,0,.45)'; rrect(c, x + 3, y + 4, w, h, 6); c.fill();
    let gr = c.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, TT_C.mahogL); gr.addColorStop(1, TT_C.mahogD);
    c.fillStyle = gr; rrect(c, x, y, w, h, 6); c.fill();
    if (state === 'root') { c.strokeStyle = TT_C.gasG; c.lineWidth = 2.5; rrect(c, x + 1, y + 1, w - 2, h - 2, 6); c.stroke(); }
    if (state === 'new') { c.strokeStyle = TT_C.amber; c.lineWidth = 2.5; rrect(c, x + 1, y + 1, w - 2, h - 2, 6); c.stroke(); }
    const ix = x + 5, iy = y + 5, iw = w - 10, ih = h - 10;
    if (wet) {   // a spirit jar: amber fluid, a cork, a meniscus
      gr = c.createLinearGradient(ix, iy, ix + iw, iy); gr.addColorStop(0, '#6E5426'); gr.addColorStop(0.5, '#3E2E14'); gr.addColorStop(1, '#5A4420'); c.fillStyle = gr; rrect(c, ix, iy, iw, ih, 4); c.fill();
      const jx = ix + iw * 0.1, jw = iw * 0.8, jy = iy + ih * 0.1, jh = ih * 0.86;
      gr = c.createLinearGradient(jx, 0, jx + jw, 0); gr.addColorStop(0, '#B8913F'); gr.addColorStop(0.45, TT_C.fluid); gr.addColorStop(1, '#9C772C'); c.fillStyle = gr; rrect(c, jx, jy + 4, jw, jh - 4, jw * 0.16); c.fill();
      c.fillStyle = '#8A6A44'; rrect(c, jx + jw * 0.12, jy - 2, jw * 0.76, 8, 3); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(jx + jw * 0.12, jy + 4, jw * 0.76, 2);
      c.fillStyle = 'rgba(255,240,200,.25)'; c.fillRect(jx + 3, jy + 9, jw - 6, 2);
      this.art(c, kind, ix + iw / 2, iy + ih * 0.57, Math.min(iw, ih) * 0.44, 'real');
      c.fillStyle = 'rgba(216,176,98,.22)'; rrect(c, jx, jy + 4, jw, jh - 4, jw * 0.16); c.fill();   // the fluid tints the specimen
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2; rrect(c, jx, jy + 4, jw, jh - 4, jw * 0.16); c.stroke();
    } else {     // a dry mount on parchment
      gr = c.createLinearGradient(ix, iy, ix, iy + ih); gr.addColorStop(0, TT_C.parch); gr.addColorStop(1, TT_C.parchD); c.fillStyle = gr; rrect(c, ix, iy, iw, ih, 4); c.fill();
      c.strokeStyle = 'rgba(115,80,26,.35)'; c.lineWidth = 1; c.strokeRect(ix + 3, iy + 3, iw - 6, ih - 6);
      this.art(c, kind, ix + iw / 2, iy + ih * 0.52, Math.min(iw, ih) * 0.47, 'real');
    }
    // glass: a soft reflection streak
    c.save(); c.beginPath(); rrect(c, ix, iy, iw, ih, 4); c.clip();
    gr = c.createLinearGradient(ix, iy, ix + iw, iy + ih); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.42, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.16)'); gr.addColorStop(0.58, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(ix, iy, iw, ih);
    c.restore();
    c.fillStyle = TT_C.brass; c.beginPath(); c.arc(x + w / 2, y + 2.5, 2, 0, TAU); c.fill();
  },

  /* ---- L2/L3: the curator's chalk ledger, columns under the specimens ---- */
  rowY(row) { const g = this.geo(); return g.ledY + 8 + row * g.rh + g.rh / 2; },
  drawLedger(c, g) {   // the traits in view (the matrix), a step count per trait on the tree shown, drawers still shut
    const s = this.sim.s, cs = this.sim.c(s), C = this.sim.C(s), sh = this.shape(), L = this.content.labels, n = C.chars.length;
    const y0 = g.ledY, h = 8 + n * g.rh + 6;
    c.save(); c.fillStyle = TT_C.mahogD; rrect(c, 6, y0 - 4, g.W - 12, h + 8, 7); c.fill(); c.fillStyle = TT_C.slate; rrect(c, 10, y0, g.W - 20, h, 5); c.fill(); c.restore();
    C.chars.forEach((ch, row) => {
      const y = this.rowY(row), open = row < cs.vis;
      if (!open) {   // a shut drawer: brass pull, no trait yet
        c.fillStyle = TT_C.mahog; rrect(c, 16, y - g.rh / 2 + 3, g.W - 32, g.rh - 6, 3); c.fill();
        c.fillStyle = TT_C.brass; rrect(c, g.W / 2 - 14, y - 3, 28, 6, 3); c.fill();
        return;
      }
      const f = sh.kind === 'pair' ? TT.fitch(sh.tree, ch[1], 0).steps : null, w = ch[2] || 1, twice = f === 2, ink = twice ? TT_C.warn : TT_C.chalk;
      const yN = g.wide ? y : y - g.rh * 0.22, yD = g.wide ? y : y + g.rh * 0.2;
      this.glyph(c, row, 22, yN, 4.5, ink);
      Lbl.put('tt-row' + row, L[ch[0]], 32, yN, { size: 12, align: 'left', pill: false, ink });
      for (let t = 0; t < 4; t++) {
        const x = this.tipX(t); c.lineWidth = 2; c.strokeStyle = TT_C.chalk;
        c.beginPath(); c.arc(x, yD, 5.5, 0, TAU); if (ch[1][t]) { c.fillStyle = TT_C.chalk; c.fill(); } else { c.globalAlpha = 0.55; c.stroke(); c.globalAlpha = 1; }
      }
      if (f != null) Lbl.put('tt-rs' + row, (w > 1 ? f + ' ×' + w : String(f)), g.W - 18, yN, { size: 12, align: 'right', pill: false, ink });
    });
  },
  drawPlaque(c, g) {   // the key number, plainly, on a brass plaque
    const s = this.sim.s, L = this.content.labels, v = this.v; let a, b;
    if (s.level === 0) { a = L.drawings; b = L.oneTree; }
    else if (s.level <= 2) { const n = this.sim.stepsNow(s); a = n == null ? L.stepsQ : Txt.f(L.steps, { n }); b = L.fewest; }
    else { a = Txt.f(L.steps, { n: TT.stepsRoot(this.sim.R0(s), this.sim.r(s).root) }); b = L.anyRoot; }
    const y = g.plaqueY, big = v.pulse.steps ? 1 + 0.15 * v.pulse.steps : 1;
    const bx = Lbl.put('tt-key', a, g.W / 2 - 4, y, { size: Math.round(18 * big), bg: TT_C.brass, ink: TT_C.ink, align: 'right' });
    Lbl.put('tt-key2', b, g.W / 2 + 4, y, { size: 12, bg: TT_C.parch, align: 'left' });
    void bx;
  },
  drawFocus(c, g) {   // cosmetic: the keyboard's lit target
    const v = this.v; if (!(v.t - v.keyHit < 6) || v.keyHit === 0) return; const T = this.targets(); if (!T.length) return;
    const f = T[((v.focus % T.length) + T.length) % T.length]; c.save(); c.strokeStyle = TT_C.gas; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.arc(f.x, f.y, f.tip != null ? g.cw * 0.62 : 18, 0, TAU); c.stroke(); c.restore();
  },

  /* ---- specimen art: real organisms drawn as layered paths in a unit box (y down, facing right) ---- */
  art(c, kind, x, y, s, style, ink) {   // cosmetic
    const Ls = TT_ART.get(kind); if (!Ls) return;
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const L of Ls) {
      if (style === 'chalk' && !L.b) continue;
      this.path(c, L.d, x, y, s);
      if (style === 'chalk') {
        if (L.lw) { c.strokeStyle = ink; c.lineWidth = Math.max(1.2, s * L.lw * 0.45); c.stroke(); }
        else { c.fillStyle = 'rgba(238,235,223,.07)'; c.fill(); c.strokeStyle = ink; c.lineWidth = 1.4; c.stroke(); }
        continue;
      }
      if (L.lw) { c.strokeStyle = L.f; c.lineWidth = Math.max(1, s * L.lw); if (L.dash) c.setLineDash(L.dash.map(q => q * s)); c.stroke(); c.setLineDash([]); continue; }
      if (L.f) { c.fillStyle = L.f; c.fill(L.eo ? 'evenodd' : 'nonzero'); }
      if (L.s !== 0) { c.strokeStyle = L.s || 'rgba(30,20,14,.65)'; c.lineWidth = Math.max(0.7, s * 0.022 * (L.w || 1)); c.stroke(); }
    }
    c.restore();
  },
  path(c, d, x, y, s) {   // cosmetic: M L Q C Z, and E cx cy rx ry rot (a whole ellipse)
    c.beginPath();
    for (let i = 0; i < d.length;) {
      const op = d[i++];
      if (op === 'M') { c.moveTo(x + s * d[i], y + s * d[i + 1]); i += 2; }
      else if (op === 'L') { c.lineTo(x + s * d[i], y + s * d[i + 1]); i += 2; }
      else if (op === 'Q') { c.quadraticCurveTo(x + s * d[i], y + s * d[i + 1], x + s * d[i + 2], y + s * d[i + 3]); i += 4; }
      else if (op === 'C') { c.bezierCurveTo(x + s * d[i], y + s * d[i + 1], x + s * d[i + 2], y + s * d[i + 3], x + s * d[i + 4], y + s * d[i + 5]); i += 6; }
      else if (op === 'E') { const cx = x + s * d[i], cy = y + s * d[i + 1], rx = s * d[i + 2], ry = s * d[i + 3], ro = d[i + 4] || 0; c.moveTo(cx + rx * Math.cos(ro), cy + rx * Math.sin(ro)); c.ellipse(cx, cy, rx, ry, ro, 0, TAU); i += 5; }
      else if (op === 'Z') c.closePath();
    }
  },

  /* ---------- the strip: one chart beside the scene ---------- */
  notes() {
    const s = this.sim.s, L = this.content.labels, cap = this.content.captions, stats = [];
    if (s.level === 0) stats.push([L.sSwings, String(s.swTot), cap.mSwings], [L.sPar, String(TT_PAR.slice(0, s.plate + 1).reduce((a, b) => a + b, 0)), cap.mPar], [L.sDraw, '32', cap.mDraw]);
    else if (s.level <= 2) { const n = this.sim.stepsNow(s); stats.push([L.sSteps, n == null ? '–' : String(n), cap.mSteps], [L.sTrees, '3', cap.mTrees]); if (s.phase === 'mounted' || s.phase === 'end' || s.phase === 'over') stats.push([L.sBest, String(TT.best4(this.sim.C(s), this.sim.c(s).vis).n), cap.mBest]); }
    else stats.push([L.sSteps, String(TT.stepsRoot(this.sim.R0(s), this.sim.r(s).root)), cap.mSteps], [L.sRoots, String(this.sim.r(s).tried.length), cap.mRoots]);
    return { stats, charts: [this.chartSpec(false)] };
  },
  chartSpec(card) {
    const s = this.sim.s, L = this.content.labels, over = card || s.phase === 'end' || s.phase === 'over';
    if (s.level === 0) {
      const cols = [0, 1, 2].map(i => ({ label: Txt.f(L.plate, { i: i + 1 }), v: i < s.plate || (i === s.plate && (s.phase === 'match' || over || s.phase === 'ask' || s.phase === 'reveal')) || i < s.plate ? s.swBy[i] : (i === s.plate ? s.swBy[i] : null), best: TT_PAR[i], cur: i === s.plate && !over }));
      return { type: 'tt_bars', title: L.tSwings, y: { lo: 0, hi: Math.max(6, ...s.swBy) + 1, label: L.swingsAx }, cols, frame: 'designed', bestLabel: L.parL };
    }
    if (s.level <= 2) {
      const c = this.sim.c(s), C = this.sim.C(s), done = s.phase === 'mounted' || over, cols = c.ord.map(t => {   // in the cabinets' starting order
        const k = t + '.' + c.vis, tried = c.tried[k] != null;
        return { label: L[C.tips[t]], v: tried ? c.tried[k] : null, best: done ? TT.steps4(C, t, c.vis) : null, cur: t === c.sis };
      });
      let hi = 4; for (const q of cols) hi = Math.max(hi, q.v || 0, q.best || 0);
      return { type: 'tt_bars', title: L.tSteps, y: { lo: 0, hi: hi + 1, label: L.stepsAx }, cols, frame: 'designed', bestLabel: L.bestL };
    }
    const r = this.sim.r(s), R0 = this.sim.R0(s), cols = R0.tips.map((nm, t) => ({ label: L[nm], v: r.tried.indexOf(t) >= 0 ? TT.stepsRoot(R0, t) : null, cur: t === r.root }));
    return { type: 'tt_bars', title: L.tRoot, y: { lo: 0, hi: 6, label: L.stepsAx }, cols, frame: 'designed' };
  }
};
V2.push(CH_TREE_V2);
// read-only test hooks for tests/oracle_tree.js (the helpers live inside the build's one IIFE)
Object.assign(CH_TREE_V2, { _fitch: (tr, v, p) => TT.fitch(tr, v, p), _reroot: (tr, r) => TT.reroot(tr, r), _steps4: (C, sis, vis) => TT.steps4(C, sis, vis), _pair: sis => TT.pair(sis),
  _stepsRoot: (R0, r) => TT.stepsRoot(R0, r), _order: (N, f) => TT.order(N, f), _tipsOf: (N, r) => TT.tipsOf(N, r), _n1: TT_N1, _cases: TT_CASES, _roots: TT_ROOTS });

/* ---- specimen art (D6 decision 10: real organisms). Each kind is a list of layers {d: path, f: fill, s: stroke (0 none),
   lw: stroke-only width, b: drawn in the chalk outline}. Built once, on first use. ---- */
const TT_ART = (() => {
  const K = {}, O = 'rgba(30,20,14,.7)';
  const liz = o => {   // a lizard in side view, facing right: body, tail, legs, head; o tunes the build
    const g = o.girth || 0.11, nk = o.neck || 0.5, hl = o.head || 0.24, col = o.col, col2 = o.col2;
    const body = ['M', -0.98, 0.02, 'C', -0.7, -0.02, -0.35, -g * 0.9, -0.15, -g, 'C', 0.1, -g * 1.15, nk - 0.05, -g * 0.8, nk, -g * 0.55,
      'C', nk + 0.1, -g * 0.9, nk + hl * 0.8, -g * 0.85, nk + hl, -0.01, 'C', nk + hl * 0.8, g * 0.6, nk + 0.1, g * 0.55, nk, g * 0.45,
      'C', nk - 0.1, g * 0.9, 0.1, g * 1.15, -0.15, g, 'C', -0.35, g * 0.9, -0.7, 0.05, -0.98, 0.02, 'Z'];
    const leg = (x, fw) => ['M', x, g * 0.6, 'L', x + fw * 0.08, g * 0.6 + 0.16, 'L', x + fw * 0.17, g * 0.6 + 0.2];
    const out = [
      { d: leg(-0.08, -1), lw: o.leg || 0.045, f: col, b: 1 }, { d: leg(nk - 0.1, 1), lw: o.leg || 0.045, f: col, b: 1 },
      { d: body, f: col, b: 1 },
      { d: ['M', -0.6, -0.005, 'C', -0.3, -g * 0.8, 0.1, -g * 0.95, nk, -g * 0.5, 'C', 0.1, -g * 0.55, -0.3, -g * 0.5, -0.6, -0.005, 'Z'], f: col2, s: 0 },
      { d: ['E', nk + hl * 0.62, -g * 0.22, o.eye || 0.03, o.eye || 0.03, 0], f: '#15100A', s: 0 },
      { d: ['E', nk + hl * 0.62 + 0.008, -g * 0.22 - 0.01, 0.009, 0.009, 0], f: '#FFF6DA', s: 0 }
    ];
    if (o.legBack) out.push({ d: leg(-0.14, 1), lw: o.leg || 0.045, f: col2 }, { d: leg(nk - 0.04, -1), lw: o.leg || 0.045, f: col2 });
    if (o.pads) out.push({ d: ['E', -0.08 - 0.17, g * 0.6 + 0.2, 0.03, 0.022, 0, 'E', nk - 0.1 + 0.17, g * 0.6 + 0.2, 0.03, 0.022, 0], f: col, s: O });
    if (o.spots) { const d = []; for (let i = 0; i < 9; i++) { const x = -0.55 + i * 0.12; if (x < nk) d.push('E', x, -g * 0.1 + (i % 2) * g * 0.35, 0.025, 0.02, 0); } out.push({ d, f: o.spots, s: 0 }); }
    if (o.tongue) out.push({ d: ['M', nk + hl, 0.0, 'L', nk + hl + 0.12, 0.0, 'L', nk + hl + 0.17, -0.03, 'M', nk + hl + 0.12, 0.0, 'L', nk + hl + 0.17, 0.03], lw: 0.012, f: '#B23A2E' });
    if (o.scutes) { const d = []; for (let i = 0; i < 12; i++) { const x = -0.7 + i * 0.1; d.push('M', x, -g * (x > -0.15 ? 1.0 : 0.6), 'L', x + 0.04, -g * (x > -0.15 ? 1.25 : 0.85), 'L', x + 0.08, -g * (x > -0.15 ? 1.0 : 0.6)); } out.push({ d, lw: 0.012, f: col2 }); }
    return out;
  };
  const quad = o => {   // a large mammal in side view, facing right
    const out = [], col = o.col, legs = o.legs || [-0.48, -0.36, 0.28, 0.4], ly = o.ly || 0.12, lh = o.lh || 0.42, lw = o.lw || 0.07;
    legs.forEach((x, i) => out.push({ d: ['M', x - lw / 2, ly, 'L', x + lw / 2, ly, 'L', x + lw / 2 - 0.005, ly + lh, 'L', x - lw / 2 + 0.005, ly + lh, 'Z'], f: i % 2 ? col : o.col2 || col, b: 1 }));
    legs.forEach(x => out.push({ d: ['M', x - lw / 2 - 0.005, ly + lh - 0.05, 'L', x + lw / 2 + 0.005, ly + lh - 0.05, 'L', x + lw / 2 + 0.01, ly + lh, 'L', x - lw / 2 - 0.01, ly + lh, 'Z'], f: o.hoof || '#2A2018', s: 0 }));
    out.push({ d: o.body, f: col, b: 1 });
    return out;
  };
  const B = {
    salmon: () => [
      { d: ['M', -0.72, 0.02, 'L', -0.98, -0.26, 'L', -0.9, 0.03, 'L', -0.98, 0.3, 'Z'], f: '#7C8784', b: 1 },
      { d: ['M', -0.75, 0.02, 'C', -0.4, -0.28, 0.3, -0.34, 0.7, -0.12, 'C', 0.86, -0.04, 0.95, 0.03, 0.94, 0.07, 'C', 0.86, 0.16, 0.6, 0.24, 0.3, 0.26, 'C', -0.2, 0.28, -0.55, 0.16, -0.75, 0.02, 'Z'], f: '#C4C6BC', b: 1 },
      { d: ['M', -0.72, 0.0, 'C', -0.4, -0.27, 0.3, -0.33, 0.72, -0.11, 'C', 0.4, -0.08, -0.3, -0.04, -0.72, 0.0, 'Z'], f: '#5E6E70', s: 0 },
      { d: ['M', -0.6, 0.06, 'C', -0.2, 0.0, 0.3, 0.0, 0.62, 0.06, 'C', 0.3, 0.1, -0.2, 0.1, -0.6, 0.06, 'Z'], f: 'rgba(205,120,110,.45)', s: 0 },
      { d: ['M', -0.04, -0.27, 'L', 0.1, -0.46, 'L', 0.25, -0.28, 'Z', 'E', -0.48, -0.17, 0.05, 0.03, 0, 'M', 0.42, 0.12, 'L', 0.28, 0.28, 'L', 0.52, 0.17, 'Z', 'M', -0.3, 0.22, 'L', -0.4, 0.34, 'L', -0.16, 0.25, 'Z'], f: '#6E7C7A', b: 1 },
      { d: ['E', -0.2, -0.16, 0.022, 0.018, 0, 'E', 0.05, -0.2, 0.022, 0.018, 0, 'E', 0.3, -0.17, 0.022, 0.018, 0, 'E', -0.05, -0.1, 0.02, 0.016, 0, 'E', 0.2, -0.11, 0.02, 0.016, 0], f: '#1E2422', s: 0 },
      { d: ['M', 0.6, -0.12, 'Q', 0.53, 0.04, 0.6, 0.18], lw: 0.018, f: 'rgba(30,20,14,.55)' },
      { d: ['E', 0.75, -0.02, 0.05, 0.05, 0], f: '#E9D9A6', s: O }, { d: ['E', 0.755, -0.02, 0.028, 0.028, 0], f: '#120C08', s: 0 }
    ],
    frog: () => [
      { d: ['E', -0.32, 0.22, 0.42, 0.2, -0.25], f: '#5F7E3A', b: 1 },
      { d: ['M', -0.12, 0.36, 'L', 0.3, 0.46, 'L', 0.42, 0.42, 'L', 0.3, 0.38, 'Z'], f: '#5F7E3A', b: 1 },
      { d: ['M', -0.72, 0.28, 'C', -0.8, -0.05, -0.4, -0.36, 0.15, -0.33, 'C', 0.5, -0.31, 0.76, -0.18, 0.86, -0.02, 'C', 0.9, 0.1, 0.72, 0.2, 0.42, 0.24, 'C', 0.1, 0.38, -0.48, 0.44, -0.72, 0.28, 'Z'], f: '#7E9E50', b: 1 },
      { d: ['M', -0.6, 0.3, 'C', -0.3, 0.42, 0.2, 0.34, 0.45, 0.22, 'C', 0.2, 0.26, -0.2, 0.3, -0.6, 0.3, 'Z'], f: '#DCD6A2', s: 0 },
      { d: ['E', -0.3, -0.12, 0.08, 0.05, 0.2, 'E', -0.05, -0.2, 0.07, 0.045, 0, 'E', -0.45, 0.02, 0.06, 0.04, 0], f: '#3F5626', s: 0 },
      { d: ['M', 0.38, 0.14, 'L', 0.46, 0.46, 'L', 0.6, 0.5], lw: 0.06, f: '#6E8E45', b: 1 },
      { d: ['E', 0.18, -0.16, 0.07, 0.07, 0], f: '#6B5A2E', s: O },
      { d: ['E', 0.44, -0.33, 0.13, 0.11, 0], f: '#7E9E50', b: 1 }, { d: ['E', 0.45, -0.34, 0.085, 0.075, 0], f: '#C9A23A', s: O }, { d: ['E', 0.45, -0.34, 0.06, 0.024, 0], f: '#120C08', s: 0 },
      { d: ['M', 0.86, -0.02, 'Q', 0.7, 0.06, 0.5, 0.04], lw: 0.012, f: 'rgba(30,20,14,.6)' }
    ],
    lizard: () => liz({ col: '#8C8A52', col2: '#5E6036', girth: 0.15, neck: 0.48, head: 0.27, eye: 0.04, leg: 0.055, legBack: 1, spots: '#D8CF8A' }),
    gecko: () => liz({ col: '#D2B57E', col2: '#A88A56', girth: 0.15, neck: 0.45, head: 0.28, eye: 0.05, pads: 1, spots: '#7A5A36', leg: 0.05 }),
    monitor: () => liz({ col: '#6A6440', col2: '#3E3A22', girth: 0.12, neck: 0.42, head: 0.3, spots: '#D9C766', tongue: 1 }),
    crocodile: () => liz({ col: '#5E6A3A', col2: '#38401F', girth: 0.12, neck: 0.48, head: 0.42, eye: 0.026, scutes: 1, leg: 0.05 }),
    snake: () => [
      { d: ['M', -0.75, 0.55, 'C', -0.1, 0.78, 0.55, 0.55, 0.38, 0.18, 'C', 0.22, -0.18, -0.55, -0.06, -0.45, -0.4, 'C', -0.35, -0.68, 0.25, -0.66, 0.55, -0.48], lw: 0.17, f: '#4F5A2E', b: 1 },
      { d: ['M', -0.75, 0.55, 'C', -0.1, 0.78, 0.55, 0.55, 0.38, 0.18, 'C', 0.22, -0.18, -0.55, -0.06, -0.45, -0.4, 'C', -0.35, -0.68, 0.25, -0.66, 0.55, -0.48], lw: 0.08, f: '#B9A660', dash: [0.06, 0.1] },
      { d: ['E', 0.64, -0.46, 0.14, 0.09, -0.3], f: '#4F5A2E', b: 1 }, { d: ['E', 0.68, -0.5, 0.025, 0.025, 0], f: '#E8C960', s: 0 },
      { d: ['M', 0.77, -0.5, 'L', 0.9, -0.55, 'L', 0.96, -0.6, 'M', 0.9, -0.55, 'L', 0.96, -0.5], lw: 0.014, f: '#B23A2E' }
    ],
    sparrow: () => [
      { d: ['M', -0.62, 0.66, 'L', 0.62, 0.66], lw: 0.07, f: '#6B4A2E' },
      { d: ['M', 0.0, 0.32, 'L', -0.05, 0.64, 'M', 0.12, 0.3, 'L', 0.12, 0.64], lw: 0.03, f: '#8A6A50' },
      { d: ['M', -0.32, 0.12, 'L', -0.88, 0.42, 'L', -0.8, 0.52, 'L', -0.26, 0.3, 'Z'], f: '#6E5236', b: 1 },
      { d: ['E', 0.02, 0.06, 0.44, 0.3, -0.22], f: '#C9B796', b: 1 },
      { d: ['E', -0.06, -0.01, 0.34, 0.18, -0.3], f: '#8A6440', s: O },
      { d: ['M', -0.3, 0.06, 'L', 0.1, -0.08, 'M', -0.28, 0.12, 'L', 0.12, -0.01, 'M', -0.2, 0.16, 'L', 0.16, 0.06], lw: 0.02, f: '#3E2A18' },
      { d: ['E', 0.38, -0.24, 0.21, 0.19, 0], f: '#8F877A', b: 1 },
      { d: ['M', 0.3, -0.12, 'C', 0.38, 0.0, 0.5, 0.04, 0.56, -0.08, 'C', 0.5, -0.12, 0.4, -0.12, 0.3, -0.12, 'Z'], f: '#2A221A', s: 0 },
      { d: ['E', 0.44, -0.22, 0.09, 0.05, 0], f: '#E8E0CC', s: 0 },
      { d: ['M', 0.56, -0.27, 'L', 0.74, -0.22, 'L', 0.56, -0.17, 'Z'], f: '#3A2E22', b: 1 },
      { d: ['E', 0.47, -0.28, 0.03, 0.03, 0], f: '#120C08', s: 0 }
    ],
    ostrich: () => [
      { d: ['M', -0.06, 0.18, 'L', -0.02, 0.55, 'L', -0.08, 0.92, 'M', 0.08, 0.18, 'L', 0.18, 0.55, 'L', 0.12, 0.92], lw: 0.07, f: '#C9A396', b: 1 },
      { d: ['M', -0.5, -0.12, 'C', -0.75, -0.3, -0.85, -0.05, -0.62, 0.04, 'Z'], f: '#F2EDE2', s: O },
      { d: ['E', -0.08, -0.04, 0.46, 0.27, 0.05], f: '#24201C', b: 1 },
      { d: ['M', -0.35, 0.0, 'C', -0.2, 0.12, 0.1, 0.14, 0.25, 0.04, 'C', 0.1, 0.2, -0.25, 0.2, -0.35, 0.0, 'Z'], f: '#EDE7DA', s: 0 },
      { d: ['M', 0.24, -0.14, 'C', 0.36, -0.4, 0.3, -0.7, 0.42, -0.84], lw: 0.1, f: '#C4A9A0', b: 1 },
      { d: ['E', 0.47, -0.87, 0.1, 0.075, 0], f: '#C4A9A0', b: 1 }, { d: ['M', 0.55, -0.88, 'L', 0.68, -0.85, 'L', 0.55, -0.82, 'Z'], f: '#8A6E5E', s: O },
      { d: ['E', 0.48, -0.9, 0.022, 0.022, 0], f: '#120C08', s: 0 }
    ],
    mouse: () => [
      { d: ['M', -0.55, 0.26, 'C', -0.82, 0.38, -0.98, 0.12, -0.86, -0.2], lw: 0.035, f: '#D9A69A', b: 1 },
      { d: ['M', -0.55, 0.28, 'C', -0.6, -0.1, -0.2, -0.32, 0.2, -0.28, 'C', 0.45, -0.26, 0.62, -0.12, 0.8, 0.08, 'C', 0.84, 0.14, 0.72, 0.2, 0.55, 0.22, 'C', 0.3, 0.34, -0.3, 0.4, -0.55, 0.28, 'Z'], f: '#978676', b: 1 },
      { d: ['M', -0.4, 0.3, 'C', -0.1, 0.36, 0.3, 0.3, 0.55, 0.2, 'C', 0.3, 0.24, -0.1, 0.27, -0.4, 0.3, 'Z'], f: '#D7CBB8', s: 0 },
      { d: ['E', 0.36, -0.3, 0.14, 0.16, -0.2], f: '#A08A7C', b: 1 }, { d: ['E', 0.37, -0.29, 0.08, 0.1, -0.2], f: '#E3B2A6', s: 0 },
      { d: ['E', 0.6, -0.06, 0.04, 0.04, 0], f: '#120C08', s: 0 }, { d: ['E', 0.81, 0.1, 0.035, 0.03, 0], f: '#D98C86', s: 0 },
      { d: ['M', 0.74, 0.12, 'L', 0.98, 0.04, 'M', 0.74, 0.14, 'L', 0.98, 0.18, 'M', 0.73, 0.13, 'L', 0.94, 0.25], lw: 0.008, f: 'rgba(30,20,14,.6)' },
      { d: ['M', 0.3, 0.3, 'L', 0.36, 0.4, 'L', 0.46, 0.4, 'M', -0.3, 0.33, 'L', -0.28, 0.42, 'L', -0.16, 0.42], lw: 0.03, f: '#D9A69A' }
    ],
    human: () => [   // a human skull, the museum's way to show us
      { d: ['M', -0.55, 0.05, 'C', -0.62, -0.62, 0.55, -0.74, 0.62, -0.06, 'C', 0.64, 0.2, 0.5, 0.3, 0.45, 0.38, 'L', 0.42, 0.62, 'C', 0.2, 0.72, -0.2, 0.72, -0.4, 0.62, 'L', -0.45, 0.36, 'C', -0.56, 0.28, -0.6, 0.2, -0.55, 0.05, 'Z'], f: '#E7DDC5', b: 1 },
      { d: ['M', -0.5, -0.22, 'C', -0.3, -0.5, 0.3, -0.55, 0.52, -0.3, 'C', 0.3, -0.44, -0.3, -0.42, -0.5, -0.22, 'Z'], f: 'rgba(255,250,235,.6)', s: 0 },
      { d: ['E', -0.22, 0.06, 0.17, 0.14, 0, 'E', 0.25, 0.06, 0.17, 0.14, 0], f: '#3A2A1C', b: 1 },
      { d: ['M', 0.02, 0.18, 'L', -0.08, 0.36, 'L', 0.1, 0.36, 'Z'], f: '#3A2A1C', b: 1 },
      { d: ['M', -0.26, 0.47, 'L', 0.27, 0.47, 'L', 0.24, 0.6, 'L', -0.23, 0.6, 'Z'], f: '#F3ECDA', b: 1 },
      { d: ['M', -0.14, 0.47, 'L', -0.14, 0.6, 'M', -0.03, 0.47, 'L', -0.03, 0.6, 'M', 0.08, 0.47, 'L', 0.08, 0.6, 'M', 0.18, 0.47, 'L', 0.18, 0.6, 'M', -0.26, 0.535, 'L', 0.26, 0.535], lw: 0.012, f: 'rgba(30,20,14,.55)' },
      { d: ['M', -0.5, 0.2, 'Q', -0.4, 0.28, -0.3, 0.26, 'M', 0.52, 0.2, 'Q', 0.42, 0.28, 0.32, 0.26], lw: 0.016, f: 'rgba(30,20,14,.4)' }
    ],
    bat: () => {   // pinned with wings spread: the wing is skin on four long fingers
      const wing = sx => ({ d: ['M', sx * 0.1, -0.12, 'L', sx * 0.42, -0.4, 'L', sx * 0.98, -0.18, 'Q', sx * 0.86, 0.02, sx * 0.78, 0.2, 'Q', sx * 0.62, 0.12, sx * 0.5, 0.32, 'Q', sx * 0.32, 0.18, sx * 0.1, 0.26, 'Z'], f: 'rgba(92,64,48,.88)', b: 1 });
      const bones = sx => ({ d: ['M', sx * 0.1, -0.1, 'L', sx * 0.4, -0.38, 'L', sx * 0.98, -0.18, 'M', sx * 0.4, -0.38, 'L', sx * 0.78, 0.2, 'M', sx * 0.4, -0.38, 'L', sx * 0.5, 0.32, 'M', sx * 0.4, -0.38, 'L', sx * 0.36, -0.48], lw: 0.022, f: '#3A2618' });
      return [wing(-1), wing(1), bones(-1), bones(1),
        { d: ['E', 0, 0.04, 0.13, 0.27, 0], f: '#6B4A34', b: 1 },
        { d: ['E', 0, -0.25, 0.11, 0.1, 0], f: '#6B4A34', b: 1 },
        { d: ['M', -0.08, -0.3, 'L', -0.12, -0.46, 'L', -0.02, -0.33, 'Z', 'M', 0.08, -0.3, 'L', 0.12, -0.46, 'L', 0.02, -0.33, 'Z'], f: '#6B4A34', b: 1 },
        { d: ['E', -0.04, -0.26, 0.016, 0.016, 0, 'E', 0.04, -0.26, 0.016, 0.016, 0], f: '#120C08', s: 0 },
        { d: ['E', -0.98, -0.18, 0.025, 0.025, 0, 'E', 0.98, -0.18, 0.025, 0.025, 0, 'E', -0.5, 0.32, 0.025, 0.025, 0, 'E', 0.5, 0.32, 0.025, 0.025, 0], f: TT_C.brass, s: O }];
    },
    whale: () => [
      { d: ['M', -0.68, 0.0, 'L', -0.9, -0.22, 'Q', -0.93, -0.02, -0.98, 0.0, 'Q', -0.93, 0.02, -0.9, 0.22, 'Z'], f: '#4E5A62', b: 1 },
      { d: ['M', -0.72, 0.0, 'C', -0.4, -0.18, 0.2, -0.28, 0.6, -0.22, 'C', 0.85, -0.18, 0.97, -0.05, 0.95, 0.05, 'C', 0.9, 0.2, 0.5, 0.26, 0.1, 0.22, 'C', -0.3, 0.18, -0.55, 0.08, -0.72, 0.0, 'Z'], f: '#5E6B73', b: 1 },
      { d: ['M', -0.5, 0.06, 'C', -0.1, 0.18, 0.5, 0.22, 0.9, 0.1, 'C', 0.6, 0.24, 0.0, 0.24, -0.5, 0.06, 'Z'], f: '#C9CDCB', s: 0 },
      { d: ['M', 0.2, 0.17, 'L', 0.8, 0.12, 'M', 0.25, 0.2, 'L', 0.78, 0.16, 'M', 0.3, 0.22, 'L', 0.72, 0.2], lw: 0.01, f: 'rgba(30,20,14,.35)' },
      { d: ['M', 0.32, 0.15, 'Q', 0.28, 0.4, 0.12, 0.44, 'Q', 0.22, 0.3, 0.2, 0.17, 'Z'], f: '#4E5A62', b: 1 },
      { d: ['M', -0.25, -0.17, 'L', -0.18, -0.26, 'L', -0.12, -0.19, 'Z'], f: '#4E5A62', s: O },
      { d: ['M', 0.95, 0.04, 'C', 0.8, 0.07, 0.65, 0.07, 0.55, 0.05], lw: 0.014, f: 'rgba(30,20,14,.6)' },
      { d: ['E', 0.6, -0.04, 0.025, 0.025, 0], f: '#120C08', s: 0 }
    ],
    hippo: () => quad({ col: '#7E6E74', col2: '#6A5B61', legs: [-0.5, -0.36, 0.26, 0.4], ly: 0.18, lh: 0.3, lw: 0.11, hoof: '#4A3C40',
      body: ['M', -0.72, 0.15, 'C', -0.78, -0.25, -0.3, -0.38, 0.15, -0.34, 'C', 0.45, -0.32, 0.6, -0.26, 0.72, -0.16, 'C', 0.92, -0.14, 0.98, 0.04, 0.93, 0.14, 'C', 0.86, 0.24, 0.66, 0.22, 0.55, 0.2, 'C', 0.4, 0.3, 0.0, 0.32, -0.3, 0.3, 'C', -0.5, 0.3, -0.7, 0.28, -0.72, 0.15, 'Z'] }).concat([
      { d: ['M', -0.5, 0.22, 'C', -0.1, 0.32, 0.3, 0.3, 0.52, 0.2, 'C', 0.2, 0.26, -0.2, 0.26, -0.5, 0.22, 'Z'], f: '#C79A94', s: 0 },
      { d: ['E', 0.6, -0.27, 0.035, 0.05, 0], f: '#6A5B61', s: O }, { d: ['E', 0.71, -0.19, 0.035, 0.03, 0], f: '#120C08', s: 0 },
      { d: ['E', 0.9, -0.06, 0.025, 0.02, 0], f: '#3A2E30', s: 0 }, { d: ['M', 0.93, 0.12, 'Q', 0.8, 0.14, 0.72, 0.08], lw: 0.012, f: 'rgba(30,20,14,.6)' }]),
    cow: () => quad({ col: '#8A4E2E', col2: '#74401F', legs: [-0.54, -0.42, 0.32, 0.44], ly: 0.08, lh: 0.5, lw: 0.075,
      body: ['M', -0.64, -0.2, 'C', -0.3, -0.28, 0.25, -0.28, 0.5, -0.22, 'L', 0.56, 0.1, 'C', 0.3, 0.2, -0.3, 0.2, -0.64, 0.14, 'Z'] }).concat([
      { d: ['M', -0.62, -0.18, 'Q', -0.76, 0.05, -0.72, 0.36], lw: 0.025, f: '#74401F' }, { d: ['E', -0.72, 0.38, 0.03, 0.05, 0], f: '#3A2414', s: 0 },
      { d: ['M', 0.48, -0.25, 'L', 0.78, -0.13, 'L', 0.86, 0.06, 'L', 0.72, 0.1, 'L', 0.54, -0.04, 'Z'], f: '#F0E8DA', b: 1 },
      { d: ['E', 0.84, 0.06, 0.05, 0.04, 0], f: '#D8A096', s: O },
      { d: ['M', 0.56, -0.24, 'Q', 0.56, -0.4, 0.66, -0.4, 'M', 0.6, -0.23, 'Q', 0.68, -0.34, 0.76, -0.32], lw: 0.03, f: '#E8DCC0' },
      { d: ['E', 0.5, -0.18, 0.08, 0.035, -0.4], f: '#74401F', s: O }, { d: ['E', 0.68, -0.12, 0.022, 0.022, 0], f: '#120C08', s: 0 },
      { d: ['E', -0.05, 0.16, 0.1, 0.05, 0], f: '#E3A99A', s: O }]),
    pig: () => quad({ col: '#E3A99A', col2: '#CF9183', legs: [-0.45, -0.32, 0.26, 0.38], ly: 0.18, lh: 0.28, lw: 0.08, hoof: '#5A3A30',
      body: ['M', -0.66, 0.02, 'C', -0.66, -0.3, -0.2, -0.36, 0.2, -0.32, 'C', 0.55, -0.28, 0.7, -0.15, 0.86, -0.02, 'L', 0.93, 0.03, 'L', 0.93, 0.16, 'C', 0.75, 0.2, 0.6, 0.22, 0.45, 0.26, 'C', 0.1, 0.34, -0.4, 0.34, -0.6, 0.22, 'C', -0.66, 0.16, -0.67, 0.08, -0.66, 0.02, 'Z'] }).concat([
      { d: ['E', 0.93, 0.09, 0.035, 0.07, 0], f: '#C77F72', s: O },
      { d: ['M', 0.5, -0.27, 'L', 0.7, -0.42, 'L', 0.66, -0.17, 'Z'], f: '#D49384', s: O },
      { d: ['E', 0.68, -0.08, 0.022, 0.022, 0], f: '#120C08', s: 0 },
      { d: ['M', -0.66, -0.02, 'C', -0.84, -0.14, -0.84, 0.08, -0.74, 0.02, 'C', -0.7, -0.02, -0.76, -0.06, -0.8, -0.02], lw: 0.022, f: '#CF9183' }]),
    octopus: () => {
      const arm = (x0, c1x, c1y, x1, y1) => ({ d: ['M', x0, 0.08, 'Q', c1x, c1y, x1, y1], lw: 0.07, f: '#A9543F', b: 1 });
      return [arm(-0.18, -0.6, 0.3, -0.85, 0.75), arm(-0.1, -0.35, 0.6, -0.55, 0.92), arm(-0.02, -0.1, 0.6, -0.2, 0.96), arm(0.05, 0.1, 0.6, 0.12, 0.96),
        arm(0.1, 0.35, 0.6, 0.48, 0.9), arm(0.16, 0.55, 0.35, 0.82, 0.7), arm(0.2, 0.7, 0.1, 0.92, 0.3), arm(-0.22, -0.75, 0.05, -0.95, 0.28),
        { d: ['E', -0.02, -0.42, 0.36, 0.42, -0.15], f: '#B8604A', b: 1 },
        { d: ['E', 0.02, 0.0, 0.26, 0.14, 0], f: '#B8604A', b: 1 },
        { d: ['E', -0.1, -0.5, 0.12, 0.08, -0.4, 'E', 0.1, -0.3, 0.08, 0.05, 0], f: 'rgba(120,50,36,.45)', s: 0 },
        { d: ['E', 0.17, -0.05, 0.1, 0.09, 0], f: '#E8C870', b: 1 }, { d: ['E', 0.17, -0.05, 0.07, 0.022, 0], f: '#120C08', s: 0 },
        { d: ['E', -0.6, 0.4, 0.02, 0.02, 0, 'E', -0.7, 0.52, 0.02, 0.02, 0, 'E', 0.36, 0.5, 0.02, 0.02, 0, 'E', 0.42, 0.64, 0.02, 0.02, 0, 'E', -0.14, 0.62, 0.02, 0.02, 0], f: '#E9C2B0', s: 0 }];
    },
    limpet: () => {
      const ribs = []; for (let i = 0; i <= 8; i++) { const bx = -0.62 + i * 0.155; ribs.push('M', 0.04, -0.28, 'L', bx, 0.4); }
      return [
        { d: ['M', -0.95, 0.5, 'C', -0.6, 0.32, 0.6, 0.32, 0.95, 0.5, 'L', 0.95, 0.95, 'L', -0.95, 0.95, 'Z'], f: '#8E8A80', b: 1 },
        { d: ['E', -0.6, 0.7, 0.08, 0.04, 0, 'E', 0.5, 0.8, 0.12, 0.05, 0, 'E', 0.1, 0.62, 0.06, 0.03, 0], f: '#6E6A62', s: 0 },
        { d: ['M', -0.66, 0.42, 'C', -0.4, 0.38, -0.1, -0.24, 0.04, -0.3, 'C', 0.16, -0.24, 0.4, 0.36, 0.66, 0.42, 'Z'], f: '#C9B38C', b: 1 },
        { d: ribs, lw: 0.016, f: 'rgba(110,80,50,.55)' },
        { d: ['M', -0.66, 0.42, 'C', -0.3, 0.48, 0.3, 0.48, 0.66, 0.42], lw: 0.03, f: '#7A5A3A' },
        { d: ['M', 0.6, 0.43, 'Q', 0.72, 0.36, 0.78, 0.4, 'M', 0.6, 0.44, 'Q', 0.74, 0.44, 0.8, 0.48], lw: 0.018, f: '#D6C6A6' }
      ];
    },
    lancelet: () => {
      const my = []; for (let i = 0; i < 13; i++) { const x = -0.7 + i * 0.11; my.push('M', x, -0.075, 'L', x + 0.045, 0.0, 'L', x, 0.075); }
      return [
        { d: ['M', -0.96, 0.02, 'C', -0.6, -0.12, 0.4, -0.14, 0.95, 0.0, 'C', 0.4, 0.12, -0.6, 0.14, -0.96, 0.02, 'Z'], f: 'rgba(240,226,200,.92)', b: 1 },
        { d: my, lw: 0.01, f: 'rgba(150,110,70,.6)' },
        { d: ['M', -0.9, 0.015, 'L', 0.88, 0.0], lw: 0.014, f: 'rgba(170,120,70,.75)' },
        { d: ['M', 0.88, 0.01, 'L', 0.98, 0.06, 'M', 0.88, 0.01, 'L', 0.99, 0.0, 'M', 0.88, 0.01, 'L', 0.97, -0.04], lw: 0.008, f: 'rgba(120,90,60,.7)' }
      ];
    },
    lamprey: () => [
      { d: ['M', -0.9, 0.5, 'C', -0.3, 0.7, 0.4, 0.45, 0.2, 0.1, 'C', 0.05, -0.2, -0.5, -0.1, -0.3, -0.42, 'C', -0.15, -0.62, 0.35, -0.6, 0.6, -0.5], lw: 0.13, f: '#6E6248', b: 1 },
      { d: ['M', -0.9, 0.5, 'C', -0.3, 0.7, 0.4, 0.45, 0.2, 0.1, 'C', 0.05, -0.2, -0.5, -0.1, -0.3, -0.42, 'C', -0.15, -0.62, 0.35, -0.6, 0.6, -0.5], lw: 0.04, f: 'rgba(200,190,150,.55)' },
      { d: ['E', 0.66, -0.48, 0.1, 0.1, 0], f: '#8A7B5A', b: 1 }, { d: ['E', 0.68, -0.48, 0.055, 0.055, 0], f: '#E0C7A0', s: O },
      { d: ['E', 0.48, -0.56, 0.02, 0.02, 0, 'E', 0.4, -0.57, 0.015, 0.015, 0, 'E', 0.34, -0.575, 0.015, 0.015, 0, 'E', 0.28, -0.575, 0.015, 0.015, 0, 'E', 0.22, -0.57, 0.015, 0.015, 0, 'E', 0.16, -0.56, 0.015, 0.015, 0, 'E', 0.1, -0.55, 0.015, 0.015, 0], f: '#1E1810', s: 0 }
    ]
  };
  return { get(k) { if (!K[k] && B[k]) K[k] = B[k](); return K[k] || null; } };
})();

/* ---- this unit's chart type (registered guarded): one bar per plate, tree or root; dashed par or fewest steps ---- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.tt_bars) LiveGraph.T.tt_bars = {
  lay(w, h, spec, T, c) { const n = (spec.cols || []).length || 1, G = wgXY(w, h, Object.assign({}, spec, { x: { lo: -0.6, hi: n - 0.4 } }), T, c, { xlo: -0.6, xhi: n - 0.4, ylo: 0, yhi: (spec.y && spec.y.hi) || 1, labels: [] }); G.nextX = null; return G; },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, cols = spec.cols || [], bw = Math.min(34, p.w / Math.max(1, cols.length) * 0.5);
    wgAxes(c, G, spec, T, { noX: true });
    cols.forEach((b, i) => {
      const x = G.X(i);
      if (b.cur) { c.fillStyle = wgRgba(I.text, 0.08); c.fillRect(x - bw * 0.9, p.y, bw * 1.8, p.h); }
      if (wgFin(b.v)) { const y = G.Y(Math.max(0, b.v)); c.fillStyle = I.text; c.fillRect(x - bw / 2, y, bw, p.y + p.h - y); }
      if (wgFin(b.best)) { const y = G.Y(b.best); c.setLineDash([5, 3]); c.lineWidth = 2.5; c.strokeStyle = I.text; c.beginPath(); c.moveTo(x - bw * 0.85, y); c.lineTo(x + bw * 0.85, y); c.stroke(); c.setLineDash([]); }
      if (!T.compact || cols.length <= 6) wgText(c, b.label, x, p.y + p.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
    });
    if (!T.compact && spec.bestLabel && cols.some(b => wgFin(b.best))) wgText(c, '- - ' + spec.bestLabel, p.x + p.w - 4, p.y + G.tk / 2 + 3, G.tk, I.text, { align: 'right', fam: 'b', wt: 600, halo: I.surface });
  },
  rows(spec) { return { head: ['', 'value', 'dashed'], rows: (spec.cols || []).map(b => [b.label, wgFin(b.v) ? String(b.v) : '', wgFin(b.best) ? String(b.best) : '']) }; },
  say(spec) { return (spec.cols || []).filter(b => wgFin(b.v)).map(b => b.label + ' ' + b.v).join(', '); }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.tree = TT_TEXT.take;
  MODEL.tree = 'Fixed trees of real animals. Swings swap branches at a joint; parsimony counts the fewest present-or-absent trait changes each tree needs (Fitch); rooting re-reads the same unrooted tree from one branch. Traits are a few textbook characters, not whole data sets.';
  RECALL.tree = { q: 'A tree is redrawn with the two branches at one joint swapped. What changed?', opts: [['n', 'Nothing about who is related to whom'], ['o', 'Which tip is the most advanced'], ['r', 'Where the root is']], ans: 'n', why: 'A swing changes the drawing only. Shared ancestors, and so relatedness, stay the same.' };
  BRIDGE.tree = 'You have watched lineages change and split. Now read the branching pattern they leave.';
  if (TRANSFER.tree) delete TRANSFER.tree;
}
