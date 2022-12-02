import { tText } from '../../../../shared/helpers/translate';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	IframeBlockComponentState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_IFRAME_COMPONENTS_STATE = (): IframeBlockComponentState => ({
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

export const IFRAME_BLOCK_CONFIG = (position = 0): ContentBlockConfig => ({
	position,
	name: tText('admin/content-block/helpers/generators/iframe___i-frame'),
	type: ContentBlockType.Iframe,
	components: {
		state: INITIAL_IFRAME_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(
				tText('admin/content-block/helpers/generators/iframe___titel-is-verplicht'),
				{
					label: tText('admin/content-block/helpers/generators/iframe___titel'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			src: TEXT_FIELD(
				tText('admin/content-block/helpers/generators/iframe___url-is-verplicht'),
				{
					label: tText('admin/content-block/helpers/generators/iframe___url'),
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
