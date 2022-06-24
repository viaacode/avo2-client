import { Dispatch, SetStateAction, useState } from 'react';

import { Avo } from '@viaa/avo2-types';

type UseTableSortTuple<T> = [
	T,
	Avo.Search.OrderDirection,
	(columnId: T) => { sortColumn: T; sortOrder: Avo.Search.OrderDirection },
	Dispatch<SetStateAction<T>>,
	Dispatch<SetStateAction<Avo.Search.OrderDirection>>
];

export const useTableSort = <T>(
	initialSortColumn: T,
	initialSortOrder: Avo.Search.OrderDirection = 'desc'
): UseTableSortTuple<T> => {
	const [sortColumn, setSortColumn] = useState<T>(initialSortColumn);
	const [sortOrder, setSortOrder] = useState<Avo.Search.OrderDirection>(initialSortOrder);

	const handleTableSortClick = (
		columnId: T
	): { sortColumn: T; sortOrder: Avo.Search.OrderDirection } => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder(initialSortOrder);
		}
		return { sortColumn: columnId, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' };
	};

	return [sortColumn, sortOrder, handleTableSortClick, setSortColumn, setSortOrder];
};
