import { CheckboxProps } from '@viaa/avo2-components';

import {
	FileUploadProps,
	PHOTO_TYPES,
	VIDEO_TYPES,
} from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	MediaPlayerBlockComponentState,
} from '../../../shared/types';
import { GET_MEDIA_PLAYER_WIDTH_OPTIONS } from '../../content-block.const';

import {
	BLOCK_FIELD_DEFAULTS,
	BLOCK_STATE_DEFAULTS,
	FILE_FIELD,
	TEXT_FIELD,
	VIDEO_FIELD,
} from './defaults';

export const INITIAL_MEDIA_PLAYER_COMPONENTS_STATE = (): MediaPlayerBlockComponentState => ({
	title: '',
	autoplay: false,
});

export const INITIAL_MEDIA_PLAYER_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		position,
		blockType: ContentBlockType.MediaPlayer,
		padding: {
			top: 'top-extra-large',
			bottom: 'bottom-extra-large',
		},
	});

export const MEDIA_PLAYER_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	position,
	name: i18n.t('admin/content-block/helpers/generators/media-player___media-speler'),
	type: ContentBlockType.MediaPlayer,
	components: {
		state: INITIAL_MEDIA_PLAYER_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(undefined, {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player___toegankelijkheidstitel'
				),
				validator: undefined,
				editorType: ContentBlockEditor.TextInput,
			}),
			item: VIDEO_FIELD(undefined, {
				validator: undefined,
			}),
			src: FILE_FIELD(undefined, {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player___eigen-video-uploaden-optioneel'
				),
				validator: undefined,
				editorProps: {
					allowMulti: false,
					allowedTypes: VIDEO_TYPES,
					assetType: 'CONTENT_PAGE_IMAGE',
					ownerId: '',
				} as FileUploadProps,
			}),
			poster: FILE_FIELD(undefined, {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-player___eigen-poster-uploaden-optioneel'
				),
				validator: undefined,
				editorProps: {
					allowMulti: false,
					allowedTypes: PHOTO_TYPES,
					assetType: 'CONTENT_PAGE_IMAGE',
					ownerId: '',
				} as FileUploadProps,
			}),
			width: {
				label: i18n.t('admin/content-block/helpers/generators/media-player___breedte'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_MEDIA_PLAYER_WIDTH_OPTIONS(),
				},
			},
			autoplay: {
				editorType: ContentBlockEditor.Checkbox,
				editorProps: {
					label: i18n.t(
						'admin/content-block/helpers/generators/media-player___automatisch-afspelen'
					),
				} as CheckboxProps,
			},
		},
	},
	block: {
		state: INITIAL_MEDIA_PLAYER_BLOCK_STATE(),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
