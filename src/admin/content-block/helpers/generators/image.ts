import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import { WIDTH_OPTIONS } from '../../content-block.const';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	ImageBlockComponentState,
} from '../../content-block.types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, FILE_FIELD } from './defaults';

export const INITIAL_IMAGE_COMPONENTS_STATE = (): ImageBlockComponentState => ({
	title: '',
	text: '',
	source: '',
	width: 'full-width',
});

export const INITIAL_IMAGE_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.Image, position);

export const IMAGE_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Afbeelding'),
	components: {
		state: INITIAL_IMAGE_COMPONENTS_STATE(),
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
					options: WIDTH_OPTIONS,
				},
			},
		},
	},
	block: {
		state: INITIAL_IMAGE_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
