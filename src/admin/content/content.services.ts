import { MutationFunction } from '@apollo/react-common';
import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { ApolloCacheManager, dataService } from '../../shared/services/data-service';
import { insertContentBlocks } from '../content-block/content-block.services';
import { ContentBlockConfig } from '../content-block/content-block.types';

import toastService from '../../shared/services/toast-service';
import { CONTENT_RESULT_PATH } from './content.const';
import { GET_CONTENT_BY_ID, GET_CONTENT_TYPES } from './content.gql';
import { ContentTypesResponse } from './content.types';

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
		toastService.danger('Er ging iets mis tijdens het ophalen van het content item', false);

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
		toastService.danger('Er ging iets mis tijdens het ophalen van de content types', false);

		return null;
	}
};

export const insertContent = async (
	contentItem: Partial<Avo.Content.Content>,
	cbConfigs: ContentBlockConfig[],
	triggerContentInsert: MutationFunction<Partial<Avo.Content.Content>>
): Promise<Partial<Avo.Content.Content> | null> => {
	try {
		const response = await triggerContentInsert({
			variables: { contentItem },
			update: ApolloCacheManager.clearContentCache,
		});
		const id: number | null = get(
			response,
			`data.${CONTENT_RESULT_PATH.INSERT}.returning[0].id`,
			null
		);

		if (id) {
			// Insert content-blocks
			if (cbConfigs && cbConfigs.length) {
				const contentBlocks = await insertContentBlocks(id, cbConfigs);

				if (!contentBlocks) {
					toastService.danger('Er ging iets mis tijdens het opslaan van de content blocks', false);
					// return null to prevent triggering success toast
					return null;
				}
			}

			return { ...contentItem, id } as Partial<Avo.Content.Content>;
		}

		return null;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const updateContent = async (
	contentItem: Partial<Avo.Content.Content>,
	cbConfigs: ContentBlockConfig[],
	triggerContentInsert: MutationFunction<Partial<Avo.Content.Content>>
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

		if (cbConfigs && cbConfigs.length) {
			// TODO: Add logic for:
			// - inserting content-blocks
			// - updating content-blocks
			// - deleting content-blocks
		}

		if (!insertedContent) {
			console.error('Content update returned empty response', response);
			return null;
		}

		return contentItem;
	} catch (err) {
		console.error(err);
		toastService.danger('Er ging iets mis tijdens het opslaan van de content blocks', false);

		return null;
	}
};
