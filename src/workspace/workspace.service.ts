import { ApolloQueryResult } from 'apollo-client';

import { CustomError } from '../shared/helpers';
import { quickLaneUrlRecordToObject } from '../shared/helpers/quick-lane-url-record-to-object';
import { dataService } from '../shared/services';
import { QuickLaneQueryResponse, QuickLaneUrlObject } from '../shared/types';

import { GET_QUICK_LANES_BY_COMPANY, GET_QUICK_LANES_BY_OWNER } from './workspace.gql';

// Q: I'm assuming lazy loading here but should this method be in QuickLaneService instead?
export class WorkspaceService {
	static async fetchQuickLanesByOwnerId(profileId: string) {
		try {
			const response: ApolloQueryResult<QuickLaneQueryResponse> = await dataService.query({
				query: GET_QUICK_LANES_BY_OWNER,
				variables: { profileId },
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
				'Failed to get quick lane urls by profile id from database',
				err,
				{
					profileId,
					query: 'GET_QUICK_LANES_BY_OWNER',
				}
			);
		}
	}

	static async fetchQuickLanesByCompanyId(companyId: string) {
		try {
			const response: ApolloQueryResult<QuickLaneQueryResponse> = await dataService.query({
				query: GET_QUICK_LANES_BY_COMPANY,
				variables: { companyId },
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
				'Failed to get quick lane urls by company id from database',
				err,
				{
					companyId,
					query: 'GET_QUICK_LANES_BY_COMPANY',
				}
			);
		}
	}
}
