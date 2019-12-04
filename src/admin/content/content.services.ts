import { MutationFunction } from '@apollo/react-common';
import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CONTENT_RESULT_PATH } from './content.const';
import { GET_CONTENT_BY_ID, GET_CONTENT_TYPES } from './content.gql';
import { ContentTypesResponse } from './content.types';

import { ApolloCacheManager, dataService } from '../../shared/services/data-service';

export const fetchContentItemById = async (id: number): Promise<Avo.Content.Content | null> => {
	try {
		const response = await dataService.query({ query: GET_CONTENT_BY_ID, variables: { id } });
		const contentItem: Avo.Content.Content | null = get(
			response,
			`data.${CONTENT_RESULT_PATH.GET}[0]`,
			null
		);

		return contentItem;
	} catch (err) {
		console.error(`Failed to fetch menu item with id: ${id}`);
		return null;
	}
};

const CONTENT_TYPES_LOOKUP_PATH = 'lookup_enum_content_types';

export const fecthContentTypes = async (): Promise<ContentTypesResponse[] | null> => {
	try {
		const response = await dataService.query({ query: GET_CONTENT_TYPES });
		const contentTypes: ContentTypesResponse[] | null = get(
			response,
			`data.${CONTENT_TYPES_LOOKUP_PATH}`,
			null
		);

		return contentTypes;
	} catch (err) {
		console.error('Failed to fetch content types');
		return null;
	}
};

export const insertContent = async (
	triggerContentInsert: MutationFunction<Partial<Avo.Content.Content>>,
	contentItem: Partial<Avo.Content.Content>
): Promise<Partial<Avo.Content.Content> | null> => {
	try {
		const response = await triggerContentInsert({
			variables: { contentItem },
			update: ApolloCacheManager.clearContentCache,
		});
		const id = get(response, `data.${CONTENT_RESULT_PATH.INSERT}.returning[0].id`, null);

		return id ? ({ ...contentItem, id } as Partial<Avo.Content.Content>) : null;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const updateContent = async (
	triggerContentInsert: MutationFunction<Partial<Avo.Content.Content>>,
	contentItem: Partial<Avo.Content.Content>
): Promise<Partial<Avo.Content.Content> | null> => {
	try {
		const response = await triggerContentInsert({
			variables: {
				contentItem,
				id: contentItem.id,
			},
			update: ApolloCacheManager.clearContentCache,
		});
		const insertedContent = get(response, 'data', null);

		if (!insertedContent) {
			console.error('Content update returned empty response', response);
			return null;
		}

		return contentItem;
	} catch (err) {
		console.error(err);
		return null;
	}
};
