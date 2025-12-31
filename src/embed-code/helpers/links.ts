import { generatePath } from 'react-router';

import { APP_PATH } from '../../constants';

export function toEmbedCodeIFrame(embedCodeId: string): string {
  return `${window.location.origin}/embed/${embedCodeId}`;
}

export function toEmbedCodeDetail(embedCodeId: string): string {
  return generatePath(APP_PATH.EMBED.route, {
    id: embedCodeId,
  });
}
