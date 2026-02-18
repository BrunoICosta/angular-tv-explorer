import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { FavoritesStore } from '../../favorites/favorites.store';
import { IconComponent, IconName } from '../../../shared/components/icon/icon.component';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly favoritesCount = inject(FavoritesStore).count;

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Catálogo', path: '/', icon: 'grid', exact: true },
    { label: 'Buscar', path: '/buscar', icon: 'search', exact: false },
    { label: 'Agenda', path: '/agenda', icon: 'calendar', exact: false },
    { label: 'Favoritos', path: '/favoritos', icon: 'heart', exact: false },
  ];
}
