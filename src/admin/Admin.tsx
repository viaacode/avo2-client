import { Flex, IconName } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import React, { type FC, useEffect, useState } from 'react';
import { HorizontalPageSplit } from 'react-page-split';
import { Outlet } from 'react-router';

import { commonUserAtom } from '../authentication/authentication.store';
import { PermissionService } from '../authentication/helpers/permission-service';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../shared/helpers/custom-error';
import { useTranslation } from '../shared/hooks/useTranslation';
import { ToastService } from '../shared/services/toast-service';
import { type NavigationItemInfo } from '../shared/types';

import { ADMIN_PATH, GET_NAV_ITEMS } from './admin.const';
import { Sidebar } from './shared/components/Sidebar/Sidebar';

export const Admin: FC<{ commonUser: Avo.User.CommonUser }> = () => {
	const { tText, tHtml } = useTranslation();
	const commonUser = useAtomValue(commonUserAtom);

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [userPermissions, setUserPermissions] = useState<PermissionName[] | null>(null);
	const [navigationItems, setNavigationItems] = useState<NavigationItemInfo[] | null>(null);

	useEffect(() => {
		if (!commonUser) {
			return;
		}
		if (PermissionService.hasPerm(commonUser, PermissionName.VIEW_ADMIN_DASHBOARD)) {
			const tempUserPermissions = commonUser?.permissions || [];
			setUserPermissions(tempUserPermissions);
			GET_NAV_ITEMS(tempUserPermissions)
				.then((navItems) => {
					setNavigationItems(navItems);
				})
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
	}, [commonUser, setLoadingInfo, tText, tHtml]);

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
					<Outlet />
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
