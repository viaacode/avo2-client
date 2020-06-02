import i18n from '../../../../shared/translations/i18n';
import {
	Color,
	ContentBlockConfig,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS } from './defaults';

export const INITIAL_SEARCH_COMPONENTS_STATE = () => ({});

export const INITIAL_SEARCH_BLOCK_STATE = (position: number): DefaultContentBlockState => ({
	...BLOCK_STATE_DEFAULTS(ContentBlockType.Search, position),
	backgroundColor: Color.Gray50,
});

export const SEARCH_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Search'),
	type: ContentBlockType.Search,
	components: {
		state: INITIAL_SEARCH_COMPONENTS_STATE(),
		fields: {},
	},
	block: {
		state: INITIAL_SEARCH_BLOCK_STATE(position),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
