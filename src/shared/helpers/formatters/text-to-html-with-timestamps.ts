/**
 * @jest-environment jsdom
 */

import { convertToHtml } from '@viaa/avo2-components';

/**
 * formats text to paragraphs and new lines with a highlight for timestamps
 * @param html
 */

const TIMESTAMP_REGEX = /([0-9]{2}:[0-9]{2}(:[0-9]{2})?)/g;

export function textToHtmlWithTimestamps(input: string): string {
  const convertedHtml: string = convertToHtml(input);
  return convertedHtml
    .replace(/<\/p>\n\r?<p>/g, '</p><p>')
    .replace(/\n\r?/g, '<br/>')
    .replace(
      TIMESTAMP_REGEX,
      (match) => `<span class="c-timestamp">${match}</span>`,
    );
}
