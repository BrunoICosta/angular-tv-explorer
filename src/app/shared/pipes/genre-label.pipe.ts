import { ChangeDetectorRef, Pipe, PipeTransform, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Translates a TVMaze genre (`Science-Fiction` → "Ficção científica" / "Science fiction").
 * Unknown genres are shown as the API returns them. Impure like Transloco's own pipe, and it
 * marks the host for check on language changes so OnPush views update.
 */
@Pipe({ name: 'genreLabel', pure: false })
export class GenreLabelPipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    this.transloco.langChanges$.pipe(takeUntilDestroyed()).subscribe(() => cdr.markForCheck());
  }

  transform(genre: string): string {
    const key = `genres.${genre}`;
    const label = this.transloco.translate(key);
    return label && label !== key ? label : genre;
  }
}
