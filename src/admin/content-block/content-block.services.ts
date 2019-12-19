import { get } from 'lodash-es';

import { dataService } from '../../shared/services/data-service';

import { CONTENT_BLOCKS_RESULT_PATH } from './content-block.const';
import { INSERT_CONTENT_BLOCKS } from './content-block.gql';
import { ContentBlockConfig, ContentBlockSchema } from './content-block.types';

// Parse content-block config to valid request body
const parseCbConfigs = (
	contentId: number,
	cbConfigs: ContentBlockConfig[]
): Partial<ContentBlockSchema>[] => {
	const contentBlocks = cbConfigs.map((cbConfig, position) => {
		const { blockType, ...variables } = cbConfig.formState;

		return {
			position,
			variables,
			content_id: contentId,
			content_block_type: blockType,
		};
	});

	return contentBlocks;
};

export const insertContentBlocks = async (
	contentId: number,
	cbConfigs: ContentBlockConfig[]
): Promise<Partial<ContentBlockSchema>[] | null> => {
	try {
		const contentBlocks = parseCbConfigs(contentId, cbConfigs);
		const response = await dataService.mutate({
			mutation: INSERT_CONTENT_BLOCKS,
			variables: { contentBlocks },
		});

		return get(response, `data.${CONTENT_BLOCKS_RESULT_PATH.INSERT}.returning`, null);
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const updateContentBlocks = async () => {};
