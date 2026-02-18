import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, exhaustMap, catchError, EMPTY, tap } from 'rxjs';

import { TvmazeApiService } from '../../../../core/api/tvmaze-api.service';
import { ApiError, toErrorMessage } from '../../../../core/http/api-error';
import { Show } from '../../../../core/models/tvmaze.model';
import { ShowCardComponent } from '../../../../shared/components/show-card/show-card.component';
import { ShowGridSkeletonComponent } from '../../../../shared/components/show-grid-skeleton/show-grid-skeleton.component';
import { StateMessageComponent } from '../../../../shared/components/state-message/state-message.component';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';
import {
  ShowSort,
  collectGenres,
  filterByGenre,
  sortShows,
} from '../../../../shared/utils/show-utils';
import { ShowFiltersComponent } from '../../../../shared/components/show-filters/show-filters.component';

/** How many cards are revealed per scroll step (an API page has 250 shows). */
const RENDER_CHUNK = 48;

type CatalogStatus = 'idle' | 'loading' | 'error' | 'complete';

@Component({
  selector: 'app-catalog-page',
  imports: [
    ShowCardComponent,
    ShowGridSkeletonComponent,
    StateMessageComponent,
    InfiniteScrollDirective,
    ShowFiltersComponent,
  ],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPageComponent {
  private readonly api = inject(TvmazeApiService);
  private readonly loadRequests = new Subject<void>();
  private nextPage = 0;

  protected readonly shows = signal<Show[]>([]);
  protected readonly status = signal<CatalogStatus>('idle');
  protected readonly errorMessage = signal('');
  protected readonly genre = signal<string | null>(null);
  protected readonly sort = signal<ShowSort>('default');

  /** Resets to the first chunk whenever the filters change. */
  private readonly renderLimit = linkedSignal({
    source: () => [this.genre(), this.sort()] as const,
    computation: () => RENDER_CHUNK,
  });

  protected readonly genres = computed(() => collectGenres(this.shows()));
  protected readonly filteredShows = computed(() =>
    sortShows(filterByGenre(this.shows(), this.genre()), this.sort()),
  );
  protected readonly visibleShows = computed(() =>
    this.filteredShows().slice(0, this.renderLimit()),
  );
  protected readonly isInitialLoad = computed(
    () => this.status() === 'loading' && this.shows().length === 0,
  );
  protected readonly hasMore = computed(
    () => this.status() !== 'complete' || this.renderLimit() < this.filteredShows().length,
  );
  protected readonly scrollDisabled = computed(
    () => this.status() === 'loading' || this.status() === 'error' || !this.hasMore(),
  );

  constructor() {
    this.loadRequests
      .pipe(
        exhaustMap(() => {
          this.status.set('loading');
          return this.api.getShows(this.nextPage).pipe(
            tap((page) => {
              this.nextPage++;
              this.shows.update((current) => [...current, ...page]);
              this.status.set('idle');
            }),
            catchError((error: unknown) => {
              if (error instanceof ApiError && error.isNotFound) {
                this.status.set('complete');
              } else {
                this.errorMessage.set(toErrorMessage(error));
                this.status.set('error');
              }
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.loadRequests.next();
  }

  /** Reveals already loaded shows first and only hits the API when the buffer is exhausted. */
  protected onScrolled(): void {
    if (this.renderLimit() < this.filteredShows().length) {
      this.renderLimit.update((limit) => limit + RENDER_CHUNK);
      return;
    }
    if (this.status() === 'idle') {
      this.loadRequests.next();
    }
  }

  protected retry(): void {
    this.loadRequests.next();
  }
}
