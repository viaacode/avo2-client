import { type TableColumn } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';

import { type FilterState } from '../search/search.types.js';
import { type Lookup_Enum_Colors_Enum } from '../shared/generated/graphql-db-types.js';
import { type ACTIONS_TABLE_COLUMN_ID } from '../shared/helpers/table-column-list-to-csv-column-list.js';
import type { TableColumnDataType } from '../shared/types/table-column-data-type.js';

import { type AssignmentBlockItemDescriptionType } from './components/AssignmentBlockDescriptionButtons.js';

export type PupilCollectionFragment = Avo.Core.BlockItemBase & {
  fragment_id?: string | null;
  assignment_response_id: any;
};

type EditableBlockFields = {
  ownTitle?: string;
  ownDescription?: string;
  noTitle?: string;
  editMode?: AssignmentBlockItemDescriptionType;
};

export type EditablePupilCollectionFragment = PupilCollectionFragment &
  EditableBlockFields;

export type AssignmentTableColumns =
  | 'title'
  | 'author'
  | 'author_user_group'
  | 'last_user_edit_profile'
  | 'created_at'
  | 'updated_at'
  | 'deadline_at'
  | 'status'
  | 'subjects'
  | 'education_level_id'
  | 'education_levels'
  | 'education_degrees'
  | 'responses'
  | 'quality_labels'
  | 'class_room'
  | 'labels'
  | 'views'
  | 'bookmarks'
  | 'copies'
  | 'in_bundle'
  | 'is_copy'
  | 'contributors'
  | 'share_type'
  | 'is_public'
  | 'assignment_quality_labels'
  | 'organisation'
  | 'last_updated_by_profile'
  | 'marcom_last_communication_channel_type'
  | 'marcom_last_communication_channel_name'
  | 'marcom_last_communication_at'
  | 'marcom_klascement'
  | typeof ACTIONS_TABLE_COLUMN_ID;

export type AssignmentResponseTableColumns =
  | 'pupil'
  | 'collection_title'
  | 'pupil_collection_block_count'
  | 'updated_at'
  | typeof ACTIONS_TABLE_COLUMN_ID;

export interface AssignmentColumn extends TableColumn {
  id: AssignmentTableColumns;
  label: string;
  sortable?: boolean;
}

export interface AssignmentResponseColumn extends TableColumn {
  id: AssignmentResponseTableColumns;
  label: string;
  sortable?: boolean;
}

export enum AssignmentView {
  ACTIVE = 'assignments',
  FINISHED = 'finished_assignments',
}

export enum AssignmentLayout {
  PlayerAndText = 0,
  OnlyPlayer = 1,
}

export enum AssignmentRetrieveError {
  DELETED = 'DELETED',
  NOT_YET_AVAILABLE = 'NOT_YET_AVAILABLE',
}

export interface AssignmentLabelColor {
  label: string; // #FF0000
  value: Lookup_Enum_Colors_Enum; // BRIGHT_RED
}

/// Zoek & bouw

export type AssignmentResponseFormState = Pick<
  Avo.Assignment.Response,
  'collection_title' | 'id'
> & {
  pupil_collection_blocks: Omit<PupilCollectionFragment, 'item_meta'>[]; // avoid circular reference ts error
};

export interface PupilSearchFilterState extends FilterState {
  tab: string; // Which tab is active: assignment, search or my collection
  selectedSearchResultId?: string; // Search result of which the detail page should be shown
  focus?: string; // Search result that should be scrolled into view
}

export interface EditBlockProps {
  block: EditableAssignmentBlock;
  setBlock: (updatedBlock: EditableAssignmentBlock) => void;
  onFocus?: () => void;
}

export type EditableAssignmentBlock = Avo.Assignment.Block &
  Pick<Avo.Core.BlockItemBase, 'item_meta'> &
  EditableBlockFields;

export enum AssignmentAction {
  duplicate = 'duplicate',
  delete = 'delete',
  openPublishCollectionModal = 'openPublishAssignmentModal',
  toggleBookmark = 'toggleBookmark',
  edit = 'edit',
  share = 'share',
  publish = 'publish',
  addToBundle = 'addToBundle',
}

export interface FetchAssignmentsParams {
  pastDeadline: boolean | null;
  sortColumn: AssignmentTableColumns;
  sortOrder: Avo.Search.OrderDirection;
  tableColumnDataType: TableColumnDataType;
  offset: number;
  limit?: number | null;
  filterString?: string;
  labelIds?: string[];
  classIds?: string[];
  shareTypeIds?: string[];
}
