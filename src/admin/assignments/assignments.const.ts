import { type ButtonType, IconName, type SelectOption } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';

import { type AssignmentOverviewTableColumns } from '../../assignment/assignment.types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { type BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import {
	type CheckboxDropdownModalProps,
	type CheckboxOption,
} from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { ROUTE_PARTS } from '../../shared/constants';
import { EducationLevelId } from '../../shared/helpers/lom';
import { lomToCheckboxOption } from '../../shared/helpers/set-selected-checkboxes';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../shared/helpers/translate-text';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { type FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../shared/helpers/filters';

import { AssignmentsBulkAction } from './assignments.types';

export const ASSIGNMENTS_PATH = {
	ASSIGNMENTS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.assignments}`,
};

export const ITEMS_PER_PAGE = 20;

export type AssignmentBulkActionOption = SelectOption<string> & {
	confirm?: boolean;
	confirmButtonType?: ButtonType;
};

export const GET_ASSIGNMENT_BULK_ACTIONS = (
	commonUser: Avo.User.CommonUser | null | undefined,
	areRowsSelected: boolean
): AssignmentBulkActionOption[] => {
	if (!commonUser) {
		return [];
	}
	return [
		...(PermissionService.hasPerm(commonUser, PermissionName.DELETE_ANY_ASSIGNMENTS)
			? [
					{
						label: tText('admin/assignments/assignments___selectie-verwijderen'),
						value: AssignmentsBulkAction.DELETE,
						disabled: !areRowsSelected,
					},
			  ]
			: []),
		...(PermissionService.hasPerm(commonUser, PermissionName.EDIT_ANY_ASSIGNMENTS)
			? [
					{
						label: tText('admin/assignments/assignments___selectie-auteur-aanpassen'),
						value: AssignmentsBulkAction.CHANGE_AUTHOR,
						disabled: !areRowsSelected,
					},
			  ]
			: []),
		{
			label: tText('admin/assignments/assignments___alles-exporteren'),
			value: AssignmentsBulkAction.EXPORT_ALL,
			disabled: false,
		},
	];
};

export const GET_ASSIGNMENT_OVERVIEW_TABLE_COLS = (
	userGroupOptions: CheckboxOption[],
	assignmentLabelOptions: CheckboxOption[],
	subjects: Avo.Lom.LomField[],
	educationLevelsAndDegrees: Avo.Lom.LomField[]
): FilterableColumn<AssignmentOverviewTableColumns>[] => {
	const NULL_FILTER_OPTION = {
		checked: false,
		label: tText('admin/users/user___leeg'),
		id: NULL_FILTER,
	};
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
				options: [...subjects.map(lomToCheckboxOption), NULL_FILTER_OPTION],
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
					...educationLevelsAndDegrees
						.filter((item) => {
							return [
								EducationLevelId.secundairOnderwijs,
								EducationLevelId.lagerOnderwijs,
							].includes(item.id as EducationLevelId);
						})
						.map(lomToCheckboxOption),
					NULL_FILTER_OPTION,
				],
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'education_levels',
			label: tText('admin/assignments/assignments___onderwijsniveaus'),
			sortable: false,
			visibleByDefault: false,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: [
					...educationLevelsAndDegrees
						.filter((item) => !item.broader)
						.map(lomToCheckboxOption),
					NULL_FILTER_OPTION,
				],
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'education_degrees',
			label: tText('admin/assignments/assignments___onderwijsgraden'),
			sortable: false,
			visibleByDefault: false,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: [
					...educationLevelsAndDegrees
						.filter((item) => item.broader)
						.map(lomToCheckboxOption),
					NULL_FILTER_OPTION,
				],
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
			tooltip: tText('admin/assignments/assignments___views'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.number,
		},
		{
			id: 'bookmarks',
			icon: IconName.bookmark,
			tooltip: tText('admin/assignments/assignments___bookmarks'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.number,
		},
		{
			id: 'copies',
			icon: IconName.copy,
			tooltip: tText('admin/assignments/assignments___kopies'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.number,
		},
		{
			id: 'in_bundle',
			icon: IconName.folder,
			tooltip: tText('admin/assignments/assignments___aantal-keer-opgenomen-in-een-bundel'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.number,
		},
		{
			id: 'contributors',
			icon: IconName.share2,
			tooltip: tText('admin/assignments/assignments___gedeeld'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.number,
		},
		{
			id: ACTIONS_TABLE_COLUMN_ID,
			tooltip: tText('admin/assignments/assignments___acties'),
			sortable: false,
			visibleByDefault: true,
		},
	];
};
