import { ScheduleEpisode } from '../../../core/models/tvmaze.model';
import { groupByTime, isIsoDate, isSupportedCountry, toIsoDate } from './schedule.service';

function episode(id: number, airtime: string): ScheduleEpisode {
  return { id, airtime } as ScheduleEpisode;
}

describe('schedule helpers', () => {
  it('groups episodes by airtime in chronological order, unknown times last', () => {
    const slots = groupByTime([
      episode(1, '21:00'),
      episode(2, ''),
      episode(3, '08:30'),
      episode(4, '21:00'),
    ]);

    expect(slots.map((slot) => slot.time)).toEqual(['08:30', '21:00', '']);
    expect(slots[1].episodes.map((e) => e.id)).toEqual([1, 4]);
  });

  it('formats local dates as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 1, 5, 23, 59))).toBe('2026-02-05');
  });

  it('validates ISO dates', () => {
    expect(isIsoDate('2026-02-21')).toBeTrue();
    expect(isIsoDate('21/02/2026')).toBeFalse();
    expect(isIsoDate(undefined)).toBeFalse();
  });

  it('only accepts listed countries', () => {
    expect(isSupportedCountry('BR')).toBeTrue();
    expect(isSupportedCountry('XX')).toBeFalse();
  });
});
