import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError, getEnv } from '../../shared/helpers';

import { type AssignmentSortProps } from './assignments.types';

export class AssignmentsAdminService {
	static async getAssignments(
		offset: number,
		limit: number,
		sortColumn: AssignmentSortProps,
		sortOrder: Avo.Search.OrderDirection,
		filters: any,
		isCollection: boolean,
		includeRelations: boolean
	): Promise<{ assignments: Avo.Collection.Collection[]; total: number }> {
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/admin.mjs');
			return await fetchWithLogoutJson<{
				assignments: Avo.Collection.Collection[];
				total: number;
			}>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/assignments/admin/overview`,
					query: {
						offset,
						limit,
						sortColumn,
						sortOrder,
						filters: JSON.stringify(filters),
						isCollection,
						includeRelations,
					},
				})
			);
		} catch (err) {
			throw new CustomError('Failed to get assignments from the database', err, {
				offset,
				limit,
				sortColumn,
				sortOrder,
				filters,
				isCollection,
			});
		}
	}

	static async getAssignmentsWithMarcom(
		offset: number,
		limit: number,
		sortColumn: AssignmentSortProps,
		sortOrder: Avo.Search.OrderDirection,
		filters: any,
		includeRelations: boolean
	): Promise<{ assignments: Avo.Assignment.Assignment[]; total: number }> {
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/admin.mjs');
			return await fetchWithLogoutJson<{
				assignments: Avo.Assignment.Assignment[];
				total: number;
			}>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/assignments/admin/overview/marcom`,
					query: {
						offset,
						limit,
						sortColumn,
						sortOrder,
						filters: JSON.stringify(filters),
						includeRelations,
					},
				})
			);
		} catch (err) {
			throw new CustomError(
				'Failed to get assignment marcom entries from the database',
				err,
				{
					offset,
					limit,
					sortColumn,
					sortOrder,
					filters,
				}
			);
		}
	}

	static async getAssignmentIds(filters: any): Promise<string[]> {
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/admin.mjs');
			const response = await fetchWithLogoutJson<{
				assignmentIds: string[];
			}>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/assignments/admin-overview/ids`,
					query: {
						filters: JSON.stringify(filters),
					},
				})
			);
			return response?.assignmentIds || [];
		} catch (err) {
			throw new CustomError('Failed to get collection ids from the database', err, {
				filters,
			});
		}
	}

	static async bulkUpdateAuthorForAssignments(
		authorId: string,
		assignmentIds: string[]
	): Promise<void> {
		let url: string | undefined = undefined;
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/admin.mjs');
			url = `${getEnv('PROXY_URL')}/assignments/bulk/change-user`;
			await fetchWithLogoutJson<{
				assignmentIds: string[];
			}>(
				stringifyUrl({
					url,
					query: {
						authorId,
						assignmentIds,
					},
				})
			);
		} catch (err) {
			throw new CustomError('Failed to update author for assignments in the database', err, {
				url,
				authorId,
				assignmentIds,
				query: 'BulkUpdateAuthorForAssignments',
			});
		}
	}

	static async bulkDeleteAssignments(
		assignmentIds: string[],
		updatedByProfileId: string
	): Promise<void> {
		let url: string | undefined = undefined;
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/admin.mjs');
			url = `${getEnv('PROXY_URL')}/assignments/bulk/delete`;
			await fetchWithLogoutJson<{
				assignmentIds: string[];
			}>(
				stringifyUrl({
					url,
					query: {
						assignmentIds,
						updatedByProfileId,
					},
				})
			);
		} catch (err) {
			throw new CustomError('Failed to delete assignments in the database', err, {
				assignmentIds,
				query: 'BULK_DELETE_ASSIGNMENTS',
			});
		}
	}
}
