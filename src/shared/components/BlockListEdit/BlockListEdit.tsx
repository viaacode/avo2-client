import { Avo } from '@viaa/avo2-types';
import React, { FC, useMemo } from 'react';

import { switchAssignmentBlockPositions } from '../../../assignment/helpers/switch-positions';
import { BLOCK_ITEM_ICONS, BLOCK_ITEM_LABELS } from '../BlockList/BlockList.consts';
import { BlockListSorter, ListSorterItem, ListSorterProps } from '../ListSorter';

interface BlockListEditProps {
	blocks: Avo.Core.BlockItemBase[];
	setBlocks: (newBlocks: Avo.Core.BlockItemBase[]) => void;
	config?: {
		listSorter?: Partial<ListSorterProps<Avo.Core.BlockItemBase>>;
		listSorterItem?: Partial<ListSorterItem>;
	};
}

const BlockListEdit: FC<BlockListEditProps> = ({ blocks, setBlocks, config }) => {
	const items = useMemo(() => {
		return (blocks || []).map((block) => {
			const mapped: Avo.Core.BlockItemBase & ListSorterItem = {
				...block,
				...config?.listSorterItem,
				icon: BLOCK_ITEM_ICONS()[block.type](block),
				onPositionChange: (item, delta) => {
					const switched = switchAssignmentBlockPositions(blocks, item, delta);
					setBlocks(switched);
				},
			};

			return mapped;
		});
	}, [blocks, setBlocks, config]);

	return useMemo(
		() => (
			<BlockListSorter
				{...config?.listSorter}
				heading={(item) => item && BLOCK_ITEM_LABELS()[item.type]}
				items={items}
			/>
		),
		[items, config]
	);
};

export default BlockListEdit;
