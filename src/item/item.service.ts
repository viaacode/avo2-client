import { Avo } from '@viaa/avo2-types';

import { performQuery } from '../shared/helpers';
import i18n from '../shared/translations/i18n';

import { GET_ITEMS, GET_ITEMS_BY_TITLE } from './item.gql';

const ITEM_RESULT_PATH = 'data.app_item_meta';

// TODO: Move to helper file and use in other queries.

export const getItems = async (limit?: number): Promise<Avo.Item.Item[] | null> => {
	const query = {
		query: GET_ITEMS,
		variables: { limit },
	};

	return performQuery(
		query,
		ITEM_RESULT_PATH,
		'Failed to retrieve items.',
		i18n.t('item/item___er-ging-iets-mis-tijdens-het-ophalen-van-de-items')
	);
};

export const getItemsByTitle = async (
	title: string,
	limit?: number
): Promise<Avo.Item.Item[] | null> => {
	const query = {
		query: GET_ITEMS_BY_TITLE,
		variables: { limit, title: `%${title}%` },
	};

	return performQuery(
		query,
		ITEM_RESULT_PATH,
		'Failed to retrieve items by title.',
		i18n.t('item/item___er-ging-iets-mis-tijdens-het-ophalen-van-de-items')
	);
};
