import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';

import { ItemTrimInfo } from '../item/item.types';
import { ApolloCacheManager, dataService } from '../shared/services';
import { VideoStillService } from '../shared/services/video-stills-service';

import {
	GET_MAX_POSITION_PUPIL_COLLECTION_BLOCKS,
	INSERT_PUPIL_COLLECTION_BLOCKS,
} from './pupil-collection.gql';

export class PupilCollectionService {
	static async getPupilCollectionBlockMaxPosition(
		assignmentResponseId: string
	): Promise<number | null> {
		const result = await dataService.query({
			query: GET_MAX_POSITION_PUPIL_COLLECTION_BLOCKS,
			variables: { assignmentResponseId },
		});
		return get(
			result,
			'data.app_assignment_responses_v2_by_pk.pupil_collection_blocks_aggregate.aggregate.max.position',
			null
		);
	}

	static async importFragmentToPupilCollection(
		item: Avo.Item.Item,
		assignmentResponseId: string,
		itemTrimInfo?: ItemTrimInfo
	): Promise<string> {
		// Handle trim settings and thumbnail
		const trimInfo: ItemTrimInfo = itemTrimInfo || {
			hasCut: false,
			fragmentStartTime: 0,
			fragmentEndTime: 0,
		};
		const thumbnailPath = trimInfo.fragmentStartTime
			? await VideoStillService.getVideoStill(
					item.external_id,
					trimInfo.fragmentStartTime * 1000
			  )
			: null;

		// Determine block position
		const currentMaxPosition = await PupilCollectionService.getPupilCollectionBlockMaxPosition(
			assignmentResponseId
		);
		const startPosition = currentMaxPosition === null ? 0 : currentMaxPosition + 1;

		// Add block with this fragment
		const block = {
			assignment_response_id: assignmentResponseId,
			fragment_id: item.external_id,
			type: 'ITEM',
			start_oc: trimInfo.hasCut ? trimInfo.fragmentStartTime : null,
			end_oc: trimInfo.hasCut ? trimInfo.fragmentEndTime : null,
			position: startPosition,
			thumbnail_path: thumbnailPath,
		};

		await dataService.mutate({
			mutation: INSERT_PUPIL_COLLECTION_BLOCKS,
			variables: {
				pupilCollectionBlocks: [block],
			},
			update: ApolloCacheManager.clearAssignmentCache,
		});

		return assignmentResponseId;
	}
}
