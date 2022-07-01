import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../shared/helpers';
import { getOrderObject } from '../shared/helpers/generate-order-gql-query';
import { ApolloCacheManager, dataService } from '../shared/services';
import { TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	ITEMS_PER_PAGE,
	PUPIL_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './pupil-collection.const';
import {
	BULK_UPDATE_AUTHOR_FOR_PUPIL_COLLECTIONS,
	DELETE_PUPIL_COLLECTIONS,
	GET_PUPIL_COLLECTION_IDS,
	GET_PUPIL_COLLECTIONS_ADMIN_OVERVIEW,
} from './pupil-collection.gql';
import { PupilCollectionOverviewTableColumns } from './pupil-collection.types';

export class PupilCollectionService {
	static async fetchPupilCollectionsForAdmin(
		page: number,
		sortColumn: PupilCollectionOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any = {},
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.Assignment.Response_v2[], number]> {
		let variables;
		try {
			variables = {
				where,
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					PUPIL_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};

			const response = await dataService.query({
				variables,
				query: GET_PUPIL_COLLECTIONS_ADMIN_OVERVIEW,
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}

			const pupilCollections: Avo.Assignment.Response_v2[] =
				response?.data?.app_assignment_responses_v2;

			const assignmentCount =
				response?.data?.app_assignment_responses_v2_aggregate?.aggregate?.count || 0;

			if (!pupilCollections) {
				throw new CustomError('Response does not contain any pupil collections', null, {
					response,
				});
			}

			return [pupilCollections as Avo.Assignment.Response_v2[], assignmentCount];
		} catch (err) {
			throw new CustomError('Failed to get pupil collections from the database', err, {
				variables,
				query: 'GET_PUPIL_COLLECTIONS_ADMIN_OVERVIEW',
			});
		}
	}

	static async getPupilCollectionIds(where: any = {}): Promise<string[]> {
		let variables;
		try {
			const whereWithoutDeleted = {
				...where,
				is_deleted: { _eq: false },
			};

			variables = {
				where: whereWithoutDeleted,
			};

			const response = await dataService.query({
				variables,
				query: GET_PUPIL_COLLECTION_IDS,
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}

			const pupilCollectionIds: string[] = (response?.data?.app_assignments_v2 || []).map(
				(assignment: Avo.Assignment.Assignment_v2) => assignment.id
			);

			if (!pupilCollectionIds) {
				throw new CustomError('Response does not contain any pupil collection ids', null, {
					response,
				});
			}

			return pupilCollectionIds;
		} catch (err) {
			throw new CustomError('Failed to get pupil collection ids from the database', err, {
				variables,
				query: 'GET_PUPIL_COLLECTION_IDS',
			});
		}
	}

	static async changePupilCollectionsAuthor(
		profileId: string,
		pupilCollectionIds: string[]
	): Promise<void> {
		try {
			const response = await dataService.mutate({
				mutation: BULK_UPDATE_AUTHOR_FOR_PUPIL_COLLECTIONS,
				variables: {
					pupilCollectionIds,
					authorId: profileId,
					now: new Date().toISOString(),
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}

			return response?.data?.update_app_assignments_v2?.affected_rows || 0;
		} catch (err) {
			throw new CustomError(
				'Failed to update author for pupil collections in the database',
				err,
				{
					profileId,
					pupilCollectionIds,
					query: 'BULK_UPDATE_AUTHOR_FOR_PUPIL_COLLECTIONS',
				}
			);
		}
	}

	static async deletePupilCollections(pupilCollectionIds: string[]) {
		try {
			await dataService.mutate({
				mutation: DELETE_PUPIL_COLLECTIONS,
				variables: { pupilCollectionIds },
				update: ApolloCacheManager.clearAssignmentCache,
			});
		} catch (err) {
			const error = new CustomError('Failed to delete pupil collections', err, {
				pupilCollectionIds,
			});
			console.error(error);
			throw error;
		}
	}
}
