import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../../../../core/i18n/language.service';
import { ShowDetails } from '../../../../core/models/tvmaze.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RatingComponent } from '../../../../shared/components/rating/rating.component';
import { ApiLabelPipe } from '../../../../shared/pipes/api-label.pipe';
import { GenreLabelPipe } from '../../../../shared/pipes/genre-label.pipe';
import { SanitizeHtmlPipe } from '../../../../shared/pipes/sanitize-html.pipe';
import { yearOf } from '../../../../shared/utils/show-utils';

/** TVMaze weekday names → index used to build localized short names (2024-01-01 is a Monday). */
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function weekdayLabel(day: string, locale: string): string {
  const index = WEEKDAYS.indexOf(day);
  if (index < 0) {
    return day;
  }
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 1 + index));
}

@Component({
  selector: 'app-show-hero',
  imports: [
    NgOptimizedImage,
    TranslocoPipe,
    IconComponent,
    RatingComponent,
    ApiLabelPipe,
    GenreLabelPipe,
    SanitizeHtmlPipe,
  ],
  templateUrl: './show-hero.component.html',
  styleUrl: './show-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowHeroComponent {
  private readonly locale = inject(LanguageService).locale;

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

  protected readonly channel = computed(
    () => this.show().network?.name ?? this.show().webChannel?.name ?? null,
  );

  protected readonly airs = computed(() => {
    const { days, time } = this.show().schedule;
    if (!days.length) {
      return null;
    }
    const locale = this.locale();
    const dayList = days.map((day) => weekdayLabel(day, locale)).join(', ');
    return time ? `${dayList} · ${time}` : dayList;
  });

  protected readonly runtime = computed(
    () => this.show().runtime ?? this.show().averageRuntime ?? null,
  );
}
