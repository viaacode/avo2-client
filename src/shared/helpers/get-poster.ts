import { type Avo } from '@viaa/avo2-types';

import { ContentTypeNumber } from '../../collection/collection.types.js';
import { DEFAULT_AUDIO_STILL } from '../constants/index.js';

/**
 * Returns the thumbnail for video items and the default audio still for audio items
 * Falls back to the itemMeta thumbnail if the provided thumbnail is undefined
 * @param thumbnail
 * @param itemMeta
 */
export function getFlowPlayerPoster(
	thumbnail: string | null | undefined,
	itemMeta: Avo.Item.Item | Avo.Collection.Collection | undefined
): string | undefined {
	if (itemMeta?.type_id === ContentTypeNumber.audio) {
		return DEFAULT_AUDIO_STILL;
	}
	return thumbnail || itemMeta?.thumbnail_path || undefined;
}
