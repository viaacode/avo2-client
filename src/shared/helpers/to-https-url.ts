/**
 * During SSR the request url is http, since TLS is terminated before the request reaches the node server
 * Always advertise https, except for local development
 */
export function toHttpsUrl(url: string): string {
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)) {
    return url;
  }
  return url.replace(/^http:\/\//, 'https://');
}
