import { type Avo } from '@viaa/avo2-types';
import { type TFunction } from 'i18next';
import { type ReactNode } from 'react';
import { array, object, type Schema, string } from 'yup';

import { ContentTypeString } from '../collection/collection.types';
import { SearchFilter, SearchOrderAndDirectionProperty } from '../search/search.const';
import { ROUTE_PARTS } from '../shared/constants';
import { EducationLevelId } from '../shared/helpers/lom';
import { ACTIONS_TABLE_COLUMN_ID } from '../shared/helpers/table-column-list-to-csv-column-list';
import { tHtml } from '../shared/helpers/translate-html';
import { tText } from '../shared/helpers/translate-text';
import { TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	type AssignmentColumn,
	type AssignmentResponseColumn,
	type AssignmentResponseFormState,
	type AssignmentResponseTableColumns,
	type AssignmentTableColumns,
	AssignmentType,
} from './assignment.types';
import { type AssignmentFields } from './hooks/assignment-form';

export const ITEMS_PER_PAGE = 20;

export const MAX_TITLE_LENGTH = 110;
export const MAX_SEARCH_DESCRIPTION_LENGTH = 300;
export const MAX_LONG_DESCRIPTION_LENGTH = 1200;
export const MAX_LABEL_LENGTH = 20;

export const CONTENT_LABEL_TO_ROUTE_PARTS: {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	[contentType in Avo.Assignment.ContentLabel]: string /* eslint-enable @typescript-eslint/no-unused-vars */;
} = {
	ITEM: ROUTE_PARTS.item,
	COLLECTIE: ROUTE_PARTS.collections,
	ZOEKOPDRACHT: ROUTE_PARTS.searchQuery,
};

type ColumnDataType = 'string' | 'number' | 'boolean' | 'dateTime' | undefined;

const getLabelsColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	// Only show labels to teachers, not to pupils
	return canEditAssignments
		? [
				{
					id: 'labels' as AssignmentTableColumns,
					label: tText('assignment/assignment___label'),
					sortable: false,
				},
		  ]
		: [];
};

const getTeacherColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	// Only show the teacher column to pupils
	return canEditAssignments
		? []
		: [
				{
					id: 'author' as AssignmentTableColumns,
					label: tText('assignment/views/assignment-overview___leerkracht'),
					sortable: true,
					dataType: TableColumnDataType.string as ColumnDataType,
				},
		  ];
};

const getClassColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? [
				{
					id: 'class_room' as AssignmentTableColumns,
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
					id: 'updated_at' as AssignmentTableColumns,
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
					id: 'responses' as AssignmentTableColumns,
					label: tText('assignment/assignment___respons'),
					sortable: true,
					dataType: TableColumnDataType.number,
				},
		  ]
		: [];
};

const getActionsColumn = (canEditAssignments: boolean | null): AssignmentColumn[] => {
	return canEditAssignments
		? [{ id: ACTIONS_TABLE_COLUMN_ID as AssignmentTableColumns, label: '' }]
		: [];
};

const getSharedColumn = (canEditAssignments: boolean | null) => {
	return canEditAssignments
		? [
				{
					id: 'share_type' as AssignmentTableColumns,
					label: tText('assignment/assignment___gedeeld'),
					sortable: true,
					dataType: TableColumnDataType.string,
				},
		  ]
		: [];
};

const getIsPublicColumn = (showPublicState: boolean | null) => {
	return showPublicState
		? [
				{
					id: 'is_public' as AssignmentTableColumns,
					label: tText('assignment/assignment___is-publiek'),
					col: '2',
					sortable: true,
					dataType: TableColumnDataType.boolean,
				},
		  ]
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
	...getLabelsColumn(canEditAssignments),
	...getTeacherColumn(canEditAssignments),
	{
		id: 'deadline_at' as AssignmentTableColumns,
		label: tText('assignment/views/assignment-overview___deadline'),
		sortable: true,
		dataType: TableColumnDataType.dateTime,
	},
];

export const GET_ASSIGNMENT_OVERVIEW_COLUMNS = (
	canEditAssignments: boolean | null,
	showPublicState: boolean | null
): AssignmentColumn[] => [
	...GET_ASSIGNMENT_OVERVIEW_COLUMNS_FOR_MODAL(canEditAssignments),
	...getLastEditColumn(canEditAssignments),
	...getSharedColumn(canEditAssignments),
	...getIsPublicColumn(showPublicState),
	...getResponseColumn(canEditAssignments),
	...getActionsColumn(canEditAssignments),
];

/// Zoek & bouw
export const ASSIGNMENT_FORM_SCHEMA = (tText: TFunction): Schema<Avo.Assignment.Assignment> => {
	return object({
		id: string().optional(),
		title: string()
			.required(tText('assignment/assignment___titel-is-verplicht'))
			.max(
				110,
				tText('assignment/assignment___de-titel-mag-maximum-110-karakters-lang-zijn')
			),
		description: string().max(
			300,
			tText(
				'assignment/assignment___de-korte-beschrijving-mag-maximaal-300-karakters-lang-zijn'
			)
		),
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
): Schema<Partial<AssignmentResponseFormState>> => {
	return object({
		id: string().optional(),
		collection_title: string().required(tText('assignment/assignment___titel-is-verplicht')),
		pupil_collection_blocks: array(),
	});
};

export const ASSIGNMENT_FORM_DEFAULT = (): Partial<AssignmentFields> => ({
	id: undefined,
	title: tText('assignment/assignment___titel-opdracht'),
	labels: [],
	blocks: [],
	available_at: new Date().toISOString(),
	answer_url: undefined,
	deadline_at: undefined,
});

export enum ASSIGNMENT_CREATE_UPDATE_TABS {
	CONTENT = 'inhoud',
	DETAILS = 'details',
	PUBLISH = 'publicatiedetails',
	CLICKS = 'kliks',
	ADMIN = 'beheer',
	MARCOM = 'communicatie',
}

export enum ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS {
	ASSIGNMENT = 'ASSIGNMENT',
	SEARCH = 'SEARCH',
	MY_COLLECTION = 'MY_COLLECTION',
}

export const GET_ASSIGNMENT_RESPONSE_OVERVIEW_COLUMNS = (
	assignmentTypes: AssignmentType[]
): AssignmentResponseColumn[] => [
	{
		id: 'pupil',
		label: tText('assignment/assignment___leerling'),
		sortable: true,
		dataType: TableColumnDataType.string,
	},
	...(assignmentTypes.includes(AssignmentType.BOUW)
		? [
				{
					id: 'collection_title' as const,
					label: tText('assignment/assignment___leerlingencollectie'),
					sortable: true,
					dataType: TableColumnDataType.string as ColumnDataType,
				},
				{
					id: 'pupil_collection_block_count' as const,
					label: tText('assignment/assignment___fragmenten'),
					sortable: true,
					dataType: TableColumnDataType.number as ColumnDataType,
				},
				{
					id: 'updated_at' as const,
					label: tText('assignment/assignment___laatst-bewerkt'),
					sortable: true,
					dataType: TableColumnDataType.dateTime as ColumnDataType,
				},
		  ]
		: [
				{
					id: 'updated_at' as const,
					label: tText('assignment/assignment___laatst-bekeken'),
					sortable: true,
					dataType: TableColumnDataType.dateTime as ColumnDataType,
				},
		  ]),
	{ id: ACTIONS_TABLE_COLUMN_ID, label: '' },
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

export const ENABLED_ORDER_PROPERTIES_PUPIL_SEARCH: SearchOrderAndDirectionProperty[] = [
	SearchOrderAndDirectionProperty.relevanceDesc,
	SearchOrderAndDirectionProperty.broadcastDateDesc,
	SearchOrderAndDirectionProperty.broadcastDateAsc,
];

export const NEW_ASSIGNMENT_BLOCK_ID_PREFIX = 'tmp///';

export const isNewAssignmentBlock = (item: Pick<Avo.Core.BlockItemBase, 'id'>): boolean => {
	return String(item.id).startsWith(NEW_ASSIGNMENT_BLOCK_ID_PREFIX);
};

export const GET_EDUCATION_LEVEL_DICT: () => Partial<Record<EducationLevelId, ReactNode>> = () => ({
	[EducationLevelId.lagerOnderwijs]: tHtml(
		'assignment/views/assignment-detail___lager-onderwijs'
	),
	[EducationLevelId.secundairOnderwijs]: tHtml(
		'assignment/views/assignment-detail___secundair-onderwijs'
	),
});

export const GET_EDUCATION_LEVEL_TOOLTIP_DICT: () => Partial<
	Record<EducationLevelId, ReactNode>
> = () => ({
	[EducationLevelId.lagerOnderwijs]: tHtml(
		'assignment/views/assignment-detail___lager-onderwijs-tooltip'
	),
	[EducationLevelId.secundairOnderwijs]: tHtml(
		'assignment/views/assignment-detail___secundair-onderwijs-tooltip'
	),
});
