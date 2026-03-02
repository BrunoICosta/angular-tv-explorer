import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { FavoritesStore } from '../../../core/favorites/favorites.store';
import { ShowSummary } from '../../../core/models/tvmaze.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-favorite-button',
  imports: [IconComponent, TranslocoPipe],
  template: `
    @let label = labelKey() | transloco: { name: show().name };
    <button
      type="button"
      class="fav"
      [class.fav--active]="active()"
      [class.fav--compact]="compact()"
      [attr.aria-pressed]="active()"
      [attr.aria-label]="compact() ? label : null"
      [attr.title]="compact() ? label : null"
      (click)="toggle($event)"
    >
      <app-icon name="heart" [size]="compact() ? 18 : 20" [filled]="active()" />
      @if (!compact()) {
        <span>{{ (active() ? 'favorite.active' : 'favorite.inactive') | transloco }}</span>
      }
    </button>
  `,
  styleUrl: './favorite-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteButtonComponent {
  private readonly store = inject(FavoritesStore);

  readonly show = input.required<ShowSummary>();
  /** Icon-only round button, used on top of posters. */
  readonly compact = input(false);

  protected readonly active = computed(() => this.store.ids().has(this.show().id));
  protected readonly labelKey = computed(() =>
    this.active() ? 'favorite.remove' : 'favorite.add',
  );

  protected toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.store.toggle(this.show());
  }
}
