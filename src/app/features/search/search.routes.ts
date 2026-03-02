import { Routes } from '@angular/router';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.search',
    loadComponent: () =>
      import('./pages/search-page/search-page.component').then((m) => m.SearchPageComponent),
  },
];
