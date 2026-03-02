import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, exhaustMap, tap } from 'rxjs';

import { TvmazeApiService } from '../../../core/api/tvmaze-api.service';
import { ApiError, toErrorKey } from '../../../core/http/api-error';
import { Show } from '../../../core/models/tvmaze.model';
import {
  ShowSort,
  collectGenres,
  filterByGenre,
  sortShows,
} from '../../../shared/utils/show-utils';

/** How many cards are revealed per scroll step (an API page has 250 shows). */
export const RENDER_CHUNK = 48;

export type CatalogStatus = 'idle' | 'loading' | 'error' | 'complete';

/**
 * Catalog state, provided at the CATALOG_ROUTES level. The route injector outlives the page
 * component, so loaded pages, filters and scroll depth survive a trip to a show and back.
 */
@Injectable()
export class CatalogStore {
  private readonly api = inject(TvmazeApiService);
  private readonly loadRequests = new Subject<void>();
  private nextPage = 0;

  private readonly _shows = signal<readonly Show[]>([]);
  private readonly _status = signal<CatalogStatus>('idle');
  private readonly _errorKey = signal('');

  readonly shows = this._shows.asReadonly();
  readonly status = this._status.asReadonly();
  /** Translation key of the last error. */
  readonly errorKey = this._errorKey.asReadonly();
  readonly genre = signal<string | null>(null);
  readonly sort = signal<ShowSort>('default');

  /** Resets to the first chunk whenever the filters change. */
  private readonly renderLimit = linkedSignal({
    source: () => [this.genre(), this.sort()] as const,
    computation: () => RENDER_CHUNK,
  });

  readonly genres = computed(() => collectGenres(this._shows()));
  readonly filteredShows = computed(() =>
    sortShows(filterByGenre(this._shows(), this.genre()), this.sort()),
  );
  readonly visibleShows = computed(() => this.filteredShows().slice(0, this.renderLimit()));
  readonly isInitialLoad = computed(
    () => this._status() === 'loading' && this._shows().length === 0,
  );
  readonly hasMore = computed(
    () => this._status() !== 'complete' || this.renderLimit() < this.filteredShows().length,
  );
  readonly scrollDisabled = computed(
    () => this._status() === 'loading' || this._status() === 'error' || !this.hasMore(),
  );

  constructor() {
    this.loadRequests
      .pipe(
        exhaustMap(() => {
          this._status.set('loading');
          return this.api.getShows(this.nextPage).pipe(
            tap((page) => {
              this.nextPage++;
              this._shows.update((current) => [...current, ...page]);
              this._status.set('idle');
            }),
            catchError((error: unknown) => {
              if (error instanceof ApiError && error.isNotFound) {
                this._status.set('complete');
              } else {
                this._errorKey.set(toErrorKey(error));
                this._status.set('error');
              }
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /** Loads the first page unless something is already there. */
  init(): void {
    if (this._shows().length === 0 && this._status() === 'idle') {
      this.loadRequests.next();
    }
  }

  /** Reveals already loaded shows first and only hits the API when the buffer is exhausted. */
  loadMore(): void {
    if (this.renderLimit() < this.filteredShows().length) {
      this.renderLimit.update((limit) => limit + RENDER_CHUNK);
      return;
    }
    if (this._status() === 'idle') {
      this.loadRequests.next();
    }
  }

  retry(): void {
    if (this._status() === 'error') {
      this.loadRequests.next();
    }
  }
}
