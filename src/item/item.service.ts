import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { dataService } from '../shared/services/data-service';
import { GET_ITEMS, GET_ITEMS_BY_KEYWORD } from './item.gql';
const ITEM_RESULT_PATH = 'app_item_meta';

export const getItems = async (
	keyword: string | null,
	limit?: number
): Promise<Avo.Item.Item[] | null> => {
	try {
		const queryOptions = {
			query: keyword ? GET_ITEMS_BY_KEYWORD : GET_ITEMS,
			variables: keyword ? { limit, keyword: `%${keyword}%` } : { limit },
		};

		const response = await dataService.query(queryOptions);

		return get(response, `data.${ITEM_RESULT_PATH}`, null);
	} catch (err) {
		console.error('Failed to fetch items');
		return null;
	}
};
