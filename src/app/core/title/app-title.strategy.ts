import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const APP_NAME = 'TV Explorer';
export const DEFAULT_DESCRIPTION =
  'Explore séries de TV, busque títulos, veja temporadas, elenco e a agenda do dia com dados da TVMaze.';

export function formatTitle(pageTitle?: string | null): string {
  return pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
}

/** Suffixes every route title with the app name and resets the meta description. */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(formatTitle(this.buildTitle(snapshot)));
    this.meta.updateTag({ name: 'description', content: DEFAULT_DESCRIPTION });
  }
}
