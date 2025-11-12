import { type FilterableColumn, TableFilterType } from '@meemoo/admin-core-ui/admin';

import { ROUTE_PARTS } from '../../shared/constants/index.js';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list.js';
import { tText } from '../../shared/helpers/translate-text.js';
import { generateRandomId } from '../../shared/helpers/uuid.js';
import { TableColumnDataType } from '../../shared/types/table-column-data-type.js';

import {
	type EditableInteractiveTour,
	type InteractiveTourOverviewTableCols,
} from './interactive-tour.types.js';

export const INTERACTIVE_TOUR_PATH = {
	INTERACTIVE_TOUR_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}`,
	INTERACTIVE_TOUR_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/${ROUTE_PARTS.create}`,
	INTERACTIVE_TOUR_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/:id/${ROUTE_PARTS.edit}`,
	INTERACTIVE_TOUR_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/:id/${ROUTE_PARTS.detail}`,
};

export const ITEMS_PER_PAGE = 10;

export const GET_INTERACTIVE_TOUR_OVERVIEW_TABLE_COLS: () => FilterableColumn<InteractiveTourOverviewTableCols>[] =
	() => [
		{
			id: 'name',
			label: tText('admin/interactive-tour/interactive-tour___naam'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'page_id',
			label: tText('admin/interactive-tour/interactive-tour___pagina'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'created_at',
			label: tText('admin/interactive-tour/interactive-tour___aangemaakt-op'),
			sortable: true,
			visibleByDefault: true,
			filterType: TableFilterType.DateRangeDropdown,
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: 'updated_at',
			label: tText('admin/interactive-tour/interactive-tour___aangepast-op'),
			sortable: true,
			visibleByDefault: true,
			filterType: TableFilterType.DateRangeDropdown,
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: ACTIONS_TABLE_COLUMN_ID,
			tooltip: tText('admin/interactive-tour/interactive-tour___acties'),
			visibleByDefault: true,
		},
	];

export function getInitialInteractiveTour(): Omit<EditableInteractiveTour, 'id'> {
	return {
		name: '',
		page_id: '',
		created_at: new Date(),
		updated_at: new Date(),
		steps: [
			{
				target: '',
				title: '',
				content: '',
				contentState: undefined,
				id: generateRandomId(),
			},
		],
	};
}

export const MAX_STEP_TITLE_LENGTH = 28;
export const MAX_STEP_TEXT_LENGTH = 200;
