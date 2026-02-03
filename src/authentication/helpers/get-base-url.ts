import { trimEnd } from 'es-toolkit';
import { type Location } from 'react-router';
import { getEnv } from '../../shared/helpers/env.ts';
import { isServerSideRendering } from '../../shared/helpers/routing/is-server-side-rendering.ts';

export function getBaseUrl(location: Location): string {
  if (isServerSideRendering()) {
    return getEnv('CLIENT_URL') as string;
  }
  if (location.pathname === '/') {
    return trimEnd(window.location.href, '/');
  }
  return trimEnd(
    decodeURIComponent(window.location.href).split(location.pathname)[0],
    '/',
  );
}
