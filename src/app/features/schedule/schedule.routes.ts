import { Routes } from '@angular/router';

import { ScheduleService } from './data-access/schedule.service';

export const SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.schedule',
    providers: [ScheduleService],
    loadComponent: () =>
      import('./pages/schedule-page/schedule-page.component').then((m) => m.SchedulePageComponent),
  },
];
