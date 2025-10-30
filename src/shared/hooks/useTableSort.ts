import { toggleSortOrder } from '@meemoo/admin-core-ui/admin';
import { type Avo } from '@viaa/avo2-types';
import { type Dispatch, type SetStateAction, useState } from 'react';

import { OrderDirection } from '../../search/search.const';

type UseTableSortTuple<T> = [
	T,
	Avo.Search.OrderDirection,
	(columnId: T) => { sortColumn: T; sortOrder: Avo.Search.OrderDirection },
	Dispatch<SetStateAction<T>>,
	Dispatch<SetStateAction<Avo.Search.OrderDirection>>,
];

export const useTableSort = <T>(
	initialSortColumn: T,
	initialSortOrder: Avo.Search.OrderDirection = OrderDirection.desc
): UseTableSortTuple<T> => {
	const [sortColumn, setSortColumn] = useState<T>(initialSortColumn);
	const [sortOrder, setSortOrder] = useState<Avo.Search.OrderDirection>(initialSortOrder);

	const handleTableSortClick = (
		columnId: T
	): { sortColumn: T; sortOrder: Avo.Search.OrderDirection } => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(toggleSortOrder(sortOrder));
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder(initialSortOrder);
		}
		return { sortColumn: columnId, sortOrder: toggleSortOrder(sortOrder) };
	};

	return [sortColumn, sortOrder, handleTableSortClick, setSortColumn, setSortOrder];
};
