import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Catálogo',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'buscar',
    title: 'Buscar',
    loadComponent: () => import('./features/search/search-page').then((m) => m.SearchPage),
  },
  {
    path: '**',
    title: 'Página não encontrada',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
