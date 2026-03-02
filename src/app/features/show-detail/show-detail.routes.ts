import { Routes } from '@angular/router';

import { SeasonEpisodesService } from './data-access/season-episodes.service';

export const SHOW_DETAIL_ROUTES: Routes = [
  {
    path: ':id',
    providers: [SeasonEpisodesService],
    title: 'titles.showDetail',
    loadComponent: () =>
      import('./pages/show-detail-page/show-detail-page.component').then(
        (m) => m.ShowDetailPageComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: '/' },
];
