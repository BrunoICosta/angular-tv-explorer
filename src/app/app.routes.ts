import { Routes } from '@angular/router';

/** The shell only knows feature entry points; every feature lives in its own lazy chunk. */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
  },
  {
    path: 'buscar',
    loadChildren: () => import('./features/search/search.routes').then((m) => m.SEARCH_ROUTES),
  },
  {
    path: 'series',
    loadChildren: () =>
      import('./features/show-detail/show-detail.routes').then((m) => m.SHOW_DETAIL_ROUTES),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
  },
];
