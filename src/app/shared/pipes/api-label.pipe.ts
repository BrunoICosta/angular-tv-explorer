import { ChangeDetectorRef, Pipe, PipeTransform, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { filter, merge } from 'rxjs';

/**
 * Translates a known enum value returned by the API (`'Ended' | apiLabel: 'detail.status'`
 * → "Finalizada" / "Ended"). Values without a translation are shown as the API returns them.
 *
 * Impure like Transloco's own pipe; it marks the host for check when the language changes or a
 * lazy scope finishes loading, so OnPush views stay in sync.
 */
@Pipe({ name: 'apiLabel', pure: false })
export class ApiLabelPipe implements PipeTransform {
  protected readonly transloco = inject(TranslocoService);

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    merge(
      this.transloco.langChanges$,
      this.transloco.events$.pipe(filter((event) => event.type === 'translationLoadSuccess')),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => cdr.markForCheck());
  }

  transform(value: string | null | undefined, prefix: string): string {
    if (!value) {
      return '';
    }
    const key = `${prefix}.${value}`;
    const label = this.transloco.translate(key);
    return label && label !== key ? label : value;
  }
}
