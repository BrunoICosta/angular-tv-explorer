import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';

import { NotificationService } from '../notifications/notification.service';
import { ApiError } from './api-error';

export const MAX_RETRIES = 2;
export const RETRY_BASE_DELAY_MS = 500;

/** Network failures, rate limiting (TVMaze allows ~20 calls / 10s) and server errors are transient. */
export function isRetryable(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  return error.status === 0 || error.status === 429 || error.status >= 500;
}

/**
 * Retries idempotent requests with exponential backoff and maps failures to {@link ApiError}.
 * 404s are expected (e.g. past the last catalog page) and are not reported globally.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const canRetry = req.method === 'GET';

  return next(req).pipe(
    retry({
      count: canRetry ? MAX_RETRIES : 0,
      delay: (error: unknown, attempt: number) =>
        isRetryable(error)
          ? timer(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
          : throwError(() => error),
    }),
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      const apiError = ApiError.fromHttpError(error);
      if (!apiError.isNotFound) {
        notifications.error(apiError.messageKey);
      }
      return throwError(() => apiError);
    }),
  );
};
