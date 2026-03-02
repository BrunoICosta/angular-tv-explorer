import { HttpErrorResponse } from '@angular/common/http';

/** Translation keys (root scope) for the user-facing error messages. */
export type ErrorKey =
  | 'errors.network'
  | 'errors.notFound'
  | 'errors.rateLimit'
  | 'errors.server'
  | 'errors.generic';

/**
 * Normalized error thrown by the HTTP layer. `messageKey` is a translation key, so the UI can
 * show it in the active language; `message` stays technical for logs.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messageKey: string = errorKeyForStatus(status),
    readonly url: string | null = null,
  ) {
    super(`HTTP ${status}${url ? ` (${url})` : ''}`);
    this.name = 'ApiError';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  static fromHttpError(error: HttpErrorResponse): ApiError {
    return new ApiError(error.status, errorKeyForStatus(error.status), error.url);
  }
}

export function errorKeyForStatus(status: number): ErrorKey {
  if (status === 0) {
    return 'errors.network';
  }
  if (status === 404) {
    return 'errors.notFound';
  }
  if (status === 429) {
    return 'errors.rateLimit';
  }
  if (status >= 500) {
    return 'errors.server';
  }
  return 'errors.generic';
}

/** Translation key describing any error thrown by a data stream. */
export function toErrorKey(error: unknown): string {
  return error instanceof ApiError ? error.messageKey : 'errors.generic';
}
