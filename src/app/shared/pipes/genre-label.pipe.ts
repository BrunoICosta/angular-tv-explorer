import { Pipe, PipeTransform } from '@angular/core';

import { ApiLabelPipe } from './api-label.pipe';

/** TVMaze genre in the active language (`Science-Fiction` → "Ficção científica" / "Science fiction"). */
@Pipe({ name: 'genreLabel', pure: false })
export class GenreLabelPipe extends ApiLabelPipe implements PipeTransform {
  override transform(genre: string | null | undefined): string {
    return super.transform(genre, 'genres');
  }
}
