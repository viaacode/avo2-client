import { remove } from 'lodash-es';

import { APP_PATH } from '../../../../constants';

import { PickerSelectItem } from '../../types';
import { parsePickerItem } from './parse-picker';

const APP_PATH_ARRAY = Object.values(APP_PATH);

const PATHS_TO_ADD = [
	'/mijn-werkruimte',
	'/mijn-werkruimte/collecties',
	'/mijn-werkruimte/bundels',
	'/mijn-werkruimte/opdrachten',
	'/mijn-werkruimte/bladwijzers',
	'/instellingen/profiel',
	'/instellingen/account',
	'/instellingen/email',
	'/instellingen/notificaties',
];
const PATHS_TO_REMOVE = ['/mijn-werkruimte/opdrachten/maak'];

// Return InternalLinkItems items from APP_PATH
export const fetchInternalLinks = async (
	keyword: string | null,
	limit: number
): Promise<PickerSelectItem[]> => {
	return keyword
		? parseInternalLinks(APP_PATH_ARRAY, limit).filter(obj => obj.value.value.includes(keyword))
		: parseInternalLinks(APP_PATH_ARRAY, limit);
};

export const parseInternalLinks = (allPaths: string[], limit: number) => {
	const paths = allPaths.slice(0, limit).filter((path: any) => !path.includes(':'));
	PATHS_TO_ADD.forEach(path => paths.push(path));
	PATHS_TO_REMOVE.forEach(path => remove(paths, path));

	const parsedInternalLinkItemsItems = paths.sort().map((path: string) => ({
		label: path,
		value: parsePickerItem('INTERNAL_LINK', path),
	}));

	return parsedInternalLinkItemsItems;
};
