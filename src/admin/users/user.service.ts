import { get, omit } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { ApolloCacheManager, dataService } from '../../shared/services';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './user.const';
import { GET_USER_BY_ID, GET_USERS, UPDATE_USER_BLOCKED_STATUS } from './user.gql';
import { UserOverviewTableCol } from './user.types';

export class UserService {
	public static async getProfileById(profileId: string): Promise<Avo.User.Profile> {
		try {
			const response = await dataService.query({
				query: GET_USER_BY_ID,
				variables: {
					id: profileId,
				},
			});
			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}
			const profile = get(response, 'data.users_profiles[0]');
			if (!profile) {
				throw new CustomError('Failed to find profile by id', null, { response });
			}
			return profile;
		} catch (err) {
			throw new CustomError('Failed to get profile by id from the database', err, {
				profileId,
				query: 'GET_USER_BY_ID',
			});
		}
	}

	public static async getUsers(
		page: number,
		sortColumn: UserOverviewTableCol,
		sortOrder: Avo.Search.OrderDirection,
		where: any = {},
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.User.Profile[], number]> {
		let variables: any;
		try {
			variables = {
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				...(where ? { where } : {}),
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};
			const response = await dataService.query({
				variables,
				query: GET_USERS,
				fetchPolicy: 'no-cache',
			});
			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}
			const users = get(response, 'data.shared_users');

			// Convert user format to profile format since we initially wrote the ui to deal with profiles
			const profiles = users.map((user: any) => ({
				...user.profiles[0],
				user: omit(user, 'profiles'),
			}));
			const profileCount = get(response, 'data.shared_users_aggregate.aggregate.count');

			if (!profiles) {
				throw new CustomError('Response does not contain any profiles', null, {
					response,
				});
			}

			return [profiles, profileCount];
		} catch (err) {
			throw new CustomError('Failed to get users from the database', err, {
				variables,
				query: 'GET_USERS',
			});
		}
	}

	public static async updateBlockStatus(userId: string, isBlocked: boolean): Promise<void> {
		try {
			const response = await dataService.mutate({
				mutation: UPDATE_USER_BLOCKED_STATUS,
				variables: {
					userId,
					isBlocked,
				},
				update: ApolloCacheManager.clearUserCache,
			});

			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}
		} catch (err) {
			throw new CustomError(
				'Failed to update is_blocked field for user in the database',
				err,
				{
					userId,
					isBlocked,
					query: 'UPDATE_USER_BLOCKED_STATUS',
				}
			);
		}
	}
}
