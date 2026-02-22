import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NotificationService } from '../notifications/notification.service';
import { ApiError } from './api-error';
import { MAX_RETRIES, RETRY_BASE_DELAY_MS, httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['error']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notifications },
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('retries server errors with backoff and succeeds', fakeAsync(() => {
    let body: unknown;
    client.get('/shows').subscribe((value) => (body = value));

    http.expectOne('/shows').flush(null, { status: 503, statusText: 'Unavailable' });
    tick(RETRY_BASE_DELAY_MS);
    http.expectOne('/shows').flush(null, { status: 500, statusText: 'Error' });
    tick(RETRY_BASE_DELAY_MS * 2);
    http.expectOne('/shows').flush({ ok: true });

    expect(body).toEqual({ ok: true });
    expect(notifications.error).not.toHaveBeenCalled();
  }));

  it('maps the final failure to an ApiError and notifies the user', fakeAsync(() => {
    let error: unknown;
    client.get('/shows').subscribe({ error: (e: unknown) => (error = e) });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      http.expectOne('/shows').flush(null, { status: 500, statusText: 'Error' });
      tick(RETRY_BASE_DELAY_MS * 2 ** attempt);
    }

    expect(error).toEqual(jasmine.any(ApiError));
    expect((error as ApiError).status).toBe(500);
    expect(notifications.error).toHaveBeenCalledOnceWith((error as ApiError).message);
  }));

  it('does not retry nor notify on 404', () => {
    let error: ApiError | undefined;
    client.get('/shows?page=999').subscribe({ error: (e: ApiError) => (error = e) });

    http.expectOne('/shows?page=999').flush(null, { status: 404, statusText: 'Not Found' });

    expect(error?.isNotFound).toBeTrue();
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('does not retry non-idempotent requests', () => {
    let error: ApiError | undefined;
    client.post('/anything', {}).subscribe({ error: (e: ApiError) => (error = e) });

    http.expectOne('/anything').flush(null, { status: 503, statusText: 'Unavailable' });
    http.expectNone('/anything');
    expect(error?.status).toBe(503);
  });
});
