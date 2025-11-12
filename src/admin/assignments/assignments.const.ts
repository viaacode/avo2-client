import {
  type FilterableColumn,
  TableFilterType,
} from '@meemoo/admin-core-ui/admin'
import {
  type ButtonType,
  IconName,
  type SelectOption,
} from '@viaa/avo2-components'
import { type Avo, PermissionName } from '@viaa/avo2-types'

import { type AssignmentTableColumns } from '../../assignment/assignment.types.js'
import { PermissionService } from '../../authentication/helpers/permission-service.js'
import { type BooleanCheckboxDropdownProps } from '../../shared/components/BooleanCheckboxDropdown/BooleanCheckboxDropdown.js'
import {
  type CheckboxDropdownModalProps,
  type CheckboxOption,
} from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal.js'
import { ROUTE_PARTS } from '../../shared/constants/index.js'
import { EducationLevelId } from '../../shared/helpers/lom.js'
import { lomToCheckboxOption } from '../../shared/helpers/set-selected-checkboxes.js'
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list.js'
import { tText } from '../../shared/helpers/translate-text.js'
import { TableColumnDataType } from '../../shared/types/table-column-data-type.js'
import { NULL_FILTER } from '../shared/helpers/filters.js'

import { AssignmentsBulkAction } from './assignments.types.js'

export const ASSIGNMENTS_PATH = {
  ASSIGNMENTS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.assignments}`,
  ASSIGNMENTS_MARCOM_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.assignments}/${ROUTE_PARTS.marcom}`,
}

export const ITEMS_PER_PAGE = 20

export type AssignmentBulkActionOption = SelectOption<string> & {
  confirm?: boolean
  confirmButtonType?: ButtonType
}

export const GET_ASSIGNMENT_BULK_ACTIONS = (
  commonUser: Avo.User.CommonUser | null | undefined,
  areRowsSelected: boolean,
): AssignmentBulkActionOption[] => {
  if (!commonUser) {
    return []
  }
  return [
    ...(PermissionService.hasPerm(
      commonUser,
      PermissionName.DELETE_ANY_ASSIGNMENTS,
    )
      ? [
          {
            label: tText(
              'admin/assignments/assignments___selectie-verwijderen',
            ),
            value: AssignmentsBulkAction.DELETE,
            disabled: !areRowsSelected,
          },
        ]
      : []),
    ...(PermissionService.hasPerm(
      commonUser,
      PermissionName.EDIT_ANY_ASSIGNMENTS,
    )
      ? [
          {
            label: tText(
              'admin/assignments/assignments___selectie-auteur-aanpassen',
            ),
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
  ]
}

function getAssignmentTitleColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'title',
    label: tText('admin/assignments/assignments___title'),
    sortable: true,
    visibleByDefault: true,
  }
}

function getAssignmentAuthorColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'author',
    label: tText('admin/assignments/assignments___auteur'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.MultiUserSelectDropdown,
  }
}

function getAssignmentAuthorUserGroupColumn(
  userGroupOptions: CheckboxOption[],
): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'author_user_group',
    label: tText('admin/assignments/assignments___rol'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: userGroupOptions,
    } as CheckboxDropdownModalProps,
    dataType: TableColumnDataType.string,
  }
}

function getAssignmentLastUserEditProfileColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'last_user_edit_profile',
    label: tText('admin/assignments/assignments___laatst-bewerkt-door'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.string,
  }
}

function getAssignmentCreatedAtColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'created_at',
    label: tText('admin/assignments/assignments___aangemaakt-op'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.DateRangeDropdown,
    dataType: TableColumnDataType.dateTime,
  }
}

function getAssignmentUpdatedAtColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'updated_at',
    label: tText('admin/assignments/assignments___aangepast-op'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.DateRangeDropdown,
    dataType: TableColumnDataType.dateTime,
  }
}

function getAssignmentDeadlineAtColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'deadline_at',
    label: tText('admin/assignments/assignments___vervaldatum'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.DateRangeDropdown,
    dataType: TableColumnDataType.dateTime,
  }
}

function getAssignmentStatusColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
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
  }
}

function getAssignmentSubjectsColumn(
  subjects: Avo.Lom.LomField[],
): FilterableColumn<AssignmentTableColumns> {
  const NULL_FILTER_OPTION = {
    checked: false,
    label: tText('admin/users/user___leeg'),
    id: NULL_FILTER,
  }
  return {
    id: 'subjects',
    label: tText('admin/assignments/assignments___vakken'),
    sortable: false,
    visibleByDefault: false,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: [...subjects.map(lomToCheckboxOption), NULL_FILTER_OPTION],
    } as CheckboxDropdownModalProps,
  }
}

function getAssignmentEducationLevelIdColumn(
  educationLevelsAndDegrees: Avo.Lom.LomField[],
): FilterableColumn<AssignmentTableColumns> {
  const NULL_FILTER_OPTION = {
    checked: false,
    label: tText('admin/users/user___leeg'),
    id: NULL_FILTER,
  }
  return {
    id: 'education_level_id',
    label: tText('admin/assignments/assignments___kenmerk'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: [
        ...educationLevelsAndDegrees
          .filter((item) => {
            return [
              EducationLevelId.secundairOnderwijs,
              EducationLevelId.lagerOnderwijs,
            ].includes(item.id as EducationLevelId)
          })
          .map(lomToCheckboxOption),
        NULL_FILTER_OPTION,
      ],
    } as CheckboxDropdownModalProps,
  }
}

function getAssignmentEducationLevelsColumn(
  educationLevelsAndDegrees: Avo.Lom.LomField[],
): FilterableColumn<AssignmentTableColumns> {
  const NULL_FILTER_OPTION = {
    checked: false,
    label: tText('admin/users/user___leeg'),
    id: NULL_FILTER,
  }
  return {
    id: 'education_levels',
    label: tText('admin/assignments/assignments___onderwijsniveaus'),
    sortable: false,
    visibleByDefault: false,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: [
        ...educationLevelsAndDegrees
          .filter((item) => !item.broader)
          .map(lomToCheckboxOption),
        NULL_FILTER_OPTION,
      ],
    } as CheckboxDropdownModalProps,
  }
}

function getAssignmentEducationDegreesColumn(
  educationLevelsAndDegrees: Avo.Lom.LomField[],
): FilterableColumn<AssignmentTableColumns> {
  const NULL_FILTER_OPTION = {
    checked: false,
    label: tText('admin/users/user___leeg'),
    id: NULL_FILTER,
  }
  return {
    id: 'education_degrees',
    label: tText('admin/assignments/assignments___onderwijsgraden'),
    sortable: false,
    visibleByDefault: false,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: [
        ...educationLevelsAndDegrees
          .filter((item) => item.broader)
          .map(lomToCheckboxOption),
        NULL_FILTER_OPTION,
      ],
    } as CheckboxDropdownModalProps,
  }
}

function getAssignmentIsPublicColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'is_public',
    label: tText('admin/assignments/assignments___publiek'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.BooleanCheckboxDropdown,
    dataType: TableColumnDataType.boolean,
  }
}

function getAssignmentQualityLabelsColumn(
  assignmentLabelOptions: CheckboxOption[],
): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'quality_labels',
    label: tText('admin/assignments/assignments___labels'),
    sortable: false,
    visibleByDefault: true,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: assignmentLabelOptions,
    } as CheckboxDropdownModalProps,
  }
}

function getAssignmentIsCopyColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'is_copy',
    label: tText('admin/assignments/assignments___kopie'),
    sortable: false,
    visibleByDefault: false,
    filterType: TableFilterType.BooleanCheckboxDropdown,
  }
}

function getAssignmentResponsesColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'responses',
    label: tText('admin/assignments/assignments___leerlingencollecties'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.BooleanCheckboxDropdown,
    filterProps: {
      includeEmpty: false,
    } as BooleanCheckboxDropdownProps,
    dataType: TableColumnDataType.boolean,
  }
}

function getAssignmentViewsColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'views',
    icon: IconName.eye,
    tooltip: tText('admin/assignments/assignments___views'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  }
}

function getAssignmentBookmarksColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'bookmarks',
    icon: IconName.bookmark,
    tooltip: tText('admin/assignments/assignments___bookmarks'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  }
}

function getAssignmentCopiesColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'copies',
    icon: IconName.copy,
    tooltip: tText('admin/assignments/assignments___kopies'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  }
}

function getAssignmentInBundleColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'in_bundle',
    icon: IconName.folder,
    tooltip: tText(
      'admin/assignments/assignments___aantal-keer-opgenomen-in-een-bundel',
    ),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  }
}

function getAssignmentContributorsColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'contributors',
    icon: IconName.share2,
    tooltip: tText('admin/assignments/assignments___gedeeld'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  }
}

function getAssignmentActionsColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: ACTIONS_TABLE_COLUMN_ID,
    tooltip: tText('admin/assignments/assignments___acties'),
    sortable: false,
    visibleByDefault: true,
  }
}

const getMarcomLastCommunicationChannelTypeColumn = (
  channelTypeOptions: CheckboxOption[],
): FilterableColumn<AssignmentTableColumns> => ({
  id: 'marcom_last_communication_channel_type',
  label: tText(
    'admin/assignments/assignments___laatste-communicatie-kanaal-type',
  ),
  filterType: TableFilterType.CheckboxDropdownModal,
  filterProps: {
    label: tText('admin/assignments/assignments___communicatietype'),
    options: channelTypeOptions,
  },
  sortable: true,
  visibleByDefault: true,
  dataType: TableColumnDataType.string,
})

const getMarcomLastCommunicationChannelNameColumn = (
  channelNameOptions: CheckboxOption[],
): FilterableColumn<AssignmentTableColumns> => ({
  id: 'marcom_last_communication_channel_name',
  label: tText(
    'admin/assignments/assignments___laatste-communicatie-kanaal-naam',
  ),
  sortable: true,
  visibleByDefault: true,
  filterType: TableFilterType.CheckboxDropdownModal,
  filterProps: {
    label: tText('admin/assignments/assignments___communicatiekanaal'),
    options: channelNameOptions,
  },
  dataType: TableColumnDataType.string,
})

const getMarcomLastCommunicationAtColumn =
  (): FilterableColumn<AssignmentTableColumns> => ({
    id: 'marcom_last_communication_at',
    label: tText('admin/assignments/assignments___laatste-communicatiedatum'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.dateTime,
  })

const getMarcomKlascementColumn =
  (): FilterableColumn<AssignmentTableColumns> => ({
    id: 'marcom_klascement',
    label: tText('admin/assignments/assignments___klas-cement'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.boolean,
  })

function getMarcomLastUpdatedByColumn(): FilterableColumn<AssignmentTableColumns> {
  return {
    id: 'last_updated_by_profile',
    label: tText('admin/assignments/assignments___laatste-bewerkt-door'),
    sortable: true,
    visibleByDefault: false,
    dataType: TableColumnDataType.string,
  }
}

const getAssignmentLabelsColumn = (
  collectionLabelOptions: CheckboxOption[],
): FilterableColumn<AssignmentTableColumns> => ({
  id: 'assignment_quality_labels',
  label: tText('admin/assignments/assignments___labels'),
  sortable: false,
  visibleByDefault: true,
  filterType: TableFilterType.CheckboxDropdownModal,
  filterProps: {
    options: collectionLabelOptions,
  } as CheckboxDropdownModalProps,
})

const getAssignmentOrganisationColumn = (
  organisationOptions: CheckboxOption[],
): FilterableColumn<AssignmentTableColumns> => ({
  id: 'organisation',
  label: tText('admin/assignments/assignments___organisatie'),
  sortable: false,
  visibleByDefault: false,
  filterType: TableFilterType.CheckboxDropdownModal,
  filterProps: {
    options: organisationOptions,
  } as CheckboxDropdownModalProps,
})

export function GET_ASSIGNMENT_OVERVIEW_TABLE_COLS(
  userGroupOptions: CheckboxOption[],
  assignmentLabelOptions: CheckboxOption[],
  subjects: Avo.Lom.LomField[],
  educationLevelsAndDegrees: Avo.Lom.LomField[],
): FilterableColumn<AssignmentTableColumns>[] {
  return [
    getAssignmentTitleColumn(),
    getAssignmentAuthorColumn(),
    getAssignmentAuthorUserGroupColumn(userGroupOptions),
    getAssignmentLastUserEditProfileColumn(),
    getAssignmentCreatedAtColumn(),
    getAssignmentUpdatedAtColumn(),
    getAssignmentDeadlineAtColumn(),
    getAssignmentStatusColumn(),
    getAssignmentSubjectsColumn(subjects),
    getAssignmentEducationLevelIdColumn(educationLevelsAndDegrees),
    getAssignmentEducationLevelsColumn(educationLevelsAndDegrees),
    getAssignmentEducationDegreesColumn(educationLevelsAndDegrees),
    getAssignmentIsPublicColumn(),
    getAssignmentQualityLabelsColumn(assignmentLabelOptions),
    getAssignmentIsCopyColumn(),
    getAssignmentResponsesColumn(),
    getAssignmentViewsColumn(),
    getAssignmentBookmarksColumn(),
    getAssignmentCopiesColumn(),
    getAssignmentInBundleColumn(),
    getAssignmentContributorsColumn(),
    getAssignmentActionsColumn(),
  ]
}

export const GET_ASSIGNMENT_MARCOM_COLUMNS = (
  userGroupOptions: CheckboxOption[],
  collectionLabelOptions: CheckboxOption[],
  channelNameOptions: CheckboxOption[],
  subjects: Avo.Lom.LomField[],
  educationLevelsAndDegrees: Avo.Lom.LomField[],
  organisations: CheckboxOption[],
  channelTypeOptions: CheckboxOption[],
): FilterableColumn<AssignmentTableColumns>[] => [
  getAssignmentTitleColumn(),
  getAssignmentAuthorColumn(),
  getAssignmentAuthorUserGroupColumn(userGroupOptions),
  getMarcomLastUpdatedByColumn(),
  getAssignmentCreatedAtColumn(),
  getAssignmentUpdatedAtColumn(),
  getMarcomLastCommunicationChannelTypeColumn(channelTypeOptions),
  getMarcomLastCommunicationChannelNameColumn(channelNameOptions),
  getMarcomLastCommunicationAtColumn(),
  getMarcomKlascementColumn(),
  getAssignmentIsPublicColumn(),
  getAssignmentLabelsColumn(collectionLabelOptions),
  getAssignmentSubjectsColumn(subjects),
  getAssignmentEducationLevelsColumn(
    educationLevelsAndDegrees.filter((item) => !item.broader),
  ),
  getAssignmentEducationDegreesColumn(
    educationLevelsAndDegrees.filter((item) => !!item.broader),
  ),
  getAssignmentOrganisationColumn(organisations),
  {
    id: ACTIONS_TABLE_COLUMN_ID,
    tooltip: tText('admin/assignments/assignments___acties'),
    visibleByDefault: true,
  },
]
