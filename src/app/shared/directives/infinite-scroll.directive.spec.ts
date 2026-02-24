import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteScrollDirective } from './infinite-scroll.directive';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.add(element);
  }

  unobserve(element: Element): void {
    this.observed.delete(element);
  }

  disconnect(): void {
    this.observed.clear();
  }

  trigger(isIntersecting: boolean): void {
    const entries = [...this.observed].map(
      (target) => ({ isIntersecting, target }) as IntersectionObserverEntry,
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

@Component({
  imports: [InfiniteScrollDirective],
  template: `<div
    appInfiniteScroll
    [infiniteScrollDisabled]="disabled()"
    (appInfiniteScroll)="hits = hits + 1"
  ></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly disabled = signal(false);
  hits = 0;
}

describe('InfiniteScrollDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let original: typeof IntersectionObserver;

  const observer = () => FakeIntersectionObserver.instances.at(-1)!;

  beforeEach(() => {
    original = window.IntersectionObserver;
    FakeIntersectionObserver.instances = [];
    window.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    window.IntersectionObserver = original;
  });

  it('observes the host element after render', () => {
    expect(observer().observed.size).toBe(1);
  });

  it('emits when the sentinel becomes visible', () => {
    observer().trigger(true);
    expect(fixture.componentInstance.hits).toBe(1);
  });

  it('ignores non-intersecting entries', () => {
    observer().trigger(false);
    expect(fixture.componentInstance.hits).toBe(0);
  });

  it('does not emit while disabled', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    observer().trigger(true);

    expect(fixture.componentInstance.hits).toBe(0);
  });

  it('disconnects on destroy', () => {
    const current = observer();
    fixture.destroy();
    expect(current.observed.size).toBe(0);
  });
});
