import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Sanitizes HTML coming from the API (show/episode summaries) before it reaches `[innerHTML]`:
 * scripts, event handlers and `javascript:` URLs are stripped; formatting tags are kept.
 */
@Pipe({ name: 'sanitizeHtml' })
export class SanitizeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(html: string | null | undefined): string {
    if (!html) {
      return '';
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
