import { ApolloQueryResult } from 'apollo-boost';
import { get } from 'lodash-es';

import { AssignmentContent, AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { CollectionSchema } from '@viaa/avo2-types/types/collection';
import { UserProfile, UserSchema } from '@viaa/avo2-types/types/user';

import { ItemsService } from '../admin/items/items.service';
import { AssignmentLayout } from '../assignment/assignment.types';
import { CollectionService } from '../collection/collection.service';
import { CustomError } from '../shared/helpers';
import { dataService } from '../shared/services';

import {
	GET_QUICK_LANE_BY_CONTENT_AND_OWNER,
	GET_QUICK_LANE_BY_ID,
	INSERT_QUICK_LANE,
	UPDATE_QUICK_LANE,
} from './quick-lane.gql';

// Typing

export interface QuickLaneUrl {
	id: string;
	title: string;
	content?: AssignmentContent;
	content_id?: string;
	content_label?: AssignmentContentLabel;
	owner?: QuickLaneUrlOwner;
	owner_profile_id?: string;
	created_at?: string;
	updated_at?: string;
}

export interface QuickLaneUrlOwner extends Pick<UserProfile, 'id' | 'avatar'> {
	usersByuserId: Pick<UserSchema, 'full_name'>;
}

export interface QuickLaneUrlObject extends QuickLaneUrl {
	view_mode: AssignmentLayout;
}

export interface QuickLaneUrlRecord extends QuickLaneUrl {
	view_mode: 'full' | 'without_description';
}

export interface QuickLaneQueryResponse {
	app_quick_lanes: QuickLaneUrlRecord[];
}

export interface QuickLaneMutateResponse {
	insert_app_quick_lanes: {
		affected_rows: number;
		returning: QuickLaneUrlRecord[];
	};
}

// Mappers

const quickLaneUrlRecordToObject = (record: QuickLaneUrlRecord) => {
	const mapped = ({ ...record } as unknown) as QuickLaneUrlObject;

	switch (record.view_mode) {
		case 'full':
			mapped.view_mode = AssignmentLayout.PlayerAndText;
			break;

		case 'without_description':
			mapped.view_mode = AssignmentLayout.OnlyPlayer;
			break;

		default:
			break;
	}

	return mapped;
};

const quickLaneUrlObjectToRecord = (object: QuickLaneUrlObject) => {
	const mapped = ({ ...object } as unknown) as QuickLaneUrlRecord;

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

	return mapped;
};

// Service

export class QuickLaneService {
	// CREATE

	static async insertQuickLanes(objects: QuickLaneUrlObject[]): Promise<QuickLaneUrlObject[]> {
		const now: string = new Date().toISOString();

		try {
			const response = await dataService.mutate<QuickLaneMutateResponse>({
				mutation: INSERT_QUICK_LANE,
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

			const success = response.data?.insert_app_quick_lanes.returning.every(
				(record) => record.id
			);

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
				response.data || {
					insert_app_quick_lanes: { returning: [] as QuickLaneUrlRecord[] },
				}
			).insert_app_quick_lanes.returning.map(quickLaneUrlRecordToObject);
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
			const response: ApolloQueryResult<QuickLaneQueryResponse> = await dataService.query({
				query: GET_QUICK_LANE_BY_ID,
				variables: { id },
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const urls: QuickLaneUrlObject[] | undefined = get(
				response,
				'data.app_quick_lanes'
			).map(quickLaneUrlRecordToObject);

			if (!urls || urls.length !== 1) {
				throw new CustomError('Quick lane url does not exist', null, {
					response,
				});
			}

			const url = urls[0];

			// Enrich
			switch (url.content_label) {
				case 'ITEM':
					url.content = await ItemsService.fetchItemByUuid(url.content_id || '');
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

	static async fetchQuickLaneByContentAndOwnerId(
		contentId: string,
		contentLabel: AssignmentContentLabel,
		profileId: string
	): Promise<QuickLaneUrlObject[]> {
		try {
			const response: ApolloQueryResult<QuickLaneQueryResponse> = await dataService.query({
				query: GET_QUICK_LANE_BY_CONTENT_AND_OWNER,
				variables: { contentId, contentLabel, profileId },
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const urls: QuickLaneUrlObject[] | undefined = get(
				response,
				'data.app_quick_lanes'
			).map(quickLaneUrlRecordToObject);

			if (!urls) {
				throw new CustomError('Quick lane url does not exist', null, {
					response,
				});
			}

			return urls;
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
			const response = await dataService.mutate<QuickLaneMutateResponse>({
				mutation: UPDATE_QUICK_LANE,
				variables: {
					id,
					object: {
						...quickLaneUrlObjectToRecord(object),
						updated_at: now,
					},
				},
			});

			const success = response.data?.insert_app_quick_lanes.returning.every(
				(record) => record.id
			);

			if (!success) {
				throw new CustomError('Updating the quick lane failed, its id was missing', null, {
					id,
					object,
					response,
				});
			}

			return (
				response.data || {
					insert_app_quick_lanes: { returning: [] as QuickLaneUrlRecord[] },
				}
			).insert_app_quick_lanes.returning.map(quickLaneUrlRecordToObject);
		} catch (err) {
			throw new CustomError('Failed to update quick lane url', err, {
				id,
				object,
				query: 'INSERT_QUICK_LANE',
			});
		}
	}
}