import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ScheduleEpisode } from '../../../../core/models/tvmaze.model';
import { FavoriteButtonComponent } from '../../../../shared/components/favorite-button/favorite-button.component';
import { ScheduleSlot } from '../../data-access/schedule.service';

@Component({
  selector: 'app-schedule-slot',
  imports: [NgOptimizedImage, RouterLink, TranslocoPipe, FavoriteButtonComponent],
  templateUrl: './schedule-slot.component.html',
  styleUrl: './schedule-slot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.past]': 'past()',
  },
})
export class ScheduleSlotComponent {
  readonly slot = input.required<ScheduleSlot>();
  readonly past = input(false);

  /** `T1E5` / `S1E5`, or the "special" variant when the episode has no number. */
  protected episodeCodeKey(episode: ScheduleEpisode): string {
    return episode.number === null ? 'schedule.specialCode' : 'schedule.episodeCode';
  }

  protected channel(episode: ScheduleEpisode): string | null {
    return episode.show.network?.name ?? episode.show.webChannel?.name ?? null;
  }
}
