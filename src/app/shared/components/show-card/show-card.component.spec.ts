import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BROWSER_STORAGE, MemoryStorage } from '../../../core/storage/browser-storage.token';
import { FavoritesStore } from '../../../core/favorites/favorites.store';
import { ShowSummary } from '../../../core/models/tvmaze.model';
import { provideTranslocoTesting } from '../../../../testing/transloco-testing';
import { ShowCardComponent } from './show-card.component';

const show: ShowSummary = {
  id: 169,
  name: 'Breaking Bad',
  image: { medium: 'https://static.tvmaze.com/bb.jpg', original: '' },
  rating: { average: 9.2 },
  genres: ['Drama', 'Crime', 'Thriller'],
  premiered: '2008-01-20',
};

describe('ShowCardComponent', () => {
  let fixture: ComponentFixture<ShowCardComponent>;
  let element: HTMLElement;

  function render(value: ShowSummary): void {
    fixture.componentRef.setInput('show', value);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShowCardComponent],
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: BROWSER_STORAGE, useValue: new MemoryStorage() },
      ],
    });
    fixture = TestBed.createComponent(ShowCardComponent);
    element = fixture.nativeElement;
  });

  it('renders title, year, translated genres and a link to the detail page', () => {
    render(show);

    expect(element.querySelector('h3')?.textContent).toContain('Breaking Bad');
    const meta = element.querySelector('.card__meta')?.textContent ?? '';
    expect(meta).toContain('2008');
    expect(meta).toContain('Drama');
    expect(meta).toContain('Crime');
    expect(meta).not.toContain('Suspense');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/series/169');
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Pôster de Breaking Bad');
  });

  it('falls back to initials when there is no poster', () => {
    render({ ...show, image: null });

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.card__placeholder')?.textContent?.trim()).toBe('BB');
  });

  it('toggles the show in favorites without navigating', () => {
    render(show);
    const button = element.querySelector<HTMLButtonElement>('.fav')!;

    button.click();
    fixture.detectChanges();

    expect(TestBed.inject(FavoritesStore).isFavorite(169)).toBeTrue();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Remover Breaking Bad dos favoritos');
  });
});
