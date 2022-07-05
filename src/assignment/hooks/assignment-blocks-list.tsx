import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
	AssignmentBlockListSorter,
	ListSorterItem,
	ListSorterProps,
} from '../../shared/components';
import {
	ASSIGNMENT_CREATE_UPDATE_BLOCK_ICONS,
	ASSIGNMENT_CREATE_UPDATE_BLOCK_LABELS,
} from '../assignment.const';
import { switchAssignmentBlockPositions } from '../helpers/switch-positions';

export function useAssignmentBlocksList(
	blocks: AssignmentBlock[],
	setBlocks: (newBlocks: AssignmentBlock[]) => void,
	config?: {
		listSorter?: Partial<ListSorterProps<AssignmentBlock>>;
		listSorterItem?: Partial<ListSorterItem>;
	}
) {
	const [t] = useTranslation();

	const items = useMemo(() => {
		return blocks.map((block) => {
			const mapped: AssignmentBlock & ListSorterItem = {
				...block,
				...config?.listSorterItem,
				icon: ASSIGNMENT_CREATE_UPDATE_BLOCK_ICONS()[block.type],
				onPositionChange: (item, delta) => {
					const switched = switchAssignmentBlockPositions(blocks, item, delta);

					console.info('event', switched);

					setBlocks(switched);
				},
			};

			return mapped;
		});
	}, [blocks, setBlocks, config]);

	const ui = useMemo(
		() => (
			<AssignmentBlockListSorter
				{...config?.listSorter}
				heading={(item) => item && ASSIGNMENT_CREATE_UPDATE_BLOCK_LABELS(t)[item.type]}
				items={items}
			/>
		),
		[items, config]
	);

	return [ui, items];
}
