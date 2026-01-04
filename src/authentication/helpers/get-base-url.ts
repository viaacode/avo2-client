import { trimEnd } from 'es-toolkit';
import { type Location } from 'react-router';

export function getBaseUrl(location: Location): string {
  if (location.pathname === '/') {
    return trimEnd(window.location.href, '/');
  }
  return trimEnd(
    decodeURIComponent(window.location.href).split(location.pathname)[0],
    '/',
  );
}
