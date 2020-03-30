import { Step } from 'react-joyride';

import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type InteractiveTourOverviewTableCols =
	| 'name'
	| 'page_id'
	| 'created_at'
	| 'updated_at'
	| 'actions';

// TODO use typings version after update to 2.14.0
export interface InteractiveTour {
	id?: number;
	name: string;
	page_id: string;
	created_at?: string;
	updated_at?: string;
	steps: InteractiveTourStep[];
}

// TODO use typings version after update to 2.14.0
export interface InteractiveTourStep extends Step {
	id: string;
}

export interface InteractiveTourEditFormErrorState {
	name?: string;
	page_id?: string;
}

export interface InteractiveTourTableState extends FilterableTableState {
	name: string;
	page_id: string;
	created_at: string;
	updated_at: string;
}

export type InteractiveTourPageType = 'static' | 'content';
