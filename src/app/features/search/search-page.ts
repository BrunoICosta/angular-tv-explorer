import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { TvmazeApiService } from '../../core/api/tvmaze-api.service';
import { Icon } from '../../shared/components/icon/icon';
import { ShowCard } from '../../shared/components/show-card/show-card';
import { ShowGridSkeleton } from '../../shared/components/skeleton/show-grid-skeleton';
import { StateMessage } from '../../shared/components/state-message/state-message';
import { MIN_QUERY_LENGTH, SEARCH_DEBOUNCE_MS, SearchState, searchStream } from './search-stream';

@Component({
  selector: 'app-search-page',
  imports: [ReactiveFormsModule, Icon, ShowCard, ShowGridSkeleton, StateMessage],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {
  private readonly api = inject(TvmazeApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly retries = new Subject<void>();
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly minLength = MIN_QUERY_LENGTH;
  protected readonly suggestions = ['Breaking Bad', 'Dark', 'The Office', 'Succession', 'Friends'];

  protected readonly query = new FormControl(this.route.snapshot.queryParamMap.get('q') ?? '', {
    nonNullable: true,
  });

  protected readonly state = toSignal(
    searchStream(this.query.valueChanges.pipe(startWith(this.query.value)), {
      search: (term) => this.api.searchShows(term),
      retry$: this.retries,
    }),
    { initialValue: { status: 'idle' } as SearchState },
  );

  constructor() {
    // Keep `?q=` in sync so searches can be shared and survive reloads.
    this.query.valueChanges
      .pipe(
        map((term) => term.trim()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((q) => {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: q || null },
          replaceUrl: true,
        });
      });

    afterNextRender(() => this.searchInput().nativeElement.focus());
  }

  protected useSuggestion(term: string): void {
    this.query.setValue(term);
    this.searchInput().nativeElement.focus();
  }

  protected clear(): void {
    this.query.setValue('');
    this.searchInput().nativeElement.focus();
  }

  protected retry(): void {
    this.retries.next();
  }
}
