import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ShowCardComponent } from '../../../../shared/components/show-card/show-card.component';
import { ShowFiltersComponent } from '../../../../shared/components/show-filters/show-filters.component';
import { ShowGridSkeletonComponent } from '../../../../shared/components/show-grid-skeleton/show-grid-skeleton.component';
import { StateMessageComponent } from '../../../../shared/components/state-message/state-message.component';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';
import { CatalogStore } from '../../data-access/catalog.store';

@Component({
  selector: 'app-catalog-page',
  imports: [
    TranslocoPipe,
    ShowCardComponent,
    ShowGridSkeletonComponent,
    StateMessageComponent,
    InfiniteScrollDirective,
    ShowFiltersComponent,
  ],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPageComponent {
  protected readonly store = inject(CatalogStore);

  constructor() {
    this.store.init();
  }
}
