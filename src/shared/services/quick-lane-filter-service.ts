import { ApolloQueryResult } from 'apollo-boost';

import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { SearchOrderDirection } from '@viaa/avo2-types/types/search';

import { DateRange } from '../components/DateRangeDropdown/DateRangeDropdown';
import { CustomError } from '../helpers';
import { getOrderObject } from '../helpers/generate-order-gql-query';
import { quickLaneUrlRecordToObject } from '../helpers/quick-lane-url-record-to-object';
import { GET_QUICK_LANE_WITH_FILTERS } from '../queries/quick-lane-filter.gql';
import { QuickLaneQueryResponse, QuickLaneUrlObject } from '../types';
import { TableColumnDataType } from '../types/table-column-data-type';

import { dataService } from './data-service';

export interface QuickLaneFilters {
	filterString?: string;
	companyIds?: string[];
	profileIds?: string[];
	contentLabels?: AssignmentContentLabel[];
	createdAt?: DateRange;
	updatedAt?: DateRange;
	sortColumn?: string;
	sortOrder?: SearchOrderDirection;
	sortType?: TableColumnDataType;
	limit: number;
	offset: number;
}

const asISO = (str?: string) => {
	return str && str.length > 0 ? new Date(str).toISOString() : undefined;
};

export class QuickLaneFilterService {
	static async fetchFilteredQuickLanes(params?: QuickLaneFilters) {
		try {
			const variables = {
				limit: params?.limit,
				offset: params?.offset,
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
				orderBy:
					params?.sortColumn && params?.sortOrder && params?.sortType
						? getOrderObject(params.sortColumn, params.sortOrder, params.sortType, {
								author: (order: SearchOrderDirection) => ({
									owner: { usersByuserId: { first_name: order } },
								}),
						  })
						: undefined,
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

			return { urls, count: response.data.app_quick_lanes_aggregate.aggregate.count };
		} catch (err) {
			throw new CustomError('Failed to get filtered quick lane urls from database', err, {
				params,
				query: 'GET_FILTERED_QUICK_LANES',
			});
		}
	}
}
