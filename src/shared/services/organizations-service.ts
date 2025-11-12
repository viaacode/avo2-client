import {type Avo} from '@viaa/avo2-types';
import {sortBy} from 'es-toolkit';

import {
	type GetAllOrganisationsQuery,
	type GetAllOrganisationsQueryVariables,
	type GetDistinctOrganisationsQuery,
	type GetDistinctOrganisationsQueryVariables,
	type GetOrganisationsWithUsersQuery,
	type GetOrganisationsWithUsersQueryVariables,
	type GetUsersByCompanyIdQuery,
	type GetUsersByCompanyIdQueryVariables,
} from '../generated/graphql-db-operations.js';
import {
	GetAllOrganisationsDocument,
	GetDistinctOrganisationsDocument,
	GetOrganisationsWithUsersDocument,
	GetUsersByCompanyIdDocument,
} from '../generated/graphql-db-react-query.js';
import {CustomError} from '../helpers/custom-error.js';

import {dataService} from './data-service.js';

export class OrganisationService {
	public static async fetchOrganisations(
		onlyWithItems: boolean
	): Promise<Partial<Avo.Organization.Organization>[]> {
		try {
			const response = await dataService.query<
				GetDistinctOrganisationsQuery | GetAllOrganisationsQuery,
				GetDistinctOrganisationsQueryVariables | GetAllOrganisationsQueryVariables
			>({
				query: onlyWithItems
					? GetDistinctOrganisationsDocument
					: GetAllOrganisationsDocument,
			});

			let organisations: any[] | null;
			if (onlyWithItems) {
				organisations = (
					(response as GetDistinctOrganisationsQuery).app_item_meta ?? []
				).map((item) => item.organisation);
			} else {
				organisations = (response as GetAllOrganisationsQuery).shared_organisations;
			}

			if (!organisations) {
				throw new CustomError('Response does not contain any organisations', null, {
					response,
				});
			}

			return sortBy(organisations, ['name']);
		} catch (err) {
			throw new CustomError('Failed to get organisations from the database', err, {
				query: 'GET_ALL_ORGANISATIONS',
			});
		}
	}

	public static async fetchOrganisationsWithUsers(): Promise<
		Partial<Avo.Organization.Organization>[]
	> {
		try {
			const response = await dataService.query<
				GetOrganisationsWithUsersQuery,
				GetOrganisationsWithUsersQueryVariables
			>({
				query: GetOrganisationsWithUsersDocument,
			});

			const organisations = response.shared_organisations_with_users;

			if (!organisations) {
				throw new CustomError('Response does not contain any organisations', null, {
					response,
				});
			}

			return sortBy(organisations, ['name']) as Partial<Avo.Organization.Organization>[];
		} catch (err) {
			throw new CustomError('Failed to get organisations from the database', err, {
				query: 'GET_ORGANISATIONS_WITH_USERS',
			});
		}
	}

	public static async fetchUsersByCompanyId(
		companyId: string
	): Promise<Partial<Avo.User.Profile>[]> {
		try {
			const response = await dataService.query<
				GetUsersByCompanyIdQuery,
				GetUsersByCompanyIdQueryVariables
			>({
				query: GetUsersByCompanyIdDocument,
				variables: {
					companyId,
				},
			});

			const users = response.users_profiles;

			if (!users) {
				throw new CustomError('Response does not contain any users', null, {
					response,
				});
			}

			return users as Partial<Avo.User.Profile>[];
		} catch (err) {
			throw new CustomError('Failed to get users by companyId from the database', err, {
				query: 'GET_USERS_IN_COMPANY',
			});
		}
	}
}
