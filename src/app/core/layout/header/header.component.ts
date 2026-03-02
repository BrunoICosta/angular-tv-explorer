import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { FavoritesStore } from '../../favorites/favorites.store';
import { IconComponent, IconName } from '../../../shared/components/icon/icon.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

interface NavItem {
  labelKey: string;
  path: string;
  icon: IconName;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe, IconComponent, LanguageSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly favoritesCount = inject(FavoritesStore).count;

  protected readonly navItems: readonly NavItem[] = [
    { labelKey: 'nav.catalog', path: '/', icon: 'grid', exact: true },
    { labelKey: 'nav.search', path: '/buscar', icon: 'search', exact: false },
    { labelKey: 'nav.schedule', path: '/agenda', icon: 'calendar', exact: false },
    { labelKey: 'nav.favorites', path: '/favoritos', icon: 'heart', exact: false },
  ];
}
