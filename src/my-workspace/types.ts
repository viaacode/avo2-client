import { ReactElement } from 'react';
import { RouteComponentProps } from 'react-router';

import { MenuItemInfo } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

// My Workspace
type TabView = {
	component: ReactElement;
	filter?: {
		label: string;
		options: MenuItemInfo[];
	};
};

export type TabViewMap = {
	[key: string]: TabView;
};

export interface MyWorkspaceProps extends RouteComponentProps<{ tabId: string }> {
	collections: Avo.Collection.Response | null;
}

// Bookmarks
export interface BookmarksProps {}
