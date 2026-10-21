/* ================= v2/switch.js: Switches (CH_SWITCH_V2; D1 §3.9, D5 §4 item 12, D6) =================
   World (D6 addendum 7): a dark-field fluorescence microscope. Hox expression glows as fluorescent stains on black; the
   larva's cuticle shines white under dark-field, then the adult unfolds. The boss moves to a cold freshwater lake.
   Role: experimenter at the bench (L1–L5), then the selective environment stocking a lake's predators (L6). The player
   never sets an organism's own heritable trait in a population: the bench flies are single engineered embryos.
     L1 Paint the segments   seven columns × five Hox genes; the gene furthest back wins (posterior prevalence). Three
                             ordered flies (bithorax, Antennapedia, halteres for wings), then two heat-shock vials: predict legs.
     L2 Legs on the abdomen? delete abd-A and mark which segments grow legs (no new ones: Ubx still stops them); build legs
                             on A1 the real way (Ubx down in A1, Lewis's bithoraxoid); then call Lewis's whole-complex deletion.
     L3 Colinearity          the chromosome's Hox cluster fans out to each gene's front edge; rebuild four mutants by edges.
     L4 Body plans           crustaceans: where Ubx/abd-A begins sets how many thoracic legs are feeding legs (Averof & Patel
                             1997); build three, then predict the mantis shrimp's edge on the graph (transfer).
     L5 The circuit board    Pitx1: three enhancers and a coding sequence; test changes on embryos (mark which tissues go
                             dark), then send the one change that removes only the pelvis (Chan et al. 2010).
     L6 The lake (boss)      stock trout or dragonfly nymphs; a recessive pelvic-enhancer deletion arises by recurrent
                             mutation (×N). Predict its share at generation 40, then after the trout return. Inverts L1–L5:
                             no hand sets the switch; predators decide which spreads, and a recessive one starts slowly.
   Every prediction is scored against the model's expectation (the identity rule, or an exact recursion), never the
   realised run. A run is (seed, level, actions); the view juices from Sim.run's events only. Load rule: top level touches
   legacy objects only; engine calls are inside functions or behind typeof guards. */

/* ---------- constants and pure helpers (Det-safe: + − × ÷ and comparisons only) ---------- */
const SWK = {
  G: ['Scr', 'Antp', 'Ubx', 'abdA', 'AbdB'],                                   // rows, front to back on the chromosome
  WT: [[0, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1], [0, 0, 0, 1, 2, 2, 2], [0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1]],   // Ubx: 1 low, 2 high
  WB: [1, 1, 3, 5, 6],                                                          // L3 wild-type front edges (column; 7 = off)
  TGT: { bx: ['H', 'T1', 'T2', 'T2', 'A1', 'A', 'A8'], antp: ['T2', 'T1', 'T2', 'T3', 'A1', 'A', 'A8'], cbx: ['H', 'T1', 'T3', 'T3', 'A1', 'A', 'A8'],
    legsA1: ['H', 'T1', 'T2', 'T3', 'T3', 'A', 'A8'] },
  SOL: { bx: [2, 3, 0], antp: [1, 0, 1], cbx: [2, 2, 1], legsA1: [2, 4, 1] },  // the one-cell solution shown after three tries
  VIAL: { antpAll: [[1, 1]], ubxAll: [[2, 2]], ubxDel: [[2, 0]], bxcDel: [[2, 0], [3, 0], [4, 0]], abdADel: [[3, 0]] },   // [row, value in every column]
  VIALS: ['antpAll', 'ubxAll', 'ubxDel', 'bxcDel'],
  MUT: { antpH: [1, 0, 3, 5, 6], bx: [1, 1, 4, 5, 6], cbx: [1, 1, 2, 5, 6], bxd: [1, 1, 5, 5, 6], abdA: [1, 1, 3, 7, 6], abdB: [1, 1, 3, 5, 5], scr: [7, 1, 3, 5, 6] },
  CR: { artemia: { nT: 11, maxi: 0 }, isopod: { nT: 8, maxi: 1 }, lobster: { nT: 8, maxi: 3 }, mantis: { nT: 8, maxi: 5 } },
  MOD: ['pit', 'jaw', 'pel', 'stop', 'swap'],
  DARK: { pit: [1, 0, 0], jaw: [0, 1, 0], pel: [0, 0, 1], stop: [1, 1, 1], swap: [1, 1, 1] },
  FATE: { pit: 'dies', jaw: 'sick', pel: 'clean', stop: 'dies', swap: 'sick' },
  LAKE: { N: 200, SHOW: 80, MU: 0.01, K: 0.1, MAX: 4, ASK0: 4, FORCE: 10, FLIP: 40, END: 60, GAIN: 0.25 },
  T: { hatch: 1.9, hatchR: 1.1, judge: 1.4, judgeR: 0.9, askMax: 45, test: 2.4, send: 2.4, gen: 1.25, fast: 0.3 },
  TRIES: 3, TOL: { v1: 0.5, v2: 0.5, t4: 0.5, p6: 0.1, t6: 0.1 },
  NYM: [[70, 486], [150, 494], [240, 488], [320, 492]], TRO: [[90, 230], [300, 210], [190, 300], [110, 360]],
  lay: {}
};
function swIdent(grid) {   // posterior prevalence: the most posterior gene switched on sets each column's identity
  const out = [];
  for (let j = 0; j < 7; j++) {
    let top = -1; for (let g = 0; g < 5; g++) if (grid[g][j] > 0) top = g;
    out.push(top < 0 ? 'H' : top === 0 ? 'T1' : top === 1 ? 'T2' : top === 2 ? (grid[2][j] === 1 ? 'T3' : 'A1') : top === 3 ? 'A' : 'A8');
  }
  return out;
}
const swLegCol = x => x === 'T1' || x === 'T2' || x === 'T3';
const swLegs = ids => ids.filter(swLegCol).length;
const swLegSet = ids => ids.map(x => swLegCol(x) ? 1 : 0);
const swCopy = g => g.map(r => r.slice());
const swSame = (a, b) => !!a && !!b && a.length === b.length && a.every((x, i) => x === b[i]);
function swVial(key) { const g = swCopy(SWK.WT); for (const [r, v] of SWK.VIAL[key]) g[r] = g[r].map(() => v); return g; }
function swGridB(b) {   // L3: each gene on from its front edge to the back; Scr kept one segment wide; Ubx low up to T3, high from A1
  const g = [[], [], [], [], []];
  for (let j = 0; j < 7; j++) { g[0][j] = j === b[0] ? 1 : 0; g[1][j] = j >= b[1] ? 1 : 0; g[2][j] = j >= b[2] ? (j <= 3 ? 1 : 2) : 0; g[3][j] = j >= b[3] ? 1 : 0; g[4][j] = j >= b[4] ? 1 : 0; }
  return g;
}
function swLay(mu) {   // the lake's Pitx1 pelvic enhancer: allele 1 intact (dominant: spines), 0 deleted; intact → deleted at rate mu
  const k = 'm' + mu; if (!SWK.lay[k]) SWK.lay[k] = Gen.layout([{ k: 'pel', kind: 'dom', n: 1, p0: 1, mu: 0, back: mu, det: true }]);
  return SWK.lay[k];
}
// the deletion's expected share after `gens` generations in an infinite lake: selection on survival, then mutation in the gametes
function swLakeRec(q, T, M, gens, mu, dom) {
  const K = SWK.LAKE.K, vs = 1 - K * M, vn = 1 - K * T;
  for (let g = 0; g < gens; g++) {
    const p = 1 - q, dd = q * q, w = dom ? p * p * vs + (1 - p * p) * vn : (1 - dd) * vs + dd * vn;
    const qs = dom ? (dd * vn + p * q * vn) / w : (dd * vn + p * q * vs) / w;
    q = qs + mu * (1 - qs);
  }
  return q;
}

/* ---------- all words (API_v2 §9.2; D4 budgets; British spelling) ---------- */
const SW_C = {
  firstWords: 'You are building flies under the microscope. Each glowing cell switches a Hox gene on in one segment. Tap a cell, then Hatch.',
  hud: {
    bx: 'Order: a fly with four wings. Change one cell, then Hatch.',
    antp: 'Order: legs where the antennae should be. Change one cell, then Hatch.',
    cbx: 'Order: halteres where the wings should be. Change one cell, then Hatch.',
    vial: 'Heat shock: {gene} in every segment. Drag: how many pairs of legs?',
    del: 'Deleted: {gene}. Drag: how many pairs of legs will it have?',
    t1: 'abd-A is deleted. Tap every segment that will grow legs, then Lock in.',
    legsA1: 'Order: legs on A1, the first abdominal segment. Paint, then Hatch.',
    t2: 'Lewis deleted Ubx, abd-A and Abd-B. Tap every segment with legs.',
    mut: 'Mutant {n} of 4. Drag the coloured tabs to rebuild it, then Hatch.',
    cr_artemia: 'Order: a brine shrimp with no feeding legs. Drag the magenta edge, then Check.',
    cr_isopod: 'Order: a woodlouse with one pair of feeding legs. Drag the magenta edge.',
    cr_lobster: 'Order: a lobster with three pairs of feeding legs. Drag the magenta edge.',
    t4: 'A mantis shrimp has five pairs of feeding legs. Drag: where does Ubx/abd-A begin?',
    l5: 'Tap a switch on the Pitx1 gene to test it on an embryo.',
    l5ask: 'Tap each tissue you predict will go dark, then Lock in.',
    l5more: 'Test another switch, or Send the last one to the lake.',
    l5pick: 'No embryos left. Tap the switch to send, then Send.',
    l5test: 'The embryo grows. Green shows where Pitx1 is on.',
    l5sent: 'Sent to the lake. Watch the population.',
    lake: 'Your lake. Tap open water to add trout, the weeds for dragonfly nymphs.',
    lakeRun: 'Generation {g} of 60. Spineless fish carry two deleted copies.',
    lakeSet: 'Generation {g} of 60. The season is set.',
    ask1: 'Drag: what share of copies will carry the deletion at generation 40?',
    ask2: 'Trout are back. Drag: the deletion share at generation 60?',
    hatch: 'Hatching: the larva first, then the adult.',
    ok: 'That is the fly.', no: 'Not yet. Compare each segment with the order.',
    shown: 'Three tries used. Here is one way to build it.',
    reveal: 'Hatching the fly you predicted.',
    whatif: 'What if: {lever}? The lake runs on.', wait: 'Done.'
  },
  whispers: {
    built: 'That is the fly!', wrong: 'Not this one: compare each segment.', shown: 'Here is one way to build it.',
    drag: 'Drag the marker first.', tapfirst: 'Tap a segment first.', nomark: 'Tap a tissue, or None.',
    trap: 'No new legs: Ubx still stops them.', bxc: 'Every trunk segment builds legs now.', exact: 'Exactly right.',
    cross: 'Lines crossed: the order broke.', snip: 'Snip! One switch cut.', dies: 'Not viable: no pituitary.',
    sick: 'Alive, but damaged elsewhere.', clean: 'Pelvis gone; nothing else changed.',
    locked: 'The season is set.', full: 'At most four of each.', weeds: 'Weed beds spread: nymphs move in.',
    flip: 'Trout stocked; the weed beds silt up.', idle: 'Tap a glowing cell.', reset: 'Back to the wild type.',
    sent: 'The lake gets this change.', retest: 'Tested before: try another switch.'
  },
  labels: {
    c0: 'head', c1: 'T1', c2: 'T2', c3: 'T3', c4: 'A1', c5: 'A2–A7', c6: 'A8',
    g0: 'Scr', g1: 'Antp', g2: 'Ubx', g3: 'abd-A', g4: 'Abd-B',
    idH: 'antennae', idT1: 'legs', idT2: 'legs, wings', idT3: 'legs, halteres', idA1: 'bare (A1)', idA: 'bare abdomen', idA8: 'tail end',
    order: 'Order', yours: 'Your fly', deleted: 'deleted', off: 'off', antc: 'ANT-C', bxc: 'BX-C', scale: '100 µm',
    ban0: 'Paint the segments', ban1: 'Abdominal legs?', ban2: 'Colinearity', ban3: 'Body plans', ban4: 'Circuit board', ban5: 'The lake',
    artemia: 'brine shrimp', isopod: 'woodlouse', lobster: 'lobster', mantis: 'mantis shrimp', feed: 'feeding legs', walk: 'walking legs',
    pit: 'pituitary', jaw: 'jaw', pel: 'pelvis', mpit: 'pituitary enhancer', mjaw: 'jaw enhancer', mpel: 'pelvic enhancer', mstop: 'exon: stop', mswap: 'exon: swap',
    pitx1: 'Pitx1', enh: 'enhancers', code: 'coding sequence', dark: 'dark?', dies: 'not viable', sick: 'damaged', clean: 'healthy', embryos: 'embryos',
    trout: 'trout', nymph: 'nymph', weeds: 'weed bed', xn: 'mutation ×N', spiny: 'spiny', spineless: 'spineless',
    hatch: 'Hatch', check: 'Check', reset: 'Reset', lock: 'Lock in', skip: 'Skip', send: 'Send', none: 'None', addT: 'Add trout', addN: 'Add nymph', set: 'Season set',
    chRow: 'Segment identities', chLegs: 'Legs per fly', chOrd: 'Order and edges', chCr: 'Feeding legs', chTest: 'Tissues changed', chLake: 'Deletion share',
    fly: 'fly', legPairs: 'leg pairs', geneOrd: 'gene on chromosome', edge: 'front edge', crEdge: 'Ubx/abd-A edge', crPairs: 'feeding pairs',
    test: 'test', tissues: 'tissues', gen: 'generation', share: 'deletion share', flies: 'flies', wt: 'wild type', built: 'built',
    mine: 'yours', calls: 'your call', expected: 'expected', dominant: 'if dominant', del: 'deletion', ss: 'spineless'
  },
  interesting: {
    l1_vial: 'The gene furthest back wins. Painting a gene everywhere changes only segments where nothing further back is on.',
    l1_tries: 'Some orders took several tries. One cell in the right segment is enough; extra cells change other segments too.',
    l2_trap: 'You expected legs without abd-A. Ubx is still on there, and it stops legs too.',
    l2_bxc: 'With the whole bithorax complex gone, Antp is the gene furthest back, so every trunk segment builds legs.',
    l2_shown: 'Legs on A1 come from turning Ubx down or off there, as in Lewis’s bithoraxoid flies.',
    l3_tries: 'Find the segment that changed, then the gene that sets it. That gene’s edge moved.',
    l4_miss: 'Feeding legs sit in front of the Ubx/abd-A edge. Five pairs puts the edge at the sixth segment.',
    l5_code: 'A coding change hit every tissue that uses Pitx1. An enhancer cut changes only its own tissue.',
    l5_wrong: 'That switch removed something other than the pelvis. Each enhancer works in one tissue.',
    l5_pred: 'Your tissue calls were off. Cutting an enhancer darkens one tissue; breaking the protein darkens all three.',
    l6_low: 'You expected a slower rise. Once spineless fish were common, selection saw most copies and the deletion raced up.',
    l6_high: 'You expected a faster rise. While rare, the deletion hid in spiny fish that also carry a working copy.',
    l6_gone: 'You expected trout to clear it. Rare again, it hid in spiny carriers, and new mutations topped it up.',
    l6_stay: 'You expected it to hang on. Common spineless fish were easy prey, so it fell fast at first.',
    l6_drift: 'Chance in a lake of 200 fish pushed this run away from the expected curve.',
    w_dom: 'A dominant deletion was seen by selection from its first copies, so it rose fast.',
    w_domfall: 'A dominant deletion shows in every carrier, so the trout cleared it faster.',
    w_nomut: 'Without new mutations, nothing topped the deletion up, so it ended lower.',
    w_nomut_lost: 'Without new mutations, the few copies were lost by chance.',
    w_chance: 'This rerun went against the usual trend. In a lake this small, chance is strong.'
  },
  levers: { dom: 'Dominant deletion', nomut: 'No new mutations' },
  take: 'Hox selector genes set segment identity; changing where a gene switches on changes form with fewer side effects.',
  body: 'In each segment the Hox gene furthest back sets what grows there. The genes sit on the chromosome in body order. Shifting where they switch on remakes crustacean legs. An enhancer cut removes one part and spares the rest. Whether that change spreads is up to the lake.',
  levelTake: [
    'The gene furthest back in a segment sets what it builds: posterior prevalence.',
    'Hox genes switch legs off in the abdomen; without abd-A, Ubx does the same job.',
    'Hox genes sit on the chromosome in the same order as the body parts they set.',
    'Moving where Ubx and abd-A begin turned walking legs into feeding legs across crustaceans.',
    'An enhancer changes one tissue; a coding change hits every tissue that uses the gene.'],
  law: { title: 'Switches, not new genes' },
  boss: { inverts: 'You set switches by hand; in the lake, predators select which switch spreads, and slowly.' },
  stars: { discover: 'Build the flies the orders ask for.', predict: 'Call a bench mutant and the lake curve inside their bands.', transfer: 'Place the mantis shrimp edge and the trout lake inside the bands.' },
  levelStars: [
    { discover: 'Build all three ordered flies.', predict: 'Count the legs of both heat-shocked flies.' },
    { discover: 'Put legs on A1 the way real flies do.', predict: 'Mark the legged segments, missing at most one.' },
    { discover: 'Rebuild three of the four mutants.', predict: 'Rebuild three mutants on the first try.' },
    { discover: 'Build all three crustaceans.', transfer: 'Place the mantis shrimp edge exactly.' },
    { discover: 'Send the change that removes only the pelvis.', predict: 'Call three different tests, missing at most one tissue.' },
    { predict: 'Predict generation 40 inside the band.', transfer: 'Predict generation 60 inside the band.' }],
  model: [
    { level: 0, simulated: 'Five Hox genes across seven columns: head, three thoracic, A1, the middle abdomen as one, and A8. The gene furthest back sets each column.',
      simplification: 'Ubx has two designed doses: low makes T3, high makes A1. Antp is on along the whole trunk, hidden behind genes further back. With no Hox gene a segment builds antennae.',
      params: [{ name: 'genes', value: '5 of the 8 fly Hox genes', tag: 'designed' }, { name: 'Ubx dose', value: 'off, low or high', tag: 'designed' }, { name: 'columns', value: '7 (A2–A7 as one)', tag: 'designed' }],
      cannot: 'Graded, overlapping domains, parasegments, or Hox genes switching each other off. Most of these flies would die as embryos.',
      nature: 'Lewis (1978) studied bithorax flies with four wings. Antp switched on in the head turns antennae into legs (Schneuwly et al. 1987). Ubx everywhere makes the thorax A1-like (González-Reyes & Morata 1990).',
      contested: false, refs: ['lewis1978', 'schneuwly1987', 'gonzalezreyes1990', 'duboule1994', 'struhl1981'] },
    { level: 1, simulated: 'The same grid. abd-A, or the whole bithorax complex (Ubx, abd-A, Abd-B), can be deleted. Legs grow where a column’s identity is thoracic.',
      simplification: 'Leg suppression is folded into identity: T1 to T3 make legs; A1 and the abdomen do not. Real abdominal Hox proteins switch off Distal-less, a leg gene.',
      params: [{ name: 'deletions', value: 'whole rows, every segment', tag: 'designed' }, { name: 'legs', value: 'one pair per thoracic column', tag: 'designed' }],
      cannot: 'Larvae have no legs; biologists read identity from the larval cuticle. The adults are drawn to show what each segment would build.',
      nature: 'Losing abd-A gives legless, A1-like segments (Sánchez-Herrero et al. 1985). Abdominal Hox genes repress Distal-less (Vachon et al. 1992). Deleting the whole complex makes every segment behind T2 T2-like (Lewis 1978).',
      contested: false, refs: ['sanchezherrero1985', 'vachon1992', 'lewis1978', 'nussleinvolhard1980'] },
    { level: 2, simulated: 'Each gene is on from its front edge to the back of the body. Scr is kept one segment wide. Moving an edge changes the segments it passes.',
      simplification: 'Ubx is low up to T3 and high from A1 back. Edges snap to whole segments.',
      params: [{ name: 'front edges', value: 'T1, T1, T3, A2–A7, A8', tag: 'designed' }, { name: 'mutants', value: '4 of 7, one edge each', tag: 'designed' }],
      cannot: 'Real edges follow parasegments, offset by half a segment, and are placed by earlier gap and pair-rule genes.',
      nature: 'Fly Hox genes lie on the chromosome in the order of the body parts they pattern (Lewis 1978). Mice and other animals share it (McGinnis & Krumlauf 1992).',
      contested: false, refs: ['lewis1978', 'mcginnis1992', 'duboule1994'] },
    { level: 3, simulated: 'Thoracic segments in front of the Ubx/abd-A edge build feeding legs (maxillipeds). Segments behind it build walking or swimming legs.',
      simplification: 'Ubx and abd-A are read as one stain, as with the antibody used in the studies. One edge sets every leg type.',
      params: [{ name: 'brine shrimp', value: '0 pairs; edge at T1', tag: 'realistic' }, { name: 'woodlouse', value: '1 pair; edge at T2', tag: 'realistic' },
        { name: 'lobster', value: '3 pairs; edge at T4', tag: 'realistic' }, { name: 'mantis shrimp', value: '5 pairs; edge predicted by the rule', tag: 'designed' }],
      cannot: 'Which change came first, or the many other genes that shape a feeding leg.',
      nature: 'Across crustaceans, the front edge of Ubx/abd-A tracks the number of feeding legs (Averof & Patel 1997). Changing Ubx in an amphipod shifts which legs look like feeding legs (Liubicich et al. 2009; Pavlopoulos et al. 2009).',
      contested: false, refs: ['averof1997', 'averof1995', 'liubicich2009', 'pavlopoulos2009'] },
    { level: 4, simulated: 'Pitx1 has three enhancers: pituitary, jaw and pelvis. One coding sequence serves all three. A green reporter shows where it is on.',
      simplification: 'Fates are designed: losing the pituitary is not viable; a weaker protein dims every tissue. The gene is drawn as a simple board.',
      params: [{ name: 'tissues', value: '3 of the several that use Pitx1', tag: 'designed' }, { name: 'test embryos', value: '4', tag: 'designed' }],
      cannot: 'Partial deletions, other tissues, or why wild fish keep a slightly larger pelvic remnant on the left.',
      nature: 'Freshwater sticklebacks lost pelvic spines through deletions of the pelvic enhancer, leaving the protein intact (Chan et al. 2010). Mice lacking Pitx1 have hindlimb and pituitary defects (Szeto et al. 1999).',
      contested: false, refs: ['chan2010', 'shapiro2004', 'szeto1999', 'carroll2005', 'stern2008'] },
    { level: 5, simulated: 'A lake of 200 sticklebacks; you see 80. A recessive pelvic-enhancer deletion arises by recurrent mutation. Survivors pair at random.',
      simplification: 'Each nymph lowers a spiny fish’s survival by 10 points; each trout does the same to spineless fish. Why real lakes favour spine loss is debated.',
      params: [{ name: 'intact to deleted', value: '1 copy in 100 a generation', tag: 'xN', real: 'far rarer, though repeat-rich DNA may raise it' },
        { name: 'each predator', value: '10 points of survival', tag: 'xN', real: 'weaker' }, { name: 'fish', value: '200', tag: 'designed' },
        { name: 'generations', value: '60', tag: 'xN', real: 'hundreds to thousands' }],
      cannot: 'Armour plates, calcium, or the left-larger pelvic remnants of wild fish.',
      nature: 'The deletions bear signatures of positive selection (Chan et al. 2010). Fish predators reject spiny prey (Hoogland et al. 1956). Insect predators and low calcium are proposed causes of spine loss (Reimchen 1980; Bell et al. 1993).',
      contested: true, refs: ['chan2010', 'shapiro2004', 'hoogland1956', 'reimchen1980', 'bell1993', 'marchinko2009', 'haldane1924'] }
  ],
  why: {
    real: ['Edward Lewis studied bithorax mutants for decades: flies with four wings, or legs on the first abdominal segment. Hox genes sit in the order of the body parts they pattern. In each segment the gene furthest back usually wins.',
      'Freshwater sticklebacks have lost pelvic spines again and again by deleting one Pitx1 enhancer. The protein stays for jaw and pituitary. How much evolution runs through enhancers rather than proteins is still debated (Hoekstra & Coyne 2007).'],
    maths: ['Identity is set by the most posterior gene switched on: Abd-B, then abd-A, Ubx, Antp, Scr. With none, a segment builds antennae. Ubx low makes T3; Ubx high makes A1.',
      'A rare recessive allele at share q shows only in the q² fish with two copies. So Δq ≈ s q² (1 − q). A dominant one shows in about 2q fish, so it starts far faster.']
  }
};
// D6 addendum 8: the opening card (00_entry draws it); each part ≤ 35 words. Addendum 7: this chapter's own accent (stain magenta)
SW_C.intro = {
  game: 'At a fluorescence microscope, you switch Hox genes on and off in fly embryos and hatch the results. Later you run a stickleback lake.',
  biology: 'Hox genes set what each body segment builds: legs, wings or nothing. Changing where a gene switches on changes form, and selection decides which changes spread.',
  how: 'Tap glowing cells or drag coloured edges, then Hatch to see the fly. When asked, drag the marker or tap segments to predict.'
};
const SW_ACCENT = '#D63CC4';
const SW_INK = { Scr: [64, 226, 245], Antp: [166, 245, 60], Ubx: [255, 69, 214], abdA: [176, 140, 255], AbdB: [255, 122, 138],
  white: [236, 242, 255], dim: [110, 122, 150], gfp: [120, 255, 120], water: [6, 32, 40] };
const SW_TOP = { H: -1, T1: 0, T2: 1, T3: 2, A1: 2, A: 3, A8: 4 };   // which gene's stain tints a column of this identity

const CH_SWITCH_V2 = {
  id: 'switch', v2: true, role: 'experimenter', place: 'lab', accent: SW_ACCENT, plan: ['Switches', 'Evo-devo: Hox genes and enhancers'],
  intro: { goal: 'Rewire Hox genes, hatch flies, then let a lake decide.' },
  content: SW_C,
  P: {
    mu: { v: 0.01, tag: 'xN', min: 0, max: 0.05, real: 'far rarer', label: 'deletion rate (L6)' },
    k: { v: 0.1, tag: 'xN', min: 0.02, max: 0.2, real: 'weaker', label: 'survival per predator (L6)' },
    N: { v: 200, tag: 'designed', min: 50, max: 400, label: 'fish in the lake' },
    tries: { v: 3, tag: 'designed', min: 1, max: 5, label: 'tries per order' }
  },
  levels: [
    { name: 'Paint the segments', adds: 'the gene furthest back wins', codes: ['K1'], minutes: 3 },
    { name: 'Legs on the abdomen?', adds: 'Hox genes that stop legs', codes: ['K1'], minutes: 3 },
    { name: 'Colinearity', adds: 'the order on the chromosome', codes: ['K1'], minutes: 4 },
    { name: 'Body plans', adds: 'other arthropod bodies', codes: ['K2'], minutes: 3 },
    { name: 'The circuit board', adds: 'enhancers against coding changes', codes: ['K2'], minutes: 3 },
    { name: 'The lake', adds: 'selection in a population', codes: ['K2', 'E3'], minutes: 4 }
  ],
  keys: { ArrowLeft: 'move', ArrowRight: 'move', ArrowUp: 'move', ArrowDown: 'move', Space: 'switch or mark', Enter: 'hatch or lock in', R: 'reset', T: 'add trout', N: 'add nymph', X: 'remove a predator', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['In a segment where Ubx and abd-A are both on, which one sets what grows there?', 'Why are whole-segment changes rare in evolution, while enhancer changes are common?', 'This model has five genes and seven segments. What does it hide about real Hox regulation?'], pool: 'trace' },
  // genes differ by row position and name as well as stain; identities differ by shape (antenna, leg, wing, haltere); fish by the pelvic spine (shape)
  encodings: [{ k: 'Scr', rgb: SW_INK.Scr, channels: ['colour', 'letter', 'position'] }, { k: 'Antp', rgb: SW_INK.Antp, channels: ['colour', 'letter', 'position'] },
    { k: 'Ubx', rgb: SW_INK.Ubx, channels: ['colour', 'letter', 'position'] }, { k: 'abdA', rgb: SW_INK.abdA, channels: ['colour', 'letter', 'position'] },
    { k: 'AbdB', rgb: SW_INK.AbdB, channels: ['colour', 'letter', 'position'] }, { k: 'identity', rgb: SW_INK.white, channels: ['shape', 'position'] }],
  starTraits: ['identity'],

  /* ---------- headless simulation (API_v2 §9.3): R(), Det, Gen only ---------- */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {};
      if (o.thaw) {   // What if? (L6): restore a frozen generation, apply one lever, run on without asks
        this.restore(o.thaw.snap); const t = this.s; t.log = []; t.thawed = true; t.ask = null; t.locked = true; if (t.phase === 'ask') t.phase = 'lake';
        t.lever = o.thaw.lever || null; if (t.lever === 'dom') t.dom = true; if (t.lever === 'nomut') t.mu = 0; t.th0 = { gen: t.gen, q: this.q() }; return;
      }
      const K = SWK;
      this.s = { level, phase: 'paint', t: 0, unt: !!(o.untimed != null ? o.untimed : (Save.d && Save.d.ui && Save.d.ui.unt)), log: [], started: 0,
        jobs: [], job: 0, tries: 0, solvedN: 0, first: 0, shownN: 0, solved: {}, hatchN: 0, grid: swCopy(K.WT), ids: null, ok: false, shown: false,
        ask: null, pred: {}, exp: {}, hit: {}, cnt: {}, ham: {}, mark: [0, 0, 0, 0, 0, 0, 0], edits: 0, pts: [], thawed: false, lever: null, cross: 0 };
      const s = this.s, pick = a => a.splice((R() * a.length) | 0, 1)[0];
      if (level === 0) { const v = K.VIALS.slice(), a = pick(v), b = pick(v); s.jobs = [{ k: 'build', id: 'bx' }, { k: 'build', id: 'antp' }, { k: 'build', id: 'cbx' }, { k: 'vial', id: 'v1', v: a, x: 4 }, { k: 'vial', id: 'v2', v: b, x: 5 }]; }
      else if (level === 1) s.jobs = [{ k: 'tap', id: 't1', v: 'abdADel' }, { k: 'build', id: 'legsA1' }, { k: 'tap', id: 't2', v: 'bxcDel' }];
      else if (level === 2) { const m = Object.keys(K.MUT); for (let i = 0; i < 4; i++) s.jobs.push({ k: 'bound', id: pick(m) }); s.b = K.WB.slice(); }
      else if (level === 3) { const c = ['artemia', 'isopod', 'lobster']; for (let i = 0; i < 3; i++) s.jobs.push({ k: 'crust', id: pick(c) }); s.jobs.push({ k: 'askx', id: 't4' }); s.ub = 1; }
      if (level <= 3) { this.startJob(); return; }
      if (level === 4) { Object.assign(s, { phase: 'choose', tests: [], sel: null, tis: [0, 0, 0], none: false, sent: null, left: 4 }); return; }
      const L = K.LAKE, lay = swLay(L.MU), q0 = 0.02 + 0.02 * R();   // L6: a trout lake; the deletion rare
      Object.assign(s, { phase: 'lake', fish: [], nextId: 1, gen: 1, mu: L.MU, dom: false, locked: false, hunted: 0, asked: {},
        preds: [{ type: 't', x: K.TRO[0][0], y: K.TRO[0][1] }, { type: 't', x: K.TRO[1][0], y: K.TRO[1][1] }], hist: [] });
      for (let i = 0; i < L.N; i++) s.fish.push({ g: Gen.genome(lay, { pel: { p: 1 - q0 } }), id: s.nextId++, dead: 0 });
      s.hist.push(this.rec());
    },
    /* ---------- the bench (L1–L4): orders, vials and asks ---------- */
    startJob() {
      const s = this.s, J = s.jobs[s.job], K = SWK; s.tries = 0; s.edits = 0; s.ids = null; s.ok = false; s.shown = false; s.t = 0; s.mark = [0, 0, 0, 0, 0, 0, 0]; s.ask = null;
      if (!J) { s.phase = 'over'; return; }
      if (J.k === 'build') { s.grid = swCopy(K.WT); s.phase = 'paint'; }
      else if (J.k === 'vial' || J.k === 'tap') { s.grid = swVial(J.v); s.phase = 'ask'; s.ask = J.k === 'vial' ? { id: J.id, kind: 'y', lo: 0, hi: 7, tol: K.TOL[J.id], at: J.x } : { id: J.id, kind: 'set' }; }
      else if (J.k === 'bound') { s.b = K.WB.slice(); s.grid = swGridB(s.b); s.phase = 'paint'; s.cross = 0; }
      else if (J.k === 'crust') { s.ub = K.CR[J.id].nT + 1; s.phase = 'paint'; }
      else if (J.k === 'askx') { s.ub = 1; s.phase = 'ask'; s.ask = { id: 't4', kind: 'x', lo: 1, hi: 9, tol: K.TOL.t4, at: K.CR.mantis.maxi }; }
    },
    target(J) {   // the order: an identity row (flies) or a number of feeding-leg pairs (crustaceans)
      if (!J) return null;
      if (J.k === 'build') return SWK.TGT[J.id];
      if (J.k === 'bound') return swIdent(swGridB(SWK.MUT[J.id]));
      if (J.k === 'crust') return SWK.CR[J.id].maxi;
      return null;
    },
    match(J) {
      const s = this.s, ids = swIdent(s.grid);
      if (J.k === 'crust') return s.ub - 1 === SWK.CR[J.id].maxi;
      if (J.id === 'legsA1') { const W = SWK.TGT.legsA1; return (ids[4] === 'T2' || ids[4] === 'T3') && ids.every((x, j) => j === 4 || x === W[j]); }   // Ubx low or off in A1
      return swSame(ids, this.target(J));
    },
    hatch(ev) {
      const s = this.s, J = s.jobs[s.job];
      s.ids = swIdent(s.grid); s.ok = this.match(J); s.phase = 'hatch'; s.t = 0; s.hatchN++;
      ev.push({ k: 'hatch', ok: s.ok });
    },
    showSolution() {
      const s = this.s, J = s.jobs[s.job], K = SWK;
      if (J.k === 'build') { s.grid = swCopy(K.WT); const c = K.SOL[J.id]; s.grid[c[0]][c[1]] = c[2]; }
      else if (J.k === 'bound') { s.b = K.MUT[J.id].slice(); s.grid = swGridB(s.b); }
      else if (J.k === 'crust') s.ub = K.CR[J.id].maxi + 1;
      s.ids = swIdent(s.grid); s.ok = true; s.shown = true; s.shownN++;
    },
    addPt() {   // the strip's points: legs per fly (L1), edge against feeding pairs (L4)
      const s = this.s, J = s.jobs[s.job];
      if (s.level === 0) s.pts.push([s.job + 1, swLegs(s.ids || swIdent(s.grid))]);
      if (s.level === 3 && J.k === 'crust') s.pts.push([s.ub, s.ub - 1]);
    },
    afterJudge(ev) {
      const s = this.s, J = s.jobs[s.job];
      if (J.k === 'build' || J.k === 'bound' || J.k === 'crust') {
        if (s.shown) { this.addPt(); this.next(ev); return; }   // the shown solution earns nothing
        if (s.ok) { s.solvedN++; s.solved[J.id] = 1; if (s.tries === 0) s.first++; this.addPt(); this.next(ev); return; }
        s.tries++;
        if (s.tries >= SWK.TRIES) { this.showSolution(); s.phase = 'hatch'; s.t = 0; s.hatchN++; ev.push({ k: 'shown' }); return; }
        s.phase = 'paint'; ev.push({ k: 'retry' }); return;
      }
      if (J.k === 'vial') this.addPt();
      this.next(ev);
    },
    next(ev) { const s = this.s; s.job++; this.startJob(); ev.push({ k: 'job', n: s.job }); if (s.phase === 'over') ev.push({ k: 'over' }); },
    crossed() {   // L3: pairs of genes whose front edges run against their chromosome order (lines that cross in the fan)
      const b = this.s.b; let n = 0; for (let g = 0; g < 5; g++) for (let h = g + 1; h < 5; h++) if (b[g] < 7 && b[h] < 7 && b[g] > b[h]) n++; return n;
    },
    /* ---------- predictions ---------- */
    expect(id) {   // the expectation for an ask, from the model at the parameters in force (D1 G10)
      const s = this.s, L = SWK.LAKE;
      if (id === 'v1' || id === 'v2') return swLegs(swIdent(s.grid));
      if (id === 't4') return SWK.CR.mantis.maxi + 1;
      const c = this.counts(), q = this.q();
      if (id === 'p6') return swLakeRec(q, c[0], c[1], L.FLIP - s.gen, s.mu, s.dom);
      if (id === 't6') return swLakeRec(q, c[0], c[1], L.END - s.gen, s.mu, s.dom);
      return 0;
    },
    current(id) {   // "no change": what the screen shows at the ask
      const s = this.s; if (id === 'v1' || id === 'v2') return 3; if (id === 't4') return 1; if (id === 'p6' || id === 't6') return this.q();
      return 0;
    },
    commit(id, v, ev) {
      const s = this.s, A = s.ask; if (!A || A.id !== id) return;
      const e = this.expect(id), cur = this.current(id), tol = A.tol;
      s.pred[id] = v == null ? null : +v; s.exp[id] = e; s.hit[id] = v != null && Math.abs(+v - e) <= tol + 1e-9; s.cnt[id] = Math.abs(e - cur) >= 2 * tol - 1e-9;
      s.ask = null; ev.push({ k: 'pred', id, hit: s.hit[id], exp: e, tol, counted: s.cnt[id] });
      if (s.level === 5) { s.phase = 'lake'; s.t = 0; if (id === 'p6') s.locked = true; return; }
      if (id === 't4') s.ub = e;
      s.ids = swIdent(s.grid); s.ok = true; s.phase = 'hatch'; s.t = 0; s.hatchN++;   // reveal: hatch the predicted fly (or stain the shrimp)
    },
    lockSet(ev, timeout) {   // L2: the marked segments against the true legged set (Hamming distance)
      const s = this.s, A = s.ask; if (!A) return;
      if (!s.mark.some(Boolean) && !timeout) { ev.push({ k: 'nomark' }); return; }
      const truth = swLegSet(swIdent(s.grid)); let ham = 0; for (let j = 0; j < 7; j++) if (s.mark[j] !== truth[j]) ham++;
      s.ham[A.id] = timeout && !s.mark.some(Boolean) ? 7 : ham; s.pred[A.id] = s.mark.slice(); s.exp[A.id] = truth;
      ev.push({ k: 'pred', id: A.id, set: true, ham: s.ham[A.id], truth });
      s.ask = null; s.ids = swIdent(s.grid); s.ok = true; s.phase = 'hatch'; s.t = 0; s.hatchN++;
    },
    lockTis(ev, timeout) {   // L5: the tissues marked dark against the switch's true effect
      const s = this.s; if (!s.ask) return;
      if (!s.none && !s.tis.some(Boolean) && !timeout) { ev.push({ k: 'nomark' }); return; }
      const m = SWK.MOD[s.sel], truth = SWK.DARK[m], pred = s.none ? [0, 0, 0] : s.tis.slice(); let ham = 0;
      for (let t = 0; t < 3; t++) if (pred[t] !== truth[t]) ham++;
      if (timeout && !s.none && !s.tis.some(Boolean)) ham = 3;
      s.tests.push({ m, ham, pred }); s.left--; s.ask = null; s.phase = 'test'; s.t = 0;
      ev.push({ k: 'test', m, ham, truth, fate: SWK.FATE[m] });
    },
    /* ---------- the lake (L6) ---------- */
    q() { const s = this.s; let d = 0; for (const f of s.fish) { if (f.g[0] < 0.5) d++; if (f.g[1] < 0.5) d++; } return d / (2 * s.fish.length); },
    spiny(g) { const a = g[0] > 0.5, b = g[1] > 0.5; return this.s.dom ? a && b : a || b; },
    counts() { let T = 0, M = 0; for (const p of this.s.preds) { if (p.type === 't') T++; else M++; } return [T, M]; },
    rec() { const s = this.s, c = this.counts(); let ss = 0; for (const f of s.fish) if (!this.spiny(f.g)) ss++; return { gen: s.gen, q: this.q(), dd: ss / s.fish.length, T: c[0], M: c[1] }; },
    hunt(ev) {   // survival: nymphs catch spiny fish by their spines; trout swallow spineless fish and spit out spiny ones
      const s = this.s, L = SWK.LAKE, c = this.counts(), vs = 1 - L.K * c[1], vn = 1 - L.K * c[0], dead = [];
      s.fish.forEach((f, i) => { const sp = this.spiny(f.g); if (R() >= (sp ? vs : vn)) { f.dead = 1; if (i < L.SHOW) dead.push({ i, by: sp ? 'n' : 't' }); } });
      s.hunted = 1; ev.push({ k: 'strike', dead });
    },
    breed(ev) {
      const s = this.s, L = SWK.LAKE, lay = swLay(s.mu), sv = s.fish.filter(f => !f.dead), par = sv.length >= 2 ? sv : s.fish, kids = [];
      for (let i = 0; i < L.N; i++) { const a = par[(R() * par.length) | 0]; let b = par[(R() * par.length) | 0]; for (let t = 0; t < 6 && b === a; t++) b = par[(R() * par.length) | 0]; kids.push({ g: Gen.mate(lay, a.g, b.g), id: s.nextId++, dead: 0 }); }
      s.fish = kids; s.gen++; s.t = 0; s.hunted = 0; s.hist.push(this.rec()); ev.push({ k: 'gen', gen: s.gen });
      this.lakeTurn(ev);
    },
    lakeTurn(ev) {   // asks, the forced weed beds, the trout's return and the end, checked after each breeding
      const s = this.s, L = SWK.LAKE, K = SWK;
      if (s.gen >= L.END) { s.phase = 'over'; s.t = 0; ev.push({ k: 'over' }); return; }
      if (s.gen === L.FLIP) {
        s.preds = K.TRO.map(p => ({ type: 't', x: p[0], y: p[1] })); s.locked = true; s.hist[s.hist.length - 1] = this.rec(); ev.push({ k: 'flip' });
        if (!s.thawed) { s.phase = 'ask'; s.t = 0; s.ask = { id: 't6', kind: 'y', lo: 0, hi: 1, tol: K.TOL.t6, at: L.END }; ev.push({ k: 'ask', id: 't6' }); }
        return;
      }
      if (s.thawed || s.asked.p6 || s.gen < L.ASK0) return;
      let gain = this.expect('p6') - this.q();
      if (gain < L.GAIN && s.gen >= L.FORCE) { s.preds = K.NYM.map(p => ({ type: 'n', x: p[0], y: p[1] })); s.hist[s.hist.length - 1] = this.rec(); ev.push({ k: 'weeds' }); gain = 1; }
      if (gain >= L.GAIN) { s.asked.p6 = 1; s.askGen = s.gen; s.phase = 'ask'; s.t = 0; s.ask = { id: 'p6', kind: 'y', lo: 0, hi: 1, tol: K.TOL.p6, at: L.FLIP }; ev.push({ k: 'ask', id: 'p6' }); }
    },
    /* ---------- the clock ---------- */
    step(dt) {
      const s = this.s, K = SWK, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; const first = s.hatchN <= 1;
      if (s.phase === 'hatch') { if (s.t >= (first ? K.T.hatch : K.T.hatchR)) { s.phase = 'judge'; s.t = 0; ev.push({ k: 'judge', ok: s.ok, shown: s.shown }); } }
      else if (s.phase === 'judge') { if (s.t >= (first ? K.T.judge : K.T.judgeR)) this.afterJudge(ev); }
      else if (s.phase === 'ask') {
        if (!s.unt && s.t >= K.T.askMax && s.ask) {   // timed mode: an ask left alone closes with no prediction
          const A = s.ask; if (A.kind === 'set') this.lockSet(ev, true); else if (A.kind === 'tis') this.lockTis(ev, true); else this.commit(A.id, null, ev);
        }
      }
      else if (s.phase === 'test') { if (s.t >= K.T.test) { s.phase = s.left > 0 ? 'choose' : 'pick'; s.t = 0; ev.push({ k: 'tested', m: s.tests[s.tests.length - 1].m }); } }
      else if (s.phase === 'send') { if (s.t >= K.T.send) { s.phase = 'over'; s.t = 0; ev.push({ k: 'over' }); } }
      else if (s.phase === 'lake') { const d = s.locked || s.thawed ? K.T.fast : K.T.gen; if (!s.hunted && s.t >= d * 0.45) this.hunt(ev); if (s.t >= d) this.breed(ev); }
      return ev;
    },
    act(a) {
      const s = this.s, ev = [], K = SWK; if (!a || !s) return ev;
      const J = s.jobs && s.jobs[s.job];
      if (a.k === 'unt') { if (!s.started && !s.thawed) s.unt = !!a.on; return ev; }
      if (a.k === 'skip') { if (s.phase === 'hatch' || s.phase === 'judge' || s.phase === 'test' || s.phase === 'send') s.t = 99; return ev; }
      if (a.k === 'predict' && s.ask && a.id === s.ask.id && (s.ask.kind === 'y' || s.ask.kind === 'x')) { s.started = 1; this.commit(a.id, a.v, ev); return ev; }
      if (a.k === 'void' && s.ask && a.id === s.ask.id) { const A = s.ask; if (A.kind === 'set') this.lockSet(ev, true); else if (A.kind === 'tis') this.lockTis(ev, true); else this.commit(A.id, null, ev); return ev; }
      if (s.phase === 'paint' && J) {
        if (a.k === 'cell' && J.k === 'build') {
          const g = a.g | 0, j = a.j | 0; if (g < 0 || g > 4 || j < 0 || j > 6) return ev;
          const v = clamp(a.v | 0, 0, g === 2 ? 2 : 1); if (s.grid[g][j] !== v) { s.grid[g][j] = v; s.edits++; s.started = 1; ev.push({ k: 'cell', g, j, v }); }
        } else if (a.k === 'bound' && J.k === 'bound') {
          const g = a.g | 0, b = clamp(a.b | 0, 0, 7); if (g < 0 || g > 4 || s.b[g] === b) return ev;
          const c0 = this.crossed(); s.b[g] = b; s.grid = swGridB(s.b); s.edits++; s.started = 1; s.cross = this.crossed(); ev.push({ k: 'bound', g, b, cross: s.cross > c0 });
        } else if (a.k === 'ub' && J.k === 'crust') {
          const b = clamp(a.b | 0, 1, K.CR[J.id].nT + 1); if (b !== s.ub) { s.ub = b; s.edits++; s.started = 1; ev.push({ k: 'ub', b }); }
        } else if (a.k === 'reset') {
          if (J.k === 'build') s.grid = swCopy(K.WT); else if (J.k === 'bound') { s.b = K.WB.slice(); s.grid = swGridB(s.b); s.cross = 0; } else s.ub = K.CR[J.id].nT + 1;
          ev.push({ k: 'reset' });
        } else if (a.k === 'hatch') { s.started = 1; this.hatch(ev); }
        return ev;
      }
      if (s.phase === 'ask' && s.ask) {
        const A = s.ask;
        if (A.kind === 'set') {
          if (a.k === 'mark') { const j = a.j | 0; if (j < 0 || j > 6) return ev; s.mark[j] ^= 1; s.started = 1; ev.push({ k: 'mark', j, on: s.mark[j] }); }
          else if (a.k === 'lock') this.lockSet(ev);
        } else if (A.kind === 'tis') {
          if (a.k === 'tis') { const t = a.t | 0; if (t < 0 || t > 2) return ev; s.tis[t] ^= 1; s.none = false; ev.push({ k: 'tis', t, on: s.tis[t] }); }
          else if (a.k === 'none') { s.none = !s.none; if (s.none) s.tis = [0, 0, 0]; ev.push({ k: 'none', on: s.none }); }
          else if (a.k === 'lock') this.lockTis(ev);
        }
        return ev;
      }
      if (s.phase === 'choose' || s.phase === 'pick') {
        if (a.k === 'mod') {
          const m = a.m | 0; if (m < 0 || m > 4) return ev; s.started = 1; s.sel = m;
          if (s.phase === 'choose' && s.left > 0) { s.tis = [0, 0, 0]; s.none = false; s.phase = 'ask'; s.t = 0; s.ask = { id: 'l5_' + s.tests.length, kind: 'tis' }; }
          ev.push({ k: 'sel', m, again: s.tests.some(x => x.m === K.MOD[m]) });
        } else if (a.k === 'send' && s.sel != null && (s.phase === 'pick' || s.tests.length)) {
          s.sent = K.MOD[s.sel]; s.phase = 'send'; s.t = 0; ev.push({ k: 'send', m: s.sent });
        }
        return ev;
      }
      if (s.phase === 'lake') {
        if (a.k === 'add' || a.k === 'rm') { if (s.locked) { ev.push({ k: 'locked' }); return ev; } }
        if (a.k === 'add') {
          const type = a.type === 'n' ? 'n' : 't', n = s.preds.filter(p => p.type === type).length;
          if (n >= K.LAKE.MAX) { ev.push({ k: 'full' }); return ev; }
          const x = clamp(+a.x || 195, 24, 366), y = type === 'n' ? clamp(+a.y || 488, 452, 512) : clamp(+a.y || 260, 150, 420);
          s.preds.push({ type, x: Math.round(x), y: Math.round(y) }); s.started = 1; s.hist[s.hist.length - 1] = this.rec(); ev.push({ k: 'add', type, x, y });
        } else if (a.k === 'rm') {
          const i = a.i | 0; if (i < 0 || i >= s.preds.length) return ev; const p = s.preds.splice(i, 1)[0]; s.hist[s.hist.length - 1] = this.rec(); ev.push({ k: 'rm', type: p.type, x: p.x, y: p.y });
        }
      }
      return ev;
    },

    /* ---------- contract ---------- */
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_SWITCH_V2.stars, n = s.level;
      const mask = s.thawed ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: this.outcome(s), interesting: this.why(s) };
    },
    outcome(s) {
      const n = s.level;
      if (n <= 3) return { solved: s.solvedN, first: s.first, shown: s.shownN, ham: (s.ham.t1 || 0) + (s.ham.t2 || 0) };
      if (n === 4) return { sent: s.sent, tests: s.tests.length, ham: CH_SWITCH_V2.sim.l5ham(s) };
      return { q40: (s.hist[SWK.LAKE.FLIP - 1] || {}).q, q60: s.hist[s.hist.length - 1].q };
    },
    l5ham(s) { const seen = {}; let n = 0, h = 0; for (const t of s.tests || []) { if (seen[t.m]) continue; seen[t.m] = 1; n++; h += t.ham; } return { n, h }; },
    why(s) {   // the Interesting result, chosen from what happened in this run
      const n = s.level, st = CH_SWITCH_V2.stars;
      if (s.thawed && s.lever) return this.whatIfText(s);
      if (n === 0) return !(s.hit.v1 && s.hit.v2) ? 'l1_vial' : (s.shownN > 0 || s.first < 3) ? 'l1_tries' : null;
      if (n === 1) { const p = s.pred.t1 || []; if (p[4] || p[5] || p[6]) return 'l2_trap'; if ((s.ham.t2 || 0) > 1) return 'l2_bxc'; return s.solved.legsA1 ? null : 'l2_shown'; }
      if (n === 2) return s.first < 4 ? 'l3_tries' : null;
      if (n === 3) return s.hit.t4 ? null : 'l4_miss';
      if (n === 4) { if (s.sent === 'stop' || s.sent === 'swap') return 'l5_code'; if (s.sent !== 'pel') return 'l5_wrong'; return st.predict(s, n) ? null : 'l5_pred'; }
      const L = SWK.LAKE, z = s.hist;
      if (s.pred.p6 != null && !s.hit.p6) return s.pred.p6 < s.exp.p6 ? 'l6_low' : 'l6_high';
      if (s.pred.t6 != null && !s.hit.t6) return s.pred.t6 < s.exp.t6 ? 'l6_gone' : 'l6_stay';
      const q40 = z[L.FLIP - 1] ? z[L.FLIP - 1].q : null; if (q40 != null && s.exp.p6 != null && Math.abs(q40 - s.exp.p6) > 0.2) return 'l6_drift';
      return null;
    },
    baseline(s) {   // what the frozen run expected from the thaw on: recessive, with mutation, under the realised predators
      const L = SWK.LAKE, out = {}; let q = s.th0.q;
      for (let g = s.th0.gen; g < L.END; g++) { const r = s.hist[g - 1] || s.hist[s.hist.length - 1]; q = swLakeRec(q, r.T, r.M, 1, L.MU, false); if (g + 1 === L.FLIP) out.q40 = q; }
      out.q60 = q; return out;
    },
    whatIfText(s) {   // a What if? text only when this rerun went the way it says (lessons §1.5); otherwise an honest "chance" line
      const L = SWK.LAKE, b = this.baseline(s), z = s.hist, q40 = z[L.FLIP - 1] ? z[L.FLIP - 1].q : null, q60 = z[z.length - 1].q;
      if (s.lever === 'dom') { if (s.th0.gen < L.FLIP) return q40 != null && q40 >= b.q40 + 0.05 ? 'w_dom' : 'w_chance'; return q60 <= b.q60 - 0.03 ? 'w_domfall' : 'w_chance'; }
      if (s.lever === 'nomut') { if (q60 <= 0) return 'w_nomut_lost'; return q60 <= b.q60 - 0.02 ? 'w_nomut' : 'w_chance'; }
      return 'w_chance';
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out; const J = s.jobs && s.jobs[s.job], K = SWK;
      if (s.phase === 'ask' && s.ask) {
        const A = s.ask;
        if (A.kind === 'y' || A.kind === 'x') { const st = A.id === 'p6' || A.id === 't6' ? 0.02 : 0.5; for (let v = A.lo; v <= A.hi + 1e-9; v += st) out.push({ k: 'predict', id: A.id, v: Math.round(v * 100) / 100 }); return out; }
        if (A.kind === 'set') { for (let j = 0; j < 7; j++) out.push({ k: 'mark', j }); if (s.mark.some(Boolean)) out.push({ k: 'lock' }); return out; }
        for (let t = 0; t < 3; t++) out.push({ k: 'tis', t }); out.push({ k: 'none' }); if (s.none || s.tis.some(Boolean)) out.push({ k: 'lock' }); return out;
      }
      if (s.phase === 'paint' && J) {
        if (J.k === 'build') { for (let g = 0; g < 5; g++) for (let j = 0; j < 7; j++) for (let v = 0; v <= (g === 2 ? 2 : 1); v++) if (s.grid[g][j] !== v) out.push({ k: 'cell', g, j, v }); }
        else if (J.k === 'bound') { for (let g = 0; g < 5; g++) for (let b = 0; b <= 7; b++) if (s.b[g] !== b) out.push({ k: 'bound', g, b }); }
        else { for (let b = 1; b <= K.CR[J.id].nT + 1; b++) if (b !== s.ub) out.push({ k: 'ub', b }); }
        out.push({ k: 'reset' }); out.push({ k: 'hatch' }); return out;
      }
      if (s.phase === 'hatch' || s.phase === 'judge' || s.phase === 'test' || s.phase === 'send') { out.push({ k: 'skip' }); return out; }
      if (s.phase === 'choose' || s.phase === 'pick') { for (let m = 0; m < 5; m++) out.push({ k: 'mod', m }); if (s.sel != null && (s.phase === 'pick' || s.tests.length)) out.push({ k: 'send' }); return out; }
      if (s.phase === 'lake' && !s.locked) {
        const c = this.counts();
        if (c[1] < K.LAKE.MAX) out.push({ k: 'add', type: 'n', x: K.NYM[c[1]][0], y: K.NYM[c[1]][1] });
        if (c[0] < K.LAKE.MAX) out.push({ k: 'add', type: 't', x: K.TRO[c[0]][0], y: K.TRO[c[0]][1] });
        s.preds.forEach((p, i) => out.push({ k: 'rm', i }));
      }
      return out;
    },
    bots: {   // (s, acts, rnd, ticks) → action | null; 'random' is generic. Bots act about once every 0.6 s, as a person does
      alwaysA(s, acts, rnd, tk) { if ((tk | 0) % 18) return null; return acts[0] || null; },
      alwaysB(s, acts, rnd, tk) { if ((tk | 0) % 18) return null; return acts[acts.length - 1] || null; },
      greedy(s, acts, rnd, tk) {   // "no change": hatches the wild type, predicts what the screen shows now, marks the wild type's legs
        if ((tk | 0) % 18) return null; const sim = CH_SWITCH_V2.sim, A = s.ask;
        if (A && (A.kind === 'y' || A.kind === 'x')) { const v = sim.current(A.id); return acts.reduce((b, a) => !b || Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b, null); }
        if (A && A.kind === 'set') { for (const j of [1, 2, 3]) if (!s.mark[j]) return { k: 'mark', j }; return { k: 'lock' }; }
        if (A && A.kind === 'tis') { if (!s.tis[2]) return { k: 'tis', t: 2 }; return { k: 'lock' }; }
        if (s.phase === 'choose') return s.tests.length >= 1 ? { k: 'send' } : { k: 'mod', m: s.tests.length };
        if (s.phase === 'pick') return s.sel == null ? { k: 'mod', m: 0 } : { k: 'send' };
        return acts.find(a => a.k === 'hatch' || a.k === 'skip') || null;
      },
      threshold(s, acts, rnd, tk) {   // predicts the middle of every axis; marks the front half; tests switches in order
        if ((tk | 0) % 18) return null; const A = s.ask;
        if (A && (A.kind === 'y' || A.kind === 'x')) { const m = (A.lo + A.hi) / 2; return acts.reduce((b, a) => !b || Math.abs(a.v - m) < Math.abs(b.v - m) ? a : b, null); }
        if (A && A.kind === 'set') { for (const j of [0, 1, 2, 3]) if (!s.mark[j]) return { k: 'mark', j }; return { k: 'lock' }; }
        if (A && A.kind === 'tis') { if (!s.tis[0]) return { k: 'tis', t: 0 }; if (!s.tis[1]) return { k: 'tis', t: 1 }; return { k: 'lock' }; }
        if (s.phase === 'choose') return s.left > 1 ? { k: 'mod', m: 4 - s.left + 1 } : { k: 'send' };
        if (s.phase === 'pick') return s.sel == null ? { k: 'mod', m: 2 } : { k: 'send' };
        if (s.phase === 'lake') return acts.find(a => a.k === 'add' && a.type === 'n') || null;
        return acts.find(a => a.k === 'hatch' || a.k === 'skip') || null;
      },
      naive(s, acts, rnd, tk) {   // the misconceptions: a gene painted everywhere acts everywhere; no abd-A means legs; any cut is clean
        if ((tk | 0) % 18) return null; const A = s.ask;
        if (A && (A.kind === 'y' || A.kind === 'x')) { const v = A.id === 't4' ? 5 : A.id === 'p6' ? Math.min(1, CH_SWITCH_V2.sim.q() + 0.1) : A.id === 't6' ? 0 : 7; return acts.reduce((b, a) => !b || Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b, null); }
        if (A && A.kind === 'set') { for (let j = 1; j < 7; j++) if (!s.mark[j]) return { k: 'mark', j }; return { k: 'lock' }; }
        if (A && A.kind === 'tis') { const m = SWK.MOD[s.sel], t = m === 'jaw' ? 1 : m === 'pit' ? 0 : 2; if (!s.tis[t]) return { k: 'tis', t }; return { k: 'lock' }; }
        if (s.phase === 'choose') return s.left > 1 ? { k: 'mod', m: [2, 3, 1][4 - s.left] } : { k: 'send' };
        if (s.phase === 'pick') return s.sel == null ? { k: 'mod', m: 3 } : { k: 'send' };
        if (s.phase === 'lake') return acts.find(a => a.k === 'add' && a.type === 'n') || null;
        return acts.find(a => a.k === 'hatch' || a.k === 'skip') || null;
      }
    }
  },

  /* ---------- stars: pure functions of the final state, scored against expectations (D1 G10) ---------- */
  stars: {
    discover: (s, n) => n === 0 ? s.solvedN >= 3 : n === 1 ? !!s.solved.legsA1 : n === 2 ? s.solvedN >= 3 : n === 3 ? s.solvedN >= 3 : n === 4 ? s.sent === 'pel' : false,
    predict: (s, n) => {
      if (n === 0) return !!(s.hit.v1 && s.hit.v2);
      if (n === 1) return s.ham.t1 != null && s.ham.t2 != null && s.ham.t1 + s.ham.t2 <= 1;
      if (n === 2) return s.first >= 3;
      if (n === 4) { const r = CH_SWITCH_V2.sim.l5ham(s); return r.n >= 3 && r.h <= 1; }
      if (n === 5) return !!(s.hit.p6 && s.cnt.p6);
      return false;
    },
    transfer: (s, n) => n === 3 ? !!s.hit.t4 : n === 5 ? !!(s.hit.t6 && s.cnt.t6) : false
  },
  // D1 §3.9 unit stars: Discover = the ordered flies (L1); Predict = a bench call (L2, L3 or L5) and the L6 curve; Transfer = L4 and L6
  unitStars(lv) { const m = i => (lv && lv[i]) | 0; return (m(0) & 1 ? 1 : 0) | ((m(1) & 2 || m(2) & 2 || m(4) & 2) && m(5) & 2 ? 2 : 0) | (m(3) & 4 && m(5) & 4 ? 4 : 0); },

  /* ---------- teacher hook: a 30-bit result code (?unit=switch&seed=…) ----------
     bits 0–2 level, 3–5 star mask, 6–9 orders built (L1–L4) or tests (L5), 10–16 first prediction (legs ×10, edge ×10, share ×100),
     17–23 second prediction (same units), 24–29 mismatches (L2 marks, L5 tissues) or first-try builds */
  resultBits(s, level) {
    if (!s) return 0; const n = level == null ? s.level : level, r = this.sim.result(), mask = r ? r.mask & 7 : 0, c7 = x => clamp(Math.round(+x || 0), 0, 127);
    const a = n === 0 ? s.pred.v1 * 10 : n === 3 ? s.pred.t4 * 10 : n === 5 ? s.pred.p6 * 100 : 0, b = n === 0 ? s.pred.v2 * 10 : n === 5 ? s.pred.t6 * 100 : 0;
    const cnt = n === 4 ? (s.tests || []).length : s.solvedN || 0, miss = n === 1 ? (s.ham.t1 || 0) + (s.ham.t2 || 0) : n === 4 ? this.sim.l5ham(s).h : s.first || 0;
    return ((n & 7) | (mask << 3) | ((cnt & 15) << 6) | (c7(a) << 10) | (c7(b) << 17) | (clamp(miss, 0, 63) << 24)) >>> 0;
  },

  /* ---------- view ---------- */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._endT = 0; this._asked = null; this._dockSig = null; this._hudT = null; this._hudN = null; this._bg = null; this._lk = null;
    Sim.start(this, n, o);
    // the untimed setting enters the run as a logged action, so a replay plays the same on any machine (lessons §1.6)
    if (!o.thaw && !o.replay) Sim.act(this, { k: 'unt', on: !!(Save.d && Save.d.ui && Save.d.ui.unt) });
    this.v = { t: 0, drag: null, cur: { r: 2, c: 3 }, mod: 2, pop: [0, 0, 0, 0, 0, 0, 0], stamp: 0, flash: 0, title: 1.8, strikes: [], swim: 0, snip: null, lastCross: 0 };
    this.dock(); this.hud(true);
    const s = this.sim.s, verb = n === 2 || n === 3 ? 'drag' : 'tap';
    if (typeof Ghost !== 'undefined' && !o.thaw) this.ghost = Ghost.show({ verb, at: () => this.ghostAt(), to: verb === 'drag' ? () => this.ghostTo() : undefined,
      until: () => { const t = this.sim.s; return t.started || (n === 4 && t.phase !== 'choose') || (n === 5 && t.phase !== 'lake'); } });
    if (typeof Live !== 'undefined') Live.say(this.levels[n].name + '. ' + (this._hudT || ''));
    if (typeof Fx !== 'undefined') Fx.tier(3, () => { });
    if (s.phase === 'ask') this._asked = null;
  },
  w(group, key, vars) { const s = (this.content[group] || {})[key]; return s == null ? '' : typeof Txt !== 'undefined' ? Txt.f(s, vars || {}) : String(s).replace(/\{(\w+)\}/g, (m, k) => vars && vars[k] != null ? vars[k] : m); },
  whisper(key, vars) { if (typeof Whisper !== 'undefined') Whisper.say(this.w('whispers', key, vars), 'sw-' + key); },
  hudH() { return Math.max(56, this._hudPx || 0, (Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 0); },
  calm() { return typeof Fx !== 'undefined' && Fx.calm; },
  job() { const s = this.sim.s; return s.jobs ? s.jobs[s.job] || null : null; },
  hudText() {
    const s = this.sim.s, C = this.content.hud, L = this.content.labels, n = this.level, J = this.job();
    if (s.thawed && s.lever && s.phase !== 'over') return C.whatif.replace('{lever}', (this.content.levers || {})[s.lever] || s.lever);
    if (n <= 3) {
      if (!J) return C.wait;
      if (s.phase === 'hatch') return s.shown ? C.shown : J.k === 'vial' || J.k === 'tap' || J.k === 'askx' ? C.reveal : C.hatch;
      if (s.phase === 'judge') return s.shown ? C.shown : J.k === 'build' || J.k === 'bound' || J.k === 'crust' ? (s.ok ? C.ok : C.no) : C.reveal;
      if (n === 0 && s.job === 0 && !s.started) return this.content.firstWords;
      if (J.k === 'build') return C[J.id];
      if (J.k === 'vial') { const g = SWK.VIAL[J.v][0][0], del = SWK.VIAL[J.v][0][1] === 0; return this.w('hud', del ? 'del' : 'vial', { gene: J.v === 'bxcDel' ? L.bxc : L['g' + g] }); }
      if (J.k === 'tap') return C[J.id];
      if (J.k === 'bound') return this.w('hud', 'mut', { n: s.job + 1 });
      if (J.k === 'crust') return C['cr_' + J.id];
      return C.t4;
    }
    if (n === 4) return { choose: s.tests.length ? C.l5more : C.l5, ask: C.l5ask, test: C.l5test, pick: C.l5pick, send: C.l5sent }[s.phase] || C.wait;
    if (s.phase === 'ask') return s.ask && s.ask.id === 't6' ? C.ask2 : C.ask1;
    if (s.phase === 'over') return C.wait;
    if (s.gen <= 2 && !s.started) return C.lake;
    return this.w('hud', s.locked ? 'lakeSet' : 'lakeRun', { g: s.gen });
  },
  hud(force) {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, n = this.level, text = this.hudText();
    let num = '';
    if (n <= 3 && s.jobs) num = Math.min(s.job + 1, s.jobs.length) + '/' + s.jobs.length;
    else if (n === 4) num = s.left + '/4';
    else if (n === 5) num = Math.round(this.sim.q() * 100) + '%';
    if (force || text !== this._hudT || num !== this._hudN) {
      this._hudT = text; this._hudN = num; HUD.say(text, num, text === this.content.firstWords ? { first: true } : undefined);
      const el = typeof document !== 'undefined' && document.getElementById ? document.getElementById('hud') : null; this._hudPx = el && el.offsetHeight ? el.offsetHeight : 56;
    }
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, n = this.level, J = this.job(), b = [], act = a => () => Sim.act(this, a);
    if (s.phase === 'ask' && s.ask) {
      if (s.ask.kind === 'tis') b.push({ id: 'none', label: L.none, key: '0', pressed: !!s.none, fn: act({ k: 'none' }) });
      b.push({ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (s.ask && (s.ask.kind === 'y' || s.ask.kind === 'x')) { if (typeof Predict !== 'undefined') Predict.commit(); } else Sim.act(this, { k: 'lock' }); } });
    } else if (s.phase === 'paint') {
      b.push({ id: 'reset', label: L.reset, key: 'R', fn: act({ k: 'reset' }) });
      b.push({ id: 'hatch', label: J && J.k === 'crust' ? L.check : L.hatch, key: 'Enter', primary: true, fn: act({ k: 'hatch' }) });
    } else if (s.phase === 'hatch' || s.phase === 'judge' || s.phase === 'test' || s.phase === 'send') b.push({ id: 'skip', label: L.skip, key: 'Enter', fn: act({ k: 'skip' }) });
    else if (s.phase === 'choose' || s.phase === 'pick') b.push({ id: 'send', label: L.send, key: 'Enter', primary: true, disabled: s.sel == null || (s.phase === 'choose' && !s.tests.length), why: this.w('hud', 'l5'), fn: act({ k: 'send' }) });
    else if (s.phase === 'lake') {
      if (s.locked) b.push({ id: 'set', label: L.set, disabled: true, why: this.w('whispers', 'locked'), fn: () => this.whisper('locked') });
      else { const c = this.sim.counts(); b.push({ id: 'addT', label: L.addT, key: 'T', fn: act({ k: 'add', type: 't', x: SWK.TRO[Math.min(3, c[0])][0], y: SWK.TRO[Math.min(3, c[0])][1] }) }); b.push({ id: 'addN', label: L.addN, key: 'N', fn: act({ k: 'add', type: 'n', x: SWK.NYM[Math.min(3, c[1])][0], y: SWK.NYM[Math.min(3, c[1])][1] }) }); }
    }
    const sig = n + ':' + b.map(x => x.id + (x.pressed ? '+' : '') + (x.disabled ? '-' : '') + (x.label || '')).join(',') + (s.ask ? s.ask.id : '');
    if (sig !== this._dockSig) { this._dockSig = sig; Dock.set(b); }
  },
  ghostAt() {   // the first action cannot fail: a real cell, segment, tab, switch or weed bed
    const n = this.level, G = this.geo();
    if (n === 0) return [G.cx0 + 3.5 * G.cw, G.by + 2.5 * G.rh];
    if (n === 1) return [G.X(4), G.cy];
    if (n === 2) { const t = this.tabs(G)[2]; return [t.x, t.y]; }
    if (n === 3) { const C = this.crGeo(G); return [C.edgeX(this.sim.s.ub), C.ry]; }
    if (n === 4) { const B = this.board(G); return [B.mx(2), B.my]; }
    const p = this.lakePx(SWK.NYM[0][0], SWK.NYM[0][1]); return p;
  },
  ghostTo() { const n = this.level, G = this.geo(); if (n === 2) { const t = this.tabs(G)[2]; return [t.x + G.cw * 1.4, t.y]; } const C = this.crGeo(G); return [C.edgeX(Math.max(1, this.sim.s.ub - 3)), C.ry]; },

  update(dt) {
    const ev = Sim.run(this, dt), s = this.sim.s, v = this.v; v.t += dt;
    for (const e of ev) this.juice(e);
    for (let j = 0; j < 7; j++) v.pop[j] = Math.max(0, v.pop[j] - dt * 3);
    v.flash = Math.max(0, v.flash - dt * 2); v.stamp = Math.max(0, v.stamp - dt * 0.6); v.swim += dt;
    if (v.title > 0) v.title = Math.max(0, v.title - dt);
    v.strikes = v.strikes.filter(k => (k.age += dt) < 0.9);
    if (v.snip) { v.snip.age += dt; if (v.snip.age > 0.8) v.snip = null; }
    if (s.ask && this._asked !== s.ask.id) this.openAsk(s.ask);
    this.hud(); this.dock();
    const r = this.sim.result();
    if (r && !this._ended) { this._endT += dt; if (this._endT > (this.calm() ? 0.3 : 1.1)) this.end(r); }
  },
  openAsk(A) {
    this._asked = A.id; const s = this.sim.s;
    if (A.kind === 'set' || A.kind === 'tis') { if (typeof Live !== 'undefined') Live.say(this._hudT || ''); return; }
    if (typeof Predict === 'undefined') return;
    // the ghost starts off every plausible answer (lessons §1.3); an untouched ghost never commits (needMove)
    const start = { v1: 7, v2: 7, t4: 1, p6: 0, t6: 1 }[A.id], chart = this.level === 0 ? 1 : 0;
    Predict.ask({ id: A.id, chart, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start, tol: A.tol, at: A.at, soft: null, needMove: true,
      say: this._hudT || '', onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'void', id: A.id }) });
    if (typeof Snd2 !== 'undefined') Snd2.play('tick', { x: Stage.w / 2, y: Stage.h / 2 });
    if (s.level === 5 && typeof Freezer !== 'undefined' && !Sim.replaying(this)) Freezer.put(this.id, s.gen, this.sim.snapshot());
  },
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, W = Stage.w, H = Stage.h, G = this.level <= 4 ? this.geo() : null, sn = typeof Snd !== 'undefined' ? Snd : null, S2 = typeof Snd2 !== 'undefined' ? Snd2 : null;
    const hideGhost = () => { if (this.ghost && this.ghost.hide) this.ghost.hide(); };
    if (e.k === 'cell') {
      hideGhost(); v.pop[e.j] = 1; const x = G.cx0 + (e.j + 0.5) * G.cw, y = G.by + (e.g + 0.5) * G.rh;
      if (F) { F.burst('spark', x, y, e.v ? 5 : 2, { ink: css(SW_INK[SWK.G[e.g]]) }); if (e.v) F.ring(x, y, G.cw * 0.45, { ms: 260 }); }
      if (S2) S2.play('tick', { x, y });
    } else if (e.k === 'bound') {
      hideGhost(); const t = this.tabs(G)[e.g]; if (F) F.burst('spark', t.x, t.y, 4, { ink: css(SW_INK[SWK.G[e.g]]) }); if (S2) S2.play('tick', { x: t.x, y: t.y });
      if (e.cross) this.whisper('cross');
    } else if (e.k === 'ub') { hideGhost(); const C = this.crGeo(G); if (F) F.burst('spark', C.edgeX(e.b), C.ry, 4, { ink: css(SW_INK.Ubx) }); if (S2) S2.play('tick', { x: C.edgeX(e.b), y: C.ry }); }
    else if (e.k === 'reset') { this.whisper('reset'); if (S2) S2.play('swish', { x: W / 2, y: H / 2 }); }
    else if (e.k === 'hatch') { hideGhost(); if (F) { F.tier(2, () => { }); F.after(this.calm() ? 0 : 500, () => { if (S2) S2.play('crack', { x: W / 2, y: G ? G.cy : H / 3 }); }); } }
    else if (e.k === 'judge') {
      const J = this.job(), build = J && (J.k === 'build' || J.k === 'bound' || J.k === 'crust'), cx = W / 2, cy = G ? G.cy : H / 3;
      if (!build || e.shown) { if (F) F.burst('spark', cx, cy, 8, { ink: css(SW_INK.white) }); return; }
      if (e.ok) { v.stamp = 1; if (F) { F.burst('spark', cx, cy, 16, { ink: css(SW_INK.Antp) }); F.tier(3, () => { }); } if (sn && sn.chime) sn.chime(); this.whisper('built'); if (typeof Live !== 'undefined') Live.say(this.content.hud.ok); }
      else { if (F) F.shake(4, 160); if (sn && sn.miss) sn.miss(); this.whisper('wrong'); }
    }
    else if (e.k === 'shown') this.whisper('shown');
    else if (e.k === 'job') { v.stamp = 0; this._asked = null; v.title = 0; if (typeof Live !== 'undefined') Live.say(this.hudText()); if (typeof Predict !== 'undefined' && this.level === 0) Predict.clear(1); }
    else if (e.k === 'mark') { hideGhost(); v.pop[e.j] = 1; const x = G.X(e.j); if (F) F.ring(x, G.cy, G.cw * 0.5, { ms: 260 }); if (S2) S2.play('tick', { x, y: G.cy }); }
    else if (e.k === 'nomark') this.whisper(this.level === 4 ? 'nomark' : 'tapfirst');
    else if (e.k === 'pred') {
      if (e.set) {   // L2: show the true legged set; a ring on each wrong mark
        const p = s.pred[e.id] || []; e.truth.forEach((t, j) => { if (p[j] !== t && F) F.ring(G.X(j), G.cy, G.cw * 0.55, { dashed: true, ms: 1400 }); });
        this.whisper(e.id === 't1' ? 'trap' : e.ham === 0 ? 'exact' : 'bxc');
        if (S2) S2.play(e.ham <= 1 ? 'count' : 'tock', { x: W / 2, y: H / 2 }); return;
      }
      if (typeof Predict !== 'undefined') { Predict.reveal(e.id, e.exp, e.tol); if (Predict.fold && F) F.after(1600, () => Predict.fold()); }
      if (S2) S2.play(e.hit ? 'count' : 'tock', { x: W / 2, y: H / 2, i: 6 });
      this._asked = null;
    }
    else if (e.k === 'sel') { hideGhost(); const B = this.board(G); v.snip = { m: e.m, age: 0 }; if (F) F.burst('spark', B.mx(e.m), B.my, 6, { ink: css(SW_INK.gfp) }); if (S2) S2.play('crack', { x: B.mx(e.m), y: B.my }); this.whisper(e.again ? 'retest' : 'snip'); }
    else if (e.k === 'tis' || e.k === 'none') { if (S2) S2.play('tick', { x: W / 2, y: H / 3 }); }
    else if (e.k === 'test') { if (F) F.tier(2, () => { }); }
    else if (e.k === 'tested') { const f = SWK.FATE[e.m]; this.whisper(f === 'dies' ? 'dies' : f === 'sick' ? 'sick' : 'clean'); if (f !== 'clean' && F) F.shake(3, 140); else if (F) F.burst('spark', W / 2, G.cy, 10, { ink: css(SW_INK.gfp) }); }
    else if (e.k === 'send') { this.whisper('sent'); if (F) F.tier(3, () => { }); if (S2) S2.play('pour', { x: W / 2, y: H / 2 }); }
    else if (e.k === 'strike') { const show = s.locked || s.thawed ? 2 : 5; e.dead.slice(0, show).forEach((d, k) => v.strikes.push({ i: d.i, by: d.by, age: -0.08 * k })); if (e.dead.length && !(s.locked || s.thawed) && S2) S2.play('swish', { x: W / 2, y: H / 2 }); }
    else if (e.k === 'gen') {
      if (typeof Freezer !== 'undefined' && !Sim.replaying(this) && e.gen % 10 === 5) Freezer.put(this.id, e.gen, this.sim.snapshot());
      if (typeof Live !== 'undefined' && e.gen % 10 === 0) Live.say(this.hudText());
    }
    else if (e.k === 'add') { hideGhost(); const p = this.lakePx(e.x, e.y); if (F) { F.burst('droplet', p[0], p[1], 8); F.ring(p[0], p[1], 26, { ms: 300 }); } if (S2) S2.play('pour', { x: p[0], y: p[1] }); }
    else if (e.k === 'rm') { const p = this.lakePx(e.x, e.y); if (F) F.ring(p[0], p[1], 22, { dashed: true }); if (S2) S2.play('swish', { x: p[0], y: p[1] }); }
    else if (e.k === 'full') this.whisper('full');
    else if (e.k === 'locked') this.whisper('locked');
    else if (e.k === 'weeds' || e.k === 'flip') { this.whisper(e.k); v.flash = 1; if (F) F.tier(3, () => { }); }
    else if (e.k === 'ask') { if (typeof Live !== 'undefined') Live.say(this.hudText()); }
    else if (e.k === 'over') { if (S2) S2.play('interesting', { x: W / 2, y: H / 2 }); }
  },
  end(r) {
    this._ended = true; const final = this.level === this.levels.length - 1, n = this.level;
    const vials = n === 5 && typeof Freezer !== 'undefined' ? Freezer.list(this.id) : [], first = vials.length ? vials[0] : null;
    const C = this.content, LS = (C.levelStars || [])[n] || {}, stars = {};
    [['discover', 1], ['predict', 2], ['transfer', 4]].forEach(([k, b]) => { stars[k] = r.mask & b ? C.stars[k] : LS[k] || null; });
    const L = C.labels, lab = [L.chLegs, L.chRow, L.chOrd, L.chCr, L.chTest, L.chLake][n], ci = n === 0 ? 1 : n === 2 ? 1 : 0;
    End.show(this, { level: n, mask: r.mask, final, interesting: r.interesting, whatIf: first ? { gen: first.gen, levers: ['dom', 'nomut'] } : null, stars,
      chart: cv => { if (typeof LiveGraph !== 'undefined') LiveGraph.draw(cv, this.notes(true).charts[ci] || this.notes(true).charts[0], 'paper'); }, chartLabel: lab });
  },
  teacherStep() { for (let i = 0; i < 3000; i++) { const s = this.sim.s, ph = s.phase, j = s.job, g = s.gen; this.update(1 / 30); const t = this.sim.s; if (t.ask || t.phase !== ph || t.job !== j || t.gen !== g) break; } },

  /* ---------- geometry (CSS px) ---------- */
  geo() {
    const W = Stage.w, H = Stage.h, top = this.hudH() + 4, bw = Math.min(W - 12, 660), bx = (W - bw) / 2, labW = clamp(bw * 0.15, 48, 76), cx0 = bx + labW, cw = (bw - labW - 4) / 7;
    const avail = H - top - 6, sh = clamp(avail * 0.4, 120, 300), sy = top, cy = sy + sh * 0.5, iy = sy + sh + 2, ih = 22, by = iy + ih + 6, bh = H - 6 - by;
    return { W, H, top, bx, bw, labW, cx0, cw, X: j => cx0 + (j + 0.5) * cw, sy, sh, cy, iy, ih, by, bh, rh: clamp(bh / 5, 24, 58), u: Math.min(cw, sh / 3.4), avail };
  },
  laneH(G) { return clamp((G.bh - 54) / 5, 24, 46); },
  tabs(G) {   // L3: one tab per gene at its front edge, in its own lane
    const s = this.sim.s, lh = this.laneH(G), b = s.b || SWK.WB;
    return SWK.G.map((k, g) => ({ x: b[g] >= 7 ? G.cx0 + 7 * G.cw + 12 : G.cx0 + b[g] * G.cw, y: G.by + (g + 0.5) * lh, r: 22 }));
  },
  edgeFromX(G, x) { return clamp(Math.round((x - G.cx0) / G.cw), 0, 7); },
  crGeo(G) {   // L4: the crustacean, its thoracic segments and the edge rail
    const s = this.sim.s, J = this.job(), sp = J ? (J.k === 'askx' ? 'mantis' : J.id) : 'mantis', nT = SWK.CR[sp].nT, len = Math.min(G.W - 36, 620), x0 = (G.W - len) / 2;
    const head = len * 0.16, thx = x0 + head, thw = len * (sp === 'artemia' ? 0.5 : 0.46), sw = thw / nT, cy = G.top + G.avail * 0.36, ry = cy + clamp(G.avail * 0.24, 70, 150);
    return { sp, nT, len, x0, head, thx, thw, sw, cy, ry, u: len / 10, edgeX: b => thx + (clamp(b, 1, nT + 1) - 1) * sw, segX: i => thx + (i + 0.5) * sw };
  },
  board(G) {   // L5: the fry above, the Pitx1 board below
    const W = G.W, bw = Math.min(W - 20, 620), bx = (W - bw) / 2, my = G.H - clamp(G.avail * 0.17, 60, 110), mw = bw / 5;
    const fl = Math.min(W - 40, 560), fx = (W - fl) / 2, fy = G.top + G.avail * 0.3;
    return { bx, bw, my, mw, mh: clamp(G.avail * 0.09, 34, 52), mx: m => bx + (m + 0.5) * mw, fl, fx, fy,
      tis: [[fx + fl * 0.2, fy - fl * 0.02], [fx + fl * 0.09, fy + fl * 0.07], [fx + fl * 0.44, fy + fl * 0.1]] };
  },
  lakePx(x, y) { return [x / 390 * Stage.w, y / 540 * Stage.h]; },

  /* ---------- input ---------- */
  down(x, y) {
    const s = this.sim.s, n = this.level; if (!s) return;
    if (s.phase === 'hatch' || s.phase === 'judge' || s.phase === 'test' || s.phase === 'send') { if (!(n === 5)) Sim.act(this, { k: 'skip' }); return; }
    if (n === 5) { this.downLake(x, y); return; }
    const G = this.geo();
    if (n <= 2 && s.phase === 'ask' && s.ask && s.ask.kind === 'set') { if (y < G.by && y > G.sy && x > G.cx0 && x < G.cx0 + 7 * G.cw) Sim.act(this, { k: 'mark', j: clamp(Math.floor((x - G.cx0) / G.cw), 0, 6) }); return; }
    if (s.phase !== 'paint' && n !== 4) return;
    const J = this.job();
    if (J && J.k === 'build') {
      const j = Math.floor((x - G.cx0) / G.cw), g = Math.floor((y - G.by) / G.rh); if (j < 0 || j > 6 || g < 0 || g > 4) return;
      const cur = s.grid[g][j], val = g === 2 ? (cur + 1) % 3 : 1 - cur; this.v.drag = { kind: 'paint', g, val }; Sim.act(this, { k: 'cell', g, j, v: val });
    } else if (J && J.k === 'bound') {
      const T = this.tabs(G), i = Stage.hit ? Stage.hit(x, y, T, 22) : -1, lh = this.laneH(G);
      if (i >= 0) { this.v.drag = { kind: 'tab', g: i }; return; }
      const g = Math.floor((y - G.by) / lh); if (g >= 0 && g < 5 && x > G.cx0 - 10) { Sim.act(this, { k: 'bound', g, b: this.edgeFromX(G, x) }); this.v.drag = { kind: 'tab', g }; }   // tap a lane: the edge jumps there
    } else if (J && J.k === 'crust') {
      const C = this.crGeo(G); this.v.drag = { kind: 'ub' }; this.moveUb(C, x);
    } else if (n === 4) this.downBoard(G, x, y);
  },
  move(x, y) {
    const d = this.v && this.v.drag, s = this.sim.s; if (!d || s.phase !== 'paint') return; const G = this.geo();
    if (d.kind === 'paint') { const j = Math.floor((x - G.cx0) / G.cw), g = d.g; if (j >= 0 && j <= 6 && s.grid[g][j] !== d.val) Sim.act(this, { k: 'cell', g, j, v: d.val }); }
    else if (d.kind === 'tab') { const b = x > G.cx0 + 7 * G.cw + 4 ? 7 : this.edgeFromX(G, x); if (s.b[d.g] !== b) Sim.act(this, { k: 'bound', g: d.g, b }); }
    else if (d.kind === 'ub') this.moveUb(this.crGeo(G), x);
  },
  up() { if (this.v) this.v.drag = null; },
  moveUb(C, x) { const b = clamp(Math.round((x - C.thx) / C.sw) + 1, 1, C.nT + 1); if (b !== this.sim.s.ub) Sim.act(this, { k: 'ub', b }); },
  downBoard(G, x, y) {
    const s = this.sim.s, B = this.board(G);
    if (s.phase === 'ask' && s.ask && s.ask.kind === 'tis') { const i = Stage.hit ? Stage.hit(x, y, B.tis.map(p => ({ x: p[0], y: p[1], r: 30 })), 30) : -1; if (i >= 0) Sim.act(this, { k: 'tis', t: i }); return; }
    if ((s.phase === 'choose' || s.phase === 'pick') && Math.abs(y - B.my) < B.mh && x > B.bx && x < B.bx + B.bw) Sim.act(this, { k: 'mod', m: clamp(Math.floor((x - B.bx) / B.mw), 0, 4) });
  },
  downLake(x, y) {
    const s = this.sim.s; if (s.phase !== 'lake') return;
    const pts = s.preds.map(p => { const q = this.lakePx(p.x, p.y); return { x: q[0], y: q[1], r: 26 }; }), i = Stage.hit ? Stage.hit(x, y, pts, 24) : -1;
    if (i >= 0) { Sim.act(this, { k: 'rm', i }); return; }
    const vx = x / Stage.w * 390, vy = y / Stage.h * 540; if (vy < 140) return;
    Sim.act(this, { k: 'add', type: vy >= 440 ? 'n' : 't', x: vx, y: vy });
  },
  onKey(k) {
    const s = this.sim.s, n = this.level, v = this.v, J = this.job(); if (!s || !v) return false;
    const d = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[k];
    if ((k === ' ' || k === 'Spacebar' || k === 'Enter') && (s.phase === 'hatch' || s.phase === 'judge' || s.phase === 'test' || s.phase === 'send')) { Sim.act(this, { k: 'skip' }); return true; }
    if (n === 5) {
      if (k === 't' || k === 'T' || k === 'n' || k === 'N') { const c = this.sim.counts(), ty = k.toLowerCase() === 'n' ? 'n' : 't', P = ty === 'n' ? SWK.NYM : SWK.TRO, p = P[Math.min(3, c[ty === 'n' ? 1 : 0])]; Sim.act(this, { k: 'add', type: ty, x: p[0], y: p[1] }); return true; }
      if ((k === 'x' || k === 'X') && s.preds.length) { Sim.act(this, { k: 'rm', i: s.preds.length - 1 }); return true; }
      return false;
    }
    if (n === 4) {
      if (d && d[1]) { v.mod = clamp(v.mod + d[1], 0, 4); return true; }
      if ((k === ' ' || k === 'Spacebar') && (s.phase === 'choose' || s.phase === 'pick')) { Sim.act(this, { k: 'mod', m: v.mod }); return true; }
      if (s.phase === 'ask' && (k === '1' || k === '2' || k === '3')) { Sim.act(this, { k: 'tis', t: +k - 1 }); return true; }
      if (s.phase === 'ask' && k === '0') { Sim.act(this, { k: 'none' }); return true; }
      return false;
    }
    if (d) {
      if (J && J.k === 'crust' && d[1]) { Sim.act(this, { k: 'ub', b: s.ub + d[1] }); return true; }
      if (J && J.k === 'bound') { if (d[0]) v.cur.r = clamp(v.cur.r + d[0], 0, 4); else Sim.act(this, { k: 'bound', g: v.cur.r, b: clamp(s.b[v.cur.r] + d[1], 0, 7) }); return true; }
      v.cur.r = clamp(v.cur.r + d[0], 0, 4); v.cur.c = clamp(v.cur.c + d[1], 0, 6); return true;
    }
    if (k === ' ' || k === 'Spacebar') {
      if (s.phase === 'ask' && s.ask && s.ask.kind === 'set') { Sim.act(this, { k: 'mark', j: v.cur.c }); return true; }
      if (s.phase === 'paint' && J && J.k === 'build') { const g = v.cur.r, j = v.cur.c, c0 = s.grid[g][j]; Sim.act(this, { k: 'cell', g, j, v: g === 2 ? (c0 + 1) % 3 : 1 - c0 }); return true; }
    }
    if ((k === 'r' || k === 'R') && s.phase === 'paint') { Sim.act(this, { k: 'reset' }); return true; }
    return false;
  },

  /* ---------- drawing: a dark-field fluorescence microscope (D6 addendum 7) ---------- */
  onResize() { this._bg = null; this._lk = null; },
  scope(w, h) {   // the field of view, baked once per size: black, a dim circular field, dust, the aperture ring
    const d = Math.min(1.5, Stage.dpr || 1), key = Math.round(w) + 'x' + Math.round(h) + '@' + d;
    if (this._bg && this._bg.key === key) return this._bg.cv;
    const cv = mkCanvas(w * d, h * d), g = cv.getContext('2d'); g.scale(d, d);
    g.fillStyle = '#000000'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.47, R0 = Math.max(w, h) * 0.66, gr = g.createRadialGradient(cx, cy, 0, cx, cy, R0);
    gr.addColorStop(0, 'rgba(20,24,40,1)'); gr.addColorStop(0.5, 'rgba(9,11,20,1)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(9091);
    for (let k = 0; k < 160; k++) { g.fillStyle = 'rgba(170,190,255,' + (0.03 + 0.07 * r()).toFixed(3) + ')'; g.beginPath(); g.arc(r() * w, r() * h, 0.4 + 1.4 * r(), 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(120,140,200,.07)'; g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, Math.min(w, h) * 0.48, 0, TAU); g.stroke();
    this._bg = { key, cv }; return cv;
  },
  draw(c, w, h) {
    const s = this.sim.s; if (!s || !this.v) return;
    if (this.level === 5) { this.drawLake(c, w, h); return; }
    c.drawImage(this.scope(w, h), 0, 0, w, h);
    const G = this.geo();
    if (this.level <= 2) { this.drawSpecimen(c, G); this.drawIdRow(c, G); if (this.level === 2) this.drawLanes(c, G); else this.drawGrid(c, G); this.drawTicket(c, G); }
    else if (this.level === 3) this.drawCrustLevel(c, G);
    else this.drawCircuit(c, G);
    this.drawBanner(c, G);
  },
  drawBanner(c, G) {   // the level name glows in for a moment at the start
    const v = this.v; if (v.title <= 0 || this.calm()) return; const a = clamp(v.title / 0.6, 0, 1);
    c.save(); c.globalAlpha = a; Lbl.put('sw-ban', this.content.labels['ban' + this.level], G.W / 2, G.top + 26, { size: 18, pill: false, ink: css(SW_INK.white), weight: 700 }); c.restore();
  },
  /* the specimen: embryo stain while you paint, then larva → pupa → adult when it hatches */
  drawSpecimen(c, G) {
    const s = this.sim.s, J = this.job(), calm = this.calm(), ph = s.phase, first = s.hatchN <= 1;
    const dur = first ? SWK.T.hatch : SWK.T.hatchR, f = ph === 'hatch' ? clamp(s.t / dur, 0, 1) : ph === 'judge' || ph === 'over' ? 1 : 0;
    const X = G.X, cy = G.cy, u = G.u, ids = s.ids || swIdent(s.grid);
    if (f === 0) {
      this.drawEmbryo(c, G, s.grid, 1);
      if (ph === 'ask' && s.ask && s.ask.kind === 'set') this.drawMarks(c, G);
      if (ph === 'ask') Lbl.put('sw-q', '?', X(3), cy, { size: 22, pill: false, ink: 'rgba(236,242,255,.55)', weight: 700 });
      return;
    }
    if (calm) { if (f < 0.5) this.drawLarva(c, G, ids, 1, 1 - f * 2); else this.drawFly(c, ids, G.cx0, G.cw, cy, u, { grow: 1, alpha: (f - 0.5) * 2, tint: true }); }
    else if (f < 0.25) { this.drawEmbryo(c, G, s.grid, 1 - f / 0.25); this.drawLarva(c, G, ids, 1, f / 0.25, f / 0.25); }
    else if (f < 0.45) this.drawLarva(c, G, ids, 1, 1, 1, (f - 0.25) / 0.2);
    else if (f < 0.72) this.drawPupa(c, G, (f - 0.45) / 0.27);
    else { const g = clamp((f - 0.72) / 0.28, 0, 1); this.drawPupa(c, G, 1, g); this.drawFly(c, ids, G.cx0, G.cw, cy, u, { grow: g, alpha: clamp(g * 3, 0, 1), tint: true }); }
    if (ph === 'judge' || ph === 'over') {
      const tgt = this.sim.target(J);
      if (Array.isArray(tgt) && !s.shown && !s.ok) this.drawFly(c, tgt, G.cx0, G.cw, cy, u, { ghost: true, alpha: 0.5 });
      if (this.v.stamp > 0) { c.save(); c.globalAlpha = clamp(this.v.stamp * 2, 0, 1); Lbl.put('sw-stamp', this.content.hud.ok, G.W / 2, G.sy + 16, { size: 16, ink: '#07080C', bg: css(SW_INK.Antp), weight: 700 }); c.restore(); }
    }
  },
  glow(rgb) {   // a cached radial glow sprite per colour (drawn with 'lighter')
    const C = this._gl || (this._gl = {}), k = rgb.join(','); if (C[k]) return C[k];
    const cv = mkCanvas(64, 64), g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, css(rgb, 0.9)); gr.addColorStop(0.35, css(rgb, 0.35)); gr.addColorStop(1, css(rgb, 0)); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    C[k] = cv; return cv;
  },
  drawEmbryo(c, G, grid, a) {   // an embryo stained for five Hox proteins: each glows in its own fluorophore; overlaps add towards white
    if (a <= 0) return; const x0 = G.cx0, w = 7 * G.cw, cx = x0 + w / 2, cy = G.cy, rx = w * 0.52, ry = Math.min(G.u * 0.95, G.sh * 0.3);
    c.save(); c.globalAlpha = a;
    c.drawImage(this.glow([90, 110, 170]), cx - rx * 1.15, cy - ry * 1.9, rx * 2.3, ry * 3.8);
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, TAU); c.fillStyle = 'rgba(8,10,18,.92)'; c.fill();
    c.save(); c.clip(); c.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 7; j++) for (let g = 0; g < 5; g++) {
      const v = grid[g][j]; if (!v) continue; const rgb = SW_INK[SWK.G[g]], xl = x0 + j * G.cw, al = g === 2 && v === 1 ? 0.3 : 0.55;
      const gr = c.createLinearGradient(xl, 0, xl + G.cw, 0); gr.addColorStop(0, css(rgb, al * 0.55)); gr.addColorStop(0.5, css(rgb, al)); gr.addColorStop(1, css(rgb, al * 0.55));
      c.fillStyle = gr; c.fillRect(xl + 1, cy - ry, G.cw - 2, 2 * ry);
    }
    c.globalCompositeOperation = 'source-over'; c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.5;
    for (let j = 1; j < 7; j++) { const xl = x0 + j * G.cw; c.beginPath(); c.moveTo(xl, cy - ry); c.lineTo(xl, cy + ry); c.stroke(); }
    c.restore();
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, TAU); c.strokeStyle = 'rgba(200,215,255,.55)'; c.lineWidth = 1.6; c.stroke();
    c.restore();
  },
  drawMarks(c, G) {   // L2: the segments you marked as legged (a leg glyph above and below)
    const s = this.sim.s, cy = G.cy, ry = Math.min(G.u * 0.95, G.sh * 0.3);
    for (let j = 0; j < 7; j++) {
      const x = G.X(j), on = s.mark[j];
      c.fillStyle = on ? 'rgba(166,245,60,.10)' : 'rgba(255,255,255,.025)'; c.fillRect(x - G.cw / 2 + 2, G.sy + 4, G.cw - 4, G.sh - 8);
      if (!on) continue;
      c.strokeStyle = css(SW_INK.Antp); c.lineWidth = 2.4; c.lineCap = 'round';
      for (const sg of [-1, 1]) { const y0 = cy + sg * (ry + 4); c.beginPath(); c.moveTo(x, y0); c.lineTo(x + G.cw * 0.12, y0 + sg * G.u * 0.4); c.lineTo(x - G.cw * 0.05, y0 + sg * G.u * 0.75); c.lineTo(x + G.cw * 0.1, y0 + sg * G.u * 0.95); c.stroke(); }
    }
  },
  drawLarva(c, G, ids, unused, a, belts, crawl) {   // dark-field larval cuticle: denticle belts shine white; Keilin's organs mark thoracic (leg) identity
    if (a <= 0) return; const x0 = G.cx0, w = 7 * G.cw, cy = G.cy, hw = G.u * 0.36, cw = G.cw, wob = crawl ? Det.sin(crawl * TAU) * 0.03 : 0;
    c.save(); c.globalAlpha = a;
    const L = x0 + cw * 0.05, Rr = x0 + w - cw * 0.05; c.beginPath(); c.moveTo(L + hw, cy - hw * 0.8); c.lineTo(Rr - hw, cy - hw); c.quadraticCurveTo(Rr + hw * 0.4, cy, Rr - hw, cy + hw); c.lineTo(L + hw, cy + hw * 0.8); c.quadraticCurveTo(L - hw * 0.5, cy, L + hw, cy - hw * 0.8);
    c.fillStyle = 'rgba(180,200,255,.06)'; c.fill(); c.strokeStyle = 'rgba(220,235,255,.5)'; c.lineWidth = 1.3; c.stroke();
    const dots = (xa, rows, span, sz) => { c.fillStyle = 'rgba(245,248,255,.9)'; for (let r = 0; r < rows; r++) { const yy = span * (1 - 0.15 * Math.abs(r - (rows - 1) / 2)); for (let y = -yy; y <= yy; y += 3.2) c.fillRect(xa + r * 2.6, cy + y - 0.7, sz, 1.4); } };
    const be = belts == null ? 1 : belts;
    for (let j = 0; j < 7; j++) {
      const xl = x0 + j * cw + cw * wob * j, id = ids[j];
      c.strokeStyle = 'rgba(200,215,255,.22)'; c.lineWidth = 1; if (j) { c.beginPath(); c.moveTo(xl, cy - hw * 0.95); c.lineTo(xl, cy + hw * 0.95); c.stroke(); }
      if (j / 7 > be) continue;   // the belts crossfade in from head to tail
      if (j === 0) { c.strokeStyle = 'rgba(245,248,255,.85)'; c.lineWidth = 1.6; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(xl + cw * 0.5, cy + sg * hw * 0.1); c.quadraticCurveTo(xl + cw * 0.15, cy + sg * hw * 0.15, xl + cw * 0.1, cy + sg * hw * 0.42); c.stroke(); } }
      if (swLegCol(id)) { dots(xl + cw * 0.14, 2, hw * 0.7, 1.4); c.fillStyle = 'rgba(245,248,255,.95)'; for (const sg of [-1, 1]) for (let q = 0; q < 3; q++) { c.beginPath(); c.arc(xl + cw * (0.52 + 0.08 * q), cy + sg * hw * 0.45, 1.4, 0, TAU); c.fill(); } }
      else if (id === 'A1') dots(xl + cw * 0.12, 4, hw * 0.72, 1.6);
      else if (id === 'A') for (let k = 0; k < 3; k++) dots(xl + cw * (0.06 + k / 3), 4, hw * 0.8, 1.4);
      else if (id === 'A8') { dots(xl + cw * 0.12, 3, hw * 0.6, 1.5); if (j === 6) { c.strokeStyle = 'rgba(245,248,255,.95)'; c.lineWidth = 2.2; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(xl + cw * 0.7, cy + sg * hw * 0.18); c.lineTo(xl + cw * 0.98, cy + sg * hw * 0.24); c.stroke(); } } }
      else if (j > 0) { c.fillStyle = 'rgba(245,248,255,.55)'; c.beginPath(); c.arc(xl + cw * 0.5, cy, 1.6, 0, TAU); c.fill(); }   // no Hox: no belt (head-like)
    }
    c.restore();
  },
  drawPupa(c, G, f, open) {   // the larva shortens into a ribbed case; three cracks; the halves part as the adult unfolds
    const cx = G.X(3), cy = G.cy, rx = G.cw * (3.4 - 0.9 * Math.min(1, f)), ry = G.u * (0.36 + 0.14 * Math.min(1, f)), o = open || 0;
    if (o >= 1) return;
    c.save(); c.globalAlpha = 1 - o;
    for (const sg of [-1, 1]) {
      c.save(); c.translate(cx, cy); c.rotate(sg * 0.2 * o); c.translate(0, sg * 10 * o);
      c.beginPath(); c.ellipse(0, 0, rx, ry, 0, sg < 0 ? Math.PI : 0, sg < 0 ? TAU : Math.PI); c.closePath(); c.fillStyle = 'rgba(200,190,170,.10)'; c.fill(); c.strokeStyle = 'rgba(235,225,205,.6)'; c.lineWidth = 1.4; c.stroke();
      c.strokeStyle = 'rgba(235,225,205,.22)'; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * rx / 5, 0); c.lineTo(k * rx / 5, sg * ry * 0.92 * Math.sqrt(Math.max(0, 1 - (k / 5) * (k / 5)))); c.stroke(); }
      c.restore();
    }
    const cr = clamp((f - 0.55) / 0.45, 0, 1);   // three cracks, head to tail
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) { const p = clamp(cr * 3 - k, 0, 1); if (p <= 0) continue; const xa = cx - rx * 0.8 + k * rx * 0.6; c.beginPath(); c.moveTo(xa, cy); c.lineTo(xa + rx * 0.2 * p, cy - 3 * p); c.lineTo(xa + rx * 0.45 * p, cy + 2 * p); c.stroke(); }
    c.restore();
  },
  drawFly(c, ids, x0, cw, cy, u, o) {   // a schematic adult, dorsal view, head left: each column builds what its identity says
    o = o || {}; const g = o.grow == null ? 1 : o.grow, ghost = !!o.ghost, X = j => x0 + (j + 0.5) * cw, RY = [0.36, 0.25, 0.4, 0.29, 0.3, 0.34, 0.2];
    c.save(); c.globalAlpha = o.alpha == null ? 1 : o.alpha; c.lineCap = 'round'; c.lineJoin = 'round';
    if (ghost) c.setLineDash([4, 4]);
    const line = (pts, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); };
    const WH = ghost ? 'rgba(236,242,255,.75)' : 'rgba(236,242,255,.92)';
    // appendages first, under the body
    for (let j = 6; j >= 0; j--) {
      const id = ids[j], x = X(j), ry = RY[j] * u, tilt = [-0.6, -0.45, 0, 0.42, 0.55, 0.65, 0.75][j];
      for (const sg of [-1, 1]) {
        if (j === 0 && (id === 'H')) {   // antennae point forwards from the head
          const b = [x - cw * 0.3, cy + sg * u * 0.1]; line([b, [b[0] - cw * 0.22 * g, b[1] + sg * u * 0.12 * g], [b[0] - cw * 0.42 * g, b[1] + sg * u * 0.3 * g]], WH, 1.8);
          if (g > 0.6) line([[b[0] - cw * 0.42 * g, b[1] + sg * u * 0.3 * g], [b[0] - cw * 0.6 * g, b[1] + sg * u * 0.22 * g]], 'rgba(236,242,255,.5)', 1);
          continue;
        }
        if (id === 'H') {   // no Hox in a trunk segment: an antenna-like stub
          const b = [x, cy + sg * ry]; line([b, [b[0] - cw * 0.1 * g, b[1] + sg * u * 0.28 * g], [b[0] - cw * 0.26 * g, b[1] + sg * u * 0.46 * g]], WH, 1.8);
          continue;
        }
        if (swLegCol(id)) {   // a leg: femur, tibia, tarsus, angled forwards in front and backwards behind
          const b = [x + (j === 0 ? -cw * 0.25 : 0), cy + sg * ry * 0.8], a1 = tilt, L1 = 0.5 * u * g, L2 = 0.52 * u * g, L3 = 0.3 * u * g;
          const p1 = [b[0] + L1 * Det.sin(a1), b[1] + sg * L1 * Det.cos(a1)], a2 = a1 + 0.55, p2 = [p1[0] + L2 * Det.sin(a2), p1[1] + sg * L2 * Det.cos(a2)], a3 = a2 + 0.5, p3 = [p2[0] + L3 * Det.sin(a3), p2[1] + sg * L3 * Det.cos(a3)];
          line([b, p1, p2, p3], ghost ? WH : 'rgba(210,230,255,.9)', 2.2);
        }
        if (id === 'T2' && j > 0) {   // a wing: long, translucent, veined, swept back
          const b = [x + cw * 0.05, cy + sg * ry * 0.5], L = 2.0 * u * g, Wd = 0.5 * u * g, dx = 0.62, dy = 0.78, tip = [b[0] + L * dx, b[1] + sg * L * dy];
          const nx = -dy * sg, ny = dx;   // a normal to the wing's axis
          c.beginPath(); c.moveTo(b[0], b[1]); c.quadraticCurveTo(b[0] + L * 0.5 * dx + nx * Wd, b[1] + sg * L * 0.5 * dy + ny * Wd * sg, tip[0], tip[1]); c.quadraticCurveTo(b[0] + L * 0.55 * dx - nx * Wd * 0.7, b[1] + sg * L * 0.55 * dy - ny * Wd * 0.7 * sg, b[0], b[1]);
          if (!ghost) { c.fillStyle = 'rgba(64,226,245,.10)'; c.fill(); } c.strokeStyle = ghost ? WH : 'rgba(64,226,245,.75)'; c.lineWidth = 1.4; c.stroke();
          if (!ghost && g > 0.5) for (const t of [0.35, 0.6, 0.82]) line([[b[0] + L * 0.1 * dx, b[1] + sg * L * 0.1 * dy], [b[0] + L * t * dx + nx * Wd * 0.25, b[1] + sg * L * t * dy + ny * Wd * 0.25 * sg]], 'rgba(64,226,245,.35)', 0.8);
        }
        if (id === 'T3' && j > 0) {   // a haltere: a little knobbed balancer
          const b = [x, cy + sg * ry * 0.7], e = [b[0] + cw * 0.18 * g, b[1] + sg * u * 0.3 * g]; line([b, e], WH, 1.6);
          c.beginPath(); c.arc(e[0], e[1], Math.max(1, u * 0.09 * g), 0, TAU); if (!ghost) { c.fillStyle = css(SW_INK.Ubx, 0.8); c.fill(); } else { c.strokeStyle = WH; c.stroke(); }
        }
      }
      if (id === 'A8' && j === 6 && g > 0.3) line([[x + cw * 0.38, cy - u * 0.06], [x + cw * 0.55, cy - u * 0.12]], WH, 1.4), line([[x + cw * 0.38, cy + u * 0.06], [x + cw * 0.55, cy + u * 0.12]], WH, 1.4);
    }
    // the body, tail to head; each segment glows faintly in the stain of the gene that set it
    for (let j = 6; j >= 0; j--) {
      const x = X(j), ry = RY[j] * u, rx = j === 0 ? cw * 0.44 : cw * 0.56, top = SW_TOP[ids[j]];
      c.beginPath(); c.ellipse(x, cy, rx, ry, 0, 0, TAU);
      if (!ghost) { c.fillStyle = 'rgba(8,10,18,.95)'; c.fill(); if (o.tint && top >= 0) { c.fillStyle = css(SW_INK[SWK.G[top]], ids[j] === 'T3' ? 0.18 : 0.3); c.fill(); } }
      c.strokeStyle = WH; c.lineWidth = 1.4; c.stroke();
      if (j === 5 && !ghost) { c.strokeStyle = 'rgba(236,242,255,.3)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { const xx = x - rx + k * rx * 2 / 6; c.beginPath(); c.moveTo(xx, cy - ry * 0.85); c.lineTo(xx, cy + ry * 0.85); c.stroke(); } }
    }
    if (!ghost) for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(X(0) + cw * 0.02, cy + sg * u * 0.21, cw * 0.17, u * 0.13, 0, 0, TAU); c.fillStyle = 'rgba(160,30,110,.85)'; c.fill(); c.strokeStyle = 'rgba(255,140,220,.7)'; c.lineWidth = 1; c.stroke(); }
    c.restore();
  },
  drawIdRow(c, G) {   // column names under the specimen; after a hatch, a tick or a ring for each segment against the order
    const s = this.sim.s, L = this.content.labels, J = this.job(), tgt = this.sim.target(J), judged = (s.phase === 'judge') && Array.isArray(tgt) && !s.shown;
    for (let j = 0; j < 7; j++) {
      const x = G.X(j), y = G.iy + G.ih / 2, pop = this.v.pop[j];
      Lbl.put('sw-c' + j, L['c' + j], x, y, { size: 12 + Math.round(pop * 2), pill: false, ink: 'rgba(214,224,250,.8)' });
      if (judged) { const ok = s.ids[j] === tgt[j], yy = G.iy - 8; c.lineWidth = 2; c.strokeStyle = ok ? css(SW_INK.Antp) : css(SW_INK.Ubx); c.beginPath(); if (ok) { c.moveTo(x - 5, yy); c.lineTo(x - 1, yy + 4); c.lineTo(x + 6, yy - 4); } else c.arc(x, yy, 5, 0, TAU); c.stroke(); }
    }
  },
  drawTicket(c, G) {   // the order, pinned at the top right while you work
    const s = this.sim.s, J = this.job(); if (!J || s.phase !== 'paint') return; const tgt = this.sim.target(J); if (!Array.isArray(tgt)) return;
    const tw = Math.min(G.bw * 0.34, 170), th = tw * 0.5, tx = G.bx + G.bw - tw - 2, ty = G.sy + 2, cw = tw / 7.6;
    c.save(); rrect(c, tx, ty, tw, th, 8); c.fillStyle = 'rgba(14,16,28,.88)'; c.fill(); c.strokeStyle = 'rgba(214,60,196,.6)'; c.lineWidth = 1.4; c.stroke(); c.restore();
    this.drawFly(c, tgt, tx + cw * 0.3, cw, ty + th * 0.6, cw * 0.95, { grow: 1, alpha: 0.95, tint: true });
    Lbl.put('sw-order', this.content.labels.order, tx + 8, ty + 10, { size: 12, pill: false, align: 'left', ink: 'rgba(255,160,240,.95)' });
  },
  drawGrid(c, G) {   // the paint board: rows are genes (chromosome order), columns are segments
    const s = this.sim.s, L = this.content.labels, J = this.job(), del = J && (J.k === 'vial' || J.k === 'tap') ? SWK.VIAL[J.v] : [], gone = {};
    for (const [r, val] of del) if (val === 0) gone[r] = 1;
    const paint = s.phase === 'paint', v = this.v, key = typeof Fx !== 'undefined' && Fx.lastInput === 'key';
    for (let g = 0; g < 5; g++) {
      const y = G.by + g * G.rh, rgb = SW_INK[SWK.G[g]], lx = G.bx + G.labW - 6, ly = y + G.rh / 2;
      Lbl.put('sw-g' + g, L['g' + g], lx, ly, { size: 13, align: 'right', pill: false, ink: gone[g] ? 'rgba(150,160,190,.6)' : css(rgb), weight: 700 });
      if (gone[g]) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(G.bx + 4, ly); c.lineTo(lx + 2, ly); c.stroke(); }
      for (let j = 0; j < 7; j++) {
        const val = s.grid[g][j], x = G.cx0 + j * G.cw, p = 3, cw = G.cw - 2 * p, ch = G.rh - 2 * p;
        rrect(c, x + p, y + p, cw, ch, 6);
        if (val) {
          const lo = g === 2 && val === 1; c.fillStyle = css(rgb, lo ? 0.4 : 0.86); c.fill();
          c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = lo ? 0.25 : 0.4; c.drawImage(this.glow(rgb), x - cw * 0.2, y - ch * 0.3, G.cw * 1.4, G.rh * 1.6); c.restore();
          if (cw >= 30) Lbl.put('sw-n' + g + j, L['g' + g], x + G.cw / 2, y + G.rh / 2 - (g === 2 ? 3 : 0), { size: 12, pill: false, ink: lo ? 'rgba(255,230,250,.95)' : '#07080C', weight: 700 });
          if (g === 2) { c.fillStyle = lo ? 'rgba(255,230,250,.95)' : '#07080C'; for (let k = 0; k < val; k++) { c.beginPath(); c.arc(x + G.cw / 2 + (k - (val - 1) / 2) * 7, y + G.rh - p - 6, 2.2, 0, TAU); c.fill(); } }   // dose pips: one low, two high
        } else { c.strokeStyle = paint ? 'rgba(150,170,230,.2)' : 'rgba(150,170,230,.1)'; c.lineWidth = 1; c.stroke(); }
        if (gone[g]) { c.save(); rrect(c, x + p, y + p, cw, ch, 6); c.clip(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; for (let k = -ch; k < cw; k += 6) { c.beginPath(); c.moveTo(x + p + k, y + p + ch); c.lineTo(x + p + k + ch, y + p); c.stroke(); } c.restore(); }
      }
    }
    if (key && (paint || (s.ask && s.ask.kind === 'set'))) { const x = G.cx0 + v.cur.c * G.cw, y = s.ask ? G.sy + 4 : G.by + v.cur.r * G.rh; c.strokeStyle = css(SW_INK.white); c.lineWidth = 2; rrect(c, x + 1, y + 1, G.cw - 2, s.ask ? G.sh - 8 : G.rh - 2, 7); c.stroke(); }
  },
  drawLanes(c, G) {   // L3: a lane per gene with its glowing domain; the chromosome below fans out to each front edge (colinearity)
    const s = this.sim.s, L = this.content.labels, lh = this.laneH(G), T = this.tabs(G), b = s.b || SWK.WB, key = typeof Fx !== 'undefined' && Fx.lastInput === 'key';
    const chY = G.by + 5 * lh + 16, x0 = G.bx + 6, x1 = G.bx + G.bw - 6, cw = x1 - x0;
    const genes = [0.05, 0.13, 0.21, 0.31, 0.41, 0.66, 0.76, 0.86], ours = [3, 4, 5, 6, 7], chX = g => x0 + genes[ours[g]] * cw;   // lab pb Dfd Scr Antp … Ubx abd-A Abd-B
    for (let g = 0; g < 5; g++) {
      const y = G.by + (g + 0.5) * lh, rgb = SW_INK[SWK.G[g]];
      c.strokeStyle = 'rgba(150,170,230,.14)'; c.lineWidth = 1; c.beginPath(); c.moveTo(G.cx0, y); c.lineTo(G.cx0 + 7 * G.cw, y); c.stroke();
      Lbl.put('sw-lg' + g, L['g' + g], G.bx + G.labW - 6, y, { size: 13, align: 'right', pill: false, ink: css(rgb), weight: 700 });
      if (b[g] < 7) {
        const xa = G.cx0 + b[g] * G.cw, xb = g === 0 ? xa + G.cw : G.cx0 + 7 * G.cw;
        c.save(); c.globalCompositeOperation = 'lighter'; rrect(c, xa + 2, y - lh * 0.22, xb - xa - 4, lh * 0.44, lh * 0.2);
        for (let j = b[g]; j < (g === 0 ? b[g] + 1 : 7); j++) { const lo = g === 2 && j <= 3; c.fillStyle = css(rgb, lo ? 0.32 : 0.62); c.fillRect(G.cx0 + j * G.cw + 2, y - lh * 0.22, G.cw - 4, lh * 0.44); }
        c.restore();
      }
    }
    // the chromosome: a banded polytene arm with the two Hox complexes; the head genes lab, pb and Dfd are dimmed
    c.fillStyle = 'rgba(200,205,225,.12)'; rrect(c, x0, chY - 7, cw, 14, 7); c.fill();
    const r = rng(77); for (let k = 0; k < 60; k++) { c.fillStyle = 'rgba(220,225,240,' + (0.06 + 0.18 * r()).toFixed(3) + ')'; c.fillRect(x0 + r() * cw, chY - 7, 1 + 3 * r(), 14); }
    genes.forEach((p, k) => { const o = ours.indexOf(k), rgb = o >= 0 ? SW_INK[SWK.G[o]] : [120, 128, 150]; c.fillStyle = css(rgb, o >= 0 ? 0.95 : 0.5); rrect(c, x0 + p * cw - 9, chY - 9, 18, 18, 4); c.fill(); });
    Lbl.put('sw-antc', L.antc, x0 + 0.23 * cw, chY + 22, { size: 12, pill: false, ink: 'rgba(200,210,240,.7)' });
    Lbl.put('sw-bxc', L.bxc, x0 + 0.76 * cw, chY + 22, { size: 12, pill: false, ink: 'rgba(200,210,240,.7)' });
    // the fan: each gene's line runs from its place on the chromosome to its front edge on the body
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let g = 0; g < 5; g++) { const t = T[g], cx = chX(g); c.strokeStyle = css(SW_INK[SWK.G[g]], b[g] >= 7 ? 0.25 : 0.7); c.lineWidth = 2; c.setLineDash(b[g] >= 7 ? [3, 4] : []); c.beginPath(); c.moveTo(cx, chY - 9); c.bezierCurveTo(cx, chY - 30, t.x, t.y + lh * 0.9, t.x, t.y + lh * 0.25); c.stroke(); }
    c.restore(); c.setLineDash([]);
    for (let g = 0; g < 5; g++) {   // the tabs you drag
      const t = T[g], rgb = SW_INK[SWK.G[g]], hw = Math.min(11, lh * 0.32); c.beginPath(); c.moveTo(t.x, t.y - hw * 1.3); c.lineTo(t.x + hw, t.y); c.lineTo(t.x, t.y + hw * 1.3); c.lineTo(t.x - hw * 0.5, t.y); c.closePath();
      c.fillStyle = css(rgb, b[g] >= 7 ? 0.35 : 1); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = key && this.v.cur.r === g ? 2.4 : 1; c.stroke();
      if (b[g] >= 7) Lbl.put('sw-off' + g, L.off, t.x + 18, t.y, { size: 12, pill: false, align: 'left', ink: 'rgba(200,210,240,.6)' });
    }
  },
  /* ---------- L4: crustaceans ---------- */
  drawCrustLevel(c, G) {
    const s = this.sim.s, J = this.job(), C = this.crGeo(G), L = this.content.labels, ask = J && J.k === 'askx';
    const ph = s.phase, f = ph === 'hatch' ? clamp(s.t / (s.hatchN <= 1 ? SWK.T.hatch : SWK.T.hatchR), 0, 1) : 1;
    const ub = ask ? (ph === 'ask' ? 0 : s.ub) : s.ub, stainB = ask && ph === 'ask' ? null : ub;
    const appB = ask ? SWK.CR.mantis.maxi + 1 : s.ub;   // the mantis shrimp is drawn as it really is; you predict its stain
    this.drawCrust(c, C, C.sp, appB, stainB, ph === 'hatch' ? 0.6 + 0.4 * f : 1);
    // the rail: the Ubx/abd-A front edge you drag
    c.strokeStyle = 'rgba(150,170,230,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(C.thx, C.ry); c.lineTo(C.thx + C.thw, C.ry); c.stroke();
    for (let i = 0; i <= C.nT; i++) { const x = C.thx + i * C.sw; c.beginPath(); c.moveTo(x, C.ry - 5); c.lineTo(x, C.ry + 5); c.stroke(); }
    if (!ask || ph !== 'ask') { const x = C.edgeX(s.ub); c.beginPath(); c.moveTo(x, C.ry - 16); c.lineTo(x + 11, C.ry); c.lineTo(x, C.ry + 16); c.lineTo(x - 6, C.ry); c.closePath(); c.fillStyle = css(SW_INK.Ubx); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1.2; c.stroke(); c.setLineDash([3, 4]); c.strokeStyle = css(SW_INK.Ubx, 0.6); c.beginPath(); c.moveTo(x, C.ry - 16); c.lineTo(x, C.cy - C.u * 0.2); c.stroke(); c.setLineDash([]); }
    Lbl.put('sw-t1', 'T1', C.segX(0), C.ry + 22, { size: 12, pill: false, ink: 'rgba(214,224,250,.8)' });
    Lbl.put('sw-tn', 'T' + C.nT, C.segX(C.nT - 1), C.ry + 22, { size: 12, pill: false, ink: 'rgba(214,224,250,.8)' });
    Lbl.put('sw-sp', L[C.sp], C.x0 + C.len / 2, G.top + 18, { size: 14, pill: false, ink: css(SW_INK.white), weight: 700 });
    Lbl.put('sw-feed', L.feed, C.thx, C.cy + C.u * 1.35, { size: 12, pill: false, align: 'left', ink: 'rgba(255,170,235,.9)' });
    if (J && J.k === 'crust' && ph === 'paint') {   // the order: the target animal, small, top right
      const tw = Math.min(G.W * 0.3, 170), tC = Object.assign({}, C, { len: tw, x0: G.W - tw - 10, u: tw / 10 }); tC.head = tw * 0.16; tC.thx = tC.x0 + tC.head; tC.thw = tw * (C.sp === 'artemia' ? 0.5 : 0.46); tC.sw = tC.thw / C.nT; tC.cy = G.top + 40; tC.segX = i => tC.thx + (i + 0.5) * tC.sw;
      c.save(); rrect(c, tC.x0 - 6, tC.cy - tw * 0.2, tw + 12, tw * 0.42, 8); c.fillStyle = 'rgba(14,16,28,.88)'; c.fill(); c.strokeStyle = 'rgba(214,60,196,.6)'; c.lineWidth = 1.4; c.stroke(); c.restore();
      this.drawCrust(c, tC, C.sp, SWK.CR[C.sp].maxi + 1, null, 0.95);
      Lbl.put('sw-order', L.order, tC.x0, tC.cy - tw * 0.2 + 10, { size: 12, pill: false, align: 'left', ink: 'rgba(255,160,240,.95)' });
    }
    if (ph === 'judge' && J && J.k === 'crust' && s.ok) { c.save(); c.globalAlpha = clamp(this.v.stamp * 2, 0, 1); Lbl.put('sw-stamp', this.content.hud.ok, G.W / 2, C.cy - C.u * 1.6, { size: 16, ink: '#07080C', bg: css(SW_INK.Antp), weight: 700 }); c.restore(); }
  },
  drawCrust(c, C, sp, appB, stainB, a) {   // side view, head left: thoracic legs in front of the edge are short feeding legs that fold to the mouth
    const u = C.u, cy = C.cy, nT = C.nT, bodyH = u * (sp === 'isopod' ? 0.55 : sp === 'artemia' ? 0.32 : 0.45), abdL = C.len - C.head - C.thw, ab0 = C.thx + C.thw;
    c.save(); c.globalAlpha = a; c.lineCap = 'round'; c.lineJoin = 'round';
    const W = 'rgba(226,236,255,.9)', ln = (pts, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); };
    for (let i = 0; i < nT; i++) {   // limbs
      const x = C.segX(i), y0 = cy + bodyH * 0.8, feed = i + 1 < appB;
      if (feed) {
        if (sp === 'mantis' && i === 1) { ln([[x, y0], [x + u * 0.25, y0 + u * 0.45], [x - u * 0.35, y0 + u * 0.55], [x - u * 0.25, y0 + u * 0.3]], css(SW_INK.Ubx, 0.95), 3); continue; }   // the raptorial claw is a feeding leg
        ln([[x, y0], [x - u * 0.12, y0 + u * 0.32], [x - u * 0.34, y0 + u * 0.36]], 'rgba(255,170,235,.95)', 2.2);
        for (let k = 0; k < 3; k++) ln([[x - u * (0.12 + 0.07 * k), y0 + u * (0.33 + 0.01 * k)], [x - u * (0.14 + 0.07 * k), y0 + u * 0.44]], 'rgba(255,170,235,.5)', 1);
      } else if (sp === 'artemia') { c.beginPath(); c.ellipse(x, y0 + u * 0.35, u * 0.09, u * 0.32, 0.2, 0, TAU); c.fillStyle = 'rgba(64,226,245,.12)'; c.fill(); c.strokeStyle = 'rgba(64,226,245,.8)'; c.lineWidth = 1.2; c.stroke(); }
      else if (sp === 'lobster' && i === appB - 1) { ln([[x, y0], [x + u * 0.2, y0 + u * 0.4], [x + u * 0.7, y0 + u * 0.45]], W, 2.6); c.beginPath(); c.ellipse(x + u * 1.0, y0 + u * 0.42, u * 0.32, u * 0.14, -0.1, 0, TAU); c.strokeStyle = W; c.lineWidth = 2; c.stroke(); }
      else ln([[x, y0], [x + u * 0.08, y0 + u * 0.42], [x - u * 0.06, y0 + u * 0.8], [x - u * 0.16, y0 + u * 0.95]], W, 1.8);
    }
    if (stainB != null) {   // the Ubx/abd-A stain glows over the thorax behind the edge, and the abdomen
      c.save(); c.globalCompositeOperation = 'lighter'; const xa = C.edgeX(stainB), gr = c.createLinearGradient(xa - C.sw * 0.4, 0, xa + C.sw * 0.6, 0);
      gr.addColorStop(0, css(SW_INK.Ubx, 0)); gr.addColorStop(1, css(SW_INK.Ubx, 0.42)); c.fillStyle = gr; c.fillRect(xa - C.sw * 0.4, cy - bodyH * 1.3, ab0 + abdL - xa + C.sw * 0.4, bodyH * 2.6); c.restore();
    }
    // body: head with eye and antennae, thoracic segments, abdomen to the tail fan
    c.beginPath(); c.moveTo(C.x0 + u * 0.2, cy); c.quadraticCurveTo(C.x0 + u * 0.4, cy - bodyH * 1.2, C.thx, cy - bodyH); c.lineTo(ab0, cy - bodyH * (sp === 'isopod' ? 1 : 0.95));
    c.quadraticCurveTo(ab0 + abdL * 0.6, cy - bodyH * 0.7, ab0 + abdL * 0.92, cy - bodyH * 0.25); c.lineTo(ab0 + abdL * 0.92, cy + bodyH * 0.25); c.quadraticCurveTo(ab0 + abdL * 0.6, cy + bodyH * 0.75, ab0, cy + bodyH);
    c.lineTo(C.thx, cy + bodyH); c.quadraticCurveTo(C.x0 + u * 0.4, cy + bodyH * 1.1, C.x0 + u * 0.2, cy); c.closePath();
    c.fillStyle = 'rgba(10,12,22,.75)'; c.fill(); c.strokeStyle = W; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = 'rgba(226,236,255,.3)'; c.lineWidth = 1;
    for (let i = 1; i <= nT; i++) { const x = C.thx + i * C.sw; c.beginPath(); c.moveTo(x, cy - bodyH * 0.92); c.lineTo(x, cy + bodyH * 0.92); c.stroke(); }
    for (let k = 1; k < 6; k++) { const x = ab0 + abdL * 0.92 * k / 6; c.beginPath(); c.moveTo(x, cy - bodyH * 0.7); c.lineTo(x, cy + bodyH * 0.7); c.stroke(); }
    if (sp === 'lobster' || sp === 'mantis') { c.beginPath(); c.moveTo(C.x0 + u * 0.4, cy - bodyH * 1.05); c.lineTo(C.thx + C.thw * (sp === 'lobster' ? 1 : 0.35), cy - bodyH * 1.1); c.strokeStyle = 'rgba(226,236,255,.6)'; c.lineWidth = 1.4; c.stroke(); }   // the carapace
    const tx = ab0 + abdL * 0.92; ln([[tx, cy], [tx + u * 0.35, cy - u * 0.22]], W, 1.6); ln([[tx, cy], [tx + u * 0.38, cy]], W, 1.6); ln([[tx, cy], [tx + u * 0.35, cy + u * 0.22]], W, 1.6);
    const ex = C.x0 + u * 0.55, ey = cy - bodyH * (sp === 'artemia' ? 1.1 : 0.6);
    if (sp === 'artemia') ln([[C.x0 + u * 0.5, cy - bodyH * 0.5], [ex, ey]], W, 1.2);
    c.beginPath(); c.arc(ex, ey, u * 0.08, 0, TAU); c.fillStyle = css(SW_INK.Scr, 0.9); c.fill();
    ln([[C.x0 + u * 0.25, cy - bodyH * 0.3], [C.x0 - u * 0.25, cy - u * 0.75], [C.x0 - u * 0.6, cy - u * 0.85]], W, 1.2); ln([[C.x0 + u * 0.25, cy - bodyH * 0.1], [C.x0 - u * 0.4, cy - u * 0.35]], W, 1.2);
    c.restore();
  },
  /* ---------- L5: the Pitx1 circuit board ---------- */
  drawCircuit(c, G) {
    const s = this.sim.s, B = this.board(G), L = this.content.labels, ph = s.phase, last = s.tests[s.tests.length - 1];
    const showM = ph === 'test' || ph === 'choose' || ph === 'pick' || ph === 'send' ? (ph === 'send' ? s.sent : last && last.m) : null, testing = ph === 'test', grow = testing ? clamp(s.t / 1.2, 0, 1) : 1;
    const dark = showM && !(ph === 'choose' && !last) ? SWK.DARK[showM] : [0, 0, 0], fate = showM ? SWK.FATE[showM] : 'clean';
    // the fry: a stickleback larva in side view with a green reporter where Pitx1 is on
    const fx = B.fx, fl = B.fl, fy = B.fy, dead = fate === 'dies' && grow >= 1 && showM;
    c.save(); c.globalAlpha = dead ? 0.45 : 1; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(fx, fy); c.quadraticCurveTo(fx + fl * 0.05, fy - fl * 0.11, fx + fl * 0.3, fy - fl * 0.1); c.quadraticCurveTo(fx + fl * 0.7, fy - fl * 0.07, fx + fl * 0.86, fy - fl * 0.02);
    c.lineTo(fx + fl, fy - fl * 0.08); c.lineTo(fx + fl * 0.97, fy); c.lineTo(fx + fl, fy + fl * 0.08); c.lineTo(fx + fl * 0.86, fy + fl * 0.02); c.quadraticCurveTo(fx + fl * 0.6, fy + fl * 0.1, fx + fl * 0.3, fy + fl * 0.11);
    c.quadraticCurveTo(fx + fl * 0.06, fy + fl * 0.1, fx, fy); c.closePath(); c.fillStyle = 'rgba(14,20,30,.9)'; c.fill(); c.strokeStyle = 'rgba(220,235,255,.6)'; c.lineWidth = 1.5; c.stroke();
    c.beginPath(); c.arc(fx + fl * 0.1, fy - fl * 0.025, fl * 0.028, 0, TAU); c.fillStyle = 'rgba(220,235,255,.85)'; c.fill();
    for (let k = 0; k < 3; k++) { const x = fx + fl * (0.36 + 0.12 * k); c.strokeStyle = 'rgba(220,235,255,.7)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, fy - fl * 0.09); c.lineTo(x + fl * 0.02, fy - fl * (0.17 - 0.03 * k)); c.stroke(); }   // three dorsal spines
    const jawBad = dark[1] && grow >= 1, pelOn = !dark[2] || grow < 1;
    c.strokeStyle = jawBad ? 'rgba(255,122,138,.9)' : 'rgba(220,235,255,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(fx + fl * 0.01, fy + fl * 0.01); c.lineTo(fx + fl * (jawBad ? 0.08 : 0.12), fy + fl * (jawBad ? 0.06 : 0.05)); c.stroke();
    if (pelOn) { c.strokeStyle = 'rgba(220,235,255,.9)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(B.tis[2][0], B.tis[2][1] - fl * 0.01); c.lineTo(B.tis[2][0] + fl * 0.06, B.tis[2][1] + fl * 0.07); c.stroke(); }   // the pelvic spine
    c.restore();
    c.save(); c.globalCompositeOperation = 'lighter';
    B.tis.forEach((p, t) => { const on = !dark[t] || !showM, weak = showM === 'swap' && grow >= 1, a = (on ? 1 : 1 - grow) * (weak ? 0.35 : 1) * (dead ? 0.4 : 1); if (a > 0.02) { c.globalAlpha = a; c.drawImage(this.glow(SW_INK.gfp), p[0] - fl * 0.07, p[1] - fl * 0.07, fl * 0.14, fl * 0.14); } });
    c.restore();
    B.tis.forEach((p, t) => { Lbl.put('sw-tis' + t, L[SWK.MOD[t]], p[0], p[1] - fl * 0.075, { size: 12, pill: false, ink: 'rgba(214,224,250,.85)' }); });
    if (ph === 'ask') B.tis.forEach((p, t) => { if (!s.tis[t]) { c.strokeStyle = 'rgba(214,224,250,.35)'; c.setLineDash([3, 4]); c.lineWidth = 1.4; c.beginPath(); c.arc(p[0], p[1], 22, 0, TAU); c.stroke(); c.setLineDash([]); return; } c.strokeStyle = css(SW_INK.Ubx); c.lineWidth = 2.6; c.beginPath(); c.arc(p[0], p[1], 22, 0, TAU); c.stroke(); Lbl.put('sw-dk' + t, L.dark, p[0], p[1] + 32, { size: 12, ink: '#07080C', bg: css(SW_INK.Ubx) }); });
    if (showM && grow >= 1 && (ph === 'test' || ph === 'send' || ph === 'choose' || ph === 'pick')) Lbl.put('sw-fate', L[fate], fx + fl * 0.5, fy + fl * 0.17, { size: 14, ink: '#07080C', bg: fate === 'clean' ? css(SW_INK.gfp) : css(SW_INK.AbdB), weight: 700 });
    // the dish of test embryos
    for (let k = 0; k < 4; k++) { const x = B.bx + 14 + k * 20, y = G.top + 14; c.beginPath(); c.arc(x, y, 7, 0, TAU); if (k < s.left) { c.fillStyle = 'rgba(200,215,255,.5)'; c.fill(); } c.strokeStyle = 'rgba(200,215,255,.6)'; c.lineWidth = 1.2; c.stroke(); }
    Lbl.put('sw-emb', L.embryos, B.bx + 96, G.top + 14, { size: 12, pill: false, align: 'left', ink: 'rgba(200,215,255,.7)' });
    // the board: three enhancer chips, then the coding sequence (two exons); traces run up to the tissues they light
    const by = B.my, mh = B.mh, key = typeof Fx !== 'undefined' && Fx.lastInput === 'key';
    c.strokeStyle = 'rgba(180,200,240,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(B.bx, by); c.lineTo(B.bx + B.bw, by); c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let m = 0; m < 3; m++) { const x = B.mx(m), p = B.tis[m], cut = showM === SWK.MOD[m]; c.strokeStyle = css(SW_INK.gfp, cut ? 0.12 : 0.5); c.lineWidth = 2; c.beginPath(); c.moveTo(x, by - mh / 2); c.lineTo(x, by - mh / 2 - (by - p[1]) * 0.35); c.lineTo(p[0], p[1] + 24); c.stroke(); }
    c.restore();
    for (let m = 0; m < 5; m++) {
      const x = B.mx(m), w = B.mw * 0.86, code = m >= 3, cut = showM === SWK.MOD[m], sel = s.sel === m && (ph === 'ask' || ph === 'pick' || ph === 'test');
      rrect(c, x - w / 2, by - mh / 2, w, mh, 6); c.fillStyle = code ? 'rgba(64,226,245,.18)' : 'rgba(120,255,120,.16)'; c.fill();
      c.strokeStyle = sel ? '#FFFFFF' : code ? 'rgba(64,226,245,.7)' : 'rgba(120,255,120,.7)'; c.lineWidth = sel ? 2.4 : 1.2; c.stroke();
      if (cut) { c.strokeStyle = css(SW_INK.AbdB); c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - 6, by - mh / 2 - 4); c.lineTo(x + 6, by + mh / 2 + 4); c.stroke(); }
      Lbl.put('sw-m' + m, L['m' + SWK.MOD[m]], x, by + mh / 2 + 12, { size: 12, pill: false, ink: 'rgba(214,224,250,.85)' });
      if (key && this.v.mod === m) { c.strokeStyle = css(SW_INK.white); c.lineWidth = 2; rrect(c, x - w / 2 - 3, by - mh / 2 - 3, w + 6, mh + 6, 8); c.stroke(); }
    }
    Lbl.put('sw-enh', L.enh, (B.mx(0) + B.mx(2)) / 2, by - mh / 2 - 12, { size: 12, pill: false, ink: 'rgba(160,255,160,.75)' });
    Lbl.put('sw-code', L.code, (B.mx(3) + B.mx(4)) / 2, by - mh / 2 - 12, { size: 12, pill: false, ink: 'rgba(120,230,250,.75)' });
    if (this.v.snip) { const k = this.v.snip.age, x = B.mx(this.v.snip.m); c.strokeStyle = 'rgba(255,255,255,' + (1 - k).toFixed(2) + ')'; c.lineWidth = 2; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(x - 10, by - 14 * sg); c.lineTo(x + 8 - k * 6, by + 2 * sg); c.stroke(); } }
  },
  /* ---------- L6: the lake ---------- */
  lake(w, h) {   // cold, clear water baked once per size: a surface line, light shafts, a weed bed along the bottom
    const d = Math.min(1.5, Stage.dpr || 1), key = Math.round(w) + 'x' + Math.round(h) + '@' + d; if (this._lk && this._lk.key === key) return this._lk.cv;
    const cv = mkCanvas(w * d, h * d), g = cv.getContext('2d'); g.scale(d, d);
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0E3A44'); bg.addColorStop(0.45, '#08262E'); bg.addColorStop(1, '#03131A'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const r = rng(5150); g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++) { const x = r() * w, ww = 30 + 70 * r(); const gr = g.createLinearGradient(x, 0, x + ww * 0.6, h * 0.8); gr.addColorStop(0, 'rgba(120,220,230,.08)'); gr.addColorStop(1, 'rgba(120,220,230,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + ww, 0); g.lineTo(x + ww * 1.6, h * 0.8); g.lineTo(x + ww * 0.6, h * 0.8); g.closePath(); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    const wy = 440 / 540 * h; g.fillStyle = 'rgba(10,30,20,.75)'; g.fillRect(0, wy + 20, w, h - wy);
    for (let k = 0; k < 70; k++) { const x = r() * w, hh = (30 + 70 * r()) / 540 * h, y0 = h; g.strokeStyle = 'rgba(' + (40 + 40 * r() | 0) + ',' + (110 + 60 * r() | 0) + ',70,.7)'; g.lineWidth = 2 + 2 * r(); g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (r() - 0.5) * 30, y0 - hh * 0.6, x + (r() - 0.5) * 20, y0 - hh); g.stroke(); }
    g.strokeStyle = 'rgba(200,240,250,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 6); for (let x = 0; x <= w; x += 20) g.lineTo(x, 6 + 2 * Det.sin(x * 0.07)); g.stroke();
    this._lk = { key, cv }; return cv;
  },
  fishSprite(spiny, S) {   // a stickleback, side view, faces right; the pelvic spine is the trait you can see
    const C = this._fs || (this._fs = {}), k = (spiny ? 's' : 'n') + Math.round(S); if (C[k]) return C[k];
    const d = Math.min(2, Stage.dpr || 1), cv = mkCanvas(S * 1.3 * d, S * 0.8 * d), g = cv.getContext('2d'); g.scale(d, d); g.translate(S * 0.62, S * 0.36);
    g.fillStyle = '#9DB5A6'; g.beginPath(); g.moveTo(S * 0.5, 0); g.quadraticCurveTo(S * 0.2, -S * 0.2, -S * 0.3, -S * 0.08); g.lineTo(-S * 0.5, -S * 0.17); g.lineTo(-S * 0.46, 0); g.lineTo(-S * 0.5, S * 0.17); g.lineTo(-S * 0.3, S * 0.08); g.quadraticCurveTo(S * 0.2, S * 0.2, S * 0.5, 0); g.fill();
    g.fillStyle = 'rgba(230,240,235,.6)'; g.beginPath(); g.ellipse(S * 0.05, S * 0.06, S * 0.3, S * 0.06, 0, 0, TAU); g.fill();
    g.strokeStyle = '#DDE8E2'; g.lineWidth = Math.max(1, S * 0.05); g.lineCap = 'round';
    for (const x of [0.22, 0.08, -0.06]) { g.beginPath(); g.moveTo(S * x, -S * 0.14); g.lineTo(S * (x + 0.04), -S * 0.3); g.stroke(); }
    if (spiny) { g.lineWidth = Math.max(1.2, S * 0.07); g.beginPath(); g.moveTo(S * 0.12, S * 0.13); g.lineTo(-S * 0.08, S * 0.36); g.stroke(); }
    g.fillStyle = '#0B1A1E'; g.beginPath(); g.arc(S * 0.36, -S * 0.03, S * 0.045, 0, TAU); g.fill();
    cv.cw = S * 1.3; cv.ch = S * 0.8; C[k] = cv; return cv;
  },
  drawLake(c, w, h) {
    const s = this.sim.s, v = this.v, L = this.content.labels, sim = this.sim, calm = this.calm(), S = clamp(Math.min(w, 1.2 * h) * 0.06, 16, 34);
    c.drawImage(this.lake(w, h), 0, 0, w, h);
    if (v.flash > 0) { c.fillStyle = 'rgba(200,240,255,' + (v.flash * 0.15).toFixed(3) + ')'; c.fillRect(0, 0, w, h); }
    const top = this.hudH() + 6, by = 430 / 540 * h, n = Math.min(SWK.LAKE.SHOW, s.fish.length), t = v.swim;
    const dying = {}; for (const k of v.strikes) dying[k.i] = k;
    for (let i = 0; i < n; i++) {   // the visible fish: a deterministic swim path per id (view only)
      const f = s.fish[i], k = dying[i]; if (f.dead && !k) continue;
      const h1 = ((f.id * 2654435761) >>> 0) / 4294967296, h2 = ((f.id * 40503 + 7) % 1000) / 1000, sp = 0.03 + 0.04 * h2, dir = h1 < 0.5 ? 1 : -1;
      let x = (h1 * 7.3 + dir * t * sp) % 1; if (x < 0) x += 1; x = 12 + x * (w - 24);
      const y = top + 20 + h2 * (by - top - 40) + (calm ? 0 : 6 * Det.sin(t * 1.3 + h1 * 9));
      const spr = this.fishSprite(sim.spiny(f.g), S);
      c.save(); c.translate(x, y); if (dir < 0) c.scale(-1, 1); if (k) { const a = clamp(k.age / 0.8, 0, 1); c.globalAlpha = 1 - a; c.rotate(0.4 * a); } c.drawImage(spr, -spr.cw * 0.62, -spr.ch * 0.45, spr.cw, spr.ch); c.restore();
      if (k && k.age > 0 && k.age < 0.5) { c.strokeStyle = k.by === 't' ? 'rgba(255,190,150,.9)' : 'rgba(190,255,150,.9)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, S * (0.4 + k.age), 0, TAU); c.stroke(); }
    }
    s.preds.forEach((p, i) => {   // predators: trout patrol open water; nymphs lurk in the weeds
      const q = this.lakePx(p.x, p.y), sw = calm ? 0 : Det.sin(t * 0.8 + i * 1.7);
      if (p.type === 't') {
        const x = q[0] + sw * 18, y = q[1], L2 = S * 2.6; c.save(); c.translate(x, y); if (Det.cos(t * 0.8 + i * 1.7) < 0) c.scale(-1, 1);
        c.fillStyle = '#7C8A6A'; c.beginPath(); c.moveTo(L2 * 0.5, 0); c.quadraticCurveTo(L2 * 0.1, -L2 * 0.22, -L2 * 0.35, -L2 * 0.06); c.lineTo(-L2 * 0.55, -L2 * 0.18); c.lineTo(-L2 * 0.5, 0); c.lineTo(-L2 * 0.55, L2 * 0.18); c.lineTo(-L2 * 0.35, L2 * 0.06); c.quadraticCurveTo(L2 * 0.1, L2 * 0.22, L2 * 0.5, 0); c.fill();
        c.fillStyle = 'rgba(40,30,30,.6)'; for (let k = 0; k < 8; k++) { c.beginPath(); c.arc(-L2 * 0.25 + k * L2 * 0.08, -L2 * 0.05 + (k % 2) * L2 * 0.06, 1.6, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(230,140,120,.5)'; c.fillRect(-L2 * 0.3, -1, L2 * 0.6, 2); c.fillStyle = '#101010'; c.beginPath(); c.arc(L2 * 0.36, -L2 * 0.04, 2.4, 0, TAU); c.fill(); c.restore();
      } else {
        const x = q[0], y = q[1]; c.save(); c.translate(x, y); c.fillStyle = '#5E7A3C'; c.beginPath(); c.ellipse(0, 0, S * 0.75, S * 0.28, 0, 0, TAU); c.fill(); c.fillStyle = '#4A6230'; c.beginPath(); c.ellipse(S * 0.65, 0, S * 0.25, S * 0.22, 0, 0, TAU); c.fill();
        c.strokeStyle = '#88A85A'; c.lineWidth = 1.6; for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(S * (0.3 - 0.25 * k), sg * S * 0.2); c.lineTo(S * (0.2 - 0.25 * k), sg * S * 0.5); c.stroke(); }
        c.fillStyle = '#D7E4B0'; c.beginPath(); c.arc(S * 0.75, -S * 0.1, 2, 0, TAU); c.arc(S * 0.75, S * 0.1, 2, 0, TAU); c.fill(); c.restore();
      }
    });
    const c2 = sim.counts();
    Lbl.put('sw-lt', L.trout + ' ' + c2[0], 12, h - 50, { size: 13, align: 'left', ink: '#0B1A1E', bg: 'rgba(225,235,230,.9)' });
    Lbl.put('sw-ln', L.nymph + ' ' + c2[1], 12, h - 24, { size: 13, align: 'left', ink: '#0B1A1E', bg: 'rgba(205,235,180,.9)' });
    Lbl.put('sw-xn', L.xn, w - 12, h - 24, { size: 12, align: 'right', ink: '#0B1A1E', bg: 'rgba(225,235,230,.85)' });
    if (v.title > 0 && !calm) { c.save(); c.globalAlpha = clamp(v.title / 0.6, 0, 1); Lbl.put('sw-ban', L.ban5, w / 2, top + 26, { size: 18, pill: false, ink: css(SW_INK.white), weight: 700 }); c.restore(); }
  },

  /* ---------- the live graph (notes() feeds the strip; never pauses) ---------- */
  notes(card) {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    const n = this.level, L = this.content.labels, stats = [], idName = id => L['id' + id] || id, cols = [0, 1, 2, 3, 4, 5, 6].map(j => L['c' + j]);
    if (n <= 2) {
      const J = this.job() || s.jobs[s.jobs.length - 1], tgt = this.sim.target(J), see = s.phase === 'judge' || s.phase === 'over' || card;
      const row = { type: 'sw_row', title: L.chRow, cols, target: Array.isArray(tgt) ? tgt : null, yours: see && s.ids ? s.ids : null, names: ['H', 'T1', 'T2', 'T3', 'A1', 'A', 'A8'].map(idName), tl: L.order, yl: L.yours, frame: 'designed' };
      stats.push([L.order, (s.job + 1) + ' of ' + s.jobs.length, ''], ['Built', String(s.solvedN), 'Orders matched within three tries.']);
      const charts = [row];
      if (n === 0) charts.push({ type: 'scatter', title: L.chLegs, x: { lo: 0.5, hi: 5.5, label: L.fly }, y: { lo: 0, hi: 7, label: L.legPairs }, frame: 'designed', series: [{ pts: s.pts.slice(), shape: 'disc', ink: 'ink', label: L.flies }], fold: false });
      if (n === 2) { const b = s.b || SWK.WB, mine = [], wt = []; for (let g = 0; g < 5; g++) { wt.push([g + 1, SWK.WB[g]]); if (b[g] < 7) mine.push([g + 1, b[g]]); }
        charts.push({ type: 'scatter', title: L.chOrd, x: { lo: 0.5, hi: 5.5, label: L.geneOrd }, y: { lo: 0, hi: 7, label: L.edge }, frame: 'designed', series: [{ pts: mine, shape: 'disc', ink: 'ink', label: L.mine }, { pts: wt, shape: 'square', ink: 'text2', label: L.wt }], fold: false }); }
      return { stats, charts };
    }
    if (n === 3) {
      const pts = s.pts.slice(), ser = [{ pts, shape: 'disc', ink: 'ink', label: L.built }];
      if (s.exp.t4 != null) ser.push({ pts: [[s.exp.t4, SWK.CR.mantis.maxi]], shape: 'tri', ink: 'text2', label: L.mantis });
      stats.push(['Built', String(s.solvedN), 'Crustaceans matched within three tries.']);
      return { stats, charts: [{ type: 'scatter', title: L.chCr, x: { lo: 0.5, hi: 9.5, label: L.crEdge }, y: { lo: 0, hi: 6, label: L.crPairs }, frame: 'designed', series: ser }] };
    }
    if (n === 4) {
      const real = [], call = []; s.tests.forEach((t, i) => { real.push([i + 1, SWK.DARK[t.m].reduce((a, b) => a + b, 0)]); if (t.pred) call.push([i + 1, t.pred.reduce((a, b) => a + b, 0)]); });
      stats.push(['Embryos left', String(s.left), ''], ['Sent', s.sent ? L['m' + s.sent] : '–', '']);
      return { stats, charts: [{ type: 'scatter', title: L.chTest, x: { lo: 0.5, hi: 4.5, label: L.test }, y: { lo: 0, hi: 3, label: L.tissues }, frame: 'designed', series: [{ pts: real, shape: 'disc', ink: 'ink', label: L.tissues }, { pts: call, shape: 'tri', ink: 'text2', label: L.calls }] }] };
    }
    const H = s.hist, ghost = [], Lk = SWK.LAKE;
    const curve = (g0, g1, q0, T, M, dom) => { const out = [[g0, q0]]; let q = q0; for (let g = g0; g < g1; g++) { q = swLakeRec(q, T, M, 1, s.mu, dom); out.push([g + 1, Math.round(q * 1000) / 1000]); } return out; };
    for (const id of ['p6', 't6']) {
      if (s.exp[id] == null || s.pred[id] === undefined) continue; const g0 = id === 'p6' ? (s.askGen || Lk.ASK0) : Lk.FLIP, r = H[g0 - 1]; if (!r) continue;
      ghost.push({ d: curve(g0, id === 'p6' ? Lk.FLIP : Lk.END, r.q, id === 'p6' ? r.T : Lk.MAX, id === 'p6' ? r.M : 0, false), label: L.expected });
      if (id === 'p6') ghost.push({ d: curve(g0, Lk.FLIP, r.q, r.T, r.M, true), label: L.dominant });
    }
    stats.push(['Generation', String(s.gen), ''], ['Deletion share', Math.round(this.sim.q() * 100) + '%', 'Share of copies with the enhancer deleted.'], ['Spineless', Math.round(H[H.length - 1].dd * 100) + '%', 'Fish with two deleted copies.']);
    return { stats, charts: [{ type: 'trace', title: L.chLake, x: { lo: 1, hi: Lk.END, label: L.gen }, y: { lo: 0, hi: 1, label: L.share, fmt: 'pct' }, frame: 'designed',
      series: [{ d: H.map(r => r.q), ink: 'a', label: L.del }, { d: H.map(r => r.dd), ink: 'text2', label: L.ss }], ghost, marks: [Lk.FLIP] }] };
  }
};
V2.push(CH_SWITCH_V2);
EXPORT.SWITCH = { K: SWK, ident: swIdent, gridB: swGridB, rec: swLakeRec, vial: swVial };   // for tests/oracle_switch.js

/* ---------- a chart type for the identity row (D1 §3.9 "the identity row"), registered from this file ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.sw_row) LiveGraph.T.sw_row = {
  lay(w, h, spec, T) { const pad = 6, top = pad + (spec.title ? T.tk + 6 : 0), bot = T.compact ? 4 : T.tk + 8, left = T.compact ? 4 : Math.min(70, w * 0.18), pw = w - left - pad;
    return { w, h, plot: { x: left, y: top, w: pw, h: h - top - bot }, X: j => left + (j + 0.5) * pw / 7, Y: v => top + v * (h - top - bot), ix: x => (x - left) / pw * 7 - 0.5, iy: y => (y - top) / (h - top - bot) }; },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, rows = [spec.target ? ['t', spec.target] : null, ['y', spec.yours]].filter(Boolean), rh = p.h / rows.length, cw = p.w / 7;
    rows.forEach(([k, ids], r) => {
      const cy = p.y + (r + 0.5) * rh, sz = Math.min(rh * 0.42, cw * 0.36);
      if (!T.compact) wgText(c, k === 't' ? spec.tl : spec.yl, p.x - 6, cy, T.tk, I.text2, { align: 'right', fam: 'b', wt: 600 });
      for (let j = 0; j < 7; j++) {
        const x = G.X(j), id = ids ? ids[j] : null; c.save(); c.strokeStyle = I.text; c.fillStyle = I.text; c.lineWidth = 1.8 * T.k; c.lineCap = 'round'; if (k === 't') c.setLineDash([3, 3]);
        if (!id) { c.globalAlpha = 0.4; c.beginPath(); c.arc(x, cy, sz * 0.25, 0, TAU); c.stroke(); c.restore(); continue; }
        if (id === 'H') { c.beginPath(); c.moveTo(x, cy + sz); c.lineTo(x, cy - sz * 0.2); c.lineTo(x - sz * 0.5, cy - sz); c.moveTo(x, cy - sz * 0.2); c.lineTo(x + sz * 0.5, cy - sz); c.stroke(); }
        else if (swLegCol(id)) {
          c.beginPath(); c.moveTo(x - sz * 0.5, cy - sz * 0.2); c.lineTo(x, cy + sz * 0.1); c.lineTo(x - sz * 0.25, cy + sz); c.stroke();
          if (id === 'T2') { c.beginPath(); c.ellipse(x + sz * 0.35, cy - sz * 0.45, sz * 0.5, sz * 0.22, -0.6, 0, TAU); c.stroke(); }
          if (id === 'T3') { c.beginPath(); c.moveTo(x + sz * 0.1, cy - sz * 0.1); c.lineTo(x + sz * 0.45, cy - sz * 0.6); c.stroke(); c.beginPath(); c.arc(x + sz * 0.5, cy - sz * 0.68, sz * 0.16, 0, TAU); c.fill(); }
        } else if (id === 'A1') { c.beginPath(); c.moveTo(x - sz * 0.5, cy); c.lineTo(x + sz * 0.5, cy); c.stroke(); }
        else if (id === 'A') { for (const d of [-0.35, 0, 0.35]) { c.beginPath(); c.moveTo(x - sz * 0.5, cy + d * sz); c.lineTo(x + sz * 0.5, cy + d * sz); c.stroke(); } }
        else { c.beginPath(); c.moveTo(x - sz * 0.5, cy - sz * 0.4); c.lineTo(x + sz * 0.5, cy); c.lineTo(x - sz * 0.5, cy + sz * 0.4); c.closePath(); c.stroke(); }
        c.restore();
      }
    });
    if (!T.compact) (spec.cols || []).forEach((t, j) => wgText(c, t, G.X(j), p.y + p.h + T.tk / 2 + 4, T.tk, I.text2, { align: 'center', fam: 'b', wt: 600 }));
  },
  rows(spec) { const nm = id => { const i = ['H', 'T1', 'T2', 'T3', 'A1', 'A', 'A8'].indexOf(id); return i >= 0 && spec.names ? spec.names[i] : (id || '?'); };
    return { head: ['segment', spec.tl || 'order', spec.yl || 'yours'], rows: (spec.cols || []).map((c, j) => [c, spec.target ? nm(spec.target[j]) : '–', spec.yours ? nm(spec.yours[j]) : '?']) }; },
  say(spec) { return spec.yours ? 'identity row: ' + spec.yours.join(' ') : 'identity row'; }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 (there was no TRANSFER.switch to rebuild) ---------- */
if (!Url.v1) {
  TAKE.switch = SW_C.take;
  BRIDGE.switch = 'In the Black Country a dominant black allele spread fast. Here you build forms by hand, then meet a recessive switch that starts slowly.';
  MODEL.switch = 'Five Hox genes over seven segments; the gene furthest back sets identity, with a designed two-dose Ubx. Pitx1 has three enhancers. The lake’s mutation rate and predator effects are many times real values.';
  RECALL.switch = { q: 'Why do enhancer deletions often have fewer side effects than coding changes?', opts: [['one', 'An enhancer drives a gene in one tissue'], ['small', 'Enhancers are short'], ['rare', 'They happen rarely']], ans: 'one', why: 'The protein is used everywhere the gene is on; an enhancer usually switches it on in just one tissue.' };
}
