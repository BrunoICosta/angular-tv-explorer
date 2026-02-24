import { TestBed } from '@angular/core/testing';

import { SanitizeHtmlPipe } from './sanitize-html.pipe';

describe('SanitizeHtmlPipe', () => {
  let pipe: SanitizeHtmlPipe;

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new SanitizeHtmlPipe());
  });

  it('keeps formatting tags', () => {
    expect(pipe.transform('<p><b>Dark</b> is great</p>')).toBe('<p><b>Dark</b> is great</p>');
  });

  it('removes scripts, event handlers and javascript urls', () => {
    const result = pipe.transform(
      '<p onclick="steal()">Hi<script>alert(1)</script><a href="javascript:alert(1)">x</a></p>',
    );

    expect(result).not.toContain('<script');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('href="javascript:');
  });

  it('returns an empty string for missing summaries', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
