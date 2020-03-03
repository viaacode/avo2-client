import React from 'react';
import { useTranslation } from 'react-i18next';

import { Flex } from '@viaa/avo2-components';

import { NavigationItemInfo } from '../shared/types';

import { ADMIN_PATH } from './admin.const';
import { renderAdminRoutes } from './admin.routes';
import { Sidebar } from './shared/components';

const Admin = () => {
	const [t] = useTranslation();

	const NAV_ITEMS: NavigationItemInfo[] = [
		{
			label: t('Gebruikers'),
			location: ADMIN_PATH.USER,
			key: 'users',
			exact: false,
			subLink: false,
		},
		{
			label: t('Navigatie'),
			location: ADMIN_PATH.MENU,
			key: 'navigatie',
			exact: false,
			subLink: false,
		},
		{
			label: t('Content'),
			location: ADMIN_PATH.CONTENT,
			key: 'content',
			exact: false,
			subLink: false,
		},
		{
			label: t('Projecten'),
			location: ADMIN_PATH.PROJECTS,
			key: 'projects',
			exact: true,
			subLink: true,
		},
		{ label: t('Nieuws'), location: ADMIN_PATH.NEWS, key: 'news', exact: true, subLink: true },
		{ label: t('FAQs'), location: ADMIN_PATH.FAQS, key: 'faqs', exact: true, subLink: true },
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
