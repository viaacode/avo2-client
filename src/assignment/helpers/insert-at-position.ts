import { sortBy } from 'lodash-es';

import { type Positioned } from '../../shared/types';
import { setBlockPositionToIndex } from '../assignment.helper';

export function insertMultipleAtPosition(list: Positioned[], ...items: Positioned[]): Positioned[] {
	const sortedList = sortBy(list, (block) => block.position);

	sortedList.splice(items[0].position, 0, ...items);

	return setBlockPositionToIndex(sortedList);
}
