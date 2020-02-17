import { remove } from 'lodash-es';

import { APP_PATH } from '../../../../constants';

import { PickerSelectItemGroup } from '../../types';
import { parsePickerItem } from './parse-picker';

const APP_PATH_ARRAY = Object.values(APP_PATH);

// Return InternalLinkItems items from APP_PATH
export const fetchInternalLinks = async (limit: number): Promise<PickerSelectItemGroup> =>
	parseInternalLinks(APP_PATH_ARRAY, limit);

export const parseInternalLinks = (allPaths: string[], limit: number) => {
	const paths = allPaths.slice(0, limit).filter((path: any) => !path.includes(':'));
	remove(paths, '/mijn-werkruimte/opdrachten/maak');
	paths.push('/mijn-werkruimte');
	paths.push('/mijn-werkruimte/collecties');
	paths.push('/mijn-werkruimte/bundels');
	paths.push('/mijn-werkruimte/opdrachten');
	paths.push('/mijn-werkruimte/bladwijzers');
	paths.push('/instellingen/profiel');
	paths.push('/instellingen/account');
	paths.push('/instellingen/email');
	paths.push('/instellingen/notificaties');

	const parsedInternalLinkItemsItems = paths.sort().map((path: string) => ({
		label: path,
		value: parsePickerItem('INTERNAL_LINK', path),
	}));

	return {
		label: 'Interne links',
		options: parsedInternalLinkItemsItems,
	};
};
