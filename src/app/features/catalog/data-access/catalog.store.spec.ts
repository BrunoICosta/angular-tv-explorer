import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import { TvmazeApiService } from '../../../core/api/tvmaze-api.service';
import { ApiError } from '../../../core/http/api-error';
import { Show } from '../../../core/models/tvmaze.model';
import { CatalogStore, RENDER_CHUNK } from './catalog.store';

function makeShows(from: number, count: number): Show[] {
  return Array.from(
    { length: count },
    (_, i) =>
      ({
        id: from + i,
        name: `Show ${from + i}`,
        genres: i % 2 ? ['Comedy'] : ['Drama'],
        rating: { average: i },
      }) as Show,
  );
}

describe('CatalogStore', () => {
  let store: CatalogStore;
  let pages: Subject<Show[]>[];
  let api: jasmine.SpyObj<TvmazeApiService>;

  beforeEach(() => {
    pages = [];
    api = jasmine.createSpyObj<TvmazeApiService>('TvmazeApiService', ['getShows']);
    api.getShows.and.callFake(() => {
      const page = new Subject<Show[]>();
      pages.push(page);
      return page;
    });

    TestBed.configureTestingModule({
      providers: [CatalogStore, { provide: TvmazeApiService, useValue: api }],
    });
    store = TestBed.inject(CatalogStore);
  });

  function resolvePage(shows: Show[]): void {
    const page = pages.at(-1)!;
    page.next(shows);
    page.complete();
  }

  it('loads the first page once on init', () => {
    store.init();
    store.init();

    expect(api.getShows).toHaveBeenCalledOnceWith(0);
    expect(store.isInitialLoad()).toBeTrue();

    resolvePage(makeShows(1, 100));

    expect(store.status()).toBe('idle');
    expect(store.visibleShows().length).toBe(RENDER_CHUNK);
  });

  it('reveals buffered shows before requesting the next page', () => {
    store.init();
    resolvePage(makeShows(1, 100));

    store.loadMore();
    expect(store.visibleShows().length).toBe(RENDER_CHUNK * 2);
    expect(api.getShows).toHaveBeenCalledTimes(1);

    store.loadMore();
    store.loadMore();
    expect(api.getShows).toHaveBeenCalledTimes(2);
    expect(api.getShows).toHaveBeenCalledWith(1);
  });

  it('marks the catalog as complete on 404', () => {
    store.init();
    resolvePage(makeShows(1, 10));
    api.getShows.and.returnValue(throwError(() => new ApiError(404, 'fim')));

    store.loadMore();

    expect(store.status()).toBe('complete');
    expect(store.hasMore()).toBeFalse();
    expect(store.scrollDisabled()).toBeTrue();
  });

  it('exposes errors and retries', () => {
    api.getShows.and.returnValue(throwError(() => new ApiError(500, 'Instável')));
    store.init();

    expect(store.status()).toBe('error');
    expect(store.errorMessage()).toBe('Instável');

    api.getShows.and.returnValue(new Subject<Show[]>());
    store.retry();
    expect(store.status()).toBe('loading');
  });

  it('filters and sorts loaded shows, resetting the visible chunk', () => {
    store.init();
    resolvePage(makeShows(1, 120));
    store.loadMore();

    store.genre.set('Comedy');
    store.sort.set('rating-desc');

    const visible = store.visibleShows();
    expect(store.filteredShows().length).toBe(60);
    expect(visible.length).toBe(RENDER_CHUNK);
    expect(visible.every((show) => show.genres.includes('Comedy'))).toBeTrue();
    expect(visible[0].rating.average).toBe(119);
  });
});
