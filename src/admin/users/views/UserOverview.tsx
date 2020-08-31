import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	CheckboxOption,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { useUserGroups } from '../../user-groups/hooks';
import { GET_USER_OVERVIEW_TABLE_COLS, ITEMS_PER_PAGE } from '../user.const';
import { UserService } from '../user.service';
import { UserOverviewTableCol, UserTableState } from '../user.types';

interface UserOverviewProps extends DefaultSecureRouteProps {}

const UserOverview: FunctionComponent<UserOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	const [profiles, setProfiles] = useState<Avo.User.Profile[] | null>(null);
	const [profileCount, setProfileCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<UserTableState>>({});
	const [userGroups] = useUserGroups();

	const generateWhereObject = (filters: Partial<UserTableState>) => {
		const andFilters: any[] = [];
		andFilters.push(
			...getQueryFilter(
				filters.query,
				// @ts-ignore
				(queryWordWildcard: string, queryWord: string, query: string) => [
					{ profiles: { stamboek: { _ilike: query } } },
					{ profiles: { alternative_email: { _ilike: queryWordWildcard } } },
					{ profiles: { bio: { _ilike: queryWordWildcard } } },
					{ profiles: { alias: { _ilike: queryWordWildcard } } },
					{ profiles: { title: { _ilike: queryWordWildcard } } },
					{ profiles: { organisation: { name: { _ilike: queryWordWildcard } } } },
					{
						profiles: {
							profile_user_groups: {
								groups: { label: { _ilike: queryWordWildcard } },
							},
						},
					},
					{
						_or: [
							{ first_name: { _ilike: queryWordWildcard } },
							{ last_name: { _ilike: queryWordWildcard } },
							{ mail: { _ilike: queryWordWildcard } },
						],
					},
				]
			)
		);
		andFilters.push(...getBooleanFilters(filters, ['is_blocked']));
		andFilters.push(
			...getMultiOptionFilters(
				filters,
				['user_group', 'organisation'],
				['profiles.profile_user_groups.groups.id', 'profiles.company_id']
			)
		);
		andFilters.push(...getDateRangeFilters(filters, ['created_at', 'last_access_at']));

		return { _and: andFilters };
	};

	const fetchUsers = useCallback(async () => {
		try {
			const [profilesTemp, profileCountTemp] = await UserService.getUsers(
				tableState.page || 0,
				(tableState.sort_column || 'last_name') as UserOverviewTableCol,
				tableState.sort_order || 'asc',
				generateWhereObject(getFilters(tableState))
			);
			setProfiles(profilesTemp);
			setProfileCount(profileCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get users from the database', err, { tableState })
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/users/views/user-overview___het-ophalen-van-de-gebruikers-is-mislukt'
				),
			});
		}
	}, [setLoadingInfo, setProfiles, setProfileCount, tableState, t]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		if (profiles) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [fetchUsers, profiles]);

	const navigateToUserDetail = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(
				t('admin/users/views/user-overview___deze-gebruiker-heeft-geen-geldig-id'),
				false
			);
			return;
		}
		const detailRoute = ADMIN_PATH.USER_DETAIL;
		const link = buildLink(detailRoute, { id });
		redirectToClientPage(link, history);
	};

	const renderTableCell = (
		rowData: Partial<Avo.User.Profile>,
		columnId: UserOverviewTableCol
	) => {
		const { user, stamboek, created_at, title, organisation } = rowData;

		switch (columnId) {
			case 'first_name':
			case 'last_name':
			case 'mail':
				return truncateTableValue(get(user, columnId));

			case 'user_group':
				return get(rowData, 'profile_user_groups[0].groups[0].label') || '-';

			case 'oormerk': // TODO replace title with sector after:https://meemoo.atlassian.net/browse/DEV-1062
				return title || '-';

			case 'is_blocked':
				const isBlocked = get(rowData, 'user.is_blocked');
				return isBlocked ? 'Ja' : 'Nee';

			case 'stamboek':
				return stamboek || '-';

			case 'organisation':
				return get(organisation, 'name') || '-';

			case 'created_at':
				return formatDate(created_at) || '-';

			case 'last_access_at':
				const lastAccessDate = get(rowData, 'user.last_access_at');
				return !isNil(lastAccessDate) ? formatDate(lastAccessDate) : '-';

			default:
				return '';
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={t('admin/users/views/user-overview___er-bestaan-nog-geen-gebruikers')}
			>
				<p>
					<Trans i18nKey="admin/users/views/user-overview___beschrijving-wanneer-er-nog-geen-gebruikers-zijn">
						Beschrijving wanneer er nog geen gebruikers zijn
					</Trans>
				</p>
			</ErrorView>
		);
	};

	const userGroupOptions = userGroups.map(
		(option): CheckboxOption => ({
			id: String(option.id),
			label: option.label,
			checked: get(tableState, 'author.user_groups', [] as string[]).includes(
				String(option.id)
			),
		})
	);

	const renderUserOverview = () => {
		if (!profiles) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={GET_USER_OVERVIEW_TABLE_COLS(userGroupOptions)}
					data={profiles}
					dataCount={profileCount}
					renderCell={(rowData: Partial<Avo.User.Profile>, columnId: string) =>
						renderTableCell(rowData, columnId as UserOverviewTableCol)
					}
					searchTextPlaceholder={t(
						'admin/users/views/user-overview___zoek-op-naam-email-alias'
					)}
					noContentMatchingFiltersMessage={t(
						'admin/users/views/user-overview___er-zijn-geen-gebruikers-doe-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					onRowClick={rowData => navigateToUserDetail(rowData.id)}
					renderNoResults={renderNoResults}
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('admin/users/views/user-overview___gebruikers')}>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<Container mode="vertical" size="small">
					<Container mode="horizontal" size="full-width">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={profiles}
							render={renderUserOverview}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default UserOverview;
