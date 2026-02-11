import { ShowSummary } from '../../core/models/tvmaze.models';

export type ShowSort = 'default' | 'rating-desc' | 'rating-asc' | 'name';

export const SORT_OPTIONS: readonly { value: ShowSort; label: string }[] = [
  { value: 'default', label: 'Ordem do catálogo' },
  { value: 'rating-desc', label: 'Maior nota' },
  { value: 'rating-asc', label: 'Menor nota' },
  { value: 'name', label: 'Nome (A–Z)' },
];

const GENRE_LABELS: Readonly<Record<string, string>> = {
  Action: 'Ação',
  Adult: 'Adulto',
  Adventure: 'Aventura',
  Anime: 'Anime',
  Children: 'Infantil',
  Comedy: 'Comédia',
  Crime: 'Crime',
  DIY: 'Faça você mesmo',
  Drama: 'Drama',
  Espionage: 'Espionagem',
  Family: 'Família',
  Fantasy: 'Fantasia',
  Food: 'Culinária',
  History: 'História',
  Horror: 'Terror',
  Legal: 'Jurídico',
  Medical: 'Medicina',
  Music: 'Música',
  Mystery: 'Mistério',
  Nature: 'Natureza',
  Romance: 'Romance',
  'Science-Fiction': 'Ficção científica',
  Sports: 'Esportes',
  Supernatural: 'Sobrenatural',
  Thriller: 'Suspense',
  Travel: 'Viagem',
  War: 'Guerra',
  Western: 'Faroeste',
};

/** pt-BR label for a TVMaze genre (falls back to the original name). */
export function genreLabel(genre: string): string {
  return GENRE_LABELS[genre] ?? genre;
}

/** Extracts the 4-digit year from an ISO date (`2013-06-24` → `2013`). */
export function yearOf(date: string | null | undefined): string | null {
  return date && /^\d{4}/.test(date) ? date.slice(0, 4) : null;
}

/** Unique genres present in a list of shows, sorted by their pt-BR label. */
export function collectGenres(shows: readonly ShowSummary[]): string[] {
  const genres = new Set<string>();
  for (const show of shows) {
    show.genres.forEach((genre) => genres.add(genre));
  }
  return [...genres].sort((a, b) => genreLabel(a).localeCompare(genreLabel(b), 'pt-BR'));
}

export function filterByGenre<T extends ShowSummary>(
  shows: readonly T[],
  genre: string | null,
): T[] {
  return genre ? shows.filter((show) => show.genres.includes(genre)) : [...shows];
}

/** Returns a sorted copy. Shows without a rating always go last. */
export function sortShows<T extends ShowSummary>(shows: readonly T[], sort: ShowSort): T[] {
  const copy = [...shows];
  switch (sort) {
    case 'rating-desc':
      return copy.sort((a, b) => compareRatings(a, b, -1));
    case 'rating-asc':
      return copy.sort((a, b) => compareRatings(a, b, 1));
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    default:
      return copy;
  }
}

function compareRatings(a: ShowSummary, b: ShowSummary, direction: 1 | -1): number {
  const ra = a.rating.average;
  const rb = b.rating.average;
  if (ra === rb) {
    return 0;
  }
  if (ra === null) {
    return 1;
  }
  if (rb === null) {
    return -1;
  }
  return (ra - rb) * direction;
}

/** Converts an HTML snippet from the API into plain text (for cards, meta tags, etc). */
export function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return '';
  }
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
