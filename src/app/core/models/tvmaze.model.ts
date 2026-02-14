/**
 * Subset of the TVMaze API contracts used by the app.
 * Reference: https://www.tvmaze.com/api
 */

export interface TvImage {
  medium: string;
  original: string;
}

export interface TvCountry {
  name: string;
  code: string;
  timezone: string;
}

export interface TvNetwork {
  id: number;
  name: string;
  country: TvCountry | null;
}

export interface TvRating {
  average: number | null;
}

export interface TvSchedule {
  time: string;
  days: string[];
}

export interface Show {
  id: number;
  url: string;
  name: string;
  type: string;
  language: string | null;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  schedule: TvSchedule;
  rating: TvRating;
  weight: number;
  network: TvNetwork | null;
  webChannel: TvNetwork | null;
  image: TvImage | null;
  summary: string | null;
}

export interface Season {
  id: number;
  number: number;
  name: string;
  episodeOrder: number | null;
  premiereDate: string | null;
  endDate: string | null;
  image: TvImage | null;
  summary: string | null;
}

export interface Episode {
  id: number;
  name: string;
  season: number;
  number: number | null;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string | null;
  runtime: number | null;
  rating: TvRating;
  image: TvImage | null;
  summary: string | null;
}

export interface Person {
  id: number;
  name: string;
  image: TvImage | null;
}

export interface Character {
  id: number;
  name: string;
  image: TvImage | null;
}

export interface CastMember {
  person: Person;
  character: Character;
  self: boolean;
  voice: boolean;
}

/** Minimal show data needed to render a card (also what favorites persist). */
export type ShowSummary = Pick<Show, 'id' | 'name' | 'image' | 'rating' | 'genres' | 'premiered'>;

/** Show returned by `/shows/:id?embed[]=seasons&embed[]=cast`. */
export interface ShowDetails extends Show {
  _embedded: {
    seasons: Season[];
    cast: CastMember[];
  };
}

export interface SearchResult {
  score: number;
  show: Show;
}

/** Episode returned by `/schedule`, with its parent show inlined. */
export interface ScheduleEpisode extends Episode {
  show: Show;
}
