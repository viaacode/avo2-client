import { sortBy } from 'lodash-es';

type Positioned = any & { id: string | number; position: number };

export const switchAssignmentBlockPositions = (
	list: Positioned[],
	item: Positioned,
	delta: number
): Positioned[] => {
	const block = item;

	if (!block) return list;

	const sorted = sortBy(list, (block) => block.position);
	const target = sorted[sorted.findIndex((b) => b.position === block.position) + delta];

	if (target === undefined) return list;

	return sortBy(
		[
			...list.filter((b) => b.id !== block.id && b.id !== target.id),
			{
				...block,
				position: target.position,
			},
			{
				...target,
				position: block.position,
			},
		],
		(block) => block.position
	);
};
