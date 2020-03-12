import { Step } from 'react-joyride';

import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type InteractiveTourOverviewTableCols =
	| 'name'
	| 'page'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export interface InteractiveTour {
	id?: number;
	name: string;
	page: string;
	created_at?: string;
	updated_at?: string;
	steps: Step[];
}

export interface InteractiveTourEditParams {
	interactiveTour?: string;
	id?: string;
}

export type InteractiveTourEditPageType = 'edit' | 'create';

export interface InteractiveTourEditFormState {
	name: string;
	page: string;
	steps: Step[];
}

export interface InteractiveTourEditFormErrorState {
	name?: string;
	page?: string;
}

export interface InteractiveTourTableState extends FilterableTableState {
	name: string;
	pageName: string;
	created_at: string;
	updated_at: string;
}
