import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS } from './defaults';

export const INITIAL_CONTENT_PAGE_META_COMPONENTS_STATE = () => ({});

export const INITIAL_CONTENT_PAGE_META_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'top',
			bottom: 'bottom',
		},
	});

export const CONTENT_PAGE_META_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	position,
	name: i18n.t('admin/content-block/helpers/generators/content-page-meta___pagina-meta-data'),
	type: ContentBlockType.ContentPageMeta,
	components: {
		state: INITIAL_CONTENT_PAGE_META_COMPONENTS_STATE(),
		fields: {},
	},
	block: {
		state: INITIAL_CONTENT_PAGE_META_BLOCK_STATE(),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
