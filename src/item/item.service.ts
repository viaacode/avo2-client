import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError, performQuery } from '../shared/helpers';

import { GET_ITEMS, GET_ITEMS_BY_TITLE_OR_EXTERNAL_ID } from './item.gql';

export const getItems = async (limit?: number): Promise<Avo.Item.Item[] | null> => {
	const query = {
		query: GET_ITEMS,
		variables: { limit },
	};

	return performQuery(query, 'data.app_item_meta', 'Failed to retrieve items.');
};

export const getItemsByTitleOrExternalId = async (
	titleOrExternalId: string,
	limit?: number
): Promise<Avo.Item.Item[]> => {
	try {
		const query = {
			query: GET_ITEMS_BY_TITLE_OR_EXTERNAL_ID,
			variables: { limit, title: `%${titleOrExternalId}%`, externalId: titleOrExternalId },
		};

		const response = await performQuery(
			query,
			'data',
			'Failed to retrieve items by title or external id.'
		);

		let items = get(response, 'itemsByExternalId', []);
		if (items.length === 0) {
			items = get(response, 'itemsByTitle', []);
		}
		return items;
	} catch (err) {
		throw new CustomError('Failed to fetch items by title or external id', err, {
			titleOrExternalId,
			limit,
		});
	}
};
