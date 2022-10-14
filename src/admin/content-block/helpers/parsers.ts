import { Avo } from '@viaa/avo2-types';
import { compact, get, sortBy } from 'lodash-es';

import { CustomError } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ContentPageWithBlocksDb } from '../../content/content.types';
import { ContentBlockConfig } from '../../shared/types';
import { CONTENT_BLOCK_CONFIG_MAP } from '../content-block.const';

// Parse content-block config to valid request body
export const convertBlockToDatabaseFormat = (
	contentBlockConfig: ContentBlockConfig,
	contentId?: number
): Omit<
	ContentPageWithBlocksDb['contentBlockssBycontentId'][0],
	'id' | 'created_at' | 'updated_at' | 'enum_content_block_type' | 'content_id'
> => {
	const componentState = get(contentBlockConfig, 'components.state');
	const { ...blockState } = get(contentBlockConfig, 'block.state');

	return {
		position: contentBlockConfig.position || 0,
		variables: { componentState, blockState },
		...(contentId ? { content_id: contentId } : null),
		content_block_type: contentBlockConfig.type,
	};
};

export const convertBlocksToDatabaseFormat = (
	contentBlockConfigs: ContentBlockConfig[],
	contentId?: number
): Partial<Avo.ContentPage.Block>[] =>
	contentBlockConfigs.map((contentBlockConfig) =>
		convertBlockToDatabaseFormat(contentBlockConfig, contentId)
	);

// Parse content-blocks to configs
export const parseContentBlocks = (
	contentBlocks: ContentPageWithBlocksDb['contentBlockssBycontentId']
): ContentBlockConfig[] => {
	const sortedContentBlocks = sortBy(contentBlocks, (block) => block.position);

	return compact(
		(sortedContentBlocks || []).map((contentBlock) => {
			const { content_block_type, id, variables } = contentBlock;
			const configForType = CONTENT_BLOCK_CONFIG_MAP[content_block_type];
			if (!configForType) {
				console.error(
					new CustomError('Failed to find content block config for type', null, {
						content_block_type,
						contentBlock,
						CONTENT_BLOCK_CONFIG_MAP,
					})
				);
				ToastService.danger('Er ging iets mis bij het laden van de pagina');
				return null;
			}
			const cleanConfig = configForType(contentBlock.position);

			const rawComponentState = get(variables, 'componentState', null);
			const componentState = Array.isArray(rawComponentState)
				? rawComponentState
				: { ...cleanConfig.components.state, ...rawComponentState };

			return {
				...cleanConfig,
				id,
				components: {
					...cleanConfig.components,
					state: componentState,
				},
				block: {
					...cleanConfig.block,
					state: {
						...cleanConfig.block.state,
						...get(variables, 'blockState', {}),
					},
				},
			} as ContentBlockConfig;
		})
	);
};
