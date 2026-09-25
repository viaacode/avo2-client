/**
 * @jest-environment jsdom
 */

import { textToHtmlWithTimestamps } from './text-to-html-with-timestamps';

describe('Formatters - textToHtmlWithTimestamps', () => {
  it('Should not add <br> tags around list items', () => {
    const html = textToHtmlWithTimestamps(
      'De inzichten:\n\n* Literatuur kan je redden.\n* Kijk elkaar wat vaker in de ogen.\n',
    );
    expect(html).not.toContain('<br');
    expect(html).toContain('<li>Literatuur kan je redden.</li>');
  });

  it('Should convert single newlines inside a paragraph to <br>', () => {
    expect(textToHtmlWithTimestamps('Een regel\nmet newline')).toContain(
      'Een regel<br>met newline',
    );
  });

  it('Should split paragraphs without adding <br> between them', () => {
    const html = textToHtmlWithTimestamps('Eerste\n\nTweede');
    expect(html).toContain('<p>Eerste</p>');
    expect(html).toContain('<p>Tweede</p>');
    expect(html).not.toContain('<br');
  });

  it('Should highlight timestamps', () => {
    expect(textToHtmlWithTimestamps('Kijk vanaf 12:34')).toContain(
      '<span class="c-timestamp">12:34</span>',
    );
  });
});
