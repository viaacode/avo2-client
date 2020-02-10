import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { dataService } from '../shared/services/data-service';
import { GET_ITEMS } from './item.gql';
const ITEM_RESULT_PATH = 'app_item_meta';

export const getItems = async (limit?: number): Promise<Avo.Item.Item[] | null> => {
	try {
		const queryOptions = {
			query: GET_ITEMS,
			variables: { limit },
		};

		const response = await dataService.query(queryOptions);

		return get(response, `data.${ITEM_RESULT_PATH}`, null);
	} catch (err) {
		console.error('Failed to fetch items');
		return null;
	}
};
