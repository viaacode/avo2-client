import { Flex, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { HorizontalPageSplit } from 'react-page-split';

import { PermissionService } from '../authentication/helpers/permission-service';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../shared/components';
import { CustomError } from '../shared/helpers';
import withUser from '../shared/hocs/withUser';
import useTranslation from '../shared/hooks/useTranslation';
import { ToastService } from '../shared/services/toast-service';
import { NavigationItemInfo } from '../shared/types';

import { ADMIN_PATH, GET_NAV_ITEMS } from './admin.const';
import { renderAdminRoutes } from './admin.routes';
import { Sidebar } from './shared/components';

const Admin: FunctionComponent<{ user: Avo.User.User }> = ({ user }) => {
	const { tText, tHtml } = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [userPermissions, setUserPermissions] = useState<PermissionName[] | null>(null);
	const [navigationItems, setNavigationItems] = useState<NavigationItemInfo[] | null>(null);

	useEffect(() => {
		if (!user) {
			return;
		}
		if (PermissionService.hasPerm(user, PermissionName.VIEW_ADMIN_DASHBOARD)) {
			const tempUserPermissions = PermissionService.getUserPermissions(user);
			setUserPermissions(tempUserPermissions);
			GET_NAV_ITEMS(tempUserPermissions)
				.then(setNavigationItems)
				.catch((err: any) => {
					console.error(new CustomError('Failed to get nav items', err));
					ToastService.danger(
						tHtml('admin/admin___het-ophalen-van-de-navigatie-items-is-mislukt')
					);
				});
		} else {
			setLoadingInfo({
				state: 'error',
				icon: IconName.lock,
				message: tHtml(
					'admin/admin___je-hebt-geen-rechten-om-het-beheer-dashboard-te-bekijken-view-admin-dashboard'
				),
				actionButtons: ['home', 'helpdesk'],
			});
		}
	}, [user, setLoadingInfo, tText]);

	useEffect(() => {
		if (userPermissions && navigationItems) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [userPermissions, navigationItems, setLoadingInfo]);

	const renderAdminPage = () => {
		if (!navigationItems || !userPermissions) {
			return null;
		}
		return (
			<HorizontalPageSplit className="m-resizable-panels" widths={['300px', '*']}>
				<Sidebar
					headerLink={ADMIN_PATH.DASHBOARD}
					navItems={navigationItems}
					className="o-app--admin__sidebar"
				/>
				<Flex className="o-app--admin__main u-flex-auto u-scroll" orientation="vertical">
					{renderAdminRoutes(userPermissions)}
				</Flex>
			</HorizontalPageSplit>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={{}}
			render={renderAdminPage}
		/>
	);
};

export default withUser(Admin) as FunctionComponent;
