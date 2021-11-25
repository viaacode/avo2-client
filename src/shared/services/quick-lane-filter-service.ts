import { ApolloQueryResult } from 'apollo-boost';

import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';

import { DateRange } from '../components/DateRangeDropdown/DateRangeDropdown';
import { CustomError } from '../helpers';
import { quickLaneUrlRecordToObject } from '../helpers/quick-lane-url-record-to-object';
import { GET_QUICK_LANE_WITH_FILTERS } from '../queries/quick-lane.gql';
import { QuickLaneQueryResponse, QuickLaneUrlObject } from '../types';

import { dataService } from '.';

export interface QuickLaneFilters {
	filterString?: string;
	companyIds?: string[];
	profileIds?: string[];
	contentLabels?: AssignmentContentLabel[];
	createdAt?: DateRange;
	updatedAt?: DateRange;
}

const asISO = (str?: string) => {
	return str && str.length > 0 ? new Date(str).toISOString() : undefined;
};

export class QuickLaneFilterService {
	static async fetchFilteredQuickLanes(params?: QuickLaneFilters) {
		try {
			const variables = {
				filterString: `%${params?.filterString ?? ''}%`,
				createdAtGte: asISO(params?.createdAt?.gte),
				createdAtLte: asISO(params?.createdAt?.lte),
				updatedAtGte: asISO(params?.updatedAt?.gte),
				updatedAtLte: asISO(params?.updatedAt?.lte),
				filters: [
					{
						_or: params?.profileIds?.map((id) => {
							return { owner_profile_id: { _eq: id } };
						}),
					},
					{
						_or: params?.companyIds?.map((id) => {
							return { owner: { company_id: { _eq: id } } };
						}),
					},
					{
						_or: params?.contentLabels?.map((id) => {
							return { content_label: { _eq: id } };
						}),
					},
				].filter((condition) => condition._or && condition._or.length > 0),
			};

			const response: ApolloQueryResult<QuickLaneQueryResponse> = await dataService.query({
				variables,
				query: GET_QUICK_LANE_WITH_FILTERS,
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const urls: QuickLaneUrlObject[] = response.data.app_quick_lanes.map(
				quickLaneUrlRecordToObject
			);

			return urls;
		} catch (err) {
			throw new CustomError('Failed to get filtered quick lane urls from database', err, {
				params,
				query: 'GET_FILTERED_QUICK_LANES',
			});
		}
	}
}
