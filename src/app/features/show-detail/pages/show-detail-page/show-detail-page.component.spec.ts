import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { TVMAZE_API_URL } from '../../../../core/api/api.config';
import { httpErrorInterceptor } from '../../../../core/http/http-error.interceptor';
import { ShowDetails } from '../../../../core/models/tvmaze.model';
import { BROWSER_STORAGE, MemoryStorage } from '../../../../core/storage/browser-storage.token';
import { SHOW_DETAIL_ROUTES } from '../../show-detail.routes';

const details = {
  id: 7,
  name: 'Dark',
  url: 'https://www.tvmaze.com/shows/7/dark',
  type: 'Scripted',
  language: 'German',
  genres: ['Drama', 'Mystery'],
  status: 'Ended',
  runtime: 60,
  averageRuntime: 60,
  premiered: '2017-12-01',
  ended: '2020-06-27',
  officialSite: null,
  schedule: { time: '', days: ['Saturday'] },
  rating: { average: 8.7 },
  weight: 98,
  network: null,
  webChannel: { id: 1, name: 'Netflix', country: null },
  image: null,
  summary: '<p><b>Dark</b> is a family saga<script>alert(1)</script></p>',
  _embedded: { seasons: [], cast: [] },
} satisfies ShowDetails;

describe('ShowDetailPageComponent', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'series', children: SHOW_DETAIL_ROUTES }],
          withComponentInputBinding(),
        ),
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: TVMAZE_API_URL, useValue: 'https://api.test' },
        { provide: BROWSER_STORAGE, useValue: new MemoryStorage() },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  it('binds the :id param, shows a skeleton and then the sanitized show', async () => {
    await harness.navigateByUrl('/series/7');

    expect(harness.routeNativeElement?.textContent).toContain('Carregando detalhes da série');

    http.expectOne((req) => req.url === 'https://api.test/shows/7').flush(details);
    harness.detectChanges();

    const page = harness.routeNativeElement!;
    expect(page.querySelector('h1')?.textContent).toContain('Dark');
    expect(page.querySelector('.hero__summary')?.innerHTML).not.toContain('script');
    expect(page.textContent).toContain('Mistério');
    expect(page.textContent).toContain('2017–2020');
    expect(TestBed.inject(Title).getTitle()).toBe('Dark · TV Explorer');
  });

  it('shows a not-found state for 404', async () => {
    await harness.navigateByUrl('/series/999999');

    http
      .expectOne((req) => req.url === 'https://api.test/shows/999999')
      .flush(null, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Série não encontrada');
  });

  it('rejects invalid ids without calling the API', async () => {
    await harness.navigateByUrl('/series/abc');
    harness.detectChanges();

    http.expectNone(() => true);
    expect(harness.routeNativeElement?.textContent).toContain('Série não encontrada');
  });
});
