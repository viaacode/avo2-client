import { FetchResult } from 'apollo-link';
import { get, has, without } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { ApolloCacheManager, dataService } from '../../../shared/services/data-service';
import toastService from '../../../shared/services/toast-service';
import i18n from '../../../shared/translations/i18n';

import { CONTENT_BLOCKS_RESULT_PATH } from '../content-block.const';
import {
	DELETE_CONTENT_BLOCK,
	GET_CONTENT_BLOCKS_BY_CONTENT_ID,
	INSERT_CONTENT_BLOCKS,
	UPDATE_CONTENT_BLOCK,
} from '../content-block.gql';
import { ContentBlockConfig } from '../content-block.types';
import { parseContentBlockConfig, parseContentBlockConfigs } from '../helpers';

export const fetchContentBlocksByContentId = async (
	contentId: number
): Promise<Avo.ContentBlocks.ContentBlocks[] | null> => {
	try {
		const response = await dataService.query({
			query: GET_CONTENT_BLOCKS_BY_CONTENT_ID,
			variables: { contentId },
		});
		return get(response, `data.${CONTENT_BLOCKS_RESULT_PATH.GET}`, null);
	} catch (err) {
		console.error(err);
		toastService.danger(
			i18n.t(
				'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-blocks'
			),
			false
		);

		return null;
	}
};

export const insertContentBlocks = async (
	contentId: number,
	contentBlockConfigs: ContentBlockConfig[]
): Promise<Partial<Avo.ContentBlocks.ContentBlocks>[] | null> => {
	try {
		const contentBlocks = parseContentBlockConfigs(contentId, contentBlockConfigs);
		const response = await dataService.mutate({
			mutation: INSERT_CONTENT_BLOCKS,
			variables: { contentBlocks },
			update: ApolloCacheManager.clearContentBlocksCache,
		});

		return get(response, `data.${CONTENT_BLOCKS_RESULT_PATH.INSERT}.returning`, null);
	} catch (err) {
		console.error(err);
		toastService.danger(
			i18n.t(
				'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-opslaan-van-de-content-blocks'
			),
			false
		);

		return null;
	}
};

export const updateContentBlocks = async (
	contentId: number,
	initialContentBlocks: Avo.ContentBlocks.ContentBlocks[],
	contentBlockConfigs: ContentBlockConfig[]
) => {
	try {
		const initialContentBlockIds = initialContentBlocks.map(contentBlock => contentBlock.id);
		const currentContentBlockIds = contentBlockConfigs.reduce((acc: number[], curr) => {
			if (has(curr, 'id')) {
				return [...acc, curr.id as number];
			}

			return acc;
		}, []);

		// Inserted content-blocks
		const insertPromises: Promise<any>[] = [];
		const insertedConfigs = contentBlockConfigs.filter(config => !has(config, 'id'));

		insertPromises.push(insertContentBlocks(contentId, insertedConfigs));

		// Updated content-blocks
		const updatePromises: Promise<any>[] = [];
		const updatedConfigs = contentBlockConfigs.filter(
			config => has(config, 'id') && initialContentBlockIds.includes(config.id as number)
		);

		updatedConfigs.forEach(config => updatePromises.push(updateContentBlock(config)));

		// Deleted content-blocks
		const deletePromises: Promise<any>[] = [];
		const deletedIds = without(initialContentBlockIds, ...currentContentBlockIds);

		deletedIds.forEach(id => deletePromises.push(deleteContentBlock(id)));

		// Run requests in parallel
		await Promise.all([
			Promise.all(insertPromises),
			Promise.all(updatePromises),
			Promise.all(deletePromises),
		]);
	} catch (err) {
		console.error(err);
		toastService.danger(
			i18n.t(
				'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-opslaan-van-de-content-blocks'
			),
			false
		);

		return null;
	}
};

export const deleteContentBlock = async (id: number) => {
	try {
		return await dataService.mutate({
			mutation: DELETE_CONTENT_BLOCK,
			variables: { id },
			update: ApolloCacheManager.clearContentBlocksCache,
		});
	} catch (err) {
		console.error(err);
		toastService.danger(
			i18n.t(
				'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-verwijderen-van-de-content-blocks'
			),
			false
		);

		return null;
	}
};

export const updateContentBlock = async (
	contentBlockConfig: ContentBlockConfig
): Promise<FetchResult<any> | null> => {
	try {
		const contentBlock = parseContentBlockConfig(contentBlockConfig);
		return await dataService.mutate({
			mutation: UPDATE_CONTENT_BLOCK,
			variables: { contentBlock, id: contentBlockConfig.id },
			update: ApolloCacheManager.clearContentBlocksCache,
		});
	} catch (err) {
		console.error(err);
		toastService.danger(
			i18n.t(
				'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-updaten-van-de-content-blocks'
			),
			false
		);

		return null;
	}
};
