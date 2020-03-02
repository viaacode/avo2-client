import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	HeadingBlockComponentState,
} from '../../../shared/types';
import { HEADING_TYPE_OPTIONS } from '../../content-block.const';

import { ALIGN_FIELD, BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_HEADING_COMPONENTS_STATE = (): HeadingBlockComponentState => ({
	children: '',
	type: 'h2',
	align: 'center',
});

export const INITIAL_HEADING_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.Heading, position);

export const HEADING_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/heading___titel'),
	type: ContentBlockType.Heading,
	components: {
		state: INITIAL_HEADING_COMPONENTS_STATE(),
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
					options: HEADING_TYPE_OPTIONS,
				},
			},
			align: ALIGN_FIELD(),
		},
	},
	block: {
		state: INITIAL_HEADING_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
