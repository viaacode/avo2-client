import {
  AvoSearchOrderDirection,
  AvoSearchOrderDirectionGraphql,
} from '@viaa/avo2-types';
import { type TableColumnDataType } from '../types/table-column-data-type';

const DEFAULT_NULL_ORDER: Record<
  AvoSearchOrderDirection,
  AvoSearchOrderDirectionGraphql
> = {
  asc: 'asc_nulls_last',
  desc: 'desc_nulls_first',
};

// Reverse order so asc sorts [true false null], and desc sorts [null false true]
const BOOLEAN_ORDER: Record<
  AvoSearchOrderDirection,
  AvoSearchOrderDirectionGraphql
> = {
  asc: 'desc_nulls_last',
  desc: 'asc_nulls_first',
};

// temp_access edge case
const BOOLEAN_NULLS_LAST_ORDER: Record<
  AvoSearchOrderDirection,
  AvoSearchOrderDirectionGraphql
> = {
  asc: 'desc_nulls_last',
  desc: 'asc_nulls_last',
};

const getSortOrder = (
  order: AvoSearchOrderDirection,
  tableColumnDataType: string,
): string => {
  switch (tableColumnDataType) {
    case 'string':
    case 'number':
    case 'dateTime':
      return DEFAULT_NULL_ORDER[order];
    case 'boolean':
      return BOOLEAN_ORDER[order];
    case 'booleanNullsLast':
      return BOOLEAN_NULLS_LAST_ORDER[order];
    default:
      return order;
  }
};

export const getOrderObject = (
  sortColumn: string,
  sortOrder: AvoSearchOrderDirection,
  tableColumnDataType: TableColumnDataType,
  columns: Partial<{
    [columnName: string]: (order: AvoSearchOrderDirection) => any;
  }>,
): Record<string, any> => {
  const getOrderFunc: ((order: AvoSearchOrderDirection) => any) | undefined =
    columns[sortColumn];

  if (getOrderFunc) {
    return [
      getOrderFunc(
        getSortOrder(sortOrder, tableColumnDataType) as AvoSearchOrderDirection,
      ),
    ];
  }

  return [{ [sortColumn]: getSortOrder(sortOrder, tableColumnDataType) }];
};
