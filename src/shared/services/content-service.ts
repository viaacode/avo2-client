import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CONTENT_RESULT_PATH } from '../../admin/content/content.const';
import { GET_CONTENT_BY_ID, GET_CONTENT_TYPES } from '../../admin/content/content.gql';

import { dataService } from './data-service';

export const fetchContentItemById = async (id: number): Promise<Avo.Content.Content | null> => {
	try {
		const response = await dataService.query({ query: GET_CONTENT_BY_ID, variables: { id } });
		const contentItem: Avo.Content.Content | null = get(
			response,
			`data.${CONTENT_RESULT_PATH}[0]`,
			null
		);

		return contentItem;
	} catch (err) {
		console.error(`Failed to fetch menu item with id: ${id}`);
		return null;
	}
};

export const fecthContentTypes = async (): Promise<any> => {
	try {
		const response = await dataService.query({ query: GET_CONTENT_TYPES });
		console.log(response);
	} catch (err) {
		console.error('Failed to fetch content types');
		return null;
	}
};
