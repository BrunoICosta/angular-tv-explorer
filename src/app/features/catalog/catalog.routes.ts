import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { CatalogStore } from './data-access/catalog.store';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.catalog',
    providers: [provideTranslocoScope('catalog'), CatalogStore],
    loadComponent: () =>
      import('./pages/catalog-page/catalog-page.component').then((m) => m.CatalogPageComponent),
  },
];
