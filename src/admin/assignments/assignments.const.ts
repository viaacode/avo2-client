import { ButtonType, IconName, SelectOption } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';

import { AssignmentOverviewTableColumns } from '../../assignment/assignment.types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import { tText } from '../../shared/helpers/translate';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

export const ASSIGNMENTS_PATH = {
	ASSIGNMENTS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.assignments}`,
};

export const ITEMS_PER_PAGE = 20;

export type AssignmentBulkActionOption = SelectOption<string> & {
	confirm?: boolean;
	confirmButtonType?: ButtonType;
};

export const GET_ASSIGNMENT_BULK_ACTIONS = (user: Avo.User.User): AssignmentBulkActionOption[] => {
	return [
		...(PermissionService.hasPerm(user, PermissionName.DELETE_ANY_ASSIGNMENTS)
			? [
					{
						label: tText('admin/assignments/assignments___verwijderen'),
						value: 'delete',
					},
			  ]
			: []),
		...(PermissionService.hasPerm(user, PermissionName.EDIT_ANY_ASSIGNMENTS)
			? [
					{
						label: tText('admin/assignments/assignments___auteur-aanpassen'),
						value: 'change_author',
					},
			  ]
			: []),
	];
};

export const GET_ASSIGNMENT_OVERVIEW_TABLE_COLS: () => FilterableColumn<AssignmentOverviewTableColumns>[] =
	() => [
		{
			id: 'title',
			label: tText('admin/assignments/assignments___title'),
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'author',
			label: tText('admin/assignments/assignments___auteur'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'MultiUserSelectDropdown',
		},
		{
			id: 'created_at',
			label: tText('admin/assignments/assignments___aangemaakt-op'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'DateRangeDropdown',
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: 'updated_at',
			label: tText('admin/assignments/assignments___aangepast-op'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'DateRangeDropdown',
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: 'deadline_at',
			label: tText('admin/assignments/assignments___vervaldatum'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'DateRangeDropdown',
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: 'status',
			label: tText('admin/assignments/assignments___status'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'BooleanCheckboxDropdown',
			filterProps: {
				trueLabel: tText('admin/assignments/assignments___actief'),
				falseLabel: tText('admin/assignments/assignments___afgelopen'),
				includeEmpty: false,
			} as BooleanCheckboxDropdownProps,
			dataType: TableColumnDataType.boolean,
		},
		{
			id: 'responses',
			label: tText('admin/assignments/assignments___leerlingencollecties'),
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
			icon: IconName.eye,
			tooltip: 'views',
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'actions',
			tooltip: 'actions',
			sortable: false,
			visibleByDefault: true,
		},
	];
