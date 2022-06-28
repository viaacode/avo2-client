type Positioned<T> = T & { id: string; position: number };

const sortByPositionAsc = (a: Positioned<unknown>, b: Positioned<unknown>) =>
	a.position - b.position;

export function spliceByPosition<T>(list: Positioned<T>[], item: Positioned<T>): Positioned<T>[] {
	const sorted = [...list.sort(sortByPositionAsc)];

	sorted.splice(item.position, 0, item);

	return sorted
		.map((item, i) => ({
			...item,
			position: i,
		}))
		.sort(sortByPositionAsc);
}
