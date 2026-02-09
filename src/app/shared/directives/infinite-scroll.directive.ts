import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  NgZone,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';

/**
 * Emits `appInfiniteScroll` whenever the host element (a sentinel placed after a list)
 * enters the viewport. While `infiniteScrollDisabled` is true nothing is emitted; once it
 * flips back to false the sentinel is re-checked, so short pages keep loading until the
 * viewport is filled.
 */
@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScrollDirective {
  readonly infiniteScrollDisabled = input(false);
  /** Distance from the viewport at which loading starts. */
  readonly infiniteScrollMargin = input('600px');

  readonly appInfiniteScroll = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly injector = inject(Injector);
  private observer: IntersectionObserver | null = null;

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }
      this.observer = new IntersectionObserver((entries) => this.onIntersection(entries), {
        rootMargin: `0px 0px ${this.infiniteScrollMargin()} 0px`,
      });
      this.observer.observe(this.host.nativeElement);
    });

    effect(() => {
      if (!this.infiniteScrollDisabled()) {
        untracked(() => this.recheck());
      }
    });

    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  private onIntersection(entries: IntersectionObserverEntry[]): void {
    const visible = entries.some((entry) => entry.isIntersecting);
    if (!visible || this.infiniteScrollDisabled()) {
      return;
    }
    this.zone.run(() => this.appInfiniteScroll.emit());
    this.recheck();
  }

  /** Re-observing makes the observer report the current intersection state again. */
  private recheck(): void {
    afterNextRender(
      () => {
        if (!this.observer) {
          return;
        }
        this.observer.unobserve(this.host.nativeElement);
        this.observer.observe(this.host.nativeElement);
      },
      { injector: this.injector },
    );
  }
}
