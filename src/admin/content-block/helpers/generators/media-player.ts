import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	MediaPlayerBlockComponentState,
} from '../../../shared/types';
import { GET_WIDTH_OPTIONS } from '../../content-block.const';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_MEDIA_PLAYER_COMPONENTS_STATE = (): MediaPlayerBlockComponentState => ({
	title: '',
});

export const INITIAL_MEDIA_PLAYER_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.MediaPlayer, position);

export const MEDIA_PLAYER_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/media-player___media-speler'),
	type: ContentBlockType.MediaPlayer,
	components: {
		state: INITIAL_MEDIA_PLAYER_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/media-player___titel-is-verplicht'),
				{
					label: i18n.t(
						'admin/content-block/helpers/generators/media-player___toegankelijkheidstitel'
					),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			item: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player___video-of-audio-item'
				),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: ['ITEM'],
					hideTargetSwitch: true,
				},
			},
			width: {
				label: i18n.t('admin/content-block/helpers/generators/media-player___breedte'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_WIDTH_OPTIONS(),
				},
			},
		},
	},
	block: {
		state: INITIAL_MEDIA_PLAYER_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
