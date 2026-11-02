import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';

/**
 * Loads `public/i18n/<lang>.json` for the root scope and `public/i18n/<scope>/<lang>.json` for
 * feature scopes. The path is relative, so it works under the demo's base href.
 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(path: string): Observable<Translation> {
    return this.http.get<Translation>(`i18n/${path}.json`);
  }
}
