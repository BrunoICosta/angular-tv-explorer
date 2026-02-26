import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { GenreLabelPipe } from '../../pipes/genre-label.pipe';
import { SORT_OPTIONS, ShowSort } from '../../utils/show-utils';

/** Genre filter + sort controls for a list of shows that is already on the client. */
@Component({
  selector: 'app-show-filters',
  imports: [GenreLabelPipe],
  template: `
    <div class="toolbar" role="group" [attr.aria-label]="label()">
      <div class="field">
        <label for="genre-filter">Gênero</label>
        <select
          id="genre-filter"
          class="select"
          [value]="genre() ?? ''"
          (change)="onGenreChange($event)"
        >
          <option value="">Todos os gêneros</option>
          @for (option of genres(); track option) {
            <option [value]="option" [selected]="option === genre()">
              {{ option | genreLabel }}
            </option>
          }
        </select>
      </div>

      <div class="field">
        <label for="sort-order">Ordenar por</label>
        <select id="sort-order" class="select" [value]="sort()" (change)="onSortChange($event)">
          @for (option of sortOptions(); track option.value) {
            <option [value]="option.value" [selected]="option.value === sort()">
              {{ option.label }}
            </option>
          }
        </select>
      </div>

      <p class="toolbar__count" aria-live="polite">
        <strong>{{ matchCount() }}</strong> de {{ totalCount() }} {{ countSuffix() }}
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
  readonly label = input('Filtros');
  readonly countSuffix = input('séries');
  /** Label of the "no sorting" option (the list's natural order). */
  readonly defaultSortLabel = input<string>();

  readonly genre = model<string | null>(null);
  readonly sort = model<ShowSort>('default');

  protected readonly sortOptions = computed(() => {
    const defaultLabel = this.defaultSortLabel();
    return defaultLabel
      ? SORT_OPTIONS.map((option) =>
          option.value === 'default' ? { ...option, label: defaultLabel } : option,
        )
      : SORT_OPTIONS;
  });

  protected onGenreChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.genre.set(value || null);
  }

  protected onSortChange(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as ShowSort);
  }
}
