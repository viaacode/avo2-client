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
	responses: (order: Avo.Search.OrderDirection) => ({ responses_aggregate: { count: order } }),
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
						label: i18n.t('Verwijderen'),
						value: 'delete',
					},
			  ]
			: []),
		...(PermissionService.hasPerm(user, PermissionName.EDIT_ANY_ASSIGNMENTS)
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
		label: i18n.t('Title'),
		sortable: true,
		visibleByDefault: true,
	},
	{
		id: 'owner',
		label: i18n.t('Auteur'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'MultiUserSelectDropdown',
	},
	{
		id: 'created_at',
		label: i18n.t('Aangemaakt op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'updated_at',
		label: i18n.t('Aangepast op'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'deadline_at',
		label: i18n.t('Vervaldatum'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'DateRangeDropdown',
		dataType: TableColumnDataType.dateTime,
	},
	{
		id: 'status',
		label: i18n.t('Status'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'BooleanCheckboxDropdown',
		filterProps: {
			trueLabel: i18n.t('Actief'),
			falseLabel: i18n.t('Afgelopen'),
			includeEmpty: false,
		} as BooleanCheckboxDropdownProps,
		dataType: TableColumnDataType.boolean,
	},
	{
		id: 'responses',
		label: i18n.t('Leerlingencollecties'),
		sortable: true,
		visibleByDefault: true,
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
