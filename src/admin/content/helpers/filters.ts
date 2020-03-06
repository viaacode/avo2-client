import { cloneDeep, isEmpty, isNil, isPlainObject, pick, pickBy } from 'lodash-es';

import { ContentTableState, DateRangeKeys, RangeFilters } from '../content.types';

export const cleanFiltersObject = (obj: Partial<ContentTableState>): Partial<ContentTableState> =>
	pickBy(obj, (value: any, key: keyof ContentTableState) => {
		if (['content_type', 'query'].includes(key)) {
			return !isEmpty(value) && !isNil(value);
		}

		// Check for empty date ranges
		return isPlainObject(value) && (!!value.gte || !!value.lte);
	});

export const generateFilterObject = (filterForm: Partial<ContentTableState>) => {
	const query = (filterForm.query || '').trim();

	if (!query) {
		return {};
	}

	return [
		{ title: { _ilike: `%${query}%` } },
		{ profile: { usersByuserId: { first_name: { _ilike: `%${query}%` } } } },
		{ profile: { usersByuserId: { last_name: { _ilike: `%${query}%` } } } },
	];
};

export const generateWhereObject = (filterForm: Partial<ContentTableState>) => {
	const cleanFilters = cleanFiltersObject(cloneDeep(filterForm));

	// Return when no where properties are given
	if (isEmpty(cleanFilters)) {
		return {};
	}

	const { content_type } = filterForm;
	const queryFilters = generateFilterObject(filterForm);
	const dateRangeKeys: DateRangeKeys[] = [
		'created_at',
		'updated_at',
		'publish_at',
		'depublish_at',
	];
	const dateRanges = pick(cleanFilters, dateRangeKeys);

	const dateRangeFilters = !isEmpty(dateRanges)
		? Object.keys(dateRanges).reduce((acc: RangeFilters[], curr) => {
				const filterKey = curr.replace('Date', '_at');
				const rangeValue = dateRanges[curr as DateRangeKeys];
				const rangeFilter = {
					[filterKey]: {
						...(rangeValue && rangeValue.gte ? { _gte: rangeValue.gte } : null),
						...(rangeValue && rangeValue.lte ? { _lte: rangeValue.lte } : null),
					},
				};

				return [...acc, rangeFilter];
		  }, [])
		: [];

	return {
		...((content_type || []).length ? { content_type: { _in: content_type } } : null),
		...(dateRangeFilters.length ? { _and: dateRangeFilters } : null),
		...(queryFilters ? { _or: queryFilters } : null),
	};
};
