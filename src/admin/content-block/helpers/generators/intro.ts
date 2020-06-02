import { WYSIWYG2_OPTIONS_FULL_WITHOUT_ALIGN } from '../../../../shared/constants';
import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	IntroBlockComponentState,
} from '../../../shared/types';

import { ALIGN_FIELD, BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_INTRO_COMPONENTS_STATE = (): IntroBlockComponentState => ({
	title: '',
	content: '',
	align: 'center',
});

export const INITIAL_INTRO_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		position,
		blockType: ContentBlockType.Intro,
		padding: { top: 'top-extra-large', bottom: 'bottom-small' },
	});

export const INTRO_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/intro___intro'),
	type: ContentBlockType.Intro,
	components: {
		state: INITIAL_INTRO_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/intro___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/intro___titel'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			content: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/intro___tekst-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/defaults___tekst'),
					editorType: ContentBlockEditor.WYSIWYG,
					editorProps: {
						controls: WYSIWYG2_OPTIONS_FULL_WITHOUT_ALIGN,
					},
				}
			),
			align: ALIGN_FIELD(i18n.t('admin/content-block/helpers/generators/intro___uitlijning')),
		},
	},
	block: {
		state: INITIAL_INTRO_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
