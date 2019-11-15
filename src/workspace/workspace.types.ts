import { ReactElement } from 'react';

import { MenuItemInfo } from '@viaa/avo2-components';

type TabView = {
	component: (refetch: () => void) => ReactElement;
	filter?: {
		label: string;
		options: MenuItemInfo[];
	};
};

export type TabViewMap = {
	[key: string]: TabView;
};

interface Aggregate {
	count: number;
}

interface AggregateResponse {
	aggregate: Aggregate;
}

export interface TabAggregates {
	app_collections_aggregate: AggregateResponse;
	app_assignments_aggregate: AggregateResponse;
}
