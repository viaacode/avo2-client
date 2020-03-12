import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { InteractiveTour } from './interactive-tour.types';

export const INTERACTIVE_TOUR_PATH = {
	INTERACTIVE_TOUR_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}`,
	INTERACTIVE_TOUR_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/${ROUTE_PARTS.create}`,
	INTERACTIVE_TOUR_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/:id/${ROUTE_PARTS.edit}`,
	INTERACTIVE_TOUR_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/:id/${ROUTE_PARTS.detail}`,
};

export const ITEMS_PER_PAGE = 10;

export const INTERACTIVE_TOUR_OVERVIEW_TABLE_COLS: FilterableColumn[] = [
	{ id: 'name', label: i18n.t('Naam'), sortable: true },
	{ id: 'page', label: i18n.t('Pagina'), sortable: true },
	{
		id: 'created_at',
		label: i18n.t('Aangemaakt op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{
		id: 'updated_at',
		label: i18n.t('aangepast op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{ id: 'actions', label: '' },
];

export const INITIAL_INTERACTIVE_TOUR: InteractiveTour = {
	name: '',
	page: '',
	steps: [
		{
			target: '',
			title: '',
			content: '',
		},
	],
};

export const PAGE_TYPES_LANG = {
	create: i18n.t('Toevoegen'),
	edit: i18n.t('Aanpassen'),
};
