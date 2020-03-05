import { useState } from 'react';

export type SortOrder = 'asc' | 'desc';
type UseTableSortTuple<T> = [T, SortOrder, (columnId: T) => void];

export const useTableSort = <T>(
	initialSortColumn: T,
	initialSortOrder: SortOrder = 'desc'
): UseTableSortTuple<T> => {
	const [sortColumn, setSortColumn] = useState<T>(initialSortColumn);
	const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

	const handleTableSortClick = (columnId: T) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder(initialSortOrder);
		}
	};

	return [sortColumn, sortOrder, handleTableSortClick];
};
