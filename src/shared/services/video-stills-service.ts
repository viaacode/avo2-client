import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import { compact, isNil, uniq, without } from 'lodash-es';

import { ContentTypeString } from '../../collection/collection.types';
import { DEFAULT_AUDIO_STILL } from '../constants';
import { CustomError, getEnv, toSeconds } from '../helpers';

export class VideoStillService {
	/**
	 * Get the first video still after the provided start times for all provided videos
	 * @param stillRequests list of info objects containing the video id and their desired start time in seconds
	 */
	public static async getVideoStills(
		stillRequests: Avo.Stills.StillRequest[]
	): Promise<Avo.Stills.StillInfo[]> {
		try {
			if (!stillRequests || !stillRequests.length) {
				return [];
			}
			return fetchWithLogoutJson(`${getEnv('PROXY_URL')}/video-stills`, {
				method: 'POST',
				body: JSON.stringify(stillRequests),
			});
		} catch (err) {
			throw new CustomError('Failed to get video stills', err, { stillRequests });
		}
	}

	/**
	 * Get video still for video with external id after start time
	 * @param externalId id of the video
	 * @param startTime video frame closest to this timestamp in milliseconds
	 * @return url to frame from video
	 */
	public static async getVideoStill(externalId: string, startTime: number): Promise<string> {
		const stills = await VideoStillService.getVideoStills([{ externalId, startTime }]);
		return stills[0].previewImagePath;
	}

	public static async getThumbnailsForSubject(
		subject: Partial<Avo.Collection.Collection> | Partial<Avo.Assignment.Assignment>
	): Promise<string[]> {
		// Only request the thumbnail of one audio fragment since those thumbnails are all identical
		const mediaFragments = (
			(subject as Avo.Collection.Collection).collection_fragments ||
			(subject as Avo.Assignment.Assignment).blocks ||
			[]
		).filter((block) => block.type === 'ITEM');
		const videoBlocks = mediaFragments.filter(
			(block) =>
				block.item_meta &&
				(block.item_meta as Avo.Item.Item).type.label === ContentTypeString.video
		);
		const audioBlocks = mediaFragments.filter(
			(block) =>
				block.item_meta &&
				(block.item_meta as Avo.Item.Item).type.label === ContentTypeString.audio
		);
		const cutVideoBlocks = videoBlocks.filter(
			(block) =>
				(block.start_oc !== 0 && !isNil(block.start_oc)) ||
				(block.item_meta &&
					!isNil(block.end_oc) &&
					block.end_oc !== toSeconds((block.item_meta as Avo.Item.Item).duration))
		);
		const uncutVideoFragments = without(videoBlocks, ...cutVideoBlocks);
		const cutVideoStillRequests: Avo.Stills.StillRequest[] = compact(
			cutVideoBlocks.map((block) => ({
				externalId: block.fragment_id || block.external_id,
				startTime: (block.start_oc || 0) * 1000,
			}))
		);
		const cutVideoStills = await VideoStillService.getVideoStills(cutVideoStillRequests);

		return uniq(
			compact([
				// current thumbnail image
				...(subject.thumbnail_path ? [subject.thumbnail_path] : []),
				// Cut video thumbnails
				...cutVideoStills.map((videoStill) => videoStill.previewImagePath),
				// Uncut video thumbnails
				...uncutVideoFragments.map(
					(block) => block.item_meta && block.item_meta.thumbnail_path
				),
				// One audio thumbnail
				...(audioBlocks[0] && audioBlocks[0].item_meta ? [DEFAULT_AUDIO_STILL] : []),
			])
		);
	}

	public static async getThumbnailForSubject(
		collection: Partial<Avo.Collection.Collection> | Partial<Avo.Assignment.Assignment>
	): Promise<string | null> {
		return (await VideoStillService.getThumbnailsForSubject(collection))[0] || null;
	}
}
