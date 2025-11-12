export function isRichTextEmpty(input: string | null | undefined): boolean {
  return !input || input.length <= 0 || input === '<p></p>'
}
