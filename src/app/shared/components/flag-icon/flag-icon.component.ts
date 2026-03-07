import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type FlagCode = 'br' | 'us';

/**
 * Decorative 28x20 country flag drawn inline (flag emoji don't render on Windows).
 * Rounded corners come from the host's `overflow: hidden`, so no clipPath ids can collide.
 */
@Component({
  selector: 'app-flag-icon',
  template: `
    <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true" focusable="false">
      @switch (code()) {
        @case ('br') {
          <rect width="28" height="20" fill="#009C3B" />
          <path d="M14 2.5 25.5 10 14 17.5 2.5 10Z" fill="#FFDF00" />
          <circle cx="14" cy="10" r="4.6" fill="#002776" />
          <path d="M9.6 8.9c3-.9 6.3-.6 8.9 1.1l-.3.9c-2.5-1.6-5.6-1.9-8.4-1.1Z" fill="#fff" />
        }
        @case ('us') {
          <rect width="28" height="20" fill="#fff" />
          <path
            d="M0 0h28M0 3.08h28M0 6.15h28M0 9.23h28M0 12.3h28M0 15.38h28M0 18.46h28"
            stroke="#B22234"
            stroke-width="1.54"
            transform="translate(0 .77)"
          />
          <rect width="12" height="10.77" fill="#3C3B6E" />
          <g fill="#fff">
            @for (star of stars; track $index) {
              <circle [attr.cx]="star[0]" [attr.cy]="star[1]" r=".6" />
            }
          </g>
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      overflow: hidden;
      border-radius: 3px;
      box-shadow: 0 0 0 1px rgb(255 255 255 / 12%);
      line-height: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagIconComponent {
  readonly code = input.required<FlagCode>();

  /** Simplified 14-star canton (4 rows, alternating offsets). */
  protected readonly stars: readonly (readonly [number, number])[] = [2, 4, 6, 8].flatMap(
    (cy, row) => (row % 2 === 0 ? [2, 5, 8, 11] : [3.5, 6.5, 9.5]).map((cx) => [cx, cy] as const),
  );
}
