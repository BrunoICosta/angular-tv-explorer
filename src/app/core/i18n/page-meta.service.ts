import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { combineLatest, of, switchMap } from 'rxjs';

/** Fallback before translations load; the visible name comes from the `app.name` key. */
export const APP_NAME = 'TV Explorer';

export function formatTitle(pageTitle?: string | null, appName: string = APP_NAME): string {
  return pageTitle ? `${pageTitle} · ${appName}` : appName;
}

/**
 * Keeps `document.title` and the meta description in the active language.
 * Routes provide translation keys; pages can override them with API content (e.g. a show name).
 */
@Injectable({ providedIn: 'root' })
export class PageMetaService {
  private readonly transloco = inject(TranslocoService);
  private readonly titleKey = signal<string | null>(null);
  private readonly titleOverride = signal<string | null>(null);
  private readonly descriptionOverride = signal<string | null>(null);

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    const destroyRef = inject(DestroyRef);
    const lang$ = this.transloco.langChanges$;

    combineLatest([toObservable(this.titleKey), toObservable(this.titleOverride), lang$])
      .pipe(
        switchMap(([key, override]) =>
          combineLatest([
            override !== null ? of(override) : key ? this.transloco.selectTranslate(key) : of(null),
            this.transloco.selectTranslate('app.name'),
          ]),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(([value, appName]: [string | null, string]) =>
        title.setTitle(formatTitle(value, appName)),
      );

    combineLatest([toObservable(this.descriptionOverride), lang$])
      .pipe(
        switchMap(([override]) =>
          override !== null ? of(override) : this.transloco.selectTranslate('meta.description'),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((content: string) => meta.updateTag({ name: 'description', content }));
  }

  /** Called on every navigation: resets page overrides. */
  setRouteTitle(key: string | null): void {
    this.titleKey.set(key);
    this.titleOverride.set(null);
    this.descriptionOverride.set(null);
  }

  setTitle(title: string | null): void {
    this.titleOverride.set(title);
  }

  setDescription(description: string | null): void {
    this.descriptionOverride.set(description);
  }
}
