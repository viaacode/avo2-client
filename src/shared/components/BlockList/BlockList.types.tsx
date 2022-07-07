import { Avo } from '@viaa/avo2-types';

import { CollectionFragmentTypeItemProps } from '../../../collection/components/CollectionFragmentTypeItem';
import { CollectionFragmentTypeTextProps } from '../../../collection/components/CollectionFragmentTypeText';

export interface BlockListProps {
	blocks: Avo.Core.BlockItemBase[];
	config?: {
		text?: Partial<CollectionFragmentTypeTextProps>;
		item?: Partial<CollectionFragmentTypeItemProps>;
	};
}
