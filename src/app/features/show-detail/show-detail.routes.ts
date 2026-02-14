import { Routes } from '@angular/router';

export const SHOW_DETAIL_ROUTES: Routes = [
  {
    path: ':id',
    title: 'Detalhes da série',
    loadComponent: () =>
      import('./pages/show-detail-page/show-detail-page.component').then(
        (m) => m.ShowDetailPageComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: '/' },
];
