import { DOCUMENT, InjectionToken, inject } from '@angular/core';

/** In-memory `Storage` used when localStorage is unavailable (private mode, SSR, tests). */
export class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

export const BROWSER_STORAGE = new InjectionToken<Storage>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      const storage = inject(DOCUMENT).defaultView?.localStorage;
      if (storage) {
        const probe = '__tv-explorer-probe__';
        storage.setItem(probe, probe);
        storage.removeItem(probe);
        return storage;
      }
    } catch {
      // Access can throw (e.g. blocked cookies); fall back to memory below.
    }
    return new MemoryStorage();
  },
});
