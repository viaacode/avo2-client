import { ApolloQueryResult } from 'apollo-boost';
import { get } from 'lodash-es';

import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';

import { AssignmentLayout } from '../assignment/assignment.types';
import { CustomError } from '../shared/helpers';
import { dataService } from '../shared/services';

import { GET_QUICK_LANE_BY_CONTENT_AND_OWNER, INSERT_QUICK_LANE } from './quick-lane.gql';

// Typing

export interface QuickLaneUrl {
	id: string;
	title: string;
	content_id?: string;
	content_label?: AssignmentContentLabel;
	owner_profile_id?: string;
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

const QuickLaneUrlRecordToObject = (record: QuickLaneUrlRecord) => {
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

const QuickLaneUrlObjectToRecord = (object: QuickLaneUrlObject) => {
	const mapped = ({ ...object } as unknown) as QuickLaneUrlRecord;

	switch (object.view_mode) {
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
		try {
			const response = await dataService.mutate<QuickLaneMutateResponse>({
				mutation: INSERT_QUICK_LANE,
				variables: { objects: objects.map(QuickLaneUrlObjectToRecord) },
			});

			const success = response.data?.insert_app_quick_lanes.returning.every(
				(record) => record.id
			);

			if (!success) {
				throw new CustomError(
					"Saving the quick lanes failed, some id's were missing",
					null,
					{
						response,
					}
				);
			}

			return (
				response.data || {
					insert_app_quick_lanes: { returning: [] as QuickLaneUrlRecord[] },
				}
			).insert_app_quick_lanes.returning.map(QuickLaneUrlRecordToObject);
		} catch (err) {
			throw new CustomError('Failed to insert quick lanes', err, {
				objects,
				query: 'INSERT_QUICK_LANE',
			});
		}
	}

	// READ

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

			const assignments: QuickLaneUrlObject[] | undefined = get(
				response,
				'data.app_quick_lanes'
			).map(QuickLaneUrlRecordToObject);

			if (!assignments) {
				throw new CustomError('Quick lane url does not exist', null, {
					response,
				});
			}

			return assignments;
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
}
