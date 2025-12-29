import { toggleSortOrder } from '@meemoo/admin-core-ui/admin';
import { AvoSearchOrderDirection } from '@viaa/avo2-types';
import { type Dispatch, type SetStateAction, useState } from 'react';

type UseTableSortTuple<T> = [
  T,
  AvoSearchOrderDirection,
  (columnId: T) => { sortColumn: T; sortOrder: AvoSearchOrderDirection },
  Dispatch<SetStateAction<T>>,
  Dispatch<SetStateAction<AvoSearchOrderDirection>>,
];

export const useTableSort = <T>(
  initialSortColumn: T,
  initialSortOrder: AvoSearchOrderDirection = AvoSearchOrderDirection.DESC,
): UseTableSortTuple<T> => {
  const [sortColumn, setSortColumn] = useState<T>(initialSortColumn);
  const [sortOrder, setSortOrder] =
    useState<AvoSearchOrderDirection>(initialSortOrder);

  const handleTableSortClick = (
    columnId: T,
  ): { sortColumn: T; sortOrder: AvoSearchOrderDirection } => {
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

  return [
    sortColumn,
    sortOrder,
    handleTableSortClick,
    setSortColumn,
    setSortOrder,
  ];
};
