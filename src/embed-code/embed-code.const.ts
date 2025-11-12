// eslint-disable-next-line import/no-unresolved
import bookwidgetsLogoInternal from '@assets/images/bookwidget_logo.png';
// eslint-disable-next-line import/no-unresolved
import smartschoolLogoInternal from '@assets/images/smartschool_logo.png';
import type { FilterableColumn } from '@meemoo/admin-core-ui/admin';

import { isMobileWidth } from '../shared/helpers/media-query.js';
import { tText } from '../shared/helpers/translate-text.js';

import type { EmbedCodeOverviewTableColumns } from './embed-code.types.js';

export const bookWidgetsLogo = bookwidgetsLogoInternal;
export const smartSchoolLogo = smartschoolLogoInternal;

export const OVERVIEW_COLUMNS = (): FilterableColumn<EmbedCodeOverviewTableColumns>[] => [
	{
		id: 'thumbnail',
		label: '',
		sortable: false,
		visibleByDefault: true,
	},
	{
		id: 'title',
		label: tText('embed-code/embed-code___titel'),
		sortable: true,
		visibleByDefault: true,
	},
	...((isMobileWidth()
		? []
		: [
				{
					id: 'createdAt',
					label: tText('embed-code/embed-code___aangemaakt'),
					sortable: true,
					visibleByDefault: true,
				},
				{
					id: 'updatedAt',
					label: tText('embed-code/embed-code___laatst-bewerkt'),
					sortable: true,
					visibleByDefault: true,
				},
				{
					id: 'start',
					label: tText('embed-code/embed-code___tijdscode'),
					sortable: true,
					visibleByDefault: true,
				},
				{
					id: 'externalWebsite',
					label: tText('embed-code/embed-code___gedeeld-op'),
					col: '2',
					sortable: true,
					visibleByDefault: true,
				},
		  ]) as FilterableColumn<EmbedCodeOverviewTableColumns>[]),
	{
		id: 'action',
		tooltip: tText('embed-code/embed-code___acties'),
		col: '1',
		sortable: false,
		visibleByDefault: true,
	},
];
