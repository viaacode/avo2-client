import { TableColumn } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';

import { FilterState } from '../search/search.types';
import { Lookup_Enum_Colors_Enum } from '../shared/generated/graphql-db-types';

import { AssignmentBlockItemDescriptionType } from './components/AssignmentBlockDescriptionButtons';

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

export type EditablePupilCollectionFragment = PupilCollectionFragment & EditableBlockFields;

export type AssignmentOverviewTableColumns =
	| 'title'
	| 'author'
	| 'created_at'
	| 'updated_at'
	| 'deadline_at'
	| 'status'
	| 'responses'
	| 'labels'
	| 'class_room'
	| 'views'
	| 'actions'
	| 'share_type'
	| 'is_public';

export type AssignmentResponseTableColumns =
	| 'pupil'
	| 'collection_title'
	| 'pupil_collection_block_count'
	| 'updated_at'
	| 'actions';

export interface AssignmentColumn extends TableColumn {
	id: AssignmentOverviewTableColumns;
	label: string;
	sortable?: boolean;
}

export interface AssignmentResponseColumn extends TableColumn {
	id: AssignmentResponseTableColumns;
	label: string;
	sortable?: boolean;
}

export enum AssignmentType {
	ZOEK = 'ZOEK',
	KIJK = 'KIJK',
	BOUW = 'BOUW',
}

export enum AssignmentBlockType {
	TEXT = 'TEXT',
	ITEM = 'ITEM',
	ZOEK = 'ZOEK',
	BOUW = 'BOUW',
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
}
