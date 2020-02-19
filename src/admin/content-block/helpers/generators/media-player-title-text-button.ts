import i18n from '../../../../shared/translations/i18n';
import { ADMIN_ICON_OPTIONS } from '../../../shared/constants';

import {
	BUTTON_TYPE_OPTIONS,
	HEADING_LEVEL_OPTIONS,
	WIDTH_OPTIONS,
} from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	MediaPlayerTitleTextButtonBlockComponentState,
} from '../../content-block.types';

import {
	ALIGN_FIELD,
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_COMPONENT_STATE = (): MediaPlayerTitleTextButtonBlockComponentState => ({
	mediaTitle: '',
	headingTitle: '',
	headingType: 'h2',
	align: 'left',
	content: '',
	buttonType: 'secondary',
	buttonLabel: '',
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
	name: i18n.t(
		'admin/content-block/helpers/generators/media-player-title-text-button___media-speler-met-titel-tekst-en-knop'
	),
	type: ContentBlockType.MediaPlayerTitleTextButton,
	components: {
		state: INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_COMPONENT_STATE(),
		fields: {
			mediaTitle: TEXT_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/media-player-title-text-button___titel-is-verplicht'
				),
				{
					label: i18n.t(
						'admin/content-block/helpers/generators/media-player-title-text-button___video-of-audio-item-toegankelijkheidstitel'
					),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			mediaItem: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player-title-text-button___video-of-audio-item'
				),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					selectableTypes: ['ITEM'],
				},
			},
			mediaWidth: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player-title-text-button___breedte'
				),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: WIDTH_OPTIONS,
				},
			},
			headingTitle: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/heading___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/heading___titel'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			headingType: {
				label: i18n.t('admin/content-block/helpers/generators/heading___stijl'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: HEADING_LEVEL_OPTIONS,
				},
			},
			content: TEXT_FIELD(),
			buttonType: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___knop-type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: BUTTON_TYPE_OPTIONS,
				},
			},
			buttonLabel: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/ctas___knoptekst-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/ctas___knop-tekst'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			buttonIcon: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___knop-icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: ADMIN_ICON_OPTIONS,
				},
			},
			buttonAction: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player-title-text-button___knop-actie'
				),
				editorType: ContentBlockEditor.ContentPicker,
			},
			align: ALIGN_FIELD(),
		},
	},
	block: {
		state: INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
