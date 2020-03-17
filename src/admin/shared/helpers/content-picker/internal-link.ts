import { compact, sortBy } from 'lodash-es';

import { APP_PATH } from '../../../../constants';

import { PickerSelectItem } from '../../types';
import { parsePickerItem } from './parse-picker';

// Return InternalLinkItems items from APP_PATH
export const retrieveInternalLinks = async (
	keyword: string | null,
	limit: number
): Promise<PickerSelectItem[]> => {
	return sortBy(
		compact(
			Object.keys(APP_PATH).map((pageId: string): PickerSelectItem | null => {
				if (
					APP_PATH[pageId].showInContentPicker &&
					(!keyword || APP_PATH[pageId].route.includes(keyword))
				) {
					return {
						label: APP_PATH[pageId].route,
						value: parsePickerItem('INTERNAL_LINK', APP_PATH[pageId].route),
					};
				}
				return null;
			})
		),
		'value'
	).slice(0, limit);
};
