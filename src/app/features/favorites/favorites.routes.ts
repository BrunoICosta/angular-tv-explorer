import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const FAVORITES_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('favorites')],
    title: 'titles.favorites',
    loadComponent: () =>
      import('./pages/favorites-page/favorites-page.component').then(
        (m) => m.FavoritesPageComponent,
      ),
  },
];
