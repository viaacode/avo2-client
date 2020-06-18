import { ReactElement } from 'react';

import { IconName, MenuItemInfo } from '@viaa/avo2-components';

export type TabView = {
	component: () => ReactElement;
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
