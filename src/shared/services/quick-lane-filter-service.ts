import { type Avo } from '@viaa/avo2-types';

import { type DateRange } from '../components/DateRangeDropdown/DateRangeDropdown.js';
import { type QuickLaneType } from '../components/QuickLaneContent/QuickLaneContent.types.js';
import {
	type GetQuickLanesWithFiltersQuery,
	type GetQuickLanesWithFiltersQueryVariables,
} from '../generated/graphql-db-operations.js';
import { GetQuickLanesWithFiltersDocument } from '../generated/graphql-db-react-query.js';
import { type App_Quick_Lanes_Bool_Exp } from '../generated/graphql-db-types.js';
import { CustomError } from '../helpers/custom-error.js';
import { getOrderObject } from '../helpers/generate-order-gql-query.js';
import { quickLaneUrlRecordToObject } from '../helpers/quick-lane-url-record-to-object.js';
import { type QuickLaneUrlObject } from '../types/index.js';
import { type TableColumnDataType } from '../types/table-column-data-type.js';

import { dataService } from './data-service.js';

export interface QuickLaneFilters {
	filterString?: string;
	companyIds?: string[];
	profileIds?: string[];
	contentLabels?: QuickLaneType[];
	createdAt?: DateRange;
	updatedAt?: DateRange;
	sortColumn?: string;
	sortOrder?: Avo.Search.OrderDirection;
	sortType?: TableColumnDataType;
	limit: number;
	offset: number;
}

const asISO = (str?: string) => {
	return str && str.length > 0 ? new Date(str).toISOString() : undefined;
};

const constructTimestampFilters = (params: QuickLaneFilters) => {
	const iso = {
		cGte: asISO(params.createdAt?.gte),
		cLte: asISO(params.createdAt?.lte),
		uGte: asISO(params.updatedAt?.gte),
		uLte: asISO(params.updatedAt?.lte),
	};

	const hasCreatedAtFilter = iso.cGte || iso.cLte;
	const hasUpdatedAtFilter = iso.uGte || iso.uLte;

	const hasAnyTimestampFilter = hasCreatedAtFilter || hasUpdatedAtFilter;

	if (!hasAnyTimestampFilter) {
		return null;
	}

	return {
		_and: [
			...(hasCreatedAtFilter
				? [
						{
							created_at: {
								...(iso.cGte ? { _gte: iso.cGte } : {}),
								...(iso.cLte ? { _lte: iso.cLte } : {}),
							},
						},
				  ]
				: []),
			...(hasUpdatedAtFilter
				? [
						{
							updated_at: {
								...(iso.uGte ? { _gte: iso.uGte } : {}),
								...(iso.uLte ? { _lte: iso.uLte } : {}),
							},
						},
				  ]
				: []),
		],
	};
};

export class QuickLaneFilterService {
	static async fetchFilteredQuickLanes(
		params?: QuickLaneFilters
	): Promise<{ urls: QuickLaneUrlObject[]; count: number }> {
		try {
			const variables: GetQuickLanesWithFiltersQueryVariables = {
				limit: params?.limit,
				offset: params?.offset,
				filterString: `%${params?.filterString ?? ''}%`,
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
								author: (order: Avo.Search.OrderDirection) => ({
									owner: { first_name: order },
								}),
						  })
						: undefined,
			};

			const timestampFilters = params && constructTimestampFilters(params);

			if (timestampFilters) {
				// Circumvent const typing
				(variables.filters as Array<App_Quick_Lanes_Bool_Exp>).push(
					timestampFilters as any
				);
			}

			const response = await dataService.query<
				GetQuickLanesWithFiltersQuery,
				GetQuickLanesWithFiltersQueryVariables
			>({
				query: GetQuickLanesWithFiltersDocument,
				variables,
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
