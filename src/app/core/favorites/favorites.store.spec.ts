import { TestBed } from '@angular/core/testing';

import { ShowSummary } from '../models/tvmaze.model';
import { BROWSER_STORAGE, MemoryStorage } from '../storage/browser-storage.token';
import { CLOCK } from '../time/clock.token';
import { FAVORITES_STORAGE_KEY, FavoriteShow, FavoritesStore } from './favorites.store';

function show(id: number, overrides: Partial<ShowSummary> = {}): ShowSummary {
  return {
    id,
    name: `Show ${id}`,
    image: null,
    rating: { average: 7 },
    genres: ['Drama'],
    premiered: '2020-01-01',
    ...overrides,
  };
}

describe('FavoritesStore', () => {
  let storage: MemoryStorage;

  function createStore(): FavoritesStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: CLOCK, useValue: () => new Date('2026-02-22T12:00:00Z') },
      ],
    });
    return TestBed.inject(FavoritesStore);
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('starts empty', () => {
    const store = createStore();
    expect(store.favorites()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  it('adds shows (newest first) and persists them', () => {
    const store = createStore();
    store.add(show(1));
    store.add(show(2));

    expect(store.favorites().map((s) => s.id)).toEqual([2, 1]);
    expect(store.isFavorite(1)).toBeTrue();

    const saved = JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) ?? '[]') as FavoriteShow[];
    expect(saved.length).toBe(2);
    expect(saved[0].addedAt).toBe('2026-02-22T12:00:00.000Z');
  });

  it('ignores duplicates', () => {
    const store = createStore();
    store.add(show(1));
    store.add(show(1));
    expect(store.count()).toBe(1);
  });

  it('only persists summary fields', () => {
    const store = createStore();
    const full = { ...show(1), summary: '<p>long</p>', weight: 99 } as ShowSummary;
    store.add(full);

    const saved = JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) ?? '[]') as object[];
    expect(Object.keys(saved[0]).sort()).toEqual(
      ['addedAt', 'genres', 'id', 'image', 'name', 'premiered', 'rating'].sort(),
    );
  });

  it('toggles and removes', () => {
    const store = createStore();
    expect(store.toggle(show(5))).toBeTrue();
    expect(store.toggle(show(5))).toBeFalse();
    expect(store.count()).toBe(0);

    store.add(show(6));
    store.remove(6);
    expect(store.isFavorite(6)).toBeFalse();
  });

  it('clears everything', () => {
    const store = createStore();
    store.add(show(1));
    store.add(show(2));
    store.clear();
    expect(store.count()).toBe(0);
    expect(storage.getItem(FAVORITES_STORAGE_KEY)).toBe('[]');
  });

  it('restores persisted favorites and drops invalid entries', () => {
    const valid: FavoriteShow = { ...show(9), addedAt: '2026-02-01T00:00:00Z' };
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([valid, { id: 'nope' }, null]));

    const store = createStore();
    expect(store.favorites()).toEqual([valid]);
  });

  it('survives corrupted storage', () => {
    storage.setItem(FAVORITES_STORAGE_KEY, '{not json');
    expect(createStore().favorites()).toEqual([]);
  });

  it('syncs when another tab changes the favorites', () => {
    const store = createStore();
    const other: FavoriteShow = { ...show(3), addedAt: '2026-02-01T00:00:00Z' };
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([other]));

    window.dispatchEvent(new StorageEvent('storage', { key: FAVORITES_STORAGE_KEY }));

    expect(store.isFavorite(3)).toBeTrue();
  });
});
