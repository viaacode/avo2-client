type Positioned = any & { id: string; position: number };

export const insertAssignmentBlockAtPosition = (
	list: Positioned[],
	item: Positioned,
	pos: number
) => {
	// Pass in the position of the preceding item
	const before = list.find((x) => x.position === pos);

	// Determine target position
	const target = before.position + 1;

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
};
