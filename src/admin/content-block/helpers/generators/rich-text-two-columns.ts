import i18n from '../../../../shared/translations/i18n';

import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockType,
	DefaultContentBlockState,
	RichTextTwoColumnsBlockComponentState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE = (): RichTextTwoColumnsBlockComponentState => ({
	firstColumnContent: '',
	secondColumnContent: '',
});

export const INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE = (
	position: number
): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(
		ContentBlockBackgroundColor.White,
		ContentBlockType.RichTextTwoColumns,
		position
	);

export const RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/rich-text-two-columns___tekst-2-kolommen'),
	components: {
		state: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE(),
		fields: {
			firstColumnContent: TEXT_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/rich-text-two-columns___kolom-1-tekstveld-moet-verplicht-ingevuld-zijn'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/rich-text-two-columns___kolom-1'),
				}
			),
			secondColumnContent: TEXT_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/rich-text-two-columns___kolom-2-tekstveld-moet-verplicht-ingevuld-zijn'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/rich-text-two-columns___kolom-2'),
				}
			),
		},
	},
	block: {
		state: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
