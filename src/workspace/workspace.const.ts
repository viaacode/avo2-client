import { IconName } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../shared/constants';
import { tText } from '../shared/helpers/translate';

import { WorkspaceTab } from './workspace.types';

export const COLLECTIONS_ID = ROUTE_PARTS.collections;
export const BUNDLES_ID = ROUTE_PARTS.bundles;
export const ASSIGNMENTS_ID = ROUTE_PARTS.assignments;
export const BOOKMARKS_ID = ROUTE_PARTS.bookmarks;
export const ORGANISATION_CONTENT_ID = ROUTE_PARTS.organisationContent;
export const QUICK_LANE_ID = ROUTE_PARTS.quickLane;

export const GET_TABS: () => WorkspaceTab[] = () => [
	{
		label: tText('workspace/workspace___collecties'),
		icon: IconName.collection,
		id: COLLECTIONS_ID,
	},
	{
		label: tText('workspace/workspace___bundels'),
		icon: IconName.folder,
		id: BUNDLES_ID,
	},
	{
		label: tText('workspace/workspace___opdrachten'),
		icon: IconName.clipboard,
		id: ASSIGNMENTS_ID,
	},
	{
		label: tText('workspace/workspace___gedeelde-links'),
		icon: IconName.link2,
		id: QUICK_LANE_ID,
	},
	{
		label: tText('workspace/workspace___bladwijzers'),
		icon: IconName.bookmark,
		id: BOOKMARKS_ID,
	},
	{
		label: tText('workspace/workspace___organisatie-content'),
		id: ORGANISATION_CONTENT_ID,
	},
];

export const ITEMS_PER_PAGE = 20;
