import { get } from 'lodash-es';

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

	public static async getProfiles(
		page: number,
		sortColumn: UserOverviewTableCol,
		sortOrder: Avo.Search.OrderDirection,
		where: any,
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.User.Profile[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};
			const response = await dataService.query({
				variables,
				query: GET_USERS,
			});
			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}
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
					query: 'UPDATE_ITEM_PUBLISH_STATE',
				}
			);
		}
	}
}
