import { Avo } from '@viaa/avo2-types';
import { sortBy } from 'lodash-es';

import {
	GetAllOrganisationsDocument,
	GetAllOrganisationsQuery,
	GetDistinctOrganisationsDocument,
	GetDistinctOrganisationsQuery,
	GetOrganisationsWithUsersDocument,
	GetOrganisationsWithUsersQuery,
	GetUsersByCompanyIdDocument,
	GetUsersByCompanyIdQuery,
} from '../generated/graphql-db-types';
import { CustomError } from '../helpers';

import { dataService } from './data-service';

export class OrganisationService {
	public static async fetchOrganisations(
		onlyWithItems: boolean
	): Promise<Partial<Avo.Organization.Organization>[]> {
		try {
			const response = await dataService.query<
				GetDistinctOrganisationsQuery | GetAllOrganisationsQuery
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

			return sortBy(organisations, 'name');
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
			const response = await dataService.query<GetOrganisationsWithUsersQuery>({
				query: GetOrganisationsWithUsersDocument,
			});

			const organisations: Partial<Avo.Organization.Organization>[] | null =
				response.shared_organisations_with_users;

			if (!organisations) {
				throw new CustomError('Response does not contain any organisations', null, {
					response,
				});
			}

			return sortBy(organisations, 'name');
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
			const response = await dataService.query<GetUsersByCompanyIdQuery>({
				query: GetUsersByCompanyIdDocument,
				variables: {
					companyId,
				},
			});

			const users: Partial<Avo.User.Profile>[] | null = response.users_profiles;

			if (!users) {
				throw new CustomError('Response does not contain any users', null, {
					response,
				});
			}

			return users;
		} catch (err) {
			throw new CustomError('Failed to get users by companyId from the database', err, {
				query: 'GET_USERS_IN_COMPANY',
			});
		}
	}
}
