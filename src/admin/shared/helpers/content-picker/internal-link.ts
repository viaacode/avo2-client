import { APP_PATH } from '../../../../constants';

import { PickerSelectItemGroup } from '../../types';
import { parsePickerItem } from './parse-picker';

const APP_PATH_ARRAY = Object.entries(APP_PATH);

// Return InternalLinkItems items from APP_PATH
export const fetchInternalLinks = async (limit: number): Promise<PickerSelectItemGroup> =>
	parseInternalLinks(APP_PATH_ARRAY, limit);

export const parseInternalLinks = (raw: any, limit: number) => {
	const filteredItems = raw.slice(0, limit).filter((item: any) => !item[1].includes(':'));

	const parsedInternalLinkItemsItems = filteredItems.map((item: any) => ({
		label: item[1],
		value: parsePickerItem('INTERNAL_LINK', item[1]),
	}));

	return {
		label: 'Interne links',
		options: parsedInternalLinkItemsItems,
	};
};
