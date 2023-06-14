import type { Avo } from '@viaa/avo2-types';
import React, { ReactNode, useMemo } from 'react';

import { BlockListSorter, ListSorterItem, ListSorterProps } from '../../shared/components';
import {
	BLOCK_ITEM_ICONS,
	BLOCK_ITEM_LABELS,
} from '../../shared/components/BlockList/BlockList.consts';
import { switchAssignmentBlockPositions } from '../helpers/switch-positions';

export function useBlocksList(
	blocks: Avo.Core.BlockItemBase[],
	setBlocks: (newBlocks: Avo.Core.BlockItemBase[]) => void,
	config?: {
		listSorter?: Partial<ListSorterProps<Avo.Core.BlockItemBase>>;
		listSorterItem?: Partial<ListSorterItem>;
	}
): [ReactNode, (Avo.Core.BlockItemBase & ListSorterItem)[]] {
	const items = useMemo(() => {
		return (blocks || []).map((block) => {
			const mapped: Avo.Core.BlockItemBase & ListSorterItem = {
				...block,
				...config?.listSorterItem,
				icon: BLOCK_ITEM_ICONS()[block.type as Avo.Core.BlockItemType](block),
				onPositionChange: (item, delta) => {
					const switched = switchAssignmentBlockPositions(
						blocks,
						item as Avo.Core.BlockItemBase,
						delta
					);
					setBlocks(switched as Avo.Core.BlockItemBase[]);
				},
			};

			return mapped;
		});
	}, [blocks, setBlocks, config]);

	const ui = useMemo(
		() => (
			<BlockListSorter
				{...config?.listSorter}
				heading={(item) => item && BLOCK_ITEM_LABELS()[item.type as Avo.Core.BlockItemType]}
				items={items}
			/>
		),
		[items, config]
	);

	return [ui, items];
}
