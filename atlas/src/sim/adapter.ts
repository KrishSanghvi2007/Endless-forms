/**
 * Deterministic PRNG + Simulation Core Adapter.
 * Bridges the plain-JS deterministic `sim` engines from Endless Forms v2
 * (games/endless-forms/source/v2/*.js) into typed Atlas plates so every
 * run remains reproducible: run = (seed, level, actions).
 */

export interface SeededRng {
  next: () => number; // [0, 1)
  range: (min: number, max: number) => number;
  int: (min: number, maxInclusive: number) => number;
  gaussian: () => number;
}

/** Mulberry32 deterministic PRNG */
export function createSeededRng(seed: number): SeededRng {
  let a = seed >>> 0;
  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + (max - min) * next(),
    int: (min, maxInclusive) => min + Math.floor(next() * (maxInclusive - min + 1)),
    gaussian: () => {
      const u1 = Math.max(1e-12, next());
      const u2 = next();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
  };
}

export interface SimCore<TState, TAction, TEvent = unknown> {
  init: (seed: number, level: number) => TState;
  act: (state: TState, action: TAction, rng: SeededRng) => TEvent[];
  step: (state: TState, dt: number, rng: SeededRng) => TEvent[];
  snapshot: (state: TState) => string;
  restore: (json: string) => TState;
}
