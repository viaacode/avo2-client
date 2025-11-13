import {
  type FilterableColumn,
  TableFilterType,
} from '@meemoo/admin-core-ui/admin'
import { type Avo, PermissionName } from '@viaa/avo2-types'

import { PermissionService } from '../../authentication/helpers/permission-service';
import { type PupilCollectionOverviewTableColumns } from '../../pupil-collection/pupil-collection.types';
import { type BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown';
import { ROUTE_PARTS } from '../../shared/constants/index';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../shared/helpers/translate-text';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { type AssignmentBulkActionOption } from '../assignments/assignments.const';
import { AssignmentsBulkAction } from '../assignments/assignments.types';

export const PUPIL_COLLECTIONS_PATH = {
  ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.pupilCollections}`,
}

export const ITEMS_PER_PAGE = 20

export const GET_PUPIL_COLLECTION_BULK_ACTIONS = (
  commonUser: Avo.User.CommonUser | null | undefined,
  areRowsSelected: boolean,
): AssignmentBulkActionOption[] => {
  if (!commonUser) {
    return []
  }
  return [
    ...(PermissionService.hasPerm(
      commonUser,
      PermissionName.DELETE_ANY_PUPIL_COLLECTIONS,
    )
      ? [
          {
            label: tText(
              'admin/pupil-collection/pupil-collection___a-selectie-verwijderen',
            ),
            value: AssignmentsBulkAction.DELETE,
            disabled: !areRowsSelected,
          },
        ]
      : []),
    ...(PermissionService.hasPerm(
      commonUser,
      PermissionName.EDIT_ANY_PUPIL_COLLECTIONS,
    )
      ? [
          {
            label: tText(
              'admin/pupil-collection/pupil-collection___selectie-auteur-aanpassen',
            ),
            value: AssignmentsBulkAction.CHANGE_AUTHOR,
            disabled: !areRowsSelected,
          },
        ]
      : []),
    {
      label: tText(
        'admin/pupil-collection/pupil-collection___alles-exporteren',
      ),
      value: AssignmentsBulkAction.EXPORT_ALL,
    },
  ]
}

export const GET_PUPIL_COLLECTIONS_OVERVIEW_TABLE_COLS: () => FilterableColumn<PupilCollectionOverviewTableColumns>[] =
  () => [
    {
      id: 'title',
      label: tText('admin/pupil-collection/pupil-collection___titel-collectie'),
      sortable: true,
      visibleByDefault: true,
    },
    {
      id: 'pupil',
      label: tText('admin/pupil-collection/pupil-collection___leerling'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.MultiUserSelectDropdown,
    },
    {
      id: 'assignmentTitle',
      label: tText('admin/pupil-collection/pupil-collection___titel-opdracht'),
      sortable: true,
      visibleByDefault: true,
    },
    {
      id: 'teacher',
      label: tText('admin/pupil-collection/pupil-collection___lesgever'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.MultiUserSelectDropdown,
    },
    {
      id: 'created_at',
      label: tText('admin/assignments/assignments___aangemaakt-op'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.DateRangeDropdown,
      dataType: TableColumnDataType.dateTime,
    },
    {
      id: 'updated_at',
      label: tText('admin/assignments/assignments___aangepast-op'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.DateRangeDropdown,
      dataType: TableColumnDataType.dateTime,
    },
    {
      id: 'deadline_at',
      label: tText('admin/assignments/assignments___vervaldatum'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.DateRangeDropdown,
      dataType: TableColumnDataType.dateTime,
    },
    {
      id: 'status',
      label: tText('admin/assignments/assignments___status'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.BooleanCheckboxDropdown,
      filterProps: {
        trueLabel: tText('admin/assignments/assignments___actief'),
        falseLabel: tText('admin/assignments/assignments___afgelopen'),
        includeEmpty: false,
      } as BooleanCheckboxDropdownProps,
      dataType: TableColumnDataType.boolean,
    },
    {
      id: ACTIONS_TABLE_COLUMN_ID,
      tooltip: tText('admin/pupil-collection/pupil-collection___acties'),
      sortable: false,
      visibleByDefault: true,
    },
  ]
