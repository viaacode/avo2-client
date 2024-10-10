import { type Avo } from '@viaa/avo2-types';
import { without } from 'lodash-es';

import { isNewAssignmentBlock } from '../assignment/assignment.const';
import { type PupilCollectionFragment } from '../assignment/assignment.types';
import { type ItemTrimInfo } from '../item/item.types';
import {
	type BulkUpdateAuthorForPupilCollectionsMutation,
	type BulkUpdateAuthorForPupilCollectionsMutationVariables,
	type DeleteAssignmentResponsesMutation,
	type DeleteAssignmentResponsesMutationVariables,
	type GetMaxPositionPupilCollectionBlocksQuery,
	type GetMaxPositionPupilCollectionBlocksQueryVariables,
	type GetPupilCollectionIdsQuery,
	type GetPupilCollectionIdsQueryVariables,
	type GetPupilCollectionsAdminOverviewQuery,
	type GetPupilCollectionsAdminOverviewQueryVariables,
	type InsertPupilCollectionBlocksMutation,
	type InsertPupilCollectionBlocksMutationVariables,
	type UpdatePupilCollectionBlockMutation,
	type UpdatePupilCollectionBlockMutationVariables,
} from '../shared/generated/graphql-db-operations';
import {
	BulkUpdateAuthorForPupilCollectionsDocument,
	DeleteAssignmentResponsesDocument,
	GetMaxPositionPupilCollectionBlocksDocument,
	GetPupilCollectionIdsDocument,
	GetPupilCollectionsAdminOverviewDocument,
	InsertPupilCollectionBlocksDocument,
	UpdatePupilCollectionBlockDocument,
} from '../shared/generated/graphql-db-react-query';
import { CustomError } from '../shared/helpers';
import { getOrderObject } from '../shared/helpers/generate-order-gql-query';
import { dataService } from '../shared/services/data-service';
import { VideoStillService } from '../shared/services/video-stills-service';
import { type TableColumnDataType } from '../shared/types/table-column-data-type';

import { PUPIL_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './pupil-collection.const';
import { type PupilCollectionOverviewTableColumns } from './pupil-collection.types';

export class PupilCollectionService {
	static async fetchPupilCollectionsForAdmin(
		offset: number,
		limit: number,
		sortColumn: PupilCollectionOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any = {}
	): Promise<[Avo.Assignment.Response[], number]> {
		let variables;
		try {
			variables = {
				where,
				offset,
				limit,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					PUPIL_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};

			const response = await dataService.query<
				GetPupilCollectionsAdminOverviewQuery,
				GetPupilCollectionsAdminOverviewQueryVariables
			>({
				variables,
				query: GetPupilCollectionsAdminOverviewDocument,
			});

			const pupilCollections = response?.app_assignment_responses_v2;

			const assignmentCount =
				response?.app_assignment_responses_v2_aggregate?.aggregate?.count || 0;

			if (!pupilCollections) {
				throw new CustomError('Response does not contain any pupil collections', null, {
					response,
				});
			}

			return [pupilCollections as Avo.Assignment.Response[], assignmentCount];
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

			const response = await dataService.query<
				GetPupilCollectionIdsQuery,
				GetPupilCollectionIdsQueryVariables
			>({
				variables,
				query: GetPupilCollectionIdsDocument,
			});

			const pupilCollectionIds: string[] = (response?.app_assignment_responses_v2 || []).map(
				(assignmentResponse) => assignmentResponse.id
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
	): Promise<number> {
		try {
			const response = await dataService.query<
				BulkUpdateAuthorForPupilCollectionsMutation,
				BulkUpdateAuthorForPupilCollectionsMutationVariables
			>({
				query: BulkUpdateAuthorForPupilCollectionsDocument,
				variables: {
					pupilCollectionIds,
					authorId: profileId,
					now: new Date().toISOString(),
				},
			});

			return response?.update_app_assignment_responses_v2?.affected_rows || 0;
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
			await dataService.query<
				DeleteAssignmentResponsesMutation,
				DeleteAssignmentResponsesMutationVariables
			>({
				query: DeleteAssignmentResponsesDocument,
				variables: { assignmentResponseIds },
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

		const cleanup = (block: Avo.Core.BlockItemBase) => {
			delete block.item_meta;
			delete (block as any).icon;
			delete (block as any).onSlice;
			delete (block as any).onPositionChange;
			delete (block as any).original_title; // Only needed for assignment blocks
			delete (block as any).original_description; // Only needed for assignment blocks
			delete (block as Avo.Assignment.Block).color;

			block.updated_at = new Date().toISOString();

			return block;
		};

		const promises = [
			...existing
				.map(cleanup)
				.filter((block) => block.id)
				.map((block) =>
					dataService.query<
						UpdatePupilCollectionBlockMutation,
						UpdatePupilCollectionBlockMutationVariables
					>({
						query: UpdatePupilCollectionBlockDocument,
						variables: { blockId: block.id, update: block },
					})
				),
			...deleted.map(cleanup).map((block) =>
				dataService.query<
					UpdatePupilCollectionBlockMutation,
					UpdatePupilCollectionBlockMutationVariables
				>({
					query: UpdatePupilCollectionBlockDocument,
					variables: { blockId: block.id, update: { ...block, is_deleted: true } },
				})
			),
		];

		if (created.length > 0) {
			promises.push(
				dataService.query<
					InsertPupilCollectionBlocksMutation,
					InsertPupilCollectionBlocksMutationVariables
				>({
					query: InsertPupilCollectionBlocksDocument,
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
				})
			);
		}

		return await Promise.all(promises);
	}

	static async getPupilCollectionBlockMaxPosition(
		assignmentResponseId: string
	): Promise<number | null> {
		const result = await dataService.query<
			GetMaxPositionPupilCollectionBlocksQuery,
			GetMaxPositionPupilCollectionBlocksQueryVariables
		>({
			query: GetMaxPositionPupilCollectionBlocksDocument,
			variables: { assignmentResponseId },
		});
		return (
			result.app_assignment_responses_v2_by_pk?.pupil_collection_blocks_aggregate.aggregate
				?.max?.position || null
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
		const thumbnailPath = trimInfo.hasCut
			? await VideoStillService.getVideoStill(
					item.external_id,
					trimInfo.fragmentStartTime * 1000
			  )
			: null;

		// Determine block position
		const currentMaxPosition =
			await PupilCollectionService.getPupilCollectionBlockMaxPosition(assignmentResponseId);
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

		const response = await dataService.query<
			InsertPupilCollectionBlocksMutation,
			InsertPupilCollectionBlocksMutationVariables
		>({
			query: InsertPupilCollectionBlocksDocument,
			variables: {
				pupilCollectionBlocks: [block],
			},
		});

		const insertedBlock = response?.insert_app_pupil_collection_blocks?.returning?.[0];

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

		const returnObject = { ...insertedBlock, item_meta: item };

		return returnObject as Avo.Core.BlockItemBase;
	}
}
