import { ApolloQueryResult } from 'apollo-boost';

import { CustomError } from '../../../shared/helpers';
import { quickLaneUrlRecordToObject } from '../../../shared/helpers/quick-lane-url-record-to-object';
import { dataService } from '../../../shared/services';
import { QuickLaneQueryResponse, QuickLaneUrlObject } from '../../../shared/types';
import { GET_QUICK_LANE_BY_CONTENT_ID } from '../queries/quick-lane-containing.gql';

export class QuickLaneFilterService {
	static async fetchFilteredQuickLanes(contentId: string) {
		try {
			const variables = {
				contentId,
			};

			const response: ApolloQueryResult<QuickLaneQueryResponse> = await dataService.query({
				variables,
				query: GET_QUICK_LANE_BY_CONTENT_ID,
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const urls: QuickLaneUrlObject[] = response.data.app_quick_lanes.map(
				quickLaneUrlRecordToObject
			);

			return urls;
		} catch (err) {
			throw new CustomError(
				'Failed to get quick lane urls by content id from database',
				err,
				{
					contentId,
					query: 'GET_QUICK_LANE_BY_CONTENT_ID',
				}
			);
		}
	}
}
