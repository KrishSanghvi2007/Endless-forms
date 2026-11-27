// =============================================================================
// Chapter 9: Why Sex? & Red Queen — Zero-Box Real-Organism 3D Scenes
// 1. Twofold Cost of Males (sculpted sexual vs. parthenogenetic mud snails)
// 2. Muller's Ratchet (3D mutation-load columns & disappearing k=0 class)
// 3. Red Queen Lake Alexandrina (sculpted mud snails + swirling trematodes)
// 4. Cleaner Wrasse Mutualism vs. Mucus-Biting Cheaters
// 5. Pathogen Virulence-Transmission R0 Hill & Competing Strains
// =============================================================================

import * as THREE from 'three';
import {
  createArchivalLabel,
  createBacteriumRod3D,
  createCichlidFish3D,
  createGuppy3D,
  createMudSnail3D,
  createTrematode3D,
} from '../../3d/organisms';
import type {
  MutualismResult,
  RatchetState,
  RedQueenState,
  TwofoldCostResult,
  VirulenceResult,
} from './sexMath';

export type SexPageId = 'twofold' | 'ratchet' | 'redqueen' | 'mutualism' | 'virulence' | 'check';

const COL_COBALT = 0x2f658e;
const COL_CORAL = 0xc4483a;
const COL_GOLD = 0xd69a2d;
const COL_TEAL = 0x2f7d6e;

export class SexScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<SexPageId, THREE.Group>;
  private activePage: SexPageId = 'twofold';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 10.4;
  private targetAzimuth = 0.05;
  private targetPolar = 0.58;
  private curAzimuth = 0.05;
  private curPolar = 0.58;
  private zoomFactor = 1.0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private clock = new THREE.Clock();

  constructor(host: HTMLElement) {
    this.host = host;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1.4, 0.1, 60);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.host.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xfffcf4, 0xdfd3be, 1.08));
    const key = new THREE.DirectionalLight(0xfff5e4, 1.35);
    key.position.set(4.5, 9.5, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    const d = 5.6;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xd2e8f2, 0.48);
    fill.position.set(-5.5, 4.5, -4);
    this.scene.add(fill);

    const paperShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      new THREE.ShadowMaterial({ opacity: 0.13 })
    );
    paperShadow.rotation.x = -Math.PI / 2;
    paperShadow.receiveShadow = true;
    this.scene.add(paperShadow);

    this.pageGroups = {
      twofold: new THREE.Group(),
      ratchet: new THREE.Group(),
      redqueen: new THREE.Group(),
      mutualism: new THREE.Group(),
      virulence: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.twofold.add(this.p1Group);
    this.pageGroups.ratchet.add(this.p2Group);
    this.pageGroups.redqueen.add(this.p3Group);
    this.pageGroups.mutualism.add(this.p4Group);
    this.pageGroups.virulence.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('twofold');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // ===========================================================================
  // PAGE 1: TWOFOLD COST OF MALES
  // ===========================================================================

  public updateTwofold(res: TwofoldCostResult): void {
    this.p1Group.clear();
    const g = this.p1Group;

    // 18 sculpted 3D mud snails arrayed on the paper: Cobalt = Sexual, Coral = Parthenogenetic Clone!
    const total = 18;
    const nClone = Math.max(1, Math.min(total - 1, Math.round(res.asexualFreq * total)));
    for (let i = 0; i < total; i++) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const isClone = i < nClone;
      const snail = createMudSnail3D({
        shellHex: isClone ? '#c4483a' : '#2f658e',
        scale: 1.32,
      });
      snail.position.set(-2.15 + col * 0.86, 0.02, -0.95 + row * 0.92);
      snail.rotation.y = 0.25 + (i % 3) * 0.14;
      g.add(snail);
    }

    const slip = createArchivalLabel(
      `Gen ${res.generation} · Asexual Clones: ${(res.asexualFreq * 100).toFixed(0)}% vs Sexual: ${(res.sexualFreq * 100).toFixed(0)}%`,
      'Every clonal daughter reproduces directly — 2× faster than sexuals paying 50% males!',
      3.75,
      res.asexualFreq > 0.5 ? '#a83424' : '#24587c'
    );
    slip.position.set(0, 0.015, 1.78);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 2: MULLER'S RATCHET (Irreversible Deleterious Clicks vs. Recombination)
  // ===========================================================================

  public updateRatchet(res: RatchetState): void {
    this.p2Group.clear();
    const g = this.p2Group;

    const palette = [COL_TEAL, 0x628c68, COL_GOLD, 0xd67b45, COL_CORAL, 0x852520];
    res.bins.forEach((frac, k) => {
      const x = -2.25 + k * 0.9;
      if (frac > 0.005) {
        const h = Math.max(0.18, frac * 2.45);
        const col = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.24, h, 8, 14),
          new THREE.MeshStandardMaterial({ color: palette[k], roughness: 0.38 })
        );
        col.position.set(x, h * 0.5 + 0.24, -0.2);
        col.castShadow = true;
        g.add(col);
      } else {
        // Ghost brass ring marking an EXTINCT least-loaded class (ratchet clicked!)
        const ghost = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.032, 8, 22),
          new THREE.MeshStandardMaterial({ color: 0x998c78, roughness: 0.6 })
        );
        ghost.rotation.x = Math.PI / 2;
        ghost.position.set(x, 0.04, -0.2);
        g.add(ghost);
      }
    });

    const slip = createArchivalLabel(
      res.mode === 'asexual'
        ? `Asexual Ratchet Clicks: ${res.clicks} · Mean Load = ${res.meanMutations.toFixed(1)} mutations`
        : `Sexual Recombination: 0 Clicks · k = 0 Class Restored!`,
      res.mode === 'asexual'
        ? 'Once the mutation-free (k=0) class drifts extinct, asexuals can never recreate it!'
        : 'Crossing over recombines clean chromosome halves to regenerate k=0 offspring!',
      3.85,
      res.mode === 'asexual' ? '#a83424' : '#2f6d4f'
    );
    slip.position.set(0, 0.015, 1.55);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 3: RED QUEEN — NEW ZEALAND MUD SNAILS & TREMATODES (Lively 1987)
  // ===========================================================================

  public updateRedQueen(res: RedQueenState): void {
    this.p3Group.clear();
    const g = this.p3Group;

    // 12 Sculpted 3D Mud Snails: Teal = Sexual, Coral = Clone A, Amber = Clone B
    const nSex = Math.round(res.sexualFreq * 12);
    const nA = Math.round(res.cloneAFreq * 12);
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const rad = 1.48;
      const isSex = i < nSex;
      const isA = !isSex && i < nSex + nA;
      const snail = createMudSnail3D({
        shellHex: isSex ? '#2f7d6e' : isA ? '#c4483a' : '#d69a2d',
        infected: !isSex && res.parasitePressure > 0.35 && ((isA && res.parasiteMatchA > 0.5) || (!isA && res.parasiteMatchA <= 0.5)),
        scale: 1.35,
      });
      snail.position.set(Math.cos(ang) * rad, 0.02, Math.sin(ang) * rad * 0.78 - 0.15);
      snail.rotation.y = -ang + Math.PI / 2;
      g.add(snail);
    }

    // Swirling sculpted 3D Microphallus trematode parasites inside the ring!
    const nParasites = Math.round(res.parasitePressure * 9);
    for (let p = 0; p < nParasites; p++) {
      const ang = (p / Math.max(1, nParasites)) * Math.PI * 2 + res.season * 0.4;
      const matchA = p / Math.max(1, nParasites) < res.parasiteMatchA;
      const worm = createTrematode3D({
        colorHex: matchA ? '#c4483a' : '#d69a2d',
        scale: 1.35,
      });
      worm.position.set(Math.cos(ang) * 0.62, 0.25 + (p % 2) * 0.12, Math.sin(ang) * 0.52 - 0.15);
      worm.rotation.y = -ang;
      g.add(worm);
    }

    const slip = createArchivalLabel(
      `Season ${res.season} · Sexual: ${(res.sexualFreq * 100).toFixed(0)}% · Clones: ${((1 - res.sexualFreq) * 100).toFixed(0)}%`,
      res.parasitePressure > 0.4
        ? 'Red Queen Active: Trematodes hammer common clones, rescuing diverse sexual snails!'
        : 'Low Parasites: Clones sweep rapidly via the 2× cost of males!',
      3.8,
      res.sexualFreq > 0.45 ? '#2f7d6e' : '#a83424'
    );
    slip.position.set(0, 0.015, 1.78);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 4: MUTUALISM VS. CHEATERS (Cleaner Wrasse & Client Reef Fish)
  // ===========================================================================

  public updateMutualism(res: MutualismResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    // Large client reef fish (sculpted cichlid silhouette) visiting a cleaning station
    const client = createCichlidFish3D({ role: 'prey', jawTwist: 0, scale: 1.45 });
    client.group.position.set(0.35, 0.32, -0.3);
    client.group.rotation.y = Math.PI / 2 - 0.25;
    g.add(client.group);

    // 5 smaller cleaner fish approaching client: Teal/Blue honest cleaners vs Crimson mucus-biting cheaters!
    const nHonest = Math.round(res.honestCleanerFreq * 5);
    for (let i = 0; i < 5; i++) {
      const honest = i < nHonest;
      const wrasse = createGuppy3D({
        isMale: !honest,
        orangeScore: honest ? 0.0 : 0.95,
        tailLength: 0.9,
        scale: 1.25,
      });
      wrasse.position.set(-2.05 + i * 0.58, 0.18 + (i % 2) * 0.18, 0.65 - (i % 3) * 0.38);
      wrasse.rotation.y = Math.PI / 2 + 0.35;
      g.add(wrasse);
    }

    const slip = createArchivalLabel(
      `Honest Cleaners: ${(res.honestCleanerFreq * 100).toFixed(0)}% · Mucus Cheaters: ${(res.cheaterMucusBiterFreq * 100).toFixed(0)}%`,
      res.stableMutualism
        ? 'Client Sanctions & Partner Choice keep mutualism honest (Bshary & Grutter 2002)!'
        : 'Without sanctions, mucus-biting cheaters invade and collapse the mutualism!',
      3.8,
      res.stableMutualism ? '#2f7d6e' : '#a83424'
    );
    slip.position.set(0, 0.015, 1.65);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 5: PATHOGEN VIRULENCE-TRANSMISSION TRADE-OFF (R0 Hill)
  // ===========================================================================

  public updateVirulence(res: VirulenceResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    // 3D Sculpted R0(alpha) Fitness Ridge across virulence alpha = 0.1..1.6
    const steps = 14;
    for (let i = 0; i < steps; i++) {
      const a = 0.1 + (i / (steps - 1)) * 1.45;
      const beta = (3.4 * a) / (a + 0.38);
      const r0 = beta / (0.4 + a);
      const h = Math.max(0.15, r0 * 0.62);
      const isSelected = Math.abs(a - res.alpha) < 0.07;
      const bar = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.13, h, 8, 12),
        new THREE.MeshStandardMaterial({
          color: isSelected ? COL_CORAL : a < 0.35 ? COL_COBALT : a < 0.75 ? COL_TEAL : COL_GOLD,
          roughness: 0.38,
        })
      );
      bar.position.set(-2.45 + i * 0.38, h * 0.5 + 0.13, -0.55);
      bar.castShadow = true;
      g.add(bar);
    }

    // Living sculpted 3D pathogen rods positioned right in front of the selected alpha!
    for (let k = 0; k < 3; k++) {
      const rod = createBacteriumRod3D({
        resistant: res.winningRegime !== 'too_mild',
        hasPlasmid: res.winningRegime === 'optimal',
        scale: 1.05,
      });
      rod.position.set(-1.1 + k * 1.1, 0.08, 0.72);
      rod.rotation.y = 0.4 * (k - 1);
      g.add(rod);
    }

    const slip = createArchivalLabel(
      `Virulence α = ${res.alpha.toFixed(2)} · Pathogen R₀ = ${res.r0.toFixed(2)}`,
      res.winningRegime === 'optimal'
        ? `Intermediate Virulence Optimum (α* ≈ ${res.optimalAlpha.toFixed(2)}): Highest R₀ wins strain competition!`
        : res.winningRegime === 'too_mild'
          ? 'Too mild: low transmission β(α) loses competition to faster-replicating strains!'
          : 'Too lethal: kills host before transmitting, shrinking infectious period 1/(μ+α+γ)!',
      3.85,
      res.winningRegime === 'optimal' ? '#2f7d6e' : '#a83424'
    );
    slip.position.set(0, 0.015, 1.72);
    g.add(slip);
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const s = createMudSnail3D({ shellHex: '#2f7d6e', scale: 1.8 });
    s.position.set(-1.55, 0.05, 0.1);
    s.rotation.y = 0.5;
    g.add(s);

    const t = createTrematode3D({ colorHex: '#c4483a', scale: 2.1 });
    t.position.set(0, 0.18, 0);
    g.add(t);

    const b = createBacteriumRod3D({ resistant: true, hasPlasmid: true, scale: 1.65 });
    b.position.set(1.55, 0.1, 0.05);
    b.rotation.y = -0.45;
    g.add(b);

    const slip = createArchivalLabel(
      'Sex, Parasites & Coevolution',
      'Red Queen · Muller’s Ratchet · Virulence R₀ Trade-Off',
      3.5,
      '#3e6e7a'
    );
    slip.position.set(0, 0.015, 1.48);
    g.add(slip);
  }

  public setPage(page: SexPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as SexPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'check' ? 9.5 : 10.6;
    this.targetAzimuth = 0.04;
    this.targetPolar = 0.6;
    this.zoomFactor = 1.0;
  }

  public resetView(): void {
    this.setPage(this.activePage);
  }

  public zoom(delta: number): void {
    this.zoomFactor = Math.max(0.65, Math.min(1.55, this.zoomFactor + delta));
  }

  public resize(): void {
    if (this.disposed) return;
    const w = Math.max(10, this.host.clientWidth);
    const h = Math.max(10, this.host.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private bindInput(): void {
    const el = this.renderer.domElement;
    const onDown = (e: PointerEvent) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!this.dragging) return;
      this.targetAzimuth -= (e.clientX - this.lastX) * 0.008;
      this.targetPolar = Math.max(0.25, Math.min(1.25, this.targetPolar - (e.clientY - this.lastY) * 0.006));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    };
    const onUp = () => {
      this.dragging = false;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.1;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.1;

    const r = this.fitDist * this.zoomFactor;
    this.camera.position.set(
      r * Math.sin(this.curAzimuth) * Math.cos(this.curPolar),
      r * Math.sin(this.curPolar) + 0.55,
      r * Math.cos(this.curAzimuth) * Math.cos(this.curPolar)
    );
    this.camera.lookAt(0, 0.28, 0);

    if (this.activePage === 'check') {
      this.pageGroups.check.rotation.y = Math.sin(t * 0.5) * 0.14;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.host) {
      this.host.removeChild(this.renderer.domElement);
    }
  }
}
