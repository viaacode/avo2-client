import { ApolloQueryResult } from 'apollo-boost';
import { compact, flatten, get, isNil } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';
import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';

import { CustomError, getEnv } from '../../shared/helpers';
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
	GET_USER_BY_ID,
	GET_USERS,
} from './user.gql';
import {
	DeleteContentCounts,
	DeleteContentCountsRaw,
	UserOverviewTableCol,
	UserSummeryView,
} from './user.types';

export class UserService {
	static async getProfileById(profileId: string): Promise<Avo.User.Profile> {
		try {
			const response = await dataService.query({
				query: GET_USER_BY_ID,
				variables: {
					id: profileId,
				},
				fetchPolicy: 'no-cache',
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

	static async getProfiles(
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
			const users: UserSummeryView[] = get(response, 'data.users_summary_view');

			// Convert user format to profile format since we initially wrote the ui to deal with profiles
			const profiles: Partial<Avo.User.Profile>[] = users.map(
				(user: UserSummeryView): Avo.User.Profile =>
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
								label: '', // TODO find name somehow
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
							created_at: user.acc_created_at,
							last_access_at: user.last_access_at as string, // TODO remove cast after update to typings 2.26.0
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
				get(response, 'data.shared_users' || []).map((user: Partial<Avo.User.User>) =>
					get(user, 'profile.id')
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
			const response = await fetchWithLogout(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					profileIds,
					isBlocked,
				}),
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

	static async getNamesByProfileIds(profileIds: string[]): Promise<Avo.User.Profile[]> {
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

			return get(response, 'data.users_profiles');
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
				(profile: Partial<Avo.User.Profile>) => (profile as any).business_category // TODO Remove cast after update to typings v2.25.0
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
