import { TabProps } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../shared/constants';
import i18n from '../shared/translations/i18n';

export const WORKSPACE_PATH = Object.freeze({
	WORKSPACE: `/${ROUTE_PARTS.workspace}`,
	WORKSPACE_TAB: `/${ROUTE_PARTS.workspace}/:tabId`,
});

export const COLLECTIONS_ID = ROUTE_PARTS.collections;
export const BUNDLES_ID = ROUTE_PARTS.bundles;
export const ASSIGNMENTS_ID = ROUTE_PARTS.assignments;
export const BOOKMARKS_ID = ROUTE_PARTS.bookmarks;

export const TABS: TabProps[] = [
	{
		label: i18n.t('workspace/workspace___collecties'),
		icon: 'collection',
		id: COLLECTIONS_ID,
	},
	{
		label: i18n.t('workspace/workspace___bundels'),
		icon: 'folder',
		id: BUNDLES_ID,
	},
	{
		label: i18n.t('workspace/workspace___opdrachten'),
		icon: 'clipboard',
		id: ASSIGNMENTS_ID,
	},
	{
		label: i18n.t('workspace/workspace___bladwijzers'),
		icon: 'bookmark',
		id: BOOKMARKS_ID,
	},
];

export const ITEMS_PER_PAGE = 20;
