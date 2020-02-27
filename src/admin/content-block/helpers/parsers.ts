import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { ContentBlockConfig, ContentBlockType } from '../../shared/types';
import { CONTENT_BLOCK_CONFIG_MAP } from '../content-block.const';

// Parse content-block config to valid request body
export const parseContentBlockConfig = (
	contentBlockConfig: ContentBlockConfig,
	contentId?: number
) => {
	const componentState = contentBlockConfig.components.state;
	const { blockType, position, ...blockState } = contentBlockConfig.block.state;

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
): Partial<Avo.ContentBlocks.ContentBlocks>[] =>
	contentBlockConfigs.map(contentBlockConfig =>
		parseContentBlockConfig(contentBlockConfig, contentId)
	);

// Parse content-blocks to configs
export const parseContentBlocks = (
	contentBlocks: Avo.ContentBlocks.ContentBlocks[]
): ContentBlockConfig[] => {
	const sortedContentBlocks = contentBlocks.sort((a, b) => a.position - b.position);

	return sortedContentBlocks.map(contentBlock => {
		const { content_block_type, id, variables } = contentBlock;
		const cleanConfig = CONTENT_BLOCK_CONFIG_MAP[content_block_type as ContentBlockType](
			contentBlock.position
		);

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
	});
};
