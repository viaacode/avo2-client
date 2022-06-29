import { ButtonType, SelectOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

import { AssignmentsOverviewTableCols } from './assignments.types';

export const ASSIGNMENTS_PATH = {
	ASSIGNMENTS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.assignments}`,
	ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.pupilCollections}`,
};

export const ITEMS_PER_PAGE = 20;

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in AssignmentsOverviewTableCols]: (order: Avo.Search.OrderDirection) => any;
	}
> = {
	owner: (order: Avo.Search.OrderDirection) => ({
		owner: { full_name: order },
	}),
	views: (order: Avo.Search.OrderDirection) => ({
		view_counts_aggregate: {
			sum: {
				count: order,
			},
		},
	}),
	pupilCollections: (order: Avo.Search.OrderDirection) => ({
		responses_aggregate: { count: order },
	}),
};

type AssignmentBulkActionOption = SelectOption<string> & {
	confirm?: boolean;
	confirmButtonType?: ButtonType;
};

export const GET_ASSIGNMENT_BULK_ACTIONS = (user: Avo.User.User): AssignmentBulkActionOption[] => {
	return [
		...(PermissionService.hasPerm(user, PermissionName.DELETE_ANY_ASSIGNMENTS)
			? [
					{
						label: i18n.t('admin/assignments/assignments___verwijderen'),
						value: 'delete',
					},
			  ]
			: []),
		...(PermissionService.hasPerm(user, PermissionName.EDIT_ANY_ASSIGNMENTS)
			? [
					{
						label: i18n.t('admin/assignments/assignments___auteur-aanpassen'),
						value: 'change_author',
					},
			  ]
			: []),
	];
};

export const GET_PUPIL_COLLECTION_BULK_ACTIONS = (
	user: Avo.User.User
): AssignmentBulkActionOption[] => {
	return [
		...(PermissionService.hasPerm(user, PermissionName.DELETE_ANY_PUPIL_COLLECTIONS)
			? [
					{
						label: i18n.t('Verwijderen'),
						value: 'delete',
					},
			  ]
			: []),
		...(PermissionService.hasPerm(user, PermissionName.EDIT_ANY_PUPIL_COLLECTIONS)
			? [
					{
						label: i18n.t('Auteur aanpassen'),
						value: 'change_author',
					},
			  ]
			: []),
	];
};

export const GET_ASSIGNMENT_OVERVIEW_TABLE_COLS: () => FilterableColumn[] = () => [
	{
		id: 'title',
		label: i18n.t('admin/assignments/assignments___title'),
		sortable: true,
		visibleByDefault: true,
	},
	{
		id: 'owner',
		label: i18n.t('admin/assignments/assignments___auteur'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'MultiUserSelectDropdown',
	},
	{
		id: 'created_at',
		label: i18n.t('admin/assignments/assignments___aangemaakt-op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'updated_at',
		label: i18n.t('admin/assignments/assignments___aangepast-op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'deadline_at',
		label: i18n.t('admin/assignments/assignments___vervaldatum'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'status',
		label: i18n.t('admin/assignments/assignments___status'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'BooleanCheckboxDropdown',
		filterProps: {
			trueLabel: i18n.t('admin/assignments/assignments___actief'),
			falseLabel: i18n.t('admin/assignments/assignments___afgelopen'),
			includeEmpty: false,
		} as BooleanCheckboxDropdownProps,
		dataType: TableColumnDataType.boolean,
	},
	{
		id: 'pupilCollections',
		label: i18n.t('admin/assignments/assignments___leerlingencollecties'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'BooleanCheckboxDropdown',
		filterProps: {
			includeEmpty: false,
		} as BooleanCheckboxDropdownProps,
		dataType: TableColumnDataType.boolean,
	},
	{
		id: 'views',
		icon: 'eye',
		tooltip: 'views',
		sortable: false,
		visibleByDefault: true,
	},
	{
		id: 'actions',
		tooltip: 'actions',
		sortable: false,
		visibleByDefault: true,
	},
];

export const GET_PUPIL_COLLECTIONS_OVERVIEW_TABLE_COLS: () => FilterableColumn[] = () => [
	{
		id: 'title',
		label: i18n.t('Titel collectie'),
		sortable: true,
		visibleByDefault: true,
	},
	{
		id: 'pupil',
		label: i18n.t('Leerling'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'MultiUserSelectDropdown',
	},
	{
		id: 'assignmentTitle',
		label: i18n.t('Titel opdracht'),
		sortable: true,
		visibleByDefault: true,
	},
	{
		id: 'teacher',
		label: i18n.t('Lesgever'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'MultiUserSelectDropdown',
	},
	{
		id: 'created_at',
		label: i18n.t('admin/assignments/assignments___aangemaakt-op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'updated_at',
		label: i18n.t('admin/assignments/assignments___aangepast-op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'deadline_at',
		label: i18n.t('admin/assignments/assignments___vervaldatum'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'status',
		label: i18n.t('admin/assignments/assignments___status'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'BooleanCheckboxDropdown',
		filterProps: {
			trueLabel: i18n.t('admin/assignments/assignments___actief'),
			falseLabel: i18n.t('admin/assignments/assignments___afgelopen'),
			includeEmpty: false,
		} as BooleanCheckboxDropdownProps,
		dataType: TableColumnDataType.boolean,
	},
	{
		id: 'actions',
		tooltip: 'actions',
		sortable: false,
		visibleByDefault: true,
	},
];
