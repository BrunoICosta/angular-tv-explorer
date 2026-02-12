import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { toErrorMessage } from '../../core/http/api-error';
import { Show } from '../../core/models/tvmaze.models';

export const MIN_QUERY_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 350;

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; results: Show[] }
  | { status: 'error'; query: string; message: string };

export interface SearchStreamOptions {
  search: (query: string) => Observable<Show[]>;
  /** Re-runs the current query (e.g. after an error). */
  retry$?: Observable<void>;
  debounceMs?: number;
}

/**
 * Turns raw input values into search states.
 * - trims and debounces keystrokes, ignoring repeated terms;
 * - `switchMap` unsubscribes from the previous request, so stale responses never win;
 * - errors are converted into an `error` state instead of killing the stream.
 */
export function searchStream(
  terms$: Observable<string>,
  { search, retry$ = of(), debounceMs = SEARCH_DEBOUNCE_MS }: SearchStreamOptions,
): Observable<SearchState> {
  return terms$.pipe(
    map((term) => term.trim()),
    debounceTime(debounceMs),
    distinctUntilChanged(),
    switchMap((query) =>
      query.length < MIN_QUERY_LENGTH
        ? of<SearchState>({ status: 'idle' })
        : retry$.pipe(
            startWith(undefined),
            switchMap(() => runSearch(query, search)),
          ),
    ),
  );
}

function runSearch(
  query: string,
  search: (query: string) => Observable<Show[]>,
): Observable<SearchState> {
  return search(query).pipe(
    map((results): SearchState => ({ status: 'success', query, results })),
    startWith<SearchState>({ status: 'loading', query }),
    catchError((error: unknown) =>
      of<SearchState>({ status: 'error', query, message: toErrorMessage(error) }),
    ),
  );
}
