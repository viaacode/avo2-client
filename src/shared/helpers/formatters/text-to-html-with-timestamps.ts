/**
 * @jest-environment jsdom
 */

import { marked } from 'marked';

/**
 * formats text to paragraphs and new lines with a highlight for timestamps
 * @param html
 */

const TIMESTAMP_REGEX = /([0-9]{2}:[0-9]{2}(:[0-9]{2})?)/g;

export function textToHtmlWithTimestamps(input: string): string {
  // breaks: true turns single newlines inside a paragraph into <br>,
  // without adding <br> between block elements like <ul> and <li>
  const convertedHtml: string = marked.parse(input || '', {
    sanitize: false,
    breaks: true,
  });
  return convertedHtml.replace(
    TIMESTAMP_REGEX,
    (match) => `<span class="c-timestamp">${match}</span>`,
  );
}
