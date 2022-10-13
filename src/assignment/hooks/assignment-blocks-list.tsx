import { Avo } from '@viaa/avo2-types';
import React, { ReactNode, useMemo } from 'react';

import { BlockListSorter, ListSorterItem, ListSorterProps } from '../../shared/components';
import {
	BLOCK_ITEM_ICONS,
	BLOCK_ITEM_LABELS,
} from '../../shared/components/BlockList/BlockList.consts';
import { switchAssignmentBlockPositions } from '../helpers/switch-positions';

export function useBlocksList(
	blocks: BaseBlockWithMeta[],
	setBlocks: (newBlocks: BaseBlockWithMeta[]) => void,
	config?: {
		listSorter?: Partial<ListSorterProps<BaseBlockWithMeta>>;
		listSorterItem?: Partial<ListSorterItem>;
	}
): [ReactNode, (BaseBlockWithMeta & ListSorterItem)[]] {
	const items = useMemo(() => {
		return (blocks || []).map((block) => {
			const mapped: BaseBlockWithMeta & ListSorterItem = {
				...block,
				...config?.listSorterItem,
				icon: BLOCK_ITEM_ICONS()[block.type](block),
				onPositionChange: (item, delta) => {
					const switched = switchAssignmentBlockPositions(
						blocks,
						item as BaseBlockWithMeta,
						delta
					);
					setBlocks(switched);
				},
			};

			return mapped;
		});
	}, [blocks, setBlocks, config]);

	const ui = useMemo(
		() => (
			<BlockListSorter
				{...config?.listSorter}
				heading={(item) => item && BLOCK_ITEM_LABELS()[item.type]}
				items={items}
			/>
		),
		[items, config]
	);

	return [ui, items];
}
