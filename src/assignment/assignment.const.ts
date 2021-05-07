import { Avo } from '@viaa/avo2-types';

import { ROUTE_PARTS } from '../shared/constants';
import { isMobileWidth } from '../shared/helpers';
import i18n from '../shared/translations/i18n';

import { AssignmentColumn, AssignmentOverviewTableColumns } from './assignment.types';

export const ITEMS_PER_PAGE = 20;

export const CONTENT_LABEL_TO_ROUTE_PARTS: {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	[contentType in Avo.Assignment.ContentLabel]: string /* eslint-enable @typescript-eslint/no-unused-vars */;
} = {
	ITEM: ROUTE_PARTS.item,
	COLLECTIE: ROUTE_PARTS.collections,
	ZOEKOPDRACHT: ROUTE_PARTS.searchQuery,
};

export const GET_ASSIGNMENT_OVERVIEW_COLUMNS = (
	canEditAssignments: boolean | null
): AssignmentColumn[] => [
	{
		id: 'title',
		label: i18n.t('assignment/views/assignment-overview___titel'),
		sortable: true,
		dataType: 'string',
	},
	// { id: 'assignment_type', label: t('assignment/views/assignment-overview___type'), sortable: true, visibleByDefault: true }, // https://district01.atlassian.net/browse/AVO2-421
	...(isMobileWidth()
		? []
		: [
				{
					id: 'labels' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/views/assignment-overview___vak-of-project'),
					sortable: false,
				},
		  ]),
	...(canEditAssignments
		? []
		: [
				{
					id: 'author' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/views/assignment-overview___leerkracht'),
					sortable: true,
					dataType: 'string',
				},
		  ]), // Only show teacher for pupils
	...(isMobileWidth()
		? []
		: [
				{
					id: 'class_room' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/views/assignment-overview___klas'),
					sortable: true,
					dataType: 'string',
				},
		  ]),
	{
		id: 'deadline_at' as AssignmentOverviewTableColumns,
		label: i18n.t('assignment/views/assignment-overview___deadline'),
		sortable: true,
		dataType: 'dateTime',
	},
	...(canEditAssignments
		? []
		: [
				{
					id: 'submitted_at' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/views/assignment-overview___status'),
					tooltip: i18n.t(
						'assignment/views/assignment-overview___heb-je-deze-opdracht-reeds-ingediend'
					),
					sortable: false,
				},
		  ]), // Only show teacher for pupils
	// { id: 'responses', label: t('assignment/views/assignment-overview___indieningen') }, // https://district01.atlassian.net/browse/AVO2-421
	{ id: 'actions' as AssignmentOverviewTableColumns, label: '' },
];

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in AssignmentOverviewTableColumns]: (order: Avo.Search.OrderDirection) => any;
	}
> = {
	author: (order: Avo.Search.OrderDirection) => ({
		owner: {
			full_name: order,
		},
	}),
	submitted_at: (order: Avo.Search.OrderDirection) => ({
		responses: {
			submitted_at: order,
		},
	}),
};
