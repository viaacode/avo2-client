import { type Avo } from '@viaa/avo2-types';
import React, { type ReactNode, useMemo } from 'react';

import {
	BlockListSorter,
	type ListSorterItem,
	type ListSorterProps,
} from '../../shared/components';
import {
	BLOCK_ITEM_ICONS,
	BLOCK_ITEM_LABELS,
} from '../../shared/components/BlockList/BlockList.consts';
import {
	GET_ASSIGNMENT_GREY,
	GET_ASSIGNMENT_WHITE,
} from '../../shared/components/ColorSelect/ColorSelect.const';
import { switchAssignmentBlockPositions } from '../helpers/switch-positions';

const getColor = (block: Avo.Assignment.Block) => {
	const fallback = ['ZOEK', 'BOUW'].includes(block.type)
		? GET_ASSIGNMENT_GREY()
		: GET_ASSIGNMENT_WHITE();
	return block.color || fallback.value;
};

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
				color: getColor(block as Avo.Assignment.Block),
				onPositionChange: (item, delta) => {
					const switched = switchAssignmentBlockPositions(
						blocks,
						item as Avo.Core.BlockItemBase,
						delta
					);
					setBlocks(switched as Avo.Core.BlockItemBase[]);
				},
			};

			console.info({ mapped });

			return mapped;
		});
	}, [blocks, setBlocks, config]);

	const ui = useMemo(
		() => (
			<BlockListSorter
				{...config?.listSorter}
				heading={(item) =>
					item &&
					BLOCK_ITEM_LABELS(!!blocks[0].assignment_response_id)[
						item.type as Avo.Core.BlockItemType
					]
				}
				items={items}
			/>
		),
		[items, config]
	);

	return [ui, items];
}
