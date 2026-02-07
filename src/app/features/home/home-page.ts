import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  template: `
    <section class="container page">
      <header class="page-header">
        <p class="eyebrow">Catálogo</p>
        <h1>Descubra sua próxima série</h1>
        <p>Milhares de séries do catálogo da TVMaze, carregadas conforme você rola.</p>
      </header>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
