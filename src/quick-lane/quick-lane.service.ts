import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { CollectionSchema } from '@viaa/avo2-types/types/collection';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import { get } from 'lodash-es';

import { ItemsService } from '../admin/items/items.service';
import { AssignmentLayout } from '../assignment/assignment.types';
import { CollectionService } from '../collection/collection.service';
import {
	GetQuickLaneByContentAndOwnerDocument,
	GetQuickLaneByContentAndOwnerQuery,
	GetQuickLaneByIdDocument,
	GetQuickLaneByIdQuery,
	InsertQuickLanesDocument,
	InsertQuickLanesMutation,
	UpdateQuickLaneByIdDocument,
	UpdateQuickLaneByIdMutation,
} from '../shared/generated/graphql-db-types';
import { CustomError } from '../shared/helpers';
import { quickLaneUrlRecordToObject } from '../shared/helpers/quick-lane-url-record-to-object';
import { dataService } from '../shared/services';
import { QuickLaneUrlObject, QuickLaneUrlRecord } from '../shared/types';

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

const checkForItemReplacements = async (item: ItemSchema): Promise<ItemSchema> => {
	// Note: because of the GET_ITEM_BY_UUID gql, the item coming in here only has IS_REPLACED_BY-type relations
	// hence why we don't filter and just grab the most recently updated one
	const replacement = item.relations?.sort((a, b) => {
		return new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf();
	})[0];

	if (replacement) {
		return ItemsService.fetchItemByUuid(replacement.object);
	}

	return Promise.resolve(item);
};

// Service

export class QuickLaneService {
	// CREATE

	static async insertQuickLanes(objects: QuickLaneUrlObject[]): Promise<QuickLaneUrlObject[]> {
		const now: string = new Date().toISOString();

		try {
			const response = await dataService.query<InsertQuickLanesMutation>({
				query: InsertQuickLanesDocument,
				variables: {
					objects: objects.map((object) => {
						return {
							...quickLaneUrlObjectToRecord(object),
							created_at: now,
							updated_at: now,
						};
					}),
				},
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
			const response = await dataService.query<GetQuickLaneByIdQuery>({
				query: GetQuickLaneByIdDocument,
				variables: { id },
			});

			const urls: QuickLaneUrlObject[] | undefined = get(
				response,
				'data.app_quick_lanes'
			).map(quickLaneUrlRecordToObject);

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
						await ItemsService.fetchItemByUuid(url.content_id || '')
					);
					break;

				case 'COLLECTIE':
					url.content = (await CollectionService.fetchCollectionOrBundleById(
						url.content_id || '',
						'collection',
						undefined
					)) as CollectionSchema;
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
		contentLabel: AssignmentContentLabel,
		profileId: string
	): Promise<QuickLaneUrlObject[]> {
		try {
			const response = await dataService.query<GetQuickLaneByContentAndOwnerQuery>({
				query: GetQuickLaneByContentAndOwnerDocument,
				variables: { contentId, contentLabel, profileId },
			});

			const urls: QuickLaneUrlObject[] | undefined = get(
				response,
				'data.app_quick_lanes'
			).map(quickLaneUrlRecordToObject);

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
			const response = await dataService.query<UpdateQuickLaneByIdMutation>({
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
}
