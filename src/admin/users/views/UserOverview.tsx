import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button, Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import FilterTable from '../../shared/components/FilterTable/FilterTable';
import { GET_USER_OVERVIEW_TABLE_COLS } from '../user.const';
import { UserService } from '../user.service';
import { UserOverviewTableCols, UserTableState } from '../user.types';

interface UserOverviewProps extends DefaultSecureRouteProps {}

const UserOverview: FunctionComponent<UserOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	const [profiles, setProfiles] = useState<Avo.User.Profile[] | null>(null);
	const [profileCount, setProfileCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<UserTableState>>({});

	const fetchUsers = useCallback(async () => {
		try {
			const [profilesTemp, profileCountTemp] = await UserService.getProfiles(
				tableState.page || 0,
				tableState.sort_column || 'created_at',
				tableState.sort_order || 'desc',
				tableState.query || ''
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
		columnId: UserOverviewTableCols
	) => {
		const { id, user, stamboek, created_at } = rowData;

		switch (columnId) {
			case 'first_name':
			case 'last_name':
			case 'mail':
				return get(user, columnId, '-');

			case 'stamboek':
				return stamboek || '-';

			case 'created_at':
				return formatDate(created_at) || '-';

			case 'actions':
				return (
					<Button type="secondary" icon="eye" onClick={() => navigateToUserDetail(id)} />
				);

			default:
				return rowData[columnId];
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

	const renderUserOverview = () => {
		if (!profiles) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={GET_USER_OVERVIEW_TABLE_COLS()}
					data={profiles}
					dataCount={profileCount}
					renderCell={(rowData: Partial<Avo.User.Profile>, columnId: string) =>
						renderTableCell(rowData, columnId as UserOverviewTableCols)
					}
					searchTextPlaceholder={t(
						'admin/users/views/user-overview___zoek-op-naam-email-alias'
					)}
					noContentMatchingFiltersMessage={t(
						'admin/users/views/user-overview___er-zijn-geen-gebruikers-doe-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('admin/users/views/user-overview___gebruikers')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
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
