import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CONTENT_RESULT_PATH } from '../../admin/content/content.const';
import { GET_CONTENT_BY_ID, GET_CONTENT_TYPES } from '../../admin/content/content.gql';
import { ContentTypesResponse } from '../../admin/content/content.types';

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

const CONTEN_TYPES_LOOKUP_PATH = 'lookup_enum_content_types';

export const fecthContentTypes = async (): Promise<ContentTypesResponse[] | null> => {
	try {
		const response = await dataService.query({ query: GET_CONTENT_TYPES });
		const contentTypes: ContentTypesResponse[] | null = get(
			response,
			`data.${CONTEN_TYPES_LOOKUP_PATH}`,
			null
		);

		return contentTypes;
	} catch (err) {
		console.error('Failed to fetch content types');
		return null;
	}
};
