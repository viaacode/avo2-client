import i18n from '../../../../shared/translations/i18n';
import { WIDTH_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	MediaPlayerTitleTextButtonBlockComponentState,
} from '../../content-block.types';

import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_COMPONENT_STATE = (): MediaPlayerTitleTextButtonBlockComponentState => ({
	title: '',
});

export const INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_STATE = (
	position: number
): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(
		ContentBlockBackgroundColor.White,
		ContentBlockType.MediaPlayerTitleTextButton,
		position
	);

export const MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_CONFIG = (
	position: number = 0
): ContentBlockConfig => ({
	name: i18n.t('Media-speler met titel, tekst en knop'),
	components: {
		state: INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_COMPONENT_STATE(),
		fields: {
			title: TEXT_FIELD(i18n.t('Titel is verplicht'), {
				label: i18n.t('Titel'),
				editorType: ContentBlockEditor.TextInput,
			}),
			item: {
				label: i18n.t('Actie'),
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
		state: INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
