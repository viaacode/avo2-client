import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

export const getFragmentProperty = (
	itemMetaData: Avo.Item.Item,
	fragment: Avo.Collection.Fragment,
	useCustomFields: Boolean,
	prop: 'title' | 'description'
) => {
	return useCustomFields || !itemMetaData
		? get(fragment, `custom_${prop}`, '')
		: get(itemMetaData, prop, '');
};
