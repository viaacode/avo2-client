import { ReactElement } from 'react';

import { MenuItemInfo } from '@viaa/avo2-components';

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
