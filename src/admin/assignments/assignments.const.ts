import { type ButtonType, IconName, type SelectOption } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';

import { type AssignmentOverviewTableColumns } from '../../assignment/assignment.types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { type CheckboxDropdownModalProps, type CheckboxOption } from '../../shared/components';
import { type BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import { EducationLevelId } from '../../shared/helpers/lom';
import { lomToCheckboxOption } from '../../shared/helpers/set-selected-checkboxes';
import { tText } from '../../shared/helpers/translate';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { type FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../shared/helpers/filters';

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

export const GET_ASSIGNMENT_OVERVIEW_TABLE_COLS = (
	userGroupOptions: CheckboxOption[],
	assignmentLabelOptions: CheckboxOption[],
	subjects: Avo.Lom.LomField[],
	educationLevels: Avo.Lom.LomField[]
): FilterableColumn<AssignmentOverviewTableColumns>[] => {
	const educationLevelOptions = [
		...educationLevels.map(lomToCheckboxOption),
		{
			checked: false,
			label: tText('admin/assignments/assignments___leeg'),
			id: NULL_FILTER,
		},
	];

	return [
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
			id: 'author_user_group',
			label: tText('admin/assignments/assignments___rol'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: userGroupOptions,
			} as CheckboxDropdownModalProps,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'last_user_edit_profile',
			label: tText('admin/assignments/assignments___laatst-bewerkt-door'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
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
			id: 'subjects',
			label: tText('admin/assignments/assignments___vakken'),
			sortable: false,
			visibleByDefault: false,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: [
					...subjects.map(lomToCheckboxOption),
					{
						checked: false,
						label: tText('admin/assignments/assignments___leeg'),
						id: NULL_FILTER,
					},
				],
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'education_level_id',
			label: tText('admin/assignments/assignments___kenmerk'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: [
					...educationLevelOptions.filter((option) => {
						return [
							EducationLevelId.secundairOnderwijs,
							EducationLevelId.lagerOnderwijs,
							NULL_FILTER,
						].includes(option.id);
					}),
				],
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'education_levels',
			label: tText('admin/assignments/assignments___opleidingsniveaus'),
			sortable: false,
			visibleByDefault: false,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: [...educationLevelOptions],
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'is_public',
			label: tText('admin/assignments/assignments___publiek'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'BooleanCheckboxDropdown',
			dataType: TableColumnDataType.boolean,
		},
		{
			id: 'quality_labels',
			label: tText('admin/assignments/assignments___labels'),
			sortable: false,
			visibleByDefault: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: assignmentLabelOptions,
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'is_copy',
			label: tText('admin/assignments/assignments___kopie'),
			sortable: false,
			visibleByDefault: false,
			filterType: 'BooleanCheckboxDropdown',
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
			id: 'bookmarks',
			icon: IconName.bookmark,
			tooltip: 'bookmarks',
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'copies',
			icon: IconName.copy,
			tooltip: 'copies',
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'contributors',
			icon: IconName.share2,
			tooltip: 'shared',
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
};
