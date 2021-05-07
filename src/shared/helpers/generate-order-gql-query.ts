import { Avo } from '@viaa/avo2-types';

export const getSortOrder = (
	order: Avo.Search.OrderDirection,
	tableColumnDataType: string
): string => {
	switch (tableColumnDataType) {
		case 'string':
		case 'dateTime':
		case 'number':
			return order.replace('desc', 'desc_nulls_first').replace('asc', 'asc_nulls_last');
		case 'boolean':
			return order.replace('desc', 'desc_nulls_last').replace('asc', 'asc_nulls_last');
		default:
			return order;
	}
};

export const getOrderObject = (
	sortColumn: string,
	sortOrder: Avo.Search.OrderDirection,
	tableColumnDataType: string,
	columns: Partial<{
		[columnName: string]: (order: Avo.Search.OrderDirection) => any;
	}>
) => {
	const getOrderFunc: Function | undefined = columns[sortColumn];

	if (getOrderFunc) {
		return [getOrderFunc(getSortOrder(sortOrder, tableColumnDataType))];
	}

	return [{ [sortColumn]: getSortOrder(sortOrder, tableColumnDataType) }];
};
