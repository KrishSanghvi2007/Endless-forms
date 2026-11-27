// =============================================================================
// Chapter 7: Mutation, Linkage & Gene Flow — Lifelike Zero-Box 3D Plate Scenes
// Floating cleanly over sunlit cotton rag paper with soft natural shadows:
// 1. Luria-Delbrück glass petri dishes + living 3D E. coli rods + 3D DFE ribbon
// 2. Mutation-Selection equilibrium funnel & diploid allele carriers
// 3. Morgan's sculpted 3D Drosophila (red w+ vs white w compound eyes)
// 4. Sculpted 3D paired homologous chromosomes crossing over + hitchhiking sweep valley
// 5. Sculpted 3D Rock Pocket Mice across desert sand & dark Pinacate lava flow
// =============================================================================

import * as THREE from 'three';
import {
  createArchivalLabel,
  createBacteriumRod3D,
  createDrosophila3D,
  createRockPocketMouse3D,
} from '../../3d/organisms';
import type {
  FluctuationResult,
  GeneFlowResult,
  LinkageSweepResult,
  MutationSelectionResult,
  XLinkedResult,
} from './engineMath';

export type EnginePageId = 'fluctuation' | 'balance' | 'xlinked' | 'linkage' | 'geneflow' | 'check';

const COL_COBALT = 0x2f658e;
const COL_CORAL = 0xc4483a;
const COL_GOLD = 0xd69a2d;
const COL_TEAL = 0x2f7d6e;
const COL_BRASS = 0xb88e42;

export class EngineScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<EnginePageId, THREE.Group>;
  private activePage: EnginePageId = 'fluctuation';

  // Page 1: Petri dishes + DFE
  private p1PlatesGroup = new THREE.Group();
  // Page 2: Mutation-Selection balance
  private p2BalanceGroup = new THREE.Group();
  // Page 3: X-linked Drosophila
  private p3FliesGroup = new THREE.Group();
  // Page 4: Chromosomes crossing over + sweep valley
  private p4ChromoGroup = new THREE.Group();
  private p4SweepBars: THREE.Mesh[] = [];
  // Page 5: Rock pocket mice sand vs lava
  private p5MiceGroup = new THREE.Group();
  private p5ArrowsGroup = new THREE.Group();

  // Camera orbit state
  private fitDist = 7.6;
  private targetAzimuth = 0.08;
  private targetPolar = 0.56;
  private curAzimuth = 0.08;
  private curPolar = 0.56;
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

    // Bright museum rag-paper daylight + soft shadow catcher
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
      fluctuation: new THREE.Group(),
      balance: new THREE.Group(),
      xlinked: new THREE.Group(),
      linkage: new THREE.Group(),
      geneflow: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.buildPage1Fluctuation();
    this.buildPage2Balance();
    this.buildPage3XLinked();
    this.buildPage4Linkage();
    this.buildPage5GeneFlow();
    this.buildPage6Check();

    this.setPage('fluctuation');

    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // ===========================================================================
  // PAGE 1: LURIA-DELBRÜCK PETRI DISHES + 3D DFE ARCH
  // ===========================================================================

  private buildPage1Fluctuation(): void {
    const g = this.pageGroups.fluctuation;
    g.add(this.p1PlatesGroup);

    // Sculpted 3D DFE (Distribution of Fitness Effects) ribbon floating cleanly in background
    const dfeGroup = new THREE.Group();
    dfeGroup.position.set(0, 0.05, -1.85);
    const bins: { s: number; h: number; col: number }[] = [
      { s: -0.9, h: 0.95, col: 0x9c3228 }, // Lethal
      { s: -0.5, h: 0.62, col: 0xc4483a },
      { s: -0.2, h: 0.85, col: 0xd67b45 },
      { s: -0.05, h: 1.25, col: 0xd6a656 },
      { s: 0.0, h: 1.48, col: 0x8b959e }, // Neutral peak
      { s: 0.08, h: 0.24, col: 0x3b8c6e }, // Rare beneficial tail!
      { s: 0.2, h: 0.09, col: 0x246b54 },
    ];
    bins.forEach((b, i) => {
      const bx = -1.65 + i * 0.55;
      const bar = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.14, Math.max(0.08, b.h * 0.82), 8, 12),
        new THREE.MeshStandardMaterial({ color: b.col, roughness: 0.4 })
      );
      bar.position.set(bx, 0.14 + b.h * 0.41, 0);
      bar.castShadow = true;
      dfeGroup.add(bar);
    });
    const dfeLabel = createArchivalLabel(
      'Distribution of Fitness Effects (DFE)',
      'Mostly deleterious & neutral · Rare beneficial tail',
      2.85,
      '#473b2c'
    );
    dfeLabel.position.set(0, 0.015, 0.55);
    dfeGroup.add(dfeLabel);
    g.add(dfeGroup);
  }

  public updateFluctuation(res: FluctuationResult): void {
    this.p1PlatesGroup.clear();

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xeaf4f8,
      roughness: 0.08,
      transmission: 0.55,
      transparent: true,
      opacity: 0.52,
    });
    const agarMat = new THREE.MeshStandardMaterial({
      color: 0xf4e3b8,
      roughness: 0.35,
    });

    res.plates.forEach((plate, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const px = (col - 1) * 1.72;
      const pz = row * 1.52 - 0.15;

      const dish = new THREE.Group();
      dish.position.set(px, 0.04, pz);

      // Agar gel bed
      const agar = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 28), agarMat);
      agar.position.y = 0.03;
      agar.receiveShadow = true;
      agar.castShadow = true;
      dish.add(agar);

      // Delicate glass petri rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.045, 10, 32), glassMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.09;
      dish.add(rim);

      // Highlight jackpot dish with a subtle ruby halo
      if (plate.jackpot) {
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.78, 0.85, 32),
          new THREE.MeshBasicMaterial({ color: COL_CORAL, side: THREE.DoubleSide })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.01;
        dish.add(halo);
      }

      // Render sculpted 3D resistant bacterial colonies on agar
      const visualCount = Math.min(24, plate.colonies);
      for (let k = 0; k < visualCount; k++) {
        const angle = k * 2.39996;
        const rad = Math.min(0.56, 0.11 * Math.sqrt(k + 0.8));
        const rod = createBacteriumRod3D({
          resistant: true,
          hasPlasmid: plate.jackpot && k % 3 === 0,
          scale: 0.36,
        });
        rod.position.set(Math.cos(angle) * rad, 0.055, Math.sin(angle) * rad);
        rod.rotation.y = angle * 1.7;
        dish.add(rod);
      }

      // Plate count slip
      const slip = createArchivalLabel(
        `Plate #${plate.id}: ${plate.colonies}`,
        plate.jackpot ? 'JACKPOT MUTATION!' : 'T1-resistant colonies',
        1.25,
        plate.jackpot ? '#b03224' : '#3a4a58'
      );
      slip.position.set(0, 0.015, 0.92);
      dish.add(slip);

      this.p1PlatesGroup.add(dish);
    });
  }

  // ===========================================================================
  // PAGE 2: MUTATION-SELECTION BALANCE (Recessive Sheltering vs Dominant)
  // ===========================================================================

  private buildPage2Balance(): void {
    const g = this.pageGroups.balance;
    g.add(this.p2BalanceGroup);
  }

  public updateMutationSelection(res: MutationSelectionResult): void {
    this.p2BalanceGroup.clear();
    const g = this.p2BalanceGroup;

    // Sculpted brass balance beam + reservoir basin
    const brassMat = new THREE.MeshStandardMaterial({
      color: COL_BRASS,
      roughness: 0.28,
      metalness: 0.72,
    });

    // Left: Mutation Input Stream (μ), Center: Equilibrium Gene Pool Bowl, Right: Selection Removal (s)
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.15, 0.22, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xeef5f8,
        roughness: 0.15,
        transparent: true,
        opacity: 0.55,
      })
    );
    basin.position.set(0, 0.14, 0.1);
    basin.receiveShadow = true;
    g.add(basin);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.045, 10, 36), brassMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 0.25, 0.1);
    g.add(rim);

    // 24 sculpted diploid flies/carriers inside the basin showing hidden carriers vs exposed affected
    const total = 24;
    const nAffected = Math.max(1, Math.min(10, Math.round(res.affectedFreq * 400)));
    const nCarriers =
      res.dominance === 'recessive'
        ? Math.max(2, Math.min(total - nAffected, Math.round(res.carrierFreq * 42)))
        : 0;

    for (let i = 0; i < total; i++) {
      const ang = i * 2.39996;
      const rad = 0.22 * Math.sqrt(i + 0.6);
      const isAffected = i < nAffected;
      const isCarrier = !isAffected && i < nAffected + nCarriers;

      const fly = createDrosophila3D({
        eyeHex: isAffected ? '#e8e2d8' : isCarrier ? '#e08b38' : '#b82824',
        isMale: i % 2 === 0,
        scale: 0.65,
      });
      fly.position.set(Math.cos(ang) * rad, 0.22, 0.1 + Math.sin(ang) * rad);
      fly.rotation.y = ang + 0.6;
      g.add(fly);
    }

    // Left brass nozzle pouring mutation rate μ into pool
    const muArc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.65, 1.35, 0.1),
      new THREE.Vector3(-1.75, 1.2, 0.1),
      new THREE.Vector3(-1.15, 0.45, 0.1),
    ]);
    const muTube = new THREE.Mesh(
      new THREE.TubeGeometry(muArc, 20, 0.065, 10, false),
      new THREE.MeshStandardMaterial({ color: COL_GOLD, roughness: 0.3 })
    );
    muTube.castShadow = true;
    g.add(muTube);

    // Right crimson siphon draining selection s out of pool
    const sRadius = 0.05 + res.s * 0.07;
    const sArc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.15, 0.45, 0.1),
      new THREE.Vector3(1.85, 0.95, 0.1),
      new THREE.Vector3(2.7, 0.2, 0.1),
    ]);
    const sTube = new THREE.Mesh(
      new THREE.TubeGeometry(sArc, 20, sRadius, 10, false),
      new THREE.MeshStandardMaterial({ color: COL_CORAL, roughness: 0.35 })
    );
    sTube.castShadow = true;
    g.add(sTube);

    const lblMu = createArchivalLabel('Mutation Inflow (μ)', `${(res.mu * 1e4).toFixed(1)} × 10⁻⁴`, 1.45, '#8c6216');
    lblMu.position.set(-2.35, 0.015, 1.35);
    g.add(lblMu);

    const lblPool = createArchivalLabel(
      res.dominance === 'recessive' ? `Recessive q* = √(μ/s) = ${(res.qHat * 100).toFixed(2)}%` : `Dominant q* = μ/s = ${(res.qHat * 100).toFixed(3)}%`,
      res.dominance === 'recessive'
        ? `Sheltered carriers: ${(res.carrierFreq * 100).toFixed(1)}% (2pq)`
        : 'Immediately exposed in every heterozygote!',
      2.5,
      res.dominance === 'recessive' ? '#24587c' : '#a83424'
    );
    lblPool.position.set(0, 0.015, 1.88);
    g.add(lblPool);

    const lblS = createArchivalLabel('Selection Drain (s)', `s = ${res.s.toFixed(2)}`, 1.45, '#a83424');
    lblS.position.set(2.35, 0.015, 1.35);
    g.add(lblS);
  }

  // ===========================================================================
  // PAGE 3: MORGAN'S X-LINKED DROSOPHILA (Hemizygous Males q vs Females q²)
  // ===========================================================================

  private buildPage3XLinked(): void {
    const g = this.pageGroups.xlinked;
    g.add(this.p3FliesGroup);
  }

  public updateXLinked(res: XLinkedResult): void {
    this.p3FliesGroup.clear();
    const g = this.p3FliesGroup;

    // Row 1 (Back, z = -0.82): 10 Hemizygous XY Males (White-eyed fraction = q)
    const maleWhite = Math.max(1, Math.round(res.maleAffected * 10));
    for (let i = 0; i < 10; i++) {
      const isWhite = i < maleWhite;
      const fly = createDrosophila3D({
        eyeHex: isWhite ? '#f2ece0' : '#c82420',
        isMale: true,
        scale: 0.88,
      });
      fly.position.set(-2.43 + i * 0.54, 0.05, -0.78);
      fly.rotation.y = 0.25;
      g.add(fly);
    }

    // Row 2 (Front, z = +0.72): 10 Diploid XX Females (White-eyed fraction = q²)
    const femaleWhite = Math.round(res.femaleAffected * 10);
    for (let i = 0; i < 10; i++) {
      const isWhite = i < femaleWhite;
      const fly = createDrosophila3D({
        eyeHex: isWhite ? '#f2ece0' : '#c82420',
        isMale: false,
        scale: 0.94,
      });
      fly.position.set(-2.43 + i * 0.54, 0.05, 0.68);
      fly.rotation.y = -0.25;
      g.add(fly);
    }

    const lblMales = createArchivalLabel(
      `Hemizygous Males (XY) · White = ${(res.maleAffected * 100).toFixed(0)}% (q)`,
      'Single X copy — recessive w allele exposed immediately!',
      3.5,
      '#a83424'
    );
    lblMales.position.set(0, 0.015, -1.72);
    g.add(lblMales);

    const lblFemales = createArchivalLabel(
      `Diploid Females (XX) · White = ${(res.femaleAffected * 100).toFixed(1)}% (q²)`,
      `Carriers (X+Xw) = ${(res.femaleCarrier * 100).toFixed(1)}% · Male:Female excess = ${res.maleToFemaleRatio.toFixed(1)}×`,
      3.5,
      '#24587c'
    );
    lblFemales.position.set(0, 0.015, 1.58);
    g.add(lblFemales);
  }

  // ===========================================================================
  // PAGE 4: 3D CROSSING OVER + SELECTIVE SWEEP HITCHHIKING VALLEY
  // ===========================================================================

  private buildPage4Linkage(): void {
    const g = this.pageGroups.linkage;
    g.add(this.p4ChromoGroup);

    // 15 Nucleotide Diversity (pi) columns forming a 3D Selective Sweep Valley across chromosome
    const barMat = new THREE.MeshStandardMaterial({ color: COL_TEAL, roughness: 0.42 });
    const focalMat = new THREE.MeshStandardMaterial({ color: COL_CORAL, roughness: 0.35 });
    for (let i = 0; i < 15; i++) {
      const isFocal = i === 7;
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 1.0, 6, 10),
        isFocal ? focalMat : barMat.clone()
      );
      mesh.position.set(-2.8 + i * 0.4, 0.5, -1.35);
      mesh.castShadow = true;
      g.add(mesh);
      this.p4SweepBars.push(mesh);
    }

    const valleyLabel = createArchivalLabel(
      'Selective Sweep Valley (Nucleotide Diversity π)',
      'Focal beneficial allele sweeps → drags linked neutral DNA down (local Tajima’s D < 0)',
      3.4,
      '#2b6b5c'
    );
    valleyLabel.position.set(0, 0.015, -0.68);
    g.add(valleyLabel);
  }

  public updateLinkageSweep(res: LinkageSweepResult): void {
    // Update sweep valley heights
    res.diversityProfile.forEach((val, idx) => {
      const mesh = this.p4SweepBars[idx];
      if (!mesh) return;
      const h = 0.16 + val * 1.18;
      mesh.scale.set(1, h, 1);
      mesh.position.y = h * 0.55;
    });

    // Rebuild 3D paired homologous chromosomes showing live chiasma crossover proportional to r!
    this.p4ChromoGroup.clear();
    const g = this.p4ChromoGroup;

    const cobaltMat = new THREE.MeshStandardMaterial({ color: COL_COBALT, roughness: 0.34 });
    const coralMat = new THREE.MeshStandardMaterial({ color: COL_CORAL, roughness: 0.34 });
    const centromereMat = new THREE.MeshStandardMaterial({ color: COL_GOLD, roughness: 0.25, metalness: 0.65 });

    const crossing = res.r > 0.04;
    const chiasmaLift = Math.min(0.45, res.r * 1.1);

    // Maternal chromatid (Cobalt left -> swaps to Coral right if crossing over!)
    const leftCurveA = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, 0.35, 0.45),
      new THREE.Vector3(-1.0, 0.35, 0.48),
      new THREE.Vector3(0.0, 0.35 + chiasmaLift * 0.35, crossing ? 0.72 : 0.48),
    ]);
    const rightCurveA = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.35 + chiasmaLift * 0.35, crossing ? 0.72 : 0.48),
      new THREE.Vector3(1.1, 0.35, crossing ? 1.05 : 0.48),
      new THREE.Vector3(2.5, 0.35, crossing ? 1.05 : 0.48),
    ]);

    const leftCurveB = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, 0.35, 1.05),
      new THREE.Vector3(-1.0, 0.35, 1.02),
      new THREE.Vector3(0.0, 0.35 - chiasmaLift * 0.15, crossing ? 0.72 : 1.02),
    ]);
    const rightCurveB = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.35 - chiasmaLift * 0.15, crossing ? 0.72 : 1.02),
      new THREE.Vector3(1.1, 0.35, crossing ? 0.48 : 1.02),
      new THREE.Vector3(2.5, 0.35, crossing ? 0.48 : 1.02),
    ]);

    const m1 = new THREE.Mesh(new THREE.TubeGeometry(leftCurveA, 18, 0.09, 10, false), cobaltMat);
    const m2 = new THREE.Mesh(new THREE.TubeGeometry(rightCurveA, 18, 0.09, 10, false), crossing ? coralMat : cobaltMat);
    const p1 = new THREE.Mesh(new THREE.TubeGeometry(leftCurveB, 18, 0.09, 10, false), coralMat);
    const p2 = new THREE.Mesh(new THREE.TubeGeometry(rightCurveB, 18, 0.09, 10, false), crossing ? cobaltMat : coralMat);
    [m1, m2, p1, p2].forEach((m) => {
      m.castShadow = true;
      g.add(m);
    });

    // Locus A and Locus B golden gene bands
    for (const [lx, lz, col] of [
      [-1.55, 0.48, 0xffe07a],
      [-1.55, 1.02, 0xffe07a],
      [1.55, 0.48, 0x8be2cf],
      [1.55, 1.02, 0x8be2cf],
    ] as [number, number, number][]) {
      const bead = new THREE.Mesh(
        new THREE.TorusGeometry(0.115, 0.032, 8, 18),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.25 })
      );
      bead.rotation.y = Math.PI / 2;
      bead.position.set(lx, 0.35, lz);
      g.add(bead);
    }

    // Chiasma clasp glow when r > 0.04
    if (crossing) {
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), centromereMat);
      clasp.position.set(0, 0.42, 0.72);
      g.add(clasp);
    }

    const chromoLabel = createArchivalLabel(
      `Homologous Crossover (r = ${res.r.toFixed(2)}) · LD D_t = ${res.dt.toFixed(3)}`,
      crossing ? 'Recombination breaks up hitchhiking blocks each generation' : 'Tightly linked (r ≈ 0) — alleles stay locked together!',
      3.4,
      '#24587c'
    );
    chromoLabel.position.set(0, 0.015, 1.72);
    g.add(chromoLabel);
  }

  // ===========================================================================
  // PAGE 5: SCULPTED 3D ROCK POCKET MICE — SAND VS. PINACATE LAVA FLOW (F_ST)
  // ===========================================================================

  private buildPage5GeneFlow(): void {
    const g = this.pageGroups.geneflow;

    // Organic sculpted habitat patches floating directly over rag paper (no boxy slab!)
    const sandGeo = new THREE.CylinderGeometry(1.75, 1.92, 0.14, 32);
    sandGeo.scale(1.05, 1, 0.85);
    const sandPatch = new THREE.Mesh(
      sandGeo,
      new THREE.MeshStandardMaterial({ color: 0xdec79b, roughness: 0.92 })
    );
    sandPatch.position.set(-1.72, 0.07, 0);
    sandPatch.receiveShadow = true;
    sandPatch.castShadow = true;
    g.add(sandPatch);

    // Sculpted dark basalt volcanic lava flow on the right
    const lavaGeo = new THREE.CylinderGeometry(1.72, 1.95, 0.17, 32);
    lavaGeo.scale(1.05, 1, 0.85);
    const pos = lavaGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (y > 0) {
        pos.setY(i, y + Math.sin(x * 3.2) * Math.cos(z * 2.8) * 0.045);
      }
    }
    lavaGeo.computeVertexNormals();
    const lavaPatch = new THREE.Mesh(
      lavaGeo,
      new THREE.MeshStandardMaterial({ color: 0x353236, roughness: 0.88 })
    );
    lavaPatch.position.set(1.72, 0.08, 0);
    lavaPatch.receiveShadow = true;
    lavaPatch.castShadow = true;
    g.add(lavaPatch);

    const sandLabel = createArchivalLabel('Pale Desert Sand', 'Light fur cryptic · m source', 1.7, '#7c5d28');
    sandLabel.position.set(-1.72, 0.015, 1.85);
    g.add(sandLabel);

    const lavaLabel = createArchivalLabel('Pinacate Basalt Lava', 'Melanic Mc1r favoured (s)', 1.7, '#2a272b');
    lavaLabel.position.set(1.72, 0.015, 1.85);
    g.add(lavaLabel);

    g.add(this.p5MiceGroup);
    g.add(this.p5ArrowsGroup);
  }

  public updateGeneFlow(res: GeneFlowResult): void {
    this.p5MiceGroup.clear();
    this.p5ArrowsGroup.clear();

    // 6 pale desert mice on left sand patch
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + 0.3;
      const r = 0.55 + (i % 2) * 0.42;
      const mouse = createRockPocketMouse3D(false, 0.92);
      mouse.position.set(-1.72 + Math.cos(ang) * r, 0.14, Math.sin(ang) * r * 0.78);
      mouse.rotation.y = ang + 1.2;
      this.p5MiceGroup.add(mouse);
    }

    // 6 mice on the dark basalt lava patch — proportion dark equals res.lavaDarkFreq!
    const darkCount = Math.round(res.lavaDarkFreq * 6);
    for (let i = 0; i < 6; i++) {
      const isDark = i < darkCount;
      const ang = (i / 6) * Math.PI * 2 + 0.6;
      const r = 0.55 + (i % 2) * 0.42;
      const mouse = createRockPocketMouse3D(isDark, 0.92);
      mouse.position.set(1.72 + Math.cos(ang) * r, 0.17, Math.sin(ang) * r * 0.78);
      mouse.rotation.y = ang - 0.9;
      this.p5MiceGroup.add(mouse);
    }

    // Golden migration bridge arc scaled by migration rate m
    const thickness = 0.025 + Math.min(0.11, res.m * 0.42);
    const migCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 0.35, -0.3),
      new THREE.Vector3(0, 0.78 + res.m * 1.4, -0.3),
      new THREE.Vector3(0.65, 0.35, -0.3),
    ]);
    const migTube = new THREE.Mesh(
      new THREE.TubeGeometry(migCurve, 22, thickness, 10, false),
      new THREE.MeshStandardMaterial({
        color: res.swamped ? COL_CORAL : COL_GOLD,
        roughness: 0.3,
        metalness: 0.5,
      })
    );
    migTube.castShadow = true;
    this.p5ArrowsGroup.add(migTube);

    const statusSlip = createArchivalLabel(
      `F_ST = ${res.fst.toFixed(3)} · Nem = ${res.nem.toFixed(1)}`,
      res.swamped
        ? 'GENE SWAMPING (m ≥ s): Pale immigrants overwhelm lava!'
        : `Local adaptation holds: ${(res.lavaDarkFreq * 100).toFixed(0)}% melanic on lava`,
      2.85,
      res.swamped ? '#a83424' : '#24587c'
    );
    statusSlip.position.set(0, 0.015, -2.08);
    this.p5ArrowsGroup.add(statusSlip);
  }

  // ===========================================================================
  // PAGE 6: MASTERY SHOWCASE (Trio of Real Organisms)
  // ===========================================================================

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const b = createBacteriumRod3D({ resistant: true, hasPlasmid: true, scale: 1.7 });
    b.position.set(-1.55, 0.15, 0);
    b.rotation.y = 0.5;
    g.add(b);

    const fly = createDrosophila3D({ eyeHex: '#f2ece0', isMale: true, scale: 1.5 });
    fly.position.set(0, 0.15, 0);
    g.add(fly);

    const mouse = createRockPocketMouse3D(true, 1.38);
    mouse.position.set(1.55, 0.12, 0.1);
    mouse.rotation.y = -0.6;
    g.add(mouse);

    const slip = createArchivalLabel(
      'The Microevolutionary Engine',
      'Mutation (μ) · Recombination (r) · Gene Flow (m)',
      3.1,
      '#4d5d94'
    );
    slip.position.set(0, 0.015, 1.45);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE SWITCHING, CAMERA & LOOP
  // ===========================================================================

  public setPage(page: EnginePageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as EnginePageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    if (page === 'fluctuation') {
      this.fitDist = 10.6;
      this.targetAzimuth = 0.03;
      this.targetPolar = 0.62;
    } else if (page === 'balance') {
      this.fitDist = 10.2;
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.58;
    } else if (page === 'xlinked') {
      this.fitDist = 10.4;
      this.targetAzimuth = 0.0;
      this.targetPolar = 0.62;
    } else if (page === 'linkage') {
      this.fitDist = 10.2;
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.58;
    } else if (page === 'geneflow') {
      this.fitDist = 11.2;
      this.targetAzimuth = 0.03;
      this.targetPolar = 0.62;
    } else {
      this.fitDist = 9.2;
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.56;
    }
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

    // Subtle organic breathing motion on active specimens
    if (this.activePage === 'check') {
      this.pageGroups.check.rotation.y = Math.sin(t * 0.5) * 0.15;
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
