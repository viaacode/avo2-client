import React from 'react';

import { Flex } from '@viaa/avo2-components';

import { ADMIN_PATH } from './admin.const';
import { renderAdminRoutes } from './admin.routes';
import { Sidebar } from './shared/components';

const Admin = () => {
	const NAV_ITEMS = [
		{ label: 'Gebruikers', location: ADMIN_PATH.USER, key: 'users' },
		{ label: 'Gebruikersgroepen', location: ADMIN_PATH.USER_GROUP_OVERVIEW, key: 'userGroups' },
		{ label: 'Navigatie', location: ADMIN_PATH.MENU, key: 'navigatie' },
		{ label: 'Content', location: ADMIN_PATH.CONTENT, key: 'content' },
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
