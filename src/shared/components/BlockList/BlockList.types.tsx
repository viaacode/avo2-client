import { type Avo } from '@viaa/avo2-types';

import { type AssignmentBlockTypeSearchProps } from './blocks/AssignmentBlockTypeSearch';
import { type CollectionFragmentTypeItemProps } from './blocks/CollectionFragmentTypeItem';
import { type CollectionFragmentTypeTextProps } from './blocks/CollectionFragmentTypeText';

export interface BlockListProps {
	blocks: Avo.Core.BlockItemBase[];
	config?: {
		TEXT?: Partial<CollectionFragmentTypeTextProps>;
		ITEM?: Partial<CollectionFragmentTypeItemProps>;
		ZOEK?: Partial<AssignmentBlockTypeSearchProps>;
	};
}
