// =============================================================================
// Chapter 24: Reciprocity, Eusociality & Mutualisms — Exact Models
// 1. Vampire Bat Reciprocal Altruism & Iterated Prisoner's Dilemma (w > c/b)
// 2. Indirect Reciprocity & Image Scoring (Nowak & Sigmund 1998: q > c/b)
// 3. Eusociality: Monogamy Hypothesis (Boomsma 2009) & Fortress Defense
// 4. Legume-Rhizobium Host Sanctions (Kiers et al. 2003)
// 5. Vertical vs Horizontal Symbiont Transmission & Partner Alignment
// =============================================================================

export interface IpdResult {
  w: number; // shadow of the future (probability of meeting again)
  cbRatio: number; // c / b
  noise: number; // error rate
  tftPayoff: number;
  gtftPayoff: number;
  alldPayoff: number;
  winner: 'ALLD' | 'TFT' | 'GTFT';
  summary: string;
}

export function evaluateIpd(w: number, cbRatio: number, noise: number): IpdResult {
  const b = 1.0;
  const c = cbRatio;
  const rounds = 1 / Math.max(0.04, 1 - w);

  // Expected per-round payoffs in a mixed population with occasional execution errors
  const alldPayoff = rounds * (0.28 * (b - 0.1) * (1 - w) + 0.12);
  // Strict TFT suffers echo-retaliation cascades when noise > 0!
  const tftCoop = Math.max(0.15, 1 - noise * 6.5);
  const tftPayoff = rounds * ((b - c) * tftCoop * (w > cbRatio ? 1.0 : 0.45));
  // Generous TFT forgives rare accidental defections (~15% forgiveness) so stays cooperative under noise
  const gtftCoop = Math.max(0.35, 1 - noise * 2.1);
  const gtftPayoff = rounds * ((b - c) * gtftCoop * (w > cbRatio ? 1.02 : 0.42));

  let winner: 'ALLD' | 'TFT' | 'GTFT' = 'ALLD';
  let summary = '';
  if (w <= cbRatio) {
    winner = 'ALLD';
    summary = `Shadow of the future too short (w = ${w.toFixed(2)} ≤ c/b = ${cbRatio.toFixed(2)}): Defectors (ALLD) invade and collapse blood-sharing!`;
  } else if (noise >= 0.06) {
    winner = 'GTFT';
    summary = `Noisy World (error = ${Math.round(noise * 100)}%): Strict Tit-for-Tat falls into endless vendettas — Generous TFT (forgiving rare mistakes) wins!`;
  } else {
    winner = 'TFT';
    summary = `Axelrod–Hamilton Condition Met (w = ${w.toFixed(2)} > c/b = ${cbRatio.toFixed(2)}): Reciprocal blood-sharing (TFT) resists cheaters stably!`;
  }

  return { w, cbRatio, noise, tftPayoff, gtftPayoff, alldPayoff, winner, summary };
}

// -----------------------------------------------------------------------------
// 2. Indirect Reciprocity & Reputation Visibility (Nowak & Sigmund 1998)
// -----------------------------------------------------------------------------

export interface IndirectRecipResult {
  q: number; // probability donor knows recipient's reputation image score
  cb: number;
  coopStable: boolean;
  summary: string;
}

export function evaluateIndirectReciprocity(q: number, cb = 0.35): IndirectRecipResult {
  const coopStable = q > cb;
  return {
    q,
    cb,
    coopStable,
    summary: coopStable
      ? `Reputation Visibility q = ${q.toFixed(2)} > c/b (${cb.toFixed(2)}): Image-scoring discriminators sustain cooperation even among strangers who never meet twice!`
      : `Low Reputation Visibility q = ${q.toFixed(2)} ≤ c/b (${cb.toFixed(2)}): Anonymous cheaters escape bad reputations, collapsing indirect reciprocity!`,
  };
}

// -----------------------------------------------------------------------------
// 3. Eusociality: Monogamy Window (Boomsma 2009) & Ecological Fortress Benefit
// -----------------------------------------------------------------------------

export interface EusocialResult {
  matesCount: number; // 1 = strict lifetime monogamy, 4 = polyandry
  haplodiploid: boolean;
  fortressBC: number; // ecological benefit/cost ratio B/C of defending nest
  sibR: number; // average relatedness of worker to siblings raised
  inclusiveThreshold: number; // r * B/C vs 0.5 (raising own offspring)
  eusocialFavoured: boolean;
  summary: string;
}

export function evaluateEusociality(
  matesCount: number,
  haplodiploid: boolean,
  fortressBC: number,
): EusocialResult {
  // Under strict monogamy (M=1):
  // Diploid sib r = 0.50; Haplodiploid sister r = 0.75, brother r = 0.25 -> 1:1 sex ratio avg r = 0.50!
  // Under M mates (multiple paternity): Diploid r = 0.25 + 0.25/M; Haplodiploid avg (1:1) r = 0.25 + 0.25/M!
  const sibR = 0.25 + 0.25 / Math.max(1, matesCount);
  const workerPayoff = sibR * fortressBC;
  const solitaryPayoff = 0.5; // raising own offspring (r = 0.5)
  const eusocialFavoured = workerPayoff > solitaryPayoff;

  const summary =
    matesCount === 1 && eusocialFavoured
      ? `Boomsma’s Monogamy Window Open! Strict monogamy keeps sibling r = 0.50 (= own offspring!), so ANY ecological fortress advantage (B/C = ${fortressBC.toFixed(1)} > 1) favours sterile workers — in BOTH bees AND diploid naked mole-rats!`
      : !eusocialFavoured
        ? `Solitary Breeding Favoured: Multiple mating drops sibling r to ${sibR.toFixed(2)} (< 0.50 to own young), so workers need B/C > ${(0.5 / sibR).toFixed(1)} to forego personal reproduction!`
        : `High Fortress Payoff (B/C = ${fortressBC.toFixed(1)}) overcomes reduced sibling r = ${sibR.toFixed(2)} — maintaining established colony workers!`;

  return {
    matesCount,
    haplodiploid,
    fortressBC,
    sibR,
    inclusiveThreshold: workerPayoff,
    eusocialFavoured,
    summary,
  };
}

// -----------------------------------------------------------------------------
// 4. Legume-Rhizobium Host Sanctions (Kiers et al. 2003)
// -----------------------------------------------------------------------------

export interface SanctionResult {
  sanctionStrength: number; // 0 = no host policing, 1 = strict O2/carbon cutoff to cheaters
  cooperatorShare: number; // final share of pink N-fixing nodules
  plantGrowth: number; // 0.35 .. 1.0
  summary: string;
}

export function evaluateHostSanctions(sanctionStrength: number): SanctionResult {
  const s = Math.max(0, Math.min(1, sanctionStrength));
  // Without sanctions, cheaters skip costly nitrogenase and multiply faster inside root nodules!
  const cooperatorShare = Math.min(0.95, Math.max(0.12, 0.14 + 0.82 * Math.pow(s, 0.75)));
  const plantGrowth = 0.38 + 0.62 * cooperatorShare;
  return {
    sanctionStrength: s,
    cooperatorShare,
    plantGrowth,
    summary:
      s < 0.3
        ? 'No Host Policing: Cheater rhizobia save ATP by fixing ZERO nitrogen and overrun the roots — stunting the clover plant!'
        : `Active Host Sanctions (${Math.round(s * 100)}%): Clover starves pale cheater nodules of O₂ & sugars while feeding pink N-fixing nodules (${Math.round(cooperatorShare * 100)}% cooperators)!`,
  };
}

// -----------------------------------------------------------------------------
// 5. Vertical vs Horizontal Symbiont Transmission
// -----------------------------------------------------------------------------

export interface TransmissionResult {
  verticalFrac: number; // 0 = purely horizontal, 1 = strictly vertical mother->egg
  virulence: number;
  mutualismBenefit: number;
  summary: string;
}

export function evaluateTransmission(verticalFrac: number): TransmissionResult {
  const v = Math.max(0, Math.min(1, verticalFrac));
  const virulence = Math.max(0.05, 0.92 * (1 - v) + 0.05);
  const mutualismBenefit = 0.15 + 0.85 * v;
  return {
    verticalFrac: v,
    virulence,
    mutualismBenefit,
    summary:
      v > 0.7
        ? 'Strict Vertical Transmission (e.g., Buchnera in aphids): Symbiont can only reproduce if its host thrives — aligning evolutionary fates into obligate mutualism!'
        : v < 0.3
          ? 'Horizontal Transmission: Symbionts jump to new hosts freely, favouring rapid exploitation and higher virulence even at the current host’s expense!'
          : 'Mixed Transmission Mode: Intermediate tension between host health and horizontal spread.',
  };
}
