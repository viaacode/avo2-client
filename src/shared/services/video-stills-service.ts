import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';
import {
	AvoAssignmentAssignment,
	AvoCollectionCollection,
	AvoCoreContentType,
	AvoItemItem,
	AvoStillsStillInfo,
	AvoStillsStillRequest,
} from '@viaa/avo2-types';
import { compact, isNil, uniq, without } from 'es-toolkit';
import { ContentTypeNumber } from '../../collection/collection.types';
import { DEFAULT_AUDIO_STILL } from '../constants';
import { CustomError } from '../helpers/custom-error';
import { getEnv } from '../helpers/env';
import { toSeconds } from '../helpers/parsers/duration';

export class VideoStillService {
  /**
   * Get the first video still after the provided start times for all provided videos
   * @param stillRequests list of info objects containing the video id and their desired start time in seconds
   */
  public static async getVideoStills(
    stillRequests: AvoStillsStillRequest[],
  ): Promise<AvoStillsStillInfo[]> {
    try {
      if (!stillRequests || !stillRequests.length) {
        return [];
      }
      return fetchWithLogoutJson(`${getEnv('PROXY_URL')}/video-stills`, {
        method: 'POST',
        body: JSON.stringify(stillRequests),
      });
    } catch (err) {
      throw new CustomError('Failed to get video stills', err, {
        stillRequests,
      });
    }
  }

  /**
   * Get video still for video with external id after start time
   * @param externalId id of the video
   * @param contentType type of item for which you're requesting a still. When 1 (audio) is passed, a default audio still will be returned
   * @param startTime video frame closest to this timestamp in milliseconds
   * @return url to frame from video
   */
  public static async getVideoStill(
    externalId: string,
    contentType: ContentTypeNumber,
    startTime: number,
  ): Promise<string> {
    try {
      if (contentType === ContentTypeNumber.audio) {
        return DEFAULT_AUDIO_STILL;
      }
      const stills = await VideoStillService.getVideoStills([
        { externalId, startTime },
      ]);
      if (stills[0] && stills[0].previewImagePath) {
        return stills[0].previewImagePath;
      }
      return '';
    } catch (err) {
      throw new CustomError('Failed to get video still previewImagePath', err, {
        externalId,
      });
    }
  }

  public static async getThumbnailsForSubject(
    subject:
      | Partial<AvoCollectionCollection>
      | Partial<AvoAssignmentAssignment>,
  ): Promise<string[]> {
    // Only request the thumbnail of one audio fragment since those thumbnails are all identical
    const mediaFragments = (
      (subject as AvoCollectionCollection).collection_fragments ||
      (subject as AvoAssignmentAssignment).blocks ||
      []
    ).filter((block) => block.type === 'ITEM');
    const videoBlocks = mediaFragments.filter(
      (block) =>
        block.item_meta &&
        (block.item_meta as AvoItemItem).type.label ===
          AvoCoreContentType.VIDEO,
    );
    const audioBlocks = mediaFragments.filter(
      (block) =>
        block.item_meta &&
        (block.item_meta as AvoItemItem).type.label ===
          AvoCoreContentType.AUDIO,
    );
    const cutVideoBlocks = videoBlocks.filter(
      (block) =>
        (block.start_oc !== 0 && !isNil(block.start_oc)) ||
        (block.item_meta &&
          !isNil(block.end_oc) &&
          block.end_oc !==
            toSeconds((block.item_meta as AvoItemItem).duration)),
    );
    const uncutVideoFragments = without(videoBlocks, ...cutVideoBlocks);
    const cutVideoStillRequests: AvoStillsStillRequest[] = compact(
      cutVideoBlocks.map((block) => ({
        externalId: block.fragment_id || block.external_id,
        startTime: (block.start_oc || 0) * 1000,
      })),
    );
    const cutVideoStills = compact(
      await VideoStillService.getVideoStills(cutVideoStillRequests),
    );

    return uniq(
      compact([
        // current thumbnail image
        ...(subject.thumbnail_path ? [subject.thumbnail_path] : []),
        // Cut video thumbnails
        ...cutVideoStills.map((videoStill) => videoStill.previewImagePath),
        // Uncut video thumbnails
        ...uncutVideoFragments.map(
          (block) => block.item_meta && block.item_meta.thumbnail_path,
        ),
        // One audio thumbnail
        ...(audioBlocks[0] && audioBlocks[0].item_meta
          ? [DEFAULT_AUDIO_STILL]
          : []),
      ]),
    );
  }

  public static async getThumbnailForSubject(
    collection:
      | Partial<AvoCollectionCollection>
      | Partial<AvoAssignmentAssignment>,
  ): Promise<string | null> {
    return (
      (await VideoStillService.getThumbnailsForSubject(collection))[0] || null
    );
  }
}
