import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('search')],
    title: 'titles.search',
    loadComponent: () =>
      import('./pages/search-page/search-page.component').then((m) => m.SearchPageComponent),
  },
];
