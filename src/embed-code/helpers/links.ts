import { generatePath } from 'react-router';

import { APP_PATH } from '../../constants';
import { getEnv } from '../../shared/helpers/env.ts';

export function toEmbedCodeIFrame(embedCodeId: string): string {
  return `${getEnv('CLIENT_URL')}/embed/${embedCodeId}`;
}

export function toEmbedCodeDetail(embedCodeId: string): string {
  return generatePath(APP_PATH.EMBED.route, {
    id: embedCodeId,
  });
}
