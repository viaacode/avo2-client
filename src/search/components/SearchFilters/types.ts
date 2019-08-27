import { Avo } from '@viaa/avo2-types';

import { SearchFilterFieldValues, SearchFilterMultiOptions } from '../../views/types';

export interface SearchFilterControlsProps {
	formState: Avo.Search.Filters;
	handleFilterFieldChange: (
		values: SearchFilterFieldValues,
		propertyName: Avo.Search.FilterProp
	) => void;
	multiOptions: SearchFilterMultiOptions;
}
