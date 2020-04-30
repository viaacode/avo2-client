import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockType,
	DefaultContentBlockState,
	RichTextBlockComponentState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_RICH_TEXT_TWO_COLUMNS_COMPONENTS_STATE = (): RichTextBlockComponentState[] => [
	{
		content: '',
	},
	{
		content: '',
	},
];

export const INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE = (
	position: number
): DefaultContentBlockState => BLOCK_STATE_DEFAULTS(ContentBlockType.RichTextTwoColumns, position);

export const RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/rich-text-two-columns___tekst-2-kolommen'),
	type: ContentBlockType.RichTextTwoColumns,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/rich-text-two-columns___kolom'),
		limits: {
			min: 2,
			max: 2,
		},
		state: INITIAL_RICH_TEXT_TWO_COLUMNS_COMPONENTS_STATE(),
		fields: {
			content: TEXT_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/rich-text-two-columns___tekst-is-verplicht'
				)
			),
		},
	},
	block: {
		state: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
