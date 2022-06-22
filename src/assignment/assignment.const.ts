import { TFunction } from 'i18next';
import { object, SchemaOf, string } from 'yup';

import { Avo } from '@viaa/avo2-types';

import { ROUTE_PARTS } from '../shared/constants';
import { isMobileWidth } from '../shared/helpers';
import i18n from '../shared/translations/i18n';

import {
	AssignmentColumn,
	AssignmentFormState,
	AssignmentOverviewTableColumns,
} from './assignment.types';

export const ITEMS_PER_PAGE = 20;

export const CONTENT_LABEL_TO_ROUTE_PARTS: {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	[contentType in Avo.Assignment.ContentLabel]: string /* eslint-enable @typescript-eslint/no-unused-vars */;
} = {
	ITEM: ROUTE_PARTS.item,
	COLLECTIE: ROUTE_PARTS.collections,
	ZOEKOPDRACHT: ROUTE_PARTS.searchQuery,
};

type ColumnDataType = 'string' | 'number' | 'boolean' | 'dateTime' | undefined;

const getLabelsColumn = (): AssignmentColumn[] => {
	return isMobileWidth()
		? []
		: [
				{
					id: 'labels' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/assignment___label'),
					sortable: false,
				},
		  ];
};

const getTeacherColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? []
		: [
				{
					id: 'author' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/views/assignment-overview___leerkracht'),
					sortable: true,
					dataType: 'string' as ColumnDataType,
				},
		  ];
}; // Only show teacher for pupils

const getClassColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? [
				{
					id: 'class_room' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/views/assignment-overview___klas'),
					sortable: false,
					dataType: 'string',
				},
		  ]
		: [];
};

const getLastEditColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? [
				{
					id: 'updated_at' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/assignment___laatst-bewerkt'),
					sortable: true,
					dataType: 'dateTime',
				},
		  ]
		: [];
};

const getResponseColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? [
				{
					id: 'responses' as AssignmentOverviewTableColumns,
					label: i18n.t('assignment/assignment___respons'),
					sortable: true,
					dataType: 'number',
				},
		  ]
		: [];
};

const getActionsColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? [{ id: 'actions' as AssignmentOverviewTableColumns, label: '' }]
		: [];
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
	...getClassColumn(canEditAssignments),
	...getLabelsColumn(),
	...getTeacherColumn(canEditAssignments),
	{
		id: 'deadline_at' as AssignmentOverviewTableColumns,
		label: i18n.t('assignment/views/assignment-overview___deadline'),
		sortable: true,
		dataType: 'dateTime',
	},
	...getLastEditColumn(canEditAssignments),
	...getResponseColumn(canEditAssignments),
	...getActionsColumn(canEditAssignments),
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
	responses: (order: Avo.Search.OrderDirection) => ({
		responses_aggregate: {
			count: order,
		},
	}),
};

/// Zoek & bouw
export const ASSIGNMENT_FORM_SCHEMA = (t: TFunction): SchemaOf<AssignmentFormState> => {
	return object({
		title: string().required(t('Titel is verplicht')),
	});
};

export const ASSIGNMENT_FORM_DEFAULT = (t: TFunction): AssignmentFormState => ({
	title: t('assignment/assignment___titel-opdracht'),
});

export enum ASSIGNMENT_CREATE_UPDATE_TABS {
	Inhoud,
	Details,
}
