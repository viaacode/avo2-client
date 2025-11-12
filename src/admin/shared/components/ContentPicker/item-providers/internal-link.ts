import {compact, sortBy} from 'es-toolkit';

import {APP_PATH, type RouteId} from '../../../../../constants.js';
import {type PickerItem} from '../../../types/content-picker.js';
import {parsePickerItem} from '../helpers/parse-picker.js';
import {Avo} from "@viaa/avo2-types";

// Return InternalLinkItems items from APP_PATH
export const retrieveInternalLinks = async (
	keyword: string | null,
	limit: number
): Promise<PickerItem[]> => {
	const routeOptions: (PickerItem | null)[] = (Object.keys(APP_PATH) as RouteId[]).map(
		(pageId: RouteId): PickerItem | null => {
			if (
				APP_PATH[pageId].showInContentPicker &&
				(!keyword || APP_PATH[pageId].route.includes(keyword))
			) {
				return {
					...parsePickerItem(Avo.Core.ContentPickerType.INTERNAL_LINK, APP_PATH[pageId].route),
					label: APP_PATH[pageId].route,
				};
			}
			return null;
		}
	);
	return sortBy(compact(routeOptions), ['value']).slice(0, limit);
};
