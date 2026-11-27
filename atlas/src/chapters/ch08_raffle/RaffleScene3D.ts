// =============================================================================
// Chapter 8: Sex, Choice & Slow Islands — Zero-Box Real-Organism 3D Scenes
// 1. Anisogamy & Bateman Gradients (large golden ovum vs. swirling sperm + 3D slope)
// 2. Trinidadian Aripo Guppies (vibrant orange males, drab females & pike-cichlid)
// 3. Yellow Dung Fly Sperm Competition Raffle (golden dung flies + paternity pie)
// 4. Fisher's 1:1 Sex-Ratio Allocation (frequency-dependent balance beam)
// 5. Slow Island Opossums (Sapelo Island vs. Mainland opossums + Hamilton force curve)
// =============================================================================

import * as THREE from 'three';
import {
  createArchivalLabel,
  createCichlidFish3D,
  createDungFly3D,
  createGuppy3D,
  createOpossum3D,
} from '../../3d/organisms';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import beetleGlbUrl from '../../assets/smithsonian_beetle.glb?url';
import fishGlbUrl from '../../assets/smithsonian_fish.glb?url';
import tortoiseGlbUrl from '../../assets/smithsonian_tortoise.glb?url';
import type {
  BatemanResult,
  FisherRatioResult,
  GuppySelectionResult,
  SenescenceResult,
  SpermRaffleResult,
} from './raffleMath';

export type RafflePageId = 'bateman' | 'guppies' | 'raffle' | 'fisher' | 'opossums' | 'check';

const COL_GOLD = 0xd69a2d;
const COL_COBALT = 0x2f658e;
const COL_CORAL = 0xc4483a;
const COL_TEAL = 0x2f7d6e;

export class RaffleScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<RafflePageId, THREE.Group>;
  private activePage: RafflePageId = 'bateman';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 10.2;
  private targetAzimuth = 0.06;
  private targetPolar = 0.58;
  private curAzimuth = 0.06;
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
      bateman: new THREE.Group(),
      guppies: new THREE.Group(),
      raffle: new THREE.Group(),
      fisher: new THREE.Group(),
      opossums: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.bateman.add(this.p1Group);
    this.pageGroups.guppies.add(this.p2Group);
    this.pageGroups.raffle.add(this.p3Group);
    this.pageGroups.fisher.add(this.p4Group);
    this.pageGroups.opossums.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('bateman');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // ===========================================================================
  // PAGE 1: ANISOGAMY & BATEMAN GRADIENTS
  // ===========================================================================

  public updateBateman(res: BatemanResult): void {
    this.p1Group.clear();
    const g = this.p1Group;

    // Left: Large yolk-rich translucent ovum surrounded by tiny flagellated sperm (Anisogamy!)
    const ovum = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 24, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0xf4c752,
        roughness: 0.25,
        clearcoat: 0.6,
        transparent: true,
        opacity: 0.88,
      })
    );
    ovum.position.set(-1.35, 0.72, -0.1);
    ovum.castShadow = true;
    g.add(ovum);

    const spermMat = new THREE.MeshStandardMaterial({ color: COL_COBALT, roughness: 0.3 });
    const spermCount = Math.max(4, Math.min(18, Math.round(res.osr * 5)));
    for (let i = 0; i < spermCount; i++) {
      const ang = (i / spermCount) * Math.PI * 2;
      const sx = -1.35 + Math.cos(ang) * 1.02;
      const sz = -0.1 + Math.sin(ang) * 1.02;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), spermMat);
      head.position.set(sx, 0.35 + (i % 3) * 0.22, sz);
      head.castShadow = true;
      g.add(head);

      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx, head.position.y, sz),
        new THREE.Vector3(sx + Math.cos(ang) * 0.18, head.position.y + 0.05, sz + Math.sin(ang) * 0.18),
        new THREE.Vector3(sx + Math.cos(ang) * 0.34, head.position.y - 0.04, sz + Math.sin(ang) * 0.34),
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 8, 0.014, 5, false), spermMat));
    }

    // Right: 3D Sculpted Bateman Gradient Beams (Male vs Female reproductive slope)
    const maleBeamLen = 1.85;
    const maleAngle = Math.atan2(res.maleSlope * 0.65, 1.5);
    const maleBeam = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, maleBeamLen, 8, 12),
      new THREE.MeshStandardMaterial({ color: COL_COBALT, roughness: 0.35 })
    );
    maleBeam.rotation.z = Math.PI / 2 - maleAngle;
    maleBeam.position.set(1.32, 0.38 + Math.sin(maleAngle) * 0.92, -0.35);
    maleBeam.castShadow = true;
    g.add(maleBeam);

    const femAngle = Math.atan2(res.femaleSlope * 0.65, 1.5);
    const femBeam = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, maleBeamLen, 8, 12),
      new THREE.MeshStandardMaterial({ color: COL_CORAL, roughness: 0.35 })
    );
    femBeam.rotation.z = Math.PI / 2 - femAngle;
    femBeam.position.set(1.32, 0.38 + Math.sin(femAngle) * 0.92, 0.55);
    femBeam.castShadow = true;
    g.add(femBeam);

    const lblLeft = createArchivalLabel(
      'Anisogamy & OSR',
      res.roleReversal ? 'Role Reversal (OSR < 1)' : `OSR = ${res.osr.toFixed(1)} males : 1 female`,
      2.15,
      '#8a6b24'
    );
    lblLeft.position.set(-1.35, 0.015, 1.55);
    g.add(lblLeft);

    const lblRight = createArchivalLabel(
      `Bateman Slopes: ♂ ${res.maleSlope.toFixed(2)} vs ♀ ${res.femaleSlope.toFixed(2)}`,
      res.roleReversal ? 'Females compete steeper when OSR < 1!' : 'Males gain steeper fitness per extra mate',
      2.35,
      res.roleReversal ? '#a83424' : '#24587c'
    );
    lblRight.position.set(1.35, 0.015, 1.55);
    g.add(lblRight);
  }

  // ===========================================================================
  // PAGE 2: TRINIDADIAN ARIPO GUPPIES (Choice vs. Pike-Cichlid Predation)
  // ===========================================================================

  public updateGuppies(res: GuppySelectionResult): void {
    this.p2Group.clear();
    const g = this.p2Group;

    // 5 Sculpted male Aripo guppies whose orange spots & tail length morph live!
    for (let i = 0; i < 5; i++) {
      const m = createGuppy3D({
        isMale: true,
        orangeScore: Math.max(0.08, res.eqOrange + (i - 2) * 0.06),
        tailLength: res.eqTail,
        scale: 1.55,
      });
      m.position.set(-1.95 + i * 0.95, 0.14, 0.45 + (i % 2 === 0 ? 0.25 : -0.18));
      m.rotation.y = Math.PI / 2 - 0.15;
      g.add(m);
    }

    // 2 Drab observing females choosing mates
    for (let i = 0; i < 2; i++) {
      const f = createGuppy3D({ isMale: false, scale: 1.5 });
      f.position.set(-1.1 + i * 2.2, 0.12, -0.55);
      f.rotation.y = -0.35 + i * 0.7;
      g.add(f);
    }

    // Predatory Pike-Cichlid (Crenicichla alta) scaled by predation intensity!
    if (res.predation > 0.12) {
      const pike = createCichlidFish3D({
        role: 'predator',
        jawTwist: 0,
        scale: 0.72 + res.predation * 0.65,
      });
      pike.group.position.set(0, 0.25, -1.48);
      pike.group.rotation.y = Math.PI / 2;
      g.add(pike.group);
    }

    const slip = createArchivalLabel(
      `Aripo Male Ornament = ${(res.eqOrange * 100).toFixed(0)}% Orange`,
      res.predation > 0.55
        ? 'High-predation river: Pike-cichlids strip away flashy orange!'
        : 'Low-predation headwater: Female choice drives vivid orange & long tails!',
      3.6,
      res.predation > 0.55 ? '#4f624c' : '#d45418'
    );
    slip.position.set(0, 0.015, 1.62);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 3: YELLOW DUNG FLY SPERM COMPETITION RAFFLE (Parker 1970)
  // ===========================================================================

  public updateSpermRaffle(res: SpermRaffleResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    // Central female dung fly flanked by Male 1 (previous mate, cobalt) & Male 2 (guarding, golden)
    const female = createDungFly3D({ isMale: false, scale: 1.65 });
    female.position.set(0, 0.08, -0.55);
    g.add(female);

    const male1 = createDungFly3D({ isMale: true, scale: 1.45 });
    male1.position.set(-1.85, 0.08, -0.45);
    male1.rotation.y = 0.65;
    g.add(male1);

    const male2 = createDungFly3D({ isMale: true, scale: 1.75 });
    male2.position.set(1.65, 0.08, -0.45);
    male2.rotation.y = -0.65;
    g.add(male2);

    // Sculpted 3D Paternity Raffle Disk (Male 2 share P2 in gold vs Male 1 share 1-P2 in cobalt)
    const p2Angle = Math.max(0.08, res.p2Paternity * Math.PI * 2);
    const disk2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 0.16, 36, 1, false, 0, p2Angle),
      new THREE.MeshStandardMaterial({ color: COL_GOLD, roughness: 0.35 })
    );
    disk2.position.set(0, 0.1, 0.72);
    disk2.castShadow = true;
    g.add(disk2);

    const disk1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 0.16, 36, 1, false, p2Angle, Math.PI * 2 - p2Angle),
      new THREE.MeshStandardMaterial({ color: COL_COBALT, roughness: 0.38 })
    );
    disk1.position.set(0, 0.1, 0.72);
    disk1.castShadow = true;
    g.add(disk1);

    const nearOpt = Math.abs(res.copulationMinutes - res.optimalMinutes) <= 6;
    const slip = createArchivalLabel(
      `Copulation = ${res.copulationMinutes} min · P₂ Paternity = ${(res.p2Paternity * 100).toFixed(0)}%`,
      nearOpt
        ? 'Right at Parker’s MVT optimum (~41 min) — maximum eggs/min!'
        : `Gain rate: ${res.marginalRate.toFixed(3)} eggs/min (Optimal ≈ 41 min)`,
      3.55,
      nearOpt ? '#2f6d4f' : '#8a6b24'
    );
    slip.position.set(0, 0.015, 2.08);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 4: FISHER'S 1:1 SEX-RATIO EQUILIBRIUM
  // ===========================================================================

  public updateFisher(res: FisherRatioResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    // Sculpted brass fulcrum + tilting seesaw carrying Sons (left) vs Daughters (right)
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xb88e42, roughness: 0.28, metalness: 0.72 });
    const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.72, 16), brassMat);
    fulcrum.position.set(0, 0.36, 0);
    fulcrum.castShadow = true;
    g.add(fulcrum);

    // Tilt beam toward whichever sex has HIGHER per-capita reproductive payoff (the rarer sex!)
    const tilt = Math.max(-0.38, Math.min(0.38, (res.maleFraction - 0.5) * 0.9));
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 0.74, 0);
    beamGroup.rotation.z = tilt;

    const beam = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 4.2, 8, 12), brassMat);
    beam.rotation.z = Math.PI / 2;
    beam.castShadow = true;
    beamGroup.add(beam);

    // Sculpted guppies showing current population sex ratio
    const nSons = Math.max(1, Math.min(9, Math.round(res.maleFraction * 10)));
    const nDaughters = 10 - nSons;

    for (let i = 0; i < nSons; i++) {
      const m = createGuppy3D({ isMale: true, orangeScore: 0.8, scale: 0.92 });
      m.position.set(-1.95 + (i % 3) * 0.38, 0.12 + Math.floor(i / 3) * 0.28, -0.25 + (i % 2) * 0.5);
      m.rotation.y = Math.PI / 2;
      beamGroup.add(m);
    }
    for (let i = 0; i < nDaughters; i++) {
      const f = createGuppy3D({ isMale: false, scale: 0.92 });
      f.position.set(1.2 + (i % 3) * 0.38, 0.12 + Math.floor(i / 3) * 0.28, -0.25 + (i % 2) * 0.5);
      f.rotation.y = -Math.PI / 2;
      beamGroup.add(f);
    }
    g.add(beamGroup);

    const slip = createArchivalLabel(
      `Sons: ${(res.maleFraction * 100).toFixed(0)}% (Payoff ${res.sonPayoff.toFixed(2)}×) · Daughters: ${((1 - res.maleFraction) * 100).toFixed(0)}% (${res.daughterPayoff.toFixed(2)}×)`,
      Math.abs(res.maleFraction - 0.5) < 0.04
        ? 'Fisher’s 50:50 ESS Equilibrium — equal grand-offspring per unit investment!'
        : `Rarer sex wins! Next generation rebounds toward ${(res.nextGenMaleFraction * 100).toFixed(0)}% sons.`,
      3.85,
      '#24587c'
    );
    slip.position.set(0, 0.015, 1.65);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 5: SLOW ISLAND OPOSSUMS (Extrinsic Mortality & Senescence)
  // ===========================================================================

  public updateOpossums(res: SenescenceResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    // 2 Sculpted 3D Virginia Opossums: Mainland fast-living vs Sapelo Island slow-ageing!
    const isIslandLike = res.extrinsicMortality < 0.25;
    const op1 = createOpossum3D({ greyness: isIslandLike ? 0.65 : 0.15, scale: 1.55 });
    op1.position.set(-1.65, 0.05, 0.45);
    op1.rotation.y = 0.55;
    g.add(op1);

    const op2 = createOpossum3D({ greyness: isIslandLike ? 0.85 : 0.25, scale: 1.32 });
    op2.position.set(1.65, 0.05, 0.55);
    op2.rotation.y = -0.55;
    g.add(op2);

    // Behind them: 6 3D Force-of-Selection Pillars across Ages 1..6 (Hamilton 1966)
    res.selectionForceByAge.forEach((force, idx) => {
      const h = Math.max(0.14, force * 1.65);
      const col = new THREE.Color(COL_CORAL).lerp(new THREE.Color(COL_TEAL), force);
      const pillar = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.16, h, 8, 12),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.42 })
      );
      pillar.position.set(-1.75 + idx * 0.7, h * 0.5 + 0.16, -1.18);
      pillar.castShadow = true;
      g.add(pillar);
    });

    const forceSlip = createArchivalLabel(
      'Hamilton’s Force of Selection Across Ages 1 → 6',
      'When predators kill young, selection becomes blind to late-life decay!',
      3.4,
      '#2f6d4f'
    );
    forceSlip.position.set(0, 0.015, -0.45);
    g.add(forceSlip);

    const lifeSlip = createArchivalLabel(
      `Evolved Lifespan: ${res.evolvedLifespanYrs.toFixed(1)} yrs · Litter: ${res.litterSize} young`,
      isIslandLike
        ? 'Predator-free Sapelo Island: Delayed reproduction & slower senescence!'
        : 'High-predation Mainland: Fast reproduction, rapid ageing (Austad 1993)',
      3.55,
      isIslandLike ? '#24587c' : '#a83424'
    );
    lifeSlip.position.set(0, 0.015, 1.68);
    g.add(lifeSlip);
  }

  // ===========================================================================
  // PAGE 6: MASTERY TRIO
  // ===========================================================================

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    // Real Smithsonian Spotted Trunkfish (Lactophrys bicaudalis)
    const fish = createSmithsonianSpecimen(fishGlbUrl, {
      size: 1.45,
      palette: { base: '#d6994b', wash: '#f4d9a6', deep: '#825219', ink: '#42290a' },
      rotation: [0, Math.PI * 0.42, 0],
      position: [-1.7, 0.08, 0],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
    g.add(fish);

    // Real Smithsonian Longhorn Beetle (Psalidognathus superbus) — sexually selected mandibles!
    const beetle = createSmithsonianSpecimen(beetleGlbUrl, {
      size: 1.65,
      palette: { base: '#5f8a70', wash: '#a9ccb7', deep: '#2b4a38', ink: '#182b20' },
      rotation: [0, 0.25, 0],
      position: [0, 0.04, 0.05],
      groundOnY0: true,
      grainScale: 2.2,
      inkStrength: 0.9,
    });
    g.add(beetle);

    // Real Smithsonian Red-footed Tortoise (Geochelone carbonaria) — slow island senescence!
    const tortoise = createSmithsonianSpecimen(tortoiseGlbUrl, {
      size: 1.5,
      palette: { base: '#8c7e58', wash: '#cdc09c', deep: '#4e4429', ink: '#2b2415' },
      rotation: [-Math.PI / 2, -0.45, Math.PI],
      position: [1.7, 0.04, 0.1],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
    g.add(tortoise);

    const slip = createArchivalLabel(
      'Sexual Selection & Life History',
      'Mate Choice · Armaments (Psalidognathus) · Slow Senescence',
      3.4,
      '#8a6b24'
    );
    slip.position.set(0, 0.015, 1.48);
    g.add(slip);
  }

  public setPage(page: RafflePageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as RafflePageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'bateman' ? 11.4 : page === 'check' ? 9.4 : page === 'raffle' ? 10.6 : 10.2;
    this.targetAzimuth = page === 'fisher' ? 0.02 : 0.05;
    this.targetPolar = 0.58;
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
