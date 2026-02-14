import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconComponent, IconName } from '../icon/icon.component';

/** Empty / error placeholder with an optional action button. */
@Component({
  selector: 'app-state-message',
  imports: [IconComponent],
  template: `
    <div class="state" [class.state--error]="variant() === 'error'" [attr.role]="role()">
      <span class="state__icon"><app-icon [name]="icon()" [size]="28" /></span>
      <h2 class="state__title">{{ title() }}</h2>
      @if (description()) {
        <p class="state__description">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <button type="button" class="btn btn--primary" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .state {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      padding: var(--space-7) var(--space-4);
      border: 1px dashed var(--color-border-strong);
      border-radius: var(--radius-lg);
      background: rgb(21 25 36 / 50%);
      text-align: center;
    }

    .state__icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: var(--radius-pill);
      background: var(--color-accent-soft);
      color: var(--color-accent);
    }

    .state--error .state__icon {
      background: rgb(255 107 107 / 14%);
      color: var(--color-danger);
    }

    .state__title {
      font-size: var(--text-xl);
    }

    .state__description {
      max-width: 48ch;
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateMessageComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<IconName>('tv');
  readonly variant = input<'empty' | 'error'>('empty');
  readonly actionLabel = input<string>();

  readonly action = output<void>();

  protected role(): string | null {
    return this.variant() === 'error' ? 'alert' : null;
  }
}
