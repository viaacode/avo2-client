import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { type Avo } from '@viaa/avo2-types';
import { endOfDay, isBefore } from 'date-fns';
import { compact, get, isNil } from 'lodash-es';

import {
	GetProfileIdsQuery,
	GetProfileIdsQueryVariables,
	GetUsersInSameCompanyQuery,
	GetUsersInSameCompanyQueryVariables,
	GetUsersQuery,
	GetUsersQueryVariables,
	UpdateUserTempAccessByIdMutation,
	UpdateUserTempAccessByIdMutationVariables,
} from '../../shared/generated/graphql-db-operations';
import {
	GetProfileIdsDocument,
	GetUsersDocument,
	GetUsersInSameCompanyDocument,
	UpdateUserTempAccessByIdDocument,
} from '../../shared/generated/graphql-db-react-query';
import { CustomError, getEnv, toIsoDate } from '../../shared/helpers';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { dataService } from '../../shared/services/data-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './user.const';
import { UserOverviewTableCol } from './user.types';

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

	static async getCompanyProfiles(
		page: number,
		sortColumn: UserOverviewTableCol,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any = {},
		user?: Avo.User.User,
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.User.Profile[], number]> {
		if (!user?.profile?.company_id) {
			return Promise.resolve([[], 0]);
		}

		return this.getProfiles(
			page,
			sortColumn,
			sortOrder,
			tableColumnDataType,
			where,
			itemsPerPage,
			// Change query and variables
			GetUsersInSameCompanyDocument,
			{ companyId: user.profile.company_id }
		);
	}

	static async getProfiles(
		page: number,
		sortColumn: UserOverviewTableCol,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any = {},
		itemsPerPage: number = ITEMS_PER_PAGE,
		query: typeof GetUsersDocument | typeof GetUsersInSameCompanyDocument = GetUsersDocument,
		initialVariables: Partial<GetUsersQueryVariables | GetUsersInSameCompanyQueryVariables> = {}
	): Promise<[Avo.User.Profile[], number]> {
		let variables: Partial<GetUsersQueryVariables | GetUsersInSameCompanyQueryVariables> =
			initialVariables;

		try {
			const whereWithoutDeleted = {
				...where,
				is_deleted: { _eq: false },
			};

			variables = {
				...variables,
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

			const response = await dataService.query<
				GetUsersQuery | GetUsersInSameCompanyQuery,
				GetUsersQueryVariables | GetUsersInSameCompanyQueryVariables
			>({
				query,
				variables: variables as
					| GetUsersQueryVariables
					| GetUsersInSameCompanyQueryVariables,
			});

			const users = response.users_summary_view;

			// Convert user format to profile format since we initially wrote the ui to deal with profiles
			const profiles: Partial<Avo.User.Profile>[] = users.map(
				(user): Avo.User.Profile =>
					({
						id: user.profile_id,
						stamboek: user.stamboek,
						organisation: user.company_name
							? ({
									name: user.company_name,
							  } as Avo.Organization.Organization)
							: null,
						educational_organisations: user.organisations.map(
							(org): Avo.EducationOrganization.Organization => ({
								organisationId: org.organization_id,
								organisationLabel: org.organization?.ldap_description || '',
								unitId: org.unit_id || null,
								unitStreet: null,
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
							temp_access: user.user?.temp_access,
							idpmaps: user.idps.map((idp) => idp.idp),
						},
					}) as any
			);

			const profileCount = response.users_summary_view_aggregate.aggregate?.count ?? 0;

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
