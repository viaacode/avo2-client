import { Avo } from '@viaa/avo2-types';

import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { AssignmentBulkActionOption } from '../assignments/assignments.const';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

export const PUPIL_COLLECTIONS_PATH = {
	ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.pupilCollections}`,
};

export const ITEMS_PER_PAGE = 20;

export const GET_PUPIL_COLLECTION_BULK_ACTIONS = (
	user: Avo.User.User
): AssignmentBulkActionOption[] => {
	return [
		...(PermissionService.hasPerm(user, PermissionName.DELETE_ANY_PUPIL_COLLECTIONS)
			? [
					{
						label: i18n.t('admin/pupil-collection/pupil-collection___verwijderen'),
						value: 'delete',
					},
			  ]
			: []),
		...(PermissionService.hasPerm(user, PermissionName.EDIT_ANY_PUPIL_COLLECTIONS)
			? [
					{
						label: i18n.t('admin/pupil-collection/pupil-collection___auteur-aanpassen'),
						value: 'change_author',
					},
			  ]
			: []),
	];
};

export const GET_PUPIL_COLLECTIONS_OVERVIEW_TABLE_COLS: () => FilterableColumn[] = () => [
	{
		id: 'title',
		label: i18n.t('admin/pupil-collection/pupil-collection___titel-collectie'),
		sortable: true,
		visibleByDefault: true,
	},
	{
		id: 'pupil',
		label: i18n.t('admin/pupil-collection/pupil-collection___leerling'),
		sortable: true,
		visibleByDefault: true,
		filterType: 'MultiUserSelectDropdown',
	},
	{
		id: 'assignmentTitle',
		label: i18n.t('admin/pupil-collection/pupil-collection___titel-opdracht'),
		sortable: true,
		visibleByDefault: true,
	},
	{
		id: 'teacher',
		label: i18n.t('admin/pupil-collection/pupil-collection___lesgever'),
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