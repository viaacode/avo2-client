import bookwidgetLogo from '@assets/images/bookwidget_logo.png';
import smartschoolLogo from '@assets/images/smartschool_logo.png';

import type { FilterableColumn } from '../admin/shared/components/FilterTable/FilterTable';
import { isMobileWidth } from '../shared/helpers';
import { tText } from '../shared/helpers/translate-text';

import type { EmbedCodeOverviewTableColumns } from './embed-code.types';

export const BookWidgetsLogo = bookwidgetLogo;
export const SmartSchoolLogo = smartschoolLogo;

export const OVERVIEW_COLUMNS: FilterableColumn<EmbedCodeOverviewTableColumns>[] = [
	{
		id: 'thumbnail',
		label: '',
		sortable: false,
		visibleByDefault: true,
	},
	{
		id: 'title',
		label: tText('Titel'),
		sortable: true,
		visibleByDefault: true,
	},
	...((isMobileWidth()
		? []
		: [
				{
					id: 'createdAt',
					label: tText('Aangemaakt'),
					sortable: true,
					visibleByDefault: true,
				},
				{
					id: 'updatedAt',
					label: tText('Laatst bewerkt'),
					sortable: true,
					visibleByDefault: true,
				},
				{
					id: 'start',
					label: tText('Tijdscode'),
					sortable: true,
					visibleByDefault: true,
				},
				{
					id: 'externalWebsite',
					label: tText('Gedeeld op'),
					col: '2',
					sortable: true,
					visibleByDefault: true,
				},
		  ]) as FilterableColumn<EmbedCodeOverviewTableColumns>[]),
	{
		id: 'action',
		tooltip: tText('Acties'),
		col: '1',
		sortable: false,
		visibleByDefault: true,
	},
];
