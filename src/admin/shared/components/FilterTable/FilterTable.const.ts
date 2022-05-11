import { compact, fromPairs } from 'lodash';
import { NumberParam, QueryParamConfig, StringParam } from 'use-query-params';

import { CheckboxListParam, DateRangeParam } from '../../helpers/query-string-converters';

import { FilterableColumn } from './FilterTable';
import { cleanupObject } from './FilterTable.utils';

const FILTER_TYPE_TO_QUERY_PARAM_CONVERTER = {
	CheckboxDropdownModal: CheckboxListParam,
	DateRangeDropdown: DateRangeParam,
	BooleanCheckboxDropdown: CheckboxListParam,
	OkNokEmptyCheckboxDropdown: CheckboxListParam,
	MultiUserSelectDropdown: CheckboxListParam,
	MultiEducationalOrganisationSelectModal: CheckboxListParam,
};

// Build an object containing the filterable columns, so they can be converted to and from the query params
export const FILTER_TABLE_QUERY_PARAM_CONFIG = (columns: FilterableColumn[]) => ({
	page: NumberParam,
	...cleanupObject(
		fromPairs(
			compact(
				columns.map((col): [string, QueryParamConfig<any>] | null => {
					if (col.filterType && FILTER_TYPE_TO_QUERY_PARAM_CONVERTER[col.filterType]) {
						return [col.id, FILTER_TYPE_TO_QUERY_PARAM_CONVERTER[col.filterType]];
					}
					return null;
				})
			)
		)
	),
	query: StringParam,
	sort_column: StringParam,
	sort_order: StringParam,
	columns: CheckboxListParam,
});
