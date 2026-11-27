import { ATLAS_DIRECTORY } from '../data/curriculum';
import type {
  AtlasChapter,
  AtlasContext,
  AtlasProgressState,
  ChapterInstance,
} from '../types/atlas';
import { GlossaryPopover } from './GlossaryPopover';
import {
  openAtlasMapModal,
  openCertificateModal,
  openScienceCardModal,
  openTeacherGuideModal,
} from './Modals';

const STORAGE_KEY = 'endlessforms_atlas_v1';

function loadProgress(): AtlasProgressState {
  const fallback: AtlasProgressState = {
    completed: {},
    visitedSteps: {},
    activeChapterId: 'hwe',
    readableMode: false,
    learnerName: '',
  };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AtlasProgressState>;
    return {
      completed: parsed.completed ?? {},
      visitedSteps: parsed.visitedSteps ?? {},
      activeChapterId: parsed.activeChapterId ?? 'hwe',
      readableMode: Boolean(parsed.readableMode),
      learnerName: parsed.learnerName ?? '',
    };
  } catch {
    return fallback;
  }
}

function saveProgress(state: AtlasProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Graceful no-op when storage is unavailable
  }
}

export class AtlasShell {
  private root: HTMLElement;
  private chapters: Map<string, AtlasChapter>;
  private progress: AtlasProgressState;
  private glossary = new GlossaryPopover();
  private activeChapter: AtlasChapter | null = null;
  private activeInstance: ChapterInstance | null = null;
  private currentStepIndex = 0;
  private toastTimer: number | null = null;

  // DOM references
  private eyebrowTextEl!: HTMLElement;
  private titleEl!: HTMLElement;
  private atlasCountEl!: HTMLElement;
  private stepKickerEl!: HTMLElement;
  private stepProseEl!: HTMLElement;
  private promptStripEl!: HTMLElement;
  private promptTextEl!: HTMLElement;
  private leftDynamicEl!: HTMLElement;
  private stepPillsEl!: HTMLElement;
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;
  private plateStageEl!: HTMLElement;
  private tabsEl!: HTMLElement;
  private readableBtn!: HTMLButtonElement;

  constructor(root: HTMLElement, chapters: AtlasChapter[]) {
    this.root = root;
    this.chapters = new Map(chapters.map((c) => [c.id, c]));
    this.progress = loadProgress();
    this.applyReadableMode();
    this.renderFrame();
    this.bindGlobalEvents();

    const startId = this.chapters.has(this.progress.activeChapterId)
      ? this.progress.activeChapterId
      : chapters[0].id;
    this.openChapter(startId);
  }

  private applyReadableMode(): void {
    document.documentElement.dataset.readable = String(this.progress.readableMode);
  }

  private renderFrame(): void {
    this.root.innerHTML = `
      <main class="atlas-desk">
        <div class="atlas-book-wrap">
          <div class="atlas-book">
            <div class="atlas-spine" aria-hidden="true">
              <div class="atlas-ribbon"></div>
            </div>

            <!-- LEFT PAGE: Editorial Narrative, Controls & Readouts -->
            <section class="atlas-page atlas-page-left" aria-label="Chapter narrative">
              <header>
                <div class="page-eyebrow">
                  <span class="page-eyebrow-dot"></span>
                  <span data-eyebrow>LESSON 1 · EVIDENCE FROM ANATOMY</span>
                </div>

                <div class="utility-bar">
                  <button class="util-pill" type="button" data-open-map>
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                    </svg>
                    <span>Atlas</span>
                    <span class="pill-count" data-atlas-count>0/10</span>
                  </button>

                  <button class="util-pill" type="button" data-open-teacher>
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <span>Teacher's Guide</span>
                  </button>

                  <button class="util-pill" type="button" data-open-science>
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>Model &amp; Science</span>
                  </button>

                  <button
                    class="util-pill"
                    type="button"
                    data-toggle-readable
                    title="Toggle Atkinson Hyperlegible font"
                    aria-pressed="${this.progress.readableMode}"
                  >
                    <span style="font-family:var(--font-mono); font-size:11.5px;">Aa</span>
                  </button>
                </div>

                <h1 class="chapter-title" data-chapter-title></h1>
              </header>

              <div class="left-scroll-body">
                <p class="step-kicker" data-step-kicker></p>
                <div class="step-prose" data-step-prose></div>

                <div class="prompt-strip" data-prompt-strip>
                  <span class="prompt-strip-star" aria-hidden="true">✦</span>
                  <span data-prompt-text></span>
                </div>

                <div class="left-dynamic-slot" data-left-dynamic></div>
              </div>

              <footer class="step-footer" aria-label="Chapter steps">
                <div class="step-pills" data-step-pills></div>
                <div class="step-nav-btns">
                  <button class="btn-step-prev" type="button" data-step-prev aria-label="Previous step">←</button>
                  <button class="btn-step-next" type="button" data-step-next>Next →</button>
                </div>
              </footer>
            </section>

            <!-- RIGHT PAGE: Full-Bleed Naturalist 3D / 2D Interactive Plate -->
            <section class="atlas-page atlas-page-right" aria-label="Interactive specimen plate">
              <div class="plate-frame" data-plate-stage></div>
            </section>
          </div>

          <!-- RIGHT-EDGE DIE-CUT BOOK INDEX TABS -->
          <nav class="atlas-tabs" aria-label="Atlas chapters" data-atlas-tabs></nav>
        </div>
      </main>
    `;

    this.eyebrowTextEl = this.root.querySelector('[data-eyebrow]')!;
    this.titleEl = this.root.querySelector('[data-chapter-title]')!;
    this.atlasCountEl = this.root.querySelector('[data-atlas-count]')!;
    this.stepKickerEl = this.root.querySelector('[data-step-kicker]')!;
    this.stepProseEl = this.root.querySelector('[data-step-prose]')!;
    this.promptStripEl = this.root.querySelector('[data-prompt-strip]')!;
    this.promptTextEl = this.root.querySelector('[data-prompt-text]')!;
    this.leftDynamicEl = this.root.querySelector('[data-left-dynamic]')!;
    this.stepPillsEl = this.root.querySelector('[data-step-pills]')!;
    this.prevBtn = this.root.querySelector('[data-step-prev]')!;
    this.nextBtn = this.root.querySelector('[data-step-next]')!;
    this.plateStageEl = this.root.querySelector('[data-plate-stage]')!;
    this.tabsEl = this.root.querySelector('[data-atlas-tabs]')!;
    this.readableBtn = this.root.querySelector('[data-toggle-readable]')!;

    if (this.progress.readableMode) {
      this.readableBtn.classList.add('is-active');
    }

    this.root.querySelector('[data-open-map]')?.addEventListener('click', () => {
      openAtlasMapModal(this.progress, (id) => this.openChapter(id));
    });
    this.root.querySelector('[data-open-teacher]')?.addEventListener('click', () => {
      if (this.activeChapter) openTeacherGuideModal(this.activeChapter);
    });
    this.root.querySelector('[data-open-science]')?.addEventListener('click', () => {
      if (this.activeChapter) openScienceCardModal(this.activeChapter);
    });
    this.readableBtn.addEventListener('click', () => {
      this.progress.readableMode = !this.progress.readableMode;
      this.applyReadableMode();
      this.readableBtn.classList.toggle('is-active', this.progress.readableMode);
      this.readableBtn.setAttribute('aria-pressed', String(this.progress.readableMode));
      saveProgress(this.progress);
    });

    this.prevBtn.addEventListener('click', () => this.goToStep(this.currentStepIndex - 1));
    this.nextBtn.addEventListener('click', () => this.goToStep(this.currentStepIndex + 1));

    this.renderTabs();
    this.updateAtlasCounter();
  }

  private bindGlobalEvents(): void {
    // Delegate inline glossary term clicks anywhere inside the Atlas
    this.root.addEventListener('click', (e) => {
      const termEl = (e.target as HTMLElement | null)?.closest<HTMLElement>('.gloss-term');
      if (termEl?.dataset.term) {
        this.glossary.open(termEl.dataset.term, termEl);
      }
    });

    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const termEl = (e.target as HTMLElement | null)?.closest<HTMLElement>('.gloss-term');
        if (termEl?.dataset.term) {
          e.preventDefault();
          this.glossary.open(termEl.dataset.term, termEl);
        }
      }
    });

    window.addEventListener('resize', () => {
      this.activeInstance?.onResize?.();
    });
  }

  private renderTabs(): void {
    const html = ATLAS_DIRECTORY.map((ch) => {
      const isActive = this.activeChapter?.id === ch.id;
      const isDone = Boolean(this.progress.completed[ch.id]);
      const classes = [
        'chapter-tab',
        isActive ? 'is-active' : '',
        !ch.available ? 'is-locked' : '',
        isDone ? 'is-complete' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `
        <button
          type="button"
          class="${classes}"
          data-tab-chapter="${ch.id}"
          aria-label="Plate ${ch.number}: ${ch.title}${ch.available ? '' : ' (coming soon)'}"
          style="${isActive ? `background:${ch.accent};` : ''}"
        >
          ${ch.tabLabel}
          <span class="chapter-tab-tooltip">
            ${ch.number}. ${ch.title}${ch.available ? '' : ' (Queued)'}
          </span>
        </button>
      `;
    }).join('');

    this.tabsEl.innerHTML = `
      ${html}
      <button
        type="button"
        class="chapter-tab chapter-tab-cert"
        data-tab-cert
        aria-label="Atlas Certificate and Progress"
      >
        ✦
        <span class="chapter-tab-tooltip">Certificate &amp; Progress</span>
      </button>
    `;

    this.tabsEl.querySelectorAll<HTMLButtonElement>('[data-tab-chapter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.tabChapter!;
        const meta = ATLAS_DIRECTORY.find((c) => c.id === id);
        if (this.chapters.has(id)) {
          this.openChapter(id);
        } else if (meta) {
          this.showToast(`Plate ${meta.number} (${meta.title}) is queued next in the Atlas.`);
        }
      });
    });

    this.tabsEl.querySelector('[data-tab-cert]')?.addEventListener('click', () => {
      openCertificateModal(this.progress, (name) => {
        this.progress.learnerName = name;
        saveProgress(this.progress);
      });
    });
  }

  private showToast(msg: string): void {
    document.querySelector('.atlas-toast')?.remove();
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    const toast = document.createElement('div');
    toast.className = 'atlas-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    this.toastTimer = window.setTimeout(() => toast.remove(), 2600);
  }

  private updateAtlasCounter(): void {
    const done = Object.keys(this.progress.completed).length;
    this.atlasCountEl.textContent = `${done}/${ATLAS_DIRECTORY.length}`;
  }

  public openChapter(chapterId: string): void {
    const chapter = this.chapters.get(chapterId);
    if (!chapter) return;

    this.activeInstance?.destroy();
    this.activeInstance = null;
    this.glossary.close();

    this.activeChapter = chapter;
    this.progress.activeChapterId = chapter.id;
    saveProgress(this.progress);

    // Apply chapter accent token
    document.documentElement.style.setProperty('--accent', chapter.accent);

    this.eyebrowTextEl.textContent = `LESSON ${chapter.number} · ${chapter.section}`;
    this.titleEl.textContent = chapter.title;
    this.plateStageEl.innerHTML = '';
    this.leftDynamicEl.innerHTML = '';
    this.currentStepIndex = 0;

    const ctx: AtlasContext = {
      completeChapter: (id, score, total) => {
        this.progress.completed[id] = {
          completedAt: new Date().toISOString(),
          score,
          total,
        };
        saveProgress(this.progress);
        this.updateAtlasCounter();
        this.renderTabs();
      },
      isChapterComplete: (id) => Boolean(this.progress.completed[id]),
      openGlossaryTerm: (termId, anchorEl) => this.glossary.open(termId, anchorEl),
      goToStep: (idx) => this.goToStep(idx),
      getCurrentStepIndex: () => this.currentStepIndex,
      readableMode: this.progress.readableMode,
    };

    this.activeInstance = chapter.mount(this.plateStageEl, this.leftDynamicEl, ctx);
    this.renderStepPills();
    this.goToStep(0);
    this.renderTabs();
  }

  private renderStepPills(): void {
    if (!this.activeChapter) return;
    const visited = new Set(this.progress.visitedSteps[this.activeChapter.id] ?? []);

    this.stepPillsEl.innerHTML = this.activeChapter.steps
      .map(
        (st, idx) => `
          <button
            type="button"
            class="step-pill ${idx === this.currentStepIndex ? 'is-current' : ''} ${visited.has(st.id) && idx !== this.currentStepIndex ? 'is-visited' : ''}"
            data-step-idx="${idx}"
          >
            ${st.shortLabel}
          </button>`
      )
      .join('');

    this.stepPillsEl.querySelectorAll<HTMLButtonElement>('[data-step-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.goToStep(Number(btn.dataset.stepIdx));
      });
    });
  }

  public goToStep(index: number): void {
    if (!this.activeChapter) return;
    const total = this.activeChapter.steps.length;
    const clamped = Math.max(0, Math.min(total - 1, index));
    this.currentStepIndex = clamped;
    const step = this.activeChapter.steps[clamped];

    // Record visited step
    const visited = new Set(this.progress.visitedSteps[this.activeChapter.id] ?? []);
    visited.add(step.id);
    this.progress.visitedSteps[this.activeChapter.id] = Array.from(visited);
    saveProgress(this.progress);

    this.stepKickerEl.textContent = step.eyebrow;
    this.stepProseEl.innerHTML = step.bodyHtml;

    if (step.promptHint) {
      this.promptStripEl.style.display = 'flex';
      this.promptTextEl.textContent = step.promptHint;
    } else {
      this.promptStripEl.style.display = 'none';
    }

    this.prevBtn.disabled = clamped === 0;
    this.nextBtn.disabled = clamped === total - 1;
    this.nextBtn.textContent =
      clamped === total - 1 ? 'Done ✓' : `Next: ${this.activeChapter.steps[clamped + 1].shortLabel.replace(/^\d+\s*/, '')} →`;

    this.renderStepPills();
    this.activeInstance?.onStepChange(clamped);
  }
}
