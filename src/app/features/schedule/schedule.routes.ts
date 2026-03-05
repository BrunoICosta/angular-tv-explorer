import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { ScheduleService } from './data-access/schedule.service';

export const SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.schedule',
    providers: [provideTranslocoScope('schedule'), ScheduleService],
    loadComponent: () =>
      import('./pages/schedule-page/schedule-page.component').then((m) => m.SchedulePageComponent),
  },
];
