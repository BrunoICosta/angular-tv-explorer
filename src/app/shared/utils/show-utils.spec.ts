import { ShowSummary } from '../../core/models/tvmaze.model';
import { collectGenres, filterByGenre, sortShows, stripHtml, yearOf } from './show-utils';

function show(
  id: number,
  rating: number | null,
  genres: string[] = [],
  name = `S${id}`,
): ShowSummary {
  return { id, name, rating: { average: rating }, genres, image: null, premiered: null };
}

describe('show-utils', () => {
  const shows = [
    show(1, 7.5, ['Drama'], 'Beta'),
    show(2, null, ['Comedy'], 'alpha'),
    show(3, 9.1, ['Drama', 'Crime'], 'Gamma'),
    show(4, 6, ['Comedy', 'Drama'], 'Ágata'),
  ];

  describe('sortShows', () => {
    it('keeps the original order by default (and returns a copy)', () => {
      const result = sortShows(shows, 'default');
      expect(result.map((s) => s.id)).toEqual([1, 2, 3, 4]);
      expect(result).not.toBe(shows);
    });

    it('sorts by rating descending with unrated shows last', () => {
      expect(sortShows(shows, 'rating-desc').map((s) => s.id)).toEqual([3, 1, 4, 2]);
    });

    it('sorts by rating ascending with unrated shows last', () => {
      expect(sortShows(shows, 'rating-asc').map((s) => s.id)).toEqual([4, 1, 3, 2]);
    });

    it('sorts by name using pt-BR collation', () => {
      expect(sortShows(shows, 'name').map((s) => s.name)).toEqual([
        'Ágata',
        'alpha',
        'Beta',
        'Gamma',
      ]);
    });
  });

  it('filters by genre', () => {
    expect(filterByGenre(shows, 'Drama').map((s) => s.id)).toEqual([1, 3, 4]);
    expect(filterByGenre(shows, null).length).toBe(4);
  });

  it('collects unique genres alphabetically', () => {
    expect(collectGenres(shows)).toEqual(['Comedy', 'Crime', 'Drama']);
  });

  it('extracts the year from a date', () => {
    expect(yearOf('2013-06-24')).toBe('2013');
    expect(yearOf(null)).toBeNull();
    expect(yearOf('soon')).toBeNull();
  });

  it('strips html into plain text', () => {
    expect(stripHtml('<p><b>Dark</b> is&nbsp;a &amp; show</p>')).toBe('Dark is a & show');
    expect(stripHtml('<p>Hi<script>alert(1)</script></p>')).toBe('Hi');
    expect(stripHtml(null)).toBe('');
  });
});
