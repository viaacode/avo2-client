import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services';

import { ITEMS_PER_PAGE } from './user.const';
import { GET_USERS } from './user.gql';

export class UserService {
	public static async getProfiles(
		page: number,
		sortColumn: string,
		sortOrder: Avo.Search.OrderDirection,
		queryText: string,
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.User.Profile[], number]> {
		let variables: any;
		try {
			variables = {
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				orderBy: [{ [sortColumn]: sortOrder }],
				queryText: `%${queryText}%`,
			};
			const response = await dataService.query({
				variables,
				query: GET_USERS,
			});
			const profiles = get(response, 'data.users_profiles');
			const profileCount = get(response, 'data.users_profiles_aggregate.aggregate.count');

			if (!profiles) {
				throw new CustomError('Response does not contain any permission groups', null, {
					response,
				});
			}

			return [profiles, profileCount];
		} catch (err) {
			throw new CustomError('Failed to get permission groups from the database', err, {
				variables,
				query: 'GET_PERMISSION_GROUPS',
			});
		}
	}
}
