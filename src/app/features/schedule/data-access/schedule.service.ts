import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { TvmazeApiService } from '../../../core/api/tvmaze-api.service';
import { ScheduleEpisode } from '../../../core/models/tvmaze.model';

export interface ScheduleSlot {
  /** Local airtime in `HH:mm` (empty string when the network did not inform it). */
  time: string;
  episodes: ScheduleEpisode[];
}

export const SCHEDULE_COUNTRIES: readonly { code: string; name: string }[] = [
  { code: 'US', name: 'Estados Unidos' },
  { code: 'BR', name: 'Brasil' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'PT', name: 'Portugal' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'FR', name: 'França' },
  { code: 'JP', name: 'Japão' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'AU', name: 'Austrália' },
];

export const DEFAULT_COUNTRY = 'US';

export function isSupportedCountry(code: string | null | undefined): code is string {
  return !!code && SCHEDULE_COUNTRIES.some((country) => country.code === code);
}

/** Groups episodes by airtime, ordered chronologically, keeping the API order inside a slot. */
export function groupByTime(episodes: readonly ScheduleEpisode[]): ScheduleSlot[] {
  const slots = new Map<string, ScheduleEpisode[]>();
  for (const episode of episodes) {
    const time = episode.airtime ?? '';
    const slot = slots.get(time);
    if (slot) {
      slot.push(episode);
    } else {
      slots.set(time, [episode]);
    }
  }
  return [...slots.entries()]
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
    .map(([time, list]) => ({ time, episodes: list }));
}

/** Local calendar date as `YYYY-MM-DD` (not UTC, so late-night users get the right day). */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isIsoDate(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/** Feature-scoped service (provided in SCHEDULE_ROUTES). */
@Injectable()
export class ScheduleService {
  private readonly api = inject(TvmazeApiService);

  slots(country: string, date: string): Observable<ScheduleSlot[]> {
    return this.api.getSchedule(country, date).pipe(map(groupByTime));
  }
}
