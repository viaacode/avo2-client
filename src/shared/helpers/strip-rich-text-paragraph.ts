/**
 * Strips the <p></p> tags if only one p tag is present in the file
 * @param text
 */
export function stripRichTextParagraph(text: string): string {
  const newTextWithoutWrappingP = text.replace(/(<p>|<\/p>)/g, '');
  if (text.length === (newTextWithoutWrappingP + '<p></p>').length) {
    // There was only one p tag in the translation, so we can safely delete it.
    return newTextWithoutWrappingP;
  } else {
    // There are multiple p tags in the translation, so we cannot delete them
    return text;
  }
}
