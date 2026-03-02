import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  imports: [TranslocoPipe],
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <p>
          {{ 'footer.dataBy' | transloco }}
          <a href="https://www.tvmaze.com/api" target="_blank" rel="noopener">TVMaze</a>
          {{ 'footer.underLicense' | transloco }}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener"
            >CC BY-SA 4.0</a
          >.
        </p>
        <p>
          {{ 'footer.madeBy' | transloco }}
          <a href="https://github.com/BrunoICosta" target="_blank" rel="noopener"
            >Bruno Vinicius Isaac Costa</a
          >
        </p>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      margin-top: auto;
      border-top: 1px solid var(--color-border);
      color: var(--color-text-subtle);
      font-size: var(--text-sm);
    }

    .footer__inner {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--space-2);
      padding-block: var(--space-5);
    }

    a {
      color: var(--color-text-muted);
      text-underline-offset: 3px;

      &:hover {
        color: var(--color-accent);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
