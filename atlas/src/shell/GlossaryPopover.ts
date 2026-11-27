import { GLOSSARY } from '../data/glossary';

export class GlossaryPopover {
  private el: HTMLDivElement | null = null;
  private boundOutsideClick: (e: MouseEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor() {
    this.boundOutsideClick = (e: MouseEvent) => {
      if (this.el && !this.el.contains(e.target as Node)) {
        const target = e.target as HTMLElement | null;
        if (!target?.closest('.gloss-term')) {
          this.close();
        }
      }
    };
    this.boundKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
  }

  open(termId: string, anchorEl?: HTMLElement): void {
    const entry = GLOSSARY[termId];
    if (!entry) return;
    this.close();

    const pop = document.createElement('div');
    pop.className = 'glossary-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', `Glossary definition: ${entry.term}`);
    pop.innerHTML = `
      <div class="glossary-pop-head">
        <div>
          <h4 class="glossary-pop-term">${entry.term}</h4>
          ${entry.pronunciation ? `<span class="glossary-pop-pron">/${entry.pronunciation}/</span>` : ''}
        </div>
        <button class="glossary-pop-close" type="button" aria-label="Close definition">&times;</button>
      </div>
      <p class="glossary-pop-short">${entry.shortDef}</p>
      ${entry.deepNote ? `<p class="glossary-pop-deep">${entry.deepNote}</p>` : ''}
    `;

    pop.querySelector('.glossary-pop-close')?.addEventListener('click', () => this.close());
    document.body.appendChild(pop);
    this.el = pop;

    // Position gracefully within viewport bounds
    const pad = 14;
    const popRect = pop.getBoundingClientRect();
    let left = Math.round((window.innerWidth - popRect.width) / 2);
    let top = Math.round(window.innerHeight * 0.25);

    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      left = Math.min(
        Math.max(pad, r.left),
        window.innerWidth - popRect.width - pad
      );
      const below = r.bottom + 8;
      if (below + popRect.height + pad <= window.innerHeight) {
        top = below;
      } else {
        top = Math.max(pad, r.top - popRect.height - 8);
      }
    }

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    window.setTimeout(() => {
      document.addEventListener('mousedown', this.boundOutsideClick);
      document.addEventListener('keydown', this.boundKeyDown);
    }, 0);
  }

  close(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
    document.removeEventListener('mousedown', this.boundOutsideClick);
    document.removeEventListener('keydown', this.boundKeyDown);
  }
}
