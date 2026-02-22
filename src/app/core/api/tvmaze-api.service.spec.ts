import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Show } from '../models/tvmaze.model';
import { TVMAZE_API_URL } from './api.config';
import { TvmazeApiService } from './tvmaze-api.service';

const BASE = 'https://api.test';

describe('TvmazeApiService', () => {
  let service: TvmazeApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TVMAZE_API_URL, useValue: BASE },
      ],
    });
    service = TestBed.inject(TvmazeApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests a catalog page', () => {
    service.getShows(3).subscribe();

    const req = http.expectOne(`${BASE}/shows?page=3`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('unwraps search results into shows', () => {
    let result: Show[] = [];
    service.searchShows('dark').subscribe((shows) => (result = shows));

    http
      .expectOne(`${BASE}/search/shows?q=dark`)
      .flush([{ score: 0.9, show: { id: 1, name: 'Dark' } }]);

    expect(result.map((show) => show.name)).toEqual(['Dark']);
  });

  it('embeds seasons and cast in show details', () => {
    service.getShowDetails(169).subscribe();

    const req = http.expectOne((r) => r.url === `${BASE}/shows/169`);
    expect(req.request.params.getAll('embed[]')).toEqual(['seasons', 'cast']);
    req.flush({});
  });

  it('requests episodes of a season', () => {
    service.getSeasonEpisodes(42).subscribe();

    const req = http.expectOne(`${BASE}/seasons/42/episodes`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('requests the schedule for a country and date', () => {
    service.getSchedule('BR', '2026-02-21').subscribe();

    const req = http.expectOne((r) => r.url === `${BASE}/schedule`);
    expect(req.request.params.get('country')).toBe('BR');
    expect(req.request.params.get('date')).toBe('2026-02-21');
    req.flush([]);
  });
});
