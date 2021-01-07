import { compact, isArray, isNil, set, without } from 'lodash-es';

export const NULL_FILTER = 'null';

export function getQueryFilter(
	query: string | undefined,
	getQueryFilterObj: (queryWildcard: string, query: string) => any[]
) {
	if (query) {
		return [
			{
				_or: getQueryFilterObj(`%${query}%`, query),
			},
		];
	}
	return [];
}

export function getDateRangeFilters(filters: any, props: string[], nestedProps?: string[]): any[] {
	return setNestedValues(filters, props, nestedProps || props, (prop: string, value: any) => {
		return {
			[prop]: {
				...(value && value.gte ? { _gte: value.gte } : null),
				...(value && value.lte ? { _lte: value.lte } : null),
			},
		};
	});
}

export function getBooleanFilters(filters: any, props: string[], nestedProps?: string[]): any[] {
	return setNestedValues(filters, props, nestedProps || props, (prop: string, value: any) => {
		return { [prop]: { _eq: value ? 'true' : 'false' } };
	});
}

/**
 * Used for fields where the user can select multiple values, but the object can only set one value
 * Example: userGroup
 * @param filters
 * @param props
 * @param nestedProps
 */
export function getMultiOptionFilters(
	filters: any,
	props: string[],
	nestedProps?: string[]
): any[] {
	return setNestedValues(filters, props, nestedProps || props, (prop: string, value: any) => {
		if (isArray(value) && value.includes(NULL_FILTER)) {
			return {
				_or: [
					{ [prop]: { _is_null: true } }, // Empty value
					{ [prop]: { _in: without(value, NULL_FILTER) } }, // selected values
				],
			};
		}
		return { [prop]: { _in: value } };
	});
}

/**
 * Used for generating a filter when the user can select multiple values and the field can also contain multiple values
 * Example: Subjects
 * @param filters
 * @param props
 * @param nestedReferenceTables
 * @param labelPaths
 */
export function getMultiOptionsFilters(
	filters: any,
	props: string[],
	nestedReferenceTables: string[],
	labelPaths: string[]
): any[] {
	return compact(
		props.map((prop: string, index: number) => {
			const filterValues = (filters as any)[prop];
			const nestedPathParts = nestedReferenceTables[index].split('.');
			const referenceTable = nestedPathParts.pop();
			const nestedPath = nestedPathParts.join('.');
			const labelPath = labelPaths[index];

			if (
				isNil(filterValues) ||
				!isArray(filterValues) ||
				!filterValues.length ||
				!referenceTable
			) {
				return null;
			}

			// Generate filter object
			let filterObject: any;

			if (filterValues.includes(NULL_FILTER) && filterValues.length === 1) {
				// only empty filter
				filterObject = {
					_not: {
						[referenceTable]: {}, // empty value => no reference table entries exist
					},
				};
			} else if (filterValues.includes(NULL_FILTER)) {
				// empty filter with other values
				filterObject = {
					_or: [
						{
							_not: {
								[referenceTable]: {}, // empty value => no reference table entries exist
							},
						},
						{
							[referenceTable]: {
								[labelPath]: { _in: without(filterValues, NULL_FILTER) },
							}, // selected values => referenceTable.prop in selected values array
						},
					],
				};
			} else {
				// only selected values with empty filter
				filterObject = {
					[referenceTable]: {
						[labelPath]: { _in: without(filterValues, NULL_FILTER) },
					}, // selected values => referenceTable.prop in selected values array
				};
			}

			// Set filter query on main query object
			if (nestedPath) {
				const response = {};
				set(response, nestedPath, filterObject);
				return response;
			}
			return filterObject;
		})
	);
}

/**
 * Takes a filter object and a list of properties and outputs a valid graphql query object
 * @param filters object containing the filter props and values set by the ui
 * @param props which props should be added to the graphql query
 * @param nestedProps wich props should be added to the graphql query in a nested fashion (matched to props by index in the array)
 * @param getValue function that returns the last part of the graphql query
 */
function setNestedValues(
	filters: any,
	props: string[],
	nestedProps: string[],
	getValue: (prop: string, value: any) => any
) {
	return compact(
		props.map((prop: string, index: number) => {
			const value = (filters as any)[prop];
			if (!isNil(value) && (!isArray(value) || value.length)) {
				const nestedProp = nestedProps ? nestedProps[index] : prop;

				const lastProp = nestedProp.split('.').pop() as string;
				const path = nestedProp.substring(0, nestedProp.length - lastProp.length - 1);

				if (path) {
					const response = {};
					set(response, path, getValue(lastProp, value));
					return response;
				}
				return getValue(lastProp, value);
			}
			return null;
		})
	);
}
