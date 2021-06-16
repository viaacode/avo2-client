import { Avo } from '@viaa/avo2-types';

const DATETIME_ORDER: Record<Avo.Search.OrderDirection, string> = {
	asc: 'desc_nulls_last',
	desc: 'asc_nulls_first',
};

const NUMBER_STRING_ORDER: Record<Avo.Search.OrderDirection, string> = {
	asc: 'asc_nulls_last',
	desc: 'desc_nulls_first',
};

const BOOLEAN_ORDER: Record<Avo.Search.OrderDirection, string> = {
	asc: 'desc_nulls_last',
	desc: 'asc_nulls_last',
};

export const getSortOrder = (
	order: Avo.Search.OrderDirection,
	tableColumnDataType: string
): string => {
	switch (tableColumnDataType) {
		case 'string':
		case 'number':
			return NUMBER_STRING_ORDER[order];
		case 'dateTime':
			return DATETIME_ORDER[order];
		case 'boolean':
			return BOOLEAN_ORDER[order];
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
