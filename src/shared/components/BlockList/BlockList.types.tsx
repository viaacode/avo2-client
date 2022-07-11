import { Avo } from '@viaa/avo2-types';

import { AssignmentBlockTypeSearchProps } from './blocks/AssignmentBlockTypeSearch';
import { CollectionFragmentTypeItemProps } from './blocks/CollectionFragmentTypeItem';
import { CollectionFragmentTypeTextProps } from './blocks/CollectionFragmentTypeText';

export interface BlockListProps {
	blocks: Avo.Core.BlockItemBase[];
	config?: {
		TEXT?: Partial<CollectionFragmentTypeTextProps>;
		ITEM?: Partial<CollectionFragmentTypeItemProps>;
		ZOEK?: Partial<AssignmentBlockTypeSearchProps>;
	};
}
