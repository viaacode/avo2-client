export function redirectToExternalPage(
  link: string,
  target: '_blank' | string | null | undefined,
): void {
  if (target === '_blank') {
    window.open(link, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = link;
  }
}
