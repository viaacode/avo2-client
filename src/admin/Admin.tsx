import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { PermissionName, PermissionService } from '../authentication/helpers/permission-service';
import { LoadingErrorLoadedComponent, LoadingInfo, ResizablePanels } from '../shared/components';
import withUser from '../shared/hocs/withUser';

import { ADMIN_PATH, GET_NAV_ITEMS } from './admin.const';
import { renderAdminRoutes } from './admin.routes';
import './Admin.scss';
import { Sidebar } from './shared/components';

const Admin: FunctionComponent<{ user: Avo.User.User }> = ({ user }) => {
	const [t] = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	useEffect(() => {
		if (!user) {
			return;
		}
		if (PermissionService.hasPerm(user, PermissionName.VIEW_ADMIN_DASHBOARD)) {
			setLoadingInfo({ state: 'loaded' });
		} else {
			setLoadingInfo({
				state: 'error',
				icon: 'lock',
				message: t(
					'admin/admin___je-hebt-geen-rechten-om-het-beheer-dashboard-te-bekijken-view-admin-dashboard'
				),
				actionButtons: ['home', 'helpdesk'],
			});
		}
	}, [user, setLoadingInfo, t]);

	const renderAdminPage = () => {
		const userPermissions = PermissionService.getUserPermissions(user);
		return (
			<div className="m-resizable-panels">
				<ResizablePanels
					displayDirection="row"
					panelsSize={[260]}
					sizeUnitMeasure="px"
					resizerSize="15px"
				>
					<Sidebar
						headerLink={ADMIN_PATH.DASHBOARD}
						navItems={GET_NAV_ITEMS(userPermissions)}
						className="o-app--admin__sidebar"
					/>
					<Flex
						className="o-app--admin__main u-flex-auto u-scroll"
						orientation="vertical"
					>
						{renderAdminRoutes(userPermissions)}
					</Flex>
				</ResizablePanels>
			</div>
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
