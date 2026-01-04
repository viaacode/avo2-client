import { getEnv } from '../../../shared/helpers/env';

export const PROXY_PATH_SHORTCUT = '{{PROXY_URL}}';

export function replaceProxyUrlTemplateWithUrl(newPath: string): string {
  if (newPath.startsWith(PROXY_PATH_SHORTCUT)) {
    return newPath.replace(PROXY_PATH_SHORTCUT, getEnv('PROXY_URL') || '');
  }

  return newPath;
}
