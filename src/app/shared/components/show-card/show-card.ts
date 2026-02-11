import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ShowSummary } from '../../../core/models/tvmaze.models';
import { yearOf } from '../../utils/show-utils';
import { GenreLabelPipe } from '../../pipes/genre-label.pipe';
import { Rating } from '../rating/rating';

@Component({
  selector: 'app-show-card',
  imports: [RouterLink, Rating, GenreLabelPipe],
  templateUrl: './show-card.html',
  styleUrl: './show-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowCard {
  readonly show = input.required<ShowSummary>();

  protected readonly year = computed(() => yearOf(this.show().premiered));
  protected readonly genres = computed(() => this.show().genres.slice(0, 2));
  protected readonly initials = computed(() =>
    this.show()
      .name.split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase(),
  );
}
