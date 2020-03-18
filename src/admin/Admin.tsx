import React from 'react';

import { Flex } from '@viaa/avo2-components';

import { ADMIN_PATH, NAV_ITEMS } from './admin.const';
import { renderAdminRoutes } from './admin.routes';
import { Sidebar } from './shared/components';

const Admin = () => (
	<Flex>
		<Sidebar headerLink={ADMIN_PATH.DASHBOARD} navItems={NAV_ITEMS} />
		<Flex className="o-app--admin__main u-flex-auto u-scroll" orientation="vertical">
			{renderAdminRoutes()}
		</Flex>
	</Flex>
);

export default Admin;
