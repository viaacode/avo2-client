/**
 * @jest-environment jsdom
 */

export function getEnv(name: keyof Window['_ENV_']): string | undefined {
  if (import.meta.env.SSR) {
    // Server-side rendering
    return process.env[name];
  }
  // Client-side rendering
  return window._ENV_[name];
}
