import React from 'react';
import ResizablePanels from 'resizable-panels-react';

import { Flex } from '@viaa/avo2-components';

import { ADMIN_PATH, GET_NAV_ITEMS } from './admin.const';
import { renderAdminRoutes } from './admin.routes';
import './Admin.scss';
import { Sidebar } from './shared/components';

const Admin = () => (
	<div className="m-resizable-panels">
		<ResizablePanels
			displayDirection="row"
			panelsSize={[260]}
			sizeUnitMeasure="px"
			resizerSize="15px"
		>
			<Sidebar headerLink={ADMIN_PATH.DASHBOARD} navItems={GET_NAV_ITEMS()} />
			<Flex className="o-app--admin__main u-flex-auto u-scroll" orientation="vertical">
				{renderAdminRoutes()}
			</Flex>
		</ResizablePanels>
	</div>
);

export default Admin;
