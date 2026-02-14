import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { TvmazeApiService } from '../../../core/api/tvmaze-api.service';
import { Episode } from '../../../core/models/tvmaze.model';

/**
 * Feature-scoped cache of episodes per season (provided in SHOW_DETAIL_ROUTES), so collapsing
 * and re-expanding a season, or coming back to the same show, does not refetch the list.
 */
@Injectable()
export class SeasonEpisodesService {
  private readonly api = inject(TvmazeApiService);
  private readonly cache = new Map<number, Observable<Episode[]>>();

  episodes(seasonId: number): Observable<Episode[]> {
    let request = this.cache.get(seasonId);
    if (!request) {
      request = this.api
        .getSeasonEpisodes(seasonId)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.cache.set(seasonId, request);
    }
    return request;
  }

  /** Drops a failed request so the next call retries it. */
  invalidate(seasonId: number): void {
    this.cache.delete(seasonId);
  }
}
