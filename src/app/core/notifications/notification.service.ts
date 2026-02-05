import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'error' | 'info';

export interface AppNotification {
  id: number;
  kind: NotificationKind;
  message: string;
}

const AUTO_DISMISS_MS = 5000;

/** Small signal-based toast queue. Identical messages are collapsed to avoid spam. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly items = signal<AppNotification[]>([]);
  private nextId = 1;

  readonly notifications = this.items.asReadonly();

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  private push(kind: NotificationKind, message: string): void {
    if (this.items().some((item) => item.message === message)) {
      return;
    }
    const id = this.nextId++;
    this.items.update((items) => [...items, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
