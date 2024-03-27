import { IconName, MenuItemInfo, TabProps } from '@viaa/avo2-components';
import { ReactNode } from 'react';

import {
	ASSIGNMENTS_ID,
	BOOKMARKS_ID,
	BUNDLES_ID,
	COLLECTIONS_ID,
	ORGANISATION_CONTENT_ID,
	QUICK_LANE_ID,
} from './workspace.const';

export type TabView = {
	component: ReactNode;
	filter?: TabFilter;
};

export interface NavTab {
	active: boolean;
	icon: IconName;
	id: string;
	label: string;
}

export type TabFilter = {
	label: string;
	options: MenuItemInfo[];
};

export type TabViewMap = {
	[key: string]: TabView;
};

export type WorkspaceTabNames =
	| typeof COLLECTIONS_ID
	| typeof BUNDLES_ID
	| typeof ASSIGNMENTS_ID
	| typeof BOOKMARKS_ID
	| typeof ORGANISATION_CONTENT_ID
	| typeof QUICK_LANE_ID;

export interface WorkspaceTab extends TabProps {
	id: WorkspaceTabNames;
}

export type WorkspaceCounts = {
	collections: number;
	bundles: number;
	assignments: number;
	bookmarks: number;
	organisationContent: number;
	quickLanes: number;
	organisationQuickLanes: number;
};
