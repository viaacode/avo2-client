import { IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { TFunction } from 'i18next';
import { array, object, SchemaOf, string } from 'yup';

import { ROUTE_PARTS } from '../shared/constants';
import { isMobileWidth } from '../shared/helpers';
import i18n from '../shared/translations/i18n';
import { TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	AssignmentBlockTypeDict,
	AssignmentColumn,
	AssignmentFormState,
	AssignmentOverviewTableColumns,
	AssignmentResponseColumn,
	AssignmentResponseTableColumns,
	AssignmentType,
} from './assignment.types';
import { AssignmentDetailsFormProps } from './components/AssignmentDetailsForm';

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
					dataType: TableColumnDataType.string as ColumnDataType,
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
					dataType: TableColumnDataType.string,
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
					dataType: TableColumnDataType.dateTime,
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
					dataType: TableColumnDataType.number,
				},
		  ]
		: [];
};

const getActionsColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? [{ id: 'actions' as AssignmentOverviewTableColumns, label: '' }]
		: [];
};

export const GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL = (
	canEditAssignments: boolean | null
): AssignmentColumn[] => [
	{
		id: 'title',
		label: i18n.t('assignment/views/assignment-overview___titel'),
		sortable: true,
		dataType: TableColumnDataType.string,
	},
	...getClassColumn(canEditAssignments),
	...getLabelsColumn(),
	...getTeacherColumn(canEditAssignments),
	{
		id: 'deadline_at' as AssignmentOverviewTableColumns,
		label: i18n.t('assignment/views/assignment-overview___deadline'),
		sortable: true,
		dataType: TableColumnDataType.dateTime,
	},
	...getLastEditColumn(canEditAssignments),
];

export const GET_ASSIGNMENT_OVERVIEW_COLUMNS = (
	canEditAssignments: boolean | null
): AssignmentColumn[] => [
	...GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL(canEditAssignments),
	...getResponseColumn(canEditAssignments),
	...getActionsColumn(canEditAssignments),
];

export const ASSIGNMENTS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
	[columnId in AssignmentOverviewTableColumns]: (order: Avo.Search.OrderDirection) => any;
}> = {
	owner: (order: Avo.Search.OrderDirection) => ({
		owner: {
			full_name: order,
		},
	}),
	status: (order: Avo.Search.OrderDirection) => ({
		deadline_at: order,
	}),
	pupilCollections: (order: Avo.Search.OrderDirection) => ({
		responses_aggregate: {
			count: order,
		},
	}),
};

/// Zoek & bouw
export const ASSIGNMENT_FORM_SCHEMA = (t: TFunction): SchemaOf<AssignmentFormState> => {
	return object({
		id: string().optional(),
		title: string().required(t('assignment/assignment___titel-is-verplicht')),
		labels: array(
			object({
				assignment_label: object()
					.shape({
						id: string().required(),
						label: string().nullable(),
						color_enum_value: string().required(),
						color_override: string().nullable(),
						owner_profile_id: string().required(),
						enum_color: object({
							label: string().required(),
							value: string().required(),
						}).optional(),
						type: string().is(['LABEL', 'CLASS']).required(),
						profile: object().optional(),
					})
					.required(),
			})
		),
		blocks: array(),
		answer_url: string().nullable().optional(),
		available_at: string().optional(),
		deadline_at: string().optional(),
	});
};

export const ASSIGNMENT_FORM_DEFAULT = (t: TFunction): AssignmentFormState => ({
	id: undefined,
	title: t('assignment/assignment___titel-opdracht'),
	labels: [],
	blocks: [],
	available_at: new Date().toISOString(),
	answer_url: undefined,
	deadline_at: undefined,
});

export const ASSIGNMENT_FORM_FIELDS = (
	t: TFunction
): Pick<
	AssignmentDetailsFormProps,
	'classrooms' | 'labels' | 'available_at' | 'deadline_at' | 'answer_url'
> => ({
	classrooms: {
		label: t('assignment/assignment___klas'),
		dictionary: {
			placeholder: t('assignment/assignment___1-moderne-talen'),
			empty: t('assignment/assignment___geen-klassen-gevonden'),
		},
	},
	labels: {
		label: t('assignment/assignment___label'),
		dictionary: {
			placeholder: t('assignment/assignment___geschiedenis'),
			empty: t('assignment/assignment___geen-labels-gevonden'),
		},
	},
	available_at: {
		label: t('assignment/assignment___beschikbaar-vanaf'),
	},
	deadline_at: {
		label: t('assignment/assignment___deadline'),
		help: t(
			'assignment/assignment___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen'
		),
	},
	answer_url: {
		label: `${t('assignment/assignment___link')} (${t('assignment/assignment___optioneel')})`,
		help: t(
			'assignment/assignment___wil-je-je-leerling-een-taak-laten-maken-voeg-dan-hier-een-hyperlink-toe-naar-een-eigen-antwoordformulier-of-invuloefening'
		),
	},
});

export enum ASSIGNMENT_CREATE_UPDATE_TABS {
	Inhoud,
	Details,
}

export enum ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS {
	ASSIGNMENT = 'ASSIGNMENT',
	SEARCH = 'SEARCH',
	MY_COLLECTION = 'MY_COLLECTION',
}

export const EDIT_ASSIGNMENT_BLOCK_ICONS: () => AssignmentBlockTypeDict<IconName> = () => ({
	ITEM: 'video',
	TEXT: 'type',
	ZOEK: 'search',
});

export const EDIT_ASSIGNMENT_BLOCK_LABELS: (t: TFunction) => AssignmentBlockTypeDict<string> = (
	t
) => ({
	ITEM: t('assignment/assignment___fragment'),
	TEXT: t('assignment/assignment___instructie-of-tekstblok'),
	ZOEK: t('assignment/assignment___zoekoefening'),
});

export const GET_ASSIGNMENT_RESPONSE_OVERVIEW_COLUMNS = (
	assignmentType: AssignmentType
): AssignmentResponseColumn[] => [
	{
		id: 'pupil',
		label: i18n.t('assignment/assignment___leerling'),
		sortable: true,
		dataType: TableColumnDataType.string,
	},
	...(assignmentType === AssignmentType.BOUW
		? [
				{
					id: 'collection_title' as AssignmentResponseTableColumns,
					label: i18n.t('assignment/assignment___leerlingencollectie'),
					sortable: true,
					dataType: TableColumnDataType.string as ColumnDataType,
				},
				{
					id: 'pupil_collection_block_count' as AssignmentResponseTableColumns,
					label: i18n.t('assignment/assignment___fragmenten'),
					sortable: true,
					dataType: TableColumnDataType.number as ColumnDataType,
				},
				{
					id: 'updated_at' as AssignmentResponseTableColumns,
					label: i18n.t('assignment/assignment___laatst-bewerkt'),
					sortable: true,
					dataType: TableColumnDataType.dateTime as ColumnDataType,
				},
		  ]
		: [
				{
					id: 'updated_at' as AssignmentResponseTableColumns,
					label: i18n.t('assignment/assignment___laatst-bekeken'),
					sortable: true,
					dataType: TableColumnDataType.dateTime as ColumnDataType,
				},
		  ]),
	{ id: 'actions' as AssignmentResponseTableColumns, label: '' },
];

export const RESPONSE_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
	[columnId in AssignmentResponseTableColumns]: (order: Avo.Search.OrderDirection) => any;
}> = {
	pupil: (order: Avo.Search.OrderDirection) => ({
		owner: {
			full_name: order,
		},
	}),
	pupil_collection_block_count: (order: Avo.Search.OrderDirection) => ({
		pupil_collection_blocks_aggregate: {
			count: order,
		},
	}),
};

export const NEW_ASSIGNMENT_BLOCK_ID_PREFIX = 'tmp///';

export const isNewAssignmentBlock = (item: {id: string}): boolean => {
	return item.id.startsWith(NEW_ASSIGNMENT_BLOCK_ID_PREFIX);
}