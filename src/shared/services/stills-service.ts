import { compact, uniq } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { isMediaFragment } from '../../collection/collection.helpers';
import { ContentTypeString } from '../../collection/collection.types';
import { getEnv } from '../helpers/env';
import { toSeconds } from '../helpers/parsers/duration';
import { CustomError } from '../helpers/error';

/**
 * Get the first video still after the provided start times for all provided videos
 * @param stillRequests: list of info objects containing the video id and their desired start time in seconds
 */
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
		throw new CustomError('Failed to get video stills', err, { stillRequests });
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
	const cutVideoFragments = videoFragments.filter(
		fragment =>
			fragment.start_oc !== 0 ||
			(fragment.item_meta && fragment.end_oc !== toSeconds(fragment.item_meta.duration))
	);
	const uncutVideoFragments = videoFragments.filter(
		fragment =>
			(!fragment.start_oc && !fragment.end_oc) ||
			(fragment.start_oc === 0 &&
				fragment.item_meta &&
				fragment.end_oc === toSeconds(fragment.item_meta.duration))
	);
	const cutVideoStillRequests: Avo.Stills.StillRequest[] = compact(
		cutVideoFragments.map(fragment => ({
			externalId: fragment.external_id,
			startTime: (fragment.start_oc || 0) * 1000,
		}))
	);
	const cutVideoStills = await getVideoStills(cutVideoStillRequests);

	return uniq(
		compact([
			// current thumbnail image
			...(collection.thumbnail_path ? [collection.thumbnail_path] : []),
			// Cut video thumbnails
			...cutVideoStills.map(videoStill => videoStill.thumbnailImagePath),
			// Uncut video thumbnails
			...uncutVideoFragments.map(
				fragment => fragment.item_meta && fragment.item_meta.thumbnail_path
			),
			// One audio thumbnail
			...(audioFragments[0] && audioFragments[0].item_meta
				? [audioFragments[0].item_meta.thumbnail_path]
				: []),
		])
	);
};

export const getThumbnailForCollection = async (
	collection: Partial<Avo.Collection.Collection>
): Promise<string | null> => {
	return (await getThumbnailsForCollection(collection))[0] || null;
};
