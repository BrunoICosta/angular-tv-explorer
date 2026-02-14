import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { TvmazeApiService } from '../../../../core/api/tvmaze-api.service';
import { ApiError, toErrorMessage } from '../../../../core/http/api-error';
import { ShowDetails } from '../../../../core/models/tvmaze.model';
import { formatTitle } from '../../../../core/title/app-title.strategy';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { StateMessageComponent } from '../../../../shared/components/state-message/state-message.component';
import { ShowHeroComponent } from '../../components/show-hero/show-hero.component';

type DetailState =
  | { status: 'loading' }
  | { status: 'loaded'; show: ShowDetails }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-show-detail-page',
  imports: [RouterLink, IconComponent, StateMessageComponent, ShowHeroComponent],
  templateUrl: './show-detail-page.component.html',
  styleUrl: './show-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowDetailPageComponent {
  private readonly api = inject(TvmazeApiService);
  private readonly title = inject(Title);
  private readonly reload = new Subject<void>();

  /** Bound from the `:id` route param through `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.id).pipe(
      map(Number),
      switchMap((id) =>
        this.reload.pipe(
          startWith(undefined),
          switchMap(() => this.load(id)),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as DetailState },
  );

  constructor() {
    effect(() => {
      const state = this.state();
      if (state.status === 'loaded') {
        this.title.setTitle(formatTitle(state.show.name));
      }
    });
  }

  protected retry(): void {
    this.reload.next();
  }

  private load(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      return of<DetailState>({ status: 'not-found' });
    }
    return this.api.getShowDetails(id).pipe(
      map((show): DetailState => ({ status: 'loaded', show })),
      startWith<DetailState>({ status: 'loading' }),
      catchError((error: unknown) =>
        of<DetailState>(
          error instanceof ApiError && error.isNotFound
            ? { status: 'not-found' }
            : { status: 'error', message: toErrorMessage(error) },
        ),
      ),
    );
  }
}
