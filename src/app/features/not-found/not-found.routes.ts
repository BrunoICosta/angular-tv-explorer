import { Routes } from '@angular/router';

export const NOT_FOUND_ROUTES: Routes = [
  {
    path: '',
    title: 'Página não encontrada',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
];
