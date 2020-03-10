import React from 'react';
import { useTranslation } from 'react-i18next';

import { Flex } from '@viaa/avo2-components';

import { ADMIN_PATH } from './admin.const';
import { renderAdminRoutes } from './admin.routes';
import { Sidebar } from './shared/components';

const Admin = () => {
	const [t] = useTranslation();

	const NAV_ITEMS = [
		{ label: 'Gebruikers', location: ADMIN_PATH.USER, key: 'users' },
		{ label: 'Gebruikersgroepen', location: ADMIN_PATH.USER_GROUP_OVERVIEW, key: 'userGroups' },
		{ label: 'Navigatie', location: ADMIN_PATH.MENU, key: 'navigatie' },
		{ label: 'Content', location: ADMIN_PATH.CONTENT, key: 'content' },
		{
			label: t('Permissie groepen'),
			location: ADMIN_PATH.PERMISSION_GROUP_OVERVIEW,
			key: 'permissionGroups',
		},
	];

	return (
		<Flex>
			<Sidebar headerLink={ADMIN_PATH.DASHBOARD} navItems={NAV_ITEMS} />
			<Flex className="o-app--admin__main u-flex-auto u-scroll" orientation="vertical">
				{renderAdminRoutes()}
			</Flex>
		</Flex>
	);
};

export default Admin;
