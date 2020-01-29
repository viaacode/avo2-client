import { cloneDeep, isEmpty, isNil, isPlainObject, pick, pickBy } from 'lodash-es';

import { ContentFilterFormState, DateRangeKeys, RangeFilters } from '../content.types';

export const cleanFiltersObject = (obj: ContentFilterFormState): Partial<ContentFilterFormState> =>
	pickBy(obj, (value: any, key: keyof ContentFilterFormState) => {
		if (['contentType', 'query'].includes(key)) {
			return !isEmpty(value) && !isNil(value);
		}

		// Check for empty date ranges
		return isPlainObject(value) && (!!value.gte || !!value.lte);
	});

export const generateFilterObject = (filterForm: ContentFilterFormState) => {
	const query = filterForm.query.trim();

	if (!query) {
		return {};
	}

	return [
		{ title: { _ilike: `%${query}%` } },
		{ profile: { usersByuserId: { first_name: { _ilike: `%${query}%` } } } },
		{ profile: { usersByuserId: { last_name: { _ilike: `%${query}%` } } } },
	];
};

export const generateWhereObject = (filterForm: ContentFilterFormState) => {
	const cleanFilters = cleanFiltersObject(cloneDeep(filterForm));

	// Return when no where properties are given
	if (isEmpty(cleanFilters)) {
		return {};
	}

	const { contentType } = filterForm;
	const queryFilters = generateFilterObject(filterForm);
	const dateRangeKeys: DateRangeKeys[] = [
		'createdDate',
		'updatedDate',
		'publishDate',
		'depublishDate',
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
		...(contentType.length ? { content_type: { _in: contentType } } : null),
		...(dateRangeFilters.length ? { _and: dateRangeFilters } : null),
		...(queryFilters ? { _or: queryFilters } : null),
	};
};
