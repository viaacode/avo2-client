import {
  AvoCollectionCollection,
  AvoCoreContentTypeId,
  AvoItemItem,
} from '@viaa/avo2-types';

import { DEFAULT_AUDIO_STILL } from '../constants';

/**
 * Returns the thumbnail for video items and the default audio still for audio items
 * Falls back to the itemMeta thumbnail if the provided thumbnail is undefined
 * @param thumbnail
 * @param itemMeta
 */
export function getFlowPlayerPoster(
  thumbnail: string | null | undefined,
  itemMeta: AvoItemItem | AvoCollectionCollection | undefined,
): string | undefined {
  if (itemMeta?.type_id === AvoCoreContentTypeId.AUDIO) {
    return DEFAULT_AUDIO_STILL;
  }
  return thumbnail || itemMeta?.thumbnail_path || undefined;
}
