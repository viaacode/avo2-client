import { sortBy } from 'lodash-es';

import { Positioned } from '../../shared/types';
import { setPositionToIndex } from '../assignment.helper';

export function insertMultipleAtPosition<T>(
	list: Positioned<T>[],
	...items: Positioned<T>[]
): Positioned<T>[] {
	const sortedList = sortBy(list, (block) => block.position);

	sortedList.splice(items[0].position, 0, ...items);

	return setPositionToIndex(sortedList);
}
