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

export function getKeycloackEnv(
  keycloakName: keyof Window['_ENV_'],
  ssumName: keyof Window['_ENV_'],
): string | undefined {
  if (
    getEnv('USE_KEYCLOAK_INSTEAD_OF_SSUM') === 'true' &&
    getEnv(keycloakName)
  ) {
    return getEnv(keycloakName);
  }

  return getEnv(ssumName);
}
