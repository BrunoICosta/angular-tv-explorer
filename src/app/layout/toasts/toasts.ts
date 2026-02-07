import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationService } from '../../core/notifications/notification.service';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  template: `
    <div class="toasts" role="status" aria-live="polite">
      @for (toast of notifications.notifications(); track toast.id) {
        <div class="toast" [class.toast--error]="toast.kind === 'error'">
          <p>{{ toast.message }}</p>
          <button
            type="button"
            class="toast__close"
            aria-label="Fechar aviso"
            (click)="notifications.dismiss(toast.id)"
          >
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      right: var(--space-4);
      bottom: var(--space-4);
      left: var(--space-4);
      z-index: 50;
      display: grid;
      justify-items: end;
      gap: var(--space-2);
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      max-width: 420px;
      padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
      border: 1px solid var(--color-border-strong);
      border-left: 4px solid var(--color-violet);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);
      box-shadow: var(--shadow-card);
      font-size: var(--text-sm);
      pointer-events: auto;
      animation: slide-in 200ms ease-out;

      &--error {
        border-left-color: var(--color-danger);
      }
    }

    .toast__close {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: var(--radius-pill);
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;

      &:hover {
        background: var(--color-surface);
        color: var(--color-text);
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toasts {
  protected readonly notifications = inject(NotificationService);
}
