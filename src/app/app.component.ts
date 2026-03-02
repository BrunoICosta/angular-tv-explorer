import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { ToastsComponent } from './core/layout/toasts/toasts.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslocoPipe, HeaderComponent, FooterComponent, ToastsComponent],
  template: `
    <a class="skip-link" href="#main-content">{{ 'shell.skipLink' | transloco }}</a>
    <app-header />
    <main id="main-content" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
    <app-toasts />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }

    main {
      flex: 1;
      outline: none;
    }

    .skip-link {
      position: absolute;
      top: var(--space-2);
      left: var(--space-2);
      z-index: 100;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      color: var(--color-accent-contrast);
      font-weight: 600;
      transform: translateY(-200%);

      &:focus {
        transform: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
