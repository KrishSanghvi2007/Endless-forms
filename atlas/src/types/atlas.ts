export interface GlossaryEntry {
  id: string;
  term: string;
  aliases?: string[];
  pronunciation?: string;
  shortDef: string;
  deepNote?: string;
  relatedChapterId?: string;
}

export interface Citation {
  authors: string;
  year: number;
  title: string;
  journal?: string;
  note?: string;
}

export interface ModelAssumption {
  label: string;
  status: 'realistic' | 'simplified' | 'scaled' | 'contested';
  tag?: string; // e.g. '×10', 'Real data', 'Debated'
  detail: string;
}

export interface ScienceCard {
  coreTakeaway: string;
  assumptions: ModelAssumption[];
  contestedNotes?: string[];
  citations: Citation[];
  standards: {
    undergrad: string[];
    apOrALevel: string[];
  };
}

export interface TeacherGuide {
  estimatedMinutes: number;
  level: string;
  learningObjectives: string[];
  commonMisconceptions: { misconception: string; correction: string }[];
  discussionPrompts: string[];
  activityTip: string;
}

export interface ChapterStep {
  id: string;
  shortLabel: string; // e.g. "1 Arm"
  eyebrow: string;
  heading: string;
  /** HTML string supporting <span class="gloss-term" data-term="homology">homologous</span> */
  bodyHtml: string;
  promptHint?: string;
}

export interface AtlasChapterMeta {
  id: string;
  number: number;
  tabLabel: string; // "1", "2", ...
  section: string;  // "EVIDENCE FROM ANATOMY"
  title: string;
  subtitle: string;
  organism: string;
  accent: string;
  available: boolean;
  /** Benchmark parity tag or Endless Forms act */
  actTag: string;
  summary: string;
}

export interface AtlasContext {
  completeChapter: (chapterId: string, score?: number, total?: number) => void;
  isChapterComplete: (chapterId: string) => boolean;
  openGlossaryTerm: (termId: string, anchorEl?: HTMLElement) => void;
  goToStep: (stepIndex: number) => void;
  getCurrentStepIndex: () => number;
  readableMode: boolean;
}

export interface ChapterInstance {
  onStepChange: (stepIndex: number) => void;
  onResize?: () => void;
  destroy: () => void;
}

export interface AtlasChapter extends AtlasChapterMeta {
  steps: ChapterStep[];
  teacherGuide: TeacherGuide;
  scienceCard: ScienceCard;
  mount: (
    plateStageEl: HTMLElement,
    leftPanelEl: HTMLElement,
    ctx: AtlasContext
  ) => ChapterInstance;
}

export interface AtlasProgressState {
  completed: Record<string, { completedAt: string; score?: number; total?: number }>;
  visitedSteps: Record<string, string[]>;
  activeChapterId: string;
  readableMode: boolean;
  learnerName: string;
}
