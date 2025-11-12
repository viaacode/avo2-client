import { type Avo } from '@viaa/avo2-types';

import { ItemsService } from '../admin/items/items.service.js';
import { AssignmentLayout } from '../assignment/assignment.types.js';
import { CollectionService } from '../collection/collection.service.js';
import { CollectionOrBundle } from '../collection/collection.types.js';
import { type QuickLaneType } from '../shared/components/QuickLaneContent/QuickLaneContent.types.js';
import {
	type GetQuickLaneByContentAndOwnerQuery,
	type GetQuickLaneByContentAndOwnerQueryVariables,
	type GetQuickLaneByIdQuery,
	type GetQuickLaneByIdQueryVariables,
	type InsertQuickLanesMutation,
	type InsertQuickLanesMutationVariables,
	type RemoveQuickLanesMutation,
	type RemoveQuickLanesMutationVariables,
	type UpdateQuickLaneByIdMutation,
	type UpdateQuickLaneByIdMutationVariables,
} from '../shared/generated/graphql-db-operations.js';
import {
	GetQuickLaneByContentAndOwnerDocument,
	GetQuickLaneByIdDocument,
	InsertQuickLanesDocument,
	RemoveQuickLanesDocument,
	UpdateQuickLaneByIdDocument,
} from '../shared/generated/graphql-db-react-query.js';
import { CustomError } from '../shared/helpers/custom-error.js';
import { quickLaneUrlRecordToObject } from '../shared/helpers/quick-lane-url-record-to-object.js';
import { dataService } from '../shared/services/data-service.js';
import { type QuickLaneUrlObject, type QuickLaneUrlRecord } from '../shared/types/index.js';

// Mappers

const quickLaneUrlObjectToRecord = (object: QuickLaneUrlObject) => {
	const mapped = { ...object } as unknown as QuickLaneUrlRecord;

	switch (Number(object.view_mode)) {
		case AssignmentLayout.PlayerAndText:
			mapped.view_mode = 'full';
			break;

		case AssignmentLayout.OnlyPlayer:
			mapped.view_mode = 'without_description';
			break;

		default:
			break;
	}

	if (mapped.id.length === 0) {
		delete (mapped as Partial<QuickLaneUrlRecord>).id;
	}

	// Don't pass the owner object in the mutation
	delete (mapped as Partial<QuickLaneUrlRecord>).owner;

	return mapped;
};

// Helpers

const checkForItemReplacements = async (item: Avo.Item.Item): Promise<Avo.Item.Item> => {
	// Note: because of the GET_ITEM_BY_UUID gql, the item coming in here only has IS_REPLACED_BY-type relations
	// hence why we don't filter and just grab the most recently updated one
	const replacement = item.relations?.sort((a, b) => {
		return new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf();
	})[0];

	if (replacement) {
		return ItemsService.fetchItemByUuid(replacement.object, false);
	}

	return Promise.resolve(item);
};

// Service

export class QuickLaneService {
	// CREATE

	static async insertQuickLanes(objects: QuickLaneUrlObject[]): Promise<QuickLaneUrlObject[]> {
		const now: string = new Date().toISOString();

		try {
			const response = await dataService.query<
				InsertQuickLanesMutation,
				InsertQuickLanesMutationVariables
			>({
				query: InsertQuickLanesDocument,
				variables: {
					objects: objects.map((object) => {
						return {
							...quickLaneUrlObjectToRecord(object),
							created_at: now,
							updated_at: now,
						};
					}),
				} as InsertQuickLanesMutationVariables,
			});

			const success =
				response?.insert_app_quick_lanes?.returning?.every((record) => record.id) || true;

			if (!success) {
				throw new CustomError(
					'Saving the quick lane urls failed, some ids were missing',
					null,
					{
						objects,
						response,
					}
				);
			}

			return (
				response?.insert_app_quick_lanes?.returning?.map(quickLaneUrlRecordToObject) || []
			);
		} catch (err) {
			throw new CustomError('Failed to insert quick lane urls', err, {
				objects,
				query: 'INSERT_QUICK_LANE',
			});
		}
	}

	// READ

	static async fetchQuickLaneById(id: string): Promise<QuickLaneUrlObject> {
		try {
			const response = await dataService.query<
				GetQuickLaneByIdQuery,
				GetQuickLaneByIdQueryVariables
			>({
				query: GetQuickLaneByIdDocument,
				variables: { id },
			});

			const urls: QuickLaneUrlObject[] | undefined = response.app_quick_lanes.map(
				quickLaneUrlRecordToObject
			);

			if (!urls || urls.length < 1) {
				throw new CustomError('Quick lane url does not exist', null, {
					response,
				});
			}

			const url = urls[0];

			// Enrich
			switch (url.content_label) {
				case 'ITEM':
					url.content = await checkForItemReplacements(
						await ItemsService.fetchItemByUuid(url.content_id || '', false)
					);
					break;

				case 'COLLECTIE':
					url.content = (await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
						url.content_id || '',
						CollectionOrBundle.COLLECTION,
						undefined
					)) as Avo.Collection.Collection;
					break;

				default:
					break;
			}

			return url;
		} catch (err) {
			throw new CustomError('Failed to get quick lane url by id from database', err, {
				id,
				query: 'GET_QUICK_LANE_BY_ID',
			});
		}
	}

	static async fetchQuickLanesByContentAndOwnerId(
		contentId: string,
		contentLabel: QuickLaneType,
		profileId: string
	): Promise<QuickLaneUrlObject[]> {
		try {
			const response = await dataService.query<
				GetQuickLaneByContentAndOwnerQuery,
				GetQuickLaneByContentAndOwnerQueryVariables
			>({
				query: GetQuickLaneByContentAndOwnerDocument,
				variables: { contentId, contentLabel, profileId },
			});

			const urls: QuickLaneUrlObject[] | undefined = response.app_quick_lanes.map(
				quickLaneUrlRecordToObject
			);

			if (!urls) {
				throw new CustomError('Quick lane url does not exist', null, {
					response,
				});
			}

			return urls.length > 0 ? [urls[0]] : [];
		} catch (err) {
			throw new CustomError(
				'Failed to get quick lane url by content and profile id from database',
				err,
				{
					contentId,
					contentLabel,
					profileId,
					query: 'GET_QUICK_LANE_BY_CONTENT_AND_OWNER',
				}
			);
		}
	}

	// UPDATE

	static async updateQuickLaneById(
		id: string,
		object: QuickLaneUrlObject
	): Promise<QuickLaneUrlObject[]> {
		const now: string = new Date().toISOString();

		try {
			const response = await dataService.query<
				UpdateQuickLaneByIdMutation,
				UpdateQuickLaneByIdMutationVariables
			>({
				query: UpdateQuickLaneByIdDocument,
				variables: {
					id,
					object: {
						...quickLaneUrlObjectToRecord(object),
						updated_at: now,
					},
				},
			});

			const success =
				response?.update_app_quick_lanes?.returning?.every((record) => record.id) || true;

			if (!success) {
				throw new CustomError('Updating the quick lane failed, its id was missing', null, {
					id,
					object,
					response,
				});
			}

			return (
				response?.update_app_quick_lanes?.returning?.map(quickLaneUrlRecordToObject) || []
			);
		} catch (err) {
			throw new CustomError('Failed to update quick lane url', err, {
				id,
				object,
				query: 'INSERT_QUICK_LANE',
			});
		}
	}

	// DELETE

	static async removeQuickLanesById(ids: string[], profileId: string): Promise<number> {
		try {
			const variables: RemoveQuickLanesMutationVariables = {
				ids,
				profileId,
			};
			const response = await dataService.query<
				RemoveQuickLanesMutation,
				RemoveQuickLanesMutationVariables
			>({
				query: RemoveQuickLanesDocument,
				variables,
			});

			const removed = response?.delete_app_quick_lanes?.returning || [];
			const missing = ids.filter((id) => !removed.find((item) => item.id == id));

			if (missing.length > 0) {
				console.warn('Could not remove all quick lane urls', {
					ids,
					response,
				});
			}

			return removed.length;
		} catch (err) {
			throw new CustomError('Failed to remove quick lane urls', err, {
				ids,
				query: 'REMOVE_QUICK_LANE',
			});
		}
	}
}
