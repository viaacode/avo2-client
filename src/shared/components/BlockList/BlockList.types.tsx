import { Avo } from '@viaa/avo2-types';

export interface BlockListProps {
	blocks: Avo.Core.BlockItemBase[];
	canPlay: boolean;
	enableContentLinks: boolean;
}
