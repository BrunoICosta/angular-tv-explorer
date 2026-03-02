import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { PageMetaService } from '../i18n/page-meta.service';

/** Route `title`s are translation keys; PageMetaService renders them in the active language. */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly pageMeta = inject(PageMetaService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.pageMeta.setRouteTitle(this.buildTitle(snapshot) ?? null);
  }
}
