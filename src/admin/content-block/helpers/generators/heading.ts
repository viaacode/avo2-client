import i18n from '../../../../shared/translations/i18n';
import { HEADING_LEVEL_OPTIONS } from '../../content-block.const';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	HeadingBlockComponentState,
} from '../../content-block.types';

import {
	ALIGN_FIELD,
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_HEADING_BLOCK_COMPONENT_STATE = (): HeadingBlockComponentState => ({
	children: '',
	type: 'h2',
	align: 'left',
});

export const INITIAL_HEADING_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockType.Heading, position);

export const HEADING_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/heading___titel'),
	components: {
		state: INITIAL_HEADING_BLOCK_COMPONENT_STATE(),
		fields: {
			children: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/heading___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/heading___titel'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			type: {
				label: i18n.t('admin/content-block/helpers/generators/heading___stijl'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: HEADING_LEVEL_OPTIONS,
				},
			},
			align: ALIGN_FIELD(),
		},
	},
	block: {
		state: INITIAL_HEADING_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
