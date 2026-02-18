import { DOCUMENT, DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

import { ShowSummary } from '../models/tvmaze.model';
import { BROWSER_STORAGE } from '../storage/browser-storage.token';
import { CLOCK } from '../time/clock.token';

export const FAVORITES_STORAGE_KEY = 'tv-explorer:favorites:v1';

export interface FavoriteShow extends ShowSummary {
  /** ISO timestamp of when the show was favorited. */
  addedAt: string;
}

/** Keeps only the fields we render, so full API payloads never end up in storage. */
export function toSummary(show: ShowSummary): ShowSummary {
  return {
    id: show.id,
    name: show.name,
    image: show.image ? { medium: show.image.medium, original: show.image.original } : null,
    rating: { average: show.rating.average },
    genres: [...show.genres],
    premiered: show.premiered,
  };
}

function isFavoriteShow(value: unknown): value is FavoriteShow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<FavoriteShow>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.genres) &&
    typeof candidate.rating === 'object' &&
    typeof candidate.addedAt === 'string'
  );
}

/**
 * Signal-based favorites store persisted in localStorage.
 * Writes are synchronous with every mutation and other tabs are kept in sync via the
 * `storage` event.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly now = inject(CLOCK);
  private readonly state = signal<readonly FavoriteShow[]>(this.read());

  /** Most recently added first. */
  readonly favorites = this.state.asReadonly();
  readonly count = computed(() => this.state().length);
  readonly ids = computed(() => new Set(this.state().map((show) => show.id)));

  constructor() {
    const window = inject(DOCUMENT).defaultView;
    if (window) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === FAVORITES_STORAGE_KEY) {
          this.state.set(this.read());
        }
      };
      window.addEventListener('storage', onStorage);
      inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
    }
  }

  isFavorite(id: number): boolean {
    return this.ids().has(id);
  }

  add(show: ShowSummary): void {
    if (this.isFavorite(show.id)) {
      return;
    }
    const favorite: FavoriteShow = { ...toSummary(show), addedAt: this.now().toISOString() };
    this.commit([favorite, ...this.state()]);
  }

  remove(id: number): void {
    this.commit(this.state().filter((show) => show.id !== id));
  }

  /** Returns the new favorite state. */
  toggle(show: ShowSummary): boolean {
    if (this.isFavorite(show.id)) {
      this.remove(show.id);
      return false;
    }
    this.add(show);
    return true;
  }

  clear(): void {
    this.commit([]);
  }

  private commit(next: readonly FavoriteShow[]): void {
    this.state.set(next);
    try {
      this.storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota exceeded or storage disabled: keep working in memory.
    }
  }

  private read(): FavoriteShow[] {
    try {
      const raw = this.storage.getItem(FAVORITES_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isFavoriteShow) : [];
    } catch {
      return [];
    }
  }
}
