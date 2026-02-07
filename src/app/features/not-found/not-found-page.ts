import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="container page not-found">
      <p class="eyebrow">Erro 404</p>
      <h1>Essa página saiu do ar</h1>
      <p>O endereço que você tentou acessar não existe ou foi removido.</p>
      <a class="btn btn--primary" routerLink="/">Voltar ao catálogo</a>
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
export class NotFoundPage {}
