import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, exhaustMap, catchError, EMPTY, tap } from 'rxjs';

import { TvmazeApiService } from '../../core/api/tvmaze-api.service';
import { ApiError, toErrorMessage } from '../../core/http/api-error';
import { Show } from '../../core/models/tvmaze.models';
import { ShowCard } from '../../shared/components/show-card/show-card';
import { ShowGridSkeleton } from '../../shared/components/skeleton/show-grid-skeleton';
import { StateMessage } from '../../shared/components/state-message/state-message';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

/** How many cards are revealed per scroll step (an API page has 250 shows). */
const RENDER_CHUNK = 48;

type CatalogStatus = 'idle' | 'loading' | 'error' | 'complete';

@Component({
  selector: 'app-home-page',
  imports: [ShowCard, ShowGridSkeleton, StateMessage, InfiniteScrollDirective],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly api = inject(TvmazeApiService);
  private readonly loadRequests = new Subject<void>();
  private nextPage = 0;

  protected readonly shows = signal<Show[]>([]);
  protected readonly status = signal<CatalogStatus>('idle');
  protected readonly errorMessage = signal('');
  private readonly renderLimit = signal(RENDER_CHUNK);

  protected readonly visibleShows = computed(() => this.shows().slice(0, this.renderLimit()));
  protected readonly isInitialLoad = computed(
    () => this.status() === 'loading' && this.shows().length === 0,
  );
  protected readonly hasMore = computed(
    () => this.status() !== 'complete' || this.renderLimit() < this.shows().length,
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
    if (this.renderLimit() < this.shows().length) {
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
