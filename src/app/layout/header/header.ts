import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Icon, IconName } from '../../shared/components/icon/icon';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly navItems: readonly NavItem[] = [
    { label: 'Catálogo', path: '/', icon: 'grid', exact: true },
    { label: 'Buscar', path: '/buscar', icon: 'search', exact: false },
    { label: 'Agenda', path: '/agenda', icon: 'calendar', exact: false },
    { label: 'Favoritos', path: '/favoritos', icon: 'heart', exact: false },
  ];
}
