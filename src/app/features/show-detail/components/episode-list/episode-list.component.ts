import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { toErrorMessage } from '../../../../core/http/api-error';
import { Episode } from '../../../../core/models/tvmaze.model';
import { RatingComponent } from '../../../../shared/components/rating/rating.component';
import { SanitizeHtmlPipe } from '../../../../shared/pipes/sanitize-html.pipe';
import { SeasonEpisodesService } from '../../data-access/season-episodes.service';

type EpisodesState =
  | { status: 'loading' }
  | { status: 'loaded'; episodes: Episode[] }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-episode-list',
  imports: [DatePipe, RatingComponent, SanitizeHtmlPipe],
  templateUrl: './episode-list.component.html',
  styleUrl: './episode-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpisodeListComponent {
  private readonly episodesService = inject(SeasonEpisodesService);
  private readonly reload = new Subject<void>();

  readonly seasonId = input.required<number>();

  protected readonly state = toSignal(
    toObservable(this.seasonId).pipe(
      switchMap((id) =>
        this.reload.pipe(
          startWith(undefined),
          switchMap(() =>
            this.episodesService.episodes(id).pipe(
              map((episodes): EpisodesState => ({ status: 'loaded', episodes })),
              startWith<EpisodesState>({ status: 'loading' }),
              catchError((error: unknown) => {
                this.episodesService.invalidate(id);
                return of<EpisodesState>({ status: 'error', message: toErrorMessage(error) });
              }),
            ),
          ),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as EpisodesState },
  );

  protected retry(): void {
    this.reload.next();
  }

  protected episodeCode(episode: Episode): string {
    return episode.number === null ? 'Especial' : `E${String(episode.number).padStart(2, '0')}`;
  }
}
