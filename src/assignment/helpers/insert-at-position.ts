import { sortByPositionAsc } from '../../shared/helpers';
import { Positioned } from '../../shared/types';
import { setPositionToIndex } from '../assignment.helper';

export function insertAtPosition<T>(list: Positioned<T>[], item: Positioned<T>) {
	// Pass in the position of the preceding item
	const before = list.find((x) => x.position === item.position);

	// Determine target position
	const target = before ? before.position + 1 : 0;

	// Increment all the following and the matching items
	const after = list
		.filter((x) => x.position >= target)
		.map((x) => ({
			...x,
			position: x.position + 1,
		}));

	return [
		// Do not touch preceding items
		...list.filter((x) => x.position < target),
		// Insert the new item at the position
		{
			...item,
			position: target,
		},
		// Add in the following
		...after,
	];
}

// Unused; relies on too many assumptions and causes irregular behaviour when adding/saving
export function spliceByPosition<T>(list: Positioned<T>[], item: Positioned<T>): Positioned<T>[] {
	const sorted = [...list.sort(sortByPositionAsc)];

	sorted.splice(item.position, 0, item);

	return sorted.map(setPositionToIndex);
}
