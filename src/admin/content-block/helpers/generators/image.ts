import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import { IMAGE_WIDTH_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	ImageBlockComponentState,
} from '../../content-block.types';

import { CONTENT_BLOCK_FIELD_DEFAULTS, FILE_FIELD, FORM_STATE_DEFAULTS } from './defaults';

export const INITIAL_IMAGE_BLOCK_COMPONENT_STATE = (): ImageBlockComponentState => ({
	title: '',
	text: '',
	source: '',
	width: 'full-width',
});

export const INITIAL_IMAGE_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Image, position);

export const IMAGE_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Afbeelding'),
	type: ContentBlockType.Image,
	components: {
		state: INITIAL_IMAGE_BLOCK_COMPONENT_STATE(),
		fields: {
			title: {
				label: i18n.t('Bijschift titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			},
			text: {
				label: i18n.t('Bijschrift beschrijving'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			},
			imageSource: FILE_FIELD(i18n.t('Een afbeelding is verplicht'), {
				label: i18n.t('Afbeelding'),
				editorProps: { assetType: 'CONTENT_PAGE_IMAGE' } as FileUploadProps,
			}),
			width: {
				label: i18n.t('Breedte'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: IMAGE_WIDTH_OPTIONS,
				},
			},
		},
	},
	block: {
		state: INITIAL_IMAGE_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
