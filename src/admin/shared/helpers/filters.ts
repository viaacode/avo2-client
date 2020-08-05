import { compact, isArray, set } from 'lodash-es';

export function getQueryFilter(
	query: string | undefined,
	getQueryFilterObj: (query: string, queryWord: string, queryWordWildcard: string) => any[]
) {
	if (query) {
		return query.split(' ').map(queryWord => {
			return {
				_or: getQueryFilterObj(`%${queryWord}%`, queryWord, query),
			};
		});
	}
	return [];
}

export function getDateRangeFilters(filters: any, props: string[], nestedProps?: string[]): any[] {
	return setNestedValues(filters, props, nestedProps || props, (value: any) => {
		return {
			...(value && value.gte ? { _gte: value.gte } : null),
			...(value && value.lte ? { _lte: value.lte } : null),
		};
	});
}

export function getBooleanFilters(filters: any, props: string[], nestedProps?: string[]): any[] {
	return setNestedValues(filters, props, nestedProps || props, (value: any) => {
		return { _eq: value ? 'true' : 'false' };
	});
}

export function getMultiOptionFilters(
	filters: any,
	props: string[],
	nestedProps?: string[]
): any[] {
	return setNestedValues(filters, props, nestedProps || props, (value: any) => {
		return { _in: value };
	});
}

function setNestedValues(
	filters: any,
	props: string[],
	nestedProps: string[],
	getValue: (value: any) => any
) {
	return compact(
		props.map((prop: string, index: number) => {
			const value = (filters as any)[prop];
			if (value && (!isArray(value) || value.length)) {
				const response = {};
				return set(response, nestedProps ? nestedProps[index] : prop, getValue(value));
			}
			return null;
		})
	);
}
