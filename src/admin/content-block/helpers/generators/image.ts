import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import {
	BackgroundColorOption,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	ImageBlockComponentState,
} from '../../../shared/types';
import { WIDTH_OPTIONS } from '../../content-block.const';

import { CONTENT_BLOCK_FIELD_DEFAULTS, FILE_FIELD, FORM_STATE_DEFAULTS } from './defaults';

export const INITIAL_IMAGE_BLOCK_COMPONENT_STATE = (): ImageBlockComponentState => ({
	title: '',
	text: '',
	source: '',
	width: 'full-width',
});

export const INITIAL_IMAGE_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(BackgroundColorOption.White, ContentBlockType.Image, position);

export const IMAGE_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/image___afbeelding'),
	type: ContentBlockType.Image,
	components: {
		state: INITIAL_IMAGE_BLOCK_COMPONENT_STATE(),
		fields: {
			title: {
				label: i18n.t('admin/content-block/helpers/generators/image___bijschift-titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			},
			text: {
				label: i18n.t('admin/content-block/helpers/generators/image___bijschrift-beschrijving'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			},
			imageSource: FILE_FIELD(
				i18n.t('admin/content-block/helpers/generators/image___een-afbeelding-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/image___afbeelding'),
					editorProps: { assetType: 'CONTENT_PAGE_IMAGE' } as FileUploadProps,
				}
			),
			width: {
				label: i18n.t('admin/content-block/helpers/generators/image___breedte'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: WIDTH_OPTIONS,
				},
			},
		},
	},
	block: {
		state: INITIAL_IMAGE_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
