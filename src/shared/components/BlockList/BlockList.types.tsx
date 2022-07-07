import { AssignmentBlockType } from '@viaa/avo2-types/types/assignment';
import { CollectionFragmentType, CollectionSchema } from '@viaa/avo2-types/types/collection';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import { CollectionFragmentTypeItemProps } from '../../../collection/components/CollectionFragmentTypeItem';
import { CollectionFragmentTypeTextProps } from '../../../collection/components/CollectionFragmentTypeText';

export type BlockItemType = CollectionFragmentType | AssignmentBlockType;

// TODO move to typings repo + extend CollectionFragment and AssignmentBlock from this interface
export interface BlockItemBase {
	id: string | number; // Prefer string: uuid
	created_at: string;
	use_custom_fields: boolean;
	custom_description: string | null;
	custom_title: string | null;
	start_oc: number | null;
	end_oc: number | null;
	position: number;
	updated_at: string;
	thumbnail_path: string | null;
	type: BlockItemType;

	// This property won't be selectable from the database but has to be manually filled using the CollectionService.getCollectionWithItems or Assignment.getAssignmentWithContent
	item_meta?: ItemSchema | CollectionSchema;
}

// TODO: move subcomponents to shared to avoid bleed
export interface BlockListProps {
	blocks: BlockItemBase[];
	config?: {
		text?: Partial<CollectionFragmentTypeTextProps>;
		item?: Partial<CollectionFragmentTypeItemProps>;
	};
}
