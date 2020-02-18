import i18n from '../../../../shared/translations/i18n';
import { WIDTH_OPTIONS } from '../../content-block.const';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	MediaPlayerBlockComponentState,
} from '../../content-block.types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_MEDIA_PLAYER_COMPONENTS_STATE = (): MediaPlayerBlockComponentState => ({
	title: '',
});

export const INITIAL_MEDIA_PLAYER_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.MediaPlayer, position);

export const MEDIA_PLAYER_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Media-speler'),
	components: {
		state: INITIAL_MEDIA_PLAYER_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(i18n.t('Titel is verplicht'), {
				label: i18n.t('Toegankelijkheidstitel'),
				editorType: ContentBlockEditor.TextInput,
			}),
			item: {
				label: i18n.t('Video- of audio-item'),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					selectableTypes: ['ITEM'],
				},
			},
			width: {
				label: i18n.t('Breedte'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: WIDTH_OPTIONS,
				},
			},
		},
	},
	block: {
		state: INITIAL_MEDIA_PLAYER_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
