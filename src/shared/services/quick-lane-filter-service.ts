import { SearchOrderDirection } from '@viaa/avo2-types/types/search';

import { DateRange } from '../components/DateRangeDropdown/DateRangeDropdown';
import {
	GetQuickLanesWithFiltersDocument,
	GetQuickLanesWithFiltersQuery,
	Lookup_Enum_Assignment_Content_Labels_Enum,
} from '../generated/graphql-db-types';
import { CustomError } from '../helpers';
import { getOrderObject } from '../helpers/generate-order-gql-query';
import { quickLaneUrlRecordToObject } from '../helpers/quick-lane-url-record-to-object';
import { QuickLaneUrlObject } from '../types';
import { TableColumnDataType } from '../types/table-column-data-type';

import { dataService } from './data-service';

export interface QuickLaneFilters {
	filterString?: string;
	companyIds?: string[];
	profileIds?: string[];
	contentLabels?: Lookup_Enum_Assignment_Content_Labels_Enum[];
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
	static async fetchFilteredQuickLanes(
		params?: QuickLaneFilters
	): Promise<{ urls: QuickLaneUrlObject[]; count: number }> {
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

			const response = await dataService.query<GetQuickLanesWithFiltersQuery>({
				variables,
				query: GetQuickLanesWithFiltersDocument,
			});

			const urls: QuickLaneUrlObject[] =
				response?.app_quick_lanes?.map(quickLaneUrlRecordToObject) || [];

			return { urls, count: response.app_quick_lanes_aggregate.aggregate?.count || 0 };
		} catch (err) {
			throw new CustomError('Failed to get filtered quick lane urls from database', err, {
				params,
				query: 'GET_FILTERED_QUICK_LANES',
			});
		}
	}
}
