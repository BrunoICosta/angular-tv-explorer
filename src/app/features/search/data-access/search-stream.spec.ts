import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { Show } from '../../../core/models/tvmaze.model';
import { ApiError } from '../../../core/http/api-error';
import { SearchState, searchStream } from './search-stream';

const dark = { id: 1, name: 'Dark' } as Show;
const darker = { id: 2, name: 'Darker' } as Show;

describe('searchStream', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('debounces keystrokes and emits loading then results', () => {
    scheduler.run(({ cold, hot, expectObservable }) => {
      const terms = hot('a-b----------|', { a: 'da', b: 'dark' });
      const search = (q: string) => cold('--r|', { r: q === 'dark' ? [dark] : [] });

      expectObservable(searchStream(terms, { search, debounceMs: 3 })).toBe('-----l-s-----|', {
        l: { status: 'loading', query: 'dark' },
        s: { status: 'success', query: 'dark', results: [dark] },
      } satisfies Record<string, SearchState>);
    });
  });

  it('ignores repeated terms (after trimming)', () => {
    scheduler.run(({ cold, hot, expectObservable }) => {
      const terms = hot('a----b----|', { a: 'dark', b: ' dark ' });
      const search = () => cold('r|', { r: [dark] });

      expectObservable(searchStream(terms, { search, debounceMs: 1 })).toBe('-(ls)-----|', {
        l: { status: 'loading', query: 'dark' },
        s: { status: 'success', query: 'dark', results: [dark] },
      });
    });
  });

  it('cancels the stale request when a new term arrives (switchMap)', () => {
    scheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const terms = hot('a--b-------|', { a: 'dark', b: 'darker' });
      const slow = cold('-----r|', { r: [dark] });
      const fast = cold('-r|', { r: [darker] });
      const search = (q: string): Observable<Show[]> => (q === 'dark' ? slow : fast);

      expectObservable(searchStream(terms, { search, debounceMs: 1 })).toBe('-l--lr-----|', {
        l: jasmine.objectContaining({ status: 'loading' }),
        r: { status: 'success', query: 'darker', results: [darker] },
      });
      expectSubscriptions(slow.subscriptions).toBe('-^--!');
    });
  });

  it('returns to idle for short terms without calling the API', () => {
    scheduler.run(({ hot, expectObservable }) => {
      const terms = hot('a--|', { a: 'd' });
      const search = jasmine.createSpy('search');

      expectObservable(searchStream(terms, { search, debounceMs: 1 })).toBe('-i-|', {
        i: { status: 'idle' },
      });
      scheduler.flush();
      expect(search).not.toHaveBeenCalled();
    });
  });

  it('turns failures into an error state and retries on demand', () => {
    scheduler.run(({ cold, hot, expectObservable }) => {
      const terms = hot('a---------|', { a: 'dark' });
      const retry$ = hot<void>('-----r----|', { r: undefined });
      let calls = 0;
      const search = (): Observable<Show[]> =>
        calls++ === 0
          ? cold<Show[]>('#', undefined, new ApiError(500, 'Falhou'))
          : cold('r|', { r: [dark] });

      expectObservable(searchStream(terms, { search, retry$, debounceMs: 1 })).toBe('-(le)(ls)-|', {
        l: { status: 'loading', query: 'dark' },
        e: { status: 'error', query: 'dark', message: 'Falhou' },
        s: { status: 'success', query: 'dark', results: [dark] },
      });
    });
  });
});
