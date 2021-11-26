import { ApolloQueryResult } from 'apollo-boost';
import { compact, flatten, get, isNil } from 'lodash-es';
import moment from 'moment';

import { Avo } from '@viaa/avo2-types';
import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';

import { CustomError, getEnv, normalizeTimestamp } from '../../shared/helpers';
import { fetchWithLogout } from '../../shared/helpers/fetch-with-logout';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { ApolloCacheManager, dataService } from '../../shared/services';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './user.const';
import {
	BULK_ADD_SUBJECTS_TO_PROFILES,
	BULK_DELETE_SUBJECTS_FROM_PROFILES,
	GET_CONTENT_COUNTS_FOR_USERS,
	GET_DISTINCT_BUSINESS_CATEGORIES,
	GET_IDPS,
	GET_PROFILE_IDS,
	GET_PROFILE_NAMES,
	GET_USERS,
	GET_USER_BY_ID,
	GET_USER_TEMP_ACCESS_BY_ID,
	UPDATE_USER_TEMP_ACCESS_BY_ID,
} from './user.gql';
import {
	DeleteContentCounts,
	DeleteContentCountsRaw,
	UserOverviewTableCol,
	UserSummaryView,
	UserTempAccess,
} from './user.types';

export class UserService {
	static async getProfileById(profileId: string): Promise<Avo.User.Profile> {
		try {
			const userResponse = await dataService.query({
				query: GET_USER_BY_ID,
				variables: {
					id: profileId,
				},
				fetchPolicy: 'no-cache',
			});

			if (userResponse.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					userResponse,
				});
			}

			const profile = get(userResponse, 'data.users_summary_view[0]');

			if (!profile) {
				throw new CustomError('Failed to find profile by id', null, { userResponse });
			}

			return profile;
		} catch (err) {
			throw new CustomError('Failed to get profile by id from the database', err, {
				profileId,
				query: 'GET_USER_BY_ID',
			});
		}
	}

	/**
	 * Get the tempAccess data for a user by profileId
	 */
	static async getTempAccessById(profileId: string): Promise<UserTempAccess | null> {
		try {
			const tempAccessResponse = await dataService.query({
				query: GET_USER_TEMP_ACCESS_BY_ID,
				variables: {
					id: profileId,
				},
				fetchPolicy: 'no-cache',
			});

			return get(tempAccessResponse, 'data.shared_users[0].temp_access');
		} catch (err) {
			throw new CustomError('Failed to get profile by id from the database', err, {
				profileId,
				query: 'GET_USER_BY_ID',
			});
		}
	}

	/**
	 * Update/Set temp access for a user.
	 */
	static updateTempAccessByUserId = async (
		userId: string,
		tempAccess: UserTempAccess,
		profileId: string
	) => {
		try {
			// Update a users's temp access
			await dataService.mutate({
				mutation: UPDATE_USER_TEMP_ACCESS_BY_ID,
				variables: {
					user_id: userId,
					from: tempAccess.from,
					until: tempAccess.until,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			const hasAccessNow =
				!!tempAccess.from && normalizeTimestamp(tempAccess.from).isBefore(moment());

			if (hasAccessNow && tempAccess.until) {
				const isBlocked = !hasAccessNow;

				await UserService.updateTempAccessBlockStatusByProfileIds(
					[profileId],
					isBlocked,
					moment(tempAccess.until).format('DD-MM-YYYY')
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
		tempAccessUntil: string
	): Promise<void> {
		let url: string | undefined;

		try {
			url = `${getEnv('PROXY_URL')}/user/bulk-temp-access`;

			const body: Avo.User.BulkTempAccessBody = {
				profileIds,
				isBlocked,
				tempAccessUntil,
			};

			const response = await fetchWithLogout(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(body),
			});

			if (response.status < 200 || response.status >= 400) {
				throw new CustomError('Status code was unexpected', null, {
					response,
				});
			}
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

	static async getProfiles(
		page: number,
		sortColumn: UserOverviewTableCol,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: string,
		where: any = {},
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.User.Profile[], number]> {
		let variables: any;
		try {
			const whereWithoutDeleted = {
				...where,
				is_deleted: { _eq: false },
			};

			variables = {
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				where: whereWithoutDeleted,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
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

			const users: UserSummaryView[] = get(response, 'data.users_summary_view');

			// Convert user format to profile format since we initially wrote the ui to deal with profiles
			const profiles: Partial<Avo.User.Profile>[] = users.map(
				(user: UserSummaryView): Avo.User.Profile =>
					({
						id: user.profile_id,
						stamboek: user.stamboek,
						organisation: user.company_name
							? ({
									name: user.company_name,
							  } as Avo.Organization.Organization)
							: null,
						educational_organisations: user.organisations.map(
							(org): ClientEducationOrganization => ({
								organizationId: org.organization_id,
								unitId: org.unit_id || null,
								label: org.organization?.ldap_description || '',
							})
						),
						subjects: user.classifications.map((classification) => classification.key),
						education_levels: user.contexts.map((context) => context.key),
						is_exception: user.is_exception,
						business_category: user.business_category,
						created_at: user.acc_created_at,
						userGroupIds: isNil(user.group_id) ? [] : [user.group_id],
						user_id: user.user_id,
						profile_user_group: {
							group: {
								label: user.group_name,
								id: user.group_id,
							},
						},
						user: {
							uid: user.user_id,
							mail: user.mail,
							full_name: user.full_name,
							first_name: user.first_name,
							last_name: user.last_name,
							is_blocked: user.is_blocked,
							blocked_at: get(user, 'blocked_at.date'),
							unblocked_at: get(user, 'unblocked_at.date'),
							created_at: user.acc_created_at,
							last_access_at: user.last_access_at,
							temp_access: user.user.temp_access,
							idpmaps: user.idps.map((idp) => idp.idp),
						},
					} as any)
			);

			const profileCount = get(response, 'data.users_summary_view_aggregate.aggregate.count');

			if (!profiles) {
				throw new CustomError('Response does not contain any profiles', null, {
					response,
				});
			}

			return [profiles as any[], profileCount];
		} catch (err) {
			throw new CustomError('Failed to get profiles from the database', err, {
				variables,
				query: 'GET_USERS',
			});
		}
	}

	static async getProfileIds(where: any = {}): Promise<string[]> {
		let variables: any;
		try {
			variables = where
				? {
						where,
				  }
				: {};
			const response = await dataService.query({
				variables,
				query: GET_PROFILE_IDS,
				fetchPolicy: 'no-cache',
			});
			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}
			return compact(
				get(response, 'data.users_summary_view' || []).map((user: Partial<Avo.User.User>) =>
					get(user, 'profile_id')
				)
			);
		} catch (err) {
			throw new CustomError('Failed to get profile ids from the database', err, {
				variables,
				query: 'GET_PROFILE_IDS',
			});
		}
	}

	static async updateBlockStatusByProfileIds(
		profileIds: string[],
		isBlocked: boolean
	): Promise<void> {
		let url: string | undefined;
		try {
			url = `${getEnv('PROXY_URL')}/user/bulk-block`;

			const body: Avo.User.BulkBlockUsersBody = {
				profileIds,
				isBlocked,
			};

			const response = await fetchWithLogout(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(body),
			});

			if (response.status < 200 || response.status >= 400) {
				throw new CustomError('Status code was unexpected', null, {
					response,
				});
			}
		} catch (err) {
			throw new CustomError(
				'Failed to update is_blocked field for users in the database',
				err,
				{
					url,
					profileIds,
					isBlocked,
				}
			);
		}
	}

	static async bulkDeleteUsers(
		profileIds: string[],
		deleteOption: Avo.User.UserDeleteOption,
		transferToProfileId?: string
	): Promise<void> {
		let url: string | undefined;
		try {
			url = `${getEnv('PROXY_URL')}/user/bulk-delete`;
			const body: Avo.User.BulkDeleteUsersBody = {
				profileIds,
				deleteOption,
				transferToProfileId,
			};
			const response = await fetchWithLogout(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(body),
			});

			if (response.status < 200 || response.status >= 400) {
				throw new CustomError('Status code was unexpected', null, {
					response,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to bulk delete users from the database', err, {
				url,
				profileIds,
				deleteOption,
				transferToProfileId,
			});
		}
	}

	static async fetchPublicAndPrivateCounts(profileIds: string[]): Promise<DeleteContentCounts> {
		try {
			const response: ApolloQueryResult<DeleteContentCountsRaw> = await dataService.query({
				query: GET_CONTENT_COUNTS_FOR_USERS,
				variables: {
					profileIds,
				},
			});

			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}

			return {
				publicCollections: get(response, 'data.publicCollections.aggregate.count'),
				privateCollections: get(response, 'data.privateCollections.aggregate.count'),
				assignments: get(response, 'data.assignments.aggregate.count', '-'),
				bookmarks:
					get(response, 'data.collectionBookmarks.aggregate.count ', 0) +
					get(response, 'data.itemBookmarks.aggregate.count', 0),
				publicContentPages: get(response, 'data.publicContentPages.aggregate.count'),
				privateContentPages: get(response, 'data.privateContentPages.aggregate.count'),
			};
		} catch (err) {
			throw new CustomError('Failed to get content counts for users from the database', err, {
				profileIds,
				query: 'GET_CONTENT_COUNTS_FOR_USERS',
			});
		}
	}

	static async getNamesByProfileIds(profileIds: string[]): Promise<Avo.User.User[]> {
		try {
			const response: ApolloQueryResult<DeleteContentCountsRaw> = await dataService.query({
				query: GET_PROFILE_NAMES,
				variables: {
					profileIds,
				},
			});

			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}

			return get(response, 'data.users_summary_view').map((profileEntry: any) => ({
				profile: {
					id: profileEntry.profile_id,
				},
				full_name: profileEntry.full_name,
				mail: profileEntry.mail,
			}));
		} catch (err) {
			throw new CustomError('Failed to get profile names from the database', err, {
				profileIds,
				query: 'GET_PROFILE_NAMES',
			});
		}
	}

	static async bulkAddSubjectsToProfiles(
		subjects: string[],
		profileIds: string[]
	): Promise<void> {
		try {
			// First remove the subjects, so we can add them without duplicate conflicts
			await UserService.bulkRemoveSubjectsFromProfiles(subjects, profileIds);

			// Add the subjects
			const response = await dataService.mutate({
				mutation: BULK_ADD_SUBJECTS_TO_PROFILES,
				variables: {
					subjects: flatten(
						subjects.map((subject) =>
							profileIds.map((profileId) => ({
								key: subject,
								profile_id: profileId,
							}))
						)
					),
				},
				update: ApolloCacheManager.clearUserCache,
			});
			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to bulk add subjects to profiles', err, {
				subjects,
				profileIds,
				query: 'BULK_ADD_SUBJECTS_TO_PROFILES',
			});
		}
	}

	static async bulkRemoveSubjectsFromProfiles(
		subjects: string[],
		profileIds: string[]
	): Promise<void> {
		try {
			const response = await dataService.mutate({
				mutation: BULK_DELETE_SUBJECTS_FROM_PROFILES,
				variables: {
					subjects,
					profileIds,
				},
				update: ApolloCacheManager.clearUserCache,
			});
			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to bulk delete subjects from profiles', err, {
				subjects,
				profileIds,
				query: 'BULK_DELETE_SUBJECTS_FROM_PROFILES',
			});
		}
	}

	static async fetchDistinctBusinessCategories() {
		try {
			const response = await dataService.query({
				query: GET_DISTINCT_BUSINESS_CATEGORIES,
			});
			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}
			return get(response, 'data.users_profiles', []).map(
				(profile: Partial<Avo.User.Profile>) => profile.business_category
			);
		} catch (err) {
			throw new CustomError('Failed to get distinct business categories from profiles', err, {
				query: 'GET_DISTINCT_BUSINESS_CATEGORIES',
			});
		}
	}

	static async fetchIdps() {
		try {
			const response = await dataService.query({
				query: GET_IDPS,
			});
			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}
			return get(response, 'data.users_idps', []).map((idp: { value: string }) => idp.value);
		} catch (err) {
			throw new CustomError('Failed to get idps from the database', err, {
				query: 'GET_IDPS',
			});
		}
	}
}
