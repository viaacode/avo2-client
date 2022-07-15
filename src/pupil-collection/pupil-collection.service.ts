import { Avo } from '@viaa/avo2-types';
import { get, without } from 'lodash-es';

import { isNewAssignmentBlock } from '../assignment/assignment.const';
import { PupilCollectionFragment } from '../assignment/assignment.types';
import { ItemTrimInfo } from '../item/item.types';
import { CustomError } from '../shared/helpers';
import { getOrderObject } from '../shared/helpers/generate-order-gql-query';
import { ApolloCacheManager, dataService } from '../shared/services';
import { VideoStillService } from '../shared/services/video-stills-service';
import { TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	ITEMS_PER_PAGE,
	PUPIL_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './pupil-collection.const';
import {
	BULK_UPDATE_AUTHOR_FOR_PUPIL_COLLECTIONS,
	DELETE_ASSIGNMENT_RESPONSES,
	GET_MAX_POSITION_PUPIL_COLLECTION_BLOCKS,
	GET_PUPIL_COLLECTION_IDS,
	GET_PUPIL_COLLECTIONS_ADMIN_OVERVIEW,
	INSERT_PUPIL_COLLECTION_BLOCKS,
	UPDATE_PUPIL_COLLECTION_BLOCK,
} from './pupil-collection.gql';
import { PupilCollectionOverviewTableColumns } from './pupil-collection.types';

export class PupilCollectionService {
	static async fetchPupilCollectionsForAdmin(
		page: number,
		sortColumn: PupilCollectionOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any = {},
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.Assignment.Response_v2[], number]> {
		let variables;
		try {
			variables = {
				where,
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					PUPIL_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};

			const response = await dataService.query({
				variables,
				query: GET_PUPIL_COLLECTIONS_ADMIN_OVERVIEW,
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}

			const pupilCollections: Avo.Assignment.Response_v2[] =
				response?.data?.app_assignment_responses_v2;

			const assignmentCount =
				response?.data?.app_assignment_responses_v2_aggregate?.aggregate?.count || 0;

			if (!pupilCollections) {
				throw new CustomError('Response does not contain any pupil collections', null, {
					response,
				});
			}

			return [pupilCollections as Avo.Assignment.Response_v2[], assignmentCount];
		} catch (err) {
			throw new CustomError('Failed to get pupil collections from the database', err, {
				variables,
				query: 'GET_PUPIL_COLLECTIONS_ADMIN_OVERVIEW',
			});
		}
	}

	static async getPupilCollectionIds(where: any = {}): Promise<string[]> {
		let variables;
		try {
			variables = {
				where,
			};

			const response = await dataService.query({
				variables,
				query: GET_PUPIL_COLLECTION_IDS,
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}

			const pupilCollectionIds: string[] = (response?.data?.app_assignments_v2 || []).map(
				(assignment: Avo.Assignment.Assignment_v2) => assignment.id
			);

			if (!pupilCollectionIds) {
				throw new CustomError('Response does not contain any pupil collection ids', null, {
					response,
				});
			}

			return pupilCollectionIds;
		} catch (err) {
			throw new CustomError('Failed to get pupil collection ids from the database', err, {
				variables,
				query: 'GET_PUPIL_COLLECTION_IDS',
			});
		}
	}

	static async changePupilCollectionsAuthor(
		profileId: string,
		pupilCollectionIds: string[]
	): Promise<void> {
		try {
			const response = await dataService.mutate({
				mutation: BULK_UPDATE_AUTHOR_FOR_PUPIL_COLLECTIONS,
				variables: {
					pupilCollectionIds,
					authorId: profileId,
					now: new Date().toISOString(),
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}

			return response?.data?.update_app_assignments_v2?.affected_rows || 0;
		} catch (err) {
			throw new CustomError(
				'Failed to update author for pupil collections in the database',
				err,
				{
					profileId,
					pupilCollectionIds,
					query: 'BULK_UPDATE_AUTHOR_FOR_PUPIL_COLLECTIONS',
				}
			);
		}
	}

	static async deleteAssignmentResponses(assignmentResponseIds: string[]): Promise<void> {
		try {
			await dataService.mutate({
				mutation: DELETE_ASSIGNMENT_RESPONSES,
				variables: { assignmentResponseIds },
				update: ApolloCacheManager.clearAssignmentCache,
			});
		} catch (err) {
			const error = new CustomError('Failed to delete assignment responses', err, {
				assignmentResponseIds,
			});
			console.error(error);
			throw error;
		}
	}

	static async updatePupilCollectionBlocks(
		assignmentResponseId: string,
		original: PupilCollectionFragment[],
		update: PupilCollectionFragment[]
	): Promise<any> {
		const deleted = original.filter((block) =>
			without(
				original.map((block) => block.id),
				...update.map((block) => block.id)
			).includes(block.id)
		);

		const created = update.filter(isNewAssignmentBlock);
		const existing = update.filter(
			(block) =>
				!deleted.map((d) => d.id).includes(block.id) &&
				!created.map((d) => d.id).includes(block.id)
		);

		const cleanup = (block: PupilCollectionFragment) => {
			delete block.item_meta;
			delete (block as any).icon;
			delete (block as any).onSlice;
			delete (block as any).onPositionChange;

			block.updated_at = new Date().toISOString();

			return block;
		};

		const promises = [
			...existing
				.map(cleanup)
				.filter((block) => block.id)
				.map((block) =>
					dataService.mutate({
						mutation: UPDATE_PUPIL_COLLECTION_BLOCK,
						variables: { blockId: block.id, update: block },
						update: ApolloCacheManager.clearAssignmentCache,
					})
				),
			...deleted.map(cleanup).map((block) =>
				dataService.mutate({
					mutation: UPDATE_PUPIL_COLLECTION_BLOCK,
					variables: { blockId: block.id, update: { ...block, is_deleted: true } },
					update: ApolloCacheManager.clearAssignmentCache,
				})
			),
		];

		if (created.length > 0) {
			promises.push(
				dataService.mutate({
					mutation: INSERT_PUPIL_COLLECTION_BLOCKS,
					variables: {
						pupilCollectionBlocks: created
							.map(cleanup)
							.map((block) => ({
								...block,
								assignment_response_id: assignmentResponseId,
							}))
							.map((block) => {
								delete (block as any).id;
								return block;
							}),
					},
					update: ApolloCacheManager.clearAssignmentCache,
				})
			);
		}

		return await Promise.all(promises);
	}

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
	): Promise<Avo.Core.BlockItemBase> {
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

		const response = await dataService.mutate({
			mutation: INSERT_PUPIL_COLLECTION_BLOCKS,
			variables: {
				pupilCollectionBlocks: [block],
			},
			update: ApolloCacheManager.clearAssignmentCache,
		});

		const insertedBlock = response?.data?.insert_app_pupil_collection_blocks?.returning?.[0];

		if (!insertedBlock) {
			throw new Error(
				JSON.stringify({
					message: 'Failed to insert block into pupil collection',
					additionalInfo: {
						block,
						assignmentResponseId,
					},
				})
			);
		}

		insertedBlock.item_meta = item;

		return insertedBlock;
	}
}
