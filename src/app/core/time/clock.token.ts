import { InjectionToken } from '@angular/core';

/** Current time provider, injectable so tests can freeze "now". */
export const CLOCK = new InjectionToken<() => Date>('CLOCK', {
  providedIn: 'root',
  factory: () => () => new Date(),
});
