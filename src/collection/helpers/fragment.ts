import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

export const isMediaFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

export const getFragmentProperty = (
	itemMetaData: Avo.Item.Item | Avo.Collection.Collection | undefined,
	fragment: Avo.Collection.Fragment,
	useCustomFields: Boolean,
	prop: 'title' | 'description'
) => {
	return useCustomFields || !itemMetaData
		? get(fragment, `custom_${prop}`, '')
		: get(itemMetaData, prop, '');
};
