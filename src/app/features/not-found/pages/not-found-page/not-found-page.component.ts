import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslocoPipe],
  template: `
    <section class="container page not-found">
      <p class="eyebrow">{{ 'notFound.eyebrow' | transloco }}</p>
      <h1>{{ 'notFound.title' | transloco }}</h1>
      <p>{{ 'notFound.description' | transloco }}</p>
      <a class="btn btn--primary" routerLink="/">{{ 'common.backToCatalog' | transloco }}</a>
    </section>
  `,
  styles: `
    .not-found {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      padding-block: var(--space-7);
      text-align: center;

      h1 {
        font-size: var(--text-3xl);
      }

      p:not(.eyebrow) {
        color: var(--color-text-muted);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {}
