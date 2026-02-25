import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ShowDetails } from '../../../../core/models/tvmaze.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RatingComponent } from '../../../../shared/components/rating/rating.component';
import { GenreLabelPipe } from '../../../../shared/pipes/genre-label.pipe';
import { SanitizeHtmlPipe } from '../../../../shared/pipes/sanitize-html.pipe';
import { yearOf } from '../../../../shared/utils/show-utils';

const STATUS_LABELS: Readonly<Record<string, string>> = {
  Running: 'Em exibição',
  Ended: 'Finalizada',
  'To Be Determined': 'A definir',
  'In Development': 'Em desenvolvimento',
};

const DAY_LABELS: Readonly<Record<string, string>> = {
  Monday: 'seg',
  Tuesday: 'ter',
  Wednesday: 'qua',
  Thursday: 'qui',
  Friday: 'sex',
  Saturday: 'sáb',
  Sunday: 'dom',
};

@Component({
  selector: 'app-show-hero',
  imports: [NgOptimizedImage, IconComponent, RatingComponent, GenreLabelPipe, SanitizeHtmlPipe],
  templateUrl: './show-hero.component.html',
  styleUrl: './show-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowHeroComponent {
  readonly show = input.required<ShowDetails>();

  protected readonly years = computed(() => {
    const { premiered, ended } = this.show();
    const start = yearOf(premiered);
    const end = yearOf(ended);
    if (!start) {
      return null;
    }
    return end && end !== start ? `${start}–${end}` : start;
  });

  protected readonly statusLabel = computed(
    () => STATUS_LABELS[this.show().status] ?? this.show().status,
  );

  protected readonly channel = computed(
    () => this.show().network?.name ?? this.show().webChannel?.name ?? null,
  );

  protected readonly airs = computed(() => {
    const { days, time } = this.show().schedule;
    if (!days.length) {
      return null;
    }
    const dayList = days.map((day) => DAY_LABELS[day] ?? day).join(', ');
    return time ? `${dayList} · ${time}` : dayList;
  });

  protected readonly runtime = computed(
    () => this.show().runtime ?? this.show().averageRuntime ?? null,
  );
}
