import { BaseBlockWithMeta } from '../../../assignment/assignment.types';

import { AssignmentBlockTypeSearchProps } from './blocks/AssignmentBlockTypeSearch';
import { CollectionFragmentTypeItemProps } from './blocks/CollectionFragmentTypeItem';
import { CollectionFragmentTypeTextProps } from './blocks/CollectionFragmentTypeText';

export interface BlockListProps {
	blocks: BaseBlockWithMeta[];
	config?: {
		TEXT?: Partial<CollectionFragmentTypeTextProps>;
		ITEM?: Partial<CollectionFragmentTypeItemProps>;
		ZOEK?: Partial<AssignmentBlockTypeSearchProps>;
	};
}
