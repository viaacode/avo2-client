import { type FilterableTableState } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { type RichEditorState } from '@meemoo/react-components';

import { type GetInteractiveTourByIdQuery } from '../../shared/generated/graphql-db-operations';
import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';

export type InteractiveTourOverviewTableCols =
	| 'name'
	| 'page_id'
	| 'created_at'
	| 'updated_at'
	| typeof ACTIONS_TABLE_COLUMN_ID;

export interface InteractiveTourEditFormErrorState {
	name?: string;
	page_id?: string;
	steps?: { title?: string; content?: string }[];
}

export interface InteractiveTourTableState extends FilterableTableState {
	name: string;
	page_id: string;
	created_at: string;
	updated_at: string;
}

export type InteractiveTourPageType = 'static' | 'content';

export enum InteractiveTourEditActionType {
	UPDATE_STEP_PROP = '@@admin-interactive-tour-edit/UPDATE_STEP_PROP',
	SWAP_STEPS = '@@admin-interactive-tour-edit/SWAP_STEPS',
	REMOVE_STEP = '@@admin-interactive-tour-edit/REMOVE_STEP',
	UPDATE_INTERACTIVE_TOUR = '@@admin-interactive-tour-edit/UPDATE_INTERACTIVE_TOUR',
	UPDATE_INTERACTIVE_TOUR_PROP = '@@admin-interactive-tour-edit/UPDATE_INTERACTIVE_TOUR_PROP',
}

export type InteractiveTour = GetInteractiveTourByIdQuery['app_interactive_tour'][0];

export type EditableInteractiveTour = Omit<InteractiveTour, 'id'> & { id?: number };

export type InteractiveTourStep = Exclude<InteractiveTour['steps'][0], null | undefined>;

export type EditableStep = InteractiveTourStep & {
	contentState: RichEditorState | undefined;
};

export interface InteractiveTourState {
	currentInteractiveTour: EditableInteractiveTour | null;
	initialInteractiveTour: EditableInteractiveTour | null;
	formErrors: InteractiveTourEditFormErrorState | null;
}
