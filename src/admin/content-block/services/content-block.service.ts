import { FetchResult } from 'apollo-link';
import { get, has, omit, without } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../../shared/helpers';
import { ApolloCacheManager, dataService, ToastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';
import { ContentBlockConfig } from '../../shared/types';
import { CONTENT_BLOCKS_RESULT_PATH } from '../content-block.const';
import {
	DELETE_CONTENT_BLOCK,
	GET_CONTENT_BLOCKS_BY_CONTENT_ID,
	INSERT_CONTENT_BLOCKS,
	UPDATE_CONTENT_BLOCK,
} from '../content-block.gql';
import { convertBlockToDatabaseFormat } from '../helpers';

export class ContentBlockService {
	/**
	 * Update content block.
	 *
	 * @param contentBlockConfig updated state of content block
	 */
	public static async updateContentBlock(
		contentBlockConfig: ContentBlockConfig
	): Promise<FetchResult<any> | null> {
		try {
			const contentBlock = convertBlockToDatabaseFormat(contentBlockConfig);

			return await dataService.mutate({
				mutation: UPDATE_CONTENT_BLOCK,
				variables: { contentBlock, id: contentBlockConfig.id },
				update: ApolloCacheManager.clearContentBlocksCache,
			});
		} catch (err) {
			console.error(
				new CustomError('Failed to update content block', err, {
					contentBlockConfig,
				})
			);

			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-updaten-van-de-content-blocks'
				),
				false
			);

			return null;
		}
	}

	/**
	 * Delete content block.
	 *
	 * @param id content block identifier
	 */
	public static async deleteContentBlock(id: number) {
		try {
			return await dataService.mutate({
				mutation: DELETE_CONTENT_BLOCK,
				variables: { id },
				update: ApolloCacheManager.clearContentBlocksCache,
			});
		} catch (err) {
			console.error(new CustomError('Failed to delete content block', err, { id }));

			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-verwijderen-van-de-content-blocks'
				),
				false
			);

			return null;
		}
	}

	private static cleanContentBlocksBeforeDatabaseInsert(
		dbContentBlocks: Partial<Avo.ContentBlocks.ContentBlocks>[]
	) {
		return (dbContentBlocks || []).map(block =>
			omit(block, 'enum_content_block_type', '__typename', 'id')
		);
	}

	/**
	 * Insert content blocks.
	 *
	 * @param contentId content page identifier
	 * @param dbContentBlocks
	 *
	 * @return content blocks
	 */
	public static async insertContentBlocks(
		contentId: number,
		dbContentBlocks: Partial<Avo.ContentBlocks.ContentBlocks>[]
	): Promise<Partial<Avo.ContentBlocks.ContentBlocks>[] | null> {
		try {
			(dbContentBlocks || []).forEach(block => (block.content_id = contentId));
			const response = await dataService.mutate({
				mutation: INSERT_CONTENT_BLOCKS,
				variables: {
					contentBlocks: this.cleanContentBlocksBeforeDatabaseInsert(dbContentBlocks),
				},
				update: ApolloCacheManager.clearContentBlocksCache,
			});

			return get(response, `data.${CONTENT_BLOCKS_RESULT_PATH.INSERT}.returning`, null);
		} catch (err) {
			console.error(
				new CustomError('Failed to insert content blocks', err, {
					contentId,
					dbContentBlocks,
				})
			);

			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-opslaan-van-de-content-blocks'
				),
				false
			);

			return null;
		}
	}
	/**
	 * Retrieve content blocks by content id.
	 *
	 * @param contentId content page identifier
	 *
	 * @return content blocks
	 */
	public static async fetchContentBlocksByContentId(
		contentId: number
	): Promise<Avo.ContentBlocks.ContentBlocks[] | null> {
		try {
			const response = await dataService.query({
				query: GET_CONTENT_BLOCKS_BY_CONTENT_ID,
				variables: { contentId },
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}

			return get(response, `data.${CONTENT_BLOCKS_RESULT_PATH.GET}`, null);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch content blocks by content page id', err, {
					contentId,
				})
			);

			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-blocks'
				),
				false
			);

			return null;
		}
	}

	/**
	 * Update content blocks.
	 *
	 * @param contentId content page identifier
	 * @param initialContentBlocks initial state of content blocks
	 * @param contentBlockConfigs configs of content blocks to update
	 */
	public static async updateContentBlocks(
		contentId: number,
		initialContentBlocks: Avo.ContentBlocks.ContentBlocks[],
		contentBlockConfigs: ContentBlockConfig[]
	) {
		try {
			const initialContentBlockIds = initialContentBlocks.map(
				contentBlock => contentBlock.id
			);
			const currentContentBlockIds = contentBlockConfigs.reduce((acc: number[], curr) => {
				if (has(curr, 'id')) {
					return [...acc, curr.id as number];
				}

				return acc;
			}, []);

			// Inserted content-blocks
			const insertPromises: Promise<any>[] = [];
			const insertedConfigs = contentBlockConfigs.filter(config => !has(config, 'id'));

			if (insertedConfigs.length) {
				insertPromises.push(
					ContentBlockService.insertContentBlocks(contentId, insertedConfigs)
				);
			}

			// Updated content-blocks
			const updatePromises: Promise<any>[] = [];
			const updatedConfigs = contentBlockConfigs.filter(
				config => has(config, 'id') && initialContentBlockIds.includes(config.id as number)
			);

			updatedConfigs.forEach(config =>
				updatePromises.push(ContentBlockService.updateContentBlock(config))
			);

			// Deleted content-blocks
			const deletePromises: Promise<any>[] = [];
			const deletedIds = without(initialContentBlockIds, ...currentContentBlockIds);

			deletedIds.forEach(id =>
				deletePromises.push(ContentBlockService.deleteContentBlock(id))
			);

			// Run requests in parallel
			await Promise.all([
				Promise.all(insertPromises),
				Promise.all(updatePromises),
				Promise.all(deletePromises),
			]);
		} catch (err) {
			console.error(
				new CustomError('Failed to update content blocks', err, {
					contentId,
					initialContentBlocks,
					contentBlockConfigs,
				})
			);

			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-opslaan-van-de-content-blocks'
				),
				false
			);

			return null;
		}
	}
}
