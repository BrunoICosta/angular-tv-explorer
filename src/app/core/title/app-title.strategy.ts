import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const APP_NAME = 'TV Explorer';

export function formatTitle(pageTitle?: string | null): string {
  return pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
}

/** Suffixes every route title with the app name. */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(formatTitle(this.buildTitle(snapshot)));
  }
}
