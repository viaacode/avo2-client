import { Avo } from '@viaa/avo2-types';
import { compact, get, has, omit, without } from 'lodash-es';

import {
	DeleteContentBlockDocument,
	DeleteContentBlockMutation,
	InsertContentBlocksDocument,
	InsertContentBlocksMutation,
	UpdateContentBlockDocument,
	UpdateContentBlockMutation,
} from '../../../shared/generated/graphql-db-types';
import { CustomError } from '../../../shared/helpers';
import { dataService } from '../../../shared/services/data-service';
import { ToastService } from '../../../shared/services/toast-service';
import i18n from '../../../shared/translations/i18n';
import { ContentBlockConfig } from '../../shared/types';
import { CONTENT_BLOCKS_RESULT_PATH } from '../content-block.const';
import { convertBlocksToDatabaseFormat, convertBlockToDatabaseFormat } from '../helpers';

export class ContentBlockService {
	public static async updateContentBlocks(
		contentBlockConfigs: ContentBlockConfig[]
	): Promise<void> {
		try {
			await Promise.all(contentBlockConfigs.map(this.updateContentBlock));
		} catch (err) {
			console.error(
				new CustomError('Failed to update some content blocks', err, {
					contentBlockConfigs,
				})
			);

			// TODO move toast outside of service, service should throw error, consumer should show toast to user
			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-updaten-van-de-content-blocks'
				)
			);
		}
	}

	/**
	 * Update content block.
	 *
	 * @param contentBlockConfig updated state of content block
	 */
	public static async updateContentBlock(
		contentBlockConfig: ContentBlockConfig
	): Promise<UpdateContentBlockMutation> {
		const contentBlock = convertBlockToDatabaseFormat(contentBlockConfig);

		return await dataService.query<UpdateContentBlockMutation>({
			query: UpdateContentBlockDocument,
			variables: { contentBlock, id: contentBlockConfig.id },
		});
	}

	/**
	 * Delete content block.
	 *
	 * @param id content block identifier
	 */
	public static async deleteContentBlock(id: number): Promise<void> {
		try {
			await dataService.query<DeleteContentBlockMutation>({
				query: DeleteContentBlockDocument,
				variables: { id },
			});
		} catch (err) {
			console.error(new CustomError('Failed to delete content block', err, { id }));

			// TODO move toast outside of service, service should throw error, consumer should show toast to user
			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-verwijderen-van-de-content-blocks'
				)
			);
		}
	}

	private static cleanContentBlocksBeforeDatabaseInsert(
		dbContentBlocks: Partial<Avo.ContentPage.Block>[]
	) {
		return (dbContentBlocks || []).map((block) =>
			omit(block, 'enum_content_block_type', '__typename', 'id')
		);
	}

	/**
	 * Insert content blocks.
	 *
	 * @param contentId content page identifier
	 * @param contentBlockConfigs
	 *
	 * @return content blocks
	 */
	public static async insertContentBlocks(
		contentId: number,
		contentBlockConfigs: ContentBlockConfig[]
	): Promise<Partial<ContentBlockConfig>[] | null> {
		try {
			const dbBlocks: Partial<Avo.ContentPage.Block>[] =
				convertBlocksToDatabaseFormat(contentBlockConfigs);
			(dbBlocks || []).forEach((block) => (block.content_id = contentId));
			const response = await dataService.query<InsertContentBlocksMutation>({
				query: InsertContentBlocksDocument,
				variables: {
					contentBlocks: this.cleanContentBlocksBeforeDatabaseInsert(dbBlocks),
				},
			});

			const ids: number[] =
				get(response, `data.${CONTENT_BLOCKS_RESULT_PATH.INSERT}.returning`) || [];
			return contentBlockConfigs.map((block, index) => ({
				...block,
				id: ids[index],
			}));
		} catch (err) {
			console.error(
				new CustomError('Failed to insert content blocks', err, {
					contentId,
					contentBlockConfigs,
				})
			);

			// TODO move toast outside of service, service should throw error, consumer should show toast to user
			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-opslaan-van-de-content-blocks'
				)
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
	public static async updateChangedContentBlocks(
		contentId: number,
		initialContentBlocks: ContentBlockConfig[],
		contentBlockConfigs: ContentBlockConfig[]
	): Promise<void> {
		try {
			const initialContentBlockIds: number[] = compact(
				initialContentBlocks.map((contentBlock) => contentBlock.id)
			);
			const currentContentBlockIds = contentBlockConfigs.reduce((acc: number[], curr) => {
				if (has(curr, 'id')) {
					return [...acc, curr.id as number];
				}

				return acc;
			}, []);

			// Inserted content-blocks
			const insertPromises: Promise<any>[] = [];
			const insertedConfigs: ContentBlockConfig[] = contentBlockConfigs.filter(
				(config) => !has(config, 'id')
			);

			if (insertedConfigs.length) {
				insertPromises.push(
					ContentBlockService.insertContentBlocks(contentId, insertedConfigs)
				);
			}

			// Updated content-blocks
			const updatePromises: Promise<any>[] = [];
			const updatedConfigs = contentBlockConfigs.filter(
				(config) =>
					has(config, 'id') && initialContentBlockIds.includes(config.id as number)
			);

			if (updatedConfigs.length) {
				updatePromises.push(ContentBlockService.updateContentBlocks(updatedConfigs));
			}

			// Deleted content-blocks
			const deletePromises: Promise<any>[] = [];
			const deletedIds = without(initialContentBlockIds, ...currentContentBlockIds);

			deletedIds.forEach((id) =>
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

			// TODO move toast outside of service, service should throw error, consumer should show toast to user
			ToastService.danger(
				i18n.t(
					'admin/content-block/content-block___er-ging-iets-mis-tijdens-het-opslaan-van-de-content-blocks'
				)
			);
		}
	}
}
