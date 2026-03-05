import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { Season } from '../../../../core/models/tvmaze.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EpisodeListComponent } from '../episode-list/episode-list.component';

/** Accordion of seasons; episodes are only fetched when a season is expanded. */
@Component({
  selector: 'app-season-list',
  imports: [DatePipe, TranslocoPipe, IconComponent, EpisodeListComponent],
  templateUrl: './season-list.component.html',
  styleUrl: './season-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonListComponent {
  readonly seasons = input.required<readonly Season[]>();

  /** Most recent seasons first, which is what people usually look for. */
  protected readonly orderedSeasons = computed(() =>
    [...this.seasons()].sort((a, b) => b.number - a.number),
  );

  /** The latest season starts expanded; resets when another show is loaded. */
  protected readonly expanded = linkedSignal<readonly Season[], ReadonlySet<number>>({
    source: this.orderedSeasons,
    computation: (seasons) => new Set(seasons.length ? [seasons[0].id] : []),
  });

  protected isExpanded(seasonId: number): boolean {
    return this.expanded().has(seasonId);
  }

  protected toggle(seasonId: number): void {
    this.expanded.update((current) => {
      const next = new Set(current);
      if (next.has(seasonId)) {
        next.delete(seasonId);
      } else {
        next.add(seasonId);
      }
      return next;
    });
  }
}
