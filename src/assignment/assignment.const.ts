import type { Avo } from '@viaa/avo2-types';
import { TFunction } from 'i18next';
import { array, object, SchemaOf, string } from 'yup';

import { ContentTypeString } from '../collection/collection.types';
import { SearchFilter, SearchOrderProperty } from '../search/search.const';
import { ROUTE_PARTS } from '../shared/constants';
import { tText } from '../shared/helpers/translate';
import { TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	AssignmentColumn,
	AssignmentFormState,
	AssignmentOverviewTableColumns,
	AssignmentResponseColumn,
	AssignmentResponseFormState,
	AssignmentResponseTableColumns,
	AssignmentType,
	BaseBlockWithMeta,
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
	return [
		{
			id: 'labels' as AssignmentOverviewTableColumns,
			label: tText('assignment/assignment___label'),
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
					label: tText('assignment/views/assignment-overview___leerkracht'),
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
					label: tText('assignment/views/assignment-overview___klas'),
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
					label: tText('assignment/assignment___laatst-bewerkt'),
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
					label: tText('assignment/assignment___respons'),
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
		label: tText('assignment/views/assignment-overview___titel'),
		sortable: true,
		dataType: TableColumnDataType.string,
	},
	...getClassColumn(canEditAssignments),
	...getLabelsColumn(),
	...getTeacherColumn(canEditAssignments),
	{
		id: 'deadline_at' as AssignmentOverviewTableColumns,
		label: tText('assignment/views/assignment-overview___deadline'),
		sortable: true,
		dataType: TableColumnDataType.dateTime,
	},
];

export const GET_ASSIGNMENT_OVERVIEW_COLUMNS = (
	canEditAssignments: boolean | null
): AssignmentColumn[] => [
	...GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL(canEditAssignments),
	...getLastEditColumn(canEditAssignments),
	...getResponseColumn(canEditAssignments),
	...getActionsColumn(canEditAssignments),
];

export const ASSIGNMENTS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
	[columnId in AssignmentOverviewTableColumns]: (order: Avo.Search.OrderDirection) => any;
}> = {
	author: (order: Avo.Search.OrderDirection) => ({
		owner: {
			full_name: order,
		},
	}),
	status: (order: Avo.Search.OrderDirection) => ({
		deadline_at: order,
	}),
	responses: (order: Avo.Search.OrderDirection) => ({
		responses_aggregate: {
			count: order,
		},
	}),
	views: (order: Avo.Search.OrderDirection) => ({
		view_count: {
			count: order,
		},
	}),
};

/// Zoek & bouw
export const ASSIGNMENT_FORM_SCHEMA = (tText: TFunction): SchemaOf<AssignmentFormState> => {
	return object({
		id: string().optional(),
		title: string().required(tText('assignment/assignment___titel-is-verplicht')),
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
		available_at: string().nullable().optional(),
		deadline_at: string().nullable().optional(),
	}) as any;
};

export const PUPIL_COLLECTION_FORM_SCHEMA = (
	tText: TFunction
): SchemaOf<AssignmentResponseFormState> => {
	return object({
		id: string().optional(),
		collection_title: string().required(tText('assignment/assignment___titel-is-verplicht')),
		pupil_collection_blocks: array(),
	});
};

export const ASSIGNMENT_FORM_DEFAULT = (): Partial<AssignmentFormState> => ({
	id: undefined,
	title: tText('assignment/assignment___titel-opdracht'),
	labels: [],
	blocks: [],
	available_at: new Date().toISOString(),
	answer_url: undefined,
	deadline_at: undefined,
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

export const GET_ASSIGNMENT_RESPONSE_OVERVIEW_COLUMNS = (
	assignmentType: AssignmentType
): AssignmentResponseColumn[] => [
	{
		id: 'pupil',
		label: tText('assignment/assignment___leerling'),
		sortable: true,
		dataType: TableColumnDataType.string,
	},
	...(assignmentType === AssignmentType.BOUW
		? [
				{
					id: 'collection_title' as AssignmentResponseTableColumns,
					label: tText('assignment/assignment___leerlingencollectie'),
					sortable: true,
					dataType: TableColumnDataType.string as ColumnDataType,
				},
				{
					id: 'pupil_collection_block_count' as AssignmentResponseTableColumns,
					label: tText('assignment/assignment___fragmenten'),
					sortable: true,
					dataType: TableColumnDataType.number as ColumnDataType,
				},
				{
					id: 'updated_at' as AssignmentResponseTableColumns,
					label: tText('assignment/assignment___laatst-bewerkt'),
					sortable: true,
					dataType: TableColumnDataType.dateTime as ColumnDataType,
				},
		  ]
		: [
				{
					id: 'updated_at' as AssignmentResponseTableColumns,
					label: tText('assignment/assignment___laatst-bekeken'),
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

export const ENABLED_FILTERS_PUPIL_SEARCH: SearchFilter[] = [
	SearchFilter.type,
	SearchFilter.serie,
	SearchFilter.broadcastDate,
	SearchFilter.provider,
];

export const ENABLED_TYPE_FILTER_OPTIONS_PUPIL_SEARCH: Avo.Core.ContentType[] = [
	ContentTypeString.video,
	ContentTypeString.audio,
];

export const ENABLED_ORDER_PROPERTIES_PUPIL_SEARCH: SearchOrderProperty[] = [
	SearchOrderProperty.relevanceDesc,
	SearchOrderProperty.broadcastDateDesc,
	SearchOrderProperty.broadcastDateAsc,
];

export const NEW_ASSIGNMENT_BLOCK_ID_PREFIX = 'tmp///';

export const isNewAssignmentBlock = (item: Pick<BaseBlockWithMeta, 'id'>): boolean => {
	return String(item.id).startsWith(NEW_ASSIGNMENT_BLOCK_ID_PREFIX);
};
