import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	IFrameBlockComponentState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_IFRAME_COMPONENTS_STATE = (): IFrameBlockComponentState => ({
	title: '',
	src: '',
});

export const INITIAL_IFRAME_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'top-extra-large',
			bottom: 'bottom-extra-large',
		},
	});

export const IFRAME_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	position,
	name: i18n.t('admin/content-block/helpers/generators/iframe___i-frame'),
	type: ContentBlockType.IFrame,
	components: {
		state: INITIAL_IFRAME_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/iframe___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/iframe___titel'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			src: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/iframe___url-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/iframe___url'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
		},
	},
	block: {
		state: INITIAL_IFRAME_BLOCK_STATE(),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
