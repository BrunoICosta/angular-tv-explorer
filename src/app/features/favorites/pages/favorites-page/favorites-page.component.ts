import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { FavoritesStore } from '../../../../core/favorites/favorites.store';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ShowCardComponent } from '../../../../shared/components/show-card/show-card.component';
import { ShowFiltersComponent } from '../../../../shared/components/show-filters/show-filters.component';
import {
  ShowSort,
  collectGenres,
  filterByGenre,
  sortShows,
} from '../../../../shared/utils/show-utils';

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink, TranslocoPipe, IconComponent, ShowCardComponent, ShowFiltersComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {
  private readonly store = inject(FavoritesStore);

  protected readonly favorites = this.store.favorites;
  protected readonly genre = signal<string | null>(null);
  protected readonly sort = signal<ShowSort>('default');
  protected readonly confirmingClear = signal(false);

  protected readonly genres = computed(() => collectGenres(this.favorites()));
  protected readonly visible = computed(() =>
    sortShows(filterByGenre(this.favorites(), this.genre()), this.sort()),
  );

  protected requestClear(): void {
    this.confirmingClear.set(true);
  }

  protected cancelClear(): void {
    this.confirmingClear.set(false);
  }

  protected confirmClear(): void {
    this.store.clear();
    this.genre.set(null);
    this.confirmingClear.set(false);
  }
}
