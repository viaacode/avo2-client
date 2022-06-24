type Positioned = any & { id: string; position: number };

export const switchAssignmentBlockPositions = (
	list: Positioned[],
	item: Positioned,
	delta: number
) => {
	const block = item;

	if (!block) return list;

	const target = list.find((b) => b.position === block.position + delta);

	if (!target) return list;

	return [
		...list.filter((b) => b.id !== block.id && b.id !== target.id),
		{
			...block,
			position: target.position,
		},
		{
			...target,
			position: block.position,
		},
	];
};
