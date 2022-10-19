import { sortBy } from 'lodash-es';

import { setPositionToIndex } from '../assignment.helper';

type Positioned = { id: string | number; position: number };

export function switchAssignmentBlockPositions(
	list: Positioned[],
	block: Positioned,
	delta: number
): Positioned[] {
	if (!block) {
		return list;
	}

	// Temp store the positions of the 2 blocks that need to be swapped
	const firstBlock = list.find((b) => b.position === block.position);
	const firstBlockPosition = block.position;
	const secondBlock = list.find((b) => b.position === firstBlockPosition + delta);
	const secondBlockPosition = firstBlockPosition + delta;

	if (!firstBlock || !secondBlock) {
		return list;
	}

	// Swap the 2 positions
	firstBlock.position = secondBlockPosition;
	secondBlock.position = firstBlockPosition;

	// Sort array by position
	const newList = sortBy(list, (block) => block.position);
	return setPositionToIndex(newList); // Recover from blocks with the same position set in the database
}
