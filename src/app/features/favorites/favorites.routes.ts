import { Routes } from '@angular/router';

export const FAVORITES_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.favorites',
    loadComponent: () =>
      import('./pages/favorites-page/favorites-page.component').then(
        (m) => m.FavoritesPageComponent,
      ),
  },
];
