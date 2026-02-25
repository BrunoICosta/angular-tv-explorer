import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ScheduleEpisode } from '../../../../core/models/tvmaze.model';
import { FavoriteButtonComponent } from '../../../../shared/components/favorite-button/favorite-button.component';
import { ScheduleSlot } from '../../data-access/schedule.service';

@Component({
  selector: 'app-schedule-slot',
  imports: [NgOptimizedImage, RouterLink, FavoriteButtonComponent],
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

  protected episodeCode(episode: ScheduleEpisode): string {
    const season = `T${episode.season}`;
    return episode.number === null ? `${season} · Especial` : `${season}E${episode.number}`;
  }

  protected channel(episode: ScheduleEpisode): string | null {
    return episode.show.network?.name ?? episode.show.webChannel?.name ?? null;
  }
}
