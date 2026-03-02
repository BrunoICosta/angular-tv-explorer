import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { GenreLabelPipe } from '../../pipes/genre-label.pipe';
import { SORT_OPTIONS, ShowSort } from '../../utils/show-utils';

/** Genre filter + sort controls for a list of shows that is already on the client. */
@Component({
  selector: 'app-show-filters',
  imports: [GenreLabelPipe, TranslocoPipe],
  template: `
    <div class="toolbar" role="group" [attr.aria-label]="labelKey() | transloco">
      <div class="field">
        <label for="genre-filter">{{ 'filters.genre' | transloco }}</label>
        <select
          id="genre-filter"
          class="select"
          [value]="genre() ?? ''"
          (change)="onGenreChange($event)"
        >
          <option value="">{{ 'filters.allGenres' | transloco }}</option>
          @for (option of genres(); track option) {
            <option [value]="option" [selected]="option === genre()">
              {{ option | genreLabel }}
            </option>
          }
        </select>
      </div>

      <div class="field">
        <label for="sort-order">{{ 'filters.sortBy' | transloco }}</label>
        <select id="sort-order" class="select" [value]="sort()" (change)="onSortChange($event)">
          @for (option of sortOptions(); track option.value) {
            <option [value]="option.value" [selected]="option.value === sort()">
              {{ option.labelKey | transloco }}
            </option>
          }
        </select>
      </div>

      <p class="toolbar__count" aria-live="polite">
        <strong>{{ matchCount() }}</strong>
        {{ countKey() | transloco: { total: totalCount() } }}
      </p>
    </div>
  `,
  styles: `
    .toolbar {
      display: grid;
      grid-template-columns: 1fr;
      align-items: end;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-bg-elevated);

      @media (min-width: 480px) {
        grid-template-columns: 1fr 1fr;
      }

      @media (min-width: 768px) {
        grid-template-columns: minmax(200px, 260px) minmax(200px, 240px) 1fr;
      }
    }

    .toolbar__count {
      grid-column: 1 / -1;
      color: var(--color-text-muted);
      font-size: var(--text-sm);

      strong {
        color: var(--color-text);
      }

      @media (min-width: 768px) {
        grid-column: auto;
        justify-self: end;
        align-self: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowFiltersComponent {
  readonly genres = input.required<readonly string[]>();
  readonly matchCount = input.required<number>();
  readonly totalCount = input.required<number>();
  /** Root translation keys, so each list can describe itself. */
  readonly labelKey = input('filters.catalogLabel');
  readonly countKey = input('filters.countLoaded');
  /** Key for the "no sorting" option (the list's natural order). */
  readonly defaultSortKey = input('filters.sort.default');

  readonly genre = model<string | null>(null);
  readonly sort = model<ShowSort>('default');

  protected readonly sortOptions = computed(() =>
    SORT_OPTIONS.map((option) =>
      option.value === 'default' ? { ...option, labelKey: this.defaultSortKey() } : option,
    ),
  );

  protected onGenreChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.genre.set(value || null);
  }

  protected onSortChange(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as ShowSort);
  }
}
