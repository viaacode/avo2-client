import { get } from 'lodash-es';

import { CONTENT_BLOCK_CONFIG_MAP } from '../content-block.const';
import { ContentBlockConfig, ContentBlockSchema, ContentBlockType } from '../content-block.types';

// Parse content-block config to valid request body
export const parseContentBlockConfig = (
	contentBlockConfig: ContentBlockConfig,
	position: number,
	contentId?: number
) => {
	const componentState = contentBlockConfig.components.state;
	const { blockType, ...blockState } = contentBlockConfig.block.state;

	return {
		position,
		variables: { componentState, blockState },
		...(contentId ? { content_id: contentId } : null),
		content_block_type: blockType,
	};
};

export const parseContentBlockConfigs = (
	contentId: number,
	contentBlockConfigs: ContentBlockConfig[]
): Partial<ContentBlockSchema>[] => {
	const contentBlocks = contentBlockConfigs.map((contentBlockConfig, position) =>
		parseContentBlockConfig(contentBlockConfig, position, contentId)
	);

	return contentBlocks;
};

// Parse content-blocks to configs
export const parseContentBlocks = (contentBlocks: ContentBlockSchema[]): ContentBlockConfig[] => {
	const contentBlockConfigs = contentBlocks.map(contentBlock => {
		const { content_block_type, id, variables } = contentBlock;
		const cleanConfig = CONTENT_BLOCK_CONFIG_MAP[content_block_type as ContentBlockType]();

		return {
			...cleanConfig,
			id,
			components: {
				...cleanConfig.components,
				state: get(variables, 'componentState', cleanConfig.components.state),
			},
			block: {
				...cleanConfig.block,
				state: {
					...cleanConfig.block.state,
					...get(variables, 'blockState', {}),
				},
			},
		} as ContentBlockConfig;
	});

	return contentBlockConfigs;
};
