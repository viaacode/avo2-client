import { Avo } from '@viaa/avo2-types';

import { compact, uniq } from 'lodash-es';
import { isMediaFragment } from '../../collection/helpers';
import { ContentTypeString } from '../../collection/types';
import { getEnv } from '../helpers/env';

export const getVideoStills = async (
	stillRequests: Avo.Stills.StillRequest[]
): Promise<Avo.Stills.StillInfo[]> => {
	try {
		if (!stillRequests || !stillRequests.length) {
			return [];
		}
		const response = await fetch(`${getEnv('PROXY_URL')}/video-stills`, {
			method: 'POST',
			body: JSON.stringify(stillRequests),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	} catch (err) {
		throw new Error('Failed to get video stills');
	}
};

export const getThumbnailsForCollection = async (
	collection: Partial<Avo.Collection.Collection>
): Promise<string[]> => {
	// Only request the thumbnail of one audio fragment since those thumbnails are all identical
	const mediaFragments = (collection.collection_fragments || []).filter(
		fragment => isMediaFragment(fragment) && fragment.item_meta
	);
	const videoFragments = mediaFragments.filter(
		fragment => fragment.item_meta && fragment.item_meta.type.label === ContentTypeString.video
	);
	const audioFragments = mediaFragments.filter(
		fragment => fragment.item_meta && fragment.item_meta.type.label === ContentTypeString.audio
	);
	const stillRequests: Avo.Stills.StillRequest[] = compact(
		videoFragments.map(fragment => ({
			externalId: fragment.external_id,
			startTime: (fragment.start_oc || 0) * 1000,
		}))
	);
	const videoStills = await getVideoStills(stillRequests);

	return uniq([
		// current thumbnail image
		...(collection.thumbnail_path ? [collection.thumbnail_path] : []),
		// Video thumbnails
		...videoStills.map(videoStill => videoStill.thumbnailImagePath),
		// One audio thumbnail
		...(audioFragments[0] && audioFragments[0].item_meta
			? [audioFragments[0].item_meta.thumbnail_path]
			: []),
	]);
};

export const getThumbnailForCollection = async (
	collection: Partial<Avo.Collection.Collection>
): Promise<string | null> => {
	return (await getThumbnailsForCollection(collection))[0] || null;
};
