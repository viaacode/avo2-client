import { ReactElement } from 'react';
import { RouteComponentProps } from 'react-router';

import { MenuItemInfo } from '@viaa/avo2-components';

// My Workspace
type TabView = {
	addHandler?: () => void;
	amount: string;
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
	collections: any[] | null;
}

// Bookmarks
export interface BookmarksProps {}
