import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';

import { toErrorKey } from '../../../../core/http/api-error';
import { CLOCK } from '../../../../core/time/clock.token';
import { StateMessageComponent } from '../../../../shared/components/state-message/state-message.component';
import { ScheduleSlotComponent } from '../../components/schedule-slot/schedule-slot.component';
import {
  DEFAULT_COUNTRY,
  SCHEDULE_COUNTRIES,
  ScheduleService,
  ScheduleSlot,
  isIsoDate,
  isSupportedCountry,
  toIsoDate,
} from '../../data-access/schedule.service';

type ScheduleState =
  | { status: 'loading' }
  | { status: 'loaded'; slots: ScheduleSlot[]; total: number }
  | { status: 'error'; messageKey: string };

@Component({
  selector: 'app-schedule-page',
  imports: [TranslocoPipe, DatePipe, StateMessageComponent, ScheduleSlotComponent],
  templateUrl: './schedule-page.component.html',
  styleUrl: './schedule-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePageComponent {
  private readonly schedule = inject(ScheduleService);
  private readonly router = inject(Router);
  private readonly now = inject(CLOCK);
  private readonly reload = new Subject<void>();

  /** `?pais=BR` and `?data=2026-02-21`, bound through `withComponentInputBinding()`. */
  readonly pais = input<string>();
  readonly data = input<string>();

  protected readonly countries = SCHEDULE_COUNTRIES;
  protected readonly today = toIsoDate(this.now());

  protected readonly country = computed(() => {
    const code = this.pais()?.toUpperCase();
    return isSupportedCountry(code) ? code : DEFAULT_COUNTRY;
  });
  protected readonly date = computed(() => {
    const value = this.data();
    return isIsoDate(value) ? value : this.today;
  });
  protected readonly isToday = computed(() => this.date() === this.today);
  protected readonly countryName = computed(
    () => this.countries.find((c) => c.code === this.country())?.name ?? this.country(),
  );

  protected readonly state = toSignal(
    combineLatest([toObservable(this.country), toObservable(this.date)]).pipe(
      switchMap(([country, date]) =>
        this.reload.pipe(
          startWith(undefined),
          switchMap(() =>
            this.schedule.slots(country, date).pipe(
              map(
                (slots): ScheduleState => ({
                  status: 'loaded',
                  slots,
                  total: slots.reduce((sum, slot) => sum + slot.episodes.length, 0),
                }),
              ),
              startWith<ScheduleState>({ status: 'loading' }),
              catchError((error: unknown) =>
                of<ScheduleState>({ status: 'error', messageKey: toErrorKey(error) }),
              ),
            ),
          ),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as ScheduleState },
  );

  protected onCountryChange(event: Event): void {
    this.updateQuery({ pais: (event.target as HTMLSelectElement).value });
  }

  protected onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (isIsoDate(value)) {
      this.updateQuery({ data: value });
    }
  }

  protected shiftDay(offset: number): void {
    const [year, month, day] = this.date().split('-').map(Number);
    this.updateQuery({ data: toIsoDate(new Date(year, month - 1, day + offset)) });
  }

  protected goToToday(): void {
    this.updateQuery({ data: null });
  }

  protected retry(): void {
    this.reload.next();
  }

  /** Airtime already passed (only meaningful when looking at today). */
  protected isPast(slot: ScheduleSlot): boolean {
    const stamp = slot.episodes[0]?.airstamp;
    return this.isToday() && !!stamp && Date.parse(stamp) < this.now().getTime();
  }

  private updateQuery(params: Record<string, string | null>): void {
    void this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
