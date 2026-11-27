import { ATLAS_DIRECTORY } from '../data/curriculum';
import type { AtlasChapter, AtlasProgressState } from '../types/atlas';

function createModalShell(
  eyebrow: string,
  title: string,
  bodyHtml: string,
  options?: { printable?: boolean; onClose?: () => void }
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'atlas-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', title);

  backdrop.innerHTML = `
    <div class="atlas-modal">
      <div class="atlas-modal-head">
        <div>
          <div class="page-eyebrow" style="margin-bottom: 4px;">
            <span class="page-eyebrow-dot"></span>
            <span>${eyebrow}</span>
          </div>
          <h2>${title}</h2>
        </div>
        <div class="atlas-modal-actions">
          ${
            options?.printable
              ? `<button class="util-pill" type="button" data-print>
                   <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                   Print
                 </button>`
              : ''
          }
          <button class="atlas-modal-close" type="button" aria-label="Close modal">&times;</button>
        </div>
      </div>
      <div class="atlas-modal-body">${bodyHtml}</div>
    </div>
  `;

  const close = () => {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    options?.onClose?.();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector('.atlas-modal-close')?.addEventListener('click', close);
  backdrop.querySelector('[data-print]')?.addEventListener('click', () => window.print());
  document.addEventListener('keydown', onKey);
  document.body.appendChild(backdrop);

  return backdrop;
}

export function openAtlasMapModal(
  progress: AtlasProgressState,
  onSelectChapter: (chapterId: string) => void
): void {
  const completedCount = Object.keys(progress.completed).length;
  const totalCount = ATLAS_DIRECTORY.length;

  const cardsHtml = ATLAS_DIRECTORY.map((ch) => {
    const isDone = Boolean(progress.completed[ch.id]);
    const isCurrent = progress.activeChapterId === ch.id;
    const badge = isDone
      ? `<span class="map-card-badge done">Completed ✓</span>`
      : ch.available
        ? `<span class="map-card-badge ready">Interactive Plate</span>`
        : `<span class="map-card-badge soon">Queued</span>`;

    return `
      <button
        type="button"
        class="atlas-map-card ${isCurrent ? 'is-current' : ''}"
        style="--card-accent: ${ch.accent}"
        data-chapter-id="${ch.id}"
        ${ch.available ? '' : 'disabled'}
      >
        <div class="map-card-top">
          <span>Plate ${ch.number} · ${ch.actTag.split('·')[0].trim()}</span>
          ${badge}
        </div>
        <div class="map-card-title">${ch.title}</div>
        <div class="map-card-sub">${ch.summary}</div>
      </button>
    `;
  }).join('');

  const modal = createModalShell(
    `ENDLESS FORMS ATLAS · ${completedCount} OF ${totalCount} COMPLETED`,
    'Table of Contents & Progress Map',
    `
      <p style="margin:0 0 8px; color: var(--ink-body); font-size: 14.5px;">
        An interactive natural-history atlas of evolutionary biology for undergraduates.
        Each plate combines direct physical manipulation with sourced evolutionary models.
        Chapters are being crafted one at a time — <strong>Plate 1</strong> is live, and <strong>Plate 2 (The Lichen Wood)</strong> is next.
      </p>
      <div class="atlas-map-grid">${cardsHtml}</div>
    `
  );

  modal.querySelectorAll<HTMLButtonElement>('[data-chapter-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.chapterId;
      if (id) {
        onSelectChapter(id);
        modal.remove();
      }
    });
  });
}

export function openTeacherGuideModal(chapter: AtlasChapter): void {
  const tg = chapter.teacherGuide;
  const body = `
    <div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:16px; font-family:var(--font-mono); font-size:12px; color:var(--ink-muted);">
      <span><strong>Time:</strong> ~${tg.estimatedMinutes} min</span>
      <span><strong>Level:</strong> ${tg.level}</span>
      <span><strong>Organism:</strong> ${chapter.organism}</span>
    </div>

    <div class="modal-section">
      <h3>Learning Objectives</h3>
      <ul class="modal-list">
        ${tg.learningObjectives.map((o) => `<li>${o}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <h3>Common Misconceptions to Address</h3>
      ${tg.commonMisconceptions
        .map(
          (m) => `
          <div class="misconception-row">
            <div><strong>Misconception:</strong> ${m.misconception}</div>
            <div style="margin-top:4px; color:var(--ink-muted);"><strong>Clarification:</strong> ${m.correction}</div>
          </div>`
        )
        .join('')}
    </div>

    <div class="modal-section">
      <h3>Seminar & Lecture Discussion Prompts</h3>
      <ol class="modal-list">
        ${tg.discussionPrompts.map((p) => `<li>${p}</li>`).join('')}
      </ol>
    </div>

    <div class="modal-section" style="margin-bottom:0;">
      <h3>In-Class Activity Tip</h3>
      <p style="margin:0; font-size:14.5px;">${tg.activityTip}</p>
    </div>
  `;

  createModalShell(
    `TEACHER'S GUIDE · LESSON ${chapter.number}`,
    chapter.title,
    body,
    { printable: true }
  );
}

export function openScienceCardModal(chapter: AtlasChapter): void {
  const sc = chapter.scienceCard;
  const body = `
    <div class="modal-section">
      <h3>Core Scientific Principle</h3>
      <p style="margin:0; font-size:15px; font-weight:500;">${sc.coreTakeaway}</p>
    </div>

    <div class="modal-section">
      <h3>Model Card — What Is Realistic vs. Simplified</h3>
      ${sc.assumptions
        .map(
          (a) => `
          <div class="assumption-row">
            <span class="assumption-tag ${a.status}">${a.tag || a.status}</span>
            <div>
              <strong>${a.label}:</strong> ${a.detail}
            </div>
          </div>`
        )
        .join('')}
    </div>

    ${
      sc.contestedNotes && sc.contestedNotes.length > 0
        ? `<div class="modal-section">
             <h3>Nuance & Active Debates</h3>
             <ul class="modal-list">
               ${sc.contestedNotes.map((n) => `<li>${n}</li>`).join('')}
             </ul>
           </div>`
        : ''
    }

    <div class="modal-section">
      <h3>Curriculum & Standards Alignment</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
        <div>
          <strong style="font-size:13px; color:var(--ink-muted);">Undergraduate Evolution</strong>
          <ul class="modal-list" style="margin-top:4px; font-size:13.5px;">
            ${sc.standards.undergrad.map((s) => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div>
          <strong style="font-size:13px; color:var(--ink-muted);">A-Level / AP / NGSS Bridge</strong>
          <ul class="modal-list" style="margin-top:4px; font-size:13.5px;">
            ${sc.standards.apOrALevel.map((s) => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <div class="modal-section" style="margin-bottom:0;">
      <h3>Primary Literature & Sources</h3>
      <ul class="modal-list" style="font-size:13.5px;">
        ${sc.citations
          .map(
            (c) =>
              `<li>${c.authors} (${c.year}). <em>${c.title}</em>${c.journal ? `. ${c.journal}` : ''}.${c.note ? ` — ${c.note}` : ''}</li>`
          )
          .join('')}
      </ul>
    </div>
  `;

  createModalShell(
    `MODEL CARD & STANDARDS · LESSON ${chapter.number}`,
    `${chapter.title} — Scientific Basis`,
    body,
    { printable: true }
  );
}

export function openCertificateModal(
  progress: AtlasProgressState,
  onNameChange: (name: string) => void
): void {
  const completedIds = Object.keys(progress.completed);
  const completedList = ATLAS_DIRECTORY.filter((c) => completedIds.includes(c.id));
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const body = `
    <div class="cert-frame">
      <div class="cert-seal">✦</div>
      <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--accent);">
        Endless Forms · Interactive Atlas of Evolution
      </div>
      <h3 style="font-family:var(--font-display); font-size:28px; margin:8px 0 6px; font-weight:650;">
        Record of Naturalist Study
      </h3>
      <p style="margin:0; font-size:14px; color:var(--ink-muted);">Presented to</p>
      <input
        type="text"
        class="cert-name-input"
        data-learner-name
        placeholder="Enter your name"
        value="${progress.learnerName.replace(/"/g, '&quot;')}"
        aria-label="Learner name for certificate"
      />
      <p style="margin:0 0 14px; font-size:14.5px; color:var(--ink-body);">
        for completing <strong>${completedList.length}</strong> of <strong>${ATLAS_DIRECTORY.length}</strong> Atlas plates
        ${
          completedList.length > 0
            ? `(${completedList.map((c) => c.title).join(', ')})`
            : '— complete the Check step in Lesson 1 to stamp your first plate.'
        }
      </p>
      <div style="font-family:var(--font-mono); font-size:11.5px; color:var(--ink-muted);">
        Issued ${dateStr} · MIT Open Educational Resource
      </div>
    </div>
  `;

  const modal = createModalShell(
    'NATURALIST CERTIFICATE',
    'Atlas Progress & Certificate',
    body,
    { printable: true }
  );

  const input = modal.querySelector<HTMLInputElement>('[data-learner-name]');
  input?.addEventListener('input', () => {
    onNameChange(input.value);
  });
}
