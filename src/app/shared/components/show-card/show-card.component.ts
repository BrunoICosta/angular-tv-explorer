import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ShowSummary } from '../../../core/models/tvmaze.model';
import { yearOf } from '../../utils/show-utils';
import { GenreLabelPipe } from '../../pipes/genre-label.pipe';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-show-card',
  imports: [
    NgOptimizedImage,
    RouterLink,
    TranslocoPipe,
    RatingComponent,
    GenreLabelPipe,
    FavoriteButtonComponent,
  ],
  templateUrl: './show-card.component.html',
  styleUrl: './show-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowCardComponent {
  readonly show = input.required<ShowSummary>();
  /** Set for above-the-fold cards so the LCP image is not lazy loaded. */
  readonly priority = input(false);

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
