import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './user.const';
import { GET_USER_ROLES, GET_USERS } from './user.gql';
import { UserOverviewTableCol } from './user.types';

export class UserService {
	private static getOrderObject(
		sortColumn: UserOverviewTableCol,
		sortOrder: Avo.Search.OrderDirection
	) {
		const getOrderFunc: Function | undefined =
			TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT[sortColumn];

		if (getOrderFunc) {
			return [getOrderFunc(sortOrder)];
		}

		return [{ [sortColumn]: sortOrder }];
	}

	public static async getProfiles(
		page: number,
		sortColumn: UserOverviewTableCol,
		sortOrder: Avo.Search.OrderDirection,
		queryText: string,
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.User.Profile[], number]> {
		let variables: any;
		try {
			variables = {
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				orderBy: this.getOrderObject(sortColumn, sortOrder),
				queryText: `%${queryText}%`,
			};
			const response = await dataService.query({
				variables,
				query: GET_USERS,
			});
			const profiles = get(response, 'data.users_profiles');
			const profileCount = get(response, 'data.users_profiles_aggregate.aggregate.count');

			if (!profiles) {
				throw new CustomError('Response does not contain any profiles', null, {
					response,
				});
			}

			return [profiles, profileCount];
		} catch (err) {
			throw new CustomError('Failed to get profiles from the database', err, {
				variables,
				query: 'GET_USERS',
			});
		}
	}

	public static async getUserRoles(): Promise<Avo.User.Role[]> {
		try {
			const response = await dataService.query({
				query: GET_USER_ROLES,
			});
			const roles = get(response, 'data.shared_user_roles');

			if (!roles) {
				throw new CustomError('Response does not contain any roles', null, {
					response,
				});
			}

			return roles;
		} catch (err) {
			throw new CustomError('Failed to get user roles from the database', err, {
				query: 'GET_USER_ROLES',
			});
		}
	}
}
