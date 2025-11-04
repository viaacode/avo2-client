import { type Avo } from '@viaa/avo2-types';
import { endOfDay, isBefore } from 'date-fns';
import { compact } from 'lodash-es';

import {
	type GetProfileIdsQuery,
	type GetProfileIdsQueryVariables,
	type UpdateUserTempAccessByIdMutation,
	type UpdateUserTempAccessByIdMutationVariables,
} from '../../shared/generated/graphql-db-operations';
import {
	GetProfileIdsDocument,
	UpdateUserTempAccessByIdDocument,
} from '../../shared/generated/graphql-db-react-query';
import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';
import { toIsoDate } from '../../shared/helpers/formatters/date';
import { dataService } from '../../shared/services/data-service';

export class UserService {
	/**
	 * Update/Set temp access for a user.
	 */
	static updateTempAccessByUserId = async (
		userId: string,
		tempAccess: Avo.User.TempAccess,
		profileId: string
	): Promise<void> => {
		try {
			// Update a users temp access
			await dataService.query<
				UpdateUserTempAccessByIdMutation,
				UpdateUserTempAccessByIdMutationVariables
			>({
				query: UpdateUserTempAccessByIdDocument,
				variables: {
					user_id: userId,
					from: tempAccess.from,
					until: tempAccess.until,
				},
			});

			/**
			 * Trigger email if from day is <= updated at day
			 * https://meemoo.atlassian.net/browse/AVO-1779
			 */
			const hasAccessNow =
				!!tempAccess.from && isBefore(new Date(tempAccess.from), endOfDay(new Date()));

			if (hasAccessNow && tempAccess.until) {
				const isBlocked = !hasAccessNow;

				await UserService.updateTempAccessBlockStatusByProfileIds(
					[profileId],
					isBlocked,
					toIsoDate(new Date(tempAccess.until)),
					true
				);
			}
		} catch (err) {
			throw new CustomError(`Failed to update temp access for user`, err, {
				userId,
				tempAccess,
			});
		}
	};

	static async updateTempAccessBlockStatusByProfileIds(
		profileIds: string[],
		isBlocked: boolean,
		tempAccessUntil: string,
		sendEmail: boolean
	): Promise<void> {
		let url: string | undefined;

		try {
			url = `${getEnv('PROXY_URL')}/user/bulk-temp-access`;

			const body: Avo.User.BulkTempAccessBody = {
				profileIds,
				isBlocked,
				tempAccessUntil,
				sendEmail,
			};

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/client');
			await fetchWithLogoutJson(url, {
				method: 'POST',
				body: JSON.stringify(body),
			});
		} catch (err) {
			throw new CustomError(
				'Failed to update temp access is_blocked field for users in the database',
				err,
				{
					url,
					profileIds,
					isBlocked,
				}
			);
		}
	}

	static async getProfileIds(
		where: GetProfileIdsQueryVariables['where'] = {}
	): Promise<string[]> {
		let variables: GetProfileIdsQueryVariables | null = null;
		try {
			variables = {
				where: where || undefined,
			};
			const response = await dataService.query<
				GetProfileIdsQuery,
				GetProfileIdsQueryVariables
			>({
				variables,
				query: GetProfileIdsDocument,
			});
			return compact((response?.users_summary_view || []).map((user) => user?.profile_id));
		} catch (err) {
			throw new CustomError('Failed to get profile ids from the database', err, {
				variables,
				query: 'GET_PROFILE_IDS',
			});
		}
	}
}
