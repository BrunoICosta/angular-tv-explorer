import { Pipe, PipeTransform } from '@angular/core';

import { genreLabel } from '../utils/show-utils';

@Pipe({ name: 'genreLabel' })
export class GenreLabelPipe implements PipeTransform {
  transform(genre: string): string {
    return genreLabel(genre);
  }
}
