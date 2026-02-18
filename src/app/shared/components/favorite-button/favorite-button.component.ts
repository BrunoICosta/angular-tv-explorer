import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { FavoritesStore } from '../../../core/favorites/favorites.store';
import { ShowSummary } from '../../../core/models/tvmaze.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-favorite-button',
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="fav"
      [class.fav--active]="active()"
      [class.fav--compact]="compact()"
      [attr.aria-pressed]="active()"
      [attr.aria-label]="compact() ? label() : null"
      [attr.title]="compact() ? label() : null"
      (click)="toggle($event)"
    >
      <app-icon name="heart" [size]="compact() ? 18 : 20" [filled]="active()" />
      @if (!compact()) {
        <span>{{ active() ? 'Nos favoritos' : 'Favoritar' }}</span>
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
  protected readonly label = computed(() =>
    this.active()
      ? `Remover ${this.show().name} dos favoritos`
      : `Adicionar ${this.show().name} aos favoritos`,
  );

  protected toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.store.toggle(this.show());
  }
}
