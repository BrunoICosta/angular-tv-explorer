import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Episode, ScheduleEpisode, SearchResult, Show, ShowDetails } from '../models/tvmaze.model';
import { TVMAZE_API_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class TvmazeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(TVMAZE_API_URL);

  /** Paginated show index (250 shows per page, ordered by id). Returns 404 past the last page. */
  getShows(page: number): Observable<Show[]> {
    const params = new HttpParams().set('page', page);
    return this.http.get<Show[]>(`${this.baseUrl}/shows`, { params });
  }

  searchShows(query: string): Observable<Show[]> {
    const params = new HttpParams().set('q', query);
    return this.http
      .get<SearchResult[]>(`${this.baseUrl}/search/shows`, { params })
      .pipe(map((results) => results.map((result) => result.show)));
  }

  getShowDetails(id: number): Observable<ShowDetails> {
    const params = new HttpParams().appendAll({ 'embed[]': ['seasons', 'cast'] });
    return this.http.get<ShowDetails>(`${this.baseUrl}/shows/${id}`, { params });
  }

  getSeasonEpisodes(seasonId: number): Observable<Episode[]> {
    return this.http.get<Episode[]>(`${this.baseUrl}/seasons/${seasonId}/episodes`);
  }

  /** TV schedule for a country (ISO 3166-1 code) on a given day (YYYY-MM-DD). */
  getSchedule(country: string, date: string): Observable<ScheduleEpisode[]> {
    const params = new HttpParams().set('country', country).set('date', date);
    return this.http.get<ScheduleEpisode[]>(`${this.baseUrl}/schedule`, { params });
  }
}
