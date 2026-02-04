import { InjectionToken } from '@angular/core';

export const TVMAZE_API_URL = new InjectionToken<string>('TVMAZE_API_URL', {
  providedIn: 'root',
  factory: () => 'https://api.tvmaze.com',
});
