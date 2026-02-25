import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { CastMember } from '../../../../core/models/tvmaze.model';

const INITIAL_VISIBLE = 12;

@Component({
  selector: 'app-cast-list',
  imports: [NgOptimizedImage],
  templateUrl: './cast-list.component.html',
  styleUrl: './cast-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CastListComponent {
  readonly cast = input.required<readonly CastMember[]>();

  private readonly showAll = signal(false);

  protected readonly visibleCast = computed(() =>
    this.showAll() ? this.cast() : this.cast().slice(0, INITIAL_VISIBLE),
  );
  protected readonly hiddenCount = computed(() => this.cast().length - this.visibleCast().length);

  protected expand(): void {
    this.showAll.set(true);
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}
