import { CheckboxProps, TextInputProps } from '@viaa/avo2-components';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import { PHOTO_TYPES } from '../../../../shared/helpers/files';
import { tText } from '../../../../shared/helpers/translate';
import { validateFlowplayerVideoUrl } from '../../../shared/helpers';
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
	ITEM_PICKER_FIELD,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_MEDIA_PLAYER_COMPONENTS_STATE = (): MediaPlayerBlockComponentState => ({
	title: '',
	autoplay: false,
});

export const INITIAL_MEDIA_PLAYER_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'top-extra-large',
			bottom: 'bottom-extra-large',
		},
	});

export const MEDIA_PLAYER_BLOCK_CONFIG = (position = 0): ContentBlockConfig => ({
	position,
	name: tText('admin/content-block/helpers/generators/media-player___media-speler'),
	type: ContentBlockType.MediaPlayer,
	components: {
		state: INITIAL_MEDIA_PLAYER_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(undefined, {
				label: tText(
					'admin/content-block/helpers/generators/media-player___toegankelijkheidstitel'
				),
				validator: undefined,
				editorType: ContentBlockEditor.TextInput,
			}),
			item: ITEM_PICKER_FIELD(undefined, {
				validator: undefined,
			}),
			src: TEXT_FIELD(undefined, {
				label: tText(
					'admin/content-block/helpers/generators/media-player___eigen-video-url-van-flowplayer-com-optioneel'
				),
				editorType: ContentBlockEditor.TextInput,
				validator: validateFlowplayerVideoUrl,
				editorProps: {
					placeholder: tText(
						'admin/content-block/helpers/generators/media-player___bv-https-cdn-flowplayer-com-hls-playlist-m-3-u-8'
					),
				} as TextInputProps,
			}),
			poster: FILE_FIELD(undefined, {
				label: tText(
					'admin/content-block/helpers/generators/media-player___eigen-poster-uploaden-optioneel'
				),
				validator: undefined,
				editorProps: {
					allowMulti: false,
					allowedTypes: PHOTO_TYPES,
					assetType: 'CONTENT_BLOCK_IMAGE',
					ownerId: '',
				} as FileUploadProps,
			}),
			annotationTitle: {
				label: tText('admin/content-block/helpers/generators/image___bijschift-titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			},
			annotationText: {
				label: tText(
					'admin/content-block/helpers/generators/image___bijschrift-beschrijving'
				),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			},
			width: {
				label: tText('admin/content-block/helpers/generators/media-player___breedte'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_MEDIA_PLAYER_WIDTH_OPTIONS(),
				},
			},
			autoplay: {
				editorType: ContentBlockEditor.Checkbox,
				editorProps: {
					label: tText(
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
