import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/** Placeholder grid shown while show cards are loading. */
@Component({
  selector: 'app-show-grid-skeleton',
  imports: [TranslocoPipe],
  template: `
    <ul class="show-grid" aria-hidden="true">
      @for (item of items(); track item) {
        <li class="skeleton-card">
          <div class="skeleton skeleton-card__poster"></div>
          <div class="skeleton-card__body">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line skeleton-line--short"></div>
          </div>
        </li>
      }
    </ul>
    <span class="visually-hidden" role="status">{{ 'common.loadingShows' | transloco }}</span>
  `,
  styles: `
    :host {
      display: block;
    }

    .skeleton-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      overflow: hidden;
    }

    .skeleton-card__poster {
      aspect-ratio: 2 / 3;
      border-radius: 0;
    }

    .skeleton-card__body {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowGridSkeletonComponent {
  readonly count = input(12);

  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
